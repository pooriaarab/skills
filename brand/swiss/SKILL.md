---
name: swiss
description: "Use when strong content needs organising rather than selling: systems, indexes, pricing tables, documentation, changelogs, a portfolio index. A visible twelve-column grid, flush left and ragged right, and exactly one red element per surface. Reach for this over broadsheet when the content is a structure rather than prose, and over annual when there is no number to report. Triggers: 'swiss design', 'international typographic style', 'grid system', 'clean and cold', 'Helvetica-ish brand', 'organise my pricing page', 'make my docs look designed'."
---

# swiss

> a twelve-column grid, one red, and the nerve to leave the rest empty.

Everything is flush left and ragged right, hung on a visible twelve-column grid, and
exactly one element on any surface is allowed to be the red. Exact, cold, confident.

**Use when** the content is already strong and needs organising, not selling. Systems,
indexes, pricing, documentation.

**Avoid when** you need warmth, or a photograph of a person has to carry the page.

**Native mode:** light. **Family:** editorial. Router:
[brand-router](../brand-router/SKILL.md). Contract: [the twelve
surfaces](../_lib/surfaces.md) and [the craft floor](../_lib/craft-floor.md).

---

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| bg | `#ffffff` | `#0a0a0a` |
| surface | `#f2f2f2` | `#161616` |
| fg | `#111111` | `#f2f2f2` |
| muted | `#5c5555` | `#a09a9a` |
| border | `#d8d4d4` | `#282424` |
| accent (the red) | `#c8102e` | `#ff4438` |
| accentFg | `#ffffff` | `#0a0a0a` |

Verified contrast: light `fg`/`bg` **18.88:1**, `muted`/`bg` **7.28:1**, `accent`/`bg`
**5.88:1**, white on accent **5.88:1**. Dark `fg`/`bg` **17.68:1**, `muted`/`bg`
**7.15:1**, `accent`/`bg` **5.78:1**. All pass 4.5:1.

**The dark mode is the same poster under gallery lighting.** Not an inversion — the
grid, the flush-left setting and the single red module are unchanged. The red moves to
`#ff4438` because `#c8102e` on `#0a0a0a` is 3.37:1 and reads brown. The `muted` grey
stays warm-tinted (`#a09a9a`), never a neutral `#999`.

**Type.** One family does display and body: `"Archivo", Helvetica, Arial, sans-serif`.
Display 700, tracking `-0.035em`, leading `0.98`. Body 400, tracking `-0.005em`, leading
`1.5`. Mono `"Roboto Mono", ui-monospace, monospace` 400, tracking `0em`, leading `1.5`.
Scale ratio **1.5** — the jumps are large on purpose, because the grid does the fine
work. Google families: `Archivo:wght@400;500;600;700`, `Roboto Mono:wght@400;500`.

Tracking `-0.035em` on the display is close to the `-0.04em` floor. Do not go tighter at
any size, and do not carry display tracking down onto body copy.

**Radius 0. Shadow: none.** Hairline `1px solid #111111` — a full pixel, not a half,
because this direction is a printed poster and its rules are ruled.

**Texture — the grid itself.**

```css
background-image: linear-gradient(to right, rgba(17,17,17,0.07) 0 1px, transparent 1px);
background-size: calc(100% / 12) 100%;
background-position: 0 0;
```

The grid is visible at 7%. It is not a guide layer you hide before export. If a viewer
cannot see the twelve columns, they cannot see the discipline.

**Motion.** Ease `cubic-bezier(0.2, 0, 0, 1)`, duration `240ms`. One authored moment:
the single red square travels exactly one grid module — one twelfth of the measure —
from left to right and stops hard against the module edge. Once, on load. It is a change
of position and nothing else: no fade, no scale, no overshoot. Animate `transform:
translateX()`; the square is already visible at its start module, so a screenshot loses
nothing. Respect `prefers-reduced-motion`: the square starts at its destination.

---

## 1. Voice and writing

**Tone.** A specification. Statements of fact in the present tense, no transition
sentences, no warm-up paragraph.

**Casing.** Sentence case everywhere. Never title case. Full caps only in the mono
labels, at 11px with `0.06em` tracking.

