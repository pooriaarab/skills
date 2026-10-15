---
name: ads-sharechat
description: "Set up ShareChat Ads measurement with the self-serve Ads Manager and ShareChat Pixel, or evaluate the console-only route when a public Ads or Conversions API contract is unavailable."
---

# ShareChat Ads

ShareChat Ads is a self-serve advertising platform. ShareChat documents a
ShareChat Pixel and an Event Manager that supports integrations such as the
Conversions API. The public first-party pages checked here do not publish an
Ads API or Conversions API contract. Use the console and approved support route
until ShareChat supplies current integration details. See [ShareChat Ads](https://ads.sharechat.com/ads),
[ShareChat Pixel material](https://sharechat.com/news/announcements/sharechat-self-serve-ads-supports-1000-smbs-with-personalized-multilingual-advertisement),
and [Event Manager material](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

ShareChat has a self-serve Ads Manager. Its official terms require an
advertiser to register a Business Account before using the MTPL SSP to buy
inventory. The Ads Manager also exposes account signup and login. See
[Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/)
and [Ads Manager](https://ads.sharechat.com/v2/login).

Use this route:

1. Open [ShareChat Ads](https://ads.sharechat.com/ads) and select **Get Started**.
2. Create or access the Business Account in the Ads Manager.
3. Create the campaign and conversion setup in the current console.
4. Open Event Manager if the account exposes Pixel or Conversions API setup.

ShareChat says that its Business Centre supports multiple brands, associates,
custom roles, and brand-agency linking. Agencies should sign up and request a
multi-brand account through the published route. See [Business Centre](https://ads.sharechat.com/business-centre).

If the account does not expose the required measurement control, contact
ShareChat's published advertising support address: `adssupport@sharechat.co`.
See [ShareChat business contact](https://sharechat.com/get-in-touch).

ShareChat does not publish a developer application flow, OAuth scope, API
token route, or public advertiser API reference in the first-party pages
checked for this skill. See [ShareChat Ads](https://ads.sharechat.com/ads) and
[Ads FAQ](https://ads.sharechat.com/faq). Do not create credentials or scopes
from convention. Ask ShareChat for the current, account-specific integration
guide.

## Client-side ShareChat Pixel

ShareChat's official Pixel material says that advertisers can create a Pixel,
choose an installation method, track different event types, define a
completion action, and use conversion ads. See [Pixel tracking and conversion ads](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat).

ShareChat also says that the Pixel analyzes event listings and pageviews across
web pages. It says completed website conversions can appear in the ShareChat
Ads Manager and can support dynamic campaign targeting. See [ShareChat's Pixel announcement](https://sharechat.com/news/announcements/sharechat-self-serve-ads-supports-1000-smbs-with-personalized-multilingual-advertisement).

Install the current Pixel code from the authenticated Ads Manager or the
current ShareChat implementation guide. Do not paste a remembered snippet,
script URL, function name, public ID name, or event parameter into production.
The public guide page fetched here links to a separate implementation article,
but the fetched page does not publish the code contract. See [ShareChat's implementation guide](https://ads.sharechat.com/sharechat-events/masterclass-how-to-implement-sharechat-pixel).

Gate the Pixel behind the hub's consent decision. Load it only on eligible
pages. Fire an event only after the corresponding first-party action occurs.
Keep payment truth in the payment system.

Do not add `SHARECHAT_ADS_PIXEL_ID` or `SHARECHAT_ADS_TAG_ID` as if either were
an official configuration name. Use the exact field name that the current
console supplies, and keep that value separate from any server credential.

## Rule setup and event mapping

ShareChat's public Pixel material confirms event tracking and a completion
action, but it does not publish a stable event-name list or a public schema.
See [Pixel tracking and conversion ads](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat).

Keep the hub taxonomy stable. Configure the ShareChat mapping in the console
or in a private, current vendor guide supplied for the account. Do not infer
that a hub name is a ShareChat event name.

| Hub event | ShareChat action |
| --- | --- |
| `page_view` | Record in the hub. Use a ShareChat Pixel action only when the current console defines one. |
| `view_content` | Record in the hub. Map it only to a console-defined ShareChat action. |
| `lead` | Record the submitted lead in the first-party system. Configure ShareChat only through its current console flow. |
| `signup` | Record the completed signup in the first-party system. Configure ShareChat only through its current console flow. |
| `begin_checkout` | Record checkout start in the first-party system. Do not invent a ShareChat event name. |
| `purchase` | Reconcile with a succeeded payment, then use the current ShareChat completion setup if available. |
| `subscription_start` | Reconcile with subscription truth, then use the current ShareChat completion setup if available. |
| `refund` | Reconcile in the payment system. Do not send a guessed ShareChat refund event. |

The table uses hub event names. It does not assert that ShareChat accepts those
names. The platform-specific event name, value fields, and completion settings
must come from the current Ads Manager or an account-specific ShareChat guide.

## Server-side Conversions API

ShareChat's official Event Manager material names the Conversions API and
ShareChat Pixel for mobile and websites. It says Event Manager can set up,
monitor, and troubleshoot those integrations. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

No public ShareChat Ads Conversions API contract is documented in the
first-party sources checked for this skill. See [Ads FAQ](https://ads.sharechat.com/faq)
and [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).
Those pages do not publish a
verified endpoint, HTTP method, authentication header, token scope, request
field, response schema, timestamp unit, hashing rule, or deduplication field.
The official Ads pages expose the Ads Manager, Pixel, Event Manager, and
campaign reporting surfaces instead. See [ShareChat Ads](https://ads.sharechat.com/ads),
[Ads FAQ](https://ads.sharechat.com/faq), and [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Therefore this adapter has no server dispatch implementation. Do not post to a
guessed `/events`, `/conversions`, or similar path. Do not guess a bearer
header, token name, JSON field, timestamp, or response code.

Use the real route:

1. Open Event Manager in the authenticated Ads Manager.
2. Follow the current setup flow if the account exposes Conversions API.
3. Record the exact vendor instructions in the integration change record.
4. If the control is absent, ask `adssupport@sharechat.co` for the current
   advertiser integration guide. See [ShareChat business contact](https://sharechat.com/get-in-touch).

Keep the adapter disabled until the supplied contract identifies the endpoint,
authentication, fields, consent requirements, retry behavior, and deduplication
behavior. A partner-only or account-only API is not a public API contract.

## Identity and consent

ShareChat's advertising terms require the advertiser to maintain a privacy
policy and obtain necessary consents and waivers when it collects personal
data. Unless the parties agree otherwise in writing, the terms say that the
parties will not provide information that directly or indirectly identifies an
individual, including a name or email address. See [privacy and data terms](https://help.sharechat.com/policies/self-serve-ads/).

The terms also require explicit opt-in consent for sensitive data. They limit
cookies, pixels, fingerprinting, scripts, and related tracking to what is
permitted. They require written authorization for collecting or using ad-user
data for segmenting or retargeting. See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).

Apply the hub consent gate before loading the Pixel or using any future server
integration. Do not send email, phone, IP address, device ID, or an external
customer ID to ShareChat until the current ShareChat contract states that the
field is accepted and the consent decision permits it.

ShareChat does not publish a public Conversions API hashing rule in the sources
checked here. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).
Do not claim SHA-256, lowercase normalization, double-hash behavior, or any
other identifier transform for ShareChat.

## Click ID and first-party cookie

ShareChat's public terms refer to Click/View Data, but they do not publish a
ShareChat-owned landing-page parameter, click-ID name, cookie name, attribution
window, or retention period for advertisers. See [privacy and data terms](https://help.sharechat.com/policies/self-serve-ads/)
and [ShareChat Cookie Policy](https://help.sharechat.com/policies/cookie-policy/).

The Cookie Policy describes session and persistent cookies and pixel tags. It
does not identify an Ads click parameter or define a ShareChat Ads conversion
join key. See [ShareChat Cookie Policy](https://help.sharechat.com/policies/cookie-policy/).

Do not create `sharechat_click_id`, `sc_click_id`, `sharechat_fat_id`, or any
other guessed parameter. Do not promise a click lifetime or attribution window.

If the current campaign guide approves UTM values or a first-party campaign
code, capture only that approved value on your own landing page. Store it under
your own first-party measurement rules and label it as your campaign value,
not as a ShareChat-owned identifier. The terms require tracking mechanisms and
retargeting data use to remain within the permitted or written-approved scope.
See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).

## Deduplication

No public ShareChat Ads deduplication field or browser/server reconciliation
rule is documented in the sources checked for this skill. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features)
and [Ads FAQ](https://ads.sharechat.com/faq). Do not send
`event_id`, `eventId`, `transaction_id`, or another guessed field to ShareChat.

Generate the hub's stable event ID for first-party measurement. Keep it in the
internal dispatch record. Send it to ShareChat only if the current vendor
contract names that field and defines its behavior.

Prevent duplicate first-party events in application code. Treat a browser
Pixel event and a future server event as separate until ShareChat documents a
shared deduplication contract.

## Ads Manager and Event Manager settings that override code

ShareChat says that campaign orders include budget, dates, and targeting
criteria. It says changes may take up to 24 hours to take effect. See [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/).

ShareChat says that reporting and billing use the delivery statistics available
within the MTPL SSP. It also says that ShareChat may offer automated
optimization choices and may alter placement, size, positioning, targeting,
or associated keywords. See [delivery and reporting terms](https://help.sharechat.com/policies/self-serve-ads/).

Event Manager is the platform's published surface for setting up, monitoring,
and troubleshooting the Conversions API and ShareChat Pixel integrations. Do
not assume that a local tag setting overrides an Event Manager setting. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Before launch, record the console values for:

- Pixel status and the exact site or app placement.
- Completion action and the exact event name shown by the console.
- Conversions API status, if the account exposes it.
- Campaign objective, budget, dates, targeting, and optimization choices.
- Reporting time zone and the account used for reconciliation.

The last five fields are launch-record recommendations. ShareChat does not
publish a stable public settings schema for them in the [Ads FAQ](https://ads.sharechat.com/faq)
or [Event Manager material](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

## Verification

Use three proofs:

1. **Browser proof:** confirm that the consented Pixel request and the intended
   completion action appear in the current Event Manager view. ShareChat says
   Event Manager can monitor and troubleshoot Pixel integrations. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).
2. **Platform proof:** confirm that the completed website conversion appears in
   the ShareChat Ads Manager. ShareChat describes that reporting path for
   ShareChat Pixel conversions. See [ShareChat's Pixel announcement](https://sharechat.com/news/announcements/sharechat-self-serve-ads-supports-1000-smbs-with-personalized-multilingual-advertisement).
3. **Business proof:** reconcile first-party hub events with succeeded charges,
   subscription state, leads, and refunds. Compare campaign delivery with the
   official reporting available in the MTPL SSP. See [delivery and reporting terms](https://help.sharechat.com/policies/self-serve-ads/).

There is no public HTTP response that proves a ShareChat server conversion
landed because ShareChat publishes no public server conversion contract in the
sources checked here. See [Ads FAQ](https://ads.sharechat.com/faq) and [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).
A successful browser request or Ads Manager display does not prove a payment.
Keep payment-provider truth separate from ad reporting.

## Common pitfalls and security

- Treating Event Manager's mention of Conversions API as permission to invent a
  public endpoint.
- Treating a private account guide as a stable public schema.
- Inventing a Pixel ID, token, event name, click ID, cookie, hash rule, or
  deduplication field.
- Sending a raw or hashed customer identifier without a documented field and
  permitted consent.
- Using ShareChat Click/View Data for retargeting or segmentation without the
  written authorization required by the advertising terms. See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).
- Treating Ads Manager conversion reporting as payment-provider truth.
- Assuming campaign edits take effect immediately. ShareChat says they may take
  up to 24 hours. See [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/).
- Assuming a missing Pixel or CAPI integration should block checkout. The hub
  adapter should return a logged `skipped` result when no approved route exists.

Keep any ShareChat credential supplied through the console or a partner in the
server secret store. Never place it in browser code, a URL, a log, screenshot,
or commit. Redact vendor data and credentials from support tickets and test
captures.

Load only the current vendor code from an official HTTPS source. Review the
consent decision before each ad-user data dispatch. ShareChat's terms prohibit
malware, deceptive material, and unauthorized tracking mechanisms. See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).

## Official sources checked (2026-08-30)

- [ShareChat Ads](https://ads.sharechat.com/ads) · [Ads Manager](https://ads.sharechat.com/v2/login) · [Ads FAQ](https://ads.sharechat.com/faq)
- [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/) · [Business Centre](https://ads.sharechat.com/business-centre)
- [Pixel tracking and conversion ads](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat) · [Pixel implementation guide](https://ads.sharechat.com/sharechat-events/masterclass-how-to-implement-sharechat-pixel)
- [ShareChat Pixel announcement](https://sharechat.com/news/announcements/sharechat-self-serve-ads-supports-1000-smbs-with-personalized-multilingual-advertisement)
- [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features) · [Cookie Policy](https://help.sharechat.com/policies/cookie-policy/)
- [ShareChat business contact](https://sharechat.com/get-in-touch)
