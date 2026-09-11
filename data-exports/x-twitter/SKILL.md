---
name: x-twitter
description: "Use when the user wants an X / Twitter data archive — posts, likes, DMs, followers, media. Triggers: 'download my Twitter archive', 'export my X data', 'Download an archive of your data'."
---

# X / Twitter archive

Request X's official account archive. The owner confirms password and a
verification code. There is no supported API replacement for this dump.

Parent argument: [data-exports](../SKILL.md).

## Request URL

Start from a signed-in session:

1. https://x.com/settings/your_twitter_data
2. `https://x.com/settings/download_your_data` resolves while signed in
   (verified 2026-09-11).

**It re-prompts for the account password**, even in a session that is already
signed in. This is a deliberate human-presence check, so it cannot be
automated, and an agent should hand back to the account owner here rather
than handling a credential.

If the direct URL bounces, use the menu. The official label is stable:

**More → Settings and privacy → Your account → Download an archive of your data**

## Submit

Desktop:

1. Sign in at https://x.com. Stop. The owner signs in.
2. Click **More** in the left sidebar.
3. Click **Settings and privacy**.
4. Click **Your account**.
5. Click **Download an archive of your data**.
6. Enter the account password. Stop. The owner types it.
7. Complete the verification code sent to the account email or phone. Stop.
8. Click **Request archive**.

X emails you and shows an in-app notification when the zip is ready.
Return to the same **Download an archive of your data** page and click
**Download archive**. Do this on a desktop. The file can be large.

## What it contains

The unzipped archive ships its own inventory. Typical top level:

- `Your archive.html` — offline browser for a subset of the dump. Official archive README (inside the zip) says the HTML renderer only works under 50 GB and does not show everything.
- `data/` — machine-readable `.js` files. Each file is JSON assigned to a `window.YTD.*` variable, not bare `.json`.
- `assets/` — icons and fonts for the HTML viewer.

Files the archive README lists as in-scope: profile, posts (tweets), Direct Messages, media attached to posts or DMs, followers, following, lists, inferred interest and demographic data, ads seen or engaged with.

Open `data/README.txt` (or the equivalent README in that zip) before you trust a file map. X changes the set.

## What it does not

- UNVERIFIED: **bookmarks**. Multiple 2024–2026 archives and tools report that the official zip omits bookmarks. X has not published a current public inventory that confirms this. Do not promise bookmarks. If the owner needs them, say so up front.
- Deleted posts, or media X has already dropped.
- Other people's accounts.
- A live, clickable backup of every attached media URL. Many entries are identifiers or links back to x.com. If X later 404s the media, the archive row still exists and the file may not.

## Delivery

X notifies by email and in-app. Typical wait is about 24 hours. Official
current help does not publish a hard SLA. UNVERIFIED: waits of 24–48 hours
are commonly reported; large accounts take longer.

You download from the same settings page, not from a raw attachment.

UNVERIFIED: the download window is about a week. If the **Download** button
has vanished, request a new archive.

## Format

One ZIP. Inside: HTML viewer plus `data/*.js`.

Notable `data/` files, when present:

| File | Holds |
|---|---|
| `tweets.js` or `tweet.js` | Posts, replies, reposts |
| `like.js` | Likes |
| `direct-messages.js` | DMs |
| `follower.js` / `following.js` | Graph |
| `account.js` / `profile.js` | Account and profile fields |

Strip the `window.YTD.… = ` prefix before you parse a file as JSON.

## Gotchas

- **Password plus a one-time code.** The agent stops at both.
- **Download from the settings page**, not only from the email. The mail is a heads-up.
- **HTML viewer is incomplete.** Always open `data/`.
- **`.js` not `.json`.** Parsers that expect raw JSON will fail until you strip the assignment.
- **No polling.** Watch the inbox. X does not expose a ready-check API for this.
- **EU path.** Some third-party write-ups say EU accounts must make a separate request. UNVERIFIED against current official help. If the settings page refuses, stop and read what it says.

## Sources

- In-product path: Settings and privacy → Your account → Download an archive of your data
- Archive README shipped inside the zip (authoritative for that request)
