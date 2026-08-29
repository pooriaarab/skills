---
name: blueprint
description: "Use when you are showing how something is put together: architecture posts, product teardowns, system diagrams, a roadmap that must look thought through rather than dreamt up. Applies the blueprint direction to every surface, not only the website. Triggers: 'blueprint direction', 'drafting sheet', 'dimension lines', 'architecture post', 'product teardown', 'technical drawing look', 'annotate the design'."
---

# blueprint

> the drawing before the building, with every distance called out.

**Signature.** Nothing floats. Every element ties to something else by a dimension line with real arrowheads, or by a callout leader with a 45-degree elbow. The number in the gap is the element's actual measurement — 1440, 72px, 8pt. The page annotates itself the way a drafting sheet does.

**Mono is load-bearing, not decorative.** Roboto Mono sets the dimension callouts and coordinates only. `1440` and `1441` must occupy identical width or the drawing lies. Prose is never monospace here — that is what separates blueprint from [terminal](../terminal/SKILL.md). Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

**Use when** you are showing how something is put together: architecture posts, product teardowns, a roadmap that has to look thought through rather than dreamt up.

**Avoid when** the thing is finished and shipping. **A blueprint promises the building does not exist yet, so it undercuts a launch.** Never run a launch announcement, a "we're live" carousel, or a shipped-product video in blueprint. Ship in [terminal](../terminal/SKILL.md) or [punchcard](../punchcard/SKILL.md) and keep blueprint for the drawing you made first.

---

## Tokens

**Native mode: dark** — the cyanotype blueprint, white and cyan linework on a dark ground. The light mode is not an inversion. It is the other real artefact from the same process: the **diazo whiteprint**, cyan linework on vellum. Polarity flips because the print process flips, and the cyan darkens to `#0a6a87` because a light line on paper must carry the weight the dark ground used to.

| Role | Dark | on bg | Light | on bg |
| --- | --- | --- | --- | --- |
| bg | `#071a2e` | — | `#f3f7fa` | — |
| surface | `#10283f` | fg 12.28:1 | `#e7eff6` | — |
| fg | `#dceaf7` | 14.34:1 | `#0a1f33` | 15.51:1 |
| muted | `#8db4d6` | 8.05:1 | `#47637d` | 5.82:1 |
| border | `#1c3d5e` | hairline | `#c2d5e5` | hairline |
| accent | `#4fd4ee` | 10.02:1 | `#0a6a87` | 5.69:1 |
| accentFg | `#04131f` | 10.72:1 on accent | `#f3f7fa` | 5.69:1 on accent |
| alt | `#ffffff` | 17.55:1 | `#0a1f33` | 15.51:1 |

**Type.** Display `"Barlow Condensed", "Arial Narrow", sans-serif` 600 / +0.02em / **uppercase** / 1.05. Body `"Barlow", system-ui, sans-serif` 400 / +0.005em / none / 1.6. Mono `"Roboto Mono", ui-monospace, monospace` 500 / +0.01em / 1.4, **for callouts and coordinates only**. Load `Barlow Condensed:wght@500;600;700`, `Barlow:wght@400;500`, `Roboto Mono:wght@400;500`. Scale ratio 1.25.

**Surface.** Radius **0** — a drafting sheet has no rounded corner anywhere. Shadow `0 3px 0 -1px #1c3d5e, 0 14px 30px -16px rgba(4,19,31,0.75)`. Hairline `1px solid #1c3d5e`.

**Texture** (grid, `::before` overlay, 96px major and 12px minor):
`background-image: repeating-linear-gradient(0deg, rgba(79,212,238,0.16) 0px, rgba(79,212,238,0.16) 1px, transparent 1px, transparent 96px), repeating-linear-gradient(90deg, rgba(79,212,238,0.16) 0px, rgba(79,212,238,0.16) 1px, transparent 1px, transparent 96px), repeating-linear-gradient(0deg, rgba(79,212,238,0.07) 0px, rgba(79,212,238,0.07) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, rgba(79,212,238,0.07) 0px, rgba(79,212,238,0.07) 1px, transparent 1px, transparent 12px); pointer-events: none;`

