---
name: launch-video-generation
description: "Plan and generate a short (15-60s) launch/announcement video from a real product: a storyboard framework, wavespeed.ai API facts (submit-then-poll, image-to-video model behavior, pricing), the hard-won fix for scene transitions and on-screen text/logos, and a zero-generation-spend path (HyperFrames HTML/CSS/GSAP) for whole-video native-app-mimicry concepts (a note, a chat thread) used as a self-aware ad framing device. Also covers multi-video suites (one film genre per video), wavespeed text-to-music, cinematic-still pipelines with hero-anchor character consistency, and rendering hand-built animated HTML to mp4 via puppeteer screencast + ffmpeg. Model-agnostic where possible, wavespeed.ai/HyperFrames-specific where noted. Includes an iterative creative loop for multi-video suites: multiple variations per stage (vibe/genre/twist → storyboard stills → cheap draft video → full render) with human sign-off between stages, genre+twist assignment per video, hero-anchor character consistency (one hero reference image; every shot an edit of THAT image — frame-chaining drifts by shot 3), and TTS voice casting (minimax/speech-2.6-hd) with ffmpeg voice effects. Also: Veo 3 via Vertex AI (ADC auth, predictLongRunning -> fetchPredictOperation, inline base64 image-conditioning, fixed 8s clips), fast-cut pacing (12-15 x ~2s hard cuts per 30s spot), movie-style variation grids for fast human picks, and the constraint-sandwich prompt structure (subject anchor > action+camera > optics+lighting) with a locked style-anchor string."
---

# launch-video-generation

Empirical, from building a real launch video (slackclaw) end to end: storyboard → generation → assembly → a redo after the first cut's on-screen text and scene transitions came out wrong.

## 1. Storyboard first, always

Don't jump to generating clips. Structure the video as a shot list before writing a single generation prompt:

- **Duration → shot count**: generation length and cut length are different numbers. Image-to-video models render ~5-8s clips (Veo 3: fixed 8s), but a fast-cut 30s spot wants ~2s on screen per shot = **~12-15 shots** — generate the full clip per shot, then keep only its best ~2s beat and scrap the rest. Letting six 5s clips play out whole reads slow and same-y; hard-cutting twelve-plus best-beats reads like a real spot.
- **Narrative arc — use a real copywriting framework, not a vague tone label.** "Make it punchy" or "make it funny" describes a *feel*, not a *structure*, and a structure is what actually gets built correctly on the first pass. Two frameworks that map directly onto a shot list:
  - **PAS (Problem → Agitate → Solution)**: 1-2 shots stating the real problem, 2-3 shots making its cost vivid/painful, 2-3 shots resolving it with the actual product and real proof (numbers, not adjectives). Label each shot with its stage so the structure is checkable at a glance.
  - **JTBD (Jobs To Be Done)**: ground the "problem" stage in the actual job the audience is hiring the product to do, stated as a real observed pain, not a category description. A product with more than one real user (e.g. a human user *and* an AI agent consuming the same tool) can have two parallel JTBD angles worth blending in the same PROBLEM shot — this reads as sharper and more specific than either alone.
  - Hook → Build → Payoff → CTA is the lighter-weight version of the same idea when the video doesn't need a hard "problem" framing (e.g. a pure feature reveal).
- **A shared Visual Theme block, written before any shot**: color palette, lighting style, lens/film character, motion language. Every shot's prompt must restate this. This is what makes six separately-generated clips read as one intentional piece instead of six disconnected clips — visual consistency across shots matters more than any single shot being gorgeous.
- **Style-shifts are fine if deliberate**: a cold-open in a different visual register (e.g. a meta screen-recording hook) cutting into a stylized body is a real technique, not an inconsistency, as long as each register is internally consistent.
- **When generating multiple narrative/tone variations (punchy vs. funny vs. controversial, etc.), lock the visual world explicitly in the brief.** A delegate given "write N tonal variations, match the reference storyboard's format" will readily vary the *visual concept* along with the tone — new settings, new metaphors, a completely different look per variation — because nothing told it the visual language was fixed. State it as a hard constraint: "every variation reuses the exact same Visual Theme block(s), varies only the narrative/joke/angle within them." Otherwise you get N unrelated ideas, not N takes on one idea.
- **For a SUITE of videos (e.g. one per product in a multi-launch), give each video its own distinct genre + film framework** — drama, epic trailer, heist/crime, mystery/thriller, horror, romance — so the set reads as a range, not six of the same video. The Visual Theme lock applies *within* a video; *across* videos you want deliberate contrast. Keep the copy ELI5: no product jargon, universal movie-arc emotion — each video should land with a viewer who has zero context on what the tool does.
- Per shot, write: composition/camera framing, lighting, subject, action, and a complete 40-80 word cinematic prompt ending in a technical spec line (duration, aspect ratio, "cinematic 1080p, synchronized audio" or equivalent).
- **Reference frame libraries for shot design**: study framing, lighting, and lens choices from real film frames instead of inventing them — film-grab.com, shot.cafe (RGB parades), shotdeck.com (hand-tagged, 30+ categories), frameset.app.
- Close the storyboard doc with a post-production checklist (stitch order, transition types, audio layering, export spec) and a "why this works" rationale — both keep you honest about whether the plan actually holds together before you spend money executing it.

