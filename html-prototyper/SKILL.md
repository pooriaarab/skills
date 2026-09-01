---
name: html-prototyper
description: Generate a 100%-fidelity, framework-free HTML/CSS prototype of a new feature inside an EXISTING product. Reads the target codebase to identify chrome variants, ports design tokens to CSS custom properties, extracts real SVG brand assets, stamps out feature pages on the right chrome, and deploys to a public static URL. Use when the user says "prototype this for [our existing product]", "mock this up in [our app] look", "build a static preview of [feature] before we ship the real one", or wants to evaluate UX with stakeholders before any real implementation. Distinguishes between admin/product-page chrome and canvas-editor chrome and matches existing modal patterns.
---

# HTML Prototyper

Build prototypes that look indistinguishable from the real app. The viewer should not be able to tell your HTML from a screenshot of production.

The recipe was forged building a production payments UI. This skill generalizes it across codebases.

## When to use

- User has an existing app + a new feature idea + wants to see it before building
- Pre-implementation alignment with non-engineering stakeholders (PMs, designers, brand, partners)
- Design exploration that needs to feel native to the existing app

## When NOT to use

- Greenfield projects with no design language to mimic — start in Figma instead
- Throwaway sketches — a single `<style>`-block HTML is faster
- Features that are *already implemented* in the real app — that's a screenshot, not a prototype

## Phase 1 — Discovery

Before any HTML, learn the codebase. Track with TaskCreate.

### 1a. Anchor on the repo

`ls`/`gh repo clone` the target. Anchor everything in `<root>/`.

### 1b. Identify CHROME VARIANTS

Most apps have 2–3 chrome variants. **You must pick the right one per page.** Common pattern:

| Chrome | When used | Where to find |
|---|---|---|
| **Marketing** | Public pages: /, /pricing, /docs, /about | `src/views/marketing/`, `src/views/homepage/`, top-level layouts |
| **Admin/product page** | Logged-in product pages that are NOT canvas editors: /domains, /billing, /invoices, /customers | Look for routes that show lists/forms with a simple top toolbar and content area. The clue: small toolbar + divider + content, no canvas |
| **Canvas editor** | The flagship editor: /designer, /builder, /editor — has mode buttons + right properties panel + canvas in the middle | `src/views/designer/`, mode-button toolbars, canvas/preview components |

**Critical:** A feature that's a *whole admin tool* (lists, tables, forms across multiple states) goes on the admin/product-page chrome. A feature that's a *setting of an existing site* goes as a row INSIDE the canvas editor's Settings right sidebar (with a modal for the workflow). Don't put admin tools inside the canvas editor's main area — that conflates two chrome types.

### 1c. Locate design tokens

> No brand or design system exists yet (greenfield, or a deliberate rebrand)? This skill
> ports an *existing* look — it has nothing to extract. Run **`saas-brand-system`** first to
> create the identity (directions → tokens → logo/favicon/OG), then prototype inside it.

Try in order:

1. **Tailwind config** → `theme.extend.colors/spacing/fontFamily/boxShadow/borderRadius`
2. **TypeStyle / CSS-in-JS enum files** under `packages/styles/`, `src/styles/` (`Colors.ts`, `Spacing.ts`, `BoxShadowStyles.ts`, `FontSizes.ts`, `BorderStyles.ts`)
3. **CSS custom properties** in a global `:root {}` (`globals.css`, `app/global.css`)
4. **shadcn** (`components.json` + HSL triples in `:root`)
5. **Visual reverse-engineer via DevTools** — last resort

### 1d. Locate brand assets

`public/`, `static/`, `assets/`, `src/resources/img/`. For React icon components, extract the SVG element verbatim (convert `fillRule` → `fill-rule`, `clipRule` → `clip-rule`, `strokeWidth` → `stroke-width`). **Never substitute unicode glyphs** (`◆ ▦ ⊕ →`) for missing icons — those are admit-defeat shortcuts.

### 1e. Locate modal patterns

Search for existing dialog/modal components in source. Typically there are two patterns:

- **Single-screen form modal** (e.g., `EditBusinessDetailsModal.tsx`) — title + body form + Cancel/Save footer
- **Multi-step wizard modal** (e.g., `CustomDomainSelectionModal.tsx`) — title + step indicator + body for current step + Back/Next footer

If your prototype has a workflow (Stripe connection, domain registration, etc.) match the multi-step pattern. If it's a single config form, match the single-screen pattern.

### 1f. Capture live ground truth (recommended)

If a deployed instance exists, use `agent-browser` or `chrome-devtools` MCP to navigate logged-in, take full-page screenshots of each major mode/state, save to `_reference/`. Diff against your prototype later.

## Phase 2 — Port

### 2a. `shared/tokens.css`

CSS custom properties for every extracted token. Header comment cites source file. Use ONLY these in component CSS — no hardcoded hex/px when a token exists.

### 2b. `shared/fonts.css`

`@import` to the actual font CDN the real app uses, or `@font-face` for self-hosted.

### 2c. `shared/components.css`

Reusable primitives: buttons, cards, tables, badges, inputs, alerts, utilities. **All buttons reuse the same classes** as the real app's primary actions (e.g., the topbar Publish button class) — DO NOT invent custom pill variants for page-header buttons. Same class = same visual.

### 2d. One stylesheet per chrome variant

`shared/<chromename>-chrome.css` for each chrome the app has. Independent class prefixes (e.g., `.dz-*` for designer, `.app-*` for admin, `.mkt-*` for marketing). Cite measurement sources in CSS comments.

### 2e. Inline real SVG assets

