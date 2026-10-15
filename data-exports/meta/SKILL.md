---
name: meta
description: "Use when the user wants a Meta 'Download your information' or 'Export your information' archive for Instagram, Threads, or Facebook. One Accounts Center request covers the linked profiles. Triggers: 'download my Instagram data', 'export Threads', 'Facebook Download Your Information', 'Accounts Center export'."
---

# Meta Accounts Center export

Instagram, Threads, and Facebook share one export desk: Accounts Center.
Request once. Pick the profile. Do not open three vendor-specific tools.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://accountscenter.facebook.com/info_and_permissions

Direct create-export page (official Facebook help link):

https://accountscenter.facebook.com/info_and_permissions/dyi/

Instagram-hosted twin (same desk, Instagram login):

https://accountscenter.instagram.com/info_and_permissions

Legacy Facebook shortcut, still login-gated: https://www.facebook.com/dyi

Official help:

- [Export a copy of your Facebook information](https://www.facebook.com/help/230304858213063)
- [Review and export a copy of your Instagram information](https://www.facebook.com/help/instagram/181231772500920)
- [Information available to download from your Instagram profile](https://www.facebook.com/help/instagram/6947552812036899)
- [Facebook export categories](https://www.facebook.com/help/930396167085762)

## Submit

Desktop, Facebook or Instagram session:

1. Sign in. Stop. The owner signs in and completes any 2FA.
2. Open https://accountscenter.facebook.com/info_and_permissions.
3. Click **Export your information**.
4. Click **Create export**.
5. Select the profile: Facebook, Instagram, or Threads. One profile per export. Repeat the create flow for each profile you need.
6. Choose **Export to device**.
7. Set date range, format (**HTML** to read, **JSON** to parse), notification email, and media quality. High-quality video makes a large zip.
8. **Available information** is the regular archive and omits data logs. **Specific types of information** adds data logs and lets you tick photos, messages, or logs only.
9. Click **Start export**. Meta will ask for the profile password. Stop. The owner types it.

Threads has a second path. Official Threads help says the dedicated Threads export flow is **not available on computers**. On a phone, open Threads or Instagram → Settings → Accounts Center → Your information and permissions → Export your information, then pick the Threads profile.

**Export to external service** is a different product: a transfer to a connected destination, with its own connect-and-authorize steps. Use **Export to device** unless the owner named a destination.

## What it contains

**Facebook, export-to-device categories** (official):

- Your Facebook activity (posts, photos you shared, groups)
- Personal information
- Connections (friends, followers)
- Logged information (search history)
- Security and login information
- Apps and websites off of Facebook
- Preferences
- Ad information
- Data logs (only if you asked for them)

**Instagram:** files for the selected profile's information and activity. Official split is **Available information** vs **Specific types of information** (adds data logs; can limit to photos, messages, or logs).

**Threads:** the Threads profile's posts, activity, and account information when that profile is the one you selected.

HTML zip: extract it and open `index`. JSON zip: machine-readable files for another tool.

## What it does not

- Content someone else shared that you were only tagged in. Official Facebook note: the export will not include another person's photos you are tagged in.
- Deleted information. Some deleted items may sit in a safety hold; they still will not appear in the download.
- A deactivated profile, or a profile scheduled for deletion, until you reactivate or cancel deletion.
- Ads information collected on additional Facebook profiles — official help says that lives on the **main** profile export.
- WhatsApp. WhatsApp in Accounts Center is not available in every country, and this skill does not cover a WhatsApp export.

## Delivery

Meta emails you and, for Facebook, also sends an in-app notification.

Official Instagram note: it may take **up to 30 days** to email the export link.

When the file is ready you have **4 days** to download it from **Available downloads** on the same Export your information page. After that the request expires. Request again.

Past requests stay listed under **Past request**.

## Format

ZIP. HTML or JSON. Media sit in folders next to the pages or the json.

## Gotchas

- **Four-day download window.** Miss it and you start over.
- **Up to 30 days to build.** Do not treat this as same-day. Watch the inbox.
- **Password gate on request and on download.** The agent does not type it.
- **One profile per export.** Linked Instagram + Threads + Facebook means three requests if you want all three.
- **High media quality vs disk.** Check free space before you pick High.
- **UI labels move.** Some accounts still say Accounts Center, some say Meta Account. The path is Your information and permissions → Export your information.
- **No polling.** There is no ready-check API. The signal is the email.

## Sources

- https://accountscenter.facebook.com/info_and_permissions
- https://www.facebook.com/help/230304858213063
- https://www.facebook.com/help/instagram/181231772500920
- https://www.facebook.com/help/930396167085762
- https://www.facebook.com/help/instagram/6947552812036899
- https://www.facebook.com/help/instagram/259803026523198
