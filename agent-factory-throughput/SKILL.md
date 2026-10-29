---
name: agent-factory-throughput
description: "Use when many agents build in parallel and the work stalls: API rate limits, a merge gate that wants a second reviewer, a slow orchestrator, stacked PRs that close, merge debt behind green CI, hooks that fire on command text, leaked names in PR bodies. Triggers: 'rate limit exceeded', 'agents stalled', 'software factory', 'stacked PRs', 'review gate needs non-author', 'orchestrator bottleneck', 'merge debt', 'one VM per agent'."
---

# Agent factory throughput

A large multi-agent build fails in the same places each time. The model is rarely the cause. The plumbing is: shared tokens, review gates, one busy hub, and merge order.

Each blocker below has four parts: Symptom, Cause, Fix, How to verify.

## Quick checklist

- [ ] Agent reads use App installation tokens. The owner token does writes and merges only.
- [ ] Code is read with `git`. CI is read once per decision, never in a loop.
- [ ] A review App posts verdicts from an independent reviewer run, bound to the head SHA.
- [ ] Third-party review bots are advice, not the gate. Every inline comment is read.
- [ ] Each repo has a captain agent. The hub only merges.
- [ ] Stacks merge bottom-up with merge commits. Retarget before you delete a branch.
- [ ] Two audits on different models count the unmerged work. New feature PRs freeze until stacks land.
- [ ] Commit and push run as separate commands.
- [ ] Bodies, reviews and comments are scrubbed of forbidden names.
- [ ] The shared brief lists the recurring bug classes (blocker 9).
- [ ] One VM per agent. Idle timeouts are set. Agents stop their own VMs.

## 1. One API token for many agents

**Symptom.** Every agent stalls at once. Calls return a rate-limit error. The hourly cap is gone in minutes.

**Cause.** All agents share one token, and it has one budget. Per-file API reads, CI polling loops and retry storms use it up fast.

**Fix.**

1. Send agent reads through GitHub App installation tokens. Each App has its own budget. It is often 12,500 requests per hour.
2. Create several Apps. Rotate across them for each call.
3. Keep the owner token for writes and merges.
4. Read code with `git clone` or `git fetch`. Do not call the contents API for each file.
5. Never poll CI in a loop. Read the checks once when you need a verdict.
6. On a limit error, stop. Read the reset time once. Sleep until then. Do not retry blindly.

Use `gh-app-read` from the `scripts` repo as the read wrapper. It caches each token for 50 minutes.

**How to verify.** Run `gh-app-read api rate_limit --jq .rate`. The `limit` value belongs to the App, not to the owner. Run `gh api rate_limit` with the owner token before and after a fan-out. The owner `remaining` value must not fall.

## 2. A gate that wants a non-author review

**Symptom.** A public repo needs one approval from an account that is not the author. Every agent posts as the owner. No PR can merge.

**Cause.** The agents share one identity. GitHub does not count a self-approval.

**Fix.**

1. Create a dedicated review GitHub App. It only POSTS verdicts. It never writes code.
2. Write each verdict in an independent reviewer run. Use a fresh session on a different model from the builder.
3. Bind the verdict to the head SHA. Pass that SHA as `commit_id`.
4. End the body with a trailer: `Reviewed-by: <agent>:<model>`.
5. Refuse to post if the head moved since the review began.
6. The post helper reads the PR head again and compares it before it sends.

**App manifest flow trap.** The manifest flow returns a one-time code in the browser redirect URL. The code stays valid for about one hour. A helper that crashes after the redirect has not lost the App. Copy the code from the URL. Exchange it for the App keys with the conversion endpoint, within the hour.

**How to verify.** Open the PR. The newest review shows the App as author, state APPROVED, and the `commit_id` equals the head SHA. Push one more commit. The helper must refuse to post until a new review exists.

## 3. Third-party AI review bots as the gate

**Symptom.** A bot review never arrives. Or it arrives late. Or the bot skips a small repo. It does not look at a commit again after it saw it once.

**Cause.** These bots rate-limit. They have size rules. They keep state per commit.

**Fix.**

1. Do not make a bot the gate. Use blocker 2 for the gate.
2. Still read the bot output. Bots find Major issues that your reviewer misses.
3. Read every inline comment. The review verdict does not show the threads. Read the `pulls/N/reviews` and `pulls/N/comments` endpoints.
4. Never auto-acknowledge a Major or Critical comment. Stop. Fix the code. Push. Reply with the fix SHA.
5. Minor comments may go to one tracking issue. Reply to each comment with the issue number.

`stack-merge ack` in the `scripts` repo does step 5. It stops with exit 2 on a Major or Critical comment.

**How to verify.** List top-level inline comments with no reply. The list must be empty before merge. Search the list for the words `major` and `critical`. Each hit must have a fix commit.

## 4. The orchestrator is the bottleneck

**Symptom.** Builders finish and wait. Every review, fix and re-review goes through one hub. The hub context fills. Throughput drops as the fleet grows.

**Cause.** The hub does work that each repo can do alone.

**Fix.**

1. Start one captain agent for each repo.
2. The captain runs the full loop: build, independent review (headless, different model, fresh session), fix, re-review.
3. The captain reports one line: "approved at SHA X, gate PASS".
4. The hub reads the line and merges. It does nothing else.
5. Keep irreversible actions direct. Merge and publish are direct tool calls from the accountable session. Do not hide them inside a subagent prompt. A permission system cannot check a claim of consent inside a prompt.

