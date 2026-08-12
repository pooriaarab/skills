---
name: agent-harness-docs
description: "Author one set of agent-facing docs that work across every coding-agent harness — AGENTS.md as the single source of truth, thin per-harness pointers (CLAUDE.md, .cursor/rules, opencode.json, Codex/Gemini config), and a per-client MCP-setup section. Use when a package, CLI, or repo should be usable by Claude Code, Cursor, opencode, Codex, and Gemini without duplicating guidance per tool. Fills the gap left by build-from-template / agentic-cli-npm-package, which ship the code but not the agent docs."
---

# agent-harness-docs

One source of truth, thin pointers everywhere else. Every coding-agent harness looks for
its own file (CLAUDE.md, `.cursor/rules`, opencode config, `AGENTS.md`), but you write the
guidance **once** in `AGENTS.md` and make every other file a one-line redirect. Duplicated
per-harness docs rot out of sync; a single `AGENTS.md` with pointers does not.

## 1. AGENTS.md is the canonical doc

`AGENTS.md` is the emerging cross-harness standard (Codex, Cursor, opencode, and others
read it natively). Put ALL real guidance here. Structure that works:

- **Mental model** — the one paragraph an agent needs to not misuse the tool.
- **The interfaces** — SDK / CLI / MCP, one line each.
- **MCP tools table** — tool name → when to call it.
- **The task loop** — the ordered steps an agent follows to do the main job (e.g. "wire
  tracking": list → check → setup → verify → dry-run → wire).
- **Rules** — the hard constraints (what never to do), stated as imperatives.

Keep it task-oriented, not marketing. An agent reads it to act, not to be sold.

## 2. Thin per-harness pointers

Each harness gets a file that points at `AGENTS.md` — never a copy.

- **CLAUDE.md** — `See [AGENTS.md](./AGENTS.md).` One line. Claude Code reads it.
- **`.cursor/rules/<name>.mdc`** — frontmatter (`description`, `globs`, `alwaysApply: false`)
  + a short bulleted digest of the key call shapes, ending "full guide: AGENTS.md". Cursor
  rules want brevity; link, don't inline the whole thing.
- **`opencode.json`** — declare the MCP server (opencode also reads AGENTS.md natively):
  `{ "mcp": { "<name>": { "type": "local", "command": ["npx","-y","<pkg>","mcp"], "enabled": true } } }`
- **Codex** — `~/.codex/config.toml` `[mcp_servers.<name>]` (document it in SETUP; it's a
  user-machine config, not a repo file).
- **Gemini** — `~/.gemini/settings.json` `mcpServers` block (document in SETUP).

## 3. The per-client MCP-setup section

If the tool ships an MCP server, put a `## MCP setup` section in `docs/SETUP.md` with one
subsection per client, each showing the exact snippet:

- **Claude Code** — `claude mcp add <name> -- npx -y <pkg> mcp`, or commit `.mcp.json`.
- **Claude Desktop** — `claude_desktop_config.json` `mcpServers` block.
- **Cursor** — `.cursor/mcp.json` `mcpServers` block.
- **opencode** — the `opencode.json` block (already in the repo).
- **Codex CLI** — `~/.codex/config.toml` `[mcp_servers.<name>]`.
- **Gemini CLI** — `~/.gemini/settings.json` `mcpServers`.

End with how the server receives secrets: the launching shell's env, or an `env` block in
the MCP config.

## 4. Ship AGENTS.md in the package

Add `AGENTS.md` to `package.json` `files` so it lands in the npm tarball — agents consuming
the package read it from `node_modules/<pkg>/AGENTS.md`. The per-harness pointer files
(`.cursor`, `opencode.json`, CLAUDE.md) are repo-level for contributors; they do not need to
ship.

## 5. Checklist

- [ ] `AGENTS.md` with mental model + interfaces + MCP tools + task loop + rules.
- [ ] `CLAUDE.md` = one-line pointer.
- [ ] `.cursor/rules/<name>.mdc` = digest + pointer.
- [ ] `opencode.json` = MCP declaration.
- [ ] `docs/SETUP.md` `## MCP setup` = per-client snippets (Claude Code/Desktop, Cursor,
      opencode, Codex, Gemini) + how secrets reach the server.
- [ ] `AGENTS.md` added to `package.json` `files`.

## Pairing

Chains after `agentic-cli-npm-package` (which builds the CLI+npm+MCP) — that skill ships the
code, this one ships the agent docs. Reference exemplar: the `adscapi` package.