**Motion — the one authored moment.** Ease `cubic-bezier(0.33, 0, 0.15, 1)`, duration **880ms**. The dimension line under the headline draws itself in one pass, in drafting order: the left arrowhead snaps in at full opacity, the 1px rule extends rightward at constant speed across the headline's exact width, breaking around a gap at its midpoint, and the right arrowhead snaps in on arrival. **The measurement never animates.** It is painted at full opacity in that gap from the first frame and the rule draws around it, the way a draughtsman writes the number and then draws the line out to it. That is not a compromise: the measurement is the only *content* in the sequence, the floor forbids content that starts invisible, and a rule with a number already in it still reads as a dimension line in a screenshot, a print, a crawl, or to a reader who lands mid-page. Only the rule and the two arrowheads move, and they move by `transform` alone. Once per page load. **Nothing else on the page moves, ever.** Under `prefers-reduced-motion: reduce`, render the finished dimension line and skip the draw.

---

## 1. Voice and writing

**Tone.** An engineer walking you around a drawing, pointing at each part and giving you its number before its name.

**Casing.** SENTENCE CASE SET IN UPPERCASE for headings and labels. Sentence case for body. A heading never uses title case, and body never goes uppercase.

**Sentence rhythm.** Medium and even, 14 to 22 words. Fragments are allowed only as labels (`NOT TO SCALE`, `REV 3`). Body prose is complete sentences, because a drawing's notes are complete sentences.

**Do say:** `REV 3 — the second attempt is on the sheet too` · `tolerance: ±2 days` · `section A-A: here is what it looks like cut open` · `not to scale`

**Don't say:** `roughly` · `a bunch of` · `pretty fast` · `somewhere around` · `gorgeous` · `revolutionary`

**The tell.** Quantities arrive before names, and every estimate carries a tolerance. "±2 days" is the habit. A paragraph with an approximation and no bound is not this direction.

## 2. Landing page

`#071a2e` with the 96/12px grid visible at the stated alphas. Every block snaps to the 96px major grid. Nothing sits off it.

- **Measure: 68 characters** — 640px at 17px Barlow body. Single column, left-aligned at the third major gridline (288px from the left) on desktop, second (192px) below 1024px.
- **Hero.** Headline in Barlow Condensed 600 uppercase, **88px**, max two lines. Under it, exactly one dimension line spanning the headline's real rendered width, arrowheads at both ends, with that width in px as the number in the gap: `— 1104px —` in Roboto Mono 500, 22px, `#4fd4ee`.
- **Sections divide by a title block**, not a rule: a 3-line stack in the left margin — `SECTION 02 / SCOPE / REV 1` — Roboto Mono 500, 16px, `#8db4d6`.
- **Whitespace is grid, not padding.** Vertical gaps are 96px or 192px. Nothing between.
- **Corner ticks** on every panel: four 24px `#4fd4ee` L-marks inset 32px.
- **The carrying element is the dimension line.** One per screenful, maximum. It must measure a real quantity from the content — a width, a duration, a count. **A decorative dimension line is the single worst thing you can do in this direction.**

## 3. X / Twitter avatar

Renders at **48px**, and blueprint needs an explicit export variant, because its detail does not survive.

**Full artwork (400px+):** photo, high-contrast, duotone-mapped to `#071a2e` shadows and `#4fd4ee` highlights, cropped from the collarbone up and centred. A 3px `#4fd4ee` square frame sits inset 6% from every edge, with a 14px gap punched in the bottom rule where `PA` sits in Roboto Mono 500.

**48px variant — three changes, not optional:**

1. **Grid off.** A 96px grid at 48px is one line, and it reads as a scratch.
2. **Frame scales, with a floor.** The frame is 4% of the square's width, minimum **2px**. A 3px frame scaled to 48px is 0.36px and vanishes.
3. **The `PA` gap closes.** Two letters at 48px are 3px tall. Delete them and close the rule.

