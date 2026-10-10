# Neon synthwave

First used on foxbridge. It is an 80s outrun night: a neon sign over a sunset grid.

- **Ground:** one shared ground on the main timeline, under the scene hosts (`under_html`). It has a night sky gradient `#0b0221` to `#3d0a52`, a horizon line at y 756 (`#ff2975` with glow), and a striped sun (a gradient from `#ffd319` to `#ff2975` to `#8c1eff`, with mask stripes) at the right. The floor is an SVG of magenta lines that meet at the vanishing point, plus 8 horizontal lines that roll toward the viewer once per bar (`repeat` is a finite count). The sun rises 60 px in the first 2 s. That is the only drift.
- **Type pair:** Audiowide (Google woff2, own `@font-face`) for all display text, in white with a magenta or cyan neon glow (`text-shadow` 6/22/56 px). Use the "chrome" wordmark style for the name and the proof number: lilac fill with a 2 px purple and a 5 px magenta drop line. IBM Plex Mono 700 in cyan for the command tags (`> list_tabs`) and the labels. Audiowide is wide: 66 px toplines fit about 34 characters, and the hook lines take 118 to 150 px.
- **Text entrances:**
  - Neon flicker-on: frame-stepped `tl.set` opacity 1, 0.1, 1, 0.45, 1 over 0.2 s.
  - Horizon fly-in: from scale 0.25, 260 px low and 12 px blur, to full, in 0.45 s with `expo.out` and origin at the bottom center.
  - Scanline reveal for the tags: `clip-path` from the top down in `steps(8)`.
  - Chrome slam for the wordmark and the number: scale 1.4 to 1 with blur 18 to 0.
- **Footage:** harness stills in a "CRT" card. It has a 3 px cyan border, an 18 px radius, a cyan and magenta glow, and a scanline overlay (`repeating-linear-gradient`). The card switches on like a tube: scaleY 0.02 to 1 in 0.22 s. Then it pushes in on the line that matters. Show a terminal result of one or two lines in a wide strip (1500 x 300), and an approval card in a full card (1300 x 620).
- **Seams:** a glitch slice. Four colored bars (cyan, magenta, violet) at fixed heights flash for 3 frames with opposite x offsets and `mix-blend-mode: screen`. Use it on the act seams, with the glitch SFX. Every other cut is a hard cut on a bar.
- **Pacing:** shots of 6 ticks (1.52 s at 118 BPM) for the footage, and 4 ticks (1.02 s) for the first two hook words. 15 shots in 23.5 s. No avatar.
- **Music prompt:** "Retro 1980s synthwave outrun, 118 BPM. Gated reverb snare, driving arpeggiated analog bass, bright saw lead, lush pads. Starts on a strong downbeat with no long intro, a big drop at about 7 seconds where the full beat enters, high energy to the end, clean ending on the final bar. Instrumental, no vocals." The elevenlabs/music take won. Trim its 0.76 s of lead-in silence so that beat 1 is at 0.
- **SFX cue map:** glitch on the hook words and on every glitch seam. Hit on the wordmark, on each "Refused" and on the proof number. Type under the first command tag. Click on Approve. Riser into the kill switch. Whoosh on the second proof card. Chime on the end card.
- **Copy pattern:** a command tag, then a 5-word topline that says the result in plain words ("Deny. Nothing runs.", "A tab you did not share? Refused."). The hook is the viewer's tension in two words-on-beats ("Your agent wants / your browser."), then the bounded offer ("Give it one tab."). Proof is the measured check count, then the two negatives the README promises.
