---
name: quora-ads
description: "Set up Quora Ads conversion tracking with the Quora Pixel and Conversion API, configure QCLID matching and event deduplication, and verify events in Quora Ads Manager. Use when integrating Quora Ads, debugging missing conversions, or running a small paid test."
---

# Quora Ads

Quora Ads has [self-serve Ads Manager](https://business.quora.com/lp/quora-ads-for-brands-27),
a browser Pixel, and a server-side Conversions API (CAPI). Quora recommends
using the Pixel and CAPI together.
See [Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [About the Quora Pixel](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010303387-About-the-Quora-Pixel).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.
Use [ad-experiments](../ad-experiments/SKILL.md) for one-audience tests, seed
sizing, and authorization before exporting PII.

## Account and access

Quora requires a Quora profile and an Ads Manager account. Existing profiles
can open Quora's business advertising page and choose **Get Started**. A new
profile can be created with Facebook, Google, or email. See [Create an
Advertising Account](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029362791-Create-an-Advertising-Account).

Create a Pixel and CAPI token in Ads Manager. Quora's CAPI guide says to use
the **Conversion API** tab and choose **Generate Token**. One CAPI token can
access one Quora ad account and can serve multiple campaigns. The same guide
requires the ad account ID and QCLID in the CAPI request. See [Conversion API
Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview).

Use these names as hub-local configuration conventions:

```text
QUORA_PIXEL_ID       public Pixel identifier copied from Ads Manager
QUORA_AD_ACCOUNT_ID  Quora ad account ID required by the CAPI request
QUORA_CAPI_TOKEN     server-only CAPI token generated in Ads Manager
```

The fetched Quora support page links a separate schema page for the exact CAPI
request. This skill does not copy an endpoint, header, timestamp field, or JSON
body without a readable first-party schema. Follow the current schema linked
from [Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
before implementing the server call.

## Client-side Quora Pixel

Create the Pixel in Ads Manager under **Pixels & Events → Setup Pixel**. Copy
the generated Base Pixel code and place it in the `<head>` section of every
page. Quora says the Base Pixel is required for conversion tracking and
Website Traffic Audiences. See [How do I install the Quora
pixel?](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010466208-How-do-I-install-the-Quora-pixel)
and [About the Quora Pixel](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010303387-About-the-Quora-Pixel).

Create Event Pixel code for each action that you measure. Place page-load code
on the confirmation or thank-you page. Place inline-action code on the action
that fires without a new page load. Keep Event Pixel code off landing pages and
ordinary site pages. Do not alter code copied from Ads Manager. See [How do I
install the Quora pixel?](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010466208-How-do-I-install-the-Quora-pixel)
and [Quora Pixel - Setup and
Troubleshooting](https://business.quora.com/resources/quora-pixel-explained).

Custom Events are a console alternative for URL page-load conversions. They
still require the Base Pixel on every page, and Quora says they have fewer
features than Standard Events. See [Custom
Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101852-Custom-Events).

Do not write a hand-maintained Quora script URL or guessed initialization call. Copy current code from the account's **Pixels & Events** tab.

## Rule setup and event mapping

Quora's documented conversion types include Search, Add to cart, Add to
wishlist, Initiate checkout, Add payment info, Purchase, Lead, Complete
registration, and Generic event. Standard Event labels have the same
functionality; choose the label that matches the action. See [How Quora counts
conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)
and [Standard Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101832-Standard-Events).

| Hub event | Quora mapping | Dispatch rule |
| --- | --- | --- |
| `page_view` | Page view ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Use only for a page view that the campaign measures. |
| `view_content` | View content ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Use for meaningful content or plan views. |
| `lead` | Lead ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Send after the qualified form submission. |
| `signup` | Complete registration ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Send after account creation. |
| `begin_checkout` | Initiate checkout ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Send when checkout begins. |
| `purchase` | Purchase ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Send after the payment provider confirms the charge. |
| `subscription_start` | No documented standard mapping ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Keep it in first-party records until the current Quora schema and console define the mapping. |
| `refund` | No documented standard mapping ([conversion types](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions)) | Reconcile it with payment-provider truth; do not invent a Quora refund event. |

## Server-side conversions API

Quora CAPI sends website events, app installs, and offline conversions directly
to Quora Ads Manager. Quora's setup instructions require three conceptual
inputs: the generated API token, the Quora ad account ID, and the QCLID. See
[Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview).

The CAPI guide says QCLID is required to attribute an event to specific ad
clicks or impressions. It also says that QCLID operates on the backend and may
not appear on the landing URL during testing. Preserve and pass it when the
site receives it; treat a missing value as a loss of deterministic click
attribution, not as a reason to block the payment webhook. See [Conversion API
Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

Use the exact endpoint, authentication header, request fields, event-name
values, identity fields, and timestamp format from Quora's current schema. The
support article links that schema, but this skill intentionally does not repeat
syntax that was not readable in the source check. Do not substitute the Quora
Ads Manager URL for a CAPI endpoint.

Implement the adapter boundary as follows:

1. Read `QUORA_CAPI_TOKEN` and `QUORA_AD_ACCOUNT_ID` from the server secret
   store and account configuration.
2. Apply the hub measurement and ad-user-data consent gates.
3. Map only the event names and fields that the current Quora schema defines.
4. Include the stored QCLID when present.
5. Send the canonical event ID in the CAPI field that the current schema
   defines for deduplication.
6. Record the redacted response and dispatch status in the hub.

Use the verification steps below and the hub's three-layer proof model. See
[ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Identity and consent

Quora's Pixel uses cookies for visitor matching. Advanced Match can send an
email to improve matching when a cookie is absent. Quora documents both
unhashed `email` and pre-hashed `hashed_email` for the Pixel. See [Advanced
Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match).

If the application hashes the email, remove all whitespace, lowercase it, and
SHA-256 hash it. Quora says that it hashes unhashed Pixel emails in the browser
and deletes hashed emails after matching. Advanced Match supports email only;
it does not support the image Pixel. See [Advanced
Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match).

The hub must grant `measurement: true` before any Quora event. It must grant
`ad_user_data: true` before sending a hashed email or another identity field.
Keep raw identifiers inside the server boundary, and pass only fields allowed
by Quora's current CAPI schema. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md)
and [Advanced Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match).

## Click ID and first-party storage

Quora calls its click identifier QCLID and writes it as `qclid` in its CAPI
guide. A newer Quora conversion article describes QCLID as a URL parameter and
the primary deterministic matching signal. See [Conversion API
Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [How Quora counts
conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions).

Capture `qclid` from the landing request when it is present. Persist it in the
application's first-party storage using the hub's consent and retention rules.
Keep first-touch and most-recent values separately when the measurement design
needs both. Quora does not define a QCLID retention period in the fetched
 sources, so do not invent one. See [Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

Quora also supports five core UTM names: `utm_source`, `utm_medium`,
`utm_campaign`, `utm_term`, and `utm_content`. Its Ads Manager supports dynamic
values for ad, ad set, and campaign IDs and names. See [UTM
Parameters](https://quoraadsupport.zendesk.com/hc/en-us/articles/16063741108621-UTM-Parameters).

## Deduplication

Send one stable hub `event_id` for one user action through both the Pixel and
CAPI. Quora says it deduplicates Pixel and CAPI conversions when both carry the
same `event_id`, and recommends a unique event ID for each conversion. See
[Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [How Quora counts
conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions).

Quora's Pixel example passes `event_id` as a parameter to the `qp('track',
...)` call. Use the exact event call generated or documented for the selected
Quora label. Do not change the casing to `eventId`, use a transaction ID for
two separate business events, or invent a server idempotency field. See
[Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview)
and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Ads Manager settings that override code

Conversion campaigns require a selected Standard or Custom Event. The selected
event must match the label installed or created in Ads Manager. See [Standard
Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101832-Standard-Events)
and [Custom Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101852-Custom-Events).

For oCPM, Quora requires live Pixel or CAPI conversion tracking and a firing
conversion event before launch. Quora's setup guide says to choose the
Conversions objective, select the conversion event, set a target CPA, and set
the daily budget at or above the target CPA. See [Setting up oCPM campaigns on
Quora](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220927596173-Setting-up-oCPM-campaigns-on-Quora).

Quora's default attribution windows are 28 days for click-through conversions
and 1 day for view-through conversions. The account can use custom windows.
Compare equal windows when reconciling Quora with first-party analytics. See
[Conversion Metrics](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101892-Conversion-Metrics)
and [Advanced Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match).

## Audience and retargeting

Quora documents Website Traffic, List Match, and Lookalike Audiences. Website
Traffic Audiences require the Quora Pixel, support a 0–180 day visitor window,
and can take up to 24 hours to calibrate. See [Audience
Targeting](https://quoraadsupport.zendesk.com/hc/en-us/articles/360028972252-Audience-Targeting).

List Match uploads use a CSV with one email per row and no header. Quora's
support page recommends at least 200 people, permits up to 4 million rows per
CSV, and hashes plain-text customer data locally with SHA-256 before transfer.
See [Audience Targeting](https://quoraadsupport.zendesk.com/hc/en-us/articles/360028972252-Audience-Targeting)
and [How does hashing work for uploading a List Match Audience
file?](https://quoraadsupport.zendesk.com/hc/en-us/articles/360020404651-How-does-hashing-work-for-uploading-a-List-Match-Audience-file).

Lookalikes require a Website Traffic seed of at least 3,000 people or a List
Match seed of at least 500 people. Quora says an account can have up to 50
lookalike audiences at one time. See [Audience
Targeting](https://quoraadsupport.zendesk.com/hc/en-us/articles/360028972252-Audience-Targeting).

Require `ad_personalization: true` before creating or refreshing an audience.
Use [ad-experiments](../ad-experiments/SKILL.md) for seed sizing and human authorization before customer-data exports.

## Verification

For Pixel proof, open **Pixels & Events** and check Base Pixel and Event Pixel
activity. Quora says that view reports firings from the last 15 minutes. A
manual test conversion should appear after at least two minutes. See [How do I
install the Quora pixel?](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010466208-How-do-I-install-the-Quora-pixel).

For CAPI proof, open QAM **Events Manager** and confirm recent activity for the
selected event. Quora says CAPI conversion data can take up to three hours to
record, and sometimes a full day. See [Why are my conversions not being
recorded in the Quora Ads
Manager?](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010511748-Why-are-my-conversions-not-being-recorded-in-the-Quora-Ads-Manager)
and [Setting up oCPM campaigns on
Quora](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220927596173-Setting-up-oCPM-campaigns-on-Quora).

For platform proof, inspect Quora Ads Manager's Conversions column. Quora
documents breakdowns by conversion type, click-through or view-through
attribution, campaign, ad set, and ad. See [How Quora counts
conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions).

For business proof, reconcile Quora's attributed conversions with succeeded
charges, account creation, subscription state, and refunds in the product's
server records. The ad dashboard is an attribution view, not payment truth.
See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Common pitfalls and security

- Missing QCLID loses Quora's deterministic click match. Still send a consented event when the hub permits it. See [Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview).
- A Base Pixel is required for Pixel conversions. Keep Event Pixel code on the conversion action only. See [Quora Pixel troubleshooting](https://business.quora.com/resources/quora-pixel-explained).
- A Custom Event still needs the Base Pixel and a page-load URL. See [Custom Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101852-Custom-Events).
- Pixel and CAPI copies need the same `event_id` for Quora deduplication. See [How Quora counts conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions).
- Pixel activity does not prove campaign attribution. Check the Conversions column and reconcile with server truth. See [Conversion Metrics](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101892-Conversion-Metrics) and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).
- Keep `QUORA_CAPI_TOKEN` in the server secret store. Never place it in a browser bundle, URL, log, screenshot, or commit. Follow [ad-conversion-hub](../ad-conversion-hub/SKILL.md).
- Hash identifiers only after consent and delete temporary normalized values after dispatch. See [Advanced Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match) and [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Official sources checked (2026-08-31)

- [Create an Advertising Account](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029362791-Create-an-Advertising-Account) · [self-serve Ads Manager](https://business.quora.com/lp/quora-ads-for-brands-27) · [Conversion API Overview](https://quoraadsupport.zendesk.com/hc/en-us/articles/23065751885069-Conversion-API-Overview) · [About the Quora Pixel](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010303387-About-the-Quora-Pixel)
- [How do I install the Quora pixel?](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010466208-How-do-I-install-the-Quora-pixel) · [Pixel troubleshooting](https://business.quora.com/resources/quora-pixel-explained) · [Standard Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101832-Standard-Events) · [Custom Events](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101852-Custom-Events)
- [Advanced Match](https://quoraadsupport.zendesk.com/hc/en-us/articles/360039502671-Advanced-Match) · [How Quora counts conversions](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220613643789-How-Quora-counts-conversions) · [UTM Parameters](https://quoraadsupport.zendesk.com/hc/en-us/articles/16063741108621-UTM-Parameters) · [Audience Targeting](https://quoraadsupport.zendesk.com/hc/en-us/articles/360028972252-Audience-Targeting)
- [List Match hashing](https://quoraadsupport.zendesk.com/hc/en-us/articles/360020404651-How-does-hashing-work-for-uploading-a-List-Match-Audience-file) · [Conversion Metrics](https://quoraadsupport.zendesk.com/hc/en-us/articles/360029101892-Conversion-Metrics) · [Conversion troubleshooting](https://quoraadsupport.zendesk.com/hc/en-us/articles/115010511748-Why-are-my-conversions-not-being-recorded-in-the-Quora-Ads-Manager) · [Setting up oCPM](https://quoraadsupport.zendesk.com/hc/en-us/articles/46220927596173-Setting-up-oCPM-campaigns-on-Quora)
