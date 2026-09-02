---
name: ads-roku
description: "Set up Roku Ads Manager tracking — self-serve account and CAPI-key creation, JavaScript Pixel and server-side Conversions API, event-name mapping to the hub taxonomy, identity hashing and consent, deduplication, and verification against Ads Manager reporting. Use when integrating Roku Ads Manager, mapping hub events to Roku CAPI event names, or debugging missing Roku conversions."
---

# Roku Ads

Roku Ads Manager is self-serve. It supports a JavaScript Pixel and server-to-server CAPI for web, app, and offline events. [Roku Ads Manager overview](https://help.ads.roku.com/en/articles/7154107-getting-started-with-roku-ads-manager)

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event envelope, consent gate, identity rules, retries, and adapter contract. Pair this skill with [ad-experiments](../ad-experiments/SKILL.md) for audience tests, seed sizing, and PII-export authorization.

## Account and access

Roku documents self-serve signup at [ads.roku.com](https://ads.roku.com). The
signup flow collects organization details, email, agency status, consent to the
Ads Manager terms, and the B2B privacy notice. Roku sends an activation link.
Create the ad account with business details. [Create an account](https://help.ads.roku.com/en/articles/7154583-creating-an-account)

An organization or account admin generates the CAPI credential in Ads Manager:
open **Events**, select **CAPI**, then select **Generate an API key**. Roku says
the key does not expire and can be revoked if compromised. [CAPI authentication](https://help.ads.roku.com/en/articles/8880744-conversions-api)

These local adapter names are not Roku-defined environment variables:

```text
ROKU_PIXEL_ID       public Pixel ID from the Ads Manager event setup
ROKU_EVENT_GROUP_ID event group ID for the website, app, or channel
ROKU_CAPI_API_KEY   server-only key generated in Ads Manager
```

The fetched Roku CAPI reference documents event and test submission only. It
does not document campaign CRUD or a reporting API. Use Ads Manager for setup.
Do not invent a campaign-management endpoint.
[CAPI reference](https://help.ads.roku.com/en/articles/8880744-conversions-api)

## Client-side JavaScript Pixel

Find the Pixel in **Events → Set up events with Roku**. Install the generated
base code in the website header. Roku says events cannot fire without the base
Pixel, and the base Pixel automatically includes `PAGE_VIEW`. [Pixel setup](https://help.ads.roku.com/en/articles/7062023-setting-up-javascript-pixels-and-events)

Roku’s published example loads its CDN script and initializes the Pixel:

```html
<script>
  !function(e,r){if(!e.rkp){var t=e.rkp=function(){
    var e=Array.prototype.slice.call(arguments);
    e.push(Date.now()),t.eventProcessor?t.eventProcessor.apply(t,e):t.queue.push(e)
  };t.initiatorVersion="1.0",t.queue=[],t.load=function(e){
    var t=r.createElement("script");t.async=!0,t.src=e;
    var n=r.getElementsByTagName("script")[0];
    (n?n.parentNode:r.body).insertBefore(t,n)
  },rkp.load("https://cdn.ravm.tv/ust/dist/rkp.loader.js")}
  }(window,document);
  rkp("init", "<ROKU_PIXEL_ID>");
</script>
```

Add selected events after the base code, close to the action that occurred:

```js
rkp("event", "SIGN_UP", { event_id: canonicalEvent.event_id });
rkp("event", "PURCHASE", {
  event_id: canonicalEvent.event_id,
  value: canonicalEvent.value,
  currency: canonicalEvent.currency,
  order_id: canonicalEvent.order_id,
});
```

## Rule setup and event mapping

Roku Ads Manager lets an advertiser choose which events to implement and which
events to use as conversions for reporting and optimization. The documented
standard event names include the following mappings. [Event types](https://help.ads.roku.com/en/articles/9451109-event-types)

| Hub event | Roku event name | Dispatch condition |
| --- | --- | --- |
| `page_view` | `PAGE_VIEW` | Base Pixel page view or an intentional server page view |
| `view_content` | `VIEW_CONTENT` | Meaningful content or plan view |
| `lead` | `LEAD` | Qualified lead submission |
| `signup` | `SIGN_UP` | Account or program signup completes |
| `begin_checkout` | `INITIATE_CHECKOUT` | Checkout starts |
| `purchase` | `PURCHASE` | Payment provider confirms the charge |
| `subscription_start` | `SUBSCRIBE` | Paid subscription starts |
| `refund` | No documented `REFUND` event | Reconcile in the payment system |

`SUBSCRIPTION_CANCELLATION` and `SUBSCRIPTION_RENEWAL` are also documented
event names. Use them only for those lifecycle events. [CAPI event names](https://help.ads.roku.com/en/articles/8880744-conversions-api)

## Server-side Conversions API

Roku documents this CAPI endpoint:

```text
POST https://events.ads.rokuapi.net/v1/events
```

Use HTTPS and JSON. Roku documents these headers:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <ROKU_CAPI_API_KEY>
```

The body requires `event_group_id` and `events`. Roku accepts up to 1,000 events in one array and validates each event independently. [CAPI body](https://help.ads.roku.com/en/articles/8880744-conversions-api)

```json
{
  "event_group_id": "<ROKU_EVENT_GROUP_ID>",
  "events": [
    {
      "event_id": "<CANONICAL_EVENT_ID>",
      "event_name": "PURCHASE",
      "event_type": "conversion",
      "event_time": 1730017211,
      "event_source": "website",
      "event_source_url": "<EVENT_SOURCE_URL>",
      "user_data": {
        "is_hashed": true,
        "em": "<SHA256_EMAIL_HEX>"
      },
      "custom_data": {
        "value": 25.00,
        "currency": "USD",
        "order_id": "<ORDER_ID>"
      },
      "opt_out": "false"
    }
 ]
}
```

Roku documents `value`, `currency`, and `order_id` in optional `custom_data`; include them for purchase revenue reporting. [Custom data parameters](https://help.ads.roku.com/en/articles/8880744-conversions-api)

For CAPI, `event_name`, `event_time`, `event_type`, and `user_data` are required
event fields. `event_time` is a UNIX timestamp in epoch seconds; set `event_type` to `conversion`. [Event object parameters](https://help.ads.roku.com/en/articles/8880744-conversions-api)

Roku documents `200` for success and `210` for partial success. A response can
include `failed_events` with an error for each invalid event. Record that
response in the hub dispatch log and retry only under the hub policy. [CAPI responses](https://help.ads.roku.com/en/articles/8880744-conversions-api)

## Identity and consent

Roku requires `user_data` and at least one supported identifier. Its CAPI
reference lists IP address, `em`, `ph`, `aGA`, `AID`, `aDX`, `aGI`, and
`aRI` as accepted identifier options. [User data requirements](https://help.ads.roku.com/en/articles/8880744-conversions-api)

For email and phone, Roku requires normalization before SHA-256 hashing:

- Lowercase and trim email.
- Remove the alias between `+` and `@` in an email address.
- Format a phone number as E.164 with its leading `+` and country code.
- Remove phone formatting characters and local leading zeros.
- Send a 64-character lowercase hexadecimal hash, not Base64.

These rules come from Roku’s CAPI reference. Do not double-hash an existing
digest. [Normalization and hashing](https://help.ads.roku.com/en/articles/8880744-conversions-api) and [hub identity rules](../ad-conversion-hub/SKILL.md)

Apply the hub consent gate before hashing or dispatch. Require measurement
consent before any Roku event. Require ad-user-data consent before sending
hashed email, phone, or external identifiers. Keep raw identifiers inside the
server boundary. [Hub consent contract](../ad-conversion-hub/SKILL.md)

Roku documents `opt_out` as an optional LDU field. The string value `"true"`
triggers the LDU flag. Map the approved consent decision to this field only
when the event is otherwise allowed to dispatch. [Roku LDU field](https://help.ads.roku.com/en/articles/8880744-conversions-api)

## Click ID and first-party cookie

The fetched Roku CAPI schema documents `referrer_url`, but it does not define a
Roku-owned click-ID query parameter. Do not invent a click parameter or treat
`aRI` as one. Roku does document `utm_source`, `utm_medium`,
`utm_campaign`, `utm_term`, and `utm_content` as optional custom-data fields.
[CAPI fields](https://help.ads.roku.com/en/articles/8880744-conversions-api)

Roku documents a first-party cookie created by the Pixel and limited to the
advertiser’s web domain. The CAPI user-data field for that value is `aFC`, and
Roku says it should not be hashed. Capture it only with consent and pass it
through the adapter when available. [First-party cookie matching](https://help.ads.roku.com/en/articles/8987555-advanced-alias-matching-first-party-cookies) and [CAPI user data](https://help.ads.roku.com/en/articles/8880744-conversions-api)

In Ads Manager, first-party cookies are enabled by default. Advanced alias
matching requires manual enablement. These controls are under **Events → event
group → Settings → Data collection options**. [Data collection options](https://help.ads.roku.com/en/articles/8987555-advanced-alias-matching-first-party-cookies)

## Deduplication

Roku deduplicates a Pixel event and a CAPI event when both carry the same
`event_id` and fire within 10 minutes. Generate one hub ID, pass it to both
paths, and do not create a second browser ID. [Roku deduplication rule](https://help.ads.roku.com/en/articles/8880744-conversions-api)

Use the payment transaction ID as the canonical purchase ID when the hub can
provide it. Do not require a click ID before sending a confirmed purchase. The
hub owns that event-ID and no-click-ID behavior. [Hub event contract](../ad-conversion-hub/SKILL.md)

## Ads Manager settings that override code

- The event group binds Pixel, CAPI, and partner connections to a property. Keep
  `ROKU_EVENT_GROUP_ID` aligned with Ads Manager. [Event groups](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)
- The campaign goal controls optimization. Confirm the event fires before
  selecting it as the goal. [Campaign goals and events](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)
- Ads Manager can report events beyond the selected goal. [Event reporting](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)
- Custom Audiences can use Pixel or CAPI event data. Customer-list audiences
  require at least 1,000 matched Roku households. [Custom Audiences](https://help.ads.roku.com/en/articles/9471526-custom-audiences)
- Roku’s FAQ documents a 14-day view-through attribution window. Treat that as
  the current documented view-through rule, not as a universal click window. [Attribution window](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)

## Verification

Test the payload with the documented endpoint:

```text
POST https://events.ads.rokuapi.net/v1/test_events
```

Use the same JSON body and authorization headers as production. Roku says this
endpoint validates the payload without processing or ingesting the events. [Test CAPI endpoint](https://help.ads.roku.com/en/articles/8880744-conversions-api)

Verify in three layers:

1. **Request proof:** record the redacted CAPI response. Check `code`,
   `events_received`, and `failed_events`. A `200` proves request acceptance.
   It does not prove attribution. [CAPI response fields](https://help.ads.roku.com/en/articles/8880744-conversions-api)
2. **Platform proof:** inspect the Ads Manager Events page, Pixel diagnostics,
   and campaign reporting. Roku says event data can take up to four hours to
   arrive. [Event troubleshooting](https://help.ads.roku.com/en/articles/7062019-event-implementation-troubleshooting)
3. **Business proof:** reconcile attributed purchases and subscriptions with
   payment-provider truth. The dashboard is an attribution view, not the
   payment ledger. [Hub verification](../ad-conversion-hub/SKILL.md)

## Common pitfalls and security

- Use `event_time` in epoch seconds. Do not send milliseconds. [CAPI event fields](https://help.ads.roku.com/en/articles/8880744-conversions-api)
- Use `event_source_url` in CAPI. The Pixel metadata spelling is
  `event_source_URL`; do not mix the two payloads. [CAPI fields](https://help.ads.roku.com/en/articles/8880744-conversions-api) and [Pixel fields](https://help.ads.roku.com/en/articles/7062023-setting-up-javascript-pixels-and-events)
- Keep the event group ID and API key exact. Roku says event group IDs are case
  sensitive. [CAPI troubleshooting](https://help.ads.roku.com/en/articles/7062019-event-implementation-troubleshooting)
- Do not treat a CAPI `200`, a Pixel request, or a live campaign as attributed
  conversion proof. Check Events and reporting, then reconcile business truth.
  [Roku event reporting FAQ](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)
- Keep `ROKU_CAPI_API_KEY` in the server secret store. Never put it in a browser
  bundle, URL, log, screenshot, or commit.
- Load the Pixel only from the official HTTPS origin shown in Roku’s setup
  example. [Pixel loader](https://help.ads.roku.com/en/articles/7062023-setting-up-javascript-pixels-and-events)
- Hash identifiers only after consent permits ad-user data. Delete temporary
  normalized identifiers after dispatch. [Hub security rules](../ad-conversion-hub/SKILL.md)
- A missing key or event group must return a logged `skipped` result. It must
  not fail a successful payment webhook. [Hub adapter contract](../ad-conversion-hub/SKILL.md)

## Official sources checked (2026-08-31)

- [Creating an account](https://help.ads.roku.com/en/articles/7154583-creating-an-account)
- [Setting up JavaScript Pixels and Events](https://help.ads.roku.com/en/articles/7062023-setting-up-javascript-pixels-and-events)
- [Conversions API](https://help.ads.roku.com/en/articles/8880744-conversions-api)
- [Event Types](https://help.ads.roku.com/en/articles/9451109-event-types)
- [Advanced Alias Matching and First-Party Cookies](https://help.ads.roku.com/en/articles/8987555-advanced-alias-matching-first-party-cookies)
- [Event Tracking and Reporting FAQ](https://help.ads.roku.com/en/articles/13907239-event-tracking-and-reporting-faq)
- [Custom Audiences](https://help.ads.roku.com/en/articles/9471526-custom-audiences)
- [Event Implementation Troubleshooting](https://help.ads.roku.com/en/articles/7062019-event-implementation-troubleshooting)
