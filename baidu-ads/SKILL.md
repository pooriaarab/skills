---
name: baidu-ads
description: "Set up Baidu Search and Feed oCPC tracking with the official web JS SDK, server conversion upload API, bd_vid propagation, or documented app API and SDK routes. Use when wiring Baidu leads, forms, purchases, app installs, registrations, or conversion reconciliation."
---

# Baidu Ads

Baidu supports self-serve Search Promotion account opening. Its oCPC docs publish web JS tracking, a server conversion upload API, and separate app API and app SDK routes. See [Baidu account opening](https://e.baidu.com/faq/75.html), [oCPC JS](https://ocpx.baidu.com/developer/ocpc-doc/js/), and the [oCPC index](https://ocpx.baidu.com/developer/ocpc-doc/).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event envelope, consent gate, identity normalization, retry policy, and adapter contract. This skill records only Baidu-specific facts.

## Account and access

Baidu's official account guide says advertisers can register, submit company information, upload required materials, prepay, and open an account through its self-serve flow. See [Baidu account opening](https://e.baidu.com/faq/75.html).

For web API tracking, the account administrator enables the oCPC entry, creates an API conversion tracker, and obtains its API code token. See [Search Promotion setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-fc/) and [Feed Promotion setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-feed/).

The developer requests the API token from the Baidu promotion account administrator. A token reset takes effect immediately, so update the server configuration after each reset. See [account token guidance](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/account.html).

Baidu's docs define the vendor fields `token`, `production`, `bd_vid`, `conversionTypes`, `logidUrl`, and `newType`. They define no environment variable names. Use these local names only as adapter conventions:

```text
BAIDU_OCPC_TOKEN       server-only token from the promotion administrator
BAIDU_OCPC_PRODUCTION  public value from the Baidu web code
BAIDU_OCPC_BD_VID      first-party storage for the captured bd_vid
```

`BAIDU_OCPC_BD_VID` is captured fresh per visitor and per landing page. Unlike
the other two names, it is not a single static deployment secret — never bind
one process-wide value and replay it on every `logidUrl`.

Do not treat these local names as Baidu configuration. The vendor-defined names appear in the [web code](https://ocpx.baidu.com/developer/ocpc-doc/js/base-install/) and [upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Baidu also publishes a general Promotion API and a developer center for API permission management. Use the product-specific oCPC contract for conversion work. See [Baidu Promotion API](https://pd.baidu.com/Knowledge/1780.html).

## Client-side oCPC JS SDK

Baidu's web route has a base SDK and conversion code. Install the base code in
the page `<head>` before adding a conversion call. See [JS overview](https://ocpx.baidu.com/developer/ocpc-doc/js/) and [base installation](https://ocpx.baidu.com/developer/ocpc-doc/js/base-install/).

Copy the base code from the account's own oCPC console web-code page. Replace
`production` with the account's `BAIDU_OCPC_PRODUCTION` value everywhere it
appears, including the script URL query string — reusing Baidu's documentation
sample value attributes every conversion to Baidu's sample account instead of
the advertiser's:

```html
<script>
  window._agl = window._agl || [];
  (function () {
    _agl.push(['production', '<BAIDU_OCPC_PRODUCTION>']);
    (function () {
      var agl = document.createElement('script');
      agl.type = 'text/javascript';
      agl.async = true;
      agl.src = 'https://fxgate.baidu.com/angelia/fcagl.js?production=<BAIDU_OCPC_PRODUCTION>';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(agl, s);
    })();
  })();
</script>
```

For a successful web form, call the documented `success` event after the
business operation succeeds. The documented form code uses type `3`:

```js
window._agl && window._agl.push(['track', ['success', { t: 3 }]]);
```

See [form conversion code](https://ocpx.baidu.com/developer/ocpc-doc/js/form-install/).

For a click conversion, add `data-agl-cvt` to the conversion element. Use only the code assigned to the account's configured click type. See [click conversion codes](https://ocpx.baidu.com/developer/ocpc-doc/js/attr-install/clickcvtype.html).

## Rule setup and event mapping

Create the conversion tracker in Baidu Promotion before sending events. Search uses API conversion tracking. Feed uses an API lead conversion tracker. See [Search setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-fc/) and [Feed setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-feed/).

`newType` must match a conversion type exposed by the promotion account. Baidu's
published table includes these relevant codes:

| Hub event | Baidu type | Rule |
| --- | ---: | --- |
| `lead` | `18` | The published table calls this `留线索`; confirm the account type. See [type table](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html). |
| `signup` | `3` or `25` | Use `3` for web form success; use `25` for app registration. See [type table](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html). |
| `purchase` | `10` | The published table calls this `购买成功`; confirm the account type. See [type table](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html). |
| `subscription_start` | None listed | Keep first-party measurement unless the account exposes a supported type. See [type table](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html). |
| `refund` | None listed | Reconcile with payment truth; the published table has no refund row. See [type table](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html). |

Do not translate hub event names into undocumented Baidu strings. Send the account's numeric `newType` value. Baidu says each record selects one conversion type, and one click with two types needs two records. See [upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

## Server-side conversions API

Baidu publishes an advertiser-server endpoint for matched oCPC conversions. It accepts JSON with a `token` and a `conversionTypes` array containing fewer than 100 records:

```http
POST https://ocpc.baidu.com/ocpcapi/api/uploadConvertData
Content-Type: application/json
```

See [Baidu upload interface](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Use the documented fields. `logidUrl` carries the landing URL with `bd_vid`. `newType` carries the account conversion code:

```json
{
  "token": "<BAIDU_OCPC_TOKEN>",
  "conversionTypes": [
    {
      "logidUrl": "https://example.com/thank-you?bd_vid=<BD_VID>",
      "newType": 10
    }
  ]
}
```

`logidUrl` is required and cannot exceed 1024 characters. `newType` is required for new integrations and replaces the older `convertType` field. See [API fields](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

The documented optional fields are `deviceType`, `deviceId`, `isConvert`, `convertTime`, `convertValue`, and `confidence`. `deviceType` uses `0` for Android, `1` for iOS, and `2` for other devices. `convertTime` uses Unix seconds. `convertValue` uses fen. See [record fields](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Read `header.status` from every response. Baidu defines `0` as success, `1` as partial success, `2` as total failure, `3` as token failure, and `4` as server error. See [response statuses](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Retry only failures the hub can safely replay. Status `4` (server error) means Baidu did not accept the record, so retry it under the hub's bounded policy. A transport failure — no response received — is ambiguous: Baidu may have already accepted the record, and the checked schema defines no dedup key, so treat it as unknown and dead-letter it for reconciliation instead of retrying. Record failed positions from a partial response before retrying. See [Baidu sample](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/) and [ad-conversion-hub](../ad-conversion-hub/SKILL.md#retry-policy).

The checked web upload schema has no email, phone, browser identity, event ID, or browser/server deduplication field. Do not add any. Use the hub's local dispatch record for idempotency. See [upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

## App conversion routes

Baidu documents two app collection routes. The app API sends click data to the advertiser or a monitoring platform, which matches app conversions and calls the supplied `callback_url`. The app SDK uploads app events to Baidu directly. See [app collection overview](https://ocpx.baidu.com/developer/ocpc-doc/app/).

For app API traffic, the documented monitoring request can include `idfa`, `imei_md5`, `oaid`, `click_id`, and `callback_url`. Baidu defines `imei_md5` as lowercase MD5 of the original IMEI, while `idfa` and `oaid` remain raw values. See [app API parameters](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html).

The documented callback URL is:

```http
GET http://ocpc.baidu.com/ocpcapi/cb/actionCb?a_type=<ATYPE>&a_value=<AVALUE>&s=<S>&ext_info=<EXT_INFO>&sign=<SIGN>
```

Replace `a_type` and `a_value` using the app conversion. The activation example uses `a_type=activate` and `a_value=0`. Compute `sign` as the standard lowercase MD5 of the complete callback URL without `&sign=` followed by the account's `akey`. See [callback interface](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html) and [activation guide](https://ocpx.baidu.com/developer/ocpc-doc/app/app-doc/activate/).

The official callback example uses HTTP. Confirm transport requirements with Baidu for the enabled app product before production. See [callback interface](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html).

For app SDK tracking, apply for an SDK application ID, embed Baidu's SDK, and create the app SDK conversion tracker in the promotion console. Baidu's SDK guide lists app start, duration, activation, registration, and payment as required reports. See [app SDK setup](https://ocpx.baidu.com/developer/ocpc-doc/app/app-doc/sdk/).

The app SDK guide documents `REGISTER` and `PURCHASE` actions. Its purchase example reports money in fen. Follow the [platform SDK guide](https://ocpx.baidu.com/developer/ocpc-doc/app/app-doc/sdk/) for implementation.

## Identity and consent

The checked web upload schema documents device fields, but it does not define an
email field, phone field, or consent parameter. Do not invent a web hashing rule
or consent parameter. Use the hub's consent gate and identity normalization. See
[upload fields](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

For app API callbacks, send only documented device fields that the hub permits.
Baidu documents raw `idfa`, raw `oaid`, and lowercase MD5 `imei_md5`. See [app
API parameters](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html).

## Click ID and first-party cookie

After API conversion tracking is enabled, Baidu appends `bd_vid` to promoted
landing URLs. Search uses API conversion tracking. Feed uses the lead API route.
See [landing URL guidance](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/logidurl.html).

Baidu says `bd_vid` becomes effective about 90 minutes after tracking is enabled.
Each ad click receives a different value. See [bd_vid behavior](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/logidurl.html).

Capture `bd_vid` on the first landing request. Preserve it through redirects and
later conversion pages. Baidu documents three propagation methods: read the
referer, store it in a cookie, or append it to the next URL. See [URL propagation](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/logidurl.html).

Baidu does not name a required cookie in the checked docs. Use consented,
first-party storage under the local convention `BAIDU_OCPC_BD_VID`. Send the
full landing URL as `logidUrl`, not only the bare ID. See [logidUrl rules](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Do not block the hub event when `bd_vid` is absent. Preserve the business event,
then mark the Baidu dispatch as skipped when no matchable landing URL exists.
See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Deduplication

Baidu's checked web upload schema defines no event ID and no browser/server
deduplication contract. Do not send guessed `event_id` or `eventId` fields. See
[upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Use the hub event ID in local dispatch records. Key retry decisions by the event
ID, captured `bd_vid`, and account `newType`. Send separate records when one
click maps to multiple conversion types. See [upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Promotion console settings that override code

The account administrator must enable the oCPC entry and create the matching API
conversion tracker before API data can be checked. See [Search setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-fc/)
and [Feed setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-feed/).

If an account used JS reporting before API setup, Baidu says the JS can remain.
Change the promotion backend's data source to API reporting. See [account FAQ](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/account.html).

The conversion type configured in Promotion must match the JS code or server
`newType`. Baidu says a mismatch prevents collection. See [data troubleshooting](https://ocpx.baidu.com/developer/ocpc-doc/js/faq/data.html).

## Verification

Verify the web base code in browser developer tools. Find a request beginning
with `http://fclog.baidu.com/log/ocpcagl` and confirm status `200`. Baidu uses
those checks to verify base-code installation. See [base-code verification](https://ocpx.baidu.com/developer/ocpc-doc/js/base-install/).

Verify the form call at the successful submission branch. Baidu's guide says to confirm the `agl.push` call exists. See [form verification](https://ocpx.baidu.com/developer/ocpc-doc/js/form-install/).

For server uploads, record the redacted response and inspect `header.status`. Status `0` proves upload acceptance only. It does not prove filtered reporting or campaign credit. See [API response](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).

Use the Baidu oCPC Developer Center to query raw API returns and download the
details. Baidu says promotion reports filter raw data, so the counts can differ.
See [Search reconciliation](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-fc/)
and [data reconciliation](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/transdata.html).

Baidu's report guidance says promotion conversion reports lag by one day. Compare
raw returns, filtered reports, and the hub source event. See [report timing](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/transdata.html).

## Common pitfalls and security

- Keep `bd_vid` through redirects and later conversion pages. See [Baidu URL guidance](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/logidurl.html).
- Keep `logidUrl` under 1024 characters and send the full URL. See [API fields](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).
- Use `newType` for new web API integrations. See [API fields](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).
- Treat partial status as partial and inspect each returned error position. See [API responses](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).
- Replace the stored token after an administrator resets it. See [account FAQ](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/account.html).
- Do not send undocumented email, phone, event ID, or browser deduplication fields. See [upload schema](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/).
- Keep tokens, `akey`, and device identifiers server-side. Do not log or commit them. See [API access](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/) and [app API parameters](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html).
- Keep payment and signup flows independent from Baidu. A missing Baidu match must not fail the business event. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Official sources checked (2026-08-29)

- [Baidu account opening](https://e.baidu.com/faq/75.html) · [Baidu Promotion API](https://pd.baidu.com/Knowledge/1780.html) · [oCPC index](https://ocpx.baidu.com/developer/ocpc-doc/)
- [JS overview](https://ocpx.baidu.com/developer/ocpc-doc/js/) · [base code](https://ocpx.baidu.com/developer/ocpc-doc/js/base-install/) · [form code](https://ocpx.baidu.com/developer/ocpc-doc/js/form-install/)
- [Click codes](https://ocpx.baidu.com/developer/ocpc-doc/js/attr-install/clickcvtype.html) · [conversion types](https://ocpx.baidu.com/developer/ocpc-doc/converttype.html)
- [Search setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-fc/) · [Feed setup](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-feed/) · [upload interface](https://ocpx.baidu.com/developer/ocpc-doc/api/api-doc/api-interface/)
- [Account FAQ](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/account.html) · [landing URL guidance](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/logidurl.html) · [data troubleshooting](https://ocpx.baidu.com/developer/ocpc-doc/js/faq/data.html) · [data reconciliation](https://ocpx.baidu.com/developer/ocpc-doc/api/api-faq/transdata.html)
- [App overview](https://ocpx.baidu.com/developer/ocpc-doc/app/) · [app callback](https://ocpx.baidu.com/developer/ocpc-doc/app/app-interface/README1.html) · [activation guide](https://ocpx.baidu.com/developer/ocpc-doc/app/app-doc/activate/) · [app SDK](https://ocpx.baidu.com/developer/ocpc-doc/app/app-doc/sdk/)
