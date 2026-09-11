---
name: wealthsimple
description: "Use when the user wants a Wealthsimple transaction or statement CSV — Activities export, monthly statements, or holdings. Triggers: 'export Wealthsimple transactions', 'Wealthsimple CSV', 'Download activities', 'Wealthsimple chequing statement'."
---

# Wealthsimple transaction export

Download a CSV from the Wealthsimple website. The owner signs in.

Parent: [canadian-banks](../SKILL.md).

## Request URL

https://my.wealthsimple.com/

Official: [Request a custom statement](https://help.wealthsimple.com/hc/en-ca/articles/35654428540571-Request-a-custom-statement),
[Find your monthly statements](https://help.wealthsimple.com/hc/en-ca/articles/360056580894-Find-your-monthly-statements),
[trading account documents](https://help.wealthsimple.com/hc/en-ca/articles/360058452853-View-your-trading-account-documents).

## Submit

**Activities CSV** (Trade, managed, Crypto):

1. Sign in. Stop. The owner completes 2FA.
2. **Activities** tab (clock icon) → **Download activities**.
3. Time period → **Next** → tick accounts → **Download CSV**.

Official: this export **omits** chequing, crypto staking, and swaps.

**Monthly statements** (PDF or CSV, including chequing):

1. Profile (bottom left) → **Documents** → **Statements**.
2. Filter by account. Click **PDF** or **CSV** on a row.
3. Bulk: **Generate document** → **Bulk download monthly statements** →
   CSV or PDF → dates → accounts → ZIP.

**Holdings CSV** is as-of today only. You cannot pick a past date.

Chequing CSV is web only. Official: not in the app. Business chequing:
Documents → Performance statements → **Download CSV**
([help](https://help.wealthsimple.com/hc/en-ca/articles/48319177129755-Link-your-Business-chequing-account-to-accounting-software)).

## Formats

Official: **CSV** (machine-readable) and **PDF** (not).
Official help does not list OFX, QFX, or QBO.

## History

Activities: owner picks the period. Official help publishes no maximum.
Monthly CSVs: one month per file, or a range in the bulk ZIP.
Official: chequing statements from **September 2023**.

## Categories and automation

Official pages do not list a budget-category column. Treat as uncategorized.
No personal-export API. Interactive login plus 2FA. Business chequing can
link accounting software through Plaid — read [canadian-banks](../SKILL.md)
first.

## Gotchas

- Use **Download activities** for trades. Use **Statements** for chequing.
- Do not type the password or 2FA code into an agent session.

## Sources

- https://help.wealthsimple.com/hc/en-ca/articles/35654428540571-Request-a-custom-statement
- https://help.wealthsimple.com/hc/en-ca/articles/360056580894-Find-your-monthly-statements
- https://help.wealthsimple.com/hc/en-ca/articles/360058452853-View-your-trading-account-documents
