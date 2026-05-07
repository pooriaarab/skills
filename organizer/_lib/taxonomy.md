# Shared Taxonomy

The default folder/label scheme used across organizer sub-skills. **Lowercase, single-word, project-aware where applicable.**

## Default categories

| Category | What goes here |
|---|---|
| `personal` | Inner-life content — memoir, life-decision moments, friend-group lists, relationship reflections (not about a specific named person). |
| `people` | One entry per individual you actively keep notes/messages on. Add a person the first time you have something to write — never pre-create empties. |
| `ideas` | Things you might build, write, or launch. Startup ideas, project plans, brainstorms. The "future you might do this" pile. |
| `finances` | Money operations — bank docs, expense lists, account info. Not investments-as-research (that's `reference`). |
| `health` | Body and self-care — symptom logs, exercise routines, medical notes. |
| `legal` | Legal/immigration/contracts — lawyer questions, immigration notes, contract observations. |
| `drafts` | Half-written messages you haven't sent yet (emails, DMs, intro bios). Migrate to `archive` if not sent in 6 months. |
| `reference` | Things you look up, not things you do — URLs, credentials, watchlists, training links, algorithms, quotes. Static info. |
| `archive` | Done, stale, or sentimentally frozen. Out of sight, not deleted. |

## Boundaries that matter most

- **personal vs people**: personal is *about your life*; people is *about specific humans*.
- **ideas vs reference**: ideas is *things you'd act on*; reference is *things you'd consult*.
- **drafts vs archive**: drafts is *still maybe sending*; archive is *abandoned forever*.
- **archive vs delete**: archive keeps it searchable. Delete only when content is junk (empty, gibberish), not when merely stale.

## When you can't decide

Default to `reference` — it's the most forgiving pile.

## Surface-specific mappings

Each sub-skill maps these categories to its surface's native concept (Notes folder, Gmail label, Drive folder, GitHub topic, etc.). Sub-skills should:

1. Use the lowercase categories as default.
2. Allow the user to override (e.g. capitalize for visual prominence in Gmail labels).
3. Document the mapping in the sub-skill's `SKILL.md`.

Example mappings:

| Default | Notes folder | Gmail label | Drive folder | GitHub |
|---|---|---|---|---|
| `personal` | `personal/` | `personal` | `personal/` | (n/a — code-only) |
| `people` | `people/` | `people/<name>` | `people/<name>/` | (n/a) |
| `ideas` | `ideas/` | `ideas` | `ideas/` | repo with `ideas` topic |
| `finances` | `finances/` | `finances` | `finances/` | (n/a) |
| `health` | `health/` | `health` | `health/` | (n/a) |
| `legal` | `legal/` | `legal` | `legal/` | (n/a) |
| `drafts` | `drafts/` | (Gmail's own Drafts) | (n/a — use Docs) | (n/a) |
| `reference` | `reference/` | `reference` | `reference/` | repo with `reference` topic, stars |
| `archive` | `archive/` | `archive` | `archive/` | archived repos |

## Customizing the taxonomy

Users can swap the default for:

- **PARA** (Tiago Forte): Projects / Areas / Resources / Archive
- **Karpathy-flat**: minimal hierarchy, tag-heavy
- **GTD**: Inbox / Next / Waiting / Someday / Reference / Archive
- **Custom**: any flat list of lowercase categories

The `life-organizer` skill asks the user to pick during its survey phase, then passes the chosen vocabulary to each sub-skill.

## Adding a category

If a default category doesn't fit (e.g. you need `travel` or `recipes`), add it as a top-level entry with the same lowercase convention. Prefer flat additions over nested folders — flat scales better for daily lookup on mobile.
