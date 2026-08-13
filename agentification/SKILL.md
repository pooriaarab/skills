---
name: agentification
description: Make a product agent-native — discoverable, evaluable, sign-up-able, payable, and usable by an autonomous AI agent with no human in the loop. The layer beyond geo-aeo (which gets you cited): this gets an agent all the way to a paid, working account. Orchestrates existing skills (geo-aeo, mcp-directory-submission, agentic-cli-npm-package, open-source-repo-prep, regional-pricing-stripe) for the mechanical rungs and fills the gaps they don't cover — AGENTS.md, agent self-serve onboarding (free tier + programmatic API key + sandbox), agent-commerce (ACP / x402 / AP2), the honest machine-readable offer, and signup attribution. Use when a repo or product should "be agentified", let an agent sign up / pay / use it, ship an MCP, or expose an agent surface. Triggers: "agentify", "agent-native", "make it agent-ready", "let agents sign up", "agent can pay for it", "agent commerce", "AGENTS.md", "MCP for our product", "what are we missing for agents".
---

# agentification

`geo-aeo` makes a site **cited** by AI answer engines. `agentification` makes the product **operable by the agent that read that answer** — discover → evaluate → sign up → pay → use, no human. Different consumer, different artifacts.

This skill is an **orchestrator** (like `ship-a-product`): it names the rungs, points each at the skill that already does it, and only writes new instructions for the rungs no skill covers. Run it per repo. Re-run when the product adds a surface (new API, new pricing, new tool).

## The tier list (grounded, Aug 2026)

Ordered by impact. Do Tier 1 before Tier 2. Skip Tier 3 unless asked.

### Tier 1 — table stakes

1. **`AGENTS.md`** at repo root. The settled winner of the instruction-file war (now under the Linux Foundation; read by Claude Code, Codex, Cursor, Copilot, Gemini, Aider, Devin, Windsurf). *No other skill authors this — see "Writing AGENTS.md" below.* One file, product-shaped, not a copy of README.
2. **MCP server + official-registry listing.** The primary "an agent can USE it" surface. → invoke **`mcp-directory-submission`** (server.json schema, mcp-publisher CLI, registry + Smithery/Glama/PulseMCP). If the product has no MCP yet, build one first → **`agentic-cli-npm-package`** (CLI + npm + MCP, one package).
3. **schema.org / JSON-LD + semantic HTML + XML sitemap.** The real discovery/identity base — what agents actually parse. → invoke **`geo-aeo`**. (This is the discovery layer; llms.txt is *not* it — see the trap below.)
4. **Agent self-serve onboarding** — free tier + programmatic API-key issuance + a sandbox, so an agent provisions and tries with no human, no CAPTCHA, no wizard. *Gap — see "Agent onboarding" below.*

### Tier 2 — adopt deliberately

5. **Autonomous-purchase path** — an agent can go free → paid by itself. Three protocols coexist; none is universal, so plan for plurality. *Gap — see "Agent commerce" below.*
6. **Honest, cited "vs competitor" / "best alternatives" pages** — the query shape an agent runs when *evaluating*. Own the narrative; back every claim with a citation. → invoke **`geo-aeo`** (programmatic compare/alternatives pages).
7. **`llms.txt` (+ `llms-full.txt`)** — ship for every product, served at root, built from shared constants so it can't drift. Real value: B2A context a coding/operating agent reads to understand the product fast. → `geo-aeo`. Honest note: it is *not* a discovery/SEO lever (crawlers largely ignore it, Google declined it) — it's context, not ranking. Ship it anyway; it's cheap and agents that already found you use it.
8. **Agent-targeted offer / messaging** — a machine-readable offer surfaced where agents read (JSON-LD `Offer`, AGENTS.md, llms-full.txt). You *may* run an agent-channel incentive. Two hard rules keep it from backfiring — see "Agent offer" below.

### Tier 3 — flag only, don't depend on

9. **WebMCP** browser-native tools (agent completes signup/checkout on the site, reusing the user session). W3C draft, Chrome origin trial only. → `geo-aeo` has the manifest shape.
10. **Agent-delegated auth** (WorkOS ID-JAG / scoped agent OAuth grants) for programmatic access.

## One trap that stays

