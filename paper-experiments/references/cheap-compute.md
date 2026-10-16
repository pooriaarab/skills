# Cheap, honest LLM evaluation compute for one independent author

Research date: 2026-10-16 (October 2026). Method: official pages opened with WebFetch, `curl`, and the OpenRouter catalog tool. No sign-up, no payment, no API call that costs money, no credential used.

Read this first:

- "UNVERIFIED" means I did not open an official page that shows the value. Do not plan on it.
- WebFetch returns a summary written by a small model, not raw text. Where I saw raw text, the table says RAW (Anthropic pricing page, Fireworks terms PDF, NVIDIA trial terms PDF, Cloudflare terms, OpenRouter live catalog, Kimi/DeepInfra/Z.ai/HF terms through curl). Re-check any number that decides a purchase.
- Source keys like [S3] map to URLs in the last section. Every source was opened on 2026-10-16 unless the table says otherwise.
- Token assumption: 2,000 tokens in plus 2,000 tokens out per task unless stated. Reasoning models can emit several times more output. A sensitivity column covers this.
- The author's machine (checked with `sysctl`): Apple M3 Pro, 36 GiB memory. Ollama and llama-server (build 10809) are installed.

## 0. Summary of findings

1. Three providers that sell fast open-model inference forbid benchmarking in their terms: Cerebras, Together AI, Fireworks. Do not publish scores from them without written permission. See section E.
2. Cloudflare allows benchmarking if you publish everything needed to replicate it. That is the cleanest hosted rule found.
3. Free hosted tiers are too small for study 1. OpenRouter free gives 50 requests per day below 10 purchased credits. Groq and SambaNova free are smaller still. Free-only is a local-model plan plus a few hosted models.
4. Paid batch pricing makes study 1 cheap. Full design (52,800 calls) costs about 194 USD in model fees with 6 paid models. Study 2 costs 4 to 27 USD.
5. No institutional credit program accepts an unaffiliated author, except possibly the Anthropic External Researcher Access program (safety and alignment topics, no institution stated) and the OpenAI Researcher Access Program (conflicting text, see D).
6. Models change under you. Several prices and free models in this research end or change between now and 2027. Pin dates and ids.

## A. Free API tiers and free models

Columns: limits as shown on the official page; "Benchmark and publish" is what the provider terms say (details and quotes in E).

