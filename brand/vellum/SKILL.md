---
name: vellum
description: "Use when you apply the vellum brand direction to any surface: landing page, X avatar, OG card, LinkedIn banner, Instagram carousel, YouTube thumbnail or edit, podcast cover, deck. vellum is a stack of translucent calfskin sheets offset 24px down and right, where you read the earlier draft through the new one. For work that has versions. Triggers: 'vellum direction', 'apply vellum', 'sheet stack', 'brand this as vellum', 'vellum carousel', 'vellum thumbnail'."
---

# vellum

**a pile of cut sheets on a desk, and you can read the one underneath.**

Every surface is a translucent calfskin sheet laid on the stack below it, offset 24px down and right, and the earlier sheet stays legible through the new one. Depth is a count of sheets, never a shadow.

vellum is scraped, limed calfskin: it takes ink without bleeding and stays translucent when thin. Where two sheets overlap the field darkens about 6%. **That overlap is the only value change in the system.** This is not glassmorphism: no blur, no specular edge, no `backdrop-filter`.

**Use vellum when** the work has versions and you want the versions visible: a changelog, an essay with its earlier draft, a research page, a portfolio where the process is the point.

**Avoid vellum when** the page has one message and one action. A stack implies there is more underneath, which is a lie on a single-purpose page.

Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Picker: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

## Tokens

Native mode is **light**. The dark mode is an argued port, not an inversion: the same stack held up to a lamp in a dark room. The sheets are still warm and still translucent; the light is behind them now.

```
light  bg #f3efe6  surface rgba(255,252,244,0.72)  fg #23201a  muted #6a6355
       border rgba(35,32,26,0.14)  accent #a8331f  accentFg #fdf7f0  alt #7d8a7a
dark   bg #17150f  surface rgba(240,232,214,0.10)  fg #efe7d6  muted #a89c86
       border rgba(240,232,214,0.16)  accent #e4694f  accentFg #1a0d09  alt #8f9a86
```

**Surfaces are translucent on purpose: alpha is the material.** Never flatten `rgba(255,252,244,0.72)` to a hex — the 6% overlap darkening comes from alpha compositing, not from hand-painting. `#a8331f` is rubrication: on real vellum the one non-black ink was vermilion. `#7d8a7a` is the olive cast that appears where three or more sheets stack.

Verified contrast — light fg/bg **14.15**, muted/bg **5.19**, accentFg/accent **6.25**; dark fg/bg **14.84**, muted/bg **6.75**, accentFg/accent **5.82**. Vermilion on the light field is **5.79**, so `#a8331f` is legal as text.

**Type.** Display `"Cormorant Garamond", Garamond, serif` 600 / `-0.02em` / `1.04`. Body `"Karla", system-ui, sans-serif` 400 / `0.005em` / `1.72`. Mono `"Courier Prime", ui-monospace, monospace` 400 / `0em` / `1.55`. Scale **1.34** from 18px: 18 / 24 / 32 / 43 / 58 / 78 / 104 / 139. Google families: `Cormorant Garamond:wght@400;600;700`, `Karla:wght@400;500;600`, `Courier Prime:wght@400;700`.

**Depth.** Radius `0` — sheets are cut, not rounded. Hairline `1px solid rgba(35,32,26,0.14)`. Shadow `0 1px 2px 0 rgba(35,32,26,0.10), 0 10px 20px -16px rgba(35,32,26,0.28)` used **only** on the single topmost sheet, and only while it is dragged or opened. The resting stack casts nothing. Depth is overlap.

**Texture.** Calfskin grain runs slightly off-vertical, plus the follicle flecks that survive the liming. Real fibre, not a noise filter. `background-image: repeating-linear-gradient(96deg, rgba(35,32,26,0.030) 0px, rgba(35,32,26,0.030) 1px, transparent 1px, transparent 4px), radial-gradient(rgba(35,32,26,0.035) 0.5px, transparent 0.6px); background-size: auto, 5px 5px; pointer-events: none;`

