---
name: shopify-app
description: "Build, run, and submit a Shopify app (a Remix embedded app under integrations/shopify-app/ built on @shopify/shopify-app-remix + App Bridge) and get it listed on the Shopify App Store. Use when creating a new Shopify app, wiring OAuth + an embedded admin UI, subscribing to shop webhooks (products/orders), deploying shopify.app.toml changes, or figuring out why App Store review bounces. Covers the whole path plus the traps that each cost a build/submit round-trip: webhook routes must return 2xx even when your downstream work fails (Shopify retries non-2xx into a storm), the three GDPR privacy webhooks are mandatory for distribution even as no-ops, shopify.app.toml edits do nothing until `shopify app deploy`, the embedded frame needs the boundary error/headers exports or OAuth redirects die in the iframe, and review installs your app on a store with zero of your state. Sibling of the other integration skills (canva-app, figma-plugin, browser-extension, zapier-integration, connector-directory-submission). Triggers: 'build a Shopify app', 'shopify app dev', 'shopify.app.toml', 'App Bridge embedded app', 'Shopify webhook HMAC', 'GDPR webhooks customers/data_request', 'Shopify App Store review rejected'."
---

# Building a Shopify app

A Shopify app is a **Remix app that runs embedded in the Shopify admin** (iframe +
App Bridge), built on **`@shopify/shopify-app-remix`** (`shopifyApp()` +
`authenticate`) with Polaris UI. Source lives in `integrations/shopify-app/`.
OAuth, session storage, webhook HMAC, and API versioning come from the package;
you supply routes and your own product's logic. Keep it a thin client over your
product's SDK / public REST API — all secrets and business logic stay server-side
(`.server.ts` modules). Config lives in **`shopify.app.toml`** (client_id, URLs,
scopes, declarative webhook subscriptions). Read this before the first file; the
command playbook is `scripts/shopify-app/README.md` in the scripts repo.

## The trap that wastes a day: webhooks must 2xx even when your work fails

`await authenticate.webhook(request)` verifies the HMAC signature and returns
`{ shop, topic, payload }`. After that check passes, **always return 200** —
catch every downstream error, log it, respond OK. Shopify retries non-2xx
deliveries with backoff, so an outage in your product's API turns into a webhook
storm: duplicate events, a flagged app, and (with enough failures) subscriptions
deleted by Shopify.

**Rule:** the webhook route authenticates, does its work best-effort, and 200s.
Never let your own downstream outage propagate back to Shopify.

## The other traps that each cost a round-trip

1. **GDPR webhooks are mandatory for App Store distribution.**
   `customers/data_request`, `customers/redact`, `shop/redact` must be subscribed
   in `shopify.app.toml` AND implemented — as acknowledged no-ops when you store
   no buyer data. `shop/redact` and `app/uninstalled` must delete that shop's
   settings and OAuth sessions. Missing endpoints block submission automatically.
2. **`shopify.app.toml` edits do nothing until `shopify app deploy`.** Webhook
   topics, scopes, and URLs are declarative config — the local file is not live.
   Editing the toml without deploying is the #1 "my webhook never fires" cause.
   Adding scopes also forces existing merchants through re-authorization.
3. **The embedded frame needs the boundary exports.** In the embedded root route
   (`app.tsx`), export `ErrorBoundary = boundary.error(useRouteError())` and
   `headers = boundary.headers(...)` from `@shopify/shopify-app-remix/server`, or
   OAuth redirects thrown inside the iframe lose their headers and the app hangs
   on a blank frame. The frame also needs `<AppProvider isEmbeddedApp
   apiKey={apiKey}>` (App Bridge), with the public API key passed from the loader.
4. **Review installs with zero of your state.** A Shopify reviewer installs the
   app on their own test store. Every screen must render a sane "not connected"
   state, and auth to your product must be self-service in-app (e.g. paste the
   team API key in a Settings page, validated on save). An app that assumes an
   existing session elsewhere gets rejected. A public privacy-policy URL is
   required for the listing.

