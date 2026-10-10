---
name: website-directory-submission
description: "Submit a live website to free web directories for SEO backlinks, referral traffic, and GEO/AI visibility — the tiered directory table (launch platforms, startup directories, SaaS directories, review sites, AI-tool directories) with DR, link type, cost, and gate per directory, the one submission packet prepared once and pasted everywhere, the order of operations (tier-1 first, GitHub-based submissions as PRs, human-gated forms last), plus the MCP-directory path for sites that ship a hosted /mcp endpoint (remote-only registry publish, awesome-remote-mcp-servers, Glama, mcp.so). Use when a site is live and needs directory backlinks, when someone asks 'where should we list this', or after launch-seo/geo-aeo in the ship-a-product pipeline."
---

# website-directory-submission

A live site with no backlink profile ranks for nothing. Directory submissions
fix the cold start: each listing is one backlink plus a trickle of referral
traffic, and the AI-tool directories double as GEO surface (they feed the
answer engines that cite tools). This skill is the directory counterpart to
`launch-seo` (search consoles) and `geo-aeo` (quotability): same stage of the
pipeline, different destinations.

Run this after `launch-seo` + `geo-aeo`, once the site is live with real pages.
A submission that points at a staging URL, a thin shell, or a 404 is worse
than no submission — directories reject it and some never let you resubmit.

## 0. Prepare the packet once, paste it everywhere

Every directory asks for the same fields. Write them once, keep them in the
repo (see `scripts/directory-submission` in `pooriaarab/scripts` for the
generator), and paste per directory:

