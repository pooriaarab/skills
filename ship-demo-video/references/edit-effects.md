# Creator edit effects

These are the edits that make a presenter video feel cut by an editor, not
assembled. Each one has a job, a HyperFrames recipe that rendered cleanly, and
the trap that cost a cycle.

The names come from two public repositories. Read them for more examples:

- [latent-spaces/brag](https://github.com/latent-spaces/brag) (MIT): a launch-video
  skill for HyperFrames. Its `examples/` folder holds five full storyboards.
- [cathrynlavery/yap-studio](https://github.com/cathrynlavery/yap-studio)
  (Apache-2.0): a talking-head editor. `docs/captions-and-cards.md` defines the
  card vocabulary used below.

First shipped: the foxspace and foxprefs launch videos (2026-10-23), in two
variants each: a handheld selfie in Barcelona and a studio cutout.

## Choose the edits

Give each edit one job. Do not use one only because it exists.

| Edit | Job | Use it when |
| --- | --- | --- |
| Kinetic hook | Stop the scroll | The first spoken line, frame 0 |
| Gravity drop | Land 1 to 3 key words | The voice lists things ("size, diet, budget") |
| Crash zoom text behind | Name the product | "So I built X" |
| Screen push | Hand over from face to product | The voice starts to explain the product |
| Crash zoom | Point at the one detail | A click, a tick, a dialog in the footage |
| Cursor overlay | Show cause and effect | Footage recorded without a visible pointer |
| Prompt bar | Show the user's request | Before a demo of an AI flow |
| Icon strike | Kill the old habit | A beat with no voice, after the demo |
| Hard cuts on the beat | Show breadth | The same action on several sites or apps |
| Giant captions | Stress the one rule | A short promise ("Private items never go in") |
| Title card | Mark a chapter | Between demo sections, 0.6 to 0.9 s |

A 30 s cut used about 11 edits. Never put two of the same edit back to back.

## Recipes

Each graphic edit is a sub-composition with its own timeline in scene-local
time. The speaker and the footage card are untimed wrappers on the main
timeline that hold timed `<video>` clips, so a push or a zoom is one tween on
the wrapper. The builder that generated all of this is `v1fx.py` in
`fox-media/work/tools/` (not in this repo).

### Kinetic hook

Giant uppercase words over the picture, each on its spoken frame. Get the word
times from speech to text (`whisper --word_timestamps True`).

- Frame 0 must be a finished poster. Set the whole first line at frame 0 and
  pulse each word when it is spoken: `scale 1 → 1.14` over 0.07 s, back over
  0.18 s with `power3.out`.
- Later lines replace the line before on their first word. Each word enters
  from `scale 1.9`, `opacity 0`, `blur(10px)` to sharp in 0.14 s, `expo.out`,
  0.05 s before the word.
- Size 190 to 230 px with a hard 10 px offset shadow in a darker shade of the
  ground. Put it on the chest, not over the eyes.

### Gravity drop

Words fall in and land with weight on their spoken frames.

- Fall up to 0.26 s on `power2.in` from `y: -900`, with a small rotation that
  halves on landing. Then squash: `scaleY 0.78, scaleX 1.14 → 1` over 0.22 s.
- Mix two chip styles (accent block, ink block). Play a stamp SFX at landing.
- Start the scene at least 0.3 s before the first landing. A fall that starts
  before the scene does is never drawn.

### Crash zoom text behind

A giant word slams in behind the person's head.

1. Make a person matte with `scripts/personmask.swift` (macOS Vision, about
   60 s for 600 frames) and merge it into a VP9 WebM with alpha:
   `ffmpeg -i talk.mp4 -framerate 25 -i masks/m%05d.png -filter_complex "[1:v]format=gray,boxblur=1[m];[0:v][m]alphamerge,format=yuva420p" -c:v libvpx-vp9 -auto-alt-ref 0 -an cut.webm`.
   HyperFrames 0.8.190 renders the alpha correctly.
2. Paint order: background video, the word, the cutout video (timed only for
   that window). For a studio cutout on a solid ground, the word goes under the
   cutout and no second layer is needed.
3. The word enters from `scale 2.6`, `blur(24px)` to sharp in 0.24 s, `expo.out`,
   with a hit SFX, then grows to `scale 1.05` with a linear ease until it exits.

### Screen push

The full-frame speaker shrinks into a side card while the footage card pushes
in from the other side, in one 0.55 s `expo.inOut` move.

- Keep a second, synced copy of the speaker video for the card. Give it its
  own file name (`talk-card.mp4`): two `<video>` nodes with the same source,
  start and duration trigger the `duplicate_media_discovery_risk` warning.
- During the push, blur and darken the full-frame copy
  (`blur(28px) brightness(0.55)`, `scale 1.12`). It becomes the background.
- For a selfie, make the card 16:9 (470 × 264 px); for a square cutout, square.
- Hide the card during full-screen graphics. A studio card has an opaque
  ground and shows as an empty box.
- Fade the card's own ground in with the push (`opacity 0 → 1` over the same
  0.55 s). A ground that is already opaque flashes as a dark box for a frame
  before the speaker reaches it.

### Crash zoom on footage

Zoom the footage layer to the detail in about 0.18 s with `expo.inOut`, then
pull back before the cut. With the origin at the center, a point at fraction
`p` is centered at scale `s` by `xPercent = -(p - 0.5) × s × 100`; clamp it to
`±(s - 1) / 2 × 100` so no edge shows.

- Record footage at 2× device scale. A 1× capture goes soft past 2× zoom.
- Keep the whole row in view. A zoom that crops the field labels or the level
  column loses the meaning of the shot. On a 1440 px page column inside a
  2880 px frame, rows read at 2.1×, single controls at 2.7×.

### Cursor overlay

Headless captures show no pointer. Record each pointer event (`t`, `x`, `y`,
`what`) in the capture script, then draw an SVG cursor inside the zoom layer
so it zooms with the footage. Move it to each point over up to 0.45 s with
`power2.inOut`; on a click, press it to `scale 0.82` and expand a ring.

### Prompt bar

A rounded chat input types a request, a context chip pops in, and the send
button turns green with a drawn check.

- Type with `tl.set` on `textContent`, one step per character, at about 34
  characters per second. Slower typing overran a 2 s slot.
- Hide the check with a dash array longer than its path (100 for a 60 px path).
  A short dash array leaves a stub of the check over the arrow.

### Icon strike

A tile with a drawn icon enters, a slash draws across it in 0.28 s with
`power4.in`, the tile shakes 4 times and dims. Whoosh before, hit on contact.

### Hard cuts on the beat

Cut 0.8 s pieces of the same action on different sites, one per beat, each
starting about 0.4 s before the result lands. Show the site's real logo
(Simple Icons, CC0) beside the card, one at a time.

### Giant captions

The spoken line, oversized in a solid block in the accent colour. Each word
brightens from `opacity 0.18` when spoken. Keep the block under 1800 px wide:
at 120 px, five words of a heavy display face already overflow.

### Title card

An ink panel wipes up (0.26 s `expo.inOut`), a mono number and a giant title
rise, a rule draws, and the panel wipes off the top. Hold at least 0.8 s, or
`hyperframes check` reports the title as unread.

### End card

The product name, one line, and an install chip, on the ink ground. Hold it
3 to 3.5 s with the music tail.

- Show `npm install <name>` as the only call to action. Leave out the GitHub
  URL line; the owner removed it from the foxspace cut. Close the gap by moving
  the footer up under the chip.

## Variants

Ship two cuts of each product from one builder, with one edit list:

| Variant | Presenter | Ground |
| --- | --- | --- |
| Selfie | Handheld talk in a real place, full frame, blurred behind pushes | The selfie itself |
| Studio | Alpha cutout of the presenter | One solid brand colour |

The owner preferred the selfie cut. Put it first in the delivery email. Send
one email per product with compressed copies (`-crf 27`, 3 to 8 MB each) and
keep the full files in the delivery folder.

## Traps

| Trap | Rule |
| --- | --- |
| A class selector in one sub-composition's tween (`tl.to(".gd")`) also hit the same class in another scene, so words vanished 0.25 s after landing | Scope every class used in a tween with the scene id (`{cid}gd`) |
| CSS `translate: -50% -100%` on an element GSAP also moves put it 700 px off | Center with GSAP `xPercent` / `yPercent`, never CSS `translate` |
| `letterSpacing` tweens fail lint (`gsap_non_transform_motion`) | Animate `scale` instead |
| `z-index` on main-timeline wrappers painted them over every sub-composition | Set paint order by DOM order only |
| A contact sheet made a centered prompt bar look shifted | Check layout on the full-size still, not the sheet |
| Words held for less than 0.5 s + 0.3 s per word | Accept it only for the kinetic hook; hold every label longer |
| A right-side label or drop word ran off the frame at 1920 px | Right-align labels, and size drops so the widest word clears the edge |
