---
name: linkedin-ads
description: "Wire LinkedIn Ads conversion tracking for a web app — Insight Tag, LinkedIn Conversions API, REST conversion resources, OAuth bearer access, matched audiences, deduplication, and server-side reporting checks. Use when setting up LinkedIn Campaign Manager, Insight Tag, Conversions API, lead tracking, retargeting, or a small B2B paid test."
---

# LinkedIn Ads

This skill follows the shared conversion-hub contract. Map the canonical event
to the platform event, send it after the payment provider confirms the charge,
and make an absent `LINKEDIN_ADS_TOKEN` a logged no-op.

## The three-layer conversion model

1. **Insight Tag.** Install LinkedIn's tag site-wide. It supports conversion tracking and retargeting. [Official conversion tracking API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05).
2. **Server conversion path.** LinkedIn documents the Conversions API use case separately. Send the canonical event from the server after the payment provider confirms it. [Official Conversions API use case](https://learn.microsoft.com/en-us/linkedin/marketing/conversions/conversions-usecase?view=li-lms-2026-04).
3. **Conversion definition and attribution.** Create a conversion definition in Campaign Manager. LinkedIn attributes the event to an ad when its configured attribution rules match. Do not count a successful HTTP response as attributed conversion proof.

## Client tag or app attribution

LinkedIn provides the exact account-specific Insight Tag from Campaign Manager. Add it site-wide, above the closing `body` tag, then configure the event or URL rule in Campaign Manager. [Official setup](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05#insight-tag).

```html
<!-- Paste the exact tag copied from Campaign Manager. Do not invent the partner ID. -->
<script type="text/javascript">/* LinkedIn Insight Tag: account-specific code */</script>
```

⚠ UNVERIFIED — confirm the current browser event parameter and deduplication field for the version of LinkedIn Conversions API enabled on the ad account.

## Server-side conversion API

LinkedIn documents conversion resources at:

```text
POST https://api.linkedin.com/rest/conversions
```

The documented schema includes `attributionType`, `account`, and conversion rules such as `urlMatchRuleExpression`. [Official REST reference](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05#conversions).

LinkedIn's separate Conversions API can receive server events, but the current official use-case page must be followed for the enabled API version and event payload. Do not copy a legacy `/conversionEvents` body without checking the version:

> ⚠ UNVERIFIED — confirm the current Conversions API POST URL, event schema, timestamp unit, and deduplication field at [LinkedIn Conversions API](https://learn.microsoft.com/en-us/linkedin/marketing/conversions/conversions-usecase?view=li-lms-2026-04).

Set `LINKEDIN_CAPI_TOKEN` as a server secret. Send a shared transaction ID if the enabled API supports duplicate suppression.

## Get a token and validate it

1. Register or configure an app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
2. Request the Marketing API products and scopes that LinkedIn approves for the ad account. Use a 3-legged OAuth flow and keep the refresh token server-side. [Official authentication guide](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication).
3. In Campaign Manager, grant the app or user access to the sponsored account. Store the bearer token as `LINKEDIN_CAPI_TOKEN`.

Token validation:

```bash
curl -sS 'https://api.linkedin.com/rest/insightTags?q=account&account=urn%3Ali%3AsponsoredAccount%3A123456' \
  -H "Authorization: Bearer $LINKEDIN_CAPI_TOKEN" \
  -H 'X-Restli-Protocol-Version: 2.0.0' \
  -H "Linkedin-Version: $LINKEDIN_VERSION"
```

This read endpoint and header set are documented in [Insight Tag API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05#find-insight-tags-by-account). Replace the URN and version with real values.

## Audience, retargeting, and lookalike expansion

LinkedIn Campaign Manager supports Matched Audiences for retargeting and customer lists. The exact list-upload product, hashing behavior, minimum size, and lookalike availability vary by account and product. Keep raw email out of the server payload.

⚠ UNVERIFIED — confirm current customer-list CSV fields, SHA-256 requirements, minimum matched audience size, and whether lookalike expansion is available at [LinkedIn Matched Audiences help](https://www.linkedin.com/help/lms/answer/a427660). Do not state that a list is eligible until Campaign Manager reports a usable audience size.

Site retargeting requires a working Insight Tag on the pages that define the audience. Create the audience from the tag in Campaign Manager, then wait for the platform's eligibility state before targeting it.

## Deduplication and event rules

- Use the same stable transaction ID for the client and server event.
- Do not require a click ID before sending a paid conversion. Organic and direct purchases still matter.
- Attach the platform click ID only when it is present. Persist it in first-party storage when the platform does not keep it.
- Hash email with SHA-256 after trimming and lowercasing. Never send raw email or phone data.
- Make the event name and timestamp match the platform's current schema.

## Small-budget campaign launch

- Start with one narrow job-title or company-size hypothesis. B2B CPMs can make a broad audience expensive before you learn anything.
- Verify the Insight Tag domain and conversion definition before activating ads. The REST API exposes tag-domain and conversion resources. [Source](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05).
- Use a click or landing-page objective when the account has no conversion history. Switch to conversion optimization after the event has enough volume.
- Set geography, seniority, company size, frequency, placement, and negative exclusions deliberately.
- ⚠ UNVERIFIED — confirm current campaign defaults, learning thresholds, and minimum daily budgets in Campaign Manager before spend.

## Verification

Read the conversion and campaign reporting surfaces in Campaign Manager. Validate the tag with the Insight Tag read endpoint, then reconcile attributed conversions with your payment provider's succeeded charges. The REST API may accept a conversion definition even when no ad can receive credit.

Check the account URN, `Linkedin-Version`, OAuth product access, consent, event ID, and domain approval. A zero count before the deploy is expected. A non-zero payment count with zero LinkedIn conversions means the event path or attribution setup needs repair.

## Hub conventions

Pair this skill with `ad-conversion-hub` for canonical event taxonomy, consent,
hashing, secret names, and multi-platform dispatch. Pair it with
`ad-experiments` for one-audience tests, seed sizing, PII-export authorization,
and payment-provider truth. Keep platform adapters thin. A missing secret must
skip only that adapter and must not fail checkout.

## Common pitfalls

- A browser tag can load while the server event is absent.
- A successful API response does not prove attribution or audience eligibility.
- A conversion report can be zero before the tracking deploy or when no ad interaction exists.
- Build-time environment variables need a redeploy after a secret changes.
- Read the account's status and error surfaces. Do not infer delivery from an object-create response.

## Security

Load client code only from the vendor's official HTTPS origin. Keep `LINKEDIN_ADS_TOKEN` in a server-side secret store. Never log or commit it. Send only hashed first-party identifiers when the platform's policy and user consent permit them.

## Official sources checked (2026-08-11)

- https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/conversion-tracking?view=li-lms-2026-05
- https://learn.microsoft.com/en-us/linkedin/marketing/conversions/conversions-usecase?view=li-lms-2026-04
- https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- https://www.linkedin.com/help/lms/answer/a427660
