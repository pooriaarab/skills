---
name: brand-risograph
description: "Use when applying the risograph brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. Two flat inks on warm paper, fluorescent pink over federal blue, deliberate misregistration. Triggers: 'risograph direction', 'riso print style', 'two-ink zine brand', 'misregistration design', 'apply risograph to my carousel'."
---

# risograph

> two plates, one pass each, and the pink never quite lands on the blue.

**emotion** handmade, fluorescent, off-register.
**signature** every element is printed twice, fluorescent pink and federal blue, 2px apart, and the
paper stays visible through both. Where the inks cross they multiply into violet, and that violet is the
only dark colour in the system.
**use when** the work is a zine, a drop, an essay, or a small-batch thing made by hand. Anywhere the
seams should show and the reader should feel a person set the type.
**avoid when** the page carries a price, a legal term, or a data table. Misregistration reads as an
error when the content has to be exact. Send those to [annual](../brand-annual/SKILL.md) or
[spec](../brand-spec/SKILL.md).

**Not [flyer](../brand-flyer/SKILL.md).** riso is flat, aligned, and lowercase, on clean warm paper. Nothing
rotates. Nothing is torn. The misregistration is a press tolerance, not damage. flyer is the opposite on
all four counts.

Contract: [`../_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor:
[`../_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md).

---

## Tokens

### Palette

Light is native. Dark is **the overprint**, not an inversion. It is the page where both plates laid down
solid and multiplied: `#180e33` violet-black. The paper is gone because the ink covered it. The pink
stays at exactly `#ff48b0`, because a fluorescent ink does not get darker when you print more of it.

| Role | Light | Dark | Contrast light / dark |
|---|---|---|---|
| bg | `#f4efe1` paper | `#180e33` violet | — |
| surface | `#fbf7ed` | `#241748` | — |
| fg | `#241548` | `#f4efe1` | 14.3 / 15.9 |
| muted | `#5f4a86` | `#b49fd6` | 6.5 / 7.7 |
| border | `#b9a8d6` | `#3a2a66` | hairline only |
| accent (pink) | `#ff48b0` | `#ff48b0` | fill only, never body text |
| accentFg | `#241548` | `#180e33` | 5.3 / 5.9 on pink |
| ring / alt (blue) | `#2b44a8` | `#7c93ff` | 7.3 on paper, safe as text |
| alt2 | `#1b0f3b` | `#ffb3de` | overprint violet / pink tint |

**Pink is a plate, not a text colour.** Pink type on paper is 2.6:1 and fails. Set pink as a solid block
with `#241548` on it, or as the back plate under blue type.

### Type

- **display** `"Archivo Black", "Helvetica Neue", Arial, sans-serif` · 400 · tracking `-0.035em` · `text-transform: lowercase` · leading 0.94
- **body** `"Space Grotesk", system-ui, sans-serif` · 400 · tracking `-0.005em` · leading 1.55
- **mono** `"Space Mono", ui-monospace, monospace` · 400 · tracking `-0.02em` · leading 1.45. Print marks only: run counts, dates, page numbers.
- Google: `Archivo Black`, `Space Grotesk:wght@400;500;700`, `Space Mono:wght@400;700`.
- Scale 1.25 from 17px body: **17 / 21 / 27 / 33 / 42 / 52 / 65 / 81**.
- Measure 68 characters. Two columns only above 1280px.

### Surface

Radius **3px**, the softening a paper edge gets, not a rounded card. Shadow `3px 3px 0 0
rgba(43,68,168,0.9), 0 14px 28px -18px rgba(36,21,72,0.55)` — the hard blue offset is the second plate;
the soft part is the sheet lifting. Hairline `2px solid #2b44a8`. Ink texture:

```css
background-image:
  radial-gradient(circle at 50% 50%, rgba(255,72,176,0.55) 0.9px, transparent 1.1px),
  radial-gradient(circle at 50% 50%, rgba(43,68,168,0.45) 0.9px, transparent 1.1px),
  radial-gradient(rgba(36,21,72,0.05) 0.7px, transparent 0.8px);
background-size: 4px 4px, 4px 4px, 3px 3px;
background-position: 0 0, 2px 1px, 0 0;
mix-blend-mode: multiply;
opacity: 0.65;
```

### The two-plate rule

Every element exists twice. The blue plate is the true position. The pink plate sits **2px right and 1px
down** from it and multiplies. Where they overlap you get violet, and violet is the only dark you are
allowed to invent. Offset scales with the asset: **0.5% of the asset's short edge**, so 2px at 400px and
7px at 1350px. A fixed 2px on a carousel is invisible and wastes the whole idea.

