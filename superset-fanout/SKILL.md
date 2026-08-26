---
name: superset-fanout
description: "Pick the right way to run many agents at once, then fan them out. Routes a task to Superset native worktrees, Claude Code Workflow/subagents, or the pi/GLM/codex worker roster by durability — and drives the two headline Superset patterns: fan a big refactor across isolated workspaces, and race several agents on one task. Use when the user wants to parallelize, fan out, run agents in parallel, split a big refactor, or race models on the same problem."
argument-hint: describe the task to parallelize
---

# Superset Fan-out

Three ways exist to run many agents at once. Most agents reach for the wrong one out of
habit. This skill picks by **durability of the work**, then runs the fan-out.

## 1. Route first (do not skip)

| The work is... | Use | Why |
| --- | --- | --- |
| Big refactor / many files / overnight / cross-host / **must survive the session** | **Superset native** worktrees | Real git branch per task, reviewable in the diff viewer, outlives the turn |
| Same task, want the best result | **Superset race** (see §3) | N worktrees, same prompt, different agents, pick the winner |
| Read / analysis fan-out, verify passes, map-reduce **inside one turn** | **CC Workflow / Agent subagents** | Ephemeral, structured return, no branch overhead |
| Bulk mechanical, cost-shift off the Claude limit (personal repos only) | **pi / GLM / codex roster** | Flat-rate or cheap-metered workers; never send work/proprietary code to relays |

Rule of thumb: **if the output dies with the turn, use CC subagents; if you need branches
to review and merge later, use Superset.** When unsure, default to Superset native for
anything that writes files across more than one task.

## 2. Fan a big refactor across isolated workspaces

Decompose into tasks with disjoint file ownership. One workspace per task = one branch.

```bash
superset ws create --project <id> --name <task> --branch <task> \
  --agent claude --prompt "<bounded worker brief>"
```

Then follow the `superset-orchestrate` skill for the full protocol: the coordinator table,
the `SUPERSET_WORKER_DONE` / `SUPERSET_WORKER_BLOCKED` completion envelope, and
`superset terminals read/send` to monitor and hand off. Do not hand-roll terminal control.

Guardrails:
- Give each worker **only** the files it may change; warn it not to broaden scope.
- Never put two parallel *editors* in the same worktree — file ownership must be disjoint.
- **Do not** use `--agent superset` for a worker: that makes a chat session, not a
  terminal you can drive.
- Superset does not merge worker branches. Review each in the diff viewer, then merge in
  the order dependencies require.

## 3. Race several agents on one task

Best result, not best throughput. Fan N workspaces with the **same** prompt but a
**different** agent each, then pick the winner in the diff viewer.

```bash
for a in claude codex gemini; do
  superset ws create --project <id> --name "race-$a" --branch "race-$a" \
    --agent "$a" --prompt "<the one shared task>"
done
```

Read all N with `superset terminals read`, compare diffs, keep one branch, delete the rest.

## 4. Make the repo fan-out ready (once per repo)

Fan-out only pays off if every fresh worktree boots green.

- Run the `superset-setup` skill once → authors `.superset/config.json` (setup / teardown /
  run arrays; must be idempotent and fast).
- Put repeatable workflows in `.agents/commands/<name>.md` at the repo root — every worker
  inherits them as slash commands.
- Put shared tools in `.mcp.json` at the repo root — every worker gets the same MCP servers.

## 5. After the fan-out

Run the `superset-standup` skill to sweep what finished, what needs review, and what is
blocked. Recurring fan-out chore (nightly audit, changelog) → `superset-automate`.

## Guardrails

- **Personal repos only** for the pi/GLM/codex/relay roster — never send work or
  proprietary source to z.ai, OpenRouter, or any third-party relay.
- Merging worker branches is a real, irreversible action. Review the diff first; merge
  only when the user's workflow calls for it.
