---
name: samsung-ads
description: "Set up Samsung DSP website, app, CTV, and offline conversion measurement with documented segment tags, conversion groups, MMP routes, reporting APIs, and explicit access limits. Use when planning Samsung Ads campaigns or deciding whether a server-side conversion integration exists."
---

# Samsung Ads

Samsung Ads provides an account-gated Samsung DSP console. It supports website
segment tags, app measurement through MMPs, TV
app sessions, and offline segments. It does not document a public
advertiser-side Conversions API in the API documentation reviewed here. [Samsung Ads contact](https://www.samsung.com/us/business/samsungads/contact-us/)
[Samsung DSP API documentation](https://help.dsp.samsungads.com/docs/api-documentation) · [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group)

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract. Pair
it with [ad-experiments](../ad-experiments/SKILL.md) for test design and
PII-export authorization.

## Account and access

No public self-serve advertiser signup is documented in the official sources
checked. The public Samsung Ads route asks prospects to match with a Samsung
Ads expert. The DSP help center documents an existing DSP login, not a public
registration flow. Use the [Samsung Ads contact route](https://www.samsung.com/us/business/samsungads/contact-us/)
and then follow the [DSP getting-started guide](https://help.dsp.samsungads.com/docs/getting-started).

After Samsung grants DSP access:

1. Create or confirm the advertiser under **Data → Advertisers → +New
   Advertiser**. Samsung requires an advertiser before creating a conversion
   group. See [Advertisers](https://help.dsp.samsungads.com/v1/docs/advertisers)
   and [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).
2. Create a segment under **Data → Segments**. Copy the generated tag from the
   segment row. See [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment)
   and [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment).
3. Create a conversion group with **Segment** as its data source. Attach it to
   the flight's conversion tracking settings. See [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).
4. Generate an API key under **Settings → API settings** only when you need
   the documented GraphQL or Reporting Service APIs. See [API Documentation](https://help.dsp.samsungads.com/docs/api-documentation).

SAMSUNG_DSP_API_KEY is a local server configuration name. Samsung does not
define this environment-variable name. Keep it absent when the integration
uses only a browser segment tag.

## Client-side Samsung DSP segment tag

Samsung documents three segment types: Standard, Universal, and Offline. The
Standard and Universal types run on a website. The Offline type uses data from
a data provider. See [Segment Overview](https://help.dsp.samsungads.com/v1/docs/segments-pixels).

### Standard Segment

A Standard Segment is a simple pixel. Each segment has its own tag, and the
tag can run directly on a page or through a tag manager. Standard segments
cannot receive website information. See [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment).

Use the exact tag copied from Samsung DSP. The public example is:

~~~html
<img src="https://rtb.adgrx.com/segments/XXXX/yyy.gif" width="1" height="1" border="0" />
~~~

The example comes from Samsung's Standard Segment guide. Do not replace the
segment path or hand-edit generated identifiers. [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment)

Place the tag between <body> and </body>, near the end of the page. For a
button action, Samsung recommends the destination page. A same-tab redirect
can race the tag request and is not guaranteed to complete. See [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment).

### Universal Segment

A Universal Segment is one JavaScript tag for an account. It can inspect the
page URL and use configured custom variables to build rule-based segments.
Custom variables can be strings or integers. See [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment).

Samsung's example passes custom data through __AGDATA and loads the generated
tag from cdn.adgrx.com. Use the exact generated tag from the DSP console. See [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment).

Use only non-sensitive values that the approved segment design needs. Do not
pass email, phone, payment, or other customer identifiers through __AGDATA.
Samsung documents the variable mechanism, not a customer-identity matching
contract. [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment)

For conversion revenue, Samsung documents __AG.revenue for a Universal
Segment and AG_REV for a Standard Segment tag. Pass revenue only after the
hub consent gate and only for a confirmed conversion.
[Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment) · [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment)

## Rule setup and event mapping

Samsung's website conversion workflow is tag-first. Implement the segment,
create a Segment conversion group, attach it to the flight, and use the
website conversion campaign flow. See [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign)
and [CTV to Website Conversion Campaign](https://help.dsp.samsungads.com/docs/ctv-to-website-conversion-campaign).

Use one Standard Segment per simple conversion action. Use one Universal
Segment when URL rules, custom variables, or conversion revenue require the
shared JavaScript tag. See [Segment Overview](https://help.dsp.samsungads.com/v1/docs/segments-pixels).

The table maps hub events to Samsung segment actions. Hub event names remain
canonical; Samsung does not receive them as a documented JSON event field. [API documentation](https://help.dsp.samsungads.com/docs/api-documentation)

| Hub event | Samsung DSP action | Dispatch condition |
|---|---|---|
| page_view | Standard or Universal Segment | Important page view only |
| view_content | Standard or Universal Segment | Meaningful product or plan view |
| lead | Conversion segment | Confirmed lead submission |
| signup | Conversion segment | Account creation succeeds |
| begin_checkout | Conversion segment | Checkout starts |
| purchase | Conversion segment, with documented revenue value when needed | Payment provider confirms the charge |
| subscription_start | Conversion segment, with documented revenue value when needed | Paid subscription activates |
| refund | No Samsung event | Reconcile with payment-provider truth |

Configure the conversion group in the console:

- **Counting behavior** can count every tag call, one conversion per user, or
  one conversion per user within a selected period.
- **Post View Crediting Window** and **Post Click Crediting Window** define the
  crediting periods.
- **Cross Device Conversions** can use IP addresses when cookies are not
  possible, such as some CTV campaigns. When disabled, Samsung describes
  cookie-based or device-based identifiers when available.

These are conversion-group settings, not request parameters. See [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).

## Conversion API boundary and real conversion routes

Samsung's public API index documents two APIs: GraphQL for campaigns, flights,
creatives, bidding, and proprietary segments; Reporting Service for delivery
and performance reports.

The examples use POST https://dsp.samsungads.com/api/graphql with an API-key
bearer header and JSON query, or POST https://reporting.trader.adgear.com/v1/reports
with a username/API-key bearer header. See [GraphQL examples](https://help.dsp.samsungads.com/docs/samsung-dsp-graphql-api-examples)
and [Reporting API examples](https://help.dsp.samsungads.com/docs/samsung-dsp-reporting-service-api-examples).

The index does not document an advertiser conversion-event ingestion API. Do
not implement or probe an undocumented bearer endpoint or JSON event schema. See [API Documentation](https://help.dsp.samsungads.com/docs/api-documentation).

The documented conversion routes are:

1. **Website:** fire a Standard or Universal Segment tag, place that segment in
   a Segment conversion group, and attach the group to the flight. See [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign).
2. **Mobile app:** use an approved MMP integration. Samsung documents Adjust,
   AppsFlyer, and Singular. The MMP sends app events back to Samsung DSP. See [MMP Integration & Attribution](https://help.dsp.samsungads.com/docs/mmp-integration).
3. **TV app:** use a TV App Sessions conversion group. Samsung documents this
   as a conversion-group data source for CTV-to-CTV campaigns, available
   exclusively to CTV app owners. See [CTV to CTV Conversion Campaign](https://help.dsp.samsungads.com/docs/ctv-to-ctv-conversion-campaign).
4. **Offline:** ask the Account Manager or Admin to enable an Offline Segment.
   Samsung documents data-provider matching and currently names Circana as the
   available provider in that guide. See [Offline Segment](https://help.dsp.samsungads.com/docs/offline-segment).

Samsung documents __TXN_ID__ for server-side conversion tracking. Pass it
through a click tracker to the destination, associate it with a transaction,
and call a conversion tag. This is not a public server-to-server endpoint.
__TXN_ID_INT__ cannot be used for conversion attribution. See [Samsung DSP macros](https://help.dsp.samsungads.com/v1/docs/macros).

## Identity and consent

Do not build email or phone matching into this adapter. The public website
segment guides document URL, custom-variable, and revenue inputs, but do not
document a hashed-email field or customer-list conversion API. [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment) [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment) Keep identity
normalization and consent in [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

For Smart TV app measurement, Samsung documents TIFA and the LAT state through
the AdInfo API. The documented methods are getTIFA() and
isLATEnabled(). See [Tizen ID for Advertising](https://developer.samsung.com/smarttv/develop/guides/unique-identifiers-for-smarttv/tizen-id-for-advertising.html).

Samsung describes TIFA as randomized, non-persistent, and resettable. It says
not to connect TIFA to personally identifiable information or a persistent
device identifier. It also requires prior user consent and encrypted transport
when TIFA leaves the device. See [Adinfo class reference](https://developer.samsung.com/smarttv/develop/api-references/tizenfx-tv-api-references/tizen.tv.service.adinfo/adinfo-class.html).

When LAT is enabled, Samsung says that personalized or interest-based ads
cannot be sent in the ad response. Do not use GetUuid() for advertising;
Samsung's Adinfo reference says that UUID must not be used for that purpose.
[Tizen ID for Advertising](https://developer.samsung.com/smarttv/develop/guides/unique-identifiers-for-smarttv/tizen-id-for-advertising.html)
[Adinfo class reference](https://developer.samsung.com/smarttv/develop/api-references/tizenfx-tv-api-references/tizen.tv.service.adinfo/adinfo-class.html)

## Click ID and first-party cookie

Samsung does not document a Samsung-owned website click query parameter, a
Samsung cookie name, or a cookie lifetime in the sources checked. Do not invent
samsung_click_id, samsung_fat_id, or a retention window. [Segment Overview](https://help.dsp.samsungads.com/v1/docs/segments-pixels) [Samsung DSP macros](https://help.dsp.samsungads.com/v1/docs/macros)

For creative click tracking, use the documented __TXN_ID__ macro when the
campaign configuration provides a click tracker. Capture it on the destination
server and associate it with the canonical event. Do not require it before
recording a confirmed first-party conversion. See [Samsung DSP macros](https://help.dsp.samsungads.com/v1/docs/macros).

Configure post-view and post-click crediting windows in the conversion group.
Do not treat those console windows as a cookie lifetime. See [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).

## Deduplication

Samsung's public segment documentation exposes counting behavior, but it does
not document a browser/server event ID or a deduplication parameter. [Segment Overview](https://help.dsp.samsungads.com/v1/docs/segments-pixels) Do not
send the hub event_id under a guessed Samsung field.

Use the hub event_id in the internal dispatch record. Emit one tag call for
each confirmed action, keep the dispatch idempotent, and reconcile Samsung
conversion counts with payment-provider truth. Treat repeated tag calls as
duplicates only when the selected conversion-group counting behavior supports
that policy. See [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).

## Samsung DSP settings that override code

- Segment expiry controls retargeting membership. Counting behavior and
  crediting windows live in the conversion group. See [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment)
  and [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group).
- A segment must be attached to the conversion group, and the conversion group
  must be attached to the flight. See [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign).
- The Maximize Conversions tactic requires a Standard Segment and Segment
  conversion group for website conversion. Samsung documents Web as the
  conversion channel for website conversion and TV or Mobile with an approved
  MMP for app conversion. See [Maximize Conversions Bid Tactic](https://help.dsp.samsungads.com/docs/maximize-conversions-bid-tactic).

## Reporting and verification

Verify the tag in Samsung DSP before launch:

1. Open **Data → Segments**.
2. Open the segment action menu.
3. Select the segment report or real-time activity view.

Samsung documents this activity check for segment tags. See [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment)
and [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign).

For campaign proof, use the Delivery Interactive report while the campaign
runs. After the campaign, use a Conversion Group Based Lift Report and a
Delivery report. Reconcile purchases and refunds with payment-provider truth.
See [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign)
and [Conversion Group Based Lift Report](https://help.dsp.samsungads.com/docs/conversion-group-based-lift-report).

Use those APIs only for DSP resources and reports. They do not prove that a
website conversion received campaign credit. See [API examples](https://help.dsp.samsungads.com/docs/samsung-dsp-graphql-api-examples).

## Common pitfalls and security

- Do not use the Smart TV AdInfo API as an advertiser conversion endpoint. [API documentation](https://help.dsp.samsungads.com/docs/api-documentation)
- Do not send TIFA with PII or map a new TIFA to an old one after a reset. See [Adinfo class reference](https://developer.samsung.com/smarttv/develop/api-references/tizenfx-tv-api-references/tizen.tv.service.adinfo/adinfo-class.html).
- Do not use UUID as an advertising identifier. See [Adinfo class reference](https://developer.samsung.com/smarttv/develop/api-references/tizenfx-tv-api-references/tizen.tv.service.adinfo/adinfo-class.html).
- Do not guess a CAPI endpoint, request field, cookie name, click ID, or
  deduplication field.
- Do not pass raw or hashed customer identifiers to Samsung without a current,
  documented product contract and consent.
- Do not put API keys in browser bundles, URLs, logs, screenshots, or commits.
- Load vendor tags only after the hub's measurement consent gate. Use HTTPS
  transport for vendor requests.
- A successful tag request, API response, or segment report proves receipt or
  reporting activity only. Reconcile conversion counts with business truth. [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign)

## Official sources checked (2026-08-31)

- [Samsung Ads contact](https://www.samsung.com/us/business/samsungads/contact-us/) · [DSP getting started](https://help.dsp.samsungads.com/docs/getting-started) · [Advertisers](https://help.dsp.samsungads.com/v1/docs/advertisers) · [API documentation](https://help.dsp.samsungads.com/docs/api-documentation) · [GraphQL examples](https://help.dsp.samsungads.com/docs/samsung-dsp-graphql-api-examples) · [Reporting API examples](https://help.dsp.samsungads.com/docs/samsung-dsp-reporting-service-api-examples)
- [Segment overview](https://help.dsp.samsungads.com/v1/docs/segments-pixels) · [Standard Segment](https://help.dsp.samsungads.com/v1/docs/standard-segment) · [Universal Segment](https://help.dsp.samsungads.com/docs/universal-segment)
- [Conversion Group](https://help.dsp.samsungads.com/docs/conversion-group) · [Website Conversion Campaign](https://help.dsp.samsungads.com/docs/website-conversion-campaign) · [CTV to Website Conversion Campaign](https://help.dsp.samsungads.com/docs/ctv-to-website-conversion-campaign)
- [Samsung DSP macros](https://help.dsp.samsungads.com/v1/docs/macros) · [MMP integration](https://help.dsp.samsungads.com/docs/mmp-integration) · [Offline Segment](https://help.dsp.samsungads.com/docs/offline-segment)
- [Tizen ID for Advertising](https://developer.samsung.com/smarttv/develop/guides/unique-identifiers-for-smarttv/tizen-id-for-advertising.html) · [Adinfo reference](https://developer.samsung.com/smarttv/develop/api-references/tizenfx-tv-api-references/tizen.tv.service.adinfo/adinfo-class.html) · [Conversion Group Based Lift Report](https://help.dsp.samsungads.com/docs/conversion-group-based-lift-report)
