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
- **Escape hatch — use the official hosted ads MCP.** A self-built app on the **Limited** Marketing API tier keeps hitting `(#3)` on campaign/ad create, and getting **Advanced Access requires App Review + Business Verification** (days, frequently stalls). Meta's **official hosted ads MCP endpoint** uses standard Business-account OAuth and **bypasses the app-review/capability gate entirely** — you create and manage campaigns without owning a reviewed app. If you're blocked on `(#3)`, stop fighting App Review and drive the official MCP instead.

## Campaign + audience setup (lookalike, small budget)

- **Lookalike:** create a custom audience seeded off your **highest-value users**, then a **1%-of-country lookalike** from it. Set **`targeting_automation.advantage_audience = 0`** to keep it a *hard* lookalike — otherwise Meta quietly broadens delivery beyond the lookalike.
- **Budget hard-stop:** a campaign-level **`spend_cap`** (with CBO) is a **native hard stop** — no external budget-reaper cron needed. Two gotchas: (1) you **can't lower `spend_cap` below already-pending charges** (the error quotes the current floor, often a few dollars above your target); (2) **editing `spend_cap` auto-pauses the campaign** — you must re-activate it after the edit.
- **Creatives are immutable.** To swap an ad's image/copy you **create a new creative + new ad**, activate it, and pause the old — there is no in-place edit. Do the swap while spend is ~0 to avoid losing a read.
- **`ads_create_ad` takes no status arg** — it's born PAUSED; activate as a separate call.
- **`ads_update_entity` cannot delete** — it force-pauses (returns `status_forced_to_paused`). A true delete needs the Ads Manager UI.

## More API/launch gotchas (each one bites)

- **`LANDING_PAGE_VIEWS` optimization under `OUTCOME_TRAFFIC` rejects `promoted_object{pixel_id}`** ("Promoted Object Invalid") — omit `promoted_object` for that combo.
- **CTA `GET_STARTED` is rejected for some Pages** → `SIGN_UP` works.
- **The image-upload endpoint may be un-rolled-out for an account** → skip it and pass **`image_url`** to creative-create; Meta server-fetches the image.
- **Payment method must be on the AD ACCOUNT**, not just the business portfolio — otherwise delivery fails with **"No Payment Method" (subcode 1359188)** even though a card is "on the account" at the portfolio level.
- **Geo "unpublished edits" red herring:** opening a *published* ad set in the editor can spawn an unpublished-edits **draft** that re-flags a location-targeting error (`#1870194`). The published ad set is fine and delivering — **discard the draft, don't publish it.** Passing `location_types:["home"]` explicitly on create avoids the flag; a bare `{countries:["US"]}` gets auto-migrated and triggers it.

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

---

## Security — the Pixel is the official first-party vendor script

`https://connect.facebook.net/en_US/fbevents.js` is Meta's own first-party Pixel bootstrap — the standard, required loader every Meta advertiser embeds, not arbitrary third-party code. Load it only from the official `connect.facebook.net` origin over HTTPS (never a mirror or CDN copy). The CAPI access token stays server-side in an env var — no secret is placed in the client snippet.
