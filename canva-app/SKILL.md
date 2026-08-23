---
name: canva-app
description: "Build, run, and submit a Canva app (a React app under integrations/canva-app/ built on the Canva Apps SDK) and get it listed on the Canva App Marketplace. Use when creating a new Canva app, wiring a 'design → do something with it' flow, exporting the current design, adding an app that calls an external API from inside Canva, or figuring out why the Developer Portal review bounces. Covers the whole path plus the traps that each cost a round-trip: the app runs in a sandboxed iframe (no arbitrary fetch — every external origin must be allow-listed in the Developer Portal or the request is silently blocked), design export is async via createRenditions (not a synchronous getter), the App ID lives in the portal not the code, and marketplace review requires the app to work for a reviewer with no account of yours. Sibling of the other integration skills (browser-extension, figma-plugin, shopify-app, connector-directory-submission). Triggers: 'build a Canva app', 'Canva Apps SDK', 'export the Canva design', 'publish to the Canva App Marketplace', 'my Canva app can't reach my API', 'Canva app review rejected'."
---

# Building a Canva app

A Canva app is a **React app that runs in a sandboxed iframe inside the Canva editor**, built on the **Canva Apps SDK** (`@canva/app-ui-kit`, `@canva/design`, `@canva/intents`, `@canva/platform`). Source lives in `integrations/canva-app/`. It is a thin frontend over your own backend/API — the SDK gives you the design content + UI kit; you supply the logic. Read this before the first file; the command-level playbook is in `pooriaarab/scripts` `scripts/canva-app/README.md`.

## The trap that wastes a day: the iframe blocks every un-allow-listed origin

The app runs in a locked-down iframe. A `fetch` to your API **fails silently** (looks like a network error, no useful console message) unless that exact origin is added to the app's **allowed fetch domains** in the Developer Portal (Configuration → the app's permissions/domains). Local dev against `localhost` needs `localhost` listed too.

**Rule:** before debugging "my API call hangs," confirm the origin is allow-listed in the portal. Structure + `npm start` do not reveal this — only a real cross-origin request does.

## The other four that each cost a round-trip

1. **Design export is async.** You get the current design via `addOnUISdk.app.document.createRenditions({ ... })` — a Promise that returns rendition blobs. There is no synchronous "give me the PNG" getter. Await it, handle the multi-page/multi-element shape, and upload the blob to your API; don't assume one image.
2. **The App ID is portal-owned.** The `id` in `manifest`/config must match the app created in `developer.canva.com`. A placeholder ID runs in preview but fails the moment it's submitted. Copy the real ID from the portal into the app config early.
3. **Declare only the capabilities you use.** The portal makes you declare content access (design read, asset upload). Declaring more than you use slows review; declaring less than you use breaks at runtime. Match them exactly to the SDK calls you make.
4. **Review needs a no-account reviewer to succeed.** A Canva reviewer opens the app with none of your state. Auth must be self-service inside the app (paste-a-key or a real OAuth flow) with clear in-app instructions — an app that assumes you're already logged in elsewhere gets rejected.

## Build path

- Scaffold with the Canva CLI (`@canva/cli apps create` / `apps start`) — it runs the local preview you open inside Canva.
- UI: `@canva/app-ui-kit` components (match Canva's look; the kit is required for a consistent review pass). Keep to the kit rather than raw HTML where a component exists.
- API calls: your own SDK or public REST endpoint. Keep all business logic server-side; the app is a thin client.
- `npm run build` produces the bundle you upload in the portal.

## Submission — Canva App Marketplace

**Bucket: dev-portal review, free.** Steps:
1. Create the app in `developer.canva.com`; copy its App ID into the config.
2. Declare capabilities (design read, asset upload, allowed fetch domains).
3. `npm run build` → upload the bundle in the portal.
4. Fill the listing (name, description, a 512×512 icon, screenshots) → **Submit for review**.
5. Canva reviews before it appears in the marketplace (days, not minutes). Private/team use can run without full marketplace review.

**Silent-rejection gotchas:** un-allow-listed fetch domain (see above); an icon that isn't exactly 512×512; a listing that doesn't explain how a fresh reviewer authenticates; requesting capabilities the app never calls.

## Parity checklist (prove in a real Canva session before submitting)

export the current design · upload the rendition to your API · create/schedule the downstream action · surface success/error in the app UI · authenticate from a clean state.

## Related skills

- `figma-plugin` — the same "design → export → do something" shape on Figma; different SDK + iframe rules.
- `browser-extension` — another sandboxed-iframe/CSP surface; the allow-list lesson rhymes.
- `connector-directory-submission` — the cross-marketplace submission router.
