---
name: brand-stadium
description: "Use when applying the stadium brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. Broadcast graphics, condensed caps clipped by the frame, one saturated green on a hard 115 degree diagonal. Triggers: 'stadium direction', 'broadcast graphic style', 'sports launch brand', 'green diagonal design', 'apply stadium to my thumbnail'."
---

# stadium

> the graphic that drops over the pitch two seconds before kickoff.

**emotion** urgent, confident, televised.
**signature** condensed type set so large it is cut off by the frame, sitting on a hard 115 degree
diagonal that slices the whole layout. One saturated green, black behind it, and nothing between the
two.
**use when** you are announcing a launch, a number, a result, or a date. Anything with a winner and a
scoreline.
**avoid when** the content is reflective, uncertain, or long-form. **This direction cannot whisper and
it cannot hold three paragraphs of nuance.** Send those to [buildspace](../brand-buildspace/SKILL.md) or
[manuscript](../brand-manuscript/SKILL.md).

Treat the avoid-when as a hard gate, not a preference. Most of the failures in this file come from
someone using stadium for a post that had no number in it.

Contract: [`../brand-router/_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor:
[`../brand-router/_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md).

---

## Tokens

### Palette

Dark is native. Light is **the daytime studio**, not an inverted page: the same broadcast package cut
for a white set. Under floodlights the green is a light source. On the white set it is paint, and paint
cannot glow. That is why the type rule changes between modes.

| Role | Dark (native) | Light | Contrast dark / light |
|---|---|---|---|
| bg | `#07090a` | `#f2f4f3` | — |
| surface | `#12161a` | `#ffffff` | — |
| fg | `#ffffff` | `#0a0f0c` | 19.9 / 17.5 |
| muted | `#93a8a0` | `#3f5a4c` | 7.9 / 6.8 |
| border | `#223028` | `#c6d3cb` | hairline only |
| accent | `#00e266` | `#00e266` | 11.5 on black · **1.6 on light, fails** |
| accentFg | `#05140c` | `#05140c` | 10.9 on green |
| ring / alt | `#00e266` | `#0a0f0c` | focus |

**The green type rule.** On the black field, `#00e266` is legal as type at any size: 11.5:1. On the
light field it is 1.6:1 and it is **never type, only fill**. In light mode, set `#05140c` on a green
block instead. Any asset that puts green words on a pale background is broken, however good it looks on
your calibrated monitor.

### Type

- **display** `"Big Shoulders Display", "Oswald", Impact, sans-serif` · 900 · tracking `-0.03em` · `text-transform: uppercase` · leading 0.82
- **body** `"Barlow", system-ui, sans-serif` · 400 · tracking `0em` · leading 1.5
- **mono** `"IBM Plex Mono", ui-monospace, monospace` · 600 · tracking `0.02em` · uppercase · leading 1.35. Dates, scores, timestamps.
- Google: `Big Shoulders Display:wght@700;800;900`, `Barlow:wght@400;600;700`, `IBM Plex Mono:wght@400;600`.
- Scale 1.45 from 16px body: **16 / 23 / 34 / 49 / 71 / 103 / 149 / 216**.
- Measure 62 characters. Never two columns.

### Surface

Radius **0**. Every corner is square, on every surface, forever. Shadow `6px 6px 0 0 #00e266, 0 18px
30px -20px rgba(0,0,0,0.85)` — the green offset is the graphic's drop plate. Hairline `3px solid
#00e266`, thick enough to read on a television across a room. Diagonal texture:

```css
background-image:
  repeating-linear-gradient(115deg, rgba(0,226,102,0.16) 0 2px, transparent 2px 10px),
  linear-gradient(115deg, transparent 0 61%, rgba(0,226,102,0.09) 61% 64%, transparent 64%);
background-size: 48px 48px, 100% 100%;
opacity: 0.75;
```

### The 115 degree rule

Every angled element in the system is at **115 degrees**, measured the same way every time. Bands,
wipes, clipping edges, texture. There is no second angle. A diagonal at 110 or 120 degrees reads as a
mistake, because the eye compares it against the texture behind it.

Type is **clipped by the frame on purpose**: the first word loses 8% to 14% of its width off the left
edge. Clip letters, never whole words. The reader must still be able to complete the word.

### Motion

