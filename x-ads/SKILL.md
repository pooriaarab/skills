---
name: x-ads
description: "X Ads website tag and server conversion tracking, OAuth access, tailored audiences, and campaign verification. Use when setting up X Ads, debugging conversion tracking, building retargeting audiences, or validating a small paid test."
---

# X Ads

This is a breadth-first stub for the shared conversion hub. It is intentionally
conservative where the public documentation does not verify a current API fact.

## The three-layer conversion model

1. **Client tag.** Use the platform's official browser tag or event source.
2. **Server API.** Send the canonical event from the conversion hub after the payment provider confirms it.
3. **Attribution and reporting.** Configure the platform's conversion action so it can count the event and optimize delivery.

This entry is a breadth-first stub. The official product docs do not expose a stable, public, product-agnostic CAPI contract for every account type.

## Client tag or app attribution

Use the exact tag or event code generated in the platform console. Do not copy a stale blog snippet.

> ⚠ UNVERIFIED — confirm the current client tag URL, init call, pixel ID field, and purchase event shape at [X Ads tracking documentation](https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites).

Store the identifier as `X_ADS_PIXEL_ID` or `X_ADS_TAG_ID`, depending on the platform's official naming.

## Server-side conversion API

The platform has an official API surface, but the request shape depends on account product and access level.

> ⚠ UNVERIFIED — confirm the current POST endpoint, auth header, timestamp unit, deduplication field, and JSON payload at [X Ads API documentation](https://developer.x.com/en/docs/x-ads-api).

Do not invent a CAPI request. If the account has no public server conversion API, keep this adapter disabled and use the platform's documented import or partner path.

## Get a token and validate it

1. Open the official console for [X Ads](https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites).
2. Create the pixel, tag, app, or advertiser resource required by the account.
3. Open the current developer, events, or API settings area. Generate the credential required by the documented API.
4. Store it as `X_ADS_TOKEN`. Keep it server-side.

> ⚠ UNVERIFIED — confirm the current click path, OAuth scopes, expiry, and credential type at [X Ads official API docs](https://developer.x.com/en/docs/x-ads-api).

Token validation:

```bash
curl -sS -H "Authorization: Bearer $X_ADS_TOKEN" 'https://developer.x.com/en/docs/x-ads-api'
```

⚠ UNVERIFIED — replace this placeholder with an official read endpoint after the platform publishes one for the enabled product.

## Audience, retargeting, and lookalike expansion

Use the platform's documented site audience, customer-list, or partner upload product.

Normalize and SHA-256 hash email after trim and lowercase only when the official product requires hashed contact data. Verify the audience status in the console.

> ⚠ UNVERIFIED — confirm hashed-email fields, minimum list size, match-rate rules, lookalike or expansion availability, and failure modes at [X Ads audience documentation](https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites).

## Deduplication and hub contract

- Use one canonical event ID for client and server sources when the platform supports deduplication.
- Do not gate a server conversion on a click ID. Add the click ID only when available.
- Make an absent `X_ADS_PIXEL_ID` or `X_ADS_TOKEN` a logged no-op.
- Hash contact data only after consent and only as the official product requires.

## Small-budget campaign launch

- Start with one audience, one geo, one creative, and one conversion goal.
- Disable broad placement, search, audience, and automatic-expansion defaults until they are part of the hypothesis.
- Use traffic or click optimization when the account has no conversion history.
- Set a hard budget cap where the product supports one.
- ⚠ UNVERIFIED — confirm current bid floors, learning thresholds, minimum budgets, and default placements at [X Ads campaign documentation](https://developer.x.com/en/docs/x-ads-api).

## Verification

Use the official test-event view or reporting API for X Ads. Reconcile its conversions with the payment provider's succeeded charges.

> ⚠ UNVERIFIED — confirm the current test-event endpoint, reporting query, delay, and status fields at [X Ads official API docs](https://developer.x.com/en/docs/x-ads-api).

Do not call this stub wired until a real test event appears in the platform surface.

## Hub conventions

Pair this skill with `ad-conversion-hub` for event taxonomy, consent, hashing,
secret names, and multi-platform dispatch. Pair it with `ad-experiments` for
seed sizing, one-variable tests, and payment-provider truth. This platform is
not yet wired into a product integration. Treat every `⚠ UNVERIFIED` marker as
a stop sign before production use.

## Security

Load client code only from the vendor's official HTTPS origin. Keep `X_ADS_TOKEN`
server-side. Never log or commit it. Do not send raw email, phone, or device
identifiers. Follow the platform's current consent and retention rules.

## Official sources checked (2026-08-11)

- https://developer.x.com/en/docs/x-ads-api
- https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites
