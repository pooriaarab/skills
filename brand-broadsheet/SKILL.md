---
name: brand-broadsheet
description: "Use when the piece has a byline and a date and the reader may cite it later: essays, reporting, results write-ups, corrections, long posts that argue a case. Ink on newsprint, real columns, one ink-red kicker. Reach for this over swiss when the content is prose rather than a system, and over manuscript when the piece is reported rather than contemplative. Triggers: 'make this look like a newspaper', 'editorial brand', 'newsprint', 'I write essays and want a serious identity', 'byline and dateline', 'give my long posts a house style'."
---

# broadsheet

> ink on newsprint, set tight, and it assumes you can read.

Newsprint. A hairline rule under the masthead, body copy in real columns at a
62-character measure, and the only colour on the page is one ink-red kicker above the
headline. Sober, dense, authoritative.

**Use when** the piece has a byline and a date. Essays, reporting, results, anything the
reader will cite later.

**Avoid when** the page is one product with one button, or the reader is on a phone and
in a hurry.

**Native mode:** light. **Family:** editorial. Router:
[brand-router](../brand-router/SKILL.md). Contract: [the twelve
surfaces](../brand-router/_lib/surfaces.md) and [the craft floor](../brand-router/_lib/craft-floor.md).

---

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| bg | `#f4f1e8` | `#12110d` |
| surface | `#fbf9f2` | `#1b1914` |
| fg | `#14120e` | `#ece7d9` |
| muted | `#5d5849` | `#9a9280` |
| border | `#d4cebc` | `#2c2921` |
| accent (kicker red) | `#8c1d13` | `#d9614c` |
| accentFg | `#f4f1e8` | `#12110d` |

Verified contrast: light `fg`/`bg` **16.56:1**, `muted`/`bg` **6.29:1**, `accent`/`bg`
**8.08:1**. Dark `fg`/`bg` **15.29:1**, `muted`/`bg` **6.11:1**, `accent`/`bg`
**5.19:1**. All pass 4.5:1.

**The dark mode is the late edition.** Not an inversion — the same press run printed on
the paper the night desk uses. The red lifts to `#d9614c` because `#8c1d13` on `#12110d`
is 2.07:1 and invisible. Nothing else changes character.

**Type.** Display `"Libre Baskerville", Georgia, "Times New Roman", serif` 700, tracking
`-0.015em`, leading `1.06`. Body `"Source Serif 4", Georgia, serif` 400, tracking `0em`,
leading `1.52`. Mono `"IBM Plex Mono", ui-monospace, monospace` 400, tracking `-0.01em`,
leading `1.45`. Scale ratio **1.2**. Google families: `Libre Baskerville:wght@400;700`,
`Source Serif 4:wght@400;600`, `IBM Plex Mono:wght@400;500`.

**Radius 0. Shadow: none** — ink on paper casts none. Hairline `0.5px solid #14120e`.

**Texture — halftone.** Apply as a `::before` overlay on the canvas:

```css
background-image: radial-gradient(circle at 50% 50%, rgba(20,18,14,0.10) 0.7px, transparent 0.8px);
background-size: 3.5px 3.5px;
background-position: 0 0, 1.75px 1.75px;
```

**Motion.** Ease `cubic-bezier(0.22, 1, 0.36, 1)`, duration `520ms`. One authored
moment: on first paint the hairline under the masthead draws left to right across the
full column measure, and the dateline is uncovered by the rule as it passes, like a
press bar clearing the sheet. It happens once. Nothing on this page moves on scroll,
ever. Animate `transform: scaleX()` from the left origin — the rule and the dateline are
already in the DOM at full opacity, so a screenshot and a crawler both see them. Respect
`prefers-reduced-motion`: the rule is simply there.

---

## 1. Voice and writing

**Tone.** A staff writer filing at deadline: the fact first, the qualifier second, and
no adjective that is not load-bearing.

**Casing.** Sentence case in headlines, always. Kickers in small caps with `0.08em`
tracking. The masthead is the only thing set in full caps.