| Provider | Free offer and limits (2026-10-16) | Models | Data and training | Benchmark and publish | Usable for study 1? | Source |
|---|---|---|---|---|---|---|
| OpenRouter free models | Ids ending `:free`. 20 requests per minute. 50 per day if you bought under 10 credits. 1,000 per day if you bought at least 10 credits. Extra keys or accounts do not raise limits. 402 if balance is negative. | 15 free chat models in the live catalog, e.g. nvidia/nemotron-3-ultra-550b-a55b:free (1M context), thinkingmachines/inkling:free, google/gemma-4-31b-it:free, google/gemma-4-26b-a4b-it:free. Full list in section F. | Terms: some models "may store or train on your Inputs" (per model). Catalog notes say Poolside and Liquid free models may train on prompts. Prompt logging is off by default. | OpenRouter terms have no benchmarking clause. They restrict red teaming. Output rights follow each model's terms. | Only with 10 purchased credits (1,000 per day). Otherwise 50 per day. | [S1] [S2] [S3] [S4] |
| Google Gemini API free tier | Pricing page marks "Free tier: Yes" for Gemini 3.5 Flash-Lite, 3.5 Flash, 3.6 Flash, 3.1 Flash-Lite, 2.5 Pro, 2.5 Flash, Gemma 4. Not free: Gemini 4 Argon, 3.1 Pro Preview. Exact RPM, TPM, RPD are only in the AI Studio dashboard, not on the docs page. | Same list | Free tier: Google uses prompts and responses to improve products, and human reviewers may read them. Paid tier: not used. | Terms: no benchmarking clause found. "You may not use the Services to develop models that compete with the Services." | Limits UNVERIFIED for October 2026. An older cached official table (2.5 Flash-Lite) showed 15 RPM, 250,000 TPM, 1,000 RPD. Do not assume it applies to 3.5. | [S5] [S6] [S7] |
| Cerebras free trial | gpt-oss-120b and qwen-3.8-27b: 5 RPM, 30K uncached TPM, 90K total TPM, 1M tokens per hour, 1M per day. Pricing page: a one-time 5 USD promo credit that expires 30 days after activation. | gpt-oss-120b, qwen-3.8-27b | Cerebras may not train on Service Content. | Terms bar use "for benchmarking or competitive analysis of the Service". | NO for published results. | [S8] [S9] |
| Groq | Table on the page (labelled base limits, plan label unclear): gpt-oss-120b, gpt-oss-20b, qwen3.8-27b: 30 RPM, 1,000 RPD, 8,000 TPM, 200,000 TPD. Cached tokens do not count. | gpt-oss-120b, gpt-oss-20b, qwen3.8-27b | Not read (UNVERIFIED) | Services Agreement (last modified 2026-06-22): the word "benchmark" does not appear. Section 6.3(e) bars use to "develop or improve" competing products. | Free plan values UNVERIFIED. If they apply, 200K TPD is 50 calls per day at 4K tokens. | [S10] [S11] |
| GitHub Models | Retired 2026-07-30. | none | n/a | n/a | No | [S12] |
| Cloudflare Workers AI | 10,000 Neurons per day free, reset 00:00 UTC. Then 0.011 USD per 1,000 Neurons. Text generation: 300 requests per minute on default models. 20 per minute on paid-plan models. | gpt-oss-20b, gemma-4-26b-a4b-it, qwen3-30b-a3b-fp8, llama-3.2 1B and 3B, granite-4.0-h-micro | UNVERIFIED | Self-serve Subscription Agreement 2.2.2 allows benchmark tests, with a replication disclosure duty (E). | About 110 calls per day on gpt-oss-20b (derived: 18,182 Neurons per M input, 27,273 per M output; 2k+2k call = 90.9 Neurons). Too small. Fine as one extra model. | [S13] [S14] [S15] |
| Hugging Face Inference Providers | Free users: no monthly credits. PRO: 2.00 USD per month. Team or Enterprise: 2.00 USD per seat. Provider pass-through prices, no markup. | many | UNVERIFIED | HF terms contain no benchmarking clause (only the word as a Hub feature). | No free allowance | [S16] [S17] |
| Mistral La Plateforme (Experiment) | Official limits page returned 404. Help center says limits are requests per second, tokens per minute, and tokens per month, shown only in the AI Studio Limits page. Third-party trackers give 1 request per second, 500K TPM, 1B tokens per month. Phone verification reported. | UNVERIFIED | Free-tier training opt-in reported only by one third-party site. UNVERIFIED. | UNVERIFIED (legal page text not read) | UNVERIFIED | [S18] |
| NVIDIA build.nvidia.com | Site says "Free inference with leading models" (nemotron-3.5-super-vl, nemotron-3.5-lightning, deepseek-v4.1-flash, nemotron-3-ultra). Limit: community reports 40 RPM, UNVERIFIED. | as listed | n/a | API Trial Terms (RAW): trial "for internal testing and evaluation purposes, not in production". No use of Generated Content to "develop or improve products or services that compete". No benchmark clause. Publishing scores is not addressed: ask NVIDIA first. | Maybe, with the publishing doubt | [S19] [S20] |
| SambaNova | Free tier, no card: 20 RPM, 20 requests per day, 200,000 tokens per day per model. Models: DeepSeek-V3.1, Llama-3.3-70B, gpt-oss-120b, DeepSeek-V3.2 (preview), gemma-4-31B-it (preview). Developer tier (card linked): 20M tokens per day across all models. | as listed | UNVERIFIED (terms URL 404) | UNVERIFIED | NO. 20 per day is 99 days for 1,980 calls. | [S21] |
| Together AI | Credits page does not list free credits (UNVERIFIED). Rate-limit page lists no tiers. | many | ZDR setting exists. Non-ZDR handling not stated. | Terms 4.3(c) bar "competitive analysis or benchmarking" (page updated 2026-05-19). | NO for published results | [S22] [S23] [S24] |
| Fireworks | No payment method: 10 RPM. With card and credits: up to 6,000 RPM. No free credits mentioned. | many | Zero Data Retention clause 3.6 | Terms (RAW, last updated 2026-07-10) bar use "for benchmarking or competitive analysis of the Service". | NO for published results | [S25] [S26] |
| DeepInfra | No free credits listed. Card or prepay required. 200 concurrent requests. Flex tier 0.8x price. | many | UNVERIFIED | Terms (RAW): no "benchmark" string. Bars use "competitive with any business of Provider". | Paid only | [S27] [S28] |
| Chutes | Plans 10 and 20 USD per month. Page lists no free tier. | many | UNVERIFIED | UNVERIFIED | Paid only | [S29] |
| Kluster | Inference, fine-tuning, and dedicated deployments ended 2025-07-24 per a search result of kluster.ai blog. Site did not resolve from this machine. | none | n/a | n/a | No (secondary source only) | [S30] |
| Z.ai | Free models: GLM-4.7-Flash, GLM-4.5-Flash, GLM-4.6V-Flash (0 USD). Limits page 404: UNVERIFIED. | GLM family | UNVERIFIED | Terms (RAW): no "benchmark" string. Bars use that would "develop, train, or enhance" competing models. | Maybe. Limits UNVERIFIED | [S31] [S32] |
| Moonshot / Kimi | No free credits on page. Tier0 (1 USD recharge): 1 concurrent, 3 RPM, 500K TPM, 1.5M TPD. Tier1 (10 USD): 15 concurrent, 100 RPM, 2M TPM, unlimited TPD. Vouchers do not count. | kimi-k2.6, kimi-k2.7-code, kimi-k3 | UNVERIFIED | Terms (RAW, last updated 2026-07-30): no "benchmark" string. Bars apps or models with "potential competitive possibilities" without authorization. | Paid only | [S33] [S34] [S35] |
| DeepSeek | No free allowance on the pricing or rate-limit page. Concurrency: 2,500 (deepseek-flash), 500 (deepseek-v4-pro). | deepseek-flash, deepseek-v4-pro | Terms 4.2(3): inputs and outputs may be used for "training other models" by you. Privacy policy separate. | Terms: no benchmarking clause. You must "clearly disclose" that output is AI generated (8.1). | Paid only | [S36] [S37] [S38] |
| Alibaba Qwen (Model Studio) | 1 million free tokens per model, Singapore region only, valid 90 days from activation. No free quota in other regions. | qwen3.8-max, qwen-max, qwen3.7-plus, qwen3.8-flash, qwen-flash | UNVERIFIED | UNVERIFIED | Small bonus only | [S39] |
| xAI | No free credits shown on the pages opened. Tier 0 limits: grok-4.7 150 RPS and 50M TPM, grok-4.3 37 RPS and 10M TPM. | grok-4.7, 4.6, 4.5, 4.3 | UNVERIFIED | Terms pages returned 403: UNVERIFIED | Paid only | [S40] [S41] |

OpenRouter prices for paid variants have no platform request cap. Use the paid variant when a free model is too slow. [S1]

## B. Cheap paid options

### B1. Price per million tokens, cheapest capable models (USD)

