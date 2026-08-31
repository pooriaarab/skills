---
name: agent-avatar-system
description: "Give every agent, user, or tenant a generated avatar that is deterministic from its name — no upload, no picker, nothing stored. Combine a generator's body with your own face so the roster gains variety without losing your brand, pin the palette to a fixed hue set so it never grows, and reach every surface by changing one shared component instead of every call site. Use when a product has many named entities with inconsistent or missing avatars, when a roster looks like a sticker sheet of unrelated styles, when adopting a library like blobatar/DiceBear/boring-avatars, or when an avatar picker has grown too many options."
---

# agent-avatar-system

A product with many named entities — agents, teammates, workspaces, tenants — needs an
avatar for each one. The usual answers all rot:

- **Uploads.** Most entities never get one, so the roster is mostly fallbacks.
- **A colour and an initial.** Fine at 10 entities. At 60 you have repeated letters in
  repeated colours.
- **A style picker with 14 options.** Every entity looks like it came from a different
  product, and you have made the user do work that does not matter.
- **A hand-drawn mascot in N brand colours.** One body in many shirts. It stops scaling
  the moment N exceeds your palette.

The method below fixes all four with one idea: **derive the avatar from the name.**

## The invariant

- **Deterministic.** The same name always yields the same avatar. Nothing is stored,
  nothing is chosen, and an entity's face never changes on its own.
- **One system.** Marketing and the product render through the *same* function. If they
  are two functions they will drift, and the drift is invisible until someone screenshots
  both.
- **A fixed palette.** Colours come from an enumerable set, not a free hue. A new entity
  never introduces a new colour.
- **Explicit beats derived.** If someone has uploaded a photo or picked something, that
  wins. Derivation is the floor, not a ceiling.

## 1. Body from the generator, face from your brand

The strongest move, and the least obvious: do not choose between a library and your own
character. **Take the library's body and draw your own face on it.**

A generator like `blobatar` gives you what you cannot cheaply hand-author — many
silhouette families, deterministic seeding, containment guarantees, contrast guarantees.
What it cannot give you is your identity. Most of these libraries are pose-only and
**structurally cannot draw a mouth**, and the mouth is what carries both expression and
brand warmth.

So keep its geometry and replace its face:

```js
// The library emits its body group, then its own face. Keep the first, drop the second.
const { body, fill, left, right } = parseGenerated(lib(name));
return `<svg viewBox="0 0 100 100">
  <g fill="${fill}">${body}</g>   <!-- theirs, verbatim -->
  ${ourEyes(left, right)}          <!-- ours -->
  ${ourMouth(left, right, state)}  <!-- ours; the library cannot draw this -->
</svg>`;
```

**Inherit face placement, do not re-derive it.** The generator already solved where a face
fits inside each silhouette. Read the centre of the eyes *it* drew and put yours there.
You then get correct placement on shapes you never tuned, including any added later.

**Scale the face off the eye gap, using your existing mascot's own ratios.** Measure them
from whatever you already ship. Getting this wrong is what makes a face read as generic:
a ratio of 0.31 gives anonymous dot-eyes where 0.48 gives the character people recognise.

## 2. Pin the palette to a defined hue set

The tempting extremes are both wrong.

| Approach | Distinct colours across 60 entities | Problem |
|---|---|---|
| Free hue from the seed | 60 | Never reads as one brand |
| One locked brand hue | **6** | Entities become indistinguishable |
| **A fixed set of N brand hues** | **60** | — |

A single brand hue feels most "on brand" and is the worst choice: with tone variation alone
you get roughly six distinguishable colours, so a dozen entities collapse into near-identical
blobs at avatar size.

Take the hues you already have — chart tokens, primary, both light and dark themes — and
pass them as a fixed list. Ten brand hues against a generator's tone swatches produced
exactly 60 defined colours with **zero collisions** across a 60-entity fleet. The set is
enumerable: it is the same 60 colours forever, not a new colour per entity.

