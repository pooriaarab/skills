---
name: delegate-implementation
description: "Orchestrator-implementer pattern for shipping 10+ PR feature campaigns at 50-80% lower inference cost. Smart-and-expensive model writes per-PR plans and runs final pre-merge review; cheap-and-capable model does the per-PR file-by-file implementation in autonomous yolo mode. Captures hard-won lessons from a 32-commit, 23-feature-PR campaign that cost ~$145-215 instead of the all-Opus counterfactual of $390-800. Includes pairings for Gemini Flash, Claude Haiku, GPT-5 mini, and Cursor Composer 2.5."
---

# delegate-implementation

A workflow for delivering large feature campaigns (10+ PRs) at ~20-50% of the cost of running it all on the expensive orchestrator model. The orchestrator writes detailed per-PR plans and runs final pre-merge review; a cheaper implementer ships each PR autonomously.

**Activate:** "delegate this campaign," "orchestrator-implementer," "split this between Opus and Flash" — or just bring it up when a multi-PR campaign starts.

## When to use this

**Trigger if:**

- Feature campaign requires 10+ PRs to land
- Most per-PR work is mechanical: CRUD routes, UI components from existing primitives, test scaffolding, lint/typecheck fixes
- The orchestrator's per-1M-token price is ≥5× the implementer's
- You can afford ~$100-250 of inference spend and ~6-24 hours of wall-clock time
- You're willing to do per-PR Opus review — this is the quality gate

**Skip if:**

