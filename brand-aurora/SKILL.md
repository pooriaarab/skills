---
name: brand-aurora
description: "Use when you apply the aurora brand direction to any surface: landing page, X avatar, OG card, LinkedIn banner, Instagram carousel, YouTube thumbnail or edit, podcast cover, deck. aurora is one coloured wash entering one off-canvas edge on an unbroken dark field, with no cards, no fills and no icons, for a single serious claim. Triggers: 'aurora direction', 'apply aurora', 'one wash', 'brand this as aurora', 'aurora carousel', 'aurora thumbnail'."
---

# aurora

**one light comes in from off the edge of the page, and then stops.**

Exactly one coloured wash enters from one off-canvas edge per page and is never repeated, and it is the only ornament in the system. Everything else is text on an unbroken field, with every shadow cast away from that light.

aurora is organised by **absence**: no cards, no panels, no fills, no icons and no borders except the one hairline under the header. Content sits directly on the field in a single left-aligned column. This is a magnetic-storm aurora, not outer space — weather, seen from the ground, over a field. No stars, no nebulae, no planets, no orbits; the `don't say` list enforces that in the copy as well as the art.

**Use aurora when** a single serious claim needs the whole page: a thesis, a research note, a technical write-up, a talk abstract.

**Avoid aurora when** the page has many parallel items — a directory, a pricing grid, a link list. With no cards and no borders, parallel content has nothing to sit in.

Contract: [`../brand-router/_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor: [`../brand-router/_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md). Picker: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

## Tokens

Native mode is **dark**. The light mode is an argued port, not an inversion: still one wash entering one edge of one unbroken field, still no cards. The field is pre-dawn instead of night, and the green darkens only as far as white text requires.

```
dark   bg #05070b  surface #0b0f15  fg #e6f2ec  muted #8ba79c  border #17211d
       accent #6ff0bb  accentFg #04130d  ring #a48cff  alt #a48cff
light  bg #f2f6f4  surface #ffffff  fg #0d1714  muted #4f6961  border #dde6e2
       accent #0f7a56  accentFg #f2fbf7  ring #6b4fd0  alt #6b4fd0
```

The ring is a **deliberate clash**: violet against mint, so a keyboard user can never mistake focus for emphasis. Do not "fix" it to match the accent.

Verified contrast — dark fg/bg **17.55**, muted/bg **7.78**, accentFg/accent **13.46**; light fg/bg **16.75**, muted/bg **5.46**, accentFg/accent **5.06**. Mint on the dark field is **14.26** and the violet ring is **7.46**.

**Type.** Display `"Space Grotesk", system-ui, sans-serif` 500 / `-0.035em` / leading `1.02`. Body `"Manrope", system-ui, sans-serif` 400 / `-0.005em` / `1.66`. Mono `"Space Mono", ui-monospace, monospace` 400 / `0em` / uppercase / `1.45`. Scale **1.22** from 17px: 17 / 21 / 25 / 31 / 37 / 45 / 55 / 67 / 82. Google families: `Space Grotesk:wght@400;500;700`, `Manrope:wght@400;500;700`, `Space Mono:wght@400;700`.

**Depth.** Radius `4px`. Hairline `1px solid #17211d`. Shadow `18px 22px 44px -30px rgba(2,4,8,0.92), 4px 5px 12px -8px rgba(2,4,8,0.70)`. The light enters top-left, so the cast falls down and to the **right** — asymmetric x and y, both layers blurred. **A zero-offset coloured halo is banned here specifically**, because it is the obvious wrong answer for this direction.

**Texture — load-bearing, not decorative.** A wide low-alpha wash on a near-black field bands badly on 8-bit displays. The grain is the dither that kills it. `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.06; mix-blend-mode: screen; pointer-events: none;`

**Motion.** `cubic-bezier(0.12, 0.9, 0.2, 1)`, `900ms`. On first paint the wash starts fully off-canvas and travels 12vw into the frame, then stops for good and holds that exact position for the life of the page. It never loops, never follows the cursor, never breathes, and it does not restart on scroll. Under `prefers-reduced-motion` the wash is at its final position on paint.

