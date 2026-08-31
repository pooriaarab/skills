---
name: xiaohongshu-ads
description: "Evaluate and wire Xiaohongshu Ju Guang Ads access, its documented conversion-return workflow, and its account-gated API and reporting surfaces. Use when planning a China-market campaign or deciding whether the current first-party documentation supports a production adapter."
---

# Xiaohongshu Ads

Xiaohongshu’s advertising product is **聚光 (Ju Guang)**. Its official product
page presents it as a one-stop advertising platform and lists product seeding,
lead collection, app promotion, and off-platform purchase as marketing scenes.
See [Ju Guang](https://ad.xiaohongshu.com/aurora/home).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity handling, retry policy, and adapter contract.
This skill records only facts supported by the first-party pages fetched for
this review.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

There is no public self-serve developer signup documented in the first-party
pages fetched here. The documented route is account qualification in the
Xiaohongshu business console, followed by Ju Guang access. The official help
center lists a Ju Guang API manual and separate reporting manuals. See [Ju
Guang Help Center](https://ad.xiaohongshu.com/next_help/home).

For an advertiser account, complete the official professional-account review.
The current rules describe commercial promotion as an enterprise-account use
case and require an enterprise applicant to submit a business license and,
for some industries, industry qualifications. The same page says enterprise
certification can open an advertising account. See [professional-account
rules](https://ad.xiaohongshu.com/next_help/docs/195c5fe505c71b4b0335a2fe0d61d8e0).

The official Ju Guang page also provides a contact form for a marketing
consultant. Use that managed route when the account cannot see the API manual,
conversion tool, or required qualification entry. See [Ju Guang contact
route](https://ad.xiaohongshu.com/aurora/home).

Do not confuse Ju Guang access with Xiaohongshu’s general Open Platform. The
Open Platform reference lists user OAuth, user information, and authorization
operations. Its scope page says the currently open scope is `basic_info`.
Those pages do not grant advertising or conversion access. See [Open Platform
API reference](https://openaccount.xiaohongshu.com/docs/api-reference) and
[scope](https://openaccount.xiaohongshu.com/docs/scope).

Keep any account or partner credential in the server secret store. Do not put
it in browser code, URLs, logs, screenshots, or commits. The Open Platform
quick start also requires protected handling of `app_secret`; use the same
secret boundary for any Ju Guang credential. See [Open Platform quick
start](https://openaccount.xiaohongshu.com/docs/quick-start).

## Client-side tag or app measurement

The first-party Ju Guang pages fetched here do not publish a Xiaohongshu
browser pixel, JavaScript tag, public tag ID, or app conversion SDK contract.
Do not create a vendor pixel ID or script from memory. See [Ju Guang Help Center](https://ad.xiaohongshu.com/next_help/home)
and the [Ju Guang API documentation entry](https://ad.xiaohongshu.com/openApiDoc?articleId=2777&categoryId=761).

Measure the landing page and product action with your own consented analytics.
Keep those events in the hub unless the account’s current Ju Guang console
provides a documented client integration. The official Ju Guang material
documents a server conversion-return tool instead. See [Ju Guang conversion
workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).

## Rule setup and event mapping

Ju Guang’s official page names marketing goals, not a public event-name enum.
The fetched first-party pages therefore do not support a vendor-specific table
for `purchase`, `lead`, `signup`, or other hub events. Keep the hub taxonomy
internal and map an event only when the account’s current conversion tool gives
you the exact approved action name. See [Ju Guang](https://ad.xiaohongshu.com/aurora/home)
and the [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).

Use this safe mapping until the account supplies the current action names:

| Hub event | Ju Guang adapter action |
| --- | --- |
| `page_view`, `view_content` | First-party measurement only |
| `lead`, `signup` | Send only through the approved conversion-return action |
| `begin_checkout` | First-party measurement only unless the console defines it |
| `purchase`, `subscription_start` | Send only after payment or subscription truth |
| `refund` | Reconcile in the payment system; do not invent a Ju Guang action |

## Server-side conversions API

Ju Guang has a documented conversion-return surface, but the fetched first-
party pages do not publish a current endpoint, authentication header, request
body, timestamp unit, identity field, or deduplication field. Do not implement
any of those from a third-party SDK or guessed URL.

The official Ju Guang manual describes **追踪转化工具** as an external-link
API data-return tool. It shows this workflow: generate a test `trackID`, return
the `trackId` and conversion action, then refresh the integration state. The
manual says the state becomes successful after the platform receives the
callback. See [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).

The current Help Center exposes a Ju Guang API manual, but its fetched landing
page does not expose the callback schema. Treat the conversion adapter as
account-gated until support or the authenticated manual supplies the exact
contract. See [current Ju Guang Help Center](https://ad.xiaohongshu.com/next_help/home)
and [Ju Guang API documentation entry](https://ad.xiaohongshu.com/openApiDoc?articleId=2777&categoryId=761).

Do not use the general Open Platform OAuth endpoints for ad conversions. The
official reference defines those endpoints for user authorization and basic
user information, not Ju Guang conversion ingestion. See [Open Platform API
reference](https://openaccount.xiaohongshu.com/docs/api-reference).

## Identity and consent

The fetched Ju Guang pages do not document a hashing rule, accepted identity
fields, customer-list schema, or retention period. Do not send email, phone,
IP address, or external IDs to Ju Guang until the current account contract
defines the field and its consent requirement. See [Ju Guang API documentation
entry](https://ad.xiaohongshu.com/openApiDoc?articleId=2777&categoryId=761) and
the [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).

Apply the hub gate before any platform dispatch. Require `measurement` consent
for ad measurement, and require `ad_user_data` before hashing or sending an
ad-user identifier. Keep raw identifiers inside the server boundary. See
[hub consent and identity rules](../ad-conversion-hub/SKILL.md).

## Click ID and first-party cookie

The official Ju Guang manual documents a **推广点击监测** tool and shows an
external monitoring link supplied by a cooperating monitoring company. It does
not establish a Xiaohongshu-owned click-ID parameter, cookie name, or
retention window. See [Ju Guang platform manual](https://fe-video-qc.xhscdn.com/fe-platform/37f82988d0e9273cd645bb819c37a4e0f697bc70.pdf).

Do not invent a click-ID parameter, cookie name, or attribution window. If the
approved monitoring link supplies a parameter, record its exact name and
lifetime from the current account documentation before adding it to the
adapter. Capture approved campaign values under the hub’s first-party
consent rules. See [hub click-ID rules](../ad-conversion-hub/SKILL.md).

## Deduplication

No Ju Guang deduplication field is published in the first-party pages fetched
here. Use the hub event ID for internal dispatch records, but do not serialize
it under a guessed vendor field. Do not retry an uncertain callback until the
account documentation defines idempotency or deduplication. See [Ju Guang API
documentation entry](https://ad.xiaohongshu.com/openApiDoc?articleId=2777&categoryId=761),
the [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf),
and [hub adapter and retry rules](../ad-conversion-hub/SKILL.md).

## Ju Guang settings that override code

- Qualification and industry approval control whether an account can promote
  material. The official rules require industry qualification for applicable
  advertising accounts. See [qualification rules](https://ad.xiaohongshu.com/next_help/docs/8dc5bd9c45c9a90cb9912f3400d43f92).
- The conversion tool’s generated test `trackID` belongs to the account
  workflow. Do not hard-code it or reuse it as a production identifier. See
  [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).
- Ju Guang provides separate data-reporting surfaces. Use the account’s
  current report definition when reconciling metrics; do not assume a report
  endpoint or metric name. See [Help Center](https://ad.xiaohongshu.com/next_help/home).

## Verification

1. **Access proof:** record the approved account, qualification result, API
   manual or partner authorization, and the redacted credential owner.
2. **Conversion proof:** generate the console test `trackID`, return the exact
   action required by the account, and refresh the integration state. The first-
   party manual says a received callback changes the state to successful. See
   [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf).
3. **Reporting proof:** use the current Ju Guang report in the account and
   reconcile leads, purchases, subscriptions, and refunds with first-party or
   payment-provider truth. The Help Center lists Ju Guang reporting manuals.
   See [Help Center](https://ad.xiaohongshu.com/next_help/home) and [hub
   verification rules](../ad-conversion-hub/SKILL.md).

A successful callback test proves receipt for that test flow. It does not by
itself prove campaign attribution or payment reconciliation. See [hub
   verification rules](../ad-conversion-hub/SKILL.md).

## Common pitfalls and security

- Do not use `openaccount.xiaohongshu.com` user OAuth as a Ju Guang Ads token.
  See [Open Platform API reference](https://openaccount.xiaohongshu.com/docs/api-reference).
- Do not invent a pixel, browser SDK, click ID, cookie, endpoint, header,
  payload field, event enum, hash rule, or attribution window.
- Do not treat the presence of the Ju Guang API manual as proof that the
  account has API permission. Confirm access in the account or with the
  consultant route. See [Help Center](https://ad.xiaohongshu.com/next_help/home).
- Do not send a purchase before payment-provider confirmation. Keep a missing
  conversion credential as a logged hub `skipped` result. See [hub adapter
  contract](../ad-conversion-hub/SKILL.md).
- Keep credentials server-side. Redact request bodies, tokens, identifiers,
  and screenshots. Delete temporary normalized identifiers after dispatch. See
  [hub security rules](../ad-conversion-hub/SKILL.md).

## Official sources checked (2026-08-30)

- [Ju Guang](https://ad.xiaohongshu.com/aurora/home) · [Ju Guang Help Center](https://ad.xiaohongshu.com/next_help/home)
- [Ju Guang API documentation entry](https://ad.xiaohongshu.com/openApiDoc?articleId=2777&categoryId=761) · [professional-account rules](https://ad.xiaohongshu.com/next_help/docs/195c5fe505c71b4b0335a2fe0d61d8e0)
- [conversion workflow manual](https://fe-video-qc.xhscdn.com/fe-platform/a7a8ea23090c625636d68195559a074e18165972/%E8%81%9A%E5%85%89%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E8%AF%B4%E6%98%8E.pdf) · [Ju Guang platform manual](https://fe-video-qc.xhscdn.com/fe-platform/37f82988d0e9273cd645bb819c37a4e0f697bc70.pdf)
- [Open Platform quick start](https://openaccount.xiaohongshu.com/docs/quick-start) · [API reference](https://openaccount.xiaohongshu.com/docs/api-reference) · [scope](https://openaccount.xiaohongshu.com/docs/scope)
