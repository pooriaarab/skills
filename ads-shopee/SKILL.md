---
name: ads-shopee
description: "Document the supported Shopee Ads seller workflow, in-Shopee attribution, reporting checks, and the boundary where no public Shopee Ads conversion API is documented. Use when evaluating Shopee Ads, planning a market launch, or deciding whether a production conversion integration exists."
---

# Shopee Ads

Shopee Ads is a seller-facing, on-platform ad product. The official Ads site
lists Product Search Ads, Shop Search Ads, Discovery Ads, Brand Ads, and other
Shopee placements. It also lists Facebook as a separate off-platform product.
See the [Shopee Ads product page](https://ads.shopee.ph/) and the [official
off-platform terms](https://help.shopee.ph/portal/4/article/77300-SHOPEE-OFF-PLATFORM-ADVERTISING-TERMS-OF-SERVICES).

The first-party pages checked on 2026-08-30 document ad creation and reporting
inside Seller Centre. They do not publish a Shopee Ads event endpoint, event
payload, browser tag, or advertiser conversion API. This skill therefore has
no Shopee Ads API adapter. It records first-party events locally and uses
Seller Centre reporting for Shopee attribution. See [Shopee Ads](https://ads.shopee.ph/)
and [Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

The documented self-serve route is a Shopee seller account. In the official
Philippines help page, sellers open Shopee Ads from the Shopee app or click
**Shopee Ads** in the Seller Centre left navigation. See [Monitoring Ads
Performance](https://ads.shopee.ph/learn/faq/58/29).

There is no separate public Shopee Ads developer signup in the first-party
pages checked. Do not ask an engineer to create an Ads app, pixel, CTV source,
or conversion token. Start with the local Seller Centre route and confirm that
the required ad type is available for that seller and market. See [Monitoring
Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

The official Product Search Ads guide shows this setup flow:

1. Select the product to advertise.
2. Choose recommended keywords or set keywords.
3. Set a bid for each keyword.

See [Using Product Ads](https://ads.shopee.ph/ad-types/17). Do not treat those
console actions as a programmable API contract.

Shopee's off-platform terms describe a separate service purchased through
Seller Centre. They require an eligible seller account and refer to external
channels such as Meta and Google. That service is not a Shopee Ads conversion
API. See the [Shopee off-platform terms](https://help.shopee.ph/portal/4/article/77300-SHOPEE-OFF-PLATFORM-ADVERTISING-TERMS-OF-SERVICES).

## Client-side tag or pixel

No public Shopee Ads browser tag, pixel ID, JavaScript SDK, or CTV measurement
source is documented in the official Ads pages checked. The pages describe
ads that run in Shopee and direct sellers to Shopee's app or Seller Centre for
performance data. See [Shopee Ads](https://ads.shopee.ph/) and [Monitoring Ads
Performance](https://ads.shopee.ph/learn/faq/58/29).

Do not add any of these assumed settings:

```text
SHOPEE_ADS_PIXEL_ID
SHOPEE_ADS_TAG_ID
SHOPEE_ADS_CTV_ID
```

On your own website, use only the analytics and consent controls already
defined by the hub. A local `page_view`, `view_content`, `lead`, or checkout
event measures your site. It does not send a Shopee Ads conversion.

## Rule setup and event mapping

Shopee's published conversion metric is tied to products and orders in Shopee.
In the Philippines help page, a conversion means a unique product sold in an
order. Items sold means the quantity of products. Orders means the number of
orders. See [the metric definitions](https://ads.shopee.ph/learn/faq/58/29).

Do not model Shopee Ads as a generic web conversion-rule API. Keep the hub
taxonomy for first-party measurement, then map it to local evidence:

| Hub event | Shopee Ads action | Adapter behavior |
| --- | --- | --- |
| `page_view` | No Shopee event | Measure on the owned site only. |
| `view_content` | No Shopee event | Measure on the owned site only. |
| `lead` | No documented Shopee Ads event | Store the lead in your system. |
| `signup` | No documented Shopee Ads event | Store the signup in your system. |
| `begin_checkout` | No documented Shopee Ads event | Store the checkout in your system. |
| `purchase` | Shopee order and product metrics | Shopee processes the checkout and payment for an on-platform order, so use Seller Centre's confirmed order and settlement data as your event truth. Compare it with your own order records. |
| `subscription_start` | No documented Shopee Ads event | Store subscription truth in your system. |
| `refund` | No documented Shopee Ads event | Reconcile against Seller Centre's confirmed order and settlement data. |

Shopee's standard click attribution in the Philippines help page covers orders
within seven days of an ad click. Its GMV Max view attribution covers orders
within one day of an eligible product view. Treat these as the documented
Philippines windows, not a universal cross-market contract. See [Monitoring
Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

## Server-side conversions API

No public Shopee Ads conversions API is documented in the first-party sources
checked. The official pages publish campaign types, setup instructions, and
Seller Centre metrics. They do not publish a Shopee Ads conversion endpoint,
HTTP method, authentication header, request schema, timestamp field, identity
field, or deduplication field. See [Shopee Ads](https://ads.shopee.ph/) and
[Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

Do not implement or probe guessed paths such as `/conversions`, `/events`, or
`/pixel`. Do not send hashed email, phone, payment data, or a hub event ID to
the Shopee Open Platform as an assumed Ads event. No first-party Ads source
checked authorizes that behavior. See [Shopee Ads](https://ads.shopee.ph/) and
[Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

The Shopee Open API developer guide is a separate app and shop-authorization
workflow. It describes developer accounts, apps, shop authorization, and
merchant operations. It does not provide a Shopee Ads conversion contract.
See the [Shopee Open API developer guide](https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/3a486040f6e64972f6dd53128a79f0dc/%5BTW%5D%5BOpen%20API%5DAPI%E4%B8%B2%E6%8E%A5%E8%AA%AA%E6%98%8E%E4%BA%8B%E9%A0%85%20%282020_09%29_newnew.pdf).

If Shopee supplies a private partner feed for a specific agreement, keep the
adapter disabled until the current contract supplies all of these details:

- endpoint and HTTP method;
- authentication and secret rotation;
- request fields and timestamp units;
- accepted identity fields and hashing rules;
- retry, retention, and deduplication rules;
- response states and reporting join key.

Record those details in the partner documentation for that campaign. Do not
promote them into this public skill from an email or an undocumented console.

## Identity and consent

The first-party Ads pages checked do not document a Shopee Ads customer-list
upload, hashed-email field, phone field, or server-side identity match rule.
Therefore this adapter sends no customer identifiers to Shopee Ads.

Gate owned-site measurement through the hub's consent model. Keep any local
identity normalization inside the hub. Hash an identifier only when a
documented destination requires it and the consent decision permits ad-user
data. No Shopee-specific hashing rule belongs here. See [Shopee
Ads](https://ads.shopee.ph/) and [Monitoring Ads
Performance](https://ads.shopee.ph/learn/faq/58/29).

Do not infer identity matching from Seller Centre's aggregate ad metrics. A
Shopee dashboard count is platform reporting, not proof that a customer
identifier was accepted from your server.

## Click ID and first-party cookie

The official Ads pages checked do not document a Shopee-owned click parameter,
cookie name, first-party cookie lifetime, or external attribution join key.
Do not create names such as `shopee_click_id`, `shopee_id`, or `sp_click_id`.
See [Shopee Ads](https://ads.shopee.ph/) and [Monitoring Ads
Performance](https://ads.shopee.ph/learn/faq/58/29).

Shopee's documented attribution is internal to its ads and order measurement.
In the Philippines help page, click and GMV Max view windows are defined by the
Shopee campaign interaction. See [the published attribution
definitions](https://ads.shopee.ph/learn/faq/58/29).

You may capture ordinary first-party campaign parameters on your own website
when your campaign link supplies them. Use only the names present in the
actual link. Store approved values under your own namespace, apply the hub's
consent rules, and attach them to the canonical event. Do not claim that
Shopee will read or join those values.

## Deduplication

Shopee publishes no browser/server event pair or deduplication field in the
first-party Ads sources checked. There is no Shopee-specific deduplication
implementation for this adapter. See [Shopee Ads](https://ads.shopee.ph/) and
[Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

Use the hub's canonical event ID for your own event store and payment
reconciliation. Make retries idempotent in your system. Do not send that ID to
Shopee as a guessed parameter, and do not count a local event as a Shopee Ads
conversion.

## Seller Centre settings that override code

Shopee's console controls the campaign configuration. Code cannot override
these settings through a documented Ads API. See [Shopee Ads](https://ads.shopee.ph/)
and [Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29).

- Product Search Ads use a selected product, keywords, and keyword bids. See
  [Product Search Ads](https://ads.shopee.ph/ad-types/17).
- Homepage Brand Ads use a budget, duration, billing details, and uploaded
  banner creative. The official guide describes CPM billing for this format.
  See [Homepage Brand Ads](https://ads.shopee.ph/ad-types/1244).
- Shop Search Ads may be automatically available only to selected sellers with
  good sales and order ratings. See [Shop Search
  Ads](https://ads.shopee.ph/ad-types/38).
- Shopee exposes separate on-platform and off-platform ad products. Do not
  assume that settings for a Facebook placement apply to an on-platform
  Shopee campaign. See [Shopee Ads](https://ads.shopee.ph/) and the [off-platform
  terms](https://help.shopee.ph/portal/4/article/77300-SHOPEE-OFF-PLATFORM-ADVERTISING-TERMS-OF-SERVICES).

Verify the local market's available ad types, billing, eligibility, and
campaign settings in Seller Centre before spend. The cited product pages are
market-specific and do not establish universal settings for every Shopee
market.

## Verification

Use two separate proofs:

1. **First-party proof:** record the owned-site request, consent decision,
   canonical event ID, and payment or signup result in your server logs.
2. **Shopee proof:** open the Shopee app or Seller Centre and review the ad
   performance metrics for the campaign. The official Philippines guide gives
   those navigation paths. See [Monitoring Ads
   Performance](https://ads.shopee.ph/learn/faq/58/29).

Shopee processes checkout and payment for on-platform orders, so there is no
separate external payment provider to reconcile against for those sales.
Reconcile orders, sales, and refunds against Shopee's `Confirmed` order and
settlement data instead. Do not treat Shopee's `Placed` numbers as settled
revenue. Shopee defines placed sales as the order value at checkout,
including paid and unpaid orders. It defines confirmed sales separately. See
[Placed and Confirmed metrics](https://ads.shopee.ph/learn/faq/58/29).

For the Philippines page checked, the dashboard can export data for up to the
last 90 days. Keep a dated export with the campaign ID, market, time zone, and
report filters used. See [Checking performance and export
limits](https://ads.shopee.ph/learn/faq/58/29).

A successful page view, local event, or Seller Centre login does not prove that
Shopee credited a sale. Attribution proof comes from the platform report and
must be compared with your own order truth.

## Common pitfalls and security

- Do not use `open.shopee.com` merchant APIs as an Ads conversion API. The
  official Open API guide documents a separate app and shop workflow. See the
  [Open API guide](https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/3a486040f6e64972f6dd53128a79f0dc/%5BTW%5D%5BOpen%20API%5DAPI%E4%B8%B2%E6%8E%A5%E8%AA%AA%E6%98%8E%E4%BA%8B%E9%A0%85%20%282020_09%29_newnew.pdf).
- Do not invent an Ads endpoint, bearer token, pixel ID, click ID, cookie, or
  payload field. The first-party Ads pages checked publish none of these
  contracts. See [Shopee Ads](https://ads.shopee.ph/) and [Monitoring Ads
  Performance](https://ads.shopee.ph/learn/faq/58/29).
- Do not equate a Shopee `Conversion` with a website purchase. Shopee defines
  it as a unique product sold in an order. See [metric
  definitions](https://ads.shopee.ph/learn/faq/58/29).
- Do not mix `Placed` and `Confirmed` metrics. A placed order can include an
  unpaid checkout. See [Placed and Confirmed
  metrics](https://ads.shopee.ph/learn/faq/58/29).
- Do not generalize the Philippines attribution windows to another market.
  Confirm the local Seller Centre rules before reporting performance. See the
  [Philippines attribution page](https://ads.shopee.ph/learn/faq/58/29).
- Keep any credentials for your own backend or an approved partner in the
  server secret store. Never put secrets in browser bundles, URLs, logs,
  screenshots, or commits.
- Apply the hub consent gate before first-party measurement. Keep the adapter a
  logged no-op when no approved Shopee contract exists. It must not fail a
  checkout or payment webhook.

## Hub conventions

Pair this adapter with [ad-conversion-hub](../ad-conversion-hub/SKILL.md) and
the experiment policy used by the application. The hub owns the event
envelope, consent gate, local identity handling, retry policy, and payment
truth. This adapter owns only the documented Shopee campaign and reporting
facts.

The adapter's safe default is:

```text
Shopee Ads server dispatch: disabled
Shopee browser tag: absent
Shopee click-ID parsing: absent
Shopee customer-list upload: absent
Shopee proof: Seller Centre report plus first-party reconciliation
```

## Official sources checked (2026-08-30)

- [Shopee Ads](https://ads.shopee.ph/)
- [Monitoring Ads Performance](https://ads.shopee.ph/learn/faq/58/29)
- [Using Product Ads](https://ads.shopee.ph/ad-types/17)
- [Homepage Brand Ads](https://ads.shopee.ph/ad-types/1244)
- [Shop Search Ads](https://ads.shopee.ph/ad-types/38)
- [Shopee off-platform advertising terms](https://help.shopee.ph/portal/4/article/77300-SHOPEE-OFF-PLATFORM-ADVERTISING-TERMS-OF-SERVICES)
- [Shopee Open API developer guide](https://cdngarenanow-a.akamaihd.net/shopee/seller/seller_cms/3a486040f6e64972f6dd53128a79f0dc/%5BTW%5D%5BOpen%20API%5DAPI%E4%B8%B2%E6%8E%A5%E8%AA%AA%E6%98%8E%E4%BA%8B%E9%A0%85%20%282020_09%29_newnew.pdf)
