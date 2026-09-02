---
name: brand-annual
description: "Use when the reader wants the number and where it came from: investor updates, results, a track record, revenue posts, a year in review, anything with a table or a chart in it. Navy institutional, tabular figures, ruled tables, a 6px bleed strip as the section index. Reach for this over swiss when there is real data rather than structure, and over broadsheet when the piece reports figures rather than events. Triggers: 'investor update', 'year in review', 'annual report look', 'my revenue numbers post', 'make my metrics look credible', 'financial brand', 'data-heavy deck'."
---

# annual

> an annual report someone actually designed. the numbers are the ornament.

Every figure is tabular and right-aligned in a ruled table, and the only decoration is a
6px navy bleed strip running down the outer edge as a section index. Institutional,
assured, legible.

**Use when** the surface is an investor update, results, or a track record. The reader
wants the number and where it came from.

**Avoid when** the audience is a community, or the message is aspirational — this
direction makes optimism sound like a filing.

**Native mode:** light. **Family:** editorial. Router:
[brand-router](../brand/brand-router/SKILL.md). Contract: [the twelve
surfaces](../brand/_lib/surfaces.md) and [the craft floor](../brand/_lib/craft-floor.md).

---

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| bg | `#f7f8fa` | `#0b1220` |
| surface | `#ffffff` | `#131c2e` |
| fg | `#10161f` | `#e6ebf3` |
| muted | `#4c586b` | `#97a5ba` |
| border | `#d5dae2` | `#1f2b41` |
| accent (navy) | `#16305c` | `#6f9fdc` |
| accentFg | `#f7f8fa` | `#0b1220` |
| alt (comparison series) | `#7d8fa8` | `#6e8099` |
| alt2 (the one gold mark) | `#a8842c` | `#c9a24d` |

Verified contrast: light `fg`/`bg` **17.09:1**, `muted`/`bg` **6.78:1**, `accent`/`bg`
**12.26:1**, `accentFg` on accent **12.26:1**. Dark `fg`/`bg` **15.64:1**, `muted`/`bg`
**7.50:1**, `accent`/`bg` **6.84:1**.

**A hard limit on `alt` and `alt2` in light mode.** `alt` is **3.10:1** against `bg` and
`alt2` is **3.29:1**. Both clear the 3:1 floor for non-text graphical objects and both
**fail 4.5:1 for text**. So in light mode they are **fills only** — bars, line strokes,
a marked table row's tint — and every label sits in `fg` or `muted`. In dark mode `alt`
is 4.65:1 and `alt2` is 7.81:1, so text in either is allowed there. Do not carry a
light-mode habit into dark or the reverse.

**The dark mode is the same report read on a trading desk at night**, not an inverted
PDF. The navy lifts to `#6f9fdc` because `#16305c` on `#0b1220` is 1.44:1 — a navy bar on
a navy field is nothing. The gold warms to `#c9a24d` and keeps its job: one mark, one
place.

**Type.** Display `"IBM Plex Sans", Helvetica, Arial, sans-serif` 600, tracking
`-0.02em`, leading `1.08`. Body same family 400, tracking `0em`, leading `1.55`. Mono
`"IBM Plex Mono", ui-monospace, monospace` **500**, tracking `0em`, leading `1.4`. Scale
ratio **1.333**. Google families: `IBM Plex Sans:wght@400;500;600`, `IBM Plex
Mono:wght@400;500`.

**Monospace earns its place here** because every figure is tabular. Set all numerals
with `font-variant-numeric: tabular-nums` so columns align on the decimal and no digit
shifts width. Never set body prose in mono.

**Radius 3px.** Shadow `0 1px 2px rgba(16,22,31,0.07), 0 12px 30px -22px
rgba(16,22,31,0.45)` — real offset and blur, the lift of a bound report on a desk.
Hairline `1px solid #d5dae2`.

**Texture — the bleed strip.**

```css
background-image: linear-gradient(to right, rgba(22,48,92,0.14) 0 6px, transparent 6px);
background-repeat: no-repeat;
background-size: 100% 100%;
```

The strip is a **section index**, not a border. It runs the full height of the outer
edge and shifts position by section, so a reader flipping through sees where they are.

**Motion.** Ease `cubic-bezier(0.16, 1, 0.3, 1)`, duration `900ms`. One authored moment:
one figure counts. The headline number rolls from zero to its value over 900ms in
tabular figures, so no digit ever shifts sideways while it runs and the decimal point
stays nailed in place. Every other number on the page is already at rest when the page
paints.

**Build it as an odometer, not a text swap.** The [craft floor](../brand/_lib/craft-floor.md)
requires motion from an already-visible resting state, so the DOM holds the **final**
figure from the first frame and the roll is a `transform: translateY()` on an
`aria-hidden` digit strip above it. A number that reads `0` in a screenshot or to a
crawler is a wrong number. Respect `prefers-reduced-motion`: no roll.

