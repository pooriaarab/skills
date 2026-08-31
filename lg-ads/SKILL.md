---
name: lg-ads
description: "Evaluate LG Ads campaigns when you need a documented access route, partner-supplied measurement, reporting verification, or a decision about unsupported API and pixel assumptions."
---

# LG Ads

LG Ad Solutions is a connected-TV and cross-screen advertising offering. Its
public site describes LG inventory, audience data, media, and outcome
measurement, then directs advertisers to its team. See [LG Ads](https://lgads.tv/)
and [Solutions](https://lgads.tv/solutions/).

Treat LG Ads as a managed integration until LG supplies a current contract or
partner guide. The public materials checked on 2026-08-30 do not publish a
self-serve advertiser signup, a public ads API, or a public conversions API.
The real entry point is [Contact LG Ads](https://lgads.tv/contact/).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
This skill records only LG-specific facts that the vendor publishes.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

The official advertiser route is a contact request. LG says that its team can
help advertisers reach connected-TV audiences and measure cross-screen
campaign outcomes. See [Contact LG Ads](https://lgads.tv/contact/).

There is no public self-serve advertiser signup in the official pages checked
for this skill. The public [Contact](https://lgads.tv/contact/) page is the
documented access route. Do not create a guessed advertiser account, developer
account, token, or API client. Request access through LG’s team instead.

Include these questions in the request:

1. Which countries, inventory types, and buying routes are available for the
   campaign?
2. Which team or partner provisions campaign access and reporting access?
3. Does the campaign include a website beacon, app integration, or another
   measurement method?
4. Which event fields, identity fields, retention periods, and deduplication
   rules apply to this campaign?
5. Which report or dashboard proves receipt, attribution, and final results?

LG’s public site lists one-stop planning, activation, and measurement across
viewing platforms. That does not establish a public API or a self-serve buying
flow. See [LG Ads](https://lgads.tv/) and [LG’s platform announcement](https://lgads.tv/press_release/lg-ad-launches-unified-platform-for-connected-tv-media-and-measurement/).

LG also operates an [Insights Dashboard](https://insights.lgads.tv/). Its public
description advertises integrated analytics, live digital campaign performance,
and closed-loop attribution, but the page presents sign-in rather than public
advertiser registration. Use it only after LG provisions access.

## Client-side web beacon

LG Ads does not publish a public browser-tag snippet, pixel ID, tag ID, or
installation contract in the official materials checked for this skill. See
[LG Ads](https://lgads.tv/) and [Solutions](https://lgads.tv/solutions/).

The related [Alphonso privacy policy](https://alphonso.tv/privacy/smart-tvs/site-privacy/)
says that some media partners may place an Alphonso web beacon, also called a
pixel, on advertisements or websites. It says that these beacons help partners
measure ad effectiveness and website visitation. The same policy directs
advertisers to visit Alphonso’s site or email Alphonso for service access.

Therefore:

- Do not add a public LG script or invent `LG_ADS_PIXEL_ID` or
  `LG_ADS_TAG_ID` as vendor-defined settings.
- Install a beacon only when LG or its measurement partner supplies the
  current snippet, source origin, identifier, allowed pages, and consent terms
  in writing.
- Keep the snippet behind the hub’s measurement consent gate.
- Do not treat a browser request as proof that LG credited a conversion.

The [privacy policy](https://alphonso.tv/privacy/smart-tvs/site-privacy/) says
that an Alphonso beacon uses JavaScript. Load only the exact code supplied
through the approved partner route. Do not copy a snippet from a blog, an old
case study, or browser network traffic.

## Rule setup and event mapping

LG’s public pages describe outcome measurement, including web traffic and
purchase measurement, but they do not publish LG event names, rule IDs, JSON
fields, or a conversion setup API. See [LG’s ACR measurement overview](https://lgads.tv/insights/how-acr-solves-major-advertiser-challenges/).

Keep the hub event taxonomy local until LG supplies a campaign-specific
measurement contract. Do not send these names as LG event names:

| Hub event | LG Ads action before partner documentation |
|---|---|
| `page_view` | Record in first-party analytics only. |
| `view_content` | Record in first-party analytics only. |
| `lead` | Record the qualified lead in the source system. |
| `signup` | Record the account creation in the source system. |
| `begin_checkout` | Record the checkout start in the source system. |
| `purchase` | Reconcile the payment-provider charge in the source system. |
| `subscription_start` | Reconcile the active subscription in the source system. |
| `refund` | Reconcile the payment-provider refund in the source system. |

After LG supplies written field names, map only the documented events and
values at the adapter edge. Keep the canonical event names and consent rules in
[ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Server-side conversions API

LG Ads has no public conversions API contract in the official material checked
for this skill. No public LG endpoint, authentication header, token scope,
payload schema, event-name set, hashing rule, timestamp unit, retention window,
or deduplication field was published in those materials. See [LG Ads](https://lgads.tv/),
[Solutions](https://lgads.tv/solutions/), and [Contact LG Ads](https://lgads.tv/contact/).

Do not implement or probe a guessed route such as `/conversions`, `/events`, or
`/pixel`. Do not use `https://lgads.tv/` as a token-validation endpoint. A web
page response cannot prove that a conversion was accepted.

Use this managed route instead:

1. Ask LG whether the campaign has a direct measurement integration or an
   approved measurement partner.
2. Request the current endpoint, authentication method, required fields,
   allowed identifiers, response contract, retry guidance, and deduplication
   behavior in writing.
3. Confirm whether the integration supports browser events, server events, or
   reporting only.
4. Store any resulting credential in the server secret store under a
   project-chosen name. Do not represent that name as an official LG field.
5. Keep dispatch disabled until the documents identify the exact request.

LG’s own measurement material says that advertisers should contact LG to
discuss campaign goals and return-on-ad-spend measurement. See [ACR measurement](https://lgads.tv/insights/how-acr-solves-major-advertiser-challenges/).

## Identity and consent

The Alphonso privacy policy says that its service collects device data only
when a viewer agrees to participate. It also says that viewers can withdraw
that consent in the settings menu of the television where the service is
integrated. See [Smart TV privacy](https://alphonso.tv/privacy/smart-tvs/site-privacy/).

That policy says that audio signatures are associated with an IP address or
device ID, but not with a name, postal address, or email address. Do not infer
that LG Ads accepts email, phone, IP, device, or household identifiers for a
campaign without LG’s current written terms. See [Smart TV privacy](https://alphonso.tv/privacy/smart-tvs/site-privacy/).

Use the hub’s consent gate before measurement or identity processing:

- Require `measurement: true` before loading a consented client measurement
  asset or dispatching an event.
- Require `ad_user_data: true` before processing identifiers for an approved
  LG integration.
- Do not hash email or phone for LG merely because another ad platform uses
  SHA-256 matching.
- Do not upload customer lists or create lookalike audiences without a
  documented LG product, permitted field, and consent basis.

LG’s technology page describes ACR-based viewership data, content and service
targeting, purchase-habit segments, ad-exposure segments, and geographic
targeting. These are audience-product descriptions, not proof of a customer
identity API. See [LG technology](https://lgads.tv/technology/).

## Click IDs and first-party storage

LG Ads does not publish an LG-owned click parameter, cookie name, attribution
window, or click-ID retention period in the official materials checked for this
skill. See [LG Ads](https://lgads.tv/) and [Contact](https://lgads.tv/contact/).
Do not create `lg_click_id`, `lgclid`, or another guessed parameter.

Ask the LG team or measurement partner whether the approved campaign URL may
carry a campaign code or UTM values. If approved, capture the value on your
landing request and store it under the hub’s first-party click rules. Keep
first-touch and most-recent values only when the measurement design needs both.

Never require a click ID before recording a confirmed signup, purchase,
subscription, or refund in first-party systems. Do not claim that LG attributed
the event unless the LG report or partner response proves it.

## Audience and measurement boundaries

LG describes ACR as first-party technology that captures viewing behavior on
LG Smart TVs across linear television and OTT. Its technology page lists
segments based on content, devices and services, purchase habits, ad exposure,
viewing habits, and location. See [LG technology](https://lgads.tv/technology/).

LG also describes cross-device placements and measurement KPIs such as
incremental reach, frequency, share of voice, attribution, and brand lift. See
[LG solutions](https://lgads.tv/solutions/).

Treat these statements as product capabilities, not as an integration schema.
The cited pages do not supply a public upload endpoint, audience-file format,
click-ID join key, or conversion postback contract. See [LG technology](https://lgads.tv/technology/)
and [Contact](https://lgads.tv/contact/).

## Managed launch checklist

- Start with one approved market, one audience, one creative, and one outcome
  definition.
- Put the campaign ID, approved measurement method, consent basis, and report
  owner in the campaign record.
- Confirm whether a partner or LG team owns the beacon, event feed, or report.
- Define first-party success using payment, signup, or subscription truth.
- Keep the LG adapter in `skipped` state until the contract and credential are
  present.

Do not guess budget floors, bid fields, learning thresholds, placements,
currency rules, or reporting delays. Ask LG for the campaign-specific values.

## Verification

Use three proofs:

1. **Request proof:** record the approved onboarding record and any documented
   partner response. Redact credentials and identifiers.
2. **Platform proof:** use the provisioned LG Insights Dashboard or the
   partner’s documented campaign report. Confirm campaign identity, dates,
   delivery, and the agreed outcome metrics. LG describes its reporting as
   live campaign performance and closed-loop attribution in the [Insights Dashboard](https://insights.lgads.tv/).
3. **Business proof:** reconcile reported outcomes with first-party signup,
   payment, subscription, and refund records. The hub remains the source of
   business truth. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

A successful page load, beacon request, dashboard login, or partner HTTP
response does not by itself prove ad attribution. Require the platform report
or documented partner result for that claim.

If LG provides no report, test-event view, or documented response, return
`skipped` or `failed` according to the hub adapter contract. Do not label an
event as sent merely because first-party analytics recorded it.

## Common pitfalls and security

- Treating LG’s public marketing pages as API documentation.
- Treating the Insights Dashboard as a public API.
- Inventing a pixel ID, click ID, endpoint, token name, event field, or hash
  rule.
- Sending raw or hashed customer identifiers before LG documents the field and
  the hub grants consent.
- Treating ACR or television opt-in as consent for every website identifier.
- Treating a beacon request as conversion proof.
- Letting a missing LG partner integration block a successful payment webhook.

Keep credentials in the server secret store. Never place them in browser
bundles, URLs, logs, screenshots, or commits. Load vendor code only from the
official HTTPS origin or an approved partner asset. Apply the hub’s consent,
retry, dead-letter, and failure-isolation rules.

## Hub conventions

Pair this adapter with [ad-conversion-hub](../ad-conversion-hub/SKILL.md).
Keep canonical events, consent, identity normalization, click storage, retry
policy, and payment reconciliation in the hub. Keep only the documented LG
syntax in this adapter.

A missing partner contract or missing approved credential must produce a
logged `skipped` result — the adapter has no route to dispatch. A malformed
or missing required field on an otherwise-configured, enabled integration
must produce a logged `failed` result instead, per the hub adapter contract,
so a misconfigured but enabled integration cannot silently drop conversions.
Neither result may fail the checkout or payment webhook.

## Official sources checked (2026-08-30)

- [LG Ads](https://lgads.tv/) · [Contact](https://lgads.tv/contact/) · [Solutions](https://lgads.tv/solutions/)
- [Technology](https://lgads.tv/technology/) · [Insights Dashboard](https://insights.lgads.tv/)
- [ACR measurement](https://lgads.tv/insights/how-acr-solves-major-advertiser-challenges/) · [Platform announcement](https://lgads.tv/press_release/lg-ad-launches-unified-platform-for-connected-tv-media-and-measurement/)
- [Alphonso Smart TV privacy](https://alphonso.tv/privacy/smart-tvs/site-privacy/)
