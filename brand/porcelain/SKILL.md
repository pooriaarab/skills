---
name: porcelain
description: "Use when you apply the porcelain brand direction to any surface: landing page, X avatar, OG card, LinkedIn banner, Instagram carousel, YouTube thumbnail or edit, podcast cover, deck. porcelain is a single 1px hairline at the 33% column with content hung off its right and metadata off its left, and nothing else drawn at all. Triggers: 'porcelain direction', 'apply porcelain', '33% hairline', 'brand this as porcelain', 'porcelain thumbnail', 'porcelain carousel'."
---

# porcelain

**one line down the page, and everything hangs off it.**

A single 1px hairline runs floor to ceiling at the 33% column of every page, and it is the only non-text mark in the system. Content hangs off its right. Metadata hangs off its left. Nothing ever crosses it.

porcelain is the most restrained direction in the suite, and the restraint is enforced by subtraction: **if an element cannot be expressed as text hung off the hairline, it does not ship.** No cards, no filled buttons, no icons, no dividers, no second rule.

**Use porcelain when** one claim, one number, or one piece of work has to be taken seriously with no help from the design: an about page, a thesis, an investor memo, a single case study.

**Avoid porcelain when** the page needs energy, or it needs to hold more than one idea at a time. porcelain has no way to raise its voice and no second level of hierarchy.

Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Picker: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

## Tokens

Native mode is **light**. The dark mode is an argued port, not an inversion: it is black-glaze ware. Same reduction, same single hairline at the same column, same celadon, fired dark instead of white. The hairline is still 1px and still the only mark.

```
light  bg #fbfaf8  surface #ffffff  fg #171a1b  muted #5f6a6c  border #e4e5e2
       accent #2f5149  accentFg #f4f8f6  ring #2f5149
dark   bg #101211  surface #161918  fg #eef1ef  muted #93a09b  border #212524
       accent #7fbfa8  accentFg #0b1512  ring #7fbfa8
```

**There is no `alt` and no `alt2`, in either mode.** A second voice is exactly what this direction refuses. Do not add one. `#2f5149` is celadon, the one glaze a white porcelain body was ever given.

Verified contrast — light fg/bg **16.78**, muted/bg **5.35**, accentFg/accent **8.19**; dark fg/bg **16.54**, muted/bg **6.93**, accentFg/accent **8.78**. Celadon on the light field is **8.41**, so `#2f5149` is legal as text.

**Type.** Display `"Inter Tight", system-ui, sans-serif` 300 / `-0.035em` / leading `1.0`. Body `"Inter", system-ui, sans-serif` 400 / `0em` / `1.65`. Mono `"IBM Plex Mono", ui-monospace, monospace` 400 / `-0.01em` / `1.5`. Scale **1.18** from 17px: 17 / 20 / 24 / 28 / 33 / 39 / 46 / 54 / 64 / 76. Google families: `Inter Tight:wght@300;400;500`, `Inter:wght@400;500`, `IBM Plex Mono:wght@400`.

**Depth.** Radius `2px`, a fired fillet, applied to **images only**. Hairline `1px solid #e4e5e2`. Shadow `0 1px 1px 0 rgba(23,26,27,0.05), 0 12px 28px -24px rgba(23,26,27,0.22)`, permitted on **one element per page** — a lifted image — and on nothing else. porcelain barely casts, so the values sit near the threshold of visibility on purpose.

**Texture: none.** porcelain declines the overlay. The declared CSS is `background-image: none; pointer-events: none;` — it mounts as a `::before` and deliberately paints nothing. A texture here would be the second mark, and the direction only gets one.

**Motion.** `cubic-bezier(0.33, 1, 0.68, 1)`, `620ms`. On first paint the hairline grows down from the top of the viewport to the bottom, and the text hung off it is masked to the hairline's current height, so a paragraph becomes visible at the moment the line reaches it. That is the only animation in the direction. Hovers, links and buttons change instantly, with no transition at all.

**On the craft floor's silent-failure rule.** A height mask hides content, so gate it: the resting state in the markup is fully revealed, and the mask is applied by a class added after first contentful paint. No JavaScript, a print, a crawler or `prefers-reduced-motion` all get the revealed state. Never author the mask in the base stylesheet.

## Small-export variants

**A 1px hairline does not survive a small render, and this direction says so rather than pretending otherwise.** Every off-site surface promotes the line. The promotion is not a licence to redesign — the line stays at the 33% column, stays floor to ceiling, and stays the only mark.

