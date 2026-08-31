---
name: criteo-ads
description: "Use when integrating Criteo Retail Media or Commerce Growth tracking, choosing OneTag versus Delivery API, wiring trackTransaction, configuring first-party IDs and consent, or verifying audience and attribution setup."
---

# Criteo Ads

Criteo documents OneTag for Retail Media and a Direct API for ad delivery.
The reviewed Criteo documentation does not describe a general public conversion-ingestion endpoint.
Use the documented OneTag or Delivery API route for the agreed Criteo product.
Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

Criteo's integration docs use a technical contact or Technical Account Manager.
That contact provides the partner ID and configures the account and ad inventory.
See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1) and [integration overview](https://developers.criteo.com/retailer-integration/docs/overview).

The official docs reviewed do not provide a public self-serve advertiser signup flow.
Start with the Criteo account team for the product, partner ID, feed, placements, and QA path.
The Retail Media integration overview describes account setup after feed preparation and technical QA.
See [integration overview](https://developers.criteo.com/retailer-integration/docs/overview).

For Retail Media management APIs, create an app in the Criteo Partners Portal.
Criteo supports client-credentials and authorization-code OAuth methods.
Advertisers grant app access to selected accounts through the Criteo consent dashboard.
See [create an app](https://developers.criteo.com/retail-media/docs/create-your-app) and [authorization requests](https://developers.criteo.com/retail-media/docs/authorization-requests).

For Delivery API authentication, Criteo documents static tokens and dynamic bearer tokens.
Static tokens come from the Technical Account Manager.
Dynamic tokens use `POST https://api.criteo.com/oauth2/token` with form fields `grant_type`, `client_id`, and `client_secret`.
The documented response gives a bearer token with `expires_in: 900`.
See [authentication tokens](https://developers.criteo.com/retailer-integration/docs/using-tokens) and [authentication](https://developers.criteo.com/retail-media/docs/authentication).

Criteo defines no environment-variable names in these docs.
Use these local hub names, which are not vendor fields:

```text
CRITEO_PARTNER_ID             Criteo partner ID
CRITEO_API_CLIENT_ID         local client ID storage
CRITEO_API_CLIENT_SECRET     local client secret storage
CRITEO_DELIVERY_TOKEN         server-only Delivery API bearer token
```

## Client-side OneTag

OneTag is a JavaScript integration that logs user events, builds audiences, and serves ads.
Load the dedicated asynchronous loader with the partner ID supplied by Criteo.
See [OneTag for Retail Media Onsite](https://developers.criteo.com/retailer-integration/docs/onetag).

```html
<script
  type="text/javascript"
  src="//dynamic.criteo.com/js/ld/ld.js?a=<CRITEO_PARTNER_ID>"
  async="true">
</script>
<script>
  window.criteo_q = window.criteo_q || [];
  window.criteo_q.push(
    { event: "setAccount", account: "<CRITEO_PARTNER_ID>" },
    { event: "setRetailerVisitorId", id: "<RETAILER_VISITOR_ID>" },
    { event: "setCustomerId", id: "<CUSTOMER_ID>" },
    { event: "trackTransaction", id: "<ORDER_ID>", page_id: "<TRANSACTION_PAGE_ID>", item: [
      { id: "<SKU>", price: "49.99", quantity: "1" }
    ] }
  );
</script>
```

The loader must run before OneTag events can fire.
The account, visitor, customer, and transaction fields above follow Criteo's documented names.
See [OneTag event examples](https://developers.criteo.com/retailer-integration/docs/onetag) and [OneTag troubleshooting](https://help.criteo.com/kb/guide/en/how-to-troubleshoot-criteo-onetag-errors-JA9r8CLYjC/Steps/1777861,1812351,1812350,1826966).

Use `setSiteType` only when you need Criteo's documented device values.
The values are `d` for desktop, `m` for mobile, and `t` for tablet.
See [OneTag universal events](https://developers.criteo.com/retailer-integration/docs/onetag).

## Rule setup and event mapping

Criteo's documented setup uses event names and page IDs, not a separate conversion-rule object.
Your Criteo technical contact supplies page IDs unless the documentation gives a standard value.
See [OneTag page events](https://developers.criteo.com/retailer-integration/docs/onetag) and [API call parameters](https://developers.criteo.com/retailer-integration/docs/api-calls-checklist).

| Hub event | Criteo event | Implementation rule |
| --- | --- | --- |
| `page_view` | `viewHome`, `viewCategory`, or `viewSearchResult` | Use the event matching the page type. |
| `view_content` | `viewItem` | Send product ID, price, and availability on product pages. |
| `lead` | No documented matching event | Keep the hub event in first-party analytics. |
| `signup` | No documented matching event | Keep the hub event in first-party analytics. |
| `begin_checkout` | `viewBasket` when the page is a basket | Do not rename a generic checkout event without product context. |
| `purchase` | `trackTransaction` | Send the completed order and its products. |
| `subscription_start` | No documented matching event | Keep the hub event in first-party analytics. |
| `refund` | No documented matching event | Reconcile refunds with payment-provider truth. |

The documented purchase event requires `page_id`, `id`, and `item`.
Each item contains a product ID, unit price, and quantity.
Product IDs must match the product feed IDs.
See [OneTag order confirmation](https://developers.criteo.com/retailer-integration/docs/onetag).

Fire `trackTransaction` on the post-purchase confirmation page after the order succeeds.
Criteo's offsite example calls this page the “Thank You” page and requires unit prices.
See [OneTag for Retail Media Offsite](https://developers.criteo.com/retailer-integration/docs/onetag-for-offsite).

## Server-side conversions API

Criteo does not document a general public Ads Conversions API in the official pages reviewed.
Do not invent `/conversions`, `/events`, a JSON conversion body, or an `event_id` field.
The documented server-capable route is the Retail Media Direct API, which requests ads and carries page events.
See [Direct API process](https://developers.criteo.com/retailer-integration/docs/integration-process).

The Delivery API uses a regional host and the `/delivery/retailmedia` path.
Criteo documents `d.eu.criteo.com`, `d.us.criteo.com`, and `d.as.criteo.com`.
Choose the endpoint from the server's origin, not the user's location.
See [Ad Server API Calls](https://developers.criteo.com/retailer-integration/docs/api-calls).

For a Direct API integration, the documented transaction request uses these fields:

```text
GET https://d.<region>.criteo.com/delivery/retailmedia
Authorization: Bearer <CRITEO_DELIVERY_TOKEN>
  ?criteo-partner-id=<CRITEO_PARTNER_ID>
  &retailer-visitor-id=<RETAILER_VISITOR_ID>
  &customer-id=<CUSTOMER_ID>
  &page-id=<TRANSACTION_PAGE_ID>
  &event-type=trackTransaction
  &transaction-id=<ORDER_ID>
  &item=<SKU_1>|<SKU_2>
  &price=<UNIT_PRICE_1>|<UNIT_PRICE_2>
  &quantity=<QTY_1>|<QTY_2>
```

The item, price, and quantity arrays must align.
The API checklist marks `page-id`, `event-type`, `transaction-id`, `item`, `price`, and `quantity` as required for the transaction call.
See [API call checklist](https://developers.criteo.com/retailer-integration/docs/api-calls-checklist).

This Delivery API call is an ad request with transaction context.
It is not a generic server conversion endpoint or a substitute for the hub's payment event.
Use it only when Criteo has approved the Direct API integration.

## Identity and consent

Use `retailer-visitor-id` for a persistent, unauthenticated first-party identifier.
Criteo documents a maximum cookie lifetime of 13 months and a minimum lifetime of 30 days.
Do not use a session cookie for this identifier.
See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

Use `customer-id` for a consistent authenticated user ID.
Continue sending `retailer-visitor-id` when you send `customer-id`.
See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

Send `email` only as a SHA-256 hash when the Criteo team enables it.
Before hashing, trim spaces, remove commas, semicolons, quotes, and double quotes, then lowercase the address.
See [Criteo email parameter rules](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

The hub owns normalization and consent decisions.
For TCFv2 API calls, Criteo documents `gdpr` and `gdpr_consent`.
For non-TCF opt-out handling, Criteo documents `block=1`.
See [European API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

OneTag supports IAB TCF through a compliant consent-management platform.
Alternatively, manually trigger OneTag only after the user consents to work with Criteo.
See [Criteo Transparency and Consent Framework](https://help.criteo.com/kb/guide/en/transparency-and-consent-framework-bbFLejr6XZ/Steps/1842462?fpc=1342.198.90.009e702c38c26b7c).

## Click ID and first-party cookie

The Criteo documentation reviewed here does not define a Criteo-owned landing-page click parameter.
It defines `retailer-visitor-id`, customer identity, and Criteo-returned tracking beacons instead.
Do not create `criteo_click_id`, `cto_lwid`, or another guessed parameter.
See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1) and [Beacon types](https://developers.criteo.com/retailer-integration/docs/beacon-types).

Persist the approved `retailer-visitor-id` in first-party storage when consent allows it.
Use your own UTM or campaign-code fields for site analytics only.
Do not treat those fields as Criteo attribution fields.
The Criteo docs describe the visitor ID as the retailer's first-party ID for cross-session activity on the same device.
See [retailer visitor ID](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

Criteo returns load, view, click, and basket-change beacon URLs through its ad delivery response.
Attach each returned beacon to the matching rendered placement or product.
See [Beacon types](https://developers.criteo.com/retailer-integration/docs/beacon-types) and [BeaconSDK](https://developers.criteo.com/retailer-integration/docs/beacon-sdk).

## Deduplication

Criteo does not document browser-to-server deduplication with a shared event ID.
The documented purchase identifiers are OneTag's `trackTransaction.id` and Direct API's `transaction-id`.
Do not assume that matching those values suppresses duplicate calls across integration methods.
See [OneTag order confirmation](https://developers.criteo.com/retailer-integration/docs/onetag) and [API call checklist](https://developers.criteo.com/retailer-integration/docs/api-calls-checklist).

Fire each Criteo beacon once for each user action.
Criteo says duplicate beacon firings can create duplicate billable activity.
The documented exception is `OnBasketChangeBeacon`, which fires for each basket change.
See [Beacon types](https://developers.criteo.com/retailer-integration/docs/beacon-types).

## Criteo settings that override code

The partner ID comes from Criteo's technical contact.
Page IDs and placement IDs also come from Criteo's configured integration.
Do not replace them with guessed values from another region or account.
See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).

The Direct API endpoint depends on the server's region.
The API docs list separate EMEA, Americas, and APAC hosts.
Ask the Technical Account Manager when the server region is unclear.
See [Ad Server API Calls](https://developers.criteo.com/retailer-integration/docs/api-calls).

The Criteo account team must configure the account, inventory, product feed, and technical QA.
Code cannot activate an unconfigured placement or replace that approval path.
See [integration overview](https://developers.criteo.com/retailer-integration/docs/overview).

## Verification

For OneTag, open the browser Network panel and find the `ld.js` loader request.
Then find an event request beginning with `event?a=`.
Criteo's troubleshooting guide uses both requests to verify loader and event execution.
See [OneTag troubleshooting](https://help.criteo.com/kb/guide/en/how-to-troubleshoot-criteo-onetag-errors-JA9r8CLYjC/Steps/1777861,1812351,1812350,1826966).

Run a test purchase on the confirmation page.
Confirm that the transaction event contains the configured account, visitor ID, order ID, product IDs, prices, and quantities.
Reconcile the order with payment-provider success and the hub dispatch record.
The Criteo QA checklist requires a test purchase for transaction tracking.
See [Sponsored Products checklist](https://developers.criteo.com/retailer-integration/docs/sponsored-products-1).

Compare Criteo hit counts with your own analytics page-view counts.
Criteo says the counts should match or remain similar across homepage, search, product, basket, and sales-confirmation pages.
See [OneTag troubleshooting](https://help.criteo.com/kb/guide/en/how-to-troubleshoot-criteo-onetag-errors-JA9r8CLYjC/Steps/1777861,1812351,1812350,1826966).

## Common pitfalls and security

- Do not use the Retail Media management OAuth token as proof of a conversion.
  It grants API access, not attribution. See [Retail Media authentication](https://developers.criteo.com/retail-media/docs/authentication).
- Do not send raw email data.
  Criteo's documented email field expects a SHA-256 value. See [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1).
- Do not fire the loader without the configured partner ID.
  Criteo says the loader cannot trigger OneTag without its account setup. See [OneTag troubleshooting](https://help.criteo.com/kb/guide/en/how-to-troubleshoot-criteo-onetag-errors-JA9r8CLYjC/Steps/1777861,1812351,1812350,1826966).
- Do not fire the same beacon twice for one action.
  Duplicate firing can create duplicate billable activity. See [Beacon types](https://developers.criteo.com/retailer-integration/docs/beacon-types).
- Do not put bearer tokens or client secrets in browser code, URLs, logs, screenshots, or commits.
  Store them in the server secret store and use HTTPS for requests.
- Do not fail checkout when Criteo is unavailable.
  Return the hub's adapter result and preserve payment-provider truth.

## Official sources checked (2026-08-29)

- [OneTag Onsite](https://developers.criteo.com/retailer-integration/docs/onetag) · [OneTag Offsite](https://developers.criteo.com/retailer-integration/docs/onetag-for-offsite)
- [Ad Server API](https://developers.criteo.com/retailer-integration/docs/api-calls) · [API call checklist](https://developers.criteo.com/retailer-integration/docs/api-calls-checklist)
- [API parameters](https://developers.criteo.com/retailer-integration/docs/api-parameters-1) · [Authentication Tokens](https://developers.criteo.com/retailer-integration/docs/using-tokens)
- [Integration overview](https://developers.criteo.com/retailer-integration/docs/overview) · [Create API Application](https://developers.criteo.com/retail-media/docs/create-your-app)
- [Authorization Requests](https://developers.criteo.com/retail-media/docs/authorization-requests) · [Authentication](https://developers.criteo.com/retail-media/docs/authentication)
- [About Audiences](https://help.criteo.com/kb/guide/en/about-audiences-0EJNOqUqYu/Steps/1842905) · [TCF](https://help.criteo.com/kb/guide/en/transparency-and-consent-framework-bbFLejr6XZ/Steps/1842462?fpc=1342.198.90.009e702c38c26b7c)
- [Beacon types](https://developers.criteo.com/retailer-integration/docs/beacon-types) · [BeaconSDK](https://developers.criteo.com/retailer-integration/docs/beacon-sdk)
- [Sponsored Products checklist](https://developers.criteo.com/retailer-integration/docs/sponsored-products-1) · [OneTag troubleshooting](https://help.criteo.com/kb/guide/en/how-to-troubleshoot-criteo-onetag-errors-JA9r8CLYjC/Steps/1777861,1812351,1812350,1826966)
