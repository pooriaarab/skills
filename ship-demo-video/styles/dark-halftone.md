# Dark halftone

First used for: foxshield (22 s). Lookbook source: hyperframes-launches `inspector-launch` (halftone background studies, "the halftone shifts 0.1 s before each transition").

- **Ground:** near-black `#090b0a` with a global halftone dot field (teal `#2bd4a4` dots, 18 px cell) masked by a radial ellipse. One slow finite drift moves the mask centre across the whole video. The field jumps by part of a cell 0.1 s before each cut, so the ground cues the edit.
- **Colours:** ink `#eef4f0`, teal dots, signal red `#ff4646` only for the threat ("FOR IT.", the slash in "4/4", the technique names).
- **Type pair:** Big Shoulders Display 900 uppercase for display (116 to 640 px), DM Mono 400/500 for kickers and labels.
- **Text entrances:** masked per-word rise (`yPercent 110 → 0`, power4.out, 60 to 90 ms stagger). Wordmarks and stats slam from `scale 1.2-1.3, blur(18-22px)` to sharp with expo.out. Technique names flip on the eighths.
- **Seams:** dot dissolve. A top overlay of background-coloured dots swells its radius (CSS variable `--r` 0 → 11 px on a 16 px cell) over 120 ms before the cut and shrinks over 160 ms after it. Footage cards open with a `circle()` clip-path iris.
- **Footage:** white page cards with a teal halftone drop shadow offset 28 px; kicker plus a caps line in a right-hand column.
- **Pacing:** 100 BPM, quarter = 0.6 s; footage shots of 2 quarters (1.2 s), stats of 4 quarters on the drop.
- **Music prompt:** "Dark tense electronic thriller cue, 100 BPM, pulsing sub bass, ticking hi-hats, low brass hits, suspense, heavy drop at 8 seconds. Instrumental only, no vocals. Strong first hit at the very start, no intro. Clean ending on the final bar." (elevenlabs/music: dips at 2 s and 7 s, drop at 9 s, fade from 20 s, so the cut is 22 s.)
- **SFX cue map:** whoosh on every dot dissolve; pop as each footage card irises open; hit on each stat slam; stamp on the stat label; click on each technique flip; chime on the end card.
- **Copy pattern:** a threat hook in second person ("YOUR AGENT READS WHAT YOU CAN'T SEE."), a stakes line with the red word, wordmark plus one-line promise, footage with kicker + verdict ("FOXSHIELD SCANS IT / A HIDDEN BOX. NO CONTRAST."), measured stats on the drop ("4/4", "0 false alarms on 18 normal pages", "19/19"), end card.
