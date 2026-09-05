---
name: ship-product
description: "Take a product from raw UI/UX findings to implementation-ready, agent-executable issues. Covers issue triage, cross-repo audit guidelines, design refinement with the impeccable skill, and spec enrichment with file:line references so a cheap model can pick up each ticket and ship. Use when a product has a list of bugs, UI/UX debt, or polish requests and you need to turn them into a tracked, reviewable rollout."
---

# ship-product

A runbook for the autonomous AI factory: turn a pile of product feedback into clean issues, shared rules, and enriched specs that a cheap model can execute without asking for context.

## Use when

- A product has a list of UI/UX findings, screenshots, or "this feels broken" notes.
- You need an app-wide audit plus rules so the same mistakes do not repeat.
- You want the resulting tickets to be executable by a Haiku-level model.

## Out of scope

This skill does not write implementation code. It produces issues and design direction. Implementation is the next step: one issue, one PR, one concern.

## Before you start

Read the repo rules first. Then read the design and brand context. Then read the skill files you will need.

- `AGENTS.md` in the product repo
- `.agents/issues.md` (templates, labels, states)
- `.agents/design.md` and `.agents/brand.md`
- `packages/styles/src/tokens.css` or the repo's token file
- This skill, `impeccable`, and `spec-issue`

## Step 1 — File the findings as structured issues

1. Consolidate the raw list into human-readable, agent-executable findings. Group related items.
2. Decide which are bugs, features, chores, or epics. Use the repo's issue taxonomy.
3. Open the epic first if the work spans multiple surfaces.
4. Open child issues and link them as sub-issues under the epic.
5. For each issue:
   - Use the repo's issue template.
   - Apply exactly one kind label, one size label, one route label, and one state label.
   - Ground the current behavior in `file:line` where you can.
   - Write acceptance criteria and verification steps.
   - Add analytics only for user-visible changes; use existing event names or explicitly state that a new one must be added.

## Step 2 — Add cross-repo audit guidelines

If the findings are patterns that can repeat across repos, write a shared rule.

1. Create the rule in your rules repo, e.g. `rules/ui-ux-audit.md`.
2. Reference it from `AGENTS.md`.
3. Open an issue, branch from `origin/main`, commit, push, and open a PR.
4. Drive the PR to green: PR standards, review, CI.
5. Merge only after checks pass and review is approved.
6. Once merged, fan out audit issues to every private repo that should apply the guideline.

## Step 3 — Pick the key flows

Not every issue needs design. Pick the highest-impact, most broken, or most frequent flows.

Good signals:
- The flow is the first thing a new user sees.
- The flow blocks a core job to be done.
- The issue already says "cluttered," "confusing," "slow," or "inconsistent."

## Step 4 — Run impeccable on each key flow

Use the existing code as the design authority. Do not run `init` or write `PRODUCT.md` unless the user asks for a full redesign.

For each key flow:

1. Find the real target file. The user may name the wrong file; search and verify.
2. Run `node <impeccable-base>/scripts/context.mjs --target <path>`.
3. Load the right references:
   - `distill.md` to remove clutter
   - `clarify.md` to fix copy and labels
   - `layout.md` to fix spacing and hierarchy
   - `polish.md` for the final pass
   - `onboard.md` for first-run and empty states
4. Write concrete before/after descriptions, not vague advice.
5. Note every component, token, and pattern to reuse or replace.

## Step 5 — Enrich the issue with spec-issue

Turn the design direction into an implementation-ready spec.

1. Read the issue body.
2. Ground every claim in the codebase. Cite `file:line` for:
   - the broken control
   - the shared primitive that should replace it
   - the state or data flow that must change
   - the existing analytics events
   - the touched files
3. Add these sections:
   - **Job to be done** (one sentence)
   - **Why now** (one sentence)
   - **UI/UX Requirements** (outcomes, no code)
   - **Engineering** (touched files, constraints, patterns)
   - **Analytics** (existing events + new events with firing sites)
   - **Test Plan** (4–6 end-to-end rows)
4. Preserve the original issue body in a `<details>` "Original context" block.
5. Update the issue via `gh issue edit --body-file`.
6. Move the state label from `triage` to `ready-for-agent` when the spec is agreed.

## Step 6 — Hand off for implementation

Each child issue now becomes one PR.

- Branch from `origin/main`.
- Use the repo's branch format, e.g. `<prefix>-<issue>-<slug>`.
- Keep PRs under 500 counted lines and under 40 counted files.
- Attach UI evidence for visual changes.
- End the PR body with `Assisted-by: <agent>:<model>`.
- Merge only after CI is green and review is approved.

## Checklist — ship a product from findings

- [ ] Read repo rules, issue templates, design, and brand context.
- [ ] Consolidate findings and file structured issues with correct labels.
- [ ] Create an epic and link child issues as sub-issues.
- [ ] Add shared audit guidelines if the pattern can repeat across repos.
- [ ] Open audit issues across every repo that should apply the guidelines.
- [ ] Pick the most broken or highest-impact key flows.
- [ ] Run `impeccable` distill, clarify, layout, and polish on each key flow.
- [ ] Enrich each key issue with `spec-issue`: file:line, design direction, engineering notes, analytics, and a test plan.
- [ ] Preserve the original issue body in a collapsible.
- [ ] Move issue state to `ready-for-agent`.
- [ ] Hand off for implementation: one issue, one PR, one concern.
