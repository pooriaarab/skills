---
name: tangerine
description: "Use when the user wants a Tangerine transaction download — CSV, QFX, Microsoft Money, or PDF statements. Triggers: 'export Tangerine transactions', 'Tangerine CSV', 'Tangerine QFX'."
---

# Tangerine transaction export

Download posted transactions from tangerine.ca on a desktop.
Official: not the mobile app. The owner signs in.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://www.tangerine.ca/

Official: [How do I download Transactions?](https://www.tangerine.ca/en/faq/how-do-i-download-transactions).
PDFs: [How do I download Statements?](https://www.tangerine.ca/en/faq/how-do-i-download-statements).

## Submit

1. Sign in at https://www.tangerine.ca/. Stop. The owner completes 2FA.
2. Go to **Transactions** → **Download Transactions**.
3. Pick a date range and a format. Save the file.
4. PDFs: open the account → **Statements**. Official: "Every statement
   you need should be there."

## Formats

Official machine-readable: **QFX Quicken**, **Microsoft Money**,
**Excel CSV**. PDF statements are **not**. Official help does not list QBO.

## History

Official FAQ does not publish a maximum date range. Use the range the
form offers. Do not promise 18 months or four years.
UNVERIFIED: third-party write-ups disagree (about 12–18 months vs. years).
Older months: PDF statements. Electronic statements are monthly except
Investment Fund Accounts (quarterly). A past-statement reprint can cost $5.

## Categories and automation

Official pages do not list a category column. Treat as uncategorized.
No API. Interactive login plus 2FA on the website. The owner clicks.

## Gotchas

- If you are in the app, stop. Open tangerine.ca in a desktop browser.
- No documented personal REST API. No budget categories.
- Do not type the password or 2FA code into an agent session.

## Sources

- https://www.tangerine.ca/en/faq/how-do-i-download-transactions
- https://www.tangerine.ca/en/faq/how-do-i-download-statements
