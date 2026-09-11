---
name: netflix
description: "Use when the user wants a Netflix personal-information copy or a viewing-history CSV. Triggers: 'download my Netflix data', 'getmyinfo', 'Netflix viewing history', 'subject access request Netflix'."
---

# Netflix personal information copy

Request the official copy from the account page. Viewing history is a
taste profile that almost no other export covers.

Parent argument: [data-exports](../SKILL.md).

## Request URL

Full copy (account owner):

https://www.netflix.com/account/getmyinfo

Official help: [What personal information Netflix holds about you and how to request a copy](https://help.netflix.com/en/node/100624).

Same-session viewing-history CSV (one profile, not the full copy):
https://www.netflix.com/account → **Profiles** → pick a profile →
**Viewing activity** (`https://www.netflix.com/settings/viewing-history`)
→ **Download all**. Official: [How to see viewing history and device activity](https://help.netflix.com/en/node/101917).

## Submit

1. Sign in as the account owner. Stop. The owner signs in.
2. Open https://www.netflix.com/account/getmyinfo and follow the page.

A **profile user** who added an email to that profile emails
privacy@netflix.com. Official: the account owner is notified.

## What it contains

Official account-page inventory (also the scope of the copy):

- Account owner email, phone, plan
- Notification and privacy settings
- Payment and billing
- Profiles and playback preferences
- **Content interaction history** — viewing activity and ratings
- Devices active in the last **90 days**

The viewing-history CSV is one profile's watch list.

## What it does not

- Another household's Netflix account.
- A cancelled account's on-site history. Official: a closed account
  must use the full copy to see viewing history.
- Video files. This is metadata.

## Delivery

Full copy: official **up to 30 days** after Netflix verifies the
request. Email to the account address.

Viewing-history **Download all**: immediate CSV in the browser session.

UNVERIFIED: how long the full-copy download link lasts. Download when
the mail arrives.

## Format

Full copy: official help does not name the archive type. UNVERIFIED: a
ZIP of CSV files, one viewing-activity CSV per profile. **Download all**: CSV.

## Gotchas

- **Two products.** The CSV is one profile, now. The getmyinfo copy is
  the legal archive and can take 30 days.
- **Owner vs profile user.** Profile requests notify the owner.
- **No polling.** Watch the inbox for the full copy. The owner submits.
  The agent does not type the password.

## Sources

- https://www.netflix.com/account/getmyinfo
- https://help.netflix.com/en/node/100624
- https://www.netflix.com/settings/viewing-history
- https://help.netflix.com/en/node/101917
