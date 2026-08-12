---
name: perplexity-ads
description: "Track Perplexity Ads availability and conversion measurement — current beta or waitlist status, the official advertiser entry point, the absence or reuse of a pixel and CAPI, and safe integration boundaries. Use when evaluating Perplexity Ads, joining an advertiser beta, or deciding whether an ad-conversion adapter exists."
---

# Perplexity Ads

This is a limited-availability stub. The product surface may change quickly.
The checked official docs define the boundary below. They do not justify an
invented endpoint, token, audience field, or browser tag.

## Availability

No official Perplexity advertiser console, pixel, CAPI, or audience API was found in the checked first-party docs. Treat availability as unverified and do not send data.

Official entry point: [Perplexity Ads advertiser or product page](https://www.perplexity.ai/).

## The three-layer conversion model

1. **Client layer.** Use the vendor's official tag only when one exists.
2. **Server layer.** Send the canonical event only through a documented API or
approved partner connector.
3. **Counting layer.** Read the product's reporting surface. Do not infer
attribution from a landing-page visit or an accepted request.

## Client tag or app attribution

No public first-party browser tag is documented for Perplexity Ads.

> ⚠ UNVERIFIED — confirm whether the product has an advertiser pixel, tag, or
conversion event source at [Perplexity Ads](https://www.perplexity.ai/). Do not install a guessed script.

## Server-side conversion API

No public first-party server conversion endpoint is documented for Perplexity Ads.

> ⚠ UNVERIFIED — confirm whether a CAPI, postback, or partner measurement API
exists at [Perplexity Ads official site](https://www.perplexity.ai/) before sending any event.

## Get access and validate it

1. Open [Perplexity Ads](https://www.perplexity.ai/).
2. Look for a documented advertiser onboarding or beta request path.
3. Do not create a token unless the official product provides one. Store any approved credential as `PERPLEXITY_ADS_TOKEN`.

Token validation:

```bash
curl -sS -H "Authorization: Bearer $PERPLEXITY_ADS_TOKEN" 'https://www.perplexity.ai/'
```

⚠ UNVERIFIED — this is a placeholder only. No official read endpoint was found.

## Audience, retargeting, and lookalike expansion

No public hashed-email customer-list, lookalike, or retargeting API is verified
for this product entry. Do not upload customer data to a guessed endpoint.

> ⚠ UNVERIFIED — confirm audience availability, minimum list size, matching
rules, and beta eligibility at [Perplexity Ads official docs](https://www.perplexity.ai/help-center/en/articles/10352155-what-is-perplexity).

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
absent `PERPLEXITY_ADS_TOKEN` or unavailable beta must be a logged no-op. It must not fail
checkout. Use `meta-ads` or `microsoft-ads` when the official inventory routes
through those platforms.

## Security

Do not load unofficial scripts. Keep approved tokens server-side. Never send raw
email, phone, chat content, memory, or other sensitive context to an ad product.
Apply the vendor's current ad and privacy policy before any activation.

## Official sources checked (2026-08-11)

- https://www.perplexity.ai/
- https://www.perplexity.ai/help-center/en/articles/10352155-what-is-perplexity
