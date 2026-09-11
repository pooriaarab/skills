---
name: macos-scheduled-personal-data
description: "Run a scheduled job on macOS that reads TCC-protected personal data (iMessage, Safari, Screen Time, Mail, Reminders, Photos, Notes). Use when a launchd job gets 'authorization denied' or 'Operation not permitted' on files your terminal reads fine, when Full Disk Access appears granted but does not apply, when a glob over a protected directory silently returns nothing, or when re-signing an app revokes its permissions."
---

# Scheduled access to protected macOS data

A cron or `launchd` job that reads iMessage, Safari history, Screen Time,
Mail, Reminders, Photos or Notes will fail, even when the same command works
in your terminal. Everything below was measured on macOS 25.6, not inferred.

## The rule that explains every failure

**macOS attributes a Full Disk Access grant to the Mach-O image that opens the
file.** Not the app that started it. Not the script. The binary that calls
`open()`.

Interactive runs hide this, because your terminal already holds FDA and every
child inherits the attribution. The job only fails once launchd runs it with
no FDA-holding ancestor. So **testing by hand proves nothing.** Always test
through `launchctl kickstart`.

## What does not work

Each of these was tried and measured:

| Approach | Result |
|---|---|
| `launchd` runs a shell script | `authorization denied` |
| App bundle whose `CFBundleExecutable` is a **script** | Denied. The kernel runs `/bin/bash`, so TCC sees bash |
| Compiled binary that `exec`s bash, which runs python | Denied. TCC sees `python3` |
| `AssociatedBundleIdentifiers` in the plist | No effect |

Granting FDA to the interpreter *does* work, and is a trap. The grant lands on
the resolved binary — `/opt/homebrew/Cellar/python@3.14/3.14.7/...` — so the
next `brew upgrade` silently breaks it. Two Cellar versions commonly coexist,
so this is a when, not an if. It also hands every script on the machine full
file access.

## What works

**Put the privileged reads inside a compiled binary, and grant FDA to that.**

An app bundle whose main executable is a real Mach-O copies each protected
database into an unprotected staging directory, then `exec`s the ordinary
script with an env var pointing at the copies. The interpreter then reads
plain files and needs no privilege.

```
HPISync.app/Contents/MacOS/HPISync   <- compiled C, holds the grant, copies DBs
        |
        v  exec, HPI_STAGING=/tmp/hpi-staging
   sync.sh -> python -> reads /tmp/hpi-staging/chat.db   (no privilege needed)
```

One grant, on one signed binary, that never moves.

### Copy the `-wal` and `-shm` files too

SQLite keeps recent writes in the write-ahead log. Copy only the `.db` and you
lose them — which reads as "no new messages", not as an error.

```c
const char *sfx[] = {"", "-wal", "-shm"};
```

### A denied directory returns an empty glob, not an error

A `*.sqlite` glob over a protected directory returns `[]` when TCC denies it.
Code then reports "you have no reminders" instead of "I was not allowed to
look". Stage the directory and the ambiguity disappears.

## Re-signing revokes the grant

`codesign --force` changes the cdhash, and TCC keys the grant to it. The
Privacy pane still lists the app, with the toggle silently flipped **off**.

Check the real state rather than trusting the UI:

```sh
sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db \
  "select client, auth_value from access
   where service='kTCCServiceSystemPolicyAllFiles';"
# auth_value 2 = allowed, 0 = denied
```

**Build and sign once, then grant.** Every rebuild needs a re-grant, so say so
in the build script's output.

## launchd caches a job's executable

After replacing the binary, `kickstart -k` is not enough — the job keeps
failing with exit 126. Tear it down and recreate it:

```sh
launchctl bootout   "gui/$UID/com.example.job"
launchctl bootstrap "gui/$UID" ~/Library/LaunchAgents/com.example.job.plist
```

## launchd gives you a minimal PATH

`/usr/bin:/bin:/usr/sbin:/sbin`. A `command -v sometool` check then reports
"not installed" for a tool that is installed — a wrong cause, which is worse
than a plain failure. Export the real PATH at the top of the script.

## Give every step a wall-clock ceiling

macOS ships no `timeout(1)` and coreutils is often absent. An unattended job
that hangs is worse than one that fails, and it does not look stuck: one tool
here sat at **103% CPU with no database write for over two hours** because
another app held the store's lock. Every process view called it busy.

Roll the ceiling by hand, and report a timeout distinctly from a failure.

## Write a heartbeat, and read its timestamp

A job that stopped firing a month ago still reports its last success. Emit
`{ "ran_at": ..., "ok": ..., "steps": {...} }` after every run and check
`ran_at`, not just `ok`.
