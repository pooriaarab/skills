---
name: spec-issue
description: Turn a thin or messy issue-tracker ticket into a complete, implementation-ready spec an engineer can execute without a follow-up meeting — grounding every claim in real code, right-sizing the detail, and writing test cases. Triggers include "spec this", "flesh out <ticket>", "make this ready for an engineer".
---

# Spec Issue

Turn a thin or messy ticket into a complete, implementation-ready spec an engineer can execute without a follow-up meeting. Be direct, no filler, and **size the spec to the actual work**. Every architectural claim must point at a real file or function — no speculation.

You hold your issue tracker's API (read + update a ticket) and read-only access to the codebase (search + read files). You talk to the user in the conversation; keep every message short and skimmable — one question at a time, never a wall of text.

## When to use

- A ticket is vague, has scattered notes, or names behavior nobody has verified.
- The user gives you an issue ID/URL and "spec this", "flesh this out", "make this ready for an engineer".
- NOT for triaging raw bug reports, and NOT for writing code.

For **features / specs / enhancements** (something is added or changed), use this skill. For **bugs** (a defect / error / regression / crash), a source-aware triage report is a better fit than a feature spec — handle those separately.

## House rules

If your team has a written process doc (labels, priority, status, cycles), read it **live** before you set any tracker field — conventions change over time. Apply its label/priority/status rules; when a convention is unclear after reading it, ask — don't guess.

## Ground product facts — never invent

You have codebase read access for a reason: **verify every URL, route, endpoint, and product noun against the code before you write it into a spec.** A spec that contradicts how the product actually works is worse than no spec.

- Use the product's **own vocabulary** (the nouns the code and UI use), not generic substitutes.
- For a net-new surface that doesn't exist yet, label it **Proposed** in the spec, and base any example URLs/paths on the product's real schemes — never on invented routes. Don't present an invented request/response shape as if it already exists; mark it as the proposed contract.

