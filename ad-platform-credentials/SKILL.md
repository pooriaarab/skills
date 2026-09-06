---
name: ad-platform-credentials
description: "Obtain, verify, and store server-side conversion credentials for Meta, GA4, Google Ads, and LinkedIn. Use when a Meta CAPI token cannot read pixel metadata, a GA4 Measurement Protocol secret is blocked by acknowledgement, Google Ads shows Explorer Access, or you need to know which token type to use."
---

# ad-platform-credentials

`adscapi` fans one conversion out to many platforms. Each platform needs its
own credential from its own console. This skill covers the four platforms with
verified first-hand paths: Meta, GA4, Google Ads, and LinkedIn. Do not write
steps for a platform nobody has logged into.

## Meta: Conversions API token

1. Open Events Manager. Select the dataset. Open Settings.
2. Open Conversions API. Select **Set up direct integration**.
3. Skip the Dataset Quality API option. Generate the access token.
4. Copy the token now. Store it per [Storage](#storage).

This yields a non-expiring SYSTEM_USER token. Use these names:

```text
META_PIXEL_ID    public dataset (pixel) identifier
META_CAPI_TOKEN  server-only Conversions API token
```

The trap: the token reports `scopes: [read_ads_dataset_quality]` and cannot
read pixel metadata. `GET /<pixel>?fields=id,name` returns `(#100) Missing
Permission`. It still sends conversions. Do not discard it. Do not request
broader scopes for the fleet.

Verify with a probe that sends nothing:

```text
POST https://graph.facebook.com/v21.0/<META_PIXEL_ID>/events
body: {"data": [], "access_token": "<META_CAPI_TOKEN>"}
  code 100 -> authorized ("param data must be non-empty")
  code 190 -> not authorized ("Invalid OAuth access token")
```

Distinguish on the error code, not the message. Getting this wrong discards a
working token and over-permissions the fleet. One System User token can serve
multiple pixels. This was verified against two.

## GA4: Measurement Protocol secret

1. Open Admin. Select Data streams. Select the stream.
2. Open Measurement Protocol API secrets. Select Create.
3. Copy the secret now. It is create-only. The console never shows it again.

Use these names:

```text
GA4_MEASUREMENT_ID  the G- id, readable from the stream
GA4_API_SECRET      create-only Measurement Protocol secret
```

Creation is gated behind a User Data Collection Acknowledgement. That is a
legal attestation. It asserts the operator holds privacy disclosures and
end-user rights. The owner approved it for fleet properties on 2026-09-04. An
agent may accept that one acknowledgement for fleet properties. An agent must
never extend that approval to any other attestation. When in doubt, stop and
ask the owner.

Verify without recording anything:

```text
POST https://www.google-analytics.com/debug/mp/collect?measurement_id=<GA4_MEASUREMENT_ID>&api_secret=<GA4_API_SECRET>
  validationMessages: [] means accepted
```

The debug endpoint records nothing.

Cloud API access is not GA4 access. A service account can report
`admin_api_status: 200` and `ok: true` with an empty `visible_properties`.
That means it was never added inside GA4 under Admin, Account access
management. That step is the one people miss. Add the service account there.
`doctor` looking healthy is what makes this gap dangerous, so check
`visible_properties` explicitly.

## Google Ads: developer token and OAuth

1. Open the manager account. Open Admin, API center.
2. Check whether a developer token already exists. Do not assume a new
   application is needed.
3. Check the access level before use. Explorer Access works only against test
   accounts. Production needs Basic Access. That upgrade is a different flow
   from a first application.

Use these names:

```text
GOOGLE_ADS_DEVELOPER_TOKEN     developer token from the manager account
GOOGLE_ADS_LOGIN_CUSTOMER_ID   manager CID, digits only
```

You also need an OAuth desktop client and a refresh token. Store them in the
same per-platform file.

## LinkedIn: Advertising API access

1. Access is granted per app. The app must be Company-verified.
2. Verify against a LinkedIn Page. A member profile does not qualify.
3. Prefer reusing an already-verified app. Re-verification is slow.
4. A Page association on a new app is permanent once saved. Choose carefully.
5. Requesting access accepts the Marketing API program terms. It opens a
   Qualtrics form with a 21-day deadline. Calendar the deadline on request day.

## Storage

1. Store one file per platform in `~/Documents/Personal/.secrets/`.
2. Set mode 0600 on each file.
3. Never echo a token to stdout. Print its length and its destination path.
4. Back up a working credential before any re-auth that could replace it.

## Common pitfalls

- Discarding a working Meta token because a read call failed.
- Reading the Meta error message instead of the error code.
- Accepting a new legal attestation without owner approval.
- Assuming Cloud API access grants GA4 property access.
- Applying for a new developer token before checking the API center.
- Using Explorer Access credentials against production accounts.
- Associating a new LinkedIn app with the wrong Page.
- Missing the 21-day Qualtrics deadline.
- Echoing a secret to stdout or committing it.
