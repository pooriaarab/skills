---
name: ads-yahoo-japan
description: "Implement Yahoo! JAPAN Ads web conversion tracking with the official Tracking Tag and Conversion API."
---

# Yahoo! JAPAN Ads

Yahoo! JAPAN Ads has a documented web Tracking Tag and Conversion API for LY Ads Display Ads and
Search Ads (Shopping). CAPI accepts web events only. Do not treat this adapter as an app, CTV, or
general-purpose LY measurement integration. [Tracking Tag scope](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html),
[Search Ads (Shopping) support](https://ads-developers.yahoo.co.jp/en/ads-api/announcement/26081801.html),
[Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event envelope, consent
gate, identity rules, retry policy, and adapter contract. Pair it with
[ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, and PII-export authorization.

## Account and access

Yahoo! JAPAN Ads has an account-creation path in the Campaign Management Tool. The official flow
creates a Search Ads or Display Ads account, reviews the request, asks the user to confirm it, and
then marks it Active. [Create an ad account](https://ads-help.yahoo-net.jp/s/article/H000044258?language=en_US)

For the Tracking Tag and CAPI, connect the service account to an authenticated Business Manager,
generate the tag, then open **Tools → Tracking tag** under **Access and data**. Generate the CAPI
token there and save it before closing the view. [Tracking Tag startup](https://ads-developers.yahoo.co.jp/en/lytag/post/30590593.html),
[CAPI access instructions](https://ads-help.yahoo-net.jp/s/article/H000055044?language=en_US)

The token is shown only on the generation view. A connected Business Manager issues it in Business
Manager. Otherwise, the account user generates it from the Tracking Tag view. [CAPI access instructions](https://ads-help.yahoo-net.jp/s/article/H000055044?language=en_US)

The broader LY Ads API is a separate management surface. Its documented route requires API signup,
application registration, and OAuth authorization. API signup requires root-MCC administrator access.
An external ad-management tool user approves that tool instead. [API startup](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/before_you_start.html),
[API application](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/apply-api-use.html),
[OAuth API call](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/api-call.html)

These are local secret-store conventions, not Yahoo! configuration names:

```text
YAHOO_JAPAN_ADS_TAG_ID       Tracking Tag ID
YAHOO_JAPAN_ADS_CAPI_TOKEN   X-TagAccessToken value
YAHOO_JAPAN_ADS_ACCOUNT_ID   Local account identifier for dispatch records
```

Do not use the LY Ads API OAuth token as the CAPI token. CAPI documents `X-TagAccessToken`; the
management API documents OAuth bearer access tokens. [CAPI headers](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html),
[management API authentication](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/api-call.html)

## Client-side Tracking Tag

Generate the tag from the authenticated Business Manager, then copy the vendor-generated global and
event snippets. Install one global snippet on all eligible pages and an event snippet where the
matching action occurs. Multiple global snippets must not be installed on one page. [Tracking Tag summary](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html),
[Tracking Tag startup](https://ads-developers.yahoo.co.jp/en/lytag/post/30590593.html)

Use the vendor's generated code. Do not recreate its loader or invent a tag URL. The global process
uses `type: "init"` and `tagId`; the event process uses `type: "event"`, `eventType`, and `tagId`.
[Tracking Tag parameters](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)

The global snippet can measure page views. Other events need an event snippet. Documented event
configuration includes `snippetId`, `transactionId`, `value`, `currency`, `label`, `isTest`, and
`items` where supported. [Tracking Tag summary](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html),
[Tracking Tag parameters](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)

Tracking Tag event data can support conversion tracking and website-visitor audiences for supported
products. Keep audience creation and activation in the Campaign Management Tool. [Tracking Tag summary](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html)

## Rule setup and event mapping

For Display Ads, create **Web (Tracking tag)** in **Tools → Library → Conversion tracking**. Choose
the Tracking Tag, purpose, conversion window, and filter. Filters are global snippet plus URL, event
snippet plus event type, or event snippet plus event type and snippet ID. The window accepts 1–90 days.
[Display Ads Tracking Tag conversion setup](https://ads-help.yahoo-net.jp/s/article/H000054774?language=en_US)

Use the platform event type as the adapter value. The following mappings are
recommended when the hub event has the same business meaning:

| Hub event | LY Ads event type | Dispatch rule |
| --- | --- | --- |
| `page_view` | `page_view` | Global snippet only. |
| `view_content` | `view_product` | Use only for an item-detail view. |
| `begin_checkout` | `check_out` | Send when checkout starts. |
| `lead` | `generate_lead` | Send after the lead is accepted. |
| `signup` | `sign_up` | Send after registration completes. |
| `purchase` | `purchase` | Send after payment confirmation. |
| `subscription_start` | No exact listed type ([event list](https://ads-developers.yahoo.co.jp/en/lytag/post/30590587.html)) | Keep hub and billing truth. |
| `refund` | No exact listed type ([event list](https://ads-developers.yahoo.co.jp/en/lytag/post/30590587.html)) | Reconcile in the payment system. |

The list also includes `view_listing`, `view_cart`, `add_cart`, `search`, `login`, `reservation`,
`payment_info`, and `add_wishlist`. It does not list `refund` or `subscription_start`. [Tracking Tag events](https://ads-developers.yahoo.co.jp/en/lytag/post/30590587.html)

Use a conversion-setting-generated snippet when the filter includes a snippet
ID. A generic event snippet does not satisfy that filter. [Get and install the
Tracking Tag](https://ads-help.yahoo-net.jp/s/article/H000054773?language=en_US),
[Display Ads Tracking Tag conversion setup](https://ads-help.yahoo-net.jp/s/article/H000054774?language=en_US)

## Server-side conversions API

The documented CAPI request is:

```http
POST https://conversion-api.yahooapis.jp/v1/
X-TagAccessToken: <YAHOO_JAPAN_ADS_CAPI_TOKEN>
Content-Type: application/json
```

The body requires `tag_id` and a `data` array with up to 1,000 event objects. Each event requires
`event_type`, `event_time`, and `action_source`. `action_source` can only be `web`. Add at least one
user parameter. [Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

This is a minimal purchase payload. Every field below is documented by the vendor:

```json
{"tag_id":"<TAG_ID>","data":[{"event":{"event_type":"purchase","event_time":1756600000,"action_source":"web","test_flag":false,"transaction_id":"<STABLE_TRANSACTION_ID>"},"user":{"hashed_email":"<SHA256_EMAIL_HEX>"},"custom":{"currency":"JPY","value":1000}}]}
```

`event_time` is 10-digit UNIX time and may be from 90 days before the request through the current
time. If 13 digits are supplied, the API ignores the last three. `currency` is required for monetary
`value`; the reference permits `JPY` or `USD`. [Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

`transaction_id` is optional, but use it for every conversion. It is a unique string up to 64
characters. Allowed characters are alphanumeric plus `-_.!~*'();/?:@&=+$,%#`. Preserve it in
browser and server paths.
[Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

A successful request returns `202`, but invalid or duplicate events can still be excluded. Handle
`400`, `403`, `404`, `415`, `429`, `500`, and `503` with the hub retry and dead-letter policy.
[Conversion API response](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

## Identity and consent

The CAPI user object supports `hashed_phone_number`, `hashed_email`, `ly_su`, `ly_c`, `ly_r`, `ifa`,
and `line_uid`. At least one user parameter is required. `channel_id` is required when `line_uid` is
sent. [Conversion API identity fields](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

Normalize before hashing:

- Lowercase email before SHA-256 hashing.
- Convert a Japanese phone number to international form, such as `090-0123-4567` to `+819001234567`,
  then SHA-256 hash it.
- Send the resulting hash as lowercase alphanumeric text.

These transformations and field names come from the [CAPI reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html).

Require the hub's `measurement: true` before sending any event. Require the
hub's `ad_user_data: true` before sending email, phone, LINE, click, cookie, or
other advertising identifiers. Keep normalized identifiers temporary. Do not
send raw identifiers when the API requires hashed fields.

## Click ID and first-party cookie

The documented click identifier is `_ly_c`. CAPI accepts `ly_c` from the cookie or URL query
parameter. A query value has no timestamp, so send it as `<timestamp>.<clickid>`. [Conversion API click identifier](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

The site-user identifier `ly_su` comes from `_ly_su` in `<timestamp>.<suid>` form. `ly_r` comes from
`_ly_r` in `<timestamp>.<random string>` form. [Conversion API identity fields](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

Capture these values on the landing request and persist them in first-party storage after consent.
Keep first-touch and latest values when required. Do not invent a cookie lifetime; the cited vendor references do not specify one. [Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

For cross-domain tracking, `autoLinkDomains` can add `_ly_c` and `_ly_rt` to URLs on the configured
domain. [Tracking Tag parameters](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)

## Deduplication

Yahoo! JAPAN Ads uses account ID plus `transaction_id` as the deduplication key for seven days after
counting. The same account and transaction ID from the Tracking Tag and CAPI are duplicates. [Tracking Tag deduplication](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html),
[Conversion API deduplication](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)

Implement deduplication as follows:

1. Create one hub `event_id` after the business event is confirmed.
2. Derive a stable, allowed, 64-character-or-shorter `transaction_id`.
3. Pass that value as browser `config.transactionId`.
4. Pass the same value as CAPI `event.transaction_id`.
5. Store the dispatch result and never create a new ID on retry.

If omitted, the vendor uses account ID plus `event_time` for deduplication. Do not rely on that
fallback for payment events. [Tracking Tag deduplication](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)

## Campaign Management Tool settings that override code

- The conversion setting chooses the Tracking Tag and the conversion filter.
  Code cannot make an event match a different filter. [Conversion setup](https://ads-help.yahoo-net.jp/s/article/H000054774?language=en_US)
- The conversion window is configured in the conversion setting and accepts
  1–90 days. [Conversion setup](https://ads-help.yahoo-net.jp/s/article/H000054774?language=en_US)
- A snippet-ID filter requires the event snippet generated for that conversion
  setting. [Get and install the Tracking Tag](https://ads-help.yahoo-net.jp/s/article/H000054773?language=en_US)
- `isTest: true` excludes the event from tracking. Set it during testing, then
  send `false` for production events. [Tracking Tag parameters](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)
- Search Ads (Shopping) does not support call conversion tracking through the
  Tracking Tag. Do not map call conversions to this web adapter. [Search Ads
  (Shopping) announcement](https://ads-developers.yahoo.co.jp/en/ads-api/announcement/26081801.html)
- Do not place a conventional conversion tag and a Tracking Tag for the same
  Search Ads (Shopping) conversion. The vendor warns that this can count the
  conversion more than once. [Search Ads (Shopping) announcement](https://ads-developers.yahoo.co.jp/en/ads-api/announcement/26081801.html)

## Verification

Use the documented Event history view:

1. Open the Display Ads or Search Ads (Shopping) account.
2. Select **Tools → Tracking tag** under **Access and data**.
3. Select the Tag ID when more than one tag exists.
4. Inspect **Event history**.

Event history shows the sender, event type, snippet ID when applicable, last
received time, and test flag. It distinguishes Tracking Tag events from CAPI
events. [Check event history](https://ads-help.yahoo-net.jp/s/article/H000054775?language=en_US)

Record the redacted CAPI response, canonical event ID, transaction ID, consent
decision, and payment result. A `202` proves request acceptance only. Reconcile
purchase and refund counts with payment-provider truth, then check the
conversion report in the Campaign Management Tool. [Conversion API response](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html),
[Display Ads conversion data](https://ads-help.yahoo-net.jp/s/article/H000044347?language=en_US)

Do not implement a guessed GET validation call. Yahoo! documents Event history
as the verification surface for Tracking Tag and CAPI events. [Check event
history](https://ads-help.yahoo-net.jp/s/article/H000054775?language=en_US)

## Common pitfalls and security

- Use `X-TagAccessToken` for CAPI. Do not substitute an OAuth bearer token. [CAPI headers](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)
- Keep `YAHOO_JAPAN_ADS_CAPI_TOKEN` in the server secret store. Never place it
  in browser code, URLs, logs, screenshots, or commits.
- Hash email and phone only after the hub consent gate. Never log raw or
  normalized identifiers.
- Use `event.transaction_id`, not a guessed `event_id` field. Use browser
  `config.transactionId` for the Tracking Tag. [CAPI fields](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html),
  [Tag fields](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html)
- Use 10-digit UNIX seconds for `event_time`, not milliseconds. [CAPI reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)
- Send `action_source: "web"`; the CAPI reference documents no other value. [CAPI reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)
- Do not assume `subscription_start` or `refund` is a Yahoo event type. [Event list](https://ads-developers.yahoo.co.jp/en/lytag/post/30590587.html)
- Do not assume a click-ID lifetime, an app endpoint, a CTV endpoint, or a
  customer-list upload contract from this documentation. [CAPI reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html),
  [Tracking Tag scope](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html)
- Treat `202` as ingestion acceptance, not ad attribution. [CAPI response](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)
- Keep the adapter a logged no-op per transport: skip the Tracking Tag when the
  tag ID or consent is unavailable, and skip CAPI when the tag ID, the CAPI
  token, or consent is unavailable — the CAPI body requires `tag_id` too, so a
  present token with a missing tag ID must not dispatch. For `purchase`, also
  require payment-provider truth before dispatch; `generate_lead`, `sign_up`,
  and other non-payment events do not have a payment-provider record and must
  not be gated on one. `refund` has no supported Yahoo event type (see the
  mapping table above), so never dispatch it to the Tracking Tag or CAPI —
  reconcile it in the payment system only. A missing server token must not
  silence the client-side tag, and neither path may fail checkout.

## Official sources checked (2026-08-31)

- [Create an ad account](https://ads-help.yahoo-net.jp/s/article/H000044258?language=en_US) · [API startup](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/before_you_start.html) · [Apply for API use](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/apply-api-use.html)
- [API application](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/app-registration.html) · [API call and OAuth](https://ads-developers.yahoo.co.jp/en/ads-api/startup-guide/api-call.html)
- [Tracking Tag summary](https://ads-developers.yahoo.co.jp/en/lytag/post/30590584.html) · [Tracking Tag startup](https://ads-developers.yahoo.co.jp/en/lytag/post/30590593.html) · [Tracking Tag parameters](https://ads-developers.yahoo.co.jp/en/lytag/post/30590590.html) · [Trackable events](https://ads-developers.yahoo.co.jp/en/lytag/post/30590587.html)
- [Conversion API access](https://ads-help.yahoo-net.jp/s/article/H000055044?language=en_US) · [Conversion API reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html)
- [Display Ads Tracking Tag conversion setup](https://ads-help.yahoo-net.jp/s/article/H000054774?language=en_US) · [Event history](https://ads-help.yahoo-net.jp/s/article/H000054775?language=en_US) · [Display Ads conversion data](https://ads-help.yahoo-net.jp/s/article/H000044347?language=en_US)
- [Search Ads (Shopping) Tracking Tag and CAPI support](https://ads-developers.yahoo.co.jp/en/ads-api/announcement/26081801.html) · [Get and install the Tracking Tag](https://ads-help.yahoo-net.jp/s/article/H000054773?language=en_US)
