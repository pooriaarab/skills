---
name: flyer
description: "Use when applying the flyer brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. Coarse black halftone, ransom-note caps at jumping sizes, rotated blocks, tape and torn edges. Triggers: 'flyer direction', 'photocopied poster style', 'ransom note type', 'halftone punk brand', 'apply flyer to my manifesto'."
---

# flyer

> photocopied at 3am, stapled to a pole, still legible in the rain.

**emotion** defiant, cheap, loud.
**signature** every image is a blown-out halftone with no midtones left, and the type is a ransom note:
sizes jumping four steps between words, blocks rotated a degree or two off square with visible tape at
the corners.
**use when** you are picking a fight, announcing something unsanctioned, or writing against the grain of
an industry. Manifestos, rants, open calls.
**avoid when** you need to be trusted with money or data. **The whole point of this direction is that
nobody approved it.** Send those to [annual](../annual/SKILL.md).

**Not [risograph](../risograph/SKILL.md).** flyer is coarse black toner on grey paper, mixed-size caps,
rotation, tape, torn edges. riso is two aligned fluorescent inks, lowercase, and nothing rotates. They
look adjacent in a moodboard and they are opposites in every rule below.

Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor:
[`../_lib/craft-floor.md`](../_lib/craft-floor.md).

---

## Tokens

### Palette

Light is native. Dark is **the negative copy**, not an inverted page: the run where the toner covered
the sheet and the halftone dots became the light coming through. The orange warms from `#ff4a00` to
`#ff5a14`, because the cooler orange dies against black.

| Role | Light (native) | Dark | Contrast light / dark |
|---|---|---|---|
| bg | `#e8e6e0` toner grey | `#0d0d0d` | — |
| surface | `#f5f4f0` | `#191919` | — |
| fg | `#0b0b0b` | `#ede9e2` | 15.8 / 16.1 |
| muted | `#6b3a18` | `#c08052` | 7.5 / 6.0 |
| border | `#1a1a1a` | `#33302b` | hairline only |
| accent | `#ff4a00` | `#ff5a14` | **2.7 on paper, fill only** |
| accentFg | `#140400` | `#140400` | 6.0 / 6.4 on orange |
| ring / alt | `#ff4a00` | `#ede9e2` | focus |

**Orange is a bar, never a word.** `#ff4a00` type on the paper is 2.7:1 and it fails. Set the orange as
a solid rectangle with `#140400` knocked out on it. White on orange is 3.4:1, so it is legal only above
24px at weight 700, and `#140400` is the better answer every time.

### Type

- **display** `"Anton", "Haettenschweiler", Impact, sans-serif` · 400 · tracking `-0.03em` · uppercase · leading 0.86
- **body** `"Special Elite", "Courier New", monospace` · 400 · tracking `0em` · leading 1.55
- **mono** `"Courier Prime", ui-monospace, monospace` · 700 · tracking `0em` · uppercase · leading 1.4
- Google: `Anton`, `Special Elite`, `Courier Prime:wght@400;700`.
- Scale 1.6 from 16px: **16 / 26 / 41 / 66 / 105 / 168 / 269**.
- Measure 60 characters. Never two columns.

**Special Elite is a battered typewriter face and it is slow to read.** Floor 18px, and never more than
120 words in a single block. Past that, the direction is costing the reader more than the argument is
worth.

### The ransom note rule

Adjacent words in a headline sit **two to four steps apart on the scale**, so between 2.6x and 6.6x in
size. The pattern alternates: big, small, big, small. Never three consecutive words at the same size,
and never a smooth ramp, which reads as a gradient rather than as cut-out letters.

Baselines do not align. Each word sits 4% to 9% of its own height off the line of the previous one, up
or down, never in a pattern.

### Rotation, tape, and tear

