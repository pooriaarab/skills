---
name: brand-terminal
description: "Use when the subject is technical and verifiable and the evidence should be the design: changelogs, build logs, benchmarks, dev-tool launches. Applies the terminal direction to every surface, not only the website. Triggers: 'terminal direction', 'phosphor green', 'make it look like a shell', 'changelog page', 'benchmark post', 'build log aesthetic', 'brand my carousel in terminal'."
---

# terminal

> one font, one colour, one cursor. everything else is output.

**Signature.** A solid block cursor holds its place at the end of the last line of type. Every glyph sits on the same monospace grid, so headline, body and data share one advance width and the page reads as a single session rather than a designed layout.

**Mono is not costume here.** The page *is* a transcript. The type must align in columns to prove it. That is the argument that earns monospace body copy, and it is the only one that does. Contract: [`../_lib/surfaces.md`](../brand-router/_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../brand-router/_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

**Use when** the reader is technical and the claim is verifiable — a changelog, a build log, a benchmark, an engineering post where the evidence is the design.

**Avoid when** the page carries a face, a story, or an emotional ask. A terminal has no register for warmth, and forcing one reads as cosplay. For a personal brand that matters — see sections 8 and 10, where the honest answer is "use another direction".

---

## Tokens

**Native mode: dark** — the live session on a phosphor CRT. The light mode is not an inversion. A CRT has no light state, so the port moves *medium*: the same session printed on fanfold paper by a line printer. Glow becomes ink density, so the accent drops from `#3bf07a` to a press green that survives on paper.

| Role | Dark | on bg | Light | on bg |
| --- | --- | --- | --- | --- |
| bg | `#060b06` | — | `#eef1ea` | — |
| surface | `#0d160d` | fg 14.48:1 | `#e2e7dd` | — |
| fg | `#cdeccd` | 15.57:1 | `#10160f` | 16.09:1 |
| muted | `#6f9a76` | 6.20:1 | `#47604a` | 6.05:1 |
| border | `#1a2a1a` | hairline | `#c6cfc0` | hairline |
| accent | `#3bf07a` | 13.16:1 | `#046b2f` | 5.84:1 |
| accentFg | `#04140a` | 12.55:1 on accent | `#eef1ea` | 5.84:1 on accent |
| alt (error) | `#ff6b6b` | 7.15:1 | `#a3231c` | — |

**Type.** One family everywhere: `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace`. Load `JetBrains Mono:wght@400;500;700`. Display 700 / -0.02em / lowercase / 1.15. Body and mono 400 / 0em / none / 1.65. Scale ratio 1.2. The advance width is **0.6em**, so at 16px one character is **9.6px**. That 9.6px column is the grid: every margin, gutter and panel width is a whole number of characters.

**Surface.** Radius 2px — a CRT corner is not perfectly sharp. Shadow `0 2px 0 0 #1a2a1a, 0 8px 22px -10px rgba(59,240,122,0.42)`; it carries offset and blur, never replace it with a zero-offset halo. Hairline `1px solid #1a2a1a`.

**Texture** (scanline, as a `::before` overlay):
`background-image: repeating-linear-gradient(to bottom, rgba(205,236,205,0.05) 0px, rgba(205,236,205,0.05) 1px, transparent 1px, transparent 3px), radial-gradient(120% 80% at 50% 0%, rgba(59,240,122,0.10), transparent 60%); background-size: 100% 3px, 100% 100%; mix-blend-mode: screen; pointer-events: none;`

**Motion — the one authored moment.** Ease `steps(1, end)`, duration 530ms. A filled block cursor, 0.62ch wide and full cap height, sits one space after the last word of the headline and blinks a hard square wave at 1.06s: on 530ms, off 530ms, no fade, no easing. On the visitor's first click anywhere on the page it stops mid-cycle in the ON state and never blinks again. The session took input. Under `prefers-reduced-motion: reduce`, render it ON and never blink.

---

## 1. Voice and writing

**Tone.** Reports what happened, in the order it happened, with the numbers attached and no adjective in front of them.

**Casing.** All lowercase, always. Uppercase is reserved for env vars and exit codes: `NODE_ENV`, `SIGTERM`, `exit 137`.

**Sentence rhythm.** Short declaratives, 8 to 16 words. Fragments are allowed and encouraged, because a log line is a fragment. Never more than three sentences per paragraph. A paragraph over four lines is output that should have been a table.

**Do say:** `exit 0` · `took 1.8s, was 6.4s` · `this is the third attempt; here is why the first two failed` · `reproduce it: git clone, npm ci, npm run bench`

**Don't say:** `magical` · `seamless` · `beautifully crafted` · `we're thrilled to announce` · `effortless` · `blazing`

**The tell.** Every claim arrives with a number, a unit, and the value it replaced. "took 1.8s, was 6.4s" is the whole voice in five words. An adjective where a measurement belongs is not this direction.

## 2. Landing page

Full-bleed `#060b06`, scanline overlay on. One column. No sidebar. No cards floating on a field.

- **Measure: 74ch** — 710px at 16px body, inside the 60–75 character floor. Left margin is a whole number of characters: 8ch (76.8px) on mobile, 12ch (115.2px) from 1024px up. Never centred.
- **Hero.** One `$` prompt line, display 700 at 64px lowercase, max 8 words, closed by the block cursor. One blank line below it, then two lines of body giving the number that justifies the claim.
- **Sections divide with a prompt, not a rule.** Each section opens with a `$ ` line in `#3bf07a`. The page has no horizontal rules and no heading that is not a command.
- **Whitespace is blank lines.** The rhythm unit is one line box: 16 × 1.65 = **26.4px**. Every vertical gap is a whole multiple — 1 line inside a section (26.4px), 4 lines between sections (105.6px). No other value exists.
- **The carrying element is the cursor.** It appears once per page, at the end of the hero line, nowhere else.

Green appears at most three times above the fold: the prompt glyph, one number, one link. Everything else is `#cdeccd` and `#6f9a76`.

## 3. X / Twitter avatar

Renders at **48px**, and this direction survives it, because the mark is a solid block on a solid field at 13.16:1.

Square `#060b06`. One `#3bf07a` block cursor, **22% of the square's width** and **34% of its height**, left edge at 39%, baseline at 62%. Nothing else in the frame.

**At 48px drop the scanlines.** 1px stripes on a 3px pitch alias into grey mud below about 200px. Export the avatar flat, at 400×400 and 96×96. Never put a letterform in it — `pa` in mono at 48px is 4px of stroke.

## 4. X header and YouTube banner

YouTube is 2560×1440. Only the centred **1546×423 safe area** shows on a phone, so everything outside it is decoration and may read only as texture.

**Inside the safe area:** one line of `#6f9a76`, JetBrains Mono 400 at **46px**, left edge at **x = 587** (507px dead zone + an 80px margin), baseline on **y = 720**. It names the current thing being built, lowercase, under 9 words, and ends in a `#3bf07a` block cursor. **Never two lines. Never a logo.** Outside the safe area the field and scanlines continue and carry nothing.

For the 1500×500 X header, the same line sits at x=120, y=250, at 40px.

## 5. Open Graph card

1200×630, `#060b06`, scanlines on. It renders in a feed at roughly 400×210, so the sizes are set for the shrink.

- A `#3bf07a` **4px rule** runs the full 1200px width along the very top edge.
- Line 1 at **25% height** (y=158): the post title, lowercase, JetBrains Mono 700 at **64px**, `#cdeccd`, two lines maximum, left at x=64.
- Line 2 directly under it: `# pooriaarab.com` in `#6f9a76` at **28px**.

**Drop at feed size:** the scanline overlay falls to 3% alpha so JPEG re-encoding does not turn it into ringing. Nothing else is removed, because nothing else is there. 64px lands at ~21px in the feed, which holds.

## 6. LinkedIn banner

1584×396. The profile photo covers the lower-left corner on desktop, so treat a **400px wide by 140px tall** block at the bottom left as unusable.

Put the single prompt line at **x = 440**, baseline **y = 180**, `#6f9a76` JetBrains Mono 400 at **36px**, closed by a `#3bf07a` cursor. The remaining 1144px carry 9 words comfortably. Nothing sits in the bottom strip. Scanlines run edge to edge at 4%.

## 7. LinkedIn post image

1200×627, read at 552px wide in the feed. This is the most conservative room the brand enters, and terminal is the loudest thing you can carry into it. **Dial it down in exactly three ways.**

1. **Scanlines off.** LinkedIn re-encodes to JPEG and 1px stripes become visible ringing around every glyph.
2. **Green once.** One `#3bf07a` element per image — the prompt glyph *or* the number, never both. Everything else is `#cdeccd` on `#060b06`.
3. **Type up, words down.** Title at 56px, max 10 words, plus one `#6f9a76` line at 26px.

If the post is about hiring, culture, or a personal milestone, do not dial terminal down — change direction. [spec](../brand-spec/SKILL.md) gives the same restraint with a human register.

## 8. Instagram carousel

1080×1350 throughout. **The carousel is one session split across slides**: commands on top, output underneath, one colour, one font. That structure is what separates it from a [spec](../brand-spec/SKILL.md) or [oscilloscope](../brand-oscilloscope/SKILL.md) carousel.

**Cover slide.** `#060b06`, scanlines at 5%. One `$` command, JetBrains Mono 700 lowercase at **128px**, max 6 words, left margin 72px, baseline at 58% height, closed by the block cursor. Nothing else — no date, no handle, no logo.

**Interior slide.** Output, so no `$` glyph. Body at **38px** weight 400 in `#cdeccd`, leading 1.65 (62.7px line box), left at 72px, ragged right. **Maximum 5 lines of 40 characters.** The 60–75ch measure does not apply — a slide is a caption, not a page — but the cap replaces it and is not negotiable. One number per slide may be `#3bf07a`. The slide belongs to the cover because ground, font and left margin are identical; nothing else needs to repeat.

**End card.** The ask is a command, because here every ask is: `$ open pooriaarab.com/newsletter` at 64px, `#3bf07a` prompt glyph, `#cdeccd` text, cursor after it. One `#6f9a76` line at 28px under it says what arrives and how often.

**Swipe cue.** The next command has already started: a `$` glyph in `#6f9a76` at 25% opacity at **x = 1044**, clipped by the right frame edge, aligned with the slide's last line. Not an arrow — the beginning of the next line.

**On faces: do not put a photograph on a terminal carousel.** No treatment makes a face look like output. If the carousel is personal, the direction is wrong, not the crop.

## 9. YouTube thumbnail

1280×720, designed for the **~210px** version, because that is where the click is won.

Full-bleed `#060b06`. One command line, lowercase, prefixed with a `#3bf07a` `$ `, JetBrains Mono 700 at **96px**, left-aligned at a 64px margin, vertically centred, cursor closing it.

**The rule that makes it survive 210px: 20 characters maximum, including the `$ ` prefix.** At 96px one character is 57.6px, and 1280 minus two 64px margins is 1152px — exactly 20 characters. If it does not fit, cut words. Never shrink the type; 96px is already only 15.7px at thumbnail size.

The face appears only as a **320px-wide cutout in the bottom-right at 55% opacity, desaturated and mapped to green**. At 210px that is 52px and reads as a shape, not a person. Accept that, or pick another direction for that video.

Recognisably his without being identical: the `$ ` prefix and the cursor are fixed; the command changes every time and is the whole design.

## 10. YouTube edit style

**Be honest — terminal is one of the hardest directions to run for video.** It has one motion primitive, the step function, and no vocabulary for warmth or music-led montage. Here is what it can actually do.

**Cut rhythm.** Hard cuts only, on the content, never on the music. A cut lands **on the frame the sentence ends**, with no handle. 4–7 seconds for explanation, 1–2 seconds for a command-and-result pair. No cut lands mid-word.

**Titles and lower thirds.** JetBrains Mono 700, lowercase, `#cdeccd`, on a `#0d160d` bar with a 2px `#1a2a1a` top rule, at x=120 / y=880 on a 1920×1080 frame. It **types on at one character per 2 frames** (12 char/sec at 24fps) and cuts off in a single frame. It never fades. Cap it at 24 characters.

**B-roll.** Screen recordings only — editor, terminal, dashboard. Crush blacks to `#060b06`, desaturate to 15%, tint midtones green at 8%. Play at 100%. **No speed ramps ever**: a ramp is easing, and this direction has no easing. Cut instead.

**Scanlines in video.** 1px lines on a 3px pitch destroy themselves in H.264. Use **2px lines on a 6px pitch at 4% alpha for 1080p**, and drop the overlay entirely below 1080p.

**Transitions.** One only: a **2-frame cut to solid `#060b06`** between sections — a screen clear. Every other transition is banned, including cross dissolves, whip pans and glitch effects.

**Cold open (first 3 seconds).** Frames 1–45: black field, the command types on at 12 char/sec, cursor blinking behind it. Frame 46: one hard cut to the result, full frame, no title. The question and the answer both land before anyone hears your voice.

**What this edit cannot do:** an emotional beat, a story about a person, a laugh. Run those in [dispatch](../brand-dispatch/SKILL.md) or [dusk](../brand-dusk/SKILL.md) and keep terminal for the technical inserts.

## 11. Podcast cover

3000×3000, shown at **150px** beside hundreds of others. Simplify hard.

- **Scanlines off** — invisible at 150px and pure noise to the thumbnail encoder. **No shadow, no radius.** Flat square.
- Show title on **two lines maximum, two words per line**, JetBrains Mono 700 lowercase at **340px**, `#cdeccd`, left at 240px, block optically centred.
- A `#3bf07a` block cursor closes the second line: 210px wide, 320px tall.
- Nothing else. No host name, no episode count, no `$` glyph — at 150px a `$` reads as dirt.

340px renders at 17px per line at 150px. That is the floor, which is why the word count is capped instead of the type size.

## 12. Deck and talks

16:9, read from the back of a room. **Every slide is a shell prompt.**

- **Title slide.** One `$` command, lowercase, JetBrains Mono 700 at **120px** on a 1920×1080 artboard, left at 160px, vertically centred, cursor closing it.
- **Section divider.** A `$` command alone on the field at 96px, with the section number as `# 03/07` in `#6f9a76` at 32px directly under it.
- **Data slide.** The output of the command in the title. Monospace, left-aligned, **ragged right, never centred, never bulleted.** Maximum 8 rows. Columns align on the 0.6em advance, because that alignment is the argument.
- **Slides with a lot of words do not exist here.** If a slide needs a paragraph, it is two slides. Hard cap **40 words per slide**. Green appears **at most twice** on any slide: once on the prompt glyph, once on the number that matters.

Minimum type anywhere in the deck: 32px on a 1920px artboard.

## Cost to run

**Cheap.** One font, one accent, no photography, no illustration, no per-asset design decision. A thumbnail or a carousel slide is text on a dark field: five minutes in any tool, and fully scriptable — the OG card, the slide master and the carousel can all render from one template and one string.

The expensive part is not the design. **It is the writing.** The direction demands a real number in almost every sentence, and you cannot fake a benchmark. Budget the measurement, not the layout. If you will not run the test before you post, terminal costs far more than it looks like it does.

## Pairs with / clashes with

**Pairs with [spec](../brand-spec/SKILL.md).** They are the two halves of a technical kit: terminal is the native-dark log of what happened, spec is the native-light reference for what is true. They share no font and no hue, so the pair never blurs. Ship the release post in terminal and the docs it links to in spec.

**Pairs with [buildspace](../brand-buildspace/SKILL.md)** when the same audience needs a warmer companion, and with [punchcard](../brand-punchcard/SKILL.md) for the archive of shipped work.

**Clashes with [oscilloscope](../brand-oscilloscope/SKILL.md).** Both are native-dark single-hue instrument worlds with a texture overlay on near-black. Side by side they read as one direction with a colour bug, not as two. Never put them in the same kit, deck or feed week.

**Clashes with [dusk](../brand-dusk/SKILL.md), [vellum](../brand-vellum/SKILL.md) and [porcelain](../brand-porcelain/SKILL.md)** — each is built on warmth, and terminal has no register for it.

**Telling the three mono directions apart.** terminal is phosphor green, JetBrains Mono for *everything*, scanlines, native dark. [spec](../brand-spec/SKILL.md) is near-white paper, Inter Tight prose with IBM Plex Mono on **values only**, native light, indigo. [oscilloscope](../brand-oscilloscope/SKILL.md) is amber-only, Saira Condensed labels with Share Tech Mono readouts, a real graticule, native dark. If three carousels from these three look alike, one of them broke a rule above.

## The failure mode

**Cosplay.** Terminal fails the moment there is no output to show. A `$` glyph in front of a marketing sentence is a costume, and technical readers spot it instantly — they use the real thing daily and they know a prompt is followed by a result. A page that promises a transcript and delivers copy is worse than the same copy set plainly, because it has now also claimed something untrue about itself.

The second symptom is **green creep**. The accent is rationed by design. Once green marks a heading, then a link, then a border, then an icon, the page stops being a session lit by one phosphor and becomes a hacker-themed template. Count before you ship: three green elements above the fold, two on a slide, one on a carousel slide.

The third is **forcing warmth**. When a face, a story or a feeling has to appear and the direction stays, the whole thing reads as ironic. Change direction. Do not change the palette.
