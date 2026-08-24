---
name: whop-app
description: "Build and submit a Whop app (a React app under integrations/whop-app/ embedded as an iframe view inside a Whop, built on the Whop SDK) and list it on the Whop App Store. Use when creating a Whop app, embedding a tool inside a creator's Whop, wiring 'Sign in with Whop' (OAuth 2.1 + PKCE), calling an external API from the embed, or figuring out the dev-proxy → versioned-build → review submission. Covers the whole path plus the traps: the app runs in a Whop iframe (the Whop user context comes from the SDK, but any OTHER service — your own API — needs its own auth/key, Whop's OAuth does not authorize it), the App ID + redirect are dashboard-owned, and apps can charge money (Whop takes a cut). Sibling of the other integration skills (canva-app, shopify-app, wix-app). Triggers: 'build a Whop app', 'Whop SDK', 'Sign in with Whop', 'publish to the Whop App Store', 'Whop dev proxy', 'my Whop app can't reach my API'."
---

# Building a Whop app

A Whop app is a **React app embedded as an iframe view inside a Whop** (a creator's community/storefront), built on the **Whop SDK** (`@whop/react`, `@whop/iframe`, `@whop/api`/`@whop/sdk`). Source lives in `integrations/whop-app/`. Thin frontend over your own backend. Command-level playbook: `pooriaarab/scripts` `scripts/whop-app/README.md`.

## The trap that wastes a day: Whop auth ≠ your service's auth

"Sign in with Whop" (OAuth 2.1 + PKCE) tells you **who the Whop user is** and what they've purchased. It does **not** authorize calls to any *other* service. If your app calls your own API, that API needs its **own** credential (a team API key, or your own OAuth) — carried separately. Wiring Whop login and expecting your API calls to be authorized is the classic first-day mistake: Whop identifies, your key authorizes.

## The other traps

1. **App ID + redirect URLs are dashboard-owned.** The app's ID and OAuth redirect/callback URLs live in the Whop dashboard; a placeholder ID runs in the dev proxy but breaks on install/submit. Copy the real values in early.
2. **The embed is an iframe** — external fetches follow the host CSP; keep all calls to your own allow-listed origin, and store the user's key per-installation (not globally).
3. **Apps can charge money** — Whop handles billing and takes a cut; if you gate features by plan, read entitlement from the Whop SDK, don't reinvent it.
4. **Inline-style/JSX typing** — the Whop UI kit is strict; cast web-only CSS props (e.g. `WebkitBoxOrient`) to a real `CSSProperties` value, not `as unknown as string` (that fails `tsc`).

## Build path

- Scaffold from Whop's app template; run the **dev proxy** (`whop-proxy` / the SDK's dev command) so the local app loads inside a real Whop for testing.
- UI: React + the Whop SDK hooks for user/entitlement context. Business logic stays server-side.
- `npm run build` produces the bundle/app served at your hosted URL (Whop embeds a URL, not a static upload).

## Submission — Whop App Store

**Bucket: dev-portal review.** Create the app in the Whop dashboard → set the hosted app URL + OAuth redirects → test via the dev proxy → submit a versioned build for review → promote to the App Store. Because apps can monetize, expect review to check the billing/entitlement flow too.

**Silent-rejection gotchas:** placeholder App ID/redirect; assuming Whop OAuth authorizes your API; a hosted URL that isn't reachable/HTTPS. TBD — confirm the current review SLA + revenue split at first submission.

## Parity checklist (prove in a real Whop embed)

Sign in with Whop · read the user/entitlement context · authenticate your own API separately · create/schedule a post (`platformType` string) · list posts · surface success/error.

## Related skills
- `canva-app`, `wix-app` — other iframe-embedded marketplace apps; the "host identifies, your key authorizes" split recurs.
- `shopify-app` — the other marketplace with a real business/billing gate.
