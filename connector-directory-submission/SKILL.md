---
name: connector-directory-submission
description: "Use when the product ships automation-platform connectors or agent plugins — an n8n community node, a Make (Integromat) app, Pipedream components, a Zapier integration, a Claude Code plugin, or a ChatGPT/Codex Apps-SDK app — and you want them listed on the public directories/marketplaces (n8n verified nodes, Make apps directory, Pipedream registry, Zapier app directory, a Claude Code plugin marketplace repo, the ChatGPT Plugins Directory). Sibling of mcp-directory-submission (that one is MCP servers only). Covers which destinations index a plain npm package (n8n, npm auto), which are a PR into a vendor monorepo (Pipedream), which are a dev-portal review with a partner/active-user gate (Make, Zapier, ChatGPT), and which are just a git repo users add (Claude Code plugins). Per platform: the exact package.json/manifest field that gates discovery (n8n keyword + n8n object, Pipedream component key, plugin.json/marketplace.json), the real submission entry point (npm index, developers.make.com review form, PipedreamHQ/pipedream PR, zapier.com/app/developer, /plugin marketplace add, platform.openai.com/plugins), auth quirks, review gates, and the silent-rejection gotchas. Flags what a hosted-endpoint requirement (ChatGPT app needs a public /mcp URL) or a private repo blocks. Triggers: 'submit my n8n node', 'get the connector verified', 'publish to the Make apps directory', 'PR our Pipedream components', 'list our Zapier app', 'distribute the Claude Code plugin', 'submit the ChatGPT app', 'connector directory submission'."
---

# Connector directory submission

The product ships one isolated `integrations/<name>/` package per platform. Each targets a **different** kind of directory with a different gate. Unlike MCP directories (where local/stdio is fine almost everywhere), connector directories split hard on npm-index vs monorepo-PR vs paid/partner-reviewed vs hosted-endpoint. Know the bucket before you spend effort.

**The core asymmetry vs MCP**: npm auto-indexing gets you *installable* on n8n and *distributable* as a Claude plugin with zero human review — but the **verified badge / public directory listing** on n8n, Make, Zapier, and ChatGPT all require review, and two of them (Zapier, Make partner) gate on real usage or partner status you can't fake. Ship the installable version first; the badge is a slow second lap.

## Buckets — check this first

| Gate | Destinations | What "listed" means |
|---|---|---|
| **npm auto-index, no review** | n8n community node (unverified) | Installable via Settings → Community Nodes the moment it's on npm with the right keyword. Not in node search. |
| **Git repo users add, no central directory** | Claude Code plugin | Distributed by a marketplace repo (`/plugin marketplace add owner/repo`). No official central listing to submit to (yet). |
| **PR into a vendor monorepo** | Pipedream components | Merged PR to `PipedreamHQ/pipedream` → appears in the Pipedream app registry. Free, but human-reviewed. |
| **Dev-portal review, free badge** | n8n **verified** node, Make apps directory | Submit → vendor QA → badge + in-app search visibility. No paid tier, but real review + real requirements. |
| **Dev-portal review, usage/partner gate** | Zapier public app | Publish → 90-day Beta → auto-public only after **50 active users + 10 Zap templates** (waivable by embedding). |
| **Hosted MCP + OAuth 2.1 REQUIRED** | ChatGPT / Codex Apps-SDK app · Anthropic **Claude Connectors Directory** | Both need a public `/mcp` URL **and per-user OAuth** — a client-presented Bearer API key is *not* accepted. One OAuth build unblocks *both*. See §5 + §7. |
| **Namespace verify, no review** | Official **MCP Registry** (`registry.modelcontextprotocol.io`) | Publish `server.json` under a namespace you can prove (GitHub OIDC or DNS). Feeds Anthropic/Smithery/PulseMCP/Docker/GitHub. See §8. |
| **No directory exists** | opencode, openclaw, hermes, other agent CLIs | They consume MCP via config (URL or stdio) — nothing to submit to. Registry + npm + hosted URL covers them. See §9. |

