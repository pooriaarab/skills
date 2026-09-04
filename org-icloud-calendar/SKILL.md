---
name: org-icloud-calendar
description: "Use when the user wants to organize iCloud Calendar — pruning calendars, fixing color-coding, archiving past events, removing duplicate calendars synced from old devices. Triggers: 'clean up my Apple Calendar', 'too many calendars on iPhone'."
---

# iCloud Calendar Organizer

Clean up Calendar.app / iCloud Calendar via AppleScript or EventKit.

## Requirements

- macOS Calendar.app with iCloud Calendars enabled.
- Automation access to Calendar (AppleScript prompt on first call).

## Step 1 — Ask the User First

```
1. Calendar scope — list all calendars and let user pick which to touch.
2. Account split — iCloud-only, or include subscribed calendars (Google delegate, work)?
3. Color coding — preserve, normalize to a palette, or remap by category?
4. Old events — archive past events, delete past-events-without-attendees, or leave alone?
5. Duplicate detection — same-named calendars synced from old devices?
```

## Steps (TBD)

1. **Inventory** — list calendars (account, color, count of events).
2. **Identify duplicates** — same name + similar event counts across accounts.
3. **Plan** — calendar consolidation + color remap.
4. **Approve** — batch.
5. **Apply** — delete duplicate calendars, recolor, archive.
6. **Verify** — final list.

## Surface-specific notes

- iCloud Calendar and Google Calendar are independent — handle each in its own pass.
- Subscribed calendars (e.g. shared Google calendars accessed via iCloud) can't be deleted on the iCloud side; unsubscribe at the source.
- AppleScript can list calendars and events; bulk delete is faster via the `cal` CLI or EventKit (Swift).

## See also

- [`../org-life-organizer/_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../org-life-organizer/_lib/patterns.md`](../org-life-organizer/_lib/patterns.md)
- [`../org-gcal/SKILL.md`](../org-gcal/SKILL.md)
