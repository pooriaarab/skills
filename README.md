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
| [agent-context-economy](agent-context-economy/SKILL.md) | Make a vertical agent cheaper AND more accurate by treating its context as an L1/L2/L3 cache: cache the static tool-definition prefix (~45% end-to-end cost cut, lossless), compress large tool results at insertion, lint write outputs, right-size tool count — each shipped off-by-default and promoted only through a gated before/after A/B. |
| [canada-census](canada-census/SKILL.md) | Complete the Government of Canada Census of Population online via agent-browser — asks you each question in chat, fills the StatCan form, stops for review before submit. Zero PII stored. |
| [spec-issue](spec-issue/SKILL.md) | Turn a thin Linear issue into an implementation-ready spec — grounds every claim in real code, right-sizes detail, writes test cases. |
| [release-notes](release-notes/SKILL.md) | Draft user-facing release notes from a branch diff — filters to user-facing changes, writes in your product's voice. |
| [bug-bash-setup](bug-bash-setup/SKILL.md) | Plan a bug bash — balanced no-overlap test-area assignments + plan/findings-log doc, from a tester roster and time budget. |
| [bug-bash-triage](bug-bash-triage/SKILL.md) | Triage raw bug-bash findings — reconcile against the test suite, build a consolidated triage doc, then (after approval) create issues. |
| [storybook-to-design-system](storybook-to-design-system/SKILL.md) | Turn co-located Storybook stories into a live in-app design-system gallery (you pick the route name) AND fan out parallel agents to reach ~100% coverage. Stories are the single source of truth; each renders in an isolated iframe so modals/loops/logs can't hijack the page. |
| [high-fidelity-ui-image-gen](high-fidelity-ui-image-gen/SKILL.md) | Render near-pixel-faithful UI mockups with an AI image model — the prompt recipe (~94-95/100 on isolated surfaces), grounding in real source, the multi-round eval loop, the honest fidelity ceiling, and when to screenshot real HTML instead. |
| [ci-build-speed](ci-build-speed/SKILL.md) | Make CI fast AND reliable for a Next.js + bun + Turborepo monorepo on GitHub Actions — profile to find the critical path (it's the build), cache everything, fix the build OOM (the `memoryBasedWorkersCount`-overrides-`cpus` gotcha + swap + free disk), build-once dedup, concurrency cancel, with the honest verdict on what moves wall-clock vs only CI minutes. |

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
npx skills add pooriaarab/high-fidelity-ui-image-gen
npx skills add pooriaarab/ci-build-speed
```

## Data source
CO₂ rates from Jegham et al. arXiv:2505.09598 (2025). Claude Sonnet 4.6 = 0.85g CO₂/1K tokens.
