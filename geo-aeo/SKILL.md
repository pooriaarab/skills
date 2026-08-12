---
name: geo-aeo
description: Make a live site discoverable, quotable, and usable by AI answer engines and agents — the layer beyond classic SEO. Covers llms.txt / llms-full.txt, per-page markdown mirrors, schema.org JSON-LD (SoftwareApplication, Product, FAQPage, BreadcrumbList, HowTo, Article), a WebMCP tool manifest, answer-first content structure, programmatic-SEO entity pages (per-platform / per-use-case / compare / alternatives), and free tools as discovery magnets. Use after launch-seo (classic SEO) whenever a site should be cited by ChatGPT / Claude / Perplexity / Google AI Overviews, driven by agents, or found through AI search. Triggers: "GEO", "AEO", "generative engine optimization", "answer engine optimization", "llms.txt", "make our site show up in ChatGPT/Perplexity", "structured data / JSON-LD", "webmcp", "programmatic SEO", "free tools for SEO", "AI can't find our product".
---

# geo-aeo

Classic SEO (see `launch-seo`) makes a site findable by crawlers and shareable as a link. GEO/AEO makes it **quotable by AI answer engines and usable by agents**. Different consumers, different artifacts.

- **GEO** = Generative Engine Optimization: get cited inside AI answers (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews).
- **AEO** = Answer Engine Optimization: structure content so a machine can lift a clean, correct answer.

Run this after `launch-seo`, once a site is live and has real pages. Re-run when you add pages, tools, or product surface.

## Why classic SEO is not enough (2026)

Answer engines don't rank ten blue links — they synthesize one answer and cite a few sources. To be one of those sources you need machine-readable facts (structured data), clean machine-readable copy (markdown mirrors, llms.txt), and content that answers the question in the first sentence. Agents go further: they want a manifest of what your tools do and how to call them (WebMCP). None of this ships by default.

## The checklist

### 1. `llms.txt` and `llms-full.txt`

The emerging convention (llmstxt.org): a plain-text map of your site for LLMs, served at the root.

- `/llms.txt` — short. Site name, one-line description, product summary, the key links (docs, tools, pricing), each with a one-line gloss.
- `/llms-full.txt` — the full version. Everything above plus expanded product facts, every tool with its URL, platforms/features, full pricing, and 6–10 real FAQ question/answer pairs written answer-first.

Serve as `text/plain`. In Next.js App Router, a `src/app/llms.txt/route.ts` route with `export const dynamic = 'force-static'` works; on a worker, branch on the path. Build the content from your shared constants so it can't drift from the site.

```
# ProductName

> One-line description.

## What it is
Two or three plain sentences. What it does, who it's for, the one thing that makes it different.

## Free tools
- [Tool name](https://site.com/tools/slug): one line on what it does.

## Plans
- Free: ...
- Pro ($X/month): ...

## Common questions
Q: ...
A: ...
```

### 2. Per-page markdown mirrors

Serve a clean `.md` version of each important page (e.g. `/tools/slug.md`). Strip nav, chrome, and scripts — just the heading, the answer, the content. LLMs and agents parse these far more reliably than rendered HTML. A route that returns the page's core copy as markdown is enough.

### 3. schema.org JSON-LD on every page type

Structured data is how a machine extracts facts without guessing. Emit `<script type="application/ld+json">` with the type that fits the page:

- **Home / product** → `SoftwareApplication` (+ `offers` for each plan) and/or `Product`.
- **FAQ pages** → `FAQPage` with every Q/A. This is the single highest-leverage one for AI answers and rich results.
- **Any nested page** → `BreadcrumbList`.
- **Tutorials / step content** → `HowTo`. **Blog/articles** → `Article` with author + date.

Keep the JSON-LD generated from the same data the page renders, so it never contradicts the visible copy (answer engines discount pages where structured data and text disagree). Validate with Google's Rich Results Test and schema.org's validator.

### 4. WebMCP manifest for agents

Expose a small JSON manifest (e.g. `/webmcp`) describing the site and its callable tools for AI agents: name, description, and a `tools[]` list of `{name, description, url}`, plus links to your `llms.txt`/`llms-full.txt`. This is early and the spec is moving, so keep it a plain, self-describing JSON document rather than over-engineering it.

### 5. Answer-first content structure

Write so the answer is liftable:

- Lead with the answer. First sentence states it; detail follows. Never bury it under a preamble.
- Add an FAQ block to money pages (pricing, product, per-use-case) — real questions, direct answers — and back it with `FAQPage` JSON-LD.
- Use plain, sentence-case headings that read like questions or claims a person would search.
- One idea per sentence. Concrete over vague. This overlaps heavily with the `humanizer` skill — run every page through it (below).

### 6. Programmatic SEO / GEO entity pages

Generate one page per entity in a set your audience searches. Templated layout, real per-entity copy, each with its own metadata + JSON-LD, all in the sitemap. Common axes:

- **Per platform/integration**: "X for {Platform}" across every platform you support.
- **Per use-case**: "{Product} for {job-to-be-done}".
- **Compare / alternatives**: "{Product} vs {alternative}", "{competitor} alternatives".

Use a dynamic route with `generateStaticParams` (Next) so they prerender as static pages. Rewrite copy per entity — near-duplicate thin pages get filtered by both search and answer engines.

### 7. Free tools as discovery magnets

Small, genuinely useful, no-signup tools (calculators, generators, checkers) rank and get cited far above marketing pages, and they're the kind of thing agents surface. Each tool is its own page with metadata, JSON-LD, and an entry in `llms.txt` and the WebMCP manifest. If a sibling product already has a tool library, port the logic and rewrite the copy for the new product — don't rebuild from scratch.

### 8. Humanizer pass (required before launch)

Answer engines and readers both discount obvious AI-slop. Run all copy through the `humanizer` skill: strip em dashes, AI vocabulary (seamless/robust/leverage/etc.), rule-of-three padding, negative parallelism, and hype. Plain, answer-first, human copy wins on both axes.

### 9. Keep the plumbing honest

- Every new route goes in `sitemap.xml` and the nav.
- Canonical URLs must point at the form that returns `200` (see `launch-seo`).
- `robots.txt` must allow AI crawlers you want citations from (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) unless you have a reason not to — blocking them removes you from their answers.

## Verify

```bash
curl -s https://site.com/llms.txt          # exists, real content
curl -s https://site.com/llms-full.txt
curl -s https://site.com/webmcp            # valid JSON manifest
curl -s https://site.com/tools/x.md        # clean markdown mirror
# then: Google Rich Results Test + schema.org validator on a few pages
```

Spot-check by asking an answer engine a question your page answers, and see whether it cites you.

## Where this fits

- Runs right after **`launch-seo`** (classic discoverability) in the **`ship-a-product`** pipeline.
- Pairs with **`humanizer`** (copy quality) and **`launch-analytics`** (measurement).
- The reusable pattern: build a Next.js `apps/website` (or equivalent), ship the artifacts above, deploy, verify. Portable across products — swap the constants, keep the structure.
