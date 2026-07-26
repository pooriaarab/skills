---
name: meta-ads
description: "Set up Meta (Facebook) Pixel + server-side Conversions API (CAPI) purchase tracking for a web app — the client Pixel (fbq base + Purchase) and server CAPI (Graph /{pixel-id}/events) shipped together with a shared event_id dedup key, the CAPI access token that silently no-ops a server event when unset, why you fire on hashed-email match (not on fbclid) so organic purchases still report, advanced matching for match quality, the app-capability 400s (Advanced Access for ads_management, promotable Page), and server-side verification via the Graph stats/last_fired_time endpoints. Use when wiring up Meta ad conversion tracking, debugging 0 Purchase events, or when the pixel looks dead in a headless browser."
---

# meta-ads

Meta conversion tracking has two halves — a client-side **Pixel** (fires in the browser on page load and on purchase) and a server-side **Conversions API (CAPI)** call (fires from your backend after the charge actually happens, e.g. a payment webhook). Ship both together with a shared dedup key, or purchases get double-counted.

## Setup, in order

1. **Meta Events Manager → create a dataset / pixel.** The pixel id is a numeric string, safe to expose client-side (it's not a secret).
2. **Generate a CAPI access token** — Events Manager → your dataset → Settings → **Conversions API → Generate access token**. This *is* a secret; server-side only.
3. Attach a **promotable Facebook Page** to the ad account (needed later for creating ads).

## Client-side Pixel

Standard `fbq` base + a `Purchase` event on the confirmation page:

```html
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '<PIXEL_ID>');
fbq('track', 'PageView');
</script>
```

Fire the purchase with an **`event_id`** — this is the dedup key that pairs with the server event:

```js
fbq('track', 'Purchase', { value: 25, currency: 'USD' }, { eventID: '<shared-dedup-id>' });
```

Note the client SDK's param is **`eventID`** (in the fourth options arg); the server CAPI payload below uses **`event_id`**. Same value, different casing — don't typo one into the other.

## Server-side Conversions API (Graph)

```
POST https://graph.facebook.com/v19.0/{pixel-id}/events?access_token=<CAPI_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1700000000,
    "event_id": "<shared-dedup-id>",
    "action_source": "website",
    "user_data": {
      "em": ["<sha256 of lowercased-trimmed email>"],
      "external_id": ["<sha256 of your stable user id>"],
      "client_ip_address": "<request ip>",
      "client_user_agent": "<request user-agent>",
      "fbc": "<_fbc cookie value, only if present>",
      "fbp": "<_fbp cookie value, if present>"
    },
    "custom_data": {
      "value": 25,
      "currency": "USD",
      "content_ids": ["plan_pro"],
      "content_type": "product"
    }
  }]
}
```

- `event_time` is epoch **seconds** (not milliseconds).
- **If the CAPI access token is unset, the call silently no-ops** — 0 server events, no throw. This is the #1 pitfall. An `if (!token) return` guard makes it worse: the code runs, the guard takes the empty branch, nothing is sent.
- Always add **`client_ip_address` + `client_user_agent`** server-side — they materially improve match rate and are only available on the server.

## Do NOT gate CAPI on a click id

Fire the server event on **hashed-email match (`em`)**, not on the presence of `fbclid`/`fbc`. If you only fire when a Facebook click id is present, every **organic/direct/email/SEO purchase never reports** — which is most of them for many apps.

- Include `fbc`/`fbclid` **only when present** (it sharpens attribution for ad-driven purchases) but never make it a *requirement* for firing.
- `fbclid` from the landing-page URL survives via Meta's own **`_fbc` cookie** (the Pixel writes it), so read `_fbc` server-side rather than trying to thread the raw `fbclid` through your whole checkout.

## Match quality (advanced matching)

- **Advanced matching** — hashed email `em` and `external_id` (your stable user id, hashed) — is what lets Meta attribute a server event to a real person. Send whatever you have; more identifiers = higher match quality score in Events Manager.
- Hash `em`/`external_id` with **SHA-256 after lowercasing and trimming**; never send raw PII.
- `content_ids` + `content_type` on `custom_data` improve catalog/dynamic-ads attribution.

## App-capability pitfalls (creating ads via the API)

- Uploading ad images (`POST /act_{ad-account-id}/adimages`) and creating ads can **400 with "(#3) Application does not have the capability"** until your app has **Advanced Access for `ads_management`** — or you run the calls as a user who has a role on the ad account (Standard/dev-mode access only covers app-role users). Request Advanced Access in the App Review flow, or test as an app-role user first.
- A **promotable Facebook Page must be attached to the ad account** — ad creation fails without one.

## Verification (server-side truth, not "the pixel is on the page")

- **`GET /{pixel-id}?fields=last_fired_time`** — confirms the pixel/dataset fired *anything* recently.
- **`GET /{pixel-id}/stats?aggregation=event`** — counts by event type, and **includes CAPI** server events. This is authoritative. If you see only `PageView` and **no `Purchase`**, the purchase event isn't firing — regardless of what the browser looks like.
- Prefer these over the Events Manager UI's "Test Events" tab when you need a durable count rather than a live poke.

## Browser caveat

Some automation/headless browsers (and privacy tooling) **block `fbevents.js`**, so the Pixel looks dead in your test tooling while working fine in real browsers. Don't conclude the Pixel is broken from a headless run — **always cross-check server-side** via `/stats`.

## Small-budget campaign setup (cross-platform)

- On a small test budget with **no conversion history, don't pick a conversion-optimized objective yet** — Meta's delivery has a **learning phase** that needs a steady flow of conversions to optimize, which a small budget won't produce, so it never learns. Start with a traffic/click objective to fill the funnel, and move to conversion optimization once real conversions accumulate. (Same trap as Google Smart Bidding's learning phase.)
- Run **one narrow audience × geo × creative per experiment**, prove the **cheapest conversion (free signup) first**, and judge results on server-side truth (`/stats` + payment provider), not the dashboard. See the `ad-experiments` skill for the full methodology.

