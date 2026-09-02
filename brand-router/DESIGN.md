# Design notes

Why this suite is shaped the way it is.

## One direction per skill, never one skill for all twenty

A single "brand" skill holding twenty directions would load twenty worlds of
context to apply one. Splitting them means the router costs a table read, and
the chosen direction costs one file. It also means a direction can be revised,
or a new one added, without touching the other nineteen.

The cost is duplication: all twenty repeat the same twelve headings. That is
deliberate. **The repetition is the feature** — two skills are diffable surface
by surface only because they share a skeleton.

## The router recommends a kit, not a winner

The obvious design is "answer questions, get one style". It is wrong, and the
catalog data proves it. Read the `avoid when` fields: most directions exclude
whole categories of content. `dispatch` needs real news. `oscilloscope` needs a
single metric. `annual` makes optimism sound like a filing.

Any single direction is therefore the wrong tool for a meaningful share of a
year's output. So the router returns three registers — core, authority, launch —
and a trigger rule for each. See [`brand-router/SKILL.md`](SKILL.md).

## Filters run cheapest-first, and taste runs last

The router applies durability, then content shape, then the 48px test, and only
then lets taste break the tie.

Ordering matters. Taste is the most fun filter and the most expensive to apply,
because it invites argument about directions that were never viable. Removing
the eight directions somebody cannot sustain takes one question about who makes
the assets. Doing it first makes every later question cheaper.

**Durability is first for a reason.** The most common death of a personal brand
is not a bad choice of style. It is a good choice the owner cannot keep up with,
abandoned in week four. So every skill states its cost to run, and the router
treats that as a hard filter rather than a footnote.

## Twelve surfaces, fixed order, identical headings

Defined in [`_lib/surfaces.md`](_lib/surfaces.md).

The website is one surface of twelve and rarely the first one anybody sees. A
brand system that only specifies a landing page has specified perhaps 10% of
where the brand appears. The Instagram carousel, the YouTube thumbnail and the
avatar carry far more impressions than the homepage for most people.

The order is fixed so the files stay diffable. Voice comes first because it
survives every redesign — the palette will change before the writing does.

## Rules carry numbers

"Use bold type" is not executable. "96px, weight 800, tracking -0.03em, flush
left, never centred" is. Every skill is written so somebody can build the asset
without a follow-up question.

This is also why each skill states what it **cannot** do. A direction that
claims a 1px hairline survives a 48px avatar is worse than useless, because it
fails silently at the size most people meet the brand.

## Honesty sections are mandatory

Three sections exist because they are the ones a design system normally omits:

- **Cost to run** — what an asset really takes, in minutes.
- **Pairs with / clashes with** — which siblings fight this one.
- **The failure mode** — how this direction looks when done badly. Usually the
  most useful paragraph in the file.

## The source is running code, not a moodboard

Every palette, font stack, texture and motion signature is copied from working
implementations in the `pooriaarab.com` repo under `apps/website/src/brand/`,
rendered live at `/brand`. Contrast ratios were computed with a WCAG relative
luminance script over the committed hex values, not estimated by eye.

That matters because a brand guideline nobody has built is a hypothesis. These
twenty have been built, rendered, screenshotted and contrast-audited. When a
skill says a pairing fails at 4.37:1, that number came out of a script.
