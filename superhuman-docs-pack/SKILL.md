---
name: superhuman-docs-pack
description: "Build and PUBLISH a Superhuman Docs pack (formerly Coda; a @codahq/packs-sdk TypeScript pack under integrations/<name>/) — a pack that adds formulas/actions/sync-tables that call your API, e.g. 'schedule a social post'. Use when creating a Superhuman Docs / Coda pack, wiring a pack action to an external REST API, or actually shipping one with the packs CLI. Covers the whole path plus the traps that each cost a real round-trip: Coda rebranded to Superhuman Docs (2026-07-08) but the SDK package is UNCHANGED (@codahq/packs-sdk) and the CLI binary is now `packs` (old `coda` still aliases); the build/upload SEGFAULTS on Node 22+/25 (needs Node 20); publishing is token-only via register→create→upload→release BUT a Pack-scoped token is required (an MCP/doc-data token cannot publish); `release` prompts on a real TTY (fails headless with /dev/tty errors) and warns when releasing from a non-main branch; and the public gallery listing is a review-gated web action, not a CLI/API call. Triggers: 'build a Coda pack', 'Superhuman Docs pack', 'packs CLI', 'coda release /dev/tty error', 'coda build segfault', 'publish a pack', 'packs register token'."
---

# Building + publishing a Superhuman Docs pack

Superhuman Docs is the 2026-07-08 rebrand of **Coda**. A pack is a `@codahq/packs-sdk` TypeScript module (`pack.ts`) whose formulas / actions / sync tables call your own REST API. It runs inside Superhuman Docs docs. Source in `integrations/<name>/`. Command playbook: `pooriaarab/scripts` `scripts/superhuman-docs-pack/README.md`.

## The rename: almost nothing in the code changes

- **SDK package is UNCHANGED — keep `@codahq/packs-sdk`.** There is no `@superhuman/*` package. `import * as coda from "@codahq/packs-sdk"` and `coda.newPack()` stay exactly as they were.
- **The CLI binary is now `packs`** (`npx packs …`); the old `coda` command still works as an alias. REST/token endpoints are still on `https://coda.io` (not migrated).
- Only cosmetics are yours to change: the display name, description, docs URLs, and the logo (official assets at `superhuman.com/media-assets`).

## The trap that segfaults the build: Node version

`packs build` / `packs upload` **segfault (exit 139) on Node 22 and Node 25** — the CLI's bundler crashes on new Node. **Use Node 20 LTS** (`/opt/homebrew/opt/node@20/bin` on the PATH, or `nvm use 20`). With Node 20 the build/upload run clean. If a build dies with no error and exit 139, it's the Node version, not your code.

## Publishing: token-only, but the RIGHT token + a TTY

```
packs register <token>     # validate + store a Pack-scoped token in .coda.json (gitignore it — it's a secret)
packs create pack.ts       # first time only: registers a new Pack, returns a Pack id -> .coda-pack.json (DO commit this)
packs upload pack.ts -n "…"   # build + upload a version
packs release pack.ts <ver> -n "…"   # mark that version installable
```

Gotchas, each a round-trip:
1. **A Pack-scoped token is required.** A token whose restriction type is **MCP** (the doc-data / MCP-server token) validates fine but **cannot** create/upload/release a Pack. Mint the right one at `coda.io/account → API Settings` (the `packs register` no-arg flow offers to open it) — a one-time human login; after that it's headless.
2. **`.coda.json` holds the token — gitignore it.** `.coda-pack.json` holds the Pack id — commit it (it links the source to the server Pack for future uploads).
3. **`release` needs a real TTY.** It prompts (a confirm, plus a warning if you're not on `main`), reading from `/dev/tty` via readline-sync — so it **fails headless** with `stty: /dev/tty: Device not configured`. Run it under a pseudo-tty and auto-answer: `yes | script -q /dev/null <the release command>`. It also refuses to release with **any uncommitted changes in the repo** — clean the tree first (a stray modified file anywhere blocks it).
4. **`release` needs `--notes`** and a version **higher than any prior release**.

## The one web step: public gallery listing

`upload` + `release` make the pack installable **by link** (shareable now). Getting it **listed in the public gallery** is a review-gated web action in Pack Studio — a browser login, no CLI/API. Paid-pack listing is paused during the Superhuman transition; free packs publish/share fine.

## Related skills
- `connector-directory-submission` — other automation-connector directories.
- `marketplace-app-hosting` — for the iframe apps (packs don't need hosting; they run inside Superhuman Docs).
