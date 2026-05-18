---
name: crabbox-worktree
description: "Offload per-worktree dev work (installs, builds, dev server) to a remote GCP VM via crabbox, so your laptop stays cool. Builds a custom GCP image with package-manager deps + node_modules baked in. Shared warm-box pattern gets time-to-ready from ~5–7 min cold down to ~15–20s warm. Integrates with superset.sh's setup/teardown hooks. Generic across any bun/pnpm/npm repo."
---

# crabbox-worktree

**Activate:** mention "crabbox worktree", "remote dev box", "offload bun install to cloud", or any time you're wiring crabbox into superset.sh worktree hooks for a JavaScript/TypeScript repo.

## When to use

You have a repo where the dev workflow eats laptop resources — `bun install` / `pnpm install`, Next.js dev server, tests, agent runs — and you want those running on a cheap cloud VM instead. You already use [superset.sh](https://superset.sh) git worktrees, and you want each worktree to attach to a remote crabbox VM automatically.

**Not for**: occasional one-shot remote commands. For those, `crabbox run -- <cmd>` directly is simpler than this skill.

## What this skill describes

A four-script pattern in your repo's `bin/` that hooks into superset.sh's `.superset/config.json` setup/teardown lifecycle:

| Script | When it runs | Purpose |
|---|---|---|
| `bin/crabbox-warm-shared.sh` | Manually, once | Provisions ONE long-lived GCP VM, writes slug to `<main-repo>/.crabbox-shared-slug` |
| `bin/crabbox-attach.sh` | superset setup hook | Attaches the new worktree to the shared box (or warms a fresh one if no shared slug) |
| `bin/crabbox-release.sh` | superset teardown hook | Stops the lease IF it's a per-worktree box; leaves shared box alone |
| `bin/crabbox-sweep.sh` | Manually or cron | Lists orphaned leases not claimed by any worktree's `.crabbox-slug` |

Plus a one-time **golden GCP image bake** that pre-installs the package manager, system deps, and `node_modules` so attach time drops from minutes to seconds.

## Time-to-ready phases

Numbers measured on `e2-standard-2` (us-central1) against a real Next.js + bun monorepo:

| Phase | Image contents | Attach TTR | Add'l cost |
|---|---|---|---|
| 0 | stock Ubuntu | 5–7 min cold | $0 |
| 1 | + apt deps + bun system-wide | 3–4 min cold | ~$0.25/mo image storage |
| 2 | + `node_modules` baked into `/opt/<repo>-node-modules` | ~150s cold | +~$0.30/mo |
| 3 | shared warm box, attaches reuse it | **~15–20s** | ~$35/mo for 24/7 box, or ~$15/mo with overnight shutdown |

Realistic floor on this design is ~10–15s — limited by SSH handshake, sync fingerprint check, and script-stdin upload. Sub-5s would require either a different remote-exec model (persistent agent on the box) or self-hosted SSH multiplexing.

## Architecture

### Activation gate (per-worktree)

`bin/crabbox-attach.sh` no-ops unless `<worktree-root>/.crabbox-enabled` exists (or `CRABBOX=1` env var). **Per-worktree, not per-repo** — a single repo-wide marker would activate every pre-existing worktree when superset re-fires setup hooks on terminal reconnect, spawning duplicate VMs.

### Concurrency lock

`mkdir`-based atomic mutex at `<worktree>/.crabbox-attach.lock` (portable; `flock` is Linux-only and the hook runs from macOS). Stale-locks are stolen after 20 min.

### Slug resolution

Priority order:

1. **Shared slug** at `<main-repo>/.crabbox-shared-slug` — if present and the lease is alive, attach with `--reclaim` so the lease's claim transfers from main-repo path to this worktree path.
2. **Per-worktree slug** at `<worktree>/.crabbox-slug` — recovered after a previous attach.
3. **Cold warmup** — new auto-named slug, recorded into `.crabbox-slug` for next time.

### Secrets that crabbox sync skips

crabbox uses `git ls-files --cached --others --exclude-standard` for its sync manifest, so gitignored secret files (`.env.local`, `credentials/`, etc.) **don't ship**. Handle them out-of-band:

```bash
# Inside the script, build a tarball of the gitignored secret paths
# (use tar -h to deref symlinks since setup-worktree.sh symlinks from main repo)
tar_b64="$(cd "$WORKTREE_ROOT" && tar -czhf - "${SECRET_PATHS[@]}" 2>/dev/null | base64)"

# Embed into a crabbox run --script-stdin that decodes on the remote
# (crabbox uploads the script to .crabbox/scripts/ on the box, no argv limit)
```

### Single-pass run for speed

After the warmup, do all post-warmup work (sync + secrets push + `node_modules` hydration + reconciling install) in **one `crabbox run --script-stdin`** instead of three sequential calls. Saves ~30s of SSH handshake / sync-fingerprint overhead.

### `node_modules` hydration via hard links

The golden image at v2+ ships `node_modules` baked under `/opt/<repo>-node-modules`. Hard-link into the worktree post-sync — `cp -al` is near-instant and uses no extra disk:

```bash
if [[ -d /opt/<repo>-node-modules && ! -d node_modules ]]; then
  mkdir -p node_modules
  cp -al /opt/<repo>-node-modules/. node_modules/
fi
```

### Skip `bun install` when lockfile unchanged

After hydrating, compare the worktree's `bun.lock` hash against the baked one. If they match and `node_modules` exists, skip the install entirely. Otherwise run `bun install --silent` to reconcile drift (fast — most packages are already linked).

```bash
LOCAL_LOCK_HASH="$(shasum -a 256 "$WORKTREE_ROOT/bun.lock" | cut -d' ' -f1)"
BAKED_HASH="$(sha256sum /opt/<repo>-bun.lock.baked | cut -d' ' -f1)"
[[ "$LOCAL_LOCK_HASH" == "$BAKED_HASH" && -d node_modules ]] && skip || install
```

## Building the golden image

Two-pass bake into the same GCP image family so future versions auto-roll:

```bash
# Pass 1 — base image: ubuntu-2404 + bun + apt prereqs
crabbox warmup --provider gcp --type e2-standard-2 --ttl 60m --idle-timeout 60m --keep
# (capture slug from output)
crabbox run --id <slug> --no-sync --shell '
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    unzip ca-certificates git build-essential python3 python-is-python3 pkg-config
  sudo mkdir -p /opt/bun
  curl -fsSL https://bun.sh/install | sudo BUN_INSTALL=/opt/bun bash
  sudo tee /etc/profile.d/bun.sh <<EOF
export BUN_INSTALL="/opt/bun"
export PATH="\$BUN_INSTALL/bin:\$PATH"
EOF
  sudo chmod +x /etc/profile.d/bun.sh
  sudo ln -sf /opt/bun/bin/bun /usr/local/bin/bun
  sudo apt-get clean
  sudo rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
'
gcloud compute images create <project>-base-v1 \
  --source-disk=<auto-named-disk> --source-disk-zone=us-central1-a \
  --project=<gcp-project> --family=<your-family> --force
crabbox stop <slug>

# Pass 2 — bake node_modules: warm a new VM from v1, sync repo, install, snapshot
crabbox warmup --provider gcp --type e2-standard-2 --keep
crabbox run --id <slug> --shell 'bun install && (cd apps/<your-app> && bun install)'
crabbox run --id <slug> --no-sync --shell '
  sudo mkdir -p /opt/<repo>-node-modules
  sudo cp -al node_modules/. /opt/<repo>-node-modules/
  sudo cp bun.lock /opt/<repo>-bun.lock.baked
  sudo chmod -R go+rX /opt/<repo>-node-modules
  sudo rm -rf /work/crabbox/*
'
gcloud compute images create <project>-base-v2 \
  --source-disk=<auto-named-disk> --source-disk-zone=us-central1-a \
  --project=<gcp-project> --family=<your-family> --force
crabbox stop <slug>
```

Pin the family in `~/Library/Application Support/crabbox/config.yaml`:

```yaml
gcp:
  image: projects/<gcp-project>/global/images/family/<your-family>
```

### Refresh strategy

The baked `node_modules` go stale as `bun.lock` drifts on `main`. Two options:

1. **Manual rebake** — re-run pass 2 when you notice the "bun.lock drifted" branch is firing often (the attach script logs it).
2. **Scheduled rebake** — GitHub Action that triggers on `bun.lock` changes to `main`, warms a box, rebakes pass 2, promotes to family.

## GCP gotchas

### Org policy blocks public SSH

Many corporate GCP orgs have `custom.restrictPublicSshAndRdp` that forbids firewall rules with `0.0.0.0/0` source. Fix: pin to your home IP in the user config:

```yaml
gcp:
  sshCIDRs:
    - <your-public-ip>/32
```

Your IP rotates → re-edit. Or use IAP-tunneled SSH (more complex, not covered here).

### No default VPC in managed projects

Org-managed projects often delete the default VPC. Create one explicitly:

```bash
gcloud compute networks create crabbox --project=<project> --subnet-mode=auto --bgp-routing-mode=regional
# Then set gcp.network: crabbox in config.yaml
```

### ADC expiration

Corporate Google Workspace accounts enforce reauth every ~16h on Application Default Credentials. The `crabbox warmup` call fails with `invalid_grant / invalid_rapt`. Fix loop:

```
gcloud auth application-default login  # ADC for SDK clients
gcloud auth login                       # CLI auth for gcloud commands (separate token)
```

Add a `gcloud auth application-default print-access-token >/dev/null 2>&1 || { echo "run gcloud auth application-default login"; exit 1; }` preflight at the top of attach.sh to fail fast with a clear message instead of mid-warmup.

## Shared warm box cost reduction

Default e2-standard-2 24/7 = ~$35/mo. Tactics:

- **Smaller VM**: `e2-medium` (4 GB RAM) = ~$25/mo. Workable for some dev servers, tight for big TypeScript projects.
- **Overnight shutdown**: gcloud cron stops the box at 8pm, the warm script re-warms at 8am. ~$15/mo for 8h × 5 days.
  ```cron
  0 20 * * * bash /path/to/bin/crabbox-warm-shared.sh --stop
  0 8  * * * bash /path/to/bin/crabbox-warm-shared.sh
  ```
- **Skip the always-warm box entirely**: stick with Phase 2 (image v2 only, per-worktree cold warmups). TTR ~2.5 min, cost only when you're actively working.

## Why the per-worktree model is wrong for most solo devs

Crabbox docs lean toward "lease, sync, run, release" — one box per workflow. Tempting to mirror that as one box per worktree. Reality:

- Cold provisioning every time you switch worktrees: 2.5–7 min wait per switch
- Multiple concurrent worktrees burn $0.07/hr each
- superset re-fires setup hooks on terminal reconnect → without flock, spawns duplicate VMs
- Hard isolation between worktrees rarely matters for solo dev

Shared warm box: 15-20s attach, predictable $35/mo cost, one place for state. Use per-worktree only when you genuinely need isolated environments (different secrets per worktree, etc.).

## Integrating with superset.sh

In `<repo>/.superset/config.json`:

```json
{
  "setup": [
    "$SUPERSET_ROOT_PATH/bin/setup-worktree.sh",
    "$SUPERSET_ROOT_PATH/bin/crabbox-attach.sh"
  ],
  "teardown": [
    "$SUPERSET_ROOT_PATH/bin/crabbox-release.sh"
  ]
}
```

`.gitignore`:

```
.crabbox-slug
.crabbox-shared-slug
.crabbox-enabled
.crabbox-attach.lock
```

Per-worktree opt-in: `touch <worktree>/.crabbox-enabled`. Default is no-op so contributors and CI are unaffected.

## End-to-end verification checklist

When wiring this into a new repo:

- [ ] `crabbox doctor` passes (broker may be missing for direct-provider mode — that's fine)
- [ ] `gcloud compute instances list` shows zero crabbox VMs at rest
- [ ] Bake v1 image → `crabbox-base-v1` appears in `gcloud compute images list`
- [ ] Smoke test: `crabbox run --provider gcp --type e2-micro --market on-demand --no-sync --ttl 20m -- echo ok` returns `ok` and auto-releases
- [ ] Bake v2 image with `node_modules` → smoke test from a worktree, verify `/opt/<repo>-node-modules` exists on lease
- [ ] Warm shared box → `bin/crabbox-warm-shared.sh --status` shows it ready
- [ ] Create a fresh superset worktree, `touch .crabbox-enabled`, run setup → attach completes in <30s
- [ ] Make a code change locally → next `crabbox run` syncs it (visible via `git diff` on remote)
- [ ] Remove the worktree → shared box stays up, per-worktree boxes are stopped, `crabbox-sweep.sh` reports zero orphans
- [ ] Idle for 30 min → shared box's `idleTimeout` doesn't auto-release because TTL is 23h, not 30m

## Related skills

- `[[eco-mode]]` for reducing remote-Claude token costs when agents run on the box
- `[[multi-account-cli]]` for managing multiple Google Cloud accounts if you flip between projects