- **Display blocks** rotate between **-3 and +3 degrees**, and never exactly 0.
- **Body blocks** rotate at most **-1 degree**. A rotated paragraph costs reading speed, and the direction is loud, not illegible.
- **Tape**: a 96×34px rectangle at 30 to 40 degrees over a corner, `rgba(245,244,240,0.55)`, with a 1px `rgba(11,11,11,0.35)` edge on the two long sides. Two tape marks per asset, at opposite corners, never four.
- **Torn edge**: a hand-drawn irregular vertical boundary where two images meet, with a 6px white paper lip on the near side. One tear per asset.

### Surface

Radius **0**. Shadow `5px 5px 0 0 #0b0b0b, 0 10px 22px -16px rgba(11,11,11,0.7)` — the hard black offset
is a second photocopy pass. Hairline `2px solid #0b0b0b`. Halftone texture, over everything:

```css
background-image:
  radial-gradient(circle at 1px 1px, rgba(11,11,11,0.55) 1.1px, transparent 1.3px),
  radial-gradient(circle at 3px 3px, rgba(11,11,11,0.32) 0.7px, transparent 0.9px),
  repeating-linear-gradient(91deg, rgba(11,11,11,0.06) 0 2px, transparent 2px 140px);
background-size: 4px 4px, 4px 4px, 100% 100%;
mix-blend-mode: multiply;
filter: contrast(1.6);
opacity: 0.7;
```

Every photograph goes to pure black and white with a coarse halftone at roughly
**8 dots per centimetre**, with no grey left anywhere. A midtone in a flyer image means the copier was
working, and the copier is never working.

### Motion

`cubic-bezier(0.34, 1.4, 0.64, 1)`, 260ms. **The hero block drops 8px and lands crooked at -1.5 degrees,
the way a flyer gets slapped onto a wall and stuck before anyone straightens it. One impact, on first
paint. Nothing on the page moves again after that, including on hover.** Animate `transform: translateY`
and `rotate` together on a block that is already at full opacity. Under `prefers-reduced-motion:
reduce`, render it at -1.5 degrees with no drop.

Hover states are flat by rule. A flyer on a wall does not respond to you.

---

## 1. Voice and writing

- **Tone** — a person who has stopped asking permission, writing in short declaratives with the caps lock on for the parts that matter.
- **Casing** — ALL CAPS for headlines. Body in sentence case, with single words hit in caps for emphasis.
- **Sentence rhythm** — short, blunt, 6 to 12 words. No hedging. One capitalised word per paragraph, at most, or the emphasis stops meaning anything.
- **The tell** — the writing names an opponent. A rule, an industry habit, a gatekeeper, a norm. Not a person by name, but always something to be against. Take the opponent out and the direction has no reason to be shouting.

**Do say** — "nobody is coming to approve this" · "MAKE THE THING" · "no gatekeepers, no waitlist" · "we
are doing it anyway" · "the process is the problem" · "ask afterwards"

**Don't say** — "brand guidelines" · "stakeholders" · "on-message" · "polished" · "tasteful" · "best
practice" · "aligned"

**The honesty check.** Do not use this voice for something that was, in fact, approved. A funded launch
dressed as a rebellion is the fastest way to lose the readers who came for the rebellion.

## 2. Landing page

Toner-grey field, halftone over the whole document. Content in a 720px column, left-aligned with a 72px
margin, never centred.

Hero: an Anton ransom-note headline at 269px on the largest word, seven words maximum on three lines,
each line a different size, the whole block at -1.5 degrees and clipped by the left edge. One word
knocked out white inside a `#ff4a00` bar. Two tape marks at opposite corners of the block.

Sections divide with a **torn white paper edge** running the full width, 6px tall, irregular. No rules,
no cards, no whitespace bands. Body in Special Elite at 18px, 120 words maximum per block.

The element that carries the direction is the size jump between words. A headline set at one size is a
poster, not a flyer.

## 3. X / Twitter avatar

Renders at 48px. The coarse halftone survives it; the tape does not.

