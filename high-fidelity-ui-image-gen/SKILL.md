---
name: high-fidelity-ui-image-gen
description: "Produce near-pixel-faithful UI and product-prototype mockups with an AI image model. Use when you need a believable UI mockup, a product-prototype screenshot, marketing/pitch shots of a single surface, or a placeholder render before the real UI exists. Model-agnostic."
---

# high-fidelity-ui-image-gen

The numbers and limits below are empirical — from many eval rounds comparing AI renders against actual rendered product UI. Works with any capable image model (Gemini image models are the example here).

## 1. Image-gen vs. a real screenshot — pick the path first

These are two different tools. Choose before you start.

**Use AI image-gen when:**
- The target is an **isolated surface** — a single modal, one sidebar/panel, a single dropdown, one card, one screen state.
- You want it **fast** and "faithful enough to convey the design," not legally-exact.
- The real UI doesn't exist yet, or you can't easily run it headless.

**Use a real headless-browser screenshot of actual rendered HTML when:**
- You need **pixel-perfect** output — actual rendered DOM is the only guaranteed-correct path.
- The **exact brand logo** must be correct (image models essentially always hallucinate logos — see §5).
- **Micro-text must be 100% correct** — dense tables, long labels, legal copy, code.
- It's a **dense multi-zone composite** (full app shell with sidebar + topbar + main + panels at once).

Rule of thumb: image-gen for one believable surface; screenshot for correctness guarantees and density.

## 2. The prompt recipe

These directives, used together, empirically push isolated-surface renders to ~94-95/100. Drop any one and quality regresses.

**Frame it as a screenshot, not a picture.** Open with something like:

> "A FLAT VECTOR UI SCREENSHOT exported directly from a browser DOM at 2× retina. Sub-pixel-crisp text, perfectly straight 1px borders, solid flat fills."

**Stack explicit negatives.** The model's default is to make a *photo of a screen*. Forbid that:

> "This is a screenshot, NOT a photo. No camera blur, no perspective tilt, no page drop-shadow, no glare/reflections, no 3D, no paper texture, no rounded-screen bezel, no device frame. Tight crop on a plain neutral backdrop."

**Text fidelity.** Garbled/misspelled labels are the fastest tell:
- "Every label must be legible and correctly spelled."
- When you know the exact UI copy, instruct: "Reproduce this text VERBATIM — same wording, capitalization, and punctuation."
- "Do NOT add trailing punctuation, lorem-ipsum, or invented sentences."

**Content discipline.** Models pad UIs with plausible extras. Forbid it:
- "Render ONLY the elements described below."
- "Do NOT invent extra buttons, tabs, fields, prices, badges, or menu items."
- "Do NOT duplicate any listed element."
- Fewer-correct beats busy-approximation, every time.

**Flat, exact colors.** Name the hex values and pin them:
- "Match the named hex exactly, not a look-alike."
- "Primary brand color #XXXXXX as a solid flat fill — no gradient, no glow, no hue-shift."

**Design system as a SYSTEM INSTRUCTION.** Put the design-system rules (theme, typography scale, color tokens, button/modal/input shapes, corner radii, spacing rhythm) in a **persistent system instruction**, not buried in the per-image prompt. The per-image prompt then only describes *this* surface's content. This keeps consistency across a series and frees the prompt to be specific.

**Reference-input images for brand marks.** If your model accepts input images, feed the real logo/brand asset and instruct: "Reproduce this mark EXACTLY from the reference — do not invent, restyle, or recolor it." This is a *partial* mitigation only. Models still hallucinate logos from text, and even with a reference the exact mark is unreliable (see §5).

## 3. Ground the prompt in real source

The single biggest quality jump comes from **grounding**, not from clever phrasing.

- Read the **real component source code** or inspect the **live UI** for the target surface.
- Extract the exact strings, the exact element order, the real structure — and write the prompt from *that*, not from a generic description of "a settings modal."
- Render **one state per image.** "Owner view" and "free-user view" are two separate renders. Never ask for "show all the states in one image" — that's how you get duplicated and garbled elements.

