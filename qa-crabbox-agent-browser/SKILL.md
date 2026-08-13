---
name: qa-crabbox-agent-browser
description: "Run user-like QA tests on a remote GCP VM via crabbox + agent-browser, capture WebM video as proof, pull artifacts back, post to PR. Headless Chrome inside a Linux VM — no desktop/VNC. Pairs with crabbox-worktree for the lease lifecycle and SA-key auth, and with [[multi-account-cli]] if you're swapping GCP projects. Use when wiring per-commit QA on a SaaS app where 'screenshots show it works' is the deliverable."
---

# qa-crabbox-agent-browser

**Activate** for: per-PR QA flows that need real browser behavior + video proof, GUI smoke tests in CI without a self-hosted runner, anywhere a script needs to "drive a browser like a user" on a remote VM and report back with screenshots/video.

**Not for**: API contract tests (use vitest/jest), accessibility audits (use axe directly), or visual regression-only flows (Percy/Chromatic do that cheaper than spinning a VM).

## The architecture in one diagram

```
┌────────────────────────┐                          ┌──────────────────────────────┐
│  Your laptop / CI box  │                          │   GCP VM (crabbox lease)     │
│                        │   1. crabbox warmup ───▶ │   Ubuntu 24.04                │
│                        │      (~60s, on-demand)   │   /opt/bun (baked)            │
│                        │                          │                              │
│                        │   2. crabbox run --sync  │   sync the repo here          │
│                        │      ──────────────────▶ │                              │
│                        │                          │   3. apt install nodejs npm   │
│                        │                          │      ffmpeg + chromium deps   │
│                        │                          │   4. npm i -g agent-browser   │
│                        │                          │      agent-browser install    │
│                        │                          │   5. agent-browser open       │
│                        │                          │      --args "--no-sandbox"    │
│                        │                          │      <app-url>                │
│                        │                          │   6. record → screenshot →    │
│                        │                          │      click @eN → record stop  │
│  9. open test.webm     │   7. --download or scp   │   → ~/smoke/test.webm         │
│     verify visually    │ ◀───────────────────────  │   → ~/smoke/*.png             │
│                        │                          │                              │
│                        │   8. crabbox stop  ────▶ │   VM deleted                  │
└────────────────────────┘                          └──────────────────────────────┘
```

Total per-test runtime once the box is warm: **~30s setup-free, ~3min cold from scratch**, **~$0.01 of GCP** at e2-standard-2 on-demand.

## Why not just use Playwright?

Playwright is the right tool when:
- You're already in a JS/TS monorepo with a `playwright.config.ts`
- You want fixtures, retries, parallelism, sharding out of the box
- Your CI is github-actions on github-hosted runners

Playwright gets awkward when:
- The agent doing the test is an LLM that should *react* to what's on the page, not follow a pre-recorded script — Playwright wants a deterministic script
- You want to share the test result as a 2-second GIF in Slack, not a 50-line HTML report
- You're spinning custom infra anyway (crabbox) so the "Playwright on github runners" path doesn't help

`agent-browser` fills the LLM-driven gap: snapshot the page, get refs (`@e1`, `@e2`, …), let the model decide what to click. Run `agent-browser skills get core` once — the snapshot+ref loop is the whole pattern. The CLI is a thin wrapper over CDP, no Playwright dependency.

## Setup recipe (cold box → ready-to-test, ~3 min)

The expensive parts are one-time per box. Bake them into the image (see "Image baking" below) for ~30s warm starts.

