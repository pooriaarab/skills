---
name: solo-prototype
description: Create a high-fidelity HTML/CSS prototype for a new Solo feature using the exact Solo Designer chrome, real design tokens, and real brand assets. Use when the user wants to "prototype a feature", "mock up a new Solo screen", or "build an HTML preview for a Solo feature like X" before writing real code. Outputs a static folder under `prototypes/<feature>/` that can be deployed to here.now for review.
user-invocable: true
---

# Solo Prototype Skill

Build a fast, framework-free HTML/CSS prototype of a new Solo feature that looks indistinguishable from real `soloist.ai/designer`. Use for early product exploration before any React code is written.

The recipe is proven — `prototypes/payments/` is the reference implementation. This skill codifies that recipe so future prototypes take minutes, not hours.

## When to use

- The user says "let's prototype a new Solo feature called X"
- The user asks for "an HTML mockup of [feature]"
- The user wants to share a clickable preview with non-engineering stakeholders before building
- A design exploration that doesn't justify React/Firebase plumbing yet

## When NOT to use

- The feature already exists in `apps/website/src/views/` — that's not a prototype, it's a real screen
- The user wants production code — go to the real codebase
- A throwaway one-off visual mockup — a single HTML file in your scratch dir is fine

## What the prototype set always includes

Every Solo feature prototype has the same shape:

```
prototypes/<feature>/
  index.html                      # matrix index linking every screen × state × variation
  shared/                         # SYMLINK or COPY from prototypes/payments/shared/
    tokens.css                    # design tokens (DO NOT hand-edit; port from packages/styles/src/)
    fonts.css                     # Inter
    components.css                # reusable primitives (buttons, cards, tables, badges, inputs)
    solo-designer-chrome.css      # the /designer chrome (topbar, MultiPageToolbar, properties panel)
    published-site.css            # the published-site chrome (StickyNavbar + Footer + sections)
    img/                          # real Solo SVG assets (solo-domains.svg, from-mozilla.svg, etc.)
  v1/
    creator/<screen>-<state>.html       # admin-side, inside Solo /designer chrome (Settings mode active)
    settings/<screen>-<state>.html      # settings rows, inside the Settings PropertySection panel
    enduser/<screen>-<state>.html       # customer-facing, inside published-site chrome
  v2/                             # optional — Durable-minimal content styling, same chrome
    _overrides.css                # CSS overrides that swap card shadow → 1px border, violet → ink, etc.
    creator/, settings/, enduser/ # mirror v1 file names
  v3/                             # optional — Stripe-dense content styling, same chrome
    _overrides.css                # CSS overrides for dense tables, monospace amounts, blue primary
    creator/, settings/, enduser/
```

## Step-by-step

### Step 1: Confirm scope with the user

Ask (one AskUserQuestion with 3 questions max):

1. **Feature name** (free-form). Used as the directory name (kebab-case it: `feature-x`).
2. **Sides to cover** (multi-select): creator-side admin (Solo /designer chrome) · end-user (published-site chrome) · settings rows (Settings mode PropertySection).
3. **Variations**: V1 only (Solo feel) · V1 + V2 (add Durable-minimal) · V1 + V2 + V3 (add Stripe-dense). Each adds ~30 files of work.

If the user is unsure, default to: creator + settings + enduser, V1 only.

### Step 2: Reference the existing artifacts

These ALREADY exist and should be reused — do not rebuild from scratch:

- **Design system citations:** `prototypes/payments/CHROME-PORT.md` — exhaustive findings on what every visible chrome element is and which source file/line it came from. Read this before writing any HTML so you know the real composition.
- **Standalone Designer Storybook:** `prototypes/payments/shared/_designer-shell-example.html`, `_designer-shell-theme.html`, `_designer-shell-sections.html`, `_designer-shell-add-page.html`, `_designer-shell-preview.html` — open one to see the exact chrome HTML you should copy.
- **Standalone published-site Storybook:** `prototypes/payments/shared/_published-shell-example.html` and themed variants.
- **Working reference Payments prototype:** `prototypes/payments/v1/creator/dashboard-populated.html`, `invoice-detail-paid.html`, `payouts-populated.html`, `invoice-create-editing.html` for layout/component examples; `prototypes/payments/v1/settings/connect-connected.html` for the Settings panel with a feature row.

### Step 3: Set up the directory

```bash
cd <repo-root>
mkdir -p prototypes/<feature>/{v1/{creator,settings,enduser},shared}
# Symlink shared/ to avoid copying ~50KB of CSS+SVG into every prototype
ln -sf ../../payments/shared/tokens.css            prototypes/<feature>/shared/tokens.css
ln -sf ../../payments/shared/fonts.css             prototypes/<feature>/shared/fonts.css
ln -sf ../../payments/shared/components.css        prototypes/<feature>/shared/components.css
ln -sf ../../payments/shared/solo-designer-chrome.css prototypes/<feature>/shared/solo-designer-chrome.css
ln -sf ../../payments/shared/published-site.css    prototypes/<feature>/shared/published-site.css
ln -sf ../../payments/shared/img                   prototypes/<feature>/shared/img
```

