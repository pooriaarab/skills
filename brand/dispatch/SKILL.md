---
name: dispatch
description: "Use when applying the dispatch brand direction to any surface: website, X, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast art, or decks. Newsprint, a heavy slab headline clamped between two rules, one red stamp struck at minus three degrees. Triggers: 'dispatch direction', 'wire report style', 'newsprint stamp brand', 'breaking news layout', 'apply dispatch to my launch post'."
---

# dispatch

> filed from the front, set in ten minutes, on the street by six.

**emotion** urgent, grave, terse.
**signature** a heavy condensed slab headline clamped between two rules, a 6px rule above and a 2px rule
below, with a red stamp struck across one corner at -3 degrees, overprinting whatever is under it.
**use when** there is real news and it cannot wait: a shutdown, a launch date, a reversal, a number that
changed. Anything that has to read as fact, fast.
**avoid when** nothing has actually happened. **This direction spends its credibility every time it is
used, and a stamp over a small update reads as a lie.**

That avoid-when has a number attached. See **Cost to run** before you use this on anything.

Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor:
[`../_lib/craft-floor.md`](../_lib/craft-floor.md).

---

## Tokens

### Palette

Light is native. Dark is **the wire terminal at 4am**, not an inverted page: the same page on a newsroom
screen with the lights off. Newsprint becomes screen black, ink becomes phosphor cream, and the red
warms from `#b4231f` to `#c2251d`, because a cool red on a black screen loses its edge.

| Role | Light (native) | Dark | Contrast light / dark |
|---|---|---|---|
| bg | `#ede7da` newsprint | `#121110` | — |
| surface | `#f7f3e9` | `#1d1b19` | — |
| fg | `#14110d` | `#f1eadb` | 15.3 / 15.8 |
| muted | `#6e3129` | `#c08f84` | 8.0 / 6.7 |
| border | `#14110d` | `#322e2a` | rules and hairlines |
| accent (stamp red) | `#b4231f` | `#c2251d` | **5.3 on newsprint · 3.2 on dark** |
| accentFg | `#fbf6ec` | `#fff2ec` | 6.1 / 5.4 on red |
| ring / alt | `#b4231f` | `#f1eadb` | focus |

**The red is legal as type in light mode only.** On newsprint it is 5.3:1, so a red kicker or a red word
is allowed. On the dark field it is 3.2:1, which is large-text-only: in dark mode the red is a filled
stamp with `#fff2ec` knocked out of it, and never a word on the background.

There is no third colour. Not on any surface, ever.

### Type

- **display** `"Bevan", "Rockwell", Georgia, serif` · 400 · tracking `-0.02em` · uppercase · leading 0.95
- **body** `"Zilla Slab", Georgia, serif` · 400 · tracking `0em` · leading 1.5
- **mono** `"Roboto Mono", ui-monospace, monospace` · 700 · tracking `0.06em` · uppercase · leading 1.3. Kickers, datelines, filing times.
- Google: `Bevan`, `Zilla Slab:wght@400;500;700`, `Roboto Mono:wght@400;700`.
- Scale 1.35 from 17px body: **17 / 23 / 31 / 42 / 56 / 76 / 103 / 139**.
- Measure 68 characters. Two columns allowed above 1280px, which is the one place a newspaper reference earns them.

### The rule clamp

Every headline sits between two rules and this never varies:

- **6px solid `#14110d` above**, running the full width of the column.
- **2px solid `#14110d` below**, same width.
- Gap above the headline 24px, gap below 18px. The asymmetry is deliberate; it makes the top rule read as the heavier one at a glance.

Between the top rule and the headline sits a Roboto Mono kicker in caps: the date, then the word
`DISPATCH`, separated by two spaces. Nothing else goes in that slot.

### The stamp

A filled `#b4231f` rectangle rotated **-3 degrees**, carrying one or two words in Roboto Mono caps
knocked out in `#fbf6ec`. It overprints whatever is under it at `mix-blend-mode: multiply`. It bleeds
off one edge of the asset, always, so it reads as struck rather than placed.

