---
name: org-gcal
description: "Use when the user wants to organize Google Calendar — pruning unused calendars, fixing color-coding, declining stale recurring events, archiving past events, aligning with the organizer taxonomy. Triggers: 'clean up my Google Calendar', 'too many calendars', 'fix calendar color chaos'."
---

# Google Calendar Organizer

Tame a chaotic Google Calendar via the `gws` CLI or Calendar API.

## Requirements

- **`gog` CLI** — `brew install steipete/tap/gogcli` (binary is `gog`, formula is `gogcli` — [openclaw/gogcli](https://github.com/openclaw/gogcli)). Covers Gmail/Calendar/Drive/Contacts/Tasks/Keep/Sheets/Docs/Slides/Forms/AppScript/Ads/Groups/Admin in one tool. Auth via `gog auth` once per Google account.
- Alternatives: `gcalcli` (insanum/gcalcli) for calendar-only, or `gws` CLI.
- Account selector for multi-account: `gog --account=<email>` or [`multi-account-cli`](../multi-account-cli/SKILL.md).

## Step 1 — Ask the User First

```
1. Account scope — personal only / work only / both?
2. Calendars in scope — list calendars and let user pick which to touch.
3. Date range — past events: archive (read-only) or delete? Future events: prune declined / cancelled?
4. Color coding — preserve, normalize to a fixed palette, or remap by category (personal/work/health/family)?
5. Recurring event review — flag never-attended recurrences for decline?
```

## Steps (TBD)

1. **Inventory** — list calendars, count events per calendar (last 12 months + next 12 months).
2. **Classify** — events by category (meetings / personal / focus blocks / declined / cancelled).
3. **Plan** — propose calendar consolidation, color remap, decline list.
4. **Approve** — batch by calendar.
5. **Apply** — calendar deletes, color updates, event declines.
6. **Verify** — final calendar list + event counts.

## Surface-specific notes

- **Don't delete shared calendars without checking who else has access.** Affects others.
- iCloud and Google Calendar are separate surfaces — see [`../icloud-calendar/SKILL.md`](../organizer/icloud-calendar/SKILL.md) for iCloud.
- Recurring event declines: decline the whole series, not individual instances, when the goal is to stop appearing on calendar.

## See also

- [`../_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../_lib/patterns.md`](../org-life-organizer/_lib/patterns.md)
- [`../icloud-calendar/SKILL.md`](../organizer/icloud-calendar/SKILL.md)
