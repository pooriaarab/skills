---
name: ads-snapchat
description: "Use when creating a Snapchat Ads account, installing Snap Pixel, sending web conversions through Snapchat Conversions API v3, pairing Pixel and CAPI events, preserving ScCid, or debugging consent, attribution windows, event age, and Events Manager verification."
---

# Snapchat Ads

Snapchat supports self-serve Ads Manager accounts and a public web Conversions API.
Use one Pixel ID for the browser Pixel and web CAPI. Use the hub for consent,
normalization, dispatch, retries, and payment reconciliation.
## Account and API access

1. Open [Snap Ads Manager](https://ads.snapchat.com/) and select **Sign Up**.
2. Create a Snapchat account, business account, and Public Profile.
3. Enter the business country, currency, phone number, and website.
4. Create the ad account and add a payment method before launch.
Snap's [business setup guide](https://businesshelp.snapchat.com/articles/en_US/Knowledge/set-up-snapchat)
documents this self-serve path. Sign-up is country-limited. Check Snap's
[current eligible-country list](https://businesshelp.snapchat.com/s/article/business-countries?language=en_US).
Ads require a Public Profile.
Create the Pixel in Ads Manager. It belongs to an ad account and has a UUID. See
the [Snap Pixel reference](https://developers.snap.com/marketing-api/Ads-API/snap-pixel).
Conversions API access needs a Business Manager. An Organization Admin opens
**Ads Manager → Business Details → Conversions API Tokens** and generates a static,
long-lived token. It does not expire and only works with assets in that organization.
Snap also supports partner integrations. See [CAPI access requirements](https://developers.snap.com/marketing-api/Conversions-API/GetStarted).
Use these adapter names. Snap does not define process environment variable names:

```text
SNAPCHAT_ADS_PIXEL_ID   public Pixel UUID; safe in the browser
SNAPCHAT_ADS_CAPI_TOKEN server-only long-lived CAPI token
```

## Client-side Snap Pixel

Load the official asynchronous script once in the document head on every page.
The [official installation example](https://developers.snap.com/marketing-api/Ads-API/snap-pixel)
loads `https://sc-static.net/scevent.min.js`, initializes the Pixel ID, and tracks
`PAGE_VIEW`. A current [Snap installation guide](https://businesshelp.snapchat.com/articles/en_US/Knowledge/pixel-bigcommerce)
also places the script in the head on all pages.

```html
<script type="text/javascript">
(function (e, t, n) {
  if (e.snaptr) return;
  var a = e.snaptr = function () {
    a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
  };
  a.queue = [];
  var s = 'script';
  var r = t.createElement(s);
  r.async = true;
  r.src = n;
  var u = t.getElementsByTagName(s)[0];
  u.parentNode.insertBefore(r, u);
})(window, document, 'https://sc-static.net/scevent.min.js');

snaptr('init', '<SNAPCHAT_ADS_PIXEL_ID>');
snaptr('track', 'PAGE_VIEW');
</script>
```

Send a canonical event ID as `client_dedup_id` when the browser and server both
send the event. For a purchase, also send the same order reference as
`transaction_id`:

```js
snaptr('track', 'PURCHASE', {
  client_dedup_id: event.event_id,
  transaction_id: event.order_id,
  price: event.value,
  currency: event.currency,
});
```

Do not pass raw email to the Pixel. Apply consent and Snap's hashing rules to any
user data. The [Pixel FAQ](https://businesshelp.snapchat.com/articles/en_US/Knowledge/snap-pixel-faq)
says Snap accepts SHA-256 hashed user data.

## Server-side Conversions API v3

Send web events to:

```text
POST https://tr.snapchat.com/v3/{PIXEL_ID}/events?access_token={TOKEN}
Content-Type: application/json
```

The [CAPI request guide](https://developers.snap.com/marketing-api/Conversions-API/UsingTheAPI)
requires `event_name`, `event_time`, `action_source`, and `event_source_url` for
web events. It requires at least one matching signal: hashed `em`, hashed `ph`,
or both `client_ip_address` and `client_user_agent`. A `PURCHASE` also requires
`value` and `currency` in `custom_data`.

```json
{
  "data": [{
    "event_name": "PURCHASE",
    "event_time": "<epoch_seconds>",
    "event_source_url": "https://example.com/checkout/complete",
    "action_source": "WEB",
    "event_id": "payment_evt_123",
    "user_data": {
      "em": ["<sha256(trim(email).toLowerCase())>"],
      "ph": ["<sha256(country-code digits)>"],
      "client_ip_address": "<request IP>",
      "client_user_agent": "<request user-agent>",
      "sc_click_id": "<ScCid value>",
      "sc_cookie1": "<_scid value>"
    },
    "custom_data": {
      "value": 49.99,
      "currency": "USD",
      "order_id": "order_123"
    }
  }]
}
```

Snap's [parameter reference](https://developers.snap.com/marketing-api/Conversions-API/Parameters)
defines the identity rules:

- `em`: trim, lowercase, then SHA-256 hash as UTF-8.
- `ph`: include the country code, remove `+`, spaces, punctuation, and the national
  leading zero, then SHA-256 hash.
- `client_ip_address`, `client_user_agent`, `sc_click_id`, and `sc_cookie1` are
  not hashed.
- `external_id` is a stable first-party ID. Hashing is recommended.

Apply the [ad-conversion-hub](../ad-conversion-hub/SKILL.md) consent gate before
hashing or dispatch. Do not require `ScCid` before sending a purchase. Organic,
direct, email, and SEO purchases still need measurement.

### Canonical event mapping

Use uppercase Snap event names. The supported names include `PURCHASE`,
`START_CHECKOUT`, `VIEW_CONTENT`, `SIGN_UP`, `PAGE_VIEW`, `SUBSCRIBE`, and five
custom events. See the [official event list](https://developers.snap.com/marketing-api/Conversions-API/Parameters).

| Hub event | Snap event | Adapter note |
|---|---|---|
| `page_view` | `PAGE_VIEW` | Send the full page URL. |
| `view_content` | `VIEW_CONTENT` | Put product IDs in `content_ids`. |
| `lead` | **UNMAPPED** | Snap lists no native `LEAD` event. Do not invent one. |
| `signup` | `SIGN_UP` | Keep the same ID in `client_dedup_id` and `event_id`. |
| `begin_checkout` | `START_CHECKOUT` | Use `checkout_id` as the event ID when stable. |
| `purchase` | `PURCHASE` | Send `value`, `currency`, and `order_id`. |
| `subscription_start` | `SUBSCRIBE` | Send `subscription_id` without hashing. |
| `refund` | **UNMAPPED** | Snap lists no native `REFUND` event. Do not invent one. |

Snap supports `CUSTOM_EVENT_1` through `CUSTOM_EVENT_5`, but assigns them no meanings.
Do not silently map `lead` or `refund` to one.
## Deduplication

For web, Snap matches the Pixel's `client_dedup_id` with CAPI's top-level
`event_id`. Use the same opaque value, Pixel ID, and event name on both sides.
The [deduplication guide](https://developers.snap.com/marketing-api/Conversions-API/Deduplication)
says the normal cross-channel window is 48 hours.

For `PURCHASE`, send the order reference too. The Pixel field is `transaction_id`.
CAPI v3 calls the same value `custom_data.order_id`. Snap documents this as a
fallback deduplication signal with a window of up to 30 days.

If the Pixel creates its own ID, it cannot match a server event. Set
`client_dedup_id` yourself when shipping both sources.

## Click ID and cookies

Snap appends `ScCid` to an ad destination URL. Send it as `user_data.sc_click_id`,
or send the full URL in `event_source_url` and let CAPI extract it. The [CAPI click-ID guide](https://developers.snap.com/marketing-api/Conversions-API/UsingTheAPI)
says to persist it for all later events in that session.

Snap does not state a browser-cookie TTL for `ScCid` in the current CAPI docs.
**UNVERIFIED:** do not claim a vendor storage lifetime. Store first-touch and
most-recent values in first-party storage under the product's retention policy.
Pass the Pixel's `_scid` cookie as `sc_cookie1` when available.

The [Ads API measurement reference](https://developers.snap.com/marketing-api/Ads-API/measurement)
supports swipe-up attribution windows of 1, 7, or 28 days, and view windows of
1 hour, 3 hours, 6 hours, 1 day, or 7 days. These are attribution windows, not a
browser storage TTL.

## Tracking quirks that cause failures

- Current v3 parameters say `event_time` cannot be more than 7 days old. Send the
  actual conversion time in epoch seconds or milliseconds. Send events promptly.
- Web CAPI needs `event_source_url`, even when the event came from a webhook.
- A request can be syntactically valid but fail matching without `em`, `ph`, or
  the IP-plus-user-agent pair. Keep these fields when consent allows them.
- For web opt-out handling, Snap documents `data_processing_options: ["LMU"]`.
  Older examples use `data_use: ["lmu"]`; follow the current [parameter reference](https://developers.snap.com/marketing-api/Conversions-API/Parameters).
- A CAPI token and Pixel from different organizations fail authorization. Generate
  the token in the same Business Manager that owns the Pixel.
- CAPI batches support up to 2,000 events. Apply the hub's bounded retry policy.
- Snap's deduplication diagnostics can take up to 24 hours to update after a fix.
  Do not treat an immediate Ads Manager count as final.
- App events use `snap_app_id`, not `pixel_id`. App events also need
  `app_data.extinfo` and `advertiser_tracking_enabled` for iOS ATT status.

## Verification

Use Snap's server-side validation endpoints before production dispatch:

```bash
curl -sS -X POST \
  "https://tr.snapchat.com/v3/$SNAPCHAT_ADS_PIXEL_ID/events/validate?access_token=$SNAPCHAT_ADS_CAPI_TOKEN" \
  -H 'Content-Type: application/json' \
  --data @snap-test-event.json

curl -sS \
  "https://tr.snapchat.com/v3/$SNAPCHAT_ADS_PIXEL_ID/events/validate/logs?access_token=$SNAPCHAT_ADS_CAPI_TOKEN"

curl -sS \
  "https://tr.snapchat.com/v3/$SNAPCHAT_ADS_PIXEL_ID/events/validate/stats?access_token=$SNAPCHAT_ADS_CAPI_TOKEN"
```

The [Verify Setup guide](https://developers.snap.com/marketing-api/Conversions-API/VerifySetUp)
defines `POST /events/validate` as a near-real-time test. A valid response proves
Snap accepted the test payload. The logs show event status and errors. The stats
response shows the test event count in the past hour. Then confirm the event and
deduplication signals in Events Manager Diagnostics, and reconcile production
`PURCHASE` events with payment-provider succeeded charges.

## Common pitfalls

- Using the old v2 endpoint. Use CAPI v3 at `tr.snapchat.com/v3/...`.
- Sending `transaction_id` in CAPI v3 instead of `custom_data.order_id`.
- Generating a different server ID instead of reusing the browser ID.
- Sending raw email or phone values.
- Treating `ScCid` as required for every conversion.
- Sending the wrong time unit, or sending events older than the v3 limit.
- Assuming a `VALID` HTTP response is reporting proof. Check test logs and Diagnostics.
- Creating a Pixel in one organization and a token in another.
- Mapping `lead` or `refund` to an invented native event name.
## Security

Keep `SNAPCHAT_ADS_CAPI_TOKEN` in the deployment secret store. Never expose it to
the browser, commit it, log it, or put it in client URLs. Redact access tokens.
Send only consent-approved identifiers. Hash user identity fields as Snap requires.
Load the Pixel only from Snap's official HTTPS origin. Do not log click IDs or PII.
