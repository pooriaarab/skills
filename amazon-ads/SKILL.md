---
name: amazon-ads
description: "Use when setting up Amazon Ads advertiser access, Amazon Ad Tag tracking, Amazon DSP Conversions API events, Amazon Attribution, or Amazon Ads conversion debugging. Covers self-serve signup, DSP Events Manager gates, regional OAuth API access, AAT and CAPI event mapping, hashed match keys, deduplication, consent, and delayed reporting."
---

# Amazon Ads

Amazon Ads has two different conversion paths. Amazon Ad Tag (AAT) runs in a
browser. Amazon DSP Conversions API imports web, app, or offline events from a
server. Sponsored Ads and Amazon Attribution use different account and
measurement paths. Do not mix their IDs or endpoints.

## Account and access

1. Create a [Sponsored Ads account](https://advertising.amazon.com/register/) for self-serve product advertising.
2. Create an Amazon DSP advertiser in the Ads Console. DSP supports self-service in its listed markets. Managed service normally requires a sales contact and a USD 50,000 minimum spend, which can vary by country. See [DSP account options](https://advertising.amazon.com/solutions/products/amazon-dsp).
3. For CAPI, accept the Advertiser Audience Agreement and CAPI terms in DSP **Events Manager**. Record the advertiser ID and account ID. This gate is required before creating conversion definitions. See [CAPI setup](https://advertising.amazon.com/help/GEDE65PCE2CL5P63).
4. For programmatic access, request an Amazon Ads API application and pass Amazon's approval process. Direct advertisers and Partner Network businesses use different request paths. See [API access](https://advertising.amazon.com/about-api/).
5. Authorize with Login with Amazon (LWA). Use OAuth access tokens and refresh them when they expire. Use `advertising-api.amazon.com` (NA), `advertising-api-eu.amazon.com` (EU), or `advertising-api-fe.amazon.com` (FE). See [regional API hosts](https://advertising.amazon.com/resources/whats-new/register-and-manage-ads-worldwide-with-global-seat) and [LWA refresh tokens](https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html).

Use these integration variables. They are local names, not Amazon console
field names:

```text
AMAZON_ADS_TAG_ID                  # public AAT ID from DSP Events Manager
AMAZON_ADS_CLIENT_ID               # LWA / Amazon Ads API client ID
AMAZON_ADS_CLIENT_SECRET           # server secret for token refresh
AMAZON_ADS_REFRESH_TOKEN            # server credential from LWA
AMAZON_ADS_ACCESS_TOKEN             # short-lived server bearer token
AMAZON_ADS_ACCOUNT_ID              # DSP account ID used in CAPI paths
AMAZON_ADS_PROFILE_ID              # API scope for the selected region
AMAZON_ADS_CONVERSION_DEFINITION_* # one definition ID per tracked event
```

## Client-side Amazon Ad Tag

Create one tag per DSP advertiser. In DSP Campaign Manager, open **Events Manager → Create tag → View tag code** and accept the terms. Amazon says the base code is advertiser-specific. See [Create an Amazon Ad tag](https://advertising.amazon.com/help/GLZ54GXQW773A6MG).

Load the generated JavaScript base code in the header on every page of the advertiser's website. The library URL is `https://c.amazon-adsystem.com/aat/amzn.js`. Add event code where the action occurs:

```js
amzn("trackEvent", "Purchase", {
  value: 49.99,
  currencyCode: "USD",
  unitsSold: 1,
  clientDedupeId: "<canonical-event-id>"
});
```

`EVENT_NAME` and attribute keys are advertiser-defined. Keep names within Amazon's documented length and character rules. Use `clientDedupeId` when the same event also goes through CAPI.

Amazon's identity article shows `aat("setHashedEmail", value)` and `aat("track", name, attributes)`, while its tag setup article shows `amzn("trackEvent", name, attributes)`. This is a documented alias difference. Use the function name and base code generated for the advertiser. See [identity signals](https://advertising.amazon.com/help/GRBFNDEWC6MMBCF8).

Set country and consent before loading or firing the tag. Country is always required as an uppercase ISO 3166-1 alpha-2 code. For the EEA, provide TCF, GPP, or Amazon Consent Signal (ACS). The ConsentJS library is `https://c.amazon-adsystem.com/aat/amzn-consent.js`. See [AAT consent requirements](https://advertising.amazon.com.au/help/G2648JUCRZU662V5).

The tag must run on the advertiser's website, not inside an ad creative. Update the site's CSP for Amazon tag domains if it blocks the script or event request. See [AAT privacy and security FAQ](https://advertising.amazon.com/help/G9Y77VYQ3VJZU5YV).

## Server-side Conversions API

The public CAPI is an Amazon DSP API, not a generic Sponsored Ads API. Create one conversion definition for each event that needs separate reporting:

```http
POST https://advertising-api.amazon.com/accounts/{accountId}/dsp/conversionDefinitions
```

Use the regional API host for the advertiser. The definition requires:

```json
{
  "name": "Website purchase",
  "source": "SERVER_TO_SERVER",
  "sourceType": "WEBSITE",
  "conversionType": "OFF_AMAZON_PURCHASES",
  "countingMethod": "EVERY"
}
```

The documented `conversionType` values include `PAGE_VIEW`, `CHECKOUT`, `CONTACT`, `LEAD`, `SIGN_UP`, `SUBSCRIBE`, `OFF_AMAZON_PURCHASES`, and `OTHER`. Save the returned conversion definition ID. See [off-Amazon conversion types](https://advertising.amazon.com/help/G9RBFG5C8W8DPT2E).

Send events with this endpoint:

```http
POST https://advertising-api.amazon.com/accounts/{accountId}/dsp/conversionDefinitions/eventData
Authorization: Bearer <access-token>
Amazon-Advertising-API-ClientId: <client-id>
Amazon-Advertising-API-Scope: <profile-id>
Content-Type: application/json
```

The API requires a valid OAuth bearer token, LWA client ID, and profile ID in the API scope header. Use the profile for the selected regional host. The event body has this shape:

```json
{
  "source": "SERVER_TO_SERVER",
  "eventData": [{
    "name": "Purchase",
    "conversionDefinitionID": "<definition-id>",
    "clientDedupeId": "<canonical-event-id>",
    "timestamp": "2026-08-29T20:15:00Z",
    "matchKeys": [{
      "type": "EMAIL",
      "value": "<sha256-normalized-email>"
    }],
    "value": 49.99,
    "currencyCode": "USD",
    "unitsSold": 1
  }]
}
```

Required event fields are `source`, `eventData`, `name`, `conversionDefinitionID`, `timestamp`, and `matchKeys`. The schema allows one to 100 events per request and one `matchKeys` entry per event. `timestamp` is ISO 8601. Amazon rejects events more than seven days old and limits this feed to five transactions per second per advertiser. See [CAPI event fields](https://advertising.amazon.com/help/GEDE65PCE2CL5P63).

For `matchKeys`, trim and lowercase email, remove characters outside `[a-zA-Z0-9.@-]`, then apply SHA-256. Normalize phone to E.164, then apply SHA-256. `MATCH_ID` is also supported for an advertiser-defined privacy-safe identifier. Amazon supports SHA-256 only for hashed match keys. See [CAPI customer information](https://advertising.amazon.co.uk/help/GH2LNLGJUCECRCK2).

For `OFF_AMAZON_PURCHASES`, send `value`, `currencyCode`, and `unitsSold`. Use an ISO-4217 currency code. The value must be non-negative and have no more than two decimal places. `unitsSold` defaults to one when omitted. For other conversion types, value is a non-monetary score.

## Canonical event mapping

The hub owns the canonical event. Amazon owns the conversion definition and event name. Keep the same canonical `event_id` in browser and server dispatches.

| Hub event | Amazon definition | Recommended event name | Notes |
| --- | --- | --- | --- |
| `page_view` | `PAGE_VIEW` | `PageView` | Use `FIRST` only when one event per user per day is intended. |
| `view_content` | `OTHER` | `ViewContent` | No `VIEW_CONTENT` standard type is listed. |
| `lead` | `LEAD` | `Lead` | Use `CONTACT` when the action only collects contact data. |
| `signup` | `SIGN_UP` | `SignUp` | Fire after account creation. |
| `begin_checkout` | `CHECKOUT` | `Checkout` | Fire when checkout starts. |
| `purchase` | `OFF_AMAZON_PURCHASES` | `Purchase` | Send value, currency, and units. |
| `subscription_start` | `SUBSCRIBE` | `Subscribe` | Use `OTHER` if the business event differs. |
| `refund` | `OTHER` | `Refund` | Confirm refund reporting behavior before launch. |

## Deduplication

Use the hub's canonical `event_id` as the shared dedup value. AAT and the current CAPI event schema document `clientDedupeId`; Amazon's separate deduplication article calls the Events API twin `eventId`. This is a naming conflict in current Amazon documentation. Use the exact property required by the enabled API schema and the same value on both sources. See [CAPI deduplication](https://advertising.amazon.com/help/GP5ZEF499J3K976K).

Amazon also drops duplicate events from the same user and conversion within 200 ms. A definition using `FIRST` drops later events from that user within 24 hours. These rules are separate from the shared ID.

## Click ID and identity persistence

Amazon does not document a URL click parameter for AAT or CAPI that matches `gclid` or `fbclid`. Do not invent `amazon_click_id`. Amazon documents an Amazon system cookie named `ad-id`, but it does not define it as an application click ID or publish its individual lifetime. Amazon says AAT data is generally retained for no longer than 13 months. See [AAT data privacy](https://advertising.amazon.com/help/G9Y77VYQ3VJZU5YV).

Use `match_id` when the product needs a first-party join across web, server, offline, or multi-step flows. Generate it in the application, persist it in consented first-party storage, send it with AAT, and reuse it in CAPI as a `MATCH_ID` match key. It is an advertiser-defined identity key, not a vendor click ID, and has no Amazon-defined retention period. See [Match ID](https://advertising.amazon.ae/help/GY9FGKVE76CYWQ29).

Never gate a server purchase on `ad-id`, `match_id`, or any click signal.
Send consented purchases from the payment webhook and add identity or click
signals only when available.

## Tracking quirks that bite

- Amazon requires `countryCode` for all AAT traffic. EEA traffic also needs TCF, GPP, or ACS consent. Missing consent can stop processing.
- `dataProcessingOptions: "LIMITED_DATA_USE"` marks the CAPI event as not processed. Do not send it when the hub has measurement consent but no permitted ad processing.
- CAPI definitions are required before event ingestion. A valid token alone does not create a conversion goal.
- CAPI accepts events only seven days after occurrence. Queue retries inside that window and dead-letter older events.
- Amazon reporting can take up to 12 hours. Reports use the ad interaction date, not always the event date. DSP view attribution commonly uses a 14-day lookback window. See [campaign attribution](https://advertising.amazon.com/help/GX7KDKHMWQYMJ385).
- Amazon Attribution is separate. Its tags measure traffic to Amazon product detail and Brand Store pages. Amazon masks rows with fewer than 10 clicks; after the tenth click, metrics can take up to 48 hours to appear. See [Attribution tag troubleshooting](https://advertising.amazon.com/help/G2LXF2NVBGFTXM2R).
- AAT has one tag per advertiser. Reusing a tag across advertisers breaks account ownership and reporting.
- AAT and CAPI use different identity code examples. Copy the generated advertiser tag and test the actual function name.
- Regional host, profile scope, advertiser ID, and account ID must belong to the same Amazon Ads region.

## Verification

Use three proofs:

1. Record the CAPI HTTP response, status, and any returned request identifier. A 2xx response proves request acceptance only.
2. In DSP Campaign Manager, open **Events Manager → Conversions**. Confirm the event definition, `Source`, and `Last date received`. See [view imported events](https://advertising.amazon.com/help/GF97FJUFXBDM32P4).
3. Query the DSP report or API after the reporting delay. Reconcile `OFF_AMAZON_PURCHASES` with successful payment-provider charges. Amazon Ads is an attribution view, not the payment ledger.

For AAT, the browser Network panel should show a 200 response from `https://s.amazon-adsystem.com`. Use Amazon Ad Tag Helper and the Events home page to inspect events. This is tag request proof, not server-side platform proof. See [validate Amazon Ad tag](https://advertising.amazon.com/help/GC8VWBHTEXH9XP2A).

## Common pitfalls

- Sending a CAPI event to the Sponsored Ads API or Amazon Attribution API.
- Using `AMAZON_ADS_TAG_ID` as the DSP account ID or definition ID.
- Omitting the definition or using the wrong case in `conversionDefinitionID`.
- Hashing an already hashed identifier or sending raw email or phone data.
- Using the general AAT email rule for the stricter CAPI `matchKeys` rule.
- Retrying an unknown response without checking deduplication.
- Treating a 2xx response or browser request as platform proof.
- Expecting same-day reports or treating masked Attribution rows as zero conversions.
- Sending `LIMITED_DATA_USE` and expecting Amazon to process the event.

## Hub contract

Pair this skill with `ad-conversion-hub`. The hub owns canonical event names, consent gating, identity normalization, dispatch records, retries, and payment reconciliation. This skill owns Amazon field names and console gates.

Return `skipped` when the tag ID, token, scope, or definition ID is absent. Return `failed` for 4xx or 5xx responses. Do not fail a payment webhook because Amazon Ads fails. Retry timeouts and 5xx responses with bounded backoff. Do not retry 400, 401, 403, or policy errors without a changed request.

## Security

Keep LWA client secrets, refresh tokens, and access tokens in the deployment secret store. Keep them out of browser bundles, URLs, logs, screenshots, and commits. Keep `AMAZON_ADS_TAG_ID` public, but treat advertiser and profile IDs as account metadata. Hash identity only after the hub consent gate. Do not log raw or normalized identity values. Restrict tag collection to the advertiser's website and publish required privacy and opt-out notices.

## Official sources checked (2026-08-29)

- https://advertising.amazon.com/help/GEDE65PCE2CL5P63
- https://advertising.amazon.com/help/GLZ54GXQW773A6MG
- https://advertising.amazon.com/help/GP5ZEF499J3K976K
- https://advertising.amazon.com/help/GRBFNDEWC6MMBCF8
- https://advertising.amazon.com/about-api/
