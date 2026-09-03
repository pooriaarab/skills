# Organizer Suite — Design

A coordinated set of skills for organizing a person's digital life across every surface (files, notes, mail, calendars, contacts, social bookmarks, etc.). Each surface is a self-contained skill; a master skill (`org-life-organizer`) surveys preferences and dispatches the right ones in the right order.

## Goals

1. **Portable taxonomy** — one folder/label scheme that works across local files, iCloud, Drive, Notes, Gmail, GitHub, etc.
2. **Self-contained skills** — every surface skill works on its own, no shared state required.
3. **Composability** — `org-life-organizer` can sequence sub-skills for a first-time setup or ongoing maintenance.
4. **Safety** — every skill follows dry-run → batch-approve → execute, with a journal for undo where possible.

## Directory Layout

Every sub-skill is a top-level `org-<surface>/SKILL.md` — the loader only sees
top-level `<name>/SKILL.md`, so nothing here can live nested under `organizer/`.
`organizer/` itself holds only this design doc, the catalog, and three skills
still pending a naming collision fix (tracked in #325):

```
organizer/
├── DESIGN.md              ← this file
├── README.md              ← catalog of sub-skills (when to use which)
├── google-drive/          ← Drive (gws CLI / Drive API) — pending rename, see #325
├── mac/                   ← local Mac (Downloads, Desktop, Documents, caches) — pending rename, see #325
└── notion/                ← Notion (MCP) — pending rename, see #325

org-life-organizer/        ← master skill (survey + dispatch)
└── _lib/
    ├── auth-setup.md      ← one-time CLI auth runbook
    ├── taxonomy.md        ← the shared lowercase folder/label convention
    └── patterns.md        ← common patterns (dry-run, batch-approve, AppleScript, OAuth)

# Knowledge / files
org-apple-notes/           ← iCloud Notes (AppleScript)
org-browser-bookmarks/     ← Chrome / Arc / Safari bookmarks

# Communication
org-gmail/                 ← Gmail (gws CLI)
org-email-subscriptions/   ← unsubscribe pass
org-imessage/               ← iMessage cleanup
org-slack-dm/               ← Slack DMs / saved items
org-slack-later/            ← Slack Later / saved-for-later queue

# People / time
org-contacts/               ← Contacts.app (dedupe, group, fill missing fields)
org-google-contacts/        ← Google Contacts (People API)
org-gcal/                   ← Google Calendar
org-icloud-calendar/        ← iCloud Calendar
org-apple-reminders/        ← Reminders.app
org-gtasks/                 ← Google Tasks

# Media
org-icloud-photos/          ← iCloud Photos (albums, faces, recents cleanup)
org-google-photos/          ← Google Photos
org-spotify-playlist/       ← Spotify playlists

# Social
org-x-bookmarks/            ← X / Twitter bookmarks
org-linkedin-bookmarks/     ← LinkedIn saved
org-instagram-saved/        ← Instagram saved
org-threads-bookmarks/      ← Threads saved

# Code
org-github/                 ← GitHub repos, stars, organization membership
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

1. Have frontmatter with `name` and `description` matching the trigger conventions of existing skills (see `org-gmail/SKILL.md` for reference).
2. Include a **Step 1 — Ask the User These Questions First** section. Wrong assumptions = wrong structure.
3. Follow **Phase 1 — read-only scan/plan** then **Phase 2 — apply with approval**. No silent destructive writes.
4. Document a **journal** or **undo** path where the surface allows it (some surfaces — e.g. Notes — only support 30-day Recently Deleted recovery).
5. Map its surface-native categories to the shared taxonomy from `_lib/taxonomy.md`. Allow the user to override.

## Cross-Surface References

Sub-skills should reference each other via relative paths (`../org-contacts/SKILL.md`) when one logically depends on another. Examples:

- `org-gmail/` references `org-contacts/` (label-by-person works better with clean contacts)
- `org-apple-notes/` references `notion/` (use Notion for CRM-style structured data, Notes for prose/snippets)
- `org-github/` references `mac/` (local repo cleanup is in mac-organizer)

## Maintenance

When adding a new surface, follow the contract above and update both `README.md` and the dispatch sequence in `org-life-organizer/SKILL.md`.
