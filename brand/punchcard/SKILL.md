---
name: punchcard
description: "Use when the work should feel filed, dated and permanent: an archive, a body of writing, a timeline, a retrospective, anything that benefits from looking older than the internet. Applies the punchcard direction to every surface, not only the website. Triggers: 'punchcard direction', 'manila card stock', '80 columns', 'archive page', 'retrospective post', 'clipped corner', 'make it look filed'."
---

# punchcard

> manila card stock, eighty columns, one clipped corner.

**Signature.** The page is a card: manila stock, a clipped top-left corner, and a numbered 80-column lattice printed faintly across the whole surface. Every block of content snaps to a whole number of those columns **and says so** — a panel is 24 columns wide and carries `COL 09-32` in its footer. The orange-red is ink stamped onto stock, never a glow.

**Punchcard is not a monospace direction.** Prose is Archivo, a proportional sans. Courier Prime is confined to **column numbers, card IDs and dates**, because the 1-to-80 ruler across the top of every card only works if every digit is one column wide. If a paragraph on a punchcard asset is monospace, the asset is wrong. Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

**Use when** you want the work to feel filed, dated and permanent — an archive, a body of writing, a timeline, a year-end index.

**Avoid when** the subject is speculative or unreleased. **Card stock implies the record already exists, so a roadmap set in punchcard reads as a lie.** Never run a roadmap, a waitlist, a "coming soon", or a prediction post in this direction. Those belong in [blueprint](../../brand-blueprint/SKILL.md), which promises the opposite.

---

## Tokens

**Native mode: light** — the card itself, on a desk, under room light. The dark mode is not an inversion. It is **the same card photographed in an archive, lit from one side**: the ground becomes the umber of the storage box, the stock survives only as the fg cream, and the stamped ink lifts to `#ff5f3d` because dried red ink under low light reads warmer, not darker.

| Role | Light | on bg | Dark | on bg |
| --- | --- | --- | --- | --- |
| bg | `#e9dec4` | — | `#171208` | — |
| surface | `#f4ecd8` | fg 14.66:1 | `#221b0f` | — |
| fg | `#201a10` | 12.91:1 | `#ece0c4` | 14.23:1 |
| muted | `#665834` | 5.22:1 | `#a79066` | 6.06:1 |
| border | `#cbba93` | hairline | `#382e1c` | hairline |
| accent (ink) | `#b8301a` | **4.52:1** | `#ff5f3d` | 6.18:1 |
| accentFg | `#fdf6e8` | 5.62:1 on accent | `#1a0a05` | 6.38:1 on accent |
| alt | `#201a10` | 12.91:1 | `#ece0c4` | 14.23:1 |

**Warning: `#b8301a` on `#e9dec4` is 4.52:1.** It clears the 4.5:1 floor with almost no headroom. On the lighter `#f4ecd8` surface it improves to 5.13:1, so **panels are the safer home for ink text and the page ground is not**. Two rules follow, both binding. **Never set ink text below 16px.** **Never apply the halftone behind ink text**, because the overlay drops effective contrast below the floor. Use ink for stamps, punched rows and single words; use `#201a10` for anything you expect someone to read.

**Type.** Display `"Archivo", "Helvetica Neue", Arial, sans-serif` 700 / -0.015em / **uppercase** / 1.06. Body Archivo 400 / 0em / none / 1.58. Mono `"Courier Prime", "Courier New", monospace` 400 / +0.01em / 1.4 — **ruler, IDs and dates only**. Load `Archivo:wght@400;500;700`, `Courier Prime:wght@400;700`. Scale ratio 1.22.

**Surface.** Radius **0** — a card has one clipped corner and three square ones. Shadow `0 2px 0 0 #cbba93, 0 12px 24px -14px rgba(32,26,16,0.45)`: a card lying on a desk casts a real offset shadow, not a halo. Hairline `1px solid #cbba93`.

