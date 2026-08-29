---
name: spec
description: "Use when the reader came for an answer and should leave with it: pricing, comparisons, API-shaped writing, documentation, anything where a table beats a paragraph. Applies the spec direction to every surface, not only the website. Triggers: 'spec direction', 'reference documentation look', 'pricing page', 'comparison post', 'make it look like docs', 'parameter table', 'API-shaped writing'."
---

# spec

> read it like reference documentation, because it is.

**Signature.** Prose is proportional; every value is monospace. A page is mostly tables — parameter, type, default, description — and the eye can scan the value column because the figures are tabular and the column never reflows.

**Mono is not a skin here, and its scope is the whole discipline.** IBM Plex Mono exists so `1.00` and `10.0` line their decimal points up, and **it appears on nothing that is not a value**: types, defaults, status codes, prices, durations, versions, counts. Never a heading. Never a sentence. Never a label. That single rule is what separates spec from [terminal](../terminal/SKILL.md), where monospace is everything, and from [oscilloscope](../oscilloscope/SKILL.md), where monospace is confined to instrument readouts. Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

**Use when** the reader came for an answer and will leave with it: pricing, comparisons, API-shaped writing, anything where a table beats a paragraph.

**Avoid when** you are trying to make someone feel something. Spec has no persuasion in it. **A manifesto set in spec reads as a terms-of-service page.**

---

## Tokens

**Native mode: light** — near-white documentation paper. The dark mode is not an inversion. The status hues are **re-picked, not flipped**: on a dark ground `#3538cd` and `#056a45` both fall under 4.5:1, so each is re-derived at a lighter, less saturated value that keeps its meaning — indigo still reads as indigo, green still reads as ok — while passing.

| Role | Light | on bg | Dark | on bg |
| --- | --- | --- | --- | --- |
| bg | `#fcfcfd` | — | `#0f1116` | — |
| surface | `#f4f5f8` | fg 16.59:1 | `#171a21` | — |
| fg | `#14161c` | 17.64:1 | `#e6e8ee` | 15.41:1 |
| muted | `#575c6b` | 6.51:1 | `#9aa0b2` | 7.23:1 |
| border | `#dfe1e8` | hairline | `#262a34` | hairline |
| accent | `#3538cd` | 7.88:1 | `#8b8dfb` | 6.56:1 |
| accentFg | `#ffffff` | 8.08:1 on accent | `#0f1116` | 6.56:1 on accent |
| alt — ok / 2xx | `#056a45` | 6.49:1 | `#46c98a` | 8.98:1 |
| alt2 — error / 4xx | `#b3261e` | 6.38:1 | `#ff8a80` | 8.27:1 |

**Type.** Display `"Inter Tight", system-ui, sans-serif` 600 / -0.025em / none / 1.15. Body `"Inter", system-ui, sans-serif` 400 / -0.006em / none / 1.65. Mono `"IBM Plex Mono", ui-monospace, monospace` 400 / -0.01em / 1.5 — **values only**, chosen for its tabular figures and its unambiguous 0/O and 1/l. Load `Inter Tight:wght@500;600;700`, `Inter:wght@400;500;600`, `IBM Plex Mono:wght@400;500`. Scale ratio 1.18. Plex Mono's advance is **0.6em**, so at 40px one character is 24px.

**Surface.** Radius **6px**. Shadow `0 1px 2px 0 rgba(20,22,28,0.08), 0 6px 16px -8px rgba(20,22,28,0.18)` — two offsets, real blur, no halo. Hairline `1px solid #dfe1e8`.

**Texture** (a 28px row stripe, so a table reads as ruled paper even before it has rows):
`background-image: repeating-linear-gradient(to bottom, rgba(53,56,205,0.028) 0px, rgba(53,56,205,0.028) 28px, transparent 28px, transparent 56px); background-size: 100% 56px; pointer-events: none;`

