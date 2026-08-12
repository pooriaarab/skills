---
name: meta-ai-ads
description: "Track Meta AI Ads availability and conversion measurement — current beta or waitlist status, the official advertiser entry point, the absence or reuse of a pixel and CAPI, and safe integration boundaries. Use when evaluating Meta AI Ads, joining an advertiser beta, or deciding whether an ad-conversion adapter exists."
---

# Meta AI Ads

This is a limited-availability stub. The product surface may change quickly.
The checked official docs define the boundary below. They do not justify an
invented endpoint, token, audience field, or browser tag.

## Availability

Meta documents AI interactions as a factor in ad recommendations on Meta platforms. It does not document a separate Meta AI advertiser pixel, CAPI, token, or audience API. Use Meta Ads APIs and Meta Pixel/CAPI for Meta inventory.

Official entry point: [Meta AI Ads advertiser or product page](https://about.fb.com/news/2025/10/improving-your-recommendations-apps-ai-at-meta/).

## The three-layer conversion model

1. **Client layer.** Use the vendor's official tag only when one exists.
2. **Server layer.** Send the canonical event only through a documented API or
approved partner connector.
3. **Counting layer.** Read the product's reporting surface. Do not infer
attribution from a landing-page visit or an accepted request.

## Client tag or app attribution

Use the Meta Pixel for Meta inventory. There is no Meta AI-specific client tag. [Meta Pixel](https://developers.facebook.com/docs/meta-pixel/).

## Server-side conversion API

Use Meta Conversions API with the Meta Pixel ID and shared `event_id`. There is no separate Meta AI server endpoint. [Meta CAPI](https://developers.facebook.com/docs/marketing-api/conversions-api/).

> ⚠ UNVERIFIED — confirm whether any Meta AI placement exposes a separate reporting breakdown for the account.

## Get access and validate it

Use the Meta Events Manager CAPI token for the dataset. Events Manager → dataset → Settings → Conversions API → Generate access token. Store it as `META_CAPI_TOKEN`, not a Meta AI token. [Official Meta CAPI docs](https://developers.facebook.com/docs/marketing-api/conversions-api/).

```bash
curl -sS "https://graph.facebook.com/v21.0/me?access_token=$META_CAPI_TOKEN"
```

Use the current Graph version supported by the account. The read response proves token validity, not Meta AI delivery.

## Audience, retargeting, and lookalike expansion

No public hashed-email customer-list, lookalike, or retargeting API is verified
for this product entry. Do not upload customer data to a guessed endpoint.

> ⚠ UNVERIFIED — confirm audience availability, minimum list size, matching
rules, and beta eligibility at [Meta AI Ads official docs](https://developers.facebook.com/docs/marketing-api/conversions-api/).

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
absent `META_AI_ADS_TOKEN` or unavailable beta must be a logged no-op. It must not fail
checkout. Use `meta-ads` or `microsoft-ads` when the official inventory routes
through those platforms.

## Security

Do not load unofficial scripts. Keep approved tokens server-side. Never send raw
email, phone, chat content, memory, or other sensitive context to an ad product.
Apply the vendor's current ad and privacy policy before any activation.

## Official sources checked (2026-08-11)

- https://about.fb.com/news/2025/10/improving-your-recommendations-apps-ai-at-meta/
- https://developers.facebook.com/docs/marketing-api/conversions-api/
