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
| **Hosted endpoint REQUIRED** | ChatGPT / Codex Apps-SDK app | Needs a **public production `/mcp` URL** the reviewer can reach. No hosted MCP = cannot submit. See §5. |

Do the zero-review ones first (npm publish for n8n, push the Claude plugin marketplace repo). They cost nothing and are live immediately. Save the usage-gated and hosting-gated ones for last.

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

Two editors, same Developer Platform:
- **Make Apps Editor for VS Code** (Marketplace: `Integromat.apps-sdk`) — the practical path for a repo-managed `app.json`. Add an SDK environment (API URL is zone-specific, e.g. `us1.make.com/api`; EU zones differ), paste your Make API key, then create/edit the app. Config downloads on open, uploads on save. This is how you get the repo's `app.json` into a live Make app.
- The in-browser app builder on make.com (My Apps) — same backend, no local files.

Run the repo's validate script before importing so the JSON is well-formed.

### Submit for public listing (developers.make.com → Request app review)

To list in the public Make apps directory, request a review: on the app's **Review** page fill the form — link to the **service's API documentation** and link to **scenarios that actually use your app's modules** — then **Request review**. Make's QA team reads your app's code; if it passes, Make publishes it to all users. Track status by the email subject `App review: <YourAppName>`; status also shows on the Review page.

Gotchas / gates:
- **Novelty requirement**: the app must connect to a service Make *doesn't already integrate*. If Make already has a Content Rabbit module, review is refused as a duplicate.
- You must supply **working example scenarios** — a bare app with no demonstrated modules gets bounced.
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

## 5. ChatGPT / Codex app (Apps SDK) — HOSTED ENDPOINT REQUIRED

**Read this first: the ChatGPT app is the one connector that cannot be listed without hosting the product doesn't have yet.** The submission portal requires a **public production `/mcp` URL** that OpenAI's reviewer can reach over the network. The repo's `integrations/codex-plugin/chatgpt/` + `codex/` are the app definition, but with no hosted MCP endpoint there is nothing to point the portal at. **If the product can't yet host a public MCP server, this listing is blocked — stop here and say so.** Everything below applies only once hosting exists.

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
3. **Open the Pipedream monorepo PR.** One PR, all components, correct `key`s, green CI. Then it waits on human review — start it early because merge latency is out of your hands.
4. **Import + request review on the Make app.** Needs working example scenarios built first; QA review follows.
5. **Submit the n8n verified badge** via the Creator Portal — only after the provenance-published package is on npm and the scanner passes.
6. **Publish the Zapier app** → Beta in ~1 week, but plan the embed/usage path for public.
7. **ChatGPT app — LAST, and only if hosting exists.** Blocked entirely without a public `/mcp` URL; don't sequence work behind it.

Steps 1–2 are instant and parallel. 3–7 each need a browser sign-in, a PR review, an example scenario, or a hosted endpoint — none batch-automate, so treat them as independent tracks.

## Blocked / private-repo cautions (mirror the MCP skill)

- **Private repos break the human-reviewed listings.** Pipedream is a *public* monorepo PR — the code goes public regardless. Make/Zapier/ChatGPT reviewers and the Claude marketplace all link to or fetch from your repo; a private repo means dead "view source" links and a Claude marketplace nobody can `add`. If you flip a connector repo public to list it, **audit history for secrets first** (API keys, `.env`, tokens across all branches — going public is irreversible and exposes full history), same as the MCP skill's going-public checklist.
- **ChatGPT app is hard-blocked without hosting** — see §5. Don't promise this listing until a public MCP endpoint exists.
- **Novelty walls**: Make refuses an app for a service it already integrates; n8n refuses a node that duplicates an existing one. Check the target directory for an existing Content Rabbit connector before building the submission.
- **Usage walls**: Zapier's public (non-Beta) listing needs 50 active users or an embed — a cold app never auto-goes-public on merit alone. Set expectations: "listed in Beta" ≠ "in the public directory."

## Auth quirks per portal

An agent can *start* these and open the URL, but a human completes any OAuth/identity step:
- **npm** (n8n): standard `npm login` / automation token. For the verified badge, the publish must run in **GitHub Actions with provenance** — so the token lives in repo secrets, not your laptop.
- **n8n Creator Portal**: separate sign-in from npm; the portal is the submission surface.
- **Make**: a **Make API key** (from your Make account) pasted into the VS Code extension, zone-specific API URL. Review is a form, no extra auth.
- **Pipedream**: GitHub PR — just your GitHub login. CLI needs `pd login` for local testing.
- **Claude Code plugin**: none — it's a public git repo.
- **ChatGPT**: OpenAI Platform login + **completed identity verification** + "Apps Management" role. The identity check is a real KYC step and the slow part.
- **Zapier**: `zapier.com/app/developer` login; CLI `zapier login`.

## Skip / dead

- **No central Claude Code plugin directory to submit to** — distribution is your marketplace repo; the Anthropic-curated list isn't self-serve. Don't hunt for a submission form.
- **Zapier "public directory" as a quick win** — it isn't; it's a 50-user/embed gate behind a 90-day Beta. List in Beta, but don't treat public as same-day.
- **ChatGPT app without a hosted MCP endpoint** — cannot submit at all. Skip until hosting exists.
- **Make app for an already-integrated service** — refused as duplicate; don't build the submission.
