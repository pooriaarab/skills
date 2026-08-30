---
name: pinterest-ads
description: "Set up Pinterest Business advertising and conversion tracking for a web app — create an advertiser account in a supported market, generate a Pinterest Tag and conversion token, map the shared conversion hub to Pinterest Tag and Conversions API events, persist the epik click identifier, deduplicate browser and server events with event_id, and verify delivery in Test events, Conversions Health, and the API response. Use when wiring Pinterest Tag, Pinterest Conversions API, checkout or signup tracking, catalog campaigns, or Pinterest attribution debugging."
---

# Pinterest Ads

Pinterest has a public, self-serve Conversions API. A Pinterest Business
account and an advertiser account are the real gates. The CAPI conversion token
does not need a Pinterest app or app ID. [Conversions API overview](https://help.pinterest.com/en/business/article/the-pinterest-api-for-conversions)

Use this skill with `ad-conversion-hub`. The hub owns event timing, consent,
normalization, hashing, retries, durable dispatch, and failure isolation. This
skill owns Pinterest names, fields, endpoints, and account settings.

## Account and API access

1. Create a free Pinterest Business account from a desktop device, or convert
   a personal account. The email must not already belong to another Pinterest
   account when creating a new one. [Create a Business account](https://help.pinterest.com/en/business/article/get-a-business-account)
2. In Business Manager, open **Ad accounts**, select **Create ad account**,
   choose the country, and assign people. Pinterest does not allow a later
   currency change. [Create an advertiser account](https://help.pinterest.com/en/business/article/create-an-advertiser-account)
3. Check that the advertiser country is supported. Pinterest blocks direct ad
   setup in other markets. Some markets use an advertising partner such as
   Aleph, Mediadonuts, or DMS. [Ads availability](https://help.pinterest.com/en/business/article/promoted-pins-overview)
   Campaign API use also needs Business Access, the Advertising Services
   Agreement, a business profile, and billing. [Ads API prerequisites](https://developers.pinterest.com/docs/work-with-ads/ads-overview/)
4. For CAPI only, open **Ads Manager → Ad Account Overview → Conversions →
   Conversions API → Set up API**, choose **Conversion access token**, and
   generate a token. Copy the token and advertiser ID immediately. [Generate a conversion token](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)
5. Use `PINTEREST_TAG_ID` in the browser, `PINTEREST_AD_ACCOUNT_ID` in the
   server endpoint, and `PINTEREST_CAPI_TOKEN` in the server secret store.
6. If the integration also uses campaigns, audiences, or other Pinterest API
   endpoints, use an OAuth token with at least `ads:write` and an advertiser ID.
   Register an app, accept the Developer Terms, and request trial access first.
   A conversion token is not general Pinterest API access. [App access](https://developers.pinterest.com/docs/getting-started/connect-app/) and [CAPI prerequisites](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)

## Pinterest Tag

Load the base code once in the document `<head>` on every page. Run it before
any event code. Use the generated code from Conversion Tag Manager with the ID
in `PINTEREST_TAG_ID`; do not create one tag per page. [Install the base code](https://help.pinterest.com/en/business/article/install-the-base-code)

```html
<script>
  !(function (e) {
    if (!window.pintrk) {
      window.pintrk = function () {
        window.pintrk.queue.push(Array.prototype.slice.call(arguments));
      };
      var n = window.pintrk;
      n.queue = [];
      n.version = '3.0';
      var t = document.createElement('script');
      t.async = true;
      t.src = e;
      var r = document.getElementsByTagName('script')[0];
      r.parentNode.insertBefore(t, r);
    }
  })('https://s.pinimg.com/ct/core.js');
  pintrk('load', '<PINTEREST_TAG_ID>');
  pintrk('page');
</script>
```

Fire the event code only after the user action. A conversion event placed in a
confirmation page fires again on every reload. For a purchase, send the same
hub `event_id` in the Tag event object:

```js
pintrk('track', 'checkout', {
  event_id: '<shared-event-id>',
  value: 25.00,
  currency: 'USD',
  order_id: '<order-id>',
  order_quantity: 1,
});
```

Pinterest documents `eventID`, `event_id`, and `eid` as accepted, case-sensitive
Tag fields. Use `event_id` in this adapter. [Tag event data](https://help.pinterest.com/en/business/article/add-event-codes)

Call `pintrk('setconsent', true)` only after the hub grants measurement consent.
Call it with `false` when consent is denied. `false` stops events and deletes
Pinterest first-party session storage. [Tag consent](https://help.pinterest.com/en/business/article/install-the-base-code)

The Tag can send enhanced match data. Pinterest hashes an unhashed email before
transmission. The hub still requires consent before identity collection. Use
the hub's lowercased, trimmed SHA-256 values. [Enhanced match](https://developers.pinterest.com/docs/track-conversions/pinterest-tag/)

## Conversions API

Send a server event after the payment provider confirms the charge. Do not wait
for a click ID. Pinterest can match with hashed identity or client data.

```http
POST https://api.pinterest.com/v5/ad_accounts/<PINTEREST_AD_ACCOUNT_ID>/events
Authorization: Bearer <PINTEREST_CAPI_TOKEN>
Content-Type: application/json
```

The body has a `data` array. Each event requires `action_source`, `event_id`,
`event_name`, and `event_time`. Use `web` for website events. `event_time` is
Unix seconds. `user_data` must contain `em`, `hashed_maids`, or the pair
`client_ip_address` and `client_user_agent`. [Send conversion events](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)

```json
{
  "data": [
    {
      "action_source": "web",
      "event_name": "checkout",
      "event_time": 1769818901,
      "event_id": "<shared-event-id>",
      "event_source_url": "https://example.com/checkout/complete",
      "opt_out": false,
      "user_data": {
        "em": ["<sha256-email>"],
        "external_id": "<sha256-user-id>",
        "click_id": "<epik-cookie-value>",
        "client_ip_address": "<client-ip>",
        "client_user_agent": "<client-user-agent>"
      },
      "custom_data": {
        "value": "25.00",
        "currency": "USD",
        "order_id": "<order-id>",
        "num_items": 1
      }
    }
  ]
}
```

`em`, `external_id`, and `ph` are SHA-256 values. Normalize email to lowercase
before hashing. Normalize phone to digits with country code, area code, and
number. Remove symbols, letters, spaces, and leading zeros. Follow the hub's
identity rules and consent gate. [User data formatting](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)

For purchases, Pinterest calls the standard event `checkout`. Its `order_id`
is recommended for CAPI and required for Tag conversion analysis reporting.
Send the pre-tax, pre-shipping value and the ISO-4217 currency. Pinterest
accepts `value` as a string and parses it as a number. [CAPI parameter reference](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/) and [Tag event data](https://help.pinterest.com/en/business/article/add-event-codes)

The response can contain mixed results. Check `num_events_processed` and each
event's `status`; do not treat an HTTP 200 response as proof that every event
was processed. [CAPI response example](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)

## Hub event mapping

Use the same canonical `event_id` in both browser and server events. The API
uses snake case names. The Tag uses the corresponding event names shown below;
Pinterest's code examples also show their lowercase forms.

| Hub event | CAPI `event_name` | Tag event | Notes |
| --- | --- | --- | --- |
| `page_view` | `page_visit` | `PageVisit` / `pagevisit` | Send on route or page load. |
| `view_content` | `view_content` | `ViewContent` / `viewcontent` | Send on a meaningful product or plan view. |
| `lead` | `lead` | `Lead` / `lead` | Send after a qualified form submit. |
| `signup` | `signup` | `SignUp` / `signup` | Send after account creation. |
| `begin_checkout` | `initiate_checkout` | `InitiateCheckout` / `initiatecheckout` | Send when checkout starts. |
| `purchase` | `checkout` | `Checkout` / `checkout` | Send after a confirmed charge. |
| `subscription_start` | `subscribe` | `Subscribe` / `subscribe` | Closest standard event. Confirm campaign semantics. |
| `refund` | custom `refund` | custom `refund` | No standard refund event. Map the custom event to a standard event only if reporting needs it. |

These names and purposes come from Pinterest's conversion event table. Custom
events support audience creation, but need a standard-event mapping for
conversion reporting. [Conversion event types](https://developers.pinterest.com/docs/track-conversions/understand-conversions-and-how-to-track-them/)

## Deduplication

Pinterest deduplicates redundant Tag and API events with matching `event_id`
and `event_name`. The Tag's `eventID` value must equal the API's `event_id`
value. Pinterest keeps the first event and removes duplicates within 48 hours.
Use the payment transaction ID for a purchase when possible. [Deduplication and event IDs](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)

Do not reuse a purchase ID for a refund or another event. Do not send a new
random ID when retrying a request. Let the hub retry policy and durable dispatch
record control retries.

## Click ID and attribution

Pinterest adds `epik` to the landing URL. The Tag caches it in first-party
`_epik`. Send that cookie as `user_data.click_id`; Pinterest prefers it when a
redirect removes the URL value. [CAPI click ID](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/) and [Pinterest cookies](https://help.pinterest.com/en/business/article/pinterest-tag-parameters-and-cookies)

Tag cookies persist for one year from installation, but users can delete them.
`epik`'s separate expiry is UNVERIFIED; Pinterest does not publish one. The
default reporting window is one-day view and 30-day click. [Cookie behavior](https://help.pinterest.com/en/business/article/pinterest-tag-parameters-and-cookies) and [Conversion windows](https://help.pinterest.com/en/business/article/conversion-insights)

Capture `epik` on first landing. Store first-touch and most-recent values in
first-party storage under the hub's retention policy. Also pass the browser's
`_epik` cookie to the server at conversion time. Never make the click ID a
condition for sending a purchase; organic and direct purchases still need
measurement.

## Tracking quirks that bite

- Each advertiser account needs its own Tag. The base code runs once before
  event code. A page-load event fires again on every reload. [Tag setup](https://help.pinterest.com/en/business/article/create-an-advertiser-account)
- Tag reporting exposes `value` and `order_quantity`. CAPI accepts richer data,
  but purchase `order_id`, value, and currency must be correct. [Tag event data](https://help.pinterest.com/en/business/article/add-event-codes)
- Send CAPI events within one hour. Production batches allow 1,000 events.
  Test batches process only the first 20. [CAPI best practices](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)
- Use `web` for browser events. Other sources are `app_android`, `app_ios`, and
  `offline`. Automatic enhanced match is an Ads Manager setting that can hash
  form fields in certain regions. Align it with consent. [Action sources and match](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)
- Conversion Insights can take days to build. Its selected windows can differ
  from Ads reporting and analytics. [Conversion Insights](https://help.pinterest.com/en/business/article/conversion-insights)

## Verification

1. Send a test request to the same endpoint with `?test=true`. Test data goes
   to a sandbox and does not affect reporting or optimization.
2. Open **Ads Manager → Campaign manager → Conversions → Test events**. Confirm
   the event appears there. [CAPI test events](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)
3. For production, require each response event to be `processed`. Then inspect
   Conversions Health and the deduplication view. [Conversions Health](https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/)
4. Confirm Tag `verified` status and Tag Event History. This can take up to
   three hours. Reconcile processed `checkout` events with succeeded charges. [Tag verification](https://developers.pinterest.com/docs/track-conversions/pinterest-tag/)

## Common pitfalls

- Use `PINTEREST_CAPI_TOKEN`, not a browser-visible token or `PINTEREST_ADS_TOKEN`.
- Put the advertiser ID in the URL path. Use `checkout` for a completed
  purchase; use `initiate_checkout` only when checkout starts.
- Include dynamic `order_id`, `value`, and `currency`. Do not use zero,
  negative, static, or pre-tax-incorrect values.
- Do not use `epik` as the send gate. Do not replace `_epik` with a new ID.
- Do not send raw email or phone values in CAPI or Tag image requests. Check
  each event status in a mixed response. Match reporting windows before comparing
  Pinterest with last-click analytics.

## Security

Keep `PINTEREST_CAPI_TOKEN` in the server secret store. Never put it in client
JavaScript, URLs, logs, screenshots, or commits. Use HTTPS and the hub consent
gate. Keep raw identity data server-side. Load `https://s.pinimg.com/ct/core.js`
only as the official Pinterest Tag script.
