---
name: outbrain-ads
description: "Set up Outbrain Amplify with the Outbrain pixel, URL or event conversions, server-to-server GET postbacks, OutbrainClickId capture, custom audiences, and Amplify reporting. Use when wiring Outbrain conversion tracking, fixing missing conversions, requesting Amplify API access, or launching a small Outbrain test."
---

# Outbrain Ads

Outbrain Amplify supports a browser pixel and server-to-server conversion
tracking. Its advertiser API manages campaigns and reporting, while the
conversion guide uses a GET postback with a click ID. See [Outbrain conversion
setup](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/)
and [server-to-server tracking](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Use [ad-conversion-hub](../ad-conversion-hub/SKILL.md) for the canonical event
envelope, consent gate, identity rules, retry policy, and adapter contract.

## Account and access

Create an Amplify account at [my.outbrain.com](https://my.outbrain.com/).
Outbrain’s current advertiser guide presents this as the account entry point.

The Amplify API is a separate access path. Outbrain’s advertiser guide says
that API access is available to selected partners by request. Apply through
the [Amplify API access form](https://www.outbrain.com/partner-api/).

The Amplify API covers marketers, budgets, campaigns, promoted links, and
performance reporting. Its official reference does not list conversion
ingestion as an API entity. See [Amplify API reference](https://www.outbrain.com/help/advertisers/amplify-api/).

Outbrain’s fetched guides define no environment-variable names. Use these
hub-side names and label them as local configuration. See [Amplify API reference](https://www.outbrain.com/help/advertisers/amplify-api/):

```text
OUTBRAIN_ADS_MARKETER_ID   public value used as OB_ADV_ID in the pixel
OUTBRAIN_ADS_API_TOKEN     server-only Amplify API token
```

The server-to-server guide defines a postback URL without an Amplify API token.
Use that postback and the click ID captured by your server. See [Outbrain
server-to-server tracking](https://www.outbrain.com/help/advertisers/server2server-integrations/).

## Client-side Outbrain pixel

Open **Conversions** in Amplify and select **Outbrain Pixel**. Copy the
generated code and place it in the `<head>` tag on every page that needs
tracking. See [install the Outbrain pixel](https://www.outbrain.com/help/advertisers/install-outbrain-pixel/).

The generated code defines `OB_ADV_ID`, creates `window.obApi`, loads
`//amplify.outbrain.com/cp/obtp.js`, and tracks `PAGE_VIEW`. Copy the current
snippet from Amplify instead of maintaining a hand-written copy. See [the
current pixel example](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

Google Tag Manager is also supported. The Outbrain GTM guide supports direct
Amplify connection or manual tag setup. The direct flow currently supports
URL-based conversions, while event-based conversions need a GTM tag and
trigger. See [Outbrain pixel in GTM](https://www.outbrain.com/help/advertisers/outbrain-pixel-gtm/).

The browser pixel supports URL-based and event-based conversions. URL-based
rules match a configured URL or URL fragment. Event-based rules track a named
action, such as a button click or subscription. See [conversion types](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

## Rule setup and event mapping

Create each conversion in **Conversions → Add Conversion**. Choose a category,
give the conversion a name, and choose URL-based or event-based tracking. The
conversion name must match the name sent by GTM, server-to-server tracking, or
an imported conversion file. See [create conversions](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

Use event names that match the hub taxonomy. These names are local choices;
Outbrain does not provide a fixed standard event list in the fetched guide. See
[event-based conversions](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

| Hub event | Outbrain rule | Send when |
| --- | --- | --- |
| `page_view` | Base pixel `PAGE_VIEW` | An eligible page loads |
| `view_content` | Event-based rule named `view_content` | A meaningful item or plan view occurs |
| `lead` | Event-based rule named `lead` | A qualified lead form submits |
| `signup` | Event-based rule named `signup` | Account creation succeeds |
| `begin_checkout` | Event-based rule named `begin_checkout` | Checkout starts |
| `purchase` | Event-based rule named `purchase` | Payment confirmation succeeds |
| `subscription_start` | Event-based rule named `subscription_start` | A paid subscription activates |
| `refund` | No hub dispatch documented | Reconcile with payment truth |

For manual event tracking, install the base pixel and the generated event code.
The event code is shown after you enter or change the conversion name. Event
names are case-sensitive. See [event setup](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/)
and [server-to-server event rules](https://www.outbrain.com/help/advertisers/server2server-integrations/).

## Server-side conversions API

Outbrain’s official conversion guide does not define a JSON Conversions API.
The documented server-side route is an event-based conversion plus a GET
request to `https://tr.outbrain.com/unifiedPixel`. See [server-to-server
tracking](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Create an event-based conversion in the Amplify **Pixels → Conversions** area.
Set its name, conversion window, and value. You do not need to install the
pixel code for this server-to-server setup. See [server-side conversion setup](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Add this exact tracking parameter in the campaign’s **Track** box:

```text
OutbrainClickId={{ob_click_id}}
```

Keep `{{ob_click_id}}` unchanged. Outbrain replaces this dynamic macro with a
unique click ID and appends it to the landing URL as a query string value. See
[click parameter setup](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Store the landing value against the user or checkout in your server-side
system. When the conversion occurs, send a GET request using this shape:

```text
https://tr.outbrain.com/unifiedPixel?ob_click_id=CLICK_ID&name=EVENT_NAME
```

Replace `CLICK_ID` with the stored value. Replace `EVENT_NAME` with the exact
case-sensitive conversion name. Keep the reserved keys `ob_click_id` and
`name`, and URL-encode their values. See [postback URL](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Outbrain documents these optional query parameters:

```text
orderId=ORDER_ID
orderValue=ORDER_VALUE
currency=CURRENCY
timestamp=TIMESTAMP
```

The guide lists supported timestamp formats, including ISO-like forms with
and without a timezone. Use one documented format and preserve the event time
from the hub. See [postback values and timestamp formats](https://www.outbrain.com/help/advertisers/server2server-integrations/).

The Amplify API token uses the `OB-TOKEN-V1` header for Amplify API requests.
The official guide says tokens last 30 days. Do not add this token to the
documented conversion postback. See [Amplify API authentication](https://www.outbrain.com/help/advertisers/amplify-api/)
and [the postback contract](https://www.outbrain.com/help/advertisers/server2server-integrations/).

## Identity and consent

The fetched Outbrain conversion guides define click IDs, event names, order
fields, currency, and timestamps. They do not define a customer email field,
phone field, or SHA-256 hashing rule for this conversion path. Do not invent
one or send an undocumented identity payload. See [server-to-server fields](https://www.outbrain.com/help/advertisers/server2server-integrations/).

For users in the EU or UK, Outbrain requires an IAB-compliant consent
management platform and user consent before recording conversions. Gate the
pixel and conversion postback through the hub consent record. See [Outbrain
pixel consent requirements](https://www.outbrain.com/help/advertisers/install-outbrain-pixel/)
and [cookie and conversion tracking](https://www.outbrain.com/help/advertisers/how-does-outbrains-pixel-track-conversions/).

## Click ID and first-party cookie

The campaign tracking key is `OutbrainClickId`. Its value comes from the
dynamic macro `{{ob_click_id}}`. Capture it on the first landing request and
associate it with the user or checkout before later conversion dispatch. See
[Outbrain click-ID tracking](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Outbrain’s UTM guide also supports `{{macro}}` and `[macro]` formats. Its
recommended UTM string includes `utm_source=Outbrain`, `utm_medium=Discovery`,
`utm_campaign`, `utm_content={{ad_title}}`, `utm_term={{publisher_name}}_{{section_name}}`,
and `utm_id={{section_id}}`. See [UTM tracking](https://www.outbrain.com/help/advertisers/utm-tracking/).

The fetched docs do not name an Outbrain cookie. Do not invent a cookie name.
Outbrain says its pixel may use third-party or first-party cookies and may
match users to conversions for up to 24 hours. See [pixel cookie behavior](https://www.outbrain.com/help/advertisers/how-does-outbrains-pixel-track-conversions/).

The custom-audience console allows a cookie window from 1 to 180 days. This is
an audience-segment setting, not the server-to-server click-ID lifetime. See
[custom audience setup](https://www.outbrain.com/help/advertisers/create-custom-audience/).

## Deduplication

Outbrain’s fetched conversion docs do not define a browser/server event ID,
idempotency key, or deduplication field. Treat `orderId` as an optional order
reporting field, not as a documented deduplication guarantee. See [postback
fields](https://www.outbrain.com/help/advertisers/server2server-integrations/).

Keep one hub `event_id` across local browser and server records. Do not add an
Outbrain deduplication field that the vendor does not document. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).

## Amplify settings that override code

The conversion rule controls its category, name, URL or event condition,
conversion window, and fixed value. If a dynamic value is also sent, Outbrain
says the dynamic value is reported. See [conversion settings](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

Select **Include in total conversions** when the conversion should appear in
total conversion metrics. Outbrain recommends marking one conversion for this
purpose. See [total conversion settings](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

The conversion screen can also create an audience segment from converted
users. Custom audiences support audience retargeting, story sequencing,
converters segments, and value-based converters segments. See [custom
audiences](https://www.outbrain.com/help/advertisers/create-custom-audience/).

For a conversion campaign, Amplify offers Conversion Bid Strategy modes such
as Max Conversions, Target ROAS, Target CPA, and Semi Manual. The dashboard
guide says this strategy appears for the **Conversions** or **App Installs**
objective. See [Amplify campaign settings](https://www.outbrain.com/resources/wp-content/uploads/2023/02/Amplify-Dashboard-Guide-2023.pdf).

## Verification

Use the Outbrain Pixel Tracker browser extension to check that the pixel fires.
The extension tests implementation; it does not itself prove an attributed
conversion. See [pixel installation and testing](https://www.outbrain.com/help/advertisers/install-outbrain-pixel/)
and [conversion status](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

In the **Conversions** tab, `Pending` means the action has not yet been tested
or recorded. The documented pixel states include `Active`, `No Recent Activity`,
and `Not Active`; `No Recent Activity` means no activity for over 72 hours. See
[Outbrain tracking status](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).

For server-side tracking, record the generated GET request and its response
status as request proof. Then verify the named conversion in Amplify reporting.
The server-to-server guide says a reported conversion appears in the
dashboard. See [server-side reporting](https://www.outbrain.com/help/advertisers/server2server-integrations/).

## Common pitfalls and security

- Copy the current generated pixel. Keep `OB_ADV_ID` equal to the marketer ID. See [pixel code](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).
- Keep `{{ob_click_id}}` in the campaign tracking value. Do not replace the macro during setup. See [click parameter setup](https://www.outbrain.com/help/advertisers/server2server-integrations/).
- Keep `ob_click_id` and `name` as the postback keys. Send the postback with GET. See [postback rules](https://www.outbrain.com/help/advertisers/server2server-integrations/).
- Match event-name case exactly. Outbrain documents event names as case-sensitive. See [server-to-server notes](https://www.outbrain.com/help/advertisers/server2server-integrations/).
- Do not call the Amplify API a conversion API. Its documented entities cover campaign management and reporting. See [Amplify API](https://www.outbrain.com/help/advertisers/amplify-api/).
- Do not expect server-to-server tracking to report organic or direct purchases. Outbrain says it reports conversions that came from Outbrain. See [server-to-server limits](https://www.outbrain.com/help/advertisers/server2server-integrations/).
- Do not treat a pixel test as a conversion. Outbrain says testing does not register a dashboard conversion. See [pixel status](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/).
- Keep `OUTBRAIN_ADS_API_TOKEN` server-side. Send it as `OB-TOKEN-V1` only for Amplify API requests. See [API authentication](https://www.outbrain.com/help/advertisers/amplify-api/).
- Never put tokens, click IDs, or raw identity data in logs, screenshots, browser bundles, or commits. The hub owns secret handling and identity retention. See [ad-conversion-hub](../ad-conversion-hub/SKILL.md).
- Apply the EU and UK consent gate before pixel or conversion dispatch. See [Outbrain consent requirements](https://www.outbrain.com/help/advertisers/how-does-outbrains-pixel-track-conversions/).

## Official sources checked (2026-08-29)

- [Install Outbrain pixel](https://www.outbrain.com/help/advertisers/install-outbrain-pixel/)
- [Create conversions with the Outbrain pixel](https://www.outbrain.com/help/advertisers/create-conversions-using-the-outbrain-pixel/)
- [Server-to-server integrations](https://www.outbrain.com/help/advertisers/server2server-integrations/)
- [Pixel cookie and conversion tracking](https://www.outbrain.com/help/advertisers/how-does-outbrains-pixel-track-conversions/)
- [Outbrain pixel in Google Tag Manager](https://www.outbrain.com/help/advertisers/outbrain-pixel-gtm/)
- [UTM tracking](https://www.outbrain.com/help/advertisers/utm-tracking/)
- [Custom audiences](https://www.outbrain.com/help/advertisers/create-custom-audience/)
- [Amplify API](https://www.outbrain.com/help/advertisers/amplify-api/)
- [Amplify API access](https://www.outbrain.com/partner-api/)
- [Amplify dashboard guide](https://www.outbrain.com/resources/wp-content/uploads/2023/02/Amplify-Dashboard-Guide-2023.pdf)
