---
name: dell-windows-host
description: "Operate the personal DELL-EPD31FF Windows and WSL2 host for repository-scoped GitHub Actions runners, remote development, and Crabbox static-host work. Use when a user asks to use, repair, extend, or verify the Dell Windows machine, its runners, Tailscale SSH, WSL, or Crabbox connection."
---

# Dell Windows Host

Use this host only for personal work. It is a persistent Windows desktop (i9-10900,
128 GB RAM, RTX 2070 Super) with Ubuntu in WSL2. Its GitHub Actions runners are
repository-scoped: one runner service per repository.

## Connect

Use the Tailscale address and the dedicated key. Native Windows OpenSSH runs
PowerShell as its default shell, so a remote command is PowerShell, not `sh`.

```bash
ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53
```

Run Linux commands through the default Ubuntu distribution. The WSL interactive user
is `pooria`. The CI service user is `actions`.

```bash
ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53 \
  "wsl.exe -d Ubuntu --user root -- bash -lc 'systemctl is-active <service>'"
```

Do not copy personal API keys or Mac credentials to the runner.

## Add a repository to the Dell runner fleet

GitHub personal accounts have no account-wide runner, so each repository needs its
own registration. Use the helper in `pooriaarab/agents-private`:

```sh
scripts/dell-actions-runner register pooriaarab/<repo>   # private pooriaarab repos only
scripts/dell-actions-runner status pooriaarab/<repo>
```

It installs `/opt/actions-runner/<repo>`, registers the runner as name
`DELL-EPD31FF` with label `dell-ci`, and starts
`actions.runner.pooriaarab-<repo>.DELL-EPD31FF.service`. The registration token is
short-lived and is never printed. Registration takes about 12 seconds per repository.

Then move only reviewed jobs to the runner:

```yaml
runs-on: [self-hosted, linux, dell-ci]
```

Move: build, typecheck, lint, unit tests, wrangler dry-runs, secret scans, and AI
review jobs whose GitHub secret already exists. GitHub injects repository secrets into
a trusted self-hosted job, so an AI review job keeps working with no local copy of any
secret.

Keep GitHub-hosted: deploy, release, publish, production smoke tests, desktop and iOS
builds, and any workflow whose runner must be macOS or Windows. Also keep hosted any
workflow that runs a prompt taken from comment text (for example a `@claude`
mention-triggered workflow) — a persistent trusted host is the wrong place to execute
attacker-suppliable instructions.

Repositories using the Dell today: `content-rabbit`, `offrouter`, `adscapi`,
`imecore`, `manorslop`, `pharmflow`, `usegeoaeo`, `agents-private`.

## One runner per repository means jobs queue

A repository's runner service runs one job at a time. A workflow set with three
Dell jobs runs them one after another, and a pull request that starts CI plus an AI
review waits. Registering a second service for the same repository under a different
runner name is the fix when a repository's queue gets long. Do not register two
runners with the same name.

## Keep WSL alive, or every job dies mid-step

WSL stops while idle even when its systemd services are enabled, and a stopped WSL
kills any job that is running. Two things hold it up; both must exist:

- `C:\Users\poori\.wslconfig` with `[wsl2]` / `vmIdleTimeout=-1`, so the VM does not
  stop when its last client exits. A `.wslconfig` change needs `wsl.exe --shutdown` to
  apply, which kills running jobs — only do it while the runners are idle.
- A scheduled task holding `wsl.exe -d Ubuntu --user actions -- bash -lc "exec sleep
  infinity"`. `Content Rabbit WSL Keepalive` does this but has `LogonType=Interactive`,
  so it only fires when `poori` logs on to Windows — and the Dell normally has no
  session at all (`quser` returns nothing). `Dell CI WSL Keepalive` runs the same action
  at Windows startup with `LogonType=S4U`, which needs no logon and no stored password.
  Keep both tasks.

Symptoms of WSL dying under a job, all of which mean "re-run the run", not "debug the
workflow":

