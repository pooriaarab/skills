# Style: Financial ticker / data terminal

First used for: foxpay, with the founder avatar.

## Ground
- Terminal black `#07090c` with a faint 60 px grid (white at 3.5 %).
- A fixed amber header bar (56 px): `FOXPAY <GO>` left, `AGENT PAYMENTS TERMINAL` centre, `TESTNET · NO REAL MONEY` right.
- A fixed ticker tape at the bottom (74 px, black, amber top rule). It scrolls once, linear, for the whole video. Every item is a real run fact: `TRAIL MUG $26.00 ▲ PAID AFTER 1 APPROVAL`, `GIFT CARD $500.00 ▼ REFUSED · OVER CAP`, `REPLAY ▼ HTTP 402 NONCE_USED`.
- Market colours: amber `#ffb000` (primary), green `#19e27a` (up, paid, pass), red `#ff4b4b` (down, refused), cyan `#4cc9f0` (secondary data).

## Type pair
- Data and labels: IBM Plex Mono (bundled), uppercase labels at 24 px with 0.14 em tracking in dim grey `#8a93a3`.
- Big figures and the wordmark: Oswald 700 (bundled), condensed.

## Layout
- Footage sits in "panels": 2 px amber border, a 40 px header strip with a panel title (`POPUP · WAITING FOR YOU`, `SHOP · CHECKOUT`, `TERMINAL · REPLAY`) and a green status dot.
- A right-hand data column at x 1480: label over a value, a 2 px rule between rows.
- The avatar is a 390 px square panel at x 1480, y 560, titled `LIVE · <FOUNDER>, MADE <PRODUCT>` with a red dot.
- The build asserts that no panel runs into the ticker and that the voice ends before the end card.

## Text entrances
- Split-flap: each character shows three deterministic glyphs, one per frame, then lands; left to right (`textContent` sets on the paused timeline).
- Ticking figures: a value counts to its measured number in 12 frames (`$0.00 → $26.00`, `$100.00 → $74.00`).
- Data rows slide 40 px from the right with a colour flash (screen blend, 0.45 s fade).
- Proof board rows slide in from the left with a flash, one per two beats.

## Seams
- Refresh line: a 6 px amber line with glow sweeps top to bottom in 0.3 s, centred on the cut.
- Panels open top-down with a clip (`inset(0 0 100% 0)` to `0`) in 0.22 s on the beat; push-in starts 0.2 s later, 1.05x to 1.12x.

## Pacing
- 118 BPM (0.5085 s per beat). Footage shots last 2 or 4 beats (1.0 to 2.0 s). 25.5 s total.
- Voice runs 0.5 to 20.8 s; the music ducks to 0.26 under it and comes back up for the end card.

## Music prompt
"Minimal tech house instrumental, 118 BPM, ticking hi-hats like a stock ticker, deep sub bass, glassy synth plucks, sparse, no vocals" (`minimax/music-02`, trimmed from 1.0 s). The `elevenlabs/music` take faded out from 19 s, too early for a 25 s cut.

## SFX cue map
- glitch on frame 1; type under each split-flap line; whoosh on every refresh seam; pop on each panel; type under each ticking figure; chime on paid; glitch on refused and on the 402; hit on each proof row; chime on the end card. SFX run at 0.18 under the voice, 0.4 after it.

## Copy pattern
- Hook as an incoming request: `> INCOMING · PAY REQUEST` / `YOUR AGENT WANTS TO PAY.` / `WHO SAYS YES?`.
- Value: wordmark plus the README tagline split in three rows.
- Each scene: one label plus one figure (`AMOUNT · TRAIL MUG $26.00`, `OVER THE $100 CAP ▼ REFUSED`).
- Proof board: `BOARD · REAL E2E RUN <date>` with four rows from the artifact.