- **Name** (site name, no superlatives)
- **Tagline** (one line, ≤60 chars — most forms cap it)
- **Short description** (≤260 chars)
- **Long description** (≤500 chars, what it does + who it is for)
- **URL** (production canonical, `https://`, no trailing slash unless the site serves one)
- **Category** (closest fit per directory taxonomy)
- **Tags** (3–5, lowercase, no spam)
- **Contact email** (a monitored alias, not a personal inbox)
- **Logo** (PNG ≥256px; some directories want 400×400)
- **Screenshots** (2–4 real product pixels, 1270×760 or the directory's size — never mockups presented as UI)
- **Pricing** (Free / Freemium / Paid + one line)
- **Socials** (X, GitHub, LinkedIn — only accounts that exist)

Track every submission: directory, date, status, approval ETA. Most take 1–4
weeks. A `submissions.csv` next to the packet is enough.

## 1. Tier 1 — do these first (DR 60+, free tier)

Tier 1 carries ~80% of the SEO value. DR figures below are approximate (Ahrefs,
mid-2026) and drift — re-check before you quote them anywhere that matters.

### Launch platforms

| Directory | DR | Link | Free tier | Gate / note |
|---|---|---|---|---|
| [Product Hunt](https://www.producthunt.com) | 91 | nofollow, high authority | Free | Full launch ops — see `product-hunt-launch`. One launch per product per ~6 months. |
| [BetaList](https://betalist.com/submit) | 67 | dofollow | Free / $129 featured | Pre-launch or recently launched only. Older products get rejected. |
| [Peerlist Launchpad](https://peerlist.io) | 64 | nofollow | Free | Weekly launchpad (Wed–Sun). Dev/design audience. |
| [TinyLaunch](https://www.tinylaunch.com) | 55 | conditional dofollow | Free + paid tier | Low friction, quick approval. |

### Startup directories

| Directory | DR | Link | Free tier | Gate / note |
|---|---|---|---|---|
| [Crunchbase](https://www.crunchbase.com) | 93 | nofollow, very high authority | Free basic profile | Social auth required. Investor-facing credibility. |
| [F6S](https://www.f6s.com) | 72 | dofollow | Free | Startup ecosystem profile; also unlocks accelerator/program discovery. |
| [StartupRanking](https://www.startupranking.com) | 60 | conditional dofollow | Free + paid tier | Rank-based; traffic-linked after listing. |
| [StartupBlink](https://www.startupblink.com) | 56 | dofollow | Free | Global startup map entry. |
| [StartupStash](https://startupstash.com) | 55 | dofollow | Free | Curated; needs a real product page. |

### SaaS / software directories

| Directory | DR | Link | Free tier | Gate / note |
|---|---|---|---|---|
| [AlternativeTo](https://alternativeto.net) | 76 | dofollow | Free / paid boost | List as an alternative to named competitors. Ranks for "alternative to X". |
| [SaaSHub](https://www.saashub.com) | 76 | dofollow | Free / paid boost | Register, then submit. Comparison traffic. |
| [Slant](https://slant.co) | 58 | nofollow | Free | Community-curated comparisons; answer honestly. |
| [Alternative.me](https://alternative.me) | 55 | dofollow | Free | Lighter-weight AlternativeTo. |
| [SaaSWorthy](https://www.saasworthy.com) | 52 | dofollow | Free + paid tier | Vendor form, quick listing. |
| [SoftwareSuggest](https://www.softwaresuggest.com) | 53 | dofollow | Free + paid tier | Category-gated; pick the closest software category. |
| [Crozdesk](https://crozdesk.com) | 51 | dofollow | Free + paid tier | Ranking-based software discovery. |

### Review sites (high friction, high authority)

| Directory | DR | Link | Free tier | Gate / note |
|---|---|---|---|---|
| [Capterra](https://www.capterra.com) | 93 | nofollow | Free + paid leads | Gartner Digital Markets. One vendor onboarding flows to Capterra + GetApp + Software Advice — do it once, get three listings. |
| [SourceForge](https://sourceforge.net) | 93 | dofollow | Free | Legacy but trusted. Claim + complete the profile. |
| [G2](https://www.g2.com) | 92 | nofollow | Free basic profile | Needs verified-user reviews for visibility; list first, drive reviews later. |
| [TrustRadius](https://www.trustradius.com) | 85 | nofollow | Free + paid tier | Review-gated like G2. |
| [Trustpilot](https://www.trustpilot.com) | 92 | nofollow | Free | Company reviews; invite real users only. |
| [GetApp](https://www.getapp.com) | 76 | nofollow | Free + paid tier | Same Gartner vendor flow as Capterra. |
| [Software Advice](https://www.softwareadvice.com) | 66 | nofollow | Free | Third Gartner property, same flow. |

## 2. AI-tool / GEO directories

These matter twice: backlinks for SEO plus citations for answer engines. Only
submit products with a genuine AI surface (an MCP endpoint, an agent-ready API,
or AI features) — a plain CRUD site listed as an "AI tool" gets removed and
burns the account.

| Directory | DR | Link | Free tier | Gate / note |
|---|---|---|---|---|
| [There's An AI For That](https://theresanaiforthat.com) | 62 | dofollow | Free + $49 featured | Largest AI directory. Free tier is slow; featured jumps the queue. |
| [FutureTools](https://futuretools.io) | 55 | dofollow | Free | Matt Wolfe's directory; curated, AI-only. |
| [PeerPush](https://peerpush.net) | 50 | dofollow | Free | GEO-friendly: structured data for AI readers. |
| [Futurepedia](https://www.futurepedia.io) | 42 | conditional dofollow | Free + paid tier | Large index, freemium listing. |
| [AIToolkit](https://aitoolkit.org) | 35 | dofollow | Free | Quick approval. |
| [Dang.ai](https://dang.ai) | 35 | dofollow | Free | Simple submit form. |
| [TopApps.ai](https://topapps.ai) | 30 | dofollow | Free | AI app index. |
| [aitools.fyi](https://aitools.fyi) | 27 | dofollow | Free | Long tail, fast listing. |
| [Easy With AI](https://easywithai.com) | 27 | dofollow | Free | Long tail, fast listing. |

## 3. Long tail — batch second (dofollow, free)

Lower DR each, near-zero marginal cost once the packet exists. Work top-down
by DR; stop when the approval rate drops below the time cost.

Launch: [Uneed](https://www.uneed.best) (DR 32) · [Fazier](https://fazier.com)
(DR 45) · [Launched.io](https://launched.io) (DR 35) · [MicroLaunch](https://microlaunch.net)
(DR 30) · [Open Launch](https://openlaunch.ai) (DR 30) · [Launch Vault](https://www.launchvault.dev)
(DR 30) · [NextGen Tools](https://www.nxgntools.com) (DR 25).

Startup: [SideProjectors](https://www.sideprojectors.com) (DR 45) ·
[StartupBuffer](https://startupbuffer.com) (DR 44) · [Launching Next](https://www.launchingnext.com)
(DR 43) · [PitchWall](https://pitchwall.co) (DA 48) · [StartupBase](https://startupbase.io)
(DR 35) · [10words](https://10words.io) (DR 20, 10-word pitch) ·
[Startups FYI](https://www.startups.fyi) (DA 19) · [FeedMyStartup](https://feedmystartup.com)
(DR 18) · [PromoteProject](https://promoteproject.com) (DR 15).

SaaS: [GoodFirms](https://www.goodfirms.co) (DA 55) · [Serchen](https://www.serchen.com)
(DA 49) · [SoftwareWorld](https://www.softwareworld.co) (DR 40) · [ToolSalad](https://toolsalad.com)
(DR 35) · [Hive Index](https://thehiveindex.com) (DA 31).

## 4. MCP directories — for sites with a hosted /mcp endpoint

A directory site that ships a Streamable HTTP MCP endpoint (like the
directory-template `/mcp` route) is listable as a **remote MCP server** — no
npm package needed. Verify the endpoint first with a real `initialize` →
`tools/list` handshake against the production URL; a listing for a dead
endpoint is worse than none.

| Directory | Entry point | Gate / note |
|---|---|---|
| Official MCP registry | `server.json` with `remotes[]` → `mcp-publisher publish` | Remote-only is supported: `{"type": "streamable-http", "url": "https://site/mcp"}`. Namespace `io.github.<user>/*` via GitHub login. Highest leverage — PulseMCP/Glama auto-ingest from it. See `mcp-directory-submission` §1. |
| [awesome-remote-mcp-servers](https://github.com/punkpeye/awesome-remote-mcp-servers) | GitHub PR to the README | Specifically for hosted/remote servers — where punkpeye's list redirects remote-only entries. Entry = name + URL + Glama connector badge + one-line description under the closest category, alphabetical. |
| [Glama](https://glama.ai/mcp/servers) | Web form ("Add server") + auto-crawl | Login required. Favours repos with a real README + install snippet. |
| [mcp.so](https://mcp.so) | GitHub issue on `chatmcp/mcp-directory` | Fill the template: name, description, repo URL, client-config JSON block. |
| [Smithery](https://smithery.ai/new) | Web flow, URL method | For already-hosted servers. Login required. |
| [mcpservers.org](https://mcpservers.org) | Site submit flow | Community index; check the current submit path before spending time. |
| [FindMCP](https://findmcp.dev/submit) | Public form | Low friction. |
| [MCP Hunt](https://mcp-hunt.com) | Site submit flow | Launch-style MCP index. |
| [mcp.directory](https://mcp.directory) | Claim auto-listing | Check for an existing auto-generated entry first. |
| [Cline MCP Marketplace](https://github.com/cline/mcp-marketplace) | GitHub issue | Needs a 400×400 PNG logo; quality-gated on traction. Defer for brand-new servers. |
| PulseMCP | — | Submissions paused (mid-2026); ingests the official registry. Publish to the registry and wait. |
| [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | GitHub PR | Use the ☁️ cloud-hosted marker for remote-only servers. See `mcp-directory-submission` §2. |
| [mcp.tc](https://mcp.tc) | `POST https://mcp.tc/submit` | JSON `{url, note}`, no account; a person reviews before the link goes live. |
| [AllMCPs](https://allmcps.com) | `submit_mcp_server` tool on their own MCP endpoint | Contact email required; hosting their badge verifies instantly. |
| [402.ad](https://402.ad) | `POST /v1/submit` | $0.10 USDC via x402 for the programmatic path, or a free form with questions. |
| [MCPCentral](https://mcpcentral.io) | `npx mcp-submit` | The CLI also files mcp.so issues and awesome-list PRs for local stdio servers; remote endpoints file the API rows directly. |
| [Docker MCP Registry](https://github.com/docker/mcp-registry) | GitHub PR | Needs a Dockerfile — only worth it for packaged servers. |
| [appcypher/awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers) | GitHub PR | One PR per suggestion, added at the bottom of the category; installable servers, not remote-only. |

Full per-directory mechanics (manifest schemas, CLI login quirks, the
`mcpName`/100-char traps for packaged servers) live in
`mcp-directory-submission` — this skill only adds the remote-server table and
the order. A remote-only server skips every npm/`mcpName`/MCPB step there.

## 5. Order of operations

1. **Packet first.** Write the §0 packet from real site copy. No placeholders —
   a submitted placeholder ships to a directory you do not control.
2. **Tier 1 web (§1).** DR 60+ first; Gartner triple as one onboarding.
3. **Registry + GitHub-based MCP (§4).** `server.json` → publish; one PR per
   awesome list; mcp.so issue. No human login beyond GitHub.
4. **AI/GEO directories (§2)** if the product has a real AI surface.
5. **Long tail (§3)** in DR order, batched.
6. **Human-gated forms last**: Product Hunt (see `product-hunt-launch`),
   BetaList, review-site profiles, Glama/Smithery logins. An agent prepares
   every field and asset; a human completes the logged-in submit.
7. **Channels outside the tier tables (§7)** wherever they fit — cheap to
   file, disproportionately GEO-friendly.

## 6. Gotchas

- **BetaList recency.** Only pre-launch or recently launched products. An
  established site gets rejected — do not burn the slot.
- **Product Hunt cadence.** Same product/root domain needs ~6 months plus a
  significant update between launches. Directory sister sites on different
  domains are separate products; the same domain twice is a relaunch.
- **Reciprocal-link traps.** Some long-tail directories (e.g. AITop10.tools
  free tier) require a backlink from your site. Trade carefully — a sitewide
  footer link to a low-quality directory costs more than the listing earns.
- **Gartner triple.** Capterra, GetApp, and Software Advice share one vendor
  onboarding. Do it once, claim all three; do not submit three times.
- **Review-gated sites.** G2/TrustRadius/Capterra listings without reviews are
  near-invisible. List, then drive a small number of honest verified-user
  reviews — never incentivized, never fake.
- **Category fit.** A listing under the wrong category earns no clicks and
  reads as spam. Pick the closest real category on each directory; skip the
  directory if none fits.
- **One account per directory.** Most directories ban duplicate listings from
  second accounts. Sister sites submit from the same account as separate
  products, never as duplicates of each other.
- **Resubmission bans.** Some directories never let you resubmit a rejected
  URL. Verify the site (200, real content, production canonical) before the
  first submit.

## 7. Channels outside the tier tables

Smaller surfaces that sit next to the numbered tiers. Cheap to file and
disproportionately GEO-friendly, so file them on every launch.

- **Human-edited web directories.** [Curlie](https://curlie.org) (DR 82, the
  DMOZ successor) and [Jasmine](https://www.jasminedirectory.com) (DR 62)
  still confer a real dofollow link. Both need an account and a patient
  editor review; pick the tightest category.
- **llms.txt registries.** If the site serves `/llms.txt`, file
  [llms-txt-hub](https://github.com/thedaviddias/llms-txt-hub) (a PR adds one
  MDX under `packages/content/data/websites/`) and
  [llmstxt.site](https://llmstxt.site/submit) (form + contact email). GEO
  surface, not backlinks.
- **Indie search engines.** [Mojeek](https://www.mojeek.com),
  [Wiby](https://wiby.me) (captcha), [Marginalia](https://marginalia-search.com),
  and [Entireweb](https://www.entireweb.com/free_submission/) are independent
  crawl paths, not Google. `GET https://web.archive.org/save/<url>` snapshots
  the site into the largest public archive with no account.
- **Agent-submittable APIs.** [submitby.ai](https://submitby.ai) (MCP tool or
  `POST /api/v1/submissions`; free with their badge on the site or $4.99,
  needs a verification file deployed on the domain),
  [directree](https://www.directree.io) (free agent API),
  [justlaunch](https://justlaunch.org) (paid REST API across ~35 platforms),
  [Launch Llama](https://tools.launchllama.co) (MCP opens drafts; the founder
  finishes the submit), [AI Directories](https://www.aidirectori.es) (partner
  key and fee, AI tools only).

The canonical machine-readable list — every tier above plus these channels,
with a `method` field per entry — lives in `pooriaarab/scripts` at
`scripts/directory-submission/directories.json`. `check.mjs` next to it
lists entries, probes their liveness, and prints a per-domain plan. New
directories go there first; the template's `data/directories.json` is a
synced copy.

## Checklist

- [ ] Packet written from real copy (§0), stored in the repo, no placeholders.
- [ ] Production URL verified: 200, real content, canonical correct.
- [ ] Tier-1 web directories submitted (§1), Gartner triple via one onboarding.
- [ ] `server.json` with `remotes[]` published to the official registry (if the site ships `/mcp`).
- [ ] Awesome-list PRs opened + mcp.so issue filed (if the site ships `/mcp`).
- [ ] AI/GEO directories submitted (if the product has a real AI surface).
- [ ] Long tail batched in DR order.
- [ ] `submissions.csv` tracks every directory, date, and status.
- [ ] Human-gated submits (Product Hunt, BetaList, logins) handed off with fields + assets ready.

## See also

- [`../launch-seo/SKILL.md`](../launch-seo/SKILL.md) — search-console submission; run before this.
- [`../geo-aeo/SKILL.md`](../geo-aeo/SKILL.md) — AI quotability; run before this.
- [`../product-hunt-launch/SKILL.md`](../product-hunt-launch/SKILL.md) — the Product Hunt row of §1, expanded into full launch ops.
- [`../mcp-directory-submission/SKILL.md`](../mcp-directory-submission/SKILL.md) — the MCP rows of §4, expanded (manifest schemas, CLI quirks, OAuth path).
- [`../launch-directory-site/SKILL.md`](../launch-directory-site/SKILL.md) — the directory-site launch pipeline; points here for backlinks.
- [`../ship-a-product/SKILL.md`](../ship-a-product/SKILL.md) — orchestrator; this is the distribution stage after `geo-aeo`.