**Texture** (halftone — a coarse print screen, masked into horizontal bands so it reads as card stock rather than as noise):
`background-image: repeating-linear-gradient(90deg, rgba(32,26,16,0.20) 0px, rgba(32,26,16,0.20) 5px, transparent 5px, transparent 12.4px); -webkit-mask-image: repeating-linear-gradient(180deg, #000 0px, #000 7px, transparent 7px, transparent 21px); mask-image: repeating-linear-gradient(180deg, #000 0px, #000 7px, transparent 7px, transparent 21px); pointer-events: none;`

**Motion — the one authored moment.** Ease `steps(1, end)`, duration **960ms**. The card gets punched. On first paint the 80-column strip across the top of the page is blank stock; then holes appear left to right, one every **12ms**, each arriving at full opacity in a single step with no fade — **the keypunch is a mechanical event, not a transition**. The pass takes 960ms and lands on the last column exactly as the page finishes loading. The punched holes spell the page title in Hollerith code, and the plain-text title sits underneath. It happens **once per session, not once per page**. Under `prefers-reduced-motion: reduce`, render the punched strip complete.

---

## 1. Voice and writing

**Tone.** Files a record: what happened, when, and what number it was, with no attempt to make you feel about it.

**Casing.** UPPERCASE for headings and labels. Sentence case for body. **Dates are always `28 AUG 2026`** — day, three-letter month in caps, four-digit year. Never a slash format, never a relative date like "last week".

**Sentence rhythm.** Flat and even, 12 to 20 words. Fragments appear only as record labels (`RECORD 0114`, `COL 09-32`, `SUPERSEDED`). Body prose is complete sentences in the past tense, because a record is written after the fact.

**Do say:** `RECORD 0114 — 28 AUG 2026` · `this replaces the entry filed in March` · `written down so it does not get re-argued` · `COL 09-32`

**Don't say:** `AI-powered` · `cloud-native` · `frictionless` · `reimagine` · `game-changing` · `digital transformation`

**The tell.** Everything is dated and numbered, and revisions supersede rather than delete. "this replaces the entry filed in March" is the habit: the old record still exists, and the new one says so. A punchcard page never quietly edits history.

## 2. Landing page

`#e9dec4` stock with the halftone overlay on and the **80-column lattice** printed faintly across the full width. **Every block snaps to a whole number of columns and states its span.**

- **The column unit.** At a 1120px content width with 60px side margins, 1000px / 80 = **12.5px per column**. Every panel width is a multiple of 12.5px, and every panel footer carries its span in Courier Prime 14px `#665834`: `COL 09-32`.
- **Measure: 64 characters** — 600px at 18px Archivo body, which is 48 columns. Body never exceeds 52 columns.
- **The clipped corner** is on the page, not just on panels: the top-left corner of the viewport is cut at 45 degrees across **120px**, revealing the `#f4ecd8` surface behind it. It appears exactly once per page.
- **Hero.** The 80-column ruler runs across the top: `1 ... 10 ... 20 ... 80` in Courier Prime 16px `#665834`. Under it, the punched row. Under that, the title in Archivo 700 uppercase at **76px**, max 6 words, left-aligned, **max 3 lines**.
- **Sections divide by a record header**, not a rule: `RECORD 0114 — 28 AUG 2026` in Courier Prime 16px `#665834`, with a 1px `#cbba93` rule under it spanning that section's column range only.
- **Whitespace is card gutters.** Vertical gaps are 3 rows (63px, three halftone bands) inside a section and 9 rows (189px) between. No other value.
- **The carrying element is the punched row.** One per screenful, and it spans the exact column range of the block it belongs to.

The ink appears at most twice above the fold, and it is a stamp: it may punch one row **or** mark one word. Never both.

## 3. X / Twitter avatar

Renders at **48px**, and punchcard survives it well, because a clipped corner is a silhouette and silhouettes scale.

