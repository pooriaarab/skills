---
name: brand-signage
description: "Use when the reader is moving and deciding rather than sitting and reading: navigation, onboarding paths, docs maps, status boards, 'where am I and where do I go next'. Applies the signage direction to every surface, not only the website. Triggers: 'signage direction', 'wayfinding', 'route bar', 'transit map look', 'make the nav obvious', 'onboarding path', 'departure board', 'brand my carousel in signage'."
---

# signage

> a wayfinding system, read at a glance from across a concourse.

**Signature.** A **route bar** — a 12px stroke that travels only at 0°, 45° or 90°, turning through a fixed 12px radius and never through any other angle. Every destination hangs off a bar. Nothing on the page is reachable except by following one.

**Colour is an identifier here, not decoration.** A hue means *one route* and means it everywhere, the way a line colour does on a transit map. The moment a second thing borrows the same hue the system stops being a system and becomes a palette. That is the whole discipline, and it is what separates signage from [swiss](../brand-swiss/SKILL.md), where the accent is a single emphasis, and from [blueprint](../brand-blueprint/SKILL.md), where the linework annotates rather than directs. Contract: [`../brand-router/_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor: [`../brand-router/_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

## Tokens

**Native mode: light** — the vitreous enamel sign under daylight. The dark mode is not an inversion. It is **the same sign at night, lit from behind**: the enamel goes black, the printed marks become the lit part, and the accent rises from `#0b53c0` to `#5aa9ff` because a transmitted colour reads lighter than a reflected one. Same object, different light source.

| Token | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| bg | `#ffffff` | — | `#0b0f14` | — |
| surface | `#f2f4f6` | fg 15.99:1 | `#151b22` | fg 15.40:1 |
| fg | `#16191d` | 17.63:1 | `#eef2f6` | 17.08:1 |
| muted | `#55606b` | 6.42:1 | `#93a3b2` | 7.43:1 |
| border | `#cdd4da` | hairline | `#232c36` | hairline |
| accent (the route) | `#0b53c0` | 6.97:1 | `#5aa9ff` | 7.83:1 |
| accentFg | `#ffffff` | 6.97:1 on accent | `#06121f` | 7.68:1 on accent |
| alt (caution) | `#8a5000` | 6.51:1 | `#ffb84d` | 11.18:1 |

Every ratio above is computed from the committed hex values, not estimated. `muted` is tinted toward the blue of the accent in both modes; it is never a neutral grey.

**Surface.** Radius **0 on panels, 12px on the route bar only** — a sign is a cut rectangle, and the bar is the single thing that bends. **No shadows.** Enamel on a wall casts none, and a drop shadow under a sign is the clearest tell that the direction has been applied as a skin. Hairline `1px solid #cdd4da`.

**Type.** Archivo for everything; there is no second family. Sizes are set for **distance, not for reading**: destination 72px/1.0 at 700, direction label 28px/1.2 at 600 uppercase with +0.08em tracking, body 18px/1.6 at 400. Tracking floor -0.02em — signage never goes as tight as the -0.04em floor, because letters that touch cannot be read while moving.

**Motion — the one authored moment.** Ease `cubic-bezier(0.2, 0, 0, 1)`, duration **420ms**. The route bar **draws once along its own path** on load, from its origin to its destination, using `stroke-dashoffset`. It is already visible at rest as a 2px track; the draw fills that track to 12px. Nothing else on the page ever moves. Under `prefers-reduced-motion: reduce`, render the filled bar and skip the draw.

## 1. Voice and writing

Imperative and short. A sign does not explain, it directs. Sentences under 12 words, verb first: "Install the package", never "You can install the package by running". No greeting, no throat-clearing, no closing pleasantry. Numbers are digits, always. **If a sentence cannot be read at a glance, it is not signage — it is body copy that has wandered into the wrong direction.**

## 2. Landing page

`#ffffff`, full bleed. One column, hung on a 12px baseline grid.

- **Hero.** The destination in Archivo 700 at **72px**, max two lines, flush left. Directly beneath it a single `#0b53c0` route bar runs from the left margin, turns once at 90°, and terminates at the primary action. The action sits at the end of the bar — it is the destination, not a button floating in space.
- **Sections divide by a direction label**, not a rule: `→ 02  INSTALL` in Archivo 600 uppercase 28px, `#55606b`, with a 24px `#0b53c0` arrow glyph. Numbered, because a route has an order.
- **Every link is a destination.** Underlines are 2px and sit 6px below the baseline, the weight of a painted line rather than a hairline.
- `#8a5000` appears only on a genuine caution — a breaking change, a destructive command — and then at most once per page.

## 3. X / Twitter avatar

`#0b53c0` square, full bleed. One `#ffffff` route bar, **14% of the square's width**, entering at the left edge at 50% height, turning 90° up through a 12px radius at 55% width, and exiting the top edge. No letterform, no wordmark. The bar alone is the mark.

**At 48px it survives**, because it is one thick stroke and one corner. That is the direction's best property and the reason it can be a core.

## 4. X header and YouTube banner

2560×1440, `#ffffff`, safe area 1546×423 centred.

**Inside the safe area:** one `#0b53c0` route bar, 12px, entering at the left edge of the safe area at y=720, running to x=1400, turning 90° down, and terminating in a 24px filled square. Above the bar's horizontal run, one line in Archivo 600 **34px** `#16191d`, flush left at x=587, naming the current destination in under six words. Outside the safe area the field is empty `#ffffff` — a sign's surround carries nothing.

## 5. Open Graph card

1200×630, `#ffffff`. It renders in a feed at roughly 400×210, so the bar is sized for the shrink.

- A `#0b53c0` bar, **16px**, enters at the left edge at y=500 and runs to x=1040.
- The title sits above it: Archivo 700 **68px** `#16191d`, flush left at x=64, two lines maximum.
- A `→` in `#0b53c0` at 48px sits at the bar's terminus.
- **No logo.** The bar is the identifier.

## 6. LinkedIn banner

1584×396, `#ffffff`. One `#0b53c0` bar at 12px runs the full width at y=300. Three 20px filled squares sit on it at x=396, 792 and 1188, each with a label beneath in Archivo 600 uppercase 18px `#55606b` — the three things you do, as three stops on one line. Name in Archivo 700 40px `#16191d` at x=64, y=140.

## 7. LinkedIn post image

1200×1200, `#ffffff`. The claim in Archivo 700 **80px** `#16191d`, flush left, max four lines, occupying the upper two thirds. One `#0b53c0` bar beneath it, 16px, running from the left margin to 60% width and terminating in a filled square. Nothing else.

## 8. Instagram carousel

1080×1350 per slide, `#ffffff`.

- **Slide 1** carries the destination: Archivo 700 **96px**, max three lines, flush left at x=80, with the route bar entering from the left edge beneath it.
- **The bar is continuous across slides.** It exits slide *n* at the right edge at a fixed y, and enters slide *n+1* at the left edge at that same y. Swiping follows the route. **This is the direction's one genuinely native social format** — get the y wrong on one slide and the whole carousel breaks visibly.
- **Slide bodies** carry one instruction each, Archivo 600 **44px**, under 12 words.
- **Final slide** terminates the bar in a 40px `#0b53c0` square and the single action, Archivo 700 56px.
- Slide count 5 to 7. A route with more than seven stops is a map, not a sign.

## 9. YouTube thumbnail

1280×720, `#ffffff`. It renders at roughly 210px wide, which sets every size here.

- Three or four words maximum, Archivo 700 **150px**, `#16191d`, flush left at x=60, stacked.
- One `#0b53c0` bar, **24px**, running along the bottom edge from x=0 to x=760, turning 90° up at its end and rising 120px.
- **No face, no arrow-and-circle, no outline text.** The thumbnail is a sign, and a sign competing with a face loses.

## 10. YouTube edit style

Cuts are hard, on the beat, never crossfaded — a sign does not dissolve into another sign. Lower thirds are a 12px `#0b53c0` bar entering from the left over 420ms with the label riding its end, Archivo 600 uppercase 32px. Section transitions are a full-frame `#0b53c0` wipe travelling left to right at constant speed over 300ms, carrying the next section number in `#ffffff` Archivo 700 200px. **Screen recordings sit inside a 0-radius `#cdd4da` hairline frame** with a 40px `#ffffff` margin, never full-bleed and never with a rounded corner.

## 11. Podcast cover

3000×3000, `#0b53c0` full bleed — the cover is the one surface where the route colour is the field rather than the mark. One `#ffffff` bar, 120px, entering the left edge at 60% height, turning 90° up at 65% width, exiting the top. Show name in `#ffffff` Archivo 700 **280px**, flush left at x=200, baseline at 42% height, max two lines. **At 55px in a podcast app** the bar still reads as a single turn and the field still reads as the route colour; the title does not, which is correct — nobody reads a podcast title at 55px.

## 12. Deck and talks

`#ffffff` throughout. One idea per slide, flush left, Archivo 700 at 88px. A persistent 6px `#0b53c0` bar runs along the bottom edge of every slide and **advances a filled 18px square left to right as the deck progresses** — the audience can see how far through the route they are without a slide number. Section slides invert to `#0b53c0` with `#ffffff` type. No bullets: a bulleted list is a document, and this is a sign.

## Cost to run

**Cheap.** One family, one accent, no texture, no per-asset craft. Every surface is a rectangle, a bar and a line of type, all of which compose from the tokens above. A single person can hold this weekly without help.

The one recurring cost is discipline rather than effort: the route colour must stay reserved. That costs nothing in time and is the thing most likely to lapse.

## Pairs with / clashes with

**Pairs with** [`spec`](../brand-spec/SKILL.md) as an authority register — signage gets the reader to the reference page, spec is the reference page. Also pairs with [`terminal`](../brand-terminal/SKILL.md) for a dev-tool kit: signage for the site and the navigation, terminal for the changelog and the benchmarks.

**Clashes with** [`blueprint`](../brand-blueprint/SKILL.md) and [`oscilloscope`](../brand-oscilloscope/SKILL.md). All three draw precise linework, so running two of them reads as one system with a bug rather than as two registers. Pick one line language.

## The failure mode

**The route bar becomes decoration.** It starts as the thing you follow and degrades into a blue stripe added to whatever the layout already was — a bar under a heading that leads nowhere, a bar along a card edge, a bar in a footer because the footer looked empty. Once a bar does not terminate in a destination, every other bar stops meaning anything, and the direction collapses into a generic blue-accented layout.

The test is one question per bar: **what does this one end at?** If the answer is "nothing, it looks good there", delete it.

The second failure is quieter. **The accent gets borrowed** — for a link hover, for a selected tab, for an icon. Each borrow is individually reasonable and the cumulative effect is that the colour no longer identifies anything. Reserve it in code, not in intention: one token, referenced only by the route bar and its terminal square.
