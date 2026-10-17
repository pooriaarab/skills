# Worker logins on a Box

Checked on 2026-10-17 on Boxes made from `agent-roster-ready` with
`--environment agent-roster`. Judge each worker by `git diff`, not by exit code.

| Worker | On a Box | Notes |
| --- | --- | --- |
| Pi | Works | `--provider openrouter --model deepseek/deepseek-v4-flash-0731`. z.ai has no balance. |
| Devin | Works, then may hit the weekly quota | See "Devin" below. |
| Muse | Works only through the region proxy | See "Muse" below. |
| Cursor | Fails | The lazy installer cannot clear a root-owned folder. |
| Grok | Not installed | No `~/.grok` on the Box. |

## Check the environment before you blame the worker

A Box made from a repo environment (for example `private-repo-297b`) has no
agent logins. Only `agent-roster` carries them. A worker on a repo environment
exits clean and writes nothing. Run the worker from a Box made with both flags:

```sh
box new --from agent-roster-ready --environment agent-roster
```

Put a login in the environment with `box env set-file agent-roster <path>
--from <local file>`. The path is relative to the home folder.

## The box command drops quotes

`box exec <id> -- bash -c "ls -la ~/x"` runs only `ls`. The arguments are joined
and split again. Copy a script to the Box with `box scp`, then run
`box exec <id> -- bash /tmp/script.sh`. Every test before this fix looked
plausible and proved nothing.

## The shell prints the environment

The roster Box shell prints `declare -x` lines for every variable, tokens
included, on each login shell. Filter lines that start with `declare -x` from
any output you keep. Never run `bash -lc` and paste the result.

## Devin

- Set `~/.config/devin/config.json` to the same model as the laptop
  (`swe-2-max`). The Box config had `swe-1.7`, and its quota was gone.
- Unset `DEVIN_API_KEY`, `DEVIN_TOKEN` and `WINDSURF_API_KEY` for the call.
- A long run can still end with "weekly usage quota has been exhausted" on the
  Box while the laptop with the same login works. The cause is unknown. Pull the
  work back as a patch (`git add -A && git diff --cached --binary origin/main`)
  and finish on the laptop.

## Muse

Meta lists Muse models by region. The same key lists every model from Canada
and none from a Box in France (`GET https://api.meta.ai/v1/models` returns
`{"data":[]}`). `muse exec` then fails with "model ... does not exist or you lack
access".

- A file copy cannot carry the laptop login. It lives in the macOS Keychain
  (`storage: keychain`). `muse login` on the Box needs a person to approve a
  code at `auth.meta.com`.
- Send only Muse's hosts out of the laptop with `scripts/muse-geo-proxy box
  <box-id>`. It tunnels a port into the Box with `box forward --reverse`. Run
  Muse as `HTTPS_PROXY=http://127.0.0.1:18899 muse exec --trust-workspace ...`.
- The proxy allows three hosts and refuses all others. Do not widen the list.
  The Box must not use the home address for general traffic.

## Time limits

A Box stops one hour after it starts, even while a worker runs. The work stays
on disk. The worker process dies. Run `box extend <id> --hours 12` when you
start a long job.