Portrait pushed to pure black and white with a coarse halftone, dots visible at roughly 8 per
centimetre, no grey left anywhere. Square on `#e8e6e0`, rotated -2 degrees so the paper corners show.
One `#ff4a00` rectangle behind the head, the same rotation but 3 degrees further off. No border.

Export 400×400 with the dot pitch at **5px**, which is coarse enough to still read as dots at 48px.
**Drop the tape marks and the paper texture below 128px export.** At 48px the tape is a grey smear on
the face. The orange rectangle at a different angle from the portrait is the only recognition cue that
survives, so keep those two angles at least 3 degrees apart.

## 4. X header and YouTube banner

2560×1440 for YouTube. The phone shows only the centre **1546×423**.

Full-bleed halftone paper. One ALL CAPS Anton line across the left two thirds at 105px, rotated -1
degree, with the last word knocked out inside the orange bar. A photocopied black edge streak runs down
the right side, 40px wide, irregular. No portrait.

Everything readable sits inside 1546×423. The streak and the paper run to 2560px. Keep the centre 400px
of the safe area free of the orange bar so the avatar overlap does not land on it.

X header is 1500×500: same line at 66px, lower-left 360×360 clear.

## 5. Open Graph card

1200×630, seen at roughly a third.

Halftone paper field. ALL CAPS Anton headline top-left, seven words maximum on three lines, each line a
different point size, largest at 105px, the whole block at -1.5 degrees. A single `#ff4a00` bar behind
one word. Bottom-right in Courier Prime caps at 22px: `POORIAARAB.COM`. Leave the bottom-left corner
empty and torn.

Coarsen the halftone to a 6px pitch for this card and drop the tape. At 400px wide a 4px pitch aliases
into a grey wash, which loses the one texture the card is built on. The orange bar and the rotation are
what read at feed size.

## 6. LinkedIn banner

1584×396. The desktop profile photo covers a circle about 160px across near x=190, y=300.

Keep the left 420px as plain halftone paper with the black streak running down the far-left edge, so the
photo has something to sit against. One Anton line at 72px from x=460 to x=1480, rotated -1 degree, one
word in the orange bar.

Rotate the type block, not the banner. A rotated banner leaves triangular gaps at the corners that
LinkedIn fills with white, and that reads as a broken upload rather than as a decision.

## 7. LinkedIn post image

1200×627. The most conservative room the brand enters, and flyer is built to antagonise exactly that
room.

Be honest about the trade: **flyer on LinkedIn is a deliberate cost.** It buys attention from people who
agree with you and it spends credibility with people who do not. Only run it when the post is an
argument against an industry habit, which is the same condition as the use-when. For anything else, use
[swiss](../swiss/SKILL.md) or [broadsheet](../broadsheet/SKILL.md).

When you do run it, dial down about 35%:

- One size jump, not three. Two sizes in the headline, 2 steps apart.
- Rotation at -1 degree, not -3.
- Drop the tape. Drop the torn edge. Keep the halftone at a 5px pitch.
- Orange on one word only, in a bar, with `#140400` on it.
- Body in Courier Prime at 22px instead of Special Elite, which is faster to read for someone who is not enjoying the reference.

Never soften the halftone to a gradient to look "professional". A soft flyer is just a badly rendered
poster, and it loses both audiences at once.

## 8. Instagram carousel

1080×1350, 4:5. Margin 64px. Halftone on every slide; a clean slide is off-brand.

**Cover slide.** Four words maximum in Anton, stacked on four lines that alternate size, big, small,
big, small, with a four-step jump between them. Largest word at 340px. The block sits left, rotated -2
degrees, clipped by the left edge. One word knocked out white inside an orange bar. Two tape marks at
opposite corners of the slide.