**Sentence rhythm.** Declarative and medium-length. Fragments are allowed only in the
kicker. Every paragraph leads with its own conclusion, so a reader who stops after the
first sentence still has the news.

**Do say.** "Reported this week" · "The number is 14,000, and here is where it came
from" · "Correction:" · "Three people who were in the room disagree" · "As of Tuesday".

**Don't say.** "just dropped" · "hot take" · "insane" · "sneak peek" · "we're excited to
announce" · "thread below".

**The tell.** The attribution clause. Every claim carries where it came from inside the
sentence that makes it, not in a link at the end.

## 2. Landing page

The masthead is the hero: `POORIA ARAB` in Libre Baskerville 700 small caps at 28px with
`0.14em` tracking, flush left, then a full-width `0.5px #14120e` rule 16px below. No
image above the fold.

Under the rule, the lead piece: kicker in `#8c1d13` small caps 14px, headline in Libre
Baskerville 700 at 64px sentence case held to a 62-character measure, then the
standfirst in Source Serif 4 at 21px.

Sections divide by rule, never by card, never by background change. Two columns appear
only above 1180px, where each column still holds 62 characters; below that the page is
one column and the rules stay.

Whitespace is column gutters (48px) and the space under a rule (24px above, 16px below).
There is no hero padding — the page starts at the masthead.

**The carrying element:** the kicker. One red thing per page. If a second red appears,
the direction is gone.

## 3. X / Twitter avatar

Black-and-white portrait rendered as a 60-line halftone, cropped from the collarbone up
with the face filling 70% of the frame, on `#f4f1e8`. A `0.5px #14120e` rule crosses the
bottom eighth of the square, with the surname under it in 8pt small caps.

**At 48px that spec fails.** A 60-line halftone becomes mud, a 0.5px rule vanishes, and
8pt type is one grey smear. Export a separate 48px variant:

- Same portrait, halftone dropped entirely, converted to a 2-tone threshold at 55% —
  `#14120e` on `#f4f1e8`, no midtones.
- Face fills 82% of the frame, cropped at the chin.
- Rule becomes **2px**, at 88% of the square height, full width.
- No name. It is unreadable at 48px, so it is a lie to include it.

Ship the halftone at 400px for the profile page and the 2-tone file as the one X
downsamples.

## 4. X header and YouTube banner

2560×1440. The phone-safe area is 1546×423 centred: x **507–2053**, y **509–932**.
Everything outside it is decoration and must be ignorable.

Six `0.5px #14120e` column rules run the full 1440px height on `#f4f1e8`, spaced evenly
across the full 2560 width. That is the decoration.

Inside the safe area: one sentence of no more than 11 words in Libre Baskerville 700 at
72px, sentence case, sitting on the baseline of the third column rule (flush left
against it, not centred). Nothing else in the frame. No name, no handle, no URL — the
platform already shows them.

## 5. Open Graph card

1200×630, read in feed at roughly 400×210. Nothing under 28px survives.

Newsprint field with the halftone at 60% strength. Masthead `POORIA ARAB` top-left at
24px small caps, `0.14em` tracking, 64px from the left and top. A full-width `0.5px`
rule beneath it. Then the headline at **56px** Libre Baskerville 700, sentence case,
held to a 62-character measure, maximum 12 words over three lines. Dateline bottom-left
in IBM Plex Mono **26px**: city, comma, date.

**Drop for the shrink:** the standfirst, the kicker, the author photograph. A kicker at
14px scaled to feed size is a red dash and reads as damage.

## 6. LinkedIn banner

1584×396. On desktop the profile photo covers the lower-left. Keep the leftmost
**300px** and the bottom **80px** completely clear.

Column rules run the full height across the whole 1584px, unchanged — they read
correctly even where the photo covers them, because they are a field, not a message.

The message sits from x=**360** to x=**1500**, vertically centred: one line, Libre
Baskerville 700 at 40px, sentence case, maximum 9 words. Above it a kicker in `#8c1d13`
small caps 16px. Nothing in the bottom 80px.

