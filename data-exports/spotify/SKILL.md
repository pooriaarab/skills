---
name: spotify
description: "Use when the user wants a Spotify personal-data download — account data, extended streaming history, or technical logs — or when the Web API is blocked because the app owner is not Premium. Triggers: 'download my Spotify data', 'extended streaming history', 'Account Privacy export', 'recently-played is only 50 tracks'."
---

# Spotify data download

Request the official copy from Account Privacy. It works on Free and
Premium. The Web API does not.

Parent argument: [data-exports](../SKILL.md).

Since 11 February 2026 (new Development Mode apps) and 9 March 2026
(existing ones), the Web API requires the **app owner** to hold Premium.
`GET /v1/me/player/recently-played` still caps `limit` at **50**. The
export's extended-streaming-history package is the lifetime of the account.

## Request URL

https://www.spotify.com/account/privacy/

Region-prefixed twin, same page: https://www.spotify.com/us/account/privacy/

Official: [Data rights and privacy choices](https://support.spotify.com/us/article/data-rights-and-privacy-settings/)
and [Understanding your data](https://support.spotify.com/us/article/understanding-your-data/).

This control is on the website. It is not in the mobile app.

## Submit

1. Sign in at https://www.spotify.com/. Stop. The owner signs in.
2. Open https://www.spotify.com/account/privacy/.
3. Find **Download your data**.
4. Tick the package you actually want. You can request one or all three:
   - **Account data** — profile, playlists, library, last-year streaming, search, payments, inferences, Wrapped, and the rest of the account package.
   - **Extended streaming history** — every play for the life of the account. This is the one that beats the API.
   - **Technical log information** — diagnostics, error strings, and recipients.
5. Submit the request.

Spotify emails a link to a ZIP when each package is ready. Packages can
arrive on different days.

## What it contains

Official packages and files (from Understanding your data and the GDPR
Article 15 page). Files appear only when Spotify holds that data.

**Account data** (JSON):

| File | Holds |
|---|---|
| `Userdata.json` | Username, email, country, birth date, gender, account-creation date, phone, locale |
| `Identity.json` | Display name, first name, last name |
| `Playlist.json` (and numbered siblings) | Playlists you created or saved, tracks, last modified, follower count |
| `YourLibrary.json` | Saved songs, albums, artists, shows, episodes, URIs |
| `StreamingHistory.json` | Audio / video / podcast plays for the **past year**, with UTC end time, creator, title, `msPlayed` |
| `SearchQueries.json` | Search text, device, result URIs you touched |
| `Inferences.json` | Ad-interest segments |
| `Follow.json` | Follower / following / blocking counts |
| Payments, Family Plan, Messages, Customer Service, Voice Input, Precise Location, Taste Profiles, Wrapped, Spotify for Artists / Creators | Only if that feature applies |

**Extended streaming history:**

Lifetime plays. Official fields include UTC end time, username, platform,
milliseconds played, country, IP, user agent, track / artist / album,
Spotify URI, start and end reason, shuffle, skipped, offline, private
session. Read `Read Me First - Extended Streaming History` in the zip.

JSON is split across files of roughly a dozen megabytes each.

**Technical log information:**

Commands, error strings, and a recipients list. Read
`Read Me First - Technical Log Information`. Default language is English.

## What it does not

- The last 50 plays only. That is the API. Account-data `StreamingHistory.json` is the last year. Extended history is the lifetime. Request the extended package on purpose. People tick Account data, see twelve months, and think that is everything.
- Podcast episodes in the recently-played **API**. Official API note: recently-played does not support podcasts. The export does include podcasts.
- Audio files. This is metadata, not the tracks.
- Data Spotify does not process for that account. Missing json means "we do not hold this", not a broken zip.

## Delivery

Email with a download link. Official pages do not publish a day count.

UNVERIFIED: Account data often arrives within a day. Extended history is
the slow one; community reports range from hours to the GDPR one-month
access window. Do not promise a day.

## Format

ZIP of JSON, plus a PDF or "Read Me First" file per package.

## Gotchas

- **Three packages, three waits.** Requesting "everything" still arrives as separate mails.
- **Account data is not lifetime history.** Tick **Extended streaming history**.
- **Website only.**
- **Free accounts can export.** Premium is an API-owner rule, not an export rule.
- **IP and device identifiers** sit in extended history and in technical logs. Treat the zip as sensitive.
- **No polling.** Watch the inbox. The API cannot tell you the zip is ready, and as of 2026 the API may refuse you anyway.
- Contact path if the tool fails: privacy@spotify.com (official).

## Sources

- https://www.spotify.com/account/privacy/
- https://support.spotify.com/us/article/data-rights-and-privacy-settings/
- https://support.spotify.com/us/article/understanding-your-data/
- https://www.spotify.com/legal/gdpr-article-15-information/
- https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security
- https://developer.spotify.com/documentation/web-api/reference/get-recently-played
