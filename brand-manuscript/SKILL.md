---
name: brand-manuscript
description: "Use when a reader will give the piece eight uninterrupted minutes: long essays, a letter, a thesis, a book chapter, a considered argument with sources. A 66-character measure, a three-line rubric drop cap, and every source set as a real numbered footnote. Reach for this over broadsheet when the piece is contemplative rather than reported, and over vellum when the object is a bound book rather than a material surface. Triggers: 'make my essays feel like a book', 'literary brand', 'drop cap', 'footnotes not links', 'Garamond', 'long-form reading experience', 'I write letters not posts'."
---

# manuscript

> a book you would keep, opened to the page you needed.

A 66-character measure opened by a three-line drop cap in rubric red, and every source
set as a real numbered footnote at the foot of the section instead of a link inside the
sentence. Warm, patient, considered.

**Use when** the work is long essays, a letter, a thesis — anything a reader will give
eight uninterrupted minutes to.

**Avoid when** the page is a product page, a form, or a dashboard. Anywhere scanning
beats reading.

**Native mode:** light. **Family:** editorial. Router:
[brand-router](../brand/brand-router/SKILL.md). Contract: [the twelve
surfaces](../brand/_lib/surfaces.md) and [the craft floor](../brand/_lib/craft-floor.md).

---

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| bg | `#f7f2e7` | `#17120c` |
| surface | `#fffaf0` | `#1f1912` |
| fg | `#241d14` | `#f0e6d4` |
| muted | `#6a5c48` | `#a2907a` |
| border | `#ddd2bb` | `#2e251a` |
| accent (rubric) | `#a33a20` | `#d9714f` |
| accentFg | `#fdf9ef` | `#17120c` |

Verified contrast: light `fg`/`bg` **14.92:1**, `muted`/`bg` **5.81:1**, `accent`/`bg`
**5.91:1**, `accentFg` on accent **6.27:1**. Dark `fg`/`bg` **15.04:1**, `muted`/`bg`
**6.03:1**, `accent`/`bg` **5.69:1**. All pass 4.5:1.

**The dark mode is the same book read by lamplight.** Not an inversion — the page is a
warm brown-black (`#17120c`), never neutral, because paper in low light goes warm and
grey paper reads as a screen. The rubric lifts to `#d9714f` since `#a33a20` on `#17120c`
is 2.82:1 and the drop cap would go muddy. The `muted` stays a tea-stained tan.

**Type.** Display `"Cormorant Garamond", Garamond, Georgia, serif` 500, tracking `0em`,
leading `1.1`. Body `"EB Garamond", Garamond, Georgia, serif` 400, tracking `0.005em`
(opened slightly, because Garamond at reading size needs air), leading `1.7`. Mono
`"Courier Prime", "Courier New", monospace` 400, tracking `0em`, leading `1.6`. Scale
ratio **1.25**. Google families: `Cormorant Garamond:wght@400;500;600`, `EB
Garamond:ital,wght@0,400;0,500;1,400`, `Courier Prime:wght@400`.

**Monospace earns its place here** for exactly one job: footnote text and citations.
Courier is the typewriter under the book — the apparatus, visibly different from the
argument. Never set body copy in it.

**The drop cap, exactly.** Cap height equals three body lines. At the default body of
20px with leading 1.7 (34px line) that is 102px, so the initial is Cormorant Garamond
500 at **154px** with `line-height: 0.66`, `#a33a20`, floated left, with a `-0.02em`
optical overhang so its stem aligns with the measure's left edge. One per page, never on
a subsection.

**Radius 2px.** Shadow `0 1px 2px rgba(36,29,20,0.10), 0 14px 32px -22px
rgba(36,29,20,0.45)` — a page lifted off the one beneath it, with real offset and a long
soft fall. Hairline `1px solid #ddd2bb`.

**Texture — laid paper.**

```css
background-image:
  repeating-linear-gradient(to bottom, rgba(36,29,20,0.030) 0 1px, transparent 1px 4px),
  radial-gradient(rgba(36,29,20,0.05) 1px, transparent 1px);
background-size: 100% 4px, 3px 3px;
```

**Motion.** Ease `cubic-bezier(0.33, 1, 0.68, 1)`, duration `640ms`. One authored
moment: the first paragraph sets itself around the initial. The three lines beside the
drop cap start flush to the measure's left edge and slide right into their wrapped
indent over 640ms, the way type settles around a set initial. Only the first paragraph
of the page gets this, and never again on scroll.

