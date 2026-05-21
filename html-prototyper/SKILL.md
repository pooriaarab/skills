---
name: html-prototyper
description: Generate a high-fidelity static HTML/CSS prototype for a feature in ANY codebase. Analyzes the target codebase (README, design tokens, components, brand assets), extracts the real visual language, optionally cross-checks with live screenshots, and stamps out a `prototypes/<feature>/` folder ready to ship to a static host. Use when the user says "prototype this feature", "build me a mock of X for [repo]", "what would [feature] look like in [our existing product]", or wants a framework-free preview before real implementation.
---

# HTML Prototyper

Turn ANY codebase into a high-fidelity prototype factory. Read the code, port the design system to plain CSS, stamp out static HTML pages that look indistinguishable from the real product, deploy to a live URL.

Built from the recipe that ported the Solo Designer to standalone HTML in one session (see [`Mozilla-Ocho/solo-design`](https://github.com/Mozilla-Ocho/solo-design) `html-clone/`). This skill generalizes it.

## When to use

- User says "let's prototype [feature] for [existing product / repo]"
- User has a codebase + a new feature idea + wants to see it before building
- A design exploration that needs to feel native to the existing app
- Pre-implementation alignment with non-engineering stakeholders

## When NOT to use

- Greenfield projects with no existing design language to mimic — use a generic UI kit instead
- Visual mockups that don't need to match a real product — Figma is faster
- Quick throwaway sketches — a single `<style>` block in a single HTML file is enough

## Phase 1 — Discovery

Before writing a single line of HTML, learn the codebase. Set a TaskCreate for each step.

### 1a. Locate the project root

Ask the user for the path or repo URL. If a path, `ls` it. If a URL, `gh repo clone` it. Anchor everything below to that root.

### 1b. Read the high-signal files

- `README.md` — what the product is, who it's for, what the chrome looks like at a high level. Note the deployed URL if mentioned.
- `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` — framework gives away the design system. React + TypeStyle? React + Tailwind + shadcn? Vue + Vuetify? Svelte + SvelteKit? Each implies different token extraction paths.
- `tailwind.config.js` / `theme.ts` / `tokens.json` / any explicit design-token file — gold. Use as the authoritative source.
- `CLAUDE.md` / `AGENTS.md` / `CONTRIBUTING.md` — project conventions, sometimes design-system pointers.
- `docs/design/` or `docs/styleguide/` if present — read every file.

### 1c. Locate the design system

Common patterns (try in order):

1. **Tailwind config** at repo root or `apps/*/tailwind.config.{js,ts,cjs,mjs}` → extract `theme.extend.colors`, `theme.extend.spacing`, `theme.extend.fontFamily`, `theme.extend.boxShadow`, `theme.extend.borderRadius`. These become your `tokens.css` CSS custom properties.
2. **TypeStyle / CSS-in-JS** under `packages/styles/` or `src/styles/` → look for enum-style files (`Colors.ts`, `Spacing.ts`, `BoxShadowStyles.ts`, `FontSizes.ts`, `BorderStyles.ts`). Mozilla-Ocho/solo follows this pattern. Port enums verbatim to CSS vars.
3. **CSS custom properties** declared in a global `:root {}` block (`src/styles/globals.css`, `app/global.css`, etc.) → already in the right shape. Just inline-copy with renaming.
4. **shadcn/ui** detected (look for `components.json` or `components/ui/`) → tokens are in `globals.css`'s `:root` HSL triples. Port directly.
5. **CSS modules / styled-components / Emotion / vanilla-extract** → grep for `colors`, `spacing`, repeated hex values. Aggregate into a synthesized `tokens.css`.
6. **No discoverable design system** — screenshot the live app via browser, eyeball the values from the rendered CSS via DevTools. Last resort.

### 1d. Locate the chrome / layout

Find the top-level layout components:

- React: `App.tsx`, `Layout.tsx`, `RootLayout.tsx`, anything under `views/` or `layouts/` or `pages/_app.tsx`
- Look for `Header`/`Navbar`/`Topbar`, `Sidebar`/`Nav`, `Footer`, `MainContent`/`Canvas`
- Identify exact pixel sizes (heights, widths, paddings), the brand mark/logo asset, the typography stack used for chrome (often different from body)
- For multi-mode apps (like Solo Designer), identify mode buttons and what each mode does

Cite source files + line numbers. The user will trust the prototype only if you can prove the values came from real code.

### 1e. Locate brand assets

- `public/`, `static/`, `assets/`, `apps/*/public/` for raster + vector logos
- `src/resources/img/`, `src/assets/icons/`, `src/components/icons/` for icon components (often React/JSX wrapping inline SVG)
- Extract the actual SVG markup; don't approximate with unicode glyphs or Lucide stand-ins if the real asset exists

### 1f. Capture live ground truth (optional but recommended)

If the user has a deployed instance:

- Use `agent-browser` or `chrome-devtools` MCP to navigate the live app
- Take full-page screenshots of each major mode/state
- Save under `prototypes/<feature>/_reference/` for diffing later
- If auth-gated, ask the user to log in once in the browser session before snapshotting

## Phase 2 — Port

### 2a. Write `prototypes/<feature>/shared/tokens.css`

CSS custom properties for every token you extracted. Naming convention:

```css
:root {
  /* Colors — port from <source file>:<line> */
  --color-brand-primary: #...;
  --color-brand-accent: #...;
  --color-text-default: #...;
  --color-text-muted: #...;
  --color-surface: #...;
  --color-border: #...;
  /* States */
  --color-success: #...;
  --color-warning: #...;
  --color-danger: #...;
  /* Spacing scale (port verbatim — DO NOT smooth) */
  --space-1: 4px; --space-2: 8px; /* … */
  /* Type scale */
  --font-sans: '<actual brand font>', ...;
  --fs-h1: ...px; --fs-h2: ...px; --fs-body: 16px;
  --lh-tight: 1.2; --lh-normal: 1.5;
  /* Shadows, radii, layout */
  --shadow-sm: ...; --shadow-md: ...;
  --radius-sm: ...; --radius-md: ...; --radius-lg: ...; --radius-pill: ...;
  --topbar-h: ...px; --sidebar-w: ...px;
}
```

Include a header comment naming the source file(s) so a future reader can re-port.

### 2b. Write `shared/fonts.css`

Either an `@import` to Google Fonts (or whichever CDN the real app uses) or `@font-face` rules pointing at the local files in `shared/img/fonts/`.

### 2c. Write `shared/components.css`

Reusable primitives only — buttons, cards, tables, badges, inputs, alerts, utilities. Use `var(--*)` everywhere; never hardcode hex/px when a token exists.

### 2d. Write `shared/chrome.css` (one per distinct chrome the app has)

For each chrome the real app uses (admin chrome, customer-facing chrome, marketing chrome, etc.), write a separate stylesheet with a unique class prefix (e.g., `.app-*`, `.site-*`, `.mkt-*`). Each chrome is independent — don't try to share classes across them.

Source-cite every measurement. If the real `Topbar.tsx` says `height: theme.spacing(8)` and `theme.spacing` is `4px`, your CSS gets `height: 32px` with a comment pointing at the source.

### 2e. Inline real SVG assets

Copy the actual `<svg>` markup from the brand assets into `shared/img/` or inline directly into the chrome HTML. Convert React attribute names (`fillRule` → `fill-rule`, `strokeWidth` → `stroke-width`). DO NOT use placeholder unicode glyphs (`◆`, `◇`, `⊕`, etc.) — those are admit-defeat shortcuts.

### 2f. Build a reference shell

One self-contained `shared/_chrome-example.html` per chrome. Open it in a browser. Compare to a live screenshot. Iterate until indistinguishable.

This is the GATE. Do not proceed to phase 3 until the reference shell looks right.

## Phase 3 — Feature HTML

Now build the feature pages on top of the chrome.

### 3a. Scope confirmation

AskUserQuestion (3 questions max):

1. **Feature name** (kebab-case for the directory)
2. **Which sides/areas** to render (e.g., admin/end-user/settings)
3. **Variations**: V1 only · V1 + V2 (alternative visual direction) · V1 + V2 + V3. Each adds work proportional to the screen count.

### 3b. Sample data

Pick a consistent cast. Real-feeling business name, 2-4 named customers, realistic amounts, dates in the current year, photos via `https://loremflickr.com/<w>/<h>/<keyword>` or `https://source.unsplash.com/<w>x<h>/?<keyword>`.

Use the SAME cast across every file — reviewers should compare design, not content.

### 3c. Stamp pages

For each screen × state × variation, write one HTML file. Each is self-contained:

- Standard `<head>` linking fonts/tokens/components/the appropriate chrome stylesheet
- The chrome shell (copy from `_chrome-example.html`)
- The page-specific content slotted into the chrome's main area
- Inline `<style>` only for one-off keyframes (spinners, etc.) — never for real styling

### 3d. Matrix index

`prototypes/<feature>/index.html` — clickable grid: rows = screens × states, columns = variations. Every cell links to its file. Reviewers always want this; build it.

## Phase 4 — Deploy + Iterate

### 4a. Deploy

If the user has the `here-now` skill installed:
```bash
~/.claude/skills/here-now/scripts/publish.sh prototypes/<feature> --client claude-code
```
Otherwise: any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages). The prototype is just static files.

Share the public URL. Link directly to a representative cell of the matrix, not just the root.

### 4b. Fidelity audit

Open the prototype next to the live app. List concrete diffs:

- Color values off?
- Spacing wrong by N pixels?
- Wrong font weight in a heading?
- Missing/incorrect icon?
- Right cluster of the topbar missing the user-menu chevron?

Fix the most visually-loud diffs first, then the subtle ones. Re-screenshot, re-compare.

### 4c. Hand off

The prototype is done when a non-engineering reviewer cannot tell it apart from the real app. That's the bar. Anything less is incomplete.

## Constraints

- **Pure HTML + CSS.** No JS framework. No build step. The only `<style>` is `@keyframes`. No bundler config.
- **No external CSS libraries.** Use your own `components.css`. Tailwind/Bootstrap/Bulma would defeat the point.
- **Cite sources.** Every measurement should be traceable to a file + line in the target codebase. If the user asks "why 28px radius", you should be able to answer immediately.
- **Real assets only.** Real SVGs, real fonts, real photos (or realistic placeholder photos). Stock unicode glyphs are not acceptable for production-grade fidelity.
- **No JS state.** Modals are rendered open as static markup. Each story/state is its own HTML file. No SPA, no client-side routing.
- **Don't modify the target codebase.** The prototype lives ALONGSIDE the real code (in `prototypes/<feature>/`) and is invisible to its build system.

## Anti-patterns

- **"This is just a sketch, I'll skip the design tokens."** Then it looks like a sketch. Reviewers reject it. The whole point is fidelity.
- **Hand-eyeballing values.** Once you start tweaking pixels to "look right" instead of porting from source, you've lost the trail. Re-port from source.
- **Inventing chrome elements.** If the real app's topbar has 6 mode buttons, your prototype has 6 mode buttons. Don't add a 7th for "your feature" — find another way to expose your feature (settings sub-page, contextual button, etc.).
- **CSS-in-JS in prototypes.** TypeStyle, Emotion, styled-components — all overkill. Plain `<link>` to CSS files is the discipline.
- **Big monolithic file.** Split per screen, per state, per variation. The matrix is your friend.

## Companions

- **agent-browser / chrome-devtools** — for capturing live ground truth and verifying fidelity
- **here-now** — for deploying the prototype to a public URL
- The host project's own design-system docs, if any

## Output format expected

When the skill completes, the user should have:

1. A `prototypes/<feature>/` directory with:
   - `shared/` containing ported tokens + chrome CSS + real SVG assets + reference shell HTML
   - `v1/` (and optionally v2/, v3/) containing the feature HTML pages
   - `index.html` matrix
2. A live public URL (deployed)
3. A one-paragraph audit comparing fidelity to the real app, with any open gaps called out explicitly