**How to verify.** Count hub turns for each merged PR. The count must stay near one. Check that every captain report names a full SHA that equals the PR head at merge time.

## 5. Stacked PRs

**Symptom.** An upper PR closes by itself. Or it loses its reviewed SHA. Or a merge is refused with a head-match error.

**Cause.** A squash merge rewrites history. Deleting a base branch closes the PRs that target it. A short SHA does not match the head-match flag.

**Fix.**

1. Merge bottom-up. Use merge commits. The upper PRs keep the SHAs that were reviewed.
2. Retarget the next PR to `main` BEFORE you delete the merged branch.
3. If you deleted first, the PR is closed. Recover it: recreate the branch at its old SHA, reopen the PR, then retarget it.
4. Pass the FULL 40-character SHA to `gh pr merge --match-head-commit`.
5. Name the repo literally in the command (`-R <owner>/<repo>`). A guard hook parses the command text. It cannot see a shell variable.
6. Merge with a separate, explicit command. Do not merge inside a helper script.

Use `stack-merge prep` from the `scripts` repo for step 2.

**How to verify.** After each merge, `gh pr view <next> --json baseRefName,state` shows `main` and `OPEN`. After the last merge, `git log origin/main` contains every reviewed SHA.

## 6. Merge debt behind green CI

**Symptom.** Every check is green. The product still does not work, because the work sits in open PRs or in unmerged stack tops.

**Cause.** CI measures a PR, not the default branch. Agents count a green PR as done.

**Fix.**

1. Run two adversarial progress audits. Use two different models. Give each only the default branch and the issue list.
2. Count unmerged work at a discount. Zero credit for an open PR. Partial credit for a PR that has an approved verdict at head.
3. Freeze new feature PRs until the stacks land.
4. Lift the freeze for each repo once its stacks are merged.

**How to verify.** The two audits agree within a small margin. The count of open PRs for each frozen repo goes to zero before the freeze lifts.

## 7. Hooks that match command text

**Symptom.** A pre-push hook blocks a harmless command. Or it blocks `git commit && git push` before the commit exists, so it checks the old tree.

**Cause.** The hook reads the command string. It sees words inside a heredoc body. It runs once for the whole line, before any part of the line runs.

**Fix.**

1. Run `git commit` as one command. Run `git push` as a second command.
2. Write long text (commit bodies, PR bodies) to a file. Pass the file with `-F` or `--body-file`.
3. Do not put the words `git push` or `gh pr merge` inside quoted text.

**How to verify.** The commit command returns first. `git log -1` shows the commit. Then the push command runs and the hook reads the real tree.

## 8. Forbidden names in PR text

**Symptom.** A privacy scan finds a forbidden name in a PR body, a review or a comment.

**Cause.** Agents paste tool commands and output into bodies. Reviewers "confirm" that a word is absent by listing the word. Edits keep old text in the edit history.

**Fix.**

1. Scrub the body before you send it. Search it for every forbidden term.
2. Tell reviewers to say "no forbidden terms found". They must not list the terms.
3. Scrub reviews and comments too.
4. Treat a leaked term in public history as leaked. Edit history keeps the old text. Delete the comment, or rotate the value if it is a secret.

**How to verify.** Fetch the body, all reviews and all comments. Run a case-insensitive search for each forbidden term. Each count must be zero.

## 9. Bug classes agents write again and again

Put this list in the shared brief. New agents then avoid them.

| Class | Rule |
| --- | --- |
| Fail open on bad data | A `NaN` timestamp or a parse error must deny, not allow. Compare with `Number.isFinite` first. |
| Missing secret becomes a string | `String(undefined)` is `"undefined"`. Check that a secret exists and has length. Refuse to start without it. |
| Default actor is the most trusted | An unknown actor kind must map to the least trusted kind. |
| File store without safety | Take a lock. Read again after the lock. Write to a temp file. Rename it into place. |
| Trusting synced or peer state | Validate every field from a peer or from a sync before use. |
| Client-claimed identity | A label sent by a client is a claim, not a fact. Derive identity on the server. |

**How to verify.** Each class gets one failing case in the E2E run before the fix. The case passes after the fix.

## 10. VMs for agents

**Symptom.** Two agents corrupt each other's files. VM creation fails at random. A bill grows from idle machines.

**Cause.** Agents share a work root. Parallel creates race on one shared firewall rule. Nobody stops the VMs.

**Fix.**

1. Give each agent its own VM. Never share a work root.
2. Create VMs one at a time when creation edits a shared firewall rule.
3. Set an idle timeout and a maximum lifetime on every VM.
4. Each agent stops its own VM when it finishes.

**How to verify.** List the VMs after a run. Only the running agents have one. Each VM has a timeout set.

## 11. A lost completion report

**Symptom.** An agent ended and its final report is missing. The hub wants to run it again.

**Cause.** The report is a message. The work is in the repo.

**Fix.** Do not re-run the agent. List the PRs directly. Read the state, head SHA and checks for each. The PR list is the source of truth.

**How to verify.** `gh pr list --state all --json number,state,headRefOid` shows the work. Compare the list with the plan.
