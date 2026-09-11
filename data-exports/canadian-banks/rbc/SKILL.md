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

Verified against the live UI on 2026-09-11. Replaces the earlier guesses.

1. `https://www.rbcroyalbank.com/` → **Sign in to RBC Online Banking**.
   Lands on `secure.royalbank.com/statics/login-service-ui/`.
2. **Stop.** The owner enters the client card and password and completes 2FA.
   Do not attempt to supply these.
3. Accounts Summary (`#/summary`) lists **Bank Accounts**, **Credit Cards**,
   **Investments** and **Lines & Loans**, each with a balance. This page alone
   answers "what accounts exist and what is in them".
4. Click the account name. The URL becomes `#/details;selectedAccount`.
5. The account page shows Current Balance, Available Balance and **Authorized
   Overdraft**, then the transaction table with a **Download** button and a
   **More download options** link beneath it.
6. **Widen the range first.** The table defaults to `Display: 14 days`, and a
   download taken without changing it silently returns a fortnight.
7. Older months: **Statements/Documents** → Account Documents → PDF.

### Automation reality

The Accounts Summary scrapes cleanly, so balances and account types can be
read by an agent. **The download itself resists automation.** On the account
page the `Download` control sits below the fold and a synthetic click lands on
the adjacent transfer form instead; a ref click, an `element.click()` and a
coordinate click were each measured and none opened the dialog.

Treat balance capture as automatable and the transaction download as a
hand-off to the owner. That is one click for them, against an unbounded
number of attempts for an agent.

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
