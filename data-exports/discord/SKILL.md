---
name: discord
description: "Use when the user wants a Discord Data Package — messages they sent, servers, DMs, or account files. Triggers: 'download my Discord data', 'Discord data package', 'Request Data Discord', 'export Discord messages'."
---

# Discord Data Package

Request the official zip from User Settings. It holds **messages you
sent**, not the full history of servers you only belong to.

Parent argument: [data-exports](../SKILL.md).

## Request URL

No public web form. Use the Discord app or the browser client.

Official: [Requesting a Copy of your Data](https://support.discord.com/hc/en-us/articles/360004027692-Requesting-a-Copy-of-your-Data)
and [Your Discord Data Package](https://support.discord.com/hc/en-us/articles/360004957991-Your-Discord-Data-Package).

Desktop: cogwheel → **User Settings** → **Data & Privacy** → **Request
your data** → **Request Data**.

Mobile: avatar → cogwheel → **Data & Privacy** → **Request all of my
data**. Mobile can only request everything.

Email on the account must already be verified. Lost account: privacy@discord.com.

## Submit

1. Sign in. Stop. The owner signs in.
2. Open **Data & Privacy** as above.
3. On desktop, tick categories, then **Request My Data**.
4. Confirm the in-app notice (up to 30 days).

**Rate limit (official):** wait for the current request to finish
before you submit a new one.

## What it contains

ZIP of JSON. Official folders:

| Folder | Holds |
|---|---|
| **Account** | User id, username, email, phone, settings, IP, connections, sessions, friends, blocks, payments |
| **Messages** | Messages **you sent** (DM, group DM, channel). Id, timestamp, contents, attachment CDN links |
| **Servers** | Servers you belong to now, plus recently departed ones |
| **Activity / Ads / Tickets** | Analytics, Quests, Help Center tickets |

Server you **own**: emoji, audit log, channels, settings, webhooks.
Server you only **belong to**: last **90 days** of audit-log actions
about your account, plus server id and name.

## What it does not

- **Other people's messages.** Official: the messages folder is what
  **you** sent. Membership is not a full channel archive.
- Messages you already deleted.
- Support or Trust & Safety mail (those sit outside the app).
- A server you left before the request, except recently departed ones.

## Delivery

Email to the address on the account **at request time**. Official: up
to **30 days**. The download link stays active **30 days**. Changing
email later does not move the link. Disable or delete the account
before the link arrives and Discord cancels the request.

## Format

One ZIP of JSON, plus avatar images.

## Gotchas

- **One request at a time.** Official.
- **30-day link.** Download when the mail arrives.
- **CDN attachment links can die.** The transcript still lists them.
- **No polling.** Watch the inbox. The owner clicks. The agent does not.

## Sources

- https://support.discord.com/hc/en-us/articles/360004027692-Requesting-a-Copy-of-your-Data
- https://support.discord.com/hc/en-us/articles/360004957991-Your-Discord-Data-Package
