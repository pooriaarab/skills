---
name: ads-weibo
description: "Integrate Weibo Ads landing-page conversion reporting, OAuth access, campaign reporting, and first-party measurement with explicit platform boundaries. Use when evaluating Weibo Ads, launching a regional campaign, or wiring a Weibo conversion callback."
---

# Weibo Ads

Weibo has a public developer portal for its Ads API. The portal lists ad
delivery, reporting, creative, and DMP audience interfaces. Its OCPA guide
documents an authenticated landing-page conversion callback. See the [Weibo Ads developer guide](https://developers.biz.weibo.com/docs/) and [OCPA conversion guide](https://developers.biz.weibo.com/util/ocpa).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
This skill supplies only Weibo-specific fields and workflow.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

Weibo documents self-serve registration for **超级粉丝通 (Superfans)**. Its
official FAQ lists web and mobile routes. Blue-verified, yellow-verified, and
ordinary accounts can apply. Individual and enterprise registration are both
supported. See [How to register Superfans](https://kefu.weibo.com/faqdetail?id=20664).

API access has a separate gate. The developer guide requires a company
advertiser or agency account already opened on 微博掘金. It says other Weibo
accounts cannot register as developers. See the [API onboarding guide](https://developers.biz.weibo.com/docs/).

Create an application in the official developer portal. The form asks for an
application name, email, callback URL, and requested permissions. It exposes
these Superfans permissions:

- `ads_read` for reading Superfans campaigns, plans, creatives, and materials.
- `ads_management` for Superfans campaign-management operations.
- `ads_insight` for Superfans reporting.

The names and descriptions appear on the [official application form](https://developers.biz.weibo.com/apps/create). Request only the scopes needed by this adapter.

These are adapter-local names, not Weibo field names:

```text
WEIBO_ADS_APP_ID          server-side application ID, used as client_id
WEIBO_ADS_ACCESS_TOKEN    short-lived server-side access token
WEIBO_ADS_REFRESH_TOKEN   server-side refresh token
WEIBO_ADS_ACCOUNT_UID     advertiser UID used in a test mark_id
```

The official OCPA test example builds `mark_id` from an advertiser UID, time,
and the literal `test` ([test request guide](https://developers.biz.weibo.com/util/ocpa)).
Keep tokens in the server secret store. Never place them in browser code, URLs,
logs, screenshots, or commits.

## OAuth access

The developer guide documents an authorization-code flow. Build the consent
URL with these documented parameters:

```text
https://api.biz.weibo.com/oauth/authorize
  ?client_id={APP_ID}
  &redirect_uri={CALLBACK_URL}
  &response_type=code
  &state={STATE}
  &scope=ads_read,ads_insight
```

The guide documents `client_id`, `redirect_uri`, `response_type`, `state`, and
`scope`. It fixes `response_type` to `code`. The redirect URL must match the
application setting. The callback returns `code` and `state`. See the [authorization workflow](https://developers.biz.weibo.com/docs/).

The authorization code expires after 10 minutes and can be used once. Exchange
it at the documented token URL:

```http
GET https://api.biz.weibo.com/oauth/token
```

Use `client_id`, `grant_type=authorization_code`, `redirect_uri`, and `code`.
The guide shows access-token and refresh-token fields, `expires_in`,
`refresh_expires_in`, and `token_type`. It states that the access token lasts
24 hours and the refresh token lasts 90 days. See the [token exchange documentation](https://developers.biz.weibo.com/docs/).

Refresh with the documented endpoint and JSON fields:

```http
POST https://api.biz.weibo.com/oauth/refresh_token
Content-Type: application/json
```

```json
{
  "client_id": "<WEIBO_ADS_APP_ID>",
  "refresh_token": "<WEIBO_ADS_REFRESH_TOKEN>"
}
```

The [official guide](https://developers.biz.weibo.com/docs/) documents this endpoint and both fields. Serialize refresh operations. Replace stored token values only after safely recording the response.

Authorized Ads API examples use `Authorization: Bearer <token>`. Use that
header for the conversion callback. See the [OCPA request example](https://developers.biz.weibo.com/util/ocpa).

## Client-side landing-page measurement

The OCPA guide documents a landing-page URL flow. It does not name a Weibo
browser pixel, tag ID, cookie, or app SDK for this conversion path. Do not
invent `WEIBO_ADS_PIXEL_ID`, `WEIBO_ADS_TAG_ID`, a script URL, or an SDK event
method. See the [OCPA flow](https://developers.biz.weibo.com/util/ocpa).

Add `from=wb` to the advertiser's landing-page URL when you need to identify
Weibo traffic. Weibo appends `mark_id` when it sends the landing-page URL to a
user. Decide on your server whether the action qualifies, then call the
conversion endpoint with documented fields. See the [OCPA flow](https://developers.biz.weibo.com/util/ocpa).

The [OCPA guide](https://developers.biz.weibo.com/util/ocpa) identifies
`from=wb` as an advertiser source marker and `mark_id` as the tracking value
added by Weibo. It says Weibo uses `mark_id` to associate the callback with the
advertising plan.

Capture `mark_id` at the landing request. Store it with the canonical event in
your first-party system. Preserve the raw value. Do not rename it to `click_id`.

## Rule setup and event mapping

The OCPA guide calls the callback behavior a **行为码** (behavior code). The
documented codes are:

| Weibo behavior | Code | Hub mapping | Dispatch rule |
| --- | ---: | --- | --- |
| Form submission | `1001` | `lead` | Use for a qualifying form submission. |
| Phone call | `1002` | No direct hub event | Keep as an operational metric. |
| Valid consultation | `1003` | `lead` | Use for a qualifying consultation. |
| WeChat copy | `1004` | No direct hub event | Do not relabel it. |
| Landing-page visit | `1005` | `page_view` | Measure only the chosen landing visit. |
| Download start | `1006` | No direct hub event | Do not invent a hub mapping. |
| Product purchase | `1007` | `purchase` | Send after charge confirmation. |
| Other | `1100` | No automatic mapping | Use with an approved definition. |

The codes and labels come from the [official behavior-code table](https://developers.biz.weibo.com/util/ocpa). The table does not define a dedicated code for `signup`, `view_content`, `begin_checkout`, `subscription_start`, or `refund`. Do not invent codes for those events.

## Server-side conversion API

Weibo documents a real authenticated conversion callback. It is a `GET` request
to this endpoint:

```http
GET https://api.biz.weibo.com/v3/track/activate
Authorization: Bearer <WEIBO_ADS_ACCESS_TOKEN>
Accept: application/json,application/text+gw2.0
```

The documented query parameters are `time`, `behavior`, `mark_id`, and `host`:

```text
https://api.biz.weibo.com/v3/track/activate
  ?time={TIME}
  &behavior={BEHAVIOR}
  &mark_id={MARK_ID}
  &host={HOST}
```

The [official OCPA guide](https://developers.biz.weibo.com/util/ocpa) documents the endpoint, method, headers, and parameters. It defines `time` as conversion time in epoch milliseconds. It allows an empty `mark_id` for natural traffic. It defines `host` as the callback source and gives the advertiser domain as the default example.

Send confirmed events only. Use the hub event time in milliseconds. Use a
behavior code from the table. Pass captured `mark_id` when present. Follow the
documented empty-`mark_id` behavior for natural events.

Example with redacted values:

```bash
curl --get 'https://api.biz.weibo.com/v3/track/activate' \
  --header 'Authorization: Bearer <WEIBO_ADS_ACCESS_TOKEN>' \
  --header 'Accept: application/json,application/text+gw2.0' \
  --data-urlencode 'time=<EPOCH_MILLISECONDS>' \
  --data-urlencode 'behavior=1007' \
  --data-urlencode 'mark_id=<CAPTURED_MARK_ID>' \
  --data-urlencode 'host=example.com'
```

The guide shows success as `code: 0` and `message: "OK"`. It shows errors with
`message: "Error"` and an error `code`. See the [response examples](https://developers.biz.weibo.com/util/ocpa).

Callbacks delayed by more than two hours become natural conversions. They do
not enter model optimization, threshold calculation, or plan-level reporting.
Send in real time. Use the hub's bounded retry and dead-letter policy for
transient failures. See the [timing and attribution notes](https://developers.biz.weibo.com/util/ocpa).

The guide says a missing `mark_id` prevents precise attribution to the plan.
Do not block first-party measurement when it is absent. Record the event
internally and report only the documented natural or attributable form.

## Identity and consent

The fetched callback contract defines `time`, `behavior`, `mark_id`, and
`host`. It does not define an email field, phone field, external user ID,
hashing rule, or identity-match contract. Do not send such fields. See the [documented callback fields](https://developers.biz.weibo.com/util/ocpa).

Apply the hub consent gate before ad measurement. Send only fields documented
by the current Weibo contract. Do not hash an email or phone number and assume
Weibo will match it. Keep consent and the dispatch decision with the canonical
event.

## Click ID and first-party cookie

Weibo documents `mark_id`, not a conventional click-ID name. It appends
`mark_id` to the landing-page URL in the documented app traffic flow. The
advertiser may add `from=wb` or another source marker. See the [official landing-page flow](https://developers.biz.weibo.com/util/ocpa).

No first-party cookie name or cookie lifetime is documented in that guide. Do
not invent one. Capture `mark_id` from the URL and retain it in your own
first-party storage while consent allows measurement.

The callback contract lists no Weibo `event_id`, idempotency key, or
browser/server deduplication field. Use the hub event ID for your own dispatch
record. Do not add `event_id` to the Weibo query string. See the [callback field list](https://developers.biz.weibo.com/util/ocpa).

## Deduplication

The documented callback contract has no deduplication parameter. Therefore:

1. Create one canonical hub event for the business action.
2. Record the Weibo dispatch using the hub event ID and destination.
3. Retry only according to the hub policy and recorded dispatch state.
4. Do not replay an uncertain `GET` without an adapter decision that accounts
   for the missing platform deduplication field.
5. Reconcile Weibo reporting with payment-provider truth.

The retry and event-envelope rules belong to [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Console settings that override code

The callback cannot replace campaign configuration. The OCPA flow requires
callback testing, campaign creation, a marketing objective, a target behavior,
a conversion-cost bid, and a creative URL containing `from=wb`. See the [official campaign procedure](https://developers.biz.weibo.com/util/ocpa).

If `from=wb` is absent, the guide says the landing page cannot identify Weibo
traffic. If `mark_id` is absent or lost, it says the conversion cannot be
precisely attributed to the plan. Check both before launch. See the [OCPA questions and answers](https://developers.biz.weibo.com/util/ocpa).

## Verification

1. **Callback proof:** run the documented test request with a test `mark_id`.
   Record the redacted response. Require `code: 0` and `message: "OK"`. The [OCPA guide](https://developers.biz.weibo.com/util/ocpa) provides the test URL, value shape, headers, parameters, and response.
2. **Campaign proof:** confirm the objective, behavior target, bid, and
   landing-page URL in the console. The [official procedure](https://developers.biz.weibo.com/util/ocpa) lists these setup steps.
3. **Reporting proof:** use the Ads API reporting surface or console. The
   developer guide lists advertiser, campaign, plan, creative, material,
   audience, and asynchronous report areas. See the [reporting index](https://developers.biz.weibo.com/docs/).
4. **Business proof:** reconcile `purchase` and `refund` with payment-provider
   truth. A callback response does not prove that a charge succeeded.

## Common pitfalls and security

- Do not use a guessed pixel, tag ID, cookie name, SDK method, `event_id`, or
  identity field. The [OCPA guide](https://developers.biz.weibo.com/util/ocpa) documents URL markers and a server callback instead.
- Do not send the access token in a query parameter. The documented request
  puts it in the `Authorization` header. See the [request example](https://developers.biz.weibo.com/util/ocpa).
- Do not log callback URLs with raw tokens or sensitive event data. Redact
  tokens, `mark_id` values, and account identifiers.
- Do not use seconds for `time`. The [official guide](https://developers.biz.weibo.com/util/ocpa) specifies milliseconds.
- Do not wait more than two hours when you need model optimization, threshold
  counting, or plan-level reporting. See the [official timing rule](https://developers.biz.weibo.com/util/ocpa).
- Do not treat `code: 0` as payment proof, unique-count proof, or attribution
  proof.
- Do not send a guessed `refund` behavior. The official table has no refund
  code. Reconcile refunds in the hub and payment system. See the [behavior table](https://developers.biz.weibo.com/util/ocpa).
- Do not let missing Weibo credentials block checkout. Return a logged
  `skipped` result under the hub contract.

## Official sources checked (2026-08-30)

- [Weibo Ads developer guide](https://developers.biz.weibo.com/docs/)
- [Weibo Ads application form](https://developers.biz.weibo.com/apps/create)
- [OCPA conversion callback guide](https://developers.biz.weibo.com/util/ocpa)
- [Superfans registration FAQ](https://kefu.weibo.com/faqdetail?id=20664)
