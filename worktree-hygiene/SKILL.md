---
name: worktree-hygiene
description: Prune worktrees whose branches already merged. Use on prune worktrees, stale worktrees, clean up worktrees, or worktree cleanup requests.
---

# Worktree hygiene

Remove merged worktrees. Stop scratch buildup.

## Set up scratch ignores

Before listing worktrees, check whether the repo's `.gitignore` already
contains the patterns in `worktree-scratch.gitignore`. If not, append that
block to the repo's `.gitignore` and commit it. Skip this step if the repo
has no `.gitignore` write access; note that in the report instead.

## List worktrees

List all worktrees for the repo.
Read branch and path for each entry.

## Check merge state

For each linked worktree, check its branch.
Treat a branch as merged when any test passes:

- The branch appears in `git branch --merged` against the repo's default
  branch (usually `origin/main`; confirm it rather than assuming `main` when
  the repo uses something else, e.g. `master` or `release`).
- Its PR state reads merged, and the PR's merged head SHA matches the
  branch's current tip (or the tip is an ancestor of that merge commit).
- Its PR shows a merge timestamp, with the same tip check.

A PR closed without merging is not merge evidence. Treat "closed" alone as no
evidence, the same as no PR at all. A merged PR whose head SHA predates the
branch's current tip is also not evidence for the current tip: commits pushed
after the merge are unmerged work, so re-check ancestry against the current
tip before treating the worktree as safe to remove.

Skip branches with no merge evidence.
Never guess merge state.

## Check cleanliness

Read worktree status, including ignored files (`git status --porcelain
--ignored`). A plain status without `--ignored` misses ignored-but-uncommitted
files, such as a `.env.local` a repo's own `.gitignore` already hides, and
treating that empty output as clean would delete them unreviewed.
Treat empty status output as clean.
Treat status with only scratch files as clean.
Scratch files are WORKER_BRIEF.md, CONTINUE.md, BRIEF.md, and
WORKER_RESULT.md.
Treat any other uncommitted or ignored file as real.

## Remove safe worktrees

Remove merged and clean worktrees with the git worktree remove command.
For a merged worktree with only scratch files, delete those scratch files
first, then remove the worktree the same way. Plain `git worktree remove`
refuses a worktree that still has untracked files, and scratch files are
untracked until the repo's `.gitignore` picks up the patterns in
`worktree-scratch.gitignore`, so deleting them first keeps this path off
`--force`.
Report each removal.

## Salvage real changes

Never delete a worktree with real uncommitted changes.
Ignored files never get committed or pushed here: they're excluded on
purpose (often secrets or local config), so their mere presence is
needs-review — leave the worktree untouched rather than force-adding them.
Before committing what remains, scan both file names and file contents for
likely secrets: names like `.env*`, `*.pem`, `*_key`, `*credentials*`,
`*secret*`; and content patterns like API keys, private-key headers, bearer
tokens, and connection strings with embedded passwords. If any match, stop,
leave the worktree untouched, and report it as needs-review with the suspect
paths instead of committing or pushing.
Otherwise commit those changes to a salvage branch.
Push the salvage branch.
Then report the worktree as needs-review.

## Safety rule

Never run rm -rf when the remove command fails.
Verify each directory is a genuine linked worktree first.
Read its absolute git dir.
The path must contain "/worktrees/".
If the git dir equals "<dir>/.git", it is a main clone.
Skip main clones. Never delete them.

## Report

Report three counts: removed, skipped, needs-review.
List each path under its count.

## Implementation

The script `prune-merged-worktrees.sh` in `pooriaarab/scripts` implements this
workflow. It runs dry-run by default. Pass `--apply` to remove.