Re-map the duotone at higher contrast for the small export: push the highlight to `#ffffff` so the face reads as a shape and not as a smudge.

## 4. X header and YouTube banner

YouTube is 2560×1440. Only the centred **1546×423 safe area** shows on a phone.

**Inside the safe area:** one horizontal dimension line spanning the full 1546px, arrowheads at both ends, with the current project name in the gap at its midpoint — uppercase, Roboto Mono 500, **34px**, `#4fd4ee`. Directly below it, at y=820, a three-line title block: `POORIA ARAB / REV 04 / AUG 2026`, Barlow Condensed 500, **18px**, `#8db4d6`, left-aligned at x=587.

**No photo. No logo.** Outside the safe area the 96px grid runs to the full 2560×1440 and carries the corner ticks. Those ticks are the decoration, and they are only ever seen on desktop.

For the 1500×500 X header, the dimension line spans x=120 to x=1380 at y=250.

## 5. Open Graph card

1200×630 on `#071a2e`, grid on. It renders in feed at roughly 400×210.

- Headline uppercase Barlow Condensed 600, **72px**, `#dceaf7`, **two lines max**, left-aligned at x=80, top at y=140.
- Below it, a full-width dimension line from **x=80 to x=1120**, with `POORIAARAB.COM` centred in its gap, `#4fd4ee` Roboto Mono, **26px**.
- **Corner ticks:** four 24px `#4fd4ee` L-marks inset 32px, one per corner.

**Drop at feed size:** the 12px minor grid — it becomes noise under JPEG. Keep the 96px major grid at 0.16 alpha, the dimension line, and the ticks. 72px lands at ~24px in feed. 26px lands at ~9px and is legible only as a cyan bar; that is acceptable, because the domain is a signature, not a message.

## 6. LinkedIn banner

1584×396. Treat a **400px wide by 140px tall** block at the bottom left as covered by the profile photo.

The dimension line spans **x=440 to x=1520** at **y=170**, with the current role or project in the gap: uppercase Roboto Mono 500, 30px, `#0a6a87` on the light port or `#4fd4ee` on the dark. The title block moves to the **bottom right** at x=1200, y=300 — three lines, 16px, `#8db4d6` — because the usual bottom-left home is under the photo.

Corner ticks only on the top two corners. The bottom two fall in the crop on some clients.

## 7. LinkedIn post image

1200×627. **Blueprint is the easiest of the technical directions to run in a room full of suits**, because a drawing reads as diligence rather than as a subculture. Dial down, but only a little.

1. **Use the light port** (`#f3f7fa` ground, `#0a6a87` linework). The dark cyanotype reads as a gaming graphic in the LinkedIn feed; the whiteprint reads as an engineering document.
2. **Minor grid off, major grid to 0.10 alpha.** LinkedIn's JPEG pass turns 1px lines at 12px pitch into moiré.
3. **One dimension line, one number.** Not three.

Headline uppercase Barlow Condensed 600 at 58px, max 9 words. Body, if any, Barlow 400 at 26px, two lines. Read width in feed is 552px, so 58px lands at ~27px.

## 8. Instagram carousel

1080×1350 throughout. **The carousel is a drawing set: one sheet per slide, and the slides are numbered as sheets.** That is what separates it from a [terminal](../terminal/SKILL.md) session or a [spec](../spec/SKILL.md) table.

**Cover slide.** `#071a2e`, 96px grid on, corner ticks inset 40px. Headline uppercase Barlow Condensed 600 at **116px**, max 5 words, left at 80px, sitting on the third major gridline from the top. One dimension line directly under it spans the headline's exact rendered width, with that width in px as the number: `— 872px —` in Roboto Mono 500 at 26px, `#4fd4ee`. Bottom-left title block: `SHT 1 OF 7`.

