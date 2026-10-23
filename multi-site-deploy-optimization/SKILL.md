---
name: multi-site-deploy-optimization
description: "Cut deploy time on a fleet of sites that share one codebase and each deploy as their own worker. Covers the deploy-ignore list, canary-only staging deploys, change detection for side workers, migrate-only-when-pending D1 checks, the build-once deploy-many design, and the failure modes of skip logic. Triggers: 'every push deploys all sites', 'deploy takes too long', 'affected sites', 'skip deploy', 'monorepo deploy', 'cloudflare workers fleet', 'build once deploy many', 'd1 migrations slow'."
---

# Multi-site deploy optimization

`pooriaarab/directory` runs 31 sites from one codebase. Each site is its own
Cloudflare Worker with its own D1 and KV. Site config, theme and brand are baked
in at build time by `site:use`.

## The problem

A change to shared code (`apps/`, `packages/`, `workers/`) deployed all 31
sites. Each site ran a full OpenNext build of identical code, then D1
migrations, then 4 worker deploys — on `main` (staging) and again on `release`
(production). One full release deploy took about 40 minutes.

## What landed, in order

Work through the fixes in this order: ignore list, canary-only staging, side
workers, migrations, then build once.

### 1. Deploy-ignore list (directory #1322, issue #1317)

`scripts/affected-sites.ts` holds a list of paths that cannot change runtime
output: docs, markdown, E2E specs, unrelated workflows. A diff that only touches
those paths deploys nothing, and those paths never widen the affected set to
all sites.

Check the build does not read a path before ignoring it. A file the bundler
inlines is not ignorable, whatever its extension.

### 2. Canary-only staging (directory #1324, issue #1318)

On a shared-code push to `main`, deploy only `CANARY_SITE` to staging. On
`release`, all affected sites deploy.

A missing or unknown canary must fail the job. It must never resolve to an
empty site list — an empty list reads as "nothing to do" and silently skips
staging.

One shared function decides whether a diff widens to the full site set. The
ignore list and the stage rule both call it. Two copies existed in review and
disagreed.

### 3. Side workers only when their inputs changed (directory #1325, issue #1319)

Deploy the cron, queue-consumer and inbound-mail workers only when one of these
changed: their own directory, a package they import, the renderer, or the site
config and brand.

The diff base is each site's last **successful deploy** — evidence that the
real deploy step ran — not the last push and not job success. A job can succeed
while skipping the deploy step when the Cloudflare config is missing. No
deploy evidence means deploy all.

A resolver failure must fail loudly:

- Set `pipefail` wherever the resolver pipes. Without it a failed producer
  still exits 0 through the last pipe stage.
- Validate the resolved value as a JSON array of known worker names. An empty
  string or `{"a":{}}` must not parse as "skip everything".

### 4. Migrate only when pending (directory #1326, issue #1320)

Run `wrangler d1 migrations apply` only when `scripts/d1-pending-check.ts`
reports pending migrations. Exit 0 means skip, exit 4 means apply, anything
else fails the job.

The check compares canonical migration filenames with the records actually in
the remote `d1_migrations` table:

```sh
wrangler d1 execute DB_NAME --remote \
  --command "SELECT name FROM d1_migrations ORDER BY id"
```

A local baseline rehearsal can report zero pending while canonical names are
missing remotely. Compare against the remote table, not local state.

### 5. Build once, deploy many (design: directory docs/ops/build-once.md, #1323, issue #1321)

Read the site from a runtime `SITE_ID` instead of build-time `site:use`. One
build job uploads a single artifact. Each per-site job only renders the
wrangler config, migrates, and deploys it. Keep per-site D1/KV/R2 bindings and
one Worker deploy per site.

This is a design doc with follow-up implementation PRs, not shipped behavior.

## Rejected: one multi-tenant Worker

A single Worker serving all 31 sites was rejected (codex-personal review,
2026-10-23). It needs:

- A Host-to-site registry.
- Per-site bindings — about 217 resource bindings for 31 sites.
- Tenant identity inside the OpenNext KV/D1 cache.
- Per-tenant secrets (Stripe, auth, Turnstile) against the 128-variable limit.
- A shared failure and rollback scope across every site.

Workers for Platforms does not remove build-time site selection. Revisit after
build-once ships and isolation tests pass.

## Decision table

| Change | Saving | Risk |
|---|---|---|
| Deploy-ignore list | Docs-only diffs deploy nothing | Ignoring a path the build reads ships stale sites |
| Canary-only staging | Shared-code push to `main` deploys 1 site, not 31 | A site-specific break escapes staging until `release` |
| Side workers on input change | Up to 3 of 4 worker deploys skipped per unchanged site | A wrong diff base skips a needed deploy and stays green |
| Migrate only when pending | `d1 migrations apply` skipped on most deploys | A wrong pending check never applies real migrations |
| Build once, deploy many | 31 OpenNext builds become 1 | Artifact and wrangler render must stay in lockstep |

## Checklist for a new skip rule

1. Write the failing case first: a change that must NOT be skipped, and show
   the rule still deploys it.
2. Reuse the one shared function that decides the affected set. Never add a
   second copy — two copies drift.
3. Fail the job on resolver errors. An empty list, empty string, or malformed
   JSON is never "nothing to do".
4. Set `pipefail` on every pipe in the resolver path.
5. Diff against the last successful deploy, not the last push, not job
   success.
6. Treat "no deploy evidence" as deploy all, never deploy none.
7. Confirm the build does not read a path before adding it to the ignore
   list.

## How to measure

Compare deploy workflow runs before and after each change:

```sh
gh run list --workflow deploy.yml --limit 50 \
  --json conclusion,createdAt,updatedAt,displayTitle
```

- Time a full release deploy end to end. The baseline was about 40 minutes.
- Count staging deploys per shared-code push to `main`. Target: 1, the canary.
- Count worker deploys per site. Target: the site worker plus only the side
  workers whose inputs changed.

## Lessons from the reviews

- Reviews of skip logic found a Major in nearly every PR: silent empty
  results, wrong diff bases, fallbacks that hide errors. The unsafe skip is
  the bug; test for it first.
- Never let a resolver return an empty list on error.
- Green CI is not evidence a deploy ran. A job can succeed while skipping the
  deploy step.
