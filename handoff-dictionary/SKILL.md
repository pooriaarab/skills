---
name: handoff-dictionary
description: The definition of a handoff and the bar a good one has to clear - what the receiving session can actually do with what you carried. Use when writing or reviewing a handoff document, deciding between a written artifact and compaction, before clearing or compacting a session with unfinished work, when starting an AFK or fanned-out run, or when a fresh session starts relitigating decisions an earlier one already settled.
---

# Handoff

> Verbatim entry from Matt Pocock's [Dictionary of AI Coding](https://github.com/mattpocock/dictionary-of-ai-coding),
> [`dictionary/Handoff.md`](https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/Handoff.md). Kept unedited on purpose — it is
> the shared vocabulary, not our house rules.
>
> The `./Name.md` links below are the source's own, left as-written so this stays
> a true copy. They resolve against `https://github.com/mattpocock/dictionary-of-ai-coding/blob/main/dictionary/`, not against this repository.
>
> Our procedures live in the `handoff` and `claude-handoff` skills; this is the
> standard they are judged against.

Transferring [agent](./Agent.md) [context](./Context.md) from one [session](./Session.md) to another. The carry mechanism varies — a written [handoff artifact](./Handoff%20artifact.md), an in-memory summary ([compaction](./Compaction.md)), and others. Distinct from [clearing](./Clearing.md) (no transfer at all). Reasons vary: switching roles (planner → implementer), kicking off an [AFK](./AFK.md) run, fanning out to parallel sessions, or freeing up [context window](./Context%20window.md) room.

The receiving session starts with zero context — the [model](./Model.md) is [stateless](./Stateless.md), and nothing from the old session is visible to the new one. Whatever the next session needs has to be carried explicitly; everything else is gone. "No return path" is the constraint that shapes the carry: the new session can't ask the old one what it meant, so the carried material has to stand on its own.

| Mechanism        | Form                                        | Properties                                                                               |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Handoff artifact | File in the [environment](./Environment.md) | You can read and correct it before anything depends on it; reusable across many sessions |
| Compaction       | Summary in the context window               | Automatic and cheap; harder to inspect; feeds one successor                              |

The visible failure of a bad handoff is relitigation: the new session re-opens decisions the old one had settled, because the carry recorded what was decided but not why. Judge a handoff by what a session with zero context could do with it.

_Usage:_

"Planning session is getting heavy — should I just keep going?"

"Do a handoff. Write the decisions to a doc, clear, start the implementation in a fresh session reading from it."

## Applying it

**The test.** Read the handoff as if you had never seen the work. Can you take the next action without asking a question that has no one left to answer? If not, it is not finished.

**Carry the why, not just the what.** Relitigation is the failure mode, and it is caused by recording conclusions without their reasons. Every rejected alternative you do not write down is one the next session will re-propose. "Chose D1 over Postgres" invites the argument again; "chose D1 over Postgres because the Worker cannot hold a TCP pool" ends it.

**Say what was tried and failed.** A dead end that is not recorded gets walked again, at full cost. This is the highest-value line in most handoffs and the one most often left out.

**Reference, do not duplicate.** Point at issues, PRs, commits, plans and ADRs by number or path. A copy in the handoff is a second source of truth that starts drifting immediately.

**Name what is in flight.** Open PRs, running background jobs, an unpushed branch, a worktree with uncommitted work, a review waiting on a reply. Anything a fresh session cannot see by looking at `main` has to be stated.

**Redact.** The artifact may be committed, pasted into a prompt, or read by another account's agent. No keys, tokens, or personal data.

## Picking a mechanism

- **Written artifact** when the decisions matter, several sessions will read it, or you want to correct it before anything depends on it. Use the `handoff` skill.
- **Compaction** when it is one successor, the work is mechanical, and nobody needs to audit the carry.
- **Neither** when there is genuinely nothing to transfer — that is clearing, and it is a valid choice, not a failed handoff.

## Related

- `handoff` — writes the artifact to a file
- `claude-handoff` — writes the summary and launches a background agent seeded with it