**Motion.** `cubic-bezier(0.22, 1, 0.36, 1)`, `380ms`. On navigation the incoming sheet translates up 24px while its opacity runs from nothing to 94%, and for roughly 180ms in the middle both pages are legible through one another — you read the outgoing headline through the incoming one. That overlap is the entire animation; nothing else moves, ever. This does not breach the floor's ban on an `opacity: 0` resting state: the resting sheet is 94% opaque in the DOM, and the crossfade runs only between two already-rendered documents, so a crawler, a print or a screenshot always gets the resting stack. Under `prefers-reduced-motion` the crossfade is dropped.

## Small-export variants

vellum's ink-on-pale contrast is 14.15, so the type survives every size without a variant. **What fails is the material, and it fails in two predictable ways.** The 5px grain is sub-pixel below about 200px and is destroyed by any lossy re-encode. The 6% overlap step survives scaling but not low-quality JPEG.

| Surface | Sheets | Grain | Note |
| --- | --- | --- | --- |
| web | up to 3 | yes | full direction |
| avatar, 400 at 48px | 1 | drops out at 48px | red 34px square is the mark |
| OG, 1200 at ~400px | 3 | **drop** | sheet edges survive as value steps |
| X header, 1500 | 2 edges | yes | one 5px vermilion rule |
| YouTube banner, 2560 | 2 edges | yes | edges measured against the safe band |
| LinkedIn banner, 1584 | 2 edges | yes | rule starts clear of the photo hole |
| LinkedIn post, 1200 | **2** | **drop** | JPEG quality 92 minimum |
| Instagram, 1080 | up to 5, then reset | yes | the stack is the progress bar |
| YouTube thumbnail, 1280 at 210px | 1 edge | **drop** | survives natively, no variant |
| Podcast, 3000 at 150px | **1 edge** | **drop** | rule promoted to 40px |
| Deck projected | grows per idea | **drop** | a 6% step projects, a 3% grain does not |

## 1. Voice and writing

**Tone.** An editor showing you the marked-up draft rather than the clean one, and pointing at what got cut and why.

**Casing.** Sentence case. The one exception is a Courier Prime version marker in caps, such as `DRAFT 4`. That marker is the only uppercase anywhere.

**Rhythm.** Long sentences, 18 to 30 words, often carrying a clause that revises the one before it. Fragments are allowed only inside a margin note.

**Do say:** "the version under this one said something different" · "here is what I cut" · "read the margin note first" · "draft three had the opposite conclusion".

**Don't say:** "frosted" · "glass" · "sleek" · "seamless" · "futuristic" · "next-gen" · "pristine".

**The tell.** Every vellum paragraph contains a visible revision: it states what an earlier version said, then what replaced it. Not "I changed my mind" — the two actual positions, both written out.

## 2. Landing page

- **The field** is `#f3efe6` with the grain overlay. The field is not a sheet.
- **Sheets** are `rgba(255,252,244,0.72)`, radius `0`, each offset **24px down and 24px right** from the sheet under it, z-order ascending, padding 64px. That 24px offset is the only gutter in the system.
- **Maximum stack depth is 3.** A fourth sheet is a new section: reset to one.
- **Hero.** Headline Cormorant Garamond 600 at 104px on the top sheet, max eight words. The sheet beneath shows its own first line through, deliberately readable.
- **Body.** Karla 400 at 18px, leading `1.72`, measure 68 characters, one column.
- **No shadow on the resting stack.** If you cannot see depth, you have too few sheets or the alpha is wrong; a shadow added to fix it destroys the direction.
- **The carrying element** is the visible cut sheet edge. Every straight edge in the layout is a sheet boundary, never a divider.

## 3. X / Twitter avatar

400×400 on `#f3efe6`. The photo is printed on the top sheet: desaturate to 30%, set at 88% opacity so the paper grain reads through the skin. Crop shoulders-up, eyeline at 42% height (y=168). One solid `#a8331f` square, 34×34, inset 40px from the bottom-left corner — the rubricator's mark. No circle crop, no border, no text.