### Motion

`cubic-bezier(0.16, 1, 0.3, 1)`, 380ms. **On first paint the pink plate sits 5px right and 3px down from
the blue plate. It slides toward register over one beat and stops 1px short. The press never quite
closes the gap.** Once per page load, and nothing else in the layout moves. Animate `transform:
translate()` on the pink layer only. Both layers are visible at full opacity the whole time. Under
`prefers-reduced-motion: reduce`, render the pink plate at its final 1px-short position with no slide.

---

## 1. Voice and writing

- **Tone** — someone showing you the thing they made on a machine in the back room, pointing at the parts that went wrong on purpose.
- **Casing** — sentence case for prose, lowercase for headlines and buttons. Never all caps, anywhere, at any size.
- **Sentence rhythm** — medium and even. 15 to 20 words. Full sentences, few fragments. The writing is calm because the printing is not.
- **The tell** — the piece names its own edition size and its own flaws. A number of copies, a date of the run, a thing that went wrong on the second pass. It reads as a colophon that wandered into the body copy.

**Do say** — "printed 60 of these" · "the misregistration is the point" · "second pass, still wet" ·
"made in an afternoon" · "the blue plate ran light" · "there are 12 left"

**Don't say** — "pixel-perfect" · "flawless" · "seamless" · "enterprise-grade" · "production-ready" ·
"crisp"

**Quantity rule.** Name a finite number of the thing. Editions, seats, copies, slots. The direction is
about a small batch, so an unlimited offer contradicts the ink.

## 2. Landing page

Single column, 680px, on the paper field, left-aligned with a 96px left margin that never centres.
Sections divide by a `2px solid #2b44a8` rule with a pink rule 3px under it. That doubled rule is the
section marker and the only divider.

Hero: lowercase headline in Archivo Black at 81px, leading 0.94, three lines maximum. One pink block
sits behind the final line only, with the blue plate 3px off it. Body at 17px Space Grotesk underneath.

The element that carries the direction is the plate offset on the hero block. Nothing rotates anywhere
on the page. A rotated element here is [flyer](../brand-flyer/SKILL.md), not this.

## 3. X / Twitter avatar

Renders at 48px. **The misregistration does not survive it.** A 3px offset on a 400px export is 0.36px
at 48px, which is a blur, not a print.

Design at 400×400: portrait knocked out to two flat tones, pink shadows and blue midtones, on `#f4efe1`,
offset 3px so the blue edge shows on the left of the face. Square crop, collarbone to just above the
hairline. No ring, no border, no soft edge.

**The 48px export variant:** push the offset to **16px** (4% of the frame) and drop the ink grain
entirely. At that size the double edge reads as a deliberate second plate instead of a rendering fault.
Keep the two tones flat with no gradient between them, or the face turns to a smudge.

## 4. X header and YouTube banner

2560×1440 for YouTube. The phone shows only the centre **1546×423**.

Inside the safe area: a single pink horizontal bar 96px tall across the lower third, with a blue bar 4px
under it, and one lowercase sentence sitting on the bar in `#241548` at 64px Archivo Black. No portrait,
no logo lockup.

Outside the safe area: paper and ink grain. The bars run full width to 2560px so the desktop crop looks
printed rather than cropped, but every word stays inside 1546×423.

X header is 1500×500: the same bar at 220px from the top, sentence at 52px, and the lower-left 360×360
kept clear for the avatar.

## 5. Open Graph card

1200×630, seen at roughly a third.

Paper field. Lowercase headline top-left at 72px, eight words maximum, wrapping to two lines. One pink
block behind the final line only, blue plate 3px off it. Bottom-left in Space Mono at 20px:
`pooriaarab.com`. Nothing in the right third, which is the paper margin.

Raise the plate offset to 6px for this card. Drop the ink grain and the body copy. At 400px wide the
grain is noise and 72px falls to 24px, which is the floor for Archivo Black lowercase.

## 6. LinkedIn banner

1584×396. The desktop profile photo covers a circle about 160px across near x=190, y=300, in the
lower-left corner.

Keep the left 420px as clean paper. Run the pink bar from x=420 to the right edge at 120px tall,
bottom-aligned with a 48px gap under it, blue bar 4px below. Set one lowercase line at 48px on the bar
in `#241548`, starting x=470. The bar bleeding off the right edge is the print cue.

