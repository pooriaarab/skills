---
name: data-exports
description: "Use when the user wants a personal data export, a 'download your data' archive, or a GDPR/CCPA portability request, or when an API is gone, paywalled, or too thin to be the source of truth. Routes to the service skill that owns the click path. Triggers: 'download my data', 'request a takeout', 'export my archive', 'GDPR portability', 'the API disappeared', 'Fitbit API is dead', 'Spotify API needs Premium', 'Strava API is subscriber-only'."
---

# Data exports

A data export is a **legal right**. An API is a **product decision**.

Use this folder when the job is to get a copy of what a vendor holds about one person.
Do not start from the vendor's developer portal. Start from the export.

Child skills live next to this file. Open the matching folder. The skill loader
often does not surface nested files.

## When to use this

**Use this** to request a personal archive, to replace an API that vanished or
got paywalled, or to decide whether an export or an API is the right layer.

**Do not use this** to scrape a site, to pull someone else's data, or to
automate a login. The owner clicks. The agent prepares the URL, the steps,
and the inbox watch.

## The argument

GDPR Article 20 gives a person the right to receive the personal data they
provided, in a structured, commonly used, machine-readable format, and to
transmit it to another controller. CCPA (Cal. Civ. Code § 1798.130) requires
a business to deliver that copy in a readily usable format that the person
can send on without hindrance.

An API is not that right. A vendor can shrink it, meter it, or turn it off.
The export has to stay, because the statute does. That is why the export is
the durable backbone and the API is only a freshness layer.

## Three 2026 cases

These are not hypotheticals. Each one happened.

| Vendor | What the API did | What the export still does |
|---|---|---|
| **Fitbit / Google Health** | Google turned down the legacy Fitbit Web API in September 2026. It no longer syncs data to or from Fitbit users. The replacement is the Google Health API, with new OAuth and Restricted scopes. | Google Takeout still exports Google Health / Fitbit data for a Google-signed-in account. See [google-takeout](google-takeout/SKILL.md). |
| **Spotify** | Since 11 February 2026 (new apps) and 9 March 2026 (existing Development Mode apps), the Web API requires the **app owner** to hold Premium. `GET /v1/me/player/recently-played` caps `limit` at **50**. | The Account Privacy export works on a free account. The extended-streaming-history package is the lifetime of the account, not the last 50 plays. See [spotify](spotify/SKILL.md). |
| **Strava** | A Strava subscription is a prerequisite for creating an API application. On a free account the create-application form fields are disabled. Existing Standard-tier apps go inactive if the owner is not subscribed. | Every athlete can still request the bulk archive for free from the website. See [strava](strava/SKILL.md). |

In two of those three (Spotify and Strava) the export still worked on a free
account and returned more data than the API would have. Spotify's export is
lifetime streaming history; the API's recently-played window is 50 tracks.
Strava's archive is the activity history the API will not issue to a free
developer.

Fitbit is the third shape: the API is gone, not merely paywalled. The export
is what remains.

## Trade-off

| | Export | API |
|---|---|---|
| **Cost** | Free. The statute requires the copy. | A product decision. It can require Premium, a subscription, a review, or a fee. |
| **Freshness** | Stale by days. The archive is a snapshot from request time, and recent edits can miss the cut. | Minutes or seconds, while the vendor still offers the endpoint. |
| **Completeness** | Broad. Lifetime history, ads inferences, DMs, files the API never exposed. | Narrow. Recent items, rate limits, missing private objects (bookmarks, full play history). |
| **Stability** | Tied to a legal duty. The form moves. The right does not. | Tied to a changelog. Endpoints disappear in a blog post. |
| **Automatability** | Low. A human submits. An email arrives later. You cannot poll it. | High, until the key dies or the owner loses the required plan. |

Use the export as the source of truth. Use the API, when it still exists, to
refresh the last day.

## The operational catch

An export cannot be polled. It is a manual request that arrives by email
days later.

A cron that hits `/me/player/recently-played` every night does not replace
this. There is no "is my archive ready" endpoint worth depending on. The
signal is a message in the owner's inbox.

After you submit a request:

1. Record the vendor, the request time, and the email address on the account.
2. Watch that inbox for the vendor's "your archive is ready" mail.
3. Download before the link expires. Several vendors give you days, not weeks.
4. Store the zip off the download folder. Treat it as private.

Do not build a scraper that logs in and clicks "Request archive" on a timer.
That path hits password walls, 2FA, and attestation. Stop. Hand the URL to
the owner.

Google Takeout is the one vendor that will schedule a repeat export (every
month for a year, 12 exports). That is still push-by-email, not a poll.

## Route

| The data lives in | Open |
|---|---|
| Gmail, Drive, Photos, YouTube, Calendar, Fitbit / Google Health, or any other Google product | [google-takeout](google-takeout/SKILL.md) |
| Instagram, Threads, or Facebook | [meta](meta/SKILL.md) — one Accounts Center |
| X / Twitter | [x-twitter](x-twitter/SKILL.md) |
| LinkedIn | [linkedin](linkedin/SKILL.md) |
| Apple Account, iCloud, App Store | [apple](apple/SKILL.md) |
| Spotify | [spotify](spotify/SKILL.md) |
| Strava | [strava](strava/SKILL.md) |

If the vendor is not in this table, find the official "download your data"
or "privacy" page, then write the steps here the same way. Do not invent a
URL.

## Safety

This repository is public.

- Never write a personal name, email, account id, or home-directory path
  into a skill, a commit, or a PR.
- Never enter the owner's password, 2FA code, or recovery key.
- Stop at the login wall. Name the exact click the owner must make.
- The archive is the owner's private data. Do not upload it to a ticket,
  a chat, or a public gist.

## Sources

- GDPR Article 20, Right to data portability
- Cal. Civ. Code § 1798.130 (CCPA delivery in a readily usable, portable format)
- [Fitbit Web API turn-down, September 2026](https://developers.google.com/health/about)
- [Spotify Development Mode, 6 February 2026](https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security)
- [Spotify recently-played `limit` maximum 50](https://developer.spotify.com/documentation/web-api/reference/get-recently-played)
- [Strava API getting started: subscription is a prerequisite](https://developers.strava.com/docs/getting-started/)

## Field notes, 2026-09-11

Seven requests attempted in one session. What actually happened, as opposed
to what the documentation implies:

| Service | Outcome |
|---|---|
| Google Takeout | Requested. **Monthly recurring** selected — 12 exports. |
| LinkedIn | Requested. No re-auth, no friction. |
| Spotify | Requested, then **confirmed via an emailed link**. |
| Strava | Requested on a **free** account, minutes after its API refused. |
| X | **Blocked** — re-prompts for the password. |
| Instagram / Threads | **Blocked** — 2FA code from an authenticator app. |
| Apple | **Blocked** — sign-in plus 2FA. |

**Four of seven went through unattended; three stopped at a credential.** That
ratio is the practical shape of this work. Plan for a human step rather than
treating it as an exception, and **never** let an agent handle the password or
the 2FA code — those gates exist precisely to establish a human is present.

Two findings worth carrying:

- **The paywalled API and the free export coexist.** Strava's API is
  subscriber-only while its archive is free, and Spotify's export returns
  *lifetime* listening where its API caps recently-played at 50. When an API
  refuses on price, check the export before concluding the data is out of
  reach.
- **Only Google offers recurrence.** Every other service here is one request,
  one archive. That asymmetry is why an inbox watcher is infrastructure rather
  than a convenience.
