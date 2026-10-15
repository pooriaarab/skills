# Style: Newsprint zine collage

First used for: foxtrail.

## Ground
- Newsprint `#ece6d6` with a 9 px halftone dot screen (ink at 10 %) and a faint fibre gradient.
- Ink black `#141210`, spot red `#d7261e`, highlighter yellow `#f1df3a`, cream paper `#fbf8ef`.

## Type pair
- Ransom-note cut-outs mix the bundled fonts: Archivo Black (black slip), Playfair Display 900 italic (cream slip), League Gothic (red slip), EB Garamond 700 (white slip), Space Mono 700 (yellow slip).
- Masthead: Playfair Display 900 between 6 px rules, with a Space Mono dateline (`VOL. 0.1.2 · FOR AI AGENT ACTIONS · FREE · MIT`).
- Body and proof labels: EB Garamond italic.

## Layout
- Footage is a photocopied clipping: torn edge (a 28-point `clip-path` polygon), `grayscale(0.35) contrast(1.12)`, hard drop shadow, two tape strips, slight rotation.
- Headline pieces sit beside or under the clipping, each slip rotated −4° to 3°.
- Proof is a "By the numbers" column: red League Gothic figure, italic caption, hairline rule per row.

## Text entrances
- Slap-down: each cut-out drops from 1.35x with an extra −8° and lands in 0.18 s (`power4.out`), one per beat.
- Rubber stamp: red bordered word (`CAUGHT.`, `TAMPERED`, `LINE 11`, `OK · EXIT 0`) falls from 2.2x and −16° in 0.16 s (`power4.in`) and lands at −6°.
- Masthead drops 120 px; rules scale out from the centre.

## Seams
- Torn sheet: a full sheet of newsprint with ragged sides sweeps right to left in 0.56 s (`power2.inOut`) and hides the cut.
- Clippings slap down with a 6° settle in 0.2 s; push-in starts 0.2 s later, 1.05x to 1.15x.

## Pacing
- 128 BPM (0.467 s per beat). Footage shots last 4 beats (1.9 s) with a new cut-out every beat; the tamper scene holds 6 beats. 21.8 s total.

## Music prompt
"Scrappy lo-fi garage punk instrumental, 128 BPM, fuzzy distorted bass, raw drums, crunchy guitar, DIY photocopied zine energy, starts on a hard downbeat with no intro, drop at 8 seconds, clean ending on the final bar" (`elevenlabs/music`, 25 s). The `minimax/music-02` take was only 18 s long.

## SFX cue map
- stamp on every cut-out; hit on every rubber stamp; whoosh on each torn-sheet seam; scribble under the masthead promise; pop when a clipping lands; click on the drop.

## Copy pattern
- Hook as a ransom note: "ONE / changed / BYTE." then the stamp "CAUGHT.".
- Value: a newspaper masthead with the one-line promise.
- Each scene: a three or four piece headline in mixed type, plus one stamp.
- Proof: "By the numbers", one figure per row.
