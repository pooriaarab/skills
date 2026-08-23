---
name: framer-plugin
description: "Build, run, and publish a Framer plugin (a React app under integrations/framer-plugin/ built on the framer-plugin npm package, running in an iframe inside the Framer desktop app) and get it listed via the Framer Community / Marketplace. Use when creating a new Framer plugin, reading the current canvas selection (e.g. the selected image) into your API, wiring framer.json, debugging why the dev plugin won't load, packing the zip for publishing, or figuring out how Framer submission works. Covers the whole path plus the traps that each cost a build/submit round-trip: the dev server must be local HTTPS (Framer refuses plain http://localhost and fails with a blank panel), framer.showUI must run before the React render or the window never sizes, the current selection is read via framer.getImage()/subscribeToImage (canvas-mode only, no synchronous DOM access), the zip must have framer.json at its root (zip the CONTENTS of dist/, not the folder), and plugin data (framer.setPluginData) is stored per project file — the key is re-pasted per project. The big selling point: publishing is near-instant with light or no review — no days-long gate like Canva or Figma. Sibling of the other integration skills (canva-app, figma-plugin, browser-extension, connector-directory-submission). Triggers: 'build a Framer plugin', 'framer-plugin npm package', 'framer.json manifest', 'Framer dev plugin won't load', 'Framer plugin blank panel', 'get the current Framer selection', 'publish to the Framer Marketplace', 'Framer Community plugin'."
---

# Building a Framer plugin

A Framer plugin is a **React app that runs in an iframe inside the Framer desktop app**, built on the **`framer-plugin` npm package** (`@framer/plugin`). Source lives in `integrations/framer-plugin/`. It is a thin frontend over your product's SDK or public REST API — the SDK gives you the canvas/selection + plugin window; you supply the logic. Read this before the first file; the command-level playbook is the companion `scripts/framer-plugin/README.md`.

The headline difference from other marketplaces: **publishing is near-instant, with light or no review.** No days-long review queue. That makes the build traps — not the submission — the whole game.

## The trap that wastes a day: the dev plugin needs local HTTPS

Framer loads a development plugin from a URL — and **refuses plain `http://localhost`**. The Vite dev server must serve HTTPS via a local certificate (`vite-plugin-mkcert`), and you must **open that `https://localhost:5173` URL in a browser once and accept the certificate**, or Framer shows a blank/failed panel with no useful error.

**Rule:** before debugging "my plugin is a white box," confirm the dev URL loads in a browser without a cert warning. Nothing in the code or the build reveals this — only opening the URL does.

## The other traps that each cost a round-trip

