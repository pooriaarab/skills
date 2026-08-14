---
name: verify-branding
description: "Audit a web project for brand/logo consistency and fix the drift. One logo component used by BOTH the header and the footer, one brand accent color shared by the in-app mark, favicon, apple-icon, OG image, and manifest — and no orphaned old colors left behind after a rebrand. Use when a site's logo or brand color looks different between the header and footer, after a palette/rebrand change, before shipping a landing page, or when standardizing branding across several repos. Catches the exact drift that hides in favicon/OG/apple-icon files nobody re-checks."
---

# verify-branding

One logo, one brand color, on every surface. Rebrands rot in the corners — the header gets
updated, the footer keeps an old ad-hoc mark, and the favicon / OG image / apple-icon stay on
the previous accent color because nobody re-opens those files. This skill finds and fixes that
drift.

## The invariant

- **One logo source.** A single component (e.g. `LogoMark` / `Logo`) is the only place the mark
  is drawn. Header and footer both import it — neither hand-rolls its own square-with-a-letter.
- **One brand accent.** The in-app mark, `favicon`/`icon.svg`, `apple-icon`, the OG/social image,
  and the web `manifest` all use the *same* accent hex (or the same token). After a palette
  change, all of them move together.
- **Every page inherits it.** Header and footer live in the root layout, so every route — landing,
  docs, tools — shows the same lockup. No per-section logo.

## 1. Find every place a logo/brand color is drawn

```sh
# The logo component + everyone who renders a mark
grep -rniE "LogoMark|<Logo|logo|wordmark" src --include=*.tsx | grep -viE "node_modules"

# Ad-hoc marks hiding in the footer (a common offender): a colored box with a single letter
grep -rnE 'bg-(foreground|primary|black)[^>]*>\s*<?[A-Za-z]<' src --include=*.tsx

# Brand-color surfaces that live OUTSIDE the CSS tokens (these are the ones that rot)
ls src/app/icon.svg src/app/apple-icon.* src/app/opengraph-image.* src/app/manifest.* 2>/dev/null
```

## 2. Check header == footer

Open the header and the footer. Both must render the **same** logo component. The classic bug:
the header uses `<LogoMark/>` (the real mark) while the footer draws its own
`<span class="bg-foreground">a</span>` box. Replace the footer's ad-hoc mark with the shared
component so they can never diverge again.

## 3. Check the color-carrying asset files

`icon.svg`, `apple-icon`, `opengraph-image`, and `manifest` are code/markup, not CSS, so a token
rename never touches them. After any palette change, grep the OLD hex across the repo — every hit
in these files is drift:

```sh
OLD="#c2f230"          # the retired accent
grep -rn "$OLD" src && echo "^ orphaned old-brand color — update to the new accent"
```

Favicons **should keep a background box** (a transparent glyph disappears on some browser tabs) —
so don't strip the box to match a borderless in-app mark; just make sure its accent color matches.

## 4. Fix

- Footer/anywhere with an ad-hoc mark → import and render the shared `LogoMark`.
- Every orphaned old hex in `icon.svg` / `apple-icon` / `opengraph-image` / `manifest` → the new
  accent. Keep boxes on favicons.
- Stale taglines next to a logo → the current positioning (they drift too).

## 5. Verify

- `grep -rn "$OLD_HEX" src` returns nothing.
- Header and footer import the same logo component.
- Build, then eyeball the tab favicon, an OG preview, and the footer in **both** light and dark.

## Standardizing across repos

Run steps 1–4 in each repo. The invariant is identical everywhere, so the audit is copy-paste;
only the component name and the accent hex change. Fan out one PR per repo.
