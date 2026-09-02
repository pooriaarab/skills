---
name: brand-dusk
description: "Use when you apply the dusk brand direction to any surface: landing page, X avatar, OG card, LinkedIn banner, Instagram carousel, YouTube thumbnail or edit, podcast cover, deck. dusk is one ember horizon rule at 62% height, cool above and warm below, for reflective long-form work written after the fact. Triggers: 'dusk direction', 'horizon rule', 'apply dusk', 'brand this as dusk', 'dusk thumbnail', 'dusk carousel'."
---

# dusk

**the hour after the sun has gone but before the lights come on.**

One ember horizon rule at 62% height that every page shares. Above it the field cools to indigo. Below it the field warms to ember. Nothing crosses the line.

**Use dusk when** the work is long-form reflection: an essay, an annual letter, a post-mortem, anything written after the fact rather than during it.

**Avoid dusk when** the page is a call to action, a pricing table, or a launch. dusk reads as looking back, so it makes a live offer feel already over. That is not a soft preference — see [The failure mode](#the-failure-mode).

Contract: [`../_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md). Picker: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

## Tokens

Native mode is **dark**. The light mode is an argued port, not an inversion: the same hour seen from indoors with the lamp on. The sky still runs warm-to-cool. The ember is the identical ember.

```
dark   bg #10131f  surface #171b2b  fg #f2e9dd  muted #a294a8  border #2a2f45
       accent #f2a25c  accentFg #2a1a08  ring #f2a25c  alt #6f7fb8  alt2 #c2607a
light  bg #f6efe6  surface #fdf8f1  fg #221c26  muted #6b5c6b  border #e3d5c8
       accent #f2a25c  accentFg #2a1a08  ring #f2a25c  alt #5b6a9e  alt2 #a84a63
```

Verified contrast — dark fg/bg **15.40**, muted/bg **6.47**, accentFg/accent **8.08**; light fg/bg **14.58**, muted/bg **5.46**, accentFg/accent **8.08**. Ember on the dark field is **8.90**, so `#f2a25c` is legal as text.

**Type.** Display `"Fraunces", Georgia, serif` 500 / `-0.03em` / leading `1.06`. Body `"Instrument Sans", system-ui, sans-serif` 400 / `0em` / `1.68`. Mono `"IBM Plex Mono", ui-monospace, monospace` 400 / `-0.01em` / `1.5`. Scale **1.25** from 17px: 17 / 21 / 27 / 33 / 42 / 52 / 65 / 81 / 101. Google families: `Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600`, `Instrument Sans:wght@400;500;600`, `IBM Plex Mono:wght@400`.

**Depth.** Radius `8px`. Hairline `1px solid #2a2f45`. Shadow `0 24px 48px -28px rgba(5,7,16,0.90), 0 2px 6px -2px rgba(242,162,92,0.22)` — the deep layer is the ground shadow, the short warm layer is the ember bouncing off it.

**Texture, web and OG only.** `background-image: linear-gradient(to top, rgba(242,162,92,0.16) 0%, rgba(194,96,122,0.10) 26%, rgba(111,127,184,0.07) 52%, transparent 78%); mix-blend-mode: screen; pointer-events: none;` **Every other surface uses the flat field `#0a0c16`.** At small sizes the gradient reads as grey haze. Do not skip this rule.

**Motion.** `cubic-bezier(0.16, 1, 0.3, 1)`, `700ms`. On first paint the horizon rule draws outward from the exact centre of the page to both edges, and the warm field below it is clipped to that rule's current width, so the ember band arrives with the line. One gesture, once per load. Nothing loops and nothing drifts after. Under `prefers-reduced-motion` the rule and band are at full width on paint.

## Small-export variants

dusk carries two fields, and mixing them is the most common mistake in the direction. **The gradient ships on the web and the OG card only. Every other surface uses flat `#0a0c16`.** The horizon rule is promoted per surface so it still renders at 1.2px or more at the size the asset is actually seen.

| Surface | Field | Rule | Renders |
| --- | --- | --- | --- |
| web | gradient on `#10131f` | 2px at `62vh` | 2px |
| avatar, 400 at 48px | flat `#0a0c16` | 10px at 78% height | 1.2px |
| OG, 1200 at ~400px | gradient below the rule | 4px at y=390 | 1.3px |
| X header, 1500 | flat `#0a0c16` | 3px at y=340 | 3px |
| YouTube banner, 2560 at ~390px | flat `#0a0c16` | 5px at y=893 | 0.8px on a phone |
| LinkedIn banner, 1584 | flat `#0a0c16` | 3px at y=246 | 3px |
| LinkedIn post, 1200 at ~550px | flat `#0a0c16` | 4px at y=389 | 1.8px |
| Instagram, 1080 | flat `#0a0c16` | 8px at y=837 | 8px |
| YouTube thumbnail, 1280 at 210px | flat `#0a0c16` | 14px at y=446 | 2.3px |
| Podcast, 3000 at 150px | flat `#0a0c16` | 60px at y=1860 | 3px |
| Deck, 1920 projected | flat `#0a0c16` | 6px at y=670 | 6px |

## 1. Voice and writing

**Tone.** Someone telling you at the end of the day what the day actually turned out to be, including the part that did not work.

**Casing.** Sentence case. Headlines end without a full stop; body sentences keep theirs. Never title case. Never all caps except a mono date.

**Rhythm.** Mid-length declaratives, 12 to 22 words, one subordinate clause maximum. A fragment is allowed only as the last sentence of a paragraph, where it lands as the admission.

**Do say:** "here is what the day turned out to be" · "I was wrong about this in March" · "slower than I wanted, further than I thought" · "it took nine months and I planned for three".

**Don't say:** "crush it" · "rise and grind" · "blazing fast" · "supercharge" · "game-changer" · "let's go".

**The tell.** Every dusk paragraph contains one admission: a thing that did not work, in the past tense, with no hedge and no recovery clause after it. A paragraph without an admission is not dusk yet.

## 2. Landing page

The horizon is the layout, not a mood. Place sections by which side of the line they belong to.

- **The rule.** `position: fixed; top: 62vh; left: 0; width: 100vw; height: 2px; background: #f2a25c;`. Present on every screen of scroll. It never moves.
- **The clearance.** No text, image or control sits within 24px of `62vh`. Pad sections so the rule always falls in a gutter. This is the direction's one expensive constraint and it is not optional.
- **Above the line:** flat `#10131f` — titles, claims, questions. **Below the line:** the bleed gradient — evidence, numbers, dates, the admission.
- **Hero.** h1 Fraunces 500 at 81px, max nine words, baseline 96px above the rule, left inset 80px desktop / 24px mobile.
- **Body.** Instrument Sans 400 at 17px, leading `1.68`, measure 68 characters, one column, left aligned, never justified.
- **Sections divide** by 160px of space plus one IBM Plex Mono label at 13px in `#a294a8`. Never a second rule — the page gets one rule.
- **The carrying element** is the rule. Remove everything else and the page is still dusk; remove the rule and nothing else saves it.

## 3. X / Twitter avatar

dusk survives 48px, in the flat variant only.

400×400 on flat `#0a0c16` — the small-export field the table declares, not the web base `#10131f`. **No gradient** — at 48px it turns to mud. Face cropped crown-cut to mid-neck, lit from below-left in `#f2a25c` so the fill light is visibly the ember. One `#f2a25c` rule, 10px tall, full 400px width at 78% height (y=312), behind the shoulders. No ring, no circle border, no text.

At 48px the 10px rule renders **1.2px** and survives as a warm seam under the jaw. That is the point: at thumbnail size the avatar is a dark square, a face, and one ember line.

## 4. X header and YouTube banner

**X header, 1500×500.** Rule runs the full width at **y=340**, 3px, ember. One sentence in Fraunces 500 at 46px above it, left inset 96px. Below the rule: empty warm field. No handle, no icons, no logo. Note the y — off-site the rule sits at the surface's own declared height, not blindly at 62%. Here it is 68%, because the profile card crops the lower band.

**YouTube banner, 2560×1440, safe area 1546×423 (x 507–2053, y 508–931).**

- Field: flat `#0a0c16` across the full frame. No gradient at this size.
- Rule: full 2560px width at **y=893** (62% of 1440), 5px, `#f2a25c`. y=893 lands inside the safe area near its lower edge, so the phone crop keeps the line. That is why 62% is the right placement here.
- Inside the safe area: one sentence, Fraunces 500 at 64px, `#f2e9dd`, baseline y=812, left inset x=560, maximum eleven words. Below the rule: nothing.
- Outside the safe area: field only. Decoration there is wasted, and dusk has no decoration to waste.

## 5. Open Graph card

1200×630. Rule 4px `#f2a25c` at **y=390**. Headline Fraunces 500 at 72px, maximum nine words, above the rule, left inset 80px. Below the rule: the warm gradient band (OG is the one export where the gradient is licensed) and one 20px IBM Plex Mono line, the date only. No logo.

**Shrink maths at the ~400px feed render (0.33×):** headline 72px → 24px, survives. Rule 4px → 1.3px, survives. Mono date 20px → 6.7px, **does not survive** — it is a full-size reward and must never carry information the headline needs. Drop nothing else, because there is nothing else.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop: treat x 0–272, y 216–396 as a hole.

- Field: flat `#0a0c16`.
- Rule: full 1584px width at **y=246** (62% of 396), 3px, `#f2a25c`. It passes behind the photo hole, which is correct — the photo then sits below the line, in the warm half, where a face belongs in this direction.
- One sentence, Fraunces 500 at 40px, `#f2e9dd`, baseline y=206, left inset **x=320** to clear the photo, maximum ten words.
- Below the rule, right of the hole: empty. No handle, no logo, no icons.

## 7. LinkedIn post image

1200×627. Field flat `#0a0c16` — **the gradient is not licensed here**, because LinkedIn re-encodes to JPEG and a wide low-alpha wash bands into visible steps. Rule full width at **y=389**, 4px. Headline Fraunces 500 at 58px, max twelve words, above the rule, left inset 72px. Below the rule: one Instrument Sans line at 22px in `#a294a8`. One line.

**In a room full of suits** dusk needs no dialling down. It is already the quiet tile in a feed of red arrows. The only change from web is the flat field.

**The warning that matters more.** LinkedIn is where launch posts live, and dusk must never carry one. A hiring post, a launch, a "we raised" post or a booking link rendered in dusk reads as an archive of something that already closed. If the post has an ask with a deadline, use another direction. dusk takes the write-up after.

## 8. Instagram carousel

1080×1350. The horizon sits at **y=837** (62% of 1350) on every slide and never moves across the set. That fixed y is what makes ten slides one object.

**Cover.** Flat `#0a0c16`, rule 8px `#f2a25c` at y=837. Headline Fraunces 500 at 108px, `#f2e9dd`, maximum six words, left inset 72px, baseline y=741, entirely above the rule. Below the rule: nothing.

**Swipe cue.** On the cover only, the rule stops 96px short of the right edge at x=984. That 96px gap says the line continues on the next slide. From slide 2 on it runs the full 1080px. No arrow, no "swipe" text, no dots — dusk has one mark, so the cue is made from it.

**Interior.** Same field, rule at y=837 full width, 8px. Copy in Instrument Sans 400 at 40px, leading `1.68`, left inset 72px, top y=180, maximum 55 words, entirely above the rule. Below the rule: at most one IBM Plex Mono line at 26px in `#a294a8` — a date, a figure, a source. Usually nothing. Carousel copy is display copy, not body copy: it cannot hold a 60–75 character measure at a legible size, so the 55-word cap replaces the measure cap. Split the slide rather than shrink below 36px.

**End card.** The ask is "the full essay is at pooriaarab.com", Fraunces 500 at 64px above the rule, left inset 72px. Below the rule: the URL in IBM Plex Mono at 32px, `#f2a25c`. The rule stops 96px short of the **left** edge, mirroring the cover. The set opened with an unfinished line and closes with one.

## 9. YouTube thumbnail

Design for the ~210px render.

1280×720 on **flat `#0a0c16`**, gradient removed entirely. Rule 14px in `#f2a25c` at **y=446** (62%), full width. Maximum four words, Fraunces 500 at 132px in `#f2e9dd`, left inset 72px, entirely **above** the rule. The face, if used, bleeds off the right edge entirely **below** the rule. Nothing crosses the rule.

At 210px the 14px rule renders **2.3px** and the 132px type renders **21.7px**; both hold. At the older 168px render the rule is still ~1.8px.

**Recognisable without being identical.** Three things are frozen forever: the flat `#0a0c16` field, the ember rule at 62%, and the four-word ceiling with the words above the line. Two things are free: which one to four words, and whether the face is there. That is the whole variable space. Resist adding a third.

## 10. YouTube edit style

**Cut rhythm.** Slow. Minimum shot 4 seconds in the body, 2.5 seconds anywhere. A cut lands on the end of a sentence, never mid-clause. One exception: audio may lead video by 400ms at a section change, and nowhere else.

**Titles and lower thirds.** Fraunces 500 at 64px (1080p), `#f2e9dd`, left inset 96px, above a 6px ember rule at **y=670** (62% of 1080) spanning the full frame. In: the rule wipes outward from frame centre to both edges over 700ms `cubic-bezier(0.16, 1, 0.3, 1)` while the text, already at full opacity, translates up 24px. Out: the rule collapses back to centre over 700ms. The title never fades up from nothing.

**B-roll.** Lift blacks to a `#10131f` floor. Warm highlights toward `#f2a25c`. Saturation −15%. Grain 2%. Speed 100% or 85%. No speed ramps, ever.

**Transitions.** Hard cut only, plus one exception: a 700ms dip to `#10131f` at a section change. No wipes, no whips, no zooms, no cross-dissolves.

**The cold open.** Seconds 0 to 3 are the horizon rule drawing outward from centre on flat `#0a0c16`, with the first sentence already on screen at full opacity and never fading in. The voice starts at 0:00 and says the admission first: the thing that did not work. Every dusk video opens this way.

## 11. Podcast cover

3000×3000, seen at 150px beside hundreds of others. Simplify to three elements.

- Field: flat `#0a0c16`. No gradient, no grain, no photograph.
- Rule: full 3000px width at **y=1860** (62%), **60px** tall, `#f2a25c`. That renders 3px at 150px, the smallest mark that reads in a podcast grid.
- Title: Fraunces 500 at 300px in `#f2e9dd`, maximum three words, left inset 180px, baseline y=1680, above the rule. At 150px the type renders 15px, so three short words is a hard ceiling, not a style choice.
- Below the rule: nothing. No episode number, no host name, no mic, no logo.

## 12. Deck and talks

16:9, 1920×1080, read from the back of a room. Every slide carries the rule at the same **y=670** (62%), 3px, full width. Titles live above it; evidence and numbers live below it. **A slide that moves the rule, or a slide with no rule, is off-brand.**

- **Title slide.** Title above the rule, Fraunces 500 at 120px, left inset 160px. Date below the rule, IBM Plex Mono 28px. Nothing else.
- **Section divider.** The rule plus one word above it at 180px. Below: empty.
- **Data slide.** The number sits below the rule, because evidence lives below: Fraunces 500 at 220px in `#f2a25c`, its label under it in IBM Plex Mono 24px. The claim the number supports sits above the rule at 64px.
- **Slides with a lot of words.** Maximum 40 words above the rule at 36px Instrument Sans. If it does not fit, split the slide. Never shrink below 32px and never move the rule to make room.
- **Projection.** 3px at 1920 is thin from 15 metres. Export the rule at 6px for a projected deck; keep 3px for a PDF read on a laptop. Two exports, stated.

## Cost to run

**Moderate.** Every asset is a rectangle, a rule at a known y, and one line of Fraunces. Eight templates cover twelve surfaces, and a post takes about six minutes once they exist.

Two costs are real. **The fixed horizon on the web:** every new section needs a clearance audit so nothing lands within 24px of `62vh`. That is a five-minute check on every page you add, forever. **Two fields to keep straight:** web and OG carry the gradient, everything else is flat `#0a0c16`. One gradient export that slips into a thumbnail set is instantly visible as grey haze, and it is the most common dusk mistake.

dusk is viable for one person publishing weekly. It is not viable if that person also ships launches, because half the calendar then needs a second direction.

## Pairs with / clashes with

**Pairs with [`../vellum/SKILL.md`](../brand-vellum/SKILL.md).** Both are warm, unhurried, and native to work with a history. dusk is the reflection at the end of the day; vellum is the stack of drafts that produced it. The ember `#f2a25c` and the vermilion `#a8331f` sit in the same warm quadrant, so a kit that runs dusk for essays and vellum for changelogs holds together.

**Pairs with [`../broadsheet/SKILL.md`](../brand-broadsheet/SKILL.md).** Shared long-form register, shared single column. Broadsheet takes the reported piece; dusk takes the personal one.

**Clashes with [`../stadium/SKILL.md`](../brand-stadium/SKILL.md).** Stadium is the present tense at volume; dusk is the past tense at a murmur. Run both on one account in one week and the reader cannot tell whether anything is currently happening.

**Clashes with [`../arcade/SKILL.md`](../brand-arcade/SKILL.md).** Arcade is now, lit and loud; dusk is after, dim and slow. No surface is right for both.

## The failure mode

**dusk fails as sad gradient wallpaper.**

The direction is the rule. The gradient is only what happens under it. The moment the rule loses precision — it drifts off 62%, a headline crosses it, a card overlaps it, a section forgets it — the gradient becomes the whole idea, and dusk collapses into a generic dark-mode hero with a sunset behind it. That is indistinguishable from a thousand landing pages, and it is what every failed dusk looks like. The diagnostic is one question: **did anything cross the line?**

The second failure is worse, because the file looks correct and only the result is wrong. dusk on a live offer kills the offer. The direction encodes "this already happened", so a pricing page, a launch post or a booking link rendered in dusk reads as an archive of something that closed. When the content has a deadline, use another direction and come back to dusk for the write-up.
