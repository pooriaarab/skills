---
name: self-hosted-runner-fleet
description: "Turn a spare always-on machine into GitHub Actions runners for your private repositories, one runner service per repository. Use when asked to cut Actions minutes or queue time, add a machine to a runner fleet, decide which jobs are safe to move off hosted runners, or debug a self-hosted runner whose jobs die, queue forever, or report offline while busy. Covers Linux hosts and Windows hosts running the runner inside WSL2."
---

# Self-hosted runner fleet

A spare desktop is usually faster than a hosted runner and costs nothing per minute. The
work is not installing the runner — that takes a minute. The work is knowing which jobs
may move, and which host details silently kill jobs.

Keep host specifics (address, SSH key, account names, service paths) in a private host
overlay, not in this skill and not in a public repo.

## Decide what moves

| Move to the fleet | Keep on hosted runners |
| --- | --- |
| build, lint, typecheck, unit tests, E2E without fixed-port containers | deploy, release, publish, production smoke |
| dry-run / plan / simulation jobs | anything needing a macOS or Windows image |
| AI review jobs whose repository secret already exists | workflows that execute a prompt from comment text |
| formatting bots that push back to a PR branch | jobs uploading SARIF through `gitleaks-action` (see below) |

Two rules worth stating plainly:

- **GitHub injects repository secrets into a trusted self-hosted job.** An AI review job
  keeps working with no secret copied to the machine. Never copy secret values to the host.
- **A workflow triggered by `@mention` in comment text runs attacker-suppliable
  instructions.** A persistent host with a warm checkout is the wrong place for that. Leave
  those hosted even though they look like "just another AI job".

Point the moved jobs at your label:

```yaml
runs-on: [self-hosted, linux, <your-label>]
```

For job placement and cost, see [high-volume-ci-optimization](../high-volume-ci-optimization/SKILL.md).

## Register one runner per repository

A personal GitHub account has no account-wide runner: registration is per repository. Do
each one the same way, from a script rather than by hand.

```sh
token="$(gh api -X POST repos/OWNER/REPO/actions/runners/registration-token --jq .token)"
# on the host, as a dedicated non-login service account:
install -d -o runner -g runner /opt/actions-runner/REPO
cd /opt/actions-runner/REPO
curl -fsSLO https://github.com/actions/runner/releases/download/v<VER>/actions-runner-linux-x64-<VER>.tar.gz
tar xzf actions-runner-linux-x64-<VER>.tar.gz && rm actions-runner-linux-x64-<VER>.tar.gz
./config.sh --unattended --url https://github.com/OWNER/REPO --token "$token" \
  --name <RUNNER_NAME> --labels <your-label> --work _work --replace
sudo ./svc.sh install runner && sudo ./svc.sh start
```

Never print the registration token. It is short-lived, but a log is forever.

When you script this, remember that `su` starts a fresh shell: variables from the calling
script are **not** visible inside `su ... -c "..."`. Inline the directory and the token at
the point where you build the remote command, or the runner installs into the service
account's home with an empty token and `config.sh` fails.

**One runner service runs one job at a time.** A pull request with three fleet jobs runs
them one after another. Register a second service for that repository, under a different
runner name, when its queue gets long.

## Match the hosted image, or jobs fail only on your host

Workflows are written against the hosted images, which carry current toolchains. Anything
your host has at an older version fails there and nowhere else. Real example: a host with
Node 20 broke every `wrangler` step, because `wrangler` requires Node 22 or newer, while
hosted images already ship 24. Check the host's `node`, `python`, `go`, and container
runtime against what the workflows assume before blaming the workflow.

## Windows hosts: the runner lives in WSL2, and WSL will stop

Run the runner inside WSL2 and treat the Windows side as the thing that keeps WSL up. A
stopped WSL kills any job mid-step, and the symptoms do not look like "WSL stopped":

| Symptom | Meaning |
| --- | --- |
| Job steps `null` after `Checkout` succeeded | WSL went down under the job |
| Run sits in `queued` while the runner looks idle | no WSL, so no listener |
| Runner API reports `offline busy=true` | GitHub still holds the dead session |
| Journal shows `A session for this runner already exists` and `Runner connect error: Conflict` | restarted runner cannot reclaim the session yet; it clears in a minute |

Two things hold WSL up, and you need both:

- `%USERPROFILE%\.wslconfig` with `[wsl2]` and `vmIdleTimeout=-1`, so the VM does not stop
  when its last client exits. A `.wslconfig` change needs `wsl.exe --shutdown` to apply,
  which kills running jobs — only do it while the fleet is idle.
