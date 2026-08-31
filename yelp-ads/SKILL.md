---
name: yelp-ads
description: "Integrate Yelp Ads measurement through Yelp Conversions API, Yelp click-ID attribution, and Yelp partner advertising APIs."
---

# Yelp Ads

Yelp has a Conversions API, but Yelp does not document self-serve activation for
it. Yelp says the product is intended for businesses with 10 or more
locations, and asks interested advertisers to work with a Yelp Sales or
Customer Success representative. Smaller businesses may not receive
attribution reporting. See [Yelp Conversions API availability and access](https://docs.developer.yelp.com/docs/conversions-api).

Yelp also has a separate Advertising API. No open self-serve access is
documented for it. It is a Partner API with access disabled by default. Its
documented endpoints manage advertising programs;
conversion ingestion is documented separately in CAPI. See [Yelp Ads API access and scope](https://docs.developer.yelp.com/docs/ads-api) and [Yelp Conversions API](https://docs.developer.yelp.com/docs/conversions-api).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract. Pair
this skill with [ad-experiments](../ad-experiments/SKILL.md) for one-audience
tests, seed sizing, and PII-export authorization.

## Account and access

For Yelp Conversions API access, follow the sequence in [Yelp's CAPI data-access guide](https://docs.developer.yelp.com/docs/conversions-api):

1. Sign in to [Yelp developer app management](https://www.yelp.com/developers/v3/manage_app).
2. Create an app and copy its Client ID.
3. Send the Client ID to the assigned Yelp Customer Success representative.
4. Wait for Yelp to enable the app's API key for the Conversions API.

Yelp's guide says the API key is required, should be treated as secret, and can
be refreshed after a compromise. The key is not usable for CAPI until Yelp
enables it. See [Yelp CAPI data access](https://docs.developer.yelp.com/docs/conversions-api).

Use a local server-only secret such as `YELP_CAPI_API_KEY`. This name is an
adapter convention, not a Yelp parameter. Never put the key in browser code,
URLs, logs, screenshots, or commits.

The separate Yelp Advertising API uses Basic HTTP authentication over SSL and
the credentials used for Yelp's Data Ingestion API. Yelp says access is
disabled by default and requires working with the Yelp account team. See
[Yelp Advertising API authentication](https://docs.developer.yelp.com/docs/ads-api).

The Ads API onboarding guide describes a managed two-phase route. See [Yelp Ads API onboarding](https://docs.developer.yelp.com/docs/getting-started-with-the-ads-api).

1. Ask a Yelp account representative or Solutions Engineer for access.
2. Receive test credentials and Yelp-provided test business IDs.
3. Test the program lifecycle against those test listings.
4. Request live credentials after Yelp validates the integration.

Test credentials use a username and password against
`https://partner-api.yelp.com/v1/`. Live credentials are tied to the active Yelp
payment account. See [Yelp Ads API onboarding](https://docs.developer.yelp.com/docs/getting-started-with-the-ads-api).

Do not add OAuth scopes to this Ads API adapter. The current Ads API guide
documents Basic authentication, not OAuth. See [Yelp Ads API authentication](https://docs.developer.yelp.com/docs/ads-api).

## Client-side tag

The current Yelp CAPI guide documents a server-side Google Tag Manager template.
It does not provide a Yelp browser pixel snippet, browser SDK, or public pixel
ID for this integration. Do not invent one. See [Yelp GTM CAPI integration](https://docs.developer.yelp.com/docs/conversions-api).

If using GTM, send GA4 events to a server-side container and install Yelp's
server-side Conversion API template. Yelp says the template uses the API under
the hood and handles normalization and hashing. Set the GTM
`first_party_collection` field to `true` when passing user data to the server
container. See [Yelp's GTM setup](https://docs.developer.yelp.com/docs/conversions-api).

Yelp's guide recommends the direct API or S3 method when possible because GTM
debugging can be cumbersome. See [Yelp's transfer-method guidance](https://docs.developer.yelp.com/docs/conversions-api).

## Rule setup and event mapping

The direct CAPI schema requires `event_time`, `event_name`, `action_source`, and
`custom_data`. `user_data` is optional. Direct `event_name` values are `purchase`,
`lead`, or a custom name prefixed with `custom_`; names are limited to 50
characters. `action_source` accepts `app`, `physical_store`, or `website`. See
[Yelp's CAPI schema](https://docs.developer.yelp.com/docs/conversions-api).

The server-side GTM template separately maps standard GA4 names such as
`checkout`, `purchase`, `lead`, `view_content`, and `signup`. Other names receive
a `custom_` prefix in that template. See [Yelp's published GTM event mappings](https://docs.developer.yelp.com/docs/conversions-api).

| Hub event | Direct API `event_name` | GTM event name | Dispatch rule |
| --- | --- | --- | --- |
| `page_view` | No conversion name | Not a documented CAPI goal | Keep in first-party analytics. [Yelp says not to send page views when measuring a transaction.](https://docs.developer.yelp.com/docs/conversions-api) |
| `view_content` | `custom_view_content` | `view_content` | Send only when this event is a measured conversion. |
| `lead` | `lead` | `lead` | Send after the lead is accepted. |
| `signup` | `custom_signup` | `signup` | Send after account creation succeeds. |
| `begin_checkout` | `custom_begin_checkout` | `checkout` | Send only if checkout start is a measured goal. |
| `purchase` | `purchase` | `purchase` | Send after the payment provider confirms the charge. Include `custom_data.value` for ROAS. |
| `subscription_start` | `custom_subscription_start` | No documented mapping | Send only if the advertiser has chosen this custom goal. |
| `refund` | No documented name | No documented mapping | Reconcile with payment truth. Do not dispatch an invented Yelp refund event. |

The custom names follow Yelp's documented `custom_` rule, and the GTM names
follow its published template mapping. These are separate routes. See [Yelp event names](https://docs.developer.yelp.com/docs/conversions-api).

## Server-side conversions API

Yelp documents two POST endpoints. The single endpoint accepts one conversion;
the bulk endpoint accepts an `events` array with up to 1,000 events per request.
Successful requests return `202 Accepted`. Yelp recommends bulk requests above
100,000 events per day. See [Yelp CAPI endpoints and limits](https://docs.developer.yelp.com/docs/conversions-api).

The documented request uses a Bearer API key and wraps one event in `event`. See [Yelp's single-event example](https://docs.developer.yelp.com/docs/conversions-api):

```http
POST https://api.yelp.com/v3/conversion/event
Authorization: Bearer <YELP_CAPI_API_KEY>
Content-Type: application/json
```

```json
{
  "event": {
    "event_id": "<CANONICAL_EVENT_ID>",
    "event_time": 1693946978,
    "event_name": "purchase",
    "action_source": "website",
    "user_data": {
      "em": ["<SHA256_EMAIL_HEX>"],
      "ylpcid": "<YELP_CLICK_ID>"
    },
    "custom_data": {
      "value": 10.0,
      "currency": "USD",
      "order_id": "<ORDER_ID>"
    }
  },
  "test_event": true
}
```

The bulk endpoint uses the same event schema inside an `events` array. See [Yelp's bulk-event example](https://docs.developer.yelp.com/docs/conversions-api):

```http
POST https://api.yelp.com/v3/conversion/events
Authorization: Bearer <YELP_CAPI_API_KEY>
Content-Type: application/json
```

Yelp documents `test_event` as an optional Boolean. When `true`, Yelp runs
normal validation without submitting the data to production. Omitting it means
production behavior. Each endpoint accepts up to 100 requests per second and
50,000 requests per day. See [Yelp CAPI testing and rate limits](https://docs.developer.yelp.com/docs/conversions-api).

Use the hub's bounded retry and dead-letter policy. Keep the same
`event_id` when retrying a request whose final result is unknown. See [Yelp's deduplication rule](https://docs.developer.yelp.com/docs/conversions-api).

## Identity and consent

Apply the hub's consent gate before collecting or hashing ad-user data. Yelp
requires SHA-256 hashing for fields marked hashed and says its system prevents
unhashed personal identification data from being processed. See [Yelp hashing requirements](https://docs.developer.yelp.com/docs/conversions-api).

For direct API submissions, normalize values as Yelp documents, then hash the
fields that require hashing. See [Yelp's normalization and hashing rules](https://docs.developer.yelp.com/docs/conversions-api):

- Email: lowercase and trim leading or trailing spaces.
- Phone: send 11 digits with a leading `1`, without punctuation or `+`.
- First and last name: lowercase, with spaces and punctuation removed.
- Birth date: `YYYYMMDD`.
- Country: lowercase two-character ISO-3166 code.
- Postal code: lowercase alphanumeric characters only.
- IP address and user agent: do not hash.

Yelp's schema marks these fields as normalized or hashed and marks IP address
and user agent as not hashed. Use only the fields relevant to the measured
conversion. See [Yelp normalization and field constraints](https://docs.developer.yelp.com/docs/conversions-api).

Yelp documents `em`, `ph`, `fn`, `ln`, `db`, `ge`, `country`, `st`, `zp`, `ct`,
and `external_id` in `user_data`. `madid` is for mobile events. `lead_id` is
relevant only when using Yelp's Leads API. See [Yelp user-data fields](https://docs.developer.yelp.com/docs/conversions-api).

## Click ID and first-party storage

Yelp appends the `ylpcid` query parameter to a destination URL when a user
clicks a Yelp ad. Capture it on the landing request, store it in your own
first-party session or cookie storage, and send it in `user_data.ylpcid`. Yelp
says to send this value exactly as received. Do not modify, truncate, or hash
it. See [Yelp Click ID guidance](https://docs.developer.yelp.com/docs/conversions-api).

Yelp says `ylpcid` can directly match a conversion to the ad click and can
improve attribution for users who are not logged in. The CAPI schema marks
`ylpcid` optional, so do not block a confirmed conversion when the parameter is
absent. See [Yelp attribution matching guidance](https://docs.developer.yelp.com/docs/conversions-api).

Yelp's public guide does not state a `ylpcid` lifetime. See [Yelp's Click ID documentation](https://docs.developer.yelp.com/docs/conversions-api). Do not promise a
30-day, seven-day, or other attribution window. Store it for the period defined
by your consent and measurement policy.

## Deduplication

Yelp recommends `event_id` and says it combines `event_id` with `event_name` to
form the deduplication key. `event_id` is optional, must be at most 128
characters, and should uniquely identify one conversion. Without it, Yelp says
it cannot deduplicate. Reusing one ID across multiple conversions can lose
data. See [Yelp CAPI deduplication](https://docs.developer.yelp.com/docs/conversions-api).

Use the hub's canonical event ID for retries and any separate collection route.
Keep the event name stable for one conversion. Yelp does not document a
browser-pixel/server-event deduplication contract in this guide. See [Yelp CAPI deduplication](https://docs.developer.yelp.com/docs/conversions-api). Do not invent one.

## Yelp settings that override code

- Yelp must enable the app's API key before CAPI requests can work. Yelp says an
  inactive or incorrect key can produce `404`; missing or invalid auth can
  produce `401`. See [Yelp CAPI access errors](https://docs.developer.yelp.com/docs/conversions-api).
- A malformed payload or un-hashed required field can produce `400`. A rate
  limit breach can produce `429`. See [Yelp CAPI errors](https://docs.developer.yelp.com/docs/conversions-api).
- CAPI availability and attribution reporting depend on the advertiser's
  eligibility and Yelp representative. See [Yelp CAPI availability](https://docs.developer.yelp.com/docs/conversions-api).
- Yelp's Advertising API is separately gated. Do not assume Ads API credentials
  grant CAPI access. See [Yelp API access separation](https://docs.developer.yelp.com/docs/ads-api) and [Yelp CAPI activation](https://docs.developer.yelp.com/docs/conversions-api).

Do not add a conversion rule ID, pixel ID, OAuth scope, or console toggle unless
Yelp supplies it for the account. The fetched CAPI guide documents an API key,
not those fields. See [Yelp's current CAPI guide](https://docs.developer.yelp.com/docs/conversions-api).

## Verification

1. Send a minimal payload with `test_event: true`. Record the redacted request,
   response status, canonical event ID, and consent decision. Yelp says test
   mode validates the request without sending it to production. See [Yelp test events](https://docs.developer.yelp.com/docs/conversions-api).
2. For production, treat `202 Accepted` as request acceptance. Reconcile the
   event with the succeeded payment, lead, or signup record. See [Yelp API response behavior](https://docs.developer.yelp.com/docs/conversions-api).
3. If the account has Reporting API access, request reports through the Yelp
   representative. Reporting API access has separate setup from Ads API and
   Data Ingestion API access. See [Yelp Reporting API access](https://docs.developer.yelp.com/docs/reporting-api).
4. Do not use the Reporting API as proof of pixel or store-visit attribution.
   Yelp says those signals are not reflected in that API today. See [Yelp Reporting API limitations](https://docs.developer.yelp.com/docs/reporting-api).

## Common pitfalls and security

- Keep the Yelp API key in a server-only adapter secret. Yelp's CAPI guide calls
  it an API key, not a browser pixel or OAuth credential. See [Yelp CAPI data access](https://docs.developer.yelp.com/docs/conversions-api).
- Do not send a raw email, phone, name, or other field marked hashed. Yelp can
  reject fields that are required to be hashed. See [Yelp field validation](https://docs.developer.yelp.com/docs/conversions-api).
- Do not hash `ylpcid`. Yelp requires the click ID unmodified and unhashed. See
  [Yelp Click ID requirements](https://docs.developer.yelp.com/docs/conversions-api).
- Do not send a purchase before payment confirmation. Use payment-provider
  truth for purchase and refund reconciliation.
- Do not interpret `202`, a valid API key, or a stored event as ad attribution.
  Confirm the account's Yelp reporting path. See [Yelp CAPI response and reporting guidance](https://docs.developer.yelp.com/docs/conversions-api).
- Do not retry with a new `event_id` after an uncertain response. That can
  defeat Yelp's documented deduplication key. See [Yelp CAPI deduplication](https://docs.developer.yelp.com/docs/conversions-api).
- Keep the API key in the server secret store. Yelp says not to give it to
  unauthorized users and provides a refresh action if it is compromised. See
  [Yelp API key handling](https://docs.developer.yelp.com/docs/conversions-api).
- A vendor failure must not fail checkout or a payment webhook. Record the
  failure, apply the hub retry policy, and dead-letter after the hub limit.

## Official sources checked (2026-08-31)

- [Yelp Conversions API](https://docs.developer.yelp.com/docs/conversions-api)
- [Yelp Ads API](https://docs.developer.yelp.com/docs/ads-api)
- [Yelp Ads API Onboarding Guide](https://docs.developer.yelp.com/docs/getting-started-with-the-ads-api)
- [Yelp Reporting API](https://docs.developer.yelp.com/docs/reporting-api)
