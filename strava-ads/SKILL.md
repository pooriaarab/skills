---
name: strava-ads
description: "Evaluate Strava Sponsored Challenges and Sponsored Segments when you need advertiser access, reward-site conversion tracking, partner reporting, or an answer about Strava pixels, retargeting, DSP access, click IDs, or a public conversion API. Strava uses a managed activation model. It does not document a self-serve Strava Ads conversion API or support conventional ad pixels."
---

# Strava Ads

Strava Ads is a managed brand-activation product. It is not a self-serve
performance ad platform with a public pixel or conversion API.

Strava offers Sponsored Challenges, Sponsored Segments, and subscription
partnerships. Its own FAQ says that it does not support conventional ad
formats, third-party cookies, or pixels. It also says that it does not offer
traditional retargeting or access through an ad exchange or DSP.

Sources: [Strava advertising overview](https://business.strava.com/resources/advertising-strava),
[Strava FAQ](https://business.strava.com/why-strava/faqs).

## Account and access

There is no public self-serve Strava advertiser signup in the official sources
checked. Use the managed business route:

1. Open [Strava for Business contact](https://business.strava.com/contact).
2. Submit the brand, market, activation type, audience, dates, reward flow,
   and destination website.
3. Work with a Strava Client Partner on the campaign and reporting plan.

Agencies can use the [Strava agency partner route](https://business.strava.com/why-strava/agencies).
Strava says that its team helps agencies and brands plan Sponsored Challenges
and other activations. The official FAQ says that these products usually suit
larger brands. It recommends an organic Strava Club for smaller brands.

Do not create a fake advertiser account or token. A partner agreement is the
access gate for campaign setup, audience planning, and campaign reporting.

## What the public Strava API is

Strava has a public API, but it is an athlete and activity API. The reference
lists resources such as athletes, activities, clubs, routes, and gear. It does
not document ad conversion ingestion, ad click attribution, or advertiser
reporting endpoints. See the [Strava API reference](https://developers.strava.com/docs/reference/).

Developer access is separate from Strava Ads access:

- Create a Strava account and subscribe to Strava.
- Create an app at [Strava API settings](https://www.strava.com/settings/api).
- Use OAuth 2.0. The token exchange is
  `POST https://www.strava.com/oauth/token`.
- Send the resulting access token as `Authorization: Bearer <token>`.
- Access tokens expire. The getting-started guide lists a six-hour lifetime
  and a refresh token.

These credentials read or write data for athletes who authorize the app. They
do not grant Strava Ads access. Do not send a hub conversion to an athlete API
endpoint.

Sources: [Strava getting started](https://developers.strava.com/docs/getting-started/),
[Strava authentication](https://developers.strava.com/docs/authentication/).

## Client-side tag or pixel

Strava does not support a conventional advertiser pixel or third-party cookie.
The official FAQ says this directly. There is no Strava Ads script, browser
SDK, pixel ID, or public tag ID to install.

Do not add any of these as assumed secrets:

```text
STRAVA_ADS_PIXEL_ID
STRAVA_ADS_TAG_ID
STRAVA_ADS_TOKEN
```

Those names are not official Strava Ads configuration. Keep them absent until
a Strava partner gives a written, current contract for a different product.

The conversion page is your site, not Strava. Load your own consented
analytics there. Fire the hub's `page_view`, `signup`, `lead`, `begin_checkout`,
`purchase`, or `subscription_start` event only for the action that occurs on
your site. The hub owns the event envelope and consent gate. See
[`ad-conversion-hub`](../ad-conversion-hub/SKILL.md).

## Server-side conversion API

No public Strava Ads conversion API is documented in the official sources
checked. Therefore there is no verified Strava endpoint, auth header, required
payload field, identity hashing rule, event-name set, or server deduplication
field to implement.

The Strava FAQ mentions a public API for developer access to Strava data. It
tells brands to consult the Strava team for campaign integrations. That is not
a documented self-serve conversion contract. See the [FAQ](https://business.strava.com/why-strava/faqs)
and [API reference](https://developers.strava.com/docs/reference/).

Do not invent or probe an endpoint such as `/conversions`, `/events`, or
`/pixel`. Do not post hashed email, phone, `event_id`, or payment data to the
athlete API. A partner-only postback or reporting feed is UNVERIFIED until the
partner supplies its current endpoint, auth model, fields, retention, and
deduplication rules in writing.

## Canonical event mapping

There is no Strava Ads event mapping today. Keep the adapter out of the
hub's `real-capi` path.

| Hub event | Strava Ads action |
| --- | --- |
| `page_view` | No Strava event. Measure on the reward site. |
| `view_content` | No Strava event. Measure on the reward site. |
| `lead` | No Strava event. Store the lead in your system. |
| `signup` | No Strava event. Store the reward-site signup. |
| `begin_checkout` | No Strava event. Store the checkout in your system. |
| `purchase` | No Strava event. Use payment-provider truth. |
| `subscription_start` | No Strava event. Use subscription truth. |
| `refund` | No Strava event. Use payment-provider truth. |

Do not gate these first-party events on a Strava click ID. A campaign can
still produce useful first-party measurement without a Strava postback.

## Click IDs and attribution

Strava does not document a Strava-owned click parameter or its lifetime. The
official model sends users to a brand website to redeem a reward after they
complete a challenge. See [Sponsored Challenges](https://business.strava.com/challenges).

Do not create `strava_click_id`, `stravaid`, or another guessed parameter. Do
not promise a seven-day or thirty-day Strava attribution window.

Ask the Client Partner whether the campaign link may carry a first-party
campaign code or UTM values. If the partner approves one, capture it on the
reward-site landing request and persist it under your own first-party storage.
Keep first-touch and most-recent values when your measurement design needs
both. Store the value with the canonical event. Follow the hub's click-ID and
consent rules.

The lifetime, query parameter name, and partner reporting join key remain
UNVERIFIED until Strava documents them for the specific campaign.

## Tracking facts that affect implementation

- Strava uses native activations. A user discovers a challenge, participates,
  completes the goal, and then claims a reward on the brand website. A
  website signup, purchase, or donation is your event, not a Strava event.
- Strava reports campaign metrics such as impressions, joins, and completions
  through its business process. The FAQ does not define a public reporting API
  or a conversion-event export.
- Strava does not support traditional retargeting through third-party cookies.
  Do not install a retargeting pixel in the expectation that Strava will use it.
- Strava does not offer inventory through an external ad exchange or DSP.
  Plan for direct partner coordination.
- Strava allows targeting by activity type and geographic location. Its FAQ
  says that it does not allow third-party data or partner targeting methods.
- Strava does not publish personal user data to brands. The agency page says
  that brands receive aggregated campaign insights.
- Pricing is based on campaign scope, market, and duration. It is not
  documented as performance-based pricing in the FAQ.
- Reporting delay, conversion windows, partner link fields, and any offline
  upload format are UNVERIFIED. Get them in the campaign order or partner
  documentation before launch.

Sources: [Strava FAQ](https://business.strava.com/why-strava/faqs),
[Strava agency partners](https://business.strava.com/why-strava/agencies).

## Verification

Use two separate proofs:

1. **First-party proof:** record the reward-site request, campaign code if
   approved, canonical event ID, consent decision, and payment or signup result
   in your own server logs. Reconcile `purchase` and `refund` with the payment
   provider.
2. **Strava campaign proof:** request the Client Partner's campaign report.
   Confirm impressions, challenge joins, and completions against the campaign
   dates and target market. The official FAQ lists these reporting metrics.

There is no public Strava endpoint that proves a conversion event landed. A
successful call to the public athlete API proves only athlete API access. It
does not prove campaign attribution.

## Common pitfalls

- Treating the athlete API as a marketing conversion API.
- Searching for a pixel ID when Strava explicitly says it does not support
  conventional pixels.
- Expecting Meta-style `event_id` deduplication. Strava documents no such
  field for Ads.
- Sending hashed customer lists. Strava says it does not allow third-party
  data or partner targeting methods.
- Counting challenge completions as purchases. A completion may only unlock a
  reward; the payment provider decides whether a purchase occurred.
- Assuming a click ID, attribution window, DSP feed, or delayed-reporting SLA.
  Ask the Client Partner and record the answer for that campaign.
- Letting a missing Strava partner integration block checkout. The hub must
  return `skipped` for this destination, not fail the payment webhook.

## Security

Keep Strava developer client secrets, access tokens, refresh tokens, partner
credentials, and campaign exports in the server secret store. Never place
them in browser bundles, URLs, logs, screenshots, or commits. Strava tells
developers not to share these credentials publicly; see [authentication](https://developers.strava.com/docs/authentication/).

Apply the hub consent gate before sending first-party measurement. Do not send
athlete data or customer identifiers to Strava Ads without a documented
partner contract and a valid consent decision. Keep the adapter disabled until
Strava supplies a current, reviewable Ads contract.
