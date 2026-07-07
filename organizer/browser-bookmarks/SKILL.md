---
name: browser-bookmarks
description: "Use when the user wants to organize browser bookmarks across Chrome, Arc, or Safari — folder taxonomy, dead-link detection, exporting research bookmarks to Notion/Notes, deduplication, pruning stale bookmarks. Triggers: 'organize my bookmarks', 'too many Safari bookmarks'."
---

# Browser Bookmarks Organizer

Organize bookmarks in Chrome, Arc, or Safari.

## Requirements

- Chrome/Arc bookmarks: read `~/Library/Application Support/{Google/Chrome,Arc}/Default/Bookmarks` (JSON file).
- Safari bookmarks: AppleScript via `tell application "Safari"` or read `~/Library/Safari/Bookmarks.plist`.

## Step 1 — Ask the User First

```
1. Browsers in scope — Chrome / Arc / Safari / all?
2. Folder taxonomy — match the shared lowercase categories, or browser-native folders?
3. Dead-link policy — auto-prune 404s, mark as dead, or leave?
4. Migration target — bookmarks meant as research-references should move to Notion/Notes — yes/no?
5. Deduplication — exact URL matches, or also fuzzy (different query strings, redirects)?
6. Bookmark bar items — separate strict policy (only "daily-use" links)?
```

## Steps (TBD)

1. **Inventory** — read bookmark file, count by folder, identify orphans (top level).
2. **Dead-link check** — HEAD requests with timeout. Mark dead.
3. **Classify** — bucket each bookmark by category (work, research, reference, daily-use, etc.).
4. **Plan** — folder structure changes, dead-link prune list, migration list (research → Notion).
5. **Approve** — batch by destination folder.
6. **Apply** — for Chrome/Arc: write back the JSON. For Safari: AppleScript or plist edit.
7. **Verify** — final bookmark count + folder structure.

## Surface-specific notes

- **Chrome/Arc share the same JSON format** under `Default/Bookmarks`. Back up the file before editing.
- **Safari uses a binary plist** — `plutil -convert xml1 Bookmarks.plist` to read, `plutil -convert binary1` to write back.
- iCloud-synced Safari bookmarks: changes propagate to all devices.
- Bookmark sync (Chrome Sync, Arc, iCloud Bookmarks) means edits sync — be sure user agrees.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../notion/SKILL.md`](../notion/SKILL.md) — destination for research-link bookmarks
- [`../apple-notes/SKILL.md`](../apple-notes/SKILL.md) — alternative destination for reference URLs
