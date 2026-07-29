---
name: mcp-directory-submission
description: "Use when the user has a working MCP server (local/stdio, npx-launched, or remote) and wants it listed on public MCP directories — the official registry, Smithery, Glama, PulseMCP, cursor.directory, mcpservers.org, mcp.so, Cline marketplace, mcp-get, or awesome-mcp-servers lists. Covers which directories accept local-only stdio servers with no hosted endpoint (most of them), the exact server.json schema and mcp-publisher CLI flow for the official registry, the smithery.yaml shape, PR-based catalogs vs auto-crawl vs manual forms, and the gotchas that produce silent rejections (100-char description limit, missing mcpName ownership field, npx multi-bin resolution, short-lived publish JWT). Triggers: 'submit my MCP server', 'list on MCP registry', 'get my MCP on Smithery/Glama/PulseMCP', 'MCP directory submission', 'publish to modelcontextprotocol registry'."
---

# MCP directory submission

A local/stdio MCP server — the kind most agentic-CLI companion tools ship, launched via `npx <pkg> mcp` or a dedicated bin with no public HTTP endpoint — is eligible for most MCP directories. **A hosted endpoint is the exception, not the requirement.** Most directories index the npm package plus a manifest file, not a live URL.

## Two buckets, check this first

| Needs | Directories |
|---|---|
| **Local/stdio OK, no hosting** | Official registry, Glama, PulseMCP, awesome-mcp-servers, cursor.directory, mcp.so, Cline marketplace, Smithery (via MCPB bundle) |
| **Hosted/remote endpoint required** — skip if local-only | OpenAI Apps SDK / ChatGPT app directory, Anthropic Connectors Directory (`platform.claude.com` — OAuth + hosted URL). Claude Code plugin directory is a different product (a Claude Code *plugin bundle*, not a bare MCP package) — only relevant if you wrap the server as one. |

Publish to the official registry **first** — PulseMCP and several others auto-ingest from it on a crawl cadence, so one publish propagates outward.

## 1. Official registry (registry.modelcontextprotocol.io) — do this first

```bash
brew install mcp-publisher
mcp-publisher login github     # device flow: visit the URL, enter the code, approve
```

The JWT from `login` is short-lived (expires in well under an hour) — if `publish` 401s with `token is expired`, just re-run `login`, don't debug further.