**The rule for any surface not listed below:** solve so the hairline renders at **1px or more at the width the asset is actually seen**, and at **1.4px or more wherever that display width is under 250px**. Then keep the 33% column.

| Surface | Asset width | Seen at | Authored hairline | Renders |
| --- | --- | --- | --- | --- |
| web | viewport | 1:1 | 1px `#e4e5e2` | 1px |
| avatar | 400 | 48px | 12px `#e4e5e2` at x=132 | 1.44px |
| YouTube thumbnail | 1280 | 210px | **16px `#eef1ef`, inverted**, x=422 | 2.6px |
| OG card | 1200 | ~600px | 2px, x=396 | 1.0px |
| X header | 1500 | ~1500px | 3px, x=495 | 3px |
| YouTube banner | 2560 | ~390px on a phone | 6px, x=845 | 1.4px |
| LinkedIn banner | 1584 | ~1584px | 3px, x=523 | 3px |
| LinkedIn post | 1200 | ~550px | 3px `#cfd2ce`, x=396 | 1.4px |
| Instagram cover | 1080 | ~360px in the grid | 5px, x=356 | 1.7px |
| Instagram interior | 1080 | 1080px | 2px, x=356 | 2px |
| Podcast cover | 3000 | 150px | 28px **celadon `#2f5149`**, x=990 | 1.4px |
| Deck, PDF | 1920 | laptop | 2px, x=634 | 2px |
| Deck, projected | 1920 | back of a room | 5px, x=634 | 5px |

**One contradiction in the source, resolved here.** The source says promoting the hairline is "licensed here and nowhere else" in the thumbnail rule, yet the same file promotes it on the avatar (12px), the OG card (2px), the banner (3px) and the deck (2px). Read the exclusive licence as covering the **combination that only the thumbnail gets: the 16px width together with the inversion to a dark field.** Width promotion is general and governed by the rule above. **Inversion is thumbnail-only.**

## 1. Voice and writing

**Tone.** Someone who has removed every sentence that was not load-bearing, and is comfortable with how little is left.

**Casing.** Sentence case, always. Headlines are never longer than one line at the display size, so count the characters before you write the second clause. No title case, no all caps except an IBM Plex Mono date.

**Rhythm.** Short. Maximum 18 words per sentence. One idea per paragraph, maximum three sentences. Fragments are allowed and encouraged, because a fragment is what is left after the removal.

**Do say:** "one number, and where it came from" · "the shortest true version" · "there is nothing else on this page" · "this took four years".

**Don't say:** "minimal" · "minimalist" · "clean" · "stunning" · "vibrant" · "eye-catching" · "packed with". Note what that list does: **porcelain is never allowed to describe itself.** The restraint has to be visible, not announced.

**The tell.** A porcelain paragraph has had a sentence removed and does not replace it. The gap where the qualifier used to be is the signature.

## 2. Landing page

- **The rail.** `--rail: 33%` of the page frame. The hairline is `position: absolute; top: 0; bottom: 0; left: var(--rail); width: 1px; background: #e4e5e2;` running the **full document height**, not the viewport height.
- **Right of the rail (67%).** Every headline, paragraph, image and link, hung at `rail + 48px`. Nothing is centred, ever.
- **Left of the rail (33%).** Only IBM Plex Mono metadata: dates, sources, figure numbers. 14px, `#5f6a6c`, right-aligned to `rail - 24px`. Nothing else goes here, ever.
- **Nothing crosses the rail.** No full-bleed image, no wide table, no hero that spans the frame. If content cannot fit in 67%, cut the content.
- **Hero.** h1 Inter Tight 300 at 76px, tracking `-0.035em`, leading `1.0`, **one line**. Body Inter 400 at 17px, leading `1.65`, measure 66 characters.
- **Sections divide** by 128px of vertical space plus one mono label in the left column. Never by a second rule. The page gets one rule and it is vertical.
- **There are no buttons.** The call to action is a text link in `#2f5149` with a 1px underline at 4px offset. No fills, no icons, no cards, no badges.
- **One image per page** may lift with the declared shadow at radius 2px. Nothing else casts.
- **The carrying element** is the rail. It is also the only element.

## 3. X / Twitter avatar

porcelain as authored does not survive 48px, so the avatar uses a declared variant.

400×400 on `#fbfaf8`. Face desaturated to 18%, cropped so the crown is cut off at the top edge, eyeline at 38% height (y=152). The hairline is **promoted from 1px to 12px**, runs top to bottom at **x=132** (the 33% column), and passes **behind** the face. Colour `#e4e5e2`. No circle border, no text, no celadon.