## 7. LinkedIn post image

1200×627. The most conservative room the brand enters.

Dial risograph **down about 40%**:

- Cut the plate offset from 6px to 3px. It still reads as print, not as a broken export.
- Drop the ink grain to `opacity: 0.35`.
- Use blue `#2b44a8` for the headline instead of a pink block. Blue on paper is 7.3:1 and it does not look like a mistake to a first-time reader.
- Keep one pink element only: a solid block behind two words, `#241548` on it.
- Raise body to 22px.

Do not explain the misregistration in the caption. A brand that defends itself in a caption has already
lost the room.

## 8. Instagram carousel

1080×1350, 4:5. Margin 84px. Plate offset 7px on every slide.

**Cover slide.** Three or four lowercase words in Archivo Black at 190px, leading 0.94, flush left,
bottom-aligned to the margin. A pink block sits behind the last word, blue plate 7px off it. Paper field
above, empty. No photo. The empty top two thirds is the paper, and it is what stops the thumb in a feed
of full-bleed images.

**Interior slide.** Body at 42px Space Grotesk, leading 1.55, flush left, 60 words maximum. A blue `2px`
rule with a pink rule 4px under it sits at the top of the text block. It belongs to the cover through
the identical paper, the identical margin, and the same doubled rule. Pink appears on at most one word,
as a block.

**End card.** Paper field. `made 60 of these` at 120px lowercase, and under it `@pooriaarab` at 36px
Space Mono. Pink block behind the number only.

**Swipe cue.** A pink bar 14px wide runs the full height flush to the right edge, with a blue bar 14px
wide directly under it, offset down by 7px so it pokes past the bottom corner. The offset pair is the
cue. It says both "there is more" and "this is printed" in one mark.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render.

Paper `#f4efe1` fills the frame. Three lowercase words maximum in Archivo Black at roughly 42% of frame
height, so about 300px, sitting in the left two thirds, printed blue `#2b44a8` with a fluorescent pink
duplicate **8px** behind it. Blue reads at 7.3:1 on paper and pink reads at 2.6:1, so blue takes the
front plate and pink stays behind it, exactly as the token contract requires. That offset is the whole
recognition cue at sidebar size, so it is exaggerated well past the 0.5% rule here on purpose.

Face on the right third, two-tone, cropped so the crown leaves the top edge.

**The recurring rule:** the **pink** plate always sits behind the blue and offset **down-left** of it,
never the reverse. Blue is 7.3:1 on paper and pink is 2.6:1, so blue is the only plate that may carry a
word and pink exists only to double it. The paper always shows through at least 40% of the frame. Never centre the type, never add an outline, never fill
more than 60% of the frame with ink. The words change every video; the offset direction never does.

## 10. YouTube edit style

- **Cut rhythm** — even and unhurried. Average shot 5 seconds. Cuts land on a full stop. No cut inside a clause. The edit is as calm as the prose, because the ink is doing the shouting.
- **Titles and lower thirds** — Archivo Black lowercase at 72px, bottom-left, inset 96px, in `#241548` on a pink block with the blue plate 6px off. The title arrives with the pink plate 20px out of register and slides to 3px short over 380ms. It holds 3 seconds and cuts out with no fade.
- **B-roll** — posterise to two inks. Pink in the shadows, blue in the midtones, paper in the highlights, no third colour. Add 3% grain. Speed 100%. Never grade a shot to full colour and then cut it against a two-ink shot; pick one and hold it for the whole video.
- **Transitions** — cut only. The single exception is a two-frame paper-white flash between chapters, at most four times per video.
- **Cold open** — three seconds of the thing being made: hands, a machine, a stack of the object. No face, no talking. The first word is spoken over the second shot.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify to one word and one offset.

Paper `#f4efe1`. The show name in lowercase Archivo Black filling 78% of the frame width, flush left
with a 300px inset, vertically centred, printed blue `#2b44a8` with a fluorescent pink duplicate **60px**
behind it, down and left. Blue is the front plate here for the same reason as the thumbnail: pink type
on paper is 2.6:1 and fails. Two words maximum.

Drop the ink grain, the portrait, the rules, the tagline. At 150px the only thing that survives is the
doubled letterform, so make the offset 2% of the frame instead of 0.5%. Anything subtler looks like a
compression artefact in a podcast app.

## 12. Deck and talks

16:9 at 1920×1080. One idea per slide, lowercase, left-aligned on paper. Plate offset 8px throughout.
Every slide number is printed in blue, bottom-right, misregistered 2px.

