---
name: apple-search-ads
description: "Set up Apple Ads for App Store campaigns and app attribution — Advanced or Basic signup, App Store Connect linking, Apple Ads API OAuth, AdServices attributionToken(), the 24-hour token limit, no website pixel or conversion-event CAPI, 30-day tap and one-day view attribution, Search Match defaults, audience limits, China approval, and server-side reporting checks. Use when wiring Apple Search Ads, debugging missing installs, configuring Apple Ads API access, or separating app attribution from web conversion tracking."
---

# Apple Search Ads

Apple Ads is an App Store advertising platform. It has no website pixel or
public API for web signup or purchase events. Its public measurement tools
retrieve app-install attribution and expose campaign reports. Use
[AdServices](https://developer.apple.com/documentation/adservices) for app
attribution. Use the [Apple Ads Platform API](https://developer.apple.com/documentation/apple-ads-platform-api)
for campaign control and reporting.

## Account and access

Apple offers self-serve **Advanced** and **Basic** accounts. Start at
[Apple Ads](https://ads.apple.com/app-store). Sign in with an Apple Account that
has an email address, then enter business and tax details, accept the terms, and add a payment method.
[Apple’s setup guide](https://ads.apple.com/app-store/help/get-started/0004-set-up-an-account) documents this path.

An app campaign needs a linked App Store Connect account. The linking user
needs an allowed App Store Connect role and an Apple Ads linking role.
[Linking requirements](https://ads.apple.com/app-store/help/get-started/0012-link-app-store-connect-accounts) lists the roles and matching email rule.

The app must be available in the target App Store country or region. Apple Ads
must also support that market. Mainland China needs business and app approval,
plus possible industry and creative documents.
[Eligibility and China rules](https://ads.apple.com/app-store/help/get-started/0052-solve-setup-and-access-issues) cover these gates.

Basic is not an API account. It has a quick-view dashboard and AdServices, but
no Apple Ads Campaign Management API access.
[Apple Ads solutions](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions) lists this split.

### Campaign API access

An account administrator invites an API user from **Account Settings → User
Management**. Choose an API role. The user uploads an EC P-256 public key under
**Account Settings → API**. Apple then shows `clientId`, `teamId`, and `keyId`.
Generate the matching ES256 client secret with the private key.
[Apple’s OAuth guide](https://developer.apple.com/documentation/apple_ads/implementing-oauth-for-the-apple-search-ads-api) defines each step and claim.

Request a one-hour bearer token:

```text
POST https://appleid.apple.com/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=<clientId>
client_secret=<ES256 JWT>
scope=searchadsorg
```

The JWT header uses `alg=ES256` and `kid=<keyId>`. Its claims use
`iss=<teamId>`, `sub=<clientId>`, `aud=https://appleid.apple.com`, `iat`, and
`exp`. Apple limits the client-secret lifetime to 180 days. The returned access
token expires after 3600 seconds.

Call the ACL endpoint first:

```bash
curl -sS https://api.searchads.apple.com/api/v5/acls \
  -H "Authorization: Bearer $APPLE_SEARCH_ADS_ACCESS_TOKEN"
```

The response gives accessible `orgId` values and roles. Add
`X-AP-Context: orgId=<orgId>` to account-scoped calls. See [Calling the API](https://developer.apple.com/documentation/apple_ads/calling-the-apple-search-ads-api).

Use these adapter-owned secret names. Apple does not define environment
variable names:

```text
APPLE_SEARCH_ADS_CLIENT_ID
APPLE_SEARCH_ADS_TEAM_ID
APPLE_SEARCH_ADS_KEY_ID
APPLE_SEARCH_ADS_PRIVATE_KEY
APPLE_SEARCH_ADS_ORG_ID
APPLE_SEARCH_ADS_ACCESS_TOKEN
```

The promoted app identifier is an App Store `adamId`, not a pixel ID. Keep it in
application configuration as `APPLE_SEARCH_ADS_ADAM_ID` if needed.
[Search Apps](https://developer.apple.com/documentation/apple-ads-platform-api/search-apps-endpoints) describes `adamId` and owned-app checks.

## Client-side app attribution

There is no Apple Search Ads web tag. Do not add a guessed script, pixel, or
browser event name. In the iOS app, call the AdServices framework:

```swift
import AdServices

let token = try AAAttribution.attributionToken()
```

Send the opaque token to your server over HTTPS. The method returns a Base64
token with a 24-hour TTL. It has no app ID parameter or identity-hash input.
[The method reference](https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken%28%29) defines the call and lifetime.

Do not gate this call on App Tracking Transparency. ATT controls whether the
response is standard or detailed. A detailed response can include
`clickDate` or `impressionDate`; a standard response omits those fields.
Neither response identifies a user or device.
[Apple’s measurement guide](https://ads.apple.com/app-store/help/attribution/0028-measuring-ad-performance) describes this privacy behavior.

## Server-side attribution request

Apple’s [API comparison](https://ads.apple.com/app-store/help/apple-ads-basic/0001-compare-apple-ads-solutions) lists AdServices and campaign management, not a website conversion-event API. AdServices retrieves an attribution record. It does not upload signup, purchase, subscription, refund, or lead events.

```text
POST https://api-adservices.apple.com/api/v1/
Content-Type: text/plain

<raw attribution token>
```

The raw token is the only request body. Do not send email, phone, IP address,
user ID, value, currency, or a hashed identity. Do not add an Authorization
header. See [Apple’s endpoint reference](https://developer.apple.com/documentation/adservices/aaattribution/attributiontoken%28%29).

The response contains fields such as `attribution`, `campaignId`, `adGroupId`,
`adId`, `claimType`, `conversionType`, and `supplyPlacement`. The documented
`conversionType` values are `Download`, `Redownload`, and `PreOrder`.
`attribution=true` means Apple found a matching record. `attribution=false`
means Apple accepted the request but found no match.

Response handling matters. A `400` means an invalid token. A `404` means the
record is unavailable, often because the token expired or arrived too soon. For
a valid token, retry after five seconds, up to three attempts. Retry a `500` later.

## Hub event mapping and deduplication

The [ad-conversion-hub](../ad-conversion-hub/SKILL.md) owns canonical events,
consent, dispatch, retries, and business truth. Apple’s endpoint does not accept
those event names.

| Hub event | Apple Search Ads mapping |
| --- | --- |
| `page_view`, `view_content`, `lead` | No Apple Ads event. Keep it in product analytics. |
| `signup`, `begin_checkout`, `purchase` | No public Apple Ads upload. Keep it in the hub and payment ledger. |
| `subscription_start`, `refund` | No public Apple Ads upload. Do not pretend reporting supports it. |
| app install or redownload | Read `conversionType=Download` or `conversionType=Redownload`; this is an attribution result, not a hub event name. |
| pre-order | Read `conversionType=PreOrder`; this is an Apple report outcome. |

AdServices has no `event_id`, `eventID`, or other client/server dedup field.
There is no Apple-side deduplication for a hub event. The adapter must
deduplicate its own attribution records and must not count one token twice.

If the app also uses AdAttributionKit postback copies, deduplicate verified
postbacks by their `postback-identifier`. Verify the Apple JWS first. This is a
postback ID, not a conversion-event ID.
[Postback verification](https://developer.apple.com/documentation/adattributionkit/verifying-a-postback)
and [postback fields](https://developer.apple.com/documentation/adattributionkit/identifying-the-parameters-in-a-postback)
define this flow.

## Click and attribution windows

Apple Search Ads does not document a URL click parameter for App Store ads. The
AdServices token is the attribution handoff. Capture it at app launch, send it
at once, and retain the result with the install record. Do not store the token as
a long-lived user identifier.

Apple reports a tap-through install within 30 days of the ad tap. It reports a
view-through install within one day of the ad view. Tap-through attribution has
priority. Pre-orders use 90 days after a tap and 61 days after a view.
[Reporting definitions](https://ads.apple.com/app-store/help/reporting/0023-reporting-options-and-definitions) lists these windows.

## Tracking quirks that cause false conclusions

- **Basic hides API access.** Use Advanced for campaign API control and detailed
  reports. Basic still supports AdServices.
- **Search Match changes traffic.** It is on by default for Manage Bids search
  results campaigns. It is required for the automatic ad group in Maximize
  Conversions campaigns. Add negative keywords or disable it where appropriate.
  [Search Match rules](https://ads.apple.com/app-store/help/campaigns/0006-understand-search-match)
  document this behavior.
- **Audience refinements narrow delivery.** Customer types are All users, New
  users, Returning users, and Users of my other apps. Specified audience
  criteria need more than 5,000 customers. The first New users setup can take up
  to seven days to exclude prior downloaders.
[Audience settings](https://ads.apple.com/app-store/help/ad-groups/0021-modify-audience-settings) documents these limits. There is no public email Customer Match upload.
- **Payment can stop delivery.** A missing or declined payment method can pause
  campaigns. A campaign can also stay on hold for app, country, or policy
  reasons. Check `servingStateReasons` in campaign reports.
- **China has a separate gate.** Campaign creation does not mean delivery.
  Business, app, and sometimes creative documents must be approved first.
- **Search Match can hide keyword detail.** AdServices may omit `keywordId`
  when Search Match selected the query.
- **AdAttributionKit status is unclear for Apple Ads.** Apple’s current help page
  contains conflicting registration statements. Treat Apple Search Ads support
  as `UNVERIFIED` until Apple resolves the conflict.
  [Apple’s measurement page](https://ads.apple.com/app-store/help/attribution/0028-measuring-ad-performance) shows both statements.
- **Do not expect instant truth.** AdServices can return a valid `200` with
  `attribution=false`. Campaign reports are install and spend views, not server
  receipts for product purchases.

## Verification

1. **Request proof:** record the redacted AdServices response status and parse
   `attribution`. A `200` with `false` proves receipt, not a match.
2. **Platform proof:** query `POST https://api.searchads.apple.com/api/v5/reports/campaigns`
   with bearer auth, `X-AP-Context: orgId=...`, and a report window. Check
   `installs`, `newDownloads`, `redownloads`, and `preOrders`.
   [Campaign reports](https://developer.apple.com/documentation/apple_ads/get-campaign-level-reports)
   defines the endpoint and request body.
3. **Business proof:** reconcile Apple’s install result with App Store downloads,
   first app opens, product signups, succeeded charges, and refunds. The payment
   provider remains the source of truth for money.

For AdAttributionKit copies, accept only postbacks with a valid Apple signature,
then count only unique `postback-identifier` values and inspect `did-win`.

## Common pitfalls

- Treating `APPLE_SEARCH_ADS_ORG_ID` as a pixel ID.
- Sending a JSON object to AdServices instead of the raw token as `text/plain`.
- Waiting longer than 24 hours before sending the attribution token.
- Treating `attribution=false` as an HTTP failure.
- Retrying a valid token immediately and causing the documented early `404`.
- Expecting email hashing, event values, or `event_id` deduplication.
- Expecting a website signup or purchase to appear as an Apple Ads conversion.
- Using Basic while expecting Campaign API reports.
- Forgetting the App Store Connect link, payment method, or China approval.
- Debugging zero installs before checking the 30-day and one-day windows.

## Security

Keep `APPLE_SEARCH_ADS_PRIVATE_KEY`, client secrets, and bearer tokens in the
server secret store. Never put them in an app bundle, browser code, URL, log, or
repository. Rotate the private key and client secret if exposed.

Treat the AdServices token as sensitive short-lived data. Send it only over
HTTPS. Do not log it or use it as a user identifier. Apply the hub consent gate
before dispatch. Apple’s AdServices call does not need ATT, but product consent
and local privacy rules still apply.

Pair this skill with [ad-conversion-hub](../ad-conversion-hub/SKILL.md). Use the
hub for canonical events, consent, retries, dispatch isolation, and payment
reconciliation. Use Apple Ads reports for campaign attribution only.
