# Style: Editorial magazine

First used for: foxmemory.

## Ground
- White stock `#fbfaf6`, no texture. Ink `#141414`, caption grey `#5d5a55`, one accent: cobalt `#1d3fd6`.
- A fixed masthead on every frame: the product name in Fraunces 800 at left, a tracked small-caps strap at right, and a 2 px rule under it at y 124. The rule draws in on frame 1.
- A folio at bottom left: the repo URL in tracked Instrument Sans 22 px.

## Type pair
- Display: Fraunces 800 (cover lines, the name, numerals), tracking -0.035em to -0.045em.
- Decks and captions: Fraunces 400 italic.
- Kickers, body and commands: Instrument Sans 500 and 700. Kickers are 24 px, 0.22em tracking, uppercase, cobalt.

## Layout
- Left margin 120 px. Footage is a photo plate in the left column (fit inside 1100x680), with a 2 px ink outline offset 10 px.
- The caption column sits at x 1300: "Fig. N" kicker, an italic caption (60 px), and one sans line of body copy.
- Set pieces: a cover (kicker plus two-line headline plus italic deck), an "Introducing" spread with a drop cap, a pull quote with a giant cobalt quote mark, and a "By the numbers" table with ruled rows.

## Text entrances
- Line masks: each line rises from `yPercent: 110` in a clipping line box, `power4.out`, 0.12 s apart.
- Rules draw from the left (`scaleX` 0 to 1, `expo.out`).
- Table rows wipe in with a left-to-right clip and a small rise, one per beat.
- The quote mark lands with a scale from 1.4.

## Seams
- Page turn: the whole spread slides off to the left in 0.32 s (`power3.in`) on the seam beat.
- Plates enter as a print slide: from 60 % right with a clip that opens from the right edge, 0.5 s `expo.out`.
- Plates swap on hard cuts during the montage; the caption column swaps with them.

## Pacing
- 112 BPM. Most shots last 2 beats (1.07 s). The first recall plate holds 5 beats (2.7 s): it carries the message.
- The full groove enters on B(21) = 11.45 s; the fast recall montage starts there.
- 23.5 s total.

## Music prompt
"Instrumental only, no vocals, no singing. Warm nu-jazz, 96 BPM, Rhodes electric piano chords, walking upright bass, brushed drums, soft vibraphone melody." (`minimax/music-02`; it played at 112 BPM. The `elevenlabs/music` take of the same brief stayed flat with no lift.)

## SFX cue map
- hit on the cover and on the drop; whoosh on each page turn and plate slide; stamp when the name lands; click when a push-in starts; type under the deck; pop for the quote mark and each table row; riser before the drop; chime when the first recall result shows and on the back cover.

## Copy pattern
- Cover line in the second person, a question as the deck ("Your agent remembers you." / "Can you read what it knows?").
- "Introducing" plus the name plus a two-line italic deck plus one drop-cap paragraph of how it works.
- Every plate is a numbered figure with a caption that states what the still proves.
- "By the numbers": three ruled rows, each a measured value and its source in plain words.
- Back cover: name, `$ npm i <name>`, repo URL, "Free and open source." plus where it runs.
