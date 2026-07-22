---
name: reddit-ads
description: "Set up Reddit Ads pixel tracking and server-side Conversions API (CAPI) purchase attribution for a web app — Developer Portal app creation, pixel install, Conversion Access Token (not OAuth), the CAPI v3 endpoint shape, and client/server event dedup. Use when wiring up Reddit ad conversion tracking, debugging a 'Base pixel configuration error' in Reddit Ads Manager, or deciding between Reddit's two token types."
---

# reddit-ads

Reddit Ads conversion tracking has two halves — a client-side pixel (fires on page load and on-click) and a server-side Conversions API call (fires from your backend after the conversion actually happens, e.g. a Stripe webhook). Ship both together with a shared dedup key, or purchases get double-counted.

## Setup, in order

1. **Reddit Ads Manager → Events Manager → create a pixel.** The pixel ID looks like `a2_xxxxxxxxxxxx`. This is safe to expose client-side (treat it like any other analytics ID, not a secret).
2. **Get a Conversions API token — use the Conversion Access Token, not an OAuth Developer Portal token.** Reddit has two distinct token mechanisms and it's easy to grab the wrong one:
   - **OAuth Developer Portal app token** — requires registering an app at the Reddit Developer Portal (which asks for a redirect URI even for a non-interactive server-to-server use case — any placeholder HTTPS URL works, e.g. your own domain, since you'll never complete an OAuth redirect flow with it). This token type expires and needs a refresh flow.
   - **Conversion Access Token** — generated directly in Events Manager, scoped to one pixel, does **not expire**, and needs zero OAuth flow. This is the one you want for a server-side CAPI integration. Events Manager → your pixel → generate access token.
3. If Ads Manager shows a **"Base pixel configuration error"** or a **"Prepare for deduplication"** prompt after creating the pixel, that's normal at this stage — it clears once the client-side base pixel actually fires on a real page load (step below) and Reddit sees a live event.

## Client-side base pixel

Standard Reddit pixel snippet, fires `PageVisit` on load:

```html
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init', '<PIXEL_ID>');
rdt('track', 'PageVisit');
</script>
```

For advanced matching (better match rates), pass a hashed email on init:
```js
rdt('init', '<PIXEL_ID>', { email: '<sha256-hashed-lowercased-trimmed-email>' });
```

Fire a conversion event client-side too (in addition to server-side CAPI — see dedup below):
```js
rdt('track', 'Purchase', { value: 25, currency: 'USD', conversionId: '<shared-dedup-id>' });
```
Note the client SDK's param is **camelCase `conversionId`**; the server CAPI payload below uses **snake_case `conversion_id`**. Don't copy one casing into the other — verified against Reddit's live `pixel.js` vs the CAPI schema, they genuinely differ.

## Server-side Conversions API (CAPI v3)

```
POST https://ads-api.reddit.com/api/v3/pixels/{pixelId}/conversion_events
Authorization: Bearer <CONVERSION_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "events": [
    {
      "event_at": 1700000000000,
      "click_id": "<rdt_cid value captured from the ad click>",
      "action_source": "WEBSITE",
      "type": { "tracking_type": "PURCHASE" },
      "metadata": {
        "conversion_id": "<shared-dedup-id>",
        "currency": "USD",
        "value": 25,
        "item_count": 1
      },
      "user": { "email": "<sha256-hashed-lowercased-trimmed-email>" }
    }
  ]
}
```

- `event_at` is epoch **milliseconds**.
- `click_id` is the `rdt_cid` query param from the ad click. **Reddit's own `_rdt_uuid` cookie does NOT store it** — `rdt_cid` only lands on the entry URL, so persist it to first-party storage (localStorage or a cookie) on landing or it's gone by checkout and CAPI has no click to match. Capture first-touch; don't overwrite on a later visit.
- `email` must be SHA-256 hashed after trimming and lowercasing — never send a raw email.
- `tracking_type` for other standard events: `LEAD`, `SIGNUP`, `ADD_TO_CART`, `VIEW_CONTENT`, etc. — match whichever conversion action you configured in Events Manager.
- This call should never be allowed to break the request that triggers it (e.g. a payment webhook). Catch and log failures; don't let a Reddit API error fail an unrelated critical path.

## Don't gate the CAPI call on the click id

Fire the server event whenever you have a **hashed email** (`user.email`) — not only when `click_id`/`rdt_cid` is present. Reddit matches on email alone, so gating on the click id silently drops every organic, direct, and email-driven purchase (usually most of them). Include `click_id` only when you actually have it; never make it a precondition for firing.

## Dedup: client pixel + server CAPI, same key

Firing both a client pixel event and a server CAPI event for the *same* conversion double-counts it unless they share a dedup key:

- Use one value both sides can independently produce or receive — a payment-processor session/transaction ID is a good choice (e.g. a Stripe Checkout Session ID), since the client already has it in the redirect URL and the server already has it in the webhook payload.
- Client sends it as `conversionId` (camelCase, in the `rdt('track', ...)` call).
- Server sends the *same* value as `conversion_id` (snake_case, in the CAPI `metadata`).
- Reddit's events manager reconciles the two into one conversion.

## Secrets: don't assume `process.env` is populated at request time

Some app setups bake environment variables into a generated module at **build time** rather than reading `process.env` directly at runtime (common on serverless/edge platforms where the runtime environment isn't guaranteed to match the build environment). If your pixel/token reads come back empty in production despite being set somewhere in your deploy config, check whether your app has a build-time secret-generation step (grep for wherever your other, working analytics secrets — e.g. a GA4 API secret — are imported from) and match that pattern, rather than assuming a direct `process.env.YOUR_VAR` read will work. This exact mismatch silently no-ops a CAPI integration with no error — the code runs, the `if (!token) return` guard just always takes the empty-token branch.

## Verification (server-side truth, not "the pixel is on the page")

Reddit has no Meta-style pixel `stats` API, so verify at the edges:

- Inspect the live beacon to `alb.reddit.com/rp.gif` in the browser network tab — confirm the `event` and that `value`/`currency`/`conversion_id`/`external_id` are populated (empty on a plain `PageVisit` is fine; empty on a purchase is the bug).
- **Ground truth:** cross-check recorded conversions against your payment provider's actual succeeded-charge count. Real charges > 0 with Reddit conversions = 0 means tracking is broken, full stop.
- **Timing:** a conversion count of 0 over a window that predates the tracking deploy is expected, not a bug — check the deploy date before debugging.
- **Silent failure is the norm:** these integrations fail by sending nothing (an unset token early-returns, a click-id gate never matches organic traffic), not by throwing.

## Common pitfalls

- Grabbing an OAuth Developer Portal token instead of a Conversion Access Token — more setup, expires, unnecessary for server-to-server CAPI.
- Sending a raw (unhashed) email in `user.email` — always SHA-256 hash it, trimmed and lowercased.
- Mismatched casing between the client `conversionId` and server `conversion_id` — same key, different casing, don't typo one to match the other's casing.
- Reconstructing timestamps instead of preserving the original click time where the platform's own cookie/click-id encodes it (check whether your click-id format embeds a timestamp before assuming "now" is correct).
- Letting a CAPI call's failure or latency affect the critical path (payment webhook, checkout redirect) it's attached to — always fire-and-log, never fire-and-block, and if your runtime can tear down background work after a response is sent (common on serverless functions), `await` the call rather than firing it detached.
- Assuming `rdt_cid` survives to checkout on its own — it only lands on the entry URL and Reddit's cookie doesn't store it; persist it first-party on landing or Reddit CAPI matches almost nothing.
- Gating the CAPI call on `rdt_cid` — organic/direct purchases then never report; fire on hashed email and attach the click id only when present.
