---
name: tencent-ads
description: "Set up Tencent Ads tracking as a regional or CTV adapter — official token or partner access, client tag or app measurement, server conversion shape, audience limits, reporting verification, and explicit unverified boundaries. Use when evaluating Tencent Ads, planning a regional campaign, or deciding whether a production integration exists."
---

# Tencent Ads

This is a breadth-first stub. It records the current official entry point and
does not invent undocumented contracts. Product names, endpoints, access rules,
and availability can vary by country and advertiser agreement.

## Availability and official scope

Tencent advertising API and conversion tracking access is product and account gated. Confirm the current Tencent Marketing API documentation before integration.

Official source: [Tencent Ads documentation](https://e.qq.com/ads/).

## The three-layer conversion model

1. **Client or app layer.** Load the official tag, SDK, or CTV measurement source.
2. **Server layer.** Send the canonical event through a documented API or approved partner.
3. **Counting layer.** Read the platform's official reporting surface and reconcile it with payment truth.

## Client tag or app measurement

> ⚠ UNVERIFIED — confirm the official browser tag, app SDK, or CTV
measurement source at [Tencent Ads](https://e.qq.com/ads/). Use only code copied from the vendor
console. Store the public ID as `TENCENT_ADS_PIXEL_ID` or `TENCENT_ADS_TAG_ID` after the vendor
confirms its name.

## Server-side conversion API

> ⚠ UNVERIFIED — confirm the current server conversion endpoint,
auth header, timestamp unit, deduplication key, and JSON payload at the official
source: [Tencent Ads](https://e.qq.com/ads/).

Do not invent an endpoint for this regional or managed-advertiser product. If the
vendor requires a partner or sales agreement, record that gate and keep the hub
adapter disabled until access is granted.

## Get a token and validate it

1. Open the official Tencent Ads developer or advertiser site: [Tencent Ads](https://e.qq.com/ads/).
2. Create the required advertiser, app, tag, or data connection in the official console.
3. Request the API product or managed measurement access if the vendor gates it.
4. Store the approved credential as `TENCENT_ADS_TOKEN`. Keep it server-side.

Tencent advertising API and conversion tracking access is product and account gated. Confirm the current Tencent Marketing API documentation before integration.

Token validation:

```bash
curl -sS 'https://e.qq.com/ads/' -H "Authorization: Bearer $TENCENT_ADS_TOKEN"
```

⚠ UNVERIFIED — this is a placeholder validation command unless the official
source documents that exact read endpoint and bearer header. Replace it only
with a verified official read operation.

## Audience, retargeting, and lookalike expansion

> ⚠ UNVERIFIED — confirm site retargeting, customer-list upload, hashed-email
fields, minimum usable size, lookalike expansion, and eligibility at [Tencent Ads](https://e.qq.com/ads/).

Normalize email with trim → lowercase → SHA-256 only when the official product
requires it and consent permits it. Never treat upload success as serving proof.

## Deduplication and hub contract

- Use one stable payment transaction ID as the event ID when the platform supports deduplication.
- Do not gate the server event on a click ID. Add the ID only when available.
- Make `TENCENT_ADS_PIXEL_ID` and `TENCENT_ADS_TOKEN` absent-safe no-ops.
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

Load code only from the vendor's official HTTPS origin. Keep `TENCENT_ADS_TOKEN`
server-side. Never log or commit credentials. Send only consented identifiers,
hashed when the official platform requires hashing.

## Official sources checked (2026-08-11)

- https://e.qq.com/ads/
