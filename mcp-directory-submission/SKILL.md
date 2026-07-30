---
name: mcp-directory-submission
description: "Use when the user has a working MCP server (local/stdio, npx-launched, or remote) and wants it listed on public MCP directories — the official registry, Smithery, Glama, PulseMCP, cursor.directory, mcp.so, Cline marketplace, or awesome-mcp-servers lists. Covers which directories accept local-only stdio servers with no hosted endpoint (most of them), the exact server.json schema + mcp-publisher CLI flow for the official registry, the MCPB-bundle recipe for Smithery (the old smithery.yaml is gone), the awesome-mcp-servers entry format, cursor.directory's .mcp.json web flow, the mcp.so/Cline GitHub-issue submissions, how to verify a server actually starts before submitting (catches no-mcp-subcommand / symlink-guard / tsup-barrel breakage), the audit-before-going-public step when repos are private, the per-CLI login/auth quirks (short-lived JWT, device-code timeout, WorkOS OAuth, namespace ≠ GitHub handle), and the gotchas that produce silent rejections (100-char description limit, missing mcpName ownership field, npx multi-bin resolution). Triggers: 'submit my MCP server', 'list on MCP registry', 'get my MCP on Smithery/Glama/PulseMCP/Cline/cursor.directory', 'MCP directory submission', 'publish to modelcontextprotocol registry', 'build an MCPB bundle'."
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

## 3. Smithery.ai — via MCPB bundle (local servers)

