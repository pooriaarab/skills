---
name: launch-video-generation
description: "Plan and generate a short (20-60s) AI-assisted launch/announcement video from a real product: a storyboard framework, wavespeed.ai API facts (submit-then-poll, image-to-video model behavior, pricing), and the hard-won fix for scene transitions and on-screen text/logos. Model-agnostic where possible, wavespeed.ai-specific where noted."
---

# launch-video-generation

Empirical, from building a real launch video (slackclaw) end to end: storyboard → generation → assembly → a redo after the first cut's on-screen text and scene transitions came out wrong.

## 1. Storyboard first, always

Don't jump to generating clips. Structure the video as a shot list before writing a single generation prompt:

- **Duration → shot count**: ~5s per shot is the sweet spot most image-to-video models render at. A 30s video is ~6 shots.
- **Narrative arc**: Hook → Build → Payoff → CTA (or Problem → Solution → Proof → CTA). Each shot gets a one-line "purpose" label.
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

## 6. Cost discipline

A ~30s, 6-shot video with per-shot native audio and a separate music bed lands in the **$5-10 total** range on wavespeed (text-to-image ~$0.04-0.09/shot, image-to-video ~$0.56-0.84/5s depending on audio, image-edit ~$0.04/edit, music generation a few dollars flat). Cheap enough to iterate, expensive enough that "just retry it" isn't free — verify the actual API schema before submitting (§2) and confirm the storyboard/creative direction before generating (§1), rather than discovering a wrong assumption after several paid calls.

Two cheap steps before spending on real generation:

- **Wireframe the storyboard as static HTML first.** Before any paid API call, mock up each shot as a placeholder card (icon/color-block standing in for the real visual, plus the shot's purpose/prompt/audio text) in a single self-contained HTML file. Reviewing 4 tonal variations (e.g. punchy/controversial/funny/viral) this way costs nothing and catches a wrong creative direction before it costs anything.
- **Parallelize independent generation calls — don't loop them sequentially.** Stills/shots with no dependency on each other (no frame-chaining between them) are embarrassingly parallel: submitting 24 independent text-to-image calls one-at-a-time in a `for` loop turns a ~2-5 minute job into ~an hour of pure waiting for no benefit. `xargs -P <n>` (8-way concurrency worked fine against wavespeed with no rate-limit issues) turns the same batch into a few minutes. Only serialize calls that actually depend on each other's output (e.g. frame-chained shots where each depends on the previous shot's real last frame).
- **Generate drafts at lower resolution/duration first.** Most models' pricing scales with resolution (e.g. 1080p at ~5x the base 480p rate) — run the composition/scene-transition review pass at the cheapest tier the model offers, and only re-run the final chosen shots at full quality once the concept and transitions are confirmed to work.
