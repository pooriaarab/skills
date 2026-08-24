---
name: airtable-extension
description: "Build and ship an Airtable extension (a React app under integrations/<name>/ built on the Airtable Blocks SDK) that turns a base into an app — e.g. a content-calendar table whose rows become scheduled actions. Use when creating an Airtable extension/block, wiring a table row to an external API, storing config in globalConfig, or fixing a build that can't resolve @airtable/blocks. Covers the whole path plus the traps that each cost a build round-trip: the source lives in frontend/ (not src/), the SDK is React 16/17 (mount with ReactDOM.render + initializeBlock, NOT react-dom/client createRoot), UI components import from the @airtable/blocks/ui SUBPATH (there is no separate @airtable/blocks-ui package — depending on it 404s and breaks the whole install), and block.json holds the block identity. Sibling of the other integration skills (figma-plugin, canva-app). Triggers: 'build an Airtable extension', 'Airtable Blocks SDK', 'initializeBlock', 'globalConfig', '@airtable/blocks not found', 'react-dom/client fails in my Airtable block'."
---

# Building an Airtable extension

An Airtable extension is a **React app that runs inside a base**, built on the **Airtable Blocks SDK** (`@airtable/blocks`, UI from `@airtable/blocks/ui`). Source conventionally lives in `frontend/`. It reads the base's tables/records and calls your own backend. Command-level playbook: `pooriaarab/scripts` `scripts/airtable-extension/README.md`.

## The trap that 404s your whole install: there is NO `@airtable/blocks-ui`

The UI components (`Button`, `Input`, `initializeBlock`, …) come from the **`@airtable/blocks/ui` subpath of the single `@airtable/blocks` package** — NOT a separate `@airtable/blocks-ui` npm package. Adding `@airtable/blocks-ui` to `dependencies` makes `npm install` fail with a **404**, which installs *nothing* (including `@airtable/blocks`), and every import then reports "Cannot find module `@airtable/blocks`." One phantom dependency breaks the entire build. Depend on `@airtable/blocks` only; import UI from `@airtable/blocks/ui`.

## The other traps

1. **React 16/17, not 18.** The Blocks SDK targets React 16/17. Mount the standalone/dev shell with `ReactDOM.render(<App/>, el)` — `import { createRoot } from "react-dom/client"` (React 18) fails to resolve against the pinned React 17. Inside Airtable, mount via `initializeBlock(() => <App/>)` from `@airtable/blocks/ui`, not your own root.
2. **`frontend/`, not `src/`.** The Blocks toolchain expects the code under `frontend/`; a tsconfig `include` pointing at `src` typechecks nothing.
3. **`block.json`** carries the block identity; keep it, it's what `block run`/`block release` use.
4. **globalConfig for config, not localStorage** — persist the API key + table mapping in `globalConfig` (shared per-installation), and gate on `hasPermission` before writes.

## Build path

- `frontend/index.tsx` boots: try `initializeBlock` (real Airtable), else `ReactDOM.render` (standalone dev).
- Build: `tsc --noEmit && vite build` (or the block CLI). Depend on `@airtable/blocks` + `react@^17`/`react-dom@^17`.
- Read the content-calendar table, map a row → your API create call (`platformType` string), write status/id/url back to the row.

## Submission — Airtable

**Bucket: custom extension / marketplace.** `block release` publishes to your base/workspace; a public marketplace listing is a separate Airtable review. Fill `block.json` + the listing (name, icon, description).

**Silent-rejection gotchas:** the `@airtable/blocks-ui` 404 (above); React-18 mount; missing `globalConfig` permission checks. TBD — confirm the current public-marketplace submission path at first submission.

## Parity checklist (prove in a real base)

paste + validate the API key (globalConfig) · pick the calendar table · a row → a scheduled post (`platformType`) · write status back · list posts · read analytics.

## Related skills
- `figma-plugin` — another sandboxed design/data host with its own manifest + mount rules.
- `canva-app` — iframe app with the same "thin frontend, key stored per-install" shape.
