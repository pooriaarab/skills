---
name: worktree-hygiene
description: Prune worktrees whose branches already merged. Use on prune worktrees, stale worktrees, clean up worktrees, or worktree cleanup requests.
---

# Worktree hygiene

Remove merged worktrees. Stop scratch buildup.

## List worktrees

List all worktrees for the repo.
Read branch and path for each entry.

## Check merge state

For each linked worktree, check its branch.
Treat a branch as merged when any test passes:

- The branch appears in `git branch --merged` against origin/main.
- Its PR state reads closed or merged.
- Its PR shows a merge timestamp.

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
Remove merged worktrees with only scratch files the same way.
Report each removal.

## Salvage real changes

Never delete a worktree with real uncommitted changes.
Commit those changes to a salvage branch.
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
