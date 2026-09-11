---
name: apple
description: "Use when the user wants a copy of Apple Account or iCloud data from privacy.apple.com — Photos, App Store, Apple Music, device and purchase history. Triggers: 'download my Apple data', 'Apple privacy portal', 'export iCloud Photos', 'Request a copy of your data'."
---

# Apple Data and Privacy export

Request a copy of the data Apple stores for one Apple Account.
The only official self-serve desk is privacy.apple.com.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://privacy.apple.com/

Official overview: [Understand and control the personal information that you store with Apple](https://support.apple.com/en-us/102283).

Two-factor authentication must already be on. The portal will not skip it.

## Submit

1. Open https://privacy.apple.com/ on a desktop.
2. Sign in with the Apple Account. Complete the 2FA prompt on a trusted device or SMS. Stop. The owner signs in.
3. Click **Request a copy of your data**. If that control is missing, the feature is not offered in that country or region. Stop.
4. Tick the categories you want. **Select all** only if the owner asked for everything. iCloud Photos is the size bomb.
5. Click **Continue**.
6. Pick a maximum part size. The dropdown offers **1 GB, 2 GB, 5 GB, 10 GB,
   25 GB** (verified on the live page). Apple splits the archive at that
   ceiling and emails **one link per part**.

   **Prefer the largest size the disk can take.** Every part is a separate
   link with its own expiry, so ten parts means ten chances to miss one. The
   page lists the selection as `N apps and services`, then `Complete request`.
7. Click **Complete request**.

Apple emails the address on the Apple Account when the files are ready.
The same portal also lists the download. Prefer the portal if the mail is
late: sign back in at https://privacy.apple.com/ and look for **Download
your data**.

EU, UK, and Japan (official): you can schedule a one-time or recurring
request for some categories, including App Store information and app-install
plus push-notification activity, and you can see the status of a request
you made through another service.

A separate control on the same site **transfers** a copy to another service
(official examples: iCloud Photos, Apple Music playlists). That is not this
download. Do not start a transfer unless the owner named a destination.

## What it contains

Official scope: a copy of the data stored with Apple that is associated
with the Apple Account. Categories the owner can tick typically include
sign-in records, iCloud-stored files, purchase and app-usage history, and
marketing and support history.

EU / UK (official): App Store information, app installation history, and
push-notification activity are extra ticks.

UNVERIFIED formats, widely reported and consistent with Apple's "original
or industry-standard" claim:

| Kind | Typical files |
|---|---|
| Photos, videos, documents | original bytes |
| Contacts | `.vcf` |
| Calendar | `.ics` |
| Mail | `.eml` |
| Bookmarks | `.html` |
| App usage, purchases, device logs | `.json`, `.csv`, or `.pdf` |

The download is a set of zip parts, one category or one size slice each.

## What it does not

- Data that lives only on a device and was never stored with Apple.
- End-to-end-encrypted iMessage and FaceTime *contents*. Apple's privacy
  position is that it cannot decrypt those conversations. The archive will
  not hand you the message bodies.
- Another person's Apple Account.
- Categories Apple does not offer in that country. Missing ticks mean
  unavailable, not a broken page.
- A request Apple declines for legal, fraud, or third-party-privacy
  reasons. Official privacy policy: some requests are refused.

If a category is missing from the portal, Apple's contact path is
https://www.apple.com/legal/privacy/contact.

## Delivery

Apple emails the Apple Account address and posts the files on the portal.

UNVERIFIED exact SLA: third-party write-ups that quote Apple say the
archive is prepared within **seven days** and stays downloadable for
**14 days**. After 14 days you request again. Official support page
102283 confirms the portal, not those two numbers.

## Format

Multiple `.zip` files. Original media plus CSV / JSON / ICS / VCF / EML
as above.

## Gotchas

- **2FA is mandatory.** No bypass.
- **iCloud Photos is enormous.** Tick it alone if that is the job. Leave
  disk headroom well above the library size.
- **Split parts.** Download every zip. One missing part is a broken Photos
  library, not a partial success.
- **Expiring portal listing.** Do not "get to it next month".
- **Access iCloud Data on the Web** must be on if the owner turned it off
  (iPhone Settings → Apple Account → iCloud). UNVERIFIED as a hard gate;
  several walkthroughs require it before Photos appear.
- **Regional extras.** Recurring App Store exports are EU / UK / Japan only.
- **No polling.** Watch the inbox. Re-check the portal if the mail is quiet.
- **Do not put the Apple Account password in a script.**

## Sources

- https://privacy.apple.com/
- https://support.apple.com/en-us/102283
- https://www.apple.com/legal/privacy/pdfs/apple-privacy-policy-en-ww.pdf