**What survives 48px, honestly.** The 34px square renders **4.1px** and holds as a red dot. The face holds. **The grain does not** — a 5px pattern is sub-pixel at 48px and flattens to a warm tone. That is acceptable, because the grain never carried the identity. At 48px the avatar is a pale square, a soft head, and one red dot. Do not add a border to compensate.

## 4. X header and YouTube banner

**X header, 1500×500.** Two sheet edges only, both straight, crossing the frame at 28% and 66% height (y=140 and y=330). No headline. One `#a8331f` rule, 5px, spanning the full 1500px at **y=372**. Nothing else: no handle, no tagline, no logo.

**YouTube banner, 2560×1440, safe area 1546×423 (x 507–2053, y 508–931).** The 1500-wide placement does not port: 28% and 66% of 1440 fall at y=403 and y=950, both outside the safe area, so a phone would show a flat field and nothing else. Measure the percentages against the **safe band** instead. Field `#f3efe6` with grain across the full frame. Two straight cut edges crossing at **y=626** and **y=787** (28% and 66% of the 423px band), each running the full 2560px width, region between them 6% darker — the only value change. One `#a8331f` rule, 8px, at **y=823**, spanning x=507 to x=2053 only. Nothing else: no name, no handle, no subscribe prompt.

## 5. Open Graph card

1200×630. Three sheets, offsets 24px down and right, bottom-left origin. Headline on the top sheet in Cormorant Garamond 600 at 76px, maximum eight words. The sheet directly beneath shows its own first line through at 24% opacity, deliberately readable. One vermilion rule, 6px, under the last word.

**Shrink maths at the ~400px feed render (0.33×):** headline 76px → 25px, survives. Vermilion rule 6px → 2px, survives. The 24%-opacity line beneath is not legible, which is correct — it is a full-size reward for anyone who opens the card. Sheet edges survive as value steps even when the text on them does not. Drop the grain from the OG export: JPEG turns a 3% pattern into blotch.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop: treat x 0–272, y 216–396 as a hole. Field `#f3efe6`. Two straight cut edges cross the full width at **y=110** and **y=262**, region between them 6% darker. One `#a8331f` rule, 5px, at **y=330**, spanning **x=320 to x=1560** so it starts clear of the photo hole rather than running behind it — a vermilion mark half hidden by an avatar reads as an accident. No headline, no handle, no tagline: two edges and one mark.

## 7. LinkedIn post image

1200×627, and this is where vellum is dialled down. Two changes, both forced by LinkedIn's JPEG re-encode: **reduce the stack from three sheets to two** (a third sheet at this compression gives a mottled band instead of a clean 6% step), and **drop the grain entirely** (a 3% fibre pattern re-encodes to visible blotch on skin tones and pale fields).

Layout: top sheet from (24,24), second sheet 24px down and right beneath it. Headline Cormorant Garamond 600 at 62px on the top sheet, maximum ten words, inset 72px from the sheet edge. One `#a8331f` underline, 8px, under exactly one word. Attribution in Karla 400 at 22px. Export at JPEG quality 92 minimum, and PNG whenever a sheet edge crosses a face.

**In a room full of suits** vellum needs almost no toning down — it reads as considered rather than decorated. The only real risk is technical: at low JPEG quality a translucent stack looks like a rendering error, and a rendering error reads as carelessness.

## 8. Instagram carousel

**This is vellum's best surface.** A carousel is literally a stack of sheets, so the direction and the format are the same object. Build the carousel as one stack that grows.

1080×1350 throughout. The sheet grid is fixed: sheet *n* has its top-left corner at `(24n, 24n)` and bleeds off the right and bottom edges. Never vary the offset.

**Cover.** One sheet only, top-left at (24,24). Headline Cormorant Garamond 600 at 128px, `#23201a`, maximum five words, inset 72px from the sheet edge (x=96), baseline y=560. One `#a8331f` underline, 12px, under exactly one word — never two.

