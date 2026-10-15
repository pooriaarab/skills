---
name: cheap-model-triage
description: "Decide when to route bulk search triage to a cheap fast model (Cerebras gpt-oss-120b, Groq, Flash-tier) and when that is unsafe. Draws the line the usual framing gets wrong: grep is not the cost, reading its output is. Covers the safe pattern (deterministic tool decides, model compresses, caller verifies), the two failure modes measured in practice (hallucinated citations, and a missed finding next to a flagged one), and the classes of work where a cheap model must never be the authority. Use when an agent is burning context on search output, when choosing a model tier for a scan, or when someone proposes 'route file search to a cheap model'."
---

# cheap-model-triage

A cheap, fast model can absorb a large result set so the expensive model never reads it.
That is real leverage. The framing it usually arrives in — *"route file search to a cheap
model, it's faster and cheaper"* — is wrong in a way that costs you a finding rather than
a few tokens.

## The distinction the premise gets wrong

**`grep` and `glob` are not the expense.** They are deterministic, exact, and effectively
free. Putting a language model in front of them makes them slower, costlier, and lossy.
There is nothing to win.

The expense is **reading 400 lines of hits into an expensive model's context**. That is the
only part a cheap model can take off you, and it takes it by *compressing*, not by
searching.

So the split is:

| Stage | Who does it | Why |
|---|---|---|
| Find candidates | `grep` / `rg` / `glob` | Exact, complete, free. A model cannot beat it. |
| Compress the result set | cheap model | Turns 400 lines into a shortlist. This is the whole win. |
| Decide what it means | expensive model, or a deterministic rule | See below. |

## Where a cheap model is genuinely the right call

All of these share one property: **a miss is cheap and recoverable.**

- Clustering hundreds of hits into themes so you can pick which to read.
- "Which of these 200 files look like they handle auth?" as a *shortlist*, not an answer.
- Summarizing a long build log into the lines that differ from a passing run.
- Turning a directory listing into a guess at project structure.
- First-pass labelling where you will read the labelled items anyway.

In each case the model narrows the field and a human or a stronger model does the judging.
If it drops something, the next stage still catches it.

## Where it must never be the authority

**Anything where completeness is the deliverable.** Security sweeps, licence audits,
"find every caller before this rename", migration inventories, compliance checks.

The reason is not that cheap models are bad. It is that in these tasks **the cost of one
miss is the entire task**, and a model gives you no signal that it missed anything. A
confident, well-formatted report of nine findings looks identical whether there were nine
or ten.

### Worked example: both failure modes in one run

2026-09-14. Auditing public repos for leaked credentials. `git grep` produced the hits;
Cerebras `gpt-oss-120b` was asked to classify them by severity. It returned a clean
severity table. Two things were wrong with it.

**1. It cited a file that was not in its input.** The table flagged
`docs/nsfw-foundation.md` as HIGH. That path never appeared in the prompt. The file did
exist and did contain key material, so the citation looked like a hit — a hallucination
that happened to land. Had it not existed, the same confident row would have sent someone
chasing a file that was never there.

**2. It missed the finding that mattered, next to one it flagged.** It rated
`docs/per-scene-loras.md` HIGH for a *partial* key — `CIVITAI_API_KEY=fe8256…`, correctly
redacted, not a leak. Four lines below, the same file carried the **full unredacted
32-character key**, live and still authenticating. The model read the redacted line, scored
the file, and moved on.

The real key was found by the deterministic sweep that ran alongside:

```sh
grep -rInE '[0-9a-f]{32}' --exclude-dir=.git .
```

**Read failure 2 carefully, because it is the general case.** The model did not skip the
file. It *looked at the file, flagged it, and still missed the thing in it.* A per-file
"did you check this?" audit would have passed. Nothing about the output revealed the gap.

## The safe pattern

```
deterministic tool  ->  finds every candidate      (authoritative, complete)
cheap model         ->  clusters / ranks / drafts  (lossy, disposable)
caller              ->  verifies before acting     (on anything irreversible)
```

Three rules that make it hold:

1. **The deterministic tool decides what exists. The model only reorders it.** Never let
   the model's output be the only enumeration of the result set — keep the raw hit list and
   reconcile against it.
2. **Never act on a model's citation without opening the file.** If it names a path, a line
   number or a symbol, check it. This is one tool call and it catches failure 1 every time.
3. **For completeness-critical work, run the deterministic sweep regardless.** The model's
   summary is a convenience laid over it, never a replacement for it. That is the only
   reason the Civitai key was found at all.

## Choosing a tier

Rough guide once you have decided delegation is safe:

- **Cheap/fast tier** (gpt-oss-120b on Cerebras, Groq, a Flash model) — compression, clustering,
  labelling. Optimize for throughput; you are going to verify anyway.
- **Mid tier** — when the shortlist itself needs domain judgement and a miss costs a re-run.
- **Top tier or deterministic rule** — when a miss ends the task.

Cost is rarely the deciding input. **The deciding input is what a miss costs.** If that
answer is "the whole job", the price difference between tiers is irrelevant.

## Failure mode

**Letting a good experience on low-stakes triage set the default for high-stakes work.**
The cheap model will be right, fast, and cheap dozens of times in a row on clustering and
labelling. Nothing in that track record transfers to a security sweep, because the thing
that changed is not the difficulty — it is that a miss is now unrecoverable and invisible.

If you cannot say out loud what a miss would cost, you have not yet decided whether you may
delegate.
