---
name: icloud-photos
description: "Use when the user wants to organize iCloud Photos — creating event/date-based albums, identifying duplicate or near-duplicate photos for deletion, cleaning up the Recents stream, tagging faces, and reclaiming storage. Triggers: 'clean up iCloud Photos', 'find duplicate photos'."
---

# iCloud Photos Organizer

Organize Photos.app library on macOS / iOS.

## Requirements

- macOS Photos.app with iCloud Photos enabled.
- Automation access to Photos (AppleScript prompt on first call).
- Optional: `osxphotos` (https://github.com/RhetTbull/osxphotos) for deeper SQLite-level inspection.

## Step 1 — Ask the User First

```
1. Library scope — full library, or last N years?
2. Album strategy — by year/month, by event/trip, by person (faces), or hybrid?
3. Duplicate detection — exact duplicates, perceptual near-duplicates, or both?
4. Deletion policy — auto-delete exact duplicates / move to "Review" album / dry-run only?
5. Faces — confirm face-tagging suggestions, or leave alone?
6. Memories cleanup — disable bad auto-generated Memories?
```

## Steps (TBD)

1. **Inventory** — count photos, videos, library size, identify Recents stream.
2. **Detect duplicates** — exact (hash) and perceptual (resize + perceptual hash).
3. **Plan** — propose album structure, duplicate deletion list, face-tagging confirmations.
4. **Approve** — batch by year or by album.
5. **Apply** — create albums, move photos, mark duplicates for deletion (or move to "Review").
6. **Verify** — final library size + album list.

## Surface-specific notes

- Photos.app AppleScript is **slow** for large libraries (10k+ photos). Use `osxphotos` for inventory + `mdls` for metadata.
- Faces are local-only metadata — actions don't sync via iCloud the same way albums do.
- Deletes go to "Recently Deleted" for 30 days.
- Live Photos and Burst Photos can register as duplicates incorrectly.
- High-emotion content. Always dry-run first; offer "Review" album rather than direct deletion.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../mac/SKILL.md`](../mac/SKILL.md) — Mac-side cleanup (incl. Photos library size if it's bloating disk)
