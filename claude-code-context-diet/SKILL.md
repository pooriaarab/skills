---
name: claude-code-context-diet
description: "Cut the hidden per-request bloat in the Claude Code CLI itself — the tool definitions, skill catalog, and feature clusters that ride along in every API call and that you pay for whether or not you use them. Measure the payload with /context, rank the fat (a proxy log shows which tools/skills cost the most tokens), then trim with settings.json: disable unused feature clusters (bundled skills, workflows, connectors, artifacts, remote control), deny individual tools by bare name, and demote rarely-used skills to user-invocable-only so they stay typable but leave Claude's auto-loaded tool list. Reversible, measured before/after. This is CLIENT-side hygiene (what YOU are billed for as a Claude Code user) — distinct from agent-context-economy, which optimizes an agent YOU build and serve."
---

# claude-code-context-diet

Every request Claude Code sends carries infrastructure you didn't type: system-tool
definitions, the full skill catalog, MCP tool schemas, and feature clusters. It is
resident in context on **every turn**, and you pay for it whether or not you use it.
On a heavily-extended setup (many plugins, a big `~/.claude/skills` folder, several MCP
servers) this can be tens of thousands of tokens before you say a word.

This skill is the trim procedure: **measure → rank → cut → re-measure.** Every change is
a `settings.json` edit, reversible in one line.

**Activate:** "my Claude Code is slow / expensive to start," "what's eating my context
window," "trim the system prompt," "I have too many skills/tools loaded," "reduce
per-request tokens in the CLI," or after installing a batch of plugins/skills.

## Not to be confused with

- **agent-context-economy** — optimizes an agent *you build and serve* (prompt-cache the
  tool prefix, compress tool results). That's your product's input economy.
- **eco-mode** — trims Claude's *output* verbosity.

This one is about the **Claude Code client's own resident payload** — the bytes the CLI
adds to your requests as a *user* of it. Different layer, different levers.

## Step 1 — Measure first

Run `/context`. It breaks the current window down by category (system prompt, system
tools, MCP tools, memory files, custom agents, and — crucially — skills). Write the
numbers down; this is your baseline. **Never trim on a hunch — trim on a number.**

Want per-tool granularity? Point Claude Code at a logging proxy (set the API base URL to
a small local script that logs each request body, then forwards it) and rank the tool/skill
definitions by serialized size. The biggest single entries are your first targets.

## Step 2 — Read the breakdown honestly

Typical fat, largest-first on an extended setup:
- **A skill pack you rarely fire.** e.g. a compliance bundle (fedramp/gdpr/hipaa/iso/soc2/pci),
  a cloud-vendor bundle, a language-specific bundle. Each skill's name + long trigger
  description sits in context every request. 80 skills × a paragraph each is real weight.
- **Bundled skills** shipped with the CLI you never invoke.
- **Feature clusters** — workflow/multi-agent tooling, connectors, artifacts, remote control —
  each contributes tool definitions.
- **MCP servers.** Many tools each. (If your client already lazy-loads MCP tool schemas on
  demand, these are cheap already — confirm before cutting.)

## Step 3 — Cut, in order of leverage

All edits go in `~/.claude/settings.json` (global) or a project `.claude/settings.json`.
Setting keys evolve between CLI versions — confirm the current names via `/config` or the
Claude Code settings docs before pasting.

1. **Disable whole feature clusters you don't use.** One flag drops a bundle of tools:
   bundled-skills, workflows/multi-agent, cloud connectors, artifacts, remote control.
   Each is a boolean in settings. Biggest bang, least surgery.

2. **Deny individual tools by bare name.** A `permissions.deny` entry with a bare tool
   name removes that tool's *definition* from the payload — not just its execution. Use for
   a handful of specific heavy tools you never call.

3. **Demote skills to typable-but-not-auto-loaded.** A skill override set to
   *user-invocable-only* keeps `/skill-name` working when you want it, but drops the skill
   from the list Claude auto-loads and reasons over — so its description stops costing you
   every request. This is the surgical move for a big skill folder: keep them installed,
   demote the rarely-used majority.

4. **Uninstall / move truly-dead skills and plugins.** If you'll never type it, remove the
   plugin or move the skill dir out of `~/.claude/skills`. Zero cost, zero ambiguity.

5. **Prune MCP servers.** Disconnect servers you don't use in this workspace; prefer a
   client mode that discovers MCP tool schemas on demand over one that resides them all.

## Step 4 — Re-measure and keep the receipt

Run `/context` again. Compare to the Step-1 baseline and record the delta (e.g. "skills
41k → 6k, total start 78k → 34k"). If a number didn't move, the flag was wrong — most keys
are version-specific, so verify against your CLI version.

## Caveats — don't amputate what you use

- **Keep clusters you actually rely on.** Workflow/multi-agent tooling and background jobs
  look bloated but are load-bearing if you run them. Cut by usage, not by size.
- **Demote, don't delete, when unsure.** *user-invocable-only* is reversible and keeps the
  skill a keystroke away — prefer it over uninstalling.
- **Watch prompt-cache warmth.** Shrinking the *stable* resident prefix is pure win; churning
  settings between every session busts the cache. Set it once, leave it.
- **Everything here is one line to undo.** Flip the flag back, re-run `/context`, confirm.

## The one-paragraph version

`/context` to get the baseline → find the fattest category (usually an unused skill pack) →
disable feature clusters you don't use, deny specific heavy tools by name, and demote the
rarely-used skill majority to *user-invocable-only* (typable, not auto-loaded) → `/context`
again and keep the before/after. Trim by measured usage, never by vibe; every change is one
reversible line.
