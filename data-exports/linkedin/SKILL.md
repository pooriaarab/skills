---
name: linkedin
description: "Use when the user wants a LinkedIn data archive — connections, messages, profile, invitations, or the larger download. Triggers: 'download my LinkedIn data', 'export connections', 'Get a copy of your data', 'Connections.csv'."
---

# LinkedIn data download

Request a copy of the member's own LinkedIn data from Settings & Privacy.
Desktop only. Official help: not available on mobile.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://www.linkedin.com/mypreferences/d/download-my-data

Official help: [Download your data](https://www.linkedin.com/help/linkedin/answer/a1339364).

## Submit

1. Sign in on a personal computer, not a public one. Official warning. Stop. The owner signs in.
2. Click the **Me** icon → **Settings & Privacy**.
3. Click **Data privacy** in the left rail.
4. Under **How LinkedIn uses your data**, click **Download your data**.
5. Choose:
   - specific categories (fast), or
   - the larger data archive (connections, verifications, contacts, account history, inferences, and more).
6. Click **Request archive**.

LinkedIn emails a link to the primary email on the account. Use that link.
The same Settings page also grows a **Download archive** button when the
file is ready.

EU/EEA/Switzerland members also have Member Portability APIs. That is a
separate developer path. This skill is the settings download.

## What it contains

LinkedIn only returns categories that apply to the account. No certifications
on the profile means no Certifications file. LinkedIn provides the member's
own data, not other members' data.

**Ready in about 10 minutes** (official list, abbreviated to the files people
actually open):

| Category | What LinkedIn puts in it |
|---|---|
| Profile | Name, address, date of birth, zip |
| Positions, Education, Skills, Languages | Profile sections |
| Invitations | Sent and received, with names, URL, date, message |
| Recommendations given / received | Text, company, date |
| Job Applications, Saved Jobs, Saved Job Alerts | Job-seeker history |
| Registration | Registered date, IP, current subscription type |
| Articles, Shares-related profile media | URLs and rich media links |
| Verifications | Identity / workplace / education verification |

**Ready in about 48 hours:**

| Category | What LinkedIn puts in it |
|---|---|
| **Connections** | First and last name, public profile URL, email (only if that person allowed it), company, position, connected-on date. 1st-degree only. |
| Messages | Sent, received, archived. Date, subject, content, public profile URL |
| Contacts | Imported contacts |
| Comments, Reactions, Shares, Instant Reposts, Votes | Public activity |
| Saved Items | Saved posts and articles |
| Search Queries | Search-bar history |
| Logins, Account Status History, Security Challenges | Account security log |
| Inferences | What LinkedIn inferred |
| Ads Clicked, Ads LAN | Ad engagement |
| Calendar | Synced calendar source and last sync |
| AI-powered conversations | LinkedIn's AI chat / writing-assistant history |

The larger archive is a zip of CSV (and some JSON) files named after those
categories, for example `Connections.csv`.

## What it does not

- **People You May Know.** Official: not provided.
- **Who's Viewed Your Profile.** Official: not provided.
- **2nd- and 3rd-degree contacts.** Official: you cannot export a list of people who are not 1st-degree connections.
- **Most connection email addresses.** Members opt out by default. Missing email is normal, not a broken export.
- **Another member's private data.**
- Data after you close the account. Download first.

A **Data Access Request Form** exists for categories that are not in the
files above. Official note: several days for a response.

CCPA: LinkedIn also lets California members request how data has been
collected, used, and shared since 1 January 2022. That is a separate
disclosure, not this zip.

## Delivery

- Specific category: official "within minutes" / "Available within 10 minutes" for the first table, 48 hours for Connections, Messages, and the rest of the second table.
- Larger download: official email within 24 hours.
- The file stays downloadable for **72 hours**.

Two emails are common: one when a partial archive is ready, one when the
complete archive is ready. Download the complete one.

## Format

ZIP of CSV files. Some categories arrive as JSON. `Connections.csv` starts
with a few disclaimer rows before the header. Importers that expect row 1
to be the header will misread it.

Official note: CSV and vCard do not carry all characters. Chinese, Japanese,
and Hebrew (and other extended sets) can be lost in those formats.

## Gotchas

- **Desktop only.** Official. The mobile app does not host this flow.
- **72-hour link.** Miss it and request again.
- **Missing emails are by design.** Do not "fix" the CSV by scraping profiles.
- **Do not use a public computer.** Official.
- **No polling.** Watch the primary inbox.
- Filename convention UNVERIFIED beyond the category names: complete zips are often named like `Complete_LinkedInDataExport_<date>.zip`. Trust the email link, not the name.

## Sources

- https://www.linkedin.com/mypreferences/d/download-my-data
- https://www.linkedin.com/help/linkedin/answer/a1339364
- https://www.linkedin.com/help/linkedin/answer/a566336
