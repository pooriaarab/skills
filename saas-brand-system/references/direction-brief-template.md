# Per-direction sub-agent brief template

One sub-agent per direction, launched in parallel in a single message. Use
`general-purpose` (reliable in-harness Write). Fill the `<…>` from a `style-catalog.md`
entry. Keep the art direction concrete — palette in oklch, a Google-Fonts pairing, ONE
signature device, an explicit button/press spec, and the emotion target. Vague briefs
produce generic output; the quality lives in the spec.

```
Build ONE world-class self-contained HTML branding prototype for the product "<PRODUCT>".

STEP 1 — Read the shared contract IN FULL and satisfy every rule:
<abs path to scratchpad/REQUIREMENTS.md>

STEP 2 — Build the "<DIRECTION NAME>" direction. Must be LOUD, experimental, and evoke a
clear emotion: <EMOTION>. <2–3 sentences of the world's concept + how it maps to the product
metaphor.>

PALETTE (tokens): <base oklch + accent ramp oklch>. Dark theme: <how it re-maps>.
TYPE: <Google Fonts display + body + mono pairing, with how they're used>.
SIGNATURE: <the one signature visual device; how the hero + fan-out use it>.
BUTTONS: <primary fill + hover + press behavior; secondary; tertiary; focus ring; motion>.
EMOTION TARGET: <3–4 adjectives>.

STEP 3 — Write the finished single HTML file to EXACTLY (overwrite if exists):
<abs output path>/<slug>.html
Do not touch any other file or the git repo. Return only: path, 3-line concept, fonts + palette tokens.
```

## Batching

- Keep each batch within the session's workflow-size guideline (~4–10 agents). For >10
  directions, run two batches.
- Launch every agent in the batch in a **single message** so they run concurrently.
- They return path + concept + palette only — do not read the full HTML files back; review
  them in the browser instead (Phase 2).