**Swipe cue.** The second sheet's edge peeks 24px in from the right edge of the cover, running the full height. You can literally see the next sheet under this one. That is the swipe cue, and it is native to the material. **No arrow, no "swipe" text, no dot row, ever.**

**Interior slide *n*.** Carries `min(n, 5)` sheets, oldest at the top-left, each offset 24px down and right. Copy on the top sheet in Karla 400 at 40px, leading `1.72`, maximum 45 words, inset 72px from that sheet's edge. The previous slide's headline stays visible through the stack at 24% opacity in the top-left region — use the real previous headline, never filler.

**The stack is the progress bar.** Each overlap darkens the field about 6%, so by slide 5 the top-left corner is roughly 18% darker than bare field. The reader sees how deep they are without a counter. Cap at 5 sheets. At slide 6 reset to a single sheet and mark the reset with a Courier Prime caps marker — `DRAFT 2` — at 28px in the top-left. A ten-slide carousel is therefore two stacks of five, and the reset is the chapter break.

**End card.** The stack collapses back to one sheet, mirroring the cover. The ask is one line: "the draft this came from is at pooriaarab.com", Cormorant Garamond 600 at 72px. URL in Courier Prime 32px beneath it. One solid `#a8331f` square, 34×34, inset 72px from the bottom-left — the same rubricator's mark as the avatar, so the set is signed.

## 9. YouTube thumbnail

**vellum survives 168px natively** — ink on pale is 14:1 — so there is no export variant and none is needed. Design for the ~210px render.

1280×720 on `#f3efe6`. Exactly **one** sheet edge crosses the frame: a straight cut running from the top-right corner down to the left edge at 34% height (y=245), with the region above it 6% darker. That is the only value change. Three to five words, Cormorant Garamond 600 at 150px in `#23201a`, left inset 80px, baseline y=520. One `#a8331f` underline, 10px tall, under exactly one word — never two. The face, if used, is a hard-edged cut-out on the top sheet in the right third; the cut edge is straight, **never feathered**.

At 210px: the 150px type renders **24.6px** and the 10px underline renders **1.6px** as a red tick. Both hold. Drop the grain from thumbnails.

**Recognisable without being identical.** Frozen forever: the pale field, one cut edge from the top-right corner, the 6% darker region above it, one vermilion underline under exactly one word. Free: the angle of that cut, which may land anywhere on the left edge between 20% and 45% height. One variable is enough.

## 10. YouTube edit style

**Cut rhythm.** Medium-slow, minimum shot 3 seconds, cuts on the end of a clause. One exception: a cut is allowed mid-sentence exactly once per video, at the correction — the moment he says what an earlier version claimed. That single mid-sentence cut is the edit's rubrication.

**Titles and lower thirds.** A translucent sheet, `rgba(255,252,244,0.72)`, radius `0`, 880×180, bottom-left at x=120 y=820 (1080p); the footage stays legible through it. Title Cormorant Garamond 600 at 72px, `#23201a`, inset 56px. In: the sheet translates up 24px over 380ms `cubic-bezier(0.22, 1, 0.36, 1)`. Out: the same in reverse. It never fades to nothing and it never gains a shadow.

**B-roll.** Desaturate to 30%, the same 30% as the avatar. Warm the whites toward `#f3efe6`. Overlay the 5px paper grain at 3% across the whole frame. Speed 100% or 90%, no ramps.

**Transitions.** Hard cut only, plus one exception: the sheet wipe, where the incoming shot slides up 24px under a 380ms 6% darkening, matching the web navigation exactly. No dissolves, no wipes, no whips.

**The cold open.** Seconds 0 to 3 hold on the previous version — an old draft, an old thumbnail, an old tweet — in silence, then cut to camera. Same every video. It states the premise of the direction before a word is spoken.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify from a stack to a single edge, because five overlapping 6% steps are indistinguishable at that size.

