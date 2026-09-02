---
name: ads-discord
description: "Set up Discord Ads Quests measurement through the sales-led Discord route or the approved Gamesight partner path — self-service account gates, no Discord pixel or public direct Events API schema, Gamesight S2S events, transaction_id deduplication, Referral Key and Touchpoints URL handoff, mobile AppsFlyer versus PC/console Gamesight measurement, consent limits, and server-side verification. Use when wiring Discord Quests tracking, asking for Discord conversion API access, or debugging missing Quest attribution."
---

# Discord Ads (Quests)

Discord Quests are sales-led. The public integration path is a measurement
partner, not a Meta-style public pixel. Discord publishes an Events API and
terms, but not its direct endpoint, schema, or auth details.

Use the [Discord Quests contact form](https://discord.com/ads/quests). Expect a
Discord representative to configure the campaign and measurement handoff. Do
not build a direct adapter from undocumented fields.

## Account and access

For Quests, open the Quests page and select **Get Started**. The page sends
advertisers to a contact form. It does not present a public Quests API-key flow.

Discord also has self-service Ads Manager terms. These require a Team, one Ads
Account, legal business data, tax data, and billing data. Discord may approve,
decline, or condition access. See [Self-Service Advertising Terms, sections 1
and 2](https://support.discord.com/hc/en-us/articles/41619407434391-Discord-Self-Service-Advertising-Terms).

Do not treat Ads Manager access as Quests or Events API access. A Discord
representative configures the Quest campaign and measurement handoff. [Gamesight Discord integration](https://docs.gamesight.io/docs/discord).

For mobile Video Quests, Discord names AppsFlyer. For PC and console publishers,
it names Gamesight for server-to-server events. The Gamesight route is beta and
requires an existing Gamesight integration. [Discord measurement announcement](https://discord.com/press-releases/discord-launches-newest-ad-format-and-partners-with-appsflyer-gamesight-for-ads-measurement).

## Client-side tag or SDK

### Discord browser tag

**UNVERIFIED: no public Discord browser tag, pixel URL, client ID, or vendor
environment-variable name is documented.** Discord's Events API terms describe
server-to-server data and refer to technical documents supplied to a Partner.
They do not define a browser script or pixel. [Events API Terms](https://support.discord.com/hc/en-us/articles/41618861207959-Events-API-Terms).

Do not invent `DISCORD_ADS_PIXEL_ID`, `DISCORD_ADS_TAG_ID`, or a Discord script
URL. This adapter has no Discord client-side secret or public ID.

### Gamesight web measurement

For a Gamesight-backed web game, generate the Web SDK API key and copy the
console-generated snippet into the landing page before events fire. Gamesight
does not publish a fixed script URL or environment-variable name. [Gamesight Web SDK](https://docs.gamesight.io/docs/web-sdk-quick-start).

The SDK can send a purchase event. Use the same `transaction_id` in the web
event and the server event:

```js
gsght('send', {
  type: 'purchase',
  transaction_id: '<payment-event-id>',
  revenue_amount: '25.00',
  revenue_currency: 'usd',
  platform: 'web',
});
```

This is a Gamesight event, not a Discord pixel. Use an internal, non-PII ID with
`gsght('set', 'user_id', ...)`; never use an email. [Gamesight identity guidance](https://docs.gamesight.io/docs/web-sdk-quick-start).

## Server-side conversion API

### Direct Discord Events API

Discord confirms an Events API for server-to-server Event Data and Matching
Attributes. It supports attribution, conversion tracking, analytics, campaign
optimization, and audience matching. [Discord Events API Terms](https://support.discord.com/hc/en-us/articles/41618861207959-Events-API-Terms).

**UNVERIFIED: Discord's public documents do not expose the direct endpoint,
HTTP auth header, version, required JSON fields, timestamp unit, event names,
response body, retry rules, or deduplication field.** The terms require the
Partner to follow technical specifications supplied by Discord. Access is
therefore partner- or rep-gated. Do not send requests to a guessed Discord URL.

Discord says Matching Attributes can include hashed email, phone, or mobile
identifiers. It does not publish normalization, encoding, or field names. Apply
the hub consent gate, but send these fields only after Discord gives the schema.

### Gamesight partner route

Gamesight documents the public server API used by the Discord integration:

```text
POST https://api.ingest.marketing.gamesight.io/events
Authorization: <GAMESIGHT_API_KEY>
X-Api-Version: 1.1.0
Content-Type: application/json
```

Required body fields are `type`, `user_id`, and `identifiers`. Optional fields
include `revenue_currency`, `revenue_amount`, `external_ids`, `timestamp`,
`transaction_id`, `gameplay_session_id`, `metadata`, `attribution`, and
`consent_scopes`. A successful request returns HTTP `201`.
[Gamesight Events API reference](https://docs.gamesight.io/reference/measurement-api-events).

Send events from the backend after the business event. Use a stable, private
`user_id`; `identifiers` carries device signals. Pass the player's IP when
required. [Gamesight Measurement API quick start](https://docs.gamesight.io/docs/rest-api-quick-start).

Gamesight documents these revenue fields for a purchase:

```json
{
  "type": "purchase",
  "user_id": "internal-user-123",
  "identifiers": { "os": "Windows 10", "resolution": "1920x1080" },
  "revenue_currency": "usd",
  "revenue_amount": 25.0,
  "transaction_id": "<payment-event-id>"
}
```

These fields belong to Gamesight. Discord receives the configured postback
through the partner integration. [Gamesight Discord guide](https://docs.gamesight.io/docs/discord).

## Event mapping

The hub owns canonical names. Discord publishes no direct event names at all, so
there is no mapping table to give: every hub event maps to a Gamesight goal you
create yourself, with the same name. Only `purchase` is a documented Gamesight
event; the rest are custom goals, and revenue treatment on `refund` is not
documented either.

Gamesight event names are not Discord event names. [Gamesight event naming](https://docs.gamesight.io/docs/additional-events).

## Deduplication

For the Gamesight route, use `transaction_id`. Gamesight enforces one processed
event per `transaction_id`. Put the same payment event ID in the client
purchase and server purchase. This is the documented Gamesight deduplication
field, not `event_id`. [Gamesight Events API reference](https://docs.gamesight.io/reference/measurement-api-events).

**UNVERIFIED: Discord's direct EAPI client/server deduplication field.** Do not
assume it accepts `event_id`, `eventID`, or `conversion_id`.

Follow `ad-conversion-hub` for dispatch records, absent-secret skips, retry
limits, consent, and reconciliation. Never gate a server purchase on a click ID.

## Click IDs and touchpoints

The Gamesight Discord integration does not use click or impression tracking
URLs. It uses a **Referral Key** and **Touchpoints URL**. Copy both from the
Gamesight tracker and give them to the Discord representative. [Gamesight Discord guide](https://docs.gamesight.io/docs/discord).

There is no documented Discord query parameter click ID or retention period.
**UNVERIFIED: Referral Key lifetime, Touchpoints URL lifetime, and any direct
Discord click parameter.** Do not create `discord_click_id`.

Gamesight's Web SDK can collect UTM parameters. Its optional `gsid` is a
Gamesight session ID for web-to-game matching, not a Discord click ID. Its
retention period is UNVERIFIED. [Gamesight session matching](https://docs.gamesight.io/docs/web-sdk-self-distribution).

## Tracking quirks that bite

- **Quests are incentivized.** Do not treat rewarded engagement as a paid
  conversion. Discord filters automated and fraudulent activity. [Terms](https://support.discord.com/hc/en-us/articles/41619407434391-Discord-Self-Service-Advertising-Terms).
- **Gamesight postbacks are locked.** Ask the Discord representative to change
  event or goal triggers. [Gamesight Discord guide](https://docs.gamesight.io/docs/discord).
- **Mobile and PC/console use different paths.** AppsFlyer covers mobile.
  Gamesight covers PC and console S2S beta access. [Discord announcement](https://discord.com/press-releases/discord-launches-newest-ad-format-and-partners-with-appsflyer-gamesight-for-ads-measurement).
- **Quest availability depends on client and region.** Verify supported clients
  before launch. [Quests FAQ](https://support.discord.com/hc/en-us/articles/22225719947543-Discord-Quests-FAQ).
- **Attribution window and delay are UNVERIFIED.** Ask the rep for the window,
  timezone, event SLA, and late-event policy before launch.
- **Discord reporting is limited.** Results may be aggregated or anonymized.
  Discord measurements control billing. [Attribution Terms](https://support.discord.com/hc/en-us/articles/37892056948759-Attribution-Measurement-Terms).
- **Direct EAPI activation has broad scope.** Send only approved campaign data.
  [Events API Terms](https://support.discord.com/hc/en-us/articles/41618861207959-Events-API-Terms).
- **Gamesight cost aggregation is manual for Discord.** Use manual cost upload.
  [Gamesight Discord guide](https://docs.gamesight.io/docs/discord).

## Verification

For Gamesight, treat HTTP `201` from `/events` as request proof only. Store the
response and dispatch record. Then query Gamesight reporting:

```text
POST https://api.marketing.gamesight.io/stats
Authorization: <GAMESIGHT_ADVERTISER_API_KEY>
X-Api-Version: 3.0.0
```

The stats request requires `game_id`, `fields`, `groups`, and `filters`. Request
`goals`, `goal_rate`, `goal_revenue_amount`, and `goal_revenue_currency`.
Use the Advertiser-scoped key. [Gamesight Stats API](https://docs.gamesight.io/reference/stats-v3).

For direct Discord EAPI, **UNVERIFIED: no public event read or test endpoint.**
Use the Ads Manager or representative report. A successful request is not
platform proof. Reconcile attributed purchases with payment-provider charges.

## Common pitfalls

- Adding a Meta-style pixel, `event_id`, `fbclid`, or guessed script URL.
- Calling the Discord Events API with a bot token or webhook.
- Assuming Ads Manager approval includes Quests or EAPI approval.
- Using raw email, usernames, or public IDs as `user_id`.
- Sending the Gamesight key to the browser.
- Expecting a click ID or editable postback in Gamesight.
- Treating `201` or a dashboard count as payment truth.
- Sending under-age, sensitive, or non-consented data.

## Hub adapter configuration

The public Gamesight adapter may use these local names:

```text
DISCORD_ADS_GAMESIGHT_API_KEY   server secret; repository convention
DISCORD_ADS_GAMESIGHT_GAME_ID   reporting config; repository convention
```

These are not Discord-defined environment-variable names. There is no verified
Discord pixel ID environment variable. A missing Gamesight key returns
`skipped`; it must not fail payment processing. Keep canonical event names and
consent handling in `ad-conversion-hub`.

## Security

Keep Gamesight API keys in the deployment secret store. Keep them out of client
bundles, URLs, logs, screenshots, and commits. Do not log user or device data,
Referral Keys, or Touchpoints URLs.

Apply the hub's `measurement` and `ad_user_data` gates before dispatch. Discord
requires a lawful basis, privacy notice, and consent or authorization. Its
terms exclude sensitive data and users below 13 or the applicable age. [Events API Terms](https://support.discord.com/hc/en-us/articles/41618861207959-Events-API-Terms).
Send only fields that the approved integration needs. Use internal non-PII IDs.
Retain consent and dispatch decisions. Delete temporary normalized identifiers after dispatch.
