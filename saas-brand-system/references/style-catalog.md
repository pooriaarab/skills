# Style catalog — 14 emotion-tagged brand directions

Proven directions from real fan-out runs. Each is a *distinct emotional world*, not a
palette swap. Pick a spread that covers different emotions; give each sub-agent one entry
plus the shared contract. Palettes are oklch; fonts are Google Fonts. Adapt the signature
device to the product's core metaphor (here: "one event → fans out to many destinations").

Choose 4–10 per round. The first four (Signal, Fan-out, Blueprint, Anime) are the safest
spread across dev-credible / joyful / enterprise / bold.

| # | Direction | Emotion | Base + accent (oklch) | Fonts | Signature device |
|---|---|---|---|---|---|
| 1 | **Signal** — electric/dev-native | alive, fast, technical | ink `0.15 0.012 250` + electric cyan `0.82 0.16 200`, lime `0.88 0.20 130` | Space Grotesk + Inter + JetBrains Mono | live dispatch console streaming per-item ok/err; light pulses travel wires from one node to many |
| 2 | **Fan-out / Prism** — vibrant | delight, joy | warm cream `0.98 · 90` / plum-charcoal dark + magenta→coral→orange→violet ramp | Sora + Inter + JetBrains Mono | one white beam enters a prism, refracts into per-destination colored beams; each chip its own hue |
| 3 | **Blueprint** — premium enterprise | trust, precision | near-white `0.99 0.003 265` / deep ink + ONE indigo→violet `0.52 0.20 275` | Inter (tight) + JetBrains Mono + Newsreader italic | engineering-grid backdrop, glass cards, hairline node graph, single indigo signal traces the path |
| 4 | **Anime / Dispatch** — illustrated | joy, surprise | manga cream `0.97 0.02 90` / neon night + coral, electric blue, yellow, purple, thick ink outlines | Space Grotesk (heavy) + Inter + JetBrains Mono | cel-shaded courier mascot throws event packets with manga speed-lines; comic starbursts; arcade buttons |
| 5 | **Brutalist Terminal** — raw | confidence, power | ink `0.16 0 0` + bone `0.96 0.005 90` + acid chartreuse `0.88 0.22 130`; dark = green-on-black CRT | Space Mono + Archivo 800 + Inter | exposed grid + coordinates, oversized 01/02 numerals, ASCII-ish fan-out, hard offset blocks (no radius) |
| 6 | **Aurora / Ethereal** — luminous | awe, calm | midnight `0.17 0.03 260` + aurora ramp teal→emerald→violet→magenta | Fraunces + Inter | slow-drifting blurred aurora blobs behind glass; radiant core fires soft beams to glowing nodes; grain |
| 7 | **Synthwave / Retro-future** — neon 80s | nostalgia, exhilaration | night sky `0.18 0.06 285` + magenta `0.66 0.28 350` / cyan `0.82 0.16 200` / sunset orange | Chakra Petch + Inter | perspective neon grid floor to a glowing sunset orb horizon; event rockets across with neon trails; VHS scanlines |
| 8 | **Editorial / Swiss** — print | sophistication, authority | paper `0.98 0.006 85` / ink `0.18 0.01 60` + ONE vermilion `0.60 0.22 28` | Fraunces (giant serif) + Archivo + JetBrains Mono | strict column rules, section numerals, hanging pull-quote, fan-out as a hairline contents-page index |
| 9 | **Kinetic / Motion-first** — sporty | momentum, excitement | near-black `0.15 0.01 250` + electric yellow `0.88 0.19 100` | Anton / Archivo Black + Inter + JetBrains Mono | opposing marquee rails, live dispatch counter, continuously-looping fan-out; diagonal energy (calm static fallback) |
| 10 | **Organic / Living** — natural | warmth, growth | oat cream `0.96 0.02 85` + moss `0.55 0.12 150` + terracotta `0.68 0.14 45` | Fraunces / DM Serif Display + DM Sans | morphing gooey blobs; mycelial/root lines grow from event to nodes (draw-on); membrane = hashing metaphor |
| 11 | **Cyberpunk / Neon-noir HUD** — edge | intensity, adrenaline | teal-black `0.15 0.02 220` + hot magenta `0.65 0.28 350` + cyan `0.85 0.15 195` | Rajdhani / Chakra Petch + JetBrains Mono | HUD corner brackets + reticles, scan lines, packet-dispatch stream, glitch on a keyword, chamfered buttons |
| 12 | **Luxury / Obsidian & Gold** — haute | prestige, desire | obsidian `0.16 0.008 60` + warm gold `0.80 0.13 85` + champagne text | Cormorant Garamond / Playfair + Jost | thin gold hairline system, gold-foil sheen shifting on hover, elegant gold-line constellation, deep negative space |
| 13 | **Claymorphism / Soft 3D** — toy | joy, tactility | soft `0.97 0.01 280` + violet `0.62 0.19 290` / coral / mint / yellow, dual soft shadows | Fredoka / Baloo 2 + DM Sans | puffy inflated clay shapes; event = glowing clay orb popping out to squishy platform coins; press = squish-in |
| 14 | **Constellation / Starmap** — cosmic | wonder, reach | space navy `0.16 0.03 265` + starlight + cyan/periwinkle/gold star accents | Space Grotesk + JetBrains Mono | animated starfield; event-star connects via drawn glowing edges to platform stars that twinkle; star-catalog wall |

## Color system + accessibility (not one flat accent)

The `base + accent` columns above are the *seed*, not the whole palette. Express each direction
as a real **3-color system** — a lead (`primary`), a support (`secondary`), and a pop
(`tertiary`) — plus neutrals and semantic status colors. This is what fixes "the palette feels
flat / it's all one color": e.g. Brutalist reads as acid-green + cyan + magenta on ink, not
mono-green.

Every pair must pass **WCAG AA** in both themes (body ≥ 4.5:1, large/UI ≥ 3:1, and text on each
brand fill ≥ 4.5:1). Don't eyeball it — pick each on-color by contrast and verify. The
**`vibebrand`** package encodes exactly this: 14 contrast-checked 3-color token systems
(`npx vibebrand tokens <id>`, `npx vibebrand check --all`) sharing this catalog. Generate the
accessible token floor there, then design the world on top.

## Button personality by direction (the tell)

The press state is where brand lives. Match it to the world:
- **Signal/Cyberpunk/Constellation/Aurora**: glow that intensifies on hover, `translateY(1px)` +
  inset on press. Neon/soft ring focus.
- **Brutalist/Anime/Clay**: hard-offset or dual shadow that *collapses* on press so the button
  stamps/squishes into the page. Thick/offset focus ring.
- **Fan-out/Synthwave/Kinetic**: gradient fill, hover lift (`translateY(-2px)`) + brighter, spring
  easing `cubic-bezier(0.34,1.56,0.64,1)`.
- **Blueprint/Editorial/Luxury**: restrained — small darken + 1px lift + crisp/hairline/gold ring;
  motion 150ms, nothing bouncy. Loud via scale and precision, not color.

## Adding directions

New worlds are welcome — keep the rule: one distinct *emotion* + one *signature device* + a
tokenized palette + a real font pairing + a matching press personality. Vague ≠ distinct.
