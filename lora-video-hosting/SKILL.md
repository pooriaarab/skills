# LoRA Video Training & Hosting — Skill

> Generic pattern for synthetic video LoRAs. No explicit content. Use for wellness / character video.

## 1. Training

- **Base:** Wan 2.4-14B (24GB) or Wan 2.2-T2V-A14B. Fits single RTX 4090. Use spot $0.30/hr Vast or Ubicloud managed.
- **LoRA type:** DreamBooth-style video LoRA. Civitai `types=LORA&baseModels=Wan Video 14B t2v`, `sort=Most Downloaded`.
- **Dataset:** 15–30 short clips (3–5s each), captioned. Curate via Civitai collections API (`/api/v1/collections/{id}`) or manual picks. Top LoRAs: Detail enhancer, FusionX, 360 rotation — all generic.
- **Train call:** `api.minimax.chat/v1/video_generation` or `vast clone Wan` + `accelerate launch train_lora.py --base Wan-AI/Wan2.4-14B --lora_rank 32 --learning_rate 1e-4`
- **Checkpoint:** Save as `lora-{category}-{id}.safetensors` to R2 `loras/`.

## 2. Hosting

- **GPU:** RTX 4090D 24GB ($0.11 spot) or 4090 $0.30 flat. Ubicloud alternative: managed K8s with same image `vastai/pytorch:2.6.0-cuda12.1-py310`.
- **Endpoint:** `http://<vast-ip>:8000/v1/video` — local fallback `HF_TOKEN` via `https://router.huggingface.co/hf-inference`.
- **Secrets:** Keep in `.dev.vars` (wrangler reads it) + mirror to `~/.config/personal-os/secrets.env`. Keys: `HF_TOKEN`, `CIVITAI_API_KEY`, `VAST_API_KEY`, `UBICLOUD_API_KEY`. Never commit.
- **Cache:** Civitai LoRAs cached 5m to `/tmp/civitai-loras.json`. KV `FLAGS` for feature gates, D1 `videos` table for status.

## 3. Scene → Poster

- **Scene:** 60s episode = 4–6 shots (8–10s each) concatenated via ffmpeg. Prompt: `cinematic, character, soft lighting, 720x1280 vertical`.
- **Poster:** Extract first frame at 1.2s via `ffmpeg -ss 1.2 -i scene.mp4 -vframes 1 -s 720x1280 poster.jpg`. Store `posterUrl` in D1 `episodes.posterUrl`, `videoUrl` points to R2 `videos/{series}/{episode}.mp4`.
- **Checkpoints:** CP1 schema, CP2 poster pipeline, CP3 UI grid/modal.

## 4. Common Pitfalls

- `.open-next/worker.js` 2.2K stub — run `./node_modules/.bin/opennextjs-cloudflare build` from `apps/web`, then `mv .open-next ../../.open-next` before `wrangler dev --local --port 8788`.
- `next dev` has no D1/R2 bindings — use `wrangler dev` for feed, or detach via `start_new_session` to keep 8788 alive.
- `CIVITAI_API_KEY` missing in `apps/web/.dev.vars` → empty LoRA list. Copy from root.

---
Source: veilwick synthetic wellness feed + livestream (Next15 + OpenNext + CF Workers). See `apps/web/src/lib/wan.ts`, `civitai.ts`, `vast.ts`.