Do the zero-review ones first (npm publish for n8n, push the Claude plugin marketplace repo, publish `server.json` to the MCP Registry). They cost nothing and are live immediately. Save the usage-gated, hosting-gated, and OAuth-gated ones for last.

**The OAuth asymmetry (read before ChatGPT or Claude Connectors):** a hosted MCP endpoint that authenticates with a raw `Authorization: Bearer <api-key>` works for Codex CLI, the SDK, and any config-driven client — but **ChatGPT and the Claude Connectors Directory cannot present a custom API key.** They speak OAuth 2.1 only (per-user login + consent). So the gate for those two is not "is there a hosted endpoint" but "does the endpoint support OAuth." Build OAuth **additively** (keep the API-key path) and one effort lists on both.

---

## 1. n8n community node — npm keyword now, verified badge later

Two separate things. **(a) Installable** the instant it's on npm. **(b) Verified badge** = a Creator Portal review with hard requirements.

### (a) Get it installable (npm auto-index, no review)

`package.json` must have all three or n8n won't recognize it:

```jsonc
{
  "name": "n8n-nodes-contentrabbit",        // MUST start with n8n-nodes- (or @scope/n8n-nodes-)
  "keywords": ["n8n-community-node-package"], // the discovery keyword — omit it and n8n ignores the package
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes":       ["dist/nodes/ContentRabbit/ContentRabbit.node.js"],       // compiled .js in dist/, NOT .ts
    "credentials": ["dist/credentials/ContentRabbitApi.credentials.js"]
  }
}
```

`npm publish` it. Users then install by **package name** at Settings → Community Nodes → Install (self-hosted; also available on n8n Cloud). The Trigger node ships in the same package — one package integrates exactly one service, and a trigger node for that same service is allowed alongside the main node.

**Publish auth gotchas (these block the publish itself):**
- npm now enforces 2FA on publish. From a headless/agent context, use an **automation token** (npmjs.com → Access Tokens → Classic **Automation**, or a Granular token with publish + **bypass-2fa**) — it publishes without an interactive OTP. A plain read token or a stale one fails with **`401 Unauthorized`** (check with `npm whoami`); a 2FA-required account without an automation token fails with **`E403 … Two-factor authentication … required`**.
- Set the token without clobbering the user's `~/.npmrc`: write a temp file and pass `--userconfig <tmp>`.
- If `prepublishOnly` runs a build/lint you don't need (dist already compiled) and it fails on an unrelated rule, publish with **`--ignore-scripts`** (only when `dist/` is already built and verified). Always `--access public` for an unscoped or public-scoped package.
- Verify after: `npm view <pkg> version`.

### (b) Verified badge (Creator Portal review — the gated lap)

Sign in to the **n8n Creator Portal** and submit the package for verification (this is the submission entry point — not an email, not a repo PR). Verify the current portal URL from the docs; the docs page is `docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes`.

Requirements that cause silent rejection:
- **Provenance (hard cutoff): from 2026-05-01, verified nodes MUST be published via a GitHub Actions workflow with an npm provenance statement.** A node published from a local machine is rejected outright. This is the single most likely rejection now.
- **Zero runtime dependencies.** Verified nodes may not use any run-time `dependencies` — bundle what you need. (Unverified npm install has no such limit; this bites only at verification.)
- Must pass the scanner: `npx @n8n/scan-community-package n8n-nodes-contentrabbit`. Run it before submitting.
- English-only for everything user-facing: parameter names, descriptions, help text, error messages, README.
- Must not duplicate an existing node. Must follow n8n UX guidelines. README required (in the npm package or a public repo).
- n8n strongly suggests scaffolding/maintaining with the **`@n8n/node-cli`** tool so conventions match.

Verified nodes appear in the node panel under a **"More from the community"** section in node search; instance owners can toggle their visibility. Unverified nodes never appear in search — install-by-name only.

---

## 2. Make (Integromat) app — dev-portal build + QA review

Make apps aren't an npm package. The `app.json` is the *export* of an app that lives in Make's own builder. You import it, then request review.

### Build / import the app

