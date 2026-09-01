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