- A scheduled task holding a WSL process open:
  `wsl.exe -d <distro> --user <runner-user> -- bash -lc "exec sleep infinity"`. Give it an
  **at-startup trigger** and principal `LogonType=S4U`, which needs no interactive session
  and no stored password. A task with the default `LogonType=Interactive` never fires on a
  headless desktop — check with `quser`; on a machine nobody logs into, it returns nothing.

Register the task without touching an existing one:

```powershell
$a = New-ScheduledTaskAction -Execute "C:\WINDOWS\System32\wsl.exe" `
  -Argument '-d <distro> --user <runner-user> -- bash -lc "exec sleep infinity"'
$p = New-ScheduledTaskPrincipal -UserId "<HOST>\<user>" -LogonType S4U -RunLevel Limited
$s = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName "CI WSL Keepalive" -Action $a `
  -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $p -Settings $s
```

Verify it holds: read WSL `uptime`, wait a few minutes with no SSH session attached, read
`uptime` again. If it climbed, the fleet survives idle.

Also useful on a Windows host: native OpenSSH may use PowerShell as its default shell, so
a remote command is PowerShell, not `sh`. Nested quoting breaks constantly — send a bash
script as base64 and decode it on the far side instead of fighting the quoting.

## Keep the runner disk off the OS drive

The runner's checkouts, caches, and build output all land inside the WSL2 distro's
virtual disk (`ext4.vhdx`). By default that disk sits on the OS drive under
`%LOCALAPPDATA%\Packages\...\LocalState`, and it only grows — WSL never shrinks it, even
after you delete files inside the distro. A fleet of per-repository runners fills the OS
drive within months (one real host: 22 runners, ~160 GB of `_work` checkouts, OS drive at
88 %). Put the distro on a data drive instead of fighting the OS drive:

```
wsl --manage <distro> --move D:\wsl\<distro>
```

The move shuts the distro down and copies the whole `ext4.vhdx`, so run it while the fleet
is idle. Every runner is a systemd service *inside* the distro, so they all move with it
and reconnect on the next boot — no re-registration.

Two failure modes before you run this on a busy host:

- **`--move` can hang on finalize.** It copies to the target, updates the registry
  `BasePath`, then deletes the source — and can wedge on that last step, leaving the disk
  on both drives with the OS-drive copy still present. Kill the stray `wsl.exe` processes,
  then, once the registry already points at the data drive, delete the old
  `LocalState\ext4.vhdx` yourself to reclaim the OS drive.
- **A stuck `wsl.exe` wedges the service.** Any wsl command (even `wsl -l -v`) issued while
  a move is mid-flight can leave the service in `StopPending`, and every later wsl call
  hangs. The Store build of WSL runs as the **`WSLService`** service, not the legacy
  `LxssManager` — restart *that* to clear it. Then cold-start the distro
  (`wsl --terminate <distro>`, then invoke it) so systemd boots and auto-starts the runner
  services; a plain `wsl -d <distro> -e ...` can enter without booting systemd, and then
  `systemctl` reports `Failed to connect to bus`.

## Known job that cannot move

`gitleaks-action@v2` scans fine on a self-hosted runner and then fails uploading
`results.sarif`: it resolves the artifact root from the runner's home directory, which is
not a parent of a workspace under `/opt/actions-runner`. The error reads `The rootDirectory:
/home/<user> is not a parent directory of the file: .../results.sarif`. Leave that job
hosted and say why in the workflow, so nobody re-moves it later.

## Remote-development tools are a separate problem

A synced remote-dev tool (Crabbox and similar) usually verifies the workspace it just
synced by fetching the target commit from the forge **on the host**, with Git's credential
helpers neutralized (`GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`, and `-c credential.helper=`).
On a private repository this fails even though a plain `git fetch` on that host succeeds,
because the host's stored token is invisible to that one command.

What does and does not survive the neutralization:

- A global or system `credential.helper`, or `url.<alias>.insteadOf` in global config: **no**.
- A repository-local `credential.helper`: survives `GIT_CONFIG_GLOBAL=NUL`, but not the
  command-line `-c credential.helper=` reset.
- SSH transport: **yes** — nothing about SSH depends on credential helpers.

So the fix is to make the host's fetch use SSH. A per-repository deploy key works but needs
a distinct key, host alias, and URL rewrite per repository; an account-level SSH key on the
host covers every repository at once. Adding an account key needs the `admin:public_key`
scope, which a normal `repo`-scoped token does not carry.

Do **not** "fix" the related Git Credential Manager noise on Windows
(`Unable to persist credentials with the 'wincredman' credential store`) by switching the
store to `dpapi`: the fetch then hangs on an interactive prompt instead of printing a
harmless warning, and you have to kill the stuck `git` and `git-credential-manager`
processes.

## Verify, then move on

Run a harmless command on the host first. Watch the first fleet run to completion rather
than assuming. Read review feedback before merging. Use an isolated worktree per change,
and remove it after merge.
