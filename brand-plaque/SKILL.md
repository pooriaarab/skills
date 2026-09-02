---
name: brand-plaque
description: "Use when the work is the thing and the brand's only job is to caption it: a portfolio, an archive, a single case study, a gallery of projects. Native dark charcoal wall, type that never shouts, 18% margins, one hairline under the title. Reach for this over swiss when you want silence rather than structure, and over dusk when the mood is a gallery rather than an evening. Triggers: 'portfolio site', 'let the work speak', 'gallery wall label', 'museum caption style', 'quiet dark brand', 'archive of my projects', 'minimal dark portfolio'."
---

# plaque

> the label, not the work. it tells you what you are looking at, then stops.

A contemporary gallery wall label. Type never exceeds 15px on the web, margins never
drop below 18% of the viewport, and one 1px hairline sits under the title. The rest is
charcoal wall, on purpose. Quiet, precise, deferential.

**Use when** the surface is a portfolio, an archive, a single case study. The work is
the thing and the site's whole job is to caption it.

**Avoid when** you need to convert, announce, or persuade. **This direction has no
volume knob.**

**Native mode: dark.** **Family:** editorial. Router:
[brand-router](../brand-router/SKILL.md). Contract: [the twelve
surfaces](../brand-router/_lib/surfaces.md) and [the craft floor](../brand-router/_lib/craft-floor.md).

---

## Tokens

Dark is the authored mode. Build every surface in dark first and port to light only when
a client or a print job forces it.

| Role | **Dark (native)** | Light (port) |
| --- | --- | --- |
| bg | `#1a1a19` | `#eceae5` |
| surface | `#232322` | `#f6f5f1` |
| fg | `#e8e7e1` | `#1f1f1d` |
| muted | `#9a998f` | `#56564e` |
| border | `#2e2e2c` | `#d5d3cc` |
| accent | `#ddd9cd` | `#33332f` |
| accentFg | `#1a1a19` | `#f6f5f1` |

Verified contrast: dark `fg`/`bg` **14.06:1**, `muted`/`bg` **6.08:1**, `accent`/`bg`
**12.34:1**, `accentFg` on accent **12.34:1**. Light `fg`/`bg` **13.73:1**, `muted`/`bg`
**6.16:1**, `accent`/`bg` **10.55:1**. All pass 4.5:1.

**The accent is bone, not colour.** `#ddd9cd` is a warm off-white. plaque has no hue to
spend, so the accent is just the brightest thing permitted, used for the hairline above
a label and nothing else.

**The light mode is the same label in daylight** — a printed exhibition guide, not the
wall. Charcoal becomes warm paper `#eceae5` and the accent inverts to near-black
`#33332f`. Proportions, margins and the 15px cap do not change. If the light page looks
louder than the dark one, the port is wrong.

**Type.** Display `"Source Sans 3", "Gill Sans", Frutiger, sans-serif` 600, tracking
`-0.005em`, leading `1.3`. Body same family 400, tracking `0.01em`, leading `1.65`. Mono
`"Roboto Mono", ui-monospace, monospace` 400, tracking `0.02em`, leading `1.6`. Scale
ratio **1.125** — the smallest step in the whole system, because plaque never changes
register loudly. Google families: `Source Sans 3:ital,wght@0,400;0,600;1,400`, `Roboto
Mono:wght@400`.

**Radius 0.** Shadow `0 2px 5px rgba(0,0,0,0.30), 0 14px 30px -20px rgba(0,0,0,0.55)` —
real offset, real blur; a card standing off a wall. Hairline `1px solid #2e2e2c` for
dividers, `1px solid #ddd9cd` for the rule under a title.

**Texture — wall grain.**

```css
background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/%3E%3C/svg%3E');
background-size: 120px 120px;
opacity: 0.045;
mix-blend-mode: overlay;
```

**Motion.** Ease `cubic-bezier(0.4, 0, 0.2, 1)`, duration `700ms`. One authored moment:
the hairline under a label grows. When the cursor enters the label block, the rule
extends 24px past the right edge of the text over 700ms — slow enough that you only
catch it if you were already looking. **It never retracts**, so a page you have walked
through keeps a record of where you stopped. Animate `transform: scaleX()` from a left
origin on an already-visible rule. Respect `prefers-reduced-motion`: the rule stays at
its resting length.

**The scaling law.** plaque's 15px cap is a rule about *apparent* size, not file size.
For any off-web surface, compute:

```
title_px = 20 × (export_width / rendered_width)
mono_px  = 13 × (export_width / rendered_width)
```

Apply a hard floor of 24px so nothing dissolves under compression. Every number below is
that formula already applied. Never exceed it — overshooting the cap is the most common
way this direction is ruined.