- Single-PR work (orchestration overhead exceeds savings)
- Heavy cross-cutting refactor (state-tracking across PRs is fragile when split)
- Greenfield architecture decisions (orchestrator should write that itself)
- High-secrecy code (each delegation sends project context to the implementer's provider)
- You can't tolerate variable wall-clock for CI loops

## Implementer pairings

Pick the implementer with the right price/capability/access trade-off for your orchestrator.

| Orchestrator | Implementer | Implementer cost (per M) | Access | Notes |
|---|---|---|---|---|
| **Claude Opus 4.7** | **Gemini 3.5 Flash** | $1.50 in / $9 out | Gemini CLI + Vertex AI or AI Studio | Battle-tested in the case study below. Autonomous via `gemini --yolo`. |
| Claude Opus 4.7 | Claude Haiku 4.5 | ~$1 in / ~$5 out | Anthropic API direct | Same family — fewer style mismatches with reviewer feedback. |
| Claude Opus 4.7 | **Cursor Composer 2.5** | $0.50 in / $2.50 out | **Cursor IDE only — no API** | Kimi-K2.5-based, ~10× cheaper than Opus, 79.8% SWE-Bench Multilingual. **IDE-bound** — see "Variant: IDE-bound implementer" below. |
| GPT-5.5 Pro | GPT-5 mini | ~$0.40 in / ~$3.20 out | OpenAI API | Same family. Cleanest when the orchestrator is in OpenAI's ecosystem. |
| Claude Sonnet | Gemini 2.5 Flash | $0.30 in / $2.50 out | Gemini CLI | Cheapest viable option, but expect 2-3 review-feedback cycles per PR. |

Composer 2.5 is the lowest-cost-per-quality option for an Opus orchestrator — but its **Cursor-IDE-only** access means it can't run autonomously in the background. Use the IDE-bound variant below if pairing Opus with Composer.

## The pattern (autonomous-implementer variant)

This is the default. Works for Gemini Flash, Claude Haiku, GPT-5 mini — any implementer with a headless CLI or programmatic agentic mode.

```
User asks for feature
  └─► Orchestrator writes one detailed plan per PR
        └─► Implementer spawned per PR (background, autonomous)
              └─► Implements + tests + opens PR + addresses review-bot feedback
                    └─► STOPS at "code review approved" — does NOT merge
                          └─► Orchestrator final-reviews + merges
                                └─► Next PR
```

Three roles:

1. **Orchestrator** (high-cost, smart) — writes per-PR plans, picks dependency order, does final pre-merge security review, handles merge conflicts, drafts the cost report. Stays in one long-lived session.

2. **Implementer** (low-cost) — spawned per PR via its CLI in autonomous mode. Reads the plan, does TDD per file, opens PR, watches CI, addresses review-bot comments, stops at "code review approved." **Never merges.**

3. **Review bot** (your repo's claude-review, coderabbit, etc.) — runs on PR push, auto-fixes common issues. Orchestrator decides whether bot coverage was sufficient or additional review is needed.

### Setup — pairing example (Gemini Flash via Vertex AI)

```bash
npm install -g @google/gemini-cli
gcloud auth application-default login
gcloud auth application-default set-quota-project <your-gcp-project>
```

In `~/.zshenv` (so subshells inherit):
```bash
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT=<your-gcp-project>
export GOOGLE_CLOUD_LOCATION=global
```

In `~/.gemini/settings.json`:
```json
{ "security": { "auth": { "selectedType": "vertex-ai" } } }
```

If you've installed superpowers (or any skill library) for Claude Code, **install it into Gemini too**:
```bash
gemini extensions install /path/to/superpowers-plugin --consent --skip-settings
```

This dramatically reduces the orchestrator's review burden — the implementer follows the same TDD/verification discipline.

### Per-PR loop (the orchestrator runs this)

1. **Spawn a worktree off latest main:**
   ```bash
   git worktree add ~/worktrees/feature-pr-N -b feature/pr-N origin/main
   cd ~/worktrees/feature-pr-N
   bun install  # or npm/pnpm
   ```

2. **Write the plan, commit it INSIDE the worktree:**
   ```
   docs/plans/per-pr/<pr-name>.md
   ```
   Include file-by-file pseudocode (type signatures + key logic), test matrix, security checklist, hard rules, exact commit messages, the exact PR title.

   **The plan MUST live inside the worktree** — implementer CLIs sandbox to the workspace. `/tmp/` will not be readable. This is the #1 quality lever; learned the expensive way (see lessons below).

3. **Spawn the implementer in background YOLO mode:**
   ```bash
   cd ~/worktrees/feature-pr-N
   gemini --yolo -m gemini-3.5-flash \
     -p "$(cat /path/to/prompt.md)" \
     --output-format text > /tmp/run.log 2>&1 &
   ```

   The prompt tells the implementer:
   - Read the plan at `docs/plans/per-pr/<pr-name>.md`
   - Read the project rules (`.claude/CLAUDE.md`, `.claude/rules/*`)
   - TDD per file
   - **Commit per file pair** (NOT per task — survives mid-stream errors)
   - Lint + typecheck + vitest green per file
   - Open PR with the specified title via `gh pr create --body-file <workspace-local-file>` (NOT `--body "..."` heredoc — the `>` in attribution footers gets mis-parsed as shell redirect)
   - Watch CI, address review-bot feedback, loop until APPROVED
   - **STOP at APPROVED** — do not merge
   - Write a short report to `docs/plans/per-pr/<pr-name>-implementer-report.md`
   - Exit

4. **Orchestrator does other work** while implementer runs (writes next PR's plan, queues parallel work, drafts docs). Don't poll the implementer — wait for the background task notification.

5. **When implementer finishes:** orchestrator reads its report + the PR, runs final security check (especially items the implementer's plan flagged), addresses any review-bot suggestions the implementer skipped, **then merges**.

6. **Repeat** in dependency-correct order. Run 2 implementers in parallel where work is independent — orchestrator becomes the review bottleneck above 3-way.

## Variant: IDE-bound implementer (Cursor Composer 2.5)

Composer 2.5 is dramatically cheap (~10× cheaper than Opus) and matches Opus on coding benchmarks (79.8% SWE-Bench Multilingual within 1pt of Opus 4.7). But it's **only accessible inside the Cursor IDE** — no external API or CLI. This changes the workflow from "background autonomous" to "human-in-the-loop hand-off."

### How it works

```
User asks for feature (in Claude Code, with Opus)
  └─► Orchestrator writes the plan + commits it to the worktree
        └─► Orchestrator says: "switch to Cursor, open this worktree, ask
            Composer 2.5 to execute docs/plans/per-pr/<pr-name>.md"
              └─► (Human) opens Cursor, pastes the plan path into Composer
                    └─► Composer ships the PR
                          └─► (Human) switches back to Claude Code: "PR is open"
                                └─► Orchestrator final-reviews + merges
```

The orchestrator can't background-spawn Composer like Gemini. Instead it issues an explicit hand-off instruction with everything Composer needs in a single message. The human is the courier between IDEs.

### Composer 2.5 hand-off template

When the orchestrator is ready to hand off a PR, it produces this:

```
HAND OFF TO COMPOSER 2.5 — PR <N>: <title>

Worktree: ~/worktrees/feature-pr-N
Plan: docs/plans/per-pr/<pr-name>.md

In Cursor, with this worktree open:
1. Tell Composer: "Read docs/plans/per-pr/<pr-name>.md and execute it
   end-to-end. TDD per file, commit per file pair. Open the PR titled
   '<exact title>' using gh pr create --body-file. STOP at 'review
   approved' — do not merge. Report back with the PR number."
2. When Composer finishes, paste the PR number back here.
```

### Why Composer pairs well with Opus despite no API

- Composer's SWE-Bench scores are within ~1 point of Opus 4.7, so per-PR quality is high
- $0.50/M input is cheap enough that even Cursor's per-seat pricing dominates the marginal cost
- The forced human-in-the-loop is actually a small benefit — you see what Composer's about to do before it runs (in the Cursor UI), so silent prompt-injection or sandbox escape attempts are harder
- Long-horizon agentic mode handles 2M-token sessions for ~$2 — comparable to a full Gemini run

### Trade-offs vs background autonomous

| Aspect | Background autonomous (Gemini/Haiku) | IDE-bound (Composer 2.5) |
|---|---|---|
| Parallel PRs | 2-3 spawned at once | 1 at a time (human courier limits) |
| Wall-clock | Orchestrator does other work while implementer runs | Orchestrator waits for human hand-off |
| Cost | $0.50-1.50/PR | $2/PR (heavier model + Cursor seat) |
| Quality | Good with detailed plan | Excellent; matches Opus benchmarks |
| Visibility | Implementer log in stdout | Live in Cursor UI |
| Auth fragility | ADC tokens expire; need refresh | Cursor session — much more stable |
| Skill ecosystem | Install superpowers via `gemini extensions install` | No skill install path; rely on plan detail |

**Picking between them:** Gemini Flash if you want maximum parallelism + lowest wall-clock. Composer 2.5 if you want highest per-PR quality and don't mind serial throughput.

## Critical rules (learned the expensive way)

These are the hard-won lessons from a 32-commit campaign that cost ~$145-215. Every one of these prevented a real failure mode.

### 1. Plan-in-workspace, not in /tmp

**The single biggest quality lever.** Implementer CLIs sandbox file reads to the workspace directory. `/tmp/` won't be readable.

The first delegated PR in the case-study campaign was scaffolded blind because the plan lived in `/tmp/interview-plans/m1-share-link-crud.md`. The implementer inferred structure from the embedded summary in the prompt — got file names + commit order right, but missed nuance (the exact 404-for-all-lifecycle-failures rule, hash format, edge cases).

When the same implementer was relaunched with the plan committed at `docs/plans/per-pr/m1-share-link-crud.md`, the audit pass found and closed 7 distinct gaps.

**Always commit the plan into the worktree before spawning the implementer.**

### 2. Commit per file pair on the implementer

Long-running implementer sessions are prone to mid-stream errors: network blips, model-output corruption ("Invalid stream"), OAuth token expiry. One observed Gemini run lost 30 minutes of partial work because all the changes were uncommitted when the stream errored.

**Every implementer prompt must mandate commits after each file pair**, not bundled per-task. Per-file-pair commits cap the loss at one file's worth of work.

### 3. Implementer never merges

Implementer's job ends at "code review approved." The orchestrator's final pre-merge check is non-negotiable — it catches what the implementer (and the review bot) missed.

In the case study, the orchestrator caught critical issues on multiple PRs that would have shipped privacy bugs:
- **URL-token leak** on the in-call live page (ephemeral OpenAI token in query params, logged in access logs/Referer)
- **Public storage** of guest audio recordings with predictable paths (anyone with an interview ID could access)
- **Iframe `src` injection** from URL query params on the Tavus video page
- **SSRF** in the Tavus webhook (no host allowlist on the recording URL)
- **Unbounded file uploads** (no size cap on audio blobs before reading into Buffer)

Review bots caught the first iteration of each but the orchestrator's deeper review caught additional nuance the bots missed.

### 4. Auto-merge needs a guard

GitHub auto-merge fires the moment required checks pass — including possibly merging a stale commit before the orchestrator's pre-merge check ran. Either:

- Disable auto-merge on these PRs (manual `gh pr merge --squash`)
- Require an explicit orchestrator-approval label that auto-merge waits for

Don't trust `--auto` blindly when the implementer is still iterating.

### 5. Refresh implementer auth pre-flight

If the session lasts >6 hours, the implementer's auth token may expire. Vertex AI ADC refresh tokens died mid-V2.3 in the case study, killing an in-flight implementer run.

**Pre-flight check:** before launching each implementer, run a noop call to verify auth:
```bash
gemini -p "Reply 'ok'" -m gemini-3.5-flash --output-format text
```
If it returns `invalid_grant`, prompt the user to re-auth before launching. Don't burn implementer-runtime tokens on broken auth.

### 6. Use `gh pr create --body-file`, not `--body "..."`

PR body text often contains `>` (quotes, redirect-style markdown). Shell tokenization breaks heredocs in the implementer's `bash`-via-tool path. Always write the body to a workspace-local markdown file and use `--body-file`.

### 7. Pick the right parallelism

| Parallel implementers | Pros | Cons |
|---|---|---|
| 1 (serial) | Lowest conflict risk, orchestrator focused | Slowest wall-clock |
| **2 (recommended sweet spot)** | Good throughput, manageable conflicts | Some merge-conflict reconciliation |
| 3 | ~30% faster than 2-way | Orchestrator becomes review bottleneck |
| 4+ | Diminishing returns | High conflict rate, harder to course-correct |

The case-study campaign used 2-way parallel for most of MVP and V1; bumped to 3 briefly mid-V1; settled back to 2 for V2 to balance review quality.

### 8. Plan must include hard-rules section

The plan's "Hard rules" section is what keeps the implementer aligned. Every plan should include:
- DO NOT merge. DO NOT push to main.
- DO NOT skip lint/typecheck/vitest.
- DO NOT use `console.*` — use the project's logger.
- DO NOT use `useEffect` directly if your project bans it (or whatever your project's no-go list is).
- Commit per file pair.
- Footer attribution (`Co-Authored-By: <implementer name>`) — be honest about authorship.

### 9. Worktrees prevent file-system races

Each parallel implementer needs its own `git worktree`. Don't try to run multiple implementers in the same checkout — they'll overwrite each other's edits and create chaos.

```bash
git worktree add ~/worktrees/feature-pr-N -b feature/pr-N origin/main
```

The orchestrator stays in its own session, never inside an implementer's worktree.

## Case study — AI Interview Mode (May 2026)

A 32-commit feature campaign delivered end-to-end voice interview functionality on a Mozilla blog platform. MVP + V1 + V2 in one continuous session.

**Scope shipped:**
- 11 MVP PRs (M0-M10): share-link CRUD, interview lifecycle API, Claude writer worker, in-call experience with WebRTC + voice orb + canvas tabs, public guest flow with consent + magic links, role-based publish gating, e2e tests
- 6 V1 PRs: Tavus video integration, OpenAI key from blog config, workspace settings page, MCP `start_interview` tool, guest article-published emails, per-workspace cost dashboard
- 6 V2 PRs: multi-language, scheduled interviews + ICS invites, async pre-recorded questions mode, AI follow-up suggestions for live-watch, mid-call canvas editing, fine-tuned writer research doc
- ~8 fix PRs from review bots + the orchestrator's user testing the live deploy

**Cost (estimated, since neither provider has a fine-grained billing API):**
- ~$130-200 on Claude Opus 4.7 (orchestration, planning, review, conflict resolution)
- ~$13-15 on Gemini 3.5 Flash (per-PR implementation across ~20 runs)
- **Total: ~$145-215**

**All-Opus counterfactual:** ~$390-800 (estimated from per-PR observed token consumption × no Flash offload)

**Net savings: 50-75%** — went into deeper security review and more aggressive plan refinement, not lower bills.

**Lessons that drove cost:**
- Per-PR final review on Opus was heavier than projected (10% of total Gemini cost vs 90% Opus) because review-feedback cycles pulled long context every time. **Worth it** — the security catches alone would have cost more than the marginal Opus tokens.
- Plan-in-workspace was the single biggest quality multiplier (see rule #1).
- Per-file-pair commits saved at least one full implementer-run worth of cost from a stream error (rule #2).

## Closing the loop

Every campaign run with this skill should end with:

1. **Cost report** committed to the repo as `docs/plans/<date>-cost-breakdown.md` — your real spend + counterfactual + lessons.
2. **Skill updates** — extend this file's "Critical rules" with anything new that bit you. Anti-patterns are the highest-value section.
3. **Per-PR implementer reports** preserved in `docs/plans/per-pr/` — the implementer should write one at the end of each run; they're useful audit trails when something later breaks.

## Anti-patterns (don't do this)

- **Putting the plan in `/tmp/`.** Implementer can't read it. Always commit it.
- **Letting the implementer merge.** You lose the orchestrator's final-check gate. Critical bugs ship.
- **Single-commit-per-PR on the implementer.** Mid-stream errors lose hours of work.
- **Trusting "review bot approved" as final.** Bots catch convention violations and common bugs but miss architectural issues like URL-token leaks, iframe src injection, SSRF, predictable storage paths.
- **Spawning >3 implementers in parallel.** The orchestrator becomes the bottleneck.
- **Skipping the cost report.** You won't know if the pattern is paying off without a baseline.
- **Trying to background-spawn Cursor Composer.** It's IDE-only. Use the hand-off variant.
- **Re-using auth tokens past their TTL.** ADC tokens expire — pre-flight check every spawn.
- **Bundling many tasks per implementer commit.** Per-file-pair is the minimum granularity.
- **Letting auto-merge fire without the orchestrator's pre-merge check.** Configure for explicit orchestrator approval, or disable `--auto` entirely on these PRs.
