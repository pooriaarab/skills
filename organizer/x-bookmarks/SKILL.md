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
- **`birdclaw` CLI** — `brew install steipete/tap/birdclaw` ([repo](https://github.com/steipete/birdclaw)). "Stores all your tweets nicely claw-able for agents" — exports bookmarks, likes, and tweets into structured JSON without paying for the X API.
- Logged-in X session in a browser (cookies imported via `sweetcookie`).
- Alternative paths (if `birdclaw` doesn't fit): Playwright scraping or X API v2 (paywalled).

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

## Reference implementation: live-sync to Notion (read-only, idempotent)

This skill describes the contract; the executable script lives in the user's `personal-os` directory at `~/Documents/pooriaarab/code/personal-os/scripts/x-bookmarks-to-notion.py` (eventually a public repo `pooriaarab/personal-os`). Skills describe — they don't ship code.

**Pipeline (fits into the daily cron):**

```
X (live)  ──birdclaw sync (xurl)──>  ~/.birdclaw/birdclaw.sqlite
                                          │
                                          ├──birdclaw backup export──>  brain/content/twitter/
                                          │                              (canonical JSONL,
                                          │                               version-controlled)
                                          │
                                          └──x-bookmarks-to-notion.py──>  Notion DB
                                              (reads from brain JSONL,
                                               idempotent on tweet ID,
                                               never deletes rows)
```

**Why brain JSONL as source (not SQLite directly):**
- Canonical, hashed manifest, version-controlled
- Survives a SQLite wipe / reinstall
- One source-of-truth for all downstream destinations

**Schema** (created automatically by `setup`):
| Column | Type | Notes |
|---|---|---|
| Tweet | title | First 100 chars of tweet text |
| ID | rich_text | X tweet ID — unique key for idempotency |
| Author / AuthorHandle | rich_text | name + @handle |
| URL | url | Direct link to the tweet on x.com |
| CreatedAt | date | When the tweet was posted |
| Taxonomy | select | ideas / reference / personal / etc. (lowercase shared taxonomy). Auto-classified if `ANTHROPIC_API_KEY` set |
| Status | select | active / needs_review / stale |
| Likes / Retweets / Replies | number | engagement metrics |

**One-time setup:**

1. In Notion, create a top-level page (e.g. `X Bookmarks`).
2. Share that page with your Notion integration (Page → ⋯ → Connections → add).
3. Set `NOTION_TOKEN` (from your integration) in `~/.config/personal-os/secrets.env`.
4. Run setup:
   ```bash
   X_BOOKMARKS_PARENT_PAGE="<page-url-or-id>" \
   python3 scripts/x-bookmarks-to-notion.py setup
   ```
   This creates the database under that page and writes the DB ID to `~/.config/personal-os/x-bookmarks-notion.json`.

**First-run backfill:**

```bash
# Dry-run a small batch to verify
python3 scripts/x-bookmarks-to-notion.py sync --dry-run --limit 5

# Real backfill of all bookmarks (~12 min for 2000 rows at Notion's 3 req/sec)
python3 scripts/x-bookmarks-to-notion.py sync
```

The script is **idempotent on tweet ID** — re-running picks up where it left off, never duplicates rows.

**Wire into daily cron** — add to `personal-os/scripts/social-sync.sh`:

```bash
if [ -n "$NOTION_TOKEN" ] && [ -f ~/.config/personal-os/x-bookmarks-notion.json ]; then
  python3 ~/Documents/pooriaarab/code/personal-os/scripts/x-bookmarks-to-notion.py sync &>/dev/null
fi
```

It gracefully no-ops until `setup` has been run.

**Properties of the design:**

- **One-way write** to Notion. Removing a bookmark in X does NOT delete the Notion row (you keep the archive).
- **No retroactive AI re-classification.** Existing rows keep their Taxonomy. Use the `Status` column to flag rows you want re-classified later.
- **Network-resilient.** The script retries on 429s and 5xx with exponential backoff (1s, 2s, 4s, 8s).
- **No X-side mutations.** Never unbookmarks. To prune your X queue, do it manually in the X app.

## Surface-specific notes

- **X has no native folders or tags on bookmarks.** Organization happens off-platform.
- **API access is paywalled** ($100+/mo for read tier). Browser scraping is the practical path for personal use.
- **Browser scraping caveats**: rate limit, session expiry, anti-bot measures. Use Playwright with explicit waits.
- Threads should be collapsed into a single record; X often shows them as multiple bookmarks if you bookmarked individual tweets.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../notion/SKILL.md`](../notion/SKILL.md) — preferred destination for structured bookmark library