## Small-export variants

aurora's field is 17.55 against its text, so type survives everywhere. **Two things fail at small sizes: the wash and the grain.** The wash becomes grey mud below about 200px unless it is hard-clipped to a box, and the SVG grain is sub-pixel below about 200px and is destroyed by any lossy re-encode, which removes the dither that stops the wash banding.

| Surface | Wash | Grain | Note |
| --- | --- | --- | --- |
| web | one edge, 12vw travel, ceiling 0.55 | yes | grain is mandatory |
| avatar, 400 at 48px | **none** | none | mint rim promoted 6px to 16px |
| OG, 1200 at ~400px | left edge, 240px | yes | headline starts at x=380 |
| X header, 1500 | right edge, 300px | yes | light reverses on the header |
| YouTube banner, 2560 at ~390px | right edge, 512px | yes | invisible on a phone, and that is stated |
| LinkedIn post, 1200 | **light port**, ceiling 0.30 | **drop** | a near-black tile reads as an ad |
| Instagram, 1080 | 3 washes in 10 slides | yes | clipped to a 480px box on openers |
| YouTube thumbnail, 1280 at 210px | clipped 360px box, ceiling 0.55 | yes | never enters the text box |
| Podcast, 3000 at 150px | clipped 900px box | **drop** | mint rule promoted 28px to 40px |
| Deck, 1920 | one per section, edges left/top/right | yes | body slides carry none |

## 1. Voice and writing

**Tone.** An operator describing something at the edge of what he can actually prove, in flat declarative sentences with the uncertainty left in.

**Casing.** Sentence case for headlines. The Space Mono eyebrow is the only uppercase on a page, and it is one word.

**Rhythm.** Flat declaratives, 8 to 16 words. One clause each. Never stack subordinate clauses. Fragments are banned — a fragment sounds like a slogan, and aurora does not have slogans.

**Do say:** "here is the measurement" · "I do not know this yet" · "it has held for six months" · "the error bar is wider than I would like".

**Don't say:** "cosmic" · "stellar" · "galaxy" · "moonshot" · "to the moon" · "otherworldly" · "magical".

**The tell.** Every aurora paragraph states a measurement and its uncertainty in the same breath. Not a number with a boast, and not a hedge with no number: both, side by side, in one sentence.

## 2. Landing page

- **Field.** `#05070b`, unbroken top to bottom, with the grain overlay at 0.06. The grain is mandatory. Without it the wash bands into visible steps.
- **Column.** One column, left aligned, measure 68 characters at 17px Manrope, left inset 96px desktop / 24px mobile. Never two columns.
- **The only border in the document** is the 1px `#17211d` hairline under the header. No dividers, no card edges, no section rules.
- **Hero.** One Space Mono eyebrow, 13px, uppercase, **one word**. Below it an h1 in Space Grotesk 500 at 82px, tracking `-0.035em`, leading `1.02`, maximum nine words.
- **The wash.** One per page, from one off-canvas edge, travelling 12vw, opacity ceiling `0.55`, hard-clipped so it **never enters a text bounding box**. One wash per page means one. Not one per section on the landing page.
- **Sections divide by space alone:** 160px above a section, 80px below its heading. Section headings Space Grotesk 500 at 45px.
- **There are no buttons.** The primary call to action is an underlined text link in `#6ff0bb`, underline offset 4px. That is a consequence of the ban list, not an oversight. A page that needs a filled button needs a different direction.
- **The carrying element** is the wash plus the emptiness around it.

## 3. X / Twitter avatar

400×400 on flat `#05070b` with **no wash** — at 48px a wash is grey mud. Face centred, shoulders cropped, lit only by a `#6ff0bb` rim along the subject's left edge, falling off to nothing by the jaw. That rim is the light source and it is the whole avatar. No circle border, no text.

**Honest note on the rim width.** The source authors the rim at 6px, which renders **0.72px** at 48px — sub-pixel, so it aliases into a faint green fringe, not a rim. For the 48px render, **promote the rim from 6px to 16px** (renders 1.9px) and keep the same falloff. This is the same promotion logic [`../brand-dusk/SKILL.md`](../brand-dusk/SKILL.md) and [`../brand-porcelain/SKILL.md`](../brand-porcelain/SKILL.md) declare for their small exports. Keep 6px at any render 200px or wider.