## 7. LinkedIn post image

1200×627. This is the most conservative room the brand enters, and broadsheet is the
direction that needs the least adjustment for it — a newspaper already reads as credible
in a room full of suits.

**Dial down by one step, not more:** drop the halftone texture to 40% strength and set
the headline at 48px instead of 56px so more of the argument fits. Keep the kicker red.
Keep the dateline.

Structure: masthead, rule, kicker, headline, then a two-line standfirst at 22px Source
Serif 4. Left-aligned, 72px margins. The bottom right holds the piece number in IBM Plex
Mono 20px, e.g. `no. 41`.

Do not add a photograph of yourself. On LinkedIn that reads as a personal brand post;
broadsheet reads as a filed piece, and the difference is the whole point.

## 8. Instagram carousel

1080×1350. Margins 80px on all sides. Halftone at full strength on every slide.

**An honest deviation:** broadsheet's deck rule is two columns, never one. At 1080px
wide a second column cannot hold 60 characters at a readable size, so the carousel runs
**one column** and keeps the column rules as the decoration instead. Do not fake two
columns on a phone.

**Cover slide.** Masthead `POORIA ARAB` 28px small caps top-left. Full-measure `0.5px`
rule under it. Kicker in `#8c1d13` small caps at 30px. Headline in Libre Baskerville 700
at **96px**, leading 1.06, sentence case, flush left, maximum 9 words over three lines.
Dateline bottom-left, IBM Plex Mono 22px. No image.

**Swipe cue.** A single `0.5px #14120e` vertical rule 40px in from the right edge,
running from the masthead rule to the bottom margin, with `1/7` set on it in IBM Plex
Mono 18px, rotated 90°, sitting a third of the way down. It reads as a folded page edge.

**Interior slide.** Same rule at the top, without the masthead. One column of Source
Serif 4 at **30px**, leading 1.52, flush left — 65 characters across the 920px measure,
so the measure holds. Maximum 9 lines. A subhead in Libre Baskerville 700 at 40px is
allowed once per interior slide. The slide number sits bottom-right in IBM Plex Mono
18px. **No red on any interior slide.**

**End card.** The ask is a subscription, not a follow. Masthead, rule, then one line in
Libre Baskerville 700 at 56px: "The letter goes out on Sundays." Under it in IBM Plex
Mono 24px, the URL. The red appears here for the second and last time in the carousel,
as a `0.5px` rule under the URL only.

## 9. YouTube thumbnail

1280×720, designed for the **~210px wide** version.

Kicker top-left in `#8c1d13` small caps at **72px**, 3 words maximum. Under it a `2px`
rule — 0.5px does not survive the downsample, so this is the one place the hairline gets
thicker. Then the headline in Libre Baskerville 700 at **120px**, sentence case, 9 words
maximum, broken over three flush-left lines. The portrait is knocked out into the right
third only. **Type never sits on the face.**

**The recognisability rule:** the kicker-rule-headline stack in the left two thirds,
every time, in that order. What changes is the headline and the crop. What never changes
is the stack. Two thumbnails side by side read as two editions of the same paper, not
two designs.

## 10. YouTube edit style

**Cut rhythm.** Slow. Hold a shot for 4–8 seconds. A cut is allowed to land only on the
end of a sentence, never mid-clause. Never cut on a beat — this direction has no beat.

**Titles and lower thirds.** Lower third sits at x=120, y=840 on a 1920×1080 frame:
kicker in `#8c1d13` small caps 28px, a `2px #14120e` rule, then the name or claim in
Libre Baskerville 700 at 46px on a `#f4f1e8` plate with zero radius. In: the rule wipes
left to right over 520ms with `cubic-bezier(0.22, 1, 0.36, 1)` and uncovers the type,
exactly as on the web. Out: it wipes back the same way. Hold for 4 seconds.

**B-roll.** Desaturate to 15% chroma, lift blacks to `#14120e` (never pure black), add
4% monochrome grain. Speed is 100% — no ramps, no slow motion.