**Interior slide.** Same ground, same grid, same ticks. The subject sits in the upper two-thirds. **One callout leader** with a 45-degree elbow points at the thing being explained, ending in a label of **max 4 words** in Roboto Mono 500 at 24px, `#4fd4ee`. Body under it: Barlow 400 at 34px, `#dceaf7`, **max 5 lines of 44 characters**. The sheet number increments in the title block. The slide belongs to the cover because the grid, ticks and title block are pixel-identical across all seven.

**End card.** The title block grows to fill the sheet: `POORIA ARAB / POORIAARAB.COM / REV 04 / SHT 7 OF 7`, uppercase Barlow Condensed 600 at 44px, with a dimension line above it spanning the block's width. The ask is one line of Barlow 400 at 30px in `#8db4d6`. Blueprint does not shout the ask; it files it.

**Swipe cue.** A dimension line runs off the right edge. It starts at x=940, its left arrowhead is drawn, and the rule is clipped by the frame at x=1080 with **no right arrowhead** — an unterminated measurement, which any reader of a drawing understands as "continues on the next sheet".

**On launches:** do not build a launch carousel in blueprint. Seven sheets of drawing say the thing is not built yet, whatever the copy says.

## 9. YouTube thumbnail

1280×720, designed for the **~210px** version.

Deep `#071a2e` with the 96px grid visible. Title in Barlow Condensed 600 uppercase, **108px**, top-left at a 72px margin, **max 5 words and 20 characters** — at 108px, uppercase Barlow Condensed averages ~56px per character, and 1280 minus two 72px margins is 1136px. Over 20 characters, cut words; never shrink the type.

A single `#4fd4ee` dimension line runs under the title, arrowheads at both ends, with the video length in the gap: `11:42`, Roboto Mono 500, 36px. The face sits bottom-right as a cutout with **one callout leader** (45-degree elbow) pointing at it, labelled `SUBJECT` in Roboto Mono 24px.

Recognisably his without being identical: the dimension line under the title and the `SUBJECT` callout are fixed; the title and the leader's target change every time.

## 10. YouTube edit style

**Honest constraint: blueprint has one motion, a line that draws itself, and no second gear.** It cannot carry a fast montage. What it can do better than any other direction in this suite is **annotate**, which makes it the right edit for a teardown and the wrong edit for a vlog.

**Cut rhythm.** Slow and even. 6–10 seconds per shot for explanation. **A cut lands only when a callout has finished reading** — the annotation is the pacing device, not the sentence. Never cut inside an 880ms line draw.

**Titles and lower thirds.** The lower third is a title block: three lines of Barlow Condensed 500 uppercase at 28px in `#8db4d6`, on `#10283f` with a 1px `#1c3d5e` rule, bottom-left at x=120 / y=880 on a 1920×1080 frame. It **draws in as a rule extending rightward over 880ms** with the same easing, then holds. It cuts out in one frame.

**B-roll and callouts.** This is the strength. Freeze a frame, then draw one `#4fd4ee` dimension line across the thing being measured with its real number in the gap. Grade b-roll cool: lift shadows to `#071a2e`, desaturate to 25%, tint midtones cyan at 10%. **100% speed, no ramps.** Grid overlay at 0.08 alpha, 96px only — the 12px minor grid does not survive H.264 at any bitrate you will use.

**Transitions.** One only: a **line wipe** — a 1px `#4fd4ee` vertical rule crosses the frame left to right over 12 frames, and the shot behind it has changed. Every other transition is banned.

**Cold open (first 3 seconds).** Frames 1–24: the finished thing, held still, no title. Frame 25: freeze, and one dimension line draws across it in 880ms with the number that the whole video is about. Frame 46 onward: cut to you talking. The measurement is the hook.

**What this edit cannot do:** urgency, humour, or a personal story. Blueprint is patient by construction.

## 11. Podcast cover

3000×3000, shown at **150px**. Simplify to three elements.

