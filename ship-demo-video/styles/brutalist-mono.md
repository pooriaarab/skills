# Brutalist mono

First used for: foxkit (23 s).

- **Ground:** off-white paper `#f1f0ea` with a hard 160 px grid of 2 px lines at 9 % black. Inverted scenes are solid black `#0a0a0a`. One acid accent, `#d7ff1f`, used only as flat blocks with 6 to 8 px black borders.
- **Type pair:** Space Mono 700 for display (uppercase hooks, -0.06 em tracking, 220 to 520 px). IBM Plex Mono 400/600 for tags, labels and registration marks.
- **Text entrances:** hard cuts on the beat (`tl.set`, no tween). Words swap on single beats. Promise lines type in frame steps (one character per 22 ms). Counters step through fixed values (03, 07, 11, 14, 17). Checklist rows land one per half beat.
- **Seams:** hard cut plus black inversion on the beat. Acid blocks wipe in with `steps(6)`. Push-ins on footage use `steps(5)`, so motion reads mechanical. No blur, no curves.
- **Footage:** square card, 8 px black border, 22 px hard offset shadow, an acid tag strip above ("01 / ONE COMMAND"), a mono source line below ("REAL OUTPUT · ...").
- **Presenter:** a square 340 px picture-in-picture at the bottom right, 8 px black border, 18 px hard offset shadow, and an acid name strip under it ("<FOUNDER> · MADE <PRODUCT>"). It opens with a stepped `inset()` clip wipe and cuts out hard. Footage cards narrow to 1300 px to clear it. The music ducks to 0.26 under the voice. The build refuses an avatar window that reads past the clip's last frame, or a voice that runs into the end card.
- **Chrome:** corner registration labels in mono caps. Hide them during inverted scenes, or the contrast audit fails.
- **Pacing:** 126 BPM, quarter = 0.476 s. Text shots of 2 to 4 beats, footage shots of 2 to 3 beats.
- **Music prompt:** "Minimal industrial techno, 126 BPM, hard dry kick, metallic clanks, sharp percussive clicks, distorted bass stabs, stark and mechanical. Instrumental only, no vocals. Strong downbeat at the very start, no intro. Full drop at 6 seconds. Hard stop on the final bar." (elevenlabs/music gave a flat -11 LUFS bed with a hard stop at 23 s: ideal.)
- **SFX cue map:** click on every hard cut and checklist row; glitch on each inversion; hit on the second word of an inverted line; stamp on block wipes, the stat and the end card; type under typed lines.
- **Copy pattern:** two-word caps hook ("ONE COMMAND." / "A WHOLE REPO."), wordmark on an acid block with a typed promise, numbered footage tags ("0N / WHAT IT PROVES"), then measured numbers as giant mono figures ("17/17", "0 ERRORS / 0 WARNINGS"), a checklist, and an end card of shell commands in black and acid chips.

## v2 polish (foxkit, second round)
- Drawn props in the same language: chore blocks with tick squares, a giant ENTER keycap, a folder with 31 file squares, a browser outline with a puzzle piece, MARKED and PASS slabs, a conveyor with a package, a PUBLISHED stamp, an envelope, a receipt that prints in 12 steps.
- SVG text uses a CSS class for fill. An attribute `fill` loses to the class, so put the colour in `style="fill:..."`.
- Every cut gets a hard one-frame black inversion flash.
