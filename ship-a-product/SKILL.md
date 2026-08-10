---
name: ship-a-product
description: "Orchestrator: sequence idea -> working code -> open-source-ready repo -> discoverable live site -> launch video -> published announcement, with optional Product Hunt launch. Points at the stage skills rather than duplicating them -- use this to decide which stage you're in and which skill to invoke next, not as a rigid must-do-all-in-order pipeline."
---

# ship-a-product

The stages, in order, each with its own dedicated skill. Not every project needs every stage — enter wherever the project actually is.

```
1. build-from-template     idea -> a running scaffold (web-app-shaped ideas only; skip for CLIs/libraries/extensions)
2. (your own build process) scaffold -> real working product (brainstorm/plan/implement/test -- not a single skill, it's the actual engineering work)
3. open-source-repo-prep   working code -> a repo ready for public visibility (LICENSE, CI, branch protection, README)
4. launch-seo              live site -> discoverable by search + shareable (sitemap, robots.txt, OG/Twitter meta, Google Search Console) -- only if there's a hosted site; skip for CLI-only/library-only projects with no deployed site
5. launch-analytics        live site -> measurable (GA4 client + server, Microsoft Clarity; enforces the GA4 + Clarity + Search Console rule for any domain) -- only if there's a hosted site
6. launch-video-generation storyboard -> a real launch/announcement video
7. social-launch-post      video + copy -> a draft ready to publish across X/LinkedIn/Threads/Bluesky/Mastodon
8. product-hunt-launch     significant release -> reviewed Product Hunt draft, assets, launch-day runbook, recap
```

## Deciding where to enter

- **Have an idea, no code yet, and it's web-app-shaped?** Start at `build-from-template`.
- **Have an idea that isn't a web app, or already know the shape doesn't fit a template?** Skip straight to building it (brainstorm → plan → implement, following whatever process/skills the codebase and toolchain call for), then rejoin at stage 3.
- **Already have working code, just need to go public?** Start at `open-source-repo-prep`.
- **Repo's public and there's a hosted site (docs/marketing/product)?** Run `launch-seo` then `launch-analytics` before announcing it — a search-invisible, bare-link-preview, un-measured launch undercuts the announcement and leaves you blind to whether it worked.
- **No hosted site (CLI/library only)?** Skip `launch-seo` and `launch-analytics`, go straight to `launch-video-generation`.
- **Site's discoverable already, need to announce it?** Start at `launch-video-generation`.
- **Have a video already, just need the post?** Start at `social-launch-post`.
- **Need a Product Hunt launch or relaunch?** Use `product-hunt-launch` after the release is real and the Product Hunt theme is significant enough to justify a launch.

## What this skill does NOT replace

Stage 2 — actually building the product — is real engineering work, not a template-fill exercise. Use the project's normal process for that (brainstorming, TDD, code review, whatever the codebase's own conventions are). This orchestrator exists to make sure the *surrounding* stages (repo hygiene, announcement, distribution) don't get skipped or reinvented each time, not to compress the actual build into a checklist.

## Cost/delegation shape across all stages

Every stage below benefits from the same pattern: judgment (architecture decisions, creative direction, what to say in the announcement) stays with the highest-tier model available; mechanical execution (writing boilerplate config files, running generation scripts, extracting content into structured data) delegates to a cheaper model. `launch-video-generation`'s fidelity-ladder idea (§6 there — free wireframe review before any paid step) generalizes: don't spend real time or money on a later stage until the earlier one is actually approved. Confirm the repo's OSS-ready before spending on a launch video; confirm the video's approved before spending on cross-platform posting; confirm a Product Hunt theme is significant and policy-compliant before creating a launch draft.