`#e9dec4` square with the **top-left corner clipped at 45 degrees across 18% of the edge**. Three `#b8301a` punched rectangles sit in a row across the vertical centre, each **14% wide and 22% tall**, gapped by **8%** — the Hollerith columns for `P`. A single `#665834` hairline runs 10% in from the bottom edge.

**48px variant — two changes:**

1. **Hairline off.** A hairline at 10% inset is one pixel of grey at 48px and reads as an artefact of compression.
2. **Halftone off.** The 5px/12.4px screen is invisible below about 200px and it lowers the ink's already-thin 4.52:1 contrast.

The three punched rectangles at 48px are 6.7px × 10.6px each — solid, readable marks. The clipped corner is 8.6px, which is clearly a cut and not a rounding error. **Never add text to this avatar**; Courier Prime at 48px is 4px of stroke.

## 4. X header and YouTube banner

YouTube is 2560×1440. Only the centred **1546×423 safe area** shows on a phone.

**One card, edge to edge:** manila stock, the top-left corner of the full 2560px canvas clipped at **200px**, and the 80-column ruler running along the top of the safe area at y=560 in Courier Prime **22px** `#665834`. At 1546px wide, one column is **19.3px**.

**Centred in the safe area:** the name `POORIA ARAB` in Archivo 700 uppercase at **96px**, baseline y=740, with a `#b8301a` punched row directly under it **spanning the name's width exactly** — rectangles 19.3px wide (one column) and 26px tall, gapped 6px, at y=790.

**Nothing else on the card.** Outside the safe area the stock, halftone and lattice continue to 2560×1440 and carry nothing.

For the 1500×500 X header, the ruler sits at y=110 and the name at y=270.

## 5. Open Graph card

1200×630 manila `#e9dec4`, **top-left corner clipped 140px**. It renders in feed at roughly 400×210. At x=72 margins, 1056px / 80 = **13.2px per column**.

- Across the top at **y=44**: the column ruler, `1 ... 10 ... 20 ... 80` in Courier Prime **18px** `#665834`, full width.
- Headline Archivo 700 uppercase **58px** `#201a10`, left at x=72, top at y=200, **three lines max**.
- A `#b8301a` punched row spans **columns 9 through 32** directly beneath it — 24 columns, 316.8px, rectangles 13.2px wide and 22px tall.
- Footer at **y=560**, Courier Prime **22px** `#665834`: `POORIAARAB.COM` left, the date as `28 AUG 2026` right.

**Drop at feed size:** the halftone overlay, and the ruler's numerals — keep the ruler's tick marks. At 400px wide, 18px Courier Prime is 6px and turns into grit that reads as JPEG damage. The clipped corner, the headline and the punched row all survive, and the corner alone identifies the direction at any size.

## 6. LinkedIn banner

1584×396. Treat a **400px wide by 140px tall** block at the bottom left as covered by the profile photo.

The clipped corner stays at the top left at **110px** — it is above the photo hole, which is the one piece of luck this direction gets on this surface. The 80-column ruler runs the full width at y=40, Courier Prime 16px, one column = 19.8px.

Put the name in Archivo 700 uppercase at **64px** at x=460, baseline y=200, with the punched row under it at y=240 spanning the name's exact width. The record line — `RECORD 0114 — 28 AUG 2026` — sits at x=460, y=300 in Courier Prime 18px `#665834`.

Nothing in the bottom-left 400×140.

## 7. LinkedIn post image

1200×627. **Punchcard is the safest of the technical directions in a conservative feed**, because it reads as a document rather than as a subculture, and because manila against a wall of white cards is a genuine differentiator. It needs almost no dialling down. Make two changes only.

1. **Halftone off.** LinkedIn's JPEG pass turns a 5px screen into visible blocking, and it drags the ink under 4.5:1.
2. **Ruler numerals off, ticks kept.** The numbers are 6px in the feed.

