---
name: scotiabank
description: "Use when the user wants a Scotiabank personal transaction download — QFX, QBO, or PDF eStatements. Triggers: 'export Scotiabank transactions', 'Scotia QFX', 'Scotia QuickBooks', 'Scotia eStatements'."
---

# Scotiabank transaction export

Download posted transactions from Scotia OnLine on a desktop.
Official: the app cannot download history yet. The owner signs in.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://www.scotiabank.com/

Official: [QuickBooks download](https://help.scotiabank.com/article/how-do-i-download-my-transactions-to-quickbooks),
[MS Money / QFX](https://help.scotiabank.com/article/how-can-i-download-transactions-to-ms-money),
[app: not yet](https://help.scotiabank.com/article/can-i-download-my-transaction-history-in-the-app),
[Statement Centre](https://www.scotiabank.com/ca/en/personal/bank-your-way/statements-centre.html).

Personal Scotia OnLine only. ScotiaConnect (business) is a different product.

## Submit

1. Sign in. Stop. The owner completes 2FA.
2. **Accounts** → the account → **statement period** dropdown.
3. Scroll. Click **Load more** until **Current statement period total** appears.
4. Download icon at the top.
5. Official QuickBooks: **Download as QuickBooks**. Official MS Money:
   **Statement Downloads** → **Quicken (QFX)**.

PDFs: Accounts → the account → **Documents** → the statement.
Official: up to **7 years**.

## Formats

Official "new experience": **QuickBooks (QBO)** and **Quicken (QFX)**.
Both machine-readable. Scotiabank tells MS Money users to pick QFX.
UNVERIFIED: a CSV option on the same personal download icon.
PDF eStatements are **not** machine-readable.

## History

Official download is **one statement period**. Load every row first or
the file is incomplete. Official eStatements: **7 years**.
UNVERIFIED: a multi-year CSV from personal OnLine. Do not promise it.

## Categories

Official pages do not list a category column. Treat the file as uncategorized.

## Automation

No. Interactive login plus 2FA. The app has no download.

## Gotchas

If **Current statement period total** is missing, keep loading. Do not
type the password or 2FA code into an agent session.

## Sources

- https://help.scotiabank.com/article/how-do-i-download-my-transactions-to-quickbooks
- https://help.scotiabank.com/article/how-can-i-download-transactions-to-ms-money
- https://help.scotiabank.com/article/can-i-download-my-transaction-history-in-the-app
- https://www.scotiabank.com/ca/en/personal/bank-your-way/statements-centre.html
