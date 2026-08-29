---
name: brand-router
description: "Use when choosing or applying a visual brand direction across a whole personal or product brand, not just a website. Surveys what you actually publish, then routes to one of twenty direction skills covering voice, landing page, avatar, OG card, LinkedIn, Instagram carousels, YouTube thumbnails and edits, podcast cover, and decks. Triggers: 'pick a brand direction', 'what style should my brand be', 'design my landing page', 'make my social media consistent', 'brand guidelines', 'how should my instagram carousels look', 'redesign my personal brand'."
---

# Brand router

Entry point for a twenty-direction brand system. **Survey and dispatch:** this
skill decides *which* direction fits, then hands you to that direction's skill.
It does not do the design itself. That keeps each direction independently
maintainable.

- Catalog: [`../README.md`](../README.md)
- The twelve surfaces every direction answers: [`../_lib/surfaces.md`](../_lib/surfaces.md)
- Shared non-negotiables: [`../_lib/craft-floor.md`](../_lib/craft-floor.md)

---

## Read this first: you are choosing a kit, not a style

The most common mistake is picking one direction and forcing it onto everything.
That fails, and the catalog itself shows why. Look at the `avoid when` column
below. Most directions are **content-specific by design**:

- `dispatch` only works when real news happened.
- `oscilloscope` only works when one metric is the story.
- `annual` makes optimism sound like a regulatory filing.
- `buildspace` cannot carry a number that a lawyer signs.

Force any single direction across a year of posting and you will be using it
wrongly perhaps 40% of the time. So do not choose a style. **Choose three
registers.**

| Register | Share of output | Job |
|---|---|---|
| **Core** | ~80% | Everyday. Website, newsletter, most posts, most video. |
| **Authority** | ~15% | Money, results, track record, anything a lawyer or an investor reads. |
| **Launch** | ~5% | Announcements. Rare on purpose. |

**The rule that makes a kit work: the core never changes. The other two are
triggered by content type, never by mood.** A launch register used because you
felt like it is just inconsistency wearing a nicer coat.

Most people need exactly three. Nobody needs twenty. The other seventeen are
there so the three you pick are chosen rather than defaulted into.

---

## Step 1 — Survey

Ask these **one at a time**. Do not batch them. Do not recommend anything until
all four are answered.

### Q1. What did you actually publish in the last month?

Ask for the real list, not the plan. Count roughly: essays, short posts, videos,
podcast episodes, investor updates, launches, community posts.

**This is evidence, and it outranks taste.** Somebody who has shipped three
essays and zero launches does not need a launch-shaped brand, however much they
like the look of one.

### Q2. Who reads it, and which of them matters most?

Founders and community, investors and LPs, engineers, a general audience, or
customers. If the answer is "all of them", ask which one they would keep if they
had to drop the rest.

### Q3. Who makes the assets, and how much time per asset?

Be blunt here. The options are roughly:

- **You, in minutes, between other work** — you need cheap directions. Most of
  the catalog is out.
- **You, with real time on weekends** — moderate is fine.
- **A designer, or you enjoy this as the hobby** — expensive is on the table.

**A brand does not usually die of ugliness. It dies of upkeep.** The owner
cannot sustain it, so it lapses, and lapsed is worse than plain.

### Q4. Which surface do people meet you on first?

Usually the avatar, the YouTube thumbnail, or a LinkedIn post. Whatever they
say, that surface gets veto power over the core direction. A direction that dies
at 48px cannot be a core, no matter how good the landing page looks.

---

## Step 2 — Apply the three filters, in order

Run them in this order. Each one removes candidates cheaply before the expensive
judgment starts.

### Filter 1 — Durability

Drop every direction whose **Cost to run** exceeds the answer to Q3.

This is the harshest filter and it should be. `risograph`, `flyer`, `arcade` and
`aurora` all need real craft per asset. They are excellent and they are not
viable for one person publishing weekly without help. Say that out loud rather
than letting somebody discover it in week four.

### Filter 2 — Content shape

Match the Q1 evidence against `use when` and `avoid when` in the table. Drop any
direction whose `avoid when` describes the majority of what they actually
publish.

Read `avoid when` more carefully than `use when`. It is the more honest field,
and it is the one people skip.

### Filter 3 — The 48px test

For the **core only**: does it survive an avatar and a ~210px YouTube thumbnail?

Directions built on a hairline or a fine texture (`porcelain`, `dusk`, `swiss`,
`vellum`) need their declared high-contrast export variant to pass. Each skill
states that variant with exact numbers. A direction that needs a different
identity at small size is a weaker core than one that does not.

Three filters usually leave three to five candidates. **Now taste decides**, and
only now. Taste is a fine tie-breaker and a terrible first filter.

---

## Step 3 — Assemble the kit

Pick one direction per register, then check the pairing:

- **Core and authority must share a structural logic** so the switch reads as
  register, not as a different person. Two directions that both align flush
  left, or both work off a rule, will feel related even with different palettes.
- **Core and launch must clearly differ** or the launch does not land. If your
  audience cannot tell instantly that something is different today, the launch
  register is wasted.
- Each direction's **Pairs with / clashes with** section names real siblings.
  Use it. It will catch combinations that look fine in theory and fight in a
  feed.

---

## The catalog

Lowercase names are house style. Full detail in each skill.

### Editorial — the word is the design