```bash
# On your laptop, with SA key sourced
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/crabbox-sa-key.json

# 1. Warm a regular GCP box (DO NOT use --desktop/--browser; GCP doesn't support it,
#    and we don't need it — agent-browser does its own headless capture).
crabbox warmup --provider gcp --type e2-standard-2 --ttl 1h --idle-timeout 1h \
  --market on-demand --keep
# → captures slug, e.g. "violet-shrimp"

# 2. Install everything on the box in one round-trip
crabbox run --id violet-shrimp --no-sync --shell '
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    nodejs npm ffmpeg \
    libnss3 libatk-bridge2.0-0 libdrm2 libgbm1 libgtk-3-0 libxss1 libasound2t64 \
    libxcomposite1 libxdamage1 libxrandr2 libxfixes3 libcups2t64 \
    fonts-liberation libxshmfence1 xdg-utils
  sudo npm install -g agent-browser@latest
  agent-browser install   # downloads Chromium ~150MB
'

# 3. Run a test + capture artifacts + ship them back in one command
crabbox run --id violet-shrimp --no-sync \
  --download "smoke/test.webm=/tmp/smoke/test.webm" \
  --download "smoke/01-home.png=/tmp/smoke/01-home.png" \
  --shell '
  mkdir -p ~/smoke && rm -f ~/smoke/*
  agent-browser open --args "--no-sandbox" https://<your-app-url>
  agent-browser wait --load networkidle
  agent-browser record start ~/smoke/test.webm
  agent-browser screenshot ~/smoke/01-home.png
  agent-browser snapshot -i | head -30           # inspect refs
  agent-browser click @e3                        # whatever ref matters
  agent-browser wait --load networkidle
  agent-browser screenshot ~/smoke/02-after.png
  agent-browser record stop
  agent-browser close --all
'

# 4. Stop the box (or keep it warm if you have more tests queued)
crabbox stop --provider gcp --target linux violet-shrimp
```

## GCP gotchas that bit us

1. **`crabbox warmup --desktop` returns `desktop/VNC is not supported for provider=gcp`.** Use headless agent-browser instead; you don't need a desktop session for WebM capture. (Hetzner/AWS/Azure support `--desktop` if you ever need a real X11 session.)
2. **Chromium needs `--no-sandbox` in VMs.** agent-browser hints at this when it fails, but it's a separate flag at launch: `agent-browser open --args "--no-sandbox" <url>`. Set once per session.
3. **`ffmpeg` isn't on the crabbox baked image.** agent-browser's WebM recorder uses it; without it you get `ffmpeg not found or failed to execute`. `apt install -y ffmpeg`.
4. **No Xvfb needed.** Headless Chromium runs without a display server; don't waste time installing X11.
5. **`gcloud auth activate-service-account` doesn't always persist across shell sessions on macOS.** Set `GOOGLE_APPLICATION_CREDENTIALS=...sa-key.json` inline per command, or export it in your shell rc. Don't rely on `gcloud config set account` alone.

## Pulling artifacts: `--download` beats scp

`crabbox run --download remote=local` ships files back in the same round trip as the command:

```bash
crabbox run --id <slug> --no-sync \
  --download 'smoke/*.webm=/tmp/smoke/' \
  --download 'smoke/*.png=/tmp/smoke/' \
  --shell '<your test commands>'
```

This is **strictly better than a second scp call** — saves SSH handshake overhead, atomically gates artifact pull behind command success, and the failure-bundle save-on-non-zero-exit is built in.

If you do need scp (e.g. interactive debugging), the SSH config crabbox writes is reusable:

```bash
crabbox ssh --id <slug>     # prints the full ssh command with keys + known_hosts
# extract and reuse for scp:
KEY="$HOME/Library/Application Support/crabbox/testboxes/<lease-id>/id_ed25519"
KH="$HOME/Library/Application Support/crabbox/testboxes/<lease-id>/known_hosts"
scp -i "$KEY" -o "UserKnownHostsFile=$KH" -P 2222 \
  'crabbox@<ip>:smoke/*' /tmp/smoke/
```

## The snapshot+ref loop (the agent-browser core pattern)

Don't try to write CSS selectors against unfamiliar UIs. Instead:

```bash
agent-browser open <url>
agent-browser wait --load networkidle
agent-browser snapshot -i           # interactive elements only, with @eN refs
# pick the ref that matches what you want — e.g. "button \"Sign In\" [ref=e86]"
agent-browser click @e86
agent-browser wait --load networkidle
agent-browser snapshot -i           # REFS RESET — re-snapshot before next interaction
```

**Critical:** refs go stale the moment the page mutates (navigation, click, modal open, autosave). `agent-browser skills get core` walks through this in detail; read it once before writing complex flows.

## Verifying the video on your end

The video file alone isn't proof — you (or your reviewer) need to *see* it. Two patterns:

**Animated GIF for Slack / PR comments:**
```bash
ffmpeg -i test.webm -vf "fps=2,scale=720:-1:flags=lanczos" -t 10 test.gif
# 5-10 sec, 720px wide, paste-able anywhere
```

