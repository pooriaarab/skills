---
name: backlog-triage
description: "Act as the product manager for an open GitHub backlog. Decide what blocks the next release, give every open issue one priority, correct its state and routing labels, and append an implementation brief that a cheap model can execute without asking anything: where in the code, steps in order, decisions already made, edge cases, pre-work research, skills and reference URLs, and what done means. Researches in parallel and writes in a second pass so priorities are calibrated across the whole backlog. Re-runnable: the brief sits between markers and is replaced, never stacked. Triggers include \"triage the backlog\", \"what is blocking release\", \"prioritise the issues\", \"enrich the issues so any model can do them\"."
---

# backlog-triage

Turn an open backlog into a ranked, release-aware queue where each issue
carries enough direction that the cheapest capable model can pick it up and
finish it.

## When to use

- Before a release cut, to name the release blockers.
- When the backlog has grown past what one person reads in a sitting.
- When issues are routed to cheap or fast models and keep coming back with
  questions, wrong files touched, or the same gotcha hit twice.
- NOT for writing one spec from a thin ticket (use `spec-issue`).
- NOT for raw bug-bash notes (use `bug-bash-triage`).

## The output, per issue

1. **Exactly one priority label.** `priority:p0`, `priority:p1`, `priority:p2`.
2. **A `release-blocker` label** when, and only when, the rubric says so.
3. **Corrected labels.** Exactly one from each group the repo defines, such as
   kind, size, route and state. Fix contradictions. Fill in what is missing.
4. **A brief appended to the issue body** between
   `<!-- pm-triage:start -->` and `<!-- pm-triage:end -->`. The original body
   above the markers is never edited.

Plus one **backlog summary** for the owner: the release blockers, the ordered
p1 queue, the owner questions, and the issues that are already done.

## Stage 0: read the house rules first

Read the repo's own process before touching a label: `AGENTS.md`, any issue
standard (`.agents/issues.md`, `CONTRIBUTING.md`), the issue templates, and
the release gate document if one exists (a release checklist, a golden path,
a smoke-test list). Use the repo's labels. Check which priority labels exist
before applying one, because an API that auto-creates a label on first use
will spawn a typo'd duplicate silently.

**Define "release" from the repo, not from habit.** Find which branch ships to
production and what gate it passes. The release blocker rubric hangs off that
gate. If there is no written gate, write the one-sentence definition you are
using into the backlog summary, so the owner can correct it.

## Stage 1: the rubric

Write the rubric to a file before any research starts. Every research agent
reads the same file. Without it, five agents produce five priority scales and
the calibration pass becomes a rewrite.

### Release blocker: any one of

1. It breaks or degrades a step of the release gate (golden path, smoke list).
2. It loses data or silently overwrites a user's work.
3. It is a security, auth or tenant-isolation hole.
4. It moves money wrongly, **and** that money path is reachable by real users
   today. Verify reachability in code and config. A bug in a test-mode-only
   flow is a p1, not a blocker.
5. It breaks a flow users already have. A missing new feature is not a blocker.
   Visual parity is not a blocker.

### Priority

| Label | Meaning |
| --- | --- |
| `priority:p0` | A release blocker, or the owner set p0. Never downgrade an owner's p0. |
| `priority:p1` | Do next. Unblocks a p0, sits on the owner's declared critical path, or a real user can hit the defect today. |
| `priority:p2` | Valuable, after p1. Polish, parity, research, new surfaces. |

Be stingy with p0. If more than about a tenth of the backlog is p0, the scale
has stopped meaning anything. Re-read the rubric and demote.

### State

| State | Only when |
| --- | --- |
| `ready-for-agent` | A cheap model could start today. No open blocker, no owner decision. |
| `blocked` | A named open issue or PR must land first. Name it. |
| `needs-info` | An owner decision is required. Write the question and a recommended answer. |
| `triage` | Avoid. It means the triager did not decide. |

High-stakes paths (auth, billing, public API tenant scope, the deploy or
publish path, database migrations) route to the judgement tier whatever the
size.

## Stage 2: research in parallel, read-only