- **Title** — the title in Archivo Black at 200px, three lines maximum, pink with the blue plate behind. Speaker and date at 32px Space Mono, bottom-left.
- **Section divider** — a full-width pink bar 240px tall with a blue bar 8px under it, and the section name lowercase at 96px sitting inside the bar in `#241548`.
- **Data** — one number at 300px in blue, never pink, because a pink number on paper is 2.6:1 from the back of a room. The label at 44px Space Grotesk in muted underneath. Never misregister a number. Register it exactly, and let the misregistration everywhere else make the exactness read as a decision.
- **Wordy slides** — 45 words maximum at 44px minimum, six lines maximum. Rules and blocks are banned on a wordy slide. Paper, blue type, nothing else.

---

## Cost to run

**Expensive.** Be honest about this before you adopt it.

Every asset needs three hand steps that no template does for you. You knock the photograph out to
exactly two flat tones and check that no third tone crept in. You duplicate every element, offset the
copy, and set the overlap to multiply. You then check every violet overlap by eye, because multiply on
top of a warm paper does not always land where the preview said.

Real numbers: a carousel is 60 to 90 minutes, against 15 for [buildspace](../brand-buildspace/SKILL.md). A
thumbnail is 25 minutes. The two-ink portrait treatment is 20 minutes per photograph and it does not
batch, because the tone split depends on the individual image.

**One person publishing weekly cannot run this as the everyday direction.** It is a drop direction. Use
it four to eight times a year, on the thing that deserves a print run, and let a cheap direction carry
the other 44 weeks. Anyone who adopts it as the daily system stops posting inside a month, and that is
the most common way a personal brand dies.

## Pairs with / clashes with

**Pairs with** [buildspace](../brand-buildspace/SKILL.md) as its everyday partner. Both are warm,
lowercase-leaning, and paper-based, and buildspace is cheap enough to carry the weeks risograph cannot.
**Pairs with** [manuscript](../brand-manuscript/SKILL.md) for a long essay, since both treat the page as a
physical object. **Pairs with** [annual](../brand-annual/SKILL.md) when the drop needs a price list, because
risograph must never set a price itself.

**Clashes with** [flyer](../brand-flyer/SKILL.md) hardest of all. They look adjacent and they are opposites:
riso is aligned and flat, flyer is rotated and torn. Side by side, one of them looks like a broken
version of the other.
**Clashes with** [porcelain](../brand-porcelain/SKILL.md), whose whole argument is that nothing is off by a
pixel. **Clashes with** [swiss](../brand-swiss/SKILL.md), because a grid this exact makes the offset read as
an error.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand-router/SKILL.md):
[broadsheet](../brand-broadsheet/SKILL.md), [swiss](../brand-swiss/SKILL.md), [manuscript](../brand-manuscript/SKILL.md),
[plaque](../brand-plaque/SKILL.md), [annual](../brand-annual/SKILL.md), [terminal](../brand-terminal/SKILL.md),
[blueprint](../brand-blueprint/SKILL.md), [spec](../brand-spec/SKILL.md), [oscilloscope](../brand-oscilloscope/SKILL.md),
[punchcard](../brand-punchcard/SKILL.md), [buildspace](../brand-buildspace/SKILL.md), risograph,
[stadium](../brand-stadium/SKILL.md), [arcade](../brand-arcade/SKILL.md), [flyer](../brand-flyer/SKILL.md),
[dispatch](../brand-dispatch/SKILL.md), [dusk](../brand-dusk/SKILL.md), [vellum](../brand-vellum/SKILL.md),
[aurora](../brand-aurora/SKILL.md), [porcelain](../brand-porcelain/SKILL.md).

## The failure mode

**The offset stops being a decision and becomes a bug.** Misregistration only reads as craft when
everything else is exact. The moment a margin is off, a baseline drifts, or a photograph is left at
three tones instead of two, the reader stops seeing a press tolerance and starts seeing a mistake. There
is no middle state. The direction is either printed or broken.

The second failure is drift toward [flyer](../brand-flyer/SKILL.md). Someone rotates a block two degrees "for
energy". Someone adds a torn edge. Someone sets a word in caps. Each is a small, reasonable-looking
move, and three of them turn a quiet zine into a photocopied poster with a pink accent.

The check before you publish: every element is either perfectly aligned or offset by exactly the plate
distance. Nothing sits between the two. If you cannot say which of the two a given element is, it is the
bug.
