# pooriaarab/skills

Claude Code skills for AI-aware development and life organization.

## Skills

### Life organization (`organizer/`)

A coordinated suite for organizing across every digital surface — files, notes, mail, calendars, contacts, photos, social bookmarks, code. Run [`life-organizer`](organizer/life-organizer/SKILL.md) first to survey preferences and get a recommended sequence. See [`organizer/README.md`](organizer/README.md) for the full catalog (21 sub-skills) and [`organizer/DESIGN.md`](organizer/DESIGN.md) for architecture.

### Standalone

| Skill | Description |
|-------|-------------|
| [eco-mode](eco-mode/SKILL.md) | Cut token/CO₂ usage ~65% without quality loss. Caveman-inspired. |
| [eco-analyze](eco-analyze/SKILL.md) | `/eco-analyze` — calculate your real carbon footprint from Claude Code history |
| [multi-account-cli](multi-account-cli/SKILL.md) | One-command switching between work and personal accounts across gcloud, gws, Firebase, and Netlify. |
| [delegate-implementation](delegate-implementation/SKILL.md) | Orchestrator-implementer pattern for 10+ PR campaigns. Opus plans, Gemini Flash / Haiku / GPT-5 mini / Cursor Composer 2.5 implements. 50-80% cost savings vs all-Opus. |
| [agent-context-economy](agent-context-economy/SKILL.md) | Make a vertical agent cheaper AND more accurate by treating its context as an L1/L2/L3 cache: cache the static tool-definition prefix (~45% end-to-end cost cut, lossless), compress large tool results at insertion, lint write outputs, right-size tool count — each shipped off-by-default and promoted only through a gated before/after A/B. |
| [claude-code-context-diet](claude-code-context-diet/SKILL.md) | Cut the hidden per-request bloat the Claude Code CLI adds to every call — tool definitions, skill catalog, feature clusters you pay for whether or not you use them. Measure with `/context`, then trim via `settings.json`: disable unused feature clusters, deny heavy tools by name, demote rarely-used skills to user-invocable-only. Reversible, measured before/after. Client-side hygiene, distinct from agent-context-economy. |
| [canada-census](canada-census/SKILL.md) | Complete the Government of Canada Census of Population online via agent-browser — asks you each question in chat, fills the StatCan form, stops for review before submit. Zero PII stored. |
| [schengen-visa-application](schengen-visa-application/SKILL.md) | Prep a short-stay Schengen visa from Canada — finds the destination country's actual handler (no single "EU visa company"; consulate vs VFS/BLS vs a representing state's centre), builds the doc set from your own local files, drafts the employer support-letter request, fills the EU form, stops before the in-person biometrics appointment. Zero PII stored. |
| [spec-issue](spec-issue/SKILL.md) | Turn a thin Linear issue into an implementation-ready spec — grounds every claim in real code, right-sizes detail, writes test cases. |
| [release-notes](release-notes/SKILL.md) | Draft user-facing release notes from a branch diff — filters to user-facing changes, writes in your product's voice. |
| [app-screenshots](app-screenshots/SKILL.md) | Capture real web-app/extension UI headlessly and beautify it into store-ready framed screenshots + promo tiles — the mock-the-host-APIs capture recipe, the `data:`-URL compositor (why `file://` breaks), exact Chrome/Apple/Play/AMO sizes, and AI hero art for marketing tiles only (never fake the product UI). |
| [browser-extension](browser-extension/SKILL.md) | Build a cross-browser (Firefox + Chrome) MV3 web extension and submit it per store — one-manifest-two-browsers layout, the CSP traps that break wasm/workers (+ the same-origin-worker fix), on-device AI (Firefox `trial.ml` / Chrome Prompt API), `web-ext`, and the full AMO (incl. mandatory 2FA) + Chrome Web Store flow. |
| [bug-bash-setup](bug-bash-setup/SKILL.md) | Plan a bug bash — balanced no-overlap test-area assignments + plan/findings-log doc, from a tester roster and time budget. |
| [bug-bash-triage](bug-bash-triage/SKILL.md) | Triage raw bug-bash findings — reconcile against the test suite, build a consolidated triage doc, then (after approval) create issues. |
| [storybook-to-design-system](storybook-to-design-system/SKILL.md) | Turn co-located Storybook stories into a live in-app design-system gallery (you pick the route name) AND fan out parallel agents to reach ~100% coverage. Stories are the single source of truth; each renders in an isolated iframe so modals/loops/logs can't hijack the page. |
| [high-fidelity-ui-image-gen](high-fidelity-ui-image-gen/SKILL.md) | Render near-pixel-faithful UI mockups with an AI image model — the prompt recipe (~94-95/100 on isolated surfaces), grounding in real source, the multi-round eval loop, the honest fidelity ceiling, and when to screenshot real HTML instead. |
| [ci-build-speed](ci-build-speed/SKILL.md) | Make CI fast AND reliable for a Next.js + bun + Turborepo monorepo on GitHub Actions — profile to find the critical path (it's the build), cache everything, fix the build OOM (the `memoryBasedWorkersCount`-overrides-`cpus` gotcha + swap + free disk), build-once dedup, concurrency cancel, with the honest verdict on what moves wall-clock vs only CI minutes. |
| [embed-snippet-generator](embed-snippet-generator/SKILL.md) | Build AND verify a third-party embed/snippet catalog for a website builder or CMS with a "custom code" field — the two embed surfaces (head vs sandboxed section) and their differing tag/char-limit rules, a drill-down generator UX, and the technique everyone skips: prove each snippet RENDERS by reproducing the host's real sandbox iframe headless. Includes the gotchas — placeholder-id artifacts vs real bugs, provider embed-format drift (re-check current docs), logos via build-time manifest not runtime `onError` guessing, protocol-relative `//` in a null-origin `srcdoc`, per-account host subdomains, and why a "verified" badge is an anti-pattern. |
| [launch-video-generation](launch-video-generation/SKILL.md) | Plan and generate a short launch video — storyboard framework, wavespeed.ai API facts, the hard-won fix for scene transitions (image-to-video models anchor the scene to the input image, prompt only steers motion) and on-screen text/logos (composite real assets, don't generate them), and a $0-generation-spend path (HyperFrames) for whole-video native-app-mimicry concepts (a note, a chat thread, used as a self-aware ad). |
| [ship-a-product](ship-a-product/SKILL.md) | Orchestrator for idea → published launch post: sequences `build-from-template` → your own build process → `open-source-repo-prep` → `launch-seo` → `launch-video-generation` → `social-launch-post`. Points at each stage skill rather than duplicating them; enter wherever the project already is. |
| [launch-seo](launch-seo/SKILL.md) | Make a newly-live docs/marketing/product site discoverable and shareable — sitemap.xml, a real robots.txt (don't trust your host's silent default), canonical/Open Graph/Twitter Card meta, a favicon, and submitting the sitemap in Google Search Console. Covers the hostname-aware robots.txt trap when staging and production share one static-asset bundle. |
| [build-from-template](build-from-template/SKILL.md) | Bootstrap a web-app-shaped idea from `master-template-cloudflare` (Next.js on Workers/OpenNext, D1, R2, KV, Queues, Cron, Better Auth) instead of starting from scratch. |
| [open-source-repo-prep](open-source-repo-prep/SKILL.md) | Prepare a repo for real open-source use — LICENSE/CODE_OF_CONDUCT/CONTRIBUTING/CODEOWNERS/CI, GitHub branch protection that actually restricts merges (the `gh api` JSON-payload gotcha, the `allow_force_pushes` blocks-admins-too gotcha), and how to scrub something from already-public history if needed. |
| [social-launch-post](social-launch-post/SKILL.md) | Draft and cross-post a launch announcement with video across X/LinkedIn/Threads/Bluesky/Mastodon via the Typefully API — the presigned-upload header trap, per-platform post-shape differences (LinkedIn = single post only), and why X blocks automated publishing of link-containing posts (don't try to route around it). |
| [reddit-ads](reddit-ads/SKILL.md) | Set up Reddit Ads pixel tracking and server-side Conversions API (CAPI) purchase attribution — Developer Portal app creation, the Conversion Access Token vs OAuth token distinction, the CAPI v3 endpoint shape, and client/server event dedup. |
| [google-ads](google-ads/SKILL.md) | Wire up Google Ads + GA4 conversion tracking — the three layers (GA4 client gtag, server-side Measurement Protocol, Ads conversion import from GA4), the MP `api_secret` that silently no-ops a server purchase when unset (distinct from the `G-XXXX` measurement id), importing/enabling/marking-Primary the GA4 conversion action, Google Ads API launch nuances (`containsEuPoliticalAdvertising` now required, text-only search ads, OAuth-project enablement), and server-side verification via the GA4 Data API + GAQL + the MP `/debug/mp/collect` endpoint. |
| [meta-ads](meta-ads/SKILL.md) | Set up Meta (Facebook) Pixel + server-side Conversions API (CAPI) purchase tracking — client Pixel and server CAPI shipped together with a shared `event_id` dedup key, the CAPI access token that silently no-ops when unset, why you fire on hashed-email match (not on `fbclid`) so organic purchases still report, advanced matching for match quality, the app-capability 400s (Advanced Access for `ads_management`, promotable Page), and server-side verification via the Graph `stats`/`last_fired_time` endpoints. |
| [ad-experiments](ad-experiments/SKILL.md) | Run paid-ad experiments on a small budget so you learn *which* variable drives signups and *why* — hyper-specific one-audience×geo×creative experiments from a written hypothesis, proving the cheapest conversion (free signup) before the expensive one, and judging on server-side truth reconciled against payment-provider ground truth, not dashboard vanity. Platform-agnostic; pairs with `google-ads`/`meta-ads`/`reddit-ads`. |
| [localize-with-ai](localize-with-ai/SKILL.md) | Fully localize a codebase with next-intl + an LLM translation pipeline — locale-prefixed routing, per-namespace catalogs, a two-pass draft/QA-flag MT pipeline with real ICU validation, staged RTL/CJK layout work, and the non-obvious gotchas (French-source-content-hiding-as-English, per-file not per-locale freshness, auth error-code preservation). |
| [agentic-cli-npm-package](agentic-cli-npm-package/SKILL.md) | Scaffold and ship a companion tool for agentic coding CLIs as one package with three faces — a CLI, an npm library, and an MCP server — sharing a model-preference cascade core, auto-publishing to npm on a release branch. |
| [mcp-directory-submission](mcp-directory-submission/SKILL.md) | List a local/stdio MCP server on public directories — official registry (`server.json` + `mcp-publisher`), Smithery, Glama, PulseMCP, mcpservers.org, cursor.directory, mcp.so, Cline marketplace, mcp-get — which ones need a hosted endpoint (skip those for local-only servers) vs. accept plain npx-launched stdio, and the gotchas that cause silent rejections (100-char description cap, missing `mcpName` ownership field, npx multi-bin resolution, short-lived publish JWT). |
| [cloudflare-domain-launch](cloudflare-domain-launch/SKILL.md) | Buy a domain and host a static site end-to-end from the CLI/API — Cloudflare Registrar registration, wrangler Pages deploy, custom-domain attachment, and the DNS/cert gotchas (Pages not auto-creating records, .dev HSTS preload, stale certs). |
| [regional-pricing-stripe](regional-pricing-stripe/SKILL.md) | Set up regional / PPP-adjusted pricing on Stripe — `currency_options` over coupons for a pre-checkout localized-price display, discount tiers per currency (not per country), percentages sourced from real PPP data. |
| [slack-mcp-browser-auth](slack-mcp-browser-auth/SKILL.md) | Install a no-app Slack MCP server using browser session tokens (xoxc + xoxd cookie), including the Enterprise Grid `invalid_auth` fix — no Slack app or admin approval needed. |
| [crabbox-worktree](crabbox-worktree/SKILL.md) | Offload per-worktree dev work (installs, builds, dev server) to a remote GCP VM via crabbox so your laptop stays cool — bakes a golden image and wires into worktree hooks. |
| [schengen-visa-application](schengen-visa-application/SKILL.md) | Prep a short-stay Schengen (type C) visa application from Canada — finds the right per-country handler, builds the document set from your own local folders, fills the EU form, stops before in-person submission. Zero PII stored. |

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
```

## Data source
CO₂ rates from Jegham et al. arXiv:2505.09598 (2025). Claude Sonnet 4.6 = 0.85g CO₂/1K tokens.
