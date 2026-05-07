# pooriaarab/skills

Claude Code skills for AI-aware development.

## Skills

| Skill | Description |
|-------|-------------|
| [eco-mode](eco-mode/SKILL.md) | Cut token/CO₂ usage ~65% without quality loss. Caveman-inspired. |
| [eco-analyze](eco-analyze/SKILL.md) | `/eco-analyze` — calculate your real carbon footprint from Claude Code history |
| [google-drive-organizer](google-drive-organizer/SKILL.md) | Reorganize a messy Google Drive into a clean folder hierarchy using `gws` CLI + AI classification. Handles untitled docs, renames, sub-folders, and empty file cleanup. |
| [notion-organizer](notion-organizer/SKILL.md) | Reorganize a chaotic Notion workspace into a clean hierarchy via the Notion MCP. Creates section pages, moves misplaced pages, classifies untitled pages with AI, and archives empties. |
| [multi-account-cli](multi-account-cli/SKILL.md) | One-command switching between work and personal accounts across gcloud, gws, Firebase, and Netlify. Sets up named profiles and a `work`/`personal` shell switcher. |

## Install

```bash
# eco-mode
npx skills add pooriaarab/eco-mode

# eco-analyze  
npx skills add pooriaarab/eco-analyze

# google-drive-organizer
npx skills add pooriaarab/google-drive-organizer

# notion-organizer
npx skills add pooriaarab/notion-organizer

# multi-account-cli
npx skills add pooriaarab/multi-account-cli
```

## Data source
CO₂ rates from Jegham et al. arXiv:2505.09598 (2025). Claude Sonnet 4.6 = 0.85g CO₂/1K tokens.
