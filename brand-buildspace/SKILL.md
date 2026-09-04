---
name: brand-buildspace
description: "Use when applying the buildspace brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. Warm cream paper, all lowercase, a yellow marker highlight behind live text. Triggers: 'buildspace direction', 'lowercase warm brand', 'marker highlight style', 'community cohort branding', 'apply buildspace to my carousel'."
---

# buildspace

> a person typing in lowercase because the work is loud enough.

**emotion** warm, unserious, in-progress.
**signature** nothing is ever capitalised, and the accent is a marker highlight sitting behind live
text, not a background fill.
**use when** you want founders to feel like they are being talked to, not sold to. community, cohort,
newsletter, anything with a door open.
**avoid when** investors are the primary reader, or the page has to carry a number that a lawyer signs.
Both cases belong to [annual](../brand-annual/SKILL.md).

This is the everyday core. It must survive weekly publishing for a year. Its voice does more work than
its colour. Contract: [`../brand-router/_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor:
[`../brand-router/_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md).

---

## Tokens

### Palette

Light is native. Dark is **the same desk at night**, not an inverted page. The paper goes to a warm
brown-black and the pen ink becomes the paper. The marker keeps its exact yellow, because a highlighter
is the same colour under a lamp.

| Role | Light | Dark | Contrast light / dark |
|---|---|---|---|
| bg | `#fffdf7` | `#16150f` | — |
| surface | `#fff8e8` | `#211f16` | fg on surface 16.4 / 14.0 |
| fg | `#1c1a15` | `#f7f3e6` | 17.1 / 16.5 |
| muted | `#6b6455` | `#a39a83` | 5.8 / 6.5 |
| border | `#e6dcc4` | `#332f22` | hairline only |
| accent | `#ffc72c` | `#ffc72c` | fill only, never text |
| accentFg | `#1c1a15` | `#16150f` | 11.1 / 11.7 on accent |
| ring / alt | `#ff8a3d` | `#ff8a3d` | focus, second voice |

### Type

- **display** `"Instrument Serif", Georgia, serif` · 400 · tracking `-0.02em` · `text-transform: lowercase` · leading 1.02
- **body** `"Inter", system-ui, sans-serif` · 400 · tracking `0em` · leading 1.6
- **mono** `"JetBrains Mono", ui-monospace, monospace` · 400 · tracking `-0.01em` · leading 1.5. Timestamps, counts, code. Never body copy.
- Google: `Instrument Serif`, `Inter:wght@400;500;600`, `JetBrains Mono`.
- Scale 1.28 from 17px body: **17 / 22 / 28 / 36 / 46 / 58 / 75 / 96**.
- Measure 66 characters. Never two columns.

### Surface

Radius **14px** on every box; nothing is square. Shadow `0 2px 0 0 #1c1a15, 0 10px 24px -12px
rgba(28,26,21,0.35)` — the hard 2px offset is the pen line, the soft part is the lift, and you use both.
Hairline `1.5px solid #1c1a15`, ink weight, not a grey rule. Paper grain: `background-image:
radial-gradient(rgba(28,26,21,0.045) 1px, transparent 1px); background-size: 3px 3px;`

### The marker highlight

The one mechanic. It sits behind live text, so the text stays selectable and the bar wraps with the
line:

```css
background: linear-gradient(#ffc72c, #ffc72c) 0 78% / 100% 0.58em no-repeat;
```

Mark **one to three words**, never a full line, never a full heading. One highlight per screen. The bar
is 0.58em tall, sits on the baseline, and overlaps descenders. Never a rectangle around a block. Never
yellow text.

### Motion

`cubic-bezier(0.16, 1, 0.3, 1)`, 420ms. **The marker highlight wipes left-to-right behind the headline
once, on first paint. Everything else holds still.** Animate `background-size` from `0% 0.58em` to `100%
0.58em`. Text holds full opacity before, during, and after. Under `prefers-reduced-motion: reduce`,
paint the bar at full width with no wipe.

---

## 1. Voice and writing

