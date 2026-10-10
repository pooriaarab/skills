# CRT terminal

First used for: foxrunner (24 s).

- **Ground:** phosphor black `#030805`. A static overlay of 2 px scanlines (28 % black every 4 px) and a radial vignette sits over everything. Text glows: `0 0 6px` and `0 0 22px` of its own colour.
- **Colours:** phosphor green `#7dff9a` for normal output, amber `#ffb000` for the outcome line, red `#ff5a4f` only for the kill.
- **Type pair:** VT323 for display (200 to 560 px), IBM Plex Mono 600 for sub lines and captions.
- **Text entrances:** frame-stepped typing everywhere (30 to 45 ms per character for display, 12 to 16 ms for sub lines). Wordmarks and stats come up from `blur(14px) brightness(3)` to sharp, like a tube warming.
- **Seams:** CRT collapse. The whole stage scales to `scaleY 0.012` in 65 ms, a green flash peaks, then it opens again in 90 ms. A red full-frame flash (screen blend, 4 pulses) marks the SIGKILL.
- **Footage:** a rounded "monitor" card inside a glowing bezel line; inset black vignette and scanlines on the footage. Crop to the panel that carries the proof (here the storage-state printout), not the whole window. A typed `> caption` line under the monitor changes with each shot.
- **Pacing:** detector reports eighths at 0.303 s; cut on quarters (0.606 s), shots of 2 quarters (1.21 s).
- **Music prompt:** "Retro 1980s home-computer synthwave, 112 BPM, arpeggiated square-wave lead, analog bass, gated drums, chiptune textures, determined mood. Instrumental only, no vocals. Strong first downbeat, no intro. Full drums drop at 8 seconds. Clean ending on the final bar." (The elevenlabs take faded at 18 s; the minimax/music-2.6 take, trimmed from 4 s, held -11 to -13 LUFS and won.)
- **SFX cue map:** type under every typed line; glitch on every collapse; click as each footage shot lands; hit plus glitch on the kill; chime when the tasks finish; riser under the wordmark promise; stamp on the second stat.
- **Copy pattern:** a shell command as the hook (`$ kill -9 firefox`), the outcome in amber ("your task: still running."), caps wordmark, `> lower-case log captions` per shot, stats as huge VT323 figures ("15/15", "2 attempts. / 1 side effect."), feature list as `> lines`, end card with `$ npm i <name>`.

## v2 polish (foxrunner, second round)
- Phosphor line drawings replace the screenshots: a progress bar and step boxes, a moon with Zs, a lightning bolt, a step chain with a travelling dot and disk blinks, try 1/2/3 stamps, two attempt lines that meet at "1", and a clock with sweeping hands. A drop-shadow glow on the SVG layer gives the bloom.
- Labels are typed `> lower-case lines` at the bottom. Only the hook, the promise and the end card carry a sentence.