**Deviation from the source, on purpose.** The direction file has the drop cap fade in
from `opacity: 0`. The [craft floor](../brand/_lib/craft-floor.md) forbids that — the drop cap
is the paragraph's first letter, so an opacity reveal makes the word unreadable in a
screenshot, a print, or to a crawler. The letter is fully painted from the first frame
and only the wrap animates. Respect `prefers-reduced-motion`: the lines start indented.

---

## 1. Voice and writing

**Tone.** A letter written once, unhurried, by someone who has thought it through and is
not performing.

**Casing.** Sentence case throughout. The first three words of a chapter opener are set
in small caps. No title case anywhere, ever.

**Sentence rhythm.** Long and subordinate. Semicolons are permitted and used. Fragments
are banned — this voice finishes its sentences. Paragraphs run 5 to 9 sentences; a
one-line paragraph is a tell that you are writing for a feed.

**Do say.** "I have been thinking about" · "The argument runs like this" · "See note 3"
· "I was wrong about this last year" · "It took me some time to find the word for it".

**Don't say.** "content" · "assets" · "deliverables" · "TL;DR" · "skimmable" · "quick
take".

**The tell.** The footnote. A source is never a link inside a sentence; it is a
superscript number and a real note at the foot, and the numbering runs continuously
through the whole piece.

## 2. Landing page

There is no hero. The page opens the way a book opens: a 12% margin on all four sides,
the title in Cormorant Garamond 500 at 56px sentence case, a `1px #ddd2bb` rule at 40%
width beneath, then the first paragraph with its drop cap. The reader is in the prose
within two seconds.

Sections divide by a small-caps chapter opener and 96px of space. No rules between
sections, no cards, no background changes. The measure never exceeds **66 characters**
at any viewport; on wide screens the column stays put and the margins grow.

Footnotes sit at the foot of each section in Courier Prime 15px, numbered continuously
down the page. Superscript markers are `fg`, not rubric: the rubric belongs to the
initial alone.

**The carrying element:** the drop cap. One per page, three lines, rubric red.

## 3. X / Twitter avatar

The letter `P` as a Cormorant Garamond initial in rubric red `#a33a20` on `#f7f2e7`,
optically centred inside 22% margins. The counter of the P is the only negative space.
No photograph, no border, no ring.

**This is the one surface in the family that survives 48px unchanged**, because a single
letterform is exactly what an avatar wants. Two corrections only:

- Use Cormorant Garamond **600**, not 500. At 48px the 500 hairlines break up.
- Drop the paper texture. A 3px radial dot at 48px is compression noise.

Everything else holds. Do not add the surname, a ring, or a photograph.

## 4. X header and YouTube banner

2560×1440. Phone-safe area 1546×423 centred: x **507–2053**, y **509–932**.

Cream field with the laid-paper texture across the whole frame. That is the decoration.

Inside the safe area: one line of EB Garamond **italic** 400 at 64px, sentence case,
**12 words maximum**, sitting on the exact vertical centre (y=**720**) with a 15% left
inset from the safe-area edge (x=**740**). A `1px #ddd2bb` rule runs the full safe-area
width 24px below its baseline. Nothing else on the cream — no name, no handle, no
rubric.

## 5. Open Graph card

1200×630, read in feed at roughly 400×210 — **one third**. Every size on this card is
divided by three before anyone reads it, so the floor is **45px**, which lands at 15px in
the feed. A 28px excerpt renders 9.3px. That is not small text, it is texture.

Cream page with a **12% margin** on all four sides (144px left and right, 76px top and
bottom). Title flush left at a 40-character measure in Cormorant Garamond 500 at
**64px** — 21px in the feed. Beneath it, the opening paragraph at **48px** EB Garamond,
leading 1.7, **two lines maximum**, **cut off mid-sentence with no ellipsis** so the card
reads like an open book rather than a summary. 48px is 16px in the feed, and 48 × 1.7
gives 82px of leading, so two lines and the title clear the margins with room left. A
footnote marker `1` in Courier Prime **45px** sits in the bottom-right corner; at 24px it
renders 8px and is a speck.

**Drop for the shrink:** the drop cap. At 400px wide a three-line initial eats a third
of the card and the excerpt stops being readable. The rubric leaves the OG card
entirely, and the footnote marker is the only mark. **When the excerpt will not fit in
two lines at 48px, cut the excerpt. Never cut the size** — that is the move that put 28px
on this card in the first place.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop. Keep the leftmost
**300px** and the bottom **80px** clear.

The laid-paper texture runs the full frame. One line of EB Garamond italic 400 at 34px,
sentence case, **12 words maximum**, on the exact vertical centre (y=**198**) starting
at x=**360**. A `1px #ddd2bb` rule runs from x=360 to x=1500, 24px below the baseline.
Nothing else on the cream, and nothing in the bottom 80px.

## 7. LinkedIn post image

