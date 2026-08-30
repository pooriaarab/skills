---
name: yandex-direct
description: "Use for Yandex Direct or Metrica setup, yclid capture, Measurement Protocol, offline conversions, OAuth access, deduplication limits, attribution, and server verification."
---

# Yandex Direct

Yandex Direct does not document a web conversion endpoint in its Direct API. Use the documented Yandex Metrica goals as the conversion layer for Direct campaigns. [Direct API docs cover campaign management and reporting.](https://yandex.com/dev/direct/doc/en/) [Metrica docs cover goals and conversion imports.](https://yandex.com/dev/metrika/en/management/conversion)

This adapter has two server paths: **Measurement Protocol** sends events to an active Metrica session. **Offline conversion upload** sends CSV rows from a webhook or CRM job.

The official paths do not document `event_id` or `eventID` for client/server deduplication. Keep the hub event ID in the dispatch log. Do not invent a vendor dedup field.

## Account and access

Yandex Direct has self-serve signup. Create a separate Yandex username. Select the country and payment currency. Add a working email and phone number. Accept the terms, then click **Start using the service**. [Follow the current account flow.](https://yandex.com/support/direct/en/quick-start/create-campaign)

The country controls payment methods. A first payment can require identity or business documents. [Check the country-specific payment rules.](https://www.yandex.com/support/direct/en/payments/payment-methods)

Create at least one campaign before opening API settings. Accept the API user agreement there. [Yandex documents this access gate.](https://yandex.com/dev/direct/doc/en/concepts/register)

To use the Direct API:

1. Register an OAuth app with the `direct:api` data source.
2. Submit one API access request for that app.
3. Choose **Test access** for Sandbox or **Full access** for live data.
4. Get an OAuth token for each authorized Direct user.

Approval is mandatory. Test access works only with Sandbox. A test-access app cannot call the live API. [Read the access-request rules.](https://yandex.com/dev/direct/doc/en/access-request) [Read the OAuth rules.](https://yandex.com/dev/direct/doc/en/concepts/auth-token)

Store the Direct campaign credential as `YANDEX_DIRECT_OAUTH_TOKEN`. Send it as `Authorization: Bearer <token>`. Add `Client-Login` when an agency representative acts for an advertiser. [See the required headers.](https://yandex.com/dev/direct/doc/en/concepts/headers)

This read checks Direct API access. It does not prove conversion delivery:

```bash
curl -sS -X POST 'https://api.direct.yandex.com/json/v5/campaigns' \
  -H "Authorization: Bearer $YANDEX_DIRECT_OAUTH_TOKEN" \
  -H 'Accept-Language: en' -H 'Content-Type: application/json' \
  -d '{"method":"get","params":{"SelectionCriteria":{},"FieldNames":["Id","Name","Status","State"]}}'
```

[The Campaigns `get` method defines this request.](https://yandex.com/dev/direct/doc/en/campaigns/get)

## Client tag and goals

For this web flow, the documented client tag is Yandex Metrica, not a separate Direct pixel. Install the tag. Create JavaScript event goals. Select those goals in Direct. [Direct strategies use Metrica goals.](https://yandex.com/support/direct/en/strategies/priority-goals)

Store the numeric Metrica tag or counter ID as `YANDEX_METRICA_TAG_ID`.

Load the generated tag on every page, near the top. The official script loads `https://mc.yandex.ru/metrika/tag.js`. [Follow the installation rules.](https://yandex.com/support/metrica/en/quick-start)

```html
<script>
  (function (m, e, t, r, i, k, a) {
    m[i] = m[i] || function () {
      (m[i].a = m[i].a || []).push(arguments);
    };
    m[i].l = 1 * new Date();
    k = e.createElement(t); a = e.getElementsByTagName(t)[0];
    k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  ym(<YANDEX_METRICA_TAG_ID>, 'init', {
    clickmap: true, trackLinks: true, accurateTrackBounce: true
  });
</script>
```

Create one JavaScript event goal for each conversion. Goal IDs are configured strings. Yandex does not provide a fixed goal-name taxonomy. [The goal API uses `reachGoal(target[, params])`.](https://yandex.com/support/metrica/en/objects/reachgoal)

```js
ym(<YANDEX_METRICA_TAG_ID>, 'reachGoal', 'signup');
ym(<YANDEX_METRICA_TAG_ID>, 'reachGoal', 'purchase', {
  order_price: 25, currency: 'USD'
});
```

Use the confirmed payment value. Do not read a price from page text.

## Hub event mapping

Keep canonical events, consent, and stable IDs in [`ad-conversion-hub`](../ad-conversion-hub/SKILL.md). Configure these goal IDs in this adapter.

| Hub event | Client event | Offline `Target` | Note |
| --- | --- | --- | --- |
| `page_view` | `t=pageview` | — | The tag records pageviews. |
| `view_content` | `reachGoal('view_content')` | `view_content` | JavaScript goal. |
| `lead` | `reachGoal('lead')` | `lead` | Use qualified leads. |
| `signup` | `reachGoal('signup')` | `signup` | Exact goal ID. |
| `begin_checkout` | `reachGoal('begin_checkout')` | `begin_checkout` | Exact goal ID. |
| `purchase` | `reachGoal('purchase', revenue)` or `pa=purchase` | `purchase` | Add value and currency. |
| `subscription_start` | `reachGoal('subscription_start', revenue)` | `subscription_start` | Separate goal. |
| `refund` | No native refund event | `refund` if configured | Do not send negative purchase. |

For ecommerce, Measurement Protocol supports `pa=purchase`, `ti` for transaction ID, `tr` for revenue, and `cu` for currency. `ti` links ecommerce data. It is not a documented client/server dedup key. [See the official parameter list.](https://yandex.com/dev/metrika/en/data-import/measurement-upload)

## Server-side conversion API

### Measurement Protocol

This is the public server event API. It needs a Metrica `ClientID` and a measurement token. Enable Measurement Protocol for the tag first.

Store the measurement token as `YANDEX_METRICA_MEASUREMENT_TOKEN`. Store the separate management credential as `YANDEX_METRICA_OAUTH_TOKEN`. Give its Metrica OAuth app `metrika:offline_data` or broader `metrika:write` access.

Use `Authorization: OAuth <token>` to enable the feature or manage tokens. A tag can have up to five active measurement tokens. Use the `metrika:offline_data` scope, or broader `metrika:write`, for offline uploads. [See token management.](https://yandex.com/dev/metrika/en/data-import/manage-protocol) [See Metrica API scopes.](https://yandex.com/dev/metrika/en/intro/quick-start)

Send events here:

```text
POST https://mc.yandex.ru/collect
Content-Type: application/x-www-form-urlencoded
```

For a JavaScript goal, send this shape:

```text
tid=<tag-id>&cid=<client-id>&t=event&ea=purchase&ev=25&cu=USD&et=<unix-seconds>&ms=<measurement-token>
```

`tid`, `cid`, and `t` are required. `ea` carries the goal ID. `dl` is required when the tag accepts data only from specified addresses. `et` uses Unix seconds. The event can be at most 12 hours old. Include all active measurement tokens in `ms` when the tag has more than one. [See required fields and examples.](https://yandex.com/dev/metrika/en/data-import/measurement-upload)

Get `cid` in the browser. Carry it with the authenticated session or checkout. Do not create a random server ID.

```js
ym(<YANDEX_METRICA_TAG_ID>, 'getClientID', function (clientId) {
  // Send clientId with the session or checkout record.
});
```

[The `getClientID` method returns the Metrica client identifier.](https://yandex.com/support/metrica/en/objects/get-client-id)

If the session ended, send a `pageview` first. For events older than 12 hours, use offline upload. Do not gate an event on `yclid`; organic traffic can still match by `ClientID` or `UserID`. [Read the Measurement Protocol limits.](https://yandex.com/dev/metrika/en/data-import/measurement-about)

### Offline conversion upload

Use this path from a payment webhook or CRM job. Create a JavaScript event goal, then upload a UTF-8 CSV:

```text
POST https://api-metrika.yandex.net/management/v1/counter/{counterId}/offline_conversions/upload
Authorization: OAuth <YANDEX_METRICA_OAUTH_TOKEN>
Content-Type: multipart/form-data
```

```csv
ClientID,Target,DateTime,Price,Currency
1710232430899999999,purchase,1768511400,25,USD
```

At least one of `ClientID`, `UserID`, `yclid`, or `PurchaseId` is required. `Target` must match a JavaScript event goal. `DateTime` uses Unix seconds. `Price` is optional. `Currency` is an ISO 4217 three-letter code. [See the CSV rules.](https://yandex.com/support/metrica/en/data/offline-conversion-data)

The upload returns an upload ID. Poll `GET https://api-metrika.yandex.net/management/v1/counter/{counterId}/offline_conversions/uploading/{id}`. Inspect `source_quantity`, `line_quantity`, and `status`. `PROCESSED` and `LINKAGE_FAILURE` are documented states. [See the upload endpoint and status method.](https://yandex.com/dev/metrika/en/management/offline-conv)

### Identity and hashing

Offline conversion rows do not accept email or phone. They accept `ClientID`, `UserID`, `yclid`, or `PurchaseId`. Do not SHA-256 these IDs.

Email and phone matching belongs to the separate CRM data import path. Yandex hashes those values during CRM import and documents MD5 examples. Do not copy that CRM rule into offline conversion rows. [Read the identifier rules.](https://yandex.com/support/metrica/en/data/offline-params)

Apply the hub consent gate before loading the tag, reading `ClientID`, or dispatching an event. Yandex's documented consent pattern does not load the tag before the user agrees. A missing required secret returns `skipped` and must not throw, as defined by the hub. [Follow the consent pattern.](https://yandex.com/support/metrica/en/general/notification)

## Click ID and tracking quirks

The Yandex Direct click ID is `yclid`. It appears in the landing URL. Capture it on first landing and associate it with the user, lead, or order. `ysclid` is for Yandex Search. `ymclid` is for Yandex Market. [See the source-tag definitions.](https://yandex.com/support/metrica/en/general/source-tags)

Yandex's official capture code stores `yclid` in a first-party cookie named `yclid` for **90 days**. Persist it server-side with the conversion record. [Use the official capture example.](https://yandex.com/support/metrica/en/data/get-yclid)

The attribution window is shorter. Metrica matches an offline conversion to a `yclid` session only when the file is processed within **21 days** of that session. Upload soon after the payment or lead. [See the yclid matching rule.](https://yandex.com/support/metrica/en/data/yclid)

Metrica normally credits the converted session. A later search click can get credit instead of the earlier Direct click. Upload `yclid` when Direct-click attribution is required.

## Deduplication

Yandex does not document a client/server event deduplication field in either server path. `PurchaseId` is for ecommerce session matching. It is not a documented twin-event key.

Choose one design:

- Send a purchase from the browser **or** the server, not both.
- Use one goal for online and offline events only when the hub suppresses twins.
- Use separate `purchase_online` and `purchase_offline` goals when both signals must remain visible.

The rule that one user reaches a goal no more than once per second is a rate restriction. It is not durable deduplication. [See the goal restriction.](https://yandex.com/support/metrica/en/general/goal-js-event)

## Verification

1. **Request proof:** record the redacted HTTP result and upload ID.
2. **Metrica proof:** poll upload status. Then inspect Reports → End-to-end analytics → Offline conversions. Check `Target`, IDs, upload ID, conversion ID, and session attribution.
3. **Direct proof:** confirm the matched goal is available in the Direct strategy and conversion reports. Only matched offline conversions optimize Direct campaigns.

Offline data can take up to three hours to appear in reports. Measurement Protocol data is documented as appearing within 20 minutes. [See offline reporting delay.](https://yandex.com/support/metrica/en/data/offline-conversion-data) [See Measurement Protocol timing.](https://www.yandex.com/support/metrica/en/general/measurement-protocol)

The tag checker proves placement only. It does not prove conversion delivery. [Use the tag checker for placement checks.](https://yandex.com/support/metrica/en/general/check-counter)

## Common pitfalls

- Direct OAuth does not authorize Metrica event collection.
- The Metrica measurement token is not a Direct OAuth token.
- Test Direct API access reaches only Sandbox.
- API settings stay unavailable until the account has a campaign.
- Missing the first pageview can lose source data for the session.
- The `yclid` cookie lasts 90 days, but offline matching lasts 21 days.
- Future or local-time `DateTime` values cause matching errors.
- `Target` must exactly match a JavaScript event goal ID.
- Measurement Protocol needs a matching `ClientID` and has a 12-hour limit.
- Client and server sends can double-count because no vendor dedup field exists.
- Upload success does not prove session matching. Check status and attribution.
- Strict tag filters, the wrong tag number, blockers, or missing consent can make reports look empty.

## Security

Keep `YANDEX_DIRECT_OAUTH_TOKEN`, `YANDEX_METRICA_OAUTH_TOKEN`, and `YANDEX_METRICA_MEASUREMENT_TOKEN` in the server secret store. Never put them in client bundles, URLs, logs, CSV downloads, or pull requests. Redact `ms` from request logs.

Load the tag only from `https://mc.yandex.ru/metrika/tag.js`. Treat `ClientID`, `UserID`, and `yclid` as tracking identifiers. Limit access and retention. Send them only after the hub records valid measurement consent. Do not send raw email or phone through the offline conversion endpoint.

The hub owns canonical events, consent, event IDs, retries, absent-secret no-ops, and payment reconciliation. This skill owns Yandex goal IDs, tokens, identifiers, endpoints, and attribution rules.

## Official sources checked

- [Yandex Direct account setup](https://yandex.com/support/direct/en/quick-start/create-campaign)
- [Yandex Direct API registration](https://yandex.com/dev/direct/doc/en/concepts/register)
- [Yandex Direct API access](https://yandex.com/dev/direct/doc/en/access-request)
- [Yandex Metrica tag installation](https://yandex.com/support/metrica/en/quick-start)
- [Yandex Metrica Measurement Protocol](https://yandex.com/dev/metrika/en/data-import/measurement-about)
- [Yandex Metrica offline conversions](https://yandex.com/dev/metrika/en/management/offline-conv)
- [Yandex Metrica yclid tracking](https://yandex.com/support/metrica/en/data/yclid)