Legal stamp words: `CONFIRMED`, `CANCELLED`, `LIVE`, `FILED`, `CLOSED`, `REVERSED`, or a bare date.
Nothing aspirational. `COMING SOON` is not a stamp, it is an advert.

**One stamp per asset.** Never two. A second stamp turns the first one into decoration.

### Surface

Radius **0**. Shadow `2px 3px 0 0 #14110d, 0 12px 20px -14px rgba(20,17,13,0.45)`. Hairline `2px solid
#14110d`. Newsprint texture:

```css
background-image:
  repeating-linear-gradient(0deg, rgba(20,17,13,0.05) 0 1px, transparent 1px 2px),
  radial-gradient(rgba(20,17,13,0.10) 0.6px, transparent 0.7px),
  linear-gradient(93deg, rgba(180,35,31,0.07) 0 5%, transparent 5%);
background-size: 100% 2px, 3px 3px, 100% 100%;
mix-blend-mode: multiply;
opacity: 0.9;
```

The third layer is the red ink bleeding through from the press. Keep it at the left edge and keep it
faint.

### Motion

`cubic-bezier(0.12, 0.8, 0.2, 1)`, 180ms. **The red stamp lands. It arrives at 1.2 scale and 8 degrees
off axis, then slams to full size at -3 degrees in under a fifth of a second and stops dead, with no
bounce and no fade. Once, over the headline. Every rule and every line of type is already in place
before it hits.**

The stamp is at full opacity throughout; only `scale` and `rotate` animate. The page must read correctly
in a screenshot taken before the stamp lands, which means the headline never depends on the stamp for
sense. Under `prefers-reduced-motion: reduce`, draw the stamp at rest.

---

## 1. Voice and writing

- **Tone** — a wire report: what happened, where, when, and what it costs, with no adjectives that are not load-bearing.
- **Casing** — ALL CAPS for the headline and the stamp. Body in sentence case, and no exclamation marks anywhere.
- **Sentence rhythm** — short and factual. 10 to 16 words. Verbs in the past tense for what happened and the present tense for what now holds. No subordinate clauses stacked past one.
- **The tell** — the first sentence answers what, when, and how many, in that order, and it does so before any explanation. Everything after it is detail the reader may skip. An intro that warms up first is not this direction.

**Do say** — "FILED 06:12" · "the deal closed Tuesday" · "three of the four are gone" · "no further
detail at this hour" · "effective immediately" · "the number is 1,412"

**Don't say** — "excited to announce" · "sneak peek" · "stay tuned" · "vibes" · "a lil something" ·
"we've been cooking" · any rocket emoji

**The fact test.** Every dispatch asset must contain a **verifiable claim with a date**. Not a plan, not
a tease, not a milestone in progress. If you cannot write the sentence "on [date], [thing] changed from
X to Y", you do not have a dispatch, and using the format anyway is the failure mode below.

## 2. Landing page

Newsprint field. Content in two columns above 1280px, one below, at a 68-character measure each. Page
margin 64px.

Hero: the 6px rule at the top of the content column, the mono kicker under it with the date and
`DISPATCH`, then a Bevan headline at 139px, nine words maximum on two lines, then the 2px rule. Body in
Zilla Slab at 17px begins immediately under the lower rule with no gap beyond 18px.

The stamp sits over the top-right corner of the headline block and bleeds off the right edge of the
page.

Sections divide with the same clamp at a smaller size: 3px rule, kicker, sub-headline at 56px, 1px rule.
The rules are the whole layout system; there are no cards and no coloured panels.

## 3. X / Twitter avatar

Renders at 48px. Both the rule and the stamp survive it, which makes this one of the strongest avatars
in the twenty.

Portrait in high-contrast duotone, newsprint cream and press black, no colour on the face. A `#b4231f`
rectangular stamp band across the lower quarter of the square, rotated -3 degrees, carrying one word in
Roboto Mono caps knocked out in `#fbf6ec`. The 6px black rule runs along the top edge of the square.

