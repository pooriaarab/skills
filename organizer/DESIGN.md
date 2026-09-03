# Organizer Suite — Design

A coordinated set of skills for organizing a person's digital life across every surface (files, notes, mail, calendars, contacts, social bookmarks, etc.). Each surface is a self-contained skill; a master skill (`org-life-organizer`) surveys preferences and dispatches the right ones in the right order.

## Goals

1. **Portable taxonomy** — one folder/label scheme that works across local files, iCloud, Drive, Notes, Gmail, GitHub, etc.
2. **Self-contained skills** — every surface skill works on its own, no shared state required.
3. **Composability** — `org-life-organizer` can sequence sub-skills for a first-time setup or ongoing maintenance.
4. **Safety** — every skill follows dry-run → batch-approve → execute, with a journal for undo where possible.

## Directory Layout

```
organizer/
├── DESIGN.md              ← this file
├── README.md              ← catalog of sub-skills (when to use which)
├── _lib/
│   ├── taxonomy.md        ← the shared lowercase folder/label convention
│   └── patterns.md        ← common patterns (dry-run, batch-approve, AppleScript, OAuth)
├── life-organizer/        ← master skill (survey + dispatch)
│
│   # Knowledge / files
├── apple-notes/           ← iCloud Notes (AppleScript)
├── notion/                ← Notion (MCP)
├── google-drive/          ← Drive (gws CLI / Drive API)
├── mac/                   ← local Mac (Downloads, Desktop, Documents, caches)
├── browser-bookmarks/     ← Chrome / Arc / Safari bookmarks
│
│   # Communication
├── gmail/                 ← Gmail (gws CLI)
├── email-subscriptions/   ← unsubscribe pass
├── imessage/              ← iMessage cleanup
├── slack-dm/              ← Slack DMs / saved items
│
│   # People / time
├── contacts/              ← Contacts.app (dedupe, group, fill missing fields)
├── gcal/                  ← Google Calendar
├── icloud-calendar/       ← iCloud Calendar
├── apple-reminders/       ← Reminders.app
│
│   # Media
├── icloud-photos/         ← iCloud Photos (albums, faces, recents cleanup)
├── spotify-playlist/      ← Spotify playlists
│
│   # Social
├── x-bookmarks/           ← X / Twitter bookmarks
├── linkedin-bookmarks/    ← LinkedIn saved
├── instagram-saved/       ← Instagram saved
├── threads-bookmarks/     ← Threads saved
│
│   # Code
└── github/                ← GitHub repos, stars, organization membership
```

## Shared Taxonomy

See [`_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md). The default lowercase single-word categories (`personal`, `people`, `ideas`, `finances`, `health`, `legal`, `drafts`, `reference`, `archive`) work across most surfaces. Each sub-skill maps surface-native concepts (Notes folders, Gmail labels, GitHub topics) to this shared vocabulary.

## Master Skill: `org-life-organizer`

**Flavor: survey + dispatch.**

What it does:
1. Asks the user a few scoping questions: which surfaces they want organized, work/personal split, taxonomy preference (default lowercase / PARA / Karpathy-flat / custom).
2. Recommends a sequence based on surface dependencies (e.g. organize Contacts before Gmail so Gmail can label by person).
3. Outputs a checklist pointing the user at each sub-skill in order, with the chosen taxonomy as a parameter.
4. Does **not** invoke sub-skills directly — sub-skills evolve, contracts change. The user runs each one and reports back.

## Sub-skill Contract

Every organizer sub-skill should:

1. Have frontmatter with `name` and `description` matching the trigger conventions of existing skills (see `notion/SKILL.md`, `gmail/SKILL.md` for reference).
2. Include a **Step 1 — Ask the User These Questions First** section. Wrong assumptions = wrong structure.
3. Follow **Phase 1 — read-only scan/plan** then **Phase 2 — apply with approval**. No silent destructive writes.
4. Document a **journal** or **undo** path where the surface allows it (some surfaces — e.g. Notes — only support 30-day Recently Deleted recovery).
5. Map its surface-native categories to the shared taxonomy from `_lib/taxonomy.md`. Allow the user to override.

## Cross-Surface References

Sub-skills should reference each other via relative paths (`../contacts/SKILL.md`) when one logically depends on another. Examples:

- `gmail/` references `contacts/` (label-by-person works better with clean contacts)
- `apple-notes/` references `notion/` (use Notion for CRM-style structured data, Notes for prose/snippets)
- `github/` references `mac/` (local repo cleanup is in mac-organizer)

## Maintenance

When adding a new surface, follow the contract above and update both `README.md` and the dispatch sequence in `life-organizer/SKILL.md`.
