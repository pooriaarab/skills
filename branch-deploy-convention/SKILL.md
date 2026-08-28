---
name: branch-deploy-convention
description: "Standardise branch names across repos onto main (staging) and release (production) without breaking a deploy. Covers the silent-dead-trigger defect class — a workflow branches: filter or a github.ref deploy gate that names a branch which does not exist never runs and never errors — how to sweep a whole org for it, the rename order that avoids a wrong-environment deploy, and the four blockers that make a rename unsafe. Triggers: 'rename a branch', 'standardize branch names', 'main vs master vs production', 'default branch', 'my workflow never runs', 'the deploy stopped firing', 'branches: filter'."
---

# Branch and deploy convention

## The convention

- **`main`** — default branch. Deploys the **staging** environment.
- **`release`** — deploys **production**. Promoted by merging `main` → `release`.

`staging` and `production` are **environment** names. They are never branch names.
A branch called `staging` that deploys production is worse than the name it
replaced, because it invites a "safe" push to the live site.

Write the mapping in a comment at the top of every deploy workflow, so the next
reader does not have to infer it:

```yaml
# main = staging, release = production.
# Merge main -> release to ship.
on:
  push:
    branches: [main, release]
```

## The defect this exists to prevent

A GitHub Actions `branches:` filter and a `github.ref` comparison are bound to a
**literal branch name**. Neither follows a rename, and neither errors when the
name does not exist. The workflow simply never runs. Nothing turns red. The job
list just gets shorter, and no one notices for months.

Real examples found in one org sweep of 127 repos:

| Repo | Filter named | Reality | Consequence |
|---|---|---|---|
| a personal site | `release` | no such branch | **production deploy: 0 runs, ever** |
| an app | `[main, release]` | `release` missing | 78 runs, all staging; production never deployed |
| two repos | `main` | no `main` branch | lint ran on pull requests only, silently |
| a lint config | `master` | renamed to `main` | push half dead |

**A green check list is not proof a trigger fired.** `gh pr checks` shows what
ran, not what should have. Verify with a run list instead:

```sh
gh run list --repo OWNER/REPO --branch main --limit 10 \
  --json workflowName,event,status
```

## Sweeping an org for it

Parse each workflow's `on.push` / `on.pull_request` branches and diff against the
repo's real branch list. Run it in parallel — serial `gh` calls over 127 repos
take 40 minutes, 10-way `xargs` takes two.

```sh
gh repo list OWNER --limit 300 --json name,isArchived \
  --jq '.[]|select(.isArchived|not)|.name' > repos.txt
xargs -P 10 -n 1 ./audit-one.sh < repos.txt > audit.jsonl
```

Per repo, `audit-one.sh` emits the real branch list, the default branch, and every
deploy workflow's push filter. Then look for a filter naming a branch that is not
in the list. Skip glob patterns (`*`, `?`, `!`) — they are not literal names.

**Classify a "deploy" by the command, not the filename.** Grep for
`wrangler deploy`, `pages deploy`, `netlify deploy`, `vercel`, `npm run deploy:`,
and exclude `--dry-run`. A repo publishing to npm on push to `release` follows the
convention correctly even though nothing calls it a deploy.

## Renaming safely

**Order matters, and getting it wrong is how a deploy lands in the wrong place.**

1. **Fix the config first, in a PR, and merge it.** Every `branches:` filter, every
   `github.ref` gate, `dependabot.yml` `target-branch`, and the branch model in
   the README and CLAUDE.md. Rename first and the filters go dead in the gap.
2. **Rename with the API, never by deleting and recreating.** This preserves
   history, redirects the old name, and retargets open PRs:
   ```sh
   gh api -X POST repos/OWNER/REPO/branches/OLD/rename -f new_name=NEW
   ```
   Never force-push. Never delete a branch to "rename" it.
3. **Rename the branch with no live deploy first**, so the risky one is last and
   you have already seen the checklist work end to end.
4. **Verify by observing runs**, per the run-list command above. Confirm both the
   staging and the production job appear on their respective branches.

**Check the gate mapping explicitly before and after.** Read the actual `if:`
lines and confirm each branch still reaches the environment it reached before:

```sh
grep -n -A5 'name: Deploy to' .github/workflows/deploy.yml
```

Watch for the else-fallback shape, which is fragile:

```yaml
# Any branch that is not main deploys PRODUCTION. One filter edit away from bad.
CF_ENV: ${{ github.ref_name == 'main' && 'staging' || 'production' }}
```

Prefer an explicit gate per environment, so an unexpected branch deploys nothing
rather than deploying production.

## Four things that make a rename unsafe — check all four first

1. **A deploy integration bound to the branch by name.** Cloudflare Pages, Workers
   Builds, Netlify and Vercel each store a production branch name and **do not
   follow a GitHub rename**. The site does not go down; it silently freezes at the
   last build, and new pushes become preview builds. Symptom to look for: the live
   site is older than the branch it deploys from. Repoint the integration in the
   same change window, or move the deploy into a workflow so the binding lives in
   the repo where a break is visible.
2. **Divergent migration history.** If two branches each added a migration at the
   same index, merging renumbers one of them, and the runner tracks applied
   migrations **by filename**. The database that already ran `0032_foo.sql` will
   see `0033_foo.sql` as unapplied and run it again. Read the real state before
   resolving the journal:
   ```sh
   wrangler d1 execute DB_NAME --remote --command "SELECT name FROM d1_migrations ORDER BY id"
   ```
3. **Unprovisioned placeholders.** A production environment can be scaffolded but
   never created. Grep the config for `<PLACEHOLDER>` shapes before creating the
   branch that deploys it — otherwise you get a guaranteed red first deploy:
   ```sh
   grep -nE '<[A-Z_]+>' **/wrangler.jsonc
   ```
4. **Forks.** A fork on `master` is on `master` because upstream is. Renaming
   breaks the fork relationship and every future PR upstream. Tag them instead of
   touching them:
   ```sh
   gh api -X PUT repos/OWNER/REPO/topics -f 'names[]=upstream-fork'
   ```

## Gotchas

- **A PR that edits a `branches:` filter cannot test itself.** For a
  `pull_request` event GitHub reads the filter from the head ref. Rewrite
  `[staging, production]` to `[main, release]` and a PR based on `production` no
  longer matches its own admission rule, so CI does not run on it. Only workflows
  with no branch filter still fire. Say so in the PR and verify after merge.
- **`gh pr edit` can fail and still look fine.** It fetches Projects-classic data
  through a deprecated GraphQL field; on an affected repo it prints an error and
  leaves the title and body unchanged. Read the PR back, and fall back to
  `gh api -X PATCH repos/{owner}/{repo}/pulls/N --input body.json`.
- **`dependabot.yml` `target-branch` is a literal branch name too.** It is easy to
  miss and it fails silently, exactly like a workflow filter.
- **Repo variables are readable, secrets are not.** `gh api repos/O/R/actions/variables`
  returns values, so an account id stored as a variable can be copied between
  repos. An API token stored as a secret cannot — it has to be set by hand.
- **Two conventions coexisting is the real cost.** Before standardising, check
  which one the repos already use and follow the majority. Do not assume
  `main` means production.

## Delegating the work

The audit is a deterministic script. Give it to `xargs`, not to a model — a
worker that silently returns "audit complete" with no findings costs more than it
saves. Delegate the bounded text edits (a README notice, a docs rewrite) where a
wrong answer is visible in a diff, and **verify the files rather than the
worker's summary**.
