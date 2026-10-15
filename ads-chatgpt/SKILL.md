---
name: ads-chatgpt
description: "Set up ChatGPT Ads conversion measurement with the OpenAI Measurement Pixel, Conversions API, Ads Manager event settings, oppref capture, deduplication, and optional custom audiences. Use when wiring ChatGPT Ads signup, lead, checkout, purchase, subscription, or app measurement."
---

# ChatGPT Ads

ChatGPT Ads has a beta Ads Manager, a JavaScript Measurement Pixel, and a
server-side Conversions API. Use the documented surfaces below. Do not infer
vendor fields from another OpenAI API. See [Ads Manager](https://help.openai.com/en/articles/20001206-ads-manager-beta-overview),
[Measurement Pixel](https://developers.openai.com/ads/measurement-pixel), and
[Conversions API](https://developers.openai.com/ads/conversions-api).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Use [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed
sizing, and authorization before exporting customer data.

## Account and access

OpenAI provides self-serve Ads Manager access in supported countries. The
availability page is the authority for the current country list. If a country
is not available for self-service, OpenAI directs advertisers to sign up and
wait for availability; larger advertisers can contact the OpenAI Ads team.
See [Ads Manager availability](https://help.openai.com/en-us/articles/20001245-ads-manager-availability)
and [Advertise in ChatGPT](https://ads.openai.com/).

Create the advertiser account at [Ads Manager](https://ads.openai.com/). The
setup flow requires an OpenAI account, business details, account verification,
billing, and a payment method. Campaigns do not deliver until required setup
steps finish. See [Ads Manager Beta Account Setup](https://help.openai.com/en/articles/20001213).

The Ads API key is issued in Ads Manager **Settings**. Each Ads API key is
scoped to one ad account. Provision the Conversions API key in the Ads Manager
conversions area. Send Ads API requests with `Authorization: Bearer` to
`https://api.ads.openai.com/v1`. See [Ads API authentication](https://developers.openai.com/ads/api-reference/authentication),
[Ads API overview](https://developers.openai.com/ads/api-overview), and
[Conversion setup](https://developers.openai.com/ads/api-reference/conversion-setup).

Store local adapter names `CHATGPT_ADS_API_KEY`, `CHATGPT_ADS_CAPI_KEY`, and
`CHATGPT_ADS_PIXEL_ID` in the server secret store. See [Conversion setup](https://developers.openai.com/ads/api-reference/conversion-setup).

## Client-side OpenAI Measurement Pixel

The Measurement Pixel is a browser SDK. Initialize it with a Pixel ID, then
call `oaiq("measure", ...)` when the measured action occurs. Load the official
SDK near the top of the page `<head>`. See [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel):

~~~
<script>
  (function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];
  w.oaiq=q;var js=d.createElement(s);js.async=true;js.src=u;
  var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(js,f);
  })(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
  oaiq("init",{pixelId:"<CHATGPT_ADS_PIXEL_ID>"});
</script>
~~~

OpenAI requires `pixelId` for initialization. See [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel).

If consent is required, set Pixel consent before initialization. A denial
blocks measurement pings, and blocked events are not replayed after consent:

~~~
oaiq("consent", false);
oaiq("init", { pixelId: "<CHATGPT_ADS_PIXEL_ID>" });
oaiq("consent", true); // Call after measurement consent.
~~~

The Pixel defaults consent to `true` unless code sets `false` or it finds a
stored denial. Apply the hub's consent decision before hashing or dispatching
ad-user data. See [Pixel consent](https://developers.openai.com/ads/measurement-pixel)
and [Conversion Measurement](https://help.openai.com/en/articles/20001409-conversion-measurement).

## Rule setup and event mapping

Create a web Pixel source and an event setting in Ads Manager. For programmatic
setup, call `POST /conversions/pixels` with `name` and
`client_type: "web"`. Then call `POST /conversions/event_settings` with
`name`, `event_type`, `attribution_window_days: 30`, and one
`source_ids` value. The response's `id` is the source ID; `pixel_id` is
used by the Pixel and Conversions API. If these operations are unavailable,
contact the OpenAI partner representative. See [Conversion setup](https://developers.openai.com/ads/api-reference/conversion-setup).

Map the hub events to OpenAI's supported event names. Send only names and data
shapes from [Supported Events](https://developers.openai.com/ads/supported-events):

| Hub event | OpenAI event | Data shape |
| --- | --- | --- |
| `page_view` | `page_viewed` | `contents` |
| `view_content` | `contents_viewed` | `contents` |
| `lead` | `lead_created` | `customer_action` |
| `signup` | `registration_completed` | `customer_action` |
| `begin_checkout` | `checkout_started` | `contents` |
| `purchase` | `order_created` | `contents` |
| `subscription_start` | `subscription_created` | `plan_enrollment` |
| `refund` | Do not dispatch | Reconcile payment truth |

Other supported names include `appointment_scheduled`, `items_added`,
`trial_started`, and `custom`. Use `custom` only when no standard event
fits. The list has no refund event. App events `app_installed` and
`app_opened` are CAPI-only and require `action_source: "mobile_app"`. See
[Supported Events](https://developers.openai.com/ads/supported-events).

For event data, `type` must match the data shape; include `currency` with
`amount`. Monetary values use integer minor units, such as `2599` for USD
25.99. See [event data shapes](https://developers.openai.com/ads/supported-events).

## Server-side Conversions API

Send Conversions API events from your server only. The documented endpoint is
`POST https://bzr.openai.com/v1/events?pid=<PIXEL_ID>`. Use the Conversions API
key as the bearer credential. See [Conversions API](https://developers.openai.com/ads/conversions-api):

~~~
curl -X POST "https://bzr.openai.com/v1/events?pid=<CHATGPT_ADS_PIXEL_ID>" \
  -H "Authorization: Bearer <CHATGPT_ADS_CAPI_KEY>" \
  -H "Content-Type: application/json" \
  --data '{
    "validate_only": false,
    "events": [{
      "id": "<CANONICAL_EVENT_ID>",
      "type": "order_created",
      "timestamp_ms": <EVENT_TIMESTAMP_MS>,
      "oppref": "<OPPREF>",
      "source_url": "https://shop.example.com/checkout/confirmation",
      "action_source": "web",
      "user": {"emails_sha256": ["<SHA256_EMAIL>"]},
      "data": {"type": "contents", "amount": 2599, "currency": "USD"}
    }]
  }'
~~~

Each event requires `id`, `type`, `timestamp_ms`, and `data`. A web event
requires `source_url` when `action_source` is `web`. `oppref` is optional and
must remain unchanged when sent. The event timestamp must be within the last
seven days and no more than ten minutes in the future. See [Conversions API event structure](https://developers.openai.com/ads/conversions-api).

The request supports `validate_only`; `true` validates without saving. A
batch can contain up to 1,000 events, but one failed event fails the batch.
Use the hub's bounded retry and dead-letter policy. Reuse the same event ID on
safe retries. See [Conversions API](https://developers.openai.com/ads/conversions-api).

## Identity and consent

Require `measurement: true` before sending any event. Require
`ad_user_data: true` before hashing or sending email, phone, external ID, or
name identifiers. The hub owns that gate; the adapter must not bypass it.

OpenAI accepts `emails_sha256`, `phone_numbers_sha256`,
`external_ids_sha256`, `first_names_sha256`, and `last_names_sha256`.
Trim and lowercase email. Normalize phone to 8–15 digits with its country
calling code. Trim external IDs and preserve case. Lowercase names and remove
whitespace and ASCII punctuation. Hash the normalized UTF-8 value with SHA-256
and send lowercase 64-character hexadecimal text. Do not send raw identifiers.
See [Conversions API identity guidance](https://developers.openai.com/ads/conversions-api)
and [Pixel user data](https://developers.openai.com/ads/measurement-pixel).

Geographic values are sent as raw strings in the documented user object. Send
only fields that the event and consent record permit. Keep raw identifiers
inside the server boundary and delete temporary normalized values after
dispatch. See [Conversions API user data](https://developers.openai.com/ads/conversions-api).

The Pixel accepts an optional `user` object only at `oaiq("init", ...)`. The
Conversions API puts `user` inside each event. Use `opt_out: true` to opt an
event out of future user-level personalization. See [Pixel user data](https://developers.openai.com/ads/measurement-pixel)
and [Conversions API event fields](https://developers.openai.com/ads/conversions-api).

## Click ID and first-party cookie

OpenAI's click reference is named `oppref`. It appears at the end of the
landing-page URL. Preserve it through redirects and landing-page navigation.
The Pixel captures `oppref` in a first-party cookie, and server events may
include the original value. See [Conversion Measurement](https://help.openai.com/en/articles/20001409-conversion-measurement).

Do not invent or depend on an OpenAI cookie name. Capture `oppref` at first
landing, persist it using the hub's first-party storage rules, and attach the
value to the canonical event when consent permits. Do not require `oppref`
before sending a confirmed purchase; OpenAI documents it as an optional CAPI
field. See [Conversions API event structure](https://developers.openai.com/ads/conversions-api).

## Deduplication

When the Pixel and Conversions API send the same conversion, put the same
canonical ID in Pixel option `event_id` and CAPI field `id`. OpenAI uses the
shared ID to deduplicate the copies. Reuse it when retrying the conversion. See
[Measurement Pixel events](https://developers.openai.com/ads/measurement-pixel),
[Conversions API events](https://developers.openai.com/ads/conversions-api),
and [Conversion Measurement](https://help.openai.com/en/articles/20001409-conversion-measurement).

Do not create a new ID for browser and server copies. An accepted request is
not attribution proof. Reconcile platform reporting with payment-provider truth.

## Ads Manager settings that override code

- Attach the event setting to the campaign before traffic starts. A sent event
  can show zero when its event type does not match the campaign configuration.
  Custom events require **Event type: Custom** and an exact custom event name.
  Historical mismatches do not backfill. See [Measure Results](https://help.openai.com/en/articles/20001214-launch-your-campaign-and-monitor-performance).
- A Conversions-objective campaign selects oCPC and one standard conversion
  event. Custom events are not supported for oCPC, and the objective and event
  cannot change after campaign creation. See [Conversion-optimized Campaigns](https://help.openai.com/en/articles/20001412-create-ocpc-campaigns).
- Ads Manager's `Conversions` total is click-through conversions. Where
  available, one-day view-through conversions appear separately, and a
  qualifying click takes precedence. See [Measure Results](https://help.openai.com/en/articles/20001214-launch-your-campaign-and-monitor-performance)
  and [Measurement Pixel attribution](https://developers.openai.com/ads/measurement-pixel).
- Billing for oCPC remains based on valid clicks. The bid cap guides
  conversion-oriented delivery; it is not a guaranteed cost per conversion.
  See [Conversion-optimized Campaigns](https://help.openai.com/en/articles/20001412-create-ocpc-campaigns).

## Audience data

OpenAI documents custom audiences for customer or prospect lists. The Ads API
supports creating, adding, removing, replacing, merging, listing, retrieving,
and archiving custom audiences. Custom audiences are not supported for EEA or
Switzerland campaigns while personalized ads are unavailable. See [Custom Audiences](https://developers.openai.com/ads/custom-audiences).

Upload only first-party data that you have the right to use for ads. The
custom-audience guide supports raw email, raw E.164 phone, SHA-256 email,
SHA-256 phone, and GAID formats with documented normalization rules. Require a
human authorization under [ad-experiments](../ad-experiments/SKILL.md) before
any customer-list export. See [audience data rights and formats](https://developers.openai.com/ads/custom-audiences).

## Verification

For browser testing, call `GET /conversions/events?pid=<PIXEL_ID>` on the Ads
API with the Ads API key. The stream returns up to 50 Pixel events received
during the previous 15 minutes. It is available only to enabled accounts and
proves Pixel receipt, not attribution or reporting. See [Conversion setup event stream](https://developers.openai.com/ads/api-reference/conversion-setup).

For platform proof, inspect the Ads Manager reporting tables or CSV export.
OpenAI says attributed conversions may take 24–48 hours to appear. Compare the
same date range and time zone. For business proof, reconcile conversions,
orders, subscriptions, and refunds with your own server and payment records.
See [Measure Results](https://help.openai.com/en/articles/20001214-launch-your-campaign-and-monitor-performance).

## Common pitfalls and security

- Do not send CAPI events to `api.ads.openai.com`; that host is for the Ads
  API. Send conversion events to the documented `bzr.openai.com` endpoint.
- Do not put `CHATGPT_ADS_API_KEY` or `CHATGPT_ADS_CAPI_KEY` in browser code,
  client-visible configuration, URLs, logs, screenshots, or source control.
  OpenAI explicitly requires server-side storage for the Conversions API key.
  See [Conversions API key setup](https://developers.openai.com/ads/api-reference/conversion-setup).
- Use HTTPS and the exact documented field names: `event_id` in Pixel options,
  `id` in CAPI events, `timestamp_ms`, `oppref`, and `source_url`.
- Use lowercase SHA-256 hexadecimal hashes. Never send raw email, phone, name,
  or external ID values. Never hash an already hashed value again.
- Keep a durable dispatch record with the canonical ID, adapter event name,
  consent decision, attempt time, redacted result, and retry count. A failed ad
  dispatch must not roll back a successful payment.
- Do not put chat content or unrelated profile data in conversion events. Send
  only documented event and user fields after consent.

## Official sources checked (2026-08-31)

- [Advertise in ChatGPT](https://ads.openai.com/) · [Ads Manager availability](https://help.openai.com/en-us/articles/20001245-ads-manager-availability) · [Account setup](https://help.openai.com/en/articles/20001213)
- [Ads API authentication](https://developers.openai.com/ads/api-reference/authentication) · [Ads API overview](https://developers.openai.com/ads/api-overview) · [Conversion setup](https://developers.openai.com/ads/api-reference/conversion-setup)
- [Measurement Pixel](https://developers.openai.com/ads/measurement-pixel) · [Conversions API](https://developers.openai.com/ads/conversions-api) · [Supported Events](https://developers.openai.com/ads/supported-events)
- [Conversion Measurement](https://help.openai.com/en/articles/20001409-conversion-measurement) · [Measure Results](https://help.openai.com/en/articles/20001214-launch-your-campaign-and-monitor-performance) · [Conversion-optimized Campaigns](https://help.openai.com/en/articles/20001412-create-ocpc-campaigns)
- [Custom Audiences](https://developers.openai.com/ads/custom-audiences)