- A job whose steps are `Set up job` and `Checkout` success and every later step `null`.
- A run stuck in `queued` while the runner looks idle.
- `gh api .../actions/runners` reporting `offline busy=true`, with `A session for this
  runner already exists` and `Runner connect error: Error: Conflict` in the journal —
  GitHub still holds the dead session, so the restarted runner cannot reconnect yet.

Verify all three states before routing a workflow, and after any Windows restart:

```bash
gh api repos/pooriaarab/<repo>/actions/runners \
  --jq '.runners[] | {name,status,busy,labels:[.labels[].name]}'

ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53 \
  "wsl.exe -d Ubuntu --user root -- bash -lc 'systemctl list-units --type=service --all | grep actions.runner'"

ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53 \
  "powershell.exe -NoProfile -Command \"(Get-ScheduledTask -TaskName 'Content Rabbit WSL Keepalive').State\""
```

If a runner is offline, check the scheduled task first, then the systemd service and
the runner journal.

## Crabbox static host

Crabbox 0.46.0 is installed on the Mac and the Dell. The Dell is a static SSH host:
Crabbox never provisions or cleans it up.

The Mac config is `$HOME/.config/crabbox/dell-wsl.yaml`; keep it mode `0600`. The
filename is historical and misleading — the profile is native Windows mode
(`windows.mode: normal`), host `100.76.117.53`, Windows user `poori`, work root
`C:\Users\poori\crabbox`.

What works: `crabbox doctor` and `crabbox warmup` (a lease in under one second, since
the host is always up).

What does not work: a synced `crabbox run` on a **private** repository. It fails with
`align remote Git metadata: exit status 1`.

The cause is a Git credential problem on the box, not a network or path problem. After
syncing, Crabbox verifies the workspace by fetching the target commit from the repo's
origin **on the box**, and it neutralizes Git's credential helpers while doing so
(`GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`, and `credential.helper=` on the command
line). The Dell's credential (`credential.helper=store`, token in
`C:\Users\poori\.git-credentials`) is therefore not visible to that fetch. Reproduce
the difference on the box:

```powershell
cd "C:\Users\poori\crabbox\dell-epd31ff\<repo>"
$env:GIT_TERMINAL_PROMPT=0
git fetch --no-tags https://github.com/pooriaarab/<repo>.git "+refs/heads/main:refs/crabbox/probe"   # exit 0
$env:GIT_CONFIG_GLOBAL="NUL"; $env:GIT_CONFIG_SYSTEM="NUL"
git -c credential.helper= fetch --no-tags https://github.com/pooriaarab/<repo>.git "+refs/heads/main:refs/crabbox/probe2"
# fatal: could not read Username for 'https://github.com' — exit 128
```

A repository-local helper (`git config --local credential.helper store`) survives
`GIT_CONFIG_GLOBAL=NUL` but not the command-line `credential.helper=` reset, so it does
not fix the Crabbox path either. Both remaining routes need a browser step, so do not
attempt them silently:

- Add an SSH key from the Dell to the GitHub account (`gh auth refresh -s
  admin:public_key` on the Mac, then `gh ssh-key add`) and make the box fetch over SSH.
- Fix it upstream in Crabbox, so the coherence fetch keeps a credential path.

Until one lands, do not describe Dell Crabbox runs as working, and do not point the
personal default (`crabbox-attach-personal.sh`, which pins
`$HOME/.config/crabbox/personal.yaml`) at the Dell profile: the worktree attach hook
performs a synced run.

Two side notes found while diagnosing:

- Git Credential Manager on the Dell prints `fatal: Unable to persist credentials with
  the 'wincredman' credential store` over SSH. The fetch still succeeds. Do not "fix"
  it by setting `credential.credentialStore=dpapi` — that makes Git hang on an
  interactive prompt instead, and the hung `git`/`git-credential-manager` processes
  must then be killed.
- Crabbox never deletes files from a static host. Clean a remote project folder only
  after confirming its exact path and branch state.

## Verification and lifecycle

Run a harmless command first. Monitor the GitHub Actions run to completion. Read review
feedback and fix real defects before merge. Use an isolated local git worktree for
every change. After merge, remove that worktree and run `git worktree prune` in the
main repository.