**Motion — the one authored moment.** Ease `cubic-bezier(0.2, 0, 0, 1)`, duration **260ms**. The first row of the hero table resolves. Its value cell renders as a monospace skeleton of the exact character count the real value will occupy — four grey blocks for `2.4s` — and after 260ms the blocks are replaced character-for-character by the value, left to right, so the column width never changes by a single pixel. One row, one time, on first paint. **The no-reflow is the point: the table was already the right size.** Under `prefers-reduced-motion: reduce`, render the value directly.

---

## 1. Voice and writing

**Tone.** Answers first, in as few words as the answer allows, with the caveat immediately after it rather than three paragraphs later.

**Casing.** Sentence case for headings, never title case. **Identifiers keep their real casing exactly** — `getUser`, `NODE_ENV`, `x-request-id`. Do not sentence-case an identifier to match a heading.

**Sentence rhythm.** Short, 6 to 14 words. Fragments are allowed when they are complete answers: `Required.` `Not supported yet.` A paragraph is at most three sentences, and a paragraph that lists three or more values is a table that has not been built yet.

**Do say:** `Returns 402 if the plan has no seats left.` · `Default: 30 days. Maximum: 365.` · `This is not supported yet. Tracked in #418.` · `Required.`

**Don't say:** `simply` · `just` · `blazing fast` · `powerful` · `enterprise-grade` · `next-generation`

**The tell.** The caveat sits in the sentence after the answer, never later and never in a footnote. "Default: 30 days. Maximum: 365." is the whole habit: the value, then its bound, then stop.

## 2. Landing page

`#fcfcfd` with the 28px row stripe on at 0.028 alpha. The page is a document, not a poster.

- **Measure: 72 characters** — 680px at 17px Inter body. Single column for prose. Tables go full width up to 1120px.
- **Hero.** Question as a heading, Inter Tight 600, **64px**, sentence case, max 12 words. Directly under it — no paragraph in between — a **three-row table** giving the answer: labels in `#575c6b` Inter 17px, values in IBM Plex Mono 20px `#14161c`, right-aligned in a fixed-width column.
- **Sections divide by a table header row**, not a rule: uppercase `#575c6b` Inter 13px with +0.06em tracking, on `#f4f5f8`, 1px `#dfe1e8` top and bottom.
- **Whitespace is row height.** The rhythm unit is **28px**. Cell padding 14px vertical. Gaps between sections are 84px (three rows). No other value.
- **The carrying element is the value column.** Right-align it, fix its width, and never let it reflow. If two tables sit on one page, their value columns share one width.

Indigo appears on links and on one status pill per screenful. Green and red appear **only** as status, never as decoration.

## 3. X / Twitter avatar

Renders at **48px**. Spec's full mark does not survive it, so there is a variant, and it is mandatory.

**Full artwork (400px+):** a `#fcfcfd` square with a 1px `#dfe1e8` border inset 8%, `pa` in IBM Plex Mono 500 at **42% of the square's height**, `#14161c`, optically centred. A 6px `#3538cd` square sits in the bottom-right of the inner border, flush to both edges.

**48px variant — three changes:**

1. **Border off.** A 1px hairline inset 8% is invisible at 48px and turns the edge to fuzz under avatar compression.
2. **`pa` grows to 56% of the height** and moves to true optical centre. At 48px that is 27px of cap height, which reads.
3. **The 6px square becomes a bottom bar**: `#3538cd`, full width, **8% of the square's height**, flush to the bottom edge. A 6px square scales to 0.7px at 48px and disappears; a bar survives and carries the same indigo signal.

Row stripes never appear on the avatar at any size.

## 4. X header and YouTube banner

YouTube is 2560×1440. Only the centred **1546×423 safe area** shows on a phone.

**Inside the safe area:** one table row, full safe-area width, with **four cells** divided by 1px `#dfe1e8` vertical rules at 386px intervals. Each cell holds a label above and a value below: `role` / `building` / `writing` / `investing` in `#575c6b` Inter 20px, and the current value under each in IBM Plex Mono **30px** `#14161c`. Baseline of the label at y=690, of the value at y=750.

