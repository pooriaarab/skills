# SaaS brand kit — what a shipped brand needs

Build this for the **winning direction only**, after the pick. Order = foundations →
identity → assets → docs.

## 1. Foundations (usually already in the prototype)

- **Color tokens** — brand scale + neutrals + semantic (success/warning/error/info) with
  light + dark values. Every pair AA (4.5:1 text, 3:1 large/UI). Ship as CSS custom
  properties / a tokens file (and, if the app uses it, a Tailwind/Style-Dictionary export).
- **Type** — family + weights, a type scale (xs…7xl via clamp), tracking/leading rules,
  tabular-nums for data. In-app: load via the framework font loader (`next/font`), never a
  raw CDN `<link>` in production.
- **Space / radius / shadow / elevation / motion** — named scales + durations + easings.
- **Grid + breakpoints.**

## 2. Logo suite (SVG-first, one master → exports)

- **Primary lockup** — mark + wordmark.
- **Mark only** (the glyph) and **wordmark only**.
- **Orientation** — horizontal + stacked.
- **Monochrome** — solid black, solid white.
- **Inverse** — on-dark and on-brand-color variants.
- **Clearspace + minimum size** rule (e.g. min mark 24px, wordmark 96px).
- **Do/Don't** — no stretching, recoloring, effects, rotating.
- Export: master **SVG** per variant, plus PNG @1x/@2x/@3x for slides/email.

## 3. Favicon + app icons (exact set)

| Asset | Size(s) | Notes |
|---|---|---|
| SVG favicon | any | modern browsers; `icon.svg` |
| `favicon.ico` | 16, 32, 48 (multi-res) | legacy |
| PNG favicons | 16, 32, 48 | fallback |
| `apple-touch-icon.png` | 180×180 | iOS home screen, no transparency, safe padding |
| PWA `icon-192.png`, `icon-512.png` | 192, 512 | manifest `icons` |
| Maskable icon | 512 (safe zone) | `purpose:"maskable"`, ~20% padding |
| Safari pinned tab | monochrome SVG | `mask-icon` |
| `manifest.webmanifest` | — | name, short_name, theme_color, background_color, icons |

Mark must stay legible at 16px — simplify the glyph for the favicon if needed.

## 4. Social / OG

- **OG image** 1200×630 (`opengraph-image`), **X/Twitter card** (summary_large_image).
- **Avatar** (square mark on brand ground) for GitHub/X/LinkedIn.
- Per-page dynamic OG if the app has many routes (framework OG generation).

## 5. Components (from the prototype's system)

Button tiers × states, inputs/forms, cards, badges, tabs/accordion, toggle/switch, code
block, nav/header, footer, modal/toast if the app needs them. Ship as the app's real
component library, not just a static page.

## 6. Expression + docs

- **Iconography style** (stroke weight, corner radius, grid) — pick or draw a consistent set.
- **Illustration / imagery style** — CSS-SVG system vs generated raster; if raster, a prompt
  recipe + a couple hero/spot images (generate in the build phase, wire as real assets).
- **Motion principles** — what moves, how fast, easing, reduced-motion behavior.
- **Voice & tone** — 3–5 adjectives, do/don't phrasing, a tagline + 2–3 approved headlines.
- **Brand guidelines page** — a living `/brand` (or `/design`) route documenting all of the
  above, rendered from the real tokens so it never drifts.

## 7. Verify before shipping

- All AA contrast pairs pass in **both** themes.
- Favicon legible at 16px; apple-touch has no transparency.
- OG image renders correctly in a link-preview validator.
- Fonts self-hosted / framework-loaded (no render-blocking CDN, no CSP surprises).
- `prefers-reduced-motion` honored; keyboard + focus states intact.
