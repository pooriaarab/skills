---
name: bmo
description: "Use when the user wants a BMO transaction download — CSV, OFX, Quicken, QuickBooks, or PDF eStatements. Triggers: 'export BMO transactions', 'BMO CSV', 'BMO OFX', 'BMO eStatements'."
---

# BMO transaction export

Download posted transactions from BMO Online Banking.
Official download window is two months. The owner signs in.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://www.bmo.com/

Official FAQ:
[How do I download my transactions?](https://bmo.intelliresponse.com/olb_sp_en/?id=2669&question=How+do+I+download+my+transactions&requestType=NormalRequest).

eStatements: [Understanding Bank Statements](https://www.bmo.com/en-ca/main/personal/bank-accounts/what-is-a-bank-statement/).
Archive length:
[Consent to Electronic Delivery](https://www.bmo.com/pdf/Final_Consent%20to%20Electronic%20Delivery%20of%20Documents%20English.pdf).

## Submit

1. Sign in to Online Banking. Stop. The owner completes 2FA.
2. **Accounts** → the account.
3. To the right of **Transactions**, click **DOWNLOAD**.
4. Fill in date range and format. Save the file.
5. Official: only **posted** rows download. Pending rows are omitted.

Older months: **eStatements** on the account → PDF.
This is Canadian Online Banking. Do not use a BMO US portal.

## Formats

Official: QuickBooks, Quicken, Simply Accounting, **`.ofx`**, **CSV**.
Those are machine-readable. PDF eStatements are **not**.

## History

Official FAQ: **2 months** of history into a money-management program.
Official eStatements: **7 years** after posting. Closed accounts lose them.
UNVERIFIED: a longer on-screen history than the two-month download.

## Categories

Official pages do not list a category column. Treat the file as uncategorized.

## Automation

No. Interactive login plus 2FA. Do not script the sign-in.

## Gotchas

Two months is the official download cap. For older books, pull PDFs. No
documented personal REST API. Do not type the password or 2FA code into
an agent session.

## Sources

- https://bmo.intelliresponse.com/olb_sp_en/?id=2669&question=How+do+I+download+my+transactions&requestType=NormalRequest
- https://www.bmo.com/en-ca/main/personal/bank-accounts/what-is-a-bank-statement/
- https://www.bmo.com/pdf/Final_Consent%20to%20Electronic%20Delivery%20of%20Documents%20English.pdf
