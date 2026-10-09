---
name: ship-demo-video
description: "Turn real footage of your own product into a short, social-ready demo video, repeatably: capture the product working from an automation harness (window-region recording, privacy-safe crops, cut before the browser closes), make a plain captioned cut, then build a designed cut with HyperFrames (outcome-language hook, value by beat two, footage cards with push-ins, proof stats from measured runs only, end card) on a generated instrumental music bed with cuts on detected bars. Approval gates between stages: storyboard, one still per scene, preview with director notes, verified render. Covers the traps from a real run: screencapture writes no file when a parent stops it with a signal, beat detectors that report double tempo, HyperFrames fromTo rendering its from-state at build time, untimed card wrappers, sub-composition and contrast lint findings, zoom math that exposes frame edges, and buffered harness logs that hide when the browser closed. Use for a product demo, feature demo, extension or app walkthrough, or a launch clip built from screen recordings. Generated launch films (AI stills, image-to-video) are launch-video-generation."
---

# Demo videos from real product footage

A demo cut from real footage proves the product works. Generated imagery cannot. This skill takes a product
from "it runs in a test harness" to a 30 to 60 second video that is ready to post, and back again
when the product changes.

**Boundary.** Use this skill when the footage is your own product running for real. For a launch film built
from generated stills and image-to-video clips, use `launch-video-generation`. For the post that carries the
video, use `social-launch-post`.

## Stages and gates

Each stage ends at a gate. Do not start the next stage before the gate passes.

| Stage | Output | Gate |
| --- | --- | --- |
| 1. Capture | Raw footage per scenario, with the time of each moment that matters | Every frame shows only the product window |
| 2. Plain cut | One captioned MP4 under 60 s | Ready to share as is; the fallback if stage 5 slips |
| 3. Storyboard | Hook, beats, a frame table with "why" per frame | Each claim traces to footage or a measured run |
| 4. Music | Instrumental bed and a bar grid | No vocals; strong first downbeat; clean last bar |
| 5. Build | HyperFrames project per video | `hyperframes check` passes with no findings |
| 6. Stills | One still per scene, on a contact sheet | Director notes resolved (see the checklist) |
| 7. Render | Final MP4, verified | Duration, streams, loudness and frames checked |
| 8. Save | Corrections written back into this skill | The next run starts from the corrected skill |

In collaborative mode the human approves stages 3, 6 and 7. In autonomous mode, post the storyboard
and contact sheet as heads-ups, and still do the stage 6 review yourself before you render.

## 1. Capture real footage

Drive the product from the same end-to-end harness that tests it, with a visible (headed) browser.
Record the screen while the harness runs. This gives footage of the real product on real sites, and the
run doubles as a test.

### Record the window region, not the screen

- On macOS, `screencapture -v` writes **no file** when a parent process stops it with a signal. A wrapper
  that sends SIGINT gets nothing back. Use ffmpeg's `avfoundation` screen input instead, and finish it by
  writing `q` to its stdin. That closes the file correctly.
- Park the browser window at a fixed position and size before recording (for example with `peekaboo window
  move/resize`), then crop the capture to that region. On a Retina display the crop is in pixels, not
  points: multiply the window rectangle by 2.
- Check a frame from the first test capture before the real run. The crop must show the window and nothing else.

### Privacy

A full-screen capture leaks the menu bar, OS notifications and other apps' windows.

- Crop to the product window. If something still covers it (a persistent notification over a side panel),
  compose the video from two crops instead of touching the user's desktop.
- **Cut every segment before the browser closes.** Harness logs are often buffered. The time a "done" line
  prints can be later than the moment the window closed, and the frames between show the desktop. Sample
  frames around the end of each run and cut before the last product frame.
- Review the tail of every segment frame by frame before you share anything.

### Third-party sites

- Use logged-out sessions. Do not record personal accounts.
- Do not send content to a third party on the user's behalf just to film it. End the scene with Cancel and
  show the full send flow on a local test page.
- Probe first. Load each candidate site, check that the element under test exists (a composer, a consent
  banner) and that no bot wall appears, then choose the sites to film.
- Real sites find real bugs. On one run, filming a consent add-on on a real site showed it following a policy
  link out of the dialog, and saving consent with every optional switch still on. Fix the product first,
  then re-record. Do not film around a bug.

## 2. Make a plain cut first

Cut the raw footage into one MP4 under 60 seconds: trim each scenario to its active window, add one caption
per scene, scale to 1600 px wide. This is shareable on the same day, and it is the fallback when the designed
cut slips.

- Homebrew ffmpeg builds often lack the `drawtext` filter. Render each caption as a transparent PNG (any
  image library) and `overlay` it.
- Keep scenes at real speed in the plain cut. It is the honest version.

## 3. Storyboard the designed cut

Write the plan before any HTML. A frame change here costs a minute; after a render it costs a cycle.

- **Hook in outcome language.** The first beat says what the viewer gains or avoids, not what the product is.
  "You're one Enter away from pasting your email into an AI" beats "PII Guard detects PII".
- **Value by beat two.** The product name and its one-line promise land in the second scene.
- **Evidence after value.** Footage scenes show the promise working. Each scene gets a short topline that
  says what the viewer is seeing, and changes when the footage changes.
