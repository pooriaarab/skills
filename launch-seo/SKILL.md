---
name: launch-seo
description: Make a newly-live docs/marketing/product site discoverable by search engines and shareable on social — sitemap.xml, a real robots.txt (not whatever your host injects by default), canonical/Open Graph/Twitter Card meta, a favicon, and submitting the sitemap to Google Search Console, Bing Webmaster Tools, and Yandex Webmaster. Use when a site just went live for the first time, before or right after "launch-video-generation"/"social-launch-post" in the ship-a-product pipeline, or whenever someone asks "is this SEO-set-up", "add a sitemap", "submit to Google Search Console", "why does my link preview look bare when I share it".
---

# launch-seo

A site can be fully built and deployed and still be invisible to search and bare when shared — none of that happens automatically. This is the checklist for making it discoverable, run once when a site first goes public (and again whenever new top-level pages are added).

## When to use

- A docs/marketing/product site just deployed to a real domain for the first time.
- Someone asks to "submit to Google Search Console", "check our SEO", "add a sitemap", or notices link shares (Slack/Twitter/LinkedIn) render with no title/description/image.
- Stage between `open-source-repo-prep` (repo is public-ready) and `launch-video-generation`/`social-launch-post` (announcing it) in the `ship-a-product` pipeline — the site should be discoverable and shareable *before* you point an announcement at it.

## Don't assume your host gives you a real robots.txt

Some edge platforms (Cloudflare zones are the common case) silently inject their **own generic default `robots.txt`** — often a legal/AI-crawler content-signals notice with zero real crawl directives and no `Sitemap:` line — for any zone that doesn't serve its own. It returns `200` and looks plausible at a glance, which is exactly why it's easy to miss: check the *content*, not just the status code, before assuming your robots.txt is real.

```bash
curl -s https://your-domain.com/robots.txt
```

If it's not something you wrote, you don't have one yet.

## 1. `sitemap.xml`

A flat `<urlset>` listing every real page with an absolute canonical URL — don't invent extensionless-vs-.html ambiguity, list whatever URL form your site actually serves with a `200` (verify with `curl -s -o /dev/null -w "%{http_code}\n" <url>` for both forms if your static host does automatic extension-stripping/redirecting — Cloudflare Workers Static Assets' default `html_handling` strips `.html` and 307s the suffixed form, for example; always list and link to the form that resolves directly, not the one that redirects).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.com/docs/quickstart</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- one <url> per real page -->
</urlset>
```

## 2. A real `robots.txt` with a `Sitemap:` line

```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