Cluster the backlog by surface (billing, mail, editor, one epic's children)
and give each cluster to one research agent. Seven to twelve issues per agent
works. Fewer agents than that and the context fills before the cluster is
done. More and the cross-issue view inside a cluster is lost.

Each agent, per issue:

1. Reads the full body and **all comments**. Owner decisions often live only
   in a comment. For an epic, also reads the sub-issues and their state.
2. **Checks whether the work is already done.** Search merged PRs for the
   issue number and grep the code for the feature. An issue closed by a merge
   that forgot `Closes #` is the most common stale entry. Flag it as a close
   candidate. Do not close it from the research pass.
3. Checks for an open PR already on the issue, so nobody duplicates it.
4. Greps the codebase. **Every path cited must exist.** Verify with `ls` or
   `grep`, and cite `file:line`. A brief that points a cheap model at a file
   that does not exist is worse than no brief, because the model will create
   it.
5. Finds reference material: design docs, research notes, screenshots,
   recordings, and the vendor's docs page for any third-party API involved.
6. Writes the brief to a local file, `briefs/<issue>.md`, and returns one
   compact line per issue:

```text
#N | p1 | blocker n | state ready-for-agent -> blocked (#M) | add size:standard | why | CLOSE-CANDIDATE?
```

**Nothing is written to the tracker in this stage.** Research is reversible;
a label flip that triggers an agent pickup is not.

## Stage 3: calibrate across the backlog

Read every agent's summary lines together. This is the PM's job and is not
delegated.

- **Count the p0s.** Demote anything that does not meet the rubric literally.
- **Check dependencies across clusters.** A mail issue blocked on an editor
  issue is invisible from inside either cluster.
- **Find duplicates** and keep the one with the better acceptance criteria.
- **Order the p1 queue.** Blockers first, then whatever unblocks the most
  other issues, then the owner's critical path.
- **Collect owner questions** into one list, each with a recommended answer,
  so the owner can answer them all in one sitting.

Then tell each research agent the calibrated values that changed, and have
it correct its brief before anything is written.

## Stage 4: write

For each issue:

1. Read the current body fresh. Someone may have edited it since research.
2. If the markers already exist, replace what is between them. Otherwise
   append the block after a blank line. Never touch text above the markers.
3. Set labels in the same update, as a full list. A partial label list on an
   update replaces the existing labels and drops kind or size.
4. Close candidates get a comment naming the commit on the default branch,
   not a silent close, and only when the owner asked for closes. Otherwise
   list them in the summary for the owner to close. Closing is the one write
   a permission layer is most likely to refuse, so plan for it to be handed
   back.
5. Fix native dependencies the research found wrong. Common cases: an
   inverted pair, an epic listed as a blocker of its own children (it can
   never clear), and a blocker that is already done.

## The brief template

Dense, imperative, concrete. About 70 lines at most. Leave out a section only
when it is truly empty, because an empty heading reads as answered.

```markdown
<!-- pm-triage:start -->
## Triage brief
**Priority:** P1 — <one-line why>. **Release blocker:** No — <why>.
**Start now?** Yes | No — <what must happen first: #issue, PR, or owner decision>.

### Where to work
- `path/to/file.ts:123` — what lives here and why it matters.

### Do this, in order
1. ...

### Decisions already made (do not reopen)
- ...

### Edge cases and gotchas
- ...

### Pre-work research (only if needed)
- The question, where to look, and what to produce before coding.

### Resources
- Skills: the skills the implementer should load, by exact name.
- References: research notes, screenshot paths, vendor docs URLs.

### Done means
- [ ] A testable check tied to an acceptance criterion.
- Verify: exact commands, the exact test file or config, and the preview walk
  if a user can see the change.

### Owner question
- The question, the recommended answer, and the trade-off.
<!-- pm-triage:end -->
```

### What makes a brief usable by a cheap model

- **Name the file, the function and the line.** "The header component" sends
  a cheap model searching and it settles on the first match.
- **Write the order of steps.** Cheap models do the interesting step first and
  skip the migration or the test.
- **Write the decisions down as decisions.** Anything phrased as an option
  will be reopened.
- **Name the trap.** The thing that broke the last attempt goes in gotchas,
  with the issue or PR number where it happened.
- **Give the verification as a command.** "Test it" means nothing. Write
  `bun run ci:local`, then the one Playwright config that covers the surface.
- **Point at a skill by its exact name** and at the vendor doc by URL. For
  visual or UI fidelity work, point at a design-review skill and
  [impeccable.style](https://impeccable.style) for its audit and polish
  passes. For billing, the payment provider's webhook and API reference pages.
  For a third-party fetch of user URLs, the SSRF rules.

## Gotchas

- **"Merged" does not mean "on main".** In stacked-PR repos, a child PR merged
  into its parent's branch after the parent was already squash-merged lands
  nowhere. The PR page says merged, the issue stays open, and the code is not
  shipped. In one run, 28 PRs merged inside a three-minute window had this
  shape, and 16 open issues were "done" only on dead branches. For every PR
  cited as evidence, check `git merge-base --is-ancestor <merge_sha>
  origin/main`. A stranded PR's branch still holds the work, so the brief
  names the SHA to port and says to port by hand, because the base has
  moved. File one audit issue for the whole stranded set, so it is fixed once
  and not rediscovered issue by issue.
- **The reverse also happens.** An issue whose own PR is stranded can still be
  done, because a later squash carried the same change in. Check the code on
  the default branch, not the PR.
- **"Closed" does not mean "done" either.** A parent issue closed when only
  half its job shipped is the root cause of a new bug. Say so in the brief, so
  the implementer does not trust the closed issue's description of the system.
- **The backlog moves while you research.** New issues, new dependencies and
  new PRs appear during a long research pass. Before writing, re-read each
  issue's blockers, and list open PRs again. The issues endpoint returns PRs
  as well, so filter them out.
- **Reference material that lives on one machine is not reference material.**
  Briefs that cite `/tmp/...` captures from another host send the implementer
  looking for files that do not exist. Name the fallback in order: numbers in
  the issue and specs, committed screenshots, then a fresh capture.
- **The owner's word beats the rubric.** An owner-set p0, or a comment saying
  "this comes first", stays. Note the disagreement in the summary if there is
  one. Do not overwrite it.
- **Updating labels replaces them.** Always send the full intended set.
- **Issue bodies have a size limit.** GitHub caps a body at 65,536
  characters. A long body plus a brief can hit it. Check the length before
  writing. If it would overflow, post the brief as a comment carrying the same
  markers and link it from one line inside the body markers.
- **Do not write "Parent: #N" or "Blocked by: #N" in prose** when the tracker
  has native sub-issues and dependencies. Use the native relation.
- **A merged PR is the evidence for "done", not a commit message.** Check the
  PR closed the issue, or that the code is on the default branch.
- **Re-running is the point.** Because the brief sits between markers, the
  next triage replaces it. Date the brief so a reader can tell how stale it is.

## Verify the run

- Every open issue has exactly one priority label and one label per group.
  Query the tracker and count. Do not trust the write loop's success output.
- The p0 list matches the release blocker list plus any owner-set p0s.
- Spot-check three briefs at random: open each cited path, and run one
  verification command.
- The backlog summary reaches the owner with the blockers, the ordered p1
  queue, the owner questions and the close candidates.