A prompt grounded in the actual DOM/source outperforms an imaginative prompt by a wide margin.

## 4. The eval loop

Quality comes from iteration, not from a single perfect prompt. Run 6-20 rounds:

1. **Generate** with the current prompt.
2. **Compare side-by-side** against the real reference (live UI or source).
3. **Score 0-100** on concrete dimensions:
   - Layout / structure
   - Text correctness (spelling, verbatim copy)
   - Color / shape fidelity
   - Brand / logo accuracy
   - Overall — "could you tell them apart at normal viewing size?"
4. **Find the single weakest dimension.**
5. **Revise the prompt to target only that dimension** (don't rewrite everything).
6. **Regenerate.** Repeat.

**Stop** when the score plateaus or you reach "indistinguishable at normal viewing size."

Score **brutally honestly.** The failure mode here is grading your own output generously. If a label is wrong, that's a real point off — don't wave it through.

## 5. The honest fidelity ceiling

Where this actually lands, measured:

- **Isolated, self-contained surfaces: ~94-95/100.** Convincingly faithful — verbatim strings, near-pixel-accurate even for dense real panels. This is the sweet spot.
- **Element-density ceiling (hard and quantifiable):** an enumerated ~16-item grid reliably drifts into ~1 duplicated or garbled label. The more discrete elements you enumerate, the more likely one breaks.
- **Full multi-zone app composite: ~88/100.** All zones present, but the smallest text softens and detail degrades.
- **Brand logos: essentially always hallucinated** from text, and unreliable even with a reference input image.

So: image-gen is the **fast, faithful path for isolated surfaces and for conveying overall layout.** It is **not trustworthy for an exact logo or for guaranteed micro-text.** When you hit those needs, stop iterating on the prompt and switch to the HTML → headless-screenshot path (§1).

## 6. Checklist — one high-fidelity render

- [ ] Decide path: isolated surface → image-gen; needs exact logo / micro-text / dense composite → real screenshot instead.
- [ ] Ground it: read the real component source or live UI; extract exact strings + structure.
- [ ] Pick ONE state to render (not "all states").
- [ ] System instruction carries the design system (theme, type, color tokens, shapes, spacing).
- [ ] Prompt opens with "FLAT VECTOR UI SCREENSHOT exported from a browser DOM at 2× retina."
- [ ] Stack the negatives: not a photo, no blur/tilt/shadow/glare/3D/bezel; tight crop, neutral backdrop.
- [ ] Pin text: legible, correctly spelled, verbatim where known, no invented copy or trailing punctuation.
- [ ] Content discipline: only the listed elements; no invented/duplicated extras.
- [ ] Colors: named hex, "match exactly not look-alike," flat fills, no gradient/glow.
- [ ] Feed the real logo as a reference input if available (and still verify it — it may be wrong).
- [ ] Generate → score 0-100 on concrete dimensions → fix the single weakest → regenerate.
- [ ] Stop at plateau or "indistinguishable at normal viewing size."
- [ ] If exact logo or micro-text still fails after a few rounds, switch to the real-screenshot path.

## Anti-patterns

- **"Show all the states / the whole app in one image."** Forces duplication and garble. One state per render.
- **Describing the surface generically** instead of grounding in real source. Costs the biggest quality lever.
- **Trusting a generated logo.** Always assume it's hallucinated; verify against the real mark or screenshot instead.
- **Burying design-system rules in each prompt** instead of a persistent system instruction. Causes drift across a series.
- **Grading your own renders generously.** Score honestly or the eval loop does nothing.
- **Enumerating 16+ discrete elements and expecting all correct.** Past the density ceiling, expect ~1 to break.
- **Iterating forever on a logo or dense table.** That's the screenshot path's job — switch instead of burning rounds.
