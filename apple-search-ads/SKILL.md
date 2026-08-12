---
name: apple-search-ads
description: "Apple Search Ads app attribution and Campaign Management API reporting, with no website pixel or email-based audience upload. Use when setting up Apple Search Ads, debugging conversion tracking, building retargeting audiences, or validating a small paid test."
---

# Apple Search Ads

This is a breadth-first stub for the shared conversion hub. It is intentionally
conservative where the public documentation does not verify a current API fact.

## The three-layer conversion model

1. **On-device attribution.** Apple documents AdServices attribution for apps. [Official AdServices docs](https://developer.apple.com/documentation/apple_search_ads_api).
2. **Server verification.** Send the device attribution token to the server, then verify it with Apple's documented service.
3. **Campaign reporting.** Use the Apple Search Ads Campaign Management API to read campaign and reporting data. [Official API docs](https://developer.apple.com/documentation/adservices).

## Client tag or app attribution

Apple Search Ads has no website pixel. This is an app-install attribution flow. Call the platform's current AdServices API from the app and send the returned token to your server.

> ⚠ UNVERIFIED — confirm the current Swift call and token lifetime at [Apple AdServices](https://developer.apple.com/documentation/adservices).

## Server-side conversion API

> ⚠ UNVERIFIED — confirm the current POST URL, authorization, and JSON response at [Apple AdServices](https://developer.apple.com/documentation/adservices).

Do not invent a website CAPI endpoint. Store the attribution response with the app install or subscription event. Use the Campaign Management API for reporting, not for website conversion ingestion.

## Get a token and validate it

1. Open [Apple Search Ads](https://searchads.apple.com).
2. Open **Account Settings → API** or the current API-user area.
3. Create the API credential and store it as `APPLE_SEARCH_ADS_TOKEN`.

> ⚠ UNVERIFIED — confirm the current API-user click path, OAuth grant, scopes, and token endpoint at [Apple Search Ads API authentication](https://developer.apple.com/documentation/adservices).

Token validation:

```bash
curl -sS 'https://api.searchads.apple.com/api/v5/acls' -H "Authorization: Bearer $APPLE_SEARCH_ADS_TOKEN"
```

⚠ UNVERIFIED — confirm the current ACL path and bearer format in the official API reference before use.

## Audience, retargeting, and lookalike expansion

Apple Search Ads targets apps and search intent. It does not provide a website Customer Match flow. Use the documented customer type and app targeting controls.

⚠ UNVERIFIED — confirm current audience controls and eligibility at [Apple Search Ads help](https://searchads.apple.com/help). Do not upload email lists.

## Deduplication and hub contract

- Use one canonical event ID for client and server sources when the platform supports deduplication.
- Do not gate a server conversion on a click ID. Add the click ID only when available.
- Make an absent `APPLE_SEARCH_ADS_PIXEL_ID` or `APPLE_SEARCH_ADS_TOKEN` a logged no-op.
- Hash contact data only after consent and only as the official product requires.

## Small-budget campaign launch

- Confirm the app, country, billing, and attribution settings before launch.
- Start with one app, one country, and one search theme. Review broad-match and search-match defaults before spend.
- Keep an install or subscription event separate from an impression or tap metric.
- ⚠ UNVERIFIED — confirm current bid floors, default search match, and learning behavior in the account UI.

## Verification

Read campaign and reporting data through the Campaign Management API and reconcile installs or subscriptions with App Store Connect or the payment provider. A token accepted by the API does not prove that an app returned an attribution token.

## Hub conventions

Pair this skill with `ad-conversion-hub` for event taxonomy, consent, hashing,
secret names, and multi-platform dispatch. Pair it with `ad-experiments` for
seed sizing, one-variable tests, and payment-provider truth. This platform is
not yet wired into a product integration. Treat every `⚠ UNVERIFIED` marker as
a stop sign before production use.

## Security

Load client code only from the vendor's official HTTPS origin. Keep `APPLE_SEARCH_ADS_TOKEN`
server-side. Never log or commit it. Do not send raw email, phone, or device
identifiers. Follow the platform's current consent and retention rules.

## Official sources checked (2026-08-11)

- https://developer.apple.com/documentation/adservices
- https://developer.apple.com/documentation/apple_search_ads_api
- https://searchads.apple.com/help