---

## Chart rules

Data is this direction's premise, so the chart spec is part of the brand. It applies on
every surface below.

- **Two series maximum**: `accent` and `alt`. A third series means the chart is two
  charts.
- **`alt2` gold marks exactly one thing per artifact** — one row, one bar, one point.
  Never two.
- **No gridlines, no legend box.** Label each series at the end of its last bar or line
  in IBM Plex Sans 500, in `fg` or `muted`. One baseline only: `1px #d5dae2` — no top
  axis, no right axis, no frame.
- **Bars** occupy 60% of the category step, leaving a 40% gap. Square corners.
- **Lines** are 2.5px, no markers except a 4px filled circle on the final point.
- **Y axis**: three tick labels maximum — baseline, mid, top — in `muted` mono caps.
- **Tables**: `1px #d5dae2` rules **between rows only** — never around them, never
  vertical, no zebra. Label left in body, figure right-aligned in tabular mono.
- **Banned outright**: pie, donut, 3D, gradient fill, shadow on a bar, a second accent,
  and any axis that does not start at zero.

---

## 1. Voice and writing

**Tone.** A results letter: the number, the period it covers, the comparison, and what
changed. No adjective in front of a figure.

**Casing.** Sentence case for headings. Section labels in full-caps mono at 11px with
`0.08em` tracking. **Figures are never spelled out** — `3`, not `three`.

**Sentence rhythm.** Medium and flat. Every sentence with a number in it names the
period the number covers. Fragments are allowed only as table labels.

**Do say.** "Up 31% year over year" · "As of 31 December" · "Restated for comparability"
· "The comparison period was 11 months, not 12" · "Source: Stripe, exported 4 January".

**Don't say.** "moonshot" · "disrupt" · "10x" · "rocketship" · "crushing it" · "insane
growth".

**The tell.** The comparison clause. No figure appears alone; it always arrives with
what it is being measured against and over what period.

## 2. Landing page

The hero is a table. Title top-left in IBM Plex Sans 600 at 56px, sentence case, 10
words maximum, then a three-row ruled table: label left in body, figure right-aligned in
tabular mono at 40px. The **one** figure that counts carries the odometer.

Sections divide by a caps-mono label at 11px, `0.08em` tracking, with 72px of space
above it. The 6px navy strip runs down the left edge and its position marks the section.
Whitespace goes above section labels and inside table rows (20px vertical padding),
nowhere else — this direction fills its measure, because it is a document.

**The carrying element:** the ruled table with right-aligned tabular figures.

## 3. X / Twitter avatar

Flat `#16305c` square. `PA` in IBM Plex Sans 600, `#f7f8fa`, optically centred with cap
height at 44% of the square. A `1px #f7f8fa` rule sits 18% up from the bottom, running
from the left edge to 62% of the width. No photograph.

**At 48px this nearly survives.** The letterforms are fine — 44% of 48px is 21px of cap
height at 12.26:1. The 1px rule is the failure: at 48px it is one pale pixel that JPEG
turns into a smear. Export a 48px variant:

- Rule thickens to **2px** and shortens to **50%** of the width, still 18% up from the
  bottom.
- `PA` tracking loosens from `-0.02em` to `0em`. At 21px the tight pair collides.
- Everything else unchanged. The navy field is the recognition, and a flat field
  survives any downsample.

## 4. X header and YouTube banner

2560×1440. Phone-safe area 1546×423 centred: x **507–2053**, y **509–932**.

Cool white `#f7f8fa` with the **6px navy bleed strip down the left edge of the full 2560
frame** — that is the decoration outside the safe area, and it is enough.

Inside the safe area: three figures spaced evenly across the 1546px width, each a
tabular number in IBM Plex Mono 500 at **96px** navy over a caps-mono label at **28px**
in `muted`, **3 words maximum**. Name flush right in IBM Plex Sans 600 at 40px on the
safe area's bottom baseline. **No chart** — at this aspect ratio a chart is a stripe.

## 5. Open Graph card

1200×630, read in feed at roughly 400×210. Nothing under 28px survives.

Cool white. Title top-left at **44px**, 10 words maximum, sentence case, 64px from the
left and top. Beneath it a three-row ruled table: label left in IBM Plex Sans 400 at
**30px**, figure right-aligned in tabular mono at **48px**, with `1px #d5dae2` rules
**between rows only** and never around them. The 6px navy bleed strip runs the full
height of the left edge. Period covered in the bottom-right in caps mono at **28px**.

**Drop for the shrink:** any chart, any fourth row, and the source line. At 400px wide a
chart is 130px of grey.

