---
name: website-directory-submission
description: "Submit a live website to free web directories for SEO backlinks, referral traffic, and GEO/AI visibility — the tiered directory table (launch platforms, startup directories, SaaS directories, review sites, AI-tool directories) with DR, link type, cost, and gate per directory, the one submission packet prepared once and pasted everywhere, the order of operations (tier-1 first, GitHub-based submissions as PRs, human-gated forms last), plus the MCP-directory path for sites that ship a hosted /mcp endpoint (remote-only registry publish, awesome-remote-mcp-servers, Glama, mcp.so), free launchpads, awesome lists, API catalogs, dataset hosts and profile sites, the method for finding niche backlinks per site (associations, awesome lists, dataset hosts, resource-page curators), and the per-site submission ledger. Use when a site is live and needs directory backlinks, when someone asks 'where should we list this', or after launch-seo/geo-aeo in the ship-a-product pipeline."
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
| [altern.ai](https://altern.ai) | unverified | unverified | Free | Sign in with GitHub or Google, then submit at `/maker/submit/start`. Fees not shown on the page we read. |
| [AI Tools Directory](https://aitoolsdirectory.com) | unverified | unverified | Free + paid fast track | No account. A person reviews every tool, with no promise to publish. End-user AI tools only, clear pricing, no crypto. Not the same site as aitoolsdirectory.net. |

## 3. Long tail — batch second (dofollow, free)

Lower DR each, near-zero marginal cost once the packet exists. Work top-down
by DR; stop when the approval rate drops below the time cost.

Launch: [Uneed](https://www.uneed.best) (DR 32) · [Fazier](https://fazier.com)
(DR 45) · [Launched.io](https://launched.io) (DR 35) · [Open Launch](https://openlaunch.ai)
(DR 30) · [Launch Vault](https://www.launchvault.dev) (DR 30) ·
[NextGen Tools](https://www.nxgntools.com) (DR 25).
[MicroLaunch](https://microlaunch.net) went paid-only in 2026-11 — the launch
dialog offers Pro ($39) and Plus ($79) only, no free queue. Skip it.

Uneed's free path is a waiting line, not instant: the product needs a logo
uploaded on the Media tab before "Schedule your launch" enables, then "Join
the free waiting line" queues ~13 months out. Its `join-waiting-line` endpoint
429s after a burst of rapid clicks — space joins minutes apart, and upload the
logo by dispatching a synthetic `drop` event with a `DataTransfer` if the file
input is hidden. Free accounts hold ONE scheduled launch at a time — a second
join errors "upgrade to Pro for parallel launches", so a multi-site fleet needs
one account per site (or a paid plan). Fazier's free launch gates behind three approved comments on
other products plus its badge embedded in the homepage HTML — Verify Badge
fetches the page and looks for the embed anchor, so the site needs the chip
deployed before the check passes. Remote badge images count against the site
CSP: add the badge origin to `img-src` (submitby.ai, fazier.com) or the
security-headers E2E fails on the blocked image. Its Google OAuth popup is also blocked for
untrusted synthetic clicks; sign up by email and click the Gmail verify link,
or invoke the React `onClick` prop directly to force the OAuth navigation.

Startup: [SideProjectors](https://www.sideprojectors.com) (DR 45) ·
[StartupBuffer](https://startupbuffer.com) (DR 44) · [Launching Next](https://www.launchingnext.com)
(DR 43) · [PitchWall](https://pitchwall.co) (DA 48) · [StartupBase](https://startupbase.io)
(DR 35) · [10words](https://10words.io) (DR 20, 10-word pitch) ·
[Startups FYI](https://www.startups.fyi) (DA 19) · [FeedMyStartup](https://feedmystartup.com)
(DR 18) · [PromoteProject](https://promoteproject.com) (DR 15).

SaaS: [GoodFirms](https://www.goodfirms.co) (DA 55) · [Serchen](https://www.serchen.com)
(DA 49) · [SoftwareWorld](https://www.softwareworld.co) (DR 40) · [ToolSalad](https://toolsalad.com)
(DR 35) · [Hive Index](https://thehiveindex.com) (DA 31).

### Launchpads with a free queue (checked 2026-10-21)

No form was submitted for this list. The link type is what the site states or
what one sample page showed. Treat "unverified" as nofollow until you check
the live listing. Most free queues ask for the launchpad's badge on your
homepage, so add the badge to the page before you file. Skip every paid tier.

| Launchpad | Link | Gate / note |
|---|---|---|
| [Startup Dope](https://startupdope.com) | dofollow (site-stated) | No account. Review takes 7-14 business days. Product only. |
| [Neeed Directory](https://neeed.directory) | dofollow after badge check | Live at once after an automatic check. Sample link was plain `noopener`. |
| [LaunchIt](https://launchit.fast) | dofollow (site-stated) | Free page with no end date. Earliest free slot was about two months out. |
| [ScrollLaunch](https://www.scrolllaunch.com) | dofollow while the badge stays | Up to 25 free listings a week. Also runs a ranked list of 1,000+ directories. |
| [Dofollow.Tools](https://dofollow.tools) | dofollow while the badge stays | Five free slots a day for the whole site. 7-day queue. |
| [Turbo0](https://turbo0.com) | dofollow (site-stated) | Login needed. Asks for DR above 10 on your site and a backlink to Turbo0. |
| [SaaSCity](https://saascity.io) | dofollow after badge check | Free queue shown as about 329 days. A sample page without the badge was nofollow. |
| [LaunchIgniter](https://launchigniter.com) | dofollow for top 3 only | Badge required. Other links on the page are `sponsored`. |
| [Startup Fame](https://startupfa.me) | unverified | Badge required, review about 7 days. A sample page showed `nofollow`. |
| [Solo Launches](https://sololaunches.com) | dofollow for top 3 only | Up to five launches a day. |
| [OpenHunts](https://openhunts.com) | dofollow for top 3 only | Queue shown as about 60 weeks. A badge skips the queue. |
| [Shipstry](https://shipstry.com) | nofollow | One free submission a month. A badge unlocks dofollow. |
| [LaunchKoala](https://launchkoala.com) | nofollow | Value is traffic and a citation, not link equity. |
| [bunny.directory](https://bunny.directory) | unverified | A person reviews in about 2 working days. A sample link was nofollow. |
| [Tiny Startups](https://www.tinystartups.com) | unverified | Hand-approved. The page does not state a free-only path. Decline every upgrade. |
| [Forg.to](https://forg.to) | unverified | Builder network with a launchpad. No pricing page. |
| [DevHunt](https://devhunt.org) | mixed | Weekly dev-tool launches. Submit needs a login. Free launch not stated. |

## 4. MCP directories — for sites with a hosted /mcp endpoint

A directory site that ships a Streamable HTTP MCP endpoint (like the
private-repo-297b `/mcp` route) is listable as a **remote MCP server** — no
npm package needed. Verify the endpoint first with a real `initialize` →
`tools/list` handshake against the production URL; a listing for a dead
endpoint is worse than none.

| Directory | Entry point | Gate / note |
|---|---|---|
| Official MCP registry | `server.json` with `remotes[]` → `mcp-publisher publish` | Remote-only is supported: `{"type": "streamable-http", "url": "https://site/mcp"}`. DNS login checks a TXT at the **apex** domain (not `_mcp.`): `v=MCPv1; k=ed25519; p=<base64 pubkey>`. `description` must be ≤100 chars and the registry JWT expires fast — login, then publish immediately. Highest leverage — PulseMCP/Glama auto-ingest from it. See `mcp-directory-submission` §1. |
| [awesome-remote-mcp-servers](https://github.com/punkpeye/awesome-remote-mcp-servers) | GitHub PR to the README | Specifically for hosted/remote servers — where punkpeye's list redirects remote-only entries. Entry = name + URL + Glama connector badge + one-line description under the closest category, alphabetical. |
| [Glama](https://glama.ai/mcp/servers) | "Add Server" → "Hosted endpoint" tab | GitHub OAuth login. Remote endpoints use the second tab — the first ("Runs from source") demands a public repo + Dockerfile and silently fails validation on a URL. A "pending review" email per server is the authoritative confirmation. |
| [mcp.so](https://mcp.so) | GitHub issue on `chatmcp/mcpso` | Fill the template: name, description, repo URL, client-config JSON block. Issues queue for human review. |
| [Smithery](https://smithery.ai/new) | Web flow, URL method | For already-hosted servers. GitHub OAuth login → slug + upstream URL → step 2 "Skip" needs real mouse events (`mousedown`+`click`+`mouseup`; a plain `.click()` no-ops) → lands on `/servers/<ns>/<slug>/releases` with SUCCESS. The public page 200s immediately. |
| [mcpservers.org](https://mcpservers.org) | Site submit flow | Community index; check the current submit path before spending time. |
| [FindMCP](https://findmcp.dev/submit) | Public form | Low friction. |
| [MCP Hunt](https://mcp-hunt.com) | Site submit flow | Launch-style MCP index. |
| [mcp.directory](https://mcp.directory) | Claim auto-listing | Check for an existing auto-generated entry first. |
| [Cline MCP Marketplace](https://github.com/cline/mcp-marketplace) | GitHub issue | Needs a 400×400 PNG logo; quality-gated on traction. Defer for brand-new servers. |
| PulseMCP | — | Submissions paused (mid-2026); ingests the official registry. Publish to the registry and wait. |
| [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | GitHub PR | Use the ☁️ cloud-hosted marker for remote-only servers. See `mcp-directory-submission` §2. |
| [mcp.tc](https://mcp.tc) | `POST https://mcp.tc/submit` | JSON `{url, note}`, no account; a person reviews before the link goes live. |
| [AllMCPs](https://allmcps.com) | `/submit` wizard (the .io domain is dead) | URL → details → wait for the Cloudflare Turnstile to show "Success!" (submitting earlier no-ops silently) → "Submit to AllMCPs". The form is React-controlled: eval-setter fills change the DOM but not React state, so the submit handler reads empty values and silently no-ops (zero network calls). Drive it with `agent-browser fill` / real CDP input, and verify with a `fetch` hook on `/api/submit` returning 200 — "in the queue" is static marketing text, not a success signal. A newsletter modal can also wipe the fields mid-flow; close it and re-check values. A confirmation email arrives per submission. Has a hosted-endpoint field and an agent prompt on the page. |
| [402.ad](https://402.ad) | `POST /v1/submit` | $0.10 USDC via x402 for the programmatic path, or a free form with questions. |
| [MCPCentral](https://mcpcentral.io) | `npx mcp-submit` | The CLI also files mcp.so issues and awesome-list PRs for local stdio servers; remote endpoints file the API rows directly. |
| [Docker MCP Registry](https://github.com/docker/mcp-registry) | GitHub PR | Needs a Dockerfile — only worth it for packaged servers. |
| [appcypher/awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers) | GitHub PR | One PR per suggestion, added at the bottom of the category; installable servers, not remote-only. |
| [MCP Market](https://mcpmarket.com) | Paste the GitHub repo URL | Free tier lists in 4-6 weeks. Skip the $29 tier. Login need not stated. |
| [TensorBlock awesome-mcp-servers](https://github.com/TensorBlock/awesome-mcp-servers) | GitHub PR or the "Add MCP server" issue form | One bullet in `docs/<category>.md`. Needs a repo URL. Merged daily as of 2026-10-21. |
| [awesome-mcp-devtools](https://github.com/punkpeye/awesome-mcp-devtools) | GitHub PR | Tools for building MCP only (inspectors, SDKs, testing). Not for a site with a `/mcp` endpoint. |

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
   every field and asset; a human completes the logged-in submit — or an
   agent drives the owner's already-logged-in browser profile
   (`browser-personal`), which passes OAuth and Turnstile gates a clean
   session never will.
7. **Channels outside the tier tables (§7)** wherever they fit — cheap to
   file, disproportionately GEO-friendly.
8. **Lists, API catalogs, datasets and profiles (§8, §9)**, then the
   per-niche targets (§10). Record every result in the ledger (§11).

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
  DMOZ successor) still confers a real dofollow link. The free account at
  `/public/applypublic` plus email verification is fully automatable, but a
  directory listing requires a human volunteer-editor application — stop at
  the verified account and hand that step to the owner.
  [Jasmine](https://www.jasminedirectory.com) (DR 62) is paid-only now; skip
  on a free-lane run.
- **llms.txt registries.** If the site serves `/llms.txt`, file
  [llms-txt-hub](https://github.com/thedaviddias/llms-txt-hub) (a PR adds one
  MDX under `packages/content/data/websites/`),
  [directory.llmstxt.cloud](https://directory.llmstxt.cloud/submit) (Cloudflare
  Turnstile auto-passes in a real browser profile — the result is "You're on
  the waitlist!", so list it as pending), and
  [llmstxt.site](https://llmstxt.site/submit) (form + contact email). GEO
  surface, not backlinks. Three more: [Awesome-llms-txt](https://github.com/SecretiveShell/Awesome-llms-txt)
  (PR with one bullet, `[domain](https://domain/llms.txt)`),
  [llms-text.com](https://llms-text.com/directory) (free form; the
  `llms.txt` must be live), and [llmstxt.studio](https://llmstxt.studio/registry)
  (no form: it crawls domains, so publish a valid `/llms.txt` and wait).
- **Indie search engines.** [Mojeek](https://www.mojeek.com),
  [Wiby](https://wiby.me/submit/) (image captcha — securimage distortion is
  heavy; about 1 in 12 screenshot reads land, so budget real retry time.
  Always reload the whole page for a fresh code — the in-form reload link
  desyncs the session image from the accepted answer; keep `worksafe`
  checked),
  [Marginalia](https://marginalia-search.com),
  and [Entireweb](https://www.entireweb.com/free_submission/) are independent
  crawl paths, not Google. `GET https://web.archive.org/save/<url>` snapshots
  the site into the largest public archive with no account (a 302 is success).
  Four more, checked 2026-10-21: [Yandex Webmaster](https://webmaster.yandex.com/welcome/)
  and [Naver Search Advisor](https://searchadvisor.naver.com/) (verify the
  site, then submit the sitemap; Naver has a Korean-only UI and matters only
  for a Korean audience), [ExactSeek](https://www.exactseek.com) (free form
  that opts you into a newsletter and replies with a verification email), and
  [Search My Site](https://searchmysite.net) (independent sites only; the
  free tier is a 30-day trial, so check what it reverts to). [Kagi Small
  Web](https://github.com/kagisearch/smallweb) takes a personal blog feed by
  PR: add two unlisted sites with your own, English only, no ads, no
  LLM-written posts. It links your feed, so it is not a backlink.
- **Agent-submittable APIs.** [submitby.ai](https://submitby.ai) (MCP tool or
  `POST /api/v1/submissions`; free with their badge on the site or $4.99.
  The `Idempotency-Key` goes in an HTTP header, not the body; the platform
  value is `web`. Save the returned `control_token` — it is unrecoverable.
  Deploy the badge into server-rendered HTML, then `POST
  /api/v1/submissions/:id/verify` with the token as Bearer — clean
  submissions publish within minutes),
  [directree](https://www.directree.io) (its agent API only updates
  already-claimed listings — not a first-submission path),
  [justlaunch](https://justlaunch.org) (paid REST API across ~35 platforms),
  [Launch Llama](https://tools.launchllama.co) (MCP opens drafts; the founder
  finishes the submit), [AI Directories](https://www.aidirectori.es) (partner
  key and fee, AI tools only), [A2A Registry](https://a2aregistry.org)
  (publish an agent card at `/.well-known/agent-card.json`, then `POST
  {wellKnownURI}` to `/api/agents/register`; live agents only, checked every
  30 minutes).
- **Agent & bot platform directories.** If the site ships a hosted `/mcp`,
  these put it inside the assistants themselves — the highest-GEO surface on
  this list. Each needs an account on the platform (a paid plan for two of
  them), and two need a small asset built first:
  - [Claude Connectors Directory](https://claude.ai/directory/manage) —
    submit the remote MCP server through the developer portal, choose "MCP
    connector". Anyone on a paid Claude plan can submit. Anthropic reviews,
    then lists it as a Community connector reachable from every Claude
    surface. Public docs link required by publish date; test every tool in
    the MCP Inspector first — reviewers exercise them.
    - Automate it with `scripts/claude-connector/submit.mjs` in
      pooriaarab/scripts: one JSON config per site, `--dry-run`,
      `--status`, `--publish`. It drives the 10-step wizard
      (connection → tools → listing → use cases → company → auth →
      data handling → test & launch → compliance → review) in
      browser-personal Chrome, resumes mid-draft, and refuses to print
      DONE unless the wizard confirms the state.
    - Server-side trap: the wizard's probe sends *its*
      `mcp-protocol-version` header on `initialize`. A server that 400s
      unknown headers there reads as "0 Tools" and cannot proceed.
      Negotiate via `params.protocolVersion` on `initialize`; enforce
      the header only on later requests (fleet fix:
      private-repo-297b#275).
    - States: `In review` → `Ready to publish` → `Published (done)`.
      The publish confirmation is a `position:fixed` alertdialog —
      invisible to `offsetParent` checks — and its button needs the
      full mouse-event dispatch, not a bare `.click()`. `--publish`
      handles both.
  - [ChatGPT plugin directory](https://chatgpt.com/plugins) — submit via the
    OpenAI Platform dashboard → Plugins → "Upload new or existing plugin".
    Verified developer identity required. The package is a ZIP containing
    `<slug>-plugin/.mcp.json` (one remote server, `"type": "http"`) and
    `.codex-plugin/plugin.json` (author + interface + the
    `extensions.com.openai` review block: 5 positive + 3 negative test
    cases, `commerce`, release notes). `pooriaarab/scripts`
    `scripts/chatgpt-plugin/build.mjs` builds it from a site config.
    - Validator traps: `interface.shortDescription` ≤ 30 chars,
      `displayName` must carry the domain brand (`Example.fyi` — a bare
      noun fails "name too generic"), no pricing words ("free", "$") in
      `longDescription`, `logo`+`composerIcon` paths to a bundled square
      icon (SVG allowed), all four listing URLs (`websiteURL`,
      `supportURL`, `privacyPolicyURL`, `termsOfServiceURL`).
    - Domain verification serves a plain-text token at
      `/.well-known/openai-apps-challenge`. Sites on Workers **custom
      domains** can't serve it from a zone route (custom domains bypass
      routes) — a zone *redirect rule* runs first, so 302 to a workers.dev
      URL that returns the token. `setup-challenge.sh` next to the builder
      automates it.
    - Ordering: upload → Connect → verify domain → Connect/Continue →
      tool scan → Submit for review (six attestations). The submit call
      400s "wait for the attached app's review" until the app-level review
      finishes (~10–30 min); retry, then `In review`. One MCP URL per org
      — delete stale drafts via More plugin actions → Delete plugin.
  - [cursor.directory](https://cursor.directory/mcp/new) — GitHub or Google
    OAuth, then a short form (name, description, install-instructions URL,
    optional Cursor deep link). Lists remote MCP servers directly. A
    repo-root `.mcp.json` also makes the `/plugins/new` auto-detect path
    work.
  - Grok bot templates — create the bot inside Grok first (X Premium), grab
    the `https://x.ai/bot/…` template link, then file the directories:
    [grokbots.best](https://grokbots.best) has a JSON API
    (`POST /api/bots/submit` with `link`, optional `categories`,
    `integrations`; 409 = already listed),
    [templatebot.lol](https://templatebot.lol) has an agent API
    (`POST /api/agent/templates`), [grokbot.wtf](https://grokbot.wtf) is a
    PR to `keshav-exe/bot-directory`, and [grok-bot.app](https://grok-bot.app)
    is a human-reviewed form.
    - Bot creation flow (grok.com, signed in): sidebar **Bots → New bot**,
      name it the domain (`Example.fyi`), then chat it its persona: "Here
      is how you work, permanently: you are the assistant for
      example.fyi… Save this as your standing instruction." The bot
      browses the live site while it works — expect it to flag real
      inconsistencies (ours caught a "US directory" label on a site that
      also lists UK homes).
    - Template export: **More → Create template** posts a canned message;
      the bot builds the template asynchronously (~30s) and drops a card
      with an **Unpublished** badge. A first message before the persona
      lands makes an empty v1 — publish only after the instruction is in.
      The **Publish** button is a human click the bot cannot do; **Copy
      Link** then writes `x.ai/bot/<id>` to the clipboard.
    - Field/enum traps: grokbots.best rejects `categories` values outside
      its enum ("directory" → 400; "Productivity" accepted);
      templatebot.lol wants `shareUrl`, not `link`; grokbot.wtf scaffolds
      entries via `pnpm template:new` then `pnpm template:check` +
      `template:verify-shares --slug`; grok-bot.app's form has fixed
      categories (Research/Engineering/Product/Content/Operations) and
      separate fields for job, standing instructions, source URL, share
      URL.
  - [Poe](https://poe.com/create_bot) — a prompt bot (instructions pointing
    at the site or its `/mcp`) publishes immediately at `poe.com/<handle>`;
    no review for basic bots. Browser-gated by a Poe account.
  - The pattern generalizes: platform-native surfaces (plugin stores,
    connector directories, bot marketplaces) outrank any web directory for
    GEO, but each requires the platform's own account and usually a
    platform-native asset — an app manifest, a bot template link, a plugin
    bundle. Budget the asset build before the submission.

The canonical machine-readable list — every tier above plus these channels,
with a `method` field per entry — lives in `pooriaarab/scripts` at
`scripts/directory-submission/directories.json`. `check.mjs` next to it
lists entries, probes their liveness, and prints a per-domain plan. New
directories go there first; the template's `data/directories.json` is a
synced copy. The fleet's directory repo keeps the working catalog and the
per-site ledger (§11).

## 8. GitHub lists, API catalogs and datasets

Checked 2026-10-21. GitHub lists give a nofollow link by platform default, so
the value is the human and agent traffic that reads the list, plus a citation
that answer engines pick up. Read the list's contributing rules first. Several
lists auto-close a PR that breaks the format.

### Awesome lists

| List | Gate / note |
|---|---|
| [kyrolabs/awesome-agents](https://github.com/kyrolabs/awesome-agents) | PR at the bottom of `readme.md`. Open source, English, agent-related, active. New GitHub accounts are auto-closed. |
| [Jenqyang/Awesome-AI-Agents](https://github.com/Jenqyang/Awesome-AI-Agents) | One entry per PR. Needs a visible OSI licence and a full README. No hype words. |
| [steven2358/awesome-generative-ai](https://github.com/steven2358/awesome-generative-ai) | Main list wants about 1,000 followers. Otherwise use the Discoveries list. Reviewed in order of arrival. |
| [steel-dev/awesome-web-agents](https://github.com/steel-dev/awesome-web-agents) | PR titled `Add: name`. Fill the PR template, including affiliation. Web-agent tools only. |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Web issue form only, so a human submits. Resource must be 14 days old with active work, or have 100 stars. |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | PR titled `Add skill: author/skill-name`. Public repo with a `SKILL.md` and real use. |
| [xpaysh/awesome-x402](https://github.com/xpaysh/awesome-x402) | One resource per PR. x402 only. Automated link check. Last merge was 2026-07-28. |
| [ai-boost/awesome-a2a](https://github.com/ai-boost/awesome-a2a) | PR must edit `README.md` and `README_zh.md`. A2A protocol resources only. |
| [restyler/awesome-sandbox](https://github.com/restyler/awesome-sandbox) | Code sandboxes for AI. Issue or PR, no format rules. |
| [zhuima/awesome-cloudflare](https://github.com/zhuima/awesome-cloudflare) | Projects built on Cloudflare. Chinese README. Intro says open source. |
| [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data) | PR adds `software/<name>.yml`. Needs a FOSS licence and a release older than 4 months. LLM-written PRs are banned. |
| [serpapi/awesome-seo-tools](https://github.com/serpapi/awesome-seo-tools) | Must be an SEO tool, extension or API. One sentence, at the bottom of a category. |
| [markodenic/web-development-resources](https://github.com/markodenic/web-development-resources) | One resource per PR. Fully free or a free tier. Skips categories with 10 or more items. |
| [sacridini/Awesome-Geospatial](https://github.com/sacridini/Awesome-Geospatial) | For map and mobility data. No contributing file. Has Data Sources sections. |

### API catalogs

| Catalog | Gate / note |
|---|---|
| [public-apis](https://github.com/public-apis/public-apis) | PR with one table row. Free public API only. Description 100 characters or fewer. Has an MCP section. Merged daily. |
| [public-api-lists](https://github.com/public-api-lists/public-api-lists) | Five-column row, alphabetical, five entries per PR at most. Automated format check. |
| [APIs.guru](https://apis.guru/add-api/) | Anonymous form. Needs a stable URL to an OpenAPI, Swagger or Postman definition. PRs are closed. |
| [apis.io](https://apis.io) | Form or email. A person reviews. One company per submission. |
| [API Tracker](https://www.apitracker.io) | Form builds an email to Apideck. Takes an API or an MCP server. |
| [Postman API Network](https://learning.postman.com/docs/postman-api-network/overview/) | Make a workspace public with a collection. Needs a real callable API. |

### Dataset hosts

Use these only when the site publishes a cleaned extract of its public data.
A directory page is not a dataset. Zenodo, Hugging Face and Mendeley are one
workflow with three upload forms, not three separate wins.

| Host | Gate / note |
|---|---|
| [Google Dataset Search](https://developers.google.com/search/docs/appearance/structured-data/dataset) | No form. Add schema.org `Dataset` JSON-LD: `name`, `description` of 50-5000 characters, `distribution.contentUrl`. Check it in the Rich Results Test. Keep the page crawlable and in the sitemap. Indexing takes days. |
| [Zenodo](https://about.zenodo.org/policies/) | Free account (GitHub or ORCID login). Up to 50 GB a record. Gives a DOI. Out-of-scope content is removed later. |
| [Hugging Face Datasets](https://huggingface.co/docs/hub/datasets-adding) | Free account. Public dataset repo with a dataset card where the site link goes. |
| [Mendeley Data](https://data.mendeley.com/) | Free account. Research data focus. Gives a DOI. Size limit not stated. |
| [awesome-public-datasets](https://github.com/awesomedata/apd-core) | The README is generated. Fork `apd-core`, add a file under `core/<Category>/`, run `tests/testing.sh`. Direct download with no login. |
| [DataPortals.org](https://www.dataportals.org) | "Add a Portal" opens a GitHub issue. For open-data portal sites. |

## 9. Profiles and communities

Profiles earn entity signals more than link equity. Communities punish
promotion, so read the rules page before you post.

| Surface | Link | Gate / note |
|---|---|---|
| [about.me](https://about.me), [Gravatar](https://gravatar.com), [GitHub](https://github.com), [GitLab](https://gitlab.com), [sourcehut](https://sr.ht) | nofollow (sampled) | Free profile with a website field. Use `rel="me"` links to tie accounts to the site. |
| [Open Collective](https://opencollective.com) | nofollow (sampled) | Needs a project that fits their rules. |
| [WordPress.org profile](https://profiles.wordpress.org) | no `rel` on one sample | The link may be nofollow for new accounts. Check after you save. |
| [Stack Overflow profile](https://stackoverflow.com), [Linktree](https://linktr.ee) | unverified | Result differs by account. Do not drop links in answers. |
| [Show HN](https://news.ycombinator.com/showhn.html) | nofollow | Must be something people can try. No landing pages. Never ask for upvotes. |
| [Lobsters](https://lobste.rs/about) | nofollow | Invite only. Self-promotion stays under about a quarter of your activity. |
| [DEV Community](https://dev.to/terms), [Hashnode](https://hashnode.com) | dofollow (sampled) | Post useful articles in good faith. Disclose affiliate links and AI help. |
| [HackerNoon](https://hackernoon.com/new) | unverified | Editorial review. Write about the niche, not an ad. |
| [daily.dev](https://docs.daily.dev/how-to-get-featured/) | unverified | Squads, source suggestions (established publications only) or direct posts. |
| [Showwcase](https://www.showwcase.com/) | unverified | Developer profile. Low priority. |

Indie Hackers, Medium, Peerlist and Reddit returned 403 to our fetch tool.
Read their rules in a logged-in browser before you plan anything there.

## 10. Niche backlinks: how to find them per site

A directory site for one niche (pet cremation, doulas, credit unions) needs
links from places that already serve that niche. The general tables above do
not do this. Build the list per site, by hand, with this method. The result
for each site goes into the catalog (see section 11), not into this file.

### The method

1. **Industry associations and trade bodies.** Look for a "resources", "links"
   or "partners" page. Many keep these for paying members. Skip those. Keep the
   ones where a non-member can suggest a link by form or one email.
2. **Awesome lists that take PRs.** Search GitHub for `awesome-<niche>` and
   `awesome-<niche>-datasets`. Then run the merge-recency check before you
   write anything:
   ```sh
   gh pr list -R <owner>/<repo> --state merged --limit 5 --json mergedAt,author
   gh pr list -R <owner>/<repo> --state open --limit 20
   ```
   Keep the list only if an outside PR merged in the last three months. A list
   with a pile of open PRs and no recent merge is dead. Read `CONTRIBUTING.md`:
   some lists auto-close a PR for format, and some take tools only.
3. **Dataset hosts.** If the site holds public data, publish a cleaned extract
   on Zenodo (gets a DOI), Hugging Face or Mendeley, with the site link on the
   dataset card. Add schema.org `Dataset` markup to the page that offers the
   same data so Google Dataset Search finds it (section 8).
4. **Resource-page curators.** University library guides, state and county
   pages, nonprofits and public-health sites keep link lists. Find the page,
   then send one plain note that names the page, says what the site adds, and
   links one useful page. One note per page. No follow-ups, no template blast.
5. **Suggest-a-resource forms.** A named form with no account is the best
   route. Fill it with the packet from section 0, in the editor's words.
6. **Re-check the date.** Every entry below was fetched on 2026-10-21. A merge
   date, a form or a free listing can change in a month. Open the page again
   before you file.

### What to skip

- **Paid or sponsored listings.** Fees, "featured" boxes, per-state fees, a
  card hold for a free tier.
- **Member-only directories.** An association locator that needs dues.
- **Link sellers and lead-sale sites.** They sell the link you want to earn.
- **Reddit self-promotion** without reading the subreddit rules first. Most
  ban it. Read the rules in a browser, then decide.
- **Dead or hijacked domains.** Two niche sites on our first pass had been
  taken over by spam. Open the page before you trust the name.
- **Awesome lists with no merge in months**, and lists that take tools only
  when you are a directory.

### Best verified targets by niche family

The exact per-site lists live in the directory fleet's catalog. These are the
strongest entries from that research. A "pitch" has no formal route, so send
one polite note and expect a low hit rate.

**Health and sensitive topics** (eating disorders, fertility, doulas, peptide
clinics, psilocybin). Nearly every association directory is paid or
member-only. Expect short lists.

- Doulas: Chisholm Legacy Project resource hub (anonymous submit form), New
  Mexico Doula Association directory ("Suggest a New Listing"), NASHP doula
  Medicaid tracker (editorial, email).
- Fertility: Northwestern Galter Library guide (email for additions), Inova
  Library OB/GYN toolkit ("Suggest a New Resource" form, may be staff-only),
  `geniusrise/awesome-healthcare-datasets` (merged PRs on 2026-10-07, dataset
  only).
- Peptide and longevity: `mafiaguy/awesome-biohacking` (merged PRs on
  2026-10-21), `seeker89/awesome-biohacking`, Curlie (volunteer editor).
- Psilocybin: Psychedelic Alpha law and policy tracker (email corrections),
  Berkeley Center for the Science of Psychedelics (contact form, no reply
  promised), Chacruna and Zendo Project (one note each).
- Eating disorders: the Western Washington University body image resource list
  (plain email), Intuitive Eating resources page (contact form). MedlinePlus
  rejects sites whose main purpose is selling, so do not pitch it.

**Finance** (credit unions, fintech, payments).

- Credit unions: `ashishb/personal-finance-awesome` (merged daily), the League
  of Credit Unions financial education guide (editorial review), the NCUA
  website feedback form (no account), `andenick/bank-data-dictionary` (issue).
- Payments and fintech: `jplock/awesome-fintech` (active, company list).

**Legal, immigration and housing** (immigration help, foreclosure listings,
French for PR).

- Immigration help: law library guides at Illinois, Minnesota, New Mexico, USC
  and Nova Southeastern (one email each to the reference desk), Immigration
  Advocates Network (pitch).
- Foreclosure: PALawHELP (feedback form), Texas State Law Library (question
  form), LLRX (editor form), `etewiah/awesome-real-estate` (PR), Civic Tech Field Guide
  (submit form, moderation unconfirmed).
- French for PR: `gbroques/awesome-french` (PR, but seven PRs sat open), MERLOT
  (free account), Lexilogos (contact form, welcomes suggestions), Le Point du
  FLE (email to the editor).

**AI and agents** (agent sandboxes, agent wallets, x402, robotic services).

- `Haustorium12/gold-402` (best odds: external PRs merged 2026-10-22, one
  entry per PR), `Merit-Systems/awesome-agentic-commerce`,
  `solana-foundation/awesome-solana-ai`, `xpaysh/awesome-x402`.
- Sandboxes: `ianwieds/awesome-agent-sandboxes` (new list, strict automated
  rules), `webcoyote/awesome-AI-sandbox`, `arjan/awesome-agent-sandboxes`.
- Skip `awesome-account-abstraction` (weak fit) and the archived Base
  ecosystem form.

**Consumer services** (pet cremation, sober bars, dating coaches, driving
schools, auctions).

- Pet cremation: Love, Baxter Pet End-of-Life Directory ($0 to join), Pet-Loss.net
  (basic listing is free, skip the $25 box), Green Pet-Burial Society, RedRover,
  The Ralph Site.
- Sober bars: Zero Proof Nation global map (form, needs a short blurb), The
  Sober Curator rolodex (free, bot check). OpenStreetMap for each venue.
- Dating coaches: IMCB Find a Matchmaker, SwipeStats services catalog (editor
  approves each entry), Trusted Matchmakers. Life Coach Hub lists you but gives
  no website link on the free tier, so skip it for backlinks.
- Driving schools: DSAA resources page (email), Road Safety Knowledge Centre
  (self-assess, then submit). Others are pitches with low odds.
- Auctions: NAA and NALLOA resource pages, state surplus-property pages, and
  public library "government auctions" pages (all pitches).

**Civic and open data** (robotaxis, auctions, public records).

- Robotaxis: CCAM-TAC invites website suggestions by email, ITS America
  automated vehicle resources (one email), the EU connected driving knowledge
  base (email, not the Turnstile form).
- Maps and data: `osmlab/awesome-openstreetmap`, the OSM wiki service lists
  (free account), Civic Tech Field Guide, DataPortals.org, awesome-public-datasets.

## 11. Working with the ledger

Each site used to keep its own `submissions.csv`. The fleet now keeps one
ledger, because the cost is per channel (one login, one rate limit, one
repository), not per site. The runner lives in the fleet's directory repo.

- **One catalog row per target.** A target is one directory, in
  `sites/_shared/data/directories.json`. The row has a name, a tier and a
  `method` (`api`, `github-pr`, `github-issue`, `form-anon`, `form-account`,
  `form-oauth`, `form-captcha`, `pitch`, `crawl` and a few more). Never list a
  target twice. Add a `skip` of `paid` or `human` when an agent must not run it.
- **Scope a niche target to its own site.** A pet cremation list must not go
  to the other sites. The catalog row carries a `sites` allowlist naming the
  sites that may receive it. The runner on `main` does not read that field
  yet, so also pass `--sites a,b,c` on every run of a niche target.
- **A pair with no ledger row is todo.** The ledger is `submissions/ledger.csv`
  with the columns `target, site, status, date, proof, retry_after, reason`.
- **Four statuses:** `submitted` (filed, waiting), `live` (listed in public),
  `blocked` (needs a reason, may carry a `retry_after` date) and `skipped`
  (needs a reason). Put a URL or a note in `proof`.

```sh
bun scripts/submissions.ts report              # per target: done, blocked, skipped, todo, why
bun scripts/submissions.ts run "<target name>" # one driver call for every pending site
bun scripts/submissions.ts import-csv <site> <old submissions.csv>
```

`run` calls the target's driver once with all pending sites, so one login or
one PR serves all of them. A second run never files a pair that already has a
row, except a blocked row whose `retry_after` date has passed.

Rules that each came from a real failure:

- **Do not solve captchas.** Record the pair as `blocked` with the reason, and
  hand it to a person.
- **No paid placements.** Mark the target `skip: paid`. Do not enter a card.
- **No outreach campaigns.** One plain suggestion per page. No follow-up
  sequences, no bulk email.
- **A human clicks the GitHub OAuth authorize button.** Cloudflare and
  claude.ai logins also need a human. Prepare every field, then hand off.
- **One browser driver at a time.** Two drivers on one Chrome profile or one
  debug port fight over the same tabs and sessions.
- **Verify on the application's own list.** A loop that prints "submitted"
  proves nothing, and a click on a disabled button also prints success. After a
  run, open the directory's own list or status page, or read the network
  response, and compare before and after. A "pending review" email counts as
  proof. A static "in the queue" message does not.

## Checklist

- [ ] Packet written from real copy (§0), stored in the repo, no placeholders.
- [ ] Production URL verified: 200, real content, canonical correct.
- [ ] Tier-1 web directories submitted (§1), Gartner triple via one onboarding.
- [ ] `server.json` with `remotes[]` published to the official registry (if the site ships `/mcp`).
- [ ] Awesome-list PRs opened + mcp.so issue filed (if the site ships `/mcp`).
- [ ] Agent/bot platforms filed where the account + asset exist: Claude
  connector (paid plan), ChatGPT plugin (verified org), cursor.directory,
  Grok template dirs (needs the `x.ai/bot` link first), Poe bot.
- [ ] AI/GEO directories submitted (if the product has a real AI surface).
- [ ] Long tail batched in DR order.
- [ ] Niche targets found per site (§10) and added to the catalog with a
  `sites` allowlist. Every result recorded in the ledger (§11).
- [ ] `submissions.csv` tracks every directory, date, and status. Use honest
  status words: `listed` (publicly visible), `pending` (filed, awaiting
  review), `draft` (needs one more step — e.g. site verification), `blocked`
  (gate named), `paid` (skipped on free lanes), `dead` (URL unreachable).
- [ ] Human-gated submits (Product Hunt, BetaList, logins) handed off with fields + assets ready.

## See also

- [`../launch-seo/SKILL.md`](../launch-seo/SKILL.md) — search-console submission; run before this.
- [`../geo-aeo/SKILL.md`](../geo-aeo/SKILL.md) — AI quotability; run before this.
- [`../product-hunt-launch/SKILL.md`](../product-hunt-launch/SKILL.md) — the Product Hunt row of §1, expanded into full launch ops.
- [`../mcp-directory-submission/SKILL.md`](../mcp-directory-submission/SKILL.md) — the MCP rows of §4, expanded (manifest schemas, CLI quirks, OAuth path).
- [`../launch-directory-site/SKILL.md`](../launch-directory-site/SKILL.md) — the directory-site launch pipeline; points here for backlinks.
- [`../ship-a-product/SKILL.md`](../ship-a-product/SKILL.md) — orchestrator; this is the distribution stage after `geo-aeo`.