The voice is the brand here. Wrong colours still read as buildspace. Wrong voice cannot be saved.

- **Tone** — a friend who has shipped and is telling you what actually happened, including the boring parts.
- **Casing** — all lowercase, always. Headlines, buttons, nav, logotype, CTA, alt text. Proper nouns too. Only quoted text and code identifiers escape.
- **Sentence rhythm** — short. Fragments are encouraged. Average 12 words. Start sentences with "and" or "but". One em-dash aside per paragraph, then stop.
- **The tell** — the paragraph admits something. Every piece names a thing that did not work, a number smaller than you hoped, or a part still unfinished. That admission is the direction. Lowercase alone is not.

**Do say** — "here's what i'm building" · "come build with us" · "still figuring this out" · "this took
four tries" · "i was wrong about the pricing" · "12 people showed up. that's 12 more than last time." ·
"no idea if this works yet"

**Don't say** — "leverage" · "unlock" · "empower" · "at scale" · "world-class" · "we're excited to
announce" · "revolutionise"

**Numbers rule.** Say the real number even when it is small. "12 people" beats "a growing community". A
rounded-up number breaks the direction, because the direction runs on being believed.

## 2. Landing page

One column, 640px wide, centred on the cream field. Sections divide by
**whitespace only**, 96px between them. No rules, no cards, no alternating bands. The page reads as one
long letter.

Hero: lowercase headline at 96px, Instrument Serif, leading 1.02, flush left, eight words maximum on two
lines. One body line under it at 22px in muted. One button under that: 17px, lowercase, radius 14,
`#fffdf7` fill, `#1c1a15` text, a 2px `#1c1a15` border, the 2px hard shadow. **Not a yellow button.**

**The one-yellow rule, resolved.** The element that carries the direction is the highlight on the last
two words of the hero headline, and it is the only yellow above the fold. The hero button loses its
`#ffc72c` fill for exactly that reason: a yellow button beside a yellow highlight puts two yellows on
one screen, the eye has to choose, and the mark stops being a mark. **A `#ffc72c` fill is licensed below
the fold only, one per screen, and never on a screen that already carries a highlight.** Body sections
are prose, not feature grids. If a grid is unavoidable, cap it at two columns of `#fff8e8` cards.

## 3. X / Twitter avatar

Renders at 48px. It survives, because it carries no type and no texture.

Photo, warm-cast, cropped tight to the face, on a flat `#ffc72c` square. No ring, no border, no marker.

Export 400×400. Face fills 78% of frame height, eyes on the upper third line. Warm +8, lift the black
point so nothing hits pure black. Yellow shows as a 6px to 10px margin on two sides only, never all
four. **Drop the paper grain at export.** A 3px grain does not survive 48px; it turns to mud.

## 4. X header and YouTube banner

2560×1440 for YouTube. A phone shows only the centre **1546×423**.

Inside the safe area: one lowercase sentence, Instrument Serif at 88px, flush left, 120px from the
safe-area left edge, vertically centred. The last two words carry the highlight. Nothing else.

Outside it: cream and grain, and nothing more. No portrait, no logo lockup, no social icons. Everything
out there is decoration most people never see.

X header is 1500×500: same sentence at 72px, and keep the lower-left 360×360 clear for the avatar
overlap.

## 5. Open Graph card

1200×630, seen at roughly 400×210.

Cream field. Lowercase headline top-left, inset 72px, Instrument Serif at 68px, nine words maximum on
two lines. Highlight the last two words only. Bottom-left in JetBrains Mono at 20px: `pooriaarab.com`.

Drop the grain, the byline, the avatar, and the date. 68px shrinks to about 23px in feed, which is the
floor for this serif. Anything under 44px on the card is unreadable and wastes the space.

## 6. LinkedIn banner

1584×396. On desktop the profile photo covers a circle about 160px across centred near x=190, y=300, and
it eats the lower-left corner.

Put nothing in the left 420px. Set one lowercase sentence in Instrument Serif at 56px from x=460,
vertically centred, ending by x=1500. Highlight two words. Keep 84px of right margin. Mobile crops both
sides hard, so keep the sentence between x=380 and x=1200 if it has to hold on both.

