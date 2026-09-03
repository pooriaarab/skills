---
name: org-gtasks
description: "Use when the user wants to organize Google Tasks — pruning completed items, consolidating task lists, surfacing stale recurring tasks, aligning with the organizer taxonomy. Triggers: 'organize Google Tasks', 'my Google Tasks is a mess'."
---

# Google Tasks Organizer

Clean up Google Tasks via `gog` CLI.

## Requirements

- Google account with Google Tasks data.
- **`gog` CLI** — `brew install steipete/tap/gogcli` (binary `gog` — [openclaw/gogcli](https://github.com/openclaw/gogcli)). Auth via `gog auth`.
- Or Google Tasks API directly: scopes `tasks.readonly` and `tasks` (mutate).

## Step 1 — Ask the User First

```
1. Account scope — personal / work / both?
2. Task lists — list all and pick which to touch.
3. Completed task policy — delete after N days, archive into a single "completed" list, or leave?
4. Stale recurring tasks — flag never-completed for review?
5. List taxonomy — match the shared lowercase categories or use custom?
6. Cross-surface — coordinate with `apple-reminders/` if you sync between systems?
```

## Steps (TBD)

1. **Inventory** — `gog tasks lists`, `gog tasks list <list-id>` for each.
2. **Classify** — bucket lists into shared taxonomy.
3. **Plan** — proposed list consolidation + completed-task cleanup.
4. **Approve** — batch by list.
5. **Apply** — `gog tasks delete`, list creates/renames.
6. **Verify** — final list + active task counts.

## Surface-specific notes

- Google Tasks doesn't support nested sub-lists; flat structure only. Map taxonomy categories to top-level lists.
- Recurring tasks repeat at the source — don't try to delete recurring instances individually; manage at the source rule.
- Tasks integrate with Gmail (star → task) and Calendar — actions here may affect those surfaces.
- Cross-surface: many users have **both** Apple Reminders and Google Tasks. Pick a primary, mirror selectively.

## See also

- [`../_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../_lib/patterns.md`](../org-life-organizer/_lib/patterns.md)
- [`../org-apple-reminders/SKILL.md`](../org-apple-reminders/SKILL.md) — Apple counterpart; coordinate
- [`../org-gmail/SKILL.md`](../org-gmail/SKILL.md) — also uses `gog`; shares auth
- [`../org-gcal/SKILL.md`](../org-gcal/SKILL.md) — also uses `gog`; shares auth