| Direction | Use when | Avoid when |
|---|---|---|
| [broadsheet](../broadsheet/SKILL.md) | It has a byline and a date. Essays, reporting, anything cited later. | One product, one button. Or a reader on a phone in a hurry. |
| [swiss](../swiss/SKILL.md) | Content is already strong and needs organising, not selling. | You need warmth, or a photo of a person must carry the page. |
| [manuscript](../manuscript/SKILL.md) | Long essays, a letter, a thesis. Eight uninterrupted minutes. | Product pages, forms, dashboards. Anywhere scanning beats reading. |
| [plaque](../plaque/SKILL.md) | A portfolio or archive. The work is the thing; the site captions it. | You need to convert or persuade. It has no volume knob. |
| [annual](../annual/SKILL.md) | Investor updates, results, a track record. | The audience is a community. It makes optimism sound like a filing. |

### Technical — the evidence is the design

| Direction | Use when | Avoid when |
|---|---|---|
| [terminal](../terminal/SKILL.md) | Reader is technical, claim is verifiable. Changelogs, benchmarks. | A face, a story, an emotional ask. Warmth here reads as cosplay. |
| [blueprint](../blueprint/SKILL.md) | Showing how something is built. Teardowns, architecture, roadmaps. | The thing ships today. A blueprint implies it does not exist yet. |
| [spec](../spec/SKILL.md) | Reader came for an answer. Pricing, comparisons, reference writing. | You want them to feel something. A manifesto in spec reads as terms of service. |
| [oscilloscope](../oscilloscope/SKILL.md) | One metric is the story. A chart, a benchmark, a counter. | Several equal subjects. This instrument has one channel. |
| [punchcard](../punchcard/SKILL.md) | The work should feel filed, dated, permanent. Archives, timelines. | The subject is speculative. Card stock implies the record exists. |

### Expressive — the volume is the design

| Direction | Use when | Avoid when |
|---|---|---|
| [buildspace](../buildspace/SKILL.md) | Founders should feel talked to, not sold to. Community, cohort, newsletter. | Investors are the primary reader, or a lawyer signs the number. |
| [risograph](../risograph/SKILL.md) | A zine, a drop, small-batch work. The seams should show. | A price, a legal term, a data table. Misregistration reads as error. |
| [stadium](../stadium/SKILL.md) | A launch, a result, a date. Anything with a scoreline. | Reflective or long-form. It cannot whisper or hold three paragraphs. |
| [arcade](../arcade/SKILL.md) | Playful work, a side project, a launch that wants a crowd. | Anyone reads for over a minute, or the audience is institutional. |
| [flyer](../flyer/SKILL.md) | Picking a fight. Manifestos, open calls, writing against the grain. | You must be trusted with money or data. Nobody approved this. |
| [dispatch](../dispatch/SKILL.md) | Real news that cannot wait. A date, a reversal, a number that changed. | Nothing happened. A stamp over a small update reads as a lie. |

### Atmospheric — the light is the design

| Direction | Use when | Avoid when |
|---|---|---|
| [dusk](../dusk/SKILL.md) | Long-form reflection written after the fact. Letters, post-mortems. | A live offer. Dusk looks back, so it makes an offer feel already over. |
| [vellum](../vellum/SKILL.md) | The work has versions and they should stay visible. Changelogs, drafts. | One message, one action. A stack implies more underneath. |
| [aurora](../aurora/SKILL.md) | One serious claim needs the whole page. A thesis, a research note. | Many parallel items. With no cards, parallel content has nothing to sit in. |
| [porcelain](../porcelain/SKILL.md) | One claim taken seriously with no help from design. An investor memo. | The page needs energy or a second level of hierarchy. |

---

## Worked example — a founder, investor and content creator

Somebody who runs a community and an accelerator, writes a newsletter, records a
podcast, ships video, and also raises and deploys capital.

**Survey.** Most output is community-facing: cohort posts, mentor spotlights,
event announcements, a newsletter, video. A smaller and much higher-stakes
stream is investor-facing: updates, results, a track record. Assets are made by
that person, between other work.

**Filter 1** removes `risograph`, `flyer`, `arcade` and `aurora` on cost.
**Filter 2** removes `terminal` and `spec` — the audience is founders, not
engineers, and both directions refuse warmth. It removes `plaque` and
`manuscript` too, which have no register for an announcement.
**Filter 3** removes `porcelain` as a core: a 1px hairline needs a different
identity at 48px.

**The kit:**

- **Core — [buildspace](../buildspace/SKILL.md).** Lowercase, warm, talks to
  founders rather than at them. Cheap to run, which is what makes it survive
  contact with a real schedule.
- **Authority — [annual](../annual/SKILL.md).** Exactly where buildspace refuses
  to go: numbers a lawyer signs. Investor updates and results only.
- **Launch — [stadium](../stadium/SKILL.md).** Announcements only, roughly one
  in twenty posts. It reads as an event because it is rare.

**Why it holds together:** buildspace and annual both align flush left and both
lead with a plain number, so the switch reads as a change of register rather
than a change of person. Stadium is loud enough to be unmistakable, which is the
entire job of a launch register.

**The failure mode to watch:** using stadium because a post feels exciting.
Launch is triggered by an event, not by a feeling. The moment that slips, the
kit collapses back into inconsistency.

---

## Step 4 — Hand off

Name the three directions and the trigger for each. Then send the user to the
core direction's skill first, since it carries most of the work.

Do not invoke sibling skills from here. Point at them. Each direction skill is
self-contained and answers all twelve surfaces on its own.
