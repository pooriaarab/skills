---
name: cibc
description: "Use when the user wants a CIBC transaction download or eStatement PDF. Triggers: 'export CIBC transactions', 'CIBC Download Transactions', 'CIBC CSV', 'CIBC eStatements'."
---

# CIBC transaction export

Download posted transactions from CIBC Online Banking.
Official help names the click path, not the file extensions.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://www.cibc.com/

Official path:
[Check your balance and make transfers](https://www.cibc.com/en/personal-banking/ways-to-bank/how-to/account-balance-and-transfers.html).

eStatements (7 years):
[eStatements](https://www.cibc.com/en/personal-banking/ways-to-bank/how-to/estatements.html),
[how-to PDF](https://www.cibc.com/content/dam/personal_banking/ways_to_bank/pdfs/how-toguide-cibc-estatements-en.pdf).

## Submit

1. Sign in to Online Banking. Stop. The owner completes 2FA.
2. Home page → **More** → **Download Transactions**.
3. Choose the account and the time period.
4. If you use financial-management software, pick it from the drop-down.
5. Save the file.

eStatements: **My Accounts** → **View eStatements** → month → PDF.
Official how-to: statements dating back 7 years.

## Formats

Official help: account, period, software drop-down. It does **not** name
CSV, QFX, OFX, or QBO.
UNVERIFIED extensions, widely reported: CSV, QFX, OFX. Confirm labels on
the live form. PDF eStatements are **not** machine-readable.

## History

Official help lets the owner pick a **time period**. It publishes no maximum.
Official eStatements: **7 years** for credit-card and bank-account files.
Some investment / line-of-credit eStatements start at registration.
UNVERIFIED: a ~13-month cap on Download Transactions. If the form refuses
an older start date, pull PDFs.

## Categories

Official pages do not list a category column. Treat the file as uncategorized.

## Automation

No. Interactive login plus 2FA. Do not script the sign-in.

## Gotchas

Do not invent an extension the form does not show. Do not type the card
number, password, or 2FA code into an agent session.

## Sources

- https://www.cibc.com/en/personal-banking/ways-to-bank/how-to/account-balance-and-transfers.html
- https://www.cibc.com/en/personal-banking/ways-to-bank/how-to/estatements.html
- https://www.cibc.com/content/dam/personal_banking/ways_to_bank/pdfs/how-toguide-cibc-estatements-en.pdf
