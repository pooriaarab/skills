---
name: launch-video-generation
description: "Plan and generate a short (20-60s) AI-assisted launch/announcement video from a real product: a storyboard framework, wavespeed.ai API facts (submit-then-poll, image-to-video model behavior, pricing), and the hard-won fix for scene transitions and on-screen text/logos. Model-agnostic where possible, wavespeed.ai-specific where noted."
---

# launch-video-generation

Empirical, from building a real launch video (slackclaw) end to end: storyboard → generation → assembly → a redo after the first cut's on-screen text and scene transitions came out wrong.

## 1. Storyboard first, always

Don't jump to generating clips. Structure the video as a shot list before writing a single generation prompt:

- **Duration → shot count**: ~5s per shot is the sweet spot most image-to-video models render at. A 30s video is ~6 shots.
- **Narrative arc — use a real copywriting framework, not a vague tone label.** "Make it punchy" or "make it funny" describes a *feel*, not a *structure*, and a structure is what actually gets built correctly on the first pass. Two frameworks that map directly onto a shot list:
  - **PAS (Problem → Agitate → Solution)**: 1-2 shots stating the real problem, 2-3 shots making its cost vivid/painful, 2-3 shots resolving it with the actual product and real proof (numbers, not adjectives). Label each shot with its stage so the structure is checkable at a glance.
  - **JTBD (Jobs To Be Done)**: ground the "problem" stage in the actual job the audience is hiring the product to do, stated as a real observed pain, not a category description. A product with more than one real user (e.g. a human user *and* an AI agent consuming the same tool) can have two parallel JTBD angles worth blending in the same PROBLEM shot — this reads as sharper and more specific than either alone.
  - Hook → Build → Payoff → CTA is the lighter-weight version of the same idea when the video doesn't need a hard "problem" framing (e.g. a pure feature reveal).
- **A shared Visual Theme block, written before any shot**: color palette, lighting style, lens/film character, motion language. Every shot's prompt must restate this. This is what makes six separately-generated clips read as one intentional piece instead of six disconnected clips — visual consistency across shots matters more than any single shot being gorgeous.
- **Style-shifts are fine if deliberate**: a cold-open in a different visual register (e.g. a meta screen-recording hook) cutting into a stylized body is a real technique, not an inconsistency, as long as each register is internally consistent.
- **When generating multiple narrative/tone variations (punchy vs. funny vs. controversial, etc.), lock the visual world explicitly in the brief.** A delegate given "write N tonal variations, match the reference storyboard's format" will readily vary the *visual concept* along with the tone — new settings, new metaphors, a completely different look per variation — because nothing told it the visual language was fixed. State it as a hard constraint: "every variation reuses the exact same Visual Theme block(s), varies only the narrative/joke/angle within them." Otherwise you get N unrelated ideas, not N takes on one idea.
- Per shot, write: composition/camera framing, lighting, subject, action, and a complete 40-80 word cinematic prompt ending in a technical spec line (duration, aspect ratio, "cinematic 1080p, synchronized audio" or equivalent).
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