`cubic-bezier(0.22, 1, 0.36, 1)`, 340ms. **One green diagonal wipe crosses the hero from the right edge
to the left on the 115 degree angle, uncovering a headline that was already set in place. It runs once,
at first paint, at broadcast speed. The type itself never moves.** Implement as a `clip-path` animation
on the green band, over type that sits at full opacity underneath. Under `prefers-reduced-motion:
reduce`, draw the band in its resting position and skip the wipe.

---

## 1. Voice and writing

- **Tone** — a commentator calling the play as it happens. Present tense, short clauses, no qualifiers.
- **Casing** — ALL CAPS for headlines and buttons. Sentence case for body.
- **Sentence rhythm** — short and declarative. 8 words average. No subordinate clauses. A sentence with "although" in it is not this direction.
- **The tell** — the paragraph contains a number and a tense. Something happened, at a time, and here is the count. Remove the number and the writing has nothing left, which is the honest limit of the voice.

**Do say** — "shipped today" · "1,400 in the first hour" · "here is the number" · "we are live" ·
"second place. we know." · "doors close friday"

**Don't say** — "maybe" · "sort of" · "we'll see" · "it depends" · "quietly" · "nuanced" · "in due
course"

**Length ceiling.** 60 words per post. Past that, the voice runs out of things it is allowed to do, and
the writing turns into a press release with the caps lock stuck. If the idea needs 200 words, it is not
a stadium idea.

## 2. Landing page

Full-bleed black. No max-width container on the hero; the type runs edge to edge and clips.

Hero: two or three uppercase words in Big Shoulders at 216px, leading 0.82, clipped by the left edge,
with a green 115 degree band running the full height behind the last word. One line of Barlow at 23px
underneath in muted. One square green button, `#05140c` on `#00e266`, 23px, uppercase.

Sections divide with a **3px green rule at 115 degrees** running corner to corner. Whitespace is not the
tool here; the diagonal is. Body copy sits in a 62-character measure and caps at 200 words per section.
Past that, split the page.

The element that carries the direction is the clipped headline. Uncut type on this page is a different
brand.

## 3. X / Twitter avatar

Renders at 48px. It survives, because it has two shapes and one colour.

Face cropped hard at the eyebrows and the chin so the head overflows the square. Behind it, a single
`#00e266` diagonal band at 115 degrees running lower-left to upper-right, on `#07090a`. Subject looks
straight down the lens. No text in the avatar, ever.

Export 400×400. The band is 120px wide, crossing the frame so it exits both edges. At 48px it reads as a
green stripe behind a head, which is the whole job. Push face contrast so the shadow side goes to
`#07090a` and merges with the field. A mid-grey face at 48px is a smudge.

## 4. X header and YouTube banner

2560×1440 for YouTube. The phone shows only the centre **1546×423**.

A single green diagonal band at 115 degrees crosses the full width on black, with one uppercase Big
Shoulders line at 96px sitting inside the band in `#05140c`. **Keep the centre 400px clear** so the
avatar overlap does not collide with the words. Put the line to the left of that hole and let the band
continue behind the avatar.

Outside the safe area: black and the diagonal texture. No portrait, no logo lockup, no channel
description. The band exits at 2560px so the desktop crop looks like a broadcast lower third and not a
cropped image.

X header is 1500×500: band at the same angle, line at 68px, and the lower-left 360×360 kept clear.

## 5. Open Graph card

1200×630, seen at roughly a third.

Black field. Uppercase headline bottom-left at 103px, six words maximum on two lines, clipped by the
left margin. A green diagonal rule 3px thick crosses above it, corner to corner. Top-right in IBM Plex
Mono at 22px: the date. Nothing else.

Drop the texture, the body line, and the button. At 400px wide the 48px diagonal texture turns into a
moire pattern against the feed's own pixel grid, which is worse than no texture.

## 6. LinkedIn banner

1584×396. The desktop profile photo covers a circle about 160px across near x=190, y=300.

Run the green band at 115 degrees from the bottom-left corner to the top-right, crossing at about x=700.
Keep the left 420px as plain black, so the photo sits on a field and not on the band. Set one uppercase
line at 62px inside the band starting x=760, ending by x=1500.

Never put type in the left 420px. On this banner the photo does not overlap the band, it overlaps
whatever you were proud of.

## 7. LinkedIn post image

1200×627. **This is where stadium is weakest, and dialling it down does not fix it.**

