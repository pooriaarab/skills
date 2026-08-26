---
name: ci-cost-at-agent-scale
description: "Use when CI spend, CI queueing, or CI wall-clock becomes a problem on a repo where agents open most of the pull requests — hundreds of workflow runs a day, review bots that push their own fix commits, or a fleet of parallel workers each blocking on its own checks. Audits where the runs actually come from before changing anything, then fixes in cost order: delete work that produces nothing, add concurrency groups so superseded runs cancel, path-filter the heavy suites, share a build cache, and only then move to a cheaper runner. Explains why a per-minute price cut is the wrong first move, why the real ceiling is usually concurrent-job limits rather than minutes, and why agent sandboxes (E2B, Daytona, Modal, Cloudflare Sandbox SDK) cannot replace a CI runner no matter how cheap they look. Triggers: 'CI is too expensive', 'CI is queueing', 'switch off GitHub Actions', 'cheaper CI runners', 'Blacksmith / Depot / Ubicloud / RunsOn', 'run CI in a sandbox', 'our agents are burning CI minutes', 'why is CI slow at scale'."
---

# ci-cost-at-agent-scale

CI economics break differently when agents open the pull requests. The fix is almost never the
one people reach for first.

## When to use this

**Trigger if:**
- Agents, review bots, or a worker fleet open most of the pull requests.
- CI runs number in the hundreds per day, or jobs sit queued behind each other.
- Someone has proposed switching runner providers, or hosting CI on a sandbox platform.

**Don't bother if:** a handful of humans open a handful of PRs a day. At that volume the bill is
noise and the audit costs more than it saves.

## The core asymmetry

A human PR costs one pipeline. An agentic PR costs **one pipeline per `synchronize` event**, and
nobody budgets for the extra ones because they land somewhere else.

Every bot commit — a review bot's auto-fix, a formatter, a changelog stamp — is a real commit on
the branch. GitHub raises `synchronize`. **Every** workflow triggering on `pull_request` runs
again. A review bot with a 3-cycle fix budget, in a repo with five `pull_request` workflows:

```
1 agent push        ->  5 runs
3 bot fix commits   -> 15 runs
                       20 runs for one pull request
```

The bot's own workflow appears once in that tally. The other 15 runs are charged to your test,
lint, build and e2e workflows, which is why the multiplier survives so many cost reviews.

**Second asymmetry, and the one that actually bites:** at agent scale you hit the
**concurrent-job ceiling** before the minutes bill hurts. GitHub-hosted private repos cap around
20 concurrent jobs on Free and 60 on Team. Past that, agents queue — and a queued check blocks
the agent that opened the PR, so throughput collapses while the invoice still looks fine. Cutting
per-minute price does nothing for this. Only moving runners into infrastructure you control does.

## Audit before you change anything

Never accept a "CI is expensive" premise without these numbers. Most proposed migrations die here.

```bash
# Run volume and the real window (do NOT extrapolate from a dense burst --
# check the min/max timestamps before you multiply anything out)
gh run list -L 300 --json createdAt,headBranch,name,event,conclusion \
  --jq '[.[].createdAt] | (min), (max), length'

# Where the runs come from. Group by workflow + event + outcome.
gh run list -L 300 --json name,event,conclusion \
  --jq '.[] | .name+" | "+.event+" | "+(.conclusion//"running")' | sort | uniq -c | sort -rn

# The actual bill. Needs the `user` scope, which gh does not request by default.
gh auth refresh -h github.com -s user
gh api /users/<owner>/settings/billing/actions
```

**Do not trust the per-run timing API.** `/actions/runs/<id>/timing` returns
`total_ms: 0` often enough that a whole sample can read as zero billable minutes on a private
repo with real spend. Use the billing endpoint for money and run counts for volume.

What the grouping tells you: a workflow appearing under both `pull_request` and `push` for the
same branch is duplicated triggers. A high `cancelled` count is missing supersession. A workflow
with many runs and nothing to show for them is the next section.

## Fix in this order

Each rung is cheaper and lower-risk than the one below it. Stop when the pain stops.

### 1. Delete work that produces nothing

The highest-yield bug in this class: a **deploy workflow that triggers on `pull_request` while
every one of its steps is gated on the branch ref.**

```yaml
on:
  pull_request:        # <- fires
jobs:
  deploy:
    steps:
      - run: ./deploy.sh
        if: github.ref == 'refs/heads/main'   # <- never true on a PR
```

Each PR pays full checkout, toolchain setup and dependency install — the slow part — then skips
every real step and exits green. It looks healthy in the UI. Grep for it:

```bash
# workflows that trigger on pull_request AND ref-gate their steps
grep -l "pull_request" .github/workflows/*.yml \
  | xargs grep -l "github.ref == 'refs/heads/"
```

**While you are in there, check every step for a gate.** These workflows usually have one step
someone forgot to gate — a cache purge, a notification, a metrics push — and it has been firing
on every pull request for months. That is a correctness bug wearing a cost bug's clothes, and
it is the reason this rung comes first.

### 2. Concurrency groups

Supersession. Without a group, pushing to a PR leaves the old run going and starts another
beside it. At agent scale, where bots push repeatedly, this is the difference between one
pipeline and four.

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

| Workflow kind | `cancel-in-progress` |
|---|---|
| test, lint, typecheck, build, scan, review | `true` |
| deploy, migrations, release, publish | `false`, or no group at all |

