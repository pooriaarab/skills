---
name: strava
description: "Use when the user wants a Strava bulk archive or a single-activity GPX/TCX/original export, or when the Strava API create-application form is disabled on a free account. Triggers: 'export my Strava data', 'Request Your Archive', 'download GPX', 'Strava API is subscriber-only'."
---

# Strava data export

Request the official bulk archive from the Strava website. It is free. The
API is not.

Parent argument: [data-exports](../SKILL.md).

A Strava subscription is a prerequisite for creating an API application
([getting started](https://developers.strava.com/docs/getting-started/)).
On a free account the create-application form fields are disabled. Standard-tier
apps go inactive if the owner is not subscribed. Official developer notes
still say every athlete can export their data for free at any time.

This skill is that export. Do not send a free-account owner to
developers.strava.com.

## Request URL

Bulk archive (login-gated; the page also hosts account deletion — do not
click delete):

https://www.strava.com/athlete/delete_your_account

Official click path if you would rather not land on a page named "delete":

1. https://www.strava.com/ — sign in
2. Profile menu → **Settings**
3. **My Account**
4. **Download your account** → **Get Started**
5. **Request download**

Official help: [Exporting Your Data and Bulk Export](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export).

Exports are **website only**. The mobile app does not host the bulk request.

## Submit

Bulk archive:

1. Sign in on strava.com. Stop. The owner signs in.
2. Open Settings → **My Account**.
3. Under **Download your account**, click **Get Started**.
4. Click **Request download** / **Request Your Archive**. Confirm. Do not continue into account deletion.
5. Wait for email at the address on the Strava profile. Official: this may take a few hours. Confirm that address first.

Single activity (same official article):

- Activity page → **…** menu → **Export Original** (the file as uploaded, often FIT) or **Export GPX**.
- TCX: append `/export_tcx` to the activity URL, for example `https://www.strava.com/activities/<id>/export_tcx`. Only works for activities that have GPS.

## What it contains

Official bulk-export article does not inventory the zip. It says you get
"your data" and that per-activity originals, GPX, and TCX are the portable
activity files.

UNVERIFIED file map, consistent across independent archives:

| Path | Holds |
|---|---|
| `activities/` | One GPX, FIT, or TCX per activity (whatever was recorded) |
| `activities.csv` | Spreadsheet of every activity: name, date, type, distance, moving time, elevation, heart rate, calories, gear |
| `profile.csv` | Account profile |
| `comments.csv` / `kudos.csv` | Social bits |

Per-activity official facts:

- **Export Original** — the uploaded file, often FIT, with sensor data.
- **Export GPX** — GPS track, timestamps, heart rate, cadence, temperature. Power from a meter is included. Estimated power is not. Indoor activities with no GPS produce an empty or unreadable GPX.
- **Export TCX** — more sensor fields than GPX, including watts. GPS required.

## What it does not

- A working API app on a free account. That is the other product.
- Estimated power in a GPX.
- A useful GPX for an indoor ride with no GPS.
- Developer Hub posts. Those are a separate email request to
  stravacommunityhub@strava.com, and only if that account is still active.
- Data after you delete the account. Download first. The archive control
  shares a page with deletion. Read the button.

## Delivery

Email with a download link. Official: "this may take a few hours."
You must be able to read the email on the profile.

UNVERIFIED: large accounts have taken days. UNVERIFIED: the link expires;
download when the mail arrives.

## Format

One ZIP for the bulk archive. Activity files inside are GPX / FIT / TCX.
Summaries, when present, are CSV.

## Gotchas

- **The request page is named like account deletion.** Official path sits
  under "Download your account" on My Account, and the direct URL is
  `/athlete/delete_your_account`. Click **Request download** only.
- **Website only.**
- **Free export, paid API.** Do not try to "just create an application"
  on a free account. The form will not take input.
- **No polling.** Watch the inbox.
- **Confirm the profile email** before you request. Official: the link
  goes there.
- Indoor / no-GPS activities will not give you a track file. The CSV
  summary (if present) is what you have.

## Sources

- https://www.strava.com/athlete/delete_your_account
- https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export
- https://developers.strava.com/docs/getting-started/
