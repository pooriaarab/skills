---
name: microsoft-ads
description: "Wire Microsoft Advertising conversion tracking for a web app — Bing UET, Microsoft Conversions API, offline conversions keyed by MSCLKID, UET eventId deduplication, ID Sync for remarketing, OAuth plus developer-token access, and server-side validation. Use when setting up Bing Ads, Microsoft Ads, UET, offline conversion import, remarketing, or a small Microsoft Advertising test."
---

# Microsoft Advertising

This skill follows the shared conversion-hub contract. Map the canonical event
to the platform event, send it after the payment provider confirms the charge,
and make an absent `MICROSOFT_ADS_TOKEN` a logged no-op.

## The three-layer conversion model

1. **UET tag.** Install the UET tag on every page. It records browser activity and supports conversion goals and remarketing. [Official UET setup](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master).
2. **Conversions API.** Send the canonical event from the server after the payment provider confirms it. Microsoft documents custom and page-load event types, `eventId`, `eventName`, `customData`, `eventTime`, and `eventSourceUrl`. [Official CAPI guide](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13).
3. **Conversion goal.** Microsoft matches UET or CAPI activity to a conversion goal and counts it after an ad click or view. Include the goal in the account's Conversions column when bidding should use it. [Official attribution guide](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uetv2howctworks).

## Client tag or app attribution

```html
<!-- Use the exact tag code copied from Microsoft Advertising. The account-specific tag is not reproduced here. -->
<script>
  (function(w,d,t,r,u){var f,n,s;w[u]=w[u]||[],f=function(){var o={ti:"<UET_TAG_ID>"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")};
  n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)};
  s=d.getElementsByTagName(t)[0],s.parentNode.insertBefore(n,s)})(window,document,"script","//bat.bing.com/bat.js","uetq");
</script>
```
Use the account's generated tag and do not replace its `ti` value. [Official tag setup](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master). For a purchase, send the same stable `eventId` through UET and CAPI.

## Server-side conversion API

The official guide describes a CAPI request with a UET `tagId`, bearer authorization token, and event objects. The current page defines the fields but does not expose one stable cURL block in its rendered text. Do not invent a URL or body from an old sample:

> ⚠ UNVERIFIED — confirm the current CAPI POST URL and complete JSON envelope at [Microsoft CAPI technical implementation](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13#send-requests).

The verified event fields are `eventType`, `eventId`, `eventName`, `customData` for custom events, and `eventTime`, `eventSourceUrl`, `pageLoadId` for page-load events. The bearer token goes in `Authorization`. The guide states that batches can contain up to 1,000 events. [Source](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13#technical-implementation).

## Get a token and validate it

1. Open [Microsoft Advertising](https://ads.microsoft.com).
2. Open **Tools → UET tag**. Create a tag or edit an existing tag.
3. Select **Save and next → Use Conversions API → Copy Token → Next → Done**. This is the CAPI token, not the general OAuth token. [Official click path](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13#generate-or-retrieve-an-authorization-token-in-microsoft-advertising).
4. Store it as `MICROSOFT_ADS_CAPI_TOKEN`. Store the UET tag ID as `MICROSOFT_ADS_UET_TAG_ID`.

For campaign-management APIs, register an app, request the `https://ads.microsoft.com/msads.manage` scope, and keep the developer token, OAuth refresh token, customer ID, and account ID. [OAuth quick start](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-quick-start?view=bingads-13) and [token exchange](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-get-tokens?view=bingads-13).

Token validation:

```bash
curl -sS https://clientcenter.api.ads.microsoft.com/Api/CustomerManagement/v13/Customers \
  -H "DeveloperToken: $MICROSOFT_ADS_DEVELOPER_TOKEN" \
  -H "AuthenticationToken: $MICROSOFT_ADS_OAUTH_ACCESS_TOKEN" \
  -H "CustomerId: $MICROSOFT_ADS_CUSTOMER_ID" \
  -H "AccountId: $MICROSOFT_ADS_ACCOUNT_ID"
```

⚠ UNVERIFIED — confirm the REST operation and headers against the current [first API call guide](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-quick-start?view=bingads-13) before using this curl in production.

## Audience, retargeting, and lookalike expansion

Microsoft says ID Sync is required for audience creation and remarketing. Fire the client-side sync at least once per session and send it to `https://c.bing.com/c.gif` with the documented `Red3` and `VID` parameters. [Official ID Sync guidance](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13#id-sync-and-why-it-matters).

For customer lists, use Microsoft Advertising's Customer Match or offline-conversion workflow only after confirming account eligibility. Hash email with SHA-256 after trim and lowercase. Microsoft documents hashed email and phone fields for enhanced conversions. [Official enhanced-conversions guide](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_enhancedconversions).

⚠ UNVERIFIED — confirm current Customer Match list API names, minimum matched size, and lookalike eligibility at the [Microsoft Advertising audience documentation](https://learn.microsoft.com/en-us/advertising/). Do not treat an upload response as proof that a list can serve.

## Deduplication and event rules

- Use the same stable transaction ID for the client and server event.
- Do not require a click ID before sending a paid conversion. Organic and direct purchases still matter.
- Attach the platform click ID only when it is present. Persist it in first-party storage when the platform does not keep it.
- Hash email with SHA-256 after trimming and lowercasing. Never send raw email or phone data.
- Make the event name and timestamp match the platform's current schema.

## Small-budget campaign launch

- Create the UET tag and conversion goal before the campaign. Microsoft says a conversion goal can take two hours before offline uploads are accepted. [Source](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uetv2offlineconversion).
- Capture and persist `msclkid`. Microsoft recommends retaining it for 90 days and sending it when available. [Source](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13#send-msclkid-whenever-possible).
- Offline imports require `msclkid`, conversion goal name, and conversion time. API uploads use GMT. A conversion older than 90 days after the click is not imported. [Source](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uetv2offlineconversion).
- Start with one narrow search theme and a controlled bid. Check language, network, location, negative keywords, and auto-tagging before spend.
- ⚠ UNVERIFIED — confirm current Microsoft Ads default network and bid-learning settings in the account UI before launch.

## Verification

Use the Microsoft Advertising UI's UET tag status and conversion-goal reports. For server events, inspect the CAPI response and then compare conversion totals with the payment provider's succeeded charges. Microsoft documents HTTP 200 for accepted CAPI requests and HTTP 400/401 for errors; a 200 is not a serving proof. [CAPI guide](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13).

Check the CAPI token, tag ID, `eventId`, conversion goal name, consent, and `msclkid` before debugging code. A zero window before the tracking deploy is expected. A non-zero payment count with zero Microsoft conversions means the measurement path is broken.

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

Load client code only from the vendor's official HTTPS origin. Keep `MICROSOFT_ADS_TOKEN` in a server-side secret store. Never log or commit it. Send only hashed first-party identifiers when the platform's policy and user consent permit them.

## Official sources checked (2026-08-11)

- https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13
- https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master
- https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uetv2offlineconversion
- https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-get-tokens?view=bingads-13
