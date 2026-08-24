---
name: wix-app
description: "Build and submit a Wix app (a React dashboard page under integrations/<name>/ built on the Wix SDK) and list it in the Wix App Market. Use when creating a Wix app, building an embedded dashboard page, wiring Wix OAuth, calling an external API from the dashboard, or fixing a Vite build where import.meta.env is untyped. Covers the whole path plus the traps: a Wix dashboard app is an embedded page (Wix SDK / @wix/dashboard) authorized by Wix OAuth for Wix data — your own API still needs its own key — and a Vite+TS app that reads import.meta.env MUST ship a src/vite-env.d.ts with `/// <reference types=\"vite/client\" />` or tsc errors 'Property env does not exist on ImportMeta'. Sibling of the other integration skills (canva-app, monday-app, shopify-app). Triggers: 'build a Wix app', 'Wix SDK', 'Wix dashboard page', 'Wix App Market', 'import.meta.env has no env property', 'Wix OAuth'."
---

# Building a Wix app

A Wix app is commonly an **embedded dashboard page** — a React app the site owner opens in their Wix dashboard, built on the **Wix SDK** (`@wix/sdk`, `@wix/dashboard`). Source lives in `integrations/<name>/`. Thin frontend over your own backend. Playbook: `pooriaarab/scripts` `scripts/wix-app/README.md`.

## The trap that fails the build: `import.meta.env` is untyped without vite-env.d.ts

A Vite + TypeScript app that reads `import.meta.env.VITE_*` needs `src/vite-env.d.ts` containing `/// <reference types="vite/client" />`. Miss it and `tsc` fails with **TS2339 "Property 'env' does not exist on type 'ImportMeta'"**. Vite scaffolds this file; a hand-built or worker-built app often omits it. Add the one-line reference.

## The other traps

1. **Wix OAuth authorizes Wix data, not your API.** OAuth to Wix identifies the site/instance; your own API still needs its own key, stored per-installation.
2. **Embedded page = host CSP.** Fetch only your allow-listed origin from the dashboard iframe.
3. **App ID + redirect are Dev-Center-owned** — copy the real values from the Wix Dev Center; placeholders break on install.
4. **tsconfig include** — if `vite.config.ts` is in both the app tsconfig `include` and a composite node tsconfig, tsc errors TS6305; keep `vite.config.ts` only in the node project, `include: ["src"]` for the app.

## Build path

- React dashboard page on `@wix/dashboard`; `npm run build` (`tsc --noEmit && vite build`).
- Compose/schedule a post via your API (`platformType` string); read Wix context from the SDK.

## Submission — Wix App Market

**Bucket: dev-portal review.** Register in the **Wix Dev Center** (OAuth, permissions, dashboard URL) → submit. Wix runs an AI pre-check (minutes) then human review (~business weeks).

**Silent-rejection gotchas:** missing `vite-env.d.ts`; TS6305 tsconfig; over-broad permissions. TBD — confirm current review SLA at first submission.

## Parity checklist

OAuth/instance context · paste + validate your API key · create/schedule a post (`platformType`) · list posts · surface success/error.

## Related skills
- `monday-app`, `canva-app` — sibling embedded dashboard/iframe apps with the same OAuth-vs-key split.
