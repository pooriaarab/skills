---
name: copilot-ads
description: "Track Microsoft Copilot Ads availability and conversion measurement — current beta or waitlist status, the official advertiser entry point, the absence or reuse of a pixel and CAPI, and safe integration boundaries. Use when evaluating Microsoft Copilot Ads, joining an advertiser beta, or deciding whether an ad-conversion adapter exists."
---

# Microsoft Copilot Ads

This is a limited-availability stub. The product surface may change quickly.
The checked official docs define the boundary below. They do not justify an
invented endpoint, token, audience field, or browser tag.

## Availability

Microsoft Advertising serves eligible existing campaigns in Copilot. Microsoft says advertisers cannot opt out and does not currently expose specific Copilot metrics. Tracking uses Microsoft Advertising UET and CAPI, not a separate Copilot API.

Official entry point: [Microsoft Copilot Ads advertiser or product page](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_adsforcopilot).

## The three-layer conversion model

1. **Client layer.** Use the vendor's official tag only when one exists.
2. **Server layer.** Send the canonical event only through a documented API or
approved partner connector.
3. **Counting layer.** Read the product's reporting surface. Do not infer
attribution from a landing-page visit or an accepted request.

## Client tag or app attribution

Copilot has no separate browser tag. Use the Microsoft Advertising UET tag on the advertiser site. [Official UET setup](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master).

## Server-side conversion API

Use Microsoft Advertising Conversions API for the canonical event. Do not create a Copilot-specific endpoint. [Official Microsoft CAPI guide](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13).

> ⚠ UNVERIFIED — confirm whether the current account's Copilot-eligible campaign exposes any separate conversion report.

## Get access and validate it

Use the Microsoft Advertising UET CAPI token and Microsoft Advertising OAuth credentials. Store them under the Microsoft adapter's names, not a second Copilot token. [OAuth guide](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-get-tokens?view=bingads-13).

```bash
curl -sS https://clientcenter.api.ads.microsoft.com/Api/CustomerManagement/v13/Customers \
  -H "DeveloperToken: $MICROSOFT_ADS_DEVELOPER_TOKEN" \
  -H "AuthenticationToken: $MICROSOFT_ADS_OAUTH_ACCESS_TOKEN"
```

⚠ UNVERIFIED — confirm the operation and required account headers at the current Microsoft API quick start.

## Audience, retargeting, and lookalike expansion

No public hashed-email customer-list, lookalike, or retargeting API is verified
for this product entry. Do not upload customer data to a guessed endpoint.

> ⚠ UNVERIFIED — confirm audience availability, minimum list size, matching
rules, and beta eligibility at [Microsoft Copilot Ads official docs](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13).

## Campaign launch rules

- Treat the product as beta, limited, or unavailable until the official console shows access.
- Start with the smallest approved budget and one creative hypothesis.
- Keep the canonical conversion event in the hub even when this adapter is disabled.
- Do not promise platform attribution when the vendor exposes only aggregate views or clicks.
- ⚠ UNVERIFIED — confirm bidding, budget, review, policy, and reporting behavior in the current console.

## Verification

Use the official test-event tool or reporting surface only after the platform
confirms access. Reconcile with payment-provider succeeded charges. A zero count
before the adapter exists is expected. A real charge with no platform event is
not evidence that an API should be guessed.

## Hub conventions

Pair this stub with `ad-conversion-hub` and `ad-experiments`. The hub keeps the
canonical event, consent decision, hash policy, and payment-provider truth. An
absent `COPILOT_ADS_TOKEN` or unavailable beta must be a logged no-op. It must not fail
checkout. Use `meta-ads` or `microsoft-ads` when the official inventory routes
through those platforms.

## Security

Do not load unofficial scripts. Keep approved tokens server-side. Never send raw
email, phone, chat content, memory, or other sensitive context to an ad product.
Apply the vendor's current ad and privacy policy before any activation.

## Official sources checked (2026-08-11)

- https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_adsforcopilot
- https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13
