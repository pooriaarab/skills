---
name: linkedin-bookmarks
description: "Use when the user wants to organize LinkedIn saved posts and articles — exporting to Notion or Notes reference, categorizing by topic, identifying actionable vs reference content, and pruning the saved queue. Triggers: 'organize LinkedIn saved', 'organize LinkedIn bookmarks', 'process my LinkedIn saves'."
---

# LinkedIn Bookmarks Organizer

Process the LinkedIn "Saved Posts" / "Saved Items" queue.

## Status

🟡 **Stub** — scaffold only.

## Requirements

- LinkedIn account.
- **Browser-driven only** — LinkedIn does not offer a public API for personal saves. Use Playwright or chrome-devtools MCP.
- Authenticated browser session (cookies copied from logged-in browser, or login automated).

## Step 1 — Ask the User First

```
1. Goal — export to Notion/Notes, or in-place categorization (LinkedIn has no native folders)?
2. Categorization — by topic (career, hiring, fundraising, etc.), by content type (post / article / job)?
3. After export — unsave on LinkedIn, or leave originals?
4. Destination format — markdown export, structured Notion DB, or simple URL list?
```

## Steps (TBD)

1. **Inventory** — scrape Saved Items list.
2. **Classify** — topic clustering.
3. **Plan** — migration TSV.
4. **Approve** — batch by topic.
5. **Apply** — write to destination, optionally unsave.
6. **Verify** — final count.

## Surface-specific notes

- LinkedIn's anti-scraping is aggressive; respect rate limits, use long delays.
- "Saved Posts" and "My Items" are separate queues — handle each.
- Job saves: separate flow (likely you'll want to convert active job leads into a tracker, archive the rest).
- LinkedIn cookies expire frequently; document the re-auth dance for the user.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../notion/SKILL.md`](../notion/SKILL.md)
