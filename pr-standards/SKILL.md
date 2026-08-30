---
name: pr-standards
description: "Use when opening, reviewing, sizing, or splitting a pull request in a repo where agents write most of the PRs, and when rolling the rule out to more repos. Covers the one-issue-one-PR-one-concern-under-500-lines standard, the branch/title/body shapes a checker enforces, and the proof-of-work rule: every PR shows evidence of the work it did — before/after screenshots for anything visible, a command and its result for anything else — uploaded to GitHub user-attachments and never committed. Also covers the escape hatches, the enforcement layers and which of them actually gate, VISION.md as the thing a scope review judges against, and the capture-and-upload recipe including the ffmpeg WebM conversion. Triggers: 'open a PR', 'PR standard', 'branch name', 'proof of work', 'before and after screenshots', 'this PR is too big', 'split this PR', 'user-attachments', 'PR body template', 'roll the standard out'."
---

# pr-standards

Agents produce pull requests faster than anyone reviews them. Generation costs almost nothing
now; review costs what it always did. Everything here exists to close that gap.

**One issue. One PR. One concern. Under 500 lines. Show your work.**

The rule and its checker live in [pooriaarab/scripts](https://github.com/pooriaarab/scripts):
`pr-standards.md` is the standard, `pr-standards` is the program. Read the standard when you
need the exact boundary; this skill is what to do.

## Before you branch

Open the issue first. No issue, no branch. The issue number is the join key that ties the
branch, the title, the body and the merged commit to one agreed piece of work.

```text
branch:  <prefix>-<issue>-<slug>     cr-142-fix-onboarding-drop-off
title:   [CR-142] Fix onboarding drop-off
```

The prefix is 2–4 lowercase letters, one per repo, in `.github/pr-standards.json`. Read that
file; never guess it. Slug is `[a-z0-9-]`, 3–48 characters, and describes the change, not the
file. Subject after the tag is imperative, 10–50 characters, no trailing period, no emoji, no
conventional-commit prefix. "Fix the drop-off", never "Fixed the drop-off".

Check the name before you use it:

```bash
pr-standards branch                       # the current branch
pr-standards precheck --branch <name>     # offline, for a hook
```

## The body

Five things, all required. The checker enforces the first four; the review
council reads the fifth.

```markdown
Closes #142

## What
One to three sentences. What changed, in plain words.

## Why
The problem from issue #142, and why this is the fix.

## How I verified
bun test        -> 214 passed
bun run build   -> clean

![before](https://github.com/user-attachments/assets/...)
![after](https://github.com/user-attachments/assets/...)

Assisted-by: claude-personal:claude-opus-5
```

Exactly one closing reference. Two means two concerns, which means two PRs — and the checker
counts all nine keywords GitHub honours, not just `Closes`.

`Assisted-by: <agent>:<model>` discloses which fleet member wrote the change. Months from now
it is the only way to tell which agent produces which class of defect. It is not a
`Co-Authored-By` trailer and does not go in the commit message.

## Proof of work

`## How I verified` names what you ran. Proof is the artifact that shows it happened. An agent
writes "tested locally" for free, so that line is worth nothing on its own.

| What you changed | What you show |
|---|---|
| Anything a user can see | before and after screenshots, or a video of the flow |
| Backend, API, CLI | the command and its real output |
| A bug | the test failing before, passing after |
| Performance | the numbers, both sides |
| Infrastructure, CI | a link to the green run |
| Copy, docs, marketing | the rendered page, or the preview URL |

Capture during reproduction and again during verification, so both sides come from one run.
When a later push changes what is on screen, recapture and replace the embed. When you rewrite
a body, keep every embed that is still accurate — never drop one you cannot replace.

**Media goes to GitHub user-attachments. Media never goes into a commit.** The commit carries
the change; the pull request carries the evidence. A committed screenshot is in the repo's
history forever, for a picture nobody opens twice.

```bash
curl -sS -X POST \
  "https://uploads.github.com/user-attachments/assets?name=<file>&content_type=<mime>&repository_id=$(gh api repos/<owner>/<repo> --jq .id)" \
  -H "Authorization: Bearer $GITHUB_ATTACHMENTS_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: <mime>" \
  --data-binary @<file>
```

A successful upload returns JSON holding the `user-attachments` URL. Images embed as
`![alt](url)`; a video goes on its own line as a bare URL. Supported: `image/png`,
`image/jpeg`, `image/gif`, `image/webp`, `video/mp4`.

- `$GITHUB_ATTACHMENTS_TOKEN` unset → you cannot upload, but the requirement stands. Say so
  in the body and ask a maintainer to attach the capture by dragging it into the body in the
  GitHub UI. Never commit the file instead, and never treat the missing token as a
  `Proof: n/a` reason — the change is still visible.
- A browser recording is usually WebM, which GitHub will not take:
  `ffmpeg -i in.webm -c:v libx264 -pix_fmt yuv420p out.mp4`
- Capture with `agent-browser` or the Chrome DevTools MCP. For store-ready framed shots, see
  [app-screenshots](../app-screenshots/SKILL.md).

When the change genuinely cannot be shown, write the reason:

```text
Proof: n/a — pure type-level refactor, no runtime path and no visible surface
```

The checker accepts the line. The review council judges whether the reason holds, so a bare
"not applicable" fails on the next pass. An agent cannot clear its own proof requirement.

## Size

| Cap | Limit |
|---|---|
| Counted lines, `+` and `-` | 500 |
| Counted files | 40 |
| Closing issue references | exactly 1 |
| Top-level directories touched | 3 (warn) |

Lockfiles, build output, snapshots, generated code, migrations and binary assets do not count.

500 is roughly one reviewable sitting. It is a design constraint, not a nuisance: an agent that
must stay under it decomposes the work **before** it writes. If a change truly cannot be split,
say why in the body and ask for the `oversized-approved` label. Never apply that label yourself
— an agent clearing its own oversize check defeats the rule.

Over the cap and splittable? Split by concern, not by line count. One branch per issue, and
each PR stands on its own: it builds, it tests, and it carries its own proof.

## VISION.md

A scope review asks two questions: does this PR do one thing, and does that thing belong in
this repo at all. The second needs something to judge against. `VISION.md` at the repo root is
that something — what the repo is for, who it is for, what it will never do, and what "done"
looks like now. Short. The review council reads it when present, and falls back to `README.md`
when it is missing.

## The enforcement layers

| Layer | Runs | Catches | Bypassable |
|---|---|---|---|
| Claude Code `PreToolUse` hook | at tool-call time | a bad branch before it exists | by an agent whose harness never loaded it |
| `pre-push` git hook | before the push | a bad branch before GitHub sees it | `--no-verify` |
| `pr-standards` in CI | on every PR | everything, including size, body, and proof | only by ignoring red |
| `vibecodereview` scope lens | on every PR | non-atomic work, off-scope work, evidence that does not match the diff | by ignoring the review |

Rulesets and required status checks are a fifth layer, and on a Free personal account they
work on public repos only. On a private repo red CI is a signal, not a gate, which is why the
two local layers carry more weight there. They are early feedback, not a boundary — bypassing
one is a real decision, not a shortcut.

**Caution: never add `pr-standards` as a required check on a repo before the workflow is
installed there.** Requiring a check the repo never runs blocks every pull request in it,
permanently.

## Rolling it out

```bash
pr-standards-rollout --repo <name>                            # dry run, the default
pr-standards-rollout --repo <name> --apply                    # opens the adoption PR
pr-standards-rollout --repo <name> --apply --with-post-merge-verify   # also the deploy check
```

One rollout writes four artifacts, and a repo missing any of them has not adopted the
standard:

| File | What it carries |
|---|---|
| `.github/pr-standards.json` | the repo's prefix and its caps |
| `.github/pull_request_template.md` | the body every PR starts from |
| `.github/workflows/pr-standards.yml` | the CI check, which is the authority |
| `AGENTS.md` | the rule itself, between markers, for every agent CLI |

It reads the prefix from `repo-prefixes.json`, never overwrites an existing config, and
opens the adoption PR itself — which then has to satisfy the standard it installs.

Set `requireProof: false` in a repo where no change is ever visible, rather than teaching the
fleet that `Proof: n/a` is routine.

## Related

- `babysit-pr` (private) — driving a PR from push to green and deployed.
- [agent-lint-guardrails](../agent-lint-guardrails/SKILL.md) — the budgets that stop a PR
  growing past the cap in the first place.
- [app-screenshots](../app-screenshots/SKILL.md) — capturing UI worth attaching.
