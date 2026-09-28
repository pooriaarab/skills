---
name: ui-micro-interactions
description: "Source and apply micro-interactions — hover swaps, press feedback, focus fills, live ticks — from real libraries without over-animating. Use when a surface feels flat, buttons lack feedback, or an interface needs small motion polish. Covers microkit.co, aicss.dev taxonomy, and the motion budget rules."
---

# ui-micro-interactions

Micro-interactions are the 100–300ms responses that make an interface feel
alive: hover fills, press feedback, focus transitions, live-state ticks. Apply
them after the interaction itself is sound — polish on a broken control is a
bug with a nice surface.

## Sources that actually exist

- **microkit.co** — MIT-licensed micro-interaction library (49 interactions:
  edge-glow buttons, text swaps, sliding tabs, scrub inputs, icon-button
  groups). Official shadcn registry: `npx shadcn@latest add
  @microkit/<component>`. Roughly half are zero-dependency CSS/Tailwind; the
  rest need `lucide-react`. GitHub: `henriquegpb/microkit`.
- **aicss.dev** — component *taxonomy* for agent/AI surfaces: thinking states,
  tool-call cards, streaming text, approval cards, diffs, orbs, inline
  citations. Source is Pro-licensed — use the taxonomy and copy structure,
  not the code. Good reference when the app surfaces agent activity.
- **component.gallery** — cross-design-system component reference: how ~95
  mature systems handle a given component. Read for pattern consensus before
  inventing an interaction.
- **kinetics.colorion.co** — spring-physics animation recipes; copy the CSS,
  the React, or a ready-made prompt.
- **21st.dev** — React + Tailwind component registry with an MCP; free usage
  limit — say what you are looking for before calling.

The full outside-reference catalog (style directions, video, review tools)
lives in `ui-variant-lab`.

If a reference's actual content cannot be fetched, say so and design from the
system's own tokens — do not imitate from memory.

## The motion budget

- One signature motion per surface. The swiss-style rule — a single authored
  movement (~240ms, `cubic-bezier(0.2,0,0,1)`) — is a good default ceiling.
- Micro-feedback runs 100–200ms, ease-out, from a rest state already visible.
- Use CSS *transitions* for hover/focus (interruptible); reserve *keyframes*
  for sequences that must complete. An animation that can't be interrupted
  feels broken on fast pointer exits.
- Nothing loops forever unless the loop itself is the information (a live
  feed, a thinking state). Decoration-only loops get cut.
- `prefers-reduced-motion: reduce` → every animated property to its final
  state. This is a floor, not an option.

## Where micro-interactions pay

- **Buttons**: press feedback (translate/scale 1–2px or shadow collapse),
  hover fill/underline sweep, icon swaps on the label.
- **Feeds/logs**: new-row flash + settle, timestamp ticks — carries "it's
  working" better than any badge.
- **Toggles/tabs**: sliding indicator, state cross-fade.
- **Inputs**: focus ring + subtle fill, error shake (once, ~200ms).
- **Approvals/agent surfaces**: state-chip transitions
  (queued→draft→waiting→sent) — the taxonomy on aicss.dev maps these.

## Before you finish

| Mistake | Fix |
| --- | --- |
| Third+ animation on one surface | Keep the one that carries meaning |
| Keyframe for a hover effect | Convert to transition |
| Motion with no rest state | Show the end state by default |
| Copied a Pro/preview component | Rebuild the pattern from your tokens |
| Loop serves no information | Delete it |
| Reduced-motion still animates | Set properties to final values in the media query |
