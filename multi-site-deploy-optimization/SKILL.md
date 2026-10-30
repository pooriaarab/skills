---
name: multi-site-deploy-optimization
description: "Cut deploy time on a fleet of sites that share one codebase and each deploy as their own worker. Covers the deploy-ignore list, canary-only staging deploys, change detection for side workers, migrate-only-when-pending D1 checks, the build-once deploy-many design, and the failure modes of skip logic. Triggers: 'every push deploys all sites', 'deploy takes too long', 'affected sites', 'skip deploy', 'monorepo deploy', 'cloudflare workers fleet', 'build once deploy many', 'd1 migrations slow'."
---

# Multi-site deploy optimization

One example fleet runs 29 deployable sites from one codebase — 31 folders
under `sites/` minus the `_starter` and `_shared` dirs (`ls sites` in the repo).
Each site is its own Cloudflare Worker with its own D1 and KV. Site config,
theme and brand are baked in at build time by `site:use`.

## The problem

A change to shared code (`apps/`, `packages/`, `workers/`) deployed all 29
sites. Each site ran a full OpenNext build of identical code, then D1
migrations, then 4 worker deploys — on `main` (staging) and again on `release`
(production). One full release deploy took about 40 minutes — one measured run
(one Actions run on 2026-10-23, 15:39 to 16:19 UTC), not an average.

## What landed, in order

Work through the fixes in this order: ignore list, canary-only staging, side
workers, migrations, then build once.

Merged: the ignore list, canary-only staging, migrate-only-when-pending, the
build-once design doc, and council review on docs PRs. Pending: side workers
and their wiring PR — side workers are still in review and have not merged.

### 1. Deploy-ignore list

`scripts/affected-sites.ts` holds a list of paths that cannot change runtime
output: docs, markdown, E2E specs, unrelated workflows. A diff that only touches
those paths deploys nothing, and those paths never widen the affected set to
all sites.

Check the build does not read a path before ignoring it. A file the bundler
inlines is not ignorable, whatever its extension.

### 2. Canary-only staging

On a shared-code push to `main`, deploy only `CANARY_SITE` to staging. On
`release`, all affected sites deploy.

A missing or unknown canary must fail the job. It must never resolve to an
empty site list — an empty list reads as "nothing to do" and silently skips
staging.

One shared function decides whether a diff widens to the full site set. The
ignore list and the stage rule both call it. Two copies existed in review and
disagreed.

### 3. Side workers only when their inputs changed (in review, not merged)

Deploy the cron, queue-consumer and inbound-mail workers only when one of these
changed: their own directory, a package they import, the renderer, or the site
config and brand.

The diff base is each site's last **successful deploy** — evidence that the
real deploy step ran — not the last push and not job success. A job can succeed
while skipping the deploy step when the Cloudflare config is missing. No
deploy evidence means deploy all.

A resolver failure must fail the job with a clear error:

- Set `pipefail` wherever the resolver pipes. Without it a failed producer
  still exits 0 through the last pipe stage.
- Validate the resolved value as a JSON array of known worker names. An empty
  string or `{"a":{}}` must not parse as "skip everything".

### 4. Migrate only when pending

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

### 5. Build once, deploy many (design doc)

Read the site from a runtime `SITE_ID` instead of build-time `site:use`. One
build job uploads a single artifact. Each per-site job only renders the
wrangler config, migrates, and deploys it. Keep per-site D1/KV/R2 bindings and
one Worker deploy per site.

This is a design doc with follow-up implementation PRs, not shipped behavior.

## Rejected: one multi-tenant Worker

A single Worker serving all 29 sites was rejected (codex-personal review,
2026-10-23). It needs:

- A Host-to-site registry.
- Per-site bindings. The app worker config declares 7 per site (2 D1, 2 KV, 2 R2, 1 queue producer), so 217 for 31 sites.
- Tenant identity inside the OpenNext KV/D1 cache.
- Per-tenant secrets (Stripe, auth, Turnstile) against the 128-variable
  per-Worker limit.
- A shared failure and rollback scope across every site.

The 128-variable limit is on the Cloudflare Workers limits page
(https://developers.cloudflare.com/workers/platform/limits/); check it again
before you rely on it. The binding count is the 7 per site above, read from
`apps/web/cloudflare/app-worker/wrangler.jsonc`.

Workers for Platforms does not remove build-time site selection. Revisit after
build-once ships and isolation tests pass.

## Decision table

| Change | Saving | Risk |
|---|---|---|
| Deploy-ignore list | Docs-only diffs deploy nothing | Ignoring a path the build reads ships stale sites |
| Canary-only staging | Shared-code push to `main` deploys 1 site, not 29 | A site-specific break escapes staging until `release` |
| Side workers on input change | Up to 3 of 4 worker deploys skipped per unchanged site | A wrong diff base skips a needed deploy and stays green |
| Migrate only when pending | `d1 migrations apply` skipped on most deploys | A wrong pending check never applies real migrations |
| Build once, deploy many | 29 OpenNext builds become 1 | Artifact and wrangler render must stay in lockstep |

## Checklist for a new skip rule

1. Write the failing case first: a change that must NOT be skipped, and show
   the rule still deploys it.
2. Reuse the one shared function that decides the affected set. Never add a
   second copy — two copies drift.
3. Reject empty input, objects, unknown worker names and parse failures;
   accept a valid `[]` — it means no workers need deployment.
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

- Time a full release deploy end to end. The baseline is about 40 minutes,
  from Actions run 39980107532 (2026-10-23).
- Count staging deploys per shared-code push to `main`. Target: 1, the canary.
- Count worker deploys per site. Target: the site worker plus only the side
  workers whose inputs changed.

## Docs-only PRs need a review workflow too

A council review workflow that path-ignores `**.md` and `docs/` leaves
docs-only PRs with no review at all. The premerge gate then blocks them with
"none yet from any reviewer" — a dead end, because the filtered workflow can
never fire on that diff. A later fix removed the filter.

A review posted by `github-actions[bot]` — which happens when the chair runs
without a `claude[bot]` seat — is ignored by premerge on purpose. The owner
waived the gate for those PRs.

## Lessons from the reviews

- Reviews of skip logic found a Major in nearly every PR: silent empty
  results, wrong diff bases, fallbacks that hide errors. The unsafe skip is
  the bug; test for it first.
- Never let a resolver return an empty list on error.
- Green CI is not evidence a deploy ran. A job can succeed while skipping the
  deploy step.

## Related skills

- `ci-build-speed`, `ci-speed-diagnosis` and `high-volume-ci-optimization` cover CI pipeline speed and cost. This skill covers deploy fan-out across many sites.
- `branch-deploy-convention` covers the `main` and `release` branch rules these deploys follow.
- `cloud-agent-execution` covers the worker boxes that built these changes.