## 4. X header and YouTube banner

**X header, 1500×500** on `#05070b`. The wash enters from the **right** edge — the header is the one surface that reverses the light — and travels 300px in. One Space Mono line, uppercase, 22px, at x=96, y=250. Nothing else.

**YouTube banner, 2560×1440, safe area 1546×423 (x 507–2053, y 508–931).**

- Field `#05070b` with grain across the full frame.
- The wash enters the **right** edge and travels 512px in (the same 20% as the X header), reaching x=2048. It just touches the safe area's right edge, so it is effectively invisible on a phone. **That is acceptable, and it is stated rather than hidden.**
- aurora's banner has one required element and it sits inside the safe area: one Space Mono line, uppercase, 38px, `#e6f2ec`, at x=560, y=720. Nothing else — no name, no handle, no subscribe prompt, no icons.

## 5. Open Graph card

1200×630 on `#05070b`. The wash enters the left edge and travels exactly 240px in. Headline in Space Grotesk 500 at 68px starting at **x=380**, so it never touches the wash. One 18px Space Mono line above it, uppercase, one word. No logo, no border.

**Shrink maths at the ~400px feed render (0.33×):** headline 68px → 22.7px, survives. The 240px wash → 80px, survives as a corner light. Mono eyebrow 18px → 6px, **does not survive** — it is a full-size detail. Drop nothing else, because there is nothing else. That is the point of the direction.

## 6. LinkedIn banner

1584×396 on `#05070b`. The profile photo covers the lower-left on desktop: treat x 0–272, y 216–396 as a hole. The wash enters from the **right** edge (matching the header reversal) and travels 320px in, deliberately far from the hole. One Space Mono line, uppercase, 24px, `#e6f2ec`, at **x=340** (clear of the hole), y=150. Nothing else. aurora handles the photo hole better than any other direction here, because bare field is already its default state. Do not fill the corner.

## 7. LinkedIn post image

1200×627, and aurora is dialled down here more than anywhere else. Two things force it: LinkedIn's JPEG re-encode destroys the SVG grain and therefore the dither, and a near-black tile in the LinkedIn feed reads as a paid ad rather than as a post. **Use the light port on LinkedIn** — it is a declared, argued port, so this is a switch, not a compromise.

- Field `#f2f6f4`. Text `#0d1714`. Accent `#0f7a56`.
- Wash in `#0f7a56` from the left edge, travelling 240px, **opacity ceiling 0.30** rather than 0.55. On a light field the wash needs no dither, which is exactly why the light port is the right answer here.
- Headline Space Grotesk 500 at 60px, maximum ten words, starting at **x=380** so it clears the wash.
- One Space Mono word, uppercase, 20px, `#4f6961`, above the headline.
- Still no cards, no icons, no fills, no filled button.

## 8. Instagram carousel

**Say the hard part first: aurora is the worst fit in this suite for Instagram.** A carousel wants repeatable structure, and aurora bans every device that normally supplies it — cards, panels, fills, borders, icons, dot rows, arrows. Do not invent card chrome to make a carousel work. The direction dies the moment you do.

The real answer is that **aurora's repeatable structure is the wash order, not chrome**. The deck rule already establishes it: one wash per section, entering a different edge each time in the fixed order left, top, right, and body slides carry no wash at all. Port that rule to the carousel.

1080×1350 throughout, field `#05070b`, grain at 0.06 on every slide.

**Structure of a ten-slide carousel.** Three sections of three slides plus an end card. Slide 1 is the cover and the first section opener. Slides 2–4 carry **no wash**: flat field, text only. Slide 5 opens section two, wash from the **top**. Slides 6–8 no wash. Slide 9 opens section three, wash from the **right**. Slide 10 is the end card, no wash. **Exactly three washes in ten slides.** If you need a fourth section, you have written a second carousel.