**`export_width` is the width that is actually shown, not the width of the file.** On the
YouTube banner the phone crops to the 1546px safe area and fills its width with it, so
`export_width` is 1546. Using 2560 there doubles every size and is the standard mistake.

**The hairline law.** The same arithmetic governs the rule under the title, and it bites
harder, because a rule either lands on a pixel or it does not exist:

```
hairline_px = ceil(1.3 × export_width / rendered_width)
```

The rule must land at **1.3px or more** where the asset is actually seen. Under 1px it
antialiases into a grey smear, which is precisely what the honesty rule forbids — and
plaque without its rule is not plaque. Every hairline number below is that formula
applied. Where a surface declares no render size, the web value of 1px stands.

---

## 1. Voice and writing

**Tone.** A curator writing forty words for the wall: what it is, when, of what, and one
sentence on why it is here.

**Casing.** Sentence case. Titles of works in italic. Dates, durations and dimensions in
the mono, never abbreviated — `14 minutes`, not `14m`; `2026`, not `'26`.

**Sentence rhythm.** Four sentences, maximum, per label. The first is a noun phrase with
no verb. The rest are complete and short. Never a question, never a second-person
address, never an imperative.

**Do say.** "2024" · "Commissioned by" · "Collection of the artist" · "Single-channel
video, 14 minutes" · "Shown here for the first time".

**Don't say.** "check this out" · "must-see" · "iconic" · "immersive" · "unforgettable"
· "bucket list".

**The tell.** The medium line. Every item carries one mono line giving medium, duration
and year, in that order, whether or not anybody asked.

## 2. Landing page

There is no hero. The page opens on charcoal with **18% margins on all four sides** and
one label block in the lower left: the name in Source Sans 3 600 italic at 15px, a `1px
#ddd9cd` hairline beneath it at 34% of the block width, then three mono lines at 13px
giving role, location and year.

Sections do not divide. The page is a wall, and works appear on it every 40% of viewport
height. Each work is an image in a quadrant that **never bleeds to an edge**, with its
label block at its lower left. Whitespace is 82% of the page and is not negotiable — the
margin *is* the direction.

**The carrying element:** the hairline that grows and does not retract.

## 3. X / Twitter avatar

Flat `#1a1a19` square. `Pooria Arab` in Source Sans 3 400 at 11% of the square height,
in `#e8e7e1`, on the lower left with a 20% margin from the left and bottom edges. A `1px
#ddd9cd` hairline sits above it at 34% of the square's width. No face, no logo, no ring.

**At 48px this fails outright, and pretending otherwise is dishonest.** 11% of 48px is
5.3px of type and a 1px hairline at 34% width is 16 grey pixels. Export a separate 48px
file:

- Drop the name entirely. It cannot be read, so it is decoration pretending to be
  information.
- `PA` in Source Sans 3 **600** at **30%** of the square height (14px), `#e8e7e1`, flush
  left at a 20% margin, sitting on the lower-third baseline.
- Hairline thickens to **2px**, `#ddd9cd`, at 34% width, 6px above the cap.
- No grain texture. At 48px a 4.5% noise overlay is compression artefact.

Ship the full-name version at 400px and the `PA` version as the 48px file.

## 4. X header and YouTube banner

2560×1440. Phone-safe area 1546×423 centred: x **507–2053**, y **509–932**. The phone
shows the safe area and nothing else, at roughly 390pt wide, **so `export_width` here is
1546, not 2560**: 1546 / 390 = 3.96, which gives title **80px**, mono **52px** and a
hairline of **6px**.

Charcoal wall with grain across the whole 2560 frame and **no type in the left two
thirds**. That emptiness is the decoration.

In the right third of the safe area (from x=**1540**), one label block aligned to the
vertical centre: the name in Source Sans 3 600 italic at 80px, a `6px #ddd9cd` hairline
beneath at 34% of the block width, then a single mono line of **8 words maximum** at
52px. Nothing else in the frame. **The rule is 6px, not 2px** — at this surface's 0.25
scale a 2px rule renders 0.5px and is gone.

## 5. Open Graph card

1200×630, read at roughly 400×210. Scaling law: title **60px**, mono **39px**.

Charcoal. One centred label block 640px wide (the source's 320px, doubled for the
shrink): title in Source Sans 3 600 italic at 60px, a `4px #ddd9cd` hairline, then three
mono lines at 39px — role, year, duration. The block sits at optical centre, **one third
down** (its cap line at y=210). The remaining 80% of the card is empty wall.

**Drop for the shrink:** the grain, any image of the work, and the third mono line if it
pushes past 640px. Two lines on a plaque OG card is correct.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop. Keep the leftmost
**300px** and the bottom **80px** clear — which plaque wants anyway, since its left two
thirds are already empty.

