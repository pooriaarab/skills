---
name: rbc
description: "Use when the user wants an RBC Royal Bank transaction download — CSV, OFX, QFX, QuickBooks, or PDF eDocuments. Triggers: 'export RBC transactions', 'RBC CSV', 'RBC QFX', 'RBC eDocuments'."
---

# RBC transaction export

Download posted transactions from RBC Online Banking on a desktop.
The owner signs in. No personal-export API.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://www.rbcroyalbank.com/ — **Sign In to Online Banking**.

Official software help:
[Downloading Transactions with Financial Planning Software](https://www.rbcroyalbank.com/online/downloading-transactions.html).

eDocuments: Accounts Summary → **Statements/Documents**.
[Access Your Account Statement](https://www.rbcroyalbank.com/ways-to-bank/tutorials/transactions-and-statements/access-account-statement.html).
[Document options FAQs](https://www.rbcroyalbank.com/onlinebanking/bankingusertips/profile/statement_options.html).

## Submit

1. Sign in. Stop. The owner enters the client card and password and completes 2FA.
2. Official help: **Copy to accounting software** → accounts and period →
   software from the list → save.
3. UNVERIFIED current UI: **My Accounts** → the account → **Download**
   above the table → format → date range → **Continue**. Use step 2 if
   that control is missing.
4. Older months: **Statements/Documents** → Account Documents → PDF.

Website only. Do not look for the software download in the app.

## Formats

Official: Quicken, QuickBooks, Microsoft Money, Simply Accounting
(machine-readable OFX / QFX / QBO-class files).
UNVERIFIED: current Download dialog also offers CSV, `.qfx`, `.ofx`, `.qbo`.
PDF eDocuments are **not** machine-readable.

## History

Official view ([Manage my Banking Accounts](https://www.rbcroyalbank.com/onlinebanking/bankingusertips/accounts/)):
up to **1000** transactions; paper items **90** days; some non-paper
details **120** days. Default list is two weeks.
UNVERIFIED: CSV window of about 90–180 days.
Official eDocuments: **7 years**. Some Custom Statements **18 months**.
Closed accounts lose eDocuments.

## Categories and automation

Official pages do not list a category column. Treat as uncategorized.
No API. Interactive login plus 2FA. Do not script the sign-in.

## Gotchas

The official help URL has 404'd over HTTPS in some checks. If it 404s,
use the in-session Download control or Statements/Documents. Do not type
the client card or password into an agent session.

## Sources

- https://www.rbcroyalbank.com/online/downloading-transactions.html
- https://www.rbcroyalbank.com/onlinebanking/bankingusertips/accounts/
- https://www.rbcroyalbank.com/onlinebanking/bankingusertips/profile/statement_options.html
- https://www.rbcroyalbank.com/ways-to-bank/tutorials/transactions-and-statements/access-account-statement.html
