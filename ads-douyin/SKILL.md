---
name: ads-douyin
description: "Set up Douyin Ads through Ocean Engine self-serve advertiser accounts, permissioned Marketing API OAuth, Event Management assets, the AdConvertSignal conversion-signal API, and DataFinder monitoring links. Use when wiring Douyin or Ocean Engine registration, purchase, app conversion signals, event assets, API callback, or advertiser API access. Do not use for TikTok Ads, undocumented browser pixels, or guessed click IDs."
---

# Douyin Ads

Douyin advertising runs through the Ocean Engine advertising platform and its
Open Platform APIs. The official SDK calls its API surface Marketing API and
lists advertiser, campaign, event-management, and conversion-signal operations.
See [Ocean Engine Open Platform](https://open.oceanengine.com/) and the [official Java SDK](https://github.com/oceanengine/ad_open_sdk_java).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

Ocean Engine offers self-serve advertiser account opening. Its official help
page directs advertisers to register, open an account, and enter the ad
delivery backend through the [self-service route](https://www.oceanengine.com/help/tongguo-juliang-tuiguang).

The public Marketing API is permissioned. The official SDK requires developer
registration and API access permission before use. See the SDK's [usage
conditions](https://github.com/oceanengine/ad_open_sdk_java#使用条件).

The SDK lists these OAuth operations:

- `POST /open_api/oauth2/access_token/` exchanges `app_id`, `auth_code`, and
  `secret` in the generated request model. See the [access-token API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2AccessTokenApi.java)
  and [request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/Oauth2AccessTokenRequest.java).
- `POST /open_api/oauth2/refresh_token/` uses `refresh_token` and `secret`, with
  optional `app_id`. See the [refresh API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2RefreshTokenApi.java)
  and [refresh model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/Oauth2RefreshTokenRequest.java).
- `GET /open_api/oauth2/advertiser/get/` accepts `access_token` as a query
  parameter and returns authorized management or business accounts. See the
  [advertiser API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2AdvertiserGetApi.java).

For ordinary SDK calls, the official setup uses `https://api.oceanengine.com`
and an `Access-Token` header. See the SDK's [client setup](https://github.com/oceanengine/ad_open_sdk_java#配置).

Ocean Engine defines no environment-variable names in these sources. Choose
deployment names through the hub adapter configuration. Keep app secrets,
tokens, and advertiser IDs on the server.

## Client-side tag or pixel

Do not install a standalone Douyin browser pixel from this skill. The fetched
official SDK publishes server API operations and does not publish a browser
tag installation contract in its [API index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表).

For web measurement, DataFinder is a separate Volcengine product. Its official
documentation describes a Web/JS SDK and campaign monitoring links. See [the
DataFinder Web/JS SDK](https://www.volcengine.com/docs/84129/1582317?lang=zh).

Use DataFinder only when the campaign owns that product configuration. Do not
rename DataFinder fields as Ocean Engine Ads fields. Send canonical first-party
events through the hub's [event contract](../ad-conversion-hub/SKILL.md).

## Rule setup and event mapping

Create an event asset in Event Management when the advertiser workflow needs
one. The official visual debugger shows `POST
https://api.oceanengine.com/open_api/2/event_manager/assets/create/` with
`advertiser_id` and `asset_type` fields. See [create event asset](https://open.oceanengine.com/tools/visual_debug.html?docId=1850398228888576).

The official SDK lists event-management operations for available events, event
configuration, event creation, and monitoring-link creation, reading, and
update. See the [event API index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表).

Use the available-event response and the account's asset configuration. Do not
translate hub names into platform names from memory.

The public request model documents the signal names used in this mapping. See
the model's [`event_name` field](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

| Hub event | Verified Ocean Engine signal | Adapter action |
| --- | --- | --- |
| `page_view` | None in the public signal model | Keep first-party measurement |
| `view_content` | None in the public signal model | Keep first-party measurement |
| `lead` | None in the public signal model | Keep first-party measurement |
| `signup` | `register` | Send only when the account's documented return method is AdConvertSignal |
| `begin_checkout` | None in the public signal model | Keep first-party measurement |
| `purchase` | `purchase` | Send only when the account's documented return method is AdConvertSignal |
| `subscription_start` | None in the public signal model | Keep first-party measurement |
| `refund` | None in the public signal model | Reconcile with payment truth |

The public request model documents these signal names: `launch_app`, `active`,
`purchase`, `game_addiction`, `register`, and `log_in`. See the [request
model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

## Server-side conversions API

Ocean Engine exposes a public, permissioned conversion-signal operation. The
official Java SDK names it `AdConvertSignalV2Api` and labels it a global
incremental-effect API. See the [official API class](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/AdConvertSignalV2Api.java)
and [SDK index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表).

The verified route is:

```http
POST https://api.oceanengine.com/open_api/2/ad_convert/signal/
Access-Token: <server-token>
Content-Type: application/json
```

The SDK declares JSON input and a `200 OK` response for this operation. The
response body itself carries `code`, `message`, `data`, and `request_id`
fields. See the [signal API class](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/AdConvertSignalV2Api.java)
and [response model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Response.java).

An HTTP `200` proves the request reached Ocean Engine. It does not prove the
signal was accepted — read the response body's `code` on every call and treat
a non-success `code` as a failed dispatch under the hub's retry policy, the
same way the response's HTTP status alone would be insufficient. The reviewed
sources do not publish the exact success value for `code`; confirm it against
the current [response model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Response.java)
or a live response before implementing the success/failure check, and fail
closed (treat the dispatch as failed) if `code` is absent or unrecognized.
Record the redacted `code`, `message`, and `request_id` in the dispatch log.

The request model exposes these fields, among others:

```json
{
  "account_ids": [1234567890],
  "event_name": "purchase",
  "event_time": 1767225600,
  "user_unique_id": "<advertiser-user-id>",
  "params": "<single-level-event-properties-as-json>"
}
```

The public model describes `event_time` as a seconds timestamp and `params` as a
single-level JSON map serialized as a string. Send `event_time` as the numeric
epoch-seconds value shown above, not a quoted string. See the [request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

The generated model marks every request property nullable. See the [generated
request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).
Do not infer account-specific required fields from that generator output. Use
only fields that the approved account and current product flow support.

Do not treat this specialized route as a generic website CAPI. The reviewed
official sources publish no generic website conversion contract, and this
endpoint applies only to accounts whose documented Event Management return
method is AdConvertSignal — confirm that return method in the console before
sending `signup` or `purchase` here. When the account's documented return
method is Event Management with DataFinder monitoring links instead, use that
route rather than AdConvertSignal. See [Event Management and API
return](https://www.volcengine.com/docs/84129/1261611?lang=zh) and the [SDK
API index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表).

## Identity and consent

The public conversion model exposes `user_unique_id`, `android_id`, `idfa`,
`idfv`, `oaid`, `odid`, `ipid`, `ipv4`, and `ipv6`. See the [verified request
fields](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

The same public model exposes no email or phone field and defines no hashing
rule. See the [generated request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).
Do not hash or upload email, phone, IP, or external IDs for this adapter unless
a current Ocean Engine contract names the field and transformation.

Apply the hub consent gate before first-party measurement or vendor dispatch.
Require the hub's `measurement` consent for ad events and its `ad_user_data`
consent before sending identity. See the hub's [consent gate](../ad-conversion-hub/SKILL.md#consent-gate).

## Click ID and first-party cookie

The public conversion request model contains no Douyin click-ID or cookie
field. Do not invent `ttclid`, `douyin_click_id`, or another parameter. See
the [complete request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

DataFinder uses monitoring links for campaign measurement. Its documentation
describes `utm_campaign`, `utm_source`, `utm_medium`, `utm_term`, and
`utm_content` as event or user attributes. See [DataFinder attribution
attributes](https://www.volcengine.com/docs/84129/1261599?lang=zh).

For web campaigns, DataFinder says its Web SDK stores campaign attributes in a
cookie and sends them with later events. These are DataFinder attributes, not
verified Ocean Engine Ads click IDs. See the [DataFinder web attribution
guide](https://www.volcengine.com/docs/84129/1261599?lang=zh).

Capture only approved monitoring-link values in the hub's `click_ids` map. Keep
first-touch and latest values when the measurement design needs both. Follow
the hub's [click-ID rules](../ad-conversion-hub/SKILL.md#click-ids).

Never require a click ID before recording a confirmed purchase. Organic,
direct, email, and SEO events still need first-party measurement through the
[hub](../ad-conversion-hub/SKILL.md).

## Deduplication

The public conversion request model exposes no `event_id`, `eventId`, or
conversion deduplication field. Do not send one as a guessed parameter. See
the [request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).

Keep the hub `event_id` in the local dispatch record. Add it to a vendor
request only when a current Ocean Engine contract documents that field.

Use the hub's bounded retry and dead-letter policy. Do not replay an uncertain
request unless the vendor contract documents idempotency or deduplication. See
the hub's [adapter contract](../ad-conversion-hub/SKILL.md#adapter-contract).

## Campaign and Event Management settings that override code

Event Management controls the asset, event, return method, and monitoring-link
configuration. The official setup guide places these choices in the advertiser
console. See [Event Management setup](https://www.volcengine.com/docs/84129/1261611?lang=zh).

The same guide describes optional debugging and later association with an
optimization goal. Treat the console state as authoritative. See the
[debugging workflow](https://www.volcengine.com/docs/84129/1261611?lang=zh).

Do not assume an API-created asset is ready for optimization. Confirm the
asset, event, API return method, monitoring links, and account objective in the
console before launch.

## Verification

Use three proofs:

1. **Request proof:** record a redacted response from OAuth, asset creation, or
   `AdConvertSignal` dispatch, including the signal response's `code` and
   `message`. The SDK declares `200 OK` for the signal call, but only a
   success `code` in the body proves Ocean Engine accepted the record.
   See the [signal API class](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/AdConvertSignalV2Api.java).
2. **Platform proof:** use Event Management debugging and reporting to confirm
   the configured event and its received data. The official guide describes
   that debugging flow. See [DataFinder and Ocean Engine setup](https://www.volcengine.com/docs/84129/1261611?lang=zh).
3. **Business proof:** reconcile `purchase`, `refund`, and subscription events
   with payment-provider truth through the [hub](../ad-conversion-hub/SKILL.md).

A successful HTTP response proves request handling only. It does not prove
attribution or optimization delivery.

## Common pitfalls and security

- Do not use a TikTok Ads endpoint for Ocean Engine. Use the [Ocean Engine API index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表).
- Do not install a guessed browser pixel or tag ID. The [official campaign guide](https://www.volcengine.com/docs/84129/1261611?lang=zh) documents the monitoring-link route instead.
- Do not invent an event name, click ID, hash rule, or deduplication field. See the [signal model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java).
- Do not treat event-asset creation as conversion receipt. Verify it through [device debugging](https://www.volcengine.com/docs/84129/1261595?lang=zh).
- Do not treat a monitoring link as a server conversion postback. See the [campaign guide](https://www.volcengine.com/docs/84129/1261611?lang=zh).
- Do not treat a configured event as attributed revenue. Reconcile through the [hub](../ad-conversion-hub/SKILL.md).
- Keep app secrets, tokens, device IDs, and advertiser data server-side. See the [hub adapter contract](../ad-conversion-hub/SKILL.md#adapter-contract).
- Redact tokens, identifiers, and event properties from logs and screenshots. See the [hub security rules](../ad-conversion-hub/SKILL.md#adapter-contract).
- Return `skipped` only when a required secret, account configuration, or
  contract detail is absent before dispatch is attempted. Treat a
  permission-denied response from the API (for example an expired token or a
  revoked OAuth grant) as `failed`, not `skipped` — the hub's adapter contract
  reserves `skipped` for known absent configuration and `failed` for a
  rejected request, so an integration that loses permission stays visible
  instead of going silently missing. See [hub adapter contract](../ad-conversion-hub/SKILL.md#adapter-contract).
- Keep ad dispatch failures separate from payment webhook success.

The last two behaviors follow the hub's failure-isolation rules. See the
[hub adapter behavior](../ad-conversion-hub/SKILL.md#adapter-contract).

## Official sources checked (2026-08-29)

- [Ocean Engine self-serve advertising](https://www.oceanengine.com/help/tongguo-juliang-tuiguang)
- [Ocean Engine account-opening requirements](https://www.oceanengine.com/help/kaihu-liucheng)
- [Ocean Engine Open Platform](https://open.oceanengine.com/)
- [Official Java SDK](https://github.com/oceanengine/ad_open_sdk_java)
- [SDK API index](https://github.com/oceanengine/ad_open_sdk_java#api接口列表)
- [OAuth access-token API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2AccessTokenApi.java)
- [OAuth refresh-token API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2RefreshTokenApi.java)
- [OAuth advertiser API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/Oauth2AdvertiserGetApi.java)
- [OAuth request models](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/Oauth2AccessTokenRequest.java) · [refresh model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/Oauth2RefreshTokenRequest.java)
- [AdConvertSignal API](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/api/AdConvertSignalV2Api.java)
- [AdConvertSignal request model](https://raw.githubusercontent.com/oceanengine/ad_open_sdk_java/main/src/main/java/com/bytedance/ads/model/AdConvertSignalV2Request.java)
- [Event asset visual debugger](https://open.oceanengine.com/tools/visual_debug.html?docId=1850398228888576)
- [Event Management and API return](https://www.volcengine.com/docs/84129/1261611?lang=zh)
- [DataFinder Web/JS SDK](https://www.volcengine.com/docs/84129/1582317?lang=zh)
- [DataFinder attribution attributes](https://www.volcengine.com/docs/84129/1261599?lang=zh)
