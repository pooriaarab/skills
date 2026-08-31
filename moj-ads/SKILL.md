---
name: moj-ads
description: "Set up ShareChat & Moj Ads Manager, Pixel, and Event Manager integrations, or determine whether a public Moj Ads API contract exists. Use when launching a Moj campaign, measuring website or mobile conversions, or routing a blocked integration through the vendor's business channel."
---

# Moj Ads

Moj advertising is presented as part of ShareChat & Moj Ads. The vendor offers
a self-serve Ads Manager, a ShareChat Pixel, and an Event Manager for Pixel and
Conversions API integrations. The public pages checked do not publish a
callable ads-management API or a public conversion-event contract. Use the
console route and vendor-issued instructions for the implementation.
See [ShareChat Ads](https://ads.sharechat.com/ads), [self-serve terms](https://help.sharechat.com/policies/self-serve-ads/),
and [the Event Manager announcement](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

ShareChat documents a proprietary self-serve advertising platform called the
MTPL SSP or ShareChat SSP. Advertisers must register a Business Account before
using the Services. The terms also require a separate Business Account for
each advertiser. See [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/).

Use the public Ads Manager entry point:

1. Open [ShareChat Ads](https://ads.sharechat.com/ads).
2. Select **Get Started** or **Login**.
3. Create or use the Business Account in Ads Manager.
4. Choose the campaign objective, audience, budget, dates, and ad format in
   the console.

The public Ads Manager describes campaign objectives, language-based
targeting, budgets, scheduling, Display, Video, and campaign analytics. These
are console capabilities, not API fields. See [Ads Manager capabilities](https://ads.sharechat.com/ads).

For agencies, ShareChat & Moj Ads Business Centre supports multiple brands,
associates, custom roles, brand-agency linking, and centralized billing. See
[Business Centre](https://ads.sharechat.com/business-centre).

If onboarding, Pixel access, or Event Manager access is blocked, email
`adssupport@sharechat.co`. ShareChat lists that address for advertising and
campaign questions. See [ShareChat business contact](https://sharechat.com/get-in-touch).

Internal names may follow the hub convention:

```text
MOJ_ADS_PIXEL_ID   internal alias for the Pixel identifier shown by the console
MOJ_ADS_CAPI_TOKEN  server-only alias if a current vendor contract supplies a token
```

These are internal secret names. They are not documented Moj request fields.

## Client-side ShareChat Pixel

ShareChat's official conversion-tracking material describes creating a new
ShareChat Pixel, choosing an installation method, tracking event types, and
using conversion ads with a completion action. See [Pixel tracking and conversion ads](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat).

A later ShareChat & Moj product page says Event Manager supports the ShareChat
Pixel for Mobile and Websites. It does not publish the browser script, SDK
package, Pixel identifier field, function name, or event parameter schema.
See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Install the Pixel only from the current Ads Manager or Event Manager flow:

1. Create or select the Pixel in the console.
2. Copy the exact installation instructions shown for the selected surface.
3. Load the supplied code only on eligible pages or in the approved mobile
   integration.
4. Configure completion actions in the console when the UI requires them.
5. Record the Pixel identifier in `MOJ_ADS_PIXEL_ID` only after the console
   displays that identifier.

Do not paste a guessed `script` URL, SDK name, function call, event name, or
Pixel parameter into production. No such public contract was present in the
vendor pages checked.

## Rule setup and event mapping

The public FAQ has a **Pixel & Conversion Campaigns** section. The public
Pixel masterclass says that Pixel can track different event types, but its
page does not enumerate a stable external event-name schema. See [Ads FAQ](https://ads.sharechat.com/faq)
and [Pixel masterclass](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat).

Keep the hub taxonomy stable. Map an event only when the current console or a
vendor-issued integration document names the matching Moj event:

| Hub event | Moj action |
| --- | --- |
| `page_view` | Configure only if the current Pixel flow offers it. |
| `view_content` | No public Moj event-name mapping is documented. |
| `lead` | No public Moj event-name mapping is documented. |
| `signup` | No public Moj event-name mapping is documented. |
| `begin_checkout` | No public Moj event-name mapping is documented. |
| `purchase` | Configure only if the current Pixel or Event Manager flow offers it. |
| `subscription_start` | No public Moj event-name mapping is documented. |
| `refund` | Keep in the hub and payment system unless Moj documents a matching action. |

Do not rename hub events by guessing from another platform. Do not send a
purchase until the payment provider confirms the charge. The hub remains the
business ledger; Ads Manager remains an attribution and campaign view.

## Server-side conversions API

ShareChat's public product material says Event Manager can set up, monitor,
and troubleshoot integrations such as the Conversions API. That establishes a
documented product surface, but not a public API contract. See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Plainly: no public Moj or ShareChat Ads conversion endpoint, HTTP method, authentication
header, token scope, timestamp unit, payload field, response code, event-name
set, identity rule, or deduplication field is documented in the official pages
checked on 2026-08-30. No public ads-management API reference was found in the
same material. See [Ads FAQ](https://ads.sharechat.com/faq), [Ads Manager](https://ads.sharechat.com/ads),
and [the self-serve terms](https://help.sharechat.com/policies/self-serve-ads/).

Therefore, this skill intentionally supplies no endpoint or example request.
Do not probe or invent paths such as `/events` or `/conversions`. Do not invent
an `Authorization` header, token name, JSON key, event ID key, hash algorithm,
or success status.

Use the real route:

1. Open Event Manager from the current ShareChat Ads console.
2. Select the documented Pixel or Conversions API integration shown there.
3. Copy the current vendor instructions, including every field and test step.
4. Store any server credential in `MOJ_ADS_CAPI_TOKEN` only after the vendor
   supplies a current, reviewable contract.
5. Keep the adapter disabled until the contract is recorded and tested.

If Event Manager does not expose the required integration, ask
`adssupport@sharechat.co` for the current advertiser or partner route. The
vendor lists this address for advertising and campaign queries. See [business contact](https://sharechat.com/get-in-touch).

## Identity and consent

The current public terms require the advertiser to maintain a privacy policy
that complies with applicable law and to obtain required consents and waivers
when it collects personal data. Unless the parties agree otherwise in writing,
the terms say neither party will provide information that may directly or
indirectly identify an individual, including a name or email address. See
[Self-Serve Advertising Terms, privacy and data](https://help.sharechat.com/policies/self-serve-ads/).

The terms also restrict user tracking mechanisms, including cookies, tracking
pixels, fingerprinting, and scripts, to what is permitted. Sensitive data
requires the user's explicit opt-in consent. See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).

Apply the hub consent gate before Pixel or server dispatch:

- Require `measurement: true` before any ad measurement.
- Require `ad_user_data: true` before sending an identifier.
- Require `ad_personalization: true` before audience use.
- Follow the current vendor contract for any identifier format.
- Do not hash email, phone, or IP based on a platform convention.

No public Moj Ads source fetched here documents a hashing rule, accepted
identifier type, normalization rule, match key, retention period, or customer
list format. Do not invent one. See [the canonical hub identity rules](../ad-conversion-hub/SKILL.md)
for internal normalization and consent handling.

## Click ID and first-party cookie

ShareChat's Cookie Policy describes cookies, pixels, local storage, targeting,
and advertising measurement. It does not name a Moj-owned click parameter,
first-party ad cookie, click-ID lifetime, or server join key. See [Cookie Policy](https://help.sharechat.com/policies/cookie-policy/).

Do not create `moj_click_id`, `sharechat_click_id`, or another guessed query
parameter. Do not promise a click-attribution window. Do not make server
purchase dispatch depend on a click ID.

If the current campaign or vendor integration explicitly supplies a campaign
parameter, capture it only after consent permits that storage. Store it as a
first-party measurement value under the campaign's documented name. Keep the
vendor name, scope, lifetime, and join key in the adapter record.

## Deduplication

No public Moj Ads source fetched here documents browser/server deduplication or
names a deduplication field. Do not send a guessed `event_id`, `eventId`,
`transaction_id`, or equivalent to Moj.

Internally, keep one hub `event_id` for the browser and server copies. Pass it
to Moj only when the current vendor contract names the field. Record the
contract version, dispatch result, and any vendor request identifier in the
hub dispatch log. See [hub deduplication](../ad-conversion-hub/SKILL.md).

## Ads Manager settings that override code

Campaign objective, ad format, language targeting, audience settings, budget,
schedule, and campaign analytics are configured in Ads Manager. The public
Ads page lists Display and Video formats, language targeting, budgets, and
campaign performance analytics. See [Ads Manager](https://ads.sharechat.com/ads).

The self-serve terms say an order includes budget, start date, end date, and
targeting criteria. They say changes may take up to 24 hours, and reporting is
available in the ShareChat SSP. See [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/).

Treat console state as authoritative for:

the active Pixel or Event Manager connection, campaign objective, completion
action, audience, language, placement, budget, schedule, review status,
submitted creative, reporting, and delivery statistics.

Do not assume that a local adapter setting can override a disabled connection,
campaign review decision, budget, schedule, or policy restriction.

## Verification

Use Event Manager to set up, monitor, and troubleshoot the Pixel or CAPI
integration. The vendor describes Event Manager as the place for this work.
See [Event Manager](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features).

Use Ads Manager's Campaign Performance and Analytics view for campaign
reporting. ShareChat's terms also state that reporting is available in the
ShareChat SSP and that ShareChat delivery statistics are the official measure
for delivery obligations. See [Ads Manager](https://ads.sharechat.com/ads) and
[Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/).

Collect three separate proofs:

1. **Integration proof:** Event Manager shows the connection or test result.
2. **Campaign proof:** Ads Manager shows the expected campaign and delivery
   or conversion reporting.
3. **Business proof:** reconcile `purchase`, `subscription_start`, and
   `refund` with payment-provider truth in the hub.

A Pixel request or a console connection does not prove that a payment was
attributed to a campaign. Keep the adapter failure isolated from checkout.

## Common pitfalls and security

- Treating a Pixel or Event Manager UI as proof of a public API contract.
- Copying a guessed endpoint, header, parameter, event name, cookie, or token
  scope from another ad platform.
- Sending name, email, phone, IP, or hashed identifiers without the required
  consent and current vendor authorization.
- Using tracking cookies, pixels, fingerprinting, or scripts outside the
  permission granted by the current ad agreement. See [advertiser obligations](https://help.sharechat.com/policies/self-serve-ads/).
- Assuming a click ID, attribution window, deduplication field, or retention
  period that the vendor has not documented.
- Treating a campaign report as payment truth. Reconcile against the payment
  provider in the hub.
- Ignoring the current [regulated and prohibited content policy](https://ads.sharechat.com/content-policy).
  ShareChat says ads must comply with its policies and applicable law.

Keep `MOJ_ADS_CAPI_TOKEN` server-side. Never put it in browser code, URLs,
logs, screenshots, or commits. Keep Pixel installation code limited to the
vendor-supplied instructions. The hub owns secret handling, consent records,
bounded retries, and failure isolation. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Official sources checked (2026-08-30)

- [Ads Manager](https://ads.sharechat.com/ads) · [Ads FAQ](https://ads.sharechat.com/faq)
- [Pixel tracking masterclass](https://ads.sharechat.com/masterclass-hub/masterclass-pixel-tracking-and-conversion-ads-to-grow-in-bharat)
- [Event Manager announcement](https://ads.sharechat.com/master-class/unleash-the-impact-of-sharechat-and-moj-s-latest-product-features)
- [Self-Serve Advertising Terms](https://help.sharechat.com/policies/self-serve-ads/)
- [Cookie Policy](https://help.sharechat.com/policies/cookie-policy/)
- [Business Centre](https://ads.sharechat.com/business-centre) · [Business contact](https://sharechat.com/get-in-touch)
- [Ads regulated and prohibited content policy](https://ads.sharechat.com/content-policy)
