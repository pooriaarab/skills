---
name: taboola-ads
description: "Set up Taboola Realize with the Taboola Pixel, event or URL conversions, manual S2S postbacks or bulk conversions, Taboola Click ID capture, Backstage OAuth reporting, and pixel audiences. Use when integrating Taboola Ads, debugging missing conversions, checking user matching, or launching a small paid test."
---

# Taboola Ads

Taboola Realize supports two documented conversion paths: the Taboola Pixel and
server-to-server (S2S) tracking. Use both when the funnel permits it. See the
[tracking overview](https://developers.taboola.com/pixel/docs/conversion-tracking-overview).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.

## Account and access

Apply for an advertiser account through Taboola's account form. Backstage API
credentials come from a Taboola Account Manager or the documented support route.
See [Backstage API welcome](https://developers.taboola.com/backstage-api/reference/welcome).
The Backstage API manages campaigns, reports, and automation. Its documented
OAuth API is not the S2S conversion endpoint. Keep those integrations separate.
See [Backstage API scope](https://developers.taboola.com/backstage-api/reference/welcome)
and [conversion tracking](https://developers.taboola.com/pixel/docs/conversion-tracking-overview).
Taboola defines no environment-variable names. The hub convention may map these
as `TABOOLA_ACCOUNT_ID`, `TABOOLA_CLIENT_ID`, `TABOOLA_CLIENT_SECRET`, and
`TABOOLA_ACCESS_TOKEN`. See [authentication basics](https://developers.taboola.com/backstage-api/reference/authentication-basics).
Backstage uses the Client Credentials flow at
`https://backstage.taboola.com/backstage/oauth/token`. Send form-encoded
`client_id`, `client_secret`, and `grant_type=client_credentials`.
See [Client Credentials flow](https://developers.taboola.com/backstage-api/reference/client-credentials-flow).

The response includes a bearer access token with `expires_in: 43200` and no
refresh token. The token endpoint must not have a trailing slash.
See [token response and notes](https://developers.taboola.com/backstage-api/reference/client-credentials-flow).
Use the bearer token in the `Authorization` header for Backstage requests.
Taboola's sample request also uses `Content-Type: application/json`.
See [authentication basics](https://developers.taboola.com/backstage-api/reference/authentication-basics).

## Client-side Taboola Pixel

Install the base pixel in the `<head>` of every relevant page. Replace every
`<account_id>` placeholder with the numeric Taboola Account ID.
See [manual base-pixel installation](https://developers.taboola.com/pixel/docs/add-the-base-pixel-manually).

```html
<!-- Taboola Pixel Code -->
<script type="text/javascript">
  window._tfa = window._tfa || [];
  window._tfa.push({notify: "event", name: "page_view", id: <account_id>});
  !function (t, f, a, x) {
    if (!document.getElementById(x)) {
      t.async = 1;
      t.src = a;
      t.id = x;
      f.parentNode.insertBefore(t, f);
    }
  }(document.createElement("script"), document.getElementsByTagName("script")[0],
    "//cdn.taboola.com/libtrc/unip/<account_id>/tfa.js", "tb_tfa_script");
</script>
<!-- End of Taboola Pixel Code -->
```

Taboola recommends Google Tag Manager or a Shopify app for base-pixel setup.
Manual installation requires custom development.
See [pixel installation options](https://developers.taboola.com/pixel/docs/conversion-tracking-overview).
Create event-based conversions in Realize, then use the generated event code.
The base pixel must already exist, or Taboola will not record the event.
See [defining conversions](https://developers.taboola.com/pixel/docs/defining-conversions)
and [event pixels](https://developers.taboola.com/pixel/docs/event-pixels).
URL-based conversions need only the base pixel. Event-based conversions need
an event pixel or the corresponding generated event code.
See [event-pixel requirements](https://developers.taboola.com/pixel/docs/event-pixels).

## Rule setup and event mapping

In Realize, select **Tracking → Conversions → + New Conversion**. Choose a URL
or event conversion, assign a mandatory category, and choose a descriptive name.
See [conversion rules](https://developers.taboola.com/pixel/docs/defining-conversions).
Use these adapter event names unless the campaign has an established naming
scheme. They are local choices, not Taboola-reserved event names.

| Hub event | Realize Event Name | Dispatch condition |
| --- | --- | --- |
| `page_view` | `page_view` | Base pixel page load |
| `view_content` | `view_content` | Meaningful content or plan view |
| `lead` | `lead` | Confirmed lead submission |
| `signup` | `signup` | Completed account registration |
| `begin_checkout` | `begin_checkout` | Checkout begins |
| `purchase` | `purchase` | Payment provider confirms the charge |
| `subscription_start` | `subscription_start` | Paid subscription activates |
| `refund` | No default dispatch | Reconcile in payment truth |
Taboola allows a unique descriptive Event Name, and the name sent by S2S must
match that field exactly. The Conversion Name is only descriptive.
See [manual S2S rule setup](https://developers.taboola.com/pixel/docs/s2s-manual-integration).

Create a distinct event-based rule for each event you measure. Keep the hub's
canonical `event_id` internally; the documented S2S contract does not define it.
See [S2S fields](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).

## Server-side conversions API

Taboola's documented direct server surface is manual S2S tracking, not a named
Conversions API. It supports one conversion per postback URL or batches through a bulk endpoint.
See [manual S2S integration](https://developers.taboola.com/pixel/docs/s2s-manual-integration).
For one event, send a request to the documented postback URL. The required
parameters are the case-sensitive Taboola Click ID and exact Event Name.

```text
https://trc.taboola.com/actions-handler/log/3/s2s-action?click-id=CLICK_ID&name=EVENT_NAME
```

Optional parameters are `revenue`, `currency`, `quantity`, and `orderid`.
The postback uses a three-letter currency code, and the account default applies
when `currency` is omitted.
See [S2S postback parameters](https://developers.taboola.com/pixel/docs/the-postback-url).
The bulk endpoint is:

```http
POST https://trc.taboola.com/{account-id}/log/3/bulk-s2s-action
Content-Type: application/json
```

Its body contains one `actions` array. Each action requires `click-id`,
`timestamp`, and `name`; `timestamp` is milliseconds since Unix Epoch.
Optional fields are `revenue`, `currency`, `quantity`, and `orderid`.
See [bulk S2S fields](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).
Limit each bulk request to 1,000 conversions. The endpoint passes no
authentication and returns `204 No Content` with an empty body.
That response means receipt and asynchronous processing, not valid data.
See [bulk limits and response](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).
Dispatch after confirmation and use the hub's retry policy. Do not treat `204`
as attribution. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Identity and consent

For Taboola First Party Data, submit hashed Email IDs or demographic data.
Demographic data requires user consent, and Taboola says not to submit any
First Party Data when age is under 18.
See [Submitting First Party Data](https://developers.taboola.com/pixel/docs/submitting-first-party-data).

Lowercase email before hashing with SHA-256. Use the resulting hash in the
pixel's `unified_id` parameter; do not send raw email in that field.
See [Taboola hashing guidance](https://developers.taboola.com/pixel/docs/submitting-first-party-data).

The S2S contract defines no identity fields. Require hub measurement consent
before pixel or identity dispatch. See [S2S fields](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions)
and [the hub contract](../ad-conversion-hub/SKILL.md).

## Click ID and first-party cookie

Taboola automatically appends `tblci={click_id}` to ad URLs by default.
The Click ID is case-sensitive and must pass through without truncation or
corruption. See [manual Click ID handling](https://developers.taboola.com/pixel/docs/s2s-manual-integration).

Capture `tblci` on the landing request. Store it in a cookie, local storage, or
similar first-party mechanism, then carry it into the CRM or server event.
See [CRM S2S tracking](https://developers.taboola.com/pixel/docs/s2s-track-crm-conversions).

If the landing system cannot accept `tblci`, configure a custom URL parameter
whose value remains exactly `{click_id}`. The server request still uses
`click-id`, with the hyphen.
See [custom Click ID parameters](https://developers.taboola.com/pixel/docs/s2s-manual-integration).

The cited [Click ID docs](https://developers.taboola.com/pixel/docs/s2s-manual-integration)
define no Taboola cookie name or Click ID retention period. Use hub policy instead.

S2S requires `click-id`. If no Click ID exists, keep the first-party event in
the hub and do not send an invalid Taboola S2S request.
See [postback required parameters](https://developers.taboola.com/pixel/docs/the-postback-url).

## Deduplication

Taboola deduplicates within the same Click ID context. With dual-method
tracking, Taboola keeps the S2S event when the same event arrives through S2S
and Pixel. Same-channel duplicates use heuristic deduplication.
See [conversion deduplication](https://developers.taboola.com/pixel/docs/conversion-dedup).

The documented example deduplicates a repeated S2S event within one minute when
Click ID, Event Name, and Order ID match. See [deduplication examples](https://developers.taboola.com/pixel/docs/conversion-dedup).

Use the same Click ID and Event Name across dispatches. Send `orderid` for
purchase events when an order identifier exists. See [deduplication](https://developers.taboola.com/pixel/docs/conversion-dedup)
and [postback fields](https://developers.taboola.com/pixel/docs/the-postback-url).

## Realize settings that override code

The Realize conversion rule controls the Event Name, category, fixed value,
click-through window, view-through window, and inclusion in total conversions.
See [S2S rule settings](https://developers.taboola.com/pixel/docs/s2s-manual-integration).

The documented click-through window ranges from 1–30 days, with a 30-day
default. The view-through window ranges from 1–24 hours, with a 24-hour default.
See [conversion-window settings](https://developers.taboola.com/pixel/docs/defining-conversions).

Include important conversions in total conversions when the campaign should
optimize toward them. Include total value when needed for default reporting.
See [conversion reporting settings](https://developers.taboola.com/pixel/docs/defining-conversions).

Create URL-based rules only when a page visit is the intended conversion.
Create event-based rules for actions such as lead submission or purchase.
See [conversion types](https://developers.taboola.com/pixel/docs/defining-conversions).

## Verification

Use Realize **Tracking → Conversions → Test Events**. Enter the ad URL exactly,
including tracking parameters, then generate the QR code or desktop test link.
See [Testing Tool](https://developers.taboola.com/pixel/docs/testing-tool).

Disable ad blockers during testing. Test on mobile and desktop, and use a
browser that supports third-party cookies for the most accurate matching test.
See [Testing Tool guidelines](https://developers.taboola.com/pixel/docs/testing-tool).

Move through the funnel and inspect the `Events Received` pane. Expand events
with error icons, and check `User Matching` for Taboola Click ID and Cookie ID.
See [Testing Tool event details](https://developers.taboola.com/pixel/docs/testing-tool).

For S2S, use the server-event test flow and include the test Click ID from the
generated URL. Check the conversion rule's Status, Last Received, and Events
Received columns. Allow up to 20 minutes for the conversion to appear.
See [S2S verification](https://developers.taboola.com/pixel/docs/verify-your-s2s-conversion-tracking)
and [alternative S2S verification](https://developers.taboola.com/pixel/docs/s2s-verification-alternative-method).

Use the Backstage Campaign Summary Report at
`/reports/campaign-summary/dimensions/{dimension_id}`. Add
`include_multi_conversions=true` for supported conversion columns.
See [standard reports](https://developers.taboola.com/backstage-api/docs/reporting-overview).

Treat receipt as ingestion proof only. Reconcile purchases and refunds with
payment-provider truth before comparing Realize attribution. See [bulk response](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).

## Common pitfalls and security

- Do not use Backstage campaigns as a conversion endpoint. Use [S2S postback or bulk](https://developers.taboola.com/pixel/docs/conversion-tracking-overview).
- Do not send `tblci` to S2S. The S2S parameter is `click-id`; see [S2S integration](https://developers.taboola.com/pixel/docs/s2s-manual-integration).
- Do not change Event Name casing or spelling without updating every dispatch. See [rule setup](https://developers.taboola.com/pixel/docs/s2s-manual-integration).
- Do not use Conversion Name for S2S matching. Taboola uses Event Name; see [postback fields](https://developers.taboola.com/pixel/docs/the-postback-url).
- Do not fire event code before the base pixel exists. See [conversion definitions](https://developers.taboola.com/pixel/docs/defining-conversions).
- Do not retry bulk requests as if `204` proved every record was valid. See [bulk response](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).
- Do not send raw email or demographic data without the hub consent decision. See [First Party Data](https://developers.taboola.com/pixel/docs/submitting-first-party-data).
- Do not invent `event_id` or extra S2S fields. See [S2S fields](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions).
- Keep `client_secret` and Backstage tokens server-side. Taboola calls the
  client secret confidential; see [authentication](https://developers.taboola.com/backstage-api/reference/authentication-basics).
- Keep the adapter non-blocking for checkout. A vendor failure must not fail the
  payment webhook. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

Taboola supports pixel and CRM Custom Audiences, plus Lookalike Audiences.
See [audience targeting](https://developers.taboola.com/backstage-api/docs/audience-targeting).

## Official sources checked (2026-08-29)

- [Tracking overview](https://developers.taboola.com/pixel/docs/conversion-tracking-overview)
- [Manual base pixel](https://developers.taboola.com/pixel/docs/add-the-base-pixel-manually) · [Event pixels](https://developers.taboola.com/pixel/docs/event-pixels) · [Defining conversions](https://developers.taboola.com/pixel/docs/defining-conversions)
- [Manual S2S integration](https://developers.taboola.com/pixel/docs/s2s-manual-integration) · [Postback URL](https://developers.taboola.com/pixel/docs/the-postback-url) · [Bulk S2S](https://developers.taboola.com/pixel/docs/bulk-submit-s2s-conversions)
- [CRM S2S](https://developers.taboola.com/pixel/docs/s2s-track-crm-conversions) · [Click ID verification](https://developers.taboola.com/pixel/docs/verify-your-s2s-conversion-tracking) · [Alternative S2S verification](https://developers.taboola.com/pixel/docs/s2s-verification-alternative-method)
- [Deduplication](https://developers.taboola.com/pixel/docs/conversion-dedup) · [First Party Data](https://developers.taboola.com/pixel/docs/submitting-first-party-data) · [Dynamic values](https://developers.taboola.com/pixel/docs/track-dynamic-conversion-values)
- [Testing Tool](https://developers.taboola.com/pixel/docs/testing-tool) · [URL parameters](https://developers.taboola.com/pixel/docs/url-params-for-tracking)
- [Backstage welcome](https://developers.taboola.com/backstage-api/reference/welcome) · [Authentication](https://developers.taboola.com/backstage-api/reference/authentication-basics) · [Client Credentials](https://developers.taboola.com/backstage-api/reference/client-credentials-flow)
- [Standard reports](https://developers.taboola.com/backstage-api/docs/reporting-overview) · [Audience targeting](https://developers.taboola.com/backstage-api/docs/audience-targeting) · [Lookalike audience object](https://developers.taboola.com/backstage-api/docs/lookalike-audience-object)
