---
name: nextdoor-ads
description: "Integrate Nextdoor Ads Manager with the Nextdoor pixel and documented Conversion API. Use when wiring web conversion events, preserving ndclid attribution, deduplicating browser and server events, requesting Ads API access, or checking NAM reporting."
---

# Nextdoor Ads

Nextdoor Ads Manager is a self-serve advertising platform. Nextdoor documents
both a browser pixel and a server-side Conversion API (CAPI). [Nextdoor's
conversion guide](https://business.nextdoor.com/en-us/blog/conversion-measurement-solutions-in-nextdoor-ads)
describes both measurement surfaces.

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests,
seed sizing, and PII-export authorization.

## Account and access

For ordinary campaign work, use [Nextdoor Ads Manager](https://business.nextdoor.com/en-us/advertise-with-nextdoor-ads-manager).
Nextdoor's business flow describes creating a free business page, selecting an
ad goal, and choosing an audience. It also links to **Advertise Now**. [The
Ads Manager overview](https://business.nextdoor.com/en-us/nam/nextdoor-ads-manager)
says campaigns, ad groups, and ads can be added in the dashboard.

The Ads API is a separate access path. Nextdoor says API access is currently
primarily intended for advertising partners. Request access through the
[Ads and Conversion API request form](https://developer.nextdoor.com/reference/applying-for-access)
or a Nextdoor Account Manager. After access is granted, generate the token in
NAM at **Business Settings → Ads API**. [Nextdoor's access page](https://developer.nextdoor.com/reference/applying-for-access)
documents that route and the token location.

Use these as local configuration names. They are not Nextdoor-defined variable
names:

~~~text
NEXTDOOR_ADS_TOKEN       server-only bearer token
NEXTDOOR_DATA_SOURCE_ID  Nextdoor data source or pixel ID
NEXTDOOR_ADVERTISER_ID   local advertiser identifier
~~~

Keep NEXTDOOR_ADS_TOKEN in the server secret store. Never put it in a browser
bundle, URL, log, screenshot, or commit.

## Client-side pixel

Nextdoor's business documentation says to add the Nextdoor pixel to track
purchases, leads, signups, and other actions. [Nextdoor Ads Manager conversion
tracking](https://business.nextdoor.com/en-us/advertise-with-nextdoor-ads-manager)
is the current public source for that product claim.

Install the current pixel code supplied by NAM for the advertiser. This skill
does not reproduce a script URL, init function, or browser payload shape. Do
not invent those values or copy an undocumented snippet into application code.

Load the pixel only after the hub permits measurement. Configure the browser
event with the same deterministic event_id used by its CAPI twin. Nextdoor's
CAPI reference says event_id is used to deduplicate pixel and CAPI events.
[See the conversions/track reference](https://developer.nextdoor.com/reference/conversions-track).

## Rule setup and event mapping

Use the exact lowercase event names documented by the CAPI reference. It lists
these values: purchase, lead, sign_up, add_to_cart,
initiate_checkout, page_view, search, view_content, add_to_wishlist,
subscribe, and custom_conversion_1 through custom_conversion_10.
[See the supported event_name values](https://developer.nextdoor.com/reference/conversions-track).

Map the shared hub taxonomy as follows:

| Hub event | Nextdoor event_name | Dispatch rule |
| --- | --- | --- |
| page_view | page_view | Important pages only |
| view_content | view_content | Meaningful product or plan view |
| lead | lead | Confirmed lead submission |
| signup | sign_up | Account creation completes |
| begin_checkout | initiate_checkout | Checkout begins |
| purchase | purchase | Payment provider confirms the charge |
| subscription_start | subscribe | Paid subscription activates |
| refund | No documented event | Reconcile in payment truth |

refund is not in Nextdoor's documented event list. Do not invent a refund event
name. [See the complete list](https://developer.nextdoor.com/reference/conversions-track).

Use action_source: "website" for web events. The endpoint documents
action_source as required and lists its accepted channel values. [See the
action_source parameter](https://developer.nextdoor.com/reference/conversions-track).

## Server-side conversions API

Nextdoor's CAPI endpoint is:

~~~http
POST https://ads.nextdoor.com/v2/api/conversions/track
Authorization: Bearer <NEXTDOOR_ADS_TOKEN>
Content-Type: application/json
~~~

The URL, bearer credential, and response statuses come from Nextdoor's
[Conversions API reference](https://developer.nextdoor.com/reference/conversions-track).

Use the current field names. Nextdoor marks event_time, client_id, and
pixel_id as deprecated. It identifies data_source_id as the pixel ID used
to tie CAPI events to pixel events. [See the deprecation notice and
data_source_id](https://developer.nextdoor.com/reference/conversions-track).

~~~json
{
  "event_name": "purchase",
  "event_id": "order_123",
  "event_time_epoch": 1730017211,
  "action_source": "website",
  "action_source_url": "https://example.com/thank-you",
  "data_source_id": "<NEXTDOOR_DATA_SOURCE_ID>",
  "customer": {
    "email": "<SHA256_NORMALIZED_EMAIL>",
    "click_id": "<NDCLID>"
  }
}
~~~

The endpoint marks event_name, event_id, action_source, customer, and
event_time_epoch as required, with the timestamp represented as Unix epoch
seconds. The endpoint also requires action_source_url for website events.
[See the parameter definitions](https://developer.nextdoor.com/reference/conversions-track).

event_time_epoch uses seconds, not milliseconds. Do not send the deprecated
event_time field. [See Nextdoor's timestamp definition](https://developer.nextdoor.com/reference/conversions-track).

The endpoint's event_id must identify one unique event. Generate it once in
the hub, persist it with the dispatch record, and reuse it for browser and
server delivery. [See Nextdoor's deduplication requirement](https://developer.nextdoor.com/reference/conversions-track).

Nextdoor documents delivery_optimization as a boolean. true permits use
for optimization; false limits the data to attribution. Set it from the hub
adapter policy, not from a browser-controlled value. [See the parameter
definition](https://developer.nextdoor.com/reference/conversions-track).

The endpoint also accepts a string test_event; when absent, the reference
says it defaults to false. Use it only for an intentional test dispatch.
[See the test flag](https://developer.nextdoor.com/reference/conversions-track).

Nextdoor's overview says CAPI supports web, in-app, and offline conversions.
This skill defines only the web adapter. Do not infer a non-web payload from
that overview; use the current endpoint schema for any separate adapter. [See
the CAPI overview](https://developer.nextdoor.com/docs/advertising-overview).

## Identity and consent

Require the hub's measurement: true before sending any Nextdoor event. Require
the hub's ad_user_data: true before sending hashed customer identifiers.
The hub owns this policy; Nextdoor's data-types page supplies the platform
field and hashing rules.

Normalize email by lowercasing and removing leading and trailing spaces, then
hash it with SHA-256 before transmission. Nextdoor also documents normalized
E.164 phone numbers and SHA-256 hashing for sensitive fields. [See Nextdoor's
data transmission principles](https://developer.nextdoor.com/reference/conversion-data-types).

The documented customer fields include email, phone_number, first_name,
last_name, date_of_birth, gender, street_address, city, state, zip_code,
country, external_id, client_ip_address, client_user_agent, and click_id.
[See the customer object fields](https://developer.nextdoor.com/reference/conversion-data-types).

Send only fields allowed by consent and local policy. Do not send raw email or
phone data. Do not hash an already hashed identifier. Keep temporary normalized
values out of logs and delete them after dispatch.

## Click ID and first-party storage

Nextdoor documents ndclid as the click-ID query parameter. It says a unique
click_id is appended to the landing-page URL and can be sent back through the
Pixel or CAPI for ad-click attribution. [See Nextdoor user matching](https://developer.nextdoor.com/reference/conversion-user-matching).

Capture ndclid on the landing request. Store it in consented first-party
storage and attach it as customer.click_id when the conversion occurs. Keep
the canonical event ID with the stored value.

Nextdoor's fetched documentation does not define a vendor cookie name or
cookie lifetime. Do not invent either. A missing click ID must not block a
server event; use the other consented matching signals permitted by the hub.

## Deduplication

Send the same event_id to the browser pixel and CAPI for one action. Nextdoor
states that event_id and event_name deduplicate events from Pixel and CAPI.
[See the event-level data types](https://developer.nextdoor.com/reference/conversion-data-types).

Send the same data_source_id that identifies the pixel. Nextdoor documents
that field as the pixel ID to which the CAPI event is tied. [See
data_source_id](https://developer.nextdoor.com/reference/conversion-data-types).

Do not create a second event ID for a payment retry. Use the hub's dispatch
record and bounded retry policy. A successful HTTP response proves request
handling only; verify platform reporting separately.

## Audience and campaign settings

Nextdoor Ads Manager advertises custom audiences for retargeting, exclusion of
existing customers, and finding new neighbors who resemble valuable customers.
[See the NAM audience overview](https://business.nextdoor.com/en-us/nam/nextdoor-ads-manager).

The public sources fetched for this skill do not provide a customer-list upload
schema, minimum audience size, match-rate threshold, or lookalike request
contract. Do not add fields, limits, or endpoints for those surfaces. Configure
audiences in NAM unless Nextdoor grants the required Ads API access and supplies
a current schema.

## Reporting

Nextdoor documents an ad hoc reporting route at:

~~~http
POST https://ads.nextdoor.com/v2/api/reporting/create
Authorization: Bearer <NEXTDOOR_ADS_TOKEN>
Content-Type: application/json
~~~

The reporting page documents advertiser_id, recipient_emails,
dimension_granularity, time_granularity, metrics, campaign or ad IDs,
start_time, and end_time. It lists CONVERSIONS as an accepted metric and
requires ISO 8601 start_time and end_time. [See the official reporting
reference](https://developer.nextdoor.com/reference/reporting).

Use reporting for platform proof, then reconcile purchase and
subscription_start with payment-provider truth. Treat a report response as
receipt of a reporting request, not proof that an individual conversion earned
attribution.

## Verification

1. Record the redacted CAPI response, canonical event ID, consent decision, and
   payment result.
2. Confirm the browser pixel and server request use the same event_id,
   event_name, and data_source_id.
3. For a web event, confirm action_source_url begins with http:// or
   https:// and matches the verified domain. [See the endpoint rule](https://developer.nextdoor.com/reference/conversions-track).
4. Check conversion totals in NAM reporting and reconcile them with succeeded
   charges. The business documentation identifies the Ads Manager dashboard as
   the campaign performance surface. [See the NAM overview](https://business.nextdoor.com/en-us/nam/nextdoor-ads-manager).

The CAPI reference documents 200 and 400 responses. Log the status and
redact the body before storing it. [See the documented responses](https://developer.nextdoor.com/reference/conversions-track).

## Common pitfalls and security

- Do not use the dead universal-pixel, for-net-new-advertisers, or
  reporting-create documentation URLs.
- Do not send deprecated event_time, client_id, or pixel_id fields.
- Do not use milliseconds for event_time_epoch.
- Do not invent a pixel script, cookie name, click-ID lifetime, or audience API.
- Do not send a raw bearer token from browser code or a URL.
- Do not send raw email or phone data.
- Do not send one payment event with different browser and server IDs.
- Do not treat HTTP 200, a pixel request, or a report row as payment truth.
- Do not let a vendor error fail checkout or a payment webhook. Return the hub's
  documented adapter status and preserve the retry record.

## Official sources checked (2026-08-31)

- [Ads Manager conversion tracking](https://business.nextdoor.com/en-us/advertise-with-nextdoor-ads-manager) · [NAM overview](https://business.nextdoor.com/en-us/nam/nextdoor-ads-manager)
- [Applying for API access](https://developer.nextdoor.com/reference/applying-for-access) · [Conversion API getting started](https://developer.nextdoor.com/reference/conversion-getting-started)
- [Conversions API](https://developer.nextdoor.com/reference/conversion-api) · [conversions/track](https://developer.nextdoor.com/reference/conversions-track)
- [Conversion data types](https://developer.nextdoor.com/reference/conversion-data-types) · [User matching](https://developer.nextdoor.com/reference/conversion-user-matching)
- [Advertising overview](https://developer.nextdoor.com/docs/advertising-overview) · [Reporting](https://developer.nextdoor.com/reference/reporting)
