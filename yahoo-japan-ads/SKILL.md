---
name: yahoo-japan-ads
description: "Set up Yahoo Japan Ads tracking as a regional or CTV adapter — official token or partner access, client tag or app measurement, server conversion shape, audience limits, reporting verification, and explicit unverified boundaries. Use when evaluating Yahoo Japan Ads, planning a regional campaign, or deciding whether a production integration exists."
---

# Yahoo Japan Ads

This is a breadth-first stub. It records the current official entry point and
does not invent undocumented contracts. Product names, endpoints, access rules,
and availability can vary by country and advertiser agreement.

## Availability and official scope

LY Ads documents a server Conversion API at https://conversion-api.yahooapis.jp/v1, the X-TagAccessToken header, tag_id, channel_id, and transaction_id deduplication.

Official source: [Yahoo Japan Ads documentation](https://ads-developers.yahoo.co.jp/en/conversion-api/).

## The three-layer conversion model

1. **Client or app layer.** Load the official tag, SDK, or CTV measurement source.
2. **Server layer.** Send the canonical event through a documented API or approved partner.
3. **Counting layer.** Read the platform's official reporting surface and reconcile it with payment truth.

## Client tag or app measurement

LY Ads documents a tracking tag for Display Ads and Search Ads. Generate the tag in the Campaign Management Tool. [Official Developer Center](https://ads-developers.yahoo.co.jp/en/).

## Server-side conversion API

LY Ads documents the Conversion API server and header:

```text
POST https://conversion-api.yahooapis.jp/v1
X-TagAccessToken: <tag-access-token>
Content-Type: application/json
```

The request includes `tag_id`, and `transaction_id` is used for duplicate
detection. [Official reference](https://ads-developers.yahoo.co.jp/en/conversion-api/post/30590575.html).
Confirm the full event body and event history flow before production use.

## Get a token and validate it

1. Open the official Yahoo Japan Ads developer or advertiser site: [Yahoo Japan Ads](https://ads-developers.yahoo.co.jp/en/conversion-api/).
2. Create the required advertiser, app, tag, or data connection in the official console.
3. Request the API product or managed measurement access if the vendor gates it.
4. Store the approved credential as `YAHOO_JAPAN_ADS_TOKEN`. Keep it server-side.

LY Ads documents a server Conversion API at https://conversion-api.yahooapis.jp/v1, the X-TagAccessToken header, tag_id, channel_id, and transaction_id deduplication.

Token validation:

```bash
curl -sS 'https://ads-developers.yahoo.co.jp/en/conversion-api/' -H "Authorization: Bearer $YAHOO_JAPAN_ADS_TOKEN"
```

⚠ UNVERIFIED — this is a placeholder validation command unless the official
source documents that exact read endpoint and bearer header. Replace it only
with a verified official read operation.

## Audience, retargeting, and lookalike expansion

LY Ads provides tracking tags and conversion APIs that can store audiences. Confirm the account's audience and retargeting surface. Customer-list and lookalike rules are not copied here without a current official source.

## Deduplication and hub contract

- Use one stable payment transaction ID as the event ID when the platform supports deduplication.
- Do not gate the server event on a click ID. Add the ID only when available.
- Make `YAHOO_JAPAN_ADS_PIXEL_ID` and `YAHOO_JAPAN_ADS_TOKEN` absent-safe no-ops.
- Store consent with the canonical event before dispatch.
- Keep region-specific identifiers inside this adapter. The hub keeps one event taxonomy.

## Small-budget launch

- Start with one region, one audience, one creative, and one conversion goal.
- Disable broad expansion and automatic placements until the account's official defaults are known.
- Use traffic or reach when no conversion signal exists. Move to conversion bidding only after real events land.
- Confirm billing, review, currency, local policy, and reporting time zone before spend.
- ⚠ UNVERIFIED — confirm current budget floors, bid rules, learning thresholds, and default placements at the official source.

## Verification

Use the official test-event view, event history, postback response, or reporting
API. Reconcile with payment-provider succeeded charges. A successful token call
does not prove that a conversion can receive ad credit.

> ⚠ UNVERIFIED — confirm the current event-test and reporting operation at the official source.

## Hub conventions

Pair this stub with `ad-conversion-hub` and `ad-experiments`. Keep canonical
events, consent, hash policy, secret names, and payment-provider truth in the
hub. A partner gate or missing secret must produce a logged no-op. It must not
fail checkout.

## Security

Load code only from the vendor's official HTTPS origin. Keep `YAHOO_JAPAN_ADS_TOKEN`
server-side. Never log or commit credentials. Send only consented identifiers,
hashed when the official platform requires hashing.

## Official sources checked (2026-08-11)

- https://ads-developers.yahoo.co.jp/en/conversion-api/
