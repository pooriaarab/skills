---
name: line-ads
description: "Set up LINE Ads Platform (LAP) web conversion tracking in Taiwan or Thailand: self-serve advertiser access, LINE Tag, LINE Conversion API v1, ldtag_cl capture, deduplication_key pairing, consent and user matching, 30-day attribution, and server-side verification. Use when wiring LAP Purchase or GenerateLead tracking, or debugging missing LINE conversions."
---

# LINE Ads

LINE Ads is a real self-serve platform in Taiwan and Thailand. Its web stack is
LINE Tag plus LINE Conversion API v1.

Do not use this skill for a new Japan LINE Ads account. Japan stopped new LINE
Ads API applications on 2025-12-25 and new LINE Ads account applications on 2026-06-30. LINE says Japan LINE Ads ends in March 2027. Use LY Ads instead.
Sources: [Japan sunset notice](https://developers.line.biz/en/news/2026/03/31/line-ads-api/),
[Japan account notice](https://pages.linebiz.com/line-ads-real-estate/index.html),
and [Japan API notice](https://www.lycbiz.com/jp/manual/line-ads/other_011/).

## Account and access

### Taiwan LAP

1. Create a LINE Business ID and open LAP from [LINE Taiwan](https://tw.linebiz.com/account/).
   This is a self-serve signup path.
2. Complete advertiser identity verification. Non-individual advertisers upload
   business registration and a signed identity authorization letter.
3. Enable 2FA on the LINE Business ID. Taiwan requires 2FA before ad-account
   creation. See the [Taiwan identity guide](https://lap-identify-verfication.landpress.line.me/lap-identify-verfication-en/).
4. Create the ad account and LINE Tag in Ad Manager.
5. In Business Manager, issue a Conversion API token for that LINE Tag.

### Thailand LINE Ads

1. Create a LINE Official Account.
2. Create a LINE Business ID and open [LINE Ads Manager](https://admanager.line.biz/).
3. Create a group and ad account. Enter payer, advertiser, product, and website
   information. The account enters review.
4. Complete business verification and add a payment method.
5. Create a LINE Tag. Issue its Conversion API token in Business Manager.

See the [Thailand onboarding guide](https://lineforbusiness.com/th-en/service/line-ads)
and [account manual](https://lineforbusiness.com/th-en/service/line-ads/manual).
The LINE Official Account admin must approve the ad-account link.

LINE does not define environment-variable names. Use these local adapter names:

```text
LINE_ADS_TAG_ID       LINE Tag `tagId` and API path ID
LINE_ADS_CAPI_TOKEN   Business Manager Conversion API token
LINE_ADS_CHANNEL_ID   Numeric LINE channel ID when sending `line_uid`
```

Keep the token and channel ID on the server. The tag ID is public.

## Client-side LINE Tag

Get the account-specific code from Ad Manager: **Reports and figures** →
**Tracking (LINE Tag)**. Put the base code in `<head>` on every page that needs
measurement. A tag manager is also supported. Load the base code before event
code. Use one base code from the account's tag set per page. Source: [LINE Tag
manual](https://lineforbusiness.com/th-en/service/line-ads/manual).

This is the real loader and call shape. Copy the generated account code before
deployment.

```html
<script>
(function(g,d,o){g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
var h=location.protocol==='https:'?'https://d.line-scdn.net':'http://d.line-cdn.net';
var s=d.createElement('script');s.async=1;s.src=o||h+'/n/line_tag/public/release/v1/lt.js';
var t=d.getElementsByTagName('script')[0];t.parentNode.insertBefore(s,t);})(window,document);
_lt('init',{customerType:'lap',tagId:'<LINE_ADS_TAG_ID>'});
_lt('send','pv',['<LINE_ADS_TAG_ID>']);
</script>
```

Install the conversion code on the conversion page, after the base code:

```html
<script>
_lt('send','cv',{type:'Purchase',value:25.00,currency:'USD'},['<LINE_ADS_TAG_ID>']);
</script>
```

`Purchase` supports `value` and `currency` for value optimisation. The [standard
event guide](https://www.lycbiz.com/jp/manual/line-ads/tracking_021/) lists the
standard event names.

## Server-side Conversion API v1

```text
POST https://conversion-api.tr.line.me/v1/{line_tag_id}/events
Content-Type: application/json
X-Line-TagAccessToken: $LINE_ADS_CAPI_TOKEN
X-Line-ChannelID: $LINE_ADS_CHANNEL_ID   # only with user.line_uid
```

The [official API reference](https://conversion-api-docs.linebiz.com/en/)
requires a JSON array. Each item requires `event` and `user`. Web events can
include `web`; standard-event value data goes in `custom`.

```json
[
  {
    "event": {
      "source_type": "web", "event_type": "conversion",
      "event_name": "Purchase", "event_timestamp": 1735689600,
      "deduplication_key": "payment-provider-event-id", "test_flag": false
    },
    "user": {
      "click_id": "<ldtag_cl>", "browser_id": "<__lt__cid>",
      "email": "<sha256-email>", "phone": "<sha256-phone>"
    },
    "web": {"url":"https://example.com/thanks", "referrer":"https://example.com/checkout",
      "user_agent":"<user-agent>", "ip_address":"<client-ip>"},
    "custom": {"value":25.00, "currency":"USD"}
  }
]
```

`event_timestamp` uses Unix seconds. `user` needs at least one match field.
LINE lists `line_uid`, `click_id`, `phone`, `email`, `ifa`, `browser_id`, and
`external_id`. `browser_id` and `external_id` work after LINE creates mapping
data. The token must belong to the `line_tag_id` in the URL.

### Identity and consent

Apply the hub consent gate before hashing. Normalize email as trim, lowercase,
UTF-8, then SHA-256 hex. LINE's [official server template](https://github.com/line/line-conversion-api-server-tag/blob/main/template.tpl)
uses the same rule and accepts an existing 64-character hex hash.

Do not guess phone normalisation. UNVERIFIED: the reviewed direct-API reference
does not define it. Apply the region's current rule before hashing. Send no
identifiers without consent. LINE discards events when matching fails or consent
cannot be confirmed, and does not update Business Manager status.

For `user.line_uid`, send the provider's numeric channel ID in
`X-Line-ChannelID`. This is not a LINE Login or Messaging API token.

## Canonical event mapping

The [ad-conversion-hub](../ad-conversion-hub/SKILL.md) owns canonical events.
This adapter owns LINE names:

| Hub event | LINE request |
| --- | --- |
| `page_view` | `event_type: "page_view"`; omit `event_name` |
| `view_content` | `ViewItemDetail` |
| `lead` | `GenerateLead` |
| `signup` | `CompleteRegistration` |
| `begin_checkout` | `InitiateCheckOut` |
| `purchase` | `Purchase` |
| `subscription_start` | Custom event `SubscriptionStart` |
| `refund` | Custom event `Refund` |

For conversion rows, use `event_type: "conversion"`. The last two names are
custom events, not standard events. Custom event names allow up to 20
alphanumeric characters without spaces. Create a custom conversion in Ad
Manager for attributed reporting. See the [Thailand tag manual](https://lineforbusiness.com/th-en/service/line-ads/manual).

## Deduplication

LINE uses `event.deduplication_key`. It compares both `event_name` and `deduplication_key`.
It deduplicates matching events that arrive within 30 days
of first acceptance. Use the hub's stable `event_id` for both twins. Pass it to
the browser as `deduplicationKey` and to the server as `deduplication_key`.

Do not stringify `undefined` or `null`. LINE warns that repeated undefined
values can collapse unrelated events. Do not let the official template generate
a random key when a shared key is available. Source: [deduplication guidance](https://conversion-api-docs.linebiz.com/en/).

## Click ID and cookies

The click parameter is `ldtag_cl`. Capture it on the first landing request and
persist it in first-party storage. Keep first-touch and most-recent values when
needed. Send it as `user.click_id`. LINE's official template reads `ldtag_cl`
from the page URL.

The same template uses the first-party `__lt__cid` browser ID cookie. It sets
that cookie for two years when cookie measurement is enabled. Source: [official
LINE server-tag source](https://github.com/line/line-conversion-api-server-tag/blob/main/template.tpl).

UNVERIFIED: LINE does not publish a separate `ldtag_cl` TTL. Use the documented
attribution window and your own first-party retention policy.

Default web attribution is 30 days after the ad press. The current Conversion
API guide documents custom windows from 1 to 90 days. An older Thailand help
page says 1 to 180 days. Treat the target account's Ad Manager setting as
authoritative. LINE uses event acceptance time, so late delivery can miss the
window. Do not gate a server purchase on a click ID.

For different root domains, use `sharedCookieDomain` and `autoLink`. This needs
first-party cookies or local storage and can fail on JavaScript-driven
navigation. Source: [cross-domain guide](https://lineforbusiness.com/th-en/service/line-ads/manual).

## Tracking quirks that break attribution

- Web and app tracking are separate. Web uses LINE Tag or Conversion API. App
  measurement uses mobile SDK or an MMP. Do not send app installs as web events.
- `test_flag: true` accepts a test but excludes it from reporting, audiences,
  and optimisation. Use `false` for production proof.
- Custom events need a console custom-conversion definition before attributed
  reporting starts.
- Browser privacy, expired cookies, and cross-domain redirects reduce matching.
- One invalid item can discard the full JSON array. Send small validated batches.
- A 500 response can mean partial acceptance. Replay with the same key only after
  checking the dispatch log.
- A standard `Purchase` code and a custom event with the same name can double
  results. Use one.

## Verification

1. Send a test event with `test_flag: true` and a real match field. Record the
   redacted response. `202` means LINE received all events in the request.
   `400` rejects the request, `401` means an invalid token, and `500` can mean
   partial acceptance. Source: [API responses](https://conversion-api-docs.linebiz.com/en/).
2. If using LINE's GTM template, use server-container Preview. It shows the
   outbound request, response, event data, and error logs.
3. Send a production event with `test_flag: false`. Check **Tracking (LINE Tag)**
   status and the relevant conversion or standard-event report column.
4. Reconcile attributed events with payment-provider succeeded charges. Store
   status, canonical event ID, LINE event name, and retry count in the hub log.

## Common pitfalls

- Using a tag ID from another account, or a token not associated with that tag.
- Using a LINE Login or Messaging API token in `X-Line-TagAccessToken`.
- Sending `event_id` instead of `deduplication_key`.
- Sending `Purchase` in the browser and `Conversion` on the server.
- Double-hashing a 64-character identity hash.
- Sending milliseconds instead of Unix seconds.
- Blocking `ldtag_cl` or `__lt__cid` during redirects.
- Treating `202` as attribution proof. It proves receipt only.

## Security

Keep `LINE_ADS_CAPI_TOKEN` in the deployment secret store. Never place it in a
browser bundle, URL, log, screenshot, or repository. Use HTTPS.

Apply the hub consent gate before dispatch. Do not log raw email, phone, LINE
user IDs, click IDs, cookies, tokens, or full request bodies. Redact identifiers
and tokens in errors. Delete temporary normalized values after dispatch.