Export 400×400. Scale the top rule to **20px** and the stamp band to 96px tall, so at 48px they land at
about 2px and 12px. The word inside the stamp is illegible at 48px and that is fine: the red band under
a face, tilted, is the recognition mark. Keep the word anyway for the 400px render.

## 4. X header and YouTube banner

2560×1440 for YouTube. The phone shows only the centre **1546×423**.

Cream field, 6px black rule at the top of the safe area and 2px at the bottom, and between them a single
all-caps Bevan line at 96px running the full width of the safe area. One red stamp at the far right,
bleeding off the right edge of the safe area, not off the 2560px canvas. No portrait, no logo.

Outside the safe area: newsprint texture and the two rules continuing to 2560px. That is the only
decoration, and it is the right one, because a rule that stops mid-frame looks like a mistake.

X header is 1500×500: rules at the same weights, line at 68px, lower-left 360×360 clear.

## 5. Open Graph card

1200×630, seen at roughly a third.

Newsprint field. 6px rule at the top. Roboto Mono kicker in caps above the headline: the date and the
word `DISPATCH`, at 22px. Bevan headline below, nine words maximum on two lines, largest at 76px. 2px
rule under it. Red stamp on the right, overlapping the rule, at -3 degrees. Bottom-left in mono caps:
`POORIAARAB.COM`.

Thicken both rules by 50% for this card, to 9px and 3px, and drop the newsprint texture. At 400px wide a
2px rule renders under one pixel and disappears, which takes the clamp with it. The rules are the
direction; protect them first.

## 6. LinkedIn banner

1584×396. The desktop profile photo covers a circle about 160px across near x=190, y=300.

The 6px rule runs the full 1584px at y=96, and the 2px rule at y=300. Between them, one all-caps Bevan
line at 76px from x=460 to x=1440. Red stamp at the far right, bleeding off the edge at x=1584. Keep the
left 420px clear of type; the rules still cross it, and the photo sitting on a ruled field is correct
rather than accidental.

## 7. LinkedIn post image

1200×627. The most conservative room the brand enters, and **dispatch is the one direction in this
family that gains from it.** A ruled newsprint layout reads as seriousness to exactly the audience that
finds [arcade](../arcade/SKILL.md) or [flyer](../flyer/SKILL.md) alarming.

Dial up rather than down, at 110%:

- Keep the full rule clamp at 9px and 3px.
- Keep the newsprint texture at `opacity: 0.6`.
- Headline at 76px, nine words maximum. Body in Zilla Slab at 24px, 40 words maximum.
- **Drop the stamp unless the post is genuinely the news.** On LinkedIn the stamp is the part that reads as a claim, and an unearned claim in that room costs more than it does anywhere else.

A stamped LinkedIn post is a once-or-twice-a-year event. An unstamped dispatch post is a good weekly
format for anything factual, and it is the cheapest serious layout in the family.

## 8. Instagram carousel

1080×1350, 4:5. Margin 72px. Rules run the full width, edge to edge, not inset.

**Cover slide.** 6px rule at y=180, mono kicker under it with the date and `DISPATCH` at 32px, Bevan
headline at 180px with five words maximum on two lines, 2px rule under it. The red stamp over the
top-right corner, bleeding off the right edge. Newsprint field, nothing else.

**Interior slide.** Zilla Slab at 40px, leading 1.5, flush left, 55 words maximum. A 2px rule sits above
the text with a mono kicker on it naming the slide, for example `THE NUMBERS` or `WHAT CHANGED`. It
belongs to the cover because the rules land at the same x positions and the kicker is the same mono at
the same tracking. **No stamp on an interior slide, ever.** The stamp is a front-page mark.

**End card.** The 6px rule, the word `FILED` in Bevan at 200px, the date under it in mono at 36px, and
the 2px rule. Handle bottom-left in mono. The ask is implicit: this was the record, and there will be
another one.

**Swipe cue.** The 2px lower rule extends past the right margin and off the edge of the slide, while
every other rule stops at the margin. That single overrunning rule says the page continues. It is
quieter than an arrow, which suits a direction that does not beg.