Charcoal wall, grain, nothing from x=0 to x=1050. One label block from x=**1090** to
x=**1500**, aligned to the vertical centre (y=**198**): name in Source Sans 3 600 italic
at 44px, a `2px #ddd9cd` hairline at 34% of the block width, then one mono line of **8
words maximum** at 28px. Nothing in the bottom 80px.

## 7. LinkedIn post image

1200×627. LinkedIn is the most conservative room the brand enters. plaque behaves best
there and performs worst there: a charcoal card with two lines reads as senior and
considered in a feed of shouting, and it also gets scrolled past. Take that trade on
purpose.

**Dial it up by exactly one step, and no further:**

- Title at **72px** rather than 60. Still italic, still sentence case, still 6 words
  maximum.
- The hairline runs at **50%** of the block width instead of 34%, so the block has an
  edge at thumbnail size.
- Add **one** mono line at the top-left, 28px, `0.02em` tracking: the category and year,
  e.g. `Case study, 2026`.
- Margins come in from 18% to **14%**, and no further. Below 14% this stops being
  plaque.

Never add a photograph of yourself, a logo, a chart, or a colour. If the post needs a
chart, use [annual](../brand-annual/SKILL.md) for that post.

## 8. Instagram carousel

1080×1350. Margins **18%** — 194px on all sides, so the usable block is 692px wide.
Rendered near-native on a phone, so the scaling law gives title **60px**, mono **39px**.
Grain on every slide.

**Be honest about the trade.** This is the quietest carousel of the twenty. It loses
reach against [stadium](../brand-stadium/SKILL.md) or [flyer](../brand-flyer/SKILL.md) by a wide
margin. Right when the audience is small and the work is good; wrong when the job is
growth.

**Cover slide.** Charcoal field, 18% margins. Title in Source Sans 3 600 italic,
sentence case, **6 words maximum**, at 60px, on the lower left with its baseline at
y=**1000**. One mono line under it at 39px giving medium and year, e.g. `Video, 14 min,
2026`. Any image of the work sits in the **upper-right quadrant only** and never bleeds
to an edge. No face.

**Swipe cue.** The hairline above the label block extends **60px past the right edge of
the longest line** and stops in open wall. On the web that is the hover state; on a
static cover it is frozen mid-growth, and a rule that has plainly not finished is the
cue. No arrow, no dots, no "swipe".

**Interior slide.** Same 18% margins. One image in the upper-right quadrant, or none.
Body at **39px** Source Sans 3 400, leading 1.65, lower left, **four sentences maximum**
— the curator's forty words. A `1px #2e2e2c` divider sits above the block. No title: the
cover named the work.

**End card.** The ask is to look at the archive, stated as a location, not an
instruction. Charcoal, one label block at optical centre: `The archive` in Source Sans 3
600 italic at 60px, hairline, then the URL in mono at 39px. No verb.

## 9. YouTube thumbnail

1280×720, designed for the **~210px wide** version. Scaling law: title **122px**, mono
**79px**.

Charcoal field with 18% margins on all sides. Title in Source Sans 3 600 italic,
sentence case, **6 words maximum**, at 122px on the lower left. One mono line under it
at 79px giving medium and year. Any image of the work sits in the upper-right quadrant
only and never bleeds to an edge. The hairline is **8px** here, not 1px: the sidebar
render divides every dimension by 6.1, so 3px lands at 0.5px and only 8px reaches the
1.3px floor.

**The recognisability rule:** the label block always sits in the lower left and the work
always sits in the upper right, with wall between them. What changes is the title and
the still. Two plaque thumbnails side by side read as two labels in one room, which is
the whole idea.

## 10. YouTube edit style

**Cut rhythm.** Very slow. Hold 10–20 seconds. A cut lands only when the subject in
frame changes, never to add energy. Locked-off tripod only, no handheld.

**Titles and lower thirds.** On a 1920×1080 frame the lower third sits at x=**346**
(18%), y=**880**: name in Source Sans 3 600 italic 34px, a `1px #ddd9cd` hairline at 34%
of the block width, then a mono line at 22px. In: the hairline grows left to right over
700ms with `cubic-bezier(0.4, 0, 0.2, 1)` while the type sits still. Out: it does
**not** retract — the title cuts away whole, matching the web behaviour. Hold 8 seconds.

**B-roll.** Desaturate to 45% chroma. Crush the blacks to `#1a1a19`, never pure black,
and cap the whites at `#e8e7e1`. Add 4% grain. Speed 100%; no ramps, no slow motion, no
timelapse.

**Transitions.** One only: **a hold to charcoal for 12 frames** at a section break.
Every other transition is banned, including the hard cut to a new location without the
hold.

