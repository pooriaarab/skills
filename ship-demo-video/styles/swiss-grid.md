# Style: Swiss grid / International Typographic

First used for: foxgate.

## Ground
- Off-white `#f5f5f2` with the 12-column grid left visible: 120 px columns, 24 px gutters, from x 120. Each column has a 3.5 % red tint and a 6 % ink hairline at its left edge.
- Ink `#111111`, grey `#5f5f5a`, one red `#d9001b`. No gradients, no shadows, no rotation.

## Type pair
- Display: Inter Tight 900, flush left, ragged right, tracking -0.035em (-0.065em only on the one-word name), line height 0.9 to 0.95, word spacing +0.1em so tight words do not touch.
- Labels and code: Space Mono 400.
- Every scene carries a section number at top left: "03 — the request" (number in 800, label in 500 grey). Numbers run in order.

## Layout
- Asymmetric: the statement sits in columns 1 to 6, the footage hangs from the right margin (right edge x 1800, fit inside 820x800), with a 2 px ink keyline.
- Set pieces: two hard-cut hook statements (the second all red), the name with three answers on the grid ("allow / deny / ask", one per beat), the real request JSON in a white slab with a red left rule and the changed field marked in red, a giant "19/19" with three ruled result rows.

## Text entrances
- Masked slide along a grid axis: lines rise from `yPercent: 105` in 0.4 s `expo.out`; the name and table rows slide in from the left (`xPercent: -105`).
- No blur, no scale, no fades on type. Changes land on the beat as hard cuts.
- The JSON slab opens with a left-to-right clip; the red mark switches on with no ease.

## Seams
- Red block wipe: a full-frame red panel crosses the frame in 0.38 s (0.18 s in, 0.2 s out) on section seams.
- Footage opens bottom-up with a clip in 0.3 s and hard-cuts on the next beat. Push-in starts 0.25 s after the cut, 1.25x to 1.5x, clamped.

## Pacing
- 120 BPM (0.5 s per beat). Hook statements 2 beats each, footage 2 to 3 beats, proof 7 beats, end card about 5 s. 24.5 s total.
- The bed is even all the way, so the cut rate carries the energy, not a drop.

## Music prompt
"Instrumental precise motorik electronic cue, 120 BPM, tight drum machine, clean Swiss-precision synth arpeggio, muted guitar plucks, rubber bass. Starts on a strong downbeat, no long intro; a bigger drop with full drums at 8 seconds. Clean ending on the final bar. No vocals." (`elevenlabs/music`, 25 s.)

## SFX cue map
- hit on the first frame, the name and the proof; stamp on "Who said yes?", on the red JSON mark and on each refusal; whoosh under every red wipe and footage cut; pop for each of allow/deny/ask and each result row; type under the JSON; glitch on the changed-action refusal; chime on the real-extension proof and the end card.

## Copy pattern
- Hook: a plain fact and a question ("Your agent wants to pay." / "Who said yes?").
- Value: name, the README's one-line promise, and the product's three answers.
- Numbered sections walk the mechanism: request, approval, guard, proof, measured.
- Each footage statement is five words or fewer where it can be ("One token. One use.").
- Proof: the E2E pass count, then the exact refusal strings the run printed.
- End: name, red rule, `$ npm i <name>`, repo URL, "Free and open source." plus where it runs.
