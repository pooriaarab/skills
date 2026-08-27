---
name: high-volume-ci-optimization
description: "Use when many agent-generated PRs per hour across many repos make CI feel slow or expensive, and you need it instant and cheap on infrastructure anyone can reproduce. Covers a three-tier runner model, collapsing job fan-out, host-local caches outside the workspace, in-job parallelism caps, fixed-port services, duplicate-work filters, affected-only builds, a remote cache, cache-masking hazards, timing APIs, per-minute cost, and security invariants. Cross-references self-hosted-runner-fleet for host setup rather than repeating it."
---

# High-volume CI optimization

CI feels instant when the jobs that run on every PR hit a warm cache on a host you already own, and still complete when that host is down because two other independent tiers exist. This skill is the job-placement and cost playbook. How to register and operate the host is in [self-hosted-runner-fleet](../self-hosted-runner-fleet/SKILL.md). Do not copy that setup here.

## Three-tier runner model

Assign each job to the cheapest tier that can actually run it. Keep two independent paid-or-hosted tiers so that when the self-hosted host dies, CI still runs.

| Job type | Runner | Why |
| --- | --- | --- |
| lint, typecheck, build, AI review | Self-hosted host you own | Caches stay warm between runs. Marginal cost is electricity. |
| Jobs with fixed-port `services:` containers, e2e that needs those containers, burst fan-out, overflow | Ephemeral cloud runners (per-job VM, for example Ubicloud at about $0.0008/min) | Each job gets its own network namespace and ports. Extra capacity appears only when a burst needs it. |
| deploy, release, publish, macOS/iOS images, SARIF upload jobs, comment-triggered workflows | Vendor-hosted (GitHub-hosted) | Image, secret, and trust constraints that a spare Linux box cannot meet. See [Security invariants](#security-invariants). |

Same job, job execution time (not run wall clock), median and best:

| Runner | Median | Best |
| --- | --- | --- |
| self-hosted host you own | 43s | 26s |
| ephemeral cloud VM (2 vCPU) | 50s | 48s |
| vendor-hosted | 58s | 51s |

The self-hosted host is the fastest tier per job. Cloud runners buy capacity, not speed. An earlier claim that cloud is 5x faster compared run wall clock including queue against job time. Compare job time to job time and wall clock to wall clock.

The self-hosted host is the default for private-repo compile work because a warm package-manager cache and task-runner cache turn a multi-minute install into seconds. It is not the default for anything that needs a unique port, a vendor image, or a trust boundary the host should never cross.

Keep the ephemeral cloud tier even after the host is humming. A single machine is a single failure domain. When it reboots, fills the disk, or hits load average 30, the cloud label still has to dispatch. That independence is the reason there are three tiers rather than "everything self-hosted, hosted as a last resort."

Point self-hosted jobs at the fleet label from [self-hosted-runner-fleet](../self-hosted-runner-fleet/SKILL.md). Point overflow and `services:` jobs at the ephemeral provider's label. Leave vendor-hosted jobs on `ubuntu-latest` or the macOS/iOS image they already use.

## The job fan-out tax

A repo with 8 CI jobs pays checkout and dependency install 8 times. On one shared host that is the dominant cost, not the tests.

Collapse those jobs into one job and use the monorepo task runner's own parallelism (`turbo run lint test build --concurrency=...`, `nx run-many`, and the equivalent). One checkout, one install, then the tool fans out across packages inside the same workspace. The host already has the bytes. Extra GitHub jobs only re-download them.

Job names are the required status checks. If branch protection requires `lint`, `typecheck`, and `build`, collapsing them into `ci` leaves every PR stuck on "waiting for status" until you update the required checks in the same change. Treat the protection update as part of the workflow diff, not a follow-up.

Do not collapse jobs that must run on different tiers. A SARIF upload and a compile job do not belong in the same `runs-on`. Collapse within a tier.

## Caches must live outside the workspace

`actions/checkout` cleans the workspace, so any cache inside it is deleted every run. Put content-addressed caches on the host and inject them into every runner service with a systemd drop-in `Environment=` line.

```ini
# /etc/systemd/system/actions.runner.*.service.d/caches.conf
[Service]
Environment=npm_config_cache=/opt/ci-cache/npm
Environment=TURBO_CACHE_DIR=/opt/ci-cache/turbo
Environment=PLAYWRIGHT_BROWSERS_PATH=/opt/ci-cache/ms-playwright
```

Package-manager caches, task-runner caches, and browser downloads are content-addressed. Two repos can share `/opt/ci-cache` without clobbering each other. After `systemctl daemon-reload`, restart the runner services so they pick up the drop-in.

Keep each runner service's `HOME` separate. Concurrent installs race on the package manager's home directory and fail with `Text file busy`. Share the caches, not the home. A typical layout is `HOME=/opt/actions-runner/<repo>` per service and `/opt/ci-cache/...` for everything hashed by content.

`runner.environment` cannot separate two self-hosted fleets. It reads `self-hosted` for a spare box and for managed cloud runners. If you use it in a cache key, both fleets share one cache. A native addon built against one kernel restores onto the other and fails. Key on distro plus kernel release instead, for example `runner.os` plus `uname -r`.

## Do not use actions/cache on a self-hosted runner

`actions/cache` uploads to the provider and downloads back, which is slower than reading `/opt/ci-cache` on the same disk, and it consumes the repository's 10 GB cache quota. On a self-hosted host the local directory is the cache. Skip the action.

Cloud and vendor-hosted jobs still need a cache they can see. That is the remote cache in [A remote cache is the cross-tier multiplier](#a-remote-cache-is-the-cross-tier-multiplier), not `actions/cache` round-tripping through the same host that already has the files.

## Cap in-job parallelism

A 20-thread host with five concurrent jobs and uncapped workers reached load average 30. CI queued for about 30 minutes, unrelated SSH sessions stopped answering, and file-sync subprocesses were killed.

Set the task runner's concurrency and the test runner's worker count so that `(runner services) × (workers per job)` stays near the core count, not several times above it. A 20-thread host with three runner services wants roughly `--concurrency=6` (or `vitest --maxWorkers=6`) per job, not the tool default of "all cores" on every job at once.

The failure mode looks like a dead host, not a slow test. Load average 30 with SSH unanswered is scheduler starvation. Cap first, then add services.

## Fixed-port services containers mean one job per host

Three test shards that each bind the same database port cannot share a machine. The second container fails with `port is already allocated`.

GitHub `services:` maps container ports onto the runner's network namespace. On a persistent host that namespace is the host itself, so the first job owns `5432` until it exits. A single host can only serialize that class of job.

Ephemeral per-job runners fix it: each VM (or each job network) gets its own port space, so the three shards run at the same time. Send any workflow that uses fixed-port `services:` to the ephemeral cloud tier. Do not try to make them share the self-hosted host.

A job carries its runner assumptions when you move it. A step that frees disk by deleting vendor-hosted toolchain paths, runs `swapoff -a`, recreates `/swapfile` and sets `vm.swappiness` is correct on a runner it owns outright. On a shared host, concurrent copies do all that to each other. Re-read every `sudo`, absolute path and cache key when you change `runs-on`.

## Runner services per repo

One service per repo serializes that repo's jobs. Adding a second service for the same repo raises concurrency for that repo. It does not raise throughput once the host is CPU-bound. Check load average before adding. If the host is already at the cap from [Cap in-job parallelism](#cap-in-job-parallelism), another service only lengthens the queue you thought you were draining.

Removing a service: delete the registration through the API first, then stop and remove the service. Deleting the service first leaves an orphaned registration the API refuses to delete while it looks busy. The API sequence is `DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}`, then `systemctl stop` and disable, then delete the install directory.

How to register a service, one per repository, is in [self-hosted-runner-fleet](../self-hosted-runner-fleet/SKILL.md).

## Parallelism is a count of machines, not a setting

A self-hosted host with N runner services runs at most N concurrent jobs across every branch of a repo. There is no switch to turn on. No config raises that count except adding a service.

Diagnostic pattern: on a pull request, every vendor-hosted and cloud check runs concurrently while only the self-hosted checks sit queued. That queue points at the host concurrency cap, not at job slowness.

The bottleneck relocates rather than disappears. After this campaign moved the heavy jobs off the host, the host went fully idle and the queue reappeared against the vendor-hosted concurrency limit. Re-measure after every move. The next constraint is somewhere else.

## Stop paying for duplicate work

Skip the run when the diff cannot affect the result.

Use `paths-ignore` for docs-only changes so a markdown edit does not rebuild the app. Keep secret scanners out of that ignore list. A credential in a `.md` file is still a credential.

Skip the redundant run on a merge commit. A PR that already ran `pull_request` checks does not need the same suite again on the merge commit unless the merge itself is the artifact you ship.

Do not run the same suite on both `pull_request` and `push` for the same branch. Pick one event. `pull_request` is the PR gate. `push` on the default branch is the post-merge gate. Running both on `feature/*` doubles minutes for no extra signal.

Once PR rate is high, use a merge queue. The queue tests the prospective merge once, then lands it. That replaces the pattern of "every PR rebased, every PR retested, then tested again on merge."

## Only run what changed

Use the task runner's affected-only filter against the base branch so untouched packages never build. `turbo run build --filter=...[origin/main]`, `nx affected -t build`, and the equivalent, all need a fetch deep enough to see the merge base (`fetch-depth: 0` or a shallow fetch of the base ref).

This is the monorepo counterpart of collapsing jobs. Fan-out tax is paying install eight times. Affected-only is paying compile for eight packages when one file changed. Do both.

Compare against the merge base, not against the moving tip of the default branch. A long-lived branch compared to `origin/main` looks like it touched everything main landed since it forked.

## Sharding has a floor, and it is the fixed cost

Measured on a 3-way sharded suite: each shard took 207s wall, of which only 22 to 33s was test execution. The rest was checkout, dependency install and module loading. Every shard pays that fixed cost in full.

Adding shards multiplies the fixed cost and divides an already small number. Cut the per-shard fixed cost first, then shard further only when test execution dominates wall time.

## A remote cache is the cross-tier multiplier

A cache on one host does nothing for cloud runners. A shared remote cache (the task runner's remote cache on object storage you already pay for) makes every tier warm: the self-hosted host, the ephemeral VM, and a laptop running the same tasks.

Without it, the three-tier model leaks. Overflow jobs on ephemeral runners rebuild from zero while the host next to them has a hot `/opt/ci-cache`. Point `TURBO_REMOTE_CACHE` / `NX_SELF_HOSTED_REMOTE_CACHE` / the vendor remote-cache URL at the same bucket from every tier. Local `/opt/ci-cache` remains the first hit on the host. The remote cache is what the other machines see.

## Cache masking is a real hazard

A pipeline that passes only because of a cache hit can hide broken code until something busts the cache. Verify with one cache-busting run before trusting a green result.

A cache-bust is a run with the remote cache disabled, the local cache directory moved aside, or a dummy input that changes the task hash. Do it on the default branch on a schedule, and once on any change that touches toolchain versions, Dockerfiles, or task-runner config. The scheduled cold run is what makes a masked break show up on a known cadence instead of on an unrelated PR.

## Measure before optimizing

Billable minutes per run come from `GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing`. Job wall time and which runner served it come from the jobs endpoint (`GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`).

Billable minutes read zero once the work moved to self-hosted runners, so cost comparisons must use wall time. A self-hosted run that finishes in 90 seconds and reports `$0` is not free if it queued behind load average 30 for 30 minutes. Record `runner_name`, job `started_at` / `completed_at`, and host load, not only the timing endpoint's billable field.

Pull a sample of recent runs before changing labels. If the long pole is already a 40-second lint job on a warm host, collapsing jobs will not change how PRs feel. If the long pole is eight serial checkouts, it will.

## Measure two numbers, never one

Track two numbers. Never collapse them into one.

- **Latency** - wall clock, run created to last job finished, queue included. What a person waiting on a PR feels.
- **Machine seconds** - sum of each job duration. What metered runners bill.

They move independently. Collapsing job fan-out cuts machine seconds and barely touches latency. Adding runners cuts latency and does not touch machine seconds. A single CI time number hides which one moved, so you cannot tell whether a change did what you thought.

One repo over one day of tiering:

```
BEFORE  latency_p50=1261s  p95=5316s  machine_p50=3752s
AFTER   latency_p50= 416s  p95=1192s  machine_p50=2488s
```

Latency fell 67 percent. Machine seconds fell only 34 percent. Most of the work moved tiers rather than disappeared. To cut machine seconds, add a cache. A different runner does not cut it.

## Cost comparison

Price per minute for a 2 vCPU Linux runner:

| Runner | Price per minute | Custody |
| --- | --- | --- |
| Vendor-hosted (GitHub-hosted) | about $0.008 | Vendor holds the checkout |
| Managed ephemeral cloud runners | about $0.0008, roughly ten times cheaper | Provider holds the checkout |
| Mid-tier providers | about $0.004, with a shared layer cache | Provider holds the checkout |
| Runners launched in your own cloud account | about $0.001 plus the instance | The checkout stays in your account |
| A host you already own | effectively free at the margin | The checkout stays on hardware you control |

Any third-party runner holds a checkout of private source. Only the run-in-your-own-account option, and the host you already own, avoid handing that checkout to someone else. Price is not the only column. If the repository cannot leave your account, skip the managed rows even though they are cheaper per minute.

Use the ephemeral cloud tier for burst and `services:` work anyway when the alternative is stalling the self-hosted host. Ten times cheaper than vendor-hosted is still the right overflow valve. It is not a reason to point a public repository at your desktop.

## Security invariants

- Never copy secret values onto a self-hosted host. The provider injects repository secrets into trusted self-hosted jobs. A secret that lives in a file on the host is a secret that survives the job and is visible to every later job on that runner.
- Never point a public repo at a self-hosted runner. A fork pull request would execute untrusted code on your hardware. Public repos stay on vendor-hosted or ephemeral runners that are destroyed after the job.
- Keep comment-triggered workflows vendor-hosted, because they execute text an attacker can supply. A persistent host with a warm checkout is the wrong place for `@bot do this`.
- Keep SARIF-upload scanners vendor-hosted. The upload step cannot resolve paths from a self-hosted workspace: it treats the runner home as the artifact root, and a workspace under `/opt/actions-runner` is not a child of that home.

The same split is in [self-hosted-runner-fleet](../self-hosted-runner-fleet/SKILL.md) under "Decide what moves." Follow it here when a cost change argues for moving a job that those rules leave hosted.