**The cold open.** Three seconds: charcoal frame, the label block already set and still,
and the hairline growing. Nothing else happens and nobody speaks. The retention cliff is
real and plaque walks off it on purpose — this open selects the viewer who was going to
stay.

## 11. Podcast cover

3000×3000, shown at 150px. The scaling law gives a 400px title and 260px mono, and three
mono lines at 260px do not fit inside 18% margins. plaque simplifies harder here than
anywhere else.

- Charcoal `#1a1a19`, 18% margins (540px).
- Show title in Source Sans 3 600 **italic** at **400px**, sentence case, **3 words
  maximum**, over two lines, lower left.
- A **26px** `#ddd9cd` hairline above it at 34% of the block width. At the 20× shrink a
  12px rule renders 0.6px and vanishes; 26px lands at 1.3px.
- **One** mono line beneath at **200px**, three words maximum, e.g. `Interviews, 2026`.
- No grain, no image, no host name, no episode count.

At 150px that resolves to a bone rule over two lines of pale italic on charcoal —
legible, and the only quiet cover on the page.

## 12. Deck and talks

16:9, from the back of a room. This is the one context where the 15px cap must break —
nobody reads 15px from row 12. Use the scaling law with a rendered width of 400pt:
**title 96px, mono 62px** on a 1920px frame.

**Title slide.** One label block, lower left, at 18% margins: talk title in Source Sans
3 600 italic at 96px, a `7px #ddd9cd` hairline at 34% of the block, then two mono lines
at 62px — venue and date. The rest is wall.

**Section divider.** One mono line at 62px, lower left, giving the section number and
name. No title, no rule, no image.

**Data slide.** One work per slide. The image takes the **top 60%** with a 10% margin
and **never bleeds**. Caption block bottom-left at 62px with a hairline above. If the
talk needs a real chart, plaque cannot hold it — borrow an [annual](../brand-annual/SKILL.md)
slide and keep the charcoal field.

**Slides with a lot of words.** There are none. Four sentences is the ceiling on any
plaque slide, and a fifth sentence means a second slide. No bullets, no transitions, and
the slide number never exceeds 12px scaled (48px at 1920).

---

## Cost to run

**Cheap to make, expensive in reach.**

Production is the fastest in the family: two lines of type on a charcoal field, no
photography to art-direct, no colour to manage, no grid to fight. Four minutes a card,
twenty a carousel.

The cost is elsewhere and it is real. plaque converts badly by construction: no call to
action, no volume. It depends entirely on the work in the frame, since a label pointing
at weak work draws attention straight to the weakness. And every item needs a genuine
curator line — medium, duration, year — so somebody has to know those facts and write
them down. That is a habit, not a design task, and it is where this direction usually
dies.

## Pairs with / clashes with

**Pairs with [porcelain](../brand-porcelain/SKILL.md)** — the same restraint from the opposite
end of the value scale. porcelain is the daylight gallery, plaque the darkened room. Run
porcelain on the marketing surfaces and plaque on the archive, with no seam.

**Pairs with [manuscript](../brand-manuscript/SKILL.md)** — both defer to something outside
themselves. manuscript writes about the work, plaque captions it.

**Pairs with [dusk](../brand-dusk/SKILL.md)** — both native dark and both quiet, but keep the
jobs apart: dusk carries mood, plaque carries information. If a plaque label starts
having atmosphere, dusk has eaten it.

**Clashes with [swiss](../brand-swiss/SKILL.md)** — both claim restraint, so together they
read as indecision rather than range. swiss's single red breaks plaque's silence, and
plaque's charcoal mutes swiss's grid.

**Clashes with [stadium](../brand-stadium/SKILL.md), [arcade](../brand-arcade/SKILL.md) and
[flyer](../brand-flyer/SKILL.md)** — all three exist to raise volume, and plaque has no knob
to meet them with.

## The failure mode

**It becomes an empty page.** plaque is deference all the way down, and deference with
nothing behind it is an unfinished site. It borrows all of its authority from the work
in the frame. If the work is thin, the margin around it reads as pretension, and the
viewer's conclusion is not "restrained" — it is "there is nothing here".

The second failure is **volume creep**. A bigger heading, then a colour for the button,
then a hero image that bleeds. Each request is reasonable and each takes a bite out of
the only thing this direction owns. Once the type passes the cap or an image touches an
edge, it is a normal dark portfolio — and a worse one than most, because it has no
accent colour to fall back on.

The third is **captioning nothing**. A medium line on a blog post (`Essay, 4 min, 2026`)
is fine. A medium line on a landing page for a SaaS product is a costume. plaque is for
archives; if there is no archive, choose another direction.
