# Skill naming

This library has 191 top-level skills (top-level directories with a
`SKILL.md`; `docs/`, `brand/` and `organizer/` are not skills). This page sets
the naming rule and the plan for applying it.

## Folders do not work, so the prefix is the folder

Grouping was going to be directories. It cannot be. A probe with three test
skills, read by a fresh headless session, found only the flat shape:

| Layout | Result |
| --- | --- |
| `probe-flat/SKILL.md` | found |
| `nesttest/skills/probe-nested/SKILL.md` | not found |
| `deep/nested/probe-deep/SKILL.md` | not found |

The bundle shape did not work either. That is not a cosmetic problem: the
`superset` and `offrouter` bundles sat at `<bundle>/skills/<name>/SKILL.md` and
loaded nowhere, so 13 skills were dead until they were flattened.

A flat directory sorted alphabetically is all the loader shows you. The prefix
is therefore the only grouping mechanism available, and a listing sorted by name
is the only browsing interface a skill ever gets.

## The rule

- One directory per skill, at the repository root: `<prefix>-<name>/SKILL.md`.
- The `name:` field in the frontmatter must equal the directory name. They are
  matched, and a mismatch produces a skill that loads under a name nobody types.
- The prefix names the family, not the vendor. `ads-criteo`, not `criteo-ads`.
- A skill that belongs to no family keeps a bare name. Do not invent a family of
  one to make the list look tidy.

## The prefix set

Two families already follow the rule and set the precedent: `ad-` for shared ad
tooling (6 skills) and `deploy-app-` for the cloud targets (5). The rest were
named ad hoc.

| Prefix | Covers | Roughly |
| --- | --- | --- |
| `ads-` | one advertising platform each | 49 |
| `app-` | building and submitting to someone else's marketplace | 32 |
| `ship-` | the product lifecycle, idea through growth | 26 |
| `ci-` | build speed, runner cost, test economics | 6 |
| `agent-` | agent harness, context, delegation, guardrails | 15 |
| `org-` | organizing a drive, an inbox, a machine, a brain | 9 |
| `ad-` | shared ad tooling, already correct | 6 |
| `deploy-app-` | cloud deploy targets, already correct | 5 |

`ads-` picks up three platforms the suffix convention missed, because they are
named after the company rather than the product: `stackadapt`, `trade-desk` and
`yandex-direct`.

That places 148 skills in a family (the table above sums to 148). The other 43
keep a bare name. Every skill listed above was checked against the tracked
directories, so the counts are what is in the repository, not an estimate.

## Order of work

Do the ads family first. It is the largest single group and the cheapest to
move: of 102 cross-references between skills in this repository, **zero** point
at a `*-ads` skill. Nothing links to them, so nothing breaks.

Then `app-`, then `ship-`, then the small families. Each family is one pull
request, so a bad call is reverted on its own.

## What a rename has to touch

1. `git mv <old> <new>`.
2. The `name:` field in that skill's frontmatter.
3. Cross-references in other skills, of the form `../<old>/SKILL.md`.
4. Any `CLAUDE.md`, `AGENTS.md` or rule file that names the skill for an agent
   to invoke. These live outside this repository and are the ones a grep of this
   repository alone will miss.
5. The private copy in `agents-private`, which is the deployment source. A
   rename here that is not mirrored there gets undone on the next `fleet apply`.

Broken symlinks used to be a sixth step, because `fleet apply` did not prune.
It does now, so a removed or renamed skill no longer leaves a dead link in
`~/.agents/skills`, `~/.claude/skills` and `~/.codex/skills`.

## What does not get renamed

Vendored packs regenerate on install: the Cloudflare plugin skills, the
`hyperframes-*` set, `impeccable`, and the `superpowers` set. Renaming a
vendored skill creates a second copy that drifts from the installed one.