**What 48px actually shows.** The 12px rail renders 1.44px. `#e4e5e2` on `#fbfaf8` is a contrast ratio of **1.21**, which is deliberately near the threshold, so at 48px the rail reads as a soft vertical seam rather than a drawn line. That is correct and it is the point: the avatar is a pale square, a low-contrast head, and a seam. Do not raise the rail contrast to "fix" it, and do not add a border.

## 4. X header and YouTube banner

**X header, 1500×500** on `#fbfaf8`. Hairline at **x=495**, 3px, full height. One IBM Plex Mono line at 15px to its right at **x=543**, y=250. No name, no handle, no logo.

**YouTube banner, 2560×1440, safe area 1546×423 (x 507–2053, y 508–931).**

- Field `#fbfaf8` across the full frame.
- Hairline at **x=845** (33% of 2560), full 1440px height, **6px**. x=845 falls inside the safe area, so the phone crop keeps the rail. **The phone shows the 1546px safe area and nothing else**, at roughly 390px wide, so the scale is 390 / 1546 = 0.25 and 6px renders **1.5px**. Scaling the whole 2560 frame to 390px would give 0.9px, but that is the wrong basis: the outer band is never shown.
- Right of the rail, inside the safe area: one IBM Plex Mono line, 30px, `#5f6a6c`, at **x=893**, y=720. Nothing else.
- Left of the rail: empty. Outside the safe area: empty field. **porcelain wastes the outer band on purpose.** Filling it would be the second mark.

## 5. Open Graph card

1200×630 on `#fbfaf8`. Hairline at **x=396**, promoted to **2px** so it survives the ~600px preview render, full height. Headline right of it at **x=444**, Inter Tight 300 at 76px, maximum nine words, vertically centred. Left of the line: one 14px IBM Plex Mono date at y=64. Nothing else.

**Shrink maths at the ~600px preview (0.5×):** headline 76px → 38px, survives. Rail 2px → 1px, survives. Mono date 14px → 7px, **does not survive** and is a full-size detail. **Nothing may be added to compensate.** If the headline runs past nine words, cut words. Never shrink the type below 64px and never move the rail to buy space.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left on desktop: treat x 0–272, y 216–396 as a hole. That hole sits **entirely left of the rail**, in the metadata column.

Resolve it with the direction's own logic: **on LinkedIn the left column carries the photo instead of the mono line, and the mono line moves right of the rail.** Hairline at **x=523** (33%), 3px, full 396px height, `#e4e5e2`. One IBM Plex Mono line at 16px at **x=571**, y=198. No name, no handle, no logo, no tagline. The photo is the metadata.

## 7. LinkedIn post image

1200×627. Hairline at **x=396**, full height, **3px**, so it renders 1.4px at the ~550px feed width. Headline Inter Tight 300 at 60px, **one line**, maximum eight words, hung at **x=444**, vertically centred. Left of the rail: one IBM Plex Mono date at 18px. Nothing else.

**In a room full of suits, porcelain needs no dialling down at all.** It is already the quietest direction in the suite, and in a feed of red arrows and yellow highlighter it wins by being the only silent tile. Do not add a logo, a headshot or a coloured band to "compete". Competing is the failure.

**One technical change, and only one.** `#e4e5e2` on `#fbfaf8` is 1.21:1, and LinkedIn's JPEG re-encode erases it completely. **For feed images only, use `#cfd2ce`** (1.46:1 against the field). That is the same mark in a darker value, not a second mark. Keep `#e4e5e2` everywhere else.

## 8. Instagram carousel

1080×1350. The rail sits at **x=356** (33% of 1080) on every slide and never moves across the set. That fixed x is what makes ten slides one object, and it is the only continuity device porcelain has.

**Cover.** Rail **5px**, so it renders 1.7px in the ~360px grid thumbnail. Headline Inter Tight 300 at 132px, `#171a1b`, maximum four words, hung at **x=404**, baseline y=700, maximum two lines. Left of the rail: one IBM Plex Mono line at 26px, the date, right-aligned to x=332.

**Swipe cue.** porcelain has no icons and no second mark, so the cue is made from the rail: **on the cover only, the hairline stops 96px short of the bottom edge.** It does not reach the floor. On every other slide it runs floor to ceiling. An unfinished line is the cue. **No arrow, no chevron, no dot row, no "swipe" text** — each of those is a second mark and each ends the direction.

