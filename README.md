# pooriaarab/skills

Claude Code skills for AI-aware development and life organization.

## Ad tracking skills

These skills share the `ad-conversion-hub` contract. Use the platform skill for
vendor setup and API details. Use `ad-conversion-hub` for canonical events,
consent, hashing, deduplication, and failure isolation.

### Tier 1: search and social

| Skill | Platform |
|---|---|
| [ads-google](ads-google/SKILL.md) | Google Ads + GA4 |
| [ads-meta](ads-meta/SKILL.md) | Meta |
| [reddit-ads](reddit-ads/SKILL.md) | Reddit |
| [brand](brand/README.md) | **Suite of 21.** Run a whole brand from one visual direction — voice, landing page, avatar, OG card, LinkedIn banner, Instagram carousels, YouTube thumbnails and edit style, podcast cover, decks. Start with [`brand-router`](brand/brand-router/SKILL.md): it surveys what you actually publish and recommends a kit of three registers rather than one style. |
| [ads-microsoft](ads-microsoft/SKILL.md) | Microsoft Advertising |
| [ads-amazon](ads-amazon/SKILL.md) | Amazon Ads |
| [tiktok-ads](tiktok-ads/SKILL.md) | TikTok |
| [ads-linkedin](ads-linkedin/SKILL.md) | LinkedIn |
| [pinterest-ads](pinterest-ads/SKILL.md) | Pinterest |
| [snapchat-ads](snapchat-ads/SKILL.md) | Snapchat |
| [x-ads](x-ads/SKILL.md) | X |
| [ads-apple-search](ads-apple-search/SKILL.md) | Apple Search Ads |

### Tier 2: DSP and native

| Skill | Platform |
|---|---|
| [taboola-ads](taboola-ads/SKILL.md) | Taboola |
| [ads-outbrain](ads-outbrain/SKILL.md) | Outbrain Amplify |
| [ads-criteo](ads-criteo/SKILL.md) | Criteo |
| [trade-desk](trade-desk/SKILL.md) | The Trade Desk |
| [quora-ads](quora-ads/SKILL.md) | Quora |
| [spotify-ads](spotify-ads/SKILL.md) | Spotify |
| [ads-nextdoor](ads-nextdoor/SKILL.md) | Nextdoor |
| [yelp-ads](yelp-ads/SKILL.md) | Yelp |
| [stackadapt](stackadapt/SKILL.md) | StackAdapt |

### Tier 3: AI and emerging

| Skill | Platform |
|---|---|
| [ads-chatgpt](ads-chatgpt/SKILL.md) | ChatGPT Ads |
| [ads-perplexity](ads-perplexity/SKILL.md) | Perplexity Ads |
| [ads-copilot](ads-copilot/SKILL.md) | Microsoft Copilot Ads |
| [ads-meta-ai](ads-meta-ai/SKILL.md) | Meta AI Ads |

### Tier 4: regional and CTV

| Skill | Platform |
|---|---|
| [ads-baidu](ads-baidu/SKILL.md) | Baidu |
| [tencent-ads](tencent-ads/SKILL.md) | Tencent |
| [ads-douyin](ads-douyin/SKILL.md) | Douyin / Ocean Engine |
| [weibo-ads](weibo-ads/SKILL.md) | Weibo |
| [xiaohongshu-ads](xiaohongshu-ads/SKILL.md) | Xiaohongshu |
| [ads-kuaishou](ads-kuaishou/SKILL.md) | Kuaishou |
| [ads-bilibili](ads-bilibili/SKILL.md) | Bilibili |
| [yandex-direct](yandex-direct/SKILL.md) | Yandex Direct |
| [vk-ads](vk-ads/SKILL.md) | VK |
| [ads-naver](ads-naver/SKILL.md) | Naver |
| [ads-kakao](ads-kakao/SKILL.md) | Kakao Moment |
| [yahoo-japan-ads](yahoo-japan-ads/SKILL.md) | Yahoo Japan / LY Ads |
| [ads-line](ads-line/SKILL.md) | LINE Ads |
| [sharechat-ads](sharechat-ads/SKILL.md) | ShareChat |
| [ads-moj](ads-moj/SKILL.md) | Moj |
| [shopee-ads](shopee-ads/SKILL.md) | Shopee |
| [ads-hotstar](ads-hotstar/SKILL.md) | Hotstar |
| [ads-mercadolibre](ads-mercadolibre/SKILL.md) | Mercado Libre |
| [twitch-ads](twitch-ads/SKILL.md) | Twitch |
| [roku-ads](roku-ads/SKILL.md) | Roku |
| [samsung-ads](samsung-ads/SKILL.md) | Samsung Ads |
| [ads-lg](ads-lg/SKILL.md) | LG Ads |
| [strava-ads](strava-ads/SKILL.md) | Strava |
| [ads-discord](ads-discord/SKILL.md) | Discord |
| [waze-ads](waze-ads/SKILL.md) | Waze |