## 2. wavespeed.ai API shape (submit-then-poll, universal)

Every generation model on this platform follows the same two-call pattern:

```
POST https://api.wavespeed.ai/api/v3/<model-id>          -> returns {"data":{"id": "..."}}
GET  https://api.wavespeed.ai/api/v3/predictions/{id}/result  -> poll until data.status == "completed", result at data.outputs[0]
```

Auth: `Authorization: Bearer $WAVESPEED_API_KEY` header, no per-request signing.

**Don't trust a single doc-page summary for exact field names — verify against the actual model page before spending money.** Three concrete misses from one real build: a field guessed as `instrumental` was actually `is_instrumental`; a guessed upload path `media/upload` was actually `media/upload/binary`; a guessed base64-data-URI image input was flatly unsupported (URL only). All three would have either failed loudly (wasted a cycle) or, worse, silently used a wrong default. Re-fetch the specific model's doc page for field names/schema immediately before first use, every time.

**File upload** (for feeding a locally-generated/extracted image into a remote model): `POST /api/v3/media/upload/binary`, multipart field `file`, response `data.download_url`. Retained ~7 days.

**A CLI and MCP server both exist** (`npm install -g @wavespeed/cli`; `pipx install wavespeed-mcp`) but for a scripted batch job, direct curl in a bash script is simplest — CLI/MCP earn their keep for interactive/agentic use, not one-shot pipelines.

## 3. The core gotcha: image-to-video models anchor the SCENE to the input image

This is the mistake that cost a full redo. Confirmed across three different wavespeed image-to-video models (not one vendor's quirk) via their own docs: the `image` input is described as "the foundation," and the `prompt` only steers **motion, camera, performance** — not content. Feeding a model an image of Scene A and a prompt describing Scene B does not transition to Scene B. It just re-animates Scene A with Scene-B-flavored motion.

**Practical consequence:** if you want the "seed the next shot from the previous shot's last frame" technique for pixel-continuity between shots, it only produces good results when consecutive shots are meant to be the **same continuous scene**. For shots that are meant to be genuinely different scenes/settings (most storyboards — a launch video is rarely one unbroken take), naive frame-chaining silently locks every downstream shot to the first shot's content, no matter how different the prompts are. You will not get an error; you'll get four shots that all look like the first one.

**The fix — a two-step pipeline, not a single call:**

```
seed frame (last frame of prior shot)
  -> image-EDIT model (not image-to-video): transforms the frame into the
     NEW scene while preserving palette/character/style continuity
  -> image-to-video model: animates the now-already-correct starting frame
```

`wavespeed-ai/flux-kontext-pro` is the image-edit half of this pipeline ($0.04/run, documented "robust consistency... minimal visual drift" across successive edits, plus real typography support). This gave both the continuity feel and actual scene progression on the first real attempt, after the single-step chained approach produced four visually-static "the same shot with minor variation" clips.

If continuity between genuinely different scenes doesn't matter to you, the simpler and cheaper alternative is: skip frame-chaining entirely, generate each shot independently from its own fresh text-to-image prompt, and rely on the shared Visual Theme language (§1) plus cut editing for the sense of flow. Frame-chaining is a deliberate choice with a real cost (an extra edit-model call per chained shot), not a default to reach for.

**Later-session caveat**: even the edit-model version of chaining drifts the *character* over successive edits — face, age, and outfit are visibly different by the third edit, worse after an insert shot of an object. For character consistency across a whole video the §9 hero anchor (every shot edited from ONE reference image, never from the previous shot) replaced chaining as the default. Chaining remains the right tool only for pixel-continuity inside one continuous scene.

## 4. On-screen text and brand logos: do not generate them, composite them

This is the same finding as `high-fidelity-ui-image-gen`'s §5, and it holds just as hard for video: **brand logos are essentially always hallucinated, and multi-word or precise text (a CLI command, a label with a specific spelling) is unreliable even with a text-specialized model and even across repeated retries of the identical prompt.** A same-prompt retry can produce a *worse* result than the first draw — this is genuine model variance, not something retries reliably fix. (Practical side-note: wavespeed keeps completed prediction outputs on its CDN for a while, so if a retry comes out worse, re-download the previous result by URL from your own logs — no need to regenerate to get back what you had.)

If a shot's whole point rests on legible text or an exact logo (a CLI command being typed, a product's own logo, a specific label), do not ask the video-generation model to render it. Composite it instead:

