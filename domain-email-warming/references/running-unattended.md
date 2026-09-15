# Running it unattended

A warm-up that only runs when someone remembers to run it is not a warm-up. The
ramp assumes a steady daily volume, and a three-day gap mid-ramp is a step
change in the wrong direction.

## Run hourly, not daily

`warm-tick.sh` is an hourly job, not a daily one:

```cron
0 6-18 * * * /path/to/scripts/warm-tick.sh /path/to/config.json /path/to/env >> /path/to/log 2>&1
```

`send` releases only the messages the ramp says are due, so each pass sends a
few and the day trickles out across a working window. A once-a-day invocation
would send the whole day in one burst and undo the spreading the ramp exists to
produce — sixteen messages leaving in the same second is a machine signature
whatever they say.

Every step is idempotent. A missed hour, a laptop that was asleep, or a retry
after a failure tops up from recorded state rather than duplicating.

## macOS: keep the credential out of ~/Documents

**This will silently break the whole program, and the symptom looks like
nothing at all.**

macOS TCC blocks `cron` and `launchd` jobs from reading `~/Documents`, even as
your own user. The job cannot source an env file there and dies with:

```
warm-tick.sh: line 23: /Users/you/Documents/.../creds.env: Operation not permitted
```

It fails in the log, not on your screen. The warm-up simply stops, and because a
stalled warm-up produces no error anywhere you look, the first sign of trouble
is a domain that never warmed.

Keep the scheduler's copy of the credential under `~/.config`, which TCC does
not gate:

```
~/.config/domain-email-warming/<program>.env      chmod 600
```

Treat it as a second copy of the secret and rotate both together. The
alternative — granting cron Full Disk Access — is a far larger permission than
this job needs.

`~/.local/share` and `~/.local/state` are not gated either, so the toolkit and
its state are fine there.

## Verify under the scheduler's environment, not yours

Your shell has a full `PATH`, a loaded profile and TCC permissions the scheduler
does not have. A command that works when you type it proves very little about
whether cron can run it.

Reproduce the real conditions before trusting the schedule:

```bash
env -i HOME="$HOME" PATH=/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin \
  /bin/sh -c '/path/to/warm-tick.sh /path/to/config.json /path/to/env'
```

That is the run that found the TCC failure above. The same invocation from an
interactive shell succeeded, which is exactly why it was not noticed first.

## Check the log, not the crontab

A crontab entry proves a job is scheduled, not that it works. After the first
scheduled hour, read the log and confirm you see a preflight block and a `send`
line. An empty log means the job never fired; a log with one permission error
means it fired and died.
