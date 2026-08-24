---
name: marketplace-app-hosting
description: "Use when you have built one or more iframe marketplace apps (Shopify, Wix, Whop, monday, Webflow, HubSpot, HighLevel, Miro, Trello, etc.) and need to HOST them at a live HTTPS URL so the marketplace can embed them — the deploy half of the 0→1 that sits between 'built' and 'submittable'. Covers the one-Cloudflare-Worker-serves-all-apps pattern: a standalone Worker with Static Assets serving each app's built bundle at apps.<domain>/<app>/, per-marketplace frame-ancestors CSP so each store can iframe it, custom_domain routing, and the run_worker_first gotcha (Static Assets bypass the Worker for existing files, so headers never apply unless you force the Worker to run first). Also: which app types need hosting (dashboard/OAuth apps embed a URL) vs which do NOT (design-tool apps like Canva/Figma/Adobe are bundle-UPLOAD, no URL). Sibling of the per-marketplace build skills (shopify-app, whop-app, …). Triggers: 'host my marketplace apps', 'embed URL for the app', 'apps subdomain', 'frame-ancestors CSP for an iframe app', 'my app loads but the marketplace won't embed it', 'X-Frame-Options blocks the iframe', 'run_worker_first', 'Cloudflare custom domain for a worker'."
---

# Hosting iframe marketplace apps

A marketplace that embeds your app in an `<iframe>` (Shopify admin, Wix dashboard, a Whop, a monday board, …) asks for **one thing: a live HTTPS URL**. Your built app (`dist/`) sitting in a repo has no URL — it must be *served*. This skill is the deploy half of the app 0→1: **one Cloudflare Worker serving every app** at `apps.<domain>/<app>/`. Command-level playbook: `pooriaarab/scripts` `scripts/marketplace-app-hosting/README.md`.

## First: not every app needs hosting

| Marketplace type | Submission = | Needs hosting? |
|---|---|---|
| **Dashboard / OAuth apps** — Shopify, Wix, Whop, monday, Webflow, HubSpot, HighLevel, Miro, Trello | you give the store an **app URL** it iframes | **YES** |
| **Design-tool apps** — Canva, Figma, Adobe Express | you **upload a bundle** to the store | **NO** — never build a hosting route for these |
| **Extensions / connectors** — Chrome, VS Code, Raycast, n8n, Power Platform, Zapier | published to a store / CLI / package registry | **NO** |

Wasting effort hosting an upload-based app is the first mistake. Check the column before you host.

## The gotcha that makes the iframe silently fail: Static Assets bypass the Worker

Cloudflare Workers **Static Assets serve a matching file directly from the edge and DO NOT run your Worker script.** So a Worker that adds `Content-Security-Policy: frame-ancestors …` runs only on 404s (missing files) — every real app page (a 200) is served *without* your headers, and the marketplace can't frame it. Symptom: the app loads fine in a browser tab but the store's iframe stays blank / "refused to connect".

**Fix: `run_worker_first = true`** on the `[assets]` config, so the Worker runs on every request, fetches the asset via `env.ASSETS.fetch()`, and stamps the headers on the way out. Verify with `curl -D -` that a **200** app page carries `content-security-policy` and has **no** `x-frame-options`.

## The one Worker (serves all apps)

A standalone Worker (not wired into the main app's build, so it can't break that CI):

- **`wrangler.toml`**: `[assets] directory="./public" binding="ASSETS" run_worker_first=true`; `[env.staging]`/`[env.production]` each with `name`, a `routes = [{ pattern = "apps.staging.<domain>", custom_domain = true }]`, and their own `[env.X.assets]` block. `custom_domain = true` makes wrangler create the DNS record + edge cert on deploy (needs a token with Workers Routes + DNS edit; a Workers-only token deploys the script but the route creation can fail — then a human adds the custom domain once).
- **`src/index.ts`**: for `/<app>/…`, reject unknown `<app>` (404); `env.ASSETS.fetch(request)`; SPA-fallback to `/<app>/index.html` on a 404 with no file extension; on the response, `delete X-Frame-Options` and `set Content-Security-Policy: frame-ancestors <that app's marketplace domains>`.
- **`src/csp.ts`**: a `Record<app, frame-ancestors>` map — the exact domains that store frames from (e.g. Shopify → `https://admin.shopify.com https://*.myshopify.com`, Wix → `https://*.wix.com https://manage.wix.com`, Whop → `https://whop.com https://*.whop.com`).
- **`build.sh`**: for each hosted app, `(cd integrations/<dir> && npm install && npm run build)` then copy its `dist/` → `public/<app>/`. Continue past a single app's failure. Gitignore `public/` — it's build output.

## Deploy

`wrangler deploy --env staging` → verify every app at `apps.staging.<domain>/<app>/` returns 200 **with** the frame-ancestors header → `wrangler deploy --env production`. A brand-new custom hostname needs a few minutes for its edge cert (an SSL handshake failure right after deploy is cert provisioning, not a bug).

## Build gotchas you'll hit assembling the bundles

- **Local-SDK apps** — an app depending on `@your-sdk` via `file:../../packages/sdk` needs that package **built** (its `dist`/types) before the app's `tsc` resolves it; build the SDK once first, or pin the published npm version.
- **A hallucinated dependency version** (`@vendor/pkg@^1.2.0` that doesn't exist) makes `npm install` fail with 404/ETARGET and installs **nothing** — the real errors ("cannot find module X") are downstream. Check the failing install line first.
- **Interactive build CLIs** (e.g. Adobe's `ccweb-add-on-scripts` prompts for analytics consent) hang headless — they can't be assembled by a script; host such an app only if its toolchain has a non-interactive flag.
- **Remix/SSR apps** (Shopify) don't emit a static `index.html` at the app root; they need a server build, not static hosting — handle separately from the static SPA apps.

## Then: OAuth + submission

Each hosted app's OAuth redirect URI is `https://apps.<domain>/<app>/oauth/callback`; register it in the marketplace's app config. The marketplace's "app URL" field = `https://apps.<domain>/<app>/`. After hosting, the store submission itself needs the vendor's **dev account login** (a human step — you can't create accounts or accept ToS for someone) — see the per-marketplace skills for each store's exact submission flow and asset requirements.

## Related skills
- `shopify-app`, `whop-app`, `wix-app`, `monday-app`, `webflow-app`, `hubspot-app`, … — the per-marketplace build + submission skills.
- `connector-directory-submission`, `mcp-directory-submission` — the non-hosted (upload/PR/registry) distribution paths.
