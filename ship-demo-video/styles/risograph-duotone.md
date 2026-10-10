# Risograph duotone

First used on foxsync. It looks like a two-ink riso print: warm, handmade, a little off-register.

- **Ground:** paper `#f4efe4`, flat. The decoration is pink halftone dot blocks (`radial-gradient` at 22 px, `mix-blend-mode: multiply`). Do not add a gradient or a glow.
- **Inks:** blue `#1e3ac4` for the text and the shadows. Fluoro pink `#f44590` for the stress words, stamps and wipes. A brighter pink fails AA on paper.
- **Footage:** convert every harness still to duotone with PIL (`prep.py`). Luminance maps to blue on paper, and saturated pixels map to pink (green Approve and red Deny both turn pink). Put each still on a paper card with a 5 px blue border and a hard 18 px blue offset block, with a pink dot block behind one corner.
- **Type pair:** Archivo Black for the display text (bundled, 400 only), at 100 to 300 px with -0.035em tracking. Space Mono 700 for the labels and the numbers, with 0.12em tracking and a pink "chip" (`<b>01</b>PAIR`).
- **Text entrances:**
  - Misregistered double print. A pink pass and a blue multiply pass slide in from opposite sides and stop 7/5 px apart (0.34 s, `power4.out`). Mark both passes `data-layout-allow-overlap`, and mark the pink pass `aria-hidden`.
  - Ink-roller reveal for the labels: `clip-path: inset(0 100% 0 0)` to `0`, 0.32 s.
  - Stamp slam: a pink bordered box goes from scale 1.6 and rotation -12 to scale 1 and rotation -6 in 0.16 s with `power4.in`, with the stamp and hit SFX.
- **Seams:** an ink pass. A 900 px pink multiply panel sweeps across the frame in 0.42 s, centered on the cut, on the main timeline. Use it only on the act seams (value, demo, claim, proof, end). Every other cut is a hard cut on the beat.
- **Footage motion:** the card slides in 60 px from the left, then the still pushes in on the element that matters (`power3.out`, 0.8 s). For a tap, push in, then expand a blue ring from the button.
- **Pacing:** one shot is 6 detector ticks (about 1.27 s at 142 BPM eighths). The hook is two shots, with a hard word swap on the beat. About 17 shots in 24 s.
- **Avatar PiP:** a 330 px square, bottom right, with a 6 px blue border and a pink offset block. Blue duotone comes from `grayscale(1) contrast(1.15)`, then a blue `screen` layer, then a paper `multiply` layer. Keep the text and the cards out of x > 1450, y > 640 while the PiP shows. Fade it out before the voice clip ends, or the card shows empty paper.
- **Music prompt:** "Bright lo-fi indie electronic pop, handmade and warm, 110 BPM. Punchy kick and clap, tape-saturated synth bass, glockenspiel melody, light vinyl crackle. Starts on a strong downbeat with no intro. Steady sparse groove that leaves room for a spoken voice, a lift around 8 seconds, then a clean ending on the final bar. Instrumental, no vocals." The minimax/music-2.6 take, trimmed from 7.0 s, won: its lift lands on the demo. Duck to 0.26 under the voice.
- **SFX cue map:** pop on each hook word swap. Stamp on the wordmark, on REJECTED and on the proof number. Whoosh (0.25) on each ink pass. Riser into the demo. Click on the tap ring. Chime on the signed answer and on the end card.
- **Copy pattern:** the hook is the user's outcome in two beats ("Your agent / wants a yes."). Then the value line, the wordmark, and numbered steps (`01 PAIR`, `02 ASK`, `03 ANSWER`, `04 RECORD`) with 2-line toplines. A question and a stamped answer for the security claim. A stamped measured number. The end card has the name, a one-line promise, `npm i <name>` (or the README install line, for example `npm i -g foxbridge`) in a bordered card, and the repo URL.
