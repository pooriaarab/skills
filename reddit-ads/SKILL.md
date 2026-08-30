---
name: reddit-ads
description: "Set up Reddit Ads account access, the Reddit Pixel, and Reddit Conversions API v3 for web events. Use for Reddit Ads signup, Events Manager setup, rdt_cid persistence, conversion_id deduplication, LDU consent, CAPI v2-to-v3 migration, or missing Reddit conversions."
---

# reddit-ads

Reddit offers self-serve Ads signup and a public server-side Conversions API.
Use the Pixel and CAPI together. Use one conversion ID across both paths.

## Account and access

1. Open [Reddit Ads](https://ads.reddit.com/) and select **Get started**.
   Set up a business and advertiser account.
2. For an existing business, ask its owner to add you as a creator or
   administrator. Reddit documents both paths in its [CAPI direct integration
   guide](https://ads-api.reddit.com/docs/v3/guides/programs/capi/direct-integration).
3. In the correct business, open **Events Manager**. Select **Configure data
   source → Conversions API → Set up manually**. Select **Conversions API Only**
   if the Pixel does not exist.
4. Copy the Pixel ID. Select **Generate Access Token**, name and generate it,
   then copy it. Reddit says it cannot retrieve this token later. Reddit
   recommends this non-expiring conversion token in its [CAPI
   guide](https://ads-api.reddit.com/docs/v3/guides/programs/capi/direct-integration).

This direct CAPI path does not require a Developer Portal OAuth app. Use that
separate OAuth credential for other Ads API work. The API uses a bearer token
with `adsconversions`; see [Reddit API authentication](https://ads-api.reddit.com/docs/v3/authenticate-your-developer-application).

Use these application names. They follow [`ad-conversion-hub`](../ad-conversion-hub/SKILL.md).
Reddit does not define the environment variable names.

```text
REDDIT_PIXEL_ID    public Pixel identifier
REDDIT_CAPI_TOKEN  server-only Conversion Access Token
```

The Pixel must belong to the same business account as the events. See [About the Reddit Pixel](https://business.reddithelp.com/articles/Knowledge/reddit-pixel).

## Client-side Pixel

Load the official script on every page that can begin attribution, before event
calls. Reddit documents manual, GTM, Shopify, and partner installs in [About the Reddit Pixel](https://business.reddithelp.com/articles/Knowledge/reddit-pixel).

```html
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init', '<REDDIT_PIXEL_ID>');
rdt('track', 'PageVisit');
</script>
```

Fire the conversion on the page where the action completes. For a purchase,
use the payment transaction ID as the deduplication value.

```js
rdt('track', 'Purchase', { value: 25, currency: 'USD', conversionId: '<canonical-event-id>' });
```

The client field is `conversionId`. The CAPI field is
`metadata.conversion_id`. Keep the value identical. Do not use a page-load
timestamp. Reddit also supports an Event Setup Tool, GTM, Shopify, and partner
integrations. Use one client implementation, or share the same ID.

## Canonical event mapping

The hub owns the canonical name. This adapter owns Reddit's spelling. See [Reddit's standard event list](https://business.reddithelp.com/articles/Knowledge/supported-conversion-events).

| Hub event | Pixel event | CAPI `tracking_type` | Custom name |
|---|---|---|---|
| `page_view` | `PageVisit` | `PAGE_VISIT` | — |
| `view_content` | `ViewContent` | `VIEW_CONTENT` | — |
| `lead` | `Lead` | `LEAD` | — |
| `signup` | `Sign Up` | `SIGN_UP` | — |
| `begin_checkout` | — | `CUSTOM` | `BeginCheckout` |
| `purchase` | `Purchase` | `PURCHASE` | — |
| `subscription_start` | — | `CUSTOM` | `SubscriptionStart` |
| `refund` | — | `CUSTOM` | `Refund` |

Custom names are case-sensitive, can use up to 64 UTF-8 characters, and must
not match standard events. Only the 20 most recent show in the dashboard. See [CAPI direct integration](https://ads-api.reddit.com/docs/v3/guides/programs/capi/direct-integration).

## Server-side Conversions API v3

Send from the backend after the business action succeeds. For purchases, use the payment provider webhook. See [Post Conversion Events](https://ads-api.reddit.com/docs/v3/operations/Post%20Conversion%20Events).

```text
POST https://ads-api.reddit.com/api/v3/pixels/{pixel_id}/conversion_events
Authorization: Bearer <REDDIT_CAPI_TOKEN>
Content-Type: application/json
```

The v3 body has a `data` object. A top-level `events` array is a v2 mistake.

```json
{
  "data": { "events": [{
    "event_at": 1700000000000,
    "action_source": "WEBSITE",
    "event_source_url": "https://example.com/thanks?rdt_cid=...",
    "click_id": "<rdt_cid>",
    "type": { "tracking_type": "PURCHASE" },
    "metadata": {
      "conversion_id": "<canonical-event-id>",
      "currency": "USD", "value": 25, "item_count": 1,
      "products": [{"id": "plan_pro", "name": "Pro", "quantity": 1, "item_price": 25}]
    },
    "user": {
      "email": "<sha256-reddit-email>",
      "external_id": "<sha256-stable-user-id>",
      "ip_address": "<client-ip>", "user_agent": "<client-user-agent>",
      "uuid": "<first-party-_rdt_uuid>"
    }
  }]}
}
```

Required fields are `event_at`, `action_source`, and `type.tracking_type`.
`event_at` uses Unix epoch milliseconds. Use `WEBSITE` for web events, and up to
1,000 events per request. Send revenue `value`, ISO 4217 `currency`, and
`item_count`; Reddit strongly recommends them for revenue optimization.

`event_source_url` is recommended for `WEBSITE` events. Reddit uses it for
domain detection and can extract `rdt_cid` if `click_id` is missing. A valid response contains `Successfully processed N conversion events.`

## Identity and consent

The hub gates dispatch. Require `measurement: true` before any event and
`ad_user_data: true` before email, phone, or external IDs. Do not reject an
event only because it has no click ID. Follow the [hub consent and adapter contract](../ad-conversion-hub/SKILL.md).

This adapter sends hashed identity only. Reddit's [match-key and hashing
rules](https://ads-api.reddit.com/docs/v3/guides/programs/capi/direct-integration) are:

- Email: lowercase it. Remove local-part dots and the plus suffix. SHA-256 it
  to 64 lowercase hex digits.
- Phone: normalize to E.164. Include country and area code. Remove the
  extension and non-numeric characters. Ensure `+`, then SHA-256 it.
- External ID: use a stable user ID and SHA-256 it. Send IP, user agent, and
  UUID as documented. Do not hash them.

Do not hash an identifier twice. If measurement is allowed but behavioral
targeting is not, send LDU. `LDU` is the only mode; country is required and
region is optional.

```json
"data_processing_options": {
  "modes": ["LDU"], "country": "US", "region": "US-CA"
}
```

LDU does not replace the hub's measurement consent gate.

## Deduplication

Use one ID for the client and server copies:

- Pixel: `conversionId`.
- CAPI: `metadata.conversion_id`.

Reddit matches the same event type and channel. Pixel events deduplicate
against CAPI `WEBSITE` events, not different channels. It prefers more metadata
and match keys. Events should arrive within two days; the record stays for up to
seven days. See [Reddit's deduplication rules](https://ads-api.reddit.com/docs/v3/guides/programs/capi/direct-integration).

Without a conversion ID, session deduplication needs the same UUID or external
ID on both events. Use the explicit conversion ID path for purchases.

## Click ID persistence

Reddit appends `rdt_cid` to the landing URL. Capture it on first landing and
preserve it through redirects, signup, and checkout. Reddit documents a
first-party cookie, browser storage, or server session; use a server session
when possible. See [Click ID persistence](https://ads-api.reddit.com/docs/v3/capi-click-id-persistence).

Reddit does not document a native `rdt_cid` expiration. Retain it for the
selected window. The default is 28-day click-through and one-day view-through.
Click windows are 1, 7, or 28 days. View-through cannot exceed click-through.
Check **Events Manager → Attribution Settings**. See [Web Attribution](https://business.reddithelp.com/articles/Knowledge/Web-Attribution-Overview).

CAPI events must be sent within seven days. This is separate from attribution.
Do not gate a server event on `rdt_cid`; `click_id` is optional.

## Tracking quirks that cause failures

- **v2 payloads fail in v3.** Use `data.events`, `type.tracking_type`, and
  `metadata`.
- **Test Events is limited.** Put `test_id` inside `data`. Only one event per
  request appears, and it can take five seconds. Remove `test_id` in production.
  See [Verify Conversion Events](https://ads-api.reddit.com/docs/v3/capi-verify-events).
- **Pixel tests need third-party cookies.** Use the Reddit Pixel Helper if the
  Events Manager test view is empty.
- **Attribution settings alter totals.** An accepted event can receive no ad
  credit outside the active attribution window.
- **LDU needs a country.** `modes: ["LDU"]` without `country` is invalid.
- **Campaign setup needs a Pixel.** Since July 13, 2026, new ad groups and CBO
  campaigns require `conversion_pixel_id`; see the [v3 change
  history](https://ads-api.reddit.com/docs/v3/history).
- **Reports settle slowly.** Metrics can take up to six hours to stabilize;
  see [Get A Report](https://ads-api.reddit.com/docs/v3/api/get-a-report).

## Secrets: don't assume `process.env` is populated at request time

Some app setups bake environment variables into a generated module at **build time** rather than reading `process.env` directly at runtime (common on serverless/edge platforms where the runtime environment isn't guaranteed to match the build environment). If your pixel/token reads come back empty in production despite being set somewhere in your deploy config, check whether your app has a build-time secret-generation step (grep for wherever your other, working analytics secrets — e.g. a GA4 API secret — are imported from) and match that pattern, rather than assuming a direct `process.env.YOUR_VAR` read will work. This exact mismatch silently no-ops a CAPI integration with no error — the code runs, the `if (!token) return` guard just always takes the empty-token branch.

## No email-match audience product (no lookalike here)

Reddit's custom audiences are **retargeting / device-id (MAID) based — there's no hashed-email upload**, so you can't seed a lookalike from your own user list the way Meta (Custom Audience → Lookalike) or Google (Customer Match) let you. Don't mistake the custom-audience endpoints for an email-match product — for lookalike/seed-audience experiments, use Meta or Google and skip Reddit. See `ad-experiments`.

## Verification

Use request proof, platform proof, and business proof:

1. Require a 2xx response. Do not treat it as platform proof.
2. In **Events Manager → Event Testing**, create a test ID. Send one event and
   check its Pixel ID, event name, conversion ID, match keys, and metadata.
3. Call the server-side [Get Last Fired At](https://ads-api.reddit.com/docs/v3/api/get-last-fired-at)
   endpoint with the same token:

```text
GET https://ads-api.reddit.com/api/v3/pixels/{pixel_id}/last_fired_at
Authorization: Bearer <REDDIT_CAPI_TOKEN>
```

The response gives the latest ISO 8601 time for standard and custom events.
Use [Get A Report](https://ads-api.reddit.com/docs/v3/api/get-a-report) for
attributed counts. Reconcile purchases with the payment provider. Reddit is
not the payment ledger.

## Common pitfalls

- Using a Developer Portal OAuth token instead of a Conversion Access Token.
- Sending a v2 top-level `events` array to the v3 endpoint.
- Putting `event_id` or `conversion_id` at the wrong level.
- Using `SignUp` or `SIGNUP` instead of `Sign Up` and `SIGN_UP`.
- Reusing one conversion ID for several events.
- Losing `rdt_cid` during a redirect or checkout handoff.
- Sending different event types or channels from Pixel and CAPI.
- Sending raw identity or logging request bodies.
- Letting a Reddit timeout fail a payment webhook. Apply the hub retry policy.

## Security

Keep `REDDIT_CAPI_TOKEN` in the deployment secret store. Never put it in a
browser bundle, URL, log, screenshot, or pull request. Load the Pixel only from
`https://www.redditstatic.com/ads/pixel.js` over HTTPS. Restrict raw identity
access. Record consent. Delete temporary normalized values after dispatch.