| Model | Input | Cached input | Output | Batch (in / out) | Source |
|---|---|---|---|---|---|
| Claude Haiku 5.5 (prompts up to 100K) | 0.10 | 0.01 | 0.50 | 0.05 / 0.25 | [S42] RAW |
| OpenAI gpt-5-nano | 0.05 | 0.005 | 0.40 | 0.025 / 0.20 | [S43] |
| OpenAI gpt-6-luna | 0.10 | 0.01 | 0.50 | not stated | [S43] |
| DeepSeek V4.1 Flash (`deepseek-flash`), peak | 0.30 | 0.006 | 1.20 | none, but off-peak is half: 0.15 / 0.003 / 0.60 | [S36] |
| Gemini 3.5 Flash-Lite | 0.30 | 0.03 plus 1.00 per hour storage | 2.50 | 0.15 / 1.25 | [S6] |
| Gemini 3.1 Flash-Lite | 0.25 | 0.025 | 1.50 | 0.125 / 0.75 | [S6] |
| Gemini 2.5 Flash-Lite | 0.10 | 0.01 | 0.40 | 0.05 / 0.20 | [S6] |
| gpt-oss-120B on Together | 0.15 | n/a | 0.60 | no discount listed for chat models (only whisper-large-v3 at 50%) | [S22] [S44] |
| gpt-oss-20b on Cloudflare | 0.20 | n/a | 0.30 | n/a | [S13] |
| Llama-3.3-70B-Instruct-Turbo on DeepInfra | 0.10 | n/a | 0.32 | Flex 0.8x | [S27] |
| Qwen3.8-Flash on Alibaba (Singapore) | 0.15 | n/a | 0.47 | 50% on some models; Qwen3.8-Flash not listed | [S39] |
| GLM-5.3-Flash (Z.ai) | 0.15 | 0.03 | 0.50 | n/a | [S31] |
| Grok 4.3 (xAI) | 1.25 | 0.20 | 2.50 | n/a | [S40] |
| Kimi K2.6 | 0.95 miss | 0.16 | 4.00 | n/a | [S33] |
| Claude Sonnet 5.5 | 2.00 | 0.10 | 10.00 | 1.00 / 5.00 | [S42] RAW |
| GPT-6.1 Sol | 2.00 | 0.10 | 10.00 | 1.00 / 5.00 | [S43] |
| Claude Opus 5.5 | 4.00 | 0.20 | 20.00 | 2.00 / 10.00 | [S42] RAW |
| Claude Fable 5.1 | 10.00 | 0.25 | 50.00 | 5.00 / 25.00 | [S42] RAW |

Batch and cache rules:

- Anthropic Message Batches: 50% off input and output. Batch and caching discounts combine. Start tier batch queue: 200,000 requests, 100,000 per batch. [S42] [S45]
- OpenAI Batch and Flex: about 50% of standard. Cache reads are 0.1x (0.05x for GPT-6.1 Sol). A prefix needs at least 1,024 tokens to cache on GPT-5.6 and later. [S43] [S46]
- Gemini Batch: 50% of standard on listed models. [S6]
- Together batch: page says "up to 50%", but only one audio model shows the discount. [S44]
- DeepSeek off-peak: half price. Peak hours are 01:00 to 04:00 and 06:00 to 10:00 UTC, Monday to Friday, except Chinese public holidays. [S36]
- Mistral: batch cuts price 50% and cached input "up to 90%" (marketing page; small-model prices not listed). [S47]
- Alibaba: batch is 50% for qwen-max, qwen-flash, qwen3.7-flash in Singapore. Batch and cache cannot combine. [S39]
- Caching helps little for these tasks. A 2k-token task with a short shared prefix is below the 1,024-token floor. Cache only a long shared prefix such as few-shot examples.
- Anthropic 4.7 and later models use a tokenizer that makes about 30% more tokens for the same text. Count tokens per vendor. [S42]

### B2. Cost per 1,000 tasks (2,000 in plus 2,000 out), eight representative models

Arithmetic: cost = 1,000 x (2,000 x price_in + 2,000 x price_out) / 1,000,000.

| Model | Standard (USD) | Batch or off-peak (USD) | If output is 2x (standard) | Arithmetic for standard |
|---|---|---|---|---|
| gpt-5-nano | 0.90 | 0.45 | 1.70 | 2 x 0.05 + 2 x 0.40 |
| Claude Haiku 5.5 | 1.20 | 0.60 | 2.20 | 2 x 0.10 + 2 x 0.50 |
| gpt-oss-120b (Together) | 1.50 | no discount | 2.70 | 2 x 0.15 + 2 x 0.60 |
| DeepSeek V4.1 Flash | 3.00 (peak) | 1.50 (off-peak) | 5.40 | 2 x 0.30 + 2 x 1.20 |
| Gemini 3.5 Flash-Lite | 5.60 | 2.80 | 10.60 | 2 x 0.30 + 2 x 2.50 |
| Claude Sonnet 5.5 | 24.00 | 12.00 | 44.00 | 2 x 2 + 2 x 10 |
| GPT-6.1 Sol | 24.00 | 12.00 | 44.00 | 2 x 2 + 2 x 10 |
| Claude Opus 5.5 | 48.00 | 24.00 | 88.00 | 2 x 4 + 2 x 20 |
| (ceiling) Claude Fable 5.1 | 120.00 | 60.00 | 220.00 | 2 x 10 + 2 x 50 |

Study 1 sizes: minimum 22 x 30 x 5 x 3 = 9,900 calls. Maximum 22 x 100 x 8 x 3 = 52,800 calls, which is 105.6M input and 105.6M output tokens at 2k each. Study 2: 22 x 2 x 3 x 3 = 396 calls, about 1.19M input and 0.79M output tokens at 3k in and 2k out.

## C. Local models on a Mac

### C1. What is verified

