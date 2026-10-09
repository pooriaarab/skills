---
name: drain-a-pr-queue
description: "Use when a repo accumulates a large open-PR backlog and an LLM review council gates merges — the chair posts a state comment but never a formal review, so nothing can land. Covers diagnosing council starvation (metered lens keys at a monthly cap or credits depleted, OAuth seats expired), re-pointing council lenses at live subscription seats via the council_models override, the rerun trap (a re-run uses the workflow file pinned at trigger time, so only a fresh synchronize picks up the fix), the empty-commit kick recipe that needs no checkout, keeping repo secrets synced to rotating OAuth credentials, a merge loop contract (clean state, latest-run-per-check green, one APPROVED review, delete head branch so stacked children re-target), and disposing of stacked, oversize, and superseded PRs without losing work. Triggers: 'merge all open PRs', 'zero open PRs', 'review council not approving', 'vibecodereview failing', 'chair posted no review', 'PR queue backlog', 'unstack PRs', 'approve PRs'. Also covers landing a stacked queue across many new repos: recording branch tips so `rebase --onto` survives squash merges, GitHub's secondary content-creation limit, restacking `file:` dependencies onto published versions, and the ship-sync branch for a second release into a squash-merged production branch. Triggers: 'land a stack', 'secondary rate limit', 'release PR conflicts', 'restack branches'."
---

# Drain a PR queue

A fleet writes PRs faster than a queue drains. When the queue is the goal — get
every open PR merged or closed with evidence — the bottleneck is almost never the
merges. It is the review gate.

This skill is the recovery playbook for the failure that wedges everything: the
LLM review council stops posting formal reviews, so every PR sits unapproved no
matter how green its checks are.

## Diagnose council starvation first

When every council check "passes" or fails fast and no `APPROVED` review appears,
read the run log before touching anything else:

- `chair posted no review this run (primary=success, ...)` means the chair ran
  but declined to post — it had zero usable lens reports.
- The council comment body carries a base64 `carry` payload. Decode it: it lists
  each lens and its failure — `HTTP 403: Key limit exceeded (monthly limit)`,
  `402` credits depleted, `not set`. That tells you which key died.
- A token-probe line (`token_N=live|dead`) shows which subscription seats work.

Metered keys die on quotas. Subscription OAuth seats expire or get rate-capped.
Diagnose which side is dead before reconfiguring.

## Re-point lenses at live seats

The council accepts a `council_models` CSV override of `provider|model|Name|lens`
tuples. Providers include the subscription seats (`claude`, `claude2`, `claude3`,
`claude4`) that shell the CLI on OAuth tokens instead of metered APIs:

```yaml
council_models: >-
  claude2|claude-sonnet-5|Claude Sonnet 5|correctness,
  claude3|claude-sonnet-5|Claude Sonnet 5|security
```

Map each `claudeN` provider to the matching `claude_code_oauth_token_N` input.
Ship this as a normal workflow PR — `pull_request` runs use the head's workflow
file, so the fix PR's own council run exercises the new lenses and is its own
proof.

## The rerun trap

`gh run rerun` re-executes the workflow file pinned at trigger time. A council
failure caused by the old configuration will re-fail identically forever.

Only a fresh `pull_request` event re-reads the workflow:

- `synchronize` — push to the head branch.
- `review_requested` — useless when the repo's only collaborator is the owner
  (you cannot request the author).
- `opened` / `edited`-style events do not apply unless the workflow listens.

To retrigger without a checkout, mint an empty commit server-side:

```bash
tree=$(git rev-parse <headSha>^{tree})
new=$(git commit-tree "$tree" -p <headSha> -m "Retrigger council")
git push origin "$new:refs/heads/<branch>"
```

Fetch with `--filter=blob:none` first so this costs tree objects only. Pace the
kicks — each one fires the full check suite. Verify `git ls-remote` still shows
the listed head before pushing: another worker's force-push makes the kick a
non-fast-forward that must be skipped, not forced.

The inverse also holds: reruns DO re-resolve merge content for checks whose
workflow file is unchanged. Preview, test, and standards failures caused by a
broken base branch are correctly retried with `rerun-failed-jobs` — the run
re-merges onto the fixed base. Split the two classes: pin-sensitive failures get
kicks, content-sensitive failures get reruns.

## Keep secrets synced

Subscription OAuth tokens rotate under a proxy layer (access tokens live hours;
refresh tokens rotate on use). Point repo secrets at the proxy's *current* auth
files, not a stale export, and refresh on a loop — a token that was live at push
time can be dead by the time the fiftieth council run consumes it.