## Build path

- `shopify app dev` (Shopify CLI) tunnels to a public URL, syncs
  `application_url` + redirect URLs into the toml, and installs on your dev
  store. `shopify app config link` binds the directory to the Partner app's
  `client_id`.
- Server config: `shopifyApp({ apiKey, apiSecretKey, apiVersion, scopes, appUrl,
  authPathPrefix: "/auth", sessionStorage, distribution:
  AppDistribution.AppStore })`. Match the toml's `redirect_urls` to the
  `authPathPrefix` callback paths.
- Sessions: SQLite session storage is fine for dev
  (`@shopify/shopify-app-session-storage-sqlite`); production needs DB-backed
  `sessionStorage` — file SQLite breaks on multi-instance hosts, and lost
  sessions mean OAuth loops/reinstalls.
- UI: Polaris components inside App Bridge. (Polaris React is deprecated upstream
  in favor of Polaris web components — pin what works, revisit when the official
  app template moves.)
- Webhook handlers read per-shop settings (your product's API key, saved via the
  embedded Settings page) and call your product's public REST API server-side.

## Submission — Shopify App Store

**Submittable: portal-review**

No submit-for-review API. `shopify app deploy` / `shopify app release` push an
**app version** (toml, webhooks, extensions) — they do **not** host the Remix app
and do **not** file the review. Review is portal-only: Partner / Dev Dashboard →
**Apps → [your app] → Distribution → Shopify App Store** (also the App Store
review page). Partner account is free; **public HTTPS hosting** is required;
distribution method is one-way. Paid apps must use Shopify App Pricing / Billing
API (revenue share after the first $1M USD/year — verify current split). Docs:
`shopify.dev/docs/apps/launch`.

1. `partners.shopify.com` → Apps → create the app → Client ID/secret into `.env`
   + `client_id` in the toml. Bind with `shopify app config link`.
2. Host the production app on public HTTPS (hostname must not contain "Shopify").
   Set `SHOPIFY_APP_URL`, `application_url` + `redirect_urls`, subscribe the three
   **compliance webhooks**, `shopify app deploy`.
3. Choose **public / App Store** distribution. Complete configuration: URLs,
   GDPR webhooks, **1200×1200** JPEG/PNG icon (no text — corners auto-round),
   emergency contact email + phone. If you touch buyer data, file **protected
   customer data** access *before* review (can't apply while under review).
4. Listing: name ≤30 chars (brand-led, unique), 100-char intro + 500-char details,
   feature list (≤80 chars each), **3–6 screenshots at 1600×900 (16:9)** (at least
   one of the embedded UI, no browser chrome/PII/pricing), optional 1600×900
   feature image or 2–3 min promo video, demo-store URL, pricing, support +
   **privacy-policy URL**. Include a short reviewer screencast + test credentials.
5. Pass the built-in **automated checks** (required) and optional AI self-review,
   then **Submit for review**. Reviewers install on their own test store with none
   of your state. SLA commonly weeks `(verify)`.

**Silent-rejection gotchas:** off-platform billing (hard reject); URLs containing
"Shopify"; OAuth that doesn't fire immediately on install; embedded app that
relies on third-party cookies; invalid SSL; GDPR webhook 404/500; missing
privacy-policy URL / test credentials / screencast; scopes the app never calls;
screens that break with no API key; toml never deployed. Payout business
verification `(verify)`.

## Parity checklist (prove in a real dev store before submitting)

install → OAuth lands in the embedded admin · save your product's API key in
Settings · trigger the subscribed event (create/update the object) → your API
receives the call · webhook route 200s even with your API down · uninstall →
that shop's settings + sessions wiped.

## Related skills

- `zapier-integration` — another thin-connector-over-your-REST-API build with a
  live-usage submission gate.
- `canva-app` / `figma-plugin` — the same embedded-iframe, thin-client shape on
  design tools; different SDK + review surfaces.
- `connector-directory-submission` — the cross-marketplace submission router.
