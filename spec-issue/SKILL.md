---
name: spec-issue
description: Use when turning a thin or messy Linear issue into a complete, implementation-ready spec — grounding every claim in real code, right-sizing the detail, and writing test cases. Triggers include "spec this issue", "flesh out LIN-123", "write a proper spec", "make this ticket actionable". Linear-based; adapt the API calls for another tracker.
---

# Spec Issue

Write specs an engineer can execute without a follow-up meeting. **Size the spec to the actual work**; every architectural claim must point at a real file or function.

This skill is **Linear-flavored** (GraphQL + `LINEAR_API_KEY`) but the method is tracker-agnostic. Supply your tracker's workspace/team as inputs; swap the API calls if you use GitHub Issues/Jira.

## When to use

- A ticket is vague, has scattered notes, or names behavior nobody has verified.
- "Spec this", "flesh out <ID>", "make this ready for an engineer".
- NOT for triaging bug-bash output → use a bug-bash skill.

## Inputs

- Issue ID + tracker workspace/team (env: `LINEAR_API_KEY`).
- Read access to the codebase (claims must be grounded in real files).
- Your team's labels/priority/status conventions (the "house rules"). Ask if unknown.

## Process

### 1. Fetch + dedup
Read the issue (title, description, comments, labels, images). Search the tracker for likely duplicates / related / parent issues. Surface them and let the user decide before drafting — don't re-spec work already specced.

### 2. Pick a size (tell the user, let them push back)

| Size | When | Sections |
| -- | -- | -- |
| **Mini** | One-string copy, one-line config, narrow rename | Job to be done + 1–2 test rows |
| **Standard** | Bounded feature, one flow, contained bug | Full template, each section tight, heavy parts in collapsibles |
| **Deep** | Multi-surface, new system, migration | Full template + terse engineering analysis + risks |

### 3. Ground in the codebase (the core discipline)
Before any "the system should…" sentence, prove it's possible: read the file, grep the symbol, find the constraint. **Verify every domain verb** — if the issue says "when a user unpublishes…", grep for that flow; if it doesn't exist, the issue names a feature that doesn't exist — surface it. Then state the **assumptions** you're about to bake in (a verbal pre-spec gate, not a section in the final doc) and wait for confirm/correct, one at a time.

### 4. Draft (Feature or Bug template)
Preserve the user's own words — reorganize under headings, don't rewrite. Style: one idea per sentence; no title restatement; `N/A` instead of padding; no "-ing" tail clauses; concrete nouns (file paths, function names, event names); ≤2 em-dashes per section; use the project's own vocabulary, not generic web terms.

**Feature template** (uncollapsed: Job to be done, Why now, UI/UX Requirements, Original context; the rest in collapsibles):
- **Job to be done** — 1–2 sentences in user voice; what they can't do today.
- **Why now** — one sentence, ≤15 words, the single most important reason. If you can't compress it, the urgency isn't real.
- **UI/UX Requirements** — written for a *designer* (screen/modal names, not file paths) + Figma link or "N/A — server-side only".
- **Success Metrics** — two separate subsections: **(a) Instrumentation to add** (event name + where it fires) and **(b) Query to verify success** (the question, the exact query + window, the threshold). Error monitoring is a regression guard, not a success metric.
- **Engineering** — *analyze, do not solve*: list touched files (verified), current-system constraints, what's not possible without new work. Surface constraints; let the engineer pick the lane.
- **Test Plan** — table matching your QA schema (below).

**Bug template:** What's broken · Impact (who/frequency/severity) · Reproduction (Preconditions/Steps/Actual/Expected) · Currently Failing table · Test Plan.

**Collapsibles:** Linear uses `+++ ### Title` … `+++` (NOT `<details>`, which renders raw). Push detail-heavy sections into one-click expanders.

### 5. Test Plan
Columns: `ID · Title · Preconditions · Test Steps · Expected Result · Priority · isAutomated`. Steps are concrete and written for a human tester unless `isAutomated: Yes`. Each row is **end-to-end (tracer-bullet)**, not single-layer. Row budget: Mini 1–2 · Standard 4–6 · Deep 8–12. A row earns its slot only if its failure would block ship. Don't re-test untouched behavior; check existing automated coverage first and reference it instead of duplicating.

### 6. Humanize + push
Run the draft through a humanizer pass (strip AI tells). Then set tracker fields via the API — **in the real fields, never pasted into the description body**: exactly one **Type** label + 1–2 **Area** labels, **Priority** (apply your house rule; never auto-set Urgent), **Status** (`Spec` while drafting → `Ready` when done / `Design` if UI work pending). Ask for cycle/project/assignee — those are human calls. **Preserve images** (`![](…)`) from the original.

## Common mistakes

- Speculative architecture (claiming an HTTP status without naming the layer that sets it).
- Long Job-to-be-done paragraphs (>2 sentences = over-explaining).
- Mixing instrumentation with verification metrics — keep them separate.
- Cross-feature test bloat; re-testing untouched behavior.
- Writing tracker fields into the description body instead of the real fields.
- Inventing domain verbs the codebase doesn't have — grep first.
