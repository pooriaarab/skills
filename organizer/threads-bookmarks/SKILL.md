---
name: threads-bookmarks
description: "Use when the user wants to organize Threads saved posts — exporting to Notion or Notes reference, categorizing, and pruning the saved queue. Triggers: 'organize Threads saved', 'clean up Threads bookmarks'."
---

# Threads Saved Organizer

Process Threads saved posts.

## Status

🟡 **Stub** — scaffold only.

## Requirements

- Threads account (Meta).
- **Browser- or app-driven** — Threads uses Instagram's auth + has limited public API.
- For account-level data, "Download Your Information" via Meta Account Center is the most reliable bulk source.

## Step 1 — Ask the User First

```
1. Goal — export to a destination, or in-place organization (Threads has no folders)?
2. Categorization — topic-based, by author, by content type?
3. After export — unsave, or leave originals?
4. Source — Meta data download or live scrape?
```

## Steps (TBD)

1. **Inventory** — fetch saved list (URL, author, content excerpt, date).
2. **Classify** — topic clustering.
3. **Plan** — migration TSV.
4. **Approve** — batch.
5. **Apply** — write to destination, optionally unsave.
6. **Verify** — final count.

## Surface-specific notes

- Threads is newer than X / Instagram; tooling is thinner. Browser scraping is the practical path.
- Auth is shared with Instagram; cookies overlap.
- Volume tends to be lower than X bookmarks; most users have hundreds, not thousands.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../notion/SKILL.md`](../notion/SKILL.md)
- [`../instagram-saved/SKILL.md`](../instagram-saved/SKILL.md) — shares Meta auth
