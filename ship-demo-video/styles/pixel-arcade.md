# Style: 8-bit pixel arcade

First used for: foxlend.

## Ground
- Deep arcade navy `#0d0b1e` with a 40 px pixel grid (white at 5 %) and CRT scanlines over everything (2 px dark lines every 6 px).
- Palette: magenta `#ff3df2` (wordmark), cyan `#33e1ff`, yellow `#ffe23d`, green `#3dff7a`, red `#ff4d4d`, ink `#05040d` for hard 10 to 12 px drop shadows.
- The drop gets a dark red ground (`#2a0710`) for the "boss" beat; the proof gets a violet tint.

## Type pair
- Display: Press Start 2P. Labels: Silkscreen. Both downloaded as woff2, with `@font-face` in the main file and every sub-composition.

## Layout
- An arcade HUD from the first footage scene to the end card: `1UP FOXLEND` left, a `BLOCKED 00` counter centre, three hearts right.
- Footage sits in a pixel frame: white 10 px border, ink ring, cyan ring, hard ink shadow (stacked `box-shadow`).
- A stage tag in a filled box at x 1330 (`STAGE 1 · LEND`, `STAGE 2 · REVOKE`), with typed lines under it.

## Text entrances
- Stepped pop: scale 2.2 → 1 with `steps(5)` in 0.2 s, so the text grows like a sprite.
- Frame-stepped typing: one character per frame (0.034 s).
- Hit counter: `x1 … x8` and one red pip per beat, the HUD counter climbing with it. The count is the real number of blocked tries in the run.

## Seams
- Pixel-block wipe: 16 x 9 blocks of 120 px fill on a diagonal in 0.2 s and clear in 0.2 s (sub-composition per wipe). Used into the drop and into the end card.
- Footage frames pop in with `steps(4)` from 0.6x in 0.2 s; push-in starts 0.2 s later, 1.05x to 1.15x.

## Pacing
- 140 BPM (0.428 s per beat). Footage shots last 4 beats (1.7 s); the blocked log holds 8 beats, one hit per beat. 22.3 s total.

## Music prompt
"8-bit chiptune arcade instrumental, 140 BPM, square wave lead, NES style noise drums, triangle bass, level start fanfare then a boss fight drop at 8 seconds, starts on a strong downbeat, clean ending on the final bar" (`elevenlabs/music`, 25 s). The `minimax/music-02` take was only 17 s long.

## SFX cue map
- glitch on frame 1 and before each block wipe; pop on each stepped pop; type under typed lines; riser into the boss beat and hit on it; hit on each blocked try; click on Revoke; chime on "still signed in"; stamp on each proof figure; chime on the end card.

## Copy pattern
- Hook in two hard-cut lines: "GIVE AN AGENT / ONE LOGIN." then "NOT ALL / OF THEM.".
- Value: wordmark plus the typed README promise.
- Story as stages and a boss: "STAGE 1 · LEND", "BOSS: INJECTION", "STAGE 2 · REVOKE".
- Proof: three stats from the artifact ("41/41 E2E CHECKS PASS", "8 TRIES BLOCKED", "0 REQUESTS LEAKED").