## 6. LinkedIn banner

1584×396. Profile photo covers the lower-left on desktop. Keep the leftmost **300px**
and the bottom **80px** clear.

Cool white with the navy strip down the left edge. It sits behind the photo, which is
fine: it is an index mark, not a message.

Three figures spaced evenly from x=**360** to x=**1500**, each a tabular number in mono
500 at **56px** navy over a caps-mono label at **18px** in `muted`, 3 words maximum.
Name flush right in IBM Plex Sans 600 at 28px, above the 80px dead zone. No chart.

## 7. LinkedIn post image

1200×627. LinkedIn is the most conservative room this brand enters, and **annual is the
direction that was built for that room**. It needs no dialling down at all. A navy ruled
table in a LinkedIn feed reads as the only post on the page that checked its own
arithmetic.

Dial it up in one place only: **the chart earns its slot here**, because LinkedIn
readers stop for a number.

- Title top-left at 44px, 10 words maximum.
- Left half: a three-row ruled table, figures right-aligned in tabular mono at 48px.
- Right half: one chart per the chart rules — two series, no gridlines, no legend,
  series labelled at the end.
- One bar carries `alt2` gold, exactly one. Source bottom-right in caps mono 24px —
  `SOURCE: STRIPE, 4 JAN`. Not optional here: it is the reason the post works.

## 8. Instagram carousel

1080×1350. Margins **80px**. The 6px bleed strip becomes **12px** at this scale and runs
the full height of the left edge on every slide, shifting nothing — here it marks the
sequence, not the section.

**Cover slide.** One figure is the subject. The number in IBM Plex Mono 500 tabular at
**340px** (about 25% of the frame height), navy `#16305c`, flush left, sitting on the
vertical centre. Its label sits beneath in caps mono at **44px**, `0.08em` tracking, **4
words maximum**. Above the number, a caps-mono period line at 32px in `muted`: `Q4
2026`. No chart on the cover — the number already said it. No face.

**Swipe cue.** A second, dimmer figure in `alt` `#7d8fa8` at 340px is **bled off the
right edge**, with about 90px of its first digit visible. The next number in the series
is literally already on screen and cut off. (In light mode that figure is a fill, not
text — set it as an image or with `aria-hidden`, since `alt` is 3.10:1 and would fail as
text.)

**Interior slide — the chart slide.** This is the one that has to work.

- Caps-mono label top-left at 32px: what is being measured, 4 words maximum.
- The chart occupies x=80 to x=1000, y=300 to y=1000.
- Two series maximum: navy `#16305c` bars against `alt` `#7d8fa8` for the comparison
  period. Bars at 60% of the category step.
- **No gridlines, no legend, no axis titles.** Category labels beneath the baseline in
  caps mono 26px, `muted`. Three y-tick labels maximum, in `muted` mono 26px, sitting
  inside the plot at the left.
- One `1px #d5dae2` baseline. Nothing else is ruled.
- The final bar's value is printed above it in tabular mono 40px, `fg`.
- One bar in the whole carousel is gold `#a8842c`. That is the point of the slide, and
  it is the only decoration in the direction.

**Interior slide — the table slide.** The alternative to a chart. Four rows maximum:
label left in IBM Plex Sans 400 at 36px, figure right-aligned in tabular mono at 52px,
rules between rows only. Right-alignment is non-negotiable — a left-aligned figure
column is what makes this direction look amateur instantly.

**End card.** The ask is the source, then the subscription. Cool white, one ruled
two-row table: `Source` / `Stripe, exported 4 January`, then `Full update` / the URL,
both right-aligned in tabular mono at 40px. No gold here.

## 9. YouTube thumbnail

1280×720, designed for the **~210px wide** version.

One figure is the subject. The number in IBM Plex Mono 500 tabular fills the left half
at **40% of the frame height** (288px), navy `#16305c` on `#f7f8fa`. Its label sits
beneath in caps mono at **64px**, **4 words maximum**. The right half holds one bar or
line chart with **no gridlines, no legend and no axis labels** — the number already said
it. No face.

**The recognisability rule:** a number on the left at 40% frame height, a chart on the
right, the strip on the edge. Only the figure and the chart's shape change. At 210px
wide it reads as a big navy number beside a small navy shape — unmistakable, and never
identical twice, because the data never is.

## 10. YouTube edit style

**Cut rhythm.** Even and unhurried. Hold 6–10 seconds. A cut lands after the number
*and* its comparison period have both been said. Never cut between a number and its
source.

**Titles and lower thirds.** On a 1920×1080 frame the lower third sits at x=**120**,
y=**840**: a caps-mono label at 22px in `muted`, then the figure in tabular mono 500 at
64px navy, on a `#ffffff` plate with **3px** radius and the house shadow. A 6px navy
strip runs the full height of the plate's left edge. In: the odometer rolls the figure
over 900ms with `cubic-bezier(0.16, 1, 0.3, 1)` while the plate sits still. Out: the
plate cuts. One rolling figure per video, maximum.

