---
name: vk-ads
description: "Use when setting up VK Ads website conversions, pixel events, offline goals, or rb_clickid attribution. Use when checking VK Ads access, reporting, or the limits of its public server-side measurement contract."
---

# VK Ads

VK Ads uses a website pixel and configured goals. It also accepts offline goals.
The official docs expose JavaScript events and offline tracker requests, not a
Meta-style JSON Conversions API. See [VK pixel help](https://ads.vk.com/help/articles/pixel)
and [official offline-goal docs](https://top.mail.ru/help/ru/settings/goals).
Use the documented tracker URL for server-side goals. Do not invent a JSON API.

The website pixel uses the Top.Mail.Ru counter runtime. The script loads from
`top-fwz1.mail.ru`, not from `ads.vk.com`.

## Account and access

VK Ads has a self-serve advertiser route. Sign in with VK ID at [VK Ads](https://ads.vk.com/).
Create an advertiser cabinet when VK Ads prompts you. The authorization guide is
at [VK Ads authorization help](https://ads.vk.com/help/categories/authorization).

The cabinet asks for country, currency, and legal status. These choices control
available billing and advertising features. A company account can require tax
and business details before billing or launch. Complete the email confirmation
if the cabinet requests it. See the [official VK Ads site setup guide](https://ads.vk.com/help/articles/sites).

The public developer API is separate. Create or use a VK developer application,
then obtain a user token with the `ads` permission. See [VK API access tokens](https://dev.vk.com/api/access-token/getting-started)
and [`ads.getStatistics`](https://dev.vk.com/method/ads.getStatistics).

This token is not needed for an offline goal. The offline goal uses the pixel
ID in a tracker URL. Do not place the token in a browser bundle.

Use these adapter names. VK does not define environment variable names.

```text
VK_ADS_PIXEL_ID       numeric VK Ads pixel ID; public
VK_ADS_ACCESS_TOKEN   VK API user token; server-side reporting only
```

## Client-side pixel

Create the pixel in VK Ads under **Sites** → **Add pixel**. Copy the generated
numeric ID and code from the [VK Ads pixel guide](https://ads.vk.com/help/articles/pixel).

The counter contract uses `_tmr`, `pageView`, and `reachGoal`. The [official
Top.Mail.Ru JavaScript API](https://top.mail.ru/help/ru/api/jsapi) documents
these methods and fields. VK Ads uses the same counter runtime.

```html
<script>
var _tmr = window._tmr || (window._tmr = []);
_tmr.push({id: "<VK_ADS_PIXEL_ID>", type: "pageView", start: (new Date()).getTime()});
(function (d, w, id) {
  if (d.getElementById(id)) return;
  var ts = d.createElement("script");
  ts.type = "text/javascript";
  ts.async = true;
  ts.id = id;
  ts.src = "https://top-fwz1.mail.ru/js/code.js";
  var first = d.getElementsByTagName("script")[0];
  first.parentNode.insertBefore(ts, first);
})(document, window, "tmr-code");
</script>
<noscript>
  <img src="https://top-fwz1.mail.ru/counter?id=<VK_ADS_PIXEL_ID>;js=na"
       style="position:absolute;left:-9999px" alt="Top.Mail.Ru" />
</noscript>
```

Load one copy on every website page. Load it before the first goal event. Use
the exact code from the cabinet if it differs from this example. The official
[HTTPS counter guidance](https://top.mail.ru/help/ru/code/https) requires the
current asynchronous code and the HTTPS script origin.

Send a goal after the business action succeeds:

```js
var _tmr = window._tmr || (window._tmr = []);
_tmr.push({
  id: "<VK_ADS_PIXEL_ID>",
  type: "reachGoal",
  goal: "purchase",
  value: 25
});
```

Create `purchase` as a JavaScript event in the pixel settings first. The `goal`
string must match the configured event. VK's goal guide requires goal names to
use Latin letters or digits. Use names such as `viewContent`, `lead`, and
`purchase`, not free-form translated labels. `value` is numeric and is summed
for the goal. See [official goal event syntax](https://top.mail.ru/help/ru/settings/goals).

For an SPA, send `pageView` after each route change. Pass the route URL when it
does not update normally. See [VK-compatible SPA guidance](https://top.mail.ru/help/ru/code/ajax).

## Canonical event mapping

The [ad-conversion-hub](../ad-conversion-hub/SKILL.md) owns the event envelope,
consent gate, normalization, click IDs, retry rules, and payment truth. This
adapter owns only VK's goal names and transport.

| Hub event | VK website event | VK offline goal |
|---|---|---|
| `page_view` | `pageView` | Do not send as an offline goal |
| `view_content` | configured `viewContent` goal | configured `viewContent` goal |
| `lead` | configured `lead` goal | configured `lead` goal |
| `signup` | configured `signup` goal | configured `signup` goal |
| `begin_checkout` | configured `beginCheckout` goal | configured `beginCheckout` goal |
| `purchase` | configured `purchase` goal | configured `purchase` goal |
| `subscription_start` | configured `subscriptionStart` goal | configured `subscriptionStart` goal |
| `refund` | configured `refund` goal, if needed | configured `refund` goal, if needed |

These are adapter names, not VK standard event names. Create each goal in the
VK cabinet first. VK does not define this canonical taxonomy.

## Server-side conversion: offline goal beacon

The official [Top.Mail.Ru goals documentation](https://top.mail.ru/help/ru/settings/goals)
defines an offline event as a server request. It documents this endpoint shape:

```text
GET https://top-fwz1.mail.ru/tracker?id=<PIXEL_ID>;e=RG%3A/<GOAL>;userid=<USER_ID>
```

For VK Ads attribution, use the click form when you have the click ID:

```text
GET https://top-fwz1.mail.ru/tracker?id=<PIXEL_ID>;e=RG%3A/<GOAL>;rb_clickid=<RB_CLICKID>
```

The [VK Ads site attribution guide](https://ads.vk.com/help/general/sites/site_attribution)
documents `rb_clickid` for the website path. The stable fields are:

- `id`: the numeric VK Ads pixel ID.
- `e`: `RG%3A/` followed by the configured goal name.
- `rb_clickid`: the ad click identifier, when the conversion has one.
- `userid`: an alternative site user identifier. Use the same value on the
  online visit and the offline goal.

This transport has no documented bearer header, JSON body, timestamp field,
email field, phone field, SHA-256 identity field, or request-id contract. The
pixel ID identifies the destination. A response only proves that the tracker
request was accepted. It does not prove ad attribution.

There is no documented public website `event_id` or client/server deduplication
field in the official pixel and offline-goal contract. The `rb_clickid` and
`userid` fields identify the visitor or click. They are not documented as
idempotency keys. Keep a hub dispatch record and do not send the same business
event through both transports unless the VK console and campaign design expect
two separate goals.

The hub must still use its stable canonical `event_id`. Use it for your own
dispatch log and replay guard. Do not translate it into an undocumented VK
query field. A missing access token skips reporting only; a missing pixel ID
skips both browser and offline dispatch without failing payment.

## Click ID and persistence

VK Ads uses `rb_clickid`. Capture it from the first landing URL before a
redirect, form submit, or SPA route change. Store it with the lead, account,
order, or CRM record. Keep the most recent value for last-click workflows.
Keep first-touch separately when the product needs both views.

The official VK pages identify the parameter but do not state a vendor cookie
TTL or a fixed click-ID lifetime. **UNVERIFIED:** the VK retention period; see
[VK site attribution help](https://ads.vk.com/help/general/sites/site_attribution).
Choose application retention to cover the campaign attribution window. Do not
describe that application retention as a VK guarantee. Never gate a server
purchase on `rb_clickid`; organic and direct purchases still matter.

## Tracking quirks that bite

- The cabinet goal definition controls the goal category and campaign use. A
  typo in `goal` does not repair itself. Create and spell every goal exactly.
- `value` is a summed goal value. It is not a documented currency field in the
  counter event. Keep currency in the hub and your payment ledger.
- The pixel and mobile-app tracker are different integrations. A website pixel
  does not prove app events. Add the app and mobile tracker through VK Ads. See
  [VK's app setup example](https://www.rustore.ru/help/developers/advertising-and-promotion/ads/vk-marketing).
- Post-click and post-view attribution are separate reporting views. Set the
  campaign window in VK Ads, then wait for that window before judging results.
  Do not assume a universal VK window. See [VK site attribution help](https://ads.vk.com/help/general/sites/site_attribution).
- An SPA can show one page view for many routes unless it sends route changes
  manually. The official AJAX guidance requires another `pageView` call.
- A click ID can be lost on a redirect or a cross-domain checkout. Persist it
  before navigation and copy it into the CRM record.
- Browser consent can block the pixel. Apply the hub `measurement` gate before
  loading the script. Apply `ad_user_data` before sending any user identifier.

## Verification

Use three proofs from [the hub verification contract](../ad-conversion-hub/SKILL.md):

1. Log the tracker request with the pixel ID, goal, redacted click ID, HTTP
   status, and dispatch ID. This is request proof only.
2. Read the campaign's conversion statistics through the public
   [`ads.getStatistics`](https://dev.vk.com/method/ads.getStatistics) method
   when the account exposes it. Request campaign statistics with the documented
   `account_id`, `ids_type`, `ids`, `period`, `date_from`, and `date_to` fields.
   Check `conversion_count` and `conversion_sum` in the response. This is
   platform proof only when the campaign uses the configured goal.
3. Reconcile the VK count with successful charges, signups, or qualified leads
   in the source system. A tracker HTTP success is not a counted conversion.

If the reporting API does not expose the pixel goal for the account, use the
VK Ads **Statistics** view for the same campaign and goal. The public docs do
not expose a pixel-level event history or a test-event read endpoint. Mark the
platform proof unavailable rather than claiming that the network request proves
delivery.

## Common pitfalls

- Treating `VK_ADS_ACCESS_TOKEN` as a Conversions API token. It only supports
  the public VK API path documented for the account.
- Sending a guessed JSON request to `ads.vk.com` or `api.vk.com` for a website
  conversion. VK documents the offline tracker URL instead.
- Hashing an email into `userid`. The official offline contract requires a
  stable matching site identifier. It does not document an email hash field.
- Using `fbclid`, `gclid`, or a generic `click_id`. VK's parameter is
  `rb_clickid`.
- Sending the browser event on page load for a purchase. Fire `purchase` only
  after the payment provider confirms the charge.
- Firing both `reachGoal` and the offline goal for one purchase without an
  application dedup rule. VK does not document an event-ID dedup field.
- Reporting a goal before creating it in the VK cabinet. The goal name and
  category come from the cabinet configuration.
- Counting an event before the selected post-click or post-view window closes.

## Security

Keep `VK_ADS_ACCESS_TOKEN` in the server secret store. Never put it in browser
code, URLs, logs, screenshots, or commits. Treat `rb_clickid` and `userid` as
tracking data. Restrict access and redact them in logs.

Load the pixel only from the official HTTPS origin documented by VK and
Top.Mail.Ru. Send only consented data. Keep raw identity data inside the
server boundary. Use the hub retry and failure-isolation rules. An ad dispatch
failure must not roll back a successful payment.
