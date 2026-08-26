---
name: dell-windows-host
description: "Operate the personal DELL-EPD31FF Windows and WSL2 host for repository-scoped GitHub Actions, remote development, and Crabbox static-host work. Use when a user asks to use, repair, extend, or verify the Dell Windows machine, its runner, Tailscale SSH, WSL, or Crabbox connection."
---

# Dell Windows Host

Use this host only for personal work. It is a persistent Windows desktop with
Ubuntu in WSL2. Its GitHub Actions runner is repository-scoped.

## Connect

Use the Tailscale address and dedicated key:

```bash
ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53
```

Run Linux commands through the default Ubuntu distribution. The WSL interactive
user is `pooria`. The CI service user is `actions`.

```bash
ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53 \
  "wsl.exe -d Ubuntu --user root -- bash -lc 'systemctl is-active <service>'"
```

Do not copy personal API keys or Mac credentials to the runner.

## GitHub Actions runner

The Content Rabbit pilot has these fixed values:

- Host and runner name: `DELL-EPD31FF`
- Repository: `pooriaarab/content-rabbit`
- Linux runner directory: `/opt/actions-runner/content-rabbit`
- Linux service user: `actions`
- Custom runner label: `dell-ci`
- Service: `actions.runner.pooriaarab-content-rabbit.DELL-EPD31FF.service`

Use `[self-hosted, linux, dell-ci]` only for safe CI and E2E jobs. Keep deploy,
publish, release, production, and secret-heavy jobs on GitHub-hosted runners.

WSL can stop while idle even if systemd services run. The Windows scheduled task
`Content Rabbit WSL Keepalive` must stay `Running`. It starts a WSL keepalive as
the interactive Windows user logs on.

Before routing a workflow or after a Windows restart, verify all three states:

```bash
gh api repos/pooriaarab/content-rabbit/actions/runners \
  --jq '.runners[] | select(.name == "DELL-EPD31FF") | {status,busy,labels:[.labels[].name]}'

ssh -i "$HOME/.ssh/content-rabbit-windows" -o IdentitiesOnly=yes -o BatchMode=yes \
  poori@100.76.117.53 \
  "powershell.exe -NoProfile -Command \"(Get-ScheduledTask -TaskName 'Content Rabbit WSL Keepalive').State\""
```

If the runner is offline, check the task first. Then check the systemd service
and runner journal. Do not register a second runner with the same name.

Each personal repository needs its own GitHub runner registration. GitHub does
not support one account-wide runner for personal repositories.

## Crabbox static host

Crabbox 0.46.0 is installed on both the Mac and Dell. Use Dell as a static SSH
host. It does not provision or clean up the Dell.

The personal Mac config is `$HOME/.config/crabbox/dell-wsl.yaml`. Keep it mode
`0600`. It uses Windows WSL2 mode, host `100.76.117.53`, Windows user `poori`,
and WSL work root `/home/pooria/crabbox`.

First run a non-mutating check:

```bash
CRABBOX_CONFIG="$HOME/.config/crabbox/dell-wsl.yaml" crabbox doctor --provider ssh
CRABBOX_CONFIG="$HOME/.config/crabbox/dell-wsl.yaml" crabbox warmup \
  --provider ssh --static-host 100.76.117.53 --static-user poori \
  --static-work-root /home/pooria/crabbox
```

Use Crabbox only after a small sync-and-command smoke passes. The static-host
provider never removes files, processes, or disk data from the Dell. Clean each
remote project folder only after you confirm its exact path and branch state.

## Verification and lifecycle

Run a harmless command first. Monitor the GitHub Actions run to completion.
Check review feedback and fix real defects before merge. Use an isolated local
git worktree for every change. After merge, remove the local worktree and run
`git worktree prune` from the main repository.
