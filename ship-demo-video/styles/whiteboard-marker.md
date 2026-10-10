# Style: Hand-drawn marker on whiteboard

First used for: foxloop.

## Ground
- Whiteboard off-white `#f6f6f1` with two soft grey smudges (radial gradients at 6 to 7 %).
- A grey aluminium frame (18 px) and a marker tray strip at the bottom.
- Marker inks: black `#1d1d1f`, blue `#1f5fd1`, red `#dd2e28`, green `#1d9a52`.

## Type pair
- Headlines and the wordmark: Permanent Marker (uppercase glyphs only). Downloaded woff2, with `@font-face` in every sub-composition.
- Notes, labels and the install line: Caveat 700 (has lowercase, so the npm command reads exactly).

## Layout
- Footage is a printout: white 12 px border, soft shadow, slight rotation, two coloured magnets on the top edge.
- Notes sit at x 1300, numbered in the order of the loop ("1. a goal", "2. gate asks once", "3. checked").
- The loop itself is a diagram: four nodes (plan, gate, check, repeat) around a circle with curved arrows.

## Text entrances
- Write-on: a left-to-right `clip-path: inset()` reveal at writing speed (0.25 to 0.45 s per line, `power1.inOut`). End the reveal at a negative right inset (−12 %) or script glyph overhangs get clipped.
- Marker strokes: SVG paths with `pathLength="1"`, drawn by `strokeDashoffset` 1 → 0 in 0.2 to 0.35 s: loose ovals that overshoot their start, curved arrows with a two-stroke head, ticks, crosses, wobbly underlines.

## Seams
- Eraser swipe: a 700 px soft band of board colour sweeps left to right in 0.5 s and hides the cut.
- Printouts drop 60 px with a 3° settle in 0.3 s; push-in starts 0.25 s later, 1.05x to 1.1x.

## Pacing
- 107 BPM (0.559 s per beat). Footage shots last 2 beats (1.12 s); the loop diagram holds 4 beats. 20.7 s total.

## Music prompt
"Playful bright indie instrumental, 112 BPM, marimba, pizzicato strings, hand claps, cheerful, no vocals" (`minimax/music-02`). The `elevenlabs/music` take was flat for 17 s and faded at 21 s.

## SFX cue map
- scribble under every write-on and stroke; whoosh on each eraser swipe; click when a printout lands; chime on each green tick; stamp on each red cross; hit on the hidden-note drop; chime on the end card.

## Copy pattern
- Hook as a question, circled: "Who stops / your agent?".
- Value: the loop drawn node by node (the README one-liner as a diagram).
- Each scene: a two-line marker note, lowercase, plus one mark (tick or cross).
- Proof: three hand-written figures underlined in marker ("17/17 E2E checks pass").
