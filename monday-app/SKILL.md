---
name: monday-app
description: "Build and submit a monday.com app (a React board/item view under integrations/<name>/ built on the monday apps SDK) and list it in the monday marketplace. Use when creating a monday app, building a board or item view, wiring monday OAuth/session, turning a board row into an external action, or fixing a Vite build where import.meta.env is untyped. Covers the whole path plus the traps: a monday view runs embedded in the board (monday-sdk-js / @mondaycom/apps-sdk gives context + a session token, not authorization for YOUR API), and a Vite+TS app reading import.meta.env needs src/vite-env.d.ts or tsc fails. Sibling of the other integration skills (wix-app, airtable-extension). Triggers: 'build a monday.com app', 'monday apps SDK', 'monday board/item view', 'monday marketplace', 'monday OAuth', 'import.meta.env untyped'."
---

# Building a monday.com app

A monday.com app is commonly a **board or item view** — a React app embedded in a monday board, built on the **monday apps SDK** (`monday-sdk-js` for context/API, `@mondaycom/apps-sdk` for server bits). Source lives in `integrations/<name>/`. Thin frontend over your own backend. Playbook: `pooriaarab/scripts` `scripts/monday-app/README.md`.

## The trap: monday's session token ≠ your API's auth

`monday.get("context")` + the session token identify the user/board and authorize **monday's** API. Your own API still needs its **own** key, stored per-installation. Don't send monday's token to your backend expecting it to authorize.

## The other traps

1. **`import.meta.env` untyped** — a Vite + TS app needs `src/vite-env.d.ts` with `/// <reference types="vite/client" />`, or `tsc` errors TS2339 "Property 'env' does not exist on type 'ImportMeta'".
2. **The view is an embedded iframe** — fetch only your allow-listed origin; the board context arrives via `monday.listen("context")`.
3. **App features + scopes are dashboard-owned** — declare the view feature + OAuth scopes in the monday Developer Center; a placeholder app id breaks on install.

## Build path

- React view listening to monday context; `npm run build` (`tsc --noEmit && vite build`).
- Row/item → your API create call (`platformType` string); write status back to a column if useful.

## Submission — monday marketplace

**Bucket: dev-portal review.** Build the app in the **monday Developer Center** (features, OAuth scopes, hosting URL) → submit for marketplace review.

**Silent-rejection gotchas:** missing `vite-env.d.ts`; sending monday's token to your API; over-broad scopes. TBD — confirm current review requirements at first submission.

## Parity checklist

read board/item context · paste + validate your API key · row → scheduled post (`platformType`) · list posts · surface success/error.

## Related skills
- `wix-app`, `airtable-extension` — sibling embedded productivity-tool apps; same OAuth/session-vs-key split.
