# Style: Glass on shader footage

First used for: foxmind.

## Ground
- A rendered shader clip fills the frame as a muted `<video>` (`assets/shader.mp4`).
- `work/foxmind/tools/shader.py` renders it: a two-pass sine domain warp at 480x270, upscaled to 1080p with `gblur` 6 and light temporal grain.
- Palette: near-black navy `#06071a`, deep violet, violet, magenta-violet, ember `#ff6e46`, peach. Mostly dark, with slow bright ridges.
- The shader moves at about 0.35 time units per second. It is the only motion that never stops.

## Glass
- Every surface is a frosted pane: `rgba(255,255,255,0.09)` fill, `backdrop-filter: blur(30px) saturate(160%)`, a 1.5 px white rim at 30 %, a 1 px inner top highlight, and a soft 90 px drop shadow.
- Radius 36 px for panes, 85 px for pills, 20 px for footage inside its frame.
- Footage sits in a glass frame sized to the still's own aspect (fit inside 1180x640). The image is `object-fit: contain` on the terminal color.
- The presenter sits in a 360 px rounded glass card on the right (x 1470), with a mono tag under it.

## Type pair
- Display: Sora 800, tight tracking (-0.045em to -0.05em). Body: Sora 300. Labels and commands: JetBrains Mono 500.
- White text. One accent: ember `#ff9a6b` for one word per scene (for example "go?", "Cloud", "32/32", "$").

## Text entrances
- Blur-to-sharp slam: opacity 0, scale 1.16, blur 22 px to sharp in 0.5 s, `expo.out`.
- Per-word masked rise with a 0.04 to 0.07 s stagger, `power4.out`.
- Glyph spread: each letter of the wordmark starts offset by (i - mid) x 40 px and settles in 0.6 s. Do not tween `letterSpacing`; the lint rejects it.
- Pills and tiles enter from the left with blur, one per beat.

## Seams
- A tall skewed glass pane (520 px wide, skew -12 deg) sweeps left to right across the frame in 0.55 s on section seams. It refracts whatever is under it.
- Footage frames enter with a blur-to-sharp scale from 1.08 and hard-cut out on the next beat.
- Push-in on the footage after 0.3 s: 1.25x to 1.5x over 1 s, `power3.out`. Clamp the pan (`zoom()` in `_groupb/hf.py`).

## Pacing
- 100 BPM, cuts every 2 to 3 beats (1.2 to 1.8 s). 22.8 s total.
- The beat enters on bar 4 (9.66 s); the first footage of a result lands there.

## Music prompt
"Instrumental airy future-garage electronic bed, 100 BPM, soft glassy synth pads, shimmering arpeggio, light shuffled 2-step drums, warm sub bass. Sparse and calm so a voice can sit on top. Starts on a clear downbeat, no long intro; the beat fully enters at 9 seconds. Clean ending on the final bar. No vocals." (`elevenlabs/music`, 26 s.)

## SFX cue map
- hit on the first slam and on the beat drop; whoosh under each glass sweep and footage whip; click per tier pill; pop per proof tile; riser 1.4 s before the drop; chime when a result appears and on the end card.
- Music ducks to 0.26 under the presenter's voice.

## Copy pattern
- Hook as two questions in the viewer's words ("Which AI just answered you?" / "And where did your text go?").
- Value: name plus one sentence of what it is.
- Three tiers as three pills.
- Each footage scene gets one plain topline that says what the still proves.
- Proof: three tiles, a big measured number and a one-line source each.
- End card: name, `$ npm i <name>`, repo URL, "Free and open source."