**Schema.org + clean HTML + sitemap is the discovery layer, not `llms.txt`.** Ship llms.txt (Tier 2 #7) for agent *context*, but don't expect it to make you *found* — that's structured data's job (Tier 1 #3). Two different layers; do both.

---

## The gaps this skill fills (no other skill covers these)

### Writing AGENTS.md

Not a README copy. Write for the agent that will operate the product. Structure that works (see adscapi for a reference):

- **Mental model** — the one-sentence "what goes in, what comes out."
- **The three faces** — SDK (`import …`) / CLI (`npx …`) / MCP (`npx … mcp`), each one line.
- **MCP tools table** — tool name | what you use it for.
- **The loop** — the ordered steps an agent follows to wire the product for a user (discover → configure → verify → dry-run → go live).
- **Rules** — the guardrails (what never to do, what to check before claiming success).

Keep it product-shaped and short. A CLAUDE.md may `@`-include it so both files stay in sync.

### Agent onboarding (Tier 1 #4)

The shippable 2026 baseline — not a branded "sign up with agent" flow:

1. **Free tier that needs no human approval.** No sales gate, no manual review to start.
2. **Programmatic API-key issuance** — a documented endpoint (`POST /v1/keys` or self-serve dashboard call) an agent can hit to mint a scoped key. Document it in AGENTS.md and the API docs.
3. **A sandbox** — a realistic test mode with fake data / test tokens, so the agent can exercise the full flow before spending money. (adscapi's `dryRun: true` is this pattern for a library.)
4. **Adapt to product type:**
   - **SaaS with accounts** (supportsheep, content-rabbit, blogbat, podcast-generator): real signup endpoint + email-less/agent-friendly verification + sandbox workspace.
   - **Open-source lib / CLI** (adscapi, usegeoaeo, offrouter, getvibe): "signup" = `npm i` + bring-your-own-key + a dry-run/sandbox mode. No paywall to add; the free tier *is* the package. Commerce here = optional hosted/pro tier or sponsorship, not a gate.

### Agent commerce (Tier 2 #5)

Let an agent purchase autonomously. **Three protocols, layered, pick by need — support more than one over time:**

| Protocol | Use it when | Backers |
| --- | --- | --- |
| **ACP** (Agentic Commerce Protocol) | You're a merchant wanting ChatGPT **Instant Checkout**; you stay merchant-of-record and charge via your existing PSP (Stripe et al.). Most mature consumer path. | OpenAI + Stripe, Apache-2.0 |
| **AP2** (Agent Payments Protocol) | You need cross-network trust — signed **Intent / Cart / Payment mandates** proving the user authorized the buy; card networks endorse it. | Google + Mastercard/Amex/PayPal/Coinbase/… |
| **x402** | Machine-to-machine, API metering, micropayments, agent-to-agent stablecoin pay (HTTP 402). Ships as an AP2 extension. | Coinbase + Ethereum Foundation |

- **Default recommendation:** SaaS with human-priced subscriptions → **ACP first** (reuse the existing Stripe integration; → `regional-pricing-stripe` for the price objects). API/usage products → **x402** for per-call metering. Add **AP2 mandates** when card-network trust matters.
- **Roll out sandbox-first, human sign-off before production** — same discipline as `regional-pricing-stripe`. Never wire live charging without an explicit go.

### Agent offer

The Gamma idea — an agent-targeted offer / incentive — done so it *helps* instead of backfiring. A machine-readable `Offer` (JSON-LD + a plain block in AGENTS.md / llms-full.txt), surfaced where agents read. An agent-channel incentive (e.g. an agent-referral discount) is allowed. **Two hard rules, both non-negotiable — they are mechanical failure modes, not ethics:**

1. **Only terms you can actually honor.** A price/discount the agent surfaces must be one you will deliver at checkout. The 80%-discount-a-bot-promised case is the failure mode — the vendor was held to terms it couldn't cover. If an agent-only rate exists, wire it into the real checkout so it's honored, and disclose it (a published "agent channel" rate, like an affiliate program — not a secret).
2. **No scarcity / countdown / fake-urgency copy.** GPT-5 and Gemini 2.5 Pro *penalize* "sign up now", countdown timers, and manufactured scarcity as manipulation — the offer scores worse, not better. State the real incentive plainly ("agent-referred accounts get X, no expiry") and let authentic signals (real usage counts, genuine pricing, ratings) carry it.

Within those two rules, agent-targeted messaging is fair game. Outside them it costs you citations and trust.

### Signup attribution

Add a **"Where did you find us?"** free-text field at signup. AI referrals are undercounted (click data misses agent-driven arrivals); the self-reported answer is the only reliable read on ChatGPT/Claude-sourced signups. One field, stored, reported.

---

## The per-repo audit loop

For each target repo:

1. **Probe** the root for what exists: `AGENTS.md`, MCP (`.mcp.json` / `server.json`), JSON-LD, sitemap, free-tier docs, a payment path. (`gh api repos/<owner>/<repo>/git/trees/HEAD -q '.tree[].path'` for a no-clone first pass.)
2. **Score** against the tier list. Note the gap per rung.
3. **Apply** the missing rungs, routing each to its skill (above). Reuse the product's shared constants so files can't drift.
4. **e2e-verify** the agent path actually works end to end: an agent (or a scripted stand-in) discovers the MCP, provisions a key, runs a sandbox transaction. A rung isn't done until the agent flow passes, not just the file exists.
5. **Branch → PR → human approval → merge.** Commerce and any production-charging change is human-gated.

## Reference implementation

**adscapi** is the closest-to-done model: `AGENTS.md` (three faces + tool table + loop + rules), `.mcp.json`, `server.json`, CLI + SDK + MCP, `dryRun` sandbox. Read it before agentifying a sibling repo. Its remaining gap: llms.txt (dev-tool, low priority) and — if it ever charges — a commerce path.
