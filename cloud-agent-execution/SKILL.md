---
name: cloud-agent-execution
description: Run coding agents on a remote cloud VM instead of the laptop. Use on "run this in the cloud", "the laptop is overloaded", "offload the agent", "start a box", "cloud agent", or when a task drags in heavy worktrees, node_modules, or long builds. Covers the control-plane/execution split, verify-on-box, cost discipline, a GUI server on a box, and multi-harness routing.
---

# Cloud agent execution

Run the agent on a remote VM. Keep the laptop as a thin control plane. It starts
jobs, reads results, and steers. It does not host the work.

Related: for local worktree cleanup use the `worktree-hygiene` skill. Cloud
execution does not remove local worktrees.

## Tier split

- Laptop = control plane. Start jobs, read diffs, decide.
- Remote VM (a "box") = execution. Clone, edit, verify, patch.
- CI runner = tests on push. Separate from the execution tier.

Rule: heavy agent work goes to a box. Never put work or proprietary source on a
third-party box.

## Run one cloud task

Start a box, let the box-side agent clone the repo from origin, do the task, and
verify with `git status --short` and `git diff` ON the box — `git diff` alone
misses new files, since it does not cover untracked paths. Stage untracked
files (`git add -A`) before diffing or generating the patch, or the pulled
patch silently drops any file the agent created. Always stop the box, even on
failure. A wrapper tool does this in one command (see the implementation repo).

Managed providers bill the box's cloud credits, not your model subscription. That
is the point: cloud credits absorb the run.

## Verify on the box

Judge a delegated job on the diff, not the exit code. A clean exit with an empty
`git status --short` means the agent did nothing — an empty `git diff` alone is
not enough, since it hides new files. Read the diff every time.

## Cost discipline

- A box bills every second it runs. A stopped box is free. Nothing stops it for
  you.
- The real lever is not leaving boxes idle. The vendor rate is not the lever.
- Track spend over time. Snapshot the provider's usage/limits to a log and report.
- Warm a box on session start, reap it on session end. Add a TTL backstop for
  killed sessions. Run a periodic reaper that measures CPU and a heartbeat, not
  the box's reported state — an "idle" box can still be at full CPU.

## GUI server on a box

To steer many agents by eye, run the GUI server ON the box and reach it from the
laptop browser over a public host URL.

- Do NOT point a local GUI provider path at a box wrapper. The GUI server is the
  execution boundary; it reads git diffs off its own disk, so a wrapper that edits
  the box shows an empty changeset. Run the whole server on the box.
- Give the user systemd a bus first (enable linger). Over a headless exec, also
  export `XDG_RUNTIME_DIR` or `systemctl --user` fails.
- Run the server as a systemd user service, not a foreground process, so it
  survives an ssh disconnect. Bind `0.0.0.0`, not loopback.
- Expose the port with a PUBLIC host URL. A private, token-gated host makes the
  GUI client fail to fetch its environment endpoint.
- Mint a fresh pairing code against the running server. A service restart mints a
  new code and invalidates the old one.
- Treat the pairing code as a secret credential, not a convenience string: over a
  public host it is the only thing standing between an outsider and a server that
  runs arbitrary commands. Never log it, screen-share it, or paste it into a
  shared channel. Restrict the port at the network layer (security group or
  firewall IP allowlist) in addition to the pairing code wherever the provider
  allows it.

## Multi-harness

A box can host several agent CLIs. A managed "prompt" path may cover the
first-party ones with provider-managed auth. Other CLIs run as on-box tools and
need their own auth AND funding on the box. A key being present is not proof it is
funded — preflight loudly and report which providers are ready.

## Guards

- Personal or non-sensitive repos only on a third-party box.
- Never `rm -rf` a worktree. First confirm it is a LINKED worktree — its gitdir
  path contains `/worktrees/`. A main clone's does not. Deleting a main clone
  destroys the repo.
- A box may print its full injected environment (tokens included) on a
  non-interactive `bash -c` that sources a login profile. Never pipe such output
  to a shared log. Run a script file instead; it does not source the profile.