**Interior slide.** Special Elite at 34px, leading 1.55, flush left, 90 words maximum, block rotated -1
degree. A Courier Prime caps kicker at 24px above it. It belongs to the cover through the identical
paper, the identical halftone pitch, and the tape in the same two corners. Orange appears on at most one
word per slide, and most slides have none.

**End card.** `MAKE THE THING` at 200px in Anton across two lines at different sizes, rotated +2
degrees, one word in the orange bar. Handle at 32px Courier Prime, bottom-left, unrotated. The ask is
that the reader does something, not that they follow.

**Swipe cue.** A torn paper edge running the full height, flush to the right edge, 24px of white lip
with an irregular boundary, as though the next sheet is already underneath this one. It is native to the
reference in a way an arrow is not, and it repeats on every slide except the end card.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render.

Toner-grey paper, halftone across the whole frame. Headline in Anton, four words maximum, stacked on
four lines that alternate size, big, small, big, small, a four-step jump between them, reading as a
ransom note. The block sits left, rotated -2 degrees, clipped by the left edge. One word is knocked out
white inside a `#ff4a00` bar. Face on the right, halftoned to the same coarse dot, cropped at the jaw,
with a torn white paper edge running vertically where the two images meet. Two tape marks at opposite
corners.

No gradients. No drop shadows on the type other than the hard black 5px offset.

**The recurring rule:** one orange bar on a black-and-white frame, always horizontal, always behind
exactly one word. On a sidebar of full-colour thumbnails, a frame with a single saturated element is
what the eye lands on. Coarsen the dot to a 7px pitch at export so it survives the 210px render.

## 10. YouTube edit style

- **Cut rhythm** — hard and irregular. Average shot 2 to 4 seconds, but deliberately uneven, so no rhythm establishes. A cut lands **mid-word** at least twice per video. Nothing about this edit should feel scheduled.
- **Titles and lower thirds** — Anton caps at 88px, bottom-left, inset 64px, black on a white paper card rotated -2 degrees with two tape marks. It snaps in over 2 frames with the 260px drop and lands crooked. It holds 2 seconds and cuts out. Never fade.
- **B-roll** — pure black and white, halftoned at a 6px pitch, contrast pushed until the midtones are gone. Speed 100%. One exception: a 2-frame black flash, used as punctuation after a claim, at most four times per video.
- **Transitions** — cut only, with one exception: a 3-frame paper-tear wipe between chapters, and only between chapters.
- **Cold open** — three seconds of the claim, said flat, straight down the lens, with no music. The title card slaps on at 0:03 and lands crooked. No logo, no intro, and specifically no build-up, because a build-up implies somebody planned this.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify to three elements and no more.

Toner-grey paper, halftone at a 30px pitch, which is very coarse and is the point. The show name in
Anton caps across two lines at two sizes, four steps apart, the block rotated -2 degrees. One `#ff4a00`
bar behind the smaller word.

Drop the tape, the tear, the portrait, and the tagline. At 150px the tape is invisible and the tear is a
fuzzy line. The rotation and the orange bar are the only two things that survive, so exaggerate both:
rotate to -3 degrees and let the bar bleed off the left edge.

## 12. Deck and talks

16:9 at 1920×1080, read from the back of a room. One statement per slide in Anton, maximum eight words,
block rotated between -3 and +3 degrees and never square. Orange appears on at most one word per slide.
Every slide carries the halftone; a clean slide is off-brand.

- **Title** — the title in Anton across three lines at three sizes, largest at 300px, block at -3 degrees, one word in the orange bar. Speaker and date in Courier Prime caps at 28px, bottom-left, unrotated.
- **Section divider** — the section name alone at 400px, rotated +3 degrees, bleeding off both side edges so only the middle of the words is visible. It is the only slide where clipping the words is allowed.
- **Data** — the number in Anton at 400px, unrotated and unclipped, black on paper. **Never put a number in the orange bar and never rotate a number.** A tilted figure reads as an approximation, and the one thing this direction cannot afford is being thought sloppy about a fact.
- **Wordy slides** — 60 words maximum in Special Elite at 40px minimum, block at -1 degree, no orange, no tape. Past 60 words, split the slide. A room cannot read a rotated typewriter face for long, and pretending otherwise is vanity.