| Item | Value | Source |
|---|---|---|
| Speed of LLaMA 7B Q4_0, llama.cpp Metal, text generation (TG128) and prompt processing (PP512), tokens per second | M1 8-core 14.15 TG, 118 PP. M3 Pro 18-core 30.74 TG, 342 PP (this Mac's chip family; the 14-core M3 Pro gets 30.65 TG). M3 Max 40-core 66.31 TG, 760 PP. M4 Pro 20-core 50.74 TG, 440 PP. M4 Max 40-core 83.06 TG, 886 PP. | [S48] |
| gpt-oss | `gpt-oss:20b` 14GB download, runs "on systems with as little as 16GB of memory", 128K context, Apache 2.0, MXFP4 weights at 4.25 bits per parameter. `gpt-oss:120b` 65GB. | [S49] |
| Gemma 4 on Ollama | e2b 4.6 to 7.5GB, e4b 6.6 to 9.5GB, 12b 7.7 to 8.0GB, 26b (25.2B total, 3.8B active) 16 to 19GB, 31b dense 19 to 20GB. MLX tags exist (26b-mlx 18GB). License not stated on that page. | [S50] |
| Qwen3.5 on Ollama | 0.8b 1.2GB, 2b 2.7 to 3.1GB, 4b 3.3 to 4.0GB, 9b 6.6 to 7.6GB, 27b 17 to 20GB, 35b 22GB, 122b 81GB; 256K context; MLX tags exist. License not stated on that page. | [S51] |
| MLX LM | `pip install mlx-lm`. Thousands of Hub models. macOS 15 and later can raise the wired memory limit with `sudo sysctl iogpu.wired_limit_mb=N`. Page gives no speed numbers. | [S52] |
| My own measurement | Ollama `qwen3-vl:2b-instruct` on this M3 Pro: 10.97 tokens per second decode, 3.22 prompt tokens per second, 56.5 s model load. This was one cold run on a machine that may have been busy. It is NOT a valid benchmark. Run `llama-bench` before you plan. | local run 2026-10-16 |

### C2. Secondary speed claims (blogs, not official)

- On an M4 Max with 128GB, one blog reports Qwen3.5-35B-A3B at 48 tokens per second in Ollama, 72 in llama.cpp, and 131.8 in mlx-lm. [S53] UNVERIFIED (secondary).
- A preprint reports vllm-mlx at 21% to 87% above llama.cpp throughput on an M4 Max with 128GB at 4-bit. [S54] (own serving layer, not plain mlx-lm.)
- I found no measured gpt-oss-20b number on M3 Pro. UNVERIFIED.

### C3. What fits where (weights only; leave 4 to 8 GB for the OS and the KV cache)

| Memory | Fits | Does not fit |
|---|---|---|
| 16 GB | Qwen3.5 4B and 9B, Gemma 4 e4b and 12b. gpt-oss-20b is at the limit. | Gemma 4 26b and 31b, Qwen3.5 27b |
| 36 GB (this Mac) | gpt-oss-20b, Gemma 4 26b-a4b, Gemma 4 31b, Qwen3.5 27b, Qwen3.5 35b (22GB, tight with long context) | gpt-oss-120b (65GB) |
| 64 GB | All above with long context | gpt-oss-120b (65GB, just over), Qwen3.5 122b (81GB) |

Rough speed rule: decode speed scales with memory bandwidth divided by the bytes read per token. A mixture-of-experts model with 3 to 4B active parameters (gpt-oss-20b, Gemma 4 26B-A4B) reads less per token than a dense 9B. This is an estimate, not a measurement. Plan 20 to 30 tokens per second as a floor on this Mac and measure.

### C4. Are they good enough?

- They are good enough to rank harness behavior and to catch broken tasks. They are weak for tests that need strong code reasoning.
- The OpenRouter catalog shows Artificial Analysis intelligence index values: Nemotron 3.5 Super VL 26.5, Inkling Small 25.7, Gemma 4 26B A4B 16.7, Gemma 4 31B 14.7. [S3] RAW. I did not find the index values for the local Qwen3.5 and gpt-oss models.
- Phi and DeepSeek distills: not researched in October 2026. UNVERIFIED.

### C5. Quantization and eval validity

- Kurtic et al., "Give Me BF16 or Give Me Death?", over 500,000 evaluations on Llama-3.1 (ACL 2025, revised 2026-05-26): FP8 (W8A8-FP) is "effectively lossless". INT8 (W8A8-INT) loses 1 to 3% when well tuned. INT4 weight-only (W4A16) is "more competitive than expected, rivaling 8-bit". [S55]
- Limit of that source: it measures vLLM formats on Llama-3.1, not GGUF Q4_K_M on Ollama. A single-model GGUF study exists (arXiv 2601.14277, Llama-3.1-8B-Instruct, 3 to 8 bit) but I could not read its numbers. [S56] UNVERIFIED.
- Rule: record the exact quantization (for example `Q4_K_M`, `MXFP4`) in every result row. Do not compare a local 4-bit run with a hosted FP16 run of the same model as if they were equal. On OpenRouter, the `quantizations` provider filter exists for this reason. [S57]

## D. Free GPU, CPU, and credit programs

### D1. Free compute

| Service | Official statement (2026-10-16) | Fit for this work | Source |
|---|---|---|---|
| Kaggle | Official docs pages returned no body text. Secondary sources say about 30 GPU hours per week, P100 or 2x T4, 9 to 12 hour sessions. UNVERIFIED. | Run open models in vLLM or llama.cpp inside a notebook. UNVERIFIED limits. | [S58] |
| Google Colab free | GPU types "vary over time". Runtimes last "at most 12 hours". Limits are "not guaranteed and not unlimited". Using multiple accounts to get around limits is prohibited. SSH shells are prohibited on free runtimes without compute units. | Weak. Sessions end without notice. | [S59] |
| Lightning AI | Pricing page did not load. Secondary sources say 15 monthly credits, about 80 GPU hours on cheap GPUs, phone verification. UNVERIFIED. | Possible | [S60] |
| Hugging Face Spaces | CPU Basic is 2 vCPU, 16GB RAM, free. Gradio or Docker Spaces need a paid plan (PRO). Static Spaces are free. Free personal accounts can host up to 2 Gradio Spaces on ZeroGPU. Community GPU grants can be requested from Space settings. | Hosting results pages only | [S61] |
| Cloudflare | 10,000 Neurons per day (section A). | One extra model, about 110 calls per day | [S13] |
| Oracle Cloud Always Free | Ampere A1: 1,500 OCPU hours and 9,000 GB hours per month, equal to 2 OCPUs and 12GB. 200GB storage. Oracle may reclaim idle instances (CPU, network, memory under 20% at the 95th percentile over 7 days on A1). | A host for the job runner, not for inference | [S62] |
| Modal | Starter: 30 USD per month free credits. Team: 100 USD per month. T4 is 0.000164 USD per second (0.59 USD per hour). L4 0.000222 per second. | Pay-as-you-go GPUs for a gpt-oss-20b server, if local is too slow | [S63] |
| RunPod | Research credits page up to 25K USD (search result only; page body had no details). Startup page contact: startups@runpod.io. | UNVERIFIED | [S64] |

### D2. Credit programs and who can apply

| Program | Eligibility text (quoted from the page) | Needs an institution? | Amount and timing | Status for an independent author | Source |
|---|---|---|---|---|---|
| Anthropic External Researcher Access | "researchers working on AI safety and alignment topics that we consider high priority" | The page names no institution requirement. | Typically 1,000 USD in API credits. Evaluated on the first Monday of each month. API only. Usage Policy still applies. | Possible if the work is safety or alignment related. Your packages on honesty, exploit resistance, instruction hierarchy and MCP safety may fit. Judge the fit yourself. | [S65] |
| OpenAI Researcher Access Program | Grants page: "We encourage applications from early stage researchers in countries supported by our API." It names a preference for "researchers with limited financial and institutional resources". A search summary of the help-center FAQ (page returned 403) says applicants need an "active affiliation with an academic institution or research organization". | CONFLICT. Grants page states no formal requirement. FAQ UNVERIFIED. | Up to 1,000 USD, valid 12 months. Reviewed in March, June, September, December. Next review: December 2026. | Apply, but read the FAQ yourself first. | [S66] |
| NAIRR Pilot | "meritorious proposals by US-based researchers and educators from US-based institutions". Institutional email required. Personal email (Gmail) not considered. | Yes | Monthly review, 12-month projects | No | [S67] |
| AWS Cloud Credit for Research | "Full-time faculty at an accredited research institution", "Full-time research staff at an accredited research institution", "Graduate, post-graduate, or PhD students enrolled at an accredited research institution". | Yes | Students up to 5,000 USD. Faculty and staff not capped. | No | [S68] |
| Google Cloud research credits | "Eligibility for research grants is limited to faculty, PhD students and postdoctoral researchers from accredited higher education institutions and eligible nonprofit research institutions in approved countries." | Yes | Amount set by your estimate. Credits expire after 365 days. Not for commercial use or personal use. | No | [S69] |
| Microsoft Accelerating Foundation Models Research | "The Accelerating Foundation Models Research program has reached its conclusion." Successor named AARI, page not opened. | Closed | n/a | No. AARI UNVERIFIED. | [S70] |
| Modal for Academics | Pricing page: "Graduate students, labs, and researchers can get up to $10k in free compute credits." Eligibility FAQ not shown. | UNVERIFIED | Up to 10K USD | Ask Modal. UNVERIFIED. | [S63] |
| Hugging Face community GPU grant | Request link in Space settings ("apply for a community GPU grant"). No eligibility text on the page. | UNVERIFIED | UNVERIFIED | Possible for a public results Space | [S61] |

## E. Terms of service and ethics

### E1. May you publish outputs and scores?

| Provider | Benchmarking | Publishing outputs | Disclosure duty | Source and date of text |
|---|---|---|---|---|
| Cerebras | FORBIDDEN: Acceptable Use Restrictions bar use "for benchmarking or competitive analysis of the Service". | No explicit ban. Do not imply endorsement. | n/a | [S9] effective 2024-08-27 |
| Together AI | FORBIDDEN: 4.3 bars "engage in competitive analysis or benchmarking". | Company name and logo need written consent (14.3). | n/a | [S23] updated 2026-05-19 |
| Fireworks | FORBIDDEN: bars use "for benchmarking or competitive analysis of the Service". | UNVERIFIED | n/a | [S25] RAW, updated 2026-07-10 |
| Cloudflare | ALLOWED: 2.2.2 "You are permitted to perform benchmark tests of our Services." | If you disclose results you must include "all information necessary to replicate such benchmark tests". Cloudflare may benchmark your services too. | Replication details | [S15] RAW, updated 2025-09-12 |
| Anthropic API (Commercial Terms) | No benchmarking clause. Bars building "a competing product or service, including to train competing AI models". | Customer owns Outputs. Anthropic "may not train models on Customer Content". Tell users outputs "should not be relied upon" without verification (D.3). | See Usage Policy | [S71] |
| Anthropic Usage Policy | No benchmarking clause. Page shows effective date 2026-11-12. Bars using outputs "to train an AI model" without authorization. | Consumer chatbots must disclose AI. | AI disclosure rules | [S72] |
| Google Gemini API | No benchmarking clause found. Bars using the Services to "develop models that compete with the Services". | Unpaid Services: content may be used to improve products and read by reviewers. | n/a | [S7] |
| Gemma (model terms) | No benchmarking clause. | "Google claims no rights in Outputs." Redistribution needs the terms and a notice. | Notice file | [S73] |
| DeepSeek | No benchmarking clause. | You own output rights it can assign. | "clearly disclose" AI generated output (8.1) | [S38] |
| OpenRouter | No benchmarking clause. Red teaming only for legitimate research. | Per-model terms decide. | n/a | [S4] |
| Groq | No "benchmark" string in Services Agreement. | UNVERIFIED | n/a | [S11] updated 2026-06-22 |
| NVIDIA API Trial | No benchmark clause. Trial for "internal testing and evaluation purposes, not in production". | Publishing not addressed. Ask. | n/a | [S20] RAW |
| DeepInfra, Z.ai, Kimi | No "benchmark" string in text fetched. Each bars competing use. Read the exact clause before you publish. | UNVERIFIED | n/a | [S28] [S32] [S35] RAW |
| OpenAI | UNVERIFIED. Pages returned 403. A third-party mirror lists "Use Output to develop models that compete with OpenAI". | UNVERIFIED | UNVERIFIED | none opened |
| xAI, Mistral, SambaNova, Moonshot (hosted), Meta Llama license | UNVERIFIED (403, 404, or landing page only). | UNVERIFIED | UNVERIFIED | none opened |

Ethics rules to follow whatever the terms say:

- Say which provider served each score. Say the date range of the runs.
- Do not name a vendor in a ranking if its terms forbid benchmarking. Drop it or get permission in writing.
- Do not send private code diffs (study 2) to any tier that trains on prompts. Free Gemini and some free OpenRouter models do.
- Publish the prompts, the seeds, and the raw outputs so others can replicate. This also meets the Cloudflare clause.

### E2. Provenance record (one row per call)

Log these fields. Append to a JSONL file. Hash the file at the end and publish the hash.

| Field | Why |
|---|---|
| `run_id`, `task_id`, `repeat_index` | join key |
| `utc_time_start`, `utc_time_end` | models change by date |
| `provider`, `endpoint_url` | who served it |
| `model_id_requested` and `model_id_returned` | aliases drift |
| `served_by` (OpenRouter provider name, if the response gives it) | OpenRouter routes between providers. The docs page I opened did not say how to read it. UNVERIFIED. |
| `quantization` | local and hosted differ |
| `temperature`, `top_p`, `max_tokens`, `reasoning_effort`, `stop` | settings |
| `seed` (if the API has one) and `system_fingerprint` (if returned) | OpenAI reproducible outputs page returned 404. UNVERIFIED. |
| `prompt_sha256`, `system_prompt_sha256`, `response_sha256` | detect silent change |
| `input_tokens`, `output_tokens`, `reasoning_tokens`, `finish_reason` | detect truncation |
| `http_status`, `retries`, `latency_ms`, `cost_usd` | audit |
| `harness_git_commit`, `package_versions`, `os`, `chip` | rebuild |

Claude 4.7 and later models return a 400 error if you set `temperature`, `top_p`, or `top_k` to a non-default value. [S74] So "3 seeds" means "3 repeats" for those models. State this in the paper. Whether the Anthropic API has a seed parameter: UNVERIFIED.

## F. Budget plan

### F1. Roster of eight

| # | Model | Where | Type | Why |
|---|---|---|---|---|
| 1 | gpt-oss-20b | Local Ollama (14GB) | free | Apache 2.0, fits 16GB and up |
| 2 | Gemma 4 26B-A4B | Local Ollama (16 to 19GB) | free | 3.8B active, fits 36GB |
| 3 | Qwen3.5 9B | Local Ollama (6.6 to 7.6GB) | free | small dense baseline |
| 4 | Gemini 3.5 Flash-Lite | Gemini API free tier | free, limits UNVERIFIED | different vendor |
| 5 | nvidia/nemotron-3-ultra-550b-a55b:free | OpenRouter free | free, 50 per day | largest free model |
| 6 | Claude Haiku 5.5 | Anthropic Batch | cheap | 0.05 / 0.25 per M batch |
| 7 | gpt-5-nano | OpenAI Batch | cheap | 0.025 / 0.20 per M batch |
| 8 | DeepSeek V4.1 Flash | DeepSeek off-peak | cheap | 0.15 / 0.60 per M off-peak |
| + | Claude Sonnet 5.5 and GPT-6.1 Sol | Batch | frontier-class, 1.00 / 5.00 per M batch | only in the 100 and 300 plans |
| + | Claude Opus 5.5 or Fable 5.1 | Standard | study 2 only | affordable at 396 calls |

The OpenRouter free list on 2026-10-16 (15 chat models, live catalog, RAW): nemotron-3.5-super-vl, inkling-small, inkling, nemotron-3-ultra, gemma-4-26b-a4b-it, gemma-4-31b-it, nemotron-3.5-lightning, nemotron-3-super, nemotron-3-nano-omni, north-mini-code, lfm-2.5-2.6b, dots-3-note-preview, laguna-s-2.1, laguna-xs-2.1, plus a content-safety guard model. [S3]

### F2. Plan A: free only (0 USD)

Study 1, lean design: 22 packages x 30 tasks x 3 seeds = 1,980 calls per model.

| Model | Calls | Tokens (2k in + 2k out) | Cost | Time bound |
|---|---|---|---|---|
| 3 local models | 3 x 1,980 = 5,940 | 11.88M in, 11.88M out | 0 | 5,940 x 2,000 / 30 tokens per s = 396,000 s = 110 h = 4.6 days (20 t/s: 6.9 days; 50 t/s: 2.8 days; estimates) |
| Gemini 3.5 Flash-Lite free | 1,980 | 3.96M, 3.96M | 0 | 2 days if 1,000 per day (UNVERIFIED) |
| Nemotron 3 Ultra :free | 1,980 | 3.96M, 3.96M | 0 | 1,980 / 50 per day = 39.6 days. With 10 credits bought it is 2 days, but that is not free. |
| Total, 5 models | 9,900 | 19.8M, 19.8M | 0 | about 40 days, or about 5 days if you drop the OpenRouter model (4 models, 7,920 calls) |

Study 2: 396 calls on 3 local models (gpt-oss-20b, Gemma 4 26B-A4B, Qwen3.5 9B), 132 calls each, 3k in and 2k out. Output 132 x 2,000 = 264,000 tokens per model, at 30 tokens per second is 8,800 s = 2.4 h per model, 7.3 h in all. Cost 0. Private diffs stay on the machine.

Do not use Cerebras, Together, or Fireworks free or paid access for published scores.

### F3. Plan B: 100 USD

Study 1, mid design: 22 x 65 x 3 = 4,290 calls per model. Eight models, 34,320 calls in all.

| Model | Calls | Price basis (per M, in / out) | Arithmetic | Cost |
|---|---|---|---|---|
| 3 local + Gemini free | 17,160 | free | | 0 |
| Haiku 5.5 batch | 4,290 | 0.05 / 0.25 | 4.29 x (2 x 0.05 + 2 x 0.25) = 4.29 x 0.60 | 2.57 |
| gpt-5-nano batch | 4,290 | 0.025 / 0.20 | 4.29 x 0.45 | 1.93 |
| DeepSeek V4.1 Flash off-peak | 4,290 | 0.15 / 0.60 | 4.29 x 1.50 | 6.43 |
| Sonnet 5.5 batch | 4,290 | 1.00 / 5.00 | 4.29 x 12.00 | 51.48 |
| Study 1 total | | | | 62.42 |

Study 2: Sonnet 5.5, DeepSeek V4.1 Flash (peak), Haiku 5.5, 132 calls each, 3k in, 2k out, standard prices: Sonnet 132 x (3,000 x 2 + 2,000 x 10) / 1M = 3.43. DeepSeek 132 x (3,000 x 0.30 + 2,000 x 1.20) / 1M = 0.44. Haiku 132 x (3,000 x 0.10 + 2,000 x 0.50) / 1M = 0.17. Total 4.04.

Total 62.42 + 4.04 = 66.46. With 1.5x contingency (retries, longer outputs): 99.69 USD. If output tokens double, study 1 alone is 114.33 USD. Fallback: cut Sonnet to the lean 1,980 calls (1.98 x 12.00 = 23.76 USD instead of 51.48). Set `max_tokens` on every call.

### F4. Plan C: 300 USD

Study 1, full design: 22 x 100 x 3 = 6,600 calls per model. Eight models, 52,800 calls: 105.6M input and 105.6M output tokens. Two local models are free. Six paid models:

| Model | Basis (per M, in / out) | Arithmetic (6.6 units of 1,000 calls) | Cost |
|---|---|---|---|
| Haiku 5.5 batch | 0.05 / 0.25 | 6.6 x 0.60 | 3.96 |
| gpt-5-nano batch | 0.025 / 0.20 | 6.6 x 0.45 | 2.97 |
| DeepSeek V4.1 Flash off-peak | 0.15 / 0.60 | 6.6 x 1.50 | 9.90 |
| Gemini 3.5 Flash-Lite batch | 0.15 / 1.25 | 6.6 x 2.80 | 18.48 |
| Sonnet 5.5 batch | 1.00 / 5.00 | 6.6 x 12.00 | 79.20 |
| GPT-6.1 Sol batch | 1.00 / 5.00 | 6.6 x 12.00 | 79.20 |
| Study 1 total | | | 193.71 |

Study 2 reviewers: Opus 5.5, Sonnet 5.5, Gemini 3.5 Flash-Lite, 132 calls each, standard: Opus 132 x (3,000 x 4 + 2,000 x 20) / 1M = 6.86. Sonnet 3.43. Gemini 132 x (3,000 x 0.30 + 2,000 x 2.50) / 1M = 0.78. Total 11.07.

Total 193.71 + 11.07 = 204.78. With 1.3x contingency: 266.21 USD. Headroom 33.79 USD. Option: swap Study 2 reviewers to Fable 5.1, Opus 5.5, GPT-6.1 Sol: 17.16 + 6.86 + 3.43 = 27.46, which makes 193.71 + 27.46 = 221.17, or 287.52 with 1.3x. Fits, with 12.48 USD headroom. If output tokens double on the frontier-class models, the full design breaks the cap. Check output length on 50 calls first.

### F5. Rate-limit workarounds that stay inside the terms

- Back off exponentially. Honor `Retry-After` when present. [S1]
- Use Batch APIs. They carry their own queue limits (Anthropic Start tier: 200,000 queued requests). [S45]
- Cache only long shared prefixes. Cached Claude tokens do not count toward the input-per-minute limit on most models. [S45]
- Run DeepSeek in off-peak windows. [S36]
- Run local models overnight. Keep the Mac awake and plugged in.
- Write every result to disk before the next call. Make the job resumable by `task_id`.
- Raise tiers by normal spend. Do not open extra accounts or keys to dodge a limit. OpenRouter states it will not help. [S1] Colab bans multiple accounts for this. [S59]

### F6. Traps

| Trap | Evidence |
|---|---|
| Free model disappears mid-study | OpenRouter catalog (RAW): poolside/laguna-s-2.1:free and laguna-xs-2.1:free expire 2026-10-31. dots-3-note-preview:free expires 2026-12-31. [S3] |
| Free model is quantized | Catalog note: Laguna XS 2.1 "Quantized to FP8". [S3] OpenRouter can fall back between providers (`allow_fallbacks` defaults to true). Pin provider with `only` and `allow_fallbacks: false`. [S57] |
| Free model trains on your prompts | Catalog notes for Poolside and Liquid; OpenRouter terms 6.1. [S3] [S4] Use `data_collection: "deny"` for private diffs. [S57] |
| Price changes during the study | Gemini 4 Argon rises from 2.00 / 10.00 to 4.00 / 20.00 per M on 2026-12-01. Gemini 3.8 Flash rises from 0.75 / 3.75 to 1.50 / 7.50 "from 2027". [S6] |
| Model retired | Claude Sonnet 4.5 retires 2026-11-30. Haiku 4.5 "Not sooner than October 15, 2026". Anthropic gives at least 60 days notice. [S75] GitHub Models retired 2026-07-30. [S12] Gemini 2.5 Flash Image shuts down 2026-10-02. [S6] |
| Alias drift | DeepSeek legacy name `deepseek-v4-flash` is "served by DeepSeek-V4.1-Flash" and billed at the Flash price. [S36] Pin dated ids where they exist. |
| Hidden reasoning cost and cut-off answers | Catalog: Inkling defaults to reasoning effort "high"; Nemotron 3 Ultra reasoning default on. [S3] A short `max_tokens` can end in the reasoning with no answer. Log `finish_reason` and `reasoning_tokens`. |
| Context truncation | LFM2.5-2.6B has a 66K window and 8,192 max output. [S3] Local runtimes can use a smaller context than the model supports. Check `prompt_eval_count` equals your prompt size. UNVERIFIED for Ollama defaults. |
| Peak pricing | DeepSeek peak is double. [S36] |
| Provider swap of a "same" model | The same open model differs between Together, DeepInfra, Chutes and local (prices and quantization differ). Record `served_by` and `quantization`. |
| Spend cap | Anthropic Start tier caps spend at 500 USD per month. At the cap the API returns 429 with no `retry-after`, and retries fail until the next month. [S45] |
| Seeds | Claude 4.7 and later reject non-default `temperature`. [S74] |
| Local speed | My own cold run gave 10.97 tokens per second on a 2B model. Measure before you commit a week of runs. |

## Sources (all opened 2026-10-16 unless noted)

| Key | URL |
|---|---|
| S1 | https://openrouter.ai/docs/api-reference/limits |
| S2 | https://openrouter.ai/collections/free-models |
| S3 | OpenRouter live model catalog through the `list-models` tool, filter max_price=0 (RAW JSON) |
| S4 | https://openrouter.ai/terms |
| S5 | https://ai.google.dev/gemini-api/docs/rate-limits |
| S6 | https://ai.google.dev/gemini-api/docs/pricing (page says last updated 2026-10-15) |
| S7 | https://ai.google.dev/gemini-api/terms |
| S8 | https://inference-docs.cerebras.ai/support/rate-limits |
| S9 | https://www.cerebras.ai/terms-of-service (effective 2024-08-27); https://www.cerebras.ai/pricing |
| S10 | https://console.groq.com/docs/rate-limits |
| S11 | https://console.groq.com/docs/legal/services-agreement |
| S12 | https://docs.github.com/en/github-models/prototyping-with-ai-models |
| S13 | https://developers.cloudflare.com/workers-ai/platform/pricing/ |
| S14 | https://developers.cloudflare.com/workers-ai/platform/limits/ |
| S15 | https://www.cloudflare.com/terms/ (curl, RAW) |
| S16 | https://huggingface.co/docs/inference-providers/pricing |
| S17 | https://huggingface.co/terms-of-service (curl, RAW) |
| S18 | https://help.mistral.ai/en/articles/424390 (via search result only; fetch gave 404); https://mistral.ai/pricing |
| S19 | https://build.nvidia.com/ |
| S20 | NVIDIA API Trial Terms of Service PDF, assets.ngc.nvidia.com (curl, RAW) |
| S21 | https://docs.sambanova.ai/docs/en/models/rate-limits |
| S22 | https://www.together.ai/pricing |
| S23 | https://www.together.ai/terms-of-service |
| S24 | https://docs.together.ai/docs/rate-limits |
| S25 | https://fireworks.ai/terms-of-service (PDF, text extracted with pdftotext, RAW) |
| S26 | https://docs.fireworks.ai/guides/quotas_usage/rate-limits |
| S27 | https://deepinfra.com/pricing |
| S28 | https://deepinfra.com/terms (curl, RAW) |
| S29 | https://chutes.ai/pricing |
| S30 | https://kluster.ai/blog/end-of-life-announcement (seen as a search result only) |
| S31 | https://docs.z.ai/guides/overview/pricing |
| S32 | https://docs.z.ai/legal-agreement/terms-of-use (curl, RAW) |
| S33 | https://platform.kimi.ai/docs/pricing/chat |
| S34 | https://platform.kimi.ai/docs/pricing/limits |
| S35 | https://platform.kimi.ai/docs/agreement/modeluse (curl, RAW) |
| S36 | https://api-docs.deepseek.com/quick_start/pricing |
| S37 | https://api-docs.deepseek.com/quick_start/rate_limit |
| S38 | https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html |
| S39 | https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio (first 100,000 characters read) |
| S40 | https://docs.x.ai/docs/models |
| S41 | https://docs.x.ai/docs/key-information/consumption-and-rate-limits |
| S42 | https://platform.claude.com/docs/en/about-claude/pricing (RAW) |
| S43 | https://developers.openai.com/api/docs/pricing |
| S44 | https://docs.together.ai/docs/batch-inference |
| S45 | https://platform.claude.com/docs/en/api/rate-limits (RAW) |
| S46 | https://developers.openai.com/api/docs/guides/prompt-caching |
| S47 | https://mistral.ai/pricing |
| S48 | https://github.com/ggml-org/llama.cpp/discussions/4167 |
| S49 | https://ollama.com/library/gpt-oss |
| S50 | https://ollama.com/library/gemma4 |
| S51 | https://ollama.com/library/qwen3.5 |
| S52 | https://github.com/ml-explore/mlx-lm |
| S53 | Secondary blog on Ollama MLX speeds (search result, levelup.gitconnected.com) |
| S54 | https://arxiv.org/pdf/2601.19139 (search result excerpt) |
| S55 | https://arxiv.org/abs/2411.02355 |
| S56 | https://arxiv.org/abs/2601.14277 |
| S57 | https://openrouter.ai/docs/guides/routing/provider-selection |
| S58 | https://www.kaggle.com/docs/notebooks (no body text) and secondary search results |
| S59 | https://research.google.com/colaboratory/faq.html |
| S60 | https://lightning.ai/pricing (did not load); secondary search results |
| S61 | https://huggingface.co/docs/hub/spaces-overview |
| S62 | https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm |
| S63 | https://modal.com/pricing |
| S64 | https://www.runpod.io/research-credits (no details in page body); search result |
| S65 | https://support.claude.com/en/articles/9125743-what-is-the-external-researcher-access-program |
| S66 | https://grants.openai.com/prog/openai_researcher_access_program/ ; help.openai.com article 10139500 (403; seen only in a search summary) |
| S67 | https://nairrpilot.org/opportunities/allocations |
| S68 | https://aws.amazon.com/research-credits/ |
| S69 | https://edu.google.com/intl/ALL_us/programs/credits/research |
| S70 | https://www.microsoft.com/en-us/research/collaboration/accelerating-foundation-models-research/ |
| S71 | https://www.anthropic.com/legal/commercial-terms |
| S72 | https://www.anthropic.com/legal/aup |
| S73 | https://ai.google.dev/gemma/terms |
| S74 | https://platform.claude.com/docs/en/about-claude/model-deprecations (RAW) |
| S75 | same as S74 |

Pages that blocked me (403 or 404), so those cells stay UNVERIFIED: OpenAI terms, business terms and sharing policy; OpenAI reproducible-outputs guide; xAI terms; Mistral legal and rate-limit docs; SambaNova terms; Meta Llama license (redirect chain ended without text); Z.ai concurrency page; Lightning and Kaggle docs bodies.