Keep the clipped corner, the stock, the headline and one punched row. Headline Archivo 700 uppercase at 54px, max 8 words, three lines. Body, if any, Archivo 400 at 26px, `#201a10`, max 3 lines. **Do not use the ink for body text on this surface** — with the halftone off you have 4.52:1 and a re-encode, which is not enough margin to spend on a paragraph.

## 8. Instagram carousel

1080×1350 throughout. **The carousel is a card file, and the slides are numbered cards.** Every slide carries the clipped corner, the 80-column ruler and a `CARD n / N` stamp — that repeated furniture is what separates it from a [terminal](../terminal/SKILL.md) session, a [spec](../spec/SKILL.md) table or an [oscilloscope](../../brand-oscilloscope/SKILL.md) sweep. At x=72 margins, 936px / 80 = **11.7px per column**.

**Cover slide.** Manila `#e9dec4`, halftone at half strength, **top-left corner clipped 160px**. The ruler runs across the top at y=64 in Courier Prime 20px `#665834`. Title in Archivo 700 uppercase at **104px** `#201a10`, left at 72px, **max 6 words**, sitting on the lower third. Directly above the title, a `#b8301a` punched row **spanning the title's exact rendered width** — rectangles one column wide (11.7px), 28px tall, gapped 5px.

**Interior slide.** Same stock, same corner, same ruler. Record header at the top in Courier Prime 22px `#665834`: `RECORD 0114 — 28 AUG 2026`. Body in Archivo 400 at **36px** `#201a10`, left at 72px, **max 6 lines of 44 characters**, past tense. Footer bottom-left in Courier Prime 20px: the block's column span, `COL 09-64`. Footer bottom-right: `CARD 3 / 7`. **One ink mark per interior slide, and one only** — either a punched row or a single stamped word, never both.

**End card.** The last card is the index entry: `RECORD 0114 / FILED 28 AUG 2026 / POORIAARAB.COM` in Archivo 700 uppercase at 54px, stacked three lines, with a full-width punched row spanning columns 1 through 80 above it. The ask is stated as a filing instruction, not a plea: `FILED WEEKLY. SUBSCRIBE TO GET THE NEXT ONE.`

**Swipe cue.** The ruler does not finish. **It numbers columns 1 to 62 and then goes silent** — columns 63 to 80 print their tick marks with no numerals and run on to the right margin at x=**1008**. Anyone who has looked at the top of the card for two slides knows there are eighty, and that this one stopped being read at 62.

**The ruler cannot be cut by the frame edge, and the arithmetic is the reason.** At 11.7px per column starting at x=72, column 80 ends at 72 + 936 = **1008**, which is 72px short of the 1080 frame edge — the margin, exactly. Reaching the edge would take 86 columns, and a card has 80. So the cue is the **numbering** stopping, not the lattice stopping. No arrow, no dot row, no "swipe".

**On faces:** punchcard handles a photograph better than any other direction in this family. Print it as a **coarse 6px halftone in `#201a10` on the stock**, cropped square, never full colour, never on the cover. A halftoned face reads as an archive print, which is exactly the register.

**On roadmaps:** do not build a "what's coming" carousel here. Seven filed cards claim seven things already happened.

## 9. YouTube thumbnail

1280×720, designed for the **~210px** version.

Full-bleed manila `#e9dec4` with the column lattice visible and the **top-left corner clipped 120px**. Title in Archivo 700 uppercase, **92px**, `#201a10`, **max 6 words**, left-aligned at a 64px margin, sitting on the lower third. Directly above it, a row of `#b8301a` punched rectangles spanning the title's exact width.

The face sits bottom-right, cropped square, printed as a **coarse 6px halftone in `#201a10` on the stock** — never full colour. At 210px the halftone dots merge into a grey portrait, which is the correct outcome: it still reads as a person, unlike the amber silhouette in [oscilloscope](../../brand-oscilloscope/SKILL.md) or the green cutout in [terminal](../terminal/SKILL.md).

**Do not put the ruler on a thumbnail.** At 210px, 18px Courier Prime is 3px and reads as dirt along the top edge. The clipped corner and the punched row are the identity here.