**Interior slide.** Rail **2px** at x=356, floor to ceiling. Copy in Inter 400 at 42px, leading `1.65`, maximum 40 words, hung at **x=404**, top at y=180. Left of the rail: the slide index in IBM Plex Mono at 26px — `04/10` — right-aligned to x=332. That is the metadata column doing exactly its job. Carousel copy is display copy, not body copy, so the 40-word cap replaces the 60–75 character measure; split the slide rather than shrink below 34px.

**Celadon budget: one word in the whole carousel.** Not one per slide. One across all ten, or none.

**End card.** Rail runs floor to ceiling. Right of the rail: one line, Inter Tight 300 at 72px — "the whole thing is at pooriaarab.com" — with the URL underlined in `#2f5149`. Left of the rail: **nothing at all.** The set opened with an unfinished line and closes with an empty column.

## 9. YouTube thumbnail

**porcelain does not survive a 168px thumbnail as authored, and this is stated rather than worked around:** a 1px hairline on a near-white field renders to nothing at 13% scale. Thumbnails therefore use the declared inverse variant, **and only thumbnails.**

1280×720, full-bleed `#101211`. The hairline is promoted to **16px** in `#eef1ef`, still at the 33% column (**x=422**), still floor to ceiling. Three words maximum, Inter Tight 300 at 160px in `#eef1ef`, hung off the line's right side at **x=470**, baseline y=430. Celadon `#7fbfa8` may tint exactly one word, or no word. No face, no logo, no fourth element.

At 210px: 16px rail → **2.6px**, 160px type → **26px**. Both hold. `#eef1ef` on `#101211` is **16.54** and celadon on that field is **8.88**.

**This is the only surface in the direction that inverts.** The dark field is not a mode toggle and it is not licensed anywhere else — not the OG card, not the podcast cover, not Instagram.

**Recognisable without being identical.** Frozen forever: the inverted field, the rail at x=422, the 16px promotion, the three-word ceiling. Free: which word takes celadon, or none. One variable, and it is enough for a hundred thumbnails.

## 10. YouTube edit style

**Cut rhythm.** The slowest in the suite. Minimum shot 6 seconds. Exactly one cut per idea — if you cut twice inside a paragraph, you have two ideas and you need two paragraphs. A cut lands on a full stop and on a full stop only. No jump cuts, no reaction inserts, no b-roll flurries.

**The rail is on screen for the whole video.** A vertical line at **x=634** (33% of 1920), floor to ceiling, over every frame including b-roll. It never moves and it never leaves. In motion the rail is promoted in **contrast**, not only width: **`#cfd2ce` at 4px in the light grade, `#3a403e` at 4px in the dark grade.** `#e4e5e2` disappears under video compression.

**Titles and lower thirds.** Hung off the rail's right at **x=682**, Inter Tight 300 at 64px, **no box and no bar**. Source notes and figure numbers sit left of the rail in IBM Plex Mono at 22px. In: the title translates up 24px over 620ms `cubic-bezier(0.33, 1, 0.68, 1)` at full opacity from frame one. Out: it cuts. No animation out, ever.

**B-roll.** Desaturate to 18% — the same 18% as the avatar. Lift blacks to `#171a1b`. **No grain**: porcelain declines texture in motion exactly as it does on the page. Speed 100%, no ramps.

**Transitions.** Hard cut only. One exception: at a chapter change the rail redraws top to bottom over 620ms while the frame holds still. Nothing else transitions.

**The cold open.** Seconds 0 to 3 are the rail alone on `#fbfaf8` with one line hung off it. Silence for the first 1.5 seconds, then the sentence. **No music under the cold open, ever.**

## 11. Podcast cover

3000×3000, seen at 150px beside hundreds of others. This is the hardest surface porcelain faces, harder than the 210px thumbnail, and the inversion is **not** licensed here.

The answer stays inside the direction: **promote the rail's colour to celadon, not its field to black.** Celadon is already the one glaze porcelain owns, so using it on the rail is the same mark in the one colour it is allowed, rather than a second mark or a borrowed variant.

- Field `#fbfaf8`. No texture, no photograph, no gradient.
- Rail at **x=990** (33% of 3000), floor to ceiling, **28px**, `#2f5149`. Contrast **8.41** against the field, and 28px renders 1.4px at 150px.
- Title Inter Tight 300 at 380px in `#171a1b`, maximum three words, **one line**, hung at **x=1080**, baseline y=1720. At 150px that renders 19px, so three short words is a hard ceiling.
- Left of the rail: one IBM Plex Mono line at 60px in `#5f6a6c`, the year or the show number, right-aligned to x=930.
- No face, no microphone, no episode number, no logo, no fourth element.

