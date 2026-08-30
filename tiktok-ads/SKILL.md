---
name: tiktok-ads
description: "Set up TikTok Ads Manager self-serve access, TikTok Pixel, and Events API 2.0 for web conversions. Use when wiring Purchase, Lead, signup, checkout, subscription, ttclid, event_id deduplication, Events Manager Test Events, or TikTok attribution windows."
---

# TikTok Ads

TikTok supports self-serve advertiser accounts, TikTok Pixel, and Events API
2.0 for web measurement. Use both Pixel and Events API for better coverage.
Use the same event name and `event_id` on both channels.

The current web event names are `Purchase` and `Lead`. TikTok maps the older
`CompletePayment` and `SubmitForm` names to them. New setups should use the
current names. See [TikTok's updated standard events guide](https://ads.tiktok.com/resources/help/article/how-to-adopt-tiktoks-updated-standard-events?lang=en).

## Account and access

TikTok provides a self-serve signup path through its [Ads Manager account
setup](https://ads.tiktok.com/resources/help/article/create-tiktok-ads-manager-account?lang=en-GB).
Create a TikTok for Business login, then provide country, industry, legal
business name, time zone, phone, currency, billing, and payment details.
TikTok reviews the account before ads can deliver. Most reviews take less than
24 hours.

These steps apply to self-serve customers. Contact the client service team or
account manager for a non-self-serve account. The legal business name must
match the business documents. [Account setup guide](https://ads.tiktok.com/resources/help/article/create-tiktok-ads-manager-account?lang=en-GB).

TikTok may require business verification when the ad account is created.
Verification status can affect the ability to post ads. Submit the acceptable
business document and certificate number in `Tools → Account setup → Verify
now`. Requirements depend on the country or region. [Business verification
guide](https://ads.tiktok.com/resources/help/article/about-business-verification?lang=en).

Create the web data source in `Tools → Events Manager → Connect Data Source →
Web`. Select Manual Setup, then select TikTok Pixel and Events API. The value
TikTok calls `Pixel Code` or `pixel_code` is the public pixel identifier.
[Pixel ID setup](https://ads.tiktok.com/resources/help/article/how-to-create-and-access-tiktok-pixel-id?lang=en).

Generate the Events API token in the pixel's `Settings` tab. An Ads Manager
Admin or Operator role can generate this token. A developer app can also use
the `Measurement → Report Pixel Event` permission. [Events API setup guide](https://ads.tiktok.com/gateway/docs/index?doc_id=1739584855420929&language=ENGLISH).

Use these adapter secret names. TikTok does not prescribe environment
variable names.

```text
TIKTOK_PIXEL_ID       public Pixel Code / pixel identifier
TIKTOK_CAPI_TOKEN     server-only Events API access token
```

## Client-side Pixel

Install the base code at the top of the document `<head>`. Load it only after
the hub's `measurement` consent gate allows measurement. The official script
loads `https://analytics.tiktok.com/i18n/pixel/events.js`, calls `ttq.load`,
and calls `ttq.page`. [Install Pixel using code](https://ads.tiktok.com/gateway/docs/index?doc_id=1701890973258754&language=ENGLISH).

```html
<script>
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(q,m){q[m]=function(){q.push([m].concat([].slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(id){var q=ttq._i[id]||[];for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(q,ttq.methods[i]);return q};
ttq.load=function(id,n){var src="https://analytics.tiktok.com/i18n/pixel/events.js";
ttq._i=ttq._i||{};ttq._i[id]=[];ttq._i[id]._u=src;ttq._t=ttq._t||{};ttq._t[id]=+new Date;
ttq._o=ttq._o||{};ttq._o[id]=n||{};var s=d.createElement("script");s.async=true;
s.src=src+"?sdkid="+id+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
ttq.load("<TIKTOK_PIXEL_ID>");ttq.page()}(window,document,"ttq");
</script>
```
Fire a standard event after the business action. A successful payment must
come from the payment confirmation or webhook state, not a button click.

```js
ttq.track("Purchase", {
  value: 25.00,
  currency: "USD",
  contents: [{ content_id: "plan_pro", quantity: 1, price: 25.00 }],
  content_type: "product"
}, { event_id: canonicalEvent.event_id });
```

TikTok documents the third argument's `event_id` as the advertiser-chosen
deduplication value. Do not fire `Purchase` on every confirmation-page reload.
[Event deduplication guide](https://ads.tiktok.com/resources/help/article/event-deduplication?lang=en).

## Events API 2.0

Send web events from the server after the hub's consent gate and after the
payment provider confirms the event. The current endpoint is:

```text
POST https://business-api.tiktok.com/open_api/v1.3/event/track/
Access-Token: $TIKTOK_CAPI_TOKEN
Content-Type: application/json
```

The top-level request needs `event_source: "web"`, the Pixel Code in
`event_source_id`, and a `data` array. Each event uses `event`, `event_time`
in Unix seconds, and the canonical `event_id` for an overlapping browser event.
Use `user`, `page`, and `properties` for matching and conversion details.
[Events API 2.0 web request](https://ads.tiktok.com/gateway/docs/index?doc_id=1771100984456193&language=ENGLISH).

```json
{
  "event_source": "web",
  "event_source_id": "<TIKTOK_PIXEL_ID>",
  "data": [{
    "event": "Purchase", "event_time": 1700000000,
    "event_id": "<canonical-event-id>",
    "user": {
      "email": ["<sha256-email>"], "phone": ["<sha256-e164-phone>"],
      "external_id": "<sha256-stable-user-id>", "ttclid": "<if-present>",
      "ttp": "<if-present>", "ip": "<browser-ip>",
      "user_agent": "<browser-user-agent>"
    },
    "page": { "url": "https://example.com/checkout/success" },
    "properties": {
      "value": 25.00, "currency": "USD", "content_type": "product",
      "contents": [{ "content_id": "plan_pro", "quantity": 1, "price": 25.00 }]
    }
  }]
}
```

TikTok requires SHA-256 for matching identifiers. Trim and lowercase email,
then hash it. Do not apply other email normalization. Normalize phone to E.164,
then hash it. Hash a stable `external_id`. Send `ip`, `user_agent`, `ttclid`,
and `ttp` without hashing. [TikTok matching parameters](https://ads.tiktok.com/gateway/docs/index?doc_id=1727541103358977&language=ENGLISH).

Apply the hub consent gate before hashing or sending identity. TikTok recommends
multiple match keys. A missing click ID must not stop a server purchase.
## Canonical event mapping

Use current names for new web data sources.

| Hub event | TikTok event | Notes |
|---|---|---|
| `page_view` | `PageView` | Sent by `ttq.page`; base code includes it. |
| `view_content` | `ViewContent` | Use `content_id` in `properties`. |
| `lead` | `Lead` | Legacy name: `SubmitForm`. |
| `signup` | `CompleteRegistration` | Account registration event. |
| `begin_checkout` | `InitiateCheckout` | Fire when checkout starts. |
| `purchase` | `Purchase` | Legacy name: `CompletePayment`. |
| `subscription_start` | `Subscribe` | Use `StartTrial` for a trial start, not a paid start. |
| `refund` | No standard web event listed | Keep it in the hub. Do not send it as `Purchase`. |

TikTok's current standard-event list includes the mapped events above. It does
not list a standard `Refund` web event. Custom events exist in Events Manager,
but this skill does not define a refund mapping. [Standard events and parameters](https://ads.tiktok.com/resources/help/article/standard-events-parameters?lang=en).

## Deduplication

Use the exact same `event_id` in the Pixel third argument and the Events API
event object. Use the same Pixel Code and literal event name as well. A payment
provider transaction ID is a good canonical ID when it is unique per event.

TikTok documents a 48-hour deduplication window and a five-minute boundary for
overlapping Pixel and Events API events. Keep twins close and never reuse one ID
for two business events. [Deduplication windows](https://ads.tiktok.com/resources/help/article/event-deduplication?lang=en).

For a legacy pixel that still sends `CompletePayment`, keep the server event
name aligned until both channels migrate to `Purchase`. TikTok auto-converts
legacy names for reporting, but deduplication still needs aligned event data.

## Click ID and first-party cookies

TikTok appends `ttclid` to an ad landing-page URL. Send it as `user.ttclid`.
It remains valid for the CTA window in Attribution Manager. Store it on first
landing in a first-party cookie or server session, then copy it into checkout
or order metadata. Keep first-touch and most-recent values when needed. [TikTok
Click ID guide](https://ads.tiktok.com/resources/help/article/tiktok-click-id?lang=en).

TikTok's first-party `ttclid` cookie lasts 13 months from the last use. The
Pixel's `_ttp` cookie also lasts 13 months from the last use. Send `_ttp` as
`user.ttp` when available. Pixel settings can disable cookie use, so do not
make `_ttp` or `ttclid` a condition for dispatch. [Cookie specifications](https://ads.tiktok.com/resources/help/article/using-cookies-with-tiktok-pixel?lang=en).

## Tracking quirks that bite

- **Attribution is configurable.** TikTok's guide gives a default of 7-day
  click-through and 1-day view-through attribution. Match Attribution Manager
  settings before comparing TikTok with analytics. [Attribution guide](https://ads.tiktok.com/business/library/TikTok_Performance_Fundamentals.pdf).
- **Reporting is delayed.** TikTok documents a 5–6 hour data delay. Use Test
  Events for immediate checks. [Ads Manager playbook](https://ads.tiktok.com/business/library/Ads_Manager_Playbook_SMB_EN.pdf).
- **Consent controls cookies.** TikTok says to disable the Pixel after opt-out.
  Apply the hub's `measurement` gate before events and `ad_user_data` gate
  before hashed identity. [Pixel opt-out guidance](https://ads.tiktok.com/gateway/docs/index?doc_id=1701890973258754&language=ENGLISH).
- **Names and sources changed.** New web setups use `Purchase` and `Lead`.
  `ClickButton` and `PlaceAnOrder` are soft-deprecated until 2027. Web uses a
  Pixel Code. App measurement uses an App ID and App Events SDK. [Name migration](https://ads.tiktok.com/resources/help/article/how-to-adopt-tiktoks-updated-standard-events?lang=en), [app setup](https://ads.tiktok.com/help/article/how-to-integrate-tiktok-app-events-sdk).
- **The old payload is different.** Do not copy `/v1.2/pixel/track/` into Events
  API 2.0. Use `/v1.3/event/track/` with `event_source`, `event_source_id`,
  and `data`.

## Verification

Use TikTok's server test flow before production. Open the pixel's `Test Events`
tab, copy the `Test Server Events` code, add it as top-level `test_event_code`,
send one `Purchase` with a unique test `event_id`, and confirm `Event Activity`.
Remove `test_event_code` before production.

The pixel detail page's `Overview` shows `Server` when server events arrive and
`Server & Browser` when both channels arrive. This is platform proof. The HTTP
response is only request proof. Reconcile production counts with successful
payment-provider charges. [Events API verification guide](https://ads.tiktok.com/gateway/docs/index?doc_id=1771100984456193&language=ENGLISH).

## Common pitfalls

- Confusing the Pixel Code, Ads Manager account ID, and access token.
- Sending `event_time` in milliseconds, or sending raw identity values.
- Hashing phone data before E.164 normalization.
- Mismatching browser and server event names or generating a new twin ID.
- Gating server events on `ttclid`, or losing it during redirects.
- Firing `Purchase` on checkout start, button click, or page reload.
- Treating a 200 response as platform proof before checking Test Events.
- Leaving `test_event_code` in production or comparing data before its delay.

## Pairing with the conversion hub

Use [`ad-conversion-hub`](../ad-conversion-hub/SKILL.md) for taxonomy, consent,
identity normalization, click-ID storage, the adapter contract, retries, and
payment reconciliation. This file owns TikTok syntax and quirks.

The adapter returns `skipped` when a required secret is absent. It returns
`failed` for a documented 4xx or 5xx response without failing the payment
webhook. Follow the hub retry policy.

## Security

Keep `TIKTOK_CAPI_TOKEN` in the deployment secret store. Never put it in a
client bundle, URL, log, screenshot, or repository. Send it only in the
server-side `Access-Token` header over HTTPS.

Keep raw identity data inside the server boundary. Hash only after consent.
Do not log hashes, click IDs, cookies, IP addresses, or user agents with event
payloads. Redact TikTok responses before storing them. Limit access to Events
Manager roles that can generate tokens.
