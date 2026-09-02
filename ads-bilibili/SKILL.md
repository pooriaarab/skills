---
name: ads-bilibili
description: "Set up Bilibili advertising through qualification review, official marketing consultation, or 花火 brand and agency workflows. Use when checking Bilibili Ads signup, performance landing pages, pixel or conversions API availability, click attribution, or campaign reporting."
---

# Bilibili Ads

Bilibili exposes separate commercial routes for advertising and creator
cooperation. Its marketing site offers brand, performance, content, and UP主
cooperation, with a consultation form for advertisers. See [Bilibili marketing](https://e.bilibili.com/?navhide=1).

花火 documents self-service brand and agency registration, qualification
review, and commercial orders. The public Open Platform documents developer
capabilities, but it does not publish an Ads conversion-ingestion surface. See [花火 onboarding](https://www.bilibili.com/blackboard/activity-KdgoH1DKVh.html)
and [Open Platform documentation](https://open.bilibili.com/doc).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
This skill records only Bilibili-specific facts and safe boundaries.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

For general Bilibili advertising, use the official marketing consultation
route. The form requests a company name, contact name, phone number, industry,
and cooperation needs. See [Bilibili marketing](https://e.bilibili.com/?navhide=1).

Bilibili's advertising rules distinguish direct advertisers from authorized
agents. The rules require account qualifications, industry qualifications, and
domain evidence for accounts that need advertising services. See [advertising account rules](https://www.bilibili.com/blackboard/activity-0vTMq57oP1.html).

For 花火, choose the official brand or agency login and registration route.
The onboarding guide requires enterprise and industry qualification review.
It asks for company details, business-license information, and industry
materials. See [花火 onboarding](https://www.bilibili.com/blackboard/activity-KdgoH1DKVh.html).

The same guide says qualification review can take one to two working days.
After approval, a brand or agency can proceed with the platform's commercial
order flow. See [花火 onboarding](https://www.bilibili.com/blackboard/activity-KdgoH1DKVh.html).

Bilibili also publishes a partner route. Its partner page lists core,
industry-authorized, and advertising-cooperation agencies. See [marketing partners](https://e.bilibili.com/main/collaborator).

Do not promise access, spend approval, or measurement access before the
commercial route confirms the product, entity, region, and account status.

## Client-side measurement

Bilibili's public product page describes performance landing pages and
conversion components. It does not publish a browser pixel, pixel ID, or
installation snippet on that page. See [marketing products](https://e.bilibili.com/product.html).

The public Open Platform index lists account authorization, user management,
video management, data access, column management, live capabilities, client
SDKs, and Webhooks. It does not list an Ads pixel or advertiser conversion tag.
See [Open Platform documentation](https://open.bilibili.com/doc).

Therefore, this skill defines no Bilibili browser asset. Do not install a
guessed script, SDK, pixel, tag ID, or browser event call.

Measure the destination site with the hub's consented first-party events.
A local site event does not prove Bilibili ad attribution.

If Bilibili supplies a current measurement asset, record its exact product
name, source, consent rules, fields, and version in the campaign record.
Keep that contract-specific implementation inside this adapter.

## Rule setup and event mapping

Bilibili's product page lists lead collection, ecommerce conversion, game
distribution, and app downloads as advertising goals. It also describes
landing pages and conversion components. See [marketing products](https://e.bilibili.com/product.html).

The public vendor pages fetched here do not define a Bilibili Ads event-name
schema. See [Open Platform documentation](https://open.bilibili.com/doc) and [marketing products](https://e.bilibili.com/product.html).
Use this table for local measurement only:

| Hub event | Local action |
| --- | --- |
| `page_view` | Measure the destination page locally. |
| `view_content` | Measure a product or offer view locally. |
| `lead` | Store the submitted lead in your system. |
| `signup` | Store the completed registration locally. |
| `begin_checkout` | Store checkout initiation locally. |
| `purchase` | Reconcile with payment-provider truth. |
| `subscription_start` | Reconcile with subscription truth. |
| `refund` | Reconcile with payment-provider truth. |

Do not send these hub names to Bilibili as platform event names. Use only
field names that the active Bilibili product or partner documentation defines.

## Server-side conversions API

Bilibili does not publish a public Ads conversions API in the first-party
documentation checked here. The public Open Platform index lists developer
APIs and Webhooks, but no advertiser conversion-ingestion API. See [Open Platform documentation](https://open.bilibili.com/doc).

This skill therefore defines no Bilibili Ads endpoint, method, URL, header,
token scope, timestamp unit, payload field, hashing rule, response code, or
deduplication parameter. See [marketing products](https://e.bilibili.com/product.html)
and [Open Platform documentation](https://open.bilibili.com/doc).

Do not probe or implement guessed Ads paths. Do not send a hub event to the
public Open Platform API.

Use the official marketing, account, or agency route for campaign activation.
If that route provides private integration documentation, preserve its exact
endpoint, authentication, fields, identity rules, retention, and replay rules.
Do not generalize those private terms to another Bilibili product.

Until a documented route exists, keep the Bilibili server adapter disabled.
Return a logged `skipped` result from the hub. Do not fail a payment webhook.

## Identity and consent

Bilibili's privacy policy says advertising clients may receive de-identified
device information, group tags, and advertising-placement data for advertising
placement and performance analysis. See [Bilibili Privacy Policy](https://www.bilibili.com/blackboard/privacy-h5-english.html).

The Open Platform developer agreement says users must not use Bilibili user or
operational data for promotion, marketing, or advertising without written
consent. It also requires security measures and purpose-limited processing.
See [developer service agreement](https://open.bilibili.com/agreement/developer-service).

No public Ads documentation fetched here defines email hashing, phone hashing,
IP forwarding, customer-list fields, or advertiser identity matching. See [Open Platform documentation](https://open.bilibili.com/doc)
and [marketing products](https://e.bilibili.com/product.html).

Do not send customer identifiers to Bilibili based on another platform's
conventions. Keep normalization, consent, minimization, retention, and
deletion in the hub.

Keep any partner-specific identity rule in the current written agreement.
Require the agreement to state the permitted identifier, purpose, and scope.

## Click ID and first-party cookie

The public Bilibili Ads pages fetched here do not document a Bilibili click
parameter, click-cookie name, click lifetime, attribution window, or landing
page join key. See [marketing products](https://e.bilibili.com/product.html)
and [Open Platform documentation](https://open.bilibili.com/doc).

Do not invent a Bilibili query parameter, cookie name, or fixed attribution
window. Do not name a local value as Bilibili attribution without written
product documentation.

Ask the commercial contact or agency whether the campaign supplies an approved
destination value or reporting join key. Record the exact answer with the
campaign order before implementation.

If the contract approves a campaign value, capture it on the destination
request and pass it through the hub's click-context fields. Do not require it
before recording a first-party conversion.

## Deduplication

The public Bilibili Ads pages fetched here do not document browser/server
deduplication or event-ID reconciliation. See [Open Platform documentation](https://open.bilibili.com/doc)
and [marketing products](https://e.bilibili.com/product.html).

Do not send a guessed event field or request header to Bilibili. Use the hub's
canonical event ID for local logs and payment reconciliation.

If a private Bilibili feed and client asset both exist, require the partner to
document the join field, counting rule, and replay behavior before enabling
either integration.

## Marketing campaign and reporting settings

Bilibili's public product page describes performance landing pages, lead
collection, ecommerce conversion, game distribution, and app downloads. It
does not publish field-level API settings or default attribution behavior. See [marketing products](https://e.bilibili.com/product.html).

For the listed 花火 video-task and order reports, Bilibili documents summary
areas for video reach, content response, audience reach, and conversion. The
conversion area includes store visits, invitation clicks, store conversion
rate, average cost, transaction count, and transaction conversion rate. See [post-campaign report notice](https://www.bilibili.com/blackboard/activity-1AJZFmVCTp.html).

The same notice says custom reports can select metrics and download a PDF.
Treat the campaign order and partner documentation as authoritative for the
product, report scope, date range, and available fields. See [post-campaign report notice](https://www.bilibili.com/blackboard/activity-1AJZFmVCTp.html).

Record the report version and export date with every reconciliation.

## Verification

Use two proofs for every launch:

1. **First-party proof:** record the destination request, consent decision,
   canonical event ID, business result, and payment-provider result locally.
2. **Bilibili proof:** obtain the official dashboard report or partner response.
   Reconcile its documented metrics with campaign dates and local events.

The public report notice documents report output, not a public event-test
endpoint. The Open Platform index also does not list one. See [post-campaign report notice](https://www.bilibili.com/blackboard/activity-1AJZFmVCTp.html)
and [Open Platform documentation](https://open.bilibili.com/doc).

Before spend, confirm the commercial product, advertiser entity, access route,
destination URL, approved measurement fields, and report owner.

After launch, reconcile purchases and refunds with payment truth. Treat report
differences as a partner-support issue until the written terms define timing
and attribution behavior.

## Common pitfalls and security

Do not treat the public Open Platform as an Ads conversion API. Do not invent a
pixel, endpoint, event name, click ID, cookie, token scope, or hash rule.

Do not treat a landing-page visit, platform report row, or campaign conversion
metric as a confirmed payment. Use payment-provider truth for purchases and
refunds.

The advertising rules require valid qualification documents and reserve ad
review authority for Bilibili. Keep approval evidence with the campaign
record. See [advertising account rules](https://www.bilibili.com/blackboard/activity-0vTMq57oP1.html).

Keep partner credentials, report exports, campaign agreements, and customer
identifiers server-side. Never place them in browser bundles, URLs, logs,
screenshots, or commits.

Apply the hub consent gate before first-party measurement. Redact credentials,
identifiers, and report exports in operational logs.

The developer agreement requires technical and organizational security
measures and limits data processing to the agreement's purpose. See [developer service agreement](https://open.bilibili.com/agreement/developer-service).

Pair this adapter with [ad-conversion-hub](../ad-conversion-hub/SKILL.md).
Return `skipped` when no documented Bilibili Ads route exists.

## Official sources checked (2026-08-29)

- [Bilibili marketing](https://e.bilibili.com/?navhide=1) · [Marketing products](https://e.bilibili.com/product.html)
- [Marketing partners](https://e.bilibili.com/main/collaborator) · [Advertising account rules](https://www.bilibili.com/blackboard/activity-0vTMq57oP1.html)
- [花火 onboarding](https://www.bilibili.com/blackboard/activity-KdgoH1DKVh.html) · [花火 self-service notice](https://e.bilibili.com/observe/observe_2.html) · [Open Platform documentation](https://open.bilibili.com/doc)
- [Developer service agreement](https://open.bilibili.com/agreement/developer-service) · [Bilibili Privacy Policy](https://www.bilibili.com/blackboard/privacy-h5-english.html)
- [Post-campaign report notice](https://www.bilibili.com/blackboard/activity-1AJZFmVCTp.html)
