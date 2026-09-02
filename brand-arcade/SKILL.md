---
name: brand-arcade
description: "Use when applying the arcade brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. CRT tube, pixel type, cyan and magenta at full saturation, scanlines over everything. Triggers: 'arcade direction', 'CRT pixel style', 'retro game brand', 'scanline design', 'apply arcade to my thumbnail'."
---

# arcade

> a cabinet screen at the back of the room, still on, still asking for a coin.

**emotion** electric, nostalgic, maximal.
**signature** everything is drawn on a curved CRT: pixel type on a purple-black tube, cyan and magenta
at full saturation, and horizontal scanlines running through every surface including the photographs.
**use when** the work is playful, a side project, a game, a launch that wants a crowd. Anywhere a bit of
noise is the correct answer.
**avoid when** anyone is reading for longer than a minute, or the audience is institutional. **Pixel
type at paragraph length is a punishment.** Send long reads to [manuscript](../brand-manuscript/SKILL.md) and
institutional work to [annual](../brand-annual/SKILL.md).

Contract: [`../_lib/surfaces.md`](../brand/_lib/surfaces.md). Floor:
[`../_lib/craft-floor.md`](../brand/_lib/craft-floor.md).

---

## Tokens

### Palette

Dark is native. Light is **the instruction card under the control panel glass**, not an inverted page:
pixel art printed on white card, sitting next to the tube. A printed card has no scanlines and no
vignette, so **light mode drops the whole texture layer**. Keep the pixels, lose the glass.

| Role | Dark (native) | Light | Contrast dark / light |
|---|---|---|---|
| bg | `#0b0420` tube | `#f2ecff` card | — |
| surface | `#17093a` | `#ffffff` | — |
| fg | `#eaf7ff` | `#1a0740` | 18.3 / 15.9 |
| muted | `#9a86d6` | `#5b3e9e` | 6.4 / 6.9 |
| border | `#2e1668` | `#c9b8f2` | hairline only |
| accent (cyan) | `#22e4f5` | `#22e4f5` | 12.8 on tube · **1.4 on card, fill only** |
| accentFg | `#06131a` | `#06131a` | 12.1 on cyan |
| ring / alt (magenta) | `#ff2e88` | `#c4116e` | 5.7 / 5.0 |
| alt2 (coin gold) | `#ffe14d` | `#8a6a00` | 15.3 / 5.4 |

**Cyan is a light source, not a pigment.** On the tube it carries type at 12.8:1. On the light card it
is 1.4:1 and it is fill only, with `#06131a` on top. The light mode uses `#c4116e` magenta and `#1a0740`
for every word.

### Type

- **display** `"Press Start 2P", "Courier New", monospace` · 400 · tracking `0.02em` · uppercase · leading 1.4
- **body** `"VT323", "Courier New", monospace` · 400 · tracking `0.01em` · leading 1.35
- **mono** `"Silkscreen", ui-monospace, monospace` · 400 · tracking `0.04em` · uppercase · leading 1.5
- Google: `Press Start 2P`, `VT323`, `Silkscreen:wght@400;700`.
- Scale 1.5 from 16px: **16 / 24 / 36 / 54 / 81 / 122 / 183**.
- Measure 55 characters, because VT323 is narrow. Never two columns.

**Monospace body earns its place here** because the direction *is* a screen. A CRT drew a fixed grid of
character cells, and VT323 is that grid. Every other direction has to argue for mono. This one is mono
by construction, and Inter on a tube would be the lie.

### The pixel type floor

**Press Start 2P at 5px is unreadable on a phone.** So is 8px. This is the direction's hardest
constraint and you plan around it, not past it.