**B-roll.** Cool the grade — 5% toward blue, saturation 85%, blacks lifted to `#10161f`.
No grain. Speed 100%, no ramps. Dashboard screen recordings are on-brand, graded the
same way.

**Transitions.** One only: the **hard cut**. Charts animate in place instead — bars grow
from the baseline over 900ms, a transform that reads as data arriving, not as an effect.

**The cold open.** Three seconds: cool white frame, the figure already set at its final
value, the period label under it, and the bars growing from the baseline behind. The
first words spoken are the number and the period. No music.

## 11. Podcast cover

3000×3000, shown at 150px. At 5% scale the table rules, the mono labels and any chart
are gone. Simplify to the field, one figure and the strip.

- Cool white `#f7f8fa`, margins 400px.
- The **navy bleed strip becomes 90px** and runs the full height of the left edge — at
  150px that is a 4.5px navy bar, which is the recognition.
- Show title in IBM Plex Sans 600 at **380px**, sentence case, **3 words maximum**, over
  two lines, flush left.
- One tabular mono figure beneath at **240px**, navy — the episode number or the year,
  nothing else.
- No table, no chart, no gold, no host name.

## 12. Deck and talks

16:9, from the back of a room. Every slide carries the **period top-right in caps mono**
at 24px. That is the constant.

**Title slide.** Talk title in IBM Plex Sans 600 at 120px, sentence case, 8 words
maximum, flush left. The strip becomes 16px and runs the left edge. Period top-right,
date bottom-left in caps mono 24px.

**Section divider.** A caps-mono label at 32px giving the section number and name, then
one tabular figure at 200px underneath — the number that section is about. Nothing else.

**Data slide.** **One table or one chart per slide, never both.** Charts are navy on
white with a single `#7d8fa8` comparison series and no third colour. The chart rules
apply without exception. Axis labels in caps mono 22px. **The gold `#a8842c` marks
exactly one row in the whole deck.**

**Slides with a lot of words.** Convert them to a table. More than 40 words of prose
means a table nobody has built yet: label left, value or claim right, rules between
rows. If it cannot be tabulated, it belongs in the talk, not on the slide.

---

## Cost to run

**Moderate to expensive, and the cost is not design.**

The template is straightforward — one family, one navy, one strip, a table component and
a chart component. Once built, a card takes 10 minutes and a carousel takes 45.

The real cost is that **every asset needs a real, checkable number with a source.** You
cannot make an annual post about how you are feeling. If the figure is not exported and
dated, the post cannot be made, and one wrong figure does more damage than a month of
silence. Budget the time to pull and check the data, not the time to lay it out. That
also caps the frequency: annual runs well monthly or quarterly and cannot run daily,
because you do not have new numbers daily.

## Pairs with / clashes with

**Pairs with [swiss](../brand/swiss/SKILL.md)** — both grid-native, both allergic to
decoration. swiss organises the index, annual reports the results, and an annual data
slide drops into a swiss deck with only a palette swap.

**Pairs with [broadsheet](../brand-broadsheet/SKILL.md)** — a results letter set in annual
sits inside a broadsheet page without argument. Both treat a figure as something you
have to source.

**Pairs with [spec](../brand/spec/SKILL.md)** — the same institutional register, one for
numbers and one for behaviour: spec documents, annual measures.

**Lends to [plaque](../brand/plaque/SKILL.md) and [manuscript](../brand-manuscript/SKILL.md)** —
both are bad at data and both say so. Borrow the annual chart, keep the host's field
colour, change nothing else.

**Clashes with [buildspace](../brand-buildspace/SKILL.md)** — buildspace is the energy of a
thing not yet measured, which is the opposite claim.

**Clashes with [risograph](../brand/risograph/SKILL.md)** — a misregistered chart is one you
cannot read a value off, and reading the value is why this direction exists.

## The failure mode

**It becomes a filing, and nobody opens a filing.** annual's restraint is earned by the
data. Without an interesting number, the navy and the rules only make dull content look
official. This direction cannot manufacture significance; it can only frame it.

The second failure, and the fatal one, is **a number with no source**. This is the only
direction in the twenty whose entire credibility rests on being checkable. Every figure
needs a source line naming the system and the export date. One unsourced chart, once,
and every previous chart becomes a claim rather than a fact.

The third is **decoration creep in the charts**. A gridline, then a legend box, then a
third series, then a gradient on the bars — each one a default in a charting library,
and together a designed report turned back into a spreadsheet screenshot. Strip the
defaults before you plot, not after.
