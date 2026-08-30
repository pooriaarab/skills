---
name: microsoft-ads
description: "Use when setting up Microsoft Advertising or Bing Ads signup, UET tags, conversion goals, the UET Conversions API, MSCLKID attribution, offline conversions, enhanced conversions, or Microsoft Ads event debugging."
---

# Microsoft Advertising
Microsoft Advertising has a public server-side UET Conversions API. Its bearer
token belongs to a UET tag. It is not the normal Microsoft Advertising OAuth
token. Use UET and CAPI together with the same `eventId` and compatible
`eventName` values for one conversion. [CAPI guide](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

This skill maps `ad-conversion-hub`. The hub owns canonical events, consent,
identity, retries, and the payment record. This file owns Microsoft syntax.

## Account and access
Use self-serve signup. Go to [Microsoft Advertising](https://ads.microsoft.com), sign in with a Microsoft account, and create an advertiser account. Set up billing before campaigns can run. Payment options depend on market and account type. [New advertiser FAQ](https://about.ads.microsoft.com/en/get-started/new-advertiser-faqs) [Billing setup](https://help.ads.microsoft.com/apex/index/3/en-us/53091)

For campaign-management API access, register an application, get user consent
for `https://ads.microsoft.com/msads.manage`, and keep the OAuth access and
refresh tokens. Request a production Developer Token. Give the OAuth user
access to the customer and advertiser account. [API getting started](https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13) [OAuth tokens](https://learn.microsoft.com/en-us/advertising/guides/authentication-oauth-get-tokens?view=bingads-13)

The Bing Ads API uses `AuthenticationToken` and `DeveloperToken` headers, plus
`CustomerId` and `CustomerAccountId` where required. A Developer Token does not
grant account permissions. [API credentials](https://learn.microsoft.com/en-us/advertising/guides/get-started?view=bingads-13)

Create a UET tag and a matching conversion goal for each action. UET is
required for conversion tracking and remarketing. [UET overview](https://learn.microsoft.com/en-us/advertising/guides/universal-event-tracking?view=bingads-13)

### CAPI token gate
The CAPI token is a separate UET tag authorization token. In the UI, edit the
UET tag, select **Save and next**, select **Use Conversions API**, then select
**Copy Token**. Microsoft labels this UI token program as a pilot. If the option
is absent, contact the account manager. Do not use the OAuth token at the CAPI
endpoint. [Token setup and pilot note](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

An owner can create or retrieve the token through
`POST /CampaignManagement/v13/UetTagAuthKey/Query`. Send OAuth authentication,
the Developer Token, customer ID, and `{ "TagId": <id> }`. A shared-tag user
can retrieve an existing token but cannot create one. [Tag auth-key operation](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

Use these adapter names. They are not Microsoft-defined environment variables:

```text
MICROSOFT_ADS_UET_TAG_ID       public UET tag ID
MICROSOFT_ADS_CAPI_TOKEN       server-only UET CAPI bearer token
MICROSOFT_ADS_DEVELOPER_TOKEN  server-only Bing Ads API developer token
MICROSOFT_ADS_CLIENT_ID        OAuth application ID
MICROSOFT_ADS_CLIENT_SECRET    OAuth secret for a server web app
MICROSOFT_ADS_REFRESH_TOKEN    server-only OAuth refresh token
MICROSOFT_ADS_CUSTOMER_ID      Microsoft customer ID
MICROSOFT_ADS_ACCOUNT_ID       Microsoft advertiser account ID
```

## Client-side UET tag
Copy the generated tag code. Load it on every page in the `head` or `body`.
A site-wide layout is the safest location. [UET installation](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master)

```html
<script>
  (function(w,d,t,r,u){
    var f,n,i;
    w[u]=w[u]||[];
    f=function(){var o={ti:"<MICROSOFT_ADS_UET_TAG_ID>"};o.q=w[u];w[u]=new UET(o);w[u].push("pageLoad")};
    n=d.createElement(t);n.src=r;n.async=1;
    n.onload=n.onreadystatechange=function(){var s=this.readyState;if(s&&s!=="loaded"&&s!=="complete")return;f();n.onload=n.onreadystatechange=null};
    i=d.getElementsByTagName(t)[0];i.parentNode.insertBefore(n,i);
  })(window,document,"script","https://bat.bing.com/bat.js","uetq");
</script>
```

For a client conversion, put the shared hub ID in UET's `event_id` property:

```js
window.uetq = window.uetq || [];
window.uetq.push("event", "purchase", {
  event_id: canonicalEvent.event_id,
  revenue_value: canonicalEvent.value,
  currency: canonicalEvent.currency
});
```

The client field is `event_id`. The CAPI field is `eventId`. Keep the value
identical. Send the event only after the hub consent gate allows measurement.
[UET custom events and deduplication](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

For a single-page app, use `enableAutoSpaTracking: true` in the generated
snippet, or disable auto tracking and send page loads manually. Do not do both.
A custom event sent before its SPA page load can attach to the previous page.
[SPA UET behavior](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master)

For cross-context attribution and dynamic remarketing, send ID Sync from the
browser at least once per session:

```html
<img src="https://c.bing.com/c.gif?vid=<VID>&Red3=BACID_<CUSTOMER_ID>&uid=<UID>" alt="">
```

`Red3` is the Microsoft customer ID, not the UET tag ID. `uid` is optional and
must be anonymized. CAPI `anonymousId` must equal ID Sync `vid`. [ID Sync](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

## Server-side UET Conversions API
Send a custom event after the payment provider confirms the charge:

```http
POST https://capi.uet.microsoft.com/v1/<MICROSOFT_ADS_UET_TAG_ID>/events
Authorization: Bearer <MICROSOFT_ADS_CAPI_TOKEN>
Content-Type: application/json
```

```json
{
  "data": [{
    "eventType": "custom",
    "eventId": "<canonical-event-id>",
    "eventName": "purchase",
    "eventTime": 1744430084,
    "userData": {
      "anonymousId": "<stable-anonymous-id>",
      "msclkid": "<msclkid-if-present>",
      "em": "<microsoft-normalized-email-sha256>",
      "clientUserAgent": "<end-user-agent>",
      "clientIpAddress": "<end-user-ip>"
    },
    "customData": {
      "transactionId": "<payment-provider-transaction-id>",
      "value": 25.0,
      "currency": "USD",
      "pageType": "purchase"
    },
    "adStorageConsent": "G"
  }]
}
```

`data` is required. `eventType` is `custom` or `pageLoad`. `eventTime` is Unix
UTC seconds and must be within the last seven days. Every event needs
`userData` with at least one supported identifier. A page load also needs
`eventSourceUrl` and should use a v4 UUID `pageLoadId`. Batches support 1,000
events. [CAPI payload reference](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

Apply identity rules after the hub consent gate:

- For email, trim whitespace, remove dots from the user part, remove a trailing
  `+alias` from the user part, lowercase the full address, then SHA-256 hash it.
- Convert phone numbers to E.164 with country code, then SHA-256 hash them.
- Send hashes in `userData.em` and `userData.ph`.
- Never send a raw email, phone number, or real user ID.
- Send the hub's hashed stable user ID as `externalId` when available.
- Send end-user agent and IP when available and legally permitted.

Microsoft can remove an invalid optional hash and still return HTTP 200. Treat
that response as partial data loss. [Hashed identifier rules](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

## Canonical event mapping

Create goals that use these event actions. Keep one exact spelling in the
adapter. The UET guide lists the standard ecommerce action names. [UET event actions](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master)

| Hub event | CAPI `eventType` | Microsoft event name or action |
| --- | --- | --- |
| `page_view` | `pageLoad` | No custom name; send `eventSourceUrl` and `pageLoadId` |
| `view_content` | `custom` | `view_item` |
| `lead` | `custom` | `generate_lead` |
| `signup` | `custom` | `sign_up` |
| `begin_checkout` | `custom` | `begin_checkout` |
| `purchase` | `custom` | `purchase` |
| `subscription_start` | `custom` | `subscription_start` |
| `refund` | `custom` | `refund` |

`subscription_start` is an adapter convention for a custom goal. Create the
goal with the same action name. Microsoft custom action matching is
case-insensitive. [Conversion goal behavior](https://github.com/MicrosoftDocs/Advertising/blob/main/advertising/msa-help/hlp_BA_CONC_UETv2HowCTWorks.md)

## Deduplication

Microsoft reconciles a UET event and its CAPI twin with `eventId`. Put the same
hub ID in both places: browser UET `event_id`, and server CAPI `eventId`. Keep
the same UET tag ID and a compatible `eventName`. Preserve the ID on retries.
[CAPI deduplication](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

## MSCLKID and attribution

When auto-tagging is enabled, Microsoft appends lowercase `msclkid` to the
landing-page URL. Capture it on first landing. Store the latest value in a
first-party cookie, local storage, or a server record tied to the user. Replace
it when a newer click arrives. Microsoft suggests 90 days of retention. Do not
gate a server purchase on this ID. Use hashed identity or `anonymousId` when it
is absent. [MSCLKID in CAPI](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

Offline imports are separate from CAPI. They need an offline conversion goal,
click ID, goal name, conversion time, and value when used. Microsoft will not
import a conversion more than 90 days after the last click. [Offline conversions](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uetv2offlineconversion)

## Tracking quirks that bite

- The CAPI token UI is a pilot. Contact the account manager if the option is missing.
- CAPI accepts only events from the last seven days. Use a timely queue for payment webhooks.
- Omitted `adStorageConsent` defaults to granted. Send `G` only after the hub allows measurement. `D` blocks advertising use, including attribution and retargeting. [Consent signals](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)
- Microsoft needs a prior ad view or click to attribute a conversion. An organic purchase can be accepted but will not appear as an ad conversion.
- The conversion window ranges from one minute to 90 days. The default is 30 days. Counting can be `All` or `Unique`. Include the goal in the **Conversions** column for bidding. [Attribution settings](https://github.com/MicrosoftDocs/Advertising/blob/main/advertising/msa-help/hlp_BA_CONC_UETv2HowCTWorks.md)
- Reports can take two hours for UET conversions and five hours for non-UET conversions. [Reporting timing](https://github.com/MicrosoftDocs/Advertising/blob/main/advertising/msa-help/hlp_BA_CONC_UETv2HowCTWorks.md)
- A UET tag marked active proves only that some UET activity arrived. It does not prove custom-event or revenue delivery. [UET status limits](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master)
- A `HealthWellness` UET tag can filter events from audience targeting. Use separate tags for health and non-health traffic. [UET industry filtering](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_uet_setup_master)

## Verification

Prove delivery from the server response before checking attribution:

1. Require HTTP 200 from `capi.uet.microsoft.com`.
2. Record `eventsReceived`, `ValidationError`, and `ValidationWarning` details.
3. Require zero validation errors. Treat warnings as data loss when they remove identity, value, or currency.
4. Check the matching conversion goal after the reporting delay.
5. Reconcile the result with payment-provider succeeded charges.

A 200 proves accepted processing, not attribution. A 401 means the token is
missing, wrong, or unauthorized for the tag. A 400 identifies an invalid
field. `eventsReceived` is the server-side landing proof. [CAPI validation and errors](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)

## Common pitfalls

- Send the UET CAPI token to CAPI, not the OAuth `AuthenticationToken`.
- Use `BACID_<customer-id>` for `Red3`, not the UET tag ID.
- Do not send `event_id` to CAPI or change the ID between client and server.
- Send `eventTime` in seconds and within seven days.
- Do not gate server events on `msclkid`.
- Do not double-hash identifiers or skip Microsoft's extra email rules.
- Match the goal, event action, and **Include in Conversions** setting.
- Do not treat HTTP 200 as complete success when warnings are present.
- Do not run both automatic and manual SPA page-load tracking.
- Do not install the same UET tag twice on the confirmation page.

## Security

Keep CAPI tokens, OAuth secrets, refresh tokens, and Developer Tokens in the
server secret store. Never put them in browser code, URLs, logs, analytics
events, screenshots, or commits. Load UET and ID Sync only from official HTTPS
Microsoft origins. Hash identifiers only after consent permits ad-user data.
Limit raw identity access and delete temporary normalized values after dispatch.
[Microsoft privacy and consent](https://learn.microsoft.com/en-us/advertising/guides/uet-conversion-api-integration?view=bingads-13)