Probe each seat directly before trusting it; a `429` means rate-capped (it
recovers alone), a `401`/`403` means dead (rotate or re-login — an org-level
OAuth block cannot be fixed from a CLI).

## The merge loop

A PR is mergeable only when all of these hold at the same instant:

- `mergeable_state == clean`
- latest run per check name is `success`/`skipped`/`neutral` — dedupe by name,
  oldest runs stay in the rollup forever
- at least one formal `APPROVED` review exists (a comment is not an approval)

Merge with squash and delete the head branch. Deleting the head branch is what
re-targets any PRs stacked on it onto the default branch — without it they sit
on a dead base and can never merge.

## Dispose of the backlog by evidence, not by mood

- **Empty diff**: PR standards itself flags `empty diff` — every touched path is
  already identical on main. Close as superseded; the work landed elsewhere.
- **Ancestor**: `git merge-base --is-ancestor <head> <source-branch>` — the head
  is fully contained in a landing-plan source branch. Construction-grade proof.
- **Issue closed**: the linked issue was closed by a merged PR or by the owner.
  The PR dies with its issue.
- **Duplicate**: byte-identical diff to another open PR — keep the cleaner one.
- **Stacked**: rebase the PR's own net diff onto current main (`merge-base` to
  find the divergence point; squash-apply the diff when lineage is foreign),
  force-push, retarget base to main. If a file the PR modifies does not exist on
  main and arrives via an unmerged parent, the chain is real — land the parent
  first or mark needs-human.
- **Oversize**: re-measure *after* unstacking — foreign lineage inflates the
  counted diff. Still over the cap means split by subsystem, one issue per split.

## Land a stacked queue at fleet scale

This part is for the opposite problem: a fleet built many stacked branches
locally, across many new repos, and one lead now lands them. It worked for
about 370 PRs over 19 repos.

### Record the tips before you touch a branch

Write each branch name and its tip SHA to a file before any rename or rebase.
A squash merge puts the parent's change on `main` as a new commit, so the
child still carries the parent's old commits. Rebase the child onto `main`
from the parent's recorded tip:

```bash
git rebase --onto origin/main <recorded tip of parent> <child>
```

Without the recorded tip, the rebase replays the parent's commits again and
conflicts with their squashed copy.

### Stay under the secondary limit

GitHub limits content creation to about 80 requests a minute and 500 an hour.
This limit is separate from the 5,000 GraphQL points, and it answers `403`
while `gh api rate_limit` still shows a full quota. Six repos landing at once
hit it.

- Create issues and PRs with REST (`gh api repos/<o>/<r>/pulls -f ...`), not
  `gh pr create`, except when you need `--attach`.
- Poll check runs with REST on the head SHA every 30 seconds:
  `gh api repos/<o>/<r>/commits/<sha>/check-runs`.
- Merge at most about three repos in one round, then wait.
- Keep the merge itself out of the landing script. The script opens the PR and
  waits for checks. A person or the lead agent reads the result and merges.

### Restack `file:` dependencies onto published versions

Branches built before their sibling packages were on npm depend on them with
`file:` paths. When the packages publish, replay each branch onto the new base
one commit at a time:

1. `git cherry-pick -n <commit>`.
2. Rewrite each `file:` spec for a published package to its range.
3. Regenerate the lockfile only when `package.json` changed.
4. `git commit -C <commit>` to keep the message and the author.

Commit by commit keeps a tests-first history visible. Stop on a conflict in
any file other than `package.json` or the lockfile: that is a real conflict.
Keep worktrees inside the project tree, because pnpm writes `file:` paths to
the lockfile as relative paths.

### Ship a second release into a squash-merged branch

When `main` merges into `release` by squash, the first `main` to `release` PR
is clean. The second one conflicts, because the two branches share no recent
ancestor. Build a sync branch that holds `main`'s exact tree and records
`release` as a parent:

```bash
git checkout -B <prefix>-<issue>-ship-sync origin/main
git merge -s ours --no-edit origin/release
git diff --quiet origin/main && echo "tree equals main"
```

Open it against `release` with a full standard body and its own issue. Do not
put the word `release` in the branch name: the fleet pre-push hook blocks it.

## Budget the seats

Every council run consumes a chair call plus one call per seat lens. A mass
retrigger over a hundred PRs will eat subscription quota windows — pace kicks
and let the sweeper retry failures rather than fanning out all at once.

## Proof still applies

Driving the queue does not waive evidence: visible diffs need real before/after
captures attached to the PR, everything else needs a command and its result in
`## How I verified`. A council that flags stale proof is usually right — the
branch moved under the body.
