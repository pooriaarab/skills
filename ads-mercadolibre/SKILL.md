---
name: ads-mercadolibre
description: "Integrate Mercado Libre Ads advertiser lookup and campaign reporting through the official OAuth API. Product Ads activation is seller-side (My profile → Advertising), not an API call; Display Ads uses Commercial Advisor access. Mercado Libre does not document a public browser tag, conversions API, or campaign-mutation endpoints in the official Ads documentation checked."
---

# Mercado Libre Ads

Mercado Libre has a public advertising API for advertiser lookup, campaign
management, and reporting. Its developer application flow includes an
**Advertising** permission for Product Ads and Display Ads. See [Create
application](https://global-selling.mercadolibre.com/devsite/en_us/authentication-and-authorization-global-selling/create-application).

The public Ads documentation checked does not publish a browser tag, app SDK,
or server-side conversion-event ingestion API. Treat Mercado Libre as a
reporting and campaign-management adapter. Do not create a `/conversions`,
`/events`, or `/pixel` route from analogy. See [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

Mercado Libre uses OAuth 2.0 for access to private user resources. Its
server-side authorization flow redirects the user to Mercado Libre, receives a
code, then exchanges that code for an access token. The same guide documents a
`refresh_token` issued alongside the access token, used to renew access
without repeating the redirect flow. Access tokens expire; do not assume the
token exchanged once during onboarding stays valid indefinitely. Confirm the
current refresh endpoint, parameters, and token lifetimes at the cited guide
before relying on them in production. See [Authentication and
Authorization](https://developers.mercadolivre.com.br/en_us/authentication-and-authorization).

Create an application in the Mercado Libre DevCenter. The application form
requires a registered redirect URI beginning with `https://`. The application
permission groups include Advertising, with Product Ads and Display Ads as
connected resources. See [Create application](https://global-selling.mercadolibre.com/devsite/en_us/authentication-and-authorization-global-selling/create-application).

Product Ads has a seller activation route. The current Product Ads guide says
to activate it from **My profile → Advertising**. It also lists eligibility
requirements: yellow reputation or higher, at least 15 days of account age,
minimum sales, and no overdue invoices. See [Product Ads eligibility](https://global-selling.mercadolibre.com/devsite/new-product-ads).

Display Ads is not documented as self-serve. Mercado Libre says that Display
is enabled by Commercial Advisors. Guaranteed Display campaigns are contracted
directly with a Mercado Libre agent, and the operations team manages them. See
[Display Ads access and campaign types](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Use `MERCADOLIBRE_ADS_CLIENT_ID`, `MERCADOLIBRE_ADS_CLIENT_SECRET`,
`MERCADOLIBRE_ADS_ACCESS_TOKEN`, and `MERCADOLIBRE_ADS_REFRESH_TOKEN` for local
OAuth configuration. Use
`MERCADOLIBRE_ADVERTISER_ID`, `MERCADOLIBRE_SITE_ID`, and
`MERCADOLIBRE_ADS_PRODUCT` for adapter state. These are local conventions;
the documented product values are `PADS` and `DISPLAY`. See [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Client-side tag or pixel

Mercado Libre's public Ads guides do not document a browser pixel, tag ID,
mobile SDK, or CTV event SDK for off-site conversion collection. Do not add a
script, pixel ID, cookie, or app event call to this adapter. See [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Rule setup and event mapping

There is no public Mercado Libre Ads event mapping to configure. Product Ads
reports sales and advertising metrics for promoted marketplace listings.
Display Ads reports attributed sales and actions such as product-page views,
add-to-cart, bookmarks, checkout, and leads. These are reporting fields, not
an endpoint for uploading the hub's events. See [Product Ads metrics](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads metrics](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

| Hub event | Mercado Libre Ads action |
| --- | --- |
| `page_view` | Measure on the advertiser site only. |
| `view_content` | Measure on the advertiser site; Display reports attributed product-page views. |
| `lead` | Store the lead in the advertiser system; Display reports attributed leads when its campaign supports them. |
| `signup` | Store the signup in the advertiser system. |
| `begin_checkout` | Store the checkout in the advertiser system; Display reports attributed checkouts. |
| `purchase` | Use payment-provider truth; compare it with platform-reported sales. |
| `subscription_start` | Store the subscription in the advertiser system. |
| `refund` | Reconcile with payment-provider truth. |

Do not dispatch these events to a guessed Mercado Libre endpoint. Keep the
adapter's result `skipped` when no contracted vendor integration exists. The
hub must not fail a payment or signup flow because Ads reporting is absent. See
[ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Server-side conversions API

No public Mercado Libre Ads conversions API is documented in the official Ads
guides checked. Those guides document advertiser lookup, campaign resources,
ad resources, and metrics. They do not document a conversion-event POST
operation, event schema, event timestamp field, identity field, or server-side
deduplication field. See [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Therefore, this adapter has no CAPI request. Do not send hashed email, phone,
IP address, payment data, `event_id`, or a browser cookie to the Marketplace
Ads API. Do not infer a conversion contract from the existence of the public
campaign metrics API.

For managed Display campaigns, ask the Commercial Advisor for any contracted
measurement or reporting specification. The public guide defines the advisor
access route, but it does not publish a partner postback contract. See [Display
Ads access](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## OAuth and advertiser validation

Mercado Libre documents bearer tokens in the `Authorization` header. The
following advertiser lookup is a documented read operation. It confirms that
the token can see the requested Ads product and returns `advertiser_id` and
`site_id`. See [Product Ads advertiser lookup](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads advertiser lookup](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

```bash
curl -sS \
  'https://api.mercadolibre.com/advertising/advertisers?product_id=PADS' \
  -H 'Authorization: Bearer <MERCADOLIBRE_ADS_ACCESS_TOKEN>' \
  -H 'Content-Type: application/json' \
  -H 'Api-Version: 1'
```

Use `product_id=DISPLAY` for Display Ads. The Display guide documents the same
resource and the `DISPLAY` value. See [Display advertiser lookup](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Treat a missing advertiser permission as an access failure. The Product Ads
guide documents a 404 response with “No permissions found for user_id” when
the product is not enabled. The Display guide directs the user to a Commercial
Advisor for access. See [Product Ads access errors](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads access errors](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Product Ads campaign reporting

Use the current Product Ads campaign search resource. The guide says the
campaign path must end in `/search` and uses `api-version: 2`. See [Product Ads
campaign search](https://global-selling.mercadolibre.com/devsite/new-product-ads).

```http
GET https://api.mercadolibre.com/marketplace/advertising/<SITE_ID>/advertisers/<ADVERTISER_ID>/product_ads/campaigns/search
Authorization: Bearer <MERCADOLIBRE_ADS_ACCESS_TOKEN>
api-version: 2
```

The documented query fields include `limit`, `offset`, `date_from`,
`date_to`, `metrics`, and `aggregation_type`. Metrics include clicks,
impressions, cost, CPC, CTR, attributed amounts and units, CVR, ROAS, and
other campaign metrics. See [Product Ads campaign metrics](https://global-selling.mercadolibre.com/devsite/new-product-ads).

The Product Ads metrics guide allows a date range of up to 90 days. It says
metrics update at 10:00 AM GMT-3 and only one `aggregation_type` may be
requested at a time. See [Product Ads metric limits](https://global-selling.mercadolibre.com/devsite/new-product-ads).

## Display Ads campaign reporting

Display campaign listing uses `GET /advertising/advertisers/<ADVERTISER_ID>/display/campaigns` with bearer authentication and `Api-Version: 1`. The guide documents `sort_by` and `sort_order` as optional parameters. It returns campaign ID, dates, advertiser ID, status, site, type, and goal fields. See [Display campaign listing](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Campaign metrics use `date_from` and `date_to` in `YYYY-MM-DD` format:

```http
GET https://api.mercadolibre.com/advertising/advertisers/<ADVERTISER_ID>/display/campaigns/<CAMPAIGN_ID>/metrics?date_from=<YYYY-MM-DD>&date_to=<YYYY-MM-DD>
Authorization: Bearer <MERCADOLIBRE_ADS_ACCESS_TOKEN>
Content-Type: application/json
Api-Version: 1
```

The Display guide limits metric queries to 90 days. Its response documents
impressions, clicks, views, reach, spend, CPM, CPC, frequency, and event-time
and touch-point attribution metrics. See [Display campaign metrics](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Identity and consent

The public Ads operations documented here authenticate the advertiser with an
OAuth bearer token. They do not publish customer-identity fields for a
conversion upload. Do not add identity fields to an Ads request. See [Mercado
Libre OAuth](https://developers.mercadolivre.com.br/en_us/authentication-and-authorization)
and [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads).

The hub owns consent and identity handling. Require the hub's measurement
consent before first-party analytics. Require its ad-user-data consent before
any ad-user identifier would be sent to a separately documented partner. See
[ad-conversion-hub](../ad-conversion-hub/SKILL.md).

Do not hash identifiers for Mercado Libre Ads. The official Ads guides checked
do not specify a customer-list upload, hash algorithm, identity field, or
matching rule. Adding SHA-256 here would invent a vendor contract. See [Product
Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads) and
[Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Click ID and first-party cookie

The official Product Ads and Display Ads guides checked do not document a
Mercado Libre click-ID query parameter, cookie name, browser storage rule, or
attribution lifetime. Do not create `mercadolibre_click_id`, `meli_click_id`,
or a guessed cookie. See [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

If a Commercial Advisor supplies a campaign-link field in a written campaign
specification, keep it as a partner-specific field. Capture it only with the
hub consent gate. Do not treat that field as a public Mercado Libre API
parameter. See [Display Ads managed access](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Deduplication

Mercado Libre's public Ads guides do not document event-level deduplication.
They publish campaign, ad, line-item, and metric identifiers instead. Do not
send `event_id`, `eventId`, transaction IDs, or replay keys as guessed API
fields. See [Product Ads identifiers](https://global-selling.mercadolibre.com/devsite/new-product-ads)
and [Display Ads identifiers](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

Deduplicate the advertiser's own first-party events in the hub and payment
system. Keep the canonical event ID for internal reconciliation. Do not claim
that Mercado Libre deduplicated an event unless a contracted integration gives
that behavior in writing. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Verification

Use three proofs:

1. **Access proof:** run the documented advertiser lookup for the intended
   product. Record the redacted response, `advertiser_id`, and `site_id`. See
   [advertiser lookup](https://global-selling.mercadolibre.com/devsite/new-product-ads).
2. **Platform proof:** query the documented campaign and metrics resource for
   the selected product. Check dates, campaign status, spend, clicks, and
   platform-attributed sales or actions. See [Product Ads metrics](https://global-selling.mercadolibre.com/devsite/new-product-ads)
   and [Display Ads metrics](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).
3. **Business proof:** reconcile platform-reported sales with succeeded orders,
   payment-provider truth, refunds, and campaign attribution rules. A metrics
   response does not prove that an off-site payment was uploaded.

For Display Ads, record the reporting date range and whether the report uses
event-time or touch-point attribution. The Display guide documents both views.
See [Display attribution metrics](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs).

## Common pitfalls and security

- Do not invent `/conversions`, `/events`, `/pixel`, or a postback payload. [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- Do not call legacy Product Ads paths after the current guide's migration. [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- Do not confuse campaign metrics with an off-site conversions API. [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs)
- Do not send customer identifiers or payment data to the documented Ads reads. [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- Do not treat a valid OAuth token as proof of advertiser permission. [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- Do not treat a 200 metrics response as payment reconciliation.
- Do not claim click attribution without a documented campaign field. [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs)
- Do not claim Mercado Libre deduplicated a first-party event. [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)

Keep `MERCADOLIBRE_ADS_CLIENT_SECRET`, `MERCADOLIBRE_ADS_ACCESS_TOKEN`, and
`MERCADOLIBRE_ADS_REFRESH_TOKEN` server-side. Never place them in browser
bundles, URLs, logs, screenshots, or commits. Mercado Libre documents the
client secret as secret and bearer authentication in the request header. See
[Create application](https://developers.mercadolibre.com.ar/es_ar/es_ar/crea-una-aplicacion-en-mercado-libre-es)
and [Authentication and Authorization](https://developers.mercadolivre.com.br/en_us/authentication-and-authorization).

Use HTTPS for the OAuth redirect URI. See [Create application](https://global-selling.mercadolibre.com/devsite/en_us/authentication-and-authorization-global-selling/create-application).
Redact credentials from access logs.
Apply the hub consent gate before first-party measurement. Keep the adapter a
logged no-op when the Ads product or managed contract is unavailable.

## Official sources checked (2026-08-30)

- [Create application and Advertising permission](https://global-selling.mercadolibre.com/devsite/en_us/authentication-and-authorization-global-selling/create-application)
- [Authentication and Authorization](https://developers.mercadolivre.com.br/en_us/authentication-and-authorization)
- [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- [Display Ads](https://global-selling.mercadolibre.com/devsite/en_us/seller-campaign/display-gs)
- [Create an application](https://developers.mercadolibre.com.ar/es_ar/es_ar/crea-una-aplicacion-en-mercado-libre-es)