If symlinks are awkward (some hosts deref them, some don't), copy instead. For deployment to `here.now`, copies are safer.

### Step 4: Write the HTML pages

Each HTML page follows one of three templates:

**Creator/settings pages (admin, inside /designer chrome):**
- Open `prototypes/payments/v1/creator/dashboard-populated.html` as a reference
- Copy its `<head>` + the topbar + MultiPageToolbar + breadcrumb + page-header
- Replace `.dz-content` body with your feature's content
- Settings mode is ACTIVE in the topbar (since your feature lives under Settings); no new mode button
- Breadcrumb: `Settings › <YourFeatureName>`

**End-user pages (customer-facing, inside published-site chrome):**
- Open `prototypes/payments/v1/enduser/pay-unpaid.html` as a reference
- Use the `.ps-*` classes from `published-site.css` (already imported)
- Theme defaults to emerald (Theme1) — apply `.ps-page.ps-theme-<name>` for variants

**Settings PropertySection row:**
- Open `prototypes/payments/v1/settings/connect-connected.html`
- The Settings panel contains the full row stack (Business name, Business details, …, **Payments**, …, Delete)
- Insert your feature's row in the same pattern — title + 11px description + violet "Configure"/"Edit" link
- Each `connect-<state>.html` file shows the FULL panel with your row in a different state

### Step 5: Data conventions

Use realistic, consistent sample data across files:
- Business: `Lola's Flower Studio` (or pick a fresh one — match what makes sense for the feature)
- Customers: `Cypress Wedding Co.`, `Marin Garden Center`, `The Northside Cafe`
- Amounts: realistic, varied, NOT round numbers
- Dates: 2026 (current year)
- Photos: `https://loremflickr.com/<w>/<h>/<keyword>` URLs scoped per item

Pick the cast once and use it everywhere — reviewers should compare design, not content.

### Step 6: Build the matrix index

`prototypes/<feature>/index.html` — grid linking every screen × state × variation. Use `prototypes/payments/index.html` as the template. Section per area (e.g., Dashboard / Invoices / Settings / End-user) with rows for each state and columns for each variation.

### Step 7: Deploy to here.now

The `here-now` skill is already installed globally. From the prototype directory:

```bash
~/.claude/skills/here-now/scripts/publish.sh prototypes/<feature> --client claude-code
```

If `~/.herenow/credentials` exists, the publish is authenticated and the site is permanent. Otherwise it's anonymous (24h expiry) — share the claim URL so the user can keep it permanently.

Output: a public URL like `https://<slug>.here.now/`. Share with the user, link directly to a representative page (e.g., `/v1/creator/dashboard-populated.html`).

### Step 8: Iterate

Take browser screenshots of the deployed prototype next to live `soloist.ai/designer` and look for fidelity gaps. The goal: a viewer cannot tell the prototype from the real /designer. Common gaps:

- Topbar logo: must include the full Solo wordmark, not just the hex glyph
- Mode buttons: must use real inline SVG icons, not unicode characters
- Save Draft button: must be `#ffd567` cream yellow (not violet)
- Publish button: must be `#7542e5` violet (not blue or any other shade)
- Properties panel rows: title 14px/600, description 11px/`#5B5B66`, right-aligned violet link (no underline)

## Constraints

- **Pure HTML + CSS.** No JS framework, no build step. The only `<style>` blocks are `@keyframes` for spinners.
- **No Tailwind, no shadcn, no external CSS libs.** Use the existing `components.css` primitives.
- **DO NOT modify `packages/styles/src/`** to make the prototype work. Token changes must come from a real design-system decision, not a prototype.
- **DO NOT modify `shared/` chrome CSS** (`solo-designer-chrome.css`, `published-site.css`). Per-feature overrides go in `prototypes/<feature>/_overrides.css`.
- **DO NOT add new React components** to `packages/components/`. If the prototype reveals a missing component, file an issue and ship the prototype with inline CSS — the component decision is a separate spec.
- Prototypes are NOT productionized. Don't lint, don't typecheck, don't add to the Turborepo. The directory should be ignorable by all build tools.

## Anti-patterns

- **Inventing chrome elements.** The /designer has a fixed topbar — Settings/Theme/Sections/Add Page/Add Blog/Preview mode buttons + Share/Saved/Publish/Avatar. Do not add new mode buttons for your feature; put your feature under Settings.
- **Half-built CSS-in-JS.** TypeStyle is the production styling system — DO NOT use it in prototypes. CSS classes only.
- **Stale tokens.** If `tokens.css` looks out of date vs `packages/styles/src/Colors.ts`, re-port from source. Don't hand-tweak hex values to "match what you remember".
- **No matrix index.** Reviewers always want to see the full grid; never ship a prototype without `index.html`.

## Related skills

- **here-now** (globally installed) — for deploying to a live URL
- **brainstorming** (superpowers) — use first if the feature isn't well-defined yet
- The Solo `code-review` agent — useful before shipping the prototype to verify the chrome HTML matches the standalone reference at `prototypes/payments/shared/_designer-shell-example.html`