**What makes the slides belong together** is not decoration. It is a frozen typographic grid, identical on all ten slides: left inset 72px, first baseline at y=300, and a Space Mono eyebrow at 28px uppercase in the top-left at y=96. That eyebrow is the only element repeated on every slide, and it is the whole system of continuity.

**Cover.** Wash from the **left**, hard-clipped to a 480×480 box in the top-left, opacity ceiling 0.55, never entering the text box. Headline Space Grotesk 500 at 132px, `#e6f2ec`, maximum five words, left inset 72px, baseline y=760. One `#6ff0bb` rule, 14px, under the last word only.

**Swipe cue.** aurora has no arrows and no dots, so the eyebrow does the work: on a carousel the Space Mono eyebrow carries the slide index as its one word — `01/10`, `02/10`. A reader who sees `01/10` knows there are nine more. **Adding an arrow, a chevron or a dot row is off-brand**, and so is a wash that "points" to the right edge.

**Interior slide.** No wash. Flat `#05070b`. Copy in Manrope 400 at 42px, leading `1.66`, maximum 45 words, left inset 72px, top y=300. Eyebrow at y=96 carries the index. Nothing else on the slide. Carousel copy is display copy, not body copy, so the 45-word cap replaces the 60–75 character measure; split the slide rather than shrink below 36px.

**Section opener (slides 5 and 9).** Identical to an interior slide, plus that section's wash from its scheduled edge, and the heading in Space Grotesk 500 at 84px instead of body copy. The wash is how a reader knows a new section started.

**End card.** No wash. The ask is one line: "the full note is at pooriaarab.com", Space Grotesk 500 at 72px, with the URL underlined in `#6ff0bb`. The eyebrow reads `10/10`. No logo, no icon, no follow prompt.

## 9. YouTube thumbnail

aurora survives 168px because the field is 17.5:1 against the text. **The wash is what fails, so it is contained.** Design for the ~210px render.

1280×720 on flat `#05070b`. The wash enters from the top-left **only**, hard-clipped to a 360×360 box, opacity ceiling 0.55, and it may never enter the text bounding box. Three words maximum, Space Grotesk 500 at 148px in `#e6f2ec`, left inset 72px, baseline y=470. One `#6ff0bb` rule, 12px tall, under the last word only. The face, if used, occupies the right 38%, silhouetted, with the mint rim on its **left** edge — the same side the light comes from.

At 210px: 148px type → **24px**, 12px rule → **2px**, the 360px wash box → **59px** and reads as a corner light. All three hold.

**Recognisable without being identical.** Frozen forever: the flat field, the top-left wash box, the three-word ceiling, the mint rule under the last word. Free: the three words, and whether the silhouette is there. Two variables, and no third is coming.

## 10. YouTube edit style

**Cut rhythm.** Slow and even. Minimum shot 5 seconds on a talking head, 3 seconds anywhere. A cut lands on the end of a sentence, never on a breath. **No jump cuts** — aurora has no chrome to hide a seam, so a jump cut reads as a mistake.

**Titles and lower thirds.** Space Grotesk 500 at 56px, `#e6f2ec`, left inset 96px, baseline y=880 (1080p). **No box, no bar, no fill behind it** — the fill ban applies in motion too. Legibility comes from placing the title over the darkest third of the frame; if no such region exists, grade that region down toward `#05070b` at 0.6 opacity. In: the title translates 24px to the right over 900ms `cubic-bezier(0.12, 0.9, 0.2, 1)`, travelling the same direction the wash travels, at full opacity from frame one. Out: it holds three seconds and cuts. No animation out.

**B-roll.** Blacks graded to `#05070b`. Desaturate to 40% and lift only the mint channel. Grain at 6% on **every** frame, including the talking head — it is the dither, not a look. Speed 100% only, no ramps.

**Transitions.** Hard cut only, plus one exception: at a section change a 900ms wash sweeps in from a new edge over the held frame, in the fixed order left, top, right. No dissolves, no wipes, no zooms.

**The cold open.** Seconds 0 to 3 hold on flat `#05070b` with three words in Space Grotesk 500 at 148px and the wash travelling its 12% in — the same gesture as the site's first paint. The voice starts at 0:00 with the measurement.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify hard.