When the codebase contradicts the ticket (it names a flow, route, or verb that doesn't exist), say so before drafting.

## Process

### 1. Fetch + dedup

Read the issue (title, description, comments, labels, priority, assignee, state, attached images). Search for likely duplicates / related / parent issues. Surface what you find and let the user decide before drafting — never re-spec work already specced elsewhere.

### 2. Pick a size — tell the user, let them push back

State which size you picked in one short sentence and why.

| Size         | When                                            | Sections                                                       |
| ------------ | ----------------------------------------------- | -------------------------------------------------------------- |
| **Mini**     | One-string copy, one-line config, narrow rename | Job to be done + 1–2 test rows                                 |
| **Standard** | Bounded feature, one flow                       | Full template, each section tight, heavy parts in collapsibles |
| **Deep**     | Multi-surface, new system, migration            | Full template + terse Engineering analysis + Risks             |

If unsure, default to Standard and adjust after the codebase pass.

### 3. Ground in the codebase (the core discipline)

Before any "the system should…" sentence, prove it's possible: search for the symbol, read the file, map the area. Ground **thoroughly on the first pass** — this is where the spec's quality comes from.

**Verify every domain verb in the ticket.** If it says "when a user unpublishes…", search for that flow; if it doesn't exist, the ticket names a feature that doesn't exist — say so. **Verify every URL, route, and product noun** against the codebase — never write one you haven't grounded. Then state the **assumptions** you're about to bake in and wait for the user to confirm or correct — one question at a time.

**Cache what you grounded.** Keep a compact **grounding notes** line as you verify — touched files, verified verbs, and the facts they settle — so you don't re-search the same thing on later turns.

### 4. Grill before you draft (alignment pass)

On follow-up turns, treat what you already grounded as authoritative — don't re-search files already in your grounding notes. Misalignment is the most expensive failure in speccing, so resolve the open decisions **before** you write the doc: walk each one at a time, give **your recommended answer** for each, and prefer answering from the codebase over asking the human. Keep going until the tree is resolved — then draft.

This pass is skippable: if the user says "just draft it", stop asking and draft from what you have. For Mini specs, one or two questions is plenty.

### 5. Draft (Feature template)

Preserve the user's own words — reorganize under headings, don't rewrite. Style: **plain, short sentences — one idea each**; no title restatement; `N/A` instead of padding; use the product's own vocabulary. **Code nouns (file paths, function names, events) belong in Engineering, not the design-facing sections.** **Bold** for structure; sparing for emphasis.

- **Job to be done** — 1–2 sentences in the user's voice; what they can't do today.
- **Why now** — one sentence, ≤15 words, the single most important reason.
- **UI/UX Requirements** — **written for Design as the audience**: a concise list of feature requests, each paired with the user benefit, in plain sentences stating the outcome. Design owns it and replaces it with detailed specs, images, and mockups — leave room. For a new or large feature, describe the outcome and let Design explore the approach unbiased — don't prescribe layout or components. Still name, as user-facing outcomes, the entry point(s), the empty/in-progress/error states, and who can use it. Keep code OUT of this section — anything Design can't audit goes in Engineering, referenced here in plain language. If a new email/notification is the surface, write the real copy (subject + body + trigger), not "content TBD".
- **Success Metrics** — two subsections: **(a) Instrumentation to add** (event name + where it fires) and **(b) Query to verify success** (the question, the exact query + window, the threshold). Error monitoring is a regression guard, not a success metric.
- **Engineering** — _analyze, do not solve_: list touched files (verified), current constraints, what's not possible without new work. Surface constraints; let the engineer pick the lane.
- **Test Plan** — table (schema below).

**Collapsibles:** push detail-heavy sections (Engineering, Test Plan) into one-click expanders for Standard/Deep so the issue stays skimmable. Use your tracker's native collapsible syntax.

### 6. Test Plan

Columns: `ID · Title · Preconditions · Test Steps · Expected Result · Priority · isAutomated`. Steps are concrete and written for a human tester unless `isAutomated: Yes`. Each row is **end-to-end (tracer-bullet)**, not single-layer. Row budget: Mini 1–2 · Standard 4–6 · Deep 8–12. A row earns its slot only if its failure would block ship. Check existing automated coverage first and reference it instead of duplicating.

### 7. Confirm, humanize, then write

1. Post the drafted spec **as your reply** — the full body for Mini/Standard, or a tight per-section summary for Deep. Then ask: **"Ready for me to write this to the ticket? Reply yes, or tell me what to change."** Wait for an explicit yes.
2. Run the draft through a plain-language / de-slop pass to strip AI tells.
3. Write the spec body to the issue. **Preserve the original body — never clobber it.** Before writing, read the current description in full and keep ALL of it verbatim in an "Original context" collapsible at the bottom (every image, link, list, and note). A description update REPLACES the whole body, so anything you don't carry over is destroyed. If the issue already holds curated content, append/merge instead — or ask first.
4. **Set the real tracker fields — never pasted into the body:** Status (drafting → ready, or a design state if UI work is pending), Priority (apply the house rule; never auto-set the top level), and Type + Area labels (chosen from the team's taxonomy). If a label/state can't be resolved, say so and name the ones you'd apply — don't silently skip.
5. Cycle / project / assignee are human calls — ask, don't set them yourself.
6. Reply with the issue URL and a one-line "done".

### 8. Offer a prototype (optional)

A spec is often easier to react to as a clickable mockup. Once the issue is written, offer one (a simple yes/no). Only build if they say yes. When it's built, post the live URL first; never claim a URL you don't actually have. If they decline, skip it — never build one unprompted.

## Success Metrics — analytics grounding

**Before writing anything, grep the analytics events source.** Most surfaces already have events; a skipped grep is how a spec claims "no instrumentation" for a feature that already has eight. If you write `N/A`, show the grep that proves it. Unhandled-error monitoring and human reports are not success-metric sources.

Sort what you find into three buckets:

* **(a) Instrumentation to update** — an event exists but fires on the wrong trigger, or from code this change removes. Name it, where it fires today, what it must fire on after.
* **(b) Instrumentation to add** — the new action is untracked. List each new event by exact name + params + firing site.
* **(c) N/A** — only when an existing event already answers the question; write "N/A — existing `event_x` covers this" and cite it.

**Event naming:** match the house convention (e.g. snake_case `<context>_<subject>_<action>`). Define the exact name + params, never a placeholder.

**Query to verify success** — one concrete question, the exact analytics/warehouse/logs query with a window, and the threshold. Keep instrumentation separate from the verification query.

## Rate limits & cost

*(For any AI / LLM / metered / paid-per-use feature. Put this in a collapsible.)*

Per-action unit cost + rate limit. Estimate the units per action (tokens in/out for an LLM call) × the **real, looked-up** price (never guess), then compute the monthly worst-case per user vs the plan margin. Propose the cap and show why it holds. An AI feature without a cost ceiling and a rate limit is an unbounded liability — name both.

## Common mistakes

- Speculative architecture (claiming an HTTP status without naming the layer that sets it).
- Inventing URLs / routes that contradict the product's real scheme — ground every URL.
- Long Job-to-be-done paragraphs (>2 sentences = over-explaining).
- Mixing instrumentation with verification metrics — keep them separate.
- Cross-feature test bloat; re-testing untouched behavior.
- Writing tracker fields into the description body instead of the real fields.
- Inventing domain verbs the codebase doesn't have — search first.
- Wall-of-text messages — keep replies short, one question at a time.