**There is no one-shot "import the whole `app.json`" in current Make.** (The Make DevTool Chrome extension does **not** have an "Import app" tool — its tools are Focus/Find/Copy Mapping/Swap App/Base64/Remap/Highlight, no import. Old READMEs that say "DevTool → Import app" are stale — don't repeat it.) A custom app is stored as separate components (Base + each Connection/Module/Webhook/RPC); you load it component-by-component. The bundled `app.json` in the repo is a *convenience bundle* whose top-level keys (`base`, `connection`, `modules[]`, `webhooks[]`, `rpcs[]`) map 1:1 to those components.

**PREFER THE SDK API — an agent CAN push the whole app.** There is no UI "import", but the **SDK Apps API** creates every component programmatically. This is the fastest, least-error-prone path and the default an agent should reach for; the manual editors below are the fallback when you can't script.

- Tool: `pooriaarab/scripts` → `scripts/make/publish-app.py` pushes a bundled `app.json` (base/connection/webhooks/modules/rpcs) to a live app. `MAKE_TOKEN=… python3 publish-app.py --app <slug> --app-json app.json --zone us1.make.com`. Create the app *shell* + one connection in the UI first; the script does the rest.
- API facts it bakes in (all learned live, easy to get wrong): auth `Authorization: Token <token>`; **modules & RPCs are versioned** (`/api/v2/sdk/apps/{app}/{ver}/modules`), **webhooks and connections are NOT** (`/apps/{app}/webhooks`, sections at `/apps/webhooks/{name}/{section}`; `/apps/{app}/connections`); module `typeId` = 4 action / 9 search / 10 instant-trigger / 12 universal; set sections with `PUT …/{name}/{api|expect|interface|samples}` (raw JSON, `api`←communication, `expect`←mappable params); **HTTP 403 body `error code: 1010` is NOT a rate limit — it's Cloudflare blocking the default `Python-urllib` User-Agent** (curl passes, urllib doesn't; the real `x-ratelimit` is 10000 and untouched). Fix = send a normal `User-Agent` header (`curl/8.4.0`) and the whole app publishes in one clean run; do not chase a phantom quota. attach/detach reference the connection as `{{account.apiKey}}` (not `{{connection.*}}`) and don't inherit base, so write them absolute; Make **auto-names** created webhooks — capture the real name from the create response to link instant-trigger modules. Token needs scopes `sdk-apps:read` + `sdk-apps:write`.

Manual fallbacks (same Developer Platform), section-by-section — the bundle's top-level keys (`base`, `connection`, `modules[]`, `webhooks[]`, `rpcs[]`) map 1:1 to components:
- **Make Apps Editor for VS Code** (Marketplace: `Integromat.apps-sdk`) — each component is an editable JSON doc; downloads on open, uploads on save. Add an SDK environment (zone-specific API URL, e.g. `us1.make.com/api`) + your Make API key.
- In-browser builder → **Create custom app** makes only the *shell* (name `^[a-z][0-9a-z-]+[0-9a-z]$`, 3–30 chars); then the app's `+` menu → Create Connection / Webhook / Module / Remote Procedure, pasting each. Note: the Connection **doesn't inherit base** so its Communication URL must be **absolute**; webhook attach/detach do inherit but use `{{account.apiKey}}`.

Run the repo's validate script first so the JSON is well-formed.

### What `app.json` must contain to PASS public review (learned, concrete)

