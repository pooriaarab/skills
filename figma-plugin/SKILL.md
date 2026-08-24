---
name: figma-plugin
description: "Build, debug, and publish a Figma plugin (a code.js sandbox + ui.html iframe pair under integrations/figma-plugin/, built on the Figma Plugin API) and get it listed on Figma Community. Use when creating a new Figma plugin, wiring a 'select a frame → export it → call your API' flow, deciding whether fetch belongs in the sandbox or the iframe UI, adding networkAccess.allowedDomains to manifest.json, storing an API key in figma.clientStorage, or figuring out why Community review bounces. Covers the whole path plus the traps that each cost a build/publish round-trip: the two-context split (the sandbox has no DOM but no CORS; the iframe has DOM but full CORS — fetch in the wrong side fails with a useless error), every external origin must be allow-listed in manifest networkAccess.allowedDomains or the request dies at runtime, the sandbox has no FormData/Blob so multipart uploads are hand-rolled byte arrays, the UI must ship as one self-contained HTML file inlined via __html__, export is async via exportAsync, and the plugin ID Figma assigns on first publish must go back into manifest.json or updates fork the listing. Sibling of the other integration skills (canva-app, browser-extension, shopify-app, connector-directory-submission). Triggers: 'build a Figma plugin', 'Figma Plugin API', 'exportAsync', 'figma.clientStorage', 'networkAccess allowedDomains', 'publish to Figma Community', 'my Figma plugin fetch fails', 'Figma plugin review rejected'."
---

# Building a Figma plugin

A Figma plugin is **two programs talking over `postMessage`**: `code.js` runs in Figma's plugin sandbox (no DOM, no `window`) and `ui.html` runs in an iframe (full DOM). `manifest.json` declares both (`main`, `ui`) plus `networkAccess.allowedDomains`. Source lives in `integrations/figma-plugin/`. It is a thin frontend over your own backend — your product's SDK or public REST API. Read this before the first file; the command-level playbook is in `pooriaarab/scripts` `scripts/figma-plugin/README.md`.

## The trap that wastes a day: fetch in the wrong context

The two contexts have **opposite network rules**:

- `code.js` (sandbox): `fetch` exists and **CORS is not enforced** — but there is **no DOM**: no `FormData`, no `Blob`, no `FileReader`, no `URL.createObjectURL`.
- `ui.html` (iframe): full DOM, but `fetch` is an ordinary browser fetch — **CORS applies**.

If your API sends no CORS headers (most don't), a browser-side fetch from the UI is blocked and the failure looks like a generic network error with no useful console message. Put **every** API call in the sandbox; the UI sends intents over `parent.postMessage` / `figma.ui.postMessage` and renders the results. Keep the API key sandbox-side too (`figma.clientStorage`) so the secret never enters the iframe.

**Rule:** before debugging "my request fails," check which side runs the fetch. If the API has no CORS headers, the fetch belongs in `code.js`.

## The manifest is the contract

Everything Figma needs to know lives in `manifest.json` — and everything reviewers check is derived from it:

```json
{
  "name": "<Plugin name>",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["https://api.example.com", "https://uploads.example-cdn.com"],
    "reasoning": "Plain-English sentence per origin: what is fetched and why. Shown to reviewers."
  }
}
```

`main` and `ui` are **build outputs**, not sources — write TypeScript in `src/` and compile. After the first Community publish, add `"id": "<assigned-id>"` here. Both output files are typically git-ignored; rebuild after pulling.

## The other traps that each cost a round-trip

1. **Every origin must be allow-listed in `networkAccess.allowedDomains`.** Exact origins with scheme (`https://api.example.com`) — including CDN upload hosts and any image/thumbnail hosts the UI renders. `networkAccess.reasoning` is required alongside the list and is shown to reviewers. A missing domain fails at runtime, not at build time.
2. **No multipart helpers in the sandbox.** Build `multipart/form-data` bodies by hand with `TextEncoder` + `Uint8Array` and a boundary string (see `example.ts`).
3. **The UI ships as ONE self-contained HTML file.** `figma.showUI(__html__)` loads the compiled `ui.html`; the build step inlines the bundled JS into a `<script>` placeholder in the HTML template. No external scripts or stylesheets unless their origin is allow-listed.
4. **Export is async.** `node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: n } })` returns a Promise of `Uint8Array`. There is no synchronous getter — await it.
5. **The plugin ID is assigned on first publish.** Copy it into `manifest.json` as `"id": "<assigned-id>"`, or every later publish creates a new listing instead of updating the existing one.
6. **`editorType` gates where the plugin loads.** `["figma"]` loads only in Figma design. Add `"figjam"` or `"dev"` only if the plugin actually supports them — reviewers check.

## Build path

- esbuild: `src/code.ts → code.js` (bundle, IIFE, target `es2017` for the sandbox runtime); `src/ui.ts` bundled and inlined into `ui.html`. Types come from `@figma/plugin-typings`.
- Define one typed message union per direction (UI→sandbox intents, sandbox→UI results) with a `requestId` to correlate async replies — a bare `postMessage` free-for-all does not scale past two buttons.
- Dev loop: Figma desktop app → **Plugins → Development → Import plugin from manifest…** → select `manifest.json` → run from **Plugins → Development**. Re-run the plugin after each rebuild; there is no hot reload.
- State: `figma.clientStorage` persists per-user per-device (API keys, preferences) and is readable only from the sandbox. React to selection changes with `figma.on("selectionchange", …)` and push the new selection to the UI; use `figma.notify(...)` for transient success toasts.
- Debugging: sandbox logs appear in the desktop app's **Plugins → Development → Open console**; UI iframe logs need the iframe devtools. If a log line never appears, suspect the other context.
- API calls: your product's SDK or public REST API, always from the sandbox. Keep business logic server-side; the plugin is a thin client.

## Submission — Figma Community

**Submittable: portal-review, free** (in-app Publish from the desktop app — no publish CLI or REST submit endpoint). Steps:
1. Build and smoke-test locally in the desktop app.
2. **Plugins → Development → Manage plugins → Publish** (or `figma.com/community` → **Publish plugin**).
3. Fill the listing: name, **128×128** icon, **1920×1080** cover image (keep content in the `1800×1080` safe area), description (state that an API key is required and where a user gets one), tags, support contact/website.
4. Publish. Figma reviews new plugins before they appear in Community search; there is no published SLA and it self-reports as "reasonably prompt", but real waits run days to a few weeks (verify). The decision arrives by email to your Figma account address. Updates re-publish from the same listing once `"id"` is in the manifest; users are notified of updates.
5. Manifest changes (new `allowedDomains`, new `editorType`, renamed `main`/`ui`) only reach users through a re-publish — a local build is never enough.

**Silent-rejection gotchas:** a domain missing from `allowedDomains`; a `networkAccess.reasoning` left vague; a description that doesn't tell a fresh reviewer how to authenticate; declaring editors (`editorType`) the plugin doesn't support.

## Parity checklist (prove in a real Figma session before publishing)

select a frame · export PNG · upload to your API · create the downstream action · surface success/error in the plugin UI · authenticate from a clean state (empty `clientStorage`).

## Related skills

- `canva-app` — the same "design → export → do something" shape on Canva; different SDK, portal-held allow-list instead of a manifest field.
- `browser-extension` — another split-context/CSP surface; the message-passing lesson rhymes.
- `connector-directory-submission` — the cross-marketplace submission router.
