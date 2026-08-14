---
name: inbox-triage
description: "Use when the user wants to process their Obsidian inbox using AI — categorize notes, suggest filenames, identify wiki-links, and route to correct folders with user approval. Triggers: 'process my inbox', 'triage my notes', 'clear my inbox', 'organize my notes'."
---

# Inbox Triage

LLM-assisted processing of `brain/inbox/` using Claude Haiku. Suggests category, filename, and [[wiki-links]] for each note. User approves, edits, or skips before anything moves.

## Run

```bash
cd ~/Documents/pooriaarab/code/personal-os

# Dry run — see suggestions without moving anything
.venv/bin/python scripts/inbox-triage.py

# Execute — move approved notes
.venv/bin/python scripts/inbox-triage.py --execute
```

## Categories

| Category | Use for |
|----------|---------|
| `ideas/` | Atomic idea notes |
| `learnings/` | Things learned from content or experience |
| `meetings/` | Meeting or conversation notes |
| `journal/` | Personal reflections |
| `content/` | Saved articles, videos, tweets |
| `people/` | Notes about a specific person |
| `projects/` | Project context notes |
| `areas/` | Ongoing area notes (health, finance, career...) |
| `goals/` | Goals and aspirations |
| `archive/` | Low-value, archive |

## Review Flow

For each note the script:
1. Calls Claude Haiku → gets category, filename, links, confidence, reason
2. Shows a rich table of all suggestions (dry run)
3. On `--execute`: prompts per note — `y` (accept), `n` (edit), `skip`
4. On accept: injects `## Connections` section with [[wiki-links]], moves file

Non-interactive (cron): auto-accepts all suggestions.

## After Triage

- Update relevant MOC files (`MOCs/MOC-Ideas.md`, etc.) to link to new notes
- Run `brain-backup.sh` to push changes to GitHub

## Dependencies

- `ANTHROPIC_API_KEY` in `~/Documents/pooriaarab/code/personal-os/.env`
- Python venv: `cd personal-os && python3 -m venv .venv && .venv/bin/pip install anthropic rich click python-dotenv`