The private app works with far less; the *public review* has extra hard prereqs. Bake these into `app.json` before submitting (source: `developers.make.com/custom-apps-documentation/app-review/prerequisites`):
- **A Universal module** — a generic HTTP-passthrough module (relative `url` + `method` select + optional `headers`/`qs`/`body`, bound with Make's `{{toCollection(parameters.x,'key','value')}}` idiom). Review *requires* exactly one. **Caveat**: the single-file import format has no documented `kind: "universal"` string (validators typically allow only `action`/`search`/`instant_trigger`), so author it as `"kind": "action"` and, after import, set the module type to **Universal** in the Make editor. Keep the URL **relative** — Make rejects universal modules where the user can set the host; pin the host in `base.baseUrl`.
- **`limit` + pagination on list/search modules** — every list-type `search` module needs a `limit` param; add `cursor`/`page` where the API actually paginates. Single-item getters don't. For endpoints with no server-side pagination, a client-side `limit` cap is acceptable — note it.
- **Typed dates** — every date field in an `interface` or mappable parameter uses `"type": "date"`, not text.
- **Sanitized secrets** — `base.log.sanitize` (and `connection.log.sanitize`) must list `request.headers.authorization` so the API key never lands in logs.
- **Real interfaces + labels + descriptions** on every module, matching the OpenAPI response shape.

### Submit for public listing (developers.make.com → Request app review)

To list in the public Make apps directory, request a review: on the app's **Review** page fill the form — link to the **service's API documentation** and link to **scenarios that actually use your app's modules** — then **Request review**. Make's QA team reads your app's code; if it passes, Make publishes it to all users. Track status by the email subject `App review: <YourAppName>`; status also shows on the Review page.

Gotchas / gates:
- **Novelty requirement**: the app must connect to a service Make *doesn't already integrate*. If Make already has a Content Rabbit module, review is refused as a duplicate.
- **The scenarios are the real work, and NOT automatable.** The Review form has **one field PER MODULE** — a separate Make scenario URL (`https://us1.make.com/{orgId}/scenarios/{id}/edit`) for **every** module, each showing a **successful run** of that module — plus one more field for a scenario that deliberately triggers an **API error** (e.g. a getter with a bogus id). For a 32-module app that's 33 scenarios you build and run by hand. The SDK Apps API builds the app but **cannot** produce these: the Scenarios API can create empty scenarios but can't make them meaningfully pass, and modules with side effects (create/publish/delete) act for real — so budget genuine manual QA time. Also toggle **every module to "visible"** first (the form checks it). Run the scenarios right before requesting review — execution logs expire. Publishing is **permanent (no unpublish)**, so only Publish when you're ready to do all this. You CAN create the scenario *shells* via the Scenarios API to save the building (`POST /api/v2/scenarios?confirmed=true`, blueprint module ref `app#{app}:{module}`, real numeric teamId or you get `IM002`, `scenarios:write` scope) — `pooriaarab/scripts` has `make/create-review-scenarios.py` for this — but the connection is UI-only (`POST /connections` returns "Failed to load manifest" for a private app) and the runs are still manual.
- **After you Request review, Make emails a Tally follow-up form that GATES the review** ("Externally developed apps on Make" — the review does not proceed until it's submitted). It asks: relationship to the API vendor (first-party = "We are the direct vendor of that software (ISV)"), ISV company name, software homepage URL, an optional square-PNG logo, a **partnership contact** (email + name + phone — the phone is a masked tel input, so type a leading `1` for +1 or it won't format), a **support contact** (email + name), the app **category + subcategory** (e.g. Marketing → Social Media), and two required attestations (trademark ownership, external-service T&C). Watch the inbox for it.
- Review form needs: API-docs URL, links to those test scenarios, support email, categories, a **512×512 PNG logo** (≤500 kB), and trademark + external-terms confirmations.
- Until approved, the app is **private/unlisted** (usable by you, not in the directory). That's the normal pre-review state, not a failure.
- Confirm the current prerequisites and reviewer checklist at `developers.make.com/custom-apps-documentation/app-review/prerequisites` — the pass/fail checklist drifts.

---

## 3. Pipedream components — PR into PipedreamHQ/pipedream

The registry is the monorepo. Publishing = a merged PR to `PipedreamHQ/pipedream` under `components/`.

### Layout (exact, or the PR bounces)

```
components/contentrabbit/
  contentrabbit.app.mjs                       # the app file (shared auth + prop defs)
  sources/<event>-instant/<event>-instant.mjs # sources = triggers, past-tense key
  actions/<verb>-<thing>/<verb>-<thing>.mjs   # actions, active-verb key
  package.json
```

- **ES modules only** — `.mjs`, `export default`. Not `.js`.
- Each component's **`key`** is globally unique and namespaced: `contentrabbit-create-post` (action, active verb) / `contentrabbit-post-published` (source, past tense). This key is what gates registry identity — a dup or a mis-shaped key fails review.
- Required metadata per component: `key`, `name` (friendly, singular, title-case, **no app name in it**), `version` (start `0.0.1`, semver), `description`, `type` (`"action"` or a source type). Actions add `annotations` (`readOnlyHint`, `destructiveHint`, `openWorldHint`).
- Props: mirror the app's UI labels, describe with markdown, use async options for ID pickers, minimize required fields.

### Submit

Fork → branch → PR to `master`. A Pipedream team member is auto-notified. CI runs lint (`npx eslint components/contentrabbit`; `--fix` to autofix) and other automated checks — a red PR won't be looked at. Once merged, components appear in the Pipedream app registry for anyone to run. No paid tier, but review is real and can ask for changes. Full rules: `pipedream.com/docs/components/guidelines` and the monorepo `CONTRIBUTING.md`.

---

## 4. Claude Code plugin — a marketplace repo, no central directory

Honest framing: **there is no single official central directory to "submit" a Claude Code plugin to.** Distribution *is* a public git repo (a "marketplace") that users add by name. Anthropic runs an official curated marketplace (`anthropics/claude-plugins-official`) but you don't self-serve into it — you ship your own marketplace repo and share the add command.

### The two manifests

`.claude-plugin/plugin.json` in the plugin dir:

```json
{
  "name": "contentrabbit",
  "description": "Schedule and manage Content Rabbit posts from Claude Code",
  "version": "1.0.0",
  "author": { "name": "Pooria" }
}
```

`.claude-plugin/marketplace.json` at the repo root (the catalog):

```json
{
  "name": "contentrabbit",
  "owner": { "name": "Pooria" },
  "plugins": [
    { "name": "contentrabbit", "source": "./integrations/claude-plugin", "description": "…" }
  ]
}
```

`version` in plugin.json controls updates — bump it every release or users never pull changes. `source` can be a relative path (plugin lives in this repo) or a git ref.

### Distribute

Push the repo public. Users run:

```
/plugin marketplace add <owner>/<repo>
/plugin install contentrabbit@contentrabbit
```

Updates: you push; users run `/plugin marketplace update`. That's the whole distribution mechanism — the "listing" is the README + the add command.

### Where to actually get discovered

Since there's no official submission form, reach = community aggregators. These drift; verify each is live before spending time:
- Community plugin-hub sites and "awesome-claude-code" style lists (README PRs, same shape as awesome-mcp-servers).
- The docs (`code.claude.com/docs/en/plugin-marketplaces`, `.../discover-plugins`) describe creating/adding marketplaces; there is no self-serve path into the Anthropic-curated list documented — treat inclusion there as out of your control.

`server.json` in the plugin bundles an MCP server — if you also want *that* listed on MCP directories, that's the **mcp-directory-submission** skill, a separate effort.

---

## 5. ChatGPT / Codex app (Apps SDK) — HOSTED `/mcp` + OAuth 2.1 REQUIRED

**Read this first: the real gate is OAuth, not hosting.** The submission portal requires a **public production `/mcp` URL** the reviewer can reach *and* that URL must authenticate each end user via **OAuth 2.1** — ChatGPT cannot send a custom API key or a machine-to-machine token. So a Bearer-API-key-only MCP server is reachable but **still not listable**: a reviewer (and Scan Tools) can't connect an account to it.

To unblock, the MCP host needs, additively (keep the API-key path for Codex/CLI/SDK):
- `GET /.well-known/oauth-protected-resource` (RFC 9728) naming the auth server + scopes + resource.
- `GET /.well-known/oauth-authorization-server` (RFC 8414) with PKCE `S256` and client registration via CIMD (`client_id_metadata_document_supported`) or DCR (RFC 7591).
- Authorize + token endpoints with a consent flow that mints tokens the `/mcp` route accepts, token `aud` = the MCP resource URL.
- A `WWW-Authenticate` challenge on 401 + per-tool `securitySchemes`.

**Codex CLI is NOT blocked** — it sends the API key via `bearer_token_env_var`, and the stdio `.mcp.json` variant works in the ChatGPT desktop app through a local marketplace. Only the *hosted public listing* needs OAuth. Everything below applies once OAuth exists.

The Apps SDK is in **beta**. Submission portal: **`platform.openai.com/plugins`**.

Prerequisites:
- An org role with **"Apps Management"** (plugin-submission) write access.
- Completed **identity verification** (individual or business) in the OpenAI Platform for the publishing name.
- The MCP server on a **public, production** URL (not localhost, not a tunnel that dies).

Submission steps (type **"With MCP"**):
1. Provide the production `/mcp` URL (Universal type for most).
2. Portal **scans** your tools + metadata.
3. **Verify the domain** — host the challenge token at `/.well-known/openai-apps-challenge`.
4. Define exact **CSP domains** your UI fetches from.
5. Provide **reviewer demo credentials** if auth is required — no MFA/SMS/email-confirmation on that account.
6. Add **5 positive + 3 negative** test cases with expected behavior.
7. Release notes + policy attestations → **Submit for Review**. Review ≠ publish; you choose when to publish after approval.

Once published it appears in the **Plugins Directory shared by ChatGPT and Codex** — the same listing serves both, so Codex consumes it automatically; no separate Codex submission. Tool `annotations` (`readOnlyHint`/`destructiveHint`/`openWorldHint`) must match real behavior or review fails. Guidelines: `developers.openai.com/apps-sdk/app-submission-guidelines`; flow: `developers.openai.com/plugins/deploy/submission`.

---

## 6. Zapier — dev-portal review + a usage gate you can't fake

Build in the **Platform UI** (browser) or the **Zapier Platform CLI** (local, version-controlled) — same Developer Platform, the repo's `integrations/zapier/` is the CLI form.

Submit: log in to **`zapier.com/app/developer`** → pick the integration → Integration Home → **Publish** → fill the form → **Submit for Review**. A Zapier developer reaches out within ~1 week. The app then enters **Beta** and appears in the app directory (`zapier.com/apps`) with a beta tag.

The gate that matters:
- **Beta lasts 90 days, and public listing is auto-granted only after 50 active users + ≥10 published Zap templates.** "Active" = the user has your app in a turned-on Zap. A daily job checks and auto-launches when you qualify.
- **Waiver**: embed Zapier in-product behind login and Zapier waives the 50-user requirement — a single signup through an embedded tool exits Beta the next business day and unlocks Partner Program benefits. For a brand-new app with no user base, the embed route is the realistic path to public.

So Zapier is *listable* fast (Beta, ~1 week) but *fully public* only after real adoption or an embed. Docs: `docs.zapier.com/platform/publish/public-integration`.

---

## 7. Anthropic Claude Connectors Directory — self-serve in claude.ai, OAuth-gated

**Distinct from §4.** §4 is the *Claude Code plugin* marketplace (a git repo users add). This is the **Connectors Directory** inside **claude.ai** — the curated list of remote MCP servers a Claude user adds with one click. It IS self-serve, and acceptance is itself the "verified" status.

Same OAuth 2.1 requirement as ChatGPT (§5) — build it once, submit to both. On top of OAuth:
- **Public privacy policy URL** — a missing/incomplete one is an *immediate* rejection. Non-negotiable.
- **Per-tool annotations** — every tool marked read-only vs destructive (`destructiveHint`); wrong write-annotations fail review.
- **Public docs URL** (one help page or post is enough) + **≥3 example prompts** exercising different tools.
- **Test account** with realistic sample data the reviewer logs into, **server logo + favicon**, and confirmation of **HTTPS + Origin-header validation**.
- You submit through the portal from a **Team or Enterprise** Claude org.

Submit inside claude.ai (Settings → the connectors/submission surface). Escalations: `mcp-review@anthropic.com`. Policy + FAQ: `support.anthropic.com` MCP directory articles; building/submission: `claude.com/docs/connectors/building/submission`.

---

## 8. Official MCP Registry — the vendor-neutral hub

`registry.modelcontextprotocol.io` is the open, neutral directory. Publishing here is the highest-leverage single step: its consumers include **Anthropic, Smithery, PulseMCP, Docker Hub, and GitHub**, so one publish fans out to many surfaces.

- Publish the same `server.json` the plugin bundles.
- **Namespace must be one you can prove** — either `io.github.<org>/<server>` (verified via GitHub OIDC, easiest) or reverse-DNS `com.<yourdomain>/<server>` (DNS TXT or HTTP challenge). **GOTCHA**: don't let the manifest's namespace drift from a domain you don't control — e.g. `ai.contentrabbit/...` fails if the live domain is `contentrabbitai.com`; use `io.github.<owner>/...` or `com.contentrabbitai/...` to match what you can actually verify.
- Registry also verifies **package ownership** (you control the referenced npm package) and restricts base URLs to trusted public registries.
- Publish via the registry CLI/API (namespace auth is the gate, not human review).

This is a **no-review, namespace-verify** step — do it early alongside the npm publish.

---

## 9. Other agent harnesses (opencode, openclaw, hermes, …) — no directory to submit to

These consume MCP servers via **config** (a local stdio command or a remote URL) — they have **no curated store or submission form**. Don't spend effort hunting for one. Coverage for the entire long tail = (a) the stdio npm package, (b) the hosted URL, and (c) being in the Official MCP Registry (§8), which many clients read from. Ship those three, then add a short `## Add to any MCP client` snippet (the URL + the `npx` stdio command) to the connector README — that snippet *is* the "submission" for every config-driven harness.

---

## Verify the connector actually works before you submit anything

A listing for a connector that errors on the first real call is worse than no listing. Each platform has a local test path — run it against the exact package/manifest you're about to submit:

- **n8n**: install the compiled package into a local n8n and run a real node + trigger. `npm install /path/to/n8n-nodes-contentrabbit` into `~/.n8n/custom` (or link it), restart n8n, drop the node into a workflow, execute against staging. Also run `npx @n8n/scan-community-package <pkg>` — it's the same scanner verification uses, so a local pass predicts the review.
- **Make**: import via the VS Code extension into a real Make environment, build a scenario using your modules, run it once. The review *requires* working example scenarios anyway, so this doubles as submission prep.
- **Pipedream**: run the component locally with the Pipedream CLI (`pd`) before the PR — deploy a source, trigger it, run an action. CI will lint, but lint doesn't prove the API call works.
- **Claude Code plugin**: `/plugin marketplace add ./integrations/claude-plugin` (local path) then `/plugin install …` and exercise the commands/skills before pushing public. Copied plugins can't reach files outside their own dir (`../shared`) — a local install catches that.
- **ChatGPT app**: hit your hosted `/mcp` with an MCP `initialize`→`tools/list` handshake (same check as the MCP skill) before pointing the portal at it. The portal's tool scan fails loudly if the endpoint is down or the tool schema is malformed.
- **Zapier**: `zapier test` / `zapier validate` in the CLI, and run the auth + a trigger + an action in the Platform UI's built-in tester against a staging account.

## Order of operations for a batch

Cheapest / no-review first, usage-gated and hosting-gated last:

1. **npm-publish the n8n node** with the keyword + `n8n` field. Installable immediately, zero review. (Do the provenance GitHub Action *now* if you'll ever want the badge — retrofitting a local publish means a version bump and re-publish.)
2. **Push the Claude Code plugin marketplace repo public.** Live the moment it's pushed; no submission. Share the `/plugin marketplace add` command.
3. **Publish `server.json` to the Official MCP Registry** (§8) under a verifiable namespace. No human review, fans out to Anthropic/Smithery/PulseMCP/Docker/GitHub.
4. **Open the Pipedream monorepo PR.** One PR, all components, correct `key`s, green CI. Then it waits on human review — start it early because merge latency is out of your hands.
5. **Import + request review on the Make app.** Needs working example scenarios built first; QA review follows.
6. **Submit the n8n verified badge** via the Creator Portal — only after the provenance-published package is on npm and the scanner passes.
7. **Publish the Zapier app** → Beta in ~1 week, but plan the embed/usage path for public.
8. **Build OAuth 2.1 on the MCP host — the shared unlock for ChatGPT (§5) + Claude Connectors (§7).** LAST and biggest: a real auth-server build, not a portal click. Once it ships + deploys, submit to both directories (mostly browser/portal steps + assets). Don't sequence 1–7 behind it.

Steps 1–3 are instant and parallel (no review). 4–8 each need a browser sign-in, a PR review, an example scenario, or the OAuth build — none batch-automate, so treat them as independent tracks.

## Blocked / private-repo cautions (mirror the MCP skill)

- **Private repos break the human-reviewed listings.** Pipedream is a *public* monorepo PR — the code goes public regardless. Make/Zapier/ChatGPT reviewers and the Claude marketplace all link to or fetch from your repo; a private repo means dead "view source" links and a Claude marketplace nobody can `add`. If you flip a connector repo public to list it, **audit history for secrets first** (API keys, `.env`, tokens across all branches — going public is irreversible and exposes full history), same as the MCP skill's going-public checklist.
- **ChatGPT + Claude Connectors are OAuth-gated** — see §5/§7. A hosted `/mcp` that only accepts a client-presented API key is reachable but not listable on either; the unlock is OAuth 2.1, and it's one build for both. Don't promise these two until the OAuth server ships.
- **Novelty walls**: Make refuses an app for a service it already integrates; n8n refuses a node that duplicates an existing one. Check the target directory for an existing Content Rabbit connector before building the submission.
- **Usage walls**: Zapier's public (non-Beta) listing needs 50 active users or an embed — a cold app never auto-goes-public on merit alone. Set expectations: "listed in Beta" ≠ "in the public directory."

## Auth quirks per portal

An agent can *start* these and open the URL, but a human completes any OAuth/identity step:
- **npm** (n8n): standard `npm login` / automation token. For the verified badge, the publish must run in **GitHub Actions with provenance** — so the token lives in repo secrets, not your laptop.
- **n8n Creator Portal**: separate sign-in from npm; the portal is the submission surface.
- **Make**: a **Make API key** (from your Make account) pasted into the VS Code extension, zone-specific API URL. Review is a form, no extra auth.
- **Pipedream**: GitHub PR — just your GitHub login. CLI needs `pd login` for local testing.
- **Claude Code plugin**: none — it's a public git repo.
- **ChatGPT**: OpenAI Platform login + **completed identity verification** + "Apps Management" role. The identity check is a real KYC step and the slow part. Plus the OAuth server (§5) must be live before the portal can connect.
- **Claude Connectors Directory**: a **Team/Enterprise** claude.ai org to submit; the connector's own **OAuth 2.1** for per-user auth; a public **privacy policy** (hard reject if absent) + reviewer test account.
- **MCP Registry**: namespace proof only — **GitHub OIDC** (`io.github.<org>/…`, automatic in an Actions publish) or a **DNS/HTTP challenge** on your domain (`com.<domain>/…`). No login-gated review.
- **Zapier**: `zapier.com/app/developer` login; CLI `zapier login`.

## Skip / dead

- **No central Claude Code plugin directory to submit to** — distribution is your marketplace repo; the Anthropic-curated list isn't self-serve. Don't hunt for a submission form.
- **Zapier "public directory" as a quick win** — it isn't; it's a 50-user/embed gate behind a 90-day Beta. List in Beta, but don't treat public as same-day.
- **ChatGPT / Claude Connectors on a Bearer-key-only MCP** — reachable but not listable; the gate is OAuth 2.1, not hosting. Skip both until the OAuth server ships (§5/§7).
- **Hunting for an opencode/openclaw/hermes "directory"** — none exists (§9). The MCP Registry + npm + hosted URL is the coverage; don't look for a per-harness form.
- **Make app for an already-integrated service** — refused as duplicate; don't build the submission.