Recognisably his without being identical: clipped corner, punched row above the title, halftone face. The title changes every time.

## 10. YouTube edit style

**Honest constraint: punchcard is an archival direction, and video is not archival.** Its one motion is a mechanical punch that happens once per session, which is a page-load event with no video equivalent. That makes it a genuinely poor fit for anything live, reactive or in-progress, **and a very good fit for one genre: the retrospective.** A "what I shipped this year" video in punchcard is the direction working exactly as designed. A weekly vlog in it is not.

**Cut rhythm.** Even and slow, one record at a time. 8–12 seconds per record. **A cut lands on the last word of a filed statement**, never mid-clause. Never cut inside the 8-frame card advance below.

**Titles and lower thirds.** The lower third is a record header: `RECORD 0114 — 28 AUG 2026` in Courier Prime 28px `#665834` above, and the subject in Archivo 700 uppercase 44px `#201a10` below, on `#f4ecd8` with a 1px `#cbba93` rule, bottom-left at x=120 / y=880 on a 1920×1080 frame. **In: the punched row above it fills left to right in 12 steps over 144ms, one hole per frame, no fade.** Out: single-frame cut. It never eases and never slides.

**B-roll.** Stills, documents, screenshots and old footage — this direction wants archive material, not new coverage. Grade warm and flat: lift blacks to `#201a10`, pull whites down to `#e9dec4`, desaturate to 40%, add fine grain at 6%. **Play archive footage at 100%.** A halftone overlay at 5px survives 1080p at 8% opacity; drop it entirely below 1080p.

**Transitions.** One only: the **card advance** — the whole frame steps upward by exactly one card height over 8 frames on a `steps(8, end)` ease, and the next card is behind it. It is a card feeder, not a slide, so it must move in visible steps. Every other transition is banned, including any fade.

**Cold open (first 3 seconds).** Frames 1–24: blank stock, the empty 80-column strip across the top, silence. Frames 25–47: the punch pass runs left to right, one hole every 12ms, no fade. Frame 48: the plain-text title appears under the holes in a single cut, and holds for the rest of the three seconds. You have shown the record being made before you say a word about it.

**What this edit cannot do:** urgency, live reaction, or anything unfinished. If the video is about what you are building now, the direction contradicts the content.

## 11. Podcast cover

3000×3000, shown at **150px**. Simplify to three marks.

- **Ruler off. Halftone off.** Both are sub-pixel at 150px, and the halftone costs the ink contrast it cannot spare.
- **Top-left corner clipped at 540px** (18% of the edge, matching the avatar) — the strongest identifier at any size.
- Show title in Archivo 700 uppercase at **380px**, `#201a10`, **two lines maximum, three words per line**, left at 300px, block sitting on the lower half.
- **One `#b8301a` punched row** directly above the title, spanning the title block's exact width: rectangles 90px wide, 150px tall, gapped 40px. At 150px each rectangle is 4.5px — a row of visible red marks, which is the whole point.
- No date, no record number, no photo. Courier Prime at any size that fits renders under 8px.

## 12. Deck and talks

16:9, read from the back of a room. **One card per slide.**

- **The clipped corner and the 80-column ruler appear on every slide.** On a 1920×1080 artboard with 120px margins, 1680px / 80 = **21px per column**. The slide number is filed as `CARD n / N` in Courier Prime **24px** in the bottom-right.
- **Title slide.** Title in Archivo 700 uppercase at **130px**, **never more than 7 words**, with a punched row above it spanning the title's width.
- **Section divider.** The section name at 160px uppercase, plus its record line — `RECORD 03 — 28 AUG 2026` — in Courier Prime 28px. No punched row on a divider.
- **Data slide.** Figures in **Archivo 500 with `font-variant-numeric: tabular-nums`**, right-aligned, on a column-snapped grid, **max 8 rows**. Each row's label is Archivo 400. The row's column span is stamped in the footer. **Not Courier Prime.** The monospace is confined to column numbers, card IDs and dates, and a data figure is none of the three; Archivo's tabular figures are already one width, so the right-aligned column holds without borrowing the ruler's typeface.
- **Slides with a lot of words:** the cap is **45 words** in Archivo 400 at 34px, in past tense, and the slide carries no data. **The red is a stamp: it may punch one row or mark one word per slide, and it may not do both.**

