# pooriaarab/skills

Claude Code skills for AI-aware development and life organization.

## Skills

### Life organization (`organizer/`)

A coordinated suite for organizing across every digital surface — files, notes, mail, calendars, contacts, photos, social bookmarks, code. Run [`life-organizer`](organizer/life-organizer/SKILL.md) first to survey preferences and get a recommended sequence. See [`organizer/README.md`](organizer/README.md) for the full catalog (21 sub-skills) and [`organizer/DESIGN.md`](organizer/DESIGN.md) for architecture.

### Standalone

| Skill | Description |
|-------|-------------|
| [eco-mode](eco-mode/SKILL.md) | Cut token/CO₂ usage ~65% without quality loss. Caveman-inspired. |
| [eco-analyze](eco-analyze/SKILL.md) | `/eco-analyze` — calculate your real carbon footprint from Claude Code history |
| [multi-account-cli](multi-account-cli/SKILL.md) | One-command switching between work and personal accounts across gcloud, gws, Firebase, and Netlify. |
| [delegate-implementation](delegate-implementation/SKILL.md) | Orchestrator-implementer pattern for 10+ PR campaigns. Opus plans, Gemini Flash / Haiku / GPT-5 mini / Cursor Composer 2.5 implements. 50-80% cost savings vs all-Opus. |
| [canada-census](canada-census/SKILL.md) | Complete the Government of Canada Census of Population online via agent-browser — asks you each question in chat, fills the StatCan form, stops for review before submit. Zero PII stored. |

## Install

```bash
# Life organizer suite (parent — installs all sub-skills)
npx skills add pooriaarab/organizer

# Or individual sub-skills:
npx skills add pooriaarab/organizer/life-organizer
npx skills add pooriaarab/organizer/apple-notes
npx skills add pooriaarab/organizer/notion
npx skills add pooriaarab/organizer/gmail
# ... see organizer/README.md for the full list

# Standalone skills
npx skills add pooriaarab/eco-mode
npx skills add pooriaarab/eco-analyze
npx skills add pooriaarab/multi-account-cli
npx skills add pooriaarab/delegate-implementation
npx skills add pooriaarab/canada-census
```

## Data source
CO₂ rates from Jegham et al. arXiv:2505.09598 (2025). Claude Sonnet 4.6 = 0.85g CO₂/1K tokens.