1. **`framer.showUI()` before render, at module top level.** Call `framer.showUI({ position: "top right", width, height, resizable: true })` once, *before* `createRoot(...).render(...)`. Forget it (or set no width/height) and the plugin window never sizes — a blank panel. Do not call it inside a component or `useEffect`: under React StrictMode that double-fires. Also `import "@framer/plugin/framer.css"` for the native look.
2. **The selection is SDK-read, not DOM-read.** The iframe cannot touch the canvas DOM. The selected image comes from `framer.getImage()` (Promise of `ImageAsset | null`) and `framer.subscribeToImage(cb)` for live updates; bytes come from `asset.getData()` (`{ bytes, mimeType }`). Await all of it — there is no synchronous getter. Subscribe, don't poll: a post composed before the user re-selects goes out with the stale image.
3. **`framer.json` is the manifest and must sit at the zip root.** Fields: `id` (short plugin id), `name`, `modes` (`["canvas"]` for canvas plugins), `icon` (root-absolute path like `/icon.svg`, file lives in `public/`). `vite-plugin-framer` copies it into `dist/` on build. When you pack, **zip the *contents* of `dist/`** (`zip -r out.zip .` from inside `dist/`) — zipping the folder puts everything one level down and the upload/plugin-load fails.
4. **Plugin data is per project file.** `framer.setPluginData(key, value)` / `framer.getPluginData(key)` persist (both async!) in the Framer project, not globally — a user re-pastes the API key in every project. Don't assume a key set once is set everywhere; always `getPluginData` on load and gate the UI on it, and `setPluginData(key, null)` on disconnect.
5. **External fetch is NOT allow-listed like Canva.** The iframe can call your API directly with `fetch` (or your product's SDK) — no portal domain list to forget. Keep the API key server-scoped (a team API key as a Bearer token) and all business logic server-side; the plugin is a thin client.
6. **Dev plugins run in the desktop app.** The development-plugin flow (Plugins menu → **Developer Tools**) is a desktop-app feature; plan the demo/parity pass there, not in the browser version.

## The manifest: framer.json

```json
{
    "id": "<short plugin id>",
    "name": "<Plugin Name>",
    "modes": ["canvas"],
    "icon": "/icon.svg"
}
```

Four fields, all load-bearing. `modes: ["canvas"]` is what makes `framer.getImage()` / `subscribeToImage()` available. The `icon` path is root-absolute; the file itself lives in `public/` so Vite copies it into `dist/` (SVG is fine). There is no separate permissions block — access to the selection comes with the mode, and network access is unrestricted.

## Auth: paste the team API key, store it per project

The standard pattern — and the one to build first, since everything else gates on it:

1. On load, `await framer.getPluginData("apiKey")`. No key → render the auth gate (a single password-style input + Connect button) instead of the main UI.
2. On connect, validate the key with one cheap API call, then `await framer.setPluginData("apiKey", key)`.
3. On disconnect, `await framer.setPluginData("apiKey", null)`.

The key never leaves the project except as the `Authorization: Bearer` header on API requests. Because storage is per project file, a returning user in a *new* project sees the auth gate again — that is expected, not a bug.

## Build → pack, the command sequence

```bash
cd integrations/framer-plugin
npm install
npm run dev      # vite + mkcert; prints https://localhost:5173
                 # ONE TIME: open that URL in a browser, accept the cert
npm run build    # tsc && vite build → dist/ (framer.json + icon copied in)
npm run pack     # build + zip the CONTENTS of dist/ → <name>.zip
```

Then, in the Framer desktop app: Plugins menu → enable **Developer Tools** → open the development plugin for the dev URL. Paste the team API key and connect.

### Structural traps

- **Keep the package isolated.** `integrations/framer-plugin/` with its own lockfile and an empty local PostCSS config, so monorepo Tailwind/build tooling doesn't leak into the plugin bundle.
- **Stack:** Vite + React + `vite-plugin-framer` + `vite-plugin-mkcert`. UI is plain React — `@framer/plugin/framer.css` supplies native styling; no separate UI-kit dependency.
- **`showUI` sizing is your layout contract.** Pick `width`/`height` (plus `minWidth`/`minHeight` when `resizable: true`) to fit the real UI; the iframe does not auto-grow.
- **Keep hard-coded API paths current** — a product API rename 404s every call silently; the plugin has no server to log it.

## Submission — Framer Community / Marketplace

**Bucket: instant/light review, free — the platform's selling point.**

1. `npm run pack` → the zip with `framer.json` at its root.
2. Post the zip in the Framer Community plugins category (`framer.com/communities/`, Plugins section): title, description, the zip, plus a screenshot or short demo clip. It is published essentially immediately; there is no lengthy review gate.
3. The Framer Marketplace listing (framer.com/marketplace) is a separate, curated step — **TBD — confirm exact submission URL + requirements at first submission.**
4. Listing copy must explain how a fresh user authenticates (paste-the-API-key flow is fine — auth is self-service in the plugin, no reviewer account needed).

**Silent-failure gotchas:** framer.json not at the zip root (folder zipped instead of contents); forgetting the cert-accept step when demoing the dev plugin; window blank because `showUI` ran after render or inside an effect; a stale selection image because you read once instead of subscribing; assuming a stored key survives across projects.

## Parity checklist (prove in the Framer desktop app before publishing)

dev plugin loads over local HTTPS · window sizes correctly · read the current selection image live (re-select updates it) · upload those bytes to your API · create/schedule the downstream action · surface success/error in the plugin UI · authenticate from a fresh project with no stored key · disconnect clears the stored key.

## Related skills

- `canva-app` — the same "design → export → do something" shape on Canva; that one DOES allow-list fetch origins and has a real review queue.
- `figma-plugin` — same iframe-in-a-design-tool pattern; different SDK + a manifest.json.
- `browser-extension` — another sandboxed surface; the "check the load path before the code" lesson rhymes.
- `connector-directory-submission` — the cross-marketplace submission router.