**Frame extraction for the agent itself to verify:**
```bash
mkdir -p frames && ffmpeg -i test.webm -vf "fps=2" frames/f%03d.png
# the agent reads frames as images via its vision model and confirms
# "frame 1 shows home page; frame 8 shows the post-click destination"
```

The agent should **read at least two frames** (start, end) and assert that they match the intended scenario. Don't trust file-existence as proof — a 0-byte WebM passes `ls` but tells you nothing.

## Cost model (real numbers from a single test)

`e2-standard-2` on-demand: **$0.067/hr** = **$0.00112/min**. Storage for screenshots/video: negligible (~150 KB per test).

| Cadence | Box uptime/day | Cost/day | Cost/month |
|---|---|---|---|
| 1 test / day (10 min lease) | 10 min | $0.011 | **$0.34** |
| 10 tests / day, sequential, 2min each on warm box | 20 min | $0.022 | **$0.66** |
| 100 tests / day, batched on a single warm lease | 30 min | $0.033 | **$1.00** |
| Always-warm (24/7) test runner | 1440 min | $1.61 | **$48.26** |
| Smart: warm 8am–8pm weekdays, all tests run there | 240 min × 22 days | n/a | **~$5.90** |

**Verdict:** at any realistic per-commit cadence the GCP bill is **under $10/mo**. The 24/7 always-warm path is the only one that materially adds up.

## Optimization (in order of bang-per-buck)

1. **Bake into the golden image.** Add `nodejs npm ffmpeg libnss3 …` + `npm i -g agent-browser` + `agent-browser install` into your crabbox image bake (see crabbox-worktree skill, "Building the golden image"). Saves ~3 min per cold box. For 100 cold boxes/mo, saves ~$0.34.
2. **Reuse the warm-shared box.** If you already have a shared box up via `crabbox-warm-shared.sh`, run tests against it via `crabbox run --id <shared-slug>` — zero VM provisioning. Effectively free per test.
3. **Use the spot/preemptible market.** `--market preempt` is ~60% cheaper. Tests rarely run >5 min, so eviction risk is low. For 100 tests/mo, saves ~$0.40.
4. **Downsize.** `e2-medium` (4 GB RAM, $0.034/hr) handles agent-browser fine — half the cost. For 100 tests/mo: ~$0.50 vs ~$1.00.
5. **Skip the per-test box entirely** and run agent-browser locally where possible — only delegate to crabbox when you need the cloud-native scaling (multiple parallel commits) or hermetic environment.
6. **One lease, many tests.** Batch test scenarios into a single `crabbox run` invocation rather than warmup-stop-warmup. Each warmup costs ~60s of compute regardless of test length.

The cheapest **realistic** ops profile: bake the image with everything, reuse the warm-shared box for all per-commit tests, run on `e2-medium` with `--market preempt`. That's **single-digit dollars per month** for unlimited per-commit QA on a small team.

## End-to-end checklist when wiring this into a new repo

- [ ] `agent-browser --version` ≥ 0.27 on your laptop; `agent-browser skills get core` once
- [ ] crabbox SA key works: `gcloud auth list --filter="account~crabbox" --format="value(account)"` returns a hit
- [ ] Image bake includes `nodejs npm ffmpeg agent-browser` (or accept the 3min cold start)
- [ ] Test script lives in `<repo>/bin/qa-smoke.sh` (or `e2e/agent-browser/<scenario>.sh`)
- [ ] CI wiring (GitHub Action / equivalent) calls `crabbox warmup → run --download → stop` with the SA key from secrets
- [ ] PR comment template includes: passing/failing, link to fetched `test.webm`, animated `flow.gif` inline
- [ ] Failure mode: keep the lease alive on test failure (`--keep`) and surface SSH command for live debug
- [ ] At least one "agent verifies the video" step — frame extraction + LLM vision check

## Related skills

- `[[crabbox-worktree]]` — provisions the GCP VM, SA-key auth, image baking, the warm-shared cost-reduction pattern
- `[[multi-account-cli]]` — if your QA tests run across multiple GCP projects / accounts
- `[[eco-mode]]` — token-cost reduction when LLM agents drive the test flow (vs scripted)