| Size | What to set |
|---|---|
| 16px and up (or 5%+ of an image's short edge) | Press Start 2P |
| 12px to 16px | Silkscreen, which is wider and simpler |
| under 12px, dark | **Stop using pixel type.** Set Barlow or the system sans, uppercase, weight 700, tracking `0.06em`, in `#22e4f5` with a 2px `#ff2e88` shadow down-right |
| under 12px, light | Same font, casing, weight and tracking, but in `#1a0740` with a 2px `#c4116e` shadow down-right |

**The small-text fallback is the one place the two modes cannot share a colour.** Cyan is 12.8:1 on the
tube and 1.4:1 on the card, and the card rule says cyan is fill only. So the light card sets the words
in `#1a0740` (15.9:1) and keeps the offset edge in `#c4116e` magenta (5.0:1). Never put cyan type on
the card at any size.

The double edge is the recognition cue, not the font: accent word, magenta shadow, 2px down-right. Keep
the edge and drop the pixels, and the asset still reads as arcade. Keep the pixels below the floor and
it reads as a broken image.

Character budgets, which follow from the floor: headline **14 characters**, OG headline 24, banner 30,
deck headline 24. Write to the budget before you design.

### Surface

Radius **0**, always. Shadow `3px 3px 0 0 #ff2e88, 0 10px 28px -12px rgba(34,228,245,0.40)` — a hard
magenta offset plus a cyan bloom. Hairline `2px solid #22e4f5`. Tube texture, dark mode only:

```css
background-image:
  repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px),
  repeating-linear-gradient(90deg, rgba(255,46,136,0.10) 0 1px, rgba(34,228,245,0.10) 1px 2px, transparent 2px 3px),
  radial-gradient(125% 105% at 50% 50%, transparent 52%, rgba(0,0,0,0.8) 100%);
background-size: 100% 3px, 3px 100%, 100% 100%;
mix-blend-mode: multiply;
opacity: 0.85;
```

Scanlines run over **everything**, photographs included. A clean photograph in an arcade layout looks
like a stock image someone forgot to treat.

### Motion

`cubic-bezier(0.2, 0.9, 0.1, 1)`, 300ms. **The tube powers on. A 2px cyan line snaps across the middle
of the viewport, holds for a frame, then opens vertically to full height and the page is already behind
it. Once, on first paint. After that the scanlines are static and nothing else animates.** Implement as
a `scaleY` on an overlay, over content that is already painted at full opacity. Scanlines never animate:
a scrolling scanline is a migraine and it fails `prefers-reduced-motion`. Under `prefers-reduced-motion:
reduce`, skip the power-on and show the page.

---

## 1. Voice and writing

- **Tone** — a cabinet attract screen. Short, shouted, second person, and it assumes you already want to play.
- **Casing** — ALL CAPS for every headline, button, and label. Body copy in sentence case.
- **Sentence rhythm** — 3 to 6 words. Fragments everywhere. Second person. Commands, not descriptions.
- **The tell** — the writing counts something down or scores something. A credit, a life, a high score, a timer. It always implies the reader is mid-game rather than being introduced to one.

**Do say** — "PRESS START" · "INSERT COIN" · "1 CREDIT REMAINING" · "NEW HIGH SCORE" · "CONTINUE?
9...8...7" · "PLAYER 2 HAS JOINED"

**Don't say** — "understated" · "curated" · "artisanal" · "minimal" · "elegant" · "refined" · "mindful"

**Length ceiling.** 40 words per asset, and no paragraph past 25 words. The avoid-when is not a style
note. VT323 at paragraph length genuinely hurts to read, and the direction has no honest answer for a
600-word post. Hand that to another direction.

## 2. Landing page

Full-bleed tube-black with the scanline overlay on the whole document, not just the hero. Content sits
in a 960px centred column, square-cornered, on `#17093a` surface panels with the 2px cyan hairline.

Hero: uppercase Press Start 2P at 54px, 14 characters maximum across two lines, centred, in cyan with a
4px magenta shadow down-right. Under it, VT323 at 36px, 25 words maximum. One square button: `#06131a`
on `#22e4f5`, Silkscreen caps at 24px, reading `PRESS START`.

Sections divide with a full-width 2px cyan rule and a Silkscreen section label in coin gold above it,
styled as a stage name: `STAGE 02`. Keep the top 15% of the viewport clear of type; that band is the
bezel.

The element that carries the direction is the vignette reaching the corners, so the frame looks curved.
A flat rectangle is not a tube.

## 3. X / Twitter avatar

Renders at 48px. It survives, because it is four flat colours and no type.

Portrait posterised to four colours, cyan, magenta, coin gold, and the `#0b0420` tube, then downsampled
so the pixels are visibly square at about **48 blocks across**. Scanlines over the top. Square crop,
head filling the frame edge to edge. No smoothing, ever.

Export **384×384** with nearest-neighbour scaling, so each block is exactly 8px — 48 × 8 = 384, and 400
is not divisible by 48, so a 400px export lands blocks on 8.33px and smears every edge. At 48px each
block lands on one device pixel, which is why 48 blocks is the right number and 96 is not. **Drop the scanlines below
96px export**: a 1px scanline on a 48px avatar is a grey wash over the face and it kills the
posterisation.

## 4. X header and YouTube banner

2560×1440 for YouTube. The phone shows only the centre **1546×423**.

Full-bleed tube-black with scanlines. A single row of cyan pixel type across the middle, **30 characters
maximum**, in Press Start 2P at 72px, with three magenta pixel hearts at the right end. No portrait.

Centre the row inside the safe area and keep the middle 400px clear of the hearts so the avatar overlap
does not sit on them. Outside the safe area: tube, scanlines, and vignette. The vignette must reach
2560px so the desktop crop is still curved.

X header is 1500×500: same row at 48px, 24 characters maximum, lower-left 360×360 clear.

## 5. Open Graph card

1200×630, seen at roughly a third.

Tube-black field with the vignette. Uppercase Press Start 2P headline centred,
**24 characters maximum** across two lines, cyan, at 54px. A magenta 2px rule under it, running the full
width of the text block. Bottom edge, Silkscreen at 24px: `PRESS START`. Nothing in the top 15%, which
is the bezel.

Keep the vignette and drop the scanlines. At 400px wide, a 3px scanline period aliases against the
feed's own scaling and turns the card into stripes. The vignette survives the shrink; the lines do not.

## 6. LinkedIn banner

1584×396. The desktop profile photo covers a circle about 160px across near x=190, y=300.

Tube-black with the vignette. One row of Press Start 2P at 44px, 22 characters maximum, starting at
x=470, vertically centred. Three magenta hearts at x=1420. Keep the left 420px as empty tube.

Drop the scanlines at this height. 396px tall with a 3px period gives 132 lines across a thin strip, and
LinkedIn's own compression turns that into banding.

## 7. LinkedIn post image

1200×627. The most conservative room the brand enters, and arcade is the loudest thing in this family.

Dial arcade **down about 50%**, and accept that it is still loud:

- Light mode. `#f2ecff` card, `#1a0740` type. The tube stays in the drawer.
- Drop scanlines, drop the vignette. A printed card has neither.
- Headline in Silkscreen, not Press Start 2P, at 44px. Silkscreen is legible to a reader who has no nostalgia for the reference.
- Cyan is fill only here, per the palette rule. Set `#06131a` on a cyan block, and use `#c4116e` magenta for any coloured word.
- Body in Barlow at 24px, not VT323. This is the one surface where the mono body does not earn it, because the tube is gone and the argument goes with it.

If that list feels like it removes the direction, that is the honest reading. Use arcade on LinkedIn for
a game, a side project, or a launch with a crowd. For anything else, run [swiss](../brand/swiss/SKILL.md).

## 8. Instagram carousel

1080×1350, 4:5. Margin 64px. This is arcade's best surface after YouTube.

**Cover slide.** Tube-black, scanlines, vignette to the corners. Two or three uppercase words in Press
Start 2P at 96px, **14 characters maximum**, centred in the upper third, cyan with a 6px magenta shadow
down-right. Coin-gold score digits bottom-left in Silkscreen at 36px, styled as a score: `00042000`.
Nothing else.

**Interior slide.** VT323 at 54px, leading 1.35, flush left, 25 words maximum. A Silkscreen kicker in
coin gold at 28px above it, reading as a stage name. It belongs to the cover through the identical tube
colour, the same scanlines, and the same vignette. The score in the corner increments across the deck,
which is the cheapest continuity device in the whole twenty and it works.

**End card.** `CONTINUE?` at 96px in Press Start 2P, and under it a countdown in coin gold: `9...8...7`.
Handle at 32px Silkscreen. The countdown is the ask, and it is the only end card in the family that
people screenshot.

**Swipe cue.** A magenta pixel arrow, drawn on the same 8px block grid as the avatar, sitting flush to
the right edge at the vertical centre, blinking is banned. It is 3 blocks wide and 5 blocks tall, in
`#ff2e88`, and it appears on every slide except the end card. A pixel arrow is native to the reference
in a way a chevron is not.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render.

Purple-black frame with the scanline overlay across everything, photograph included. Two or three
uppercase words in Press Start 2P, **14 characters total maximum**, centred in the upper third at about
18% of frame height, so about 130px, in cyan with a 4px magenta shadow down-right. Coin-gold score
digits bottom-left in Silkscreen. Face bottom-right, posterised to the same four colours, cropped at the
chest. The CRT vignette must reach the corners so the frame looks curved.

**The recurring rule:** cyan type, magenta shadow down-right, gold score bottom-left, vignette to the
corners. That cyan-on-magenta double edge is what reads from the sidebar. At 210px the 130px type
renders at about 21px, which clears the Press Start 2P floor with room to spare. The words and the face
change; the four-colour cast and the shadow direction never do.

## 10. YouTube edit style

- **Cut rhythm** — fast and mechanical. Average shot 1.5 to 2.5 seconds. Cuts land **on the frame**, quantised to a 12-frame grid at 24fps, so the whole video sits on a beat like a game loop. No cut is allowed to feel loose.
- **Titles and lower thirds** — Press Start 2P at 48px, top-left, inset 64px, cyan with a 4px magenta shadow. The title snaps in with no ease over 2 frames, holds 2 seconds, and snaps out. Never fade a pixel title; a fading pixel font shows its anti-aliasing and breaks the illusion.
- **B-roll** — posterise to the four colours, add the scanline overlay at 85% opacity, and keep it on every shot including the talking head. Speed 100%. One exception: a 4-frame stutter on the beat, at most twice per video.
- **Transitions** — cut only, with one exception: the tube power-on, a 2px cyan line opening vertically, used once at the top and once at the end.
- **Cold open** — three seconds of attract screen. Black tube, scanlines, `INSERT COIN` blinking twice in Silkscreen, then a hard cut to the face mid-sentence. It is the only cold open in the family that is allowed to be an animation, because the reference is an animation.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify hard.

Tube-black `#0b0420` with the vignette reaching the corners. The show name in Press Start 2P at 360px,
**one word, 8 characters maximum**, centred, cyan with a 24px magenta shadow down-right. Nothing else.

Drop the scanlines, the score, the portrait, and the tagline. At 150px a 3px scanline period is
invisible and the shadow is the only thing left, so scale the shadow to 0.8% of the frame instead of the
usual 4px. If the show name runs past 8 characters, set it in Silkscreen instead and keep the shadow.
Press Start 2P on two lines at 150px is unreadable.

## 12. Deck and talks

16:9 at 1920×1080. Every slide is a screen: black tube, scanlines, one uppercase pixel headline capped
at **24 characters**, and a coin-gold slide counter in the bottom-right styled as a score. Body copy in
VT323 at large size, 25 words maximum.

- **Title** — the title in Press Start 2P at 96px, two lines maximum, cyan with the magenta shadow, centred. `PRESS START` in Silkscreen at 32px underneath.
- **Section divider** — full-bleed tube with the section name in coin gold at 120px, styled as `STAGE 03`, and nothing else.
- **Data** — one number in coin gold at 240px, formatted as a score with leading zeros. The label at 44px VT323 in muted underneath. Gold reads at 15.3:1 on the tube, which is the highest contrast in the palette, so the number wins the room without a second colour.
- **Wordy slides** — 25 words maximum at 54px VT323 minimum. Past 25 words, the slide is not arcade. Put the detail in the notes and keep the screen a screen. A room reading a wall of pixel type stops listening to you.

---

## Cost to run

**Expensive**, and the cost is in an unusual place.

The pixels are cheap once the pipeline exists. Posterising a portrait to four colours and downsampling
it is 15 minutes, and a scanline overlay is a reusable layer.

The real tax is the **character budget**. A 14-character headline is a writing problem, not a design
problem, and it does not batch. Most ideas do not fit, and the ones that do took three or four rewrites.
Add the pixel type floor, which forces a second version of every small asset in a fallback font, and you
are building each asset roughly twice.

Real numbers: a carousel is 60 to 75 minutes, and about half of that is rewriting copy to fit. A
thumbnail is 25 minutes. A LinkedIn post is a different asset entirely, per the dial-down above, so it
does not reuse.

**Not viable weekly for one person.** Run it for a game, a side project, or a launch that wants a crowd:
6 to 12 times a year. Let [buildspace](../brand-buildspace/SKILL.md) carry the rest.

## Pairs with / clashes with

**Pairs with** [buildspace](../brand-buildspace/SKILL.md), which carries the weeks arcade cannot afford and
reads as the same person being quieter.
**Pairs with** [terminal](../brand/terminal/SKILL.md), its serious sibling: both are monospace and
screen-native, so a technical write-up in terminal next to an arcade launch reads as one system with two
volumes.
**Pairs with** [punchcard](../brand/punchcard/SKILL.md) for the same reason, with a colder register.

**Clashes with** [stadium](../brand/stadium/SKILL.md): two maximal saturated dark-field directions competing
for the same eye, and neither wins.
**Clashes with** [flyer](../brand-flyer/SKILL.md), because both are noise-forward and the combination reads as
a person with no editing instinct.
**Clashes with** [porcelain](../brand/porcelain/SKILL.md) and [swiss](../brand/swiss/SKILL.md), whose whole argument
is restraint.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand/brand-router/SKILL.md):
[broadsheet](../brand-broadsheet/SKILL.md), [swiss](../brand/swiss/SKILL.md), [manuscript](../brand-manuscript/SKILL.md),
[plaque](../brand/plaque/SKILL.md), [annual](../brand-annual/SKILL.md), [terminal](../brand/terminal/SKILL.md),
[blueprint](../brand-blueprint/SKILL.md), [spec](../brand/spec/SKILL.md), [oscilloscope](../brand-oscilloscope/SKILL.md),
[punchcard](../brand/punchcard/SKILL.md), [buildspace](../brand-buildspace/SKILL.md),
[risograph](../brand/risograph/SKILL.md), [stadium](../brand/stadium/SKILL.md), arcade, [flyer](../brand-flyer/SKILL.md),
[dispatch](../brand-dispatch/SKILL.md), [dusk](../brand-dusk/SKILL.md), [vellum](../brand/vellum/SKILL.md),
[aurora](../brand-aurora/SKILL.md), [porcelain](../brand/porcelain/SKILL.md).

## The failure mode

**Nostalgia with nothing behind it.** Arcade borrows a feeling that the reader already has, so it can
look finished while saying nothing. The tube, the scanlines, and the coin gold do the emotional work,
and the writer stops noticing that the headline says `LEVEL UP` and means nothing at all. Four posts
like that and the direction is a filter.

The second failure is the one the avoid-when warns about, and it always arrives the same way. Someone
has 300 words of genuinely good writing and puts it in VT323 on a tube because the rest of the campaign
is arcade. Nobody finishes it. Consistency is not worth a post that goes unread, and this direction is
the only one in the family where the type itself is the barrier.

The check before you publish: read the headline with the CRT turned off, in plain black on white. If it
stops meaning anything, the tube was carrying it, and the tube is not an idea.