1200×627. LinkedIn is the most conservative room this brand enters, and manuscript is
the direction most likely to be misread there — a Garamond page in a feed of sans-serif
carousels can look like a poem, and a poem does not get read at work.

**Dial it up in structure, not in volume.** Keep the palette and the type untouched;
change what is on the card.

- Add a Courier Prime caps label at the top-left, 20px, `0.08em` tracking, 3 words
  maximum: `ESSAY 14` or `ON WRITING`. It gives the reader a category in half a second,
  which is all LinkedIn gives you.
- Set the pull quote in Cormorant Garamond 500 at **52px** rather than running body
  prose. Maximum 20 words.
- Keep the drop cap here — at 1200×627 in-feed the card is wider relative to its text
  than the OG card, so a three-line initial reads as craft, not clutter.
- Attribute at the bottom-left in EB Garamond italic 22px: your name, then the piece
  title.

Never add a photograph, a border, or a call to action button graphic.

## 8. Instagram carousel

1080×1350. Margins **130px** (12%) on all sides. Laid-paper texture on every slide.
Footnote numbering runs continuously across the whole carousel, so slide 4 can carry
note 6.

**Cover slide.** Title in Cormorant Garamond 500 at **88px**, sentence case, **7 words
maximum**, flush left on the upper-third baseline (y=**450**), opened by a three-line
rubric initial: Cormorant Garamond 500 at **340px**, `line-height: 0.66`, `#a33a20`.
Below the title a `1px #ddd2bb` rule at 40% of the measure. Under that, the essay number
in Courier Prime 26px: `no. 14`. Never a face.

**Swipe cue.** A superscript `1` in Courier Prime 26px in the bottom-right corner, and a
`1px #ddd2bb` rule running the last 200px to the right edge beneath it. A footnote
marker with no note on this page means the note is overleaf. It is the quietest swipe
cue in the system and it is deliberate.

**Interior slide.** One paragraph of EB Garamond 400 at **30px**, leading 1.7, at a
66-character measure — at 820px of usable width that lands on 66 characters exactly.
Maximum 14 lines. No drop cap after the cover. A subhead in small-caps EB Garamond at
26px, `0.08em` tracking, is allowed once. Footnotes for that slide sit at the foot in
Courier Prime 20px, above the bottom margin, separated by a `1px #ddd2bb` rule at 30%
width.

**End card.** The ask is to read the whole thing, not to follow. Cream, a three-line
rubric initial opening one sentence in Cormorant Garamond 500 at 64px: "The full essay
runs to four thousand words." Beneath it the URL in Courier Prime 26px, and the final
footnote of the sequence.

**Do not let this collide with [vellum](../brand/vellum/SKILL.md).** manuscript is a bound
book: an initial, a measure, numbered notes. A slide with no initial, no measure
discipline and no note is not manuscript — it is warm paper, and vellum owns that.

## 9. YouTube thumbnail

1280×720, designed for the **~210px wide** version.

Cream field. Title in Cormorant Garamond 500, sentence case, **7 words maximum**,
centred horizontally but sitting on the upper-third baseline, at **110px**, opened by a
three-line red initial at **200px**. Below it an `8px` `#ddd2bb` rule at 40% width,
centred — the sidebar render is 210 of 1280, so **every dimension here divides by 6.1**.
A 1px hairline is 0.16px and the 2px rule this surface used to carry is 0.33px; neither
exists. 8px lands at 1.3px and is the thinnest mark the surface can hold. Then the essay
number in Courier Prime **88px**: `no. 14`, which renders 14px — at 44px it renders 7px
and cannot be read. Never a face.

**The recognisability rule:** the rubric initial is always the largest object in the
frame and always sits left of the title's first line. Only the letter and the words
change. At 210px wide it reads as a red capital on cream before any word is legible, and
that is the recognition.

## 10. YouTube edit style

**Cut rhythm.** Slow, and slower than feels comfortable. Hold 8–14 seconds. A cut lands
at the end of a paragraph of speech, never at the end of a sentence. This is the
direction that trusts the viewer to stay.

**Titles and lower thirds.** On a 1920×1080 frame, the lower third sits at x=**230**,
y=**860**: name in EB Garamond italic 44px, a `1px #ddd2bb` rule beneath at 320px wide,
then the role in Courier Prime 24px. In: the rule draws left to right over 640ms with
`cubic-bezier(0.33, 1, 0.68, 1)` and the type is already there. Out: the rule retracts
the same way. Hold 6 seconds.

**B-roll.** Warm the grade — lift the blacks to `#241d14`, push 6% toward amber, hold
saturation at 80%. Add 3% grain. Speed 92%, a barely perceptible drag, and no other
ramps.