**Nothing else.** The row updates when a value changes; the layout never does. Outside the safe area, `#fcfcfd` and the row stripe run to 2560×1440.

For the 1500×500 X header, the same four cells span x=120 to x=1380 at y=250.

## 5. Open Graph card

1200×630 on `#fcfcfd`. It renders in feed at roughly 400×210.

- A **status pill** at y=48, left at x=64: 8px radius, `#3538cd` fill, `#ffffff` IBM Plex Mono **22px**, one uppercase word — `GUIDE`, `NOTE`, `TEARDOWN`.
- Title in Inter Tight 600, **60px**, `#14161c`, left at x=64, top at y=96, **two lines max**.
- A bottom strip **72px tall** in `#f4f5f8` with a 1px `#dfe1e8` top rule: `pooriaarab.com` left at x=64, read time right at x=1136, both IBM Plex Mono **24px** `#575c6b`.

**Drop at feed size:** the 28px row stripe — at 0.028 alpha it is invisible in the feed and it is one more thing for the encoder to smear. Keep the pill, which is the only saturated object on the card and does the entire job of stopping a scroll at 400px wide.

## 6. LinkedIn banner

1584×396. Treat a **400px wide by 140px tall** block at the bottom left as covered by the profile photo.

Run the four-cell table row from **x=440 to x=1520**, cells 270px wide, labels at y=160 and values at y=215. Labels `#575c6b` Inter 18px, values IBM Plex Mono **26px** `#14161c`. Vertical rules 1px `#dfe1e8`, full cell height.

Nothing in the bottom strip. If a fourth cell will not fit beside the photo hole, **drop a cell rather than shrink the type** — a three-cell row is still the row.

## 7. LinkedIn post image

1200×627. **Spec needs no dialling down at all. It is already the most conservative direction in this suite, and it is the one to reach for when the room is suits.** A table of real numbers is the single most credible object you can put in that feed.

Use the light mode. Title in Inter Tight 600 at 52px, max 10 words. Under it, a **four-row table**: labels `#575c6b` Inter 26px, values IBM Plex Mono 32px `#14161c`, right-aligned in a fixed column. One status pill top-left. Row stripe off, because LinkedIn's JPEG pass renders a 0.028-alpha stripe as banding.

If the post is a personal milestone, spec will make it read as an audit. Use [dispatch](../dispatch/SKILL.md) or [buildspace](../buildspace/SKILL.md) instead. This is a register problem, not a colour problem.

## 8. Instagram carousel

1080×1350 throughout. **The carousel is one table, split one row per slide.** That structure is what separates it from a [terminal](../terminal/SKILL.md) session or an [oscilloscope](../oscilloscope/SKILL.md) sweep — and on every slide, **only the value is monospace.**

**Cover slide.** `#fcfcfd`. A status pill at the top left (x=72, y=96): `#3538cd`, 8px radius, `#ffffff` Plex Mono 26px, one uppercase word. The question below it as a heading, Inter Tight 600 at **96px**, sentence case, max 10 words, left at 72px. No table on the cover — the cover asks, the interiors answer.

**Interior slide.** One row, huge. Label in `#575c6b` Inter 32px at the top of the row. Value in IBM Plex Mono **136px** `#14161c` directly under it, **left-aligned on a fixed column at x=72** so the value's first character sits at the identical pixel on every interior slide. That fixed column is the swipe-through effect: the numbers stack as you flick. Under the value, one line of Inter 34px, **max 44 characters**, giving the caveat. A `#056a45` or `#b3261e` status pill sits at x=72, y=1180 when a row has a verdict.

**End card.** One more row, same geometry: label `subscribe`, value `pooriaarab.com` in Plex Mono 72px, caveat line naming what arrives and how often. The ask is a row, because in this direction everything is.

