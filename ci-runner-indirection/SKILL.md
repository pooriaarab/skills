---
name: ci-runner-indirection
description: "Move many repositories to a new GitHub Actions runner provider, and make the next move a one-variable change. Replace hard-coded runs-on labels with a repository variable that has a default, roll it out with a codemod and one small PR per repo, and avoid the traps: jobs that must stay hosted, tests that assert the literal label, JSON-style keys, block scalars, and API rate limits. Use when switching CI providers, when a runner label is copied into dozens of workflows, or when a fleet migration needs a repeatable plan."
---

# ci-runner-indirection

The headline lesson: **put the provider behind a variable once, then migrate.** A literal label such
as `runs-on: ubuntu-latest` is copied into every workflow, so each provider change is a fleet-wide
edit. A variable with a default turns the next change into one setting per repository.

## The pattern

```yaml
runs-on: ${{ vars.CI_RUNNER || 'boat' }}          # ordinary jobs
runs-on: ${{ vars.CI_RUNNER_LARGE || 'boat-8' }}  # heavy builds
```

- The default keeps the workflow valid when the variable is unset.
- Set the variable only where it is unset, so a deliberate override survives a re-run.
- Use two variables, not one. A large job needs a different label than an ordinary job.

## Rollout

1. Count first. List every `runs-on` value across the fleet and group them by provider.
2. Run a codemod that rewrites only literal Linux labels. Dry-run first and read the counts.
3. Open one issue and one pull request per repository. Keep each PR small.
4. Have a second model review each diff before merge. Post the review against the head commit.
5. Merge only when the merge gate passes at that exact commit.
6. Do the work on a cloud box, not on a laptop. Clone, rewrite, validate and push there.

## What the codemod must not touch

- macOS and Windows labels. Keep them for repositories that ship native apps.
- `matrix` values, list values and existing expressions.
- Lines inside `run: |` block scalars. A heredoc can contain the text `runs-on:`.
- Jobs that must stay hosted, for example a secret-heavy deploy or alert, or an action that
  resolves paths from the runner home. Put the hosted label back by hand.

It cannot see JSON-style keys such as `"runs-on": "boat"`. Search for them after the rewrite.

## Traps seen in a real migration

- **Tests that assert the label.** An end-to-end spec or a Python check read `runs-on` and compared
  it to the literal string. The rewrite broke them. Search the tests for `runs-on` and update them
  to expect the expression.
- **A stale branch after main moves.** A rebase can conflict in a spec that main changed. Take main's
  side, then re-apply the rewrite instead of merging both by hand.
- **Policy labels.** A check may require a human-applied label for workflow edits. Do not apply a
  gate label to your own PR. Ask the owner.
- **Old failures.** A check that already fails on the default branch is not caused by your PR.
  Prove it from the run history, then report it. Do not bypass the gate.
- **A rate limit that looks like a verdict.** The GitHub API allows 5000 calls per hour per user,
  shared across every tool. A rate-limited read returns empty lists. Treat that as "not measured".
- **Reviews bind to a commit.** A fix push needs a new review at the new head commit.
- **Concurrency cancels.** A cancelled `pr-standards` run after a quick second push is benign.

## Verify

- Run `actionlint` on each changed workflow.
- Run the repository's tests that read workflow files.
- After merge, confirm one run per repository picked the expected runner.
