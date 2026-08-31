---
name: hotstar-ads
description: "Platform-specific integration guidance for JioHotstar Ads."
---

# JioHotstar Ads

The official advertising site now presents JioHotstar as a self-serve
platform. Its public help center lists a manual JioHotstar Pixel guide and
postback guides for Singular, Adjust, and AppsFlyer. The official pages checked
do not publish a public campaign-management Ads API or direct advertiser
Conversions API contract. Use the self-serve console, pixel, or an approved
measurement partner. Do not invent a server endpoint. See the [JioHotstar
Self-Serve site](https://ads.hotstar.com/) and [official help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en).

Sources: [JioHotstar Self-Serve](https://ads.hotstar.com/), [JioHotstar help
center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en), and
[Advertising Services Agreement](https://ads.hotstar.com/advertising-services-agreement/).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity policy, retry policy, and adapter contract.
Pair it with [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed sizing, PII-export authorization, and payment-provider truth.

## Account and access

JioHotstar provides a self-serve signup route through its advertising site.
The signup flow asks for an email address, password, and phone number. Profile
verification can require a GST number, PAN card, GST certificate, CIN when
applicable, and business details. JioStar says its team reviews submitted
documents within six hours. See the [official onboarding FAQ](https://ads.hotstar.com/frequently-asked-questions/).

An agency account can manage multiple advertisers and brands. The help center
describes advertiser and brand creation under **Add Advertisers and Brands**.
It also lists `view`, `edit`, and `admin` access roles. See the [account FAQ](https://ads.hotstar.com/frequently-asked-questions/).

The legal service is the JioHotstar Marketing Platform on `ads.hotstar.com` and
`adsmanager.hotstar.com`. The terms distinguish an advertiser Business Account
from an agency Business Account and allow JioStar to request brand or
advertiser verification documents. See the [JioHotstar terms](https://ads.hotstar.com/terms-of-service-13th-may-2025/).

The self-serve FAQ says campaigns use prepaid billing. It lists credit card,
debit card, and net banking as payment methods, and says that credit is not
available. See the [payment FAQ](https://ads.hotstar.com/frequently-asked-questions/).

Keep account credentials and any partner credentials in the server secret
store. Never place them in a browser bundle, URL, log, screenshot, or commit.
The hub owns the repository-wide secret-handling rule.

## Client-side JioHotstar Pixel

The official help center lists **How to Install and Configure the JioHotstar
Pixel manually** under **Event Tracking Setup**. The public page does not expose
the snippet, pixel identifier format, cookie name, or event parameter schema in
the material checked here. Copy the current snippet from the official console
or support article after account approval. Do not write a guessed script or
identifier format. See the [official help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en).

JioStar’s Advertising Services Agreement says that, where applicable for CPI
or CPCV campaigns, the client must install the applicable JioStar Tracking
Technologies on the landing page linked from the advertising creative. It also
says that removing or manipulating the technology without written permission
can suspend entitlements or terminate the terms. See [tracking and reporting](https://ads.hotstar.com/advertising-services-agreement/).

Use this integration shape:

1. Obtain the approved pixel code and identifier from the JioHotstar console.
2. Gate the code on the hub’s measurement consent decision.
3. Place it only on the approved landing pages.
4. Send the hub event to your own first-party measurement pipeline.
5. Verify the resulting activity in the JioHotstar reporting surface.

The JioStar privacy policy says its sites and service providers may use
cookies, pixels, tags, SDKs, APIs, and web beacons. It also says that cookies
are used to store or receive information when a user agrees. Do not treat that
general privacy statement as documentation for a JioHotstar Ads click cookie
or browser API. See the [JioStar privacy policy](https://ads.hotstar.com/privacy-policy/).

## Rule setup and event mapping

JioHotstar’s public support hub lists **Event Mapping Guide for Advertisers**,
but the official pages checked here do not publish a stable public event-name
list or payload schema. Keep the platform adapter event-neutral until the
approved console or partner guide supplies those values. See the [event
tracking section of the help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en).

Use the hub taxonomy for first-party measurement:

| Hub event | JioHotstar action |
| --- | --- |
| `page_view` | Record on the approved landing page after consent. |
| `view_content` | Record in the first-party measurement pipeline. |
| `lead` | Reconcile with the lead system. |
| `signup` | Reconcile with the account system. |
| `begin_checkout` | Reconcile with checkout state. |
| `purchase` | Reconcile with a confirmed payment. |
| `subscription_start` | Reconcile with subscription truth. |
| `refund` | Reconcile with the payment provider. |

The table defines local adapter behavior. It does not claim that JioHotstar
accepts these event names. Send a platform event only when the approved
JioHotstar console or partner documentation defines the event and fields.

## Server-side conversions API

No public direct JioHotstar Ads conversions API contract is documented in the
official product site, legal agreement, or public help center pages checked on
2026-08-30. Those pages document tracking technologies, reporting, and partner
postback setup topics instead. See the [help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en),
[tracking agreement](https://ads.hotstar.com/advertising-services-agreement/), and
[JioHotstar measurement page](https://discover.hotstar.com/measurement/).

Therefore this skill defines no Hotstar server endpoint, HTTP method, bearer
token, request parameter, event field, timestamp unit, click-ID field, or
deduplication field. Do not implement or probe guessed paths such as
`/conversions`, `/events`, or `/pixel`.

The real supported routes are:

- Use the JioHotstar Pixel when the campaign and landing page require JioStar
  Tracking Technologies. The agreement says that JioStar generates reports
  from those technologies for delivery, user-action attribution, and payments.
- Use an approved MMP integration when the campaign uses app measurement. The
  public help center lists setup guides for Singular, Adjust, and AppsFlyer.
- Use JioStar’s managed measurement offerings when a campaign needs brand lift,
  cross-screen attribution, sales lift, or media-mix analysis. The official
  measurement page describes those as campaign-measurement solutions.

The MMP route is not a JioHotstar Conversions API. Configure the MMP and its
postbacks using the current JioHotstar guide and the MMP’s own documentation.
Do not copy a third-party MMP endpoint into this adapter as if JioStar owned
it.

Until a current JioStar contract or console guide supplies a direct API
contract, the hub adapter must return `skipped` for direct server dispatch. It
must not fail a payment webhook or signup transaction.

## Identity and consent

JioStar’s tracking-technology policy requires informative, prominent notices
and the necessary consents for collection, use, transfer, and export of data.
For websites, the notice belongs on every page where JioStar Tracking
Technologies are used. For applications, the notice must be accessible in the
app settings or privacy policy and from the relevant distribution surface. See
the [tracking-technology policy](https://ads.hotstar.com/novis-policies-for-use-of-novi-tracking-technologies).

The policy says that audience data must be hashed locally before upload or
transfer to JioStar. It does not specify a hash algorithm in the page checked.
Do not assume SHA-256, a field name, or a normalization rule for a JioHotstar
upload. Follow the current console or written partner specification.

The same policy prohibits sharing sensitive data or sensitive personal data
with JioStar. Do not send raw email, phone, payment data, health data, or other
customer identifiers to a platform surface unless a current approved contract
explicitly defines the data and the hub consent gate allows it. See the
[identity and data rules](https://ads.hotstar.com/novis-policies-for-use-of-novi-tracking-technologies).

The hub must record the consent decision with the canonical event before any
pixel or partner dispatch. Hash identifiers only after consent permits ad-user
data. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Click ID and first-party cookie

The official sources checked do not publish a JioHotstar-owned click parameter,
click-ID format, cookie name, or attribution lifetime. The privacy policy’s
general mention of cookies does not establish any of those platform-specific
facts. See the [privacy policy](https://ads.hotstar.com/privacy-policy/) and
[official help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en).

Do not create `hotstar_click_id`, `jiohotstar_click_id`, or another guessed
parameter. Do not promise a click or view attribution window. If a campaign
console or JioStar partner supplies a documented link field, capture exactly
that field and record its stated lifetime in the campaign configuration.

Keep first-touch and latest approved campaign values in your own first-party
storage only when the hub consent gate permits it. Do not block a confirmed
purchase because a JioHotstar click value is absent.

## Deduplication

No public JioHotstar Ads deduplication field or browser/server reconciliation
rule is documented in the sources checked. Do not send `event_id`, `eventId`, a
transaction ID, or another guessed field to JioHotstar.

Use the hub event ID for your own event log and payment reconciliation. If an
approved MMP or JioStar campaign guide defines deduplication, implement the
documented rule inside that adapter and preserve the source citation with the
campaign configuration. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## JioHotstar settings that override code

- Account verification controls whether the advertiser or brand can create a
  campaign. The terms say the dashboard reflects verification status. See the
  [JioHotstar terms](https://ads.hotstar.com/terms-of-service-13th-may-2025/).
- Campaign approval and placement remain platform-controlled. The terms say
  JioStar may review creatives and may require approval before publication.
  See [creative review](https://ads.hotstar.com/advertising-services-agreement/).
- Tracking technology is not freely replaceable. The agreement requires the
  applicable technology for relevant CPI or CPCV campaigns and restricts its
  removal or manipulation. See [tracking requirements](https://ads.hotstar.com/advertising-services-agreement/).
- The self-serve FAQ says campaigns are prepaid. Do not assume an account has
  credit terms. See the [billing FAQ](https://ads.hotstar.com/frequently-asked-questions/).
- Agencies can assign `view`, `edit`, and `admin` access. Do not give a worker
  more access than its campaign task requires. See the [access FAQ](https://ads.hotstar.com/frequently-asked-questions/).

## Verification

Use three separate proofs:

1. **First-party proof:** record the approved landing-page visit, consent
   decision, canonical event ID, event outcome, and payment or signup result in
   your own server logs.
2. **Integration proof:** verify the approved pixel in the browser and confirm
   the MMP test postback, if the campaign uses an MMP. Do not call an invented
   JioHotstar endpoint.
3. **Platform proof:** reconcile the JioHotstar report with your first-party
   records. The Advertising Services Agreement says JioStar generates reports
   for ad delivery, user-action attribution, and campaign payments. It also
   permits verification of reported impressions with a supported measurement
   partner within 15 days of the report date. See [reporting and verification](https://ads.hotstar.com/advertising-services-agreement/).

JioStar’s public measurement page describes brand-lift surveys, cross-screen
attribution, sales lift with a third party, and media-mix modeling. Use the
contracted measurement method for the campaign. Do not treat a browser
request or MMP postback as proof of revenue attribution. See [JioStar
measurement](https://discover.hotstar.com/measurement/).

## Common pitfalls and security

- Treating JioHotstar Pixel documentation as a direct server conversions API.
- Guessing a JioHotstar endpoint, token scope, bearer header, cookie, click-ID
  parameter, event name, payload field, hash algorithm, or retention window.
- Sending raw or sensitive customer data to JioStar.
- Loading the pixel before the hub grants measurement consent.
- Using an MMP endpoint as if it were a JioStar endpoint.
- Replacing or modifying JioStar Tracking Technologies without the required
  written permission.
- Treating a successful pixel request, postback, or dashboard receipt as proof
  of a confirmed purchase.
- Letting missing partner access block a payment webhook. Return `skipped` and
  reconcile with payment truth.

JioStar’s tracking policy requires prior written consent before using third-
party vendors such as attribution partners for campaign delivery or end-user
data collection. It limits approved data to campaign service and measurement,
prohibits personal re-identification and enrichment, and requires deletion at
campaign end or aggregation and de-identification. See the [vendor rules](https://ads.hotstar.com/novis-policies-for-use-of-novi-tracking-technologies).

The same policy requires notice of a security incident within 48 hours after
the client or vendor learns of it. Keep the pixel, partner configuration, and
campaign exports covered by your security incident process. See [incident
notification](https://ads.hotstar.com/novis-policies-for-use-of-novi-tracking-technologies).

## Official sources checked (2026-08-30)

- [JioHotstar Self-Serve](https://ads.hotstar.com/)
- [JioHotstar FAQ](https://ads.hotstar.com/frequently-asked-questions/)
- [JioHotstar help center](https://help.hotstar.com/ads/en/support/home?country=in&lang=en)
- [JioHotstar terms](https://ads.hotstar.com/terms-of-service-13th-may-2025/)
- [Advertising Services Agreement](https://ads.hotstar.com/advertising-services-agreement/)
- [Tracking-technology policy](https://ads.hotstar.com/novis-policies-for-use-of-novi-tracking-technologies)
- [JioStar privacy policy](https://ads.hotstar.com/privacy-policy/)
- [JioStar measurement](https://discover.hotstar.com/measurement/)
- [JioStar advertising contact](https://discover.hotstar.com/contact/)
