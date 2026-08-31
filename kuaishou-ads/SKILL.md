---
name: kuaishou-ads
description: "Integrate Kuaishou mini-game advertising attribution and reporting through the documented callback flow, MAPI developer authorization, and mini-program reporting API. Use when deciding whether a web, app, or mini-game Kuaishou Ads integration is supported."
---

# Kuaishou Ads

Kuaishou has a documented mini-game advertising callback and a mini-program
advertising-data query API. The fetched first-party sources do not establish a
general web pixel, a general web or CRM Conversions API, or a general campaign-
management API. Treat this skill as a mini-game and mini-program adapter.
See [Kuaishou's mini-game advertising guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA)
and [the mini-program advertising-data API](https://open.kuaishou.com/docs/develop/server/addata).

The documented mini-game ad-account route is managed. The guide directs
advertisers to a core agency or direct sales for account onboarding. It also
requires registration as a Magnet Engine developer before the real-time ECPM
report flow. The guide does not document self-serve signup for this mini-game
route. See [the account and onboarding section](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event,
consent, identity, retry, and adapter rules.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

For the documented mini-game route, contact a core agency or direct sales,
register as a Magnet Engine developer, add an application, and obtain its
`app_id`, `secret`, and authorization link. Open the link and authorize one or
more ad accounts, or all accounts under the Kuaishou ID. Receive the one-time
`auth_code` at the callback address, exchange it below, and store the returned
tokens and advertiser ID on the server. See [the authorization flow](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

The guide says that the advertiser role can operate only on accounts under the
registered or newly added business entity. Do not assume that a developer app
can access an unrelated advertiser account. See [Kuaishou's MAPI authorization
guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

Kuaishou documents these exact token operations for this route:

```text
POST https://ad.e.kuaishou.com/rest/openapi/oauth2/authorize/access_token
POST https://ad.e.kuaishou.com/rest/openapi/oauth2/authorize/refresh_token
```

The guide documents `auth_code` as valid for 10 minutes and usable once, and
`refresh_token` as valid for 30 days. It uses inconsistent wording for the
access-token lifetime. Read the returned expiry and do not hard-code one day.
Each refresh returns a new pair and invalidates the old pair. Serialize refresh
operations per account and persist the new pair only after recording the
response, so two concurrent refreshes cannot invalidate each other's token or
leave a stale pair stored. See [the token
instructions](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

Use these local secret names. They are not Kuaishou parameter names:
`KUAISHOU_AD_APP_ID`, `KUAISHOU_AD_APP_SECRET`, `KUAISHOU_AD_ACCESS_TOKEN`,
`KUAISHOU_AD_REFRESH_TOKEN`, `KUAISHOU_ADVERTISER_ID`, and `KUAISHOU_MINIAPP_ID`.

Keep the application secret and tokens on the server. Do not put them in a
browser bundle, URL, log, screenshot, or commit. These are hub security rules;
the Kuaishou source defines the credentials and endpoints, not these local
environment-variable names. See [ad-conversion-hub security](../ad-conversion-hub/SKILL.md#security)
and [Kuaishou's authorization guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

## Client-side mini-program attribution

No public Kuaishou browser tag or web pixel is documented in the first-party
pages fetched for this skill. Do not add a guessed script URL, pixel ID, tag ID,
cookie name, or browser event API. A website integration therefore remains
first-party measurement only unless Kuaishou supplies a current product-specific
contract. See [the mini-game advertising guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA)
and [Kuaishou's public developer portal](https://developers.e.kuaishou.com/).

The documented client surface is a Kuaishou mini-game launch. In a commercial
advertising path, Kuaishou appends attribution data to the mini-program launch
query. The guide names `ks.getLaunchOptionsSync` as the API used to read that
query. See [the launch-options API](https://ks-game-docs.kuaishou.com/minigame/api/base/lifecycle/ks.getLaunchOptionsSync.html)
and [the attribution flow](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Read the launch query once at app start and pass it to your server. Keep the
Kuaishou value opaque. The source defines `callback` as the attribution value
for conversion reporting and says it is under 1,000 bytes. This flow applies
to commercial mini-game advertising, not ordinary websites. See [the
documented query fields](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

## Rule setup and event mapping

The source documents three callback event values. It documents no purchase,
subscription, or refund value. Map only these documented events. See [the event
enumeration](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

| Product or hub event | Kuaishou request | When to send |
| --- | --- | --- |
| `app_activation` | `event_type=1` | First app open |
| `signup` | `event_type=2` | First registration |
| `key_action` | `event_type=143` | IAA game or IAA tool key behavior |
| `purchase`, `refund`, or other hub event | Do not dispatch | No documented value |

Kuaishou defines activation as the first app open and registration as the first
registration. It limits `event_type=143` to key behaviors for IAA games, IAA
tools, and similar ad-monetization products. The guide also names
`key_action_category` and `key_action_threshold` for describing that key
behavior. See [the event enumeration](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Keep unsupported payment events in the hub and payment ledger. Return `skipped`
for the Kuaishou dispatch. See [the hub event taxonomy](../ad-conversion-hub/SKILL.md#canonical-event-taxonomy).

## Server-side conversion callback

Kuaishou documents a narrow conversion callback for the mini-game advertising
flow. It is an HTTPS GET handled by Kuaishou's ad server. The documented
endpoint and parameter names are:

```text
GET https://ad.partner.gifshow.com/track/activate
  event_type=<documented integer>
  event_time=<13-digit millisecond timestamp>
  callback=<original callback from the launch query>
```

The callback source says that `callback` comes from the client query,
`event_type` is an integer enumeration, and `event_time` is a 13-digit
millisecond timestamp. It says that `{"result":1,...}` means the report
succeeded. See [Kuaishou's conversion-reporting instructions](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Use the callback as an opaque value. URL-encode every query value. This
example uses only the parameter names and endpoint documented by Kuaishou:

```bash
curl --get 'https://ad.partner.gifshow.com/track/activate' \
  --data-urlencode 'event_type=1' \
  --data-urlencode 'event_time=<13-digit-ms>' \
  --data-urlencode 'callback=<callback-from-launch-query>'
```

The source permits a server or client request. Prefer the server path so the
hub can record consent, event identity, and the response. The documented
callback example shows no bearer token or `Authorization` header. Do not add
one without a separate Kuaishou contract. See [the callback definition](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

This is not a universal web or CRM Conversions API. The fetched source gives no
documented email, phone, order value, currency, browser event, or arbitrary
event-name field for this callback. Do not invent a JSON body or add fields from
another ad platform. See [the documented callback fields](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

## Identity and consent

The callback documentation defines only `callback`, `event_type`, and
`event_time` among the fields used here. It defines no email, phone, IP,
user-agent, external-ID, or SHA-256 field. Do not send those identifiers. See
[the callback parameter table](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

The launch guide identifies `account_id`, `campaign_id`, `unit_id`, and
`creative_id` as advertising identifiers. Store them only for attribution
diagnostics. They do not replace consent. See [the launch query fields](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Apply the hub consent gate before reading, storing, or dispatching ad-user
data. Kuaishou's mini-program rules require clear notice and user consent when
collecting user information. See [the hub consent gate](../ad-conversion-hub/SKILL.md#consent-gate)
and [Kuaishou's privacy rules](https://open.kuaishou.com/docs/operate/specification/entertainment).

Do not hash email or phone for this adapter. The source documents no hashing
rule or field for such a hash. See [the callback fields](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

## Click ID and first-party storage

For the documented mini-game path, the Kuaishou attribution value is the query
parameter `callback`. The guide also names `account_id`, `campaign_id`,
`unit_id`, and `creative_id`. These values arrive only through commercial
advertising. See [the official attribution flow](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Capture the complete `callback` from `ks.getLaunchOptionsSync().query` when it
exists. Store it with the canonical event. The source defines no lifetime,
cookie name, web query parameter, or cross-device join rule. See [the launch
API](https://ks-game-docs.kuaishou.com/minigame/api/base/lifecycle/ks.getLaunchOptionsSync.html)
and [the hub click-ID rules](../ad-conversion-hub/SKILL.md#click-ids).

Do not invent `kuaishou_click_id`, `ksclid`, `ksuid`, a cookie name, or a
seven-day or thirty-day attribution window. No such value or lifetime appears
in the fetched first-party sources. See [the attribution flow](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

Do not block first-party measurement when `callback` is absent. Return hub
`skipped`; the guide says only commercial advertising includes this value. See
[the callback note](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%B8%89%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

## Deduplication

The fetched Kuaishou callback documentation does not define an event ID,
idempotency key, deduplication field, or retry token. Do not send the hub
`event_id` as a guessed query parameter. Keep it in the hub dispatch record.
See [the documented callback parameter table](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0)
and [the hub deduplication policy](../ad-conversion-hub/SKILL.md#client-and-server-deduplication).

Send activation and registration only once per product-defined user action,
because the official event definitions say that activation and registration
are first-time events. For network timeouts, use the hub's bounded retry and
dead-letter policy. Do not replay an uncertain request as if Kuaishou had
documented idempotency. See [the event definitions](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0)
and [the hub retry policy](../ad-conversion-hub/SKILL.md#retry-policy).

## DSP and API settings that override code

The guide names the **小程序推广** objective, **快手小程序/小游戏** scene,
mini-game app ID, and monitoring configuration for activation objectives. It
requires the campaign, ad group, and creative to be enabled and reviewed before
using the creative-level **体验** test. See [the DSP setup guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C).

## Reporting API

Kuaishou documents a mini-program advertising-data query API. It returns daily
impressions, clicks, click rate, eCPM, and revenue. It is a reporting API, not a
conversion endpoint. See [the advertising-data API](https://open.kuaishou.com/docs/develop/server/addata).

The documented operation is:

```text
POST https://open.kuaishou.com/openapi/mp/developer/ad/data/query
```

The source places `access_token` and `app_id` in the query string. It defines
`startTime`, `endTime`, `type`, `page`, and `pageSize` in the JSON body. It
defines `result=1` as a successful response. See [the request definition](https://open.kuaishou.com/docs/develop/server/addata).

Use the source's exact field casing for `access_token`, `app_id`, `startTime`,
`endTime`, `type`, `page`, `pageSize`, and `result`. See [the report parameter
table](https://open.kuaishou.com/docs/develop/server/addata).

The mini-game guide separately documents this real-time ECPM report endpoint:

```text
POST https://ad.e.kuaishou.com/rest/openapi/gw/dsp/v1/report/ecpm_report
```

The guide says this flow uses an authorized advertiser ID and accepts `open_id`
or `union_id`, up to 200 IDs per request. Do not use these identifiers for a
website or CRM conversion flow. See [the ECPM instructions](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%B8%89%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

## Verification

Use three proofs. The source defines `result=1` as a successful report and
directs testers to the DSP activation or key-action counts. See [the callback
and test instructions](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0).

1. **Request proof:** record the redacted callback URL, selected `event_type`,
   event time, and JSON result. `result=1` proves report acceptance.
2. **Platform proof:** check activation or key-action counts in the DSP report
   view. For mini-program ad data, call the report API and confirm `result=1`.
3. **Business proof:** reconcile registrations, payments, and refunds with
   first-party product or payment records. The callback documents no purchase
   or refund event.

See [the official test flow](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E4%BA%94%E3%80%81%E5%BC%80%E6%88%B7%E5%88%9B%E7%BC%96%E4%BD%93%E9%AA%8C). A `result=1` response is request proof, not campaign attribution or purchase proof. Use [hub verification](../ad-conversion-hub/SKILL.md#verification).

## Common pitfalls and security

The documented callback fields and hub rules imply these restrictions. See [the
callback field list](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA#%E5%9B%9B%E3%80%81%E7%A3%81%E5%8A%9B%E6%99%BA%E6%8A%95%E6%95%B0%E6%8D%AE%E5%9B%9E%E4%BC%A0) and [hub security](../ad-conversion-hub/SKILL.md#security).

- Do not call the mini-game callback a general CAPI or use the ad-data query as
  a conversion endpoint.
- Do not invent a website pixel, browser SDK, campaign endpoint, JSON body,
  hash field, or event parameter.
- Send the complete launch-query `callback`; do not use a sample or truncation.
- Keep `app_secret`, `access_token`, `refresh_token`, and callback values out of
  client code, logs, screenshots, and commits.
- Do not make payment success depend on Kuaishou callback success. Return a
  platform-specific failed or skipped status through the hub.

The Kuaishou mini-program rules require notice and user consent before
collecting user information, and they require privacy handling for stored user
information. Apply those requirements with the hub consent record. See [the
Kuaishou privacy rules](https://open.kuaishou.com/docs/operate/specification/entertainment)
and [hub security](../ad-conversion-hub/SKILL.md#security).

## Official sources checked (2026-08-30)

- [Kuaishou mini-game advertising guide](https://open.kuaishou.com/miniGameDocs/operation/DSP/DSP-IAA)
- [Kuaishou mini-program advertising-data API](https://open.kuaishou.com/docs/develop/server/addata)
- [Kuaishou `ks.getLaunchOptionsSync` API](https://ks-game-docs.kuaishou.com/minigame/api/base/lifecycle/ks.getLaunchOptionsSync.html)
- [Kuaishou developer portal](https://developers.e.kuaishou.com/)
- [Kuaishou mini-program privacy rules](https://open.kuaishou.com/docs/operate/specification/entertainment)