- **Minor grid off. Major grid at 96px scales to 400px on this canvas** — otherwise it renders as 30 hairlines and disappears. Keep it at 0.16 alpha.
- Show title in Barlow Condensed 600 uppercase, **two lines maximum, 3 words per line**, at **380px**, `#dceaf7`, left at 300px, block optically centred.
- **One dimension line** under it spanning the title block's exact width, arrowheads at both ends, 8px stroke, with no number in the gap — at 150px a number is 2px and reads as a break in the line. Close the gap.
- Corner ticks at 120px, inset 160px, 8px stroke.

No photo on the podcast cover. The duotone face survives 400px and does not survive 150px.

## 12. Deck and talks

16:9, read from the back of a room. **Every slide is a drafting sheet.**

- **Title slide.** Headline uppercase Barlow Condensed 600 at **140px** on a 1920×1080 artboard, left at 160px, with one dimension line under it measuring its width. Title block bottom-left: `POORIA ARAB / REV 1 / SHT 1 OF 24`.
- **Section divider.** The section name at 180px uppercase, alone, with corner ticks and the sheet number. No dimension line — the divider measures nothing.
- **Data slide.** The chart or diagram occupies the right 60%. Body copy sits in **a single left column, never more than 40% of the slide width**. Exactly one dimension line per slide, and it measures a real quantity from the content — never decoration.
- **Slides with a lot of words:** the left column caps at **50 words**, Barlow 400 at 34px, and the right 60% must then hold the drawing that the words describe. A slide with words and no drawing is not a blueprint slide; make it two slides or change direction.

Every slide carries the 96px grid, the corner ticks, and the title block with `SHT n OF N`. Minimum type size: 28px on a 1920px artboard.

## Cost to run

**Moderate.** Higher than [terminal](../terminal/SKILL.md), lower than a photographic direction.

The grid, ticks and title block are template furniture: build them once and every asset inherits them for free. The cost is the **dimension line**, because the rule says the number must be real. Every asset needs one true measurement, which means measuring something before you publish — the rendered width of a headline, the length of a video, the duration of a sprint. That is 5–10 minutes per asset, and it is the tax that keeps the direction honest.

The avatar is the one genuinely expensive asset: a duotone photograph needs a decent source portrait and a hand-tuned map. Do it once and never again.

## Pairs with / clashes with

**Pairs with [spec](../spec/SKILL.md).** Blueprint draws the system, spec tabulates its parameters. Different fonts, different grounds, different jobs, no overlap — a strong two-direction kit for a technical product.

**Pairs with [annual](../annual/SKILL.md)** for a report where the diagram and the figures share a page, and with [swiss](../swiss/SKILL.md) when you need a neutral companion for long reading.

**Clashes with [punchcard](../punchcard/SKILL.md)** on meaning, not on looks. Punchcard says the record already exists; blueprint says the building does not exist yet. Put them in the same kit and the brand contradicts itself about time.

**Clashes with [oscilloscope](../oscilloscope/SKILL.md).** Two instrument worlds with a printed measurement lattice over a dark ground. Cyan against amber is only a hue apart, and readers will see one direction that changed colour.

**Distinguish it from the mono directions.** Blueprint is *not* one of them. Its prose is Barlow, a proportional sans; monospace appears only inside dimension callouts and title blocks. If a paragraph on a blueprint asset is monospace, the asset is wrong.

## The failure mode

**Decoration that measures nothing.** The dimension line is the direction's one claim: this number is real, and I measured it. The moment a line spans a gap for balance, with a number invented to fill it, the whole page becomes a wallpaper of engineering signifiers. Every reader who has held a real drawing spots it, because on a real drawing a dimension you cannot check is a defect. Before shipping any asset, point at each number and say what it measures. If you cannot, delete the line — an unannotated blueprint is still a blueprint.

The second symptom is **grid soup**. The 12px minor grid is set at 0.07 alpha for a reason. Raise it, and it vibrates against the 96px major grid until the type sits in a mesh. On any surface that gets re-encoded — LinkedIn, Instagram, YouTube — drop the minor grid entirely.

The third is **using it to announce a finished thing**. Blueprint says "not built yet" in a language its audience reads fluently. A launch post in blueprint reads as a plan, and no amount of exclamation in the copy will overrule the sheet.
