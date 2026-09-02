---
name: ads-perplexity
description: "Evaluate Perplexity advertising access and conversion measurement. Perplexity's public pages currently describe an Enterprise advertising use case, but do not publish a self-serve Ads Manager, advertiser pixel, or Ads conversions API. Use when a team asks about Perplexity Ads, advertiser onboarding, campaign measurement, or whether an ad-conversion adapter is safe to build."
---

# Perplexity Ads

Perplexity does not publish a self-serve advertising platform contract in the
official pages checked on 2026-08-31. Its public advertising page is an
Enterprise use case with **Get started** and **Contact us** calls to action.
The public product hub lists Search, Computer, Comet, API, and Deep Research,
but no advertiser buying product. See [Perplexity for advertising](https://www.perplexity.ai/enterprise/use-cases/advertising)
and the [Perplexity product hub](https://www.perplexity.ai/hub).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Use [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed
sizing, and PII-export authorization.

## Account and access

There is no public self-serve Perplexity Ads signup in the official pages
reviewed. The real public route is the advertising page's **Get started** or
**Contact us** flow. Treat access as managed until Perplexity gives the team a
current written product agreement and technical specification. The page
describes advertising teams using Perplexity Enterprise for research and
campaign work; it does not describe an Ads Manager account or campaign API.
See [Perplexity for advertising](https://www.perplexity.ai/enterprise/use-cases/advertising).

Ask the Perplexity contact to confirm these items in writing before building an
adapter:

- inventory and campaign buying process;
- advertiser account and campaign identifiers;
- approved campaign setup and reporting surfaces;
- conversion measurement or postback support;
- identity fields, consent requirements, and retention;
- click-link fields, attribution windows, and join keys;
- authentication, rate limits, retries, and deduplication.

Do not treat a normal Perplexity account as an advertiser account. The public
hub describes ordinary account signup for the Perplexity service. It does not
describe advertiser access. See [How to use Perplexity](https://www.perplexity.ai/hub).

Do not use a Perplexity API key as Ads access. Perplexity's developer pages
describe Agent, Search, and Embeddings APIs for building applications. The API
key guide says its keys authenticate requests to the Perplexity API. Those
pages do not document advertising permissions. See [API platform](https://www.perplexity.ai/api-platform),
[API documentation](https://docs.perplexity.ai/docs/getting-started/overview),
and [API key management](https://docs.perplexity.ai/docs/admin/api-key-management).

There is no vendor-defined environment variable in this skill. If a signed
partner agreement supplies credentials, name and scope them from that current
contract. Keep them in the server secret store. Never put them in browser code,
URLs, logs, screenshots, or commits.

## Client-side tag or pixel

No public first-party Perplexity Ads browser tag or pixel is documented in the
advertising page, public product hub, or developer documentation checked here.
Those pages provide no verified script URL, tag ID, cookie name, event call, or
browser configuration to install. See [Perplexity for advertising](https://www.perplexity.ai/enterprise/use-cases/advertising),
[the product hub](https://www.perplexity.ai/hub), and [the documentation index](https://docs.perplexity.ai/docs/getting-started/overview).

Do not install a guessed Perplexity script. Do not create a guessed pixel ID,
cookie name, click parameter, or browser event call. A Perplexity privacy help
article describes data collected from device and site interactions. That
description concerns Perplexity's own services; it does not define an
advertiser tag for a customer's website. See [What data does Perplexity collect about me?](https://www.perplexity.ai/help-center/en/articles/10354855-what-data-does-perplexity-collect-about-me).

## Rule setup and event mapping

No public Perplexity Ads event names, conversion rules, browser event schema,
or campaign association method is documented in the sources checked. Keep
first-party events in the hub and do not dispatch them to Perplexity Ads.

| Hub event | Perplexity Ads action |
| --- | --- |
| `page_view` | Measure on the destination site only. |
| `view_content` | Measure on the destination site only. |
| `lead` | Store the first-party lead only. |
| `signup` | Store the first-party signup only. |
| `begin_checkout` | Store the first-party checkout only. |
| `purchase` | Reconcile with payment-provider truth. |
| `subscription_start` | Reconcile with subscription truth. |
| `refund` | Reconcile with payment-provider truth. |

The table is an adapter decision, not a Perplexity event contract. Revisit it
only after Perplexity supplies a current Ads specification.

## Server-side conversions API

Perplexity does not publish a public Ads conversions API in the official
developer pages checked. The documentation index lists application APIs and an
Analytics API. The Analytics API is for Enterprise organization usage
analytics, such as credits, query volume, members, connectors, artifacts,
skills, spaces, workflows, and task durations. It is not documented as an Ads
conversion-ingestion API. See [documentation index](https://docs.perplexity.ai/docs/getting-started/overview)
and [Computer Analytics API](https://docs.perplexity.ai/docs/admin/computer-analytics-api).

Therefore this skill has no verified Perplexity Ads endpoint, HTTP method,
authorization scope, header, payload field, identity field, hashing rule,
event-name set, retention window, response code, or deduplication field to
implement. Do not invent one. Do not probe guessed Ads paths.

The public API platform describes APIs for search, agents, and embeddings. A
successful request to one of those APIs proves API access only. It does not
prove advertiser access or campaign attribution. See [Perplexity API Platform](https://www.perplexity.ai/api-platform)
and [Perplexity API FAQ](https://docs.perplexity.ai/docs/resources/faq).

## Identity and consent

With no published Ads event contract, send no customer identifiers to
Perplexity for Ads. This includes raw or hashed email, phone, IP address,
device IDs, chat content, prompts, and internal customer IDs. The hub owns the
consent gate and normalization rules. Hash identifiers only after the hub says
that ad-user data is allowed.

Perplexity's privacy help says it does not sell, trade, or share personal
information except as described in its policy. It also says that service
providers may process information for services such as email, payments, and
support. Do not infer an Ads data-sharing permission from that general policy.
See [Perplexity privacy help](https://www.perplexity.ai/help-center/en/articles/10354855-what-data-does-perplexity-collect-about-me).

If a managed agreement later authorizes data sharing, record the approved data
categories, purpose, lawful basis, retention, deletion route, and processor or
controller roles. Do not send more data than that agreement permits.

## Click ID and first-party cookie

No public Perplexity-owned click-ID parameter, landing-page format, cookie
name, lifetime, or attribution window is documented in the sources checked.
Do not create a guessed click-ID name. Do not promise Perplexity attribution
from a landing-page visit.

Ask the managed contact whether an approved campaign link may carry a
first-party campaign code or UTM values. If approved, capture the value on the
destination site and store it with the hub event. Keep first-touch and
most-recent values only when the measurement design needs both. The hub owns
consent and first-party storage rules.

The partner must document the link field, expiration, attribution window,
reporting join key, and any offline reconciliation rule before launch. Until
then, those values are absent from the adapter contract.

## Deduplication

Perplexity publishes no Ads browser/server deduplication contract in the
official sources checked. Do not send a guessed deduplication field to a
Perplexity endpoint.

Use the hub event ID for first-party logging and reconciliation. If a future
partner specification defines a platform deduplication field, map it only
after checking its exact spelling, scope, lifetime, and retry behavior.

## Managed measurement route

Use the official advertising page as the entry point. Its public route is
Enterprise **Get started** or **Contact us**, not a documented self-serve Ads
console. See [Perplexity for advertising](https://www.perplexity.ai/enterprise/use-cases/advertising).

Request a campaign-specific measurement plan from the Perplexity contact. Keep
the approved plan with the campaign record. It must identify the reporting
surface and define how to reconcile impressions, clicks, conversions, value,
refunds, and cancellations. Do not fill missing fields with conventions from
Meta, LinkedIn, Google, or another platform.

The public API documentation does describe an Enterprise Analytics API. It
requires Enterprise organization access and an admin-managed analytics key.
That API reports Perplexity usage analytics. It is not a substitute for a
partner's Ads report or conversion feed. See [Computer Analytics API](https://docs.perplexity.ai/docs/admin/computer-analytics-api).

## Verification

Use two proofs:

1. **First-party proof:** record the destination request, consent decision,
   canonical event ID, campaign code if approved, and payment or signup result
   in your own server logs. Reconcile purchases and refunds with the payment
   provider.
2. **Partner proof:** use only the reporting surface or export named in the
   current Perplexity agreement. Confirm its campaign ID, date range, timezone,
   event definition, attribution window, and refresh time.

A successful destination request proves only that your site received a visit.
A successful Perplexity API request proves only the API operation documented by
Perplexity. Neither proves Ads attribution. See [Perplexity API FAQ](https://docs.perplexity.ai/docs/resources/faq).

If no partner reporting surface exists, mark the Perplexity adapter
`unsupported` or `skipped`. Keep first-party measurement active. Do not fail a
checkout or payment webhook because Perplexity Ads access is absent.

## Common pitfalls and security

- Treating the public Perplexity API as an Ads API.
- Treating an Enterprise Analytics API key as an advertiser credential.
- Installing an unofficial pixel or copying a tag from another platform.
- Guessing a click ID, cookie, endpoint, event field, or attribution window.
- Sending raw or hashed customer data without a current approved contract and
  consent decision.
- Treating a landing-page visit, API response, or payment as Perplexity
  attribution.
- Keeping a guessed Ads credential variable after the partner route is
  unavailable.

Keep any approved Perplexity credential in the server secret store. Perplexity
says API keys are sensitive, shown only once, and must not appear in client-side
code or public repositories. Apply the same control to any future Ads
credential supplied under contract. See [API key management](https://docs.perplexity.ai/docs/admin/api-key-management).

Keep prompts, chat content, and customer records out of this adapter. The
Perplexity help center says that its data handling is governed by its privacy
policy and that it does not sell personal data. Apply the hub consent gate and
the signed campaign agreement before any future data transfer. See [Perplexity data collection](https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity).

## Official sources checked (2026-08-31)

- [Perplexity for advertising](https://www.perplexity.ai/enterprise/use-cases/advertising)
- [Perplexity product hub](https://www.perplexity.ai/hub)
- [Perplexity API Platform](https://www.perplexity.ai/api-platform)
- [Perplexity API documentation index](https://docs.perplexity.ai/docs/getting-started/overview)
- [Perplexity API key management](https://docs.perplexity.ai/docs/admin/api-key-management)
- [Computer Analytics API](https://docs.perplexity.ai/docs/admin/computer-analytics-api)
- [Perplexity API FAQ](https://docs.perplexity.ai/docs/resources/faq)
- [What data does Perplexity collect about me?](https://www.perplexity.ai/help-center/en/articles/10354855-what-data-does-perplexity-collect-about-me)
- [Data Collection at Perplexity](https://www.perplexity.ai/help-center/en/articles/11564572-data-collection-at-perplexity)
