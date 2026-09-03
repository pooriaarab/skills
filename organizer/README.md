# Organizer Skills

A suite of skills for organizing a person's digital life across every surface — files, notes, mail, calendars, contacts, social bookmarks, code, and more. Built around a shared lowercase taxonomy (see [`_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)) so categories stay consistent across surfaces.

**Architecture:** see [`DESIGN.md`](DESIGN.md).

## Where to start

Run [`org-life-organizer`](../org-life-organizer/SKILL.md) — it surveys your preferences and recommends which sub-skills to run in what order.

## Sub-skills

| Skill | Surface | Trigger phrase examples |
|---|---|---|
| [`org-life-organizer`](../org-life-organizer/SKILL.md) | meta — survey + dispatch | "organize my life", "where do I start" |
| [`org-gmail`](../org-gmail/SKILL.md) | Gmail (gws CLI / Gmail API) | "organize my gmail", "inbox zero" |
| [`notion`](notion/SKILL.md) | Notion (MCP) | "organize my Notion", "clean up workspace" |
| [`google-drive`](google-drive/SKILL.md) | Google Drive (gws / Drive API) | "organize my Drive" |
| [`mac`](mac/SKILL.md) | local macOS (Downloads / Desktop / Documents / caches) | "free up disk", "clean my Mac" |
| [`org-apple-notes`](../org-apple-notes/SKILL.md) | iCloud Notes (AppleScript) | "organize my Notes", "clean up Apple Notes" |
| [`org-browser-bookmarks`](../org-browser-bookmarks/SKILL.md) | Chrome / Arc / Safari | "organize my bookmarks" |
| [`org-email-subscriptions`](../org-email-subscriptions/SKILL.md) | Gmail unsubscribe pass | "unsubscribe from newsletters" |
| [`org-imessage`](../org-imessage/SKILL.md) | iMessage / Messages.app | "clean up iMessage" |
| [`org-slack-dm`](../org-slack-dm/SKILL.md) | Slack DMs / saved items | "organize Slack DMs" |
| [`org-slack-later`](../org-slack-later/SKILL.md) | Slack Later / saved-for-later queue | "organize my Slack Later", "process my Slack saved messages" |
| [`org-contacts`](../org-contacts/SKILL.md) | Contacts.app | "dedupe my contacts", "fix my address book" |
| [`org-gcal`](../org-gcal/SKILL.md) | Google Calendar | "clean up my calendar" |
| [`icloud-calendar`](icloud-calendar/SKILL.md) | iCloud Calendar | "organize iCloud calendars" |
| [`apple-reminders`](apple-reminders/SKILL.md) | Reminders.app | "clean up reminders" |
| [`gtasks`](gtasks/SKILL.md) | Google Tasks | "organize Google Tasks" |
| [`icloud-photos`](icloud-photos/SKILL.md) | iCloud Photos | "organize my photos" |
| [`spotify-playlist`](spotify-playlist/SKILL.md) | Spotify | "clean up my playlists" |
| [`github`](github/SKILL.md) | GitHub (repos, stars, orgs) | "organize my GitHub" |
| [`x-bookmarks`](x-bookmarks/SKILL.md) | X / Twitter bookmarks | "organize my X bookmarks" |
| [`linkedin-bookmarks`](linkedin-bookmarks/SKILL.md) | LinkedIn saved | "organize LinkedIn saved" |
| [`instagram-saved`](instagram-saved/SKILL.md) | Instagram saved | "organize Instagram saves" |
| [`threads-bookmarks`](threads-bookmarks/SKILL.md) | Threads saved | "organize Threads saves" |


## Conventions

- **Lowercase, single-word** category names where possible (`personal`, `health`, `ideas`, etc.).
- **Dry-run first → batch approval → journal/undo**, where the surface allows.

See [`_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md) for the category vocabulary, [`_lib/patterns.md`](../org-life-organizer/_lib/patterns.md) for shared implementation patterns, and [`_lib/auth-setup.md`](../org-life-organizer/_lib/auth-setup.md) for the one-time CLI auth runbook.

## Adding a new sub-skill

1. Create `organizer/<surface>/SKILL.md` with frontmatter (`name`, `description`).
2. Follow the [sub-skill contract in DESIGN.md](DESIGN.md#sub-skill-contract).
3. Update this README's table.
4. Add a dispatch entry in [`life-organizer/SKILL.md`](../org-life-organizer/SKILL.md).