## 7. LinkedIn post image

1200×627. The most conservative room this brand enters.

Dial buildspace **down about 30%**, here only:

- Keep all lowercase. It is the direction. Do not capitalise to fit in.
- Shrink the highlight from three words to one.
- Raise body from 17px to 20px; desktop LinkedIn skims.
- Soften the shadow to `0 1px 0 0 #1c1a15`.
- Use the `#fff8e8` surface instead of the bright cream field, so it reads as a document rather than a poster.

Do not add a border, a logo bar, or a headshot. Those reflexes turn the direction into a template.

## 8. Instagram carousel

1080×1350, 4:5. Use the full height. Margin 72px all sides.

**Cover slide.** Lowercase headline, Instrument Serif, 128px, leading 1.02, flush left, vertically
centred, seven words maximum. Highlight two words. Cream field, no photo, no logo, nothing else. If the
headline needs more than seven words, the idea is not ready to be a cover.

**Interior slide.** Body at 44px Inter, leading 1.6, flush left, 55 words maximum. A lowercase kicker at
26px in muted sits 72px above it and names the slide, for example `what actually happened`. It belongs
to the cover because it shares the exact cream, the exact margin, and the lowercase. At most one
highlight, and most interiors have none.

**End card.** The ask is a follow, because Instagram kills links. One lowercase line at 72px: `more of
this, weekly`. Under it at 32px: `@pooriaarab`, with the highlight on the handle. Nothing else.

**Swipe cue.** A `#ffc72c` bar 10px wide, full height, flush to the right edge of every slide except the
end card. On the cover it is the only other yellow. It says "there is more" without an arrow, and an
arrow would break the calm.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render.

Four lowercase words maximum, Instrument Serif, marker-highlighted. Face bottom-right, never centred.

Type block starts 80px in and holds the left 58% of the frame, set at 150px, leading 1.0, two lines.
Highlight **one word only**, full `#ffc72c`. Face bottom-right, cropped at the shoulder, bleeding off
the right and bottom edges.

**The recurring rule:** the yellow bar is always horizontal, always behind one word, always in the lower
half of the type block. That one bar on cream is the sidebar-size cue. Everything else changes per
video, so the set stays recognisable without going identical.

Never an outline on the type, an arrow, a red circle, a shocked face, or a fifth word.

## 10. YouTube edit style

- **Cut rhythm** — slow. Average shot 4 to 6 seconds. A cut lands on the end of a sentence, never mid-clause. No jump cuts inside one thought. The pace is the argument that this person is not performing.
- **Titles and lower thirds** — Instrument Serif, lowercase, 64px at 1080p, bottom-left, inset 80px. Text sits on the footage with no bar and no box. It arrives at full opacity and rises 12px into place over 420ms on the house ease, then holds 3 seconds. **It never fades up from nothing** — a title that starts invisible is a title lost to a thumbnail grab, a scrub or a paused frame, and the only thing that should move is its position. One highlight may wipe behind one word, once per video.
- **B-roll** — warm grade. Lift shadows to about 8% so nothing is black, temperature +6, saturation 100%, 2% film grain. Speed stays 100%. No ramps.
- **Transitions** — cut only. One exception: a 200ms cross-dissolve for a time jump, twice per video maximum.
- **Cold open** — the first three seconds are the admission. Open on the face, mid-sentence, saying the thing that did not work. No logo, no intro animation, no "hey guys". A title card, if any, arrives at 0:08 and lasts 1.5 seconds.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify to two elements.

Cream `#fffdf7`. The show name in lowercase Instrument Serif filling 72% of the frame width, flush left
with a 240px inset, vertically centred, two words maximum. A `#ffc72c` bar behind the second word at
0.58em of the type size.

Drop the grain, the portrait, the tagline, the episode count, and the border. At 150px the grain is
invisible and the tagline is a smudge. If the name runs past two words, set two lines and highlight the
shortest word.

## 12. Deck and talks