**Never cancel a deploy.** A run killed partway through a migration is worse than a queued one.
And skip the group entirely on release-tag publish workflows — they fire once, so it buys nothing.

### 3. Path filters on the heavy suites

A docs-only PR should not run a 20-minute e2e suite. Agents generate a lot of docs-only PRs.

```yaml
on:
  pull_request:
    paths-ignore:
      - "**.md"
      - "docs/**"
```

Three rules:

- **Never path-filter a secret scanner.** A credential lands in a markdown file as easily as in
  source.
- **Check for required status checks first.** A filtered-out check never reports, and a *required*
  check that never reports leaves the PR stuck on "waiting for status" forever. Either use a
  companion skip-job that reports success, or confirm the check is not required.
- Keep the ignore list identical across workflows. Mixed lists mean one workflow's opinion of
  "docs-only" disagrees with another's.

### 4. Share the build cache

The biggest per-run win on a monorepo, and it needs no provider change. Agentic PRs usually touch
one package; without a shared cache every runner rebuilds the whole graph. Point the build tool's
remote cache at object storage you already pay for.

**The trap:** a warm cache masks base drift. A PR can pass entirely from cache while `main` is
broken, and the breakage surfaces later on an unrelated PR that happens to bust the cache. Keep a
scheduled cache-cold run on the default branch so drift surfaces on a schedule instead of
ambushing whoever pushes next.

### 5. Only now, change runners

Providers that are real drop-in runners — they register with GitHub and you swap a label:

```yaml
runs-on: ubicloud-standard-4   # was ubuntu-latest
```

| Option | Rough $/hr at 4 vCPU | Notes |
|---|---|---|
| Managed cheap runners (Ubicloud, Blacksmith, Depot, Namespace, WarpBuild) | $0.10 – $0.20 | Label swap. Some require a GitHub **org** — personal-account repos are excluded. Check before planning. |
| Self-hosted in your own cloud (RunsOn and similar) | flat licence + spot instances | Lifts the concurrency ceiling to your own account limits. Free tiers exist for personal/non-commercial use. |
| Your own always-on box | fixed monthly | Cheapest per minute. You own patching and isolation. Fine for private repos, dangerous for public ones. |
| GitHub-hosted | ~$0.96 | The baseline you are leaving. |

If the driver was queueing rather than money, only the rows that run in **your** infrastructure
help. A cheaper managed runner usually carries its own concurrency limit.

## Agent sandboxes are not CI runners

This proposal recurs, so it gets its own section. E2B, Daytona, Modal, Vercel Sandbox and
Cloudflare's Sandbox SDK are **compute primitives**: call an API, get a container, run code, tear
it down. What they do not have:

- no `runs-on:` label — GitHub does not know they exist
- no job dispatch, no just-in-time runner registration
- no secrets injection, no artifacts, no build cache, no matrix, no PR status checks, no log UI

To use one as CI you write: webhook listener → mint a JIT runner token → boot the sandbox →
install the runner agent → register → run → tear down → ship logs. **That control plane is
precisely the product the managed-runner vendors sell.** You would build it and pay roughly 3–4×
a managed runner for the compute.

They also tend to be sized for short-lived agent tasks, not builds. Check the disk ceiling before
anything else — a serverless container platform capping at tens of gigabytes of *ephemeral* disk
cannot hold one monorepo checkout with dependencies installed, let alone cache it between runs.

Sandboxes are the right tool for **executing code you do not trust** — agent-generated snippets,
user submissions, per-task blast radius. Keep them for that.

## Also fix the bot that multiplies everything

Whatever review or fix bot runs on your PRs, two settings dominate its cost:

- **Its fix-cycle budget.** Each auto-fix commit is another `synchronize` and another full
  pipeline. Past the second pass the bot is usually arguing with itself. Set the budget to 1 or 2
  on busy repos.
- **How it counts its own commits.** A loop guard that matches any `*[bot]` author will count an
  unrelated bot's commit sitting at HEAD and silently stop fixing. Guards should match the bot's
  own committer identity.

And the structural lever, which beats every tuning knob above: **fewer, larger PRs.** Batching a
fleet's output into one PR per logical change cuts the multiplier at the source instead of making
each multiplied run cheaper.

## Gotchas

| Symptom | Cause |
|---|---|
| A sampled set of runs reports 0 billable minutes on a paid private repo | The per-run timing API is unreliable. Use the billing endpoint. |
| Extrapolated monthly minutes look absurd | The sample window was a dense burst. Always read min/max timestamps before multiplying. |
| `gh api .../settings/billing/actions` returns 404 | The token lacks the `user` scope. `gh auth refresh -h github.com -s user`. |
| Branch protection API returns 403 on a private repo | Required status checks need a paid plan. Also means path filters cannot deadlock a check — verify rather than assume. |
| A new PR gets no workflow runs at all, while other branches do | GitHub scheduling lag, which can exceed five minutes under load. Confirm with an empty commit before diagnosing the diff. |
| Workflow triggers look fine locally but behave differently in CI | You read the file from a stale branch. For `pull_request`, read the workflow as it exists on the base and head refs, not from your working tree. |
| A cost-audit script silently returns nothing | BSD `xargs` has no `-a`; `xargs -I{}` drops tab-delimited fields. Test the pipeline on one input before fanning out. |