**Transitions.** One only: a **16-frame cross-dissolve**. manuscript is the single
direction in this family permitted a dissolve, because a page turn is a dissolve. No
cuts to black, no wipes, no whips.

**The cold open.** Three seconds: a static cream frame, the rubric initial and the first
six words of the essay already set, held in silence while the wrap settles. Voice starts
on the seventh word. No music until the first cut.

## 11. Podcast cover

3000×3000, shown at 150px. At 5% scale the paper texture, the rule and the essay number
are all gone. Simplify to the one mark that is legible.

- A single rubric `P` in Cormorant Garamond 600 at **1900px** cap height, `#a33a20` on
  `#f7f2e7`, optically centred with the counter as the only negative space.
- The show title beneath it in Cormorant Garamond 500 at **240px**, sentence case, **3
  words maximum**, centred, 300px above the bottom edge.
- Nothing else. No texture, no rule, no host name, no episode count.

At 150px this resolves to a red letterform on cream with a word under it, which is
readable and unmistakable.

## 12. Deck and talks

16:9, read from the back of a room.

**Title slide.** Talk title in Cormorant Garamond 500 at 130px, sentence case, maximum 8
words, opened by a three-line rubric initial at 300px. A `2px` rule at 40% width
beneath. Date in Courier Prime 26px, bottom-left.

**Section divider.** The first three words of the section in small-caps EB Garamond at
60px, `0.08em` tracking, on the vertical centre. No initial, no rule, nothing else.

**Data slide.** manuscript is bad at data and should admit it. One number, set in
Cormorant Garamond 500 at 220px, with a single sentence of prose beneath it at 34px
explaining what it counts, and a footnote in Courier Prime 20px giving the source. If
the talk needs three charts, use [annual](../brand-annual/SKILL.md) for the deck and keep
manuscript for the writing.

**Slides with a lot of words.** Prose slides only — **no bullets, ever**. One paragraph
per slide at a 66-character measure in the left two-thirds. Citations sit at the foot of
the slide in Courier Prime 20px, numbered continuously across the whole deck. If the
paragraph will not fit at 34px, it becomes two slides.

---

## Cost to run

**Expensive. The most expensive direction in the editorial family.**

The design is not the cost. Every asset needs real prose: manuscript has no template
that works with three words in it, and a drop cap on a two-sentence post is a costume. A
carousel needs roughly 900 words written first, then hand-set — the initial needs
optical alignment per letter (a `P` and a `W` do not hang the same) and the footnote
numbering has to hold across slides.

Budget 90 minutes per carousel and 20 minutes per single card. **This is viable at one
long piece a fortnight and not viable daily.** If you post daily, run manuscript for the
essays only and put a cheaper direction — [swiss](../brand/swiss/SKILL.md) or
[dispatch](../brand-dispatch/SKILL.md) — on the daily work.

## Pairs with / clashes with

**Pairs with [broadsheet](../brand-broadsheet/SKILL.md)** — the same paper, different tempo.
broadsheet files the reported piece, manuscript writes the considered one. Keep the
split visible: broadsheet always carries a dateline, manuscript never does.

**Pairs with [plaque](../brand/plaque/SKILL.md)** — both defer to the work. A manuscript essay
about a body of work, with plaque captioning the work itself, is a coherent two-surface
kit.

**Clashes with [vellum](../brand/vellum/SKILL.md)** — the closest collision in the whole set.
Both are warm paper. Running both reads as one direction executed twice with different
fonts. Choose: manuscript is a bound book with an initial and notes; vellum is material
and light. Never both in one kit.

**Clashes with [swiss](../brand/swiss/SKILL.md)** — the grid makes the drop cap look
apologetic, and the drop cap makes the grid look inhuman. Opposite reading speeds.

**Clashes with [terminal](../brand/terminal/SKILL.md) and [arcade](../brand-arcade/SKILL.md)** —
both are machines, and manuscript's claim is that a person sat with this for a while.

## The failure mode

**It becomes a wedding invitation.** Centred Garamond, a flourish, generous margins and
nothing to read. The direction is not "elegant serif"; it is a reading system, and the
system is the measure, the initial and the notes. Set 20 words in Cormorant, centre
them, and you have made stationery.

The second failure is **fake apparatus** — a footnote that adds nothing, added because
the direction expects one. A note must carry a source or a real aside; if it does not,
delete it and let the paragraph carry the claim. Readers who use footnotes will check
yours, and an empty one costs more trust than no notes at all.

The third is **the drop cap on short copy**. Three lines of initial over a two-line
paragraph is a hat larger than the head. If the piece is under 300 words, drop the
initial and use the rule and the note instead.
