---
name: slides
description: Build a talk or pitch deck as one HTML page on a 1920×1080 stage, with big type, one idea per slide, a new layout on every slide, anatomy figures, verified social-proof quote cards, and designed light and dark themes. Then export editable PPTX (python-pptx or PptxGenJS) and Google Slides (gog Drive upload with conversion). Ships a stage template and a pre-flight script that renders every slide in both themes and checks word counts, font sizes, layout repeats, contrast, sources and quotes. Use when asked to make, shrink, restyle or export slides, a deck, a keynote or a presentation.
user-invocable: true
argument-hint: "[topic, old deck path, or product] (optional)"
---

# Slides

Make a deck people remember: half the slides, half the text, one idea each,
huge type, real proof. Build it as HTML, check it with a script, export it.

Use it for a new talk, pitch or launch deck, an old deck that is too long,
or a deck that must also exist as PPTX or Google Slides. For a demo video use
`ship-demo-video`; for a brand direction use `brand-router`.

## The rules

These are the owner's rules. All of them apply to every deck.

1. **Half the slides, half the text.** An old deck is the content source, not
   the model. Cut it to half the slides, then cut each slide's words in half.
2. **One focus per slide.** One idea, one visual, one line. Two ideas make two
   slides, or one goes.
3. **Big type.** On the 1920×1080 stage: headline ≥96 px, body ≥44 px, nothing
   under 32 px. At most 12 headline words and 20 other words per slide.
4. **Hooks.** Bold, contradictory, quotable, viral: "Your AI remembers
   everything. Except you." Every fact in it is true and in `SOURCES.md`.
5. **No chrome.** No header, footer, page counter or logo strip.
6. **A new layout on every slide.** No two slides in a row share a layout.
   Pick from [the layout catalogue](references/layouts.md).
7. **Visuals over text.** Draw before you write. Use at least two figures from
   the anatomy skill (https://skills.wheresryan.sh/anatomy,
   `npx skills add wheresryan22/anatomy`), designed for this deck's idea.
8. **Impeccable pass.** Run every slide through the impeccable skill
   (https://impeccable.style) and `npx impeccable detect`. Fix the findings.
9. **Light and dark.** One page, two themes. Both must look designed, not
   inverted.
10. **Social proof and pop culture.** Find real posts and complaints by known
    people, verify each, and render them as quote cards. Never invent a quote.
    See [social proof](references/social-proof.md).
11. **One product per deck.** When a deck tries to cover many things, split
    it: one deck per product, each with its own hook.
12. **Look at every slide.** Render every slide in both themes and read every
    PNG before you call it done.

## Before you start

- Node 20+, `npm i playwright` and `npx playwright install firefox`.
- For PPTX: `python-pptx` in a venv, or `pptxgenjs`. For Slides: `gog`, signed in.
- Fonts as files next to the page, loaded with `@font-face`. No remote fonts.
- Ask the owner before you upload to Drive or share a link.

## Workflow

### 1. Find the one point

Write the deck's point in one sentence. Write the action you want at the end.
If the material covers several products, stop and propose one deck per product.

### 2. Gather proof

Every number and claim gets a line in `SOURCES.md` with an id (`S1`) and a
primary link. Run the [social proof research step](references/social-proof.md);
quotes get ids (`Q1`) and the word VERIFIED. Drop any claim you cannot source.

### 3. Outline on paper

Write one line per slide: its hook, its layout and its visual. Check that the
list is half the old deck, one idea per line, a new layout on each line, with
at least two anatomy figures and one quote card.

### 4. Build the page

Copy [`assets/stage.html`](assets/stage.html) to `index.html`. It has a
1920×1080 stage scaled to fit, arrow keys, Space, Home, End and click to move,
`#n` to open slide n, and `?theme=light|dark` or the `t` key for the theme.
Keep these conventions; the pre-flight reads them:

- `<section class="slide" data-layout="<name>">` for each slide.
- `<h1>` for the headline. Other text is body.
- `data-src="S3"` on any element that makes a claim.
- `<figure class="quote" data-src="Q2">` for a quote card.
- `data-export="image"` on anything the PPTX should carry as a picture.

Build anatomy figures with the kit in both themes. Inline the SVG or iframe it.

### 5. Impeccable pass

For each slide, check type scale, hierarchy, spacing, colour and the refuse
list from impeccable's craft floor. Run the detector. Note what you changed.

### 6. Pre-flight

Copy [`scripts/check-deck.mjs`](scripts/check-deck.mjs) into a folder with
Playwright installed and run `node check-deck.mjs <deck-dir>`. It renders
`shots/{dark,light}/sN.png` and exits 1 on any of these:

| Check | Rule |
|---|---|
| Words | Headline ≤12, other text ≤20 per slide |
| Font size | Headline ≥96 px, largest body text ≥44 px, all text ≥32 px |
| Layout | Every slide has `data-layout`; none repeats the previous one |
| Chrome | No `header`, `footer`, `nav`, `.page-number`, `.counter`, `.logo-strip` |
| Overflow | Nothing crosses the stage edge |
| Contrast | Body ≥4.5:1, headline ≥3:1, against the nearest solid background, in both themes |
| Sources | Every `data-src` id has a line in `SOURCES.md` |
| Quotes | Every quote card's line in `SOURCES.md` says VERIFIED |

Exit 0 means it passed. Then open every PNG in both themes. Look for
clipping, collisions, a figure that reads wrong, an inverted-looking theme, and
text over images or gradients (the contrast check skips those). Read each hook
aloud: would someone quote it, and is it still true?

### 7. Export

Follow [the export guide](references/export.md): extract text boxes from the
live page, build `deck-dark.pptx` and `deck-light.pptx` with native text
(python-pptx or PptxGenJS) and figures as cropped images, render them back to
compare, then, with approval, `gog drive upload <file> --convert-to slides`.

## Hand back

`index.html` with assets and fonts, `shots/{dark,light}/sN.png`,
`deck-dark.pptx`, `deck-light.pptx`, Slides links if uploaded, `SOURCES.md`,
`social.md`, and a report: each slide's focus, the impeccable changes, the
pre-flight output, and what is still weak.

## Failure modes

- **The old deck, shorter.** Same outline, fewer words. Start from the point.
- **A false hook.** A viral line with a bent number. Cut it.
- **A paraphrase in quote marks.** Copy the words or drop the quote.
- **A PPTX of screenshots.** The owner cannot edit it. Text stays text.
- **Shots never read.** The script passed, but a figure clips.

## Resources

[Resources](references/resources.md) lists the tools, frameworks, methods and
books behind these rules, each with what to take from it.