**The old `smithery.yaml` with `commandFunction` is gone.** A local stdio server now publishes as an **MCPB bundle** (`.mcpb` = a zip of `manifest.json` + the server code, Anthropic's desktop-extension format). The URL method (`smithery.ai/new`) is only for servers you already host over Streamable HTTP.

Proven end-to-end recipe (self-contained bundle, npm package inside):

```bash
mkdir bundle && cd bundle
npm init -y
npm install <pkg>@latest --no-audit --no-fund   # vendors the server + deps into node_modules
```

Write `manifest.json` (all fields below are required except homepage/display_name). `entry_point` and the `mcp_config` args point at the installed CLI; `${__dirname}` is substituted at run time:

```jsonc
{
  "manifest_version": "0.2",
  "name": "<pkg>",
  "display_name": "<pkg>",
  "version": "<same as npm>",
  "description": "One line.",
  "author": { "name": "<you>", "url": "https://github.com/<you>" },
  "homepage": "https://github.com/<you>/<repo>",
  "server": {
    "type": "node",
    "entry_point": "node_modules/<pkg>/dist/cli.js",
    "mcp_config": {
      "command": "node",
      "args": ["${__dirname}/node_modules/<pkg>/dist/cli.js", "mcp"]
    }
  }
}
```

Then validate, pack, publish:

```bash
npx -y @anthropic-ai/mcpb validate manifest.json   # schema check
npx -y @anthropic-ai/mcpb pack . ../<pkg>.mcpb      # zips dir incl. node_modules
smithery login                                      # browser (WorkOS) OAuth, one-time
npx -y @smithery/cli publish ./<pkg>.mcpb -n <org>/<pkg>
```

Gotchas:
- **The CLI stdio-MCPB deploy is currently broken.** `smithery publish ./x.mcpb -n <ns>/<name>` creates the server *record* ("✓ Created server …") then fails the bundle-attach with `400 {"error":"No values to set"}`, and retries repeat it. `--config-schema` is rejected ("can only be used when publishing a URL"), so there's no CLI flag around it. Fallback: upload the `.mcpb` through the **web** flow at `smithery.ai/new` (Local / MCPB). Verified reproducible across a batch — don't burn attempts retrying the CLI.
- **Your Smithery namespace may not equal your GitHub handle.** After `smithery login` it prints `Namespace: …` (e.g. a WorkOS org gives `pooria-arab`, not `pooriaarab`). Use that namespace in `-n <namespace>/<name>`, not your GitHub org.
- **`smithery whoami` can print a token that is already invalid** — publish then 401s "Invalid API key or session token". Re-run `smithery login` (browser WorkOS OAuth). The session lives in shared CLI config, so once logged in, all publishes reuse it.
- Bundle size = your whole `node_modules`. A P2P/crypto-heavy server (hyperswarm etc.) packs to ~13–14 MB; a lean one ~3 MB. `mcpb clean <file>` trims dev cruft if it matters.
- `mcpb pack` bundles the *directory*, so keep the bundle dir to just `package.json` + `node_modules` + `manifest.json` — don't build it inside your repo.
- If every package launches its MCP the same way (`<pkg>/dist/cli.js mcp`), the manifest is identical bar name/version/description — script the batch.

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

## Verify the server actually runs before you submit anything

Directory listings are worthless — or actively broken — if the launch command doesn't start a working server. Before publishing to *any* directory, drive a real MCP handshake against the exact command the listing will advertise (`npx -y <pkg> mcp` or the bundled bin): send `initialize`, then `notifications/initialized`, then `tools/list`, and confirm you get a `serverInfo` back and a non-empty tool list.

This catches breakage nothing else does — the npm package installs, the build passes, unit tests pass (they import functions, not the bin), and the server still never starts. Real failures found this way:
- A CLI with **no `mcp` subcommand at all** — the arg parser silently falls through to a different command (e.g. a "start" default), so `<pkg> mcp` does the wrong thing.
- The **symlink main-check bug**: `import.meta.url === new URL('file://'+process.argv[1]).href` is *false* under an npx/global symlinked bin (argv[1] is the symlink, `import.meta.url` is the realpath), so the entry guard never fires and the process exits 0 with no output. Fix with `pathToFileURL(realpathSync(process.argv[1]))`, or better, a dedicated bin entry that calls the server unconditionally.
- **tsup barrel split**: when a multi-entry build has one entry importing another, tsup code-splits shared code into a chunk and the bin becomes a re-export barrel with no runnable guard. Give the MCP bin its own tiny entry file that calls the start function directly.
- **Cold-npx false negatives**: an un-cached package's first `npx` run spends seconds downloading; a 4-second handshake timeout expires before the server is ready. Pre-warm (`npm view <pkg>`) or use a generous timeout, and re-test failures before believing them.

Set the timeout generously (the server may `transport.listen()` before reading stdin) and check `serverInfo` in stdout, not just exit code.

## Going public first — private repos break every listing

Directories link to the GitHub repo and (Cline) fetch a raw logo URL. If the repo is **private**, every public-facing listing has dead links: the awesome-mcp-servers PR and mcp.so/Cline issues get rejected, cursor.directory can't crawl, and the registry's "view source" link 404s (npm is still public, so the server *installs* — only the links break). Symptom: a `raw.githubusercontent.com` logo URL 404s while the same path via `gh api contents … --jq .download_url` returns a `?token=…` URL (the token means private).

If you must flip repos public to list them, **audit before flipping — going public is irreversible and exposes all branches + full history:**
- Scan history (not just HEAD) for secrets: `sk-…`, `wsk_…`, `ghp_…`, `xox[bp]-…`, `AKIA…`, `AIza…`, `-----BEGIN … PRIVATE KEY`, and `.env` / `.pem` / `.key` / `auth.json` in `git log --all --name-only`.
- Scan for PII and for **internal codenames / project names** that shouldn't be public (a scan for your own internal terms — e.g. an internal defense codename, an internal repo name). Scrub these to generic wording. A HEAD scrub cleans current code; history still holds them (full purge = `git filter-repo` + force-push across all branches, usually disproportionate for a comment codename — decide per sensitivity).
- Then `gh repo edit <org>/<repo> --visibility public --accept-visibility-change-consequences`.

## Auth is the slow part — every registry CLI wants a fresh login

Each directory CLI has its own login, and they expire fast. Plan for it:
- **`mcp-publisher` (official registry)**: `mcp-publisher login github` is a GitHub **device flow** (visit URL, enter code, approve). The issued JWT is **short-lived (well under an hour)** — a multi-repo batch will hit `401 "token is expired"` partway; just re-run `login`. The device code itself also expires in ~5 minutes, so if a human isn't approving promptly, it times out (`expired_token` / `device code authorization timed out`). If you're an agent kicking this off for a human, the round-trip often outlives the code — better to hand the human the two commands (`login` then `publish`) to run themselves so the approve happens immediately.
- **`smithery login`**: browser **WorkOS OAuth** (opens `smithery.ai/auth/cli?s=…`). Prints the active `Namespace` on success — use it (see Smithery gotchas). Session persists in shared CLI config.
- General: an agent can *start* these and open the URL, but must not enter passwords or complete OAuth itself — that's the human's step. Only the mechanical publish/commit after a valid session is the agent's.

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
