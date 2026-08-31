---
name: tencent-ads
description: "Integrate Tencent Ads conversion measurement, Marketing API access, web self-attribution, app user actions, click identifiers, and platform verification. Use when wiring Tencent Ads tracking or checking whether a proposed Tencent Ads contract is real."
---

# Tencent Ads

Tencent Ads has self-serve advertiser signup and a public Marketing API. It
also has documented web self-attribution and User Action API routes. Access is
account, application, permission, and product dependent. Use
[ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
See Tencent's [advertiser signup guide](https://tencentads.com/faqlist/detail?id=148),
[Marketing API quick start](https://developers.e.qq.com/docs/start), and
[web conversion API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

Advertisers can start from Tencent Ads' **开户 → 我要开户** flow. The official
guide says to provide company information, connect a QQ account, add the
promotion URL, upload the business license, select the industry, and submit
the account for review. It says Android app advertisers must first register
the app on Tencent Open Platform. See the [account guide](https://tencentads.com/faqlist/detail?id=148)
and [review process](https://tencentads.com/Doc/Detail/C748049E45D87B8C).

Marketing API access is a separate developer flow. Register as a developer,
create an application, and request the required permission group. Tencent
documents private applications for the developer's own advertising identity
and third-party applications for managing multiple advertiser accounts. A
private application cannot use OAuth to manage other accounts; third-party
applications support OAuth and receive stricter review. See the [developer
quick start](https://developers.e.qq.com/docs/start).

For third-party access, Tencent documents server-side OAuth 2.0. The advertiser
authorizes the application, which receives an authorization code and exchanges
it for an access token and refresh token. The token exchange endpoint is
https://api.e.qq.com/oauth/token. The documented parameters are
client_id, client_secret, grant_type, authorization_code or refresh_token, and
redirect_uri for the authorization-code flow. See
[OAuth authorization](https://developers.e.qq.com/docs/start/authorization).

Tencent's documented defaults are 24 hours for access_token and 30 days for
refresh_token. The application settings can change the access-token lifetime,
and refreshing the access token renews the refresh-token lifetime. See the
[application and token settings](https://developers.e.qq.com/docs/start).

Use local secret names only as adapter conventions:

~~~text
TENCENT_ADS_CLIENT_ID
TENCENT_ADS_CLIENT_SECRET
TENCENT_ADS_ACCESS_TOKEN
TENCENT_ADS_REFRESH_TOKEN
TENCENT_ADS_ACCOUNT_ID
TENCENT_ADS_USER_ACTION_SET_ID
TENCENT_ADS_CONVERSION_ID
~~~

These names are not Tencent field names. Never put client_secret, access
tokens, or refresh tokens in browser code, logs, screenshots, or commits.

## Client-side tag or app measurement

Do not add a guessed Tencent pixel, cookie, SDK initializer, or public tag ID.
The fetched Tencent pages do not provide a current browser snippet in the
material used here. The official
landing-page integration guide instead tells site builders to register a
developer application, obtain reporting permission, and upload landing-page
user actions through Marketing API. See the [landing-page integration
requirements](https://tencentads.com/Faqlist/Detail/709).

For app measurement, use the documented User Action API contract. If an app
SDK is required, fetch Tencent's current SDK instructions before coding. The
app guide defines device identifiers and app event types, but this skill does
not invent a package name, initialization call, or app identifier. See the
[app conversion guide](https://developers.e.qq.com/docs/guide/user_actions/convertion_app)
and [User Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action).

## Rule setup and event mapping

Create the web conversion rule in Tencent Ads' **Toolbox → Conversion
Tracking → Web conversion** flow. The web guide says to use a callback route
when click monitoring is configured, or a landing-page URL with click_id
when it is not. The URL reported by the event must match the URL used by the
conversion rule. See the [web conversion guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

Create a DMP user-action data source before sending Marketing API events. The
source receives user_action_set_id; Tencent documents that field as the
unique ID assigned when the user-action source is created. See the [User
Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action)
and [app conversion guide](https://developers.e.qq.com/docs/guide/user_actions/convertion_app).

Use only the documented Tencent action type that matches the business event:

| Hub event | Tencent action type | Constraint |
| --- | --- | --- |
| signup | REGISTER | Report a completed registration. |
| view_content | VIEW_CONTENT | Add object=product only for the documented product-page case. |
| begin_checkout | INITIATE_CHECKOUT | The current enum lists this type; confirm it is enabled for the account. |
| purchase | PURCHASE | Report a completed payment. |
| lead | RESERVATION, LEAVE_INFORMATION, or another approved type | Choose the type that matches the actual Tencent optimization goal. |
| refund | No refund mapping in this adapter | Reconcile refunds in payment truth. |

The REGISTER, VIEW_CONTENT, INITIATE_CHECKOUT, PURCHASE, RESERVATION, and
LEAVE_INFORMATION values come from Tencent's current User Action enum. Tencent's
guide also lists PURCHASE for payment and REGISTER for registration. See the
[User Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action)
and [web conversion guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

Do not map every hub event automatically. Tencent's event enum is the
platform contract. If no Tencent action type matches, record the first-party
event in the hub and do not send a guessed action type.

## Server-side conversions API

Tencent does not call this surface a Meta-style “Conversions API.” Its public
server route is the Marketing API User Action API, user_actions/add. Tencent's
reference documents V1.1, POST, the User Actions permission, and the
production request form below. See the [User Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action).

The global parameters are query parameters. access_token is the OAuth token;
timestamp is UNIX seconds, with a maximum client clock error of 300 seconds;
and nonce is a caller-generated string of no more than 32 characters. Tencent
documents account_id, user_action_set_id, and actions as required. The actions
array has a maximum of 50 items and 50 KB. See the [request fields](https://developers.e.qq.com/docs/apilist/user_data/user_action).

~~~http
POST https://api.e.qq.com/v1.1/user_actions/add?access_token=<ACCESS_TOKEN>&timestamp=<UNIX_SECONDS>&nonce=<UNIQUE_NONCE>
Content-Type: application/json

{
  "account_id": "<ACCOUNT_ID>",
  "user_action_set_id": 1234567890,
  "actions": [
    {
      "external_action_id": "<CANONICAL_EVENT_ID>",
      "action_time": 1735689600,
      "action_type": "PURCHASE",
      "user_id": {
        "hash_phone": "<MD5_PHONE>"
      },
      "trace": {
        "click_id": "<CLICK_ID>",
        "url": "<H5_URL>"
      }
    }
  ]
}
~~~

For web actions, Tencent says trace.url must contain the H5 URL where the
event occurred. trace.click_id is the click ID when available. For app
actions, user_id is required; for web actions, Tencent says it may be omitted
but recommends it for later optimization. See the [User Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action).

For a web event value, Tencent's web guide documents action_param.value for
PURCHASE and COMPLETE_ORDER, with the value expressed in cents. Use the
current User Action schema for the exact serialization of action_param.
See the [web conversion guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

Tencent documents a successful User Action API response as code: 0 with an
empty message. Treat that as platform receipt only. Store the dispatch result
and apply the hub retry and dead-letter policy. See the [API response example](https://developers.e.qq.com/docs/apilist/user_data/user_action)
and [hub contract](../ad-conversion-hub/SKILL.md).

### Web self-attribution route

Tencent also documents a separate web self-attribution route. Use it only when
the web conversion rule and click-monitoring setup match the route:

~~~http
POST http://tracking.e.qq.com/conv?cb=<URL_DECODED_CALLBACK>&conv_id=<CONVERSION_ID>
Content-Type: application/json

{
  "actions": [
    {
      "outer_action_id": "<PLATFORM_SAFE_EVENT_ID>",
      "action_time": 1735689600,
      "action_type": "PURCHASE",
      "action_param": { "value": 2500 }
    }
  ]
}
~~~

Without a callback, Tencent documents this form:

~~~http
POST http://tracking.e.qq.com/conv
Content-Type: application/json

{
  "actions": [
    {
      "outer_action_id": "<PLATFORM_SAFE_EVENT_ID>",
      "action_time": 1735689600,
      "action_type": "PURCHASE",
      "url": "<H5_URL>",
      "trace": { "click_id": "<CLICK_ID>" }
    }
  ]
}
~~~

The same guide documents a GET form at
http://tracking.e.qq.com/conv/web?clickid=<CLICK_ID>&action_time=<UNIX_SECONDS>&action_type=<ACTION_TYPE>&link=<URLENCODED_DOMAIN>.
It documents code: 0 as successful receipt. The guide currently prints
these conversion URLs with http. Confirm the current HTTPS contract with
Tencent before sending production traffic. Do not silently replace the
documented scheme or place secrets in the query string. See the [web conversion
API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

## Identity and consent

Gate every Tencent dispatch with the hub's consent decision. The Tencent docs
fetched here define these identity rules:

- hash_imei: lowercase the IMEI, then MD5 it.
- hash_idfa: uppercase the IDFA, then MD5 it.
- hash_phone: MD5 the phone number directly.
- oaid: preserve the OAID value without MD5 when using that documented field.
- hash_android_id: MD5 the Android ID.

See the [app conversion identity rules](https://developers.e.qq.com/docs/guide/user_actions/convertion_app)
and [User Action field reference](https://developers.e.qq.com/docs/apilist/user_data/user_action).

Tencent's User Action reference also lists SHA-256 device and phone fields.
Do not substitute a SHA-256 field for an MD5 field. Do not add email hashing:
the fetched Tencent conversion references do not establish an email field or
an email normalization rule for this adapter. Keep raw identifiers out of
logs and delete temporary normalized values after dispatch.

## Click ID and first-party cookie

For Tencent web traffic, the official web guide says each click creates a
click ID. It identifies qz_gdt as the non-WeChat landing-page URL parameter
and gdt_vid as the WeChat landing-page URL parameter. Capture the value on
the landing request, subject to consent, and store it with the canonical event.
See the [web conversion API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

For callback-based attribution, Tencent documents __CALLBACK__ as a value
that must be URL-decoded into cb. It documents clickid as the GET query
parameter and trace.click_id as the JSON field. These names are
route-specific. Do not rename them to click_id in the callback URL. See the
[web conversion API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

The fetched Tencent sources do not document a Tencent-owned browser cookie
name or cookie lifetime. Do not invent one. Use first-party storage only for
the consented campaign value and the hub's retention policy.

## Deduplication

Deduplicate by the route-specific field, not by a guessed event_id field:

- Marketing API user_actions/add uses external_action_id. Tencent says its
  deduplication key combines user_action_set_id, external_action_id, and
  action_type.
- The web self-attribution guide uses outer_action_id. Tencent says its
  value may be up to 255 bytes and may contain only letters, digits,
  underscores, and hyphens. Its deduplication key combines the user-action
  source, outer_action_id, and action_type.

See the [User Action API reference](https://developers.e.qq.com/docs/apilist/user_data/user_action),
[app deduplication guidance](https://developers.e.qq.com/docs/guide/user_actions/convertion_app),
and [web conversion API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

The fetched Tencent pages do not document browser/server cross-route
deduplication. Do not send both routes for one event unless Tencent gives the
campaign a written reconciliation rule.

## Tencent Ads settings that override code

- The conversion rule and its landing-page URL are configured in the Tencent
  Ads console. The event URL must match the configured URL for web reporting.
- A callback route requires click monitoring in the web conversion setup.
  The no-callback route requires the landing-page URL and click ID.
- Tencent's third-party exposure and click monitoring requires separate
  allowlisting. Tencent says advertisers should request it by email and
  provide the advertiser account ID and monitoring type. See the [monitoring
  allowlist guide](https://tencentads.com/Faqlist/Detail/397).
- A developer application must have the required User Actions permission.
  Tencent says application permissions can differ by application and usage.
  See the [User Action reference](https://developers.e.qq.com/docs/apilist/user_data/user_action)
  and [developer quick start](https://developers.e.qq.com/docs/start).

Never infer a campaign's enabled action types, attribution mode, monitoring
allowlist, or data-source authorization from code alone. Read the console
configuration and the account's approved permission set.

## Verification

1. **Request proof:** record a redacted response. For the User Action API and
   web self-attribution route, code: 0 proves Tencent received the request;
   it does not prove ad attribution. See the [User Action response](https://developers.e.qq.com/docs/apilist/user_data/user_action)
   and [web response](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).
2. **Data-source proof:** Tencent says to inspect the DMP data-source access
   report. It identifies PV as the successful upload count and recommends
   checking ad-attribution conversion data in the delivery backend later. See
   the [app conversion verification guidance](https://developers.e.qq.com/docs/guide/user_actions/convertion_app).
3. **Business proof:** reconcile purchase with succeeded payment records.
   Reconcile refund in the payment system. Do not count API receipt as a
   purchase.

For web traffic, test both branches separately: callback plus cb, and
landing-page URL plus trace.click_id. Do not test by copying the example
callback URL. Tencent says the callback value comes from the click redirect.
See the [web conversion API guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).

## Common pitfalls and security

- Do not use https://e.qq.com/ads/ as a token-validation endpoint. Tencent
  documents OAuth token exchange at https://api.e.qq.com/oauth/token and the
  User Action call at https://api.e.qq.com/v1.1/user_actions/add. See the
  [OAuth guide](https://developers.e.qq.com/docs/start/authorization) and
  [User Action reference](https://developers.e.qq.com/docs/apilist/user_data/user_action).
- Do not put access_token or client_secret in browser bundles. The OAuth
  guide shows query parameters, so redact request URLs before logging them.
  See [OAuth authorization](https://developers.e.qq.com/docs/start/authorization).
- Do not use event_id, eventId, pixel_id, or TENCENT_ADS_PIXEL_ID as Tencent
  fields. Use only the route-specific fields documented above. See the
  [User Action reference](https://developers.e.qq.com/docs/apilist/user_data/user_action)
  and [web conversion guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).
- Do not confuse qz_gdt, gdt_vid, clickid, click_id, cb, and __CALLBACK__.
  They belong to different request locations. See the [web conversion
  guide](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api).
- Do not send raw IMEI, IDFA, phone, or OAID without the hub consent gate.
  Apply Tencent's documented normalization before hashing. See the [identity
  rules](https://developers.e.qq.com/docs/guide/user_actions/convertion_app).
- Do not call the old web route and User Action API for the same event unless
  the campaign has an explicit reconciliation plan.
- Do not treat code: 0 or a DMP PV count as proof of payment attribution. See
  the [User Action response](https://developers.e.qq.com/docs/apilist/user_data/user_action)
  and [DMP verification guidance](https://developers.e.qq.com/docs/guide/user_actions/convertion_app).
- The web guide currently prints the conversion endpoint with http. Confirm
  the production transport with Tencent before launch.

Missing credentials or missing permission must produce a logged adapter
skipped result. It must not fail checkout. Keep retry state and consent
metadata in the hub. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Official sources checked (2026-08-30)

- [Tencent Ads account setup](https://tencentads.com/faqlist/detail?id=148) ·
  [account review](https://tencentads.com/Doc/Detail/C748049E45D87B8C)
- [Marketing API quick start](https://developers.e.qq.com/docs/start) ·
  [OAuth authorization](https://developers.e.qq.com/docs/start/authorization)
- [User Action API](https://developers.e.qq.com/docs/apilist/user_data/user_action) ·
  [app conversion guide](https://developers.e.qq.com/docs/guide/user_actions/convertion_app)
- [Web conversion API](https://developers.e.qq.com/docs/guide/conversion/new_version/Web_api)
- [Landing-page integration requirements](https://tencentads.com/Faqlist/Detail/709) ·
  [click and impression monitoring](https://tencentads.com/Faqlist/Detail/397)
