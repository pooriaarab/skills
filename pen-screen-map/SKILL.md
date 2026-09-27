---
name: pen-screen-map
description: Map a running web app's real UI into editable pen.dev .pen files — screenshot every route (including auth-gated pages via test fixtures), feed each capture to the pen CLI, and produce a reviewable design set plus previews. Use when the user wants "the real screens in pen", a design inventory of an app, or .pen recreations of existing pages to review/edit.
user-invocable: true
argument-hint: "<app-dir> (defaults to current repo)"
---

# pen-screen-map — real app UI → editable .pen designs

Produce one `.pen` file per screen of a web app so the user can review and edit the
actual shipped UI in Pen.app — not wireframes, the real thing.

Pipeline: run app locally → screenshot every route → `pen --prompt-file` recreates
each shot → minified `.pen` committed, previews attached to the PR.

## Prerequisites

- `pen` CLI installed and logged in (`pen status` → Active).
- A working agent backend. On this fleet use the subscription gateways —
  **do not** call bare `pen` (the keychain Claude credential is stale):

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8317      # CLIProxyAPI, brew service, live Claude seats
export CLAUDE_CODE_OAUTH_TOKEN=cpa-30f043ef20f140bec2de4ebc020c2c13bea6fcd6b02a5056
# or OffRouter: ANTHROPIC_BASE_URL=http://127.0.0.1:8789 CLAUDE_CODE_OAUTH_TOKEN=offrouter-dev
```

- Models: `claude-opus-4-8` / `claude-sonnet-5` work through the proxy;
  `claude-opus-5-5` is upstream-gated and fails.
- Playwright available in the repo (or `bunx playwright`).

## Step 1 — enumerate the route surface

List real routes, not guesses:

- Next.js App Router: `find <app>/app -name "page.tsx" | grep -v node_modules`
- Other stacks: read the router config / route table.
- Pick ONE representative per dynamic segment (`/templates/[slug]` →
  `/templates/local-service`); note the others exist in the manifest.
- Skip pure dev/test pages unless the user wants them.

## Step 2 — start the app locally

Whatever the repo's local preview is — `bun run dev`, `next dev`, `wrangler dev`,
`opennextjs-cloudflare preview`. Wait for the ready line and record the origin.

**Port collisions:** check `lsof -iTCP:<port> -sTCP:LISTEN` first. Local
proxies (CLIProxyAPI 8317, OffRouter 8789) are the usual squatters — move the
proxy, not the app, when the app's port is baked into auth config.

## Step 3 — capture with real auth where possible

Public routes screenshot fine anonymous. Auth-gated routes need a real session —
look for the repo's own test fixtures before giving up:

- yaya pattern: `POST /api/auth/test-only/magic-link` mints a session for
  `*@example.com` when `AUTH_MAGIC_LINK_TEST_CAPTURE=true` is in the worker's
  `.dev.vars`, then seed a tenant row directly in local D1
  (`tests/e2e/helpers/d1-tenant-seed.ts`: `seedTenantWithOwnerInD1`,
  `userIdForEmail`). Reuse the same helpers the e2e suite uses.
- Capture waits: `domcontentloaded` + `waitForLoadState("networkidle", 8000)`
  inside try/catch — SSE/polling pages never reach networkidle.
- Record `route → file → HTTP status` per screen into
  `designs/captures/manifest.json`. A real 404 or a login-redirect IS the honest
  capture — keep it and note it.

Reference script: `designs/capture-screenshots.ts` in the yaya repo.

## Step 4 — recreate each screen as .pen

One pen run per capture:

```bash
pen --out designs/<name>.pen --model claude-opus-4-8 \
  --prompt-file designs/captures/<name>.png \
  --prompt "Recreate this screenshot as a .pen design as faithfully as possible — \
it is the <name> screen (<route>) of the <app> app at 1440px wide. Match all \
visible layout, text, colors, and spacing. Use design variables for the palette." \
  --export designs/previews/<name>.png --export-scale 1
```

- Run 3 concurrent `pen` processes; the proxy seats take it (a run is 2-5 min).
- Skip screens whose `.pen` already exists — the batch is re-runnable.
- **Verify one screen first**, then batch the rest — prompt wording matters more
  than retries.

## Step 5 — package

- **Minify** each `.pen` (`jq -c .` → ~1 counted line/file; keeps the set inside
  the 500-line PR cap. Pen.app reads minified JSON fine).
- Commit `.pen` files + `manifest.json`. Do **not** commit `captures/` or
  `previews/` PNGs — attach them to the PR (`gh pr comment --attach`).
- Follow fleet PR rules: issue first, `yay-<issue>-<slug>`-style branch, one
  Closes, `Assisted-by:` trailer.

## Iterating later

- Re-run the script after UI changes — skipped files regenerate cleanly
  (`rm designs/<name>.pen` to force).
- Edit a `.pen` in Pen.app directly, or `pen --in x.pen --out x.pen --prompt "..."`.
- Designs drift from code — the manifest is a snapshot, not a contract.