Minimum type: 28px on a 1920px artboard. Never set ink type below 28px on a projected slide — a room's projector will lose the 4.52:1.

## Cost to run

**Moderate.** The furniture is template work — clipped corner, ruler, punched row, record footer — and once built, every asset inherits it. Nothing here needs a designer per post, and the column lattice actually makes layout decisions *for* you, which is a speed advantage most directions do not have.

Two real costs. First, **the column arithmetic**: every block must span whole columns and state the span, so each asset needs a short measuring step. Budget 5 minutes. Second, **the halftone face**: a coarse 6px halftone from a fresh photo takes 10 minutes and cannot be automated well from arbitrary source images. Shoot one good portrait, halftone it once at three crops, and reuse those three forever.

The direction's real constraint is not cost, it is supply. **Punchcard can only publish things that have already happened.** If you post four times a week and only one of those is a finished record, punchcard carries one of the four.

## Pairs with / clashes with

**Pairs with [terminal](../terminal/SKILL.md).** Terminal reports the session as it runs; punchcard files the record afterwards. Green-on-black beside manila is a strong contrast with no hue conflict, and the two split the timeline cleanly between now and then.

**Pairs with [manuscript](../../brand-manuscript/SKILL.md) and [broadsheet](../../brand-broadsheet/SKILL.md)** — all three are print-native and warm-grounded, and punchcard supplies the index that the other two lack.

**Pairs with [annual](../../brand-annual/SKILL.md)** for a year-in-review, where the filed record and the report share a purpose.

**Clashes with [blueprint](../../brand-blueprint/SKILL.md)** on meaning, not on looks. Blueprint promises the building does not exist yet; punchcard insists the record already exists. In one kit the brand contradicts itself about time, and the audience will feel it without being able to name it.

**Clashes with [aurora](../../brand-aurora/SKILL.md) and [arcade](../../brand-arcade/SKILL.md)** — both are lit from within, and this direction is ink on stock that has never been lit by anything but a desk lamp.

**Note on the mono directions:** punchcard is **not** one of them, and this matters when picking a kit. [terminal](../terminal/SKILL.md), [spec](../spec/SKILL.md) and [oscilloscope](../../brand-oscilloscope/SKILL.md) each make a different argument for monospace. Punchcard's prose is Archivo, and Courier Prime appears only on the ruler, the IDs and the dates. That makes punchcard safe to pair with any one of the three, where those three are not safe to pair with each other.

## The failure mode

**Filing something that has not happened.** Punchcard's whole authority comes from the stock: a card is a record, and a record is written after the fact. Set a roadmap, a launch, a prediction or a "coming soon" on card stock and the design contradicts the copy in a way the reader registers as dishonesty before they can explain why. This failure is invisible in review, because the asset looks correct — the corner is clipped, the columns are counted, the date is formatted. It fails on content, not craft. Before shipping any punchcard asset, ask one question: **has this already happened?** If the answer is no, change direction, not the layout.

The second symptom is **fake column spans**. `COL 09-32` is a claim that the block is 24 columns wide. If the block is actually 23.4 columns and the footer rounds, the lattice is decoration and the direction has become a manila-coloured template. Snap the block, then read the span off it. Never the reverse.

The third is **ink used as colour**. `#b8301a` at 4.52:1 has no margin, and it is meant to be a stamp — one row of holes or one marked word per surface. Once it is setting body text, marking headings and drawing borders, it stops reading as ink pressed into stock and starts reading as a brand colour, which is the one thing this direction says it is not.
