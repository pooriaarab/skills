# Style: Blueprint

First used for: foxbench.

## Ground
- Blueprint blue `#0d3b80` with a two-level grid: 24 px minor lines at 8 % pale blue, 120 px major lines at 22 %.
- White line work (3 px rules, boxes, dimension ticks). One accent: amber `#ffd166` for the key word, the winning row and the scan line.
- A fixed title block at bottom right: `foxbench · sheet 1 of 1 · <repo URL>` in mono inside a thin box.

## Type pair
- Display: Barlow Condensed 800, uppercase, near-zero tracking. Secondary display: Barlow Condensed 600.
- Annotations: IBM Plex Mono 500, sentence case, pale blue `rgba(214,232,255,0.82)`.

## Layout
- Footage is a "detail view": the still fits inside 1180x680 centered at x 740, with a 3 px white outline offset 14 px.
- The callout column sits at x 1430: an amber mono label ("Detail C · the page source", "Run 2 · careful"), a drawn rule, and a condensed title.
- Set pieces: a title block (name, divider, one-line spec, meta at top right), a spec sheet of boxes ("site 1 ... site 4"), and a ruled results table.

## Text entrances
- Frame-stepped stencil typing for the hook (one glyph per 0.03 s).
- Scale-down slam for the payoff word ("PROVE IT.").
- Rules and dimension lines draw from the left (`scaleX`, `expo.out`); boxes and frames open with a left-to-right clip; spec boxes open bottom-up, one per 0.24 s.
- Table cells rise 20 px, row by row on the beat.

## Seams
- Plotter scan: a 4 px amber line with glow sweeps the full width in 0.4 s on section seams.
- Detail views open with a left-to-right clip in 0.32 s and hard-cut on the beat.
- Push-in starts 0.3 s after the cut: 1.15x to 1.6x, `power3.out`, clamped to the frame edges.

## Pacing
- 124 BPM (0.484 s per beat). Footage shots last 2 to 3 beats (1.0 to 1.5 s); the intro holds 4 beats on the spec sheet.
- The kick drops on B(16) = 8.14 s, where the first task page appears.
- 24 s total.

## Music prompt
"Instrumental only, no vocals, no singing. Driving minimal techno, 124 BPM, ticking hi-hats, pulsing analog bass, metallic percussion, tense synth stabs, riser then hard drop." (`minimax/music-02`. The `elevenlabs/music` take had a weak first two seconds.)

## SFX cue map
- type under the stencil hook; hit plus scribble on "PROVE IT."; stamp when the title block lands; click per spec box; pop per count; riser into the drop and hit on it; whoosh on every detail cut; glitch on each trap reveal; chime on the careful agent's result and the end card; pop per table row.

## Copy pattern
- Hook as a claim and a challenge ("Your agent says it's done." / "Prove it.").
- Title block: name plus a one-line spec in the README's words.
- Spec sheet: what the suite contains, as counted facts (13 tasks, 4 traps, 4 sites).
- Each detail view: a label that names the real artifact, and a title that says what it shows.
- Proof: the real scoreboard as a table, dated, with its source run.
- End: name, `$ npm i <name>`, repo URL, "Free and open source." plus one call to act.