**Transitions.** One only: the **hard cut**. No crossfade, no whip, no zoom. A dip to
`#f4f1e8` is permitted once per video, at the section break, over 8 frames.

**The cold open.** Three seconds: the frame holds on `#f4f1e8`, the masthead rule draws
across it, the kicker and the claim are uncovered, hard cut to the first shot. No music
before the cut. That silence is the hook.

## 11. Podcast cover

3000×3000, shown at 150px. At 5% scale the halftone is invisible, a 0.5px rule is
nothing, and body copy is a grey block. Simplify hard.

Keep three things: the field `#f4f1e8`, the masthead, and one red mark.

- Show title in Libre Baskerville 700 at **420px**, sentence case, 3 words maximum, over
  two lines, flush left with a 300px margin.
- A **12px** `#14120e` rule above it, full width inside the margins.
- A `#8c1d13` square of 180×180 hard in the top-right, 300px from each edge.
- Nothing else. No portrait, no episode count, no halftone.

## 12. Deck and talks

16:9, read from the back of a room.

**Title slide.** Masthead top-left at 40px small caps, full-width `2px` rule, then the
talk title in Libre Baskerville 700 at 120px, sentence case, maximum 8 words. Dateline
bottom-left in IBM Plex Mono 24px: city, comma, date.

**Section divider.** Kicker in `#8c1d13` small caps 32px, rule, section name at 88px.
Nothing else on the slide.

**Data slide.** The number is set in Libre Baskerville 700 at 200px, and the source is
set directly beneath it in IBM Plex Mono 22px. A chart is allowed only if it is a line
or a bar, `#14120e` on `#f4f1e8`, with no gridlines and no legend. Never a pie.

**Slides with a lot of words.** Two columns per slide, never one — at 1920px each column
holds 62 characters at 28px, so the measure survives. Slide number bottom-right in IBM
Plex Mono 22px. The red appears **once in the whole deck**, on the pull quote.

---

## Cost to run

**Moderate.** The design is cheap: one type pairing, one rule, one red. A template in
Figma or an HTML component covers every surface, and a post takes about 15 minutes once
it exists.

The cost is the copy. Every asset needs a real headline, a real kicker and a real
dateline, and a byline you cannot back up is worse than no byline. If you publish weekly
and you write anyway, this is sustainable. If you publish daily and you do not write,
this direction will expose that in four weeks.

## Pairs with / clashes with

**Pairs with [dispatch](../brand-dispatch/SKILL.md)** — the same newsroom, different desk.
broadsheet is the considered piece, dispatch is the wire copy. Use broadsheet for the
essay and dispatch for the short update, and the two read as one publication.

**Pairs with [annual](../brand-annual/SKILL.md)** — a results letter set in annual slots into
a broadsheet page without argument. Both treat a figure as something you have to source.

**Clashes with [risograph](../brand-risograph/SKILL.md)** — riso's misregistration is the
opposite claim about print. broadsheet says the press is exact; riso says it is
charmingly not. Pick one.

**Clashes with [stadium](../brand-stadium/SKILL.md) and [arcade](../brand-arcade/SKILL.md)** — a
stadium headline on newsprint is a tabloid, and a tabloid is a different brand with
different credibility.

**Careful next to [manuscript](../brand-manuscript/SKILL.md)** — same paper family, and at a
glance they can read as one direction. They only coexist if broadsheet holds the
reported work and manuscript holds the essays, and the split is visible.

## The failure mode

**It becomes a serif blog.** Drop the kicker, the dateline and the masthead rule and
nothing is left but Georgia on cream, which is the default look of every writing
platform since 2012. The three structural marks are not decoration; they are the
direction.

The second failure is **red creep**. Two reds on a page, and the ink-red kicker stops
meaning "this is the one thing" and starts meaning "this is a colour we use". One red.
One place. Per page, per card, per deck.

The third is **borrowed authority**: a byline and a dateline over an opinion with no
reporting behind it. Newsprint promises that somebody checked. If nobody did, the form
is lying, and readers who know newspapers will feel it before they can say why.
