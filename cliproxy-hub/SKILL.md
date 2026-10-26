---
name: cliproxy-hub
description: Run one always-on CLIProxyAPI hub on the home Mac and point Claude Code and Codex on every other host at it (boxes, Grok bot host, Muse, Instinct, ChatGPT dots host). Load when a host needs Claude or Codex access without its own login, when the hub shows "token expired" or "unauthorized", when a client gets a 503 auth_unavailable, or when adding a seat. Based on Theo's CLIProxyAPI guide.
---

# CLIProxyAPI hub

One Mac holds every Claude and Codex login. Every other host calls that Mac over
Tailscale. Source guide: https://gist.github.com/t3dotgg/59a521d2ee8d70aaf90e280c175072af

Tool: `cliproxy-hub` in pooriaarab/scripts.

## Two hard rules

1. Claude seats run in Claude Code only. Codex seats run in Codex only.
   Do not point Grok bot, Muse, Instinct, or any other tool at the hub with a Claude
   or Codex seat. A host uses the hub by running Claude Code or Codex on it.
2. The hub is a home machine. Never a VPS or a datacenter host. Never serve
   other people's traffic with these seats.

The guide says a ban is possible. Tell the user this before you start.

## The hub

- Host: the home Mac. Service: `brew services` `cliproxyapi`, port 8317, bound to 127.0.0.1.
- Seats live in `~/.cli-proxy-api/*.json`. Secrets live in `~/Documents/Personal/.secrets`.
- `cliproxy-creds capture` snapshots the seats hourly (LaunchAgent).
- Tailscale fronts the hub. Run this in a real Terminal, not from an agent shell:
  `cliproxy-hub serve`. It needs HTTPS enabled in the Tailscale admin console.
- The Mac must not sleep. Run `sudo pmset -a sleep 0` or keep a `caffeinate -s` LaunchAgent.

Check health:

```sh
cliproxy-hub check
```

`/v1/models` lists models even when every seat is dead. Trust the `seats:` lines.
A client call to a dead seat returns `503 auth_unavailable`.

## Fix a dead seat

A seat dies when its refresh token expires or is revoked. First try the cheap repair:

```sh
claude-subs-resync            # Claude: re-read the Keychain, push to the hub stores
claude-oauth-to-cliproxy.sh   # copy the seats into ~/.cli-proxy-api
```

If `claude-subs-resync --check` shows `refresh=NO` for a seat, resync cannot repair that
seat. Other healthy seats do not change this. Log in again for each such seat, one at a
time, on the hub Mac:

```sh
cliproxyapi -claude-login -no-browser   # prints the URL
cliproxyapi -codex-login -no-browser    # Codex
```

Open the URL in the Chrome profile that matches the seat's email. Finish the browser
step. Then run `cliproxy-hub check` and confirm that seat shows `ok`.

Log in with the right profile. A wrong profile adds a duplicate seat for the wrong account.

## Point a client host at the hub

Every client host needs Tailscale on the same tailnet and a Claude Code or Codex install.

1. Put the hub URL and key on the host. Copy `CLIPROXY_API_KEY` from
   `~/Documents/Personal/.secrets/cliproxyapi.env` to a 0600 file. Never paste it in chat.
2. Run:

```sh
export HUB_URL="https://<mac>.<tailnet>.ts.net:8317"
export HUB_KEY_FILE=~/.hub-key
cliproxy-hub verify
cliproxy-hub client claude    # writes ~/.claude-hub/settings.json
cliproxy-hub client codex     # writes ~/.codex-hub/config.toml
```

3. Start the tools with the second config dir. The normal install stays unchanged:

```sh
CLAUDE_CONFIG_DIR=~/.claude-hub claude
CODEX_HOME=~/.codex-hub codex
```

Pass `--config-dir` or `--codex-home` to replace the normal config instead. The script
backs up the old file first.

## Hosts

| Host | Role | How it uses the hub |
|---|---|---|
| Home Mac | Hub | Runs `cliproxyapi`. Local tools keep their own launchers. |
| ascii.dev boxes | Client | `box-setup` installs the CLIs. Run `cliproxy-hub client` on the box. Tailscale must run on the box. |
| Grok bot host | Client | Run Claude Code or Codex on it through the hub. The bot's own Grok login stays separate. |
| Muse host | Client | Same as the Grok bot host. |
| Instinct host | Client | Same as the Grok bot host. |
| ChatGPT dots host | Client | Same as the Grok bot host. |

Boxes are cloud hosts. A client on a datacenter host is fine, because only the hub talks
to Anthropic and OpenAI. Do not log in to a seat on a box.

## T3 Code

T3 Code uses the CLI config of the machine that runs the provider. For Codex, choose
"Use existing CLI". "Continue with ChatGPT" does not use the hub.

## Verify from a client

```sh
cliproxy-hub verify
```

Expect `hub reachable: N models`. Then send one small request with each tool.
