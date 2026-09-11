---
name: canadian-banks
description: "Use when the user wants a personal transaction export from a Canadian bank — RBC, Tangerine, Wealthsimple, BMO, Scotiabank, or CIBC — or when an aggregator (Plaid, Flinks, MX) is proposed instead of a file download. Triggers: 'export my bank transactions', 'download RBC CSV', 'Tangerine QFX', 'Wealthsimple activities CSV', 'BMO OFX', 'Scotiabank QBO', 'CIBC download transactions', 'Plaid Canada', 'open banking Canada'."
---

# Canadian bank transaction exports

Download a machine-readable file from the bank's website.
Do not start from an aggregator. The owner signs in.

Parent argument: [data-exports](../SKILL.md).

**Use this** for one person's posted transactions at a bank they already use.
**Do not** scrape a login, store someone else's credentials, or treat
aggregator sandbox output as real money.

## Sandbox is not money

**Stop. Check currency and account names before you trust any aggregator
output.**

A prior attempt used Plaid **Sandbox** data and wrote the fake balances
into a personal knowledge vault as real money. A fictional 401k and a
fictional mortgage appeared in the records of someone who has only ever
worked in Canada.

Official Plaid fixtures are named `Plaid Checking`, `Plaid 401k`, and
`Plaid Mortgage`. They are **USD**.
[Plaid Accounts](https://plaid.com/docs/api/accounts/) shows
`Plaid Checking` and `Plaid 401k` with `iso_currency_code: "USD"`.
[Plaid CLI](https://plaid.com/docs/resources/cli/) lists `Plaid Mortgage`
in USD. Reject any row whose name starts with `Plaid` or whose currency
is not CAD, unless the owner confirmed a US account.

## Comparison

| Bank | Best machine-readable format | Max in one download | Categories |
|---|---|---|---|
| [RBC](rbc/SKILL.md) | UNVERIFIED: CSV or OFX/QFX | Official view 90–120 days. PDF eDocs 7 years | No |
| [Tangerine](tangerine/SKILL.md) | CSV or QFX | UNVERIFIED cap. PDF statements on the account | No |
| [Wealthsimple](wealthsimple/SKILL.md) | CSV | Owner picks the Activities range. Monthly CSVs | No |
| [BMO](bmo/SKILL.md) | CSV or OFX | Official: 2 months. PDF eStatements 7 years | No |
| [Scotiabank](scotiabank/SKILL.md) | QFX or QBO | Official: one statement period. PDF 7 years | No |
| [CIBC](cibc/SKILL.md) | UNVERIFIED: CSV / QFX / OFX | Owner picks a period. PDF eStatements 7 years | No |

PDF statements are **not** machine-readable. CSV, OFX, QFX, and QBO are.
Official download pages do not document a budget-category column.

## Aggregators

Plaid, Flinks, and MX can pull Canadian accounts. That is not a file you
download yourself.

An aggregator needs banking credentials or an OAuth handoff.
[Plaid's OAuth guide](https://plaid.com/docs/link/oauth/) says OAuth is
"not currently used by financial institutions in Canada." Credential
handoff is the usual path. Finance Canada says about **nine million**
Canadians already share data by screen scraping
([Canada Gazette, 27 June 2026](https://gazette.gc.ca/rp-pr/p1/2026/2026-06-27/html/reg3-eng.html)).

Sharing a password can shift liability. RBC's
[Electronic Access Agreement](https://www.rbcroyalbank.com/onlinebanking/electronic-access-agreement.html)
lets a client share a password with an aggregator, then says RBC will not
help that aggregator, will not cover resulting losses, and may block it.
Read the bank's agreement before a third-party widget gets the password.

**Canadian open banking as of 11 September 2026.** The law exists. The
pipes are not live.

- [Consumer-Driven Banking Act](https://lois.justice.gc.ca/eng/acts/C-36.78/FullText.html):
  royal assent 26 March 2026. Bank of Canada oversees it.
- Proposed regulations: Canada Gazette 27 June 2026. Comments closed
  26 August 2026. Staggered coming-into-force: accreditation first, then
  common rules and fees within one year of **final** publication
  ([Finance Canada, June 2026](https://www.canada.ca/en/department-finance/news/2026/06/government-pre-publishes-regulations-to-prevent-fraud-and-facilitate-the-next-phase-of-consumer-driven-banking.html)).
- Phase one is read-only. Write access is later. The Act bans screen
  scraping; the Gazette RIAS says that ban is **not** in force yet.

UNVERIFIED: a live consumer-facing API under this framework today. Final
regulations were not published as of this writing. "Open banking" does
not replace the download.

Prefer the bank's own file. Use an aggregator only if the owner accepts
the credential risk and you have already rejected Sandbox fixtures.
If the bank is missing from the table, find its official download page.

## Safety

This repository is public. Never write a name, email, account number,
balance, or home path into a skill or PR. Never enter a password or 2FA
code. Stop at the login wall. Do not upload the file to a ticket or chat.

## Sources

- https://lois.justice.gc.ca/eng/acts/C-36.78/FullText.html
- https://gazette.gc.ca/rp-pr/p1/2026/2026-06-27/html/reg3-eng.html
- https://www.canada.ca/en/department-finance/news/2026/06/government-pre-publishes-regulations-to-prevent-fraud-and-facilitate-the-next-phase-of-consumer-driven-banking.html
- https://plaid.com/docs/link/oauth/
- https://plaid.com/docs/api/accounts/
- https://www.rbcroyalbank.com/onlinebanking/electronic-access-agreement.html
