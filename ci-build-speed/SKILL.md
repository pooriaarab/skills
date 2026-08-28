---
name: ci-build-speed
description: "Make a slow CI pipeline fast and reliable for a JS/TS monorepo (Next.js + bun + Turborepo on GitHub Actions, deployed via a separate build like Netlify) — profile to find the critical path (usually the production build, not lint/test), then cache everything, fix build OOM, dedup builds, and shard tests. Use when CI is slow, PR checks take forever, the build OOMs/times out, or before throwing bigger runners / remote cache at CI."
---

# ci-build-speed

The headline lesson: **profile before you optimize.** Most "CI speedups" target jobs that aren't on
the critical path and so don't change wall-clock at all. Find the long pole first — in a Next
monorepo it's almost always the **production build** — and spend there.

## When to use this

**Trigger if:** CI wall-clock is painful, the build job flakes/OOMs, or you're about to throw money
(bigger runners) or infra (remote cache) at CI without knowing where the time actually goes.

**Don't bother if:** CI is already a few minutes and green — micro-optimizing a fast pipeline is
the same critical-path mistake in miniature.

**Go to [ci-speed-diagnosis](../ci-speed-diagnosis/SKILL.md) first if the caching below is already
in place and CI is still slow.** A configured cache that never hits reports green, so the levers
here read as "already done" while doing nothing. That skill is the entry point for the whole CI
family and routes to the rest.

**Go to [e2e-ci-economics](../e2e-ci-economics/SKILL.md) if the long pole is a browser E2E job.**
The levers below are for the build. An E2E leg has its own rules — it cannot be cached, and the
first question is whether it gates anything at all.

## Step 0 — Profile. Find the critical path. (Do this FIRST, always.)

Pull real per-job timings, not vibes:

```bash
gh run view <run-id> --json jobs \
  --jq '.jobs[] | "\(.name): \(.startedAt) -> \(.completedAt)"'
```

Jobs run in **parallel**, so **wall-clock = the single longest job (+ anything serial after it)**,
not the sum. Write the timings down. In a Next monorepo the long pole is nearly always the
**production build** (a big webpack/SWC compile). Lint, typecheck, and tests usually finish well
inside the build window — speeding them up saves **CI minutes (cost)** but **not wall-clock**.

Keep this distinction explicit for every lever below: *does it shorten the critical path, or just
save runner-minutes?* Both are valid goals — but don't claim a wall-clock win when you bought a
cost win.

## The levers, ranked by leverage

### 1. Cache everything (biggest safe win; near-zero risk)
Most slow pipelines have **no caching** — every job reinstalls and every build compiles cold. Add,
keyed on the lockfile (and source where relevant):

- **Package-manager store** — `~/.bun/install/cache` (bun), `~/.npm` (npm), keyed on the lockfile.
- **`node_modules`** — exact lockfile key (no restore-keys) so a lockfile change forces a clean install.
- **Framework incremental build cache** — `.next/cache` (Next webpack), keyed on lockfile + source
  hash with a lockfile-only restore-key fallback. **This is the biggest build-time lever** — webpack
  reuses module compilation across runs (warm builds can be ~2× faster than cold).
- **Task-runner cache** — Turborepo's `.turbo`, keyed `…-${{ github.sha }}` with a prefix restore-key.

Factor the install into one **composite action** every job reuses, instead of copy-pasting
checkout+setup+install across N jobs.

> **CRITICAL gotcha — the cache can't self-seed if the build OOMs.** A build that gets OOM-killed
> takes the whole runner VM down (see lever 3), so an `actions/cache/save` step — even with
> `if: always()` — never runs, and the framework cache never seeds. The cache only starts helping
> *after the first build that completes*. Fix the OOM (lever 3) first, or caching is theoretical.

> **CRITICAL gotcha — an incomplete cache key poisons the cache permanently, not once.**
> `next.config.ts` is a webpack build dependency. Leave it out of the cache key and a PR that
> only touches it gets an exact primary-key hit on a now-stale cache, so webpack reads its
> build dependencies, sees the config changed, and discards the pack for a full cold compile —
> while the save step (correctly gated `if: cache-hit != 'true'`) skips, because the key still
> looks like a hit. The stale entry stays pinned under a key every later run matches exactly,
> until some unrelated commit happens to touch a file the key **does** cover. Measured: 326–421s
> across ten runs, then 605–689s across three, with no recovery path in between. **Every input
> the tool treats as a build dependency belongs in the cache key** — the save gate is correct;
> only an incomplete key turns it into a trap.

### 2. Build once (kill duplicate full builds)
Pipelines accumulate **two** full builds — e.g. a "build" job and a "deploy-simulation" build that
mirrors the host (Netlify) exactly. A full build is the most expensive thing in CI; running it twice
is pure waste. **Collapse to one.** Keep the **deploy-mirror** build (the one that installs the way
the host does) — it catches prod-only breaks (workspace-resolution gaps a root-install build hides);
drop the redundant one. Fold any post-build check (bundle-size budgets) into the same job so there's
no artifact upload/download round-trip.