**Sentence rhythm.** Short. Fragments are not only allowed, they are the house form.
"Three parts." is a complete thought and a complete paragraph. Never open with context;
open with the fact and let the reader supply the frame.

**Do say.** "Three parts." · "This is the price." · "Figure 4." · "It does not do this."
· "Two of these are the same thing."

**Don't say.** "journey" · "storytelling" · "beautifully crafted" · "delightful" ·
"elevate" · "sprinkle in".

**The tell.** Numbered enumeration in the first line. The paragraph announces how many
things it contains before it names any of them.

## 2. Landing page

The hero is a headline and nothing else. Archivo 700 at 96px, tracking `-0.035em`,
leading 0.98, sentence case, flush left, starting **one module in and one module down**,
occupying the left seven of twelve columns. The right five columns stay empty. No image,
no button in the hero, no subhead.

Sections divide by a **module of empty space**, never by a rule and never by a card. One
blank grid module between blocks; two before a new part.

Whitespace is the right five columns. It is not slack — it is where the grid proves
itself. Resist filling it on every subsequent revision.

**The carrying element:** the single red module. One `#c8102e` square of exactly
`100%/12` width, and one only, per page. It marks the one action or the one figure that
matters. Everything else is `#111111` on `#ffffff`.

## 3. X / Twitter avatar

Flat `#ffffff` square. `PA` in Archivo 700 sits flush to the optical left and to the
baseline of the lower third, filling 40% of the square width. One `#c8102e` square,
exactly one twelfth of the square's width, sits hard in the top-right corner. No
photograph.

**At 48px this mostly survives, with one correction.** One twelfth of 48px is 4px — a
red dot that reads as a notification badge, which is a meaning you do not want. Export a
48px variant:

- Red square becomes **one sixth** (8px), still hard to the top-right corner.
- `PA` fills **52%** of the width, weight 700, tracking `-0.02em` (loosened from
  `-0.035em`, because at 25px the letters touch).
- Margins drop from one module to 4px.
- The grid texture is removed. At 48px a 7% 1px line is invisible and only adds
  compression noise.

Ship the module version at 400px, the one-sixth version as the 48px file.

## 4. X header and YouTube banner

2560×1440. Phone-safe area 1546×423 centred: x **507–2053**, y **509–932**. The grid
module across the full 2560 width is **213.3px**.

Field `#ffffff` with the twelve-column texture running the whole frame — that is the
decoration outside the safe area, and it is enough.

Inside the safe area: one `#c8102e` bar **12px** tall runs the full 1546 width of the
safe area at its lower third (y=**790**). The name sits above it in Archivo 700 at 96px,
flush left, one module (213px) from the safe-area left edge — so x=**720**. The right
half of the safe area stays empty. No tagline, no handle.

## 5. Open Graph card

1200×630, read in feed at roughly 400×210. Module width **100px**.

White. Left seven modules (x=100 to x=800) hold the headline: Archivo 700 at **72px**, 8
words maximum, sentence case, flush left, hard ragged right — never justified, never
centred, never hyphenated. Right five modules empty except one `#c8102e` square of
exactly one module (100×100) in the bottom-right, flush to the margin. URL in Roboto
Mono **28px** on the bottom-left baseline.

**Drop for the shrink:** the grid texture (7% of a 1px line disappears at 400px wide and
only softens the JPEG), any subhead, and any mono label under 28px.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop. Keep the leftmost
**300px** and the bottom **80px** clear. Module width **132px**.

The grid texture runs the full frame, unchanged. The photo sitting on it is fine — a
grid is a field, not a message.

One `#c8102e` bar 12px tall runs from x=**360** to x=**1452** at y=**250**. The name
sits above it in Archivo 700 at 56px, flush left at x=**360**. The right third (x>1050)
stays empty. Nothing in the bottom 80px.

## 7. LinkedIn post image

1200×627. LinkedIn is the most conservative context this brand enters, and swiss is
already the most conservative direction in the family. **Do not dial it down. Dial it up
by one step**, because the risk here is not offence, it is invisibility in a feed of
stock photography.