**Swipe cue.** The next row has already begun. A 1px `#dfe1e8` horizontal rule crosses the full width at y=1240, and below it the next slide's label sits in `#575c6b` Inter 32px, **clipped by the bottom-right frame edge at x=1080** with the value column empty. A reader of tables knows an empty cell means a value is coming.

**Never put a photograph on a spec carousel.** A face has no column. If the story needs one, change direction.

## 9. YouTube thumbnail

1280×720, designed for the **~210px** version.

White `#fcfcfd` field, split 62/38.

- **Left 62%:** the question as a heading, Inter Tight 600, **84px**, sentence case, **max 8 words**, top-aligned at a 56px margin. Under it, the answer as a two-column table — **three rows maximum** — labels in `#575c6b` Inter 32px, values in IBM Plex Mono **40px** `#14161c`, right-aligned.
- **Right 38%:** the face on `#f4f5f8`, no crop games, no cutout, no duotone. Plus **one status pill** naming the verdict in a single word — `#056a45` for a yes, `#b3261e` for a no.

**Spec is the only direction in this technical family that carries a real photograph well**, because a documentation page can hold a portrait in a panel without irony. At 210px the three-row table collapses to three grey bars, which is fine: the pill and the question do the work, and the table says "there are numbers in here".

Recognisably his without being identical: white field, 62/38 split, one pill. The question and the verdict change every time.

## 10. YouTube edit style

**Honest constraint: spec is a reference-page direction and it has almost no native video vocabulary.** Its one motion is a value resolving in a cell. That is enough for exactly one genre — the comparison, the pricing breakdown, the "which should you use" — and it is not enough for anything else. Do not force it onto a vlog or a build log.

**Cut rhythm.** Even and unhurried. 5–8 seconds per point. **A cut lands the moment a value has been read aloud**, never mid-caveat. When two options are compared, cut between them on a fixed cadence so the audience learns the rhythm and starts predicting the answer.

**Titles and lower thirds.** The lower third is a two-cell table row: label in `#575c6b` Inter 24px, value in IBM Plex Mono 34px `#14161c`, on `#f4f5f8` with a 1px `#dfe1e8` top rule, bottom-left at x=120 / y=900 on a 1920×1080 frame. **In: the value cell resolves character-for-character over 260ms from a grey skeleton.** Out: a single-frame cut. It never slides and never fades.

**B-roll.** Screen recordings, documentation, dashboards — flat and bright. Lift blacks to `#14161c`, keep saturation at 90%, no tint. Talking-head footage is graded neutral with a slight lift; spec is the one direction here that does not push a colour cast onto your face. 100% speed. **One speed exception:** a scroll-through of a long table may run at 200% because a table's job is to be scanned.

**Transitions.** One only: a **row replace** — the value cell empties to a grey skeleton for 6 frames, then resolves into the next section's value. Everything else is banned, including fades to black.

**Cold open (first 3 seconds).** Frames 1–20: the answer alone, as a value in Plex Mono at 240px, resolving from a skeleton over 260ms. Frames 21–72: the question types in above it in Inter Tight, small. You give the answer before the question, which is the entire voice.

**What this edit cannot do:** build tension, tell a story, or land a joke. It answers, and then it stops.

## 11. Podcast cover

3000×3000, shown at **150px**. Simplify to two elements.

- **Row stripe off. Table off.** A three-row table at 150px is three grey lines and reads as damage.
- Show title in Inter Tight 600, **two lines maximum, three words per line**, at **400px**, `#14161c`, left at 300px, block optically centred on `#fcfcfd`.
- A `#3538cd` **bottom bar, 240px tall, full width**, flush to the bottom edge, carrying one uppercase word in `#ffffff` IBM Plex Mono 130px: the show's category. That bar is the whole identity at 150px — it is the same bar as the 48px avatar variant, which is deliberate.
- No border, no shadow, no photo, no `pa`.

## 12. Deck and talks

16:9, read from the back of a room. **Every slide is one table or one number. No slide carries both a table and a paragraph.**

