---
name: amazon
description: "Use when the user wants an Amazon 'Request My Data' archive — orders, search, payments, Alexa, or other retail-account data. Triggers: 'download my Amazon data', 'Request My Data', 'Amazon order history export', 'Download order reports'."
---

# Amazon Request My Data

Request a copy from Amazon's data-request portal. That is the current
official dump. It is not the old date-range order-history report.

Parent argument: [data-exports](../SKILL.md).
Kindle reading data: [kindle](../kindle/SKILL.md).

## Request URL

https://www.amazon.com/hz/privacy-central/data-requests/preview

Use the same path on the store you shop on (`amazon.ca`, `amazon.co.uk`).
Sign-in is required.

Official help: [Request your personal information](https://www.amazon.com/gp/help/customer/display.html?nodeId=TP1zlemejtTn6pwYKS).

Click path: **Account & Lists** → **Your Account** → **Manage your data**
→ **Request your data**.

## Submit

1. Sign in on the regional store. Stop. The owner signs in.
2. Open the Request URL. Select categories. **Your Orders** is purchase
   history. **Request All Your Data** is the full dump. Tick **Kindle**
   only for reading data; then open [kindle](../kindle/SKILL.md).
3. Click **Submit Request**.
4. Open the confirmation email and click the validation link. Nothing
   is built until that click.

## What it contains

Official: data not already in **Your Account**, such as search history.
The same portal also serves **Your Orders**, **Your Addresses**, and
**Payment Options**.

**Your Orders** is years of purchases and spend. That is the dataset.

In-account views (not the zip): order history, payments, addresses,
account settings, communication preferences.

UNVERIFIED file names: order-history and refund CSVs in a **Your Orders** zip.

## What it does not

- The old **Download order reports** CSV. Official help no longer
  documents that page. Request My Data is the current path.
- Another person's Amazon account.
- Amazon Business Analytics reports (a Business-account product).
- Kindle book files. Notes are a Kindle category.

## Delivery

Amazon emails a confirmation, then a secure download link.

Official retail help does not publish a day count. Audible's official
note for this portal: confirm within **5 days**.

UNVERIFIED: download links last about 90 days. Download when the mail
arrives.

## Format

ZIP of CSV (and similar) files, one category per package.

## Gotchas

- **Confirm the email.** An unconfirmed request does nothing.
- **Match the store.** A `.com` request will not hold `.ca` orders.
- **Your Account is not the archive.** The on-site order list is not a
  bulk CSV.
- **No polling.** Watch the inbox. The owner clicks. The agent does not.

## Sources

- https://www.amazon.com/hz/privacy-central/data-requests/preview
- https://www.amazon.com/gp/help/customer/display.html?nodeId=TP1zlemejtTn6pwYKS
- https://www.amazon.com/gp/help/customer/display.html?nodeId=TJxMd8vqN3YHz8DNEo
- https://help.audible.com/s/article/manage-your-personal-data