**Deleting a step is not the same as deleting the work.** One deploy workflow ran an explicit
build step nothing consumed; removing it saved under a second, because the deploy task carried
`dependsOn: ["build"]` and the task runner ran it anyway. Check the task graph before you delete
a step — the redundancy may be the dependency, not the step.

### 3. Fix the build OOM (the subtle, high-value one)
Large Next apps OOM during **"Collecting page data using N workers"** — the static-generation phase
that spawns N worker processes, each loading the full compiled app on top of the main process's
large heap. Symptoms: `SIGKILL` / `exit 143` / "the runner has received a shutdown signal." The
levers, in order:

- **Cap the page-data workers.** Next's `experimental.cpus` sets the worker count. BUT
  **`experimental.memoryBasedWorkersCount: true` OVERRIDES `cpus`** and scales the count to *available
  RAM* — so a config tuned to `cpus: 1` for a small deploy container silently spawns **4 workers on a
  bigger CI runner** (GitHub `ubuntu-latest` is 4-core/16GB) and re-trips the OOM. Gate
  `memoryBasedWorkersCount: false` behind a **CI-only env var** so CI forces a single worker while the
  prod/deploy build keeps RAM-based scaling. (Verify the *actual* worker count in the log — "using N
  workers" — don't trust the config.)
- **Add swap.** Even one worker + the main heap can exceed the runner's RAM at the brief page-data
  peak. A swapfile lets the peak spill to disk so the build **completes** (slightly slower under
  paging) instead of dying. Use low `vm.swappiness` (≈10) so steady-state stays on RAM — swap is a
  safety margin, not a speed change. The runner ships a small active `/swapfile`: `swapoff -a` first,
  and place the new file where there's **free disk** (the small root `/` may fail "No space left";
  the temp disk has more — and once caches/node_modules are restored, *free preinstalled toolchains*
  you don't use, e.g. `dotnet`/`android`/`ghc`/`CodeQL`, to make room).
- Already-standard knobs to confirm on: `experimental.webpackMemoryOptimizations: true`, in-build
  type-checking disabled (`typescript.ignoreBuildErrors` — move type safety to a separate typecheck
  job), browser source maps off in prod.
- **Don't chase the wrong cause.** A stale config comment may blame a specific heavy dependency
  ("the crypto SDK graph"). **Verify before acting** — grep for *static top-level* imports of the
  named dep. If it's already lazy (`await import()`), it's a red herring; the real cause is the
  build's inherent peak memory, fixed by worker-cap + swap, not by lazy-loading something already lazy.

### 4. Concurrency: cancel superseded PR runs
```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```
Cancels stale runs when a PR is re-pushed; **never** cancels push-to-main (don't gate on a non-PR
event). Pure CI-minute savings.

### 5. Merge tiny jobs (cut runner spin-ups)
Each separate job re-pays checkout + install overhead (often ~2 min). Fold trivially-related jobs
(format → lint; the several functions/package sub-jobs → one job that installs once and runs the
steps sequentially). Off the critical path, so wall-clock-neutral — but fewer runners = lower cost
and less queue contention.

### 6. Shard / affected tests (mostly a cost lever — read the caveats)
Sharding (`vitest --shard=i/n` in an N-way matrix) parallelizes the suite. Affected-only
(`vitest --changed <ref>`) runs only tests the diff touches on PRs, keeping the full suite on
push-to-main as the safety net. **But** tests are usually **off the critical path** (parallel to the
build) so this saves CI minutes, not wall-clock — and `--changed` is fragile:

- **Diff against the merge-base, not the moving base ref.** `--changed origin/main` on a stale branch
  flags everything that changed on main since branch-point. Use
  `--changed "$(git merge-base origin/<base> HEAD)"`.
- **Codegen pollutes it.** If a pre-test step regenerates committed files (an action/route index), the
  working tree is dirty and `--changed` flags every importer. Skip the regen on the affected path (the
  committed generated files are already valid + drift-guarded); regenerate only on the full push run.
- Needs `fetch-depth: 0` so the diff base is reachable — which itself costs time on repos with many
  branches. Add `--passWithNoTests` (empty shards are legitimate).
- **Honest verdict:** marginal — small PRs win a little, large PRs win nothing and pay the
  `fetch-depth: 0` tax. Ship only if CI-minute cost genuinely matters; otherwise skip.
- **A browser E2E suite shards differently.** Do not raise the worker count to avoid a shard — two
  workers share one dev server and one database. See
  [e2e-ci-economics](../e2e-ci-economics/SKILL.md).

### 7. Dev-velocity wins (separate from CI, often higher daily payoff)
- **Turbopack for `next dev`** (`next dev --turbopack`) — ~5–10× faster HMR/cold-start. The
  Turbopack *build* may be unusable (it can duplicate SSR chunks and blow a serverless size/memory
  limit — verify the upstream issue before trying), but that's a *prod-output* problem; **dev is
  safe**.
- **Skip codegen when inputs are unchanged.** Wrap each codegen step (action/index/manifest
  generators) in a content-hash gate (mirror the framework's own asset-version short-circuit): hash
  the inputs to a gitignored sidecar, skip if unchanged, and make the heavy import dynamic so the skip
  path never loads it. `--force`/env override to bypass.
- **A warm remote dev box** (if you have one) for installs/builds keeps the laptop light.

### 8. Task-runner remote cache (local-dev + cost win — NOT a CI wall-clock win, usually)
A shared Turborepo remote cache (self-hostable on object storage + a small always-/scale-to-zero
service) makes `turbo run build/lint/typecheck/test` a cache hit across CI, laptops, and dev boxes
when inputs match. Real per-hit gain (minutes). **But two big caveats:**
- It only caches tasks **run through the task runner**. If the production build runs **outside**
  turbo (e.g. the deploy host's own `build` command), turbo never sees it → **the critical-path build
  is not cached.**
- Hits require **identical inputs incl. env**. CI's dummy public env keys won't match a real local
  env, so CI-built artifacts won't hit locally. And the everyday "edit code → rebuild" loop always
  misses (input changed). Hits land mostly on branch-switch / rebase-onto-built-commit / CI re-run.
- So it's primarily a **local-dev/cross-machine + CI-cost** play, not a CI-wall-clock play. Scope the
  expectation before paying for infra.

### 9. Bigger runner (the only remaining CI wall-clock lever, once the above is done)
When the build is cache-optimized and still the floor, a larger hosted runner (more cores/RAM) cuts
compile roughly linearly and removes swap paging. It costs per-minute and needs org enablement —
spend here only when build wall-clock is genuinely painful and the free levers are exhausted.

## Cross-cutting gotchas (each cost real time to learn)

- **`timeout` doesn't exist on macOS** (it's `gtimeout` from coreutils). A `timeout`-wrapped loop in a
  local script silently fails every iteration. Don't wrap cleanup/removal in `timeout` on macOS.
- **Squash-merge is invisible to `git branch --merged`.** Squash creates a new commit, so the branch's
  commits aren't ancestors of main. To find safely-deletable branches/worktrees, query merged-PR head
  names (`gh pr list --state merged --json headRefName`) and match — not `--merged`.
- **OOM kills the VM, not just the step** → `if: always()` save steps don't run. Fix the OOM before
  relying on a post-failure cache-save.
- **Verify stale config comments before acting on them** — a comment naming the OOM cause may be
  outdated; confirm with a grep. (We chased an "already-lazy crypto graph" red herring for a while.)
- **Don't merge a PR before its fix commit lands.** If you push a fix and the PR is squash-merged
  immediately, a follow-up commit on the same branch is stranded and never reaches main.

## What "done" looks like (measured, illustrative)
A representative before/after on a large Next + bun + Turborepo monorepo:

- **Before:** ~16 min wall-clock; the build chronically OOM-**failing** (red for days); zero caching.
- **After:** build **green and reliable**; non-build jobs faster (cached installs everywhere; unit
  tests ~10 min → ~5 min sharded ×3); warm-cache builds faster than cold; PRs cancel-on-superseded;
  Turbopack dev ~5–10× HMR; codegen skipped when unchanged.
- **The honest ceiling:** wall-clock is floored by the build (~10–12 min webpack compile). Turbopack
  build can't help (OOM), incremental `.next/cache` is in, in-build tsc is off — the only further
  wall-clock lever is a bigger runner. Most non-build work saves **cost**, not wall-clock. Know which
  you're buying.

## Reference order (the playbook)
1. **Profile** → find the critical path (usually the build).
2. **Cache** (pm store, node_modules, framework build cache, task-runner) — but fix OOM first or it can't seed.
3. **Fix the build OOM** (worker-cap via CI-gated `memoryBasedWorkersCount:false`, swap, free disk).
4. **Build once** (dedup; keep the deploy-mirror build).
5. **Concurrency cancel** for PRs.
6. **Merge tiny jobs.**
7. **Shard/affected tests** — only if CI-minute cost matters (read the caveats).
8. **Dev velocity** (Turbopack dev, skip-codegen) — high daily payoff, separate from CI.
9. **Remote task cache** — for local/cost, not CI wall-clock.
10. **Bigger runner** — last, paid, the only remaining wall-clock lever.

---

## Security — CI runners only, never your machine

The swap / `swapoff` / `vm.swappiness` tuning and toolchain-removal steps are scoped to **ephemeral, disposable CI runners** (GitHub-hosted Actions VMs destroyed after the job). Never run them against a developer machine or a persistent / self-hosted runner — they modify system state and free disk by deleting preinstalled toolchains. The `sudo` they use is the runner's own throwaway environment.