```js
const BRAND_HUES = [16.4, 41.1, 70.1, 84.4, 162.5, 184.7, 227.4, 250, 264.4, 303.9];
lib(name, { traits: { hue: BRAND_HUES.map((d) => d / 360) } });
```

**Measure it, do not assume it.** Render a few hundred names, collect the fill colours,
and assert the distinct count never exceeds the set size. Colours repeating across names
is expected once you render more names than you have hues — the claim being tested is
the bound, not per-colour uniqueness; test whole-avatar collisions separately (§7).

## 3. Reach every surface by changing two files

Do not edit call sites. Find the one or two shared components everything already renders
through, and change those:

- The **display component** used across the app — make the *terminal fallback* the derived
  avatar instead of colour-and-initial. Every surface inherits it.
- The **marketing mascot component** — keep its public API exactly, and re-implement its
  internals on the shared renderer. Existing call sites need no edit.

On a real codebase this was 31 surfaces reached by editing 2 files. If you find yourself
opening the 31, you have missed the seam.

Keep the priority chain explicit, with derivation last:

```
uploaded photo > explicitly picked style > emoji > derived avatar
```

## 4. Expression as state, if you have states

If your entities have run states, the face is a free status channel — an operator reads
status without a badge. Map states to poses once, centrally.

Be honest about the limit: **pose-only expressions are subtle at 24 px.** Tinted states
(error, blocked) survive small sizes; smug and wink do not. Check at real list sizes before
relying on it as the only status indicator.

## 5. Contain the dependency risk

If you parse a library's output, you depend on its **internal emission shape**, which is not
public API. That is acceptable, but only if contained:

- **Pin the version exactly.** No caret.
- **Return `null`, never a guess.** If parsing fails, degrade to the library's own output.
  Never invent a fallback coordinate — a hardcoded centre stacks both eyes *and* makes the
  parse look successful, so the degrade path you built never runs.
- **Preserve the caller's contract when degrading.** Keep the accessible name and the
  animation class. Otherwise a labelled avatar silently loses its label on a path no test
  covers.
- **Assert the contract in a test** across dozens of seeds, so a version bump fails loudly
  instead of shipping a mis-placed face.

Be shape-aware when parsing geometry. Averaging every number in an element works for a
`<path>` whose `d` is a stream of coordinate pairs, and **breaks** on `<circle cx cy r>`,
where the radius pairs with whatever follows and drags the centre off. Read `cx`/`cy`
directly for circles and ellipses.

## 6. Animate on the compositor only

An avatar appears once per row in a list, so animation cost is multiplied.

- Animate **`transform` and `opacity` only**. Nothing that triggers layout.
- Set `transform-box: fill-box` on animated SVG children. Without it, `transform-origin`
  resolves against the nearest viewport and the avatar visibly drifts while scaling.
- Disable everything under `prefers-reduced-motion`.

## 7. Verify

| Claim | How to check |
|---|---|
| Deterministic | Render the same seed twice, compare bytes |
| Palette is bounded | Render 300 seeds, assert distinct colours ≤ set size |
| No collisions | Render a realistic fleet, assert distinct avatars == count |
| Our face is applied | Assert the mouth stroke exists — the library cannot emit one |
| Degrades safely | Mock the library into an unparseable shape; assert the label survives |
| It reaches real pages | An e2e test on a real rendered route |

**Verify the server identity before trusting any e2e result.** A Playwright config with
`reuseExistingServer` will attach to whatever is already on the port — which may be an
entirely different app. One `curl` on the page title costs nothing and prevents a whole
class of meaningless red and, worse, meaningless green.

**Check that a new test can actually fail.** Reverting the fix must break it. One test
here passed against the buggy code too, because a bare `<circle cx cy r>` drops the odd
radius and the broken maths happened to land on the right answer.

## Related

- `verify-branding` — one logo, one accent, on every surface
- `saas-brand-system` — the palette and token layer this sits on top of
