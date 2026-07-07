---
name: agent-context-economy
description: "Cut the token cost and sharpen the accuracy of a vertical agent you build and operate — treat its context as an L1/L2/L3 cache and attack the hot path (cache the tool-definition prefix, compress tool RESULTS at insertion, lint write outputs, right-size tool count), promoting each change only through a gated before/after A/B. Use when an agent is expensive/slow, tool schemas bloat every request, or before pushing a high-traffic agent."
---

# agent-context-economy

Make a vertical agent **cheaper and more accurate at once** by treating its context as a memory
hierarchy and optimizing the hot path — proving each change with a gated A/B, not vibes.

## When to use this

**Trigger if:**
- You own the agent's system prompt, tools, and result-handling (not just a chat client).
- The agent runs multi-round tool loops, or is high-traffic enough that per-conversation cost matters.
- You suspect context bloat: huge tool schemas, raw tool dumps, a sprawling tool list.

**Don't bother if:** it's a one-shot prompt, or you don't control the agent's context/tooling (then
see output-compression skills instead — this is about the agent's *input* economy, not its output).

## Core idea

A good vertical agent is a **faithful compression of its task distribution**. With the model fixed,
accuracy and cost are functions of context quality: bloat buries the signal *and* costs tokens;
missing context forces guessing. So structure the context like a CPU cache:

- **L1 — always resident** (system prompt, the bread-and-butter tool I/O): tiny, instant, paid every
  request. Spend disproportionate effort making it dense.
- **L2 — on demand** (curated specs, full tool schemas): one cheap discovery step to load.
- **L3 — escape hatch** (the raw catalog): reachable in a bounded number of steps, never resident.

Most agent frameworks already do some of this. The wins are usually on the **hot path** the
framework left raw. Audit first — don't rebuild what exists.

## The levers, ranked by leverage

### 1. Cache the static tool-definition prefix (usually the biggest, and lossless)
The full tool schemas are often the **single largest block re-sent on every round**, and many
providers/SDKs do NOT cache them by default (only the system prompt). Put a prompt-cache breakpoint
on the tool-definitions block so it becomes a near-free cache READ every round after the first.

- It's **lossless** — no behavior change — so it can ship default-on once measured.
- Providers cap the number of cache breakpoints (e.g. 4). **Rebalance:** spend a breakpoint on the
  large, *stable* tool block and DROP it from the most *volatile* section (per-run memories/dynamic
  context that invalidates every request — caching it only ever writes, never reads).
- Measured impact in one production deployment: **−45% end-to-end cost** (−71% in a controlled
  identical-payload loop), zero quality change. The tell is cache-WRITE tokens collapsing.

### 2. Compress large tool RESULTS at insertion time (lossless, domain-aware)
Big tool outputs (tabular query results, list/search responses, large JSON) are often inserted into
context RAW and only truncated reactively when the window is nearly full. Instead, compress them the
moment they enter context, per tool, losslessly:
- Attach the header/schema row once; **alias repeated structure** (e.g. a column legend instead of
  repeating keys on every row).
- Sample rows with an explicit "… N more rows" tally rather than dumping all.
- Keep it reversible: a legend the model can read, not lossy truncation.
- This only pays where **large results are actually fed to the model.** Target those tools/agents;
  on agents that mostly do single-object reads it barely fires (measure, don't assume).

### 3. Lint write-tool outputs (correctness, cheap)
When the agent performs a write (publishes, drafts, files), append a categorized review to the
result — "did X; N fine; 1 needs review" — flagging unresolved template vars, placeholder text,
suspicious/off-domain links, empty required fields, invalid-output markers. A built-in linter on the
agent's own edits catches a whole class of plausible-but-wrong outputs for a few tokens.

### 4. Right-size tool count (sharper, sometimes cheaper)
More tools = more schema surface = more ways to pick wrong. Fewer resident tools measurably improves
quality (in one experiment, +~9 quality points with a trimmed set). BUT: **do lever #1 first** — once
the tool prefix is cached, the *cost* argument for trimming weakens, and trimming becomes mainly a
*quality/accuracy* lever (and a capability tradeoff — you can't use a tool you removed). Treat it as a
quality experiment, not a cost cut.

## The method: off-by-default + eval-gated promotion

Never ship an optimization on belief. For each lever:

1. **Build it additive and OFF by default** behind a runtime flag (a config value, not a redeploy,
   so promotion is instant and reversible). Merged code is inert until proven.
2. **Build a before/after A/B harness** that runs a fixed, representative task set under named
   variants (`baseline` vs `optimization-on`) and records per run: input/output tokens, cost,
   latency, and a quality score (reuse your existing scorer/judge — don't invent one).
3. **Gate promotion on a measured delta**, with the right success criterion per lever:
   - lossless compression / caching → cost down AND quality flat (±noise) AND zero errors.
   - correctness linting → quality up-or-neutral (a small token cost is acceptable).
   - tool trim → quality up (it's a quality lever).
4. **Flip only if the gate passes.** A regression — or noisy/inconclusive data — means DON'T flip.
   Report the numbers and the root cause instead.

## A/B hygiene (these silently corrupt results)

- **Prompt-cache contamination:** if prompt caching is on, tokens shunt into cache-read and
  *sequential* variants share the warm cache — your "after" looks artificially cheap. For token
  deltas, **disable prompt caching and pin the model**. (Exception: when CACHING itself is the thing
  you're testing, run with caching ON and compare cache-read tokens / cost, not raw input tokens.)
- **Sub-agent variance:** if the agent can delegate to other agents, deny that during the A/B —
  sub-agent runs inject huge run-to-run variance and swamp the signal.
- **Sample size:** small n + LLM judge variance is unreliable. Use enough fixtures (≥12–15) weighted
  to the real task mix, and don't over-read a few points of quality movement.
- **No side effects:** evals must not perform real outbound writes — deny or mock write tools (but if
  you're testing the write-linter, you need the write to execute, so MOCK it, don't exclude it).

## Hard-won lessons

- **Don't DEFER tools — CACHE them.** Lazy-loading tool schemas for a restricted agent *backfired*
  (tokens went UP) because schemas re-send every round anyway and deferral just adds discovery rounds
  that re-send the full message history. Caching the prefix (lever #1) is the real fix.
- **Target where the win actually fires.** The result-compressor was inconclusive on a triage agent
  that does single-object reads, but a clean win on an analytics agent that feeds large query results
  to the model. The eval gate *refusing* the wrong-target flip is itself a correct outcome — it
  steered effort to the right target.
- **Negative results are wins.** An optimization that measurably makes things worse, caught by the
  gate before prod, saved a regression. Ship it dormant and move on.
- **Audit before building.** The hierarchy, caching, and an eval system may already half-exist.
  Extend, don't duplicate.

## If you run these experiments with autonomous agents

- Make each experiment a single self-contained pass: build → test → PR → CI → A/B → gated flip →
  report. A background worker that kicks off a long step (CI watch, the A/B run) and then yields
  expecting to be "woken up" will often just stop with the work unfinished — run long steps in the
  **foreground/blocking** within one continuous pass.
- Keep the flip a config write (not a redeploy) so an autonomous run can promote — and roll back —
  instantly and verifiably.