Say it plainly: in a feed of consultancy carousels, a black frame with a saturated green diagonal reads
as an advert for a sports brand. It gets attention and it costs authority, and on LinkedIn that trade is
usually wrong.

The rule: **use stadium on LinkedIn only when the post carries a number.** A launch count, a revenue
figure, a date, a result. The number justifies the scoreboard. Without one, switch to
[annual](../brand-annual/SKILL.md) or [swiss](../brand-swiss/SKILL.md) and keep the credibility.

When you do use it, dial down like this:

- Light mode, not dark. `#f2f4f3` field, `#0a0f0c` type. Green becomes fill only, per the green type rule above.
- One green element: a band behind the number. Nothing else is green.
- The number at 149px, the label at 23px Barlow. That is the whole image.
- Drop the diagonal texture entirely. Keep the 115 degree band.
- Do not clip the type off the edge here. Clipping reads as a broken export to a first-time viewer who has no other asset to compare it against.

## 8. Instagram carousel

1080×1350, 4:5. Margin 72px. Black field.

**Cover slide.** Two or three uppercase words at 300px, leading 0.82, clipped by the left edge,
vertically centred. A green 115 degree band runs the full height behind the final word. If there is a
number, it replaces the words entirely at 420px in green. Nothing else on the slide, ever.

**Interior slide.** This is the weak surface and there is no elegant answer. Stadium cannot hold a
paragraph, so do not ask it to. **One statement per interior slide, 18 words maximum, at 64px Barlow,
vertically centred, flush left.** A green 115 degree rule 3px thick sits above it. It belongs to the
cover through the identical black, the identical angle, and the identical margin.

If your content needs 60 words on a slide, **the carousel is not stadium**. Run it in
[buildspace](../brand-buildspace/SKILL.md), which was built to hold prose, and keep stadium for the cover of a
results post. Stretching it here produces a deck of black slides with lonely sentences on them, and
readers drop at slide three.

**End card.** One uppercase line at 120px: `FOLLOW FOR THE NUMBERS`. Handle at 32px IBM Plex Mono under
it. Green band behind the handle only.

**Swipe cue.** A green 115 degree band 24px wide runs off the right edge of every slide except the end
card, entering the frame at the top-right corner and exiting at the right edge. The angle points right
and down, so it reads as direction and not as decoration.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render. **Maximum three elements, ever.**

Black frame. Two or three uppercase words in Big Shoulders filling the left half at about 55% of frame
height, so roughly 400px, deliberately clipped by the left edge. A `#00e266` diagonal band behind the
last word, running the full height of the frame. If there is a number, it goes in green at 70% of frame
height and it is the only thing on the right half. Face at the right edge, cropped at the shoulder,
never centred.

**The recurring rule:** the green band is always at 115 degrees and always runs the full frame height,
and the type is always clipped on the left. That angle at that scale is the sidebar-size cue. The words,
the number, and the face change every video; the band never does.

## 10. YouTube edit style

- **Cut rhythm** — fast. Average shot 2 to 3 seconds. A cut lands **on the beat of a spoken number**, which is the direction's own rhythm. No shot runs past 6 seconds without a cutaway.
- **Titles and lower thirds** — Big Shoulders uppercase at 96px, bottom-left, inset 64px, white on black with a green 115 degree band behind the last word. The band wipes in over 340ms on the house ease and the text does not move. It holds 2.5 seconds and cuts out with no fade.
- **B-roll** — high contrast. Crush blacks to `#07090a`, hold whites at 100, saturation 115%, no grain. Speed ramps are allowed here and only here: one ramp per video, into the moment the number appears.
- **Transitions** — cut only, with one exception: the green diagonal wipe at 115 degrees, used to enter a new chapter, at most three times per video.
- **Cold open** — the number, in the first second, at full frame height, in green on black, with the wipe. Then cut to the face. No logo, no intro, no build-up. The direction has one trick and it spends it immediately, which is correct at the retention cliff.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify to two shapes.

Black `#07090a`. One green 115 degree band 700px wide crossing the full square, corner to corner. The
show name in uppercase Big Shoulders sitting inside the band in `#05140c`, one word if possible, two at
most, set to fill 80% of the band's length.

Drop the texture, the portrait, the tagline, the episode number, and any second green element. At 150px
the diagonal texture becomes grey noise. Do not clip the show name here. A podcast app gives you no
second asset for the reader to infer the missing letters from.