## 9. YouTube thumbnail

1280×720, designed for the ~210px sidebar render.

Newsprint field, black 6px rule across the very top of the frame and a 2px rule across the bottom.
Headline in Bevan, all caps, five words maximum on two lines, left-aligned in the lower-left quadrant at
about 30% of frame height, so roughly 215px. The red stamp, a filled `#b4231f` rectangle at -3 degrees
with one or two knocked-out mono words such as `CONFIRMED`, `CANCELLED`, `LIVE`, or a date, sits over
the top-right corner and bleeds off the right edge. The portrait, if present, is duotone at the right
edge and always behind the stamp. No third colour, ever.

**The recurring rule:** two black rules top and bottom, one red tilted rectangle in the top-right. That
red against the cream, clamped between two hard rules, is what reads from the sidebar. Scale the rules
to 10px and 4px at export so they survive the 210px render. The words change every video; the three
marks and their positions never do.

## 10. YouTube edit style

- **Cut rhythm** — fast at the top, slower after. The first 20 seconds average 2 seconds a shot; after that, 5 to 7 seconds. A cut lands on the end of a factual clause, never on a pause for effect. The edit does not build suspense, because a wire report has none to build.
- **Titles and lower thirds** — Bevan caps at 72px, bottom-left, inset 72px, clamped between a 6px and a 2px rule that draw instantly at full width. No animation on the rules. The stamp, if the video has one, lands once and only once, over the opening title.
- **B-roll** — duotone: newsprint cream and press black, no colour anywhere, contrast pushed until faces are two-tone. 3% grain. Speed 100%, no ramps. Colour footage is off-brand even for one shot.
- **Transitions** — cut only. The single exception is a 4-frame black, used to mark a change of subject, and never more than three times.
- **Cold open** — the fact, in the first two seconds, spoken flat: what changed, when, and by how much. The rules draw across the frame on frame one. No music before the first sentence. The stamp lands on the last word of that sentence, and then it is gone for the rest of the video.

## 11. Podcast cover

3000×3000, seen at 150px. Simplify to the clamp and the stamp.

Newsprint `#ede7da`. A 90px black rule across the top third, the show name in Bevan caps at 400px under
it, two words maximum on two lines, and a 30px rule under that. One red stamp band at -3 degrees across
the lower quarter, bleeding off both side edges, with a single mono word knocked out.

Drop the newsprint texture, the kicker, the date, and the portrait. At 150px the texture is invisible
and the kicker is a grey line. Scale both rules to roughly 3% and 1% of the frame so they survive, which
is far heavier than the web ratio and is correct at this size.

## 12. Deck and talks

16:9 at 1920×1080. Every slide is a wire page: rule at the top, mono kicker with the date, a Bevan
headline of eight words maximum, body in Zilla Slab capped at 40 words. **The red stamp appears on at
most two slides in a deck and never on consecutive ones.**

- **Title** — 12px rule at the top, kicker with the date and `DISPATCH`, title in Bevan at 220px, 4px rule under it. Stamp over the top-right, bleeding off. That is stamp one of two.
- **Section divider** — the two rules alone, closer together, with the section name in mono caps at 64px sitting between them. No Bevan, no stamp. The divider is quiet so the headline slides stay loud.
- **Data** — the number in Bevan at 320px between the rules, the label in mono caps at 36px above it as the kicker. One number per slide. Set the number in `#14110d`, not red. Red on a number reads as an alarm, and a number in this direction is supposed to read as a fact.
- **Wordy slides** — 40 words maximum in Zilla Slab at 40px minimum, inside the clamp. Never rotate anything on a wordy slide, and never stamp one. If a slide needs more than 40 words, it is the handout, and a wire report has always had a handout: it is called the rest of the article.

---

## Cost to run

**Moderate to produce, and expensive in a currency that is not time.**

Production is cheap. The clamp is two rectangles, the type is two families, and the stamp is a rotated
rectangle with knocked-out text. Once the template exists, a thumbnail is 10 minutes and a carousel
cover is 12. There is no halftone to tune and no misregistration to fake.