- **Proof from measured runs only.** Use the numbers your harness measured (a timing, a pass count, "0
  network requests"). Do not invent a statistic for impact.
- **End card.** Name, one-line description, where to get it. Do not claim a store listing that is still
  under review.
- Present it as a proposal: one line saying "this video tells [audience] that [message]", then a table of
  frame, beat, on screen and why. Cut any frame whose "why" does not trace back to the message.

**Reference beats description.** Name one or two reference videos whose pacing and type you want to match
(launch-video galleries such as whatships.com). Without a reference, an agent falls back to the same default
look: centered text, gradient background, everything fading in. For a big launch, ask for three storyboard
variants and pick one.

## 4. Music bed

- Generate an instrumental per video at the exact length you need. On WaveSpeed, `elevenlabs/music` takes
  `music_length_ms` and `force_instrumental` (about $0.10 per track). State a tempo, "starts on a strong
  downbeat, no long intro" and "clean ending on the final bar" in the prompt.
- Check every file. Equal byte sizes are normal for constant-bitrate output; compare checksums to confirm the
  tracks differ.
- Detect beats (HyperFrames: `npx hyperframes beats` in the project). A detector can report double the
  tempo you asked for, because it counts eighth notes. Take the median gap and derive the bar: the bar at
  112 BPM is 2.143 s.
- Put every scene boundary on a bar. Hard cuts inside a scene go on beats.
- Fade the bed in over the first 0.4 s and out over the last 1.5 s, using a volume automation lane, not a
  timeline tween. Target about −16 dB mean and a peak below −1 dB.

## 5. Build with HyperFrames

HyperFrames renders video from HTML: `data-*` attributes set the timing, one paused GSAP timeline per
composition drives the animation, and the CLI checks, snapshots and renders.

- Install its skills (`npx hyperframes skills update`, then the workflow skill), and start every build at
  the `/hyperframes` router. A remix of existing footage routes to `general-video`.
- Write `BRIEF.md` (message, destination, aspect, length, assets with source timestamps) and a `STORYBOARD.md`
  with one block per scene, even when no human reviews it. On resume, these files are the only record of the decisions.
- Use one project per video, with the same scene set: hook, value, footage with a topline, proof, end card.
  Generate the scene files from one spec per video so all videos share one structure.

### Structure rules from real lint and render failures

| Trap | Rule |
| --- | --- |
| A timed `<video>` inside a timed wrapper shows wrong frames, then vanishes | Time the video. Keep its card wrapper untimed. |
| The untimed card wrapper shows as an empty frame during the hook | Hide it in CSS (`opacity: 0`), then reveal it on the timeline. Not `tl.set` at 0. |
| A `fromTo` on a hard-cut card renders its "from" state at build time and shows the card early | Hard cuts use `tl.set` at the cut time. Zoom tweens take `immediateRender: false`. |
| Nested markup in a timed scene gets the warning "nested structure needs sub-composition" | Every text scene is a sub-composition with its own timeline in scene-local time. |
| Footage zooms set from a sub-composition do nothing | Animate the footage on the main timeline, at global time. |
| Repeated kicker elements with no tween overlap their neighbours | One element per distinct label. |
| Decorative ghost text fails the contrast audit | Use non-text decoration (glow, grid), or none. |
| Negative `z-index` highlight disappears | Order it in the DOM: the highlight first, the word in a positioned span after it. |
| Unbundled fonts warn and can fail in cloud renders | Use a bundled pair, for example Montserrat for display and JetBrains Mono for labels. |

### Footage handling

- Trim with `data-media-start` plus `data-duration`. Speed up dull stretches with `data-playback-rate`
  (1.15 to 1.65 reads as real; faster looks fake).
- Footage is muted. The only sound is the music `<audio>`, which needs an `id`, or it is silent.
- **Push in on the subject.** Full browser footage is unreadable on a phone. Zoom the inner wrapper to the
  element that matters (the composer, the prompt, the result, the route), and pull back before the cut.
- Zoom math, with `transform-origin` at the center: to center a point at fraction `p` of the width at scale
  `s`, set `xPercent = -(p - 0.5) × s × 100` (the same for y). Keep `|xPercent| ≤ (s − 1) / 2 × 100`, or
  the footage edge shows as a dark strip.

### Motion doctrine

Smooth long-tail settles (`power3.out`), never bounce. Reveal each element when its beat arrives, not all
at once. No breathing loops, no slow drift on content in the back half of a scene. One slow, finite drift
on a background glow is enough life. All motion lives in the paused timeline; no CSS animations.

## 6. Review the stills

Run `npx hyperframes snapshot --at <times>` with one time per scene, at the moment that carries the
scene. Read the contact sheet as a director. Check each item:

- No empty cards, stray frames or bleed from a scene that is not on screen.
- Text inside the footage is legible at phone size. If not, push in.
- No cropped words in toplines or in the footage after a zoom.
- No exposed footage edge after a pan.
- Each scene stays long enough to read its topline twice.
- No desktop, notification or private content in any frame.

Give notes in camera words: "push in on the prompt at 15.4 s", "hard cut on the bar at 19.32", "pull back
before the cut". "Make it better" gets random changes. Re-snapshot after each round of fixes.

## 7. Render and verify

- `npx hyperframes render --quality high --output renders/<name>.mp4`. A 40-second 1080p render takes about a
  minute on a laptop.
- Verify the file, not the log: `ffprobe` duration and streams (video and audio present), a frame grid
  across the whole video, and `volumedetect` for loudness.
- Deliver into the product's media folder, outside the repository. Never commit media to a repo whose
  checks reject committed proof files. Open the folder for the human.

## 8. Save the corrections

After the human watches the result, write each correction back into this skill: a new trap, a note the human
repeated, a gate that was missing. The next agent reads the skill, not this chat.

## Formats

- 16:9 at 1920×1080 suits X, LinkedIn and YouTube. Make this cut first.
- 9:16 needs a new layout (footage card on top, topline below), not a crop of the 16:9 cut.
- Keep each cut at 30 to 45 seconds for a feed. Put the hook in the first 3 seconds.

## Related skills

- `launch-video-generation`: generated launch films, image-to-video, AI stills.
- `social-launch-post`: the post that carries the video.
- `app-screenshots`: store screenshots from the same product runs.