---

## Cost to run

**Expensive.** The most hand-work per asset of the six in this family.

Nothing here batches. The halftone has to be tuned per image, because the dot pitch that kills the
midtones on a bright photograph turns a dark one into a solid block. The ransom-note sizing is a
per-headline judgement, and it takes three or four attempts before the jumps look cut-out rather than
random. The rotation has to be eyeballed against the frame edge every time. The tape and the tear are
hand-placed assets that look wrong the moment they repeat in the same position twice.

Real numbers: a carousel is 75 to 100 minutes. A thumbnail is 30 minutes. A halftone portrait is 20
minutes and does not transfer to the next photograph.

**Not viable weekly for one person, and not viable monthly either if you also want the writing to be
good.** This is a manifesto direction. Use it 3 to 6 times a year, on the piece that is genuinely
picking a fight, and let [buildspace](../buildspace/SKILL.md) hold the other 46 weeks. A flyer that
appears every Tuesday is a newsletter, and a newsletter is not unsanctioned.

## Pairs with / clashes with

**Pairs with** [buildspace](../buildspace/SKILL.md), which is warm and cheap and carries the ordinary
weeks. The contrast makes the flyer weeks land harder.
**Pairs with** [broadsheet](../broadsheet/SKILL.md): both are print-native and argument-shaped, and a
broadsheet essay under a flyer cover reads as a pamphlet with a serious inside.
**Pairs with** [dispatch](../dispatch/SKILL.md) when the fight has a date.

**Clashes with** [risograph](../risograph/SKILL.md) worst of all. They share a print reference and
contradict each other in every rule: aligned against rotated, fluorescent against toner, lowercase
against caps. Side by side, one looks like a failed version of the other.
**Clashes with** [porcelain](../porcelain/SKILL.md) and [annual](../annual/SKILL.md), which exist to be
trusted.
**Clashes with** [arcade](../arcade/SKILL.md): both are noise-forward, and together they read as a
person with no editing instinct.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand-router/SKILL.md):
[broadsheet](../broadsheet/SKILL.md), [swiss](../swiss/SKILL.md), [manuscript](../manuscript/SKILL.md),
[plaque](../plaque/SKILL.md), [annual](../annual/SKILL.md), [terminal](../terminal/SKILL.md),
[blueprint](../blueprint/SKILL.md), [spec](../spec/SKILL.md), [oscilloscope](../oscilloscope/SKILL.md),
[punchcard](../punchcard/SKILL.md), [buildspace](../buildspace/SKILL.md),
[risograph](../risograph/SKILL.md), [stadium](../stadium/SKILL.md), [arcade](../arcade/SKILL.md), flyer,
[dispatch](../dispatch/SKILL.md), [dusk](../dusk/SKILL.md), [vellum](../vellum/SKILL.md),
[aurora](../aurora/SKILL.md), [porcelain](../porcelain/SKILL.md).

## The failure mode

**A costume.** Flyer is the easiest direction in the twenty to fake, because every one of its marks is
available as a preset: halftone filter, tape sticker, tilt, Anton. Apply all four to a post about your
product roadmap and you get something that looks like rebellion and reads as marketing. Readers detect
that in about one second, and they are harsher about it than they would be about plain corporate design,
because the plain version was not pretending.

The second failure is decorative rotation. Someone rotates everything, the paragraphs included, because
the tilt is the fun part. The page stops being readable, the reader stops finishing it, and the argument
dies inside its own styling.

The check before you publish: name the opponent in one sentence, and name what you personally lose by
saying it out loud. If nothing is at stake, take the tape off and use [swiss](../swiss/SKILL.md). An
honest neutral page beats a staged riot.
