---
name: twitch-ads
description: "Use when wiring Twitch Ads through Amazon DSP, answering how to get Twitch inventory, installing the Amazon Ad tag, importing off-Amazon conversions with Amazon DSP Conversions API, or debugging missing Twitch attribution. Twitch has no separate public conversion endpoint. The supported measurement route is Amazon DSP and Amazon Ad tag, with regional access, consent, and reporting limits."
---

# Twitch Ads

Twitch Ads is an Amazon DSP product surface. Twitch does not publish a separate
advertiser pixel or conversion API. Use Amazon DSP for buying and measurement.
Use the Amazon Ad tag or Amazon Ads Conversions API for off-Amazon events.

The [Twitch Developer API](https://dev.twitch.tv/docs/api/reference/) covers broadcaster and Twitch product data. It does not document advertiser conversion tracking. Do not use its OAuth scopes or Helix endpoints for ad measurement.

## Account and access

Amazon DSP offers self-service and managed-service access to brands, agencies, and tool providers. You do not need to sell on Amazon. Twitch supply varies by region. See [Twitch Ads access paths](https://advertising.amazon.com/channels/twitch) and the [Amazon DSP signup page](https://advertising.amazon.com/solutions/products/amazon-dsp).

1. Select **Register** for self-service access.
2. Select the regional view and create an advertiser under the entity.
3. Contact [Amazon Ads sales or partners](https://advertising.amazon.com/contact-sales) for managed service. The managed-service minimum is about USD 50,000. Amazon lists USD 10,000 as the recommended self-service video campaign minimum.

Premium Twitch Video packages have separate inventory rules. The [Twitch Premium Video specifications](https://advertising.amazon.com/en-ca/resources/ad-specs/twitch/premium-video) page lists supported locales and approved third-party providers. Console and streaming-device inventory is not clickable.

### API access

Direct server integration requires an Amazon Ads API application and approval. Choose **Direct advertiser** for your own account. Choose the Partner Network route for a tool used by other advertisers. An advertiser using an approved third-party tool does not request API access. See [Amazon Ads API access](https://advertising.amazon.com/about-api).

Amazon Ads API access uses Login with Amazon and OAuth 2.0. Keep the client ID, client secret, refresh token, and short-lived access token on the server. Use the regional API host for the advertiser:

- NA: `https://advertising-api.amazon.com`
- EU: `https://advertising-api-eu.amazon.com`
- FE: `https://advertising-api-fe.amazon.com`

See [regional API endpoint guidance](https://advertising.amazon.com/resources/whats-new/register-and-manage-ads-worldwide-with-global-seat) and the [API onboarding guide](https://advertising.amazon.com/API/docs/en-us/guides/onboarding/overview).

The adapter can use these environment names. Amazon defines the values, not these names:

- `TWITCH_ADS_TAG_ID`: public Amazon Ad tag ID.
- `TWITCH_ADS_API_CLIENT_ID`: Login with Amazon application ID.
- `TWITCH_ADS_API_CLIENT_SECRET`: Login with Amazon application secret.
- `TWITCH_ADS_REFRESH_TOKEN`: long-lived OAuth refresh token.
- `TWITCH_ADS_ACCOUNT_ID`: Amazon DSP account ID used in the path.
- `TWITCH_ADS_API_REGION`: `NA`, `EU`, or `FE`.
- `TWITCH_ADS_CONVERSION_DEFINITION_<EVENT>_ID`: saved definition ID.

See [Amazon's token guide](https://advertising.amazon.com/API/docs/en-us/get-started/generate-api-tokens).

## Client-side Amazon Ad tag

Create one Amazon Ad tag per advertiser in Amazon DSP. Use **Events Manager → Create tag → View tag code**. Accept the terms first. See [Create an Amazon Ad tag](https://advertising.amazon.com/help/GLZ54GXQW773A6MG).

Store the public tag identifier as `TWITCH_ADS_TAG_ID`. Amazon calls it the tag ID or advertiser AAT ID. Copy it from **View tag code**. Do not copy a placeholder ID.

Paste the generated JavaScript base code in the `<head>` of every advertiser website page. It loads the library and records the initial page view. Do not place it inside an ad creative. See Amazon's [privacy FAQ](https://advertising.amazon.com/help/G9Y77VYQ3VJZU5YV).

After the base code loads, use the documented JavaScript call:

```js
amzn("trackEvent", "Purchase", {
  value: 49.99,
  currencyCode: "USD",
  unitsSold: 1,
  productId: "plan-pro",
  clientDedupeId: "order_123"
});
```

`EVENT_NAME`, attribute keys, and values are free-form strings. Keep each within 256 characters and avoid Amazon's documented special characters. Use `PageView`, `Checkout`, `Signup`, `Lead`, and `Purchase` when they match the definitions. See the [tag event examples](https://advertising.amazon.com/help/GLZ54GXQW773A6MG).

Amazon also publishes a [client-side GTM template](https://github.com/amzn/ads-pao-amznjs-gtm-template). It accepts the Amazon DSP Tag ID, region, event name, transaction ID, value, currency, units, and advanced matching fields.

## Server-side Conversions API

Amazon calls this the **Conversions API** or **Events API**. It imports off-Amazon website, app, and offline events. Twitch is the media supply. The definition and feed belong to the Amazon DSP advertiser.

Accept the terms in **Amazon DSP → advertiser → Events Manager**. Record the advertiser ID. Create one definition per separately reported event. Use `source: SERVER_TO_SERVER` and `sourceType: WEBSITE` for web events.

The documented endpoints are:

```text
POST {REGIONAL_API_HOST}/accounts/{accountId}/dsp/conversionDefinitions
POST {REGIONAL_API_HOST}/accounts/{accountId}/dsp/conversionDefinitions/eventData
POST {REGIONAL_API_HOST}/accounts/{accountId}/dsp/conversionDefinitions/list
```

Use an OAuth 2.0 bearer access token and the Amazon Ads API client ID. The current API reference controls media-type headers for your version. Do not copy headers from an old SDK. See [CAPI event import](https://advertising.amazon.com/help/GEDE65PCE2CL5P63) and the [API overview](https://advertising.amazon.com/API/docs/en-us/reference/api-overview).

Create definitions with these required fields:

- `name`: your event definition name.
- `source`: `SERVER_TO_SERVER`.
- `sourceType`: `WEBSITE`, `OFFLINE`, `ANDROID`, `FIRE_TV`, or `IOS`.
- `conversionType`: the standard Amazon reporting type.
- `countingMethod`: `EVERY` or `FIRST`.

Send each event with these required fields:

```json
{
  "source": "SERVER_TO_SERVER",
  "eventData": [{
    "name": "Purchase",
    "conversionDefinitionID": "<definition-id>",
    "clientDedupeId": "order_123",
    "timestamp": "2026-08-29T19:20:00Z",
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

`eventData` accepts 1 to 100 events. Amazon limits the feed to five transactions per second per advertiser. Events can be up to seven days old. Older events are not processed. Invalid events in a batch can fail while valid events succeed.

### Identity and consent

The feed requires at least one `matchKeys` item and allows one match key per event. For email, trim whitespace, lowercase, then SHA-256 hash. For phone, remove formatting, use E.164, then hash. Use only types accepted by the current schema. The [identity guide](https://advertising.amazon.com/help/GRBFNDEWC6MMBCF8) documents un-hashed IDFA and GAID for supported app signals. Never send raw email or phone values.

Apply the [ad-conversion-hub](../ad-conversion-hub/SKILL.md) consent gate first. Require `measurement` before dispatch. Require `ad_user_data` before sending hashed identity. Do not reject a purchase because it has no Twitch click ID.

For EEA traffic, Amazon requires a country code for every tag signal and one of TCF, GPP, or Amazon Consent Signal. See the [GTM consent guidance](https://advertising.amazon.com/help/GYG4R7ZLC2VCHA37). Keep denied consent denied. Do not infer consent from a missing CMP value.

## Canonical event mapping

The hub owns canonical names. Create Amazon definitions with these standard `conversionType` values:

| Hub event | Amazon conversion type | Notes |
| --- | --- | --- |
| `page_view` | `PAGE_VIEW` | Use `FIRST` only when one view per customer per 24 hours is intended. |
| `view_content` | `OTHER` | No standard content-view type is listed. Use a custom name. |
| `lead` | `LEAD` | `CONTACT` is another listed option for contact capture. |
| `signup` | `SIGN_UP` | Use a completed account creation event. |
| `begin_checkout` | `CHECKOUT` | Fire when checkout starts. |
| `purchase` | `OFF_AMAZON_PURCHASES` | Send `value`, `currencyCode`, and `unitsSold`. |
| `subscription_start` | `SUBSCRIBE` | Use a paid subscription start. |
| `refund` | `UNVERIFIED` | No refund conversion type appears in the current list. Reconcile refunds in the hub. |

See Amazon's [off-Amazon conversion type list](https://advertising.amazon.com/help/G9RBFG5C8W8DPT2E). Do not invent a Twitch event name or an Amazon conversion type for a refund.

## Deduplication

Use the hub's stable `event_id`, usually the payment-provider transaction ID. Send it in the browser event's `clientDedupeId` and the server twin's deduplication field. Amazon's current tag and import docs use `clientDedupeId`. Its [deduplication guide](https://advertising.amazon.com/help/GP5ZEF499J3K976K) calls the Events API twin `eventId`.

This naming differs across Amazon documents. Check the current schema after enabling the feed. Never use `event_id` by assumption. Amazon drops later events with the same ID and near-identical events received within 200 milliseconds. `FIRST` also drops later matches from the same customer within 24 hours. Use `EVERY` for purchases unless the business rule requires one daily event.

## Click and attribution behavior

**UNVERIFIED: no Twitch-specific URL click parameter is documented in the current official sources reviewed here.** Do not invent `twitchclid`, `amznclid`, or a cookie lifetime.

Amazon documents an ad-system cookie named `ad-id`, not a URL click parameter. Amazon Ads systems, including the tag, retain data for no longer than 13 months. Let the tag manage its cookie. Store your own UTMs if needed. Do not put `ad-id` in `click_ids` without an Amazon-documented use.

Twitch Premium Video is clickable except on consoles and streaming devices. Its third-party 1x1 trackers support impressions, clicks, quartiles, and completes. These are media trackers, not website conversion events. See the [Twitch tracking rules](https://advertising.amazon.com/en-ca/resources/ad-specs/twitch/premium-video).

Amazon DSP generally uses a 14-day lookback. Reports can take up to 12 hours. Unified reporting uses the traffic date, not the conversion date. See [campaign attribution](https://advertising.amazon.com/help/GX7KDKHMWQYMJ385) and [unified reporting](https://advertising.amazon.com/help/GMH8A8AJSH4ATV6T).

CTV measurement is not supported on Twitch for any listed third-party vendor. Do not promise device-level conversion measurement for Twitch streaming-TV inventory. See [Amazon third-party measurement support](https://advertising.amazon.com/help/GSNREEBVE443263V).

## Verification

Verify the client tag as request proof: trigger an event, filter browser Network by the tag ID, and confirm HTTP 200 from `https://s.amazon-adsystem.com`. Confirm the event and attributes in Amazon DSP **Events**. See [Validate Amazon Ad tag](https://advertising.amazon.com/help/GC8VWBHTEXH9XP2A).

Verify server events as platform proof: open **Amazon DSP → advertiser → Events Manager → Conversions**, confirm the source is Conversions API, check **Last date received** and alerts, then confirm off-Amazon metrics in Report Center or the reporting API. Allow for reporting delay. Reconcile counts and value with succeeded charges. A 200 response proves transport only.

## Common pitfalls

- Using Twitch Helix OAuth for Amazon DSP. These are different products.
- Expecting a Twitch pixel or a `TWITCH_PIXEL_ID`. Use the Amazon DSP tag ID.
- Copying an example tag ID. The generated code is advertiser-specific.
- Creating the tag but not accepting the Amazon DSP Events Manager terms.
- Sending raw identity data or using hub hashing without Amazon's exact rules.
- Sending a browser and server event with different deduplication IDs.
- Using the wrong regional API host for the advertiser.
- Sending events more than seven days after they occurred.
- Reading a 0 count before Amazon's reporting delay ends.
- Treating Twitch 1x1 impression trackers as website conversion tags.
- Expecting click attribution from console, streaming-device, or CTV inventory.
- Enabling `FIRST` and then wondering why repeated events disappear.
- Retrying an accepted request without checking the deduplication record.

## Security

Keep the OAuth client secret, refresh token, and access token in the deployment secret store. Keep them out of browser code, URLs, logs, screenshots, and git. Keep `TWITCH_ADS_TAG_ID` public, but scope it to the correct advertiser.

Hash identity only after the hub consent gate. Never log raw or normalized identity. Send events over HTTPS. Restrict API permissions to required Amazon DSP resources. Rotate credentials through the Amazon Ads console.
