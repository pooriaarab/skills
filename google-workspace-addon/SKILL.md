---
name: google-workspace-addon
description: "Build, test, deploy, and publish a Google Workspace add-on (an Apps Script + CardService add-on under integrations/google-workspace-addon/ that runs in the Docs/Sheets sidebars) and get it listed on the Google Workspace Marketplace. Use when creating a new Workspace add-on, writing CardService cards, calling an external API from Apps Script, deploying with clasp, configuring appsscript.json scopes, or figuring out why the OAuth consent screen or marketplace review bounces. Covers the whole path plus the traps that each cost a round-trip: there is no fetch in Apps Script (UrlFetchApp only, and it needs the script.external_request scope plus a urlFetchWhitelist entry or the call is refused), oauthScopes must match across manifest, consent screen, and code, homepage triggers return Cards but action handlers return ActionResponses, user keys belong in user properties not script properties, and the real submission wall is Google's OAuth verification (demo video, days-to-weeks), not the listing form. Sibling of the other integration skills (canva-app, adobe-express-addon, figma-plugin, shopify-app, connector-directory-submission). Triggers: 'build a Google Workspace add-on', 'Apps Script CardService', 'appsscript.json oauthScopes', 'publish to the Google Workspace Marketplace', 'UrlFetchApp can't reach my API', 'OAuth verification rejected', 'clasp push', 'Google Workspace Marketplace SDK'."
---

# Building a Google Workspace add-on

A Workspace add-on is **server-side Apps Script (`.gs`) that renders CardService cards in
the host sidebar** (Docs, Sheets, …). No frontend, no DOM, no Node — you write trigger
functions that return cards. Source lives in `integrations/google-workspace-addon/`. It
is a thin client over your own public REST API: CardService renders the UI, `UrlFetchApp`
calls the API with a Bearer key. Read this before the first file; the command-level
playbook is `pooriaarab/scripts` `scripts/google-workspace-addon/README.md`.

## The trap that wastes a day: there is no `fetch`

Apps Script has **no `fetch`, no Node APIs, no async/await** — every call is synchronous
and every external request goes through `UrlFetchApp.fetch(url, options)`. Three hard
requirements ride on that one call:

1. **Scope.** `https://www.googleapis.com/auth/script.external_request` must be in
   `oauthScopes` in `appsscript.json` or the fetch is refused at runtime.
2. **Whitelist.** Add your API origin to `urlFetchWhitelist` (HTTPS URL prefixes,
   trailing `/`) in the manifest. Technically optional, but reviewers ask for it and it
   pins the add-on to your domain.
3. **Errors.** Set `muteHttpExceptions: true` or `UrlFetchApp` **throws** on any non-2xx
   and you never see the API's error body.

**Rule:** before debugging "my API call fails," confirm all three — scope in the
manifest, origin in the whitelist, `muteHttpExceptions` set. A missing one looks like a
generic authorization failure, not a network error.

## The other traps (each cost a round-trip)

1. **oauthScopes must match in three places** — `appsscript.json`, the GCP OAuth consent
   screen, and what the code actually calls. A mismatch gives users an "unverified app"
   wall or an auth error. Prefer `.currentonly` host scopes (`documents.currentonly`,
   `spreadsheets.currentonly`) — full `documents`/`drive` scopes drag you into
   restricted-scope verification.
2. **Triggers return Cards; action handlers return ActionResponses.** A
   `homepageTrigger.runFunction` must `return CardService.newCardBuilder()….build()`. A
   button's `setFunctionName(…)` handler must return
   `CardService.newActionResponseBuilder()` with navigation/notification. Return the
   wrong type and the sidebar fails with no useful error.
3. **User keys live in user properties.** `PropertiesService.getUserProperties()` is
   per-user; `getScriptProperties()` is shared by every user of the add-on. Store the API
   key in user properties — script properties leak one user's key to all.
4. **Deploy ≠ edit.** The Marketplace listing points at a **versioned deployment ID**
   (Deploy → New deployment → Add-on). `clasp push` changes nothing users see until you
   create a new deployment version. During development use **Deploy → Test deployments**
   to install into Docs/Sheets.
5. **The default GCP project is a dead end.** An Apps Script project starts on a hidden
   auto-created GCP project; you cannot fully configure the OAuth consent screen or the
   Marketplace SDK there. Switch to a standard GCP project you own first (Project
   Settings → Google Cloud Platform (GCP) Project → Change project).

## Build path

- Develop with **clasp** (`@google/clasp`): `clasp login`, `clasp create --type
  standalone`, `clasp push` (pushes `appsscript.json` + all `.gs` files), `clasp open`.
  Or paste the files into `script.google.com` and enable the manifest via Project
  Settings → "Show appsscript.json in editor".
- Manifest (`appsscript.json`): `addOns.common` (`name`, `logoUrl`, `layoutProperties`,
  `homepageTrigger`, `universalActions`) + per-host blocks (`addOns.docs`,
  `addOns.sheets`) with their own homepage triggers, plus `oauthScopes` and
  `urlFetchWhitelist`.
- UI: CardService builders only — card sections, widgets,
  `CardService.newAction().setFunctionName(…)`. No HTML.
- API: one thin `UrlFetchApp` client over your public REST API. Keep business logic
  server-side; the add-on renders and relays.

## Submission — Google Workspace Marketplace

**Bucket: GCP-console review, free; the OAuth verification is the heavy gate.** Steps:

1. Switch the script to a standard GCP project (trap 5).
2. Configure the **OAuth consent screen** (External for public distribution). Add the
   exact scopes from `appsscript.json`.
3. Enable the **Google Workspace Marketplace SDK** in `console.cloud.google.com`.
4. **App Configuration tab:** check Google Workspace Add-on + the host extensions, enter
   the **deployment ID** (Deploy → New deployment → Add-on in the Apps Script editor),
   fill developer name, website, support email; set visibility **Public**.
5. **Store Listing tab:** app name, short + detailed descriptions, graphics (128×128 app
   icon, 220×140 tile card, 1280×800 or 640×400 screenshots), category, pricing,
   terms-of-service and privacy-policy URLs.
6. **OAuth verification.** Public listings with sensitive scopes must pass Google's
   verification: submit from the consent-screen page with a **demo video** of the add-on
   flow. This takes days to weeks and bounces on any scope/consent mismatch (exact video
   + timeline requirements: TBD — confirm at first submission).
7. **Publish** in the Marketplace SDK. Google reviews the listing (days, not minutes).

For domain-internal use, set visibility **Private** in step 4 — no OAuth verification, no
marketplace review.

## Parity checklist (prove in real Docs + Sheets before submitting)

install via Test deployments · save the API key from a clean state · read the current
doc/sheet · call the API · see success/error surfaced in a card · refresh.

## Related skills

- `canva-app` — the same "sandboxed thin client over your API" shape on Canva; different
  iframe/allow-list rules.
- `adobe-express-addon` / `figma-plugin` — other in-editor add-on surfaces with their own
  manifest quirks.
- `connector-directory-submission` — the cross-marketplace submission router.