- Render the real logo (actual SVG, not a hallucinated approximation) and the real text as an HTML/CSS overlay (Hyperframes, or any headless-browser-to-image/video pipeline) — the same reliable technique used for a "screen recording" style shot.
- Either use that composited layer as a full shot on its own (a clean, crisp beat, deliberately different in register from the generated-cartoon shots — see the style-shift note in §1), or overlay it on top of/matted into a generated background if you need the exact typography sitting inside a generated scene.
- Reserve the generative image/video models for what they're actually good at: atmosphere, character motion, camera movement, mood — not precise text or exact brand marks.

## 5. Assembly (ffmpeg) gotchas

- **Video timebase mismatch feeding `xfade`**: concat's output timebase and a per-shot `fps`-normalized input's timebase can disagree, producing a "First input link main timebase... do not match" error. Fix: `settb=AVTB` on both branches feeding into `xfade`.
- **Audio is easy to silently drop.** If some shots have native audio (e.g. a video model's synced SFX) and others don't (e.g. a Hyperframes HTML render with no audio track at all), a `filter_complex` that only maps `[vout]` drops ALL audio, including the paid-for SFX, with no error. Check `ffprobe -show_entries stream=codec_type` per source file before assembling; silent-fill any audio-less input with `anullsrc` trimmed to that shot's real duration so the concat/crossfade timing lines up.
- **Layering a background music bed under per-shot SFX**: generate/obtain the music separately, loop+trim it to the final total duration (`aloop=loop=-1:size=<large>,atrim=duration=<total>`), attenuate it several dB under the SFX mix (`volume=-14dB` is a reasonable starting duck), then `amix` it against the concatenated per-shot audio.

## 6. The fidelity ladder — four review passes before the final render

Don't jump straight from storyboard to full-quality generation. Each rung is cheap to produce and catches a different class of mistake before it's expensive to fix:

| Rung | What it is | Cost | Catches |
|---|---|---|---|
| **1. Wireframe HTML** | Placeholder color-block cards per shot, real prompt/purpose/audio text, no generated media at all | $0 | Wrong creative direction, wrong narrative structure, missing visual-theme lock across variations (§1) |
| **2. Cheap stills** | Real text-to-image output per shot (cheapest T2I model), swapped in for the wireframe placeholders | ~$0.04-0.09/shot | Whether the *visual concept* actually reads (composition, character design, palette) before paying for motion |
| **3. Cheap draft video** | Cheapest image-to-video model, lowest resolution/duration, animating the stills from rung 2 (no frame-chaining needed at this rung — independent per-shot drafts are fine) | ~$0.25/shot | Pacing, whether the motion/camera direction reads, whether the story flows shot-to-shot as an actual sequence |
| **4. Full-fidelity final** | The real pipeline for the *chosen* concept only: proper model tier, frame-chaining + image-edit continuity fix (§3) where it matters, full resolution/duration, native audio, music bed, real assembly | ~$5-10 total | Nothing left to catch — this is the deliverable |

Only advance a concept to the next rung once it's approved at the current one. Running 4 tonal variations through rungs 1-3 (wireframe → stills → draft video, all four) costs a few dollars total; running all 4 through rung 4 (full pipeline) would cost 4x the final budget for 3 concepts you don't ship. Pick the winner at rung 3, then spend rung-4 money on that one only.

**Delegating rung-1/2 prototyping to a sandboxed CLI agent (gemini, similar tools): it cannot read files outside its own working directory**, even given an absolute path — it'll error "path not in workspace" rather than silently failing. If a task needs an existing reference file (a prior shot's HTML to match style, a prompt manifest from a different project folder), copy the reference into the agent's working directory first, or paste the reference content directly into the prompt — don't rely on it reading a path outside where you launched it.

## 7. Cost discipline

A ~30s, 6-shot video with per-shot native audio and a separate music bed lands in the **$5-10 total** range on wavespeed (text-to-image ~$0.04-0.09/shot, image-to-video ~$0.56-0.84/5s depending on audio, image-edit ~$0.04/edit, music generation a few dollars flat). Cheap enough to iterate, expensive enough that "just retry it" isn't free — verify the actual API schema before submitting (§2) and confirm the storyboard/creative direction before generating (§1), rather than discovering a wrong assumption after several paid calls. Climb the fidelity ladder (§6) instead of jumping straight to full generation.

