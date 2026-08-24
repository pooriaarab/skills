---
name: adobe-express-addon
description: "Build, run, and submit an Adobe Express add-on (a React panel under integrations/adobe-express-addon/ built on the Adobe Express Add-on SDK) and get it listed via the Adobe Developer Console. Use when creating a new Express add-on, wiring a 'design → export it → call your API' flow, exporting the current document, adding an add-on that fetches an external API from inside Express, storing an API key in add-on client storage, or figuring out why distribution review bounces. Covers the whole path plus the traps that each cost a build/submit round-trip: the add-on runs in a sandboxed iframe (every external origin must be allow-listed in the manifest or the fetch dies), design export is async via createRenditions and returns blobs (not a synchronous getter), the manifest declares permissions that must match what the code actually uses, and review needs the add-on to work for a reviewer with none of your state. Sibling of the other integration skills (canva-app, figma-plugin, browser-extension, connector-directory-submission). Triggers: 'build an Adobe Express add-on', 'Express Add-on SDK', 'createRenditions', 'addOnUISdk', 'add-on manifest permissions', 'publish to Adobe Express', 'my Express add-on fetch is blocked', 'Express add-on review rejected'."
---

# Building an Adobe Express add-on

An Express add-on is a **React panel that runs in a sandboxed iframe inside Adobe Express**, built on the **Add-on SDK** (`addOnUISdk` from the add-on UI runtime). Source lives in `integrations/adobe-express-addon/`. It is a thin frontend over your own backend — the SDK gives you the document + client storage; you supply the logic. Read this before the first file; the command-level playbook is in `pooriaarab/scripts` `scripts/adobe-express-addon/README.md`.

## The trap that wastes a day: the iframe blocks un-allow-listed origins

The panel runs in a locked-down iframe. A `fetch` to your API **fails at runtime** unless that exact origin is declared in the add-on **manifest** (the permissions/sandbox `allowedDomains` / CSP block). Local dev against `localhost` needs it listed too. The failure looks like a generic network error — no clear "blocked by CSP" message.

**Rule:** before debugging "my API call fails," confirm the origin is in the manifest's allow-list. `npm start` in the local preview does not surface this until a real cross-origin request runs.

## The other three that each cost a round-trip

1. **Design export is async and multi-part.** `addOnUISdk.app.document.createRenditions({ range, format })` returns a Promise of rendition objects (blobs), not a synchronous PNG. Await it, handle multiple renditions (multi-page), and upload the blob — don't assume one image.
2. **Manifest permissions must match usage.** The manifest declares what the add-on can do (document read, export, network domains). Declaring less than you use breaks at runtime; declaring more slows review. Keep them exact.
3. **Review needs a clean-state reviewer.** An Adobe reviewer opens the add-on with none of your state. Auth must be self-service in-panel (paste-a-key or a real OAuth flow) with in-UI instructions — an add-on that assumes you're already signed in elsewhere is rejected.

## Build path

- Scaffold with the Adobe add-on tooling (`@adobe/create-ccweb-add-on`; dev server via `ccweb-add-on-scripts start`). It runs the HTTPS local preview you load inside Express.
- UI: React in the iframe; keep business logic server-side. The add-on is a thin client over your SDK / public REST API.
- `manifest.json`: entry points, permissions, allowed network domains, icon.
- `npm run build` produces the bundle to upload.

## Submission — Adobe Express add-on distribution

**Submittable: portal-review**

No public submission API. Package with the add-on CLI (`npm run package` →
`dist.zip`), then upload **inside Adobe Express** (Add-ons → **Manage add-ons**,
or the home-page Add-ons link — enable **Add-on Development** in settings first).
Adobe hosts the zip on a unique subdomain; you do **not** serve the panel
yourself. Public listings get marketplace review (~**10 business days**); a
**private link** skips review and is fine for testing. Adobe ID, no listing fee;
Adobe takes **no** revenue cut (you run checkout). Docs:
`developer.adobe.com/express/add-ons/docs/guides/build/distribute/public-dist`.

1. Enable Add-on Development. Create a new add-on listing (name ≤25 chars,
   unique — validated in-app).
2. `npm run package` in the project root. Zip must have `manifest.json` at the
   **root** (≤50 MB, relative paths only, no hidden files).
3. **Public listing** tab → Create public listing. Required: name, 50-char
   summary, 1000-char description, **help URL**, **support email**, **144×144**
   JPG/PNG icon (auto-resized to 36/64/144), **≥1 screenshot at 1360×800**
   (up to 5). Optional: privacy-notice URL, EULA URL, keywords, release notes.
   First-time publishers also need a **250×250** publisher logo + trader info
   to sell in the EU.
4. Declare generative-AI usage (required questionnaire) and a monetization
   model (free / free+paid / trial / paid) plus payment options. Checkout is
   **outside** Express. If login/credits exist, give review **test credentials
   with enough credits**.
5. Submit. Private-link path: upload zip + 144×144 icon + release notes → copy
   the link; you can promote that listing to public later.

**Silent-rejection gotchas:** `MANIFEST_NOT_FOUND_ERROR` from zipping the folder
instead of its contents; origin missing from the manifest allow-list;
permissions that don't match the code; no clean-state auth / missing test
credentials; missing help URL or support email; undeclared generative AI;
monetization that isn't disclosed; a flow with no Cancel/exit; Adobe-logo misuse.
Review contact: `ccintrev@adobe.com`.

## Parity checklist (prove in a real Express session before submitting)

export the current design · upload the rendition to your API · create/schedule the downstream action · authenticate from a clean state · surface success/error in the panel.

## Related skills

- `canva-app` — the same sandboxed-iframe + async-export shape on Canva; the allow-list lesson is identical.
- `figma-plugin` — another "design → export → call API" surface with a manifest network allow-list.
- `connector-directory-submission` — the cross-marketplace submission router.
