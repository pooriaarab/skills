---
name: solo-prototype
description: Build a 100%-fidelity HTML/CSS prototype of a new Solo feature using the exact Solo chromes, real design tokens, and real brand assets. Use when the user wants to "prototype a new Solo feature like X", "mock up [feature] in Solo before we build it", or wants to share a clickable preview with stakeholders before any React code. Stamps out `prototypes/<feature>/` in the Solo monorepo, ready to deploy to here.now. Distinguishes between /domains-style admin pages, /designer-canvas settings rows, and customer-facing pages — uses the right chrome per page.
user-invocable: true
---

# Solo Prototype Skill

Build a static prototype of a new Solo feature that's indistinguishable from real `soloist.ai/designer` / `soloist.ai/<route>` to a non-engineering reviewer.

The reference implementation is `prototypes/payments/` (with sub-areas `invoices/`, `customers/`, `settings-payments/`, `callouts/`). When in doubt, open one of those files and copy its chrome.

## When to use

- User says "let's prototype a new Solo feature called X"
- User asks for "an HTML mockup of [feature] in Solo"
- User wants to share a clickable preview before any React goes in
- A design exploration that doesn't justify Firebase/Turborepo plumbing yet

## When NOT to use

- Feature already exists in `apps/website/src/views/` — that's a real screen
- User wants production code — write real React
- Throwaway visual — single inline-styled HTML in a scratch dir is fine

## The three Solo chrome variants — PICK THE RIGHT ONE PER PAGE

This is the #1 mistake to avoid: don't put an admin tool inside the canvas editor's main area. Each chrome is for a specific kind of page.

### 1. Marketing chrome (StickyNavbar + dark Footer)

Used by: `/`, `/pricing`, `/support`, `/tools`. Customer-facing brand pages.

Source: `apps/website/src/views/homepage/components/navbar/StickyNavbar.tsx` + `apps/website/src/views/homepage/Footer.tsx`.

In your prototype: use `published-site.css` (`.ps-*` classes) or `shared/_published-shell-example.html` as the starting template.

**Use for:** customer-facing payment pages (`enduser/pay-*.html`, `enduser/checkout-*.html`, `enduser/success-receipt.html`).

### 2. Admin/product-page chrome (Solo {Product} branded, /domains-style)

Used by: `/domains` (and any future top-level product page). Logged-in admin tools — lists, forms, dashboards.

Source: `apps/website/src/pages/domains/index.tsx` + `apps/website/src/views/domains/DomainsToolbar.tsx`. Pattern: 800px max-width centered toolbar with the product wordmark left + UserMenu avatar right, then a 1px `#cfcfd8` divider with margin 0, then content.

In your prototype: use `solo-app.css` and the chrome from `invoices/v1/index-populated.html` or `customers/v1/index-populated.html`.

**Use for:** any feature that's a multi-page admin tool (invoice management, customer list, payouts, analytics dashboard, etc.). Brand the toolbar wordmark as `Solo <FeatureName>`.

### 3. Canvas-editor chrome (/designer)

Used by: `/designer`. The flagship Solo editor — Solo hex logo + mode buttons (Settings/Theme/Sections/Add Page/Add Blog/Preview) in topbar + MultiPageToolbar + gray canvas with website preview + Right Properties Panel.

Source: `apps/website/src/views/designer/components/DesignerLayout.tsx`, `toolbar/DesignerDesktopToolbar.tsx`, `toolbar/MultiPageToolbar.tsx`, `properties/DesignerPropertiesPanel.tsx`.

**No site pill / workspace switcher** next to the logo — that doesn't exist in the real toolbar. **No 7th mode button** for your feature — don't add modes to the toolbar.

In your prototype: use `solo-designer-chrome.css` (`.dz-*` classes) and the chrome from any `_designer-shell-*.html` file.

**Use for:**
- A *setting of an existing site* → add it as a ROW in the Settings right sidebar (read `SettingsProperties.tsx` for the existing rows and add yours in the right position). The actual workflow (e.g., connecting Stripe) goes in a centered MODAL on top.
- An *in-canvas callout/prompt* → render a floating tooltip/banner overlaid on the canvas.

## Decision tree: where does my feature live?

```
Is it a multi-page admin tool (lists/forms/dashboards)?
  → New top-level: /<feature>, /domains-style chrome, branded "Solo <FeatureName>"
  → Files: prototypes/<feature>/<area>/v1/...

Is it a single setting of an existing site?
  → Row in /designer Settings right sidebar + modal for workflow
  → Files: prototypes/<feature>/settings-<feature>/v1/...

Is it a contextual prompt inside /designer?
  → Floating callout overlay on /designer canvas
  → Files: prototypes/<feature>/callouts/v1/...

Is it a customer-facing page (paid by end users)?
  → Published-site chrome
  → Files: prototypes/<feature>/v1/enduser/...
```