`server.json` at the repo root, minimal npm/stdio example:

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  "name": "io.github.<user>/<pkg>",
  "description": "One line, <=100 chars — server-side check, NOT enforced by the local JSON Schema, so `validate` can pass and `publish` still 422 on this.",
  "version": "1.0.0",
  "repository": {
    "url": "https://github.com/<user>/<repo>",
    "source": "github",
    "id": "<numeric github repo id, via: gh api repos/<user>/<repo> --jq .id>"
  },
  "packages": [
    {
      "registryType": "npm",
      "registryBaseUrl": "https://registry.npmjs.org",
      "identifier": "<npm-package-name>",
      "version": "1.0.0",
      "transport": { "type": "stdio" },
      "runtimeHint": "npx",
      "packageArguments": [
        { "type": "positional", "valueHint": "subcommand", "value": "mcp" }
      ]
    }
  ]
}
```

Then:

```bash
mcp-publisher validate   # schema check only — catches shape errors, not the 100-char description limit
mcp-publisher publish
```

**Namespace ownership**: `io.github.<user>/*` is authorized by the GitHub login itself — no separate proof needed. `com.<brand>/*` needs a DNS TXT record at the domain apex instead.

**`mcpName` gotcha (blocks every first publish attempt)**: the registry cross-checks npm package ownership by requiring a matching field *in the published npm package's `package.json`*:

```json
"mcpName": "io.github.<user>/<pkg>"
```

This is **not** in the generic server.json JSON Schema, so `mcp-publisher validate` won't catch it — you only find out at `publish` time (`400`, `"NPM package '<pkg>' is missing required 'mcpName' field"`). Add the field, bump the package's version (registries reject re-publishing an already-used version), publish to npm, wait for the new version to actually resolve (`npm view <pkg> version`), *then* re-run `mcp-publisher publish` with `server.json`'s `version` matching the new npm version exactly (`server.json` version and the npm package version must be identical strings).

**Command-shape gotcha**: don't assume `npx <pkg>` alone launches the MCP server. If the package exposes MCP via a subcommand (`<pkg> mcp`) rather than a dedicated same-named bin, encode that subcommand as a `packageArguments` positional (as in the example above) — check the package's actual documented/working MCP client config (e.g. an existing `mcpServers` entry in `~/.claude.json` or the README) rather than guessing from `package.json`'s `bin` map alone; packages sometimes ship a dedicated `<pkg>-mcp` bin that's stale/unused in favor of a `mcp` subcommand on the main bin, or vice versa.

## 2. awesome-mcp-servers (punkpeye/awesome-mcp-servers)

A README list, ~90k stars, crawled by Glama/PulseMCP so one PR has secondary reach. Fork, add one Markdown line per server under the right category header, open a PR. Verify the current entry format and category anchors from the live README before writing — both drift.

Current entry format (one line per server):

```
- [owner/repo](github-url) 📇 🏠 🍎 🪟 🐧 - Description. Install: `npx -y <pkg> mcp`.
```

Legend emoji: `📇` TypeScript/JS, `🏠` runs locally, `🍎 🪟 🐧` per-OS, `☁️` cloud-hosted (omit for local-only), `🎖️` official vendor (omit unless you are one). Insert each entry at the end of its category section; add a blank line before the next `### ` heading if your insert would glue against it (Markdown needs it). Category section names are `### ` headings with a `<a name="...">` anchor — pick the closest fit (e.g. Communication, Multimedia Process, Social Media, Developer Tools).

## 3. Smithery.ai

**The old `smithery.yaml` with `commandFunction` is gone.** Current publish flow (smithery.ai/docs/build/publish):

- **URL method** — for servers you already host over Streamable HTTP. Enter the public HTTPS URL at `smithery.ai/new`; Smithery's Gateway proxies to it and scans for metadata. Not applicable to a local-only server.
- **Local (MCPB bundle)** — the only local-server path. Build an `.mcpb` bundle (Anthropic's desktop-extension format: a zip with `manifest.json` + the server code — see the MCPB spec at `github.com/modelcontextprotocol/mcpb`), then `smithery mcp publish ./server.mcpb -n <org>/<server>` (needs the Smithery CLI + login) or upload via the web flow.

So Smithery for a local stdio server now costs an MCPB build step per package plus a Smithery login — heavier than a manifest commit. Defer it unless you want the listing badly.

## 4. Glama.ai (glama.ai/mcp/servers)

Mostly auto-crawls public GitHub repos with recognizable MCP server code (indexes tools/schemas/annotations directly). A manual submission form also exists (name, description, repo URL, install snippet, transport, tool count). No paywall. Favours a real README with an install/config snippet over a bare repo.

## 5. PulseMCP (pulsemcp.com)

Manual form at `pulsemcp.com/submit`. Also auto-ingests from the official registry on its own cadence, so publishing there first often gets you listed here for free — check before manually submitting to avoid a duplicate entry.

## 6. cursor.directory

Not a PR — content is submitted through the website. Add a root `.mcp.json` to your server's own repo (standard open-plugins / Cursor config shape), then paste the repo URL at `cursor.directory/plugins/new` (sign-in required) and the backend crawls it. Local/stdio supported.

```json
{ "mcpServers": { "<pkg>": { "command": "npx", "args": ["-y", "<pkg>", "mcp"] } } }
```

## 7. mcp.so and Cline MCP Marketplace — GitHub-issue submissions

Both take a GitHub **issue**, not a PR, and both accept local/stdio:

- **mcp.so** — the site's "Submit" button opens a new issue on `chatmcp/mcp-directory`. Fill the template: server name, description/features, repo URL, and the install/config JSON block users paste into their client config.
- **Cline MCP Marketplace** — open an issue on `cline/mcp-marketplace` (`mcp-server-submission.yml` template) with the repo URL, a **400×400 PNG logo**, and a reason. Manual review, quality-gated on GitHub traction and maintainer credibility, so brand-new low-star packages may be deferred. Confirm Cline can set the server up from your README alone before submitting.

## Dead / dropped

- **mcp-get** (`michaellatman/mcp-get`) — archived, no longer accepting packages; its own README redirects to Smithery. Don't submit.
- **mcpservers.org / chatmcp** — SQL/auto-index backend, no clean per-server PR path; skip in favour of mcp.so's issue flow (same chatmcp org).

## Order of operations for a batch of packages

Cheapest, highest-reach first:

1. Confirm each package is already live on npm at the version you're about to reference.
2. Add `mcpName` to each package's `package.json` if missing, bump patch version, publish to npm, verify with `npm view <pkg> version`.
3. Write `server.json` per repo (validate locally, but expect the 100-char description trap regardless).
4. `mcp-publisher login github` → `publish` per repo — re-login if the JWT expires mid-batch. **This is the big one**: PulseMCP and Glama auto-ingest from the official registry, so this single step propagates outward over the next few days with no extra work.
5. **awesome-mcp-servers** — one PR, all your servers, placed by category. Pure Markdown, no per-package tooling.
6. Leave Glama/PulseMCP to auto-ingest for a few days before manually form-submitting, to avoid duplicate listings.
7. Per-directory manual steps as appetite allows: cursor.directory (commit `.mcp.json`, then web submit), mcp.so (issue), Cline (issue + 400×400 logo), Smithery (MCPB build + login). Each needs a browser sign-in, a GitHub issue, a design asset, or a build step — none are pure batch automation, so they don't parallelise the way steps 4–5 do.

## Skip list (and why)

- **OpenAI Apps SDK / ChatGPT app directory** — requires a hosted/remote MCP endpoint ChatGPT can reach over the network. A local npx server has nothing to point it at.
- **Anthropic Connectors Directory** (`platform.claude.com`) — same constraint: OAuth + a hosted URL, not stdio.
- **Docker MCP Catalog/Toolkit** — requires an OCI image. Skip unless the server is already containerized; don't containerize solely for this listing.
- **Claude Code plugin directory** — a different artifact type (a Claude Code plugin bundle: hooks/commands/skills), not a bare MCP server package. Only relevant if you're deliberately wrapping the MCP server as a Claude Code plugin.