## 12. Deck and talks

16:9 at 1920×1080, read from the back of a room. Every slide is one uppercase statement or one number,
filling at least half the slide height. Green is used once per slide and never twice.

- **Title** — the title at 260px, clipped by the left edge, green band full height behind the last word. Speaker and date at 28px IBM Plex Mono, bottom-right.
- **Section divider** — a full-bleed green field with the section name in `#05140c` at 300px. This is the only slide where green is the background, which is what makes the divider land.
- **Data** — one number at 420px in green on black, the label at 40px Barlow in muted underneath. One number per slide. Green is legal as type here because the field is black. On a light deck it is not, per the green type rule.
- **Wordy slides** — 20 words maximum, at 56px minimum. That is the ceiling, not a guideline. Past 20 words, stop using this direction for that slide and put the content in the notes, or hand the whole section to [swiss](../brand-swiss/SKILL.md).

---

## Cost to run

**Moderate.** Cheaper than [risograph](../brand-risograph/SKILL.md) or [flyer](../brand-flyer/SKILL.md), more
expensive than [buildspace](../brand-buildspace/SKILL.md).

There is no per-asset craft step: no texture to hand-tune, no halftone, no knock-out. Once you build one
template with the 115 degree band and the clipping mask, most assets are a type swap. A thumbnail is 10
minutes. A carousel cover is 10 minutes.

The cost is not in the pixels. It is in the **supply of content**. Stadium needs a number, a result, or
a date, and you do not have one every week. Trying to run it weekly means inventing a scoreline for a
week where nothing scored, and that is how the direction loses its meaning. Budget it for launch weeks
and results posts: maybe 15 to 20 uses a year.

## Pairs with / clashes with

**Pairs with** [buildspace](../brand-buildspace/SKILL.md) as the standard kit. buildspace holds the process
and the doubt; stadium lands the result. The handoff is clean because they never try to do each other's
job.
**Pairs with** [annual](../brand-annual/SKILL.md) when the number needs auditing rather than announcing.
**Pairs with** [dispatch](../brand-dispatch/SKILL.md) for news, though keep them apart in time: both are loud,
and used together in one week they read as panic.

**Clashes with** [manuscript](../brand-manuscript/SKILL.md) and [vellum](../brand-vellum/SKILL.md), which are built
for reflection, and stadium cannot be reflective at any setting.
**Clashes with** [arcade](../brand-arcade/SKILL.md): two maximal, saturated, dark-field directions that fight
for the same attention and cancel each other.
**Clashes with** [swiss](../brand-swiss/SKILL.md), because a neutral grid next to a clipped 216px headline
makes the swiss page look unfinished.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand-router/SKILL.md):
[broadsheet](../brand-broadsheet/SKILL.md), [swiss](../brand-swiss/SKILL.md), [manuscript](../brand-manuscript/SKILL.md),
[plaque](../brand-plaque/SKILL.md), [annual](../brand-annual/SKILL.md), [terminal](../brand-terminal/SKILL.md),
[blueprint](../brand-blueprint/SKILL.md), [spec](../brand-spec/SKILL.md), [oscilloscope](../brand-oscilloscope/SKILL.md),
[punchcard](../brand-punchcard/SKILL.md), [buildspace](../brand-buildspace/SKILL.md),
[risograph](../brand-risograph/SKILL.md), stadium, [arcade](../brand-arcade/SKILL.md), [flyer](../brand-flyer/SKILL.md),
[dispatch](../brand-dispatch/SKILL.md), [dusk](../brand-dusk/SKILL.md), [vellum](../brand-vellum/SKILL.md),
[aurora](../brand-aurora/SKILL.md), [porcelain](../brand-porcelain/SKILL.md).

## The failure mode

**A scoreboard with no score.** Stadium shouts by construction, so when the content has nothing to shout
about, the reader hears volume without information. The design still looks competent. It just stops
meaning anything, and after four of those posts the green band no longer signals "something happened",
which is the only thing it was ever signalling.

The second failure is slower and it happens on the interior slides. Someone needs to explain the result,
so they set 70 words at 32px on a black slide, under a green rule. The frame is stadium and the content
is an essay, and the mismatch reads as a brand that does not know what it is. Every one of those slides
should have been a different direction.

The check before you publish: name the number in this asset. If you cannot, stadium is the wrong
direction and no amount of angle fixes it.