A single feature can have multiple areas — e.g., Payments has invoices (admin) + customers (admin) + settings-payments (sidebar+modal) + callouts (in-designer prompts) + enduser (customer pay pages). That's fine; each area uses its right chrome.

## Step-by-step

### Step 1: Confirm scope

AskUserQuestion (3 questions max):

1. **Feature name** (kebab-case, used as directory)
2. **Which areas** (multi-select):
   - Admin product page (list/form/dashboard)
   - Settings sidebar row + modal (for workflows)
   - In-designer callouts
   - Customer-facing pages
3. **Variations** — V1 only / V1+V2 / V1+V2+V3. **Default V1 only.** Don't push V2/V3 unless the user explicitly wants visual exploration.

### Step 2: Reuse the existing artifacts (do NOT rebuild)

These already exist in `prototypes/payments/`:

- **`shared/tokens.css`** — design tokens ported from `packages/styles/src/*.ts`. SYMLINK or COPY into your new prototype.
- **`shared/fonts.css`** — Inter
- **`shared/components.css`** — buttons (`.dz-btn-publish`, `.dz-btn-share`), cards, tables, badges, inputs
- **`shared/solo-designer-chrome.css`** — /designer chrome (`.dz-*`)
- **`shared/solo-app.css`** — /domains-style chrome (`.solo-app-*`)
- **`shared/published-site.css`** — customer-facing chrome (`.ps-*`)
- **`shared/img/`** — real Solo SVG assets (`solo-domains.svg`, `from-mozilla.svg`, etc.)
- **`shared/_designer-shell-*.html`** — reference chrome for /designer (6 mode states)
- **`shared/_published-shell-*.html`** — reference chrome for published-site (3 themes)
- **`CHROME-PORT.md`** — exhaustive source citations for every chrome element

For HTML structure references:
- /domains-style page → `invoices/v1/index-populated.html` or `customers/v1/index-populated.html`
- /designer + Settings sidebar + modal → `settings-payments/v1/modal-step1-pick-provider.html`
- In-designer callout → `callouts/v1/services-with-price.html`
- Customer-facing → `v1/enduser/pay-unpaid.html`

Open the closest match and copy its chrome HTML wholesale.

### Step 3: Set up the directory

```bash
cd <solo-repo-root>
mkdir -p prototypes/<feature>/{shared,v1}
ln -sf ../../payments/shared/tokens.css                    prototypes/<feature>/shared/tokens.css
ln -sf ../../payments/shared/fonts.css                     prototypes/<feature>/shared/fonts.css
ln -sf ../../payments/shared/components.css                prototypes/<feature>/shared/components.css
ln -sf ../../payments/shared/solo-designer-chrome.css      prototypes/<feature>/shared/solo-designer-chrome.css
ln -sf ../../payments/shared/solo-app.css                  prototypes/<feature>/shared/solo-app.css
ln -sf ../../payments/shared/published-site.css            prototypes/<feature>/shared/published-site.css
ln -sf ../../payments/shared/img                           prototypes/<feature>/shared/img
```

If symlinks are awkward (some hosts deref differently), copy instead.

### Step 4: Write the HTML pages

For each page, pick the closest existing template, copy it, swap the content area, change the title and any data.

### Step 5: Sample data conventions

