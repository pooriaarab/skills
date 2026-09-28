---
name: ui-craft-review
description: "Review a landing page or UI artifact against a craft floor before calling it done: verbatim copy, banned words, tokenized styles, the accessibility floor, motion rules, interaction states, and the small-viewport clip check. Use after building or delegating page/UI work, or when a design feels off and you need findings not vibes."
---

# ui-craft-review

A detection checklist for landing pages and UI artifacts. Run it before showing
work, after delegated builders return files, and whenever a surface "looks
fine" but has not been checked. Each row is something you can verify, not a
taste call.

## Copy contract

- Every required string is present **verbatim** — grep for each, do not
  eyeball. Nav labels, H1/sub, kickers, pricing numbers and intervals, FAQ
  answers, CTA text + destinations.
- Banned words grep clean: `journey`, `delightful`, `unlock`, `empower`,
  `seamless`, `leverage`, `AI-powered`, `robust`, `cutting-edge`,
  `the future of` — plus whatever the project bans.
- No invented proof: customer counts, testimonials, star ratings, logos,
  benchmarks, fake social proof. Numbers must trace to real data (pricing,
  step counts, actual features).
- Voice check: read the H1 and one section aloud. If it sounds like every AI
  landing page, rewrite in the product's own terms.

## Tokens and structure

- No raw hex/rgb outside `:root` and theme blocks. `grep -nE '#[0-9a-fA-F]{3,8}'`
  and confirm every hit is a token definition.
- Sections each have one job and one purpose; repeated rhythm is a finding —
  vary density, not just spacing.
- Real landmarks: `<header>`, `<main>`, `<nav>`, `<footer>`, one `<h1>`.

## Accessibility floor — escalation triggers, never optional

- Every interactive element is a real `<button>`/`<a>`/`<input>`, reachable
  by keyboard, with a visible `:focus-visible` style.
- `aria-expanded` on accordion triggers; `aria-current` on active nav items;
  names on icon-only controls.
- Body text contrast ≥ 4.5:1 in the shipped theme.
- `prefers-reduced-motion: reduce` renders final states — no transforms, no
  loops. All content readable with JS disabled unless the interaction is
  itself the content.

## Motion

- One or two signature motions maximum, starting from states already visible
  at rest. A third animation is a finding, not a bonus.
- UI feedback runs ~120–240ms with an ease-out curve; nothing rotates or
  pulses forever without carrying meaning.

## Interaction states

Every interactive surface must show: default, hover, active, focus-visible,
disabled, loading where async. A button lab or specimen that only renders
"default" is unfinished.

## The 390px clip check — the failure everyone misses

`overflow-x:hidden` on `body` makes horizontal scroll impossible *and makes
the overflow invisible*. The check is not "does it scroll" — it is **"are
glyphs cut at the right edge"** in a real 390px screenshot. Repeat for the
nav CTA, the H1, hero devices, table cells, and ticker/marquee rows. Same for
fixed-height feeds that eat their last row.

## Findings format

Report as a table: `| Check | Finding | File/line | Severity |`. Severity:
**blocker** (contract broken, a11y floor failed, content lost),
**major** (state missing, rhythm broken), **minor** (polish). Blockers and
majors get fixed before presentation; minors get named, not silently patched
during someone else's review.

## Before you finish

| Mistake | Fix |
| --- | --- |
| "Looks fine" without a grep pass | Run the verbatim + banned greps |
| No-scroll declared at 390 | Screenshot and check for cut glyphs |
| Variant judged on hero alone | Full-page capture; check section rhythm |
| Reduced-motion "supported" by a media query that only kills one animation | Set every animated property to its end state |
| Invented urgency ("limited seats") to juice CTA | Delete; honest copy is the contract |
