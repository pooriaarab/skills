---
name: steam
description: "Use when the user wants a copy of Steam account data — playtime, game stats, transactions, or the Privacy Dashboard dump. Triggers: 'download my Steam data', 'Steam Privacy Dashboard', 'Steam playtime export', 'View Account Data'."
---

# Steam Privacy Dashboard

Open Valve's Privacy Dashboard. Playtime and game stats are a taste
profile that almost no other export covers.

Parent argument: [data-exports](../SKILL.md).

## Request URL

https://help.steampowered.com

Official path (Privacy Policy): sign in, then **My Account** → **Data
Related to Your Steam Account**. The policy also names **My Account**
→ **View Account Data**.

If the dashboard cannot serve the request (still needs a Steam login):

https://help.steampowered.com/wizard/HelpAccountDataQuestion

Official policy: [Privacy Policy Agreement](https://store.steampowered.com/privacy_agreement/).

## Submit

1. Open https://help.steampowered.com. Stop. The owner signs in
   (Steam Guard on a trusted device).
2. Open **My Account** → **Data Related to Your Steam Account**.
3. Read and save the HTML the dashboard already shows.

This is not an emailed zip. Official: Valve serves Personal Data as
**structured HTML** on the dashboard, worldwide.

Email to questions@valvesoftware.com is a last resort. Valve will not
release data from that mail until Proof of Ownership
([article 2268-EAFZ-9762](https://support.steampowered.com/kb_article.php?ref=2268-EAFZ-9762)).

## What it contains

Official collection the dashboard is built to expose:

- Basic account: email, country, username, Steam ID
- Transaction and payment data used to take a payment
- Community posts, chat, support, contest entries
- **Game statistics**: preferences, progress, **playtime**, device, OS,
  crash data
- Store and client use, IP, cookies, recommendation and mail events.
  Some fraud and cheat-detection data is withheld. Official.

## What it does not

- Another person's Steam account.
- A copy of every game binary.
- Data Valve withholds because disclosure would break cheat or fraud
  detection. Official.
- A public Steamworks API dump of someone else.

## Delivery

Immediate HTML after sign-in. No inbox wait for the dashboard.

The HelpAccountDataQuestion form is a support ticket, not a timed zip.
Official policy does not publish a day count for that path.

## Format

Structured HTML on the Privacy Dashboard. Official.

## Gotchas

- **Steam Guard.** The owner completes it. The agent does not.
- **Login is the only supported access path.** Mail without Proof of
  Ownership will not yield the files.
- **Not unattended from a cold start.** After login the HTML is there.
  There is still no pollable export API.
- **Account deletion** starts a 30-day restore window. Download first.

## Sources

- https://help.steampowered.com
- https://store.steampowered.com/privacy_agreement/
- https://help.steampowered.com/wizard/HelpAccountDataQuestion
- https://support.steampowered.com/kb_article.php?ref=2268-EAFZ-9762