- **Title slide.** The question in Inter Tight 600 at **120px** on a 1920×1080 artboard, left at 160px, with one status pill above it at 40px.
- **Section divider.** A single table header row across the full width: uppercase `#575c6b` Inter 40px, +0.06em tracking, on `#f4f5f8` with rules top and bottom. Nothing else on the slide.
- **Number slides.** The figure in IBM Plex Mono at **240px**, `#14161c`, with its unit in `#575c6b` at **48px** on the same baseline, and a single sentence of Inter under it.
- **Table slides.** **Five rows maximum.** Header row `#575c6b` uppercase 18px. Values monospace and right-aligned, sharing one column width across the whole deck.
- **Slides with a lot of words:** the cap is **35 words**, Inter 36px, and there is no table on that slide. If both are needed, it is two slides.

Minimum type anywhere in the deck: 28px on a 1920px artboard. Green and red appear only as status, at most twice per deck.

## Cost to run

**Cheap to moderate.** The layout is free — one table master, one pill, one type pair — and every asset is generated text on a white field. The OG card, the banner and the deck all render from a template. There is no photography to shoot, no illustration to commission, no grade to match.

The cost is upstream and it is real: **spec needs numbers you actually have.** A pricing slide, a comparison table, a benchmark row — each is a piece of research, not a piece of design. Expect 15–30 minutes of gathering per asset, and none of it is reusable next week. That is a much better trade than a direction that costs a designer per post, but it is not free, and it is why spec cannot carry a daily posting cadence on its own.

## Pairs with / clashes with

**Pairs with [terminal](../terminal/SKILL.md).** The two halves of a technical kit: terminal is the native-dark log of what happened, spec is the native-light reference for what is true. No shared font, no shared hue, no ambiguity about which one you are looking at. Ship the release note in terminal and the docs in spec.

**Pairs with [swiss](../swiss/SKILL.md) and [annual](../annual/SKILL.md)** — all three are grid-disciplined and quiet, and spec supplies the value column those two lack.

**Pairs with [blueprint](../blueprint/SKILL.md)**: blueprint draws the system, spec tabulates its parameters.

**Clashes with [arcade](../arcade/SKILL.md), [stadium](../stadium/SKILL.md) and [flyer](../flyer/SKILL.md).** Those directions exist to raise a pulse; spec exists to lower one. In one kit they read as two brands with one logo.

**Clashes with [manuscript](../manuscript/SKILL.md)** in voice: manuscript is argument, spec is answer, and a page cannot be both.

**Telling the three mono directions apart.** spec is near-white paper, Inter Tight prose with IBM Plex Mono on **values only**, native light, indigo accent. [terminal](../terminal/SKILL.md) is phosphor green with JetBrains Mono on *everything*, scanlines, native dark. [oscilloscope](../oscilloscope/SKILL.md) is amber-only with Saira Condensed labels, Share Tech Mono readouts, and a real graticule, native dark. If a spec asset has a monospace heading, it has stopped being spec.

## The failure mode

**Terms of service.** Spec fails by being correct and unreadable. Every rule in it pushes toward density — the answer first, the caveat next, five rows to a slide — and density with no persuasion is a legal document. Readers do not argue with a page like that; they close it. The tell is a page you can verify line by line and cannot remember one line of.

The guard is the **one-number rule**: every asset carries one figure that is genuinely surprising, and that figure is the largest thing on the surface. A table of unsurprising values is a form. A table with one number that changes someone's decision is an argument.

The second symptom is **mono creep**. The direction's whole discipline is that monospace marks a value and nothing else. Once a heading goes mono, then a label, then a caption, spec has quietly become [terminal](../terminal/SKILL.md) in the wrong colours — and it has lost the thing that made the value column scannable, because nothing is special any more. Audit every asset by asking, of each monospace string: is this a value someone could look up? If not, it is Inter.

The third is **using it to persuade**. A manifesto in spec is a terms-of-service page. The direction will not stop you, and it will make the writing worse without making it look wrong, which is the hardest failure to catch in review.