Copy the real `<svg>` markup. Place into `shared/img/` if as standalone files, or inline-paste into HTML for icons. Convert React attribute names. No unicode placeholders.

### 2f. Reference shells

One self-contained `shared/_<chromename>-example.html` per chrome. Open in browser. Compare to live screenshot. **Iterate until indistinguishable.** This is the GATE — do not proceed to feature pages until your reference shells pass an "I can't tell apart from production" test.

## Phase 3 — Feature HTML

### 3a. Confirm scope

AskUserQuestion (3 questions max):

1. **Feature name** — kebab-case directory
2. **Which sides/areas** — admin/product / customer-facing / canvas-setting / multiple
3. **Variations** — V1 only / V1+V2 / V1+V2+V3 (alternative visual directions). Default to V1 only unless the user explicitly wants design exploration.

### 3b. Pick the chrome per page

For each page of your feature, decide which chrome variant fits:

- **Admin page** (list/form/dashboard) → product-page chrome with the feature's branded wordmark ("YourApp Invoices", "YourApp Customers")
- **A setting of an existing thing** → row inside the canvas-editor's Settings right sidebar + modal for the workflow
- **An in-editor prompt** → callout overlay on the canvas-editor chrome

### 3c. Critical anti-patterns to avoid

- ❌ **No emojis** as illustrations in empty states. Either inline SVG illustrations from the codebase OR just text. Emojis don't survive print/screenshare/dark-mode well and clash with the real product's visual.
- ❌ **No breadcrumbs unless source has them.** Features that "live under" Settings appear as ROWS in the Settings sidebar — they're not separate pages.
- ❌ **No inline `style=` attributes overriding button classes.** If `.btn-primary` doesn't look right, fix the class definition — don't sprinkle inline overrides.
- ❌ **No mode-button inventions.** If the real canvas editor has 6 mode buttons, your prototype has 6 — don't add a 7th for your feature.
- ❌ **No hallucinated config rows.** Read the parent settings file (`SettingsProperties.tsx` equivalent) and only include rows that file actually renders.

### 3d. Sample data

Pick a consistent fictional cast. Reuse across every file. Real-feeling business name + 3 named customers + realistic amounts + 2026 dates + product photos via `https://loremflickr.com/<w>/<h>/<keyword>`. The cast should make the prototype FEEL like a real customer's instance.

### 3e. Click-functional mode switching (canvas editors only)

If the canvas editor has mode buttons (Settings/Theme/Sections/etc.), each mode is a **separate HTML file** (e.g., `_designer-shell-example.html` defaults to Settings, `_designer-shell-theme.html` shows Theme active). Mode buttons are `<a href="...">` anchors linking between the files. Result: clicking Settings → loads `_designer-shell-example.html` → sidebar appears. This works in pure HTML/CSS with no JS.

### 3f. Stamp pages

Each HTML file is self-contained:
- Standard `<head>` linking fonts/tokens/components/appropriate chrome CSS
- Chrome shell from `_<chrome>-example.html`
- Page-specific content slotted in
- Inline `<style>` only for one-off keyframes (spinners). Never for actual styling.

### 3g. Matrix index

`prototypes/<feature>/index.html` — clickable grid grouped by phase. Rows = screens × states, columns = variations. Every cell links to its file. Reviewers always want this.

## Phase 4 — Deploy + Iterate

### 4a. Deploy

If `here-now` skill installed:
```bash
~/.claude/skills/here-now/scripts/publish.sh prototypes/<feature> --client claude-code
```
With saved API key → permanent. Anonymous → 24h expiry, share claim URL.

Otherwise any static host (Vercel/Netlify/Cloudflare Pages/GitHub Pages). Just static files.

### 4b. Fidelity audit

Open your prototype next to the live app side-by-side. List concrete diffs:

- Wrong color hex?
- Spacing off by Npx?
- Wrong border-radius on buttons?
- Missing/wrong icon?
- Hallucinated UI element not in source?

Fix biggest diffs first. Re-screenshot. Re-compare. The bar: a non-engineering reviewer cannot tell apart from the real app. That's done.

### 4c. Hand off

Live URL + a one-paragraph fidelity self-audit calling out any known gaps. If you can't verify a particular value against source, flag it explicitly.

## Lessons learned (from the worked example)

These are the corrections that came up iterating on that UI — bake them in from the start:

- **Identify the right chrome FIRST.** Putting an admin tool inside the canvas-editor chrome with a breadcrumb feels off. Use the admin/product-page chrome instead.
- **Settings rows go in the sidebar; workflows go in modals on top.** A "Connect provider" flow is a multi-step modal layered on the canvas+sidebar — not a new page.
- **Reuse existing button classes verbatim.** Don't write `padding: 8px 18px` when the real button has `padding: 5px 16px`. Find the class, use it, don't override.
- **No emojis.** Use inline SVG illustrations from the codebase, or just text.
- **`SettingsProperties.tsx` is the source of truth for what rows exist.** Don't invent "Password Protected" rows.
- **Mode-button clicks must actually open sidebars.** Use multi-file storybook (one HTML per mode) + anchor links — no JS needed.
- **Strip site-pills, workspace-switchers, any element you "remember" but can't find in source.**

## Companions

- **agent-browser / chrome-devtools** — live ground truth capture
- **here-now** — deploy to permanent public URL
- **brainstorming** (superpowers) — for ill-defined features, before this skill

## Output format expected

When done, user has:

1. `prototypes/<feature>/` directory containing:
   - `shared/` (tokens + per-chrome CSS + components + img + reference shells)
   - feature-area dirs (one per chrome variant the feature uses)
   - `index.html` matrix
2. A live public URL
3. A one-paragraph fidelity audit with any known gaps called out explicitly
