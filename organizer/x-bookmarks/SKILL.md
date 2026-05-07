---
name: x-bookmarks
description: "Use when the user wants to organize X / Twitter bookmarks — exporting them to a structured destination (Notion, Notes reference), categorizing by topic, identifying actionable vs reference content, and pruning the bookmark queue back to a manageable size. Triggers: 'organize my X bookmarks', 'organize Twitter bookmarks', 'process X saved'."
---

# X / Twitter Bookmarks Organizer

Process the X bookmarks queue.

## Status

🟡 **Stub** — scaffold only.

## Requirements

- X account.
- Either:
  - **Browser-driven**: Playwright / Chrome DevTools MCP to scrape the bookmarks UI (no API access required, but slower).
  - **API-driven**: X API v2 with the `bookmark.read` scope. Note: X API access is heavily restricted and tier-paywalled.

## Step 1 — Ask the User First

```
1. Goal — full export to a destination (Notion / Notes / markdown), or in-place organization (X has no folders)?
2. Categorization — by topic (AI, finance, etc.), by content type (thread / link / image), by actionable / reference?
3. Pruning — after export, unbookmark items moved out? Or leave originals?
4. Destination format — markdown file with thread bodies, structured Notion DB, or just URLs in Notes reference?
5. Date range — last 6 months, last year, all-time?
```

## Steps (TBD)

1. **Inventory** — scrape or fetch all bookmarks (URL, author, content, date).
2. **Classify** — model-assisted topic clustering on the content.
3. **Plan** — proposed migration — which goes to Notion DB, which to Notes reference, which to discard.
4. **Approve** — batch by category.
5. **Apply** — write to destination, optionally unbookmark on X.
6. **Verify** — final destination has expected count.

## Surface-specific notes

- **X has no native folders or tags on bookmarks.** Organization happens off-platform.
- **API access is paywalled** ($100+/mo for read tier). Browser scraping is the practical path for personal use.
- **Browser scraping caveats**: rate limit, session expiry, anti-bot measures. Use Playwright with explicit waits.
- Threads should be collapsed into a single record; X often shows them as multiple bookmarks if you bookmarked individual tweets.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../notion/SKILL.md`](../notion/SKILL.md) — preferred destination for structured bookmark library
