---
name: agent-pr-standards
description: "Use when an agent fleet generates pull requests faster than humans can review them. Covers the rules that stop unreviewable PRs: one issue, one PR, one concern, under 500 lines. Details the mechanics of enforcing branch, title, and body formats, the necessity of excluding generated files from line counts, and the four layers of defense from a local hook to a review council. Explains the honest gap of running on a GitHub Free account where checks cannot be mandatory gates. Also covers the rollout strategy for installing this standard across multiple repositories. Triggers: 'setup pr standards', 'restrict agent pull requests', 'enforce 500 line limit', 'one issue one pr', 'cap agent pr size', 'stop unreviewable PRs', 'pr standards rollout'."
---

# agent-pr-standards

Generation cost collapsed to near zero in 2026. Review cost did not move. That
asymmetry is why a fleet drifts into unreviewable 20,000-line pull requests, and it is
the only thing this skill is really about.

The field already reacted, and the responses converged:

| Project | What it did | When |
|---|---|---|
| Ghostty | Zero tolerance for drive-by AI PRs not tied to an accepted issue | Jan 2026 |
| llama.cpp | Tightened policy six times in four months; new contributors capped at one open PR | Nov 2025 to Mar 2026 |
| curl | Shut down its HackerOne bounty after the valid-report rate fell below 5 percent | Jan 2026 |
| Linux kernel | Requires an `Assisted-by: AGENT:MODEL` trailer; `Signed-off-by:` stays human | 2026 |

Nothing on that list is about model quality. Every one of them is a rule about the
SHAPE of a contribution, imposed because reading is the scarce resource. This skill is
that rule, written down and made checkable.

## The rule

One issue. One PR. One concern. Under 500 lines.

### Branch, title, and body formats

The issue number is the join key. It ties the branch, the title, the body and the
merged commit to one agreed piece of work. No issue, no branch. That single rule does
most of the work here, because it is what stops an agent from inventing its own scope.

| Asset | Rule | Example |
|---|---|---|
| Branch | `<prefix>-<issue>-<slug>` | `cr-142-fix-onboarding-drop-off` |
| Title | `[PREFIX-ISSUE] Subject` | `[CR-142] Fix onboarding drop-off` |
| Body | Exactly one `Closes #N` | `Closes #142` |
| Body | Includes `## How I verified` | `bun test -> 214 passed` |
| Body | Includes `Assisted-by:` | `Assisted-by: claude-personal:claude-opus-5` |

The subject is imperative mood, 10 to 50 characters, no trailing period, no emoji.
Rejected openers: Added, Fixed, Updated, Removed, Changed, and any first word ending in
-ing. The body must clear 120 characters and must name a verification command and what
it returned. `N/A` and `tested locally` fail, because neither tells a reviewer anything.

`Assisted-by:` is disclosure, not attribution. Months from now it is the only way to
tell which fleet member produced which class of defect, which is what lets you route
work away from a model that keeps drifting. It is not `Co-Authored-By:` and does not
belong in the commit message.

The prefix is per-repo, 2 to 4 lowercase letters, and it must be unique across the
account. Keep the mapping in one registry file and assert uniqueness when you generate
it. Two repos that derive the same prefix produce branch names that no longer say which
repo they belong to, and you will not notice until you are reading a list of them.

## Size and atomicity constraints

| Constraint | Limit |
|---|---|
| Net counted lines | 500 |
| Counted files changed | 40 |
| Closing issue references | 1 |

500 is a design constraint, not a nuisance. It is roughly one reviewable sitting. An
agent that must stay under it decomposes the work BEFORE it writes, which is the
behaviour you actually want; a cap applied afterwards only produces an argument. Pick
500 over 1000 for exactly this reason.

The only bypass is an `oversized-approved` label that the repo owner applies. An agent
that can clear its own oversize check does not have a cap.

The count must exclude generated files: lockfiles, `dist/`, `build/`, `.next/`,
snapshots, migrations, vendored code and binary assets. A cap that punishes an agent for
a lockfile it did not write teaches the agent that the cap is noise, and an agent that
believes the cap is noise will route around it. Report both numbers so the exclusion is
visible: `640 counted lines (1,240 raw; 600 excluded as generated)`.

Atomic means one concern. Mechanical proxies like line counts catch obvious violations. True atomicity is a judgement call for the review council.

## The four layers of enforcement

| Layer | Runs | Catches | Why it exists |
|---|---|---|---|
| Agent `PreToolUse` hook | At tool-call time | A bad branch before it exists | Local speed |
| `pre-push` git hook | Before the push | A bad branch before GitHub sees it | Local speed |
| `pr-standards.yml` in CI | On every PR | Everything, including size and body | The authority |
| `vibecodereview` scope lens | On every PR | Non-atomic and off-scope work | Semantic judgement |

Local layers exist for speed. CI is the authority. Neither replaces the other. The local layers prevent the feedback loop from taking two minutes. The semantic lens prevents an agent from sneaking two features into one branch that happens to be under 500 lines.

## The honest gap

GitHub rulesets and required status checks need GitHub Pro. On a Free account, no check on a private repo can be made mandatory. Red CI is a signal, not a gate. Do not paper over this limitation. This means the two local layers carry more weight, because they physically prevent the bad state from reaching the server. A bad PR can still merge on a Free account if a human ignores the red cross.

## Rollout mechanics

Roll this standard out across the fleet using the pattern from [agent-lint-guardrails](../agent-lint-guardrails/SKILL.md). That skill caps the shape of the code. This skill caps the shape of the change.

1. Fan out four self-contained files per repo: `.github/pr-standards.json` (the
   per-repo config), `.github/pull_request_template.md`, `.github/workflows/pr-standards.yml`,
   and a marked block in `AGENTS.md`. The block sits between
   `<!-- pr-standards:start -->` and `<!-- pr-standards:end -->` so a second run updates
   it instead of appending a second copy.
2. Put the CI check in ONE place and have every repo fetch it. Sixty copies of the same
   validator is sixty places to fix a rule. The cost of that choice is that the workflow
   tracks a branch of a repo you own; pin it to a commit SHA where a repo needs the rules
   frozen.
3. Skip forks and empty scaffolds. Never run the checker on someone else's code, and a
   3-KB repo is a scaffold, not a project.
4. Respect the `workflow` token scope. A git push of a workflow file works, but the
   contents-API edit of one is classifier-gated. Report that failure per repo rather than
   aborting the whole fan-out.
5. **The rollout must obey the standard it installs.** That means an issue per repo
   before the branch, and a PR body with the sections the new check requires. If the
   rollout PR cannot pass its own check, the standard is wrong and you have just found
   out cheaply.

Two knobs are worth leaving visible in the config rather than hard-coding. `allowChoreEscape`
lets a `chore/<slug>` branch skip the issue requirement; start with it off, and turn it on
only when issue bookkeeping for dependency bumps costs more than it saves. `excludeGlobs`
is per repo, because what counts as generated differs by stack.

For related pipeline efficiency, see [ci-speed-diagnosis](../ci-speed-diagnosis/SKILL.md) to keep CI fast when enforcing these checks.