- Field `#f3efe6`. **No grain** — sub-pixel at 150px and destroyed by the re-encode.
- One straight cut from the top-right corner to the left edge at 34% height (y=1020), region above it 6% darker. That is the whole composition.
- Title Cormorant Garamond 600 at 340px in `#23201a`, maximum three words, left inset 200px, baseline y=2100. At 150px that renders 17px, so three short words is a hard ceiling.
- One `#a8331f` rule, 40px, under exactly one word: renders 2px at 150px.
- No face, no host name, no episode number, no mic, no logo.

## 12. Deck and talks

16:9, 1920×1080. **One sheet per idea, and a new idea adds a sheet rather than replacing it**, so a section visibly darkens by about 5% as it goes. Reset the stack to a single sheet at each section break. The vermilion mark appears at most once per section.

- **Title slide.** One sheet at (48,48). Title Cormorant Garamond 600 at 148px, inset 96px from the sheet edge. Date in Courier Prime 24px.
- **Section divider.** Reset to the bare field, no sheet at all, plus one Courier Prime caps marker at 40px. The empty field is the break.
- **Data slide.** The number on the top sheet, Cormorant Garamond 600 at 260px. Its source in Courier Prime 24px on the sheet **below**, showing through at 24%: the citation is literally underneath the claim.
- **Slides with a lot of words.** Maximum 55 words at 34px Karla. If it does not fit, **add a sheet** — do not shrink the type. Never below 28px.
- **Projection.** A 6% step survives a projector; a 3% grain does not. Export projected decks without the grain and keep it in the PDF.

## Cost to run

**Moderate to expensive, and the expense is not where people expect it.**

The visual work is fine: nine templates cover twelve surfaces, the 24px offset grid is trivial to build once, and a post takes about twelve minutes. Two things raise the bill.

**Alpha is fragile in export.** You cannot fake a sheet with a flat colour, so every export needs real compositing, and every lossy re-encode attacks the 6% step and the 3% grain. Expect a per-surface export recipe — quality 92 JPEG here, PNG there, grain dropped in four places — not one universal export.

**The stack must be true.** Every asset needs real earlier content for the layer underneath — the previous headline, the cut paragraph, the draft that lost. Budget the writing, not the design. vellum is only cheap for someone who already keeps their drafts.

## Pairs with / clashes with

**Pairs with [`../dusk/SKILL.md`](../dusk/SKILL.md).** Both are warm, unhurried and native to work with a history. vellum is the stack of drafts; dusk is the reflection written on top of it. Vermilion `#a8331f` and ember `#f2a25c` share a warm quadrant.

**Sits beside [`../manuscript/SKILL.md`](../manuscript/SKILL.md), and the two are easy to confuse.** Both are paper and both are warm; the distinction is structural. **Manuscript is a bound book: one leaf at a time, a rubric drop cap, a fixed text block, an authority already settled. vellum is loose translucent sheets: a stack, visible earlier drafts, no drop cap, nothing settled.** Content with a final version goes to manuscript; content with versions goes to vellum. Never run both in one kit — the reader sees one paper direction executed inconsistently.

**Clashes with [`../swiss/SKILL.md`](../swiss/SKILL.md).** Swiss is one flat plane with no material at all. Next to it vellum's alpha reads as dirt on the screen rather than as substance.

**Clashes with [`../arcade/SKILL.md`](../arcade/SKILL.md).** Arcade is instant and lit from inside; vellum is slow and lit from outside. No shared surface.

## The failure mode

**vellum becomes glassmorphism.**

The moment somebody adds `backdrop-filter: blur()`, a specular highlight along a sheet edge, or a rounded corner, the calfskin turns into a 2020 iOS panel and the direction is gone. It happens because blur *looks* like the obvious way to sell translucency, and it is exactly wrong: real vellum is thin and clear, not frosted. Three diagnostic questions — **is there a blur, is there a highlight, is any corner rounded?** One yes means it failed.

The second failure is quieter and worse. A stack promises something real is underneath. When the layer beneath a headline is decorative texture instead of a readable earlier draft, the direction still looks right and has stopped meaning anything. Every reader who leans in to read that layer finds nothing there, and they only need to do it once.