If the show genuinely needs a dark tile to sit in a dark app, that is a decision to escalate rather than to make silently. The source scopes the inversion to thumbnails, and extending a licence quietly is how a system stops meaning anything.

## 12. Deck and talks

16:9, 1920×1080. The hairline sits at the 33% column (**x=634**) on **every** slide, 2px at 1920 width. The title hangs off its right; the source note sits to its left in IBM Plex Mono at 16px. One idea per slide. **A slide without the hairline is off-brand, and a slide with a second rule is off-brand.**

- **Title slide.** Inter Tight 300 at 130px, one line, at **x=682**, baseline y=560. Date left of the rail in mono 20px at y=120.
- **Section divider.** The rail, plus one word at 96px right of it. Left of the rail: nothing.
- **Data slide.** The number in Inter Tight 300 at 280px right of the rail. Its source and date left of the rail in mono 18px. **A porcelain chart is bare:** 1px `#e4e5e2` axes, one `#2f5149` line, no fill, no gridline, no legend, no second series. A second series needs a second slide.
- **Slides with a lot of words.** Maximum 30 words at 34px Inter, hung right of the rail, one column. If it does not fit, split the slide. Never shrink below 28px and never move the rail.
- **Projection.** 2px at 1920 is nothing from 15 metres. **Export a projected deck with the rail at 5px** and keep 2px for the PDF read on a laptop. Two exports, stated.

## Cost to run

**The cheapest direction in the suite to produce, and the cheapest to get wrong.**

Every asset is one rectangle, one vertical line at 33%, and at most three text elements. Three templates cover all twelve surfaces, and a post takes about three minutes. There is no texture to export, no gradient to band, no stack to composite and no wash to clip.

**The real cost is editorial, and it is paid before you open the design file.** porcelain has one level of hierarchy, so it cannot rank two ideas — which means every asset needs its copy cut to a single claim first. A headline that will not fit on one line is not a type problem, it is a writing problem, and porcelain will not solve it for you. Budget the time in the sentence, not in the layout.

**The second cost is discipline over months.** The direction is one mark, so every drift is permanent: one promoted rail on the website, one added icon, one badge, and it is a different direction. Keep the promotion table above as the single source of truth for every export.

## Pairs with / clashes with

**Pairs with [`../aurora/SKILL.md`](../../brand-aurora/SKILL.md).** Both reduce by subtraction, both refuse fills, both put content in one left-aligned column with no cards. porcelain is the lit room with one line; aurora is the dark room with one light. Run porcelain on the pages that must be believed and aurora on the essays, and the two read as one person.

**Pairs with [`../swiss/SKILL.md`](../swiss/SKILL.md).** Shared grid rigour and shared flush-left discipline. The difference is how much grid is visible: swiss shows the whole system, porcelain shows exactly one column of it. Use swiss where content is genuinely parallel and porcelain where it is singular.

**Clashes with [`../stadium/SKILL.md`](../stadium/SKILL.md).** Stadium is built from fills, and porcelain's entire system is the refusal to fill. There is no shared asset and no transition between them that is not a rupture.

**Clashes with [`../risograph/SKILL.md`](../risograph/SKILL.md).** Risograph needs visible ink, misregistration and texture. porcelain declines texture on purpose, so a risograph pass over porcelain reads as a printing fault rather than a style.

## The failure mode

**porcelain becomes an empty page with a stray line on it.**

The direction has one level of hierarchy, so the moment a page carries two ideas, the reader has no way to tell which one matters, and the restraint stops reading as *withheld* and starts reading as *unfinished*. That is the whole distance between the best and worst version of this direction, and it is decided in the copy, not the layout. The diagnostic is one question: **how many claims are on this page?** More than one and it failed.

The specific visual tell of a failed porcelain is simpler: **something crossed the rail.** A full-bleed image, a wide table, a headline that ran long, a centred anything. Once one element crosses, the rail becomes decoration rather than structure, and every other element is licensed to cross too.

The third failure is the one to watch for over months, because it looks like care. **Promoting the hairline out of nerves.** The line is hard to see, so somebody makes it 4px on the website, then 8px, then gives it colour. At 16px on the site it is a design element rather than a hairline, and porcelain is gone. The promotion table exists so nobody ever has to guess: **1px on the web, always, and promoted only in the exports listed there.**
