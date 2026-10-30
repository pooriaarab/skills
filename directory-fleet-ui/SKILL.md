---
name: directory-fleet-ui
description: "Brand and UI pass for multi-site directory fleet sites: pick @directory/ui presets, preview at /design, ship logo/OG/DESIGN.md, and apply elite UI patterns without breaking the one-template rule. Maps external design-agent repos (Superdesign, Better Design, motion kits) to what the template actually supports. Use when upgrading directory landing UX, running a fleet brand pass, or asking whether to install a random shadcn kit."
---

# Directory fleet UI

One Next.js app, many directories. **You do not install ten separate UI libraries
per site.** You change `brand/`, sometimes `directory.config.ts` copy, and
occasionally the shared kit in `packages/ui` when every site should gain a new
variant.

## What the template already componentizes

| Surface | Variants (`THEME_VARIANTS`) | Where to preview |
| --- | --- | --- |
| Header | bar, masthead, floating, utility | `/design?matrix=1` |
| Hero | split, centered, editorial, band, **aurora** | same |
| Listing card | row, tile, ledger | same |
| Footer | columns, minimal, inverse | same |
| Button shape | rounded, pill, square | preset `theme.variants.button` |

Eight **legacy presets** (`broadsheet`, `civic`, …) use `definePreset(id, {
seed, variants })`. **Better Design kits** (30 themes: apple, linear, stripe,
…) use `defineBetterDesign(id, { seed, variants })` — see
[better-design](../better-design/SKILL.md). Preview at `/design?kit=better`.

Per site: `brand/theme.ts` picks one path. private-repo-38ca uses **apple** + steel
blue seed `#0e5f8e`.

**Stop rule:** if the change is niche-specific copy or color, it stays in
`brand/` or config. If it is a new layout primitive every directory needs,
add a variant in `@directory/ui/directory` and register it in
`packages/directory/src/theme.ts`.

## Map: the ten “elite UI” repos → this template

Use these for **ideas and review**, not as npm installs on every site.

| Repo | What it is | Use on directories |
| --- | --- | --- |
| [superdesign](https://github.com/superdesigndev/superdesign) / [superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | Prompt → many mockups on a canvas | Explore 3+ hero/card directions **before** coding; screenshot winners; implement as a new `THEME_VARIANTS` entry, not a one-off page in `apps/web` |
| [better-design](https://github.com/marvkr/better-design) | MCP: tokens, shadcn overrides, WCAG review | Run `get-ui-principle` + `get-review-rules` on `/design` screenshots and listing pages; translate fixes into preset tokens and `brand:check`, not a second CSS framework |
| [design-taste](https://github.com/madebymustafa/design-taste) | Taste / anti-slop prompts | Voice and hierarchy checks on hero intro + FAQ; pair with [brand-router](../brand-router/SKILL.md) for OG/social |
| [canvas-ui](https://github.com/DavidHDev/canvas-ui) | Canvas-driven decorative UI | **Avoid** on listing directories (SEO, a11y, Workers bundle). Borrow only static patterns (grids, badges) as CSS in the kit |
| [paper-shaders](https://github.com/paper-design/shaders) | WebGL/Shader backgrounds | **Do not** ship WebGL on every city page. Optional: CSS-only mesh like hero `aurora` in `globals.css` |
| [ui-layouts](https://github.com/ui-layouts/ui-layouts) | Layout recipes | New hero/footer **variants** when a pattern repeats across niches; add to variant matrix + E2E design spec |
| [Hyperiux](https://github.com/Hyperiux-Immersive/Hyperiux) | Immersive / 3D marketing | Not for reference-desk directories (MRI prices, permits). Playground/nightlife presets only if owner insists |
| [motion-primitives](https://github.com/ibelick/motion-primitives) | Motion + React snippets | Add `"use client"` wrappers only for chrome (header reveal, stagger). Listing HTML must render without JS |
| [cursify](https://github.com/ui-layouts/cursify) | Cursor effects | Skip for directories (accessibility, distraction) |
| [trickle](https://github.com/akaieuan/trickle) | Component kit | Treat like better-design: steal spacing/hierarchy ideas, implement inside `@directory/ui` |

## Fleet brand + UI pass (one site)

1. `bun run site:use <site>` in the multi-site directory monorepo.
2. Open `/design` and `/design?preset=<id>&matrix=1&scheme=dark`.
3. Pick preset + seed; set `variants` if header/hero/card/footer need a non-default combo.
4. `bun run brand:fonts` && `bun run brand:check`.
5. Ship `logo.svg`, `og.png` (1200×630), `DESIGN.md`. Run [verify-branding](../verify-branding/SKILL.md).
6. Local data: `bun run db:migrate:local` then `bun run import <csv>` (see site `data/`).
7. Listing photos: `bun run enrich` + `import:enrichment` (not brand).

Reference site for health/clinic UX: **private-repo-38ca** (`clinic` + steel blue seed).

## When to extend the shared kit

Add a variant when **three or more** sites need the same pattern. Workflow:

1. Implement in `packages/ui/src/directory/<component>.tsx`.
2. Add enum value to `THEME_VARIANTS` in `packages/directory/src/theme.ts`.
3. Show it on `/design` matrix and extend `apps/web/e2e/design.spec.ts`.
4. Document in `brand/DESIGN.md` template section and this skill.

## Sibling skills (install + use together)

| Job | Skill |
| --- | --- |
| Anti-slop typography, corporate-trust | [design-taste](../design-taste/SKILL.md) |
| MCP review, spacing/contrast rules | [better-design](../better-design/SKILL.md) |
| Clone + launch checklist | [build-a-directory](../build-a-directory/SKILL.md) |
| Voice, OG art direction, social registers | [brand-router](../brand-router/SKILL.md) |
| Drift on favicon/OG/header | [verify-branding](../verify-branding/SKILL.md) |
| `.agents/brand.md` in a repo | [design-context](../design-context/SKILL.md) |
| Marketing site scale (not listing chrome) | [marketing-site](../marketing-site/SKILL.md) |

## Code map (shipped)

See [references/toolkit-map.md](references/toolkit-map.md) for file paths. The
template also documents the same table in `docs/design-toolkit.md`.

| Repo | Shipped as |
| --- | --- |
| Superdesign | `/design?matrix=1` exploration |
| Better Design | elevation tokens, `SearchBar` glass, floating header blur |
| Design Taste | copy discipline (no hype adjectives in hero/CTA) |
| Canvas UI | `.pattern-dots` on aurora hero |
| Paper Shaders | aurora hero + `CtaBand surface="mesh"` |
| UI Layouts | bento/cards grid layouts, stat cards |
| Hyperiux | listing tile hover ring |
| Motion Primitives | `stagger-blur` / `rise-blur` CSS |
| Cursify | skip |
| Trickle | `CtaBand surface="outline"` |

## Honest status

External repos are **not** vendored as dependencies. Learnings are **variants
and CSS** in the shared kit. Full shadcn theme packs belong in Better Design’s
MCP for one-off marketing sites, not in the directory fleet.
