---
name: claude-in-cloud-browser
description: "Use when an agent needs a real browser for a job (site QA, research across pages, screenshots, form flows, web E2E, store or listing checks) and the work should not load the local machine: Claude on the Messages API drives a cloud browser session (Ichabod: remote Firefox or Chromium over WebDriver BiDi or CDP), many sessions in parallel."
---

# Claude in a cloud browser

Claude does the thinking through the Messages API. A cloud browser does the clicking. The local machine
only runs a small loop, so ten browser jobs cost the laptop almost nothing.

**Use it for browser work:** QA a page or a preview, research across sites, take screenshots for a pull
request, walk a form flow, check a store listing, audit many pages at once.

**Do not use it for code work.** The cloud browser has no shell. Edits, builds and tests run where the
agent runs.

## Setup

Three environment variables. Keep the values in a secrets file and source them inside the command. Never
print them: a URL that holds the key is a credential.

| Variable | What it is |
|---|---|
| `ANTHROPIC_API_KEY` | The Claude API key for the account this work bills to |
| `ICHABOD_API_KEY` | The cloud browser API key |
| `ICHABOD_WS_URL` | The cloud browser API host, `wss://<host>`, with no path |

```bash
cd scripts && npm install
set -a; . <secrets file>; set +a
node run.mjs "<task>" <startUrl> [--chromium] [--max-steps 25] [--effort low] [--model claude-opus-5-5]
```

The run prints each step and a final report, and writes `runs/<time>/log.json` plus every screenshot.

## How the loop works

- Tools: `navigate`, `read_page` (URL, title, numbered controls, visible text), `click`, `type`,
  `screenshot` (returns an image block), `done`.
- The whole assistant `content` goes back into the history unchanged. Thinking blocks and the prompt cache
  both need an append-only history.
- `cache_control` at the top level caches tools, system and history. A two-site task reads about 5k cached
  tokens per step and finishes in 12 to 16 s.
- The server-side refusal fallback is on (`fallbacks: "default"`). Check `stop_reason` before reading
  content: `refusal` and `max_tokens` end the run with a reason.
- Page text is untrusted. The system prompt says so, and says not to enter passwords, buy or post unless
  the task says so.

## Parallel runs

Start one process per job and `wait` for all of them:

```bash
for job in a b c; do ( node run.mjs "<task for $job>" <url> > out/$job.txt 2>&1 ) & done; wait
```

## Limits found in real runs

- **Concurrency is capped.** 7 of 10 parallel sessions connected; the other 3 timed out at connect with
  `Browser.getVersion timed out`. Retry with backoff, or keep a queue of about 6.
- **Bot walls.** Some sites (npmjs.com for some sessions, claude.ai always) serve a Cloudflare
  "Just a moment..." page to automated browsers. Claude reports it; pick another source.
- **No localhost.** The browser cannot reach the machine that runs the loop. Tunnel a local server first
  (`cloudflared tunnel --url http://127.0.0.1:<port>`).
- **No extension pages.** If the provider starts Firefox without `-remote-allow-system-access`, BiDi
  cannot open or screenshot `moz-extension:` pages. An extension installs (BiDi `webExtension.install` with
  `{type: "base64", value: <zip>}`), but its own pages stay out of reach. To screenshot an extension page,
  render its HTML with `page.setContent` instead.
- **Rendering quirks.** Generic fonts such as `system-ui` render as monospace; put a named sans font first.
  Dark and light mode cannot be emulated; rewrite the `prefers-color-scheme` media queries for a capture.
  `crypto.subtle` is missing on `about:blank`; load an https page first.

## What not to do

- Do not drive `claude.ai` itself in the cloud browser: it is behind a bot check.
- Do not spend a work key on personal work, or the reverse. Pick the key for the account the work bills to.