- Field flat `#05070b`. **Drop the grain** — it is sub-pixel at 150px and the app's re-encode destroys it anyway.
- Wash clipped to a 900×900 box in the top-left, opacity ceiling 0.55.
- Title Space Grotesk 500 at 340px in `#e6f2ec`, maximum three words, left inset 180px, baseline y=1960. At 150px that renders 17px, so three short words is a hard ceiling.
- One `#6ff0bb` rule under the last word, **promoted from 28px to 40px** so it renders 2px at 150px rather than 1.4px.
- No face, no host name, no episode number, no microphone, no logo.

## 12. Deck and talks

16:9, 1920×1080, field `#05070b`. **One wash per section, entering a different edge each time in the fixed order left, top, right.** The body slides inside a section carry no wash at all — only the section opener does. **Two washes on one slide is off-brand.**

- **Title slide.** One Space Mono word, uppercase, 26px, above an h1 in Space Grotesk 500 at 148px, left inset 160px, baseline y=620. Wash from the left, travelling 230px (12% of 1920).
- **Section divider.** Bare field, one word at 220px, plus that section's wash.
- **Data slide.** The number in Space Grotesk 500 at 300px, its unit in Space Mono at 32px. **An aurora chart is bare:** axes as 1px `#17211d` rules, one `#6ff0bb` line, no fills, no gridlines, no legend, no second series. A second series needs a second slide.
- **Slides with a lot of words.** Maximum 35 words at 40px Manrope, one column, left inset 160px. If it does not fit, split the slide. **Never add a box** to make room, and never shrink below 32px.

## Cost to run

**Cheap to make, expensive to hold.**

Cheap because every asset is text on a flat field plus one clipped wash. Five templates cover twelve surfaces, there is nothing to lay out, and a post takes about four minutes. aurora is the fastest direction in this family to produce.

Expensive because **the ban list is the bill, and it is paid in content, not in time**. No cards, no icons, no fills and no borders means aurora simply cannot render a list of links, a pricing grid, a directory, a comparison table, a testimonial row or a feature matrix. Every time the content is parallel rather than singular, you must switch direction entirely. The cost is per content type, not per asset, and it is invisible until the week you need it.

Budget one companion direction that handles parallel content, and decide which one before you launch aurora rather than after.

## Pairs with / clashes with

**Pairs with [`../brand-porcelain/SKILL.md`](../brand-porcelain/SKILL.md).** Both reduce by subtraction and both refuse fills. aurora is the discipline in a dark room lit from one edge; porcelain is the same discipline in a lit room with one line. Running aurora for the essays and porcelain for the pages that need to be taken seriously reads as one person, not two.

**Pairs with [`../brand-oscilloscope/SKILL.md`](../brand-oscilloscope/SKILL.md).** Shared instrument-lit field, shared green signal on near-black, shared refusal to decorate a measurement.

**Clashes with [`../brand-stadium/SKILL.md`](../brand-stadium/SKILL.md).** Stadium is built from fills and aurora is built from their absence. Side by side, aurora reads as an unstyled page rather than as a decision.

**Clashes with [`../brand-risograph/SKILL.md`](../brand-risograph/SKILL.md).** Risograph lives on misregistration and visible ink; aurora needs the field unbroken and the wash exact. Every risograph virtue is an aurora defect.

## The failure mode

**aurora becomes a space-themed dark hero.**

Add a second wash, a star field, a glow behind a button, or a violet-to-mint gradient, and it turns into every AI startup landing page from 2024. The direction has no ornament to fall back on, so it survives only by the ban list — which means every failure is an addition, never a subtraction. The diagnostic is a count: **how many washes are on this page?** More than one and it failed. Second question: **is any shadow a zero-offset halo?** One halo and it failed.

The second failure is a fit error rather than a craft error, and it costs more. Forced onto parallel content — a link list, a pricing grid, a directory — aurora has nothing for the items to sit in, so they run together and the reader cannot see where one ends and the next begins. The page looks calm and is unusable. When the content is a list, that is not a styling problem to solve inside aurora. It is a signal to use a different direction.