**If staging and production share the same static-asset bundle** (a common setup: one Worker/build serving both a preview subdomain and the real domain from the same `site/`/`dist/` directory), a single static `robots.txt` file can't differ per hostname — you'd either index the staging preview as duplicate content, or block the real domain by accident. Handle it in code instead of as a static file: intercept the request at the edge (a Worker `fetch` handler, a middleware, whatever your platform's request-hook is) and branch on `request.url`'s hostname — permissive + `Sitemap:` line for the real domain, blanket `Disallow: /` for every preview/staging hostname.

## 3. Canonical, Open Graph, and Twitter Card meta — every page

Without these, link shares in Slack/Twitter/LinkedIn/iMessage render with no title, no description, no image — just a bare URL. Add to every page's `<head>`, using that page's real absolute canonical URL:

```html
<link rel="canonical" href="https://your-domain.com/docs/quickstart">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Your Product">
<meta property="og:title" content="Same as <title>">
<meta property="og:description" content="Same as meta description">
<meta property="og:url" content="https://your-domain.com/docs/quickstart">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Same as <title>">
<meta name="twitter:description" content="Same as meta description">
```

`twitter:card content="summary"` (no image) is fine and honest if you don't have a dedicated 1200×630 OG banner asset yet — don't reference an `og:image` you don't actually have; a missing declared image is worse than none (broken-image icon in the unfurl). A proper banner is a `high-fidelity-ui-image-gen`/`app-screenshots`-shaped follow-up, not a blocker for shipping the rest of this.

## 4. Favicon

If there isn't one, a minimal hand-written SVG monogram is enough to stop `favicon.ico: 404` and get a real browser-tab icon — doesn't need a design tool:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#yourAccentColor"/>
  <text x="16" y="22" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">AB</text>
</svg>
```

Reference it with `<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">` — SVG favicons are widely supported; ship one instead of blocking on a real `.ico`/`.png` set.

## 5. Verify before submitting

After deploying, actually fetch every new file — don't assume the deploy worked:

```bash
curl -s https://your-domain.com/robots.txt        # your real one, has Sitemap:
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.com/sitemap.xml   # 200
curl -s https://your-domain.com/sitemap.xml | head  # valid XML, real URLs
curl -s https://your-domain.com/ | grep 'og:title'   # meta present
```

Edge caches can lag a few seconds right after a fresh deploy — a `404`/missing-meta result immediately post-deploy isn't necessarily broken, recheck once before debugging.

## 6. Submit to search engines — Google, Bing, and Yandex

Don't stop at Google. Bing Webmaster Tools feeds Bing, DuckDuckGo, Yahoo, and Ecosia from one submission, and Yandex Webmaster covers Yandex's own index. All three are free, and all three verify ownership the same three ways (DNS record, HTML meta tag, or uploaded file — DNS is the usual path if you already control DNS).

1. **Google Search Console** — https://search.google.com/search-console
   - Add the property using the root domain URL (`https://your-domain.com/`), not a specific page.
   - Verify ownership.
   - Sitemaps → submit `https://your-domain.com/sitemap.xml`.
2. **Bing Webmaster Tools** — https://www.bing.com/webmasters
   - Fastest path: **"Import from Google Search Console"** — it pulls in the verified property and its sitemaps in one step. Otherwise: add the site manually, verify, Sitemaps → submit the same `sitemap.xml` URL.
3. **Yandex Webmaster** — https://webmaster.yandex.com
   - Add site → verify ownership → Indexing → Sitemap files → submit the same `sitemap.xml` URL.

Optional accelerator: **IndexNow** — Bing and Yandex (not Google) support instant URL pinging instead of waiting for a recrawl: host a random key at `https://your-domain.com/{key}.txt`, then `GET https://api.indexnow.org/indexnow?url=<page-url>&key=<key>` whenever a page ships or changes. Worth wiring up for a frequently-published site (blog/docs/changelog); overkill for a mostly-static marketing page.

Crawl/index status is not instant in any of them — allow days, not minutes, before checking indexing results. A `site:your-domain.com` query in each engine is the quick "am I indexed yet" check.

## Checklist

- [ ] `robots.txt` content actually checked (not just status code) — confirmed it's yours, not a host-injected default.
- [ ] `sitemap.xml` lists every real page at the URL form that returns `200` directly (no redirect hop).
- [ ] `robots.txt` has a `Sitemap:` line pointing at it.
- [ ] Staging/preview hostnames get `Disallow: /` if they share a bundle with production.
- [ ] Every page: canonical link, favicon, OG + Twitter Card meta (title/description matching the page's own, no fabricated `og:image`).
- [ ] Verified live post-deploy with `curl`, not just "the PR merged".
- [ ] Sitemap submitted to all three consoles — Google Search Console, Bing Webmaster Tools (GSC import shortcut), Yandex Webmaster — property verified in each.

## See also

- [`../open-source-repo-prep/SKILL.md`](../open-source-repo-prep/SKILL.md) — repo-level public-readiness; this skill is the deployed-site-level counterpart.
- [`../social-launch-post/SKILL.md`](../social-launch-post/SKILL.md) — the OG/Twitter meta here is what makes that skill's cross-posted links render with a real preview instead of a bare URL.
- [`../launch-analytics/SKILL.md`](../launch-analytics/SKILL.md) — the measurement counterpart: GA4 + Microsoft Clarity. Together with the search-engine submissions above (§6), these are the things every domain project needs.
- [`../ship-a-product/SKILL.md`](../ship-a-product/SKILL.md) — orchestrator; this is the discoverability stage, done once the site is live and before announcing it.
