# Shared prototype contract (copy to scratchpad `REQUIREMENTS.md`)

Every direction sub-agent reads this. It is what makes N outputs comparable and later
mergeable into one system. Replace the product block with the real product.

---

You are building ONE self-contained HTML landing-page + design-system prototype for
**<PRODUCT>**. Several designers each build a DISTINCT direction; this file is the shared
contract every direction MUST satisfy. Your per-direction brief overrides only where it says so.

Goal: **world-class, enterprise-grade but FUN, distinctly current, loud + experimental.**
Must evoke emotion. Not a generic shadcn/bootstrap look. If it looks safe, you failed.

## Product truth (do not invent features)

<one paragraph of what it does + who it's for + one canonical code sample or screenshot.
Reuse the product's own words. List the real entities to show, e.g. integrations/platforms.>

## Hard requirements (non-negotiable)

1. **Single self-contained `.html` file.** No build step, no external JS libs. ONE Google
   Fonts `<link>` (or system fonts) allowed; all CSS inline; vanilla JS only (theme toggle +
   small interactions). Opens by double-click.
2. **100% tokenized.** EVERY color/space/radius/shadow/font-size/duration/easing is a CSS
   custom property in `:root`. No raw hex/px in component rules — reference `var(--…)`. Use
   real scales (space-1..12, radius-sm..2xl, text-xs..7xl…). Comment the palette at top of `:root`.
3. **Light + dark themes.** Full dark palette, `prefers-color-scheme` respected, working manual
   toggle persisted to localStorage. Both intentional, not inverted.
4. **Button system is THE core deliverable.** `primary`, `secondary`, `tertiary`, `ghost`,
   `link`. Each with visibly distinct default / **hover** / **active-pressed** / **focus-visible**
   (real ring) / **disabled**. Sizes sm/md/lg + icon. Render a labeled **Button Lab** showing
   every variant × every state, annotated. Buttons must feel branded and alive (motion on press).
5. **Required sections, in order:** sticky header (SVG wordmark + nav + theme toggle + CTA);
   hero (fluid headline + subhead + dual CTA + signature visual); animated fan-out/relationship
   visual; entity/logo wall; a "three offerings" card row; a styled code or product sample;
   Component + Button Lab; footer.
6. **Motion**: purposeful, signature to the direction, wrapped in
   `@media (prefers-reduced-motion: no-preference)` / disabled under reduce.
7. **Accessible + a real color system (not one flat accent).** The palette is a **3-color
   system** — `--primary`, `--secondary`, `--tertiary` brand colors (plus semantic
   success/warning/error/info), not a single accent on grey. EVERY text/fill pair must pass
   **WCAG AA**: body text ≥ 4.5:1 on its background, large/UI ≥ 3:1, and the text on each brand
   fill (`--on-primary`/`--on-secondary`/`--on-tertiary`) ≥ 4.5:1 — pick the on-color (near-ink
   or near-paper) by contrast, don't eyeball it. Verify both themes. Also: semantic HTML5,
   visible focus rings, ARIA where needed, keyboard-usable toggle/tabs, `prefers-reduced-motion`.
   > Tip: the **`vibebrand`** package generates a contrast-checked 3-color token system per
   > direction (`npx vibebrand tokens <id>`) and gates it (`npx vibebrand check --all`, exits 1
   > below AA). Use it as the token floor, then design on top.
8. **Responsive**: 360px → 1440px, no horizontal body scroll, fluid type via `clamp()`.

## Craft floor
No default browser-blue links. No pure #000/#fff — tinted near-black/near-white. Consistent
optical spacing on the scale. One signature visual device, carried throughout. A real SVG
wordmark, not text in a box. Deliberate type scale + tracking, strong headline weight contrast,
tabular nums for data. Considered hover AND press on every interactive element. Ship complete —
no TODO, no lorem, no empty sections, no placeholder gray boxes.

## Output
Write the finished file to the EXACT absolute path in your per-direction brief. Return: the path,
a 3-line concept summary, and the fonts + palette tokens chosen. Nothing else.