## Cross-cutting lessons (the ones that actually bite)

- **Timing:** a Purchase count of **0 over a window that predates the tracking deploy** is expected, not a bug. Check the deploy date before debugging — there are no events from before the Pixel existed.
- **Build-scoped env:** if the pixel id / CAPI token are baked into a generated module at **build time** (common on serverless/edge), setting them in your dashboard does *nothing* until the next deploy. **Redeploy after adding** — match wherever your other working analytics secrets are imported from rather than assuming a runtime `process.env` read works.
- **Ground truth:** cross-check Meta's server-side event counts (`/stats`) against your **payment provider's actual succeeded-charge count**. Real succeeded charges > 0 with Meta Purchase events = 0 means tracking is broken, full stop — the payment provider is the source of truth, the Pixel/CAPI is the thing under test.
- **Silent failure is the norm:** these integrations fail by **sending nothing** (an early return on a missing access token, a click-id gate that never matches organic traffic), not by throwing. Verify with server-side truth — `/stats`, `last_fired_time`, the payment provider — never "I saw fbq load in the browser."

## Common pitfalls

- CAPI access token unset → server events silently no-op (0 events, no error).
- Gating CAPI on `fbclid`/`fbc` → organic and direct purchases never report; fire on hashed `em` instead, add `fbc` only when present.
- Mismatched dedup key casing — client `eventID` vs server `event_id`, same value.
- `event_time` in milliseconds instead of seconds.
- Sending raw (unhashed) email or user id in `user_data` — always SHA-256, lowercased + trimmed.
- Concluding the Pixel is dead from a headless/automation browser that blocks `fbevents.js` — cross-check `/stats` server-side.
- `(#3) capability` 400s on `/adimages` or ad creation because the app lacks Advanced Access for `ads_management`, or no promotable Page is attached.
