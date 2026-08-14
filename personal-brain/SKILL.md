---
name: personal-brain
description: "Use when the user wants to set up a personal knowledge base, second brain, or Obsidian vault backed by GitHub. Triggers: 'set up my brain', 'personal knowledge base', 'Obsidian vault', 'second brain', 'capture notes', 'knowledge system'."
---

# Personal Brain

Sets up `~/Documents/pooriaarab/brain/` as an Obsidian vault with PARA-inspired structure, git-tracked to `pooriaarab/brain` (private), with Apple Notes as iPhone capture inbox.

## What It Creates

```
~/Documents/pooriaarab/brain/
├── inbox/          ← everything lands here (Apple Notes sync + manual)
├── journal/        ← daily notes (YYYY-MM-DD.md)
├── meetings/       ← AI necklace transcripts → processed notes
├── ideas/          ← atomic idea notes with [[wiki-links]]
├── learnings/      ← things learned from content, experiences
├── content/        ← saved articles, videos, tweets
├── people/         ← relationship notes (one file per person)
├── projects/       ← active project context notes
├── areas/          ← ongoing area notes (health, finance, career)
├── goals/          ← short/long-term goals
├── MOCs/           ← Maps of Content hub notes
├── about/          ← pooria-arab.md context file
└── templates/      ← note templates for Obsidian Templater
```

## Capture Workflow

| Source | Method |
|--------|--------|
| iPhone idea | Apple Notes → "Inbox" folder → auto-synced nightly |
| Mac idea | Obsidian quick capture → new note in `inbox/` |
| Article/link | Obsidian Web Clipper browser extension |
| Meeting/convo | AI necklace transcript → drop in `meetings/` |

## Setup Steps

1. Run the personal-os implementation plan: `docs/plans/2026-05-07-personal-os.md` (Tasks 1–2)
2. Install Obsidian → open `~/Documents/pooriaarab/brain/` as vault
3. Install community plugins: Templater, Obsidian Git, Dataview
4. Set default new note location to `inbox/`
5. Create "Inbox" folder in Apple Notes app

## Weekly Review (10 min)

Run inbox-triage to route notes, then update relevant MOCs.

## Obsidian Git Config

Settings → Community plugins → Obsidian Git:
- Auto-push: on
- Commit message: `vault backup: {{date}}`
- Auto-pull interval: 10 min