## Skills

### Life organization (`organizer/`)

A coordinated suite for organizing across every digital surface — files, notes, mail, calendars, contacts, photos, social bookmarks, code. Run [`life-organizer`](organizer/life-organizer/SKILL.md) first to survey preferences and get a recommended sequence. See [`organizer/README.md`](organizer/README.md) for the full catalog (21 sub-skills) and [`organizer/DESIGN.md`](organizer/DESIGN.md) for architecture.

### CI and runners

One family, six questions. **Start at `ci-speed-diagnosis`** — it names the constraint and routes
to the skill that holds the lever. The others assume you already know which job matters.

| Skill | Answers |
|-------|---------|
| **[ci-speed-diagnosis](ci-speed-diagnosis/SKILL.md)** — the entry point | Find out why the CI optimisations you already have do nothing, before adding more. The measure-first order (latency vs machine seconds, then the critical path, then cache health), the checklist of defects that fail silently behind a green check (a secret holding an empty value, a task runner stripping `TURBO_*` from child processes, a `.next/**` output glob that sweeps the incremental cache into a 1.2 GB artifact whose upload fails, ref-scoped duplicate caches filling the quota, `restore-keys` with no lockfile-independent fallback, Prettier's mtime cache strategy that `actions/checkout` defeats, a buffering cache server that caps uploads), the bug shape that recurs most — one host's mitigation applied on every host — and the measurement discipline that keeps the numbers honest. |
| [ci-build-speed](ci-build-speed/SKILL.md) | Make CI fast AND reliable for a Next.js + bun + Turborepo monorepo on GitHub Actions — profile to find the critical path (it's the build), cache everything, fix the build OOM (the `memoryBasedWorkersCount`-overrides-`cpus` gotcha + swap + free disk), build-once dedup, concurrency cancel, with the honest verdict on what moves wall-clock vs only CI minutes. |
| [e2e-ci-economics](e2e-ci-economics/SKILL.md) | Place and gate a browser end-to-end suite so it earns its cost. Why a job with `continue-on-error: true` on every push is the worst of the three states — it was the longest job in two pipelines and gated nothing — plus gating on a minimal browser set and running the full matrix nightly, why you shard instead of raising `workers` (two workers share one dev server and one database), the fixed per-shard cost that sets the floor, why an E2E result must never enter a task-runner cache, the default-branch alert that catches the suite everyone stopped reading, how to report a retry-pass, and why you address a collection member by a stable key rather than by index — an indexed assertion silently retargets the first time anything is prepended. Ends with what a linter can enforce here and what it cannot. |
| [high-volume-ci-optimization](high-volume-ci-optimization/SKILL.md) | Job placement and cost for CI on repos where agents open many PRs per hour. A three-tier runner model (self-hosted, ephemeral cloud, vendor-hosted), collapsing job fan-out, host-local caches outside the workspace, parallelism caps, fixed-port services routing, duplicate-work filters, affected-only builds, a shared remote cache, cache-masking hazards, and cost comparison. Cross-references `self-hosted-runner-fleet` for host setup. |
| [ci-cost-at-agent-scale](ci-cost-at-agent-scale/SKILL.md) | Fix CI cost and CI queueing on a repo where agents open most of the pull requests. Audits where the runs come from first, then fixes in cost order: delete workflows whose steps are all ref-gated (they install and exit green), add concurrency groups, path-filter the heavy suites, share the build cache, change runners last. Explains why the real ceiling is concurrent-job limits rather than minutes, why a review bot's fix commits multiply every other workflow, and why agent sandboxes cannot replace a CI runner. |
| [self-hosted-runner-fleet](self-hosted-runner-fleet/SKILL.md) | Run GitHub Actions on your own machine, and know when not to. Which jobs may move and which must stay hosted, the toolchains a hosted image has that your host does not, why a Windows/WSL2 host silently kills jobs (and the S4U keepalive that fixes it), the fixed-port service-container ceiling, the gitleaks SARIF job that cannot move, and a retrospective on why this exact fleet was retired for managed ephemeral runners days after it was built. |

### Standalone

| Skill | Description |
|-------|-------------|
| [eco-mode](eco-mode/SKILL.md) | Cut token/CO₂ usage ~65% without quality loss. Caveman-inspired. |
| [eco-analyze](eco-analyze/SKILL.md) | `/eco-analyze` — calculate your real carbon footprint from Claude Code history |
| [multi-account-cli](multi-account-cli/SKILL.md) | One-command switching between work and personal accounts across gcloud, gws, Firebase, and Netlify. |
| [delegate-implementation](delegate-implementation/SKILL.md) | Orchestrator-implementer pattern for 10+ PR campaigns. Opus plans, Gemini Flash / Haiku / GPT-5 mini / Cursor Composer 2.5 implements. 50-80% cost savings vs all-Opus. |
| [agent-avatar-system](agent-avatar-system/SKILL.md) | Give every agent, user, or tenant a generated avatar derived from its name — deterministic, nothing stored, nothing chosen. Take a generator's body (blobatar/DiceBear) and draw your OWN face on it, so the roster gains silhouette variety without losing brand identity — most of those libraries are pose-only and structurally cannot draw a mouth. Pin colour to a fixed brand hue set: one locked hue collapses 60 entities to ~6 distinguishable colours, ten hues give 60 with zero collisions. Reach every surface by changing the shared display component and the mascot component, not the call sites (31 surfaces from 2 files). Covers containing the risk of parsing a library's internal output shape, compositor-only animation, and the verification that actually catches things. |
| [agent-context-economy](agent-context-economy/SKILL.md) | Make a vertical agent cheaper AND more accurate by treating its context as an L1/L2/L3 cache: cache the static tool-definition prefix (~45% end-to-end cost cut, lossless), compress large tool results at insertion, lint write outputs, right-size tool count — each shipped off-by-default and promoted only through a gated before/after A/B. |
| [design-context](design-context/SKILL.md) | Create or audit canonical `.agents/brand.md` and `.agents/design.md` files, plus verified `/design.md` and `/brand` routes for deployed products. |
| [claude-code-context-diet](claude-code-context-diet/SKILL.md) | Cut the hidden per-request bloat the Claude Code CLI adds to every call — tool definitions, skill catalog, feature clusters you pay for whether or not you use them. Measure with `/context`, then trim via `settings.json`: disable unused feature clusters, deny heavy tools by name, demote rarely-used skills to user-invocable-only. Reversible, measured before/after. Client-side hygiene, distinct from agent-context-economy. |
| [canada-census](canada-census/SKILL.md) | Complete the Government of Canada Census of Population online via agent-browser — asks you each question in chat, fills the StatCan form, stops for review before submit. Zero PII stored. |
| [schengen-visa-application](schengen-visa-application/SKILL.md) | Prep a short-stay Schengen visa from Canada — finds the destination country's actual handler (no single "EU visa company"; consulate vs VFS/BLS vs a representing state's centre), builds the doc set from your own local files, drafts the employer support-letter request, fills the EU form, stops before the in-person biometrics appointment. Zero PII stored. |
| [spec-issue](spec-issue/SKILL.md) | Turn a thin Linear issue into an implementation-ready spec — grounds every claim in real code, right-sizes detail, writes test cases. |
| [deploy-app-self-host](deploy-app-self-host/SKILL.md) | Self-host a containerized app (Postgres + S3-compatible object store + Redis) with Docker Compose, and smoke-test it. |
| [deploy-app-cloudflare](deploy-app-cloudflare/SKILL.md) | Deploy a containerized app to Cloudflare (Workers container + D1/R2/KV/Queues/Durable Objects) and smoke-test the live URL. |
| [deploy-app-gcp](deploy-app-gcp/SKILL.md) | Deploy a containerized app to GCP (Cloud Run + Cloud SQL + Memorystore + GCS) with Terraform, verify, then tear down. |
| [deploy-app-aws](deploy-app-aws/SKILL.md) | Deploy a containerized app to AWS (ECS Fargate + RDS + ElastiCache + S3 + ALB) with Terraform, verify, then tear down. |
| [deploy-app-azure](deploy-app-azure/SKILL.md) | Deploy a containerized app to Azure (Container Apps + Postgres + Cache for Redis + Blob) with Bicep, verify, then tear down. |
| [onboard-machine](onboard-machine/SKILL.md) | Add a Windows/macOS/Linux/Android device to a personal tailnet and give it a role — controller, worker, or consumer — so it can host runners, hold checkouts, and serve dev servers the other machines can browse. The per-OS capability matrix (and why a phone is a consumer, never a worker), the ACL pattern that enforces "the controller drives the workers and nothing reaches back" in policy rather than by habit, and the five that cost real time: joining before renaming, node key expiry silently dropping a headless worker, an unscoped port-22 rule following a laptop onto hostile Wi-Fi, Windows MagicDNS failing in a way that reads as healthy, and a sleeping laptop taking a runner offline. Stops where self-hosted-runner-fleet begins. |
| [release-notes](release-notes/SKILL.md) | Draft user-facing release notes from a branch diff — filters to user-facing changes, writes in your product's voice. |
| [pr-standards](pr-standards/SKILL.md) | The pull-request rule for a repo where agents write most of the PRs: one issue, one PR, one concern, under 500 lines, and proof of the work it did. The branch/title/body shapes a checker enforces, the proof-of-work table (before/after screenshots for anything visible, a command and its result for anything else), uploading media to GitHub user-attachments instead of committing it, the `Proof: n/a` escape hatch and why an agent cannot clear its own, VISION.md as the thing a scope review judges against, which enforcement layers actually gate on a private Free-plan repo, and the rollout command. |
| [app-screenshots](app-screenshots/SKILL.md) | Capture real web-app/extension UI headlessly and beautify it into store-ready framed screenshots + promo tiles — the mock-the-host-APIs capture recipe, the `data:`-URL compositor (why `file://` breaks), exact Chrome/Apple/Play/AMO sizes, and AI hero art for marketing tiles only (never fake the product UI). |
| [browser-extension](browser-extension/SKILL.md) | Build a cross-browser (Firefox + Chrome) MV3 web extension and submit it per store — one-manifest-two-browsers layout, the CSP traps that break wasm/workers (+ the same-origin-worker fix), on-device AI (Firefox `trial.ml` / Chrome Prompt API), `web-ext`, and the full AMO (incl. mandatory 2FA) + Chrome Web Store flow. |
| [bug-bash-setup](bug-bash-setup/SKILL.md) | Plan a bug bash — balanced no-overlap test-area assignments + plan/findings-log doc, from a tester roster and time budget. |
| [bug-bash-triage](bug-bash-triage/SKILL.md) | Triage raw bug-bash findings — reconcile against the test suite, build a consolidated triage doc, then (after approval) create issues. |
| [storybook-to-design-system](storybook-to-design-system/SKILL.md) | Turn co-located Storybook stories into a live in-app design-system gallery (you pick the route name) AND fan out parallel agents to reach ~100% coverage. Stories are the single source of truth; each renders in an isolated iframe so modals/loops/logs can't hijack the page. |
| [high-fidelity-ui-image-gen](high-fidelity-ui-image-gen/SKILL.md) | Render near-pixel-faithful UI mockups with an AI image model — the prompt recipe (~94-95/100 on isolated surfaces), grounding in real source, the multi-round eval loop, the honest fidelity ceiling, and when to screenshot real HTML instead. |
| [saas-brand-system](saas-brand-system/SKILL.md) | Design a brand by fanning out many *distinct, emotion-tagged* directions in parallel — each a complete, 100%-tokenized, self-contained HTML design-system prototype under one shared contract — then review in-browser, pick one, and expand the winner into a full SaaS brand kit (logo suite, favicon/OG set, tokens, components, guidelines). Carries a 14-direction style catalog (palette/font/signature/emotion) and the gotchas (Artifact CSP blocks Google Fonts, `file://` blocked → serve http, don't build depth before the pick). |
| [verify-branding](verify-branding/SKILL.md) | Audit a web project for logo/brand-color consistency and fix the drift — one shared logo component used by BOTH header and footer, one accent hex shared by the in-app mark, favicon/icon.svg, apple-icon, OG image, and manifest, with no orphaned old colors after a rebrand. Catches the drift that hides in the asset files nobody re-opens (favicon/OG/apple-icon keep the old hex because a CSS-token rename never touches them). Pairs with `saas-brand-system`; fan out one PR per repo to standardize. |
| [embed-snippet-generator](embed-snippet-generator/SKILL.md) | Build AND verify a third-party embed/snippet catalog for a website builder or CMS with a "custom code" field — the two embed surfaces (head vs sandboxed section) and their differing tag/char-limit rules, a drill-down generator UX, and the technique everyone skips: prove each snippet RENDERS by reproducing the host's real sandbox iframe headless. Includes the gotchas — placeholder-id artifacts vs real bugs, provider embed-format drift (re-check current docs), logos via build-time manifest not runtime `onError` guessing, protocol-relative `//` in a null-origin `srcdoc`, per-account host subdomains, and why a "verified" badge is an anti-pattern. |
| [launch-video-generation](launch-video-generation/SKILL.md) | Plan and generate a short launch video — storyboard framework, wavespeed.ai API facts, the hard-won fix for scene transitions (image-to-video models anchor the scene to the input image, prompt only steers motion) and on-screen text/logos (composite real assets, don't generate them), and a $0-generation-spend path (HyperFrames) for whole-video native-app-mimicry concepts (a note, a chat thread, used as a self-aware ad). |
| [ship-a-product](ship-a-product/SKILL.md) | Orchestrator for idea → published launch post: sequences `build-from-template` → your own build process → `open-source-repo-prep` → `launch-seo` → `launch-video-generation` → `social-launch-post`. Points at each stage skill rather than duplicating them; enter wherever the project already is. |
| [marketing-site](marketing-site/SKILL.md) | Build the whole public site, not one page — a typed content model that generates page families (per audience, per use case, per module, per competitor), a mega-menu shell, free browser tools as an organic channel, one lead endpoint behind every form, and tests that fail when the copy starts lying. Starts from a competitor design audit so the brief comes from evidence. Carries the five expensive failures: a registry that drifts from its pages, prerendered routes that 404 only in production, delegated copy that invents plausible numbers, staging getting indexed, and a title template that was never wired. |
| [landing-page](landing-page/SKILL.md) | Design or level up ONE marketing landing page — section taxonomy (the conversion anatomy), the interaction/effect vocabulary, and the review gates, in CREATE and LEVEL-UP modes. Pairs with `impeccable` for the pixels; hand off to `marketing-site` once the product needs a page per audience or per competitor. |
| [geo-aeo](geo-aeo/SKILL.md) | Make a live site quotable by AI answer engines and usable by agents — llms.txt / llms-full.txt, per-page markdown mirrors, schema.org JSON-LD, a WebMCP manifest, answer-first structure, and programmatic entity pages. Runs after `launch-seo`; assumes the pages exist, which is what `marketing-site` builds. |
| [name-a-product](name-a-product/SKILL.md) | Find a name that is available, memorable and clear — with the order inverted: check for competing COMPANIES before checking domains, because funded competitors already sit on the `try*.ai` / `get*.com` variants a domain sweep hands you as alternatives. RDAP for bulk sweeps, Cloudflare `domain-check` for price/tier, plus the empirical map of ~14 naming lanes that are already exhausted on `.com` and `.ai` (a simple one-word `.com` does not exist at register price, in any language), the connotation checklist, and the "trying too hard" register axis. |
| [launch-seo](launch-seo/SKILL.md) | Make a newly-live docs/marketing/product site discoverable and shareable — sitemap.xml, a real robots.txt (don't trust your host's silent default), canonical/Open Graph/Twitter Card meta, a favicon, and submitting the sitemap in Google Search Console. Covers the hostname-aware robots.txt trap when staging and production share one static-asset bundle. |
| [launch-analytics](launch-analytics/SKILL.md) | Wire measurement into a live site/app — Google Analytics 4 (client gtag + server-side Measurement Protocol) and Microsoft Clarity — env-gated so staging never pollutes the prod property. Enforces the rule that every domain project has GA4 + Clarity + Search Console. Covers the MV3-CSP/double-fire trap (never hardcode tags in an app shell) and verifying GA4 server events via the `/debug/mp/collect` endpoint. |
| [build-from-template](build-from-template/SKILL.md) | Bootstrap a web-app-shaped idea from `master-template-cloudflare` (Next.js on Workers/OpenNext, D1, R2, KV, Queues, Cron, Better Auth) instead of starting from scratch. |
| [open-source-repo-prep](open-source-repo-prep/SKILL.md) | Prepare a repo for real open-source use — LICENSE/CODE_OF_CONDUCT/CONTRIBUTING/CODEOWNERS/CI, GitHub branch protection that actually restricts merges (the `gh api` JSON-payload gotcha, the `allow_force_pushes` blocks-admins-too gotcha), and how to scrub something from already-public history if needed. |
| [google-drive-organizer](google-drive-organizer/SKILL.md) | Reorganize a messy Google Drive into a clean folder hierarchy using `gws` CLI + AI classification. Handles untitled docs, renames, sub-folders, and empty file cleanup. |
| [notion-organizer](notion-organizer/SKILL.md) | Reorganize a chaotic Notion workspace into a clean hierarchy via the Notion MCP. Creates section pages, moves misplaced pages, classifies untitled pages with AI, and archives empties. |
| [mac-organizer](mac-organizer/SKILL.md) | Free disk space and organize files on macOS. Cleans dev caches, git worktrees, and renames files using Apple Intelligence (100% local). |
| [mac-on-windows](mac-on-windows/SKILL.md) | Make a Windows host feel like macOS — Cmd-based shortcuts, emacs text navigation, Spotlight, Quick Look, Mission Control and Spaces. Starts by detecting whether Command arrives as Win or Alt, since that decides the whole keymap. Carries the ceilings: Win+L is uninterceptable without a policy change, AutoHotkey's AltTab takes exactly one L/R-qualified modifier, and a Magic Trackpad behind a KVM forwards no multi-touch at all. |
| [windows-organizer](windows-organizer/SKILL.md) | Free disk space and organize files on Windows (locally or over Tailscale SSH). Cleans dev/build caches, sorts Desktop/Downloads into the same canonical layout as `mac-organizer`, and reconciles duplicates against Google Drive with a report-only hash + mtime classification that never deletes. |
| [knowledge-organization](knowledge-organization/SKILL.md) | Unified knowledge system across local, iCloud, Google Drive, GitHub, and Notes. Compares PARA, Zettelkasten, Johnny Decimal, LYT — recommends the right method and sets up a cross-platform context graph. |
| [personal-brain](personal-brain/SKILL.md) | Set up a private Obsidian vault + brain repo with daily git backup and Apple Notes capture. |
| [pooria-photo](pooria-photo/SKILL.md) | Create or review natural, identity-faithful generated photos of Pooria Arab for websites, profiles, articles, and social posts. |
| [files-backup](files-backup/SKILL.md) | Back up text-based documents from iCloud/local to a private GitHub repo via daily cron. |
| [inbox-triage](inbox-triage/SKILL.md) | LLM-assisted inbox processing — Claude Haiku categorizes notes, suggests filenames and wiki-links, user approves before anything moves. |
| [agentic-commerce](agentic-commerce/SKILL.md) | Let an agent buy things safely: human approves every spend, hard caps live outside the prompt, payment rails are capability-routed and inert-by-default, credentials come from a selected integration (never env), secrets never leak. Covers the 2026 rails — x402, MPP, Stripe SPT/Link, Issuing, Projects, browser-checkout. |
| [social-launch-post](social-launch-post/SKILL.md) | Draft and cross-post a launch announcement with video across X/LinkedIn/Threads/Bluesky/Mastodon via the Typefully API — the presigned-upload header trap, per-platform post-shape differences (LinkedIn = single post only), and why X blocks automated publishing of link-containing posts (don't try to route around it). |
| [product-hunt-launch](product-hunt-launch/SKILL.md) | Prepare a Product Hunt launch or relaunch package — eligibility checks, submission copy, maker handles, review docs, real-UI assets, browser-assisted draft entry, launch-day monitoring, and recap. |
| [reddit-ads](reddit-ads/SKILL.md) | Set up Reddit Ads pixel tracking and server-side Conversions API (CAPI) purchase attribution — Developer Portal app creation, the Conversion Access Token vs OAuth token distinction, the CAPI v3 endpoint shape, and client/server event dedup. |
| [ads-google](ads-google/SKILL.md) | Wire up Google Ads + GA4 conversion tracking — the three layers (GA4 client gtag, server-side Measurement Protocol, Ads conversion import from GA4), the MP `api_secret` that silently no-ops a server purchase when unset (distinct from the `G-XXXX` measurement id), importing/enabling/marking-Primary the GA4 conversion action, Google Ads API launch nuances (`containsEuPoliticalAdvertising` now required, text-only search ads, OAuth-project enablement), and server-side verification via the GA4 Data API + GAQL + the MP `/debug/mp/collect` endpoint. |
| [ads-meta](ads-meta/SKILL.md) | Set up Meta (Facebook) Pixel + server-side Conversions API (CAPI) purchase tracking — client Pixel and server CAPI shipped together with a shared `event_id` dedup key, the CAPI access token that silently no-ops when unset, why you fire on hashed-email match (not on `fbclid`) so organic purchases still report, advanced matching for match quality, the app-capability 400s (Advanced Access for `ads_management`, promotable Page), and server-side verification via the Graph `stats`/`last_fired_time` endpoints. |
| [ad-experiments](ad-experiments/SKILL.md) | Run paid-ad experiments on a small budget so you learn *which* variable drives signups and *why* — hyper-specific one-audience×geo×creative experiments from a written hypothesis, proving the cheapest conversion (free signup) before the expensive one, and judging on server-side truth reconciled against payment-provider ground truth, not dashboard vanity. Platform-agnostic; pairs with `ads-google`/`ads-meta`/`reddit-ads`. |
| [ad-auto-optimizer](ad-auto-optimizer/SKILL.md) | Operate live paid-ad experiments as a scheduled autonomous loop — read every channel, then adjust within hard guardrails, auto-applying only safe/reversible levers and *recommending* the learning-resetting ones. The lever tree (creative kill-gate, audience widen, LP test, budget/bid tilt, feature-utilization audit), anti-thrash + cap guardrails, loud escalation on the events that matter, and the operating truths that only surface after many cycles: platform reporting is unreliable (verify before acting), delivery-solved ≠ conversion-solved, you can't optimize what you can't measure, and budget optimizers concentrate spend. Pairs with `ad-experiments`. |
| [ad-creative-generation](ad-creative-generation/SKILL.md) | Generate photoreal ad-creative *images* with an AI image model (gpt-image-1 style) — `generations` vs `edits`, feeding a brand logo + a competitor ad as STYLE references (recreate the style, never clone marks/faces), photoreal lifestyle/product-in-context/UGC prompt patterns, the hard rule that image models garble exact text/logos/UI (those are templates, not gen), a vision-model VISUAL-QA loop that catches garbled text / warped hands-faces-objects / wrong logos and auto-regenerates failures, and batch/library organization. |
| [ad-creative-templates](ad-creative-templates/SKILL.md) | Pixel-perfect, text-precise, on-brand ad creatives at scale via HTML/CSS template → headless screenshot (many data-driven versions from one template) — when to template vs AI-gen, a catalog of high-performing styles (testimonial+pills, iMessage/social-native, bold-text-on-color, product-UI-in-context, discount/offer, founder/UGC, review-card, big-stat), Playwright/Puppeteer render at feed (1080×1080) and story (1080×1920) sizes, keeping logo/colors/fonts exact, and the truthfulness rule (real testimonials/reviews/stats/features only). |
| [ad-image-prompt-library](ad-image-prompt-library/SKILL.md) | A copy-paste library of proven ad-creative recipes — Part A: cheap pixel-exact HTML-mockup formats (the high-performing "iOS Ads" family: iMessage / Apple Notes / ChatGPT / WhatsApp chat-reveals + iPhone lock-screen notification), each with why-it-performs, the UI to reproduce, and a fill-in template; Part B: AI-image-gen prompt skeletons (photo-of-a-screen hyper-realism, Instagram pop-out, stepping-out-of-the-phone, cinematic character board, isometric figurine, OOTD collage, anime/GTA poster grid) plus the SLCT realism levers, text-in-quotes rule, and negative-prompt hygiene. Generic + reusable; pairs with `ad-creative-generation` and `ad-creative-templates`. |
| [localize-with-ai](localize-with-ai/SKILL.md) | Fully localize a codebase with next-intl + an LLM translation pipeline — locale-prefixed routing, per-namespace catalogs, a two-pass draft/QA-flag MT pipeline with real ICU validation, staged RTL/CJK layout work, and the non-obvious gotchas (French-source-content-hiding-as-English, per-file not per-locale freshness, auth error-code preservation). |
| [agentic-cli-npm-package](agentic-cli-npm-package/SKILL.md) | Scaffold and ship a companion tool for agentic coding CLIs as one package with three faces — a CLI, an npm library, and an MCP server — sharing a model-preference cascade core, auto-publishing to npm on a release branch. |
| [agent-harness-docs](agent-harness-docs/SKILL.md) | Author one set of agent-facing docs that work across every coding-agent harness — AGENTS.md as the single source of truth, thin per-harness pointers (CLAUDE.md, .cursor/rules, opencode.json, Codex/Gemini config), and a per-client MCP-setup section. Pairs with agentic-cli-npm-package. |
| [mcp-directory-submission](mcp-directory-submission/SKILL.md) | List a local/stdio MCP server on public directories — official registry (`server.json` + `mcp-publisher`), Smithery, Glama, PulseMCP, mcpservers.org, cursor.directory, mcp.so, Cline marketplace, mcp-get — which ones need a hosted endpoint (skip those for local-only servers) vs. accept plain npx-launched stdio, and the gotchas that cause silent rejections (100-char description cap, missing `mcpName` ownership field, npx multi-bin resolution, short-lived publish JWT). |
| [monday-app-submission](monday-app-submission/SKILL.md) | Drive a monday.com app from created to marketplace-submitted in the Developer Center UI — the long-form app management URL (a bare `/apps/manage/<appId>` 404s and looks like a wrong app id but is not), Live versions locking all branding behind New version → Draft → Promote to live, the icon crop dialog that opens zoomed in and silently crops square logos, the ~25-field workform in an iframe where Demo Link and How-to-use Link are required (record the demo before starting), verifying the install link via the 302 `oauth_payload_token` JWT, and why renaming the account URL logs out every user and must come last. |
| [cloudflare-domain-launch](cloudflare-domain-launch/SKILL.md) | Buy a domain and host a static site end-to-end from the CLI/API — Cloudflare Registrar registration, wrangler Pages deploy, custom-domain attachment, and the DNS/cert gotchas (Pages not auto-creating records, .dev HSTS preload, stale certs). |
| [regional-pricing-stripe](regional-pricing-stripe/SKILL.md) | Set up regional / PPP-adjusted pricing on Stripe — `currency_options` over coupons for a pre-checkout localized-price display, discount tiers per currency (not per country), percentages sourced from real PPP data. |
| [slack-mcp-browser-auth](slack-mcp-browser-auth/SKILL.md) | Install a no-app Slack MCP server using browser session tokens (xoxc + xoxd cookie), including the Enterprise Grid `invalid_auth` fix — no Slack app or admin approval needed. |
| [crabbox-worktree](crabbox-worktree/SKILL.md) | Offload per-worktree dev work (installs, builds, dev server) to a remote GCP VM via crabbox so your laptop stays cool — bakes a golden image and wires into worktree hooks. |
| [schengen-visa-application](schengen-visa-application/SKILL.md) | Prep a short-stay Schengen (type C) visa application from Canada — finds the right per-country handler, builds the document set from your own local folders, fills the EU form, stops before in-person submission. Zero PII stored. |

### Workspace utilities

| Skill | Description |
|-------|-------------|
| [changelog](changelog/SKILL.md) | Auto-generate a changelog from git commits since the last tag or ref. |
| [init-project](init-project/SKILL.md) | Auto-generate a CLAUDE.md for a new project by analyzing its structure, tooling, and conventions. |
| [stale-branches](stale-branches/SKILL.md) | List and clean up stale git branches (merged or inactive 30+ days). |
| [branch-deploy-convention](branch-deploy-convention/SKILL.md) | Standardise branch names onto `main` (staging) and `release` (production) without breaking a deploy. The silent-dead-trigger defect class, an org-wide sweep, the safe rename order, and the four blockers to check first. |
| [cloudflare-agent-credentials](cloudflare-agent-credentials/SKILL.md) | Get and manage Cloudflare API tokens for an agent fleet without asking a human each time. What cannot mint one (wrangler, OAuth, the MCP), the one permission that can, and minting narrow per-purpose tokens. |
| [cloudflare-worker-previews](cloudflare-worker-previews/SKILL.md) | Configure private-beta Worker Previews for pull requests, with branch-based URLs, safe staging bindings, live verification, sticky comments, cleanup, and dedicated test users. |
| [claude-handoff](claude-handoff/SKILL.md) | Hand off work to a background `claude` session and resume it cleanly. |
| [git-guardrails-claude-code](git-guardrails-claude-code/SKILL.md) | Set up Claude Code hooks that block dangerous git commands (push, reset --hard, clean). |
| [x-article-publisher](x-article-publisher/SKILL.md) | Publish X (Twitter) Articles from Markdown via browser automation. |
| [spec-issue](spec-issue/SKILL.md) | Turn a thin issue-tracker ticket into an implementation-ready spec — grounds every claim in real code, right-sizes detail, writes test cases. |
| [deploy-app-self-host](deploy-app-self-host/SKILL.md) | Self-host a containerized app (Postgres + S3-compatible object store + Redis) with Docker Compose, and smoke-test it. |
| [deploy-app-cloudflare](deploy-app-cloudflare/SKILL.md) | Deploy a containerized app to Cloudflare (Workers container + D1/R2/KV/Queues/Durable Objects) and smoke-test the live URL. |
| [deploy-app-gcp](deploy-app-gcp/SKILL.md) | Deploy a containerized app to GCP (Cloud Run + Cloud SQL + Memorystore + GCS) with Terraform, verify, then tear down. |
| [deploy-app-aws](deploy-app-aws/SKILL.md) | Deploy a containerized app to AWS (ECS Fargate + RDS + ElastiCache + S3 + ALB) with Terraform, verify, then tear down. |
| [deploy-app-azure](deploy-app-azure/SKILL.md) | Deploy a containerized app to Azure (Container Apps + Postgres + Cache for Redis + Blob) with Bicep, verify, then tear down. |

## Install

Via the [skills CLI](https://skills.sh). Skills live in this monorepo, so paths are `pooriaarab/skills/<skill>`.

```bash
# Everything in this repo
npx skills add pooriaarab/skills

# Life organizer suite (parent — installs all sub-skills)
npx skills add pooriaarab/skills/organizer

# An individual organizer sub-skill (see organizer/README.md for the full list)
npx skills add pooriaarab/skills/organizer/apple-notes

# An individual standalone skill — swap in any name from the table above
npx skills add pooriaarab/skills/eco-mode
npx skills add pooriaarab/skills/canada-census
npx skills add pooriaarab/skills/schengen-visa-application
npx skills add pooriaarab/skills/product-hunt-launch
```

## Data source
CO₂ rates from Jegham et al. arXiv:2505.09598 (2025). Claude Sonnet 4.6 = 0.85g CO₂/1K tokens.