- Headline at **80px** rather than 72, still in the left seven modules.
- Red square goes from one module to **one and a half** (150×150), still bottom right.
- Add one mono label at the top-left in Roboto Mono caps 22px, `0.06em` tracking: the
  category, 2 words maximum, e.g. `PRICING` or `FIGURE 4`.

Never add a photograph of yourself, a logo row, or a "swipe" arrow. The red square
already says there is a point.

## 8. Instagram carousel

1080×1350. **Module = 90px.** Margins are exactly one module: content spans x=90 to
x=990. The grid texture runs on every slide.

**Cover slide.** Headline starts one module in and one module down (x=90, y=90), Archivo
700 at **120px**, tracking `-0.035em`, leading 0.98, **5 words maximum**, over three
lines with a hard ragged right. The headline occupies modules 2 through 8. Modules 9 to
12 stay empty. A `#111111` bar 16px tall and one module wide sits directly under the
last line, 36px below the baseline.

**The bar is ink, not red, and that is how the one-red rule resolves on this surface.**
The cover spends its single red on the swipe cue below, because the clipped module is the
mark that recurs on the avatar, the Open Graph card, the end card and the podcast cover —
it is the one that has to stay red. A red bar as well would put two reds on one cover,
the eye would have to choose between them, and the end card's claim to be "the second and
last red in the carousel" would already be false on slide one.

**Swipe cue.** A `#c8102e` square of exactly one module (90×90) sits at the vertical
centre and is **bled off the right edge** — 45px of it visible, 45px clipped. A clipped
module is the grid saying the page continues. Nothing else on the cover moves or points.

**Interior slide.** A Roboto Mono caps label top-left at x=90, y=90, 11px scaled to
**22px** here, `0.06em` tracking, reading `03 / 07`. Body in Archivo 400 at **26px**,
leading 1.5, occupying modules 2 through 10 (x=90 to x=900) — that is 62 characters, so
the measure holds. Maximum 12 lines. Flush left, ragged right. One subhead in Archivo
700 at 44px is allowed per interior slide. **No red on any interior slide.**

**End card.** The ask is one line. Archivo 700 at 64px in modules 2 through 8, maximum 7
words: "The index is at pooria.dev." Under it, the URL in Roboto Mono 28px. The red
appears here as one full module square (90×90) in the bottom-right corner — the second
and last red in the carousel.

**Why this does not look like [broadsheet](../broadsheet/SKILL.md):** pure white against
cream, a grotesque against a Baskerville, a visible twelve-column grid against column
rules, one red module against a red kicker line, and no dateline anywhere. Set the two
covers side by side and nobody has to be told.

## 9. YouTube thumbnail

1280×720, designed for the **~210px wide** version. Module **106.7px**.

White field. The headline starts one module in and one module down, Archivo 700 at
**150px**, **5 words maximum**, over three lines with a hard ragged right — never
justified, never centred. The right four of the twelve columns stay empty. A red bar
**20px** tall and one module wide sits directly under the last line. (The source spec
says 8px; at 210px wide that is 1.3px and it disappears, so the bar thickens for this
surface only.)

**The recognisability rule:** the headline always starts at the same module origin and
the red bar always sits under the last line. What changes is the words and the line
breaks. Every thumbnail is the same grid with different content, which is exactly what a
system looks like from the outside.

No face. If the video needs a face, this is the wrong direction for that video.

## 10. YouTube edit style

**Cut rhythm.** Metronomic. Hold a shot 3 seconds or 6 seconds, nothing between. A cut
lands on the end of a statement. Never cut mid-sentence to compress — rewrite the
sentence instead.

**Titles and lower thirds.** On a 1920×1080 frame the module is 160px. The lower third
sits at x=**160**, y=**820**: a Roboto Mono caps label at 24px, then the name in Archivo
700 at 52px, flush left, on a flat `#ffffff` plate with zero radius and no shadow. In:
the plate translates **one module (160px) left to right** over 240ms with
`cubic-bezier(0.2, 0, 0, 1)` and stops hard. Out: it cuts. Never fade a title in this
direction.

**B-roll.** Full desaturation is wrong; keep 100% colour but crush the whites to
`#ffffff` and the blacks to `#111111`. No grain. Speed 100%, no ramps.

