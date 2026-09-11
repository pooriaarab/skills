---
name: google-takeout
description: "Use when the user wants a Google Takeout, a Download Your Data archive, or a copy of Gmail, Drive, Photos, YouTube, Calendar, Fitbit / Google Health, or other Google-product data. Triggers: 'export my Google data', 'Takeout', 'download my Gmail', 'export Google Photos', 'Fitbit export after the Web API shutdown'."
---

# Google Takeout

Request a copy of data Google holds for one Google Account.
There is no API for this. The owner submits the form.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://takeout.google.com/

Official help: [How to download your Google data](https://support.google.com/accounts/answer/3024190).

## Submit

1. Sign in to the Google Account that owns the data. Stop. The owner signs in.
2. Open https://takeout.google.com/. Google pre-selects every product that holds data.
3. Click **Deselect all**, then tick only the products you want. A full dump of Photos plus Drive plus Mail is huge and slow. Prefer one product per request when the library is large.
4. Some products expose **All data included**. Open it and drop folders or data types you do not need.
5. Click **Next step**.
6. **Delivery method:** choose **Send download link via email** unless you have a reason to land the archive in Drive, Dropbox, OneDrive, or Box. Cloud destinations count against that service's quota, and Google stops being responsible for the files once they arrive.
7. **Frequency.** Three options, verified on the live page:
   `Export once` (1 export), `Export every month for 1 year` (**12 exports**),
   `Export every 2 months for 1 year` (6 exports).

   **Prefer monthly.** It is the only mechanism any provider offers that turns
   an export into a recurring source, which is the whole difficulty with
   export-based ingestion. Confirmation reads
   `Export 1 of 12 will start on <date>`.
8. **File type:** `.zip` unless you already know you want `.tgz`.
9. **Archive size:** pick a maximum part size. Google splits anything larger into multiple files. 50 GB is the largest option and reduces the number of parts.
10. Click **Create export**.
11. Wait for the email. Open **Download archive**. Re-enter the Google password if asked.

Advanced Protection accounts: the first archive is scheduled two days out, and scheduled exports are not available.

Workspace accounts: an admin can disable Takeout. If the page refuses, that is why.

YouTube on a Brand Account: switch to that Brand Account before you export, or the videos will not be in the zip.

## What it contains

Whatever you ticked, if Google still holds it. Official examples: email, documents, Calendar, Photos, YouTube videos, registration and account activity.

Fitbit / Google Health is a Takeout product. After the Fitbit Web API turn-down in September 2026, this is the remaining official dump for a Google-signed-in Fitbit account. If the account still uses a legacy Fitbit login (not migrated to Google), use Fitbit Settings → Data Export instead. See [Google Health export help](https://support.google.com/fitbit/answer/14236615).

Common formats inside the zip:

| Product | Format |
|---|---|
| Gmail | `.mbox`, labels in an `X-Gmail-Labels` header |
| Contacts | vCard |
| Calendar | `.ics` |
| Photos / videos | original file plus a sidecar `.json` (comments, album membership, extra metadata) |
| YouTube | original format, or MP4 (H.264 + AAC) |
| Drive | exported Google formats plus uploaded originals |

The zip also has `archive_browser.html`. Open that on a desktop to see how to read each folder.

## What it does not

- Data already deleted from Google's storage. Items still in the deletion pipeline are omitted.
- Changes made between the request and the moment Google builds the archive (Drive sharing, resolved comments, Photos added or removed).
- A chosen date range. Takeout does not filter by time. You get all remaining data for the ticked products.
- Another person's content that you merely have access to (a shared Drive you do not own, a Google Group you do not own).
- Brand-Account YouTube videos from the wrong signed-in identity.

## Delivery

Google emails a link. Official range: a few minutes to a few days. Most people get it the same day.

Click the link. You land on the Takeout downloads page, not on a raw file in the mail.

## Format

`.zip` or `.tgz`, possibly split into numbered parts. One folder per product.

## Gotchas

- **The archive expires in about 7 days.** Request again after that. Expiry does not delete the live Google data.
- **Each archive can be downloaded 5 times.** After that, request a new one.
- **Split archives.** Anything over the size you picked arrives as multiple files. You need every part.
- **`.tgz` plus unicode filenames.** Google warns that tgz parts can fail on unicode names. Prefer zip.
- **Password again at download.** Expected. 2-Step Verification may add a second check.
- **Failed export.** Retry. If it still fails, export one product at a time, or drop the part size.
- **Do not download on a phone.** Official advice: use a desktop. Photos libraries are large.
- **Drive delivery plus account deletion.** Move the archive off Drive before you delete the Google Account.
- **No polling.** There is no Takeout API for "is it ready". Watch the inbox.
  Scheduled exports still arrive by email — but a monthly schedule plus an
  inbox watcher is as close to a pollable export as this ecosystem gets.
- **Deselect all first.** 67 products are selected by default, and Gmail,
  Photos and Drive together can run to hundreds of GB. `Deselect all` then
  pick what is actually missing; the counter shows `N of 67 selected`.
- Defaults on the delivery step: link by email, `.zip`, 2 GB parts.

## Sources

- https://takeout.google.com/
- https://support.google.com/accounts/answer/3024190
- https://support.google.com/fitbit/answer/14236615
- https://developers.google.com/health/about
