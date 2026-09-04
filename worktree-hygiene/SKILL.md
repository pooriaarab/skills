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

- The branch appears in `git branch --merged` against origin/main.
- Its PR state reads merged.
- Its PR shows a merge timestamp.

A PR closed without merging is not merge evidence. Treat "closed" alone as no
evidence, the same as no PR at all.

Skip branches with no merge evidence.
Never guess merge state.

## Check cleanliness

Read worktree status.
Treat empty status output as clean.
Treat status with only scratch files as clean.
Scratch files are WORKER_BRIEF.md, CONTINUE.md, and BRIEF.md.
Treat any other uncommitted change as real.

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
Before committing, scan the changed files for likely secrets: names like
`.env*`, `*.pem`, `*_key`, `*credentials*`, `*secret*`, and any file already
covered by the repo's own `.gitignore`. If any match, stop, leave the
worktree untouched, and report it as needs-review with the suspect paths
instead of committing or pushing.
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
