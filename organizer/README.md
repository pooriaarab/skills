# Organizer Skills

A suite of skills for organizing a person's digital life across every surface — files, notes, mail, calendars, contacts, social bookmarks, code, and more. Built around a shared lowercase taxonomy (see [`_lib/taxonomy.md`](_lib/taxonomy.md)) so categories stay consistent across surfaces.

**Architecture:** see [`DESIGN.md`](DESIGN.md).

## Where to start

Run [`life-organizer`](life-organizer/SKILL.md) — it surveys your preferences and recommends which sub-skills to run in what order. Don't try to organize everything at once; the master skill helps you sequence.

## Sub-skills (status)

| Status | Skill | Surface | Trigger phrase examples |
|---|---|---|---|
| 🟢 production | [`life-organizer`](life-organizer/SKILL.md) | meta — survey + dispatch | "organize my life", "where do I start" |
| 🟢 production | [`gmail`](gmail/SKILL.md) | Gmail (gws CLI / Gmail API) | "organize my gmail", "inbox zero" |
| 🟢 production | [`notion`](notion/SKILL.md) | Notion (MCP) | "organize my Notion", "clean up workspace" |
| 🟢 production | [`google-drive`](google-drive/SKILL.md) | Google Drive (gws / Drive API) | "organize my Drive" |
| 🟢 production | [`mac`](mac/SKILL.md) | local macOS (Downloads / Desktop / Documents / caches) | "free up disk", "clean my Mac" |
| 🟢 production | [`apple-notes`](apple-notes/SKILL.md) | iCloud Notes (AppleScript) | "organize my Notes", "clean up Apple Notes" |
| 🟡 stub | [`browser-bookmarks`](browser-bookmarks/SKILL.md) | Chrome / Arc / Safari | "organize my bookmarks" |
| 🟡 stub | [`email-subscriptions`](email-subscriptions/SKILL.md) | Gmail unsubscribe pass | "unsubscribe from newsletters" |
| 🟡 stub | [`imessage`](imessage/SKILL.md) | iMessage / Messages.app | "clean up iMessage" |
| 🟡 stub | [`slack-dm`](slack-dm/SKILL.md) | Slack DMs / saved items | "organize Slack DMs" |
| 🟡 stub | [`contacts`](contacts/SKILL.md) | Contacts.app | "dedupe my contacts", "fix my address book" |
| 🟡 stub | [`gcal`](gcal/SKILL.md) | Google Calendar | "clean up my calendar" |
| 🟡 stub | [`icloud-calendar`](icloud-calendar/SKILL.md) | iCloud Calendar | "organize iCloud calendars" |
| 🟡 stub | [`apple-reminders`](apple-reminders/SKILL.md) | Reminders.app | "clean up reminders" |
| 🟡 stub | [`gtasks`](gtasks/SKILL.md) | Google Tasks | "organize Google Tasks" |
| 🟡 stub | [`icloud-photos`](icloud-photos/SKILL.md) | iCloud Photos | "organize my photos" |
| 🟡 stub | [`spotify-playlist`](spotify-playlist/SKILL.md) | Spotify | "clean up my playlists" |
| 🟡 stub | [`github`](github/SKILL.md) | GitHub (repos, stars, orgs) | "organize my GitHub" |
| 🟡 stub | [`x-bookmarks`](x-bookmarks/SKILL.md) | X / Twitter bookmarks | "organize my X bookmarks" |
| 🟡 stub | [`linkedin-bookmarks`](linkedin-bookmarks/SKILL.md) | LinkedIn saved | "organize LinkedIn saved" |
| 🟡 stub | [`instagram-saved`](instagram-saved/SKILL.md) | Instagram saved | "organize Instagram saves" |
| 🟡 stub | [`threads-bookmarks`](threads-bookmarks/SKILL.md) | Threads saved | "organize Threads saves" |

**Legend:** 🟢 production = end-to-end usable · 🟡 stub = scaffold only, needs filling in

## Conventions

- **Lowercase, single-word** category names where possible (`personal`, `health`, `ideas`, etc.) — see [`_lib/taxonomy.md`](_lib/taxonomy.md).
- **Dry-run first** — every sub-skill scans and proposes a plan before writing.
- **Batch approval** — large changes are presented in chunks the user can approve incrementally.
- **Journal / undo** — where the surface allows it.

See [`_lib/patterns.md`](_lib/patterns.md) for the implementation patterns shared across sub-skills.

## Adding a new sub-skill

1. Create `organizer/<surface>/SKILL.md` with frontmatter (`name`, `description`).
2. Follow the [sub-skill contract in DESIGN.md](DESIGN.md#sub-skill-contract).
3. Update this README's table.
4. Add a dispatch entry in [`life-organizer/SKILL.md`](life-organizer/SKILL.md).