- Business: pick a fictional one that suits the feature (Lola's Flower Studio, Cactus Corner Plant Shop, etc.) — keep it consistent across files
- Customers: 3 named (Cypress Wedding Co. / Marin Garden Center / The Northside Cafe is the Payments cast — pick fresh ones if it makes sense)
- Amounts: varied, NOT round
- Dates: current year (2026)
- Photos: `https://loremflickr.com/<w>/<h>/<keyword>` — scope by relevant keyword
- NO Lorem ipsum — write realistic copy

### Step 6: Build the matrix index

`prototypes/<feature>/index.html` — grid grouped by area, columns per variation. Use `prototypes/payments/index.html` as the template.

### Step 7: Deploy

Use the `here-now` skill (already installed globally):

```bash
~/.claude/skills/here-now/scripts/publish.sh prototypes/<feature> --client claude-code
```

With saved API key (in `~/.herenow/credentials`) the publish is permanent. Without it, anonymous (24h).

Output: `https://<slug>.here.now/`. Link the user to a representative page, not just the root.

### Step 8: Fidelity audit

Open prototype next to live `soloist.ai/designer` (or whichever chrome you're matching). List concrete diffs. Fix. Re-deploy. Common gaps:

- Logo: must include the full Solo hex SVG (and wordmark where applicable from `solo-domains.svg` or `DarkLogo_Small.tsx`), not just unicode `◆`
- Mode buttons: real inline SVG icons from `apps/website/src/resources/img/*.tsx` (Settings.tsx, Theme.tsx, etc.) — NOT unicode placeholders
- Save Draft button: `#ffd567` cream yellow
- Publish button: `#7542e5` violet
- PropertySection rows: title 14px/600, description 11px/`#5B5B66`, right-aligned violet link, NO underline
- Modal: centered, max-width ~520px, 12px radius, drop shadow, padding `Spacing.xLarge` (24px)
- NO site pill / workspace switcher next to the logo
- NO emojis as illustrations in empty states (use inline SVG or just text)

## Anti-patterns (lessons from Payments)

- ❌ **Don't put admin tools inside /designer canvas with a breadcrumb.** That conflates chrome variants. Admin tools go on /domains-style chrome.
- ❌ **Don't add a 7th mode button to the topbar.** The real toolbar has exactly 6 (Settings/Theme/Sections/Add Page/Add Blog/Preview). Your feature goes elsewhere.
- ❌ **Don't invent Settings rows.** Read `SettingsProperties.tsx`. If a row's not there (e.g., "Password Protected", "Under Construction"), don't add it.
- ❌ **Don't hallucinate a workspace switcher** next to the Solo logo. Real /designer doesn't have one.
- ❌ **Don't write inline `style="..."` on `.dz-btn-publish` or `.dz-btn-share`.** Use the class as-is. If it doesn't look right, fix the class definition.
- ❌ **Don't use emojis.** Use the inline SVG icon components from `apps/website/src/resources/img/*.tsx`.
- ❌ **Don't break the multi-file mode-switching storybook pattern.** Each /designer mode is its own HTML file. Mode buttons are `<a href>` anchors. No JS.
- ❌ **Don't add a breadcrumb** unless the real source has one. Features under Settings appear as ROWS in the sidebar — they're not separate pages.

## Modal patterns

Read these two real Solo modals before building any workflow modal:

- **Multi-step wizard:** `apps/website/src/views/designer/components/properties/settings/CustomDomainSelectionModal.tsx` (+ `DomainCheckoutContent.tsx`). Pattern: centered modal, header with title + X close, step indicator dots, body with current step content, footer with Back/Next buttons.
- **Single-screen form:** `apps/website/src/views/designer/components/properties/settings/EditBusinessDetailsModal.tsx` (uses shared `ModalDialog.tsx`). Pattern: centered modal, title, body form fields, footer with Cancel/Save.

For new-flow / setup workflows → multi-step. For edit-existing-config → single-screen.

## Constraints

- **Pure HTML + CSS.** No JS framework, no build step. `<style>` only for `@keyframes` spinners.
- **No external CSS libs.** Use the existing `shared/components.css` primitives.
- **No new design tokens.** If you need a value, find it in `packages/styles/src/`, port it into `tokens.css` with a comment citing source. Don't invent hex values.
- **DO NOT modify `packages/styles/src/`** — token changes are a real design-system decision.
- **DO NOT modify `apps/website/`** — your prototype lives ALONGSIDE the real code in `prototypes/<feature>/`.
- Prototypes are NOT productionized. No lint, no typecheck, no Turborepo. Should be invisible to all build tools.

## Companions

- **here-now** (globally installed) — deploy to live URL
- **brainstorming** (superpowers) — use first if the feature isn't well-defined
- **agent-browser** / **chrome-devtools** — capture live ground-truth screenshots for fidelity comparison
- **html-prototyper** (general version of this skill in `pooriaarab/skills`) — same recipe for non-Solo codebases

## Worked example: Solo Payments

See `prototypes/payments/` for the full reference implementation:

- `invoices/` — Phase 1 admin: 11 states × 3 variations (/domains chrome, "Solo Invoices")
- `customers/` — Phase 1 admin: 3 states × 3 variations (/domains chrome, "Solo Customers")
- `settings-payments/` — Phase 3: 8 states × 3 variations (/designer + Settings sidebar + Payments row + 4-step Stripe modal)
- `callouts/` — Phase 4: 2 states × 3 variations (in-/designer prompts to set up payments)
- `v1/enduser/` — customer-facing pay pages: 9 states × 3 variations (published-site chrome)
- `shared/` — chrome CSS, real Solo SVGs, the standalone Designer Storybook (6 mode states), the Published-site Storybook (3 themes)
- `index.html` — matrix linking everything

Deployed: https://plush-geyser-fcgy.here.now/. Mozilla-Ocho/solo-design PR #1 for the reusable html-clone bits.