**Parallelize independent generation calls — don't loop them sequentially.** Stills/shots with no dependency on each other (no frame-chaining between them) are embarrassingly parallel: submitting 24 independent text-to-image calls one-at-a-time in a `for` loop turns a ~2-5 minute job into ~an hour of pure waiting for no benefit. `xargs -P <n>` (8-way concurrency worked fine against wavespeed with no rate-limit issues) turns the same batch into a few minutes. Only serialize calls that actually depend on each other's output (e.g. frame-chained shots where each depends on the previous shot's real last frame).

## 8. Whole-video native-app mimicry (zero AI-generation spend)

Some launch videos don't need any generated imagery at all — the entire concept IS a familiar app's UI (a note being typed, a chat thread, a notification), used as a meta framing device for the product pitch. For that case, skip wavespeed entirely and build the whole thing as one HyperFrames HTML/CSS/GSAP composition, rendered locally. $0 in generation API cost — the only spend is your own time.

**The pattern**, validated across two real executions (an Apple Notes-style ad for `slackclaw`, an iMessage-style ad for `offrouter`): a short, self-aware conversation/note that walks through the real pitch and lands a "wait, this is just an ad" / "yeah, but it's real" beat before cutting to the logo + tagline + URL. The joke works because the whole video *is* the UI it's mimicking — no generated footage to break the illusion, no hallucinated text (§4) since every character on screen is real HTML you wrote.

**Toolchain**: `npx hyperframes init <name> --example blank --non-interactive --resolution <preset>` scaffolds a project (reads `AGENTS.md` in the scaffolded dir for the full skill-router/command reference — it ships its own `/hyperframes`, `/product-launch-video`, `/general-video` slash-command skills for driving it agentically, but those require restarting the session before newly-installed project skills load, so hand-authoring the composition HTML directly against the documented `data-*`/GSAP conventions is the faster path mid-session).

**Hard rules the linter enforces** (`npx hyperframes lint`, or `npx hyperframes check` for the full runtime/layout/contrast pass):
- Every timed element needs `class="clip"` **plus** `data-start`/`data-duration`/`data-track-index` — omitting `class="clip"` is silently wrong (element visible for the whole composition) rather than an error, so always lint before assuming the timing works.
- **Elements meant to stay visible simultaneously (e.g. chat bubbles that accumulate on screen, not disappear) each need their own unique `data-track-index`.** The clip runtime models a track as an exclusive, non-overlapping range — like a traditional video-editing track — so two elements sharing a track number with overlapping `data-start`/`data-duration` windows fail `overlapping_clips_same_track`, even though visually you want them all on screen at once. Give each independently-timed element its own track number; z-ordering by track index rarely matters when elements are positioned via normal flex/flow layout rather than absolute stacking.
- Drive the actual show/hide *animation* yourself in the `window.__timelines[id]` GSAP timeline (fade/scale/spring-in per element) — the `class="clip"` mechanism only gates raw visibility at the data-start/data-duration boundary; it doesn't animate anything on its own.

**Workflow**: `lint` (fast, structural) → `check` (full: runtime errors, layout, motion, WCAG contrast — catches things lint can't, like actual illegible text) → `render --output <name>.mp4` → `snapshot . --at <comma-separated-seconds>` to pull a contact sheet of key frames for visual review before calling it done (`--describe` needs `GEMINI_API_KEY` for an AI critique pass; skip if unset, just eyeball the contact sheet yourself). `npx hyperframes doctor` up front confirms Chrome/ffmpeg are ready; `whisper-cpp`/local-TTS/local-music/Docker are optional and unneeded for a silent or simple-SFX cut.

A 15s square (1080×1080) composition with ~9 timed elements rendered in under 20 seconds locally — cheap enough to iterate on copy/timing directly rather than storyboard-then-generate.

## 9. Cinematic stills, and character consistency: the hero anchor

`bytedance/seedream-v4` (text-to-image) works well for cinematic frames — pass the dimensions as `size: "1920*1080"` (a `*` separator, not `x`).

For **character/palette consistency across shots**, do NOT frame-chain at the still level (edit shot N from shot N-1's output) — it **drifts**: face, age, and outfit are visibly different by shot 3, worse after an insert shot of an object. The fix that actually holds is a **hero anchor** — star topology instead of a chain:

1. Generate ONE hero character reference image, plain text-to-image: the character nailed down (face, hair, outfit, age) in a clean, neutral composition.
2. Generate EVERY shot as an image-conditioned EDIT of that SAME hero image — `wavespeed-ai/flux-kontext-max`, body `{"prompt": "<edit prompt>", "image": "<hero image url>"}` — never from the previous shot's output.
3. The edit prompt leads with an identity lock, then states only the delta: `the EXACT same woman from the reference image (identical face, hair, outfit, age), only change pose/action/camera: <new shot description>`.

Every shot references the hero directly, so there's no chain for drift to accumulate along. This is the still-image half of the §3 two-step pipeline: the edit model owns content/continuity, then image-to-video animates each still as usual. Far cheaper to iterate at the still level than to discover inconsistency after paying for motion.

## 10. Text-to-music: minimax/music-2.6 gotchas

- **`lyrics` is REQUIRED even for instrumental tracks** — pass `lyrics: "[instrumental]"` together with `is_instrumental: true`, or the request fails.
- **There is no duration parameter** — length is steered by the prompt text ("a 30-second ..."), not by a field.
- **Generating a batch (e.g. 6 tracks): write each submitted prediction `id` to a file keyed by track name immediately on submit.** A bash assoc-array bug (a reused/mutated key) can make every poll/download hit the same id — you get 6 identical files with no error anywhere. After download, verify with `md5` that the hashes are all distinct; identical hashes mean you downloaded one track N times, not that the model coincidentally repeated itself.

## 11. Rendering hand-built animated HTML to mp4 (puppeteer + ffmpeg)

For an animated-HTML "video" authored by hand (not HyperFrames, which renders itself — §8):

1. Record the animation with puppeteer: `page.screencast({ path: 'shot.webm' })`, let the timeline play for the N seconds the shot runs, then stop.
2. Mux in a music track, trimmed to the shot with a fade-out and a slight duck:

   `ffmpeg -y -i shot.webm -i music.mp3 -t 20 -af "afade=t=out:st=18:d=2,volume=0.8" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest out.mp4`

   (`-pix_fmt yuv420p` keeps picky players happy; `-shortest` trims any audio tail past the video.)
3. **Render each aspect ratio you ship — 16:9 (1920x1080) AND 9:16 (1080x1920) — as separate screencast runs at that viewport**, not one render cropped later: layout-driven animation does not survive a crop.

## 12. The iterative creative loop (generate variations, let the human pick)

From a real session building a whole suite of launch videos: one prompt → finished video is not how this goes. Nail it in stages, cheapest first, and at **each** stage generate **multiple variations** so the human picks fast instead of you guessing — with explicit human sign-off between stages:

1. **Vibe/feel + genre + hook/twist** — pitch a few concepts (a couple of lines each), human picks.
2. **Storyboard stills** — generate stills for the approved concept, human approves the look.
3. **SFD (cheap draft video)** — image-to-video lite animating the approved stills, human approves pacing/motion.
4. **Full render** — only now spend real money.

This is §6's fidelity ladder turned outward: the point of the cheap rungs isn't just catching mistakes early, it's giving the human cheap decision points. A human picking from 3 variations in two minutes beats you iterating solo for an hour on a guess.

- **Genre + twist per video.** For a suite, assign each video its own distinct genre + film framework + a twist — e.g. a radio host who sounds like he's calling a football game but is actually narrating a Claude terminal session: misdirection that pays off when the reveal lands. Keep the copy ELI5, no jargon, universal emotion (§1).
- **Anchor each variation on a POPULAR MOVIE's style, not on adjectives.** "Cinematic" or "moody" gives the model (and the human) nothing real to aim at. Copy a film instead — e.g. Stranger Things cozy-80s / Flashdance dance / Drive neon-noir / Amélie whimsical — each variation with its own storyline, each produced as a hero + ~4 shots, all shown in ONE HTML grid. The human picks a vibe in one glance instead of you guessing and re-guessing.
- **A good spot is a story, not a static character.** Real ACTION in every shot — dancing, tasting a spoon, opening the fridge — not a character standing in frame, plus a setting change: girl cooking → retro radio narrates → she reacts → wipes her hands → walks to her laptop. **Every shot a DIFFERENT camera angle**: wide/establishing, over-the-shoulder, top-down insert, low hero angle, profile, tracking, medium, close-up — avoid repetitive eyes-only super-closeups. More cuts, shorter shots (~2s each; a 30s spot is ~12-15 of them — §1), and **hard cuts, not fades/xfades** — they look un-seamless on generated footage. Per shot, generate the full-length clip (8s on Veo) and cut only its best ~2s beat; the rest is scrap by design.
- **Character/wardrobe consistency is the #1 failure mode.** Frame-chaining (a flux-kontext edit of the previous frame) **drifts** — face/age/outfit visibly change by shot 3, worse after an insert shot of an object. The fix that actually holds is the §9 hero anchor: ONE hero reference image, every shot an edit of THAT SAME image, identity lock in every prompt. Re-stating the exact wardrobe in each edit prompt ("the same woman in the SAME colorful teal-and-pink 80s crop top, same face") still helps as a second layer, but the anchor topology, not the wording, is what stops the drift.
- **Voice: cast it like a character.** `minimax/speech-2.6-hd` on wavespeed requires a `voice_id` and supports emotion + speed. Generate several voice_ids for the human to pick (`Sweet_Girl`, `Determined_Man`, etc.) rather than committing to one. Then shape it with ffmpeg filters for effect — an old-AM-radio / war-era sound: `highpass=f=350,lowpass=f=3200,acompressor,volume=4dB,aecho=0.6:0.4:5:0.25`.
- **Music is often unnecessary, or should move.** Fade it in only at the payoff; never a flat bed under the whole video.
- **Model picks (wavespeed):** stills `bytedance/seedream-v4`; character-consistency edits `wavespeed-ai/flux-kontext-max`; cheap draft motion `seedance-v1-lite-i2v-480p` (~5s clips); better motion `seedance-v1-pro-i2v-480p`; finals Kling or Veo 3 (§13); TTS `minimax/speech-2.6-hd`. Upload local stills via `POST /api/v3/media/upload/binary` (§2) with `curl -F` to get the image URL i2v/edit calls need — Node FormData drops sockets against this endpoint, curl doesn't.

## 13. Veo 3 via Vertex AI (Google native, synced audio)

Veo 3 is Google's own model — best quality of the lot, with **native synchronized audio** (SFX/dialogue generated with the picture). Access is through **Vertex AI on a personal GCP project**, not wavespeed.

- **Auth = ADC**: `GOOGLE_APPLICATION_CREDENTIALS` pointing at a personal application-default-credentials json; mint a token per call with `gcloud auth application-default print-access-token`.
- **Submit** — a long-running operation, so operation-name polling instead of wavespeed's prediction-id pattern (§2):

```
POST https://us-central1-aiplatform.googleapis.com/v1/projects/<PROJECT>/locations/us-central1/publishers/google/models/veo-3.0-fast-generate-001:predictLongRunning
{
  "instances": [{
    "prompt": "...",
    "image": { "bytesBase64Encoded": "...", "mimeType": "image/png" }
  }],
  "parameters": { "aspectRatio": "16:9", "durationSeconds": 8, "sampleCount": 1, "generateAudio": true }
}
-> returns an operation name
```

- **Poll**: POST the same model URL with `:fetchPredictOperation` and body `{"operationName": "<name>"}` until `done` is true; the video comes back inline at `response.videos[0].bytesBase64Encoded` — base64 mp4, decode to file. Clips are a fixed 8s.

**Always image-condition Veo.** Text-prompt-only Veo invents a random character per clip, throwing away the whole §9 hero anchor. Pass the nailed still as the `image` on every instance (note: inline base64 here, not a URL like wavespeed). Same anchoring rule as §3, applied at the video-model step: nail the storyboard and stills FIRST, then animate — never animate from text alone.

## 14. Prompt structure: the constraint sandwich

Video models want a **technical call sheet, not vibes** (practitioner consensus from r/generativeAI, confirmed in this session's iterations). Order each prompt as a sandwich:

1. **Subject Anchor** — who/what; with the identity lock when it's the recurring character (§9).
2. **Action + Camera** — exact framing plus movement vectors ("she crosses frame left-to-right, camera dollies back to wide"), not "dynamic camera".
3. **Optics + Lighting** — lens, film character, light direction and quality.

Per-model variations:

- **Kling** is physics-aware and wants Subject > Movement > Scene > Camera > Lighting.
- **Seedance** takes the start frame (and last frame, when the end pose matters) — keep the text prompt for pacing/sound only.

Two multipliers:

- **Lock a STYLE ANCHOR string**: one fixed sentence (palette, lens, lighting, grain) appended verbatim to EVERY prompt in the video, so independently-generated shots don't drift apart in look. This is the prompt-level enforcement of the §1 Visual Theme block.
- **Reverse-engineer looks you like with video-to-prompt tools**: feed a reference clip or frame in, get a structured prompt back, adapt it — faster and more faithful than describing a look from scratch.

## Cinematography control vocabulary (prompt EVERY shot with these)

Vibe words don't render; controls do. For each still and each Veo shot, specify explicit values across these axes (taxonomy from filmvibes.io) so text-to-image (hero), image-to-image (shots), and image-to-video (Veo) all get a real call sheet:

- **Shot size:** extreme close-up · close-up · medium · wide · extreme wide
- **Angle:** low angle · eye level · high angle · overhead
- **Camera move / transition:** static · roll L/R · truck L/R · arc L/R · track · dolly in/out · zoom in/out · pedestal up/down · tilt up/down · pan L/R · oner · teleport
- **Time of day:** day · night · golden hour · blue hour
- **Interior / exterior**
- **Look / additional:** cinematic shot · beauty commercial · film grain · natural light
- **Visual effect:** fisheye · double exposure · collage · pixel art · psychedelic
- **Media register:** commercial · music video · movie · **era** (23–25 / 20–22 / 16–19 / <16)

Per-shot prompt template: `{shot size} shot, {angle}, {camera move}: {subject + action}. {time of day}, {int/ext}, {look}. {STYLE ANCHOR}`. Vary the shot size + angle + move EVERY shot (no two the same in a row; avoid repetitive eyes-only ECUs).

## Reverse-engineer a reference with Gemini (video → style .md)

To match a real film/commercial look, don't guess — analyze it. Gemini 2.5 Flash reads video. Via Vertex on the personal project (ADC token as in the Veo section):
`POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`
body: `{contents:[{role:"user",parts:[{inlineData:{mimeType:"video/mp4",data:<base64, <~15MB inline>}},{text:"As a cinematographer, output structured markdown: vibe/tone, genre + reference films, color palette + grade, lighting, lens/DOF/format, shot list (type+angle+movement per beat), edit pacing, sound/music, emotional arc — specific enough to recreate."}]}]}`
Feed the resulting `.md` into the shot prompts + style anchor. Reference-still libraries to pull looks from: **filmvibes.io**, film-grab.com, shot.cafe, shotdeck.com, frameset.app.

## Validated pipeline: cinematic character video

This recipe survived ~9 iterations of real feedback before it held. Every step earns its place by fixing a specific failure a naive approach hits. Build it in this order.

**Architecture (per ~28s video, ~$2.4, ~7-8 min built parallel):**

1. **Hero + face reference (two `seedream-v4` text-to-image calls, parallel).** One wide hero for look/wardrobe; one *crisp front-facing headshot* used only as the face-swap reference later. The headshot is a much stronger identity anchor than a full-body frame.
2. **6 keyframes (`flux-kontext-max`, image-conditioned on the hero, parallel).** Each keyframe pins the character + set with a LOCK string and varies the camera: overhead insert, side dolly, three-quarter, profile CU, dutch wide, low OTS. Keep her eyeline *on her task, not the lens*, and keep her *mid-action* every frame (idle poses read as boring).
3. **5 chained clips (`kwaivgi/kling-v2.5-turbo-pro/image-to-video`, parallel).** Pass `image` = keyframe N and `last_image` = keyframe N+1 — Kling interpolates between the two. Because clip N's last frame **is** clip N+1's first frame, cuts are seamless with no teleport. `duration:5`, and a strong `negative_prompt` (see failure modes). This is the single biggest continuity fix.
4. **Identity lock (`wavespeed-ai/video-face-swap`, $0.01/s).** Swap the headshot face onto the finished silent cut in one pass. This is what finally kills the "morphs into different people" problem that keyframe-only locking cannot. Run it on the silent base video, *then* add audio.
5. **One unified color grade (ffmpeg `eq` + `colorbalance`)** across the whole video. Generated clips drift in color temperature; a single grade removes the "different room each shot" feel.
6. **Voice: `elevenlabs/eleven-v3`, NOT minimax.** minimax TTS reads as robotic and was the last "screams AI" tell. Eleven V3 with a named voice (e.g. `George`), `stability:0.3` for dynamic delivery, `use_speaker_boost:true`, and inline emotion tags (`[shouting]`, `[excited]`, `[warmly]`) for real energy. Generate one clip per beat and place each at its cut for narration sync.
7. **Audio bed: NO music.** A single continuous, near-silent room-tone (band-limited pink noise) under the voice reads as ambience; a synthwave track fights the voice and reads as two disjoint tracks. Mix with `amix=duration=longest` (using `duration=first` truncates the whole mix to line 1 — a real bug we hit).

**QC gate — critique with Gemini before shipping.** Feed the finished mp4 (base64 inline, <~15MB) to `gemini-2.5-flash:generateContent` on the personal Vertex project and ask a brutal editor for continuity / consistency / audio / motion notes. It reliably catches face drift, teleport cuts, out-of-sync VO, and prop-continuity errors a self-review misses. Iterate against it — but stop when the remaining notes are subjective ("hire a voice actor") rather than defects.

**Parallelize everything within a stage** (`Promise.all` over keyframes, clips, TTS lines). wavespeed runs jobs server-side, so submit-all-then-poll-all collapses wall-clock to the slowest single job. The Kling render (~3-4 min/clip) is the floor; real speedups past that trade quality (fewer beats, cheaper i2v, or dropping the face-swap all regress the result). To make many videos, run each video's whole pipeline as a concurrent process.

**Cost tiers, cheapest first:** all-`seedance-lite` i2v (~$2, softer, more drift) · **Kling first+last chain + face-swap (~$2.4, the sweet spot)** · all-Veo3-fast (~$42, native audio but per-clip audio clashes across cuts and it still drifts within a shot). The premium tier is not worth it here.

**Failure modes we hit:**
- *Duplicated stove/furniture mid-clip* = adjacent keyframes shot from opposite sides; Kling invents duplicates to bridge a big camera rotation. Keep the camera delta between adjacent keyframes small, and add `duplicated objects, ghosting, double image, cloned furniture` to `negative_prompt`.
- *Prop continuity* — track props across beats (a plate she plates food onto shouldn't reappear at the laptop). Design the beat list so props are resolved before the scene changes.
- *Character stares into the lens / stands idle* — prompt eyeline on-task and an action verb every keyframe.
- *GPT-image-2 (via codex) or Gemini omni* are worth reaching for when a shot needs *legible text/UI* (a laptop screen, a CTA card) — flux/seedream fumble letters.

## Video-type style archetypes + hard tool ceilings

Give each launch video its OWN genre so a set of them doesn't blur together. Two archetypes that tested well:

- **Comedy / character-narration.** A single character in a warm, well-lit setting; an in-world device (a radio, a screen) narrates the user's session in an unexpected register (e.g. a sportscaster calling their work), building to a twist reveal. Warm practical lighting, film grain, one setting, simple wardrobe, expressive but not fine-motor action. Voice: an expressive TTS in-character. Holds together because it plays to the tools' strengths (see the consistency ceiling below).
- **Fast-cut montage (Requiem-for-a-Dream style).** Dramatize a tiny, mundane action as world-shaking chaos (breaking-news anchor, hurricane, explosions, riots, disasters) intercut with the real mundane beats of the task, escalating to a frenzy, then a HARD DROP to black + a deadpan punchline that reveals how small the thing actually was. Genre-hop the styles (50s cartoon, anime, claymation, VHS, silent film) for chaotic energy. Cheap and robust — see why below.

### The character-consistency ceiling (learned the hard way, ~6 noir attempts)

A single photoreal human held across many shots is the hardest thing for these tools. It ONLY holds when ALL of these are true:
- **Faces are LIT.** Dark low-key/noir lighting starves `video-face-swap` — it can't lock a shadowed face → drift. Keep a motivated key on her face even in moody scenes.
- **NO hand / finger close-ups.** Fingers-on-keyboard morph every time ("unsalvageable"). Show faces/bodies/wide action, not fine hand work.
- **Simple, distinctive wardrobe** (a bold crop top locks; an intricate sparkly dress drifts).
- Pipeline is the proven one: one hero → flux-kontext keyframes (image-conditioned) → **Kling first+last chaining** → **face-swap**. Independent per-clip generation (incl. Grok reference-to-video) drifts — the shared boundary frames of first+last chaining are what buy continuity.

**If the concept needs dark/hands/heavy-action → don't fight it: use a MONTAGE.** A rapid-cut montage of many DIFFERENT scenes has no single character to hold, so consistency stops mattering — a chaotic/action concept should become a montage rather than fighting the tools for a consistent lead. Montage recipe: ~30 short (0.3–0.5s) `seedance-v1-lite-i2v-480p` clips from `seedream` stills, **hard jump cuts** (no zoompan/Ken-Burns corner zoom — reads cheap), escalating pace, mixed film styles, cue-timed boom/whoosh SFX, and a hard silence-drop into the punchline.

### Model notes (which to reach for)
- **seedream-v4 + flux-kontext-max** = the reliable photoreal + consistent base. Default.
- **Chroma** (`wavespeed-ai/chroma`) = uncensored (spicy wording OK) but **cartoonish/stylized** — do NOT use when you need photoreal.
- **Grok** (`x-ai/grok-2-image`, `x-ai/grok-imagine-video/reference-to-video`) = photoreal + permissive, but reference-to-video makes INDEPENDENT clips → identity drifts across cuts; also may skew older/uninteresting. Not a consistency solution.
- Spicier-but-photoreal without a permissive model: describe revealing WARDROBE ("plunging neckline, high slit, bare shoulders") rather than trigger words ("sexy/revealing"), which seedream refuses. Civitai LoRA via `flux-dev-lora-ultra-fast` is the next lever if needed.
- **Upscale** final with `wavespeed-ai/video-upscaler` ($0.025) — the base i2v is soft; upscale is the crispness pass (do it LAST, only on an approved cut).

### Audio gotcha
`minimax/music-2.6` **sings whatever is in the `lyrics` field** — putting style descriptors there makes it literally sing "hip hop montage escalating tension." For an instrumental bed, put descriptors in `prompt` and set `lyrics` to wordless vocables (e.g. an epic choir "Ooooh, aaaah") — which also gives a nice choral energy — never real descriptor words.

### Ethics
Use figure **archetypes** (a hoodie founder on a keynote stage, a suit CEO) — never fabricate a NAMED real person (e.g. a specific CEO) doing something. That's a deepfake/impersonation; same vibe achievable with an unnamed archetype.

### QC
Gemini-2.5-flash critique is great for the single-character pieces, but it wrongly dings a **montage** for "no continuity / disconnected clips" — that IS the montage style. Judge montages on energy/rhythm/gag, not continuity.