The cost is **credibility, and it is spent per use**. Every stamped asset teaches your reader what your
stamp means. Stamp real news and the mark gains weight. Stamp a blog post and it loses all of it,
permanently, because nobody un-learns that.

So put numbers on it and hold them:

- **dispatch runs at most 12 times a year**, roughly monthly.
- **the stamp appears at most 6 times a year.** Never twice in one calendar month. Never twice in one week under any circumstance.
- **Never two stamped assets for the same event.** One launch gets one stamp, on one surface, not a stamped carousel and a stamped thumbnail and a stamped banner.
- A stamp requires all three of: a thing that changed state, a date, and a consequence for the reader. Two out of three is not a stamp.

Unstamped dispatch is a different budget. The ruled newsprint layout without the red mark is honest,
cheap, and serious, and it can run weekly for anything factual. That split is what makes the direction
survivable: ration the stamp, not the format.

## Pairs with / clashes with

**Pairs with** [buildspace](../buildspace/SKILL.md) as its standard partner. buildspace carries the
process, the doubt, and the week after; dispatch carries the moment the thing actually changed. Neither
can do the other's job, and the handoff is legible to the reader.
**Pairs with** [annual](../annual/SKILL.md) when the news is financial: file it in dispatch, then
substantiate it in annual.
**Pairs with** [broadsheet](../broadsheet/SKILL.md), its long-form relative. Same print world, same
seriousness, different lengths.

**Clashes with** [stadium](../stadium/SKILL.md). Both announce, both shout, and run together in one week
they read as panic rather than as news. Pick one per event.
**Clashes with** [flyer](../flyer/SKILL.md), which is unsanctioned by design while dispatch depends on
being believed.
**Clashes with** [arcade](../arcade/SKILL.md) and [aurora](../aurora/SKILL.md), whose whole surfaces
contradict the claim that nobody had time to decorate this.

Full set of twenty, routed by [`../brand-router/SKILL.md`](../brand-router/SKILL.md):
[broadsheet](../broadsheet/SKILL.md), [swiss](../swiss/SKILL.md), [manuscript](../manuscript/SKILL.md),
[plaque](../plaque/SKILL.md), [annual](../annual/SKILL.md), [terminal](../terminal/SKILL.md),
[blueprint](../blueprint/SKILL.md), [spec](../spec/SKILL.md), [oscilloscope](../oscilloscope/SKILL.md),
[punchcard](../punchcard/SKILL.md), [buildspace](../buildspace/SKILL.md),
[risograph](../risograph/SKILL.md), [stadium](../stadium/SKILL.md), [arcade](../arcade/SKILL.md),
[flyer](../flyer/SKILL.md), dispatch, [dusk](../dusk/SKILL.md), [vellum](../vellum/SKILL.md),
[aurora](../aurora/SKILL.md), [porcelain](../porcelain/SKILL.md).

## The failure mode

**The stamp over nothing.** The direction reads as fact, so it can make a non-event look like an event,
and that is exactly the temptation. Somebody stamps `CONFIRMED` on a feature flag. Somebody stamps
`LIVE` on a waitlist. The asset looks excellent, engagement goes up once, and the mark is now worth less
than it was that morning.

The damage is cumulative and it is one-directional. A reader who has seen four stamps over four minor
updates does not read the fifth stamp as news, even when the fifth one is genuinely news. You cannot
spend the credibility back into the account, which is why the numbers above are limits and not guidance.

The quieter failure is the format without the discipline: rules, Bevan, mono kicker, and a headline that
says "some thoughts on shipping". The layout is promising a fact and the copy is delivering an essay,
and the reader feels the gap even when they cannot name it.

The check before you publish: write the sentence "on [date], [thing] changed from X to Y". If you cannot
fill in all four slots, drop the stamp. If you cannot fill in any of them, drop the direction and use
[buildspace](../buildspace/SKILL.md), which is allowed to be uncertain.
