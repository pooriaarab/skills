---
name: hubspot-app
description: "Build and list a HubSpot public app — a CRM card UI extension plus a serverless function, shipped as a HubSpot project (integrations/hubspot-app/) — on the HubSpot App Marketplace. Use when adding a card to a contact/company/deal/ticket record, calling an external API from inside HubSpot, wiring HubSpot OAuth, or working out why `hs project upload` or marketplace review bounces. Covers the whole path plus the traps that each cost a round-trip: a card can only fetch URLs pre-declared in permittedUrls.fetch and localhost is blocked outright (so you cannot develop a card against a local API), marketplace review demands at least three active installs on unaffiliated production portals, secrets live in HubSpot not in the bundle, and per-function hsmeta files replaced the deprecated single serverless.json. Sibling of the other integration skills (highlevel-app, monday-app, webflow-app, connector-directory-submission). Triggers: 'build a HubSpot app', 'HubSpot CRM card', 'HubSpot UI extensions', 'hs project upload', 'runServerless', 'submit to the HubSpot App Marketplace', 'my HubSpot card can''t reach my API'."
---

# Building a HubSpot public app

A HubSpot app is a **project** (`hsproject.json` + a `src/` tree of `*-hsmeta.json` configs) that ships a **UI extension** — a React card rendered inside a CRM record — and, usually, a **serverless function** that talks to your backend. Source lives in `integrations/hubspot-app/`. The card is a thin frontend; all logic stays in your API.

## The trap that wastes a day: a card cannot fetch your local API

Inside HubSpot the card fetches only through `hubspot.fetch(url, …)` or `runServerless({ name, parameters })`, and three rules bite at once:

- the URL must already be listed in `permittedUrls.fetch` in `app-hsmeta.json` — anything else is refused,
- **`localhost` is blocked outright**, so there is no "point the card at my dev server" mode,
- only `Authorization` is allowed as a custom header.

**Rule:** put a **private serverless function in front of your API** and have the card call it via `runServerless`. That is also the only way to keep your API key out of the browser. Build the composer UI against a local preview app (plain Vite) and let the real card path go through the function.

## The other five that each cost a round-trip

1. **Review needs ≥3 active installs on unaffiliated production portals.** This is a distribution gate, not a code gate, and nothing in the repo hints at it. Line the installs up early — it is usually the longest lead time in the whole submission.
2. **Secrets are a platform feature.** `hs secret add MY_API_KEY`, then list it in the function's `secretKeys`; it arrives as `process.env.MY_API_KEY` inside the function. A key committed to the bundle fails review and leaks to every installer.
3. **Per-function `*-hsmeta.json`, not one `serverless.json`.** The single-config form is deprecated on current platform versions. Wrong shape and `hs project upload` fails with a schema error rather than a useful message.
4. **`hubspot.extend` must be called at module top level**, not inside a hook or a conditional. Called anywhere else the card renders blank with no console error.
5. **Public function endpoints need an enterprise tier** the developer test accounts do not have. Keep functions private and call them with `runServerless`; reach for `endpoint: { path, method }` only when you know the installer's tier covers it.

Also: the app name must not contain the vendor's own name or closely match an existing listing — review rejects on that alone.

## Build path

- `hs project create` — pick distribution `marketplace`, auth `oauth`, and the `card` + `settings` + `app-function` features. Add more later with `hs project add`.
- `hsproject.json` pins `platformVersion` and `srcDir`. `src/app/app-hsmeta.json` holds OAuth config, scopes, `redirectUrls`, and `permittedUrls.fetch`.
- Card = a `*-hsmeta.json` (location `crm.record.tab` for the middle column, or `crm.record.sidebar`) plus a `.tsx` using `@hubspot/ui-extensions`: `hubspot.extend<'crm.record.tab'>(…)`, `useCrmProperties`, `useExtensionApi`.
- `hs project dev` for hot reload inside a real portal; `hs project upload` to build; `hs project open` to jump to the portal.
- Keep scopes minimal — reviewers check that every requested scope is actually used.

## Submission — HubSpot App Marketplace

**Submittable: CLI upload + portal review, free.** The CLI builds and uploads; the listing and the submit button live in the portal.

1. `hs project upload` — clear every scope and `permittedUrls` error the CLI reports first.
2. Portal → **Development → Projects → your project → Distribution → Add test install(s)**. Get to **three active installs on unaffiliated production portals**.
3. Portal → **Development → App Listings → Create listing** → select the uploaded app. Fill marketplace copy, screenshots of the card on a real record and of the settings page, privacy-policy + terms URLs, support URL.
4. Set the **Install Button URL** — the OAuth authorize link the portal generates. Reviewers click it, so OAuth must complete cleanly with minimal scopes.
5. **Submit for review.** Review covers the OAuth flow, card correctness, scope minimality, listing completeness, and the install count.
6. Updates ship as `hs project upload` plus a new listing version.

## Parity checklist (prove in a real portal before submitting)

card renders on every declared object type · record properties prefill the composer · the serverless function reaches your API with the secret · settings page saves and invalidates credentials · OAuth install completes from a clean portal · every declared scope is exercised.

## Related skills

- `highlevel-app` — the other CRM-iframe surface; per-location OAuth instead of per-portal.
- `monday-app`, `webflow-app` — same thin-client-in-an-iframe shape, different host rules.
- `connector-directory-submission` — the cross-marketplace submission router.
