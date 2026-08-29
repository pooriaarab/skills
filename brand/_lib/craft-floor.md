# The craft floor

Non-negotiables shared by all twenty directions. A direction may be loud, ugly
on purpose, or deliberately hostile to convention — it may not break these.

## Colour

- Body text on background: **at least 4.5:1**. Compute it, do not eyeball it.
- Text on the accent colour: **at least 4.5:1**.
- Secondary text is **tinted from the direction's hue**, never a default neutral
  grey dropped onto a coloured field.
- The dark mode is an **argued port**, not an inversion. State what the
  direction *is* in the dark — the printed session, the diazo whiteprint, the
  archive photograph. If you cannot say what it is, the port is not done.

## Type

- Tracking floor is **-0.04em**. Tighter than that and letters collide at small
  sizes.
- Body measure: **60–75 characters**. Two columns are only allowed when the
  viewport can hold both at that measure.
- **No gradient text.** Ever.
- A direction that uses monospace for body copy must **state why it earns it**.

## Depth

- A shadow carries **offset and blur**. A zero-offset halo is not a shadow, it is
  a glow, and it reads as unfinished.
- A direction may have **no shadows at all** — ink on paper casts none. That is a
  position, and it is a better answer than a weak shadow.

## Motion

- **One authored moment** per surface. Not a list of effects. If you need three
  sentences to describe it precisely, that is fine — precision is not a list.
  Stacking unrelated effects with "also" and "in addition" is a list.
- Motion animates **from an already-visible resting state**. A reveal that
  starts at `opacity: 0` leaves content invisible to anything that does not
  scroll — a screenshot, a crawler, a print, a reader who lands mid-page — and
  that failure is silent. Animate transform. Leave opacity alone.
- Every animation respects `prefers-reduced-motion`.

## Honesty

- If a direction does not survive a surface, **say so and give the variant**.
  Do not claim a 1px hairline reads at 48px. It does not.
- If a direction is expensive to run, say that too. The most common way a
  personal brand dies is not ugliness. It is a system its owner cannot keep up
  with, abandoned four weeks in.
