# Paper cutout / stop-motion

First used for: foxden (24 s).

- **Ground:** kraft paper `#e9dcc0` with a static SVG `feTurbulence` grain (fractal noise, seed fixed, about 22 % alpha in brown).
- **Paper colours:** cream `#fffaf0`, tomato `#e2553c`, mustard `#f2b636`, teal `#2f8f83`, navy `#23305a`; ink `#1d1a16`. Each slip has a flat 7 px drop shadow, never a blur glow.
- **Type pair:** Bowlby One for display slips and cut-out letters; Courier Prime 700 for typed labels.
- **Text entrances:** stop-motion only. Every move uses `steps(n)` with n = duration × 12, so it animates on twelves. Slips land in 4 drawings from above with 6 degrees of over-rotation. The name is six separate coloured paper tiles that land one after another (70 ms apart).
- **Torn edges:** a seeded jagged `clip-path` polygon on display slips and seam sheets only. Keep the clip-path count under about 20, or HyperFrames warns that the capture may go black.
- **Seams:** a full sheet of coloured paper with torn edges slides across in stepped frames (170 ms in, 170 ms out) and covers the cut.
- **Footage:** photo prints. A cream border of 22 px, a slight tilt (-2 to +2 degrees), two strips of translucent tape on the top corners, and a typed numbered label slip beside each print ("3. Python sums it: 400"). Push-ins also step.
- **Pacing:** strong beats every 1.336 s (quarter 0.668 s); footage shots of 2 quarters, stats of 3.
- **Music prompt:** "Playful handmade stop-motion soundtrack, 108 BPM, pizzicato strings, marimba, hand claps, toy piano, woodblock, bouncy and warm. Instrumental only, no vocals. Starts on a strong downbeat, no intro. Fuller section at 8 seconds. Clean ending on the final bar." (The minimax/music-2.6 take, trimmed from 8 s, builds into its full section at about 6 s in.)
- **SFX cue map:** pop on each slip and letter landing; whoosh under each paper-sheet seam; stamp as each print lands; scribble as each label slip lands; hit on the first stat; chime on the end card.
- **Copy pattern:** a two-slip hook ("Run code on your files." / "Nothing leaves the tab."), cut-out name plus a typed promise, numbered print labels that read as steps, stats on big torn slips ("6/6", "0", "16/16") with a typed explanation, end card of slips.

## v2 polish (foxden, second round)
- No code on screen. Lead with the use case, and compare with tools people know on paper index cards (private window, virtual machine, cloud sandbox, foxden). Each card has one short, accurate line and a ✓ / ✗ / ~ disc.
- Paper SVG props: a sheet with grid rows, a robot, a cloud, a browser tab, a switch, paper planes that crumple, a spinning loop arrow, a timer ring, a STOP stamp. Every prop gets a flat shadow copy offset 7/9 px. Do not use a blur filter.
- Give seam sheets their own id prefix (`seam`). One clashed with a scene element id (`sheet1`), and a prop vanished.
