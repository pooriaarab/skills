---
name: apple-reminders
description: "Use when the user wants to organize Apple Reminders — pruning completed lists, archiving stale recurring tasks, consolidating duplicate lists, and aligning categories with the shared organizer taxonomy. Triggers: 'clean up Reminders', 'organize Apple Reminders', 'my reminders are a mess'."
---

# Apple Reminders Organizer

Clean up Reminders.app via AppleScript / EventKit.

## Status

🟡 **Stub** — scaffold only.

## Requirements

- macOS Reminders.app with iCloud sync enabled.
- Automation access to Reminders (AppleScript prompt on first call).

## Step 1 — Ask the User First

```
1. Lists in scope — list all and pick which to touch.
2. Completed reminders — delete after N days, archive, or leave alone?
3. Stale recurring tasks — flag never-completed recurring reminders for review?
4. List taxonomy — match the lowercase categories (personal/health/finances/...) or use custom?
5. Duplicate lists — consolidate same-named lists synced from old devices?
```

## Steps (TBD)

1. **Inventory** — list all reminder lists, count active vs completed in each.
2. **Classify** — bucket lists into shared taxonomy.
3. **Plan** — proposed list consolidation + completed-reminder cleanup.
4. **Approve** — batch by list.
5. **Apply** — delete completed, consolidate lists, rename for clarity.
6. **Verify** — final list count + active reminder count.

## Surface-specific notes

- Apple Reminders nested-list support is iOS 16+ / macOS 13+ — earlier versions are flat.
- A "list" maps cleanly to a taxonomy category; recurring tasks should live in a generic "recurring" or category-specific list, not in their own list.
- Tags (introduced in iOS 15) cross-cut lists — useful for project context.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