16:9 at 1920×1080, read from the back of the room. One idea per slide, lowercase, and the yellow only
ever marks the one word that matters.

- **Title** — lowercase title in Instrument Serif at 180px, flush left, 160px inset, vertically centred. Name and date at 36px Inter in muted, bottom-left. One highlighted word.
- **Section divider** — the section name alone at 240px, flush left, vertically centred. No number, no rule, no yellow.
- **Data** — the number at 320px in Instrument Serif, the label under it at 48px Inter in muted. One number per slide. Three numbers means three slides. Highlight nothing here; yellow on a number looks like a claim.
- **Wordy slides** — 40 words maximum, 48px minimum, five lines maximum. Past that, split the slide. If it still will not fit, it is a document and not a slide, and this direction is honest enough to say so from the stage.

---

## Cost to run

**Cheap.** The cheapest of the expressive family, and that is why it is the core. A carousel takes about
15 minutes in any tool that sets type on a cream rectangle. There is no per-asset craft step: no texture
to hand-tune, no misregistration to fake, no halftone to grade, no rotation to eyeball. The highlight is
one CSS line on the web and one rectangle everywhere else.

The real cost is the voice. Every post needs a true admission, and you cannot batch that. Budget writing
time, not design time. A week where nothing went wrong is a week with nothing to post. That is the tax.

One person can publish this weekly for a year. Most of the other nineteen cannot.

## Pairs with / clashes with

**Pairs with** [annual](../brand-annual/SKILL.md) for the money register — when a number needs a lawyer's
signature, buildspace hands over, then takes the week after back. **Pairs with**
[dispatch](../brand-dispatch/SKILL.md) for announcements: buildspace cannot land hard news, because everything
in it is lowercase and provisional, so dispatch carries the launch date.
[manuscript](../brand-manuscript/SKILL.md) is a quiet long-read companion; both are warm and paper-based, so
the switch does not jar.

**Clashes with** [stadium](../brand-stadium/SKILL.md), its direct opposite — all caps, present tense, certain.
On one page the two read as two different people.
**Clashes with** [terminal](../brand-terminal/SKILL.md), because monospace body against Inter body reads as
two products, not two moods. **Clashes with** [porcelain](../brand-porcelain/SKILL.md), whose precision makes
buildspace look sloppy instead of honest.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand-router/SKILL.md):
[broadsheet](../brand-broadsheet/SKILL.md), [swiss](../brand-swiss/SKILL.md), [manuscript](../brand-manuscript/SKILL.md),
[plaque](../brand-plaque/SKILL.md), [annual](../brand-annual/SKILL.md), [terminal](../brand-terminal/SKILL.md),
[blueprint](../brand-blueprint/SKILL.md), [spec](../brand-spec/SKILL.md), [oscilloscope](../brand-oscilloscope/SKILL.md),
[punchcard](../brand-punchcard/SKILL.md), buildspace, [risograph](../brand-risograph/SKILL.md),
[stadium](../brand-stadium/SKILL.md), [arcade](../brand-arcade/SKILL.md), [flyer](../brand-flyer/SKILL.md),
[dispatch](../brand-dispatch/SKILL.md), [dusk](../brand-dusk/SKILL.md), [vellum](../brand-vellum/SKILL.md),
[aurora](../brand-aurora/SKILL.md), [porcelain](../brand-porcelain/SKILL.md).

## The failure mode

**Lowercase without the admission.** The direction collapses into a startup landing page that forgot to
press shift. Every one of those exists already, and readers now read lowercase as a style choice, not as
a signal about the writer.

You can watch it happen. The copy stays lowercase but starts saying "we're building the future of" and
"join the waitlist". The highlight spreads from two words to a line, then to a filled block behind a
heading, which is a background and not a marker. The numbers round up. The admission goes first, because
it is the hardest part to write and the easiest to cut.

The check before you publish: point at the sentence that cost something to say. If there is none, do not
ship it as buildspace. Ship it as [swiss](../brand-swiss/SKILL.md), which is honest about being neutral.
