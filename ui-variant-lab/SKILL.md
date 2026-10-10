---
name: ui-variant-lab
description: "Explore a landing page or brand-level redesign by building several whole visual worlds against one frozen copy contract, comparing them in a local gallery, then promoting the winner. Use when a page needs a new direction, the user cannot name a style, or several candidates must be compared side by side."
---

# ui-variant-lab

Produces N genuinely different landing-page (or brand-surface) variants from one
frozen content contract, serves them side by side, and hands the choice back to
the user. The deliverable is a decision, not code — until a direction is picked,
nothing touches production.

Use this at the *direction* stage. Once a direction is chosen and the question
narrows to "which version of this component," the problem is different: vary one
axis at a time (structure, density, emphasis, type, voice) so the result is
attributable. Jakub Krehel's `variant` skill owns that later stage.

## The contract comes first, briefs second

Before any variant exists, write one `REQUIREMENTS.md` that pins:

- Verbatim copy: nav labels, hero H1/sub, section kickers and H2s, pricing
  numbers, FAQ answers, CTA text and destinations. Variants may not paraphrase.
- Required sections and their order.
- Banned words and banned claims (no invented customers, counts, logos,
  ratings, or benchmarks).
- The floor: real interactive elements, focus-visible, `aria-expanded` on
  accordions, `prefers-reduced-motion` end states, no-JS readable, primary CTA
  above the fold, breakpoints at desktop/tablet/phone widths.
- Tokenization: all color/space/type through `:root` custom properties so
  directions stay swappable.

Then one brief per direction. A direction names a *world* — palette register,
type pairing, density, shape grammar, and 2-3 signature devices — not a recolor.
"Dark swiss" and "dark swiss but teal" is one world; "dark swiss" and "warm
paper notebook" are two. If two briefs would produce indistinguishable pages,
merge them.

Named worlds sourced from real references beat invented ones. Say which
reference a brief draws from so the choice is honest.

## Build in parallel, in isolation

- One self-contained `.html` per direction, built by separate workers
  (subagents, worker CLIs) against the contract + brief only. Builders must not
  see sibling variants — convergence kills the point.
- Variants never import production code, and production never imports them.
- Serve the directory over HTTP (`python3 -m http.server`, `bunx serve`) and
  ship an `index.html` gallery that opens each variant full-screen. Thumbnails
  distort spacing; judge at real size.

## Review with screenshots, then stop

Capture the same matrix for every variant: hero at ~1440×900, a full-page pass,
and 390px. Watch for content clipped at the right edge — `overflow-x:hidden`
hides the scroll but not the lost glyphs; the check is whether words are cut,
not whether the page scrolls.

Then present a tradeoff table and stop:

| Variant | World | Right when | Costs |
| --- | --- | --- | --- |
| Signal | Dark console, live feed | The differentiator must be visible | Reads operational, not warm |
| Notebook | Warm paper, annotations | Trust through scholarship | Quietest, least product feel |

Never mark a favorite in the table. Asked directly, answer from the product's
differentiator and audience, not which file was most fun to build.

## Promote, then delete

On a choice: port the winner into the real stack (components, tokens, routes),
keeping the contract's copy and the floor's checks. Delete the losing files and
the gallery unless the user asks to keep them — harness files that linger get
mistaken for product.

## Outside references

The project's own design system decides first. These fill the gaps it has not
decided, most often when picking direction worlds. Fetch the real content
before citing a reference — if a page cannot be read, say so and design from
the system's own tokens. Never imitate from memory. Report which reference was
used and what it changed.

Style directions:

| Reference | What it gives |
| --- | --- |
| styles.refero.design | 2,000+ named `DESIGN.md` style directions from real product sites — colors, type, spacing per world. The fastest way to name a direction. |
| VoltAgent/awesome-design-md | Open-source `DESIGN.md` collection for ~74 brands, MIT. |
| minimal.gallery | Curated minimal-site gallery; tag pages (`/tag/saas/`, `/tag/startup/`, `/tag/one-page/`) for restraint baselines. |

Components and interaction (full list in `ui-micro-interactions`):

| Reference | What it gives |
| --- | --- |
| 21st.dev | React + Tailwind component registry with an MCP; free usage limit — say what you are looking for before calling. |
| component.gallery | 60 components across ~95 design systems. Check how mature systems handle a component before inventing one. |
| microkit.co | MIT micro-interactions on the shadcn registry. |
| aicss.dev | Agent-UI component taxonomy (thinking, tool calls, streaming, approvals). Pro source — use the taxonomy, not the code. |

Motion and video:

| Reference | What it gives |
| --- | --- |
| kinetics.colorion.co | Spring-physics motion recipes; copy CSS, React or an AI prompt. |
| whatships.com | Launch-video library; tile a reference's frames to study pacing. |
| hyperframes.dev | Renders an authored HTML sequence to MP4 for demo videos. |
| impeccable.style | `polish`/`distill`/`bolder` review commands for "still feels off" work. |
| jakubkrehel/skills | `better-*` interface skill collection — `npx skills add jakubkrehel/skills`. |

## Before you finish

| Mistake | Fix |
| --- | --- |
| Variants differ only in accent or font | Merge them; write a different world |
| Builders saw each other's output | Rebuild the converged ones blind |
| Judged from thumbnails or file:// | Serve over HTTP, review at real size |
| A variant clips words at 390px | Fix the floor before it enters the gallery |
| Table marks a favorite | State each world's cost; the user picks |
| Harness survives promotion | Delete it in the promotion commit |
