---
name: launch-analytics
description: "Wire measurement into a site/app that has a domain so you can see traffic and behaviour from day one — Google Analytics 4 (client pageviews + server-side Measurement Protocol) and Microsoft Clarity (session replay + heatmaps), env-gated so staging never pollutes the production property. The rule this skill enforces: every project with a domain needs all three of GA4, Microsoft Clarity, and Google Search Console before/at launch. GA4 + Clarity live here; Search Console is covered by launch-seo — this skill points at it, doesn't duplicate it. Use when a site or web app goes live, when auditing an existing project ('is analytics set up', 'do we have GA/Clarity/Search Console'), when asked to 'add Google Analytics', 'add Clarity', 'set up measurement/tracking', or as the measurement stage of ship-a-product."
---

# launch-analytics

**The rule:** any project with a domain gets all three before you announce it —

1. **Google Analytics 4** (traffic / conversions) — this skill
2. **Microsoft Clarity** (session replay + heatmaps, free) — this skill
3. **Google Search Console** (index coverage, queries) — see `launch-seo` §6, not duplicated here

Skip for CLI/library-only projects with no hosted site. If it has a domain people load in a browser, it needs all three.

## Do NOT hardcode tags into an app shell

The single most common mistake: pasting the GA4 `gtag.js` / Clarity `<script>` snippet into `index.html` of the web app.

- **MV3 browser extensions block external `<script>` tags via CSP** — the tags silently never run. Clarity (external-script-only) *cannot* run inside an extension context at all; it's web-page-only.
- If the app already tracks via a bundled library (posthog-js, a GA wrapper), a second `<script>` loader **double-fires** every pageview and corrupts the numbers.

Instead: inject the snippets **server-side into the rendered landing/marketing page**, gated on env vars, and let the app bundle handle in-app events. One loader per page, config-driven, never hardcoded.

## Google Analytics 4

Two independent paths — set up both:

- **Client (gtag.js)** — pageviews from real web pages. Needs the **Measurement ID** `G-XXXXXXXX` (GA4 Admin → Data Streams → your web stream). Inject via the env-gated server render above.
- **Server (Measurement Protocol)** — backend events (signups, purchases, webhook-driven) the browser never sees. Needs the Measurement ID **and** an **API secret**: GA4 Admin → Data Streams → your stream → **Measurement Protocol API secrets** → **Create**. POST events to `https://www.google-analytics.com/mp/collect?measurement_id=…&api_secret=…`.

Store the Measurement ID as a **public var** (it ships to the browser anyway); store the API secret as a **secret** (`wrangler secret put GA4_API_SECRET --env production`, or your platform's secret store). Gate the code on both — `if (!measurementId || !apiSecret) return;` — so an unconfigured env is a clean no-op, not a crash.

### Verify GA4 without waiting for the dashboard

Server-side Measurement Protocol is fire-and-forget — a bad key fails silently. Validate the credential + event shape against Google's debug endpoint:

```sh
curl -s -X POST \
  "https://www.google-analytics.com/debug/mp/collect?measurement_id=G-XXXXXXXX&api_secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"client_id":"verify.1","events":[{"name":"test_event","params":{"engagement_time_msec":"1"}}]}'
```

`{"validationMessages": []}` (empty) = measurement ID + API secret + event are all valid. Any entry in the array names the exact problem. Then confirm real events in **GA4 → Reports → Realtime** (the `/debug/` endpoint validates but does **not** record).

## Microsoft Clarity

Free session replay + heatmaps, no sampling. clarity.microsoft.com → create a project → copy the **project ID** (short alphanumeric, e.g. `xzu8jbuvn3`). Inject its snippet the same env-gated, server-rendered way as GA4 client. **Web pages only** — the loader is an external script, so it cannot run inside an MV3 extension; keep it on the landing/marketing site.

## Per-environment discipline

Set the real IDs on **production only**. Leave staging/preview **unset** so their traffic never lands in the production GA4 property or Clarity project. Env-gating makes this automatic: no ID → no injection. (If you genuinely want staging analytics, use a *separate* GA4 property / Clarity project, never the prod IDs.)

## Verification

- `curl` the live landing page and grep for the Measurement ID and Clarity project ID actually present in the HTML — "the PR merged" is not proof it rendered.
- GA4 server MP: the `/debug/mp/collect` check above returns `{"validationMessages": []}`.
- Edge caches lag a few seconds after a fresh deploy — a missing snippet immediately post-deploy isn't necessarily broken; recheck once.

## Checklist

- [ ] GA4 client (gtag) injected on real web pages, env-gated, not hardcoded in an app/extension shell.
- [ ] GA4 Measurement Protocol wired for server-side events (Measurement ID var + API secret).
- [ ] GA4 verified: `/debug/mp/collect` returns `{"validationMessages": []}`, and Realtime shows events.
- [ ] Microsoft Clarity project created, snippet on the web/landing pages (not the extension).
- [ ] Production IDs on production only; staging left unset (or a separate property).
- [ ] Google Search Console done via `launch-seo` §6 (property added, ownership verified, sitemap submitted).
- [ ] Verified live with `curl`, not just a merged PR.

## See also

- `launch-seo` — Google Search Console, sitemap, robots.txt, OG/Twitter meta. The third leg of the domain-measurement rule.
- `ship-a-product` — the launch pipeline this is a stage of.