**Transitions.** One only: the **hard cut**. Every other transition is banned, including
the dip to white. The red bar wiping across the frame at a section break is permitted
once per video and is the only motion that is not a cut.

**The cold open.** Three seconds: white frame, the headline already set at its module
origin, the red square translates one module and stops, hard cut to the first shot. No
voice over the white. The stop is the beat.

## 11. Podcast cover

3000×3000, shown at 150px. At 5% scale a 1px grid line, a mono label and any body copy
are all gone. Module **250px**.

Keep three things: the white field, the type at the module origin, and one red square.

- Show title in Archivo 700 at **420px**, tracking `-0.035em`, sentence case, **3 words
  maximum**, over two lines, starting at x=250, y=250.
- A `#c8102e` square of exactly one module (250×250) hard in the bottom-right, 250px
  from each edge.
- Nothing else. No grid texture, no host name, no episode count, no border.

At 150px that resolves to a black wordmark top-left and a red 12px square bottom-right,
which is legible and unmistakable in a wall of covers.

## 12. Deck and talks

16:9, read from the back of a room. On 1920×1080 the module is **160px**, and every
slide uses it with a fixed **two-module top margin** (320px).

**Title slide.** Talk title in Archivo 700 at 140px in the left seven columns, sentence
case, maximum 8 words. Name in Roboto Mono 28px on the bottom-left baseline. Right five
columns empty.

**Section divider.** A Roboto Mono caps label at 32px giving the part number (`PART 2`),
then the section name in Archivo 700 at 110px. Nothing else.

**Data slide.** One chart, `#111111` on `#ffffff`, bars or a line, no gridlines, no
legend, no axis titles. Series are labelled at the end of the line in Archivo 400 at
24px. The one figure that matters gets the red. Never a pie, never a gradient fill.

**Slides with a lot of words.** One idea per slide, headline in the left seven columns,
and if the words do not fit, it is two slides. Never shrink type to fit. **The red is
permitted on exactly one slide in the deck: the ask.**

---

## Cost to run

**Cheap — the cheapest in the editorial family.** One type family, one accent, zero
photography, zero illustration, no texture to source. Once the grid is a component, a
carousel is fifteen minutes and a thumbnail is five.

The real cost is restraint, and it is not billable. Every week there is a reason to add
a second colour, a photograph or a second red. The direction survives exactly as long as
you keep saying no, and it dies quietly the first time you do not.

## Pairs with / clashes with

**Pairs with [spec](../spec/SKILL.md)** — both are the same argument, one made as a
poster and one made as a document. Run swiss for the index and spec for the detail page
and they read as one system.

**Pairs with [annual](../annual/SKILL.md)** — swiss organises, annual reports. An annual
data slide drops into a swiss deck with only a palette swap, because both are
grid-native and both refuse decoration.

**Pairs with [blueprint](../blueprint/SKILL.md)** — a shared belief that a drawing is
more honest than a picture, and neither needs warmth to be trusted.

**Clashes with [manuscript](../manuscript/SKILL.md)** — a Garamond drop cap has no place
on a twelve-column grid, and the grid makes the drop cap look apologetic. These two want
opposite reading speeds.

**Clashes with [aurora](../aurora/SKILL.md)** — a gradient destroys a flat field. swiss
depends on the field being one value so that one red can carry meaning. Introduce
atmosphere and the red is just another colour.

**Careful next to [plaque](../plaque/SKILL.md)** — both claim restraint, so running them
together reads as indecision rather than range. swiss's red breaks plaque's silence;
plaque's charcoal mutes swiss's grid.

## The failure mode

**It becomes a 2014 startup slide with a red rectangle on it.** That happens the moment
the grid stops being visible. The whole direction is a claim that the structure is
deliberate, and the only evidence is that you can see the twelve columns. Hide the grid
and you are left with Helvetica-ish type, left-aligned, which is not a direction — it is
the absence of one.

The second failure is **two reds**. The single red module is a semantic device: it means
"this is the one thing". A second red turns it into a brand colour, which means nothing,
and there is no way back.

The third is **filling the empty columns**. The right five columns are the argument.
Every revision will want to put something there — a testimonial, a logo row, a second
CTA. Each addition is individually reasonable, and after four of them the page is a
normal page.
