---
name: kindle
description: "Use when the user wants Amazon Kindle reading data — highlights, notes, reading insights, or the Kindle slice of Request My Data. Triggers: 'download my Kindle data', 'Kindle highlights', 'Kindle reading insights', 'read.amazon.com/notebook'."
---

# Kindle reading data

Kindle notes, highlights, and reading activity. The request portal is
the same Amazon desk as [amazon](../amazon/SKILL.md). Use that page
for the click path. This page covers what to tick and what else exists.

Parent argument: [data-exports](../SKILL.md).

## Request URL

Bulk copy (Kindle categories inside Amazon Request My Data):

https://www.amazon.com/hz/privacy-central/data-requests/preview

Follow [amazon](../amazon/SKILL.md) for sign-in, confirm-email, and
delivery. Tick **Kindle**. Do not re-document the portal here.

On-session notebook (Kindle for Web): https://read.amazon.com
Official: [View Your Notebook in Kindle for Web](https://www.amazon.com/gp/help/customer/display.html?nodeId=TS3oZMNGd9T0s62hVd).
Move the pointer to the top → **Notebook** icon.

Amazon UK documents https://read.amazon.co.uk/notebook. UNVERIFIED: the
US twin `https://read.amazon.com/notebook`. Prefer Kindle for Web if it 404s.

## Submit

1. For the archive: owner signs in, ticks **Kindle**, submits, confirms
   the email. Same rules as [amazon](../amazon/SKILL.md).
2. For one book's notes: open the book → notebook → share/export.
   Goodreads (Amazon) documents **Export** to email a PDF or flashcards
   ([Export Kindle Notes & Highlights](https://help.goodreads.com/s/article/000001752)).
3. Sync must be on, or Export/Share for notes is unavailable.
   Official: [Update Your Sync Settings for Kindle](https://www.amazon.com/gp/help/customer/display.html?nodeId=GGFEXXS8Z7DPJSTN).

## What it contains

- Request My Data, Kindle categories: reading data Amazon holds.
  Official help does not inventory the file names.
  UNVERIFIED names: reading insights (books, sessions, pages, time)
  and annotations (highlights and notes).
- Kindle for Web notebook: highlights, notes, and bookmarks.
- Per-book export: PDF or flashcards of that book's notes.

## What it does not

- The ebook files. This is annotations and reading activity.
- Handwritten Scribe annotations on non-Scribe apps. Official: those
  stay on Scribe devices.
- Notes made while Sync was off. Official: they may be lost.
- Retail orders and Alexa. Those are [amazon](../amazon/SKILL.md).

UNVERIFIED: a USB `My Clippings.txt` on some e-readers. Amazon help
fetched for this page does not name that file.

## Delivery

Kindle-category zip: same Amazon email flow as [amazon](../amazon/SKILL.md).
Notebook and per-book export: on-session, or an email for that book.

## Format

Request My Data: ZIP (UNVERIFIED inner types: CSV and JSON). Notebook:
on-screen list. Per-book export: PDF or flashcards.

## Gotchas

- **One portal, two skills.** Orders live on [amazon](../amazon/SKILL.md).
- **Sync off kills export.** Turn it on before you rely on cloud notes.
- **No polling** for the zip. Watch the inbox. The owner clicks.

## Sources

- https://www.amazon.com/hz/privacy-central/data-requests/preview
- https://read.amazon.com
- https://www.amazon.com/gp/help/customer/display.html?nodeId=TS3oZMNGd9T0s62hVd
- https://www.amazon.com/gp/help/customer/display.html?nodeId=GGFEXXS8Z7DPJSTN
- https://help.goodreads.com/s/article/000001752
