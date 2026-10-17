---
name: ci-selective-evidence
description: "Use when someone proposes running only affected tests in CI, reading a test report to select tests, raising browser workers instead of sharding, or reusing a relocated build across jobs."
---

# ci-selective-evidence

Keep test selection disabled until the evidence proves coverage. A report reader
that cannot prove what it skipped is a coverage cut, not an optimization.

Selective CI has two halves, and each half needs its own proof. The reader half
must prove it sees every affected test. The execution half must prove the
isolated run means the same as the full run. Enable neither half on argument.
Enable each half on controls.

## When to use this

- **Triggers:** 'run only the affected tests', 'read the test report to skip
  suites', 'raise Playwright workers instead of sharding', 'share the build
  across jobs', 'relocate the build output', 'the report says nothing failed'.
- **Use this skill** before you enable a report reader, an affected-test
  executor, isolated browser workers, or a reused build on the pull-request
  path.
- **Use a sibling instead** to find which job matters
  ([ci-speed-diagnosis](../ci-speed-diagnosis/SKILL.md)), to place and gate a
  browser suite ([e2e-ci-economics](../e2e-ci-economics/SKILL.md)), or to place
  jobs and caches ([high-volume-ci-optimization](../high-volume-ci-optimization/SKILL.md)).

## Seven results are not one result

A green check hides seven different outcomes. Name which one you got before
you let a report select tests.

| Result | What it proves | Selection may use it |
| --- | --- | --- |
| Process exit code | the runner stopped this way | no, on its own |
| Test outcome | named tests passed or failed | yes, if bound as below |
| Cancellation | the run stopped before some verdicts, by an outside signal or by the runner itself | never — treat as missing evidence |
| Timeout | a raw timeout event fired before the verdict | never — the verdict does not exist |
| Skip | named tests did not run, by rule | only as named skips, never as passes |
| Retry | one attempt in a kept series | every attempt stays on record; a pass on retry is a retry-pass, not a clean pass |
| Missing evidence | no report, unreadable report, empty report, or incomplete report | never — run full coverage |

A child exit alone never proves a timeout. A genuine timeout needs the raw
timeout event in the record. A pass that needed a retry keeps its
first-attempt failure visible: report the retry-pass list apart from the
clean-pass list, per
[e2e-ci-economics](../e2e-ci-economics/SKILL.md#report-a-retry-pass-do-not-absorb-it),
and never count a retry-pass as clean qualification.

**Measured.** A pending promise left the event loop with nothing left to run,
so the runner cancelled the tests instead of failing them. The run reported a
cancellation, not a test deadline and not an outside kill. A reader that maps
'no failure lines' to 'pass' would have called that green. Hang-then-cancel
is missing evidence, never a pass.

## Fail closed: missing evidence means full coverage

An affected-test executor skips what the report does not name. Every gap in
the report is therefore a test silently skipped. Close every gap toward full
coverage.

**Rule.** Unresolved imports, missing report files, unparsable entries,
incomplete reports, and empty selections each fall back to the full suite. No
partial selection on a partial report. Missing, skipped, cancelled,
timed-out, or incomplete evidence never proves that a selected run equals a
full run, and never justifies cutover. Skip records may name scope you chose
to exclude, but a named skip never proves a test ran.

Bind every report to its inputs before the reader trusts it:

- the source inputs: commit SHA and the changed-file list the report was read for;
- the runtime versions: language, browser, runner image, and architecture;
- the selected identities: the exact test names selected, not a count;
- the raw artifact hashes: the report files as stored, so a re-read is checkable.

A report that cannot name what it skipped cannot justify skipping it.

## Prove the reader and the planner with controls before enabling selection

Selection has two halves, and reports alone prove neither half. The reader
half parses observed outcomes from reports. The planner half maps changed
code, through a qualified dependency graph, to the test identities that
should run. A correct reader with a wrong map still skips affected tests.

Require all four controls, all recorded, before a report reader or
affected-test executor gates anything.

- **Positive control.** A change with a known affected test must select
  exactly that test. If the reader misses a test you know is affected, the
  reader is wrong, not the test.
- **Unrelated-change control.** A change with no covered effect must select
  nothing — or you must prove the no-test path — and the full suite still runs
  beside the candidate until this control passes.
- **Seeded-failure control.** Seed a failure in an affected test and check
  the selected run catches it. Seed a failure outside the selected set and
  check the process detects the miss: block cutover and fix the map.
- **Unresolved-graph fallback.** An unresolved dynamic import or import-graph
  gap falls back to the full suite. A map with holes cannot prove affected
  coverage.

Keep selection disabled until all controls pass on the pull-request path.
Keep comparing selected runs against full runs on a schedule after cutover:
each comparison re-proves the map. One comparison never pays for all future
changes.

## Guard proof paths through the nearest existing ancestor

A guard that resolves a path through a child directory that does not exist yet
can miss a symlink. The missing child resolves lexically, so the link is never
followed and the proof lands in the wrong place.

**Rule.** Resolve artifact and proof paths through the nearest existing
physical ancestor. Create the child directories after resolving, not before.

Write each run to a fresh output directory. Never overwrite the previous
report in place: earlier receipts are the only witness when the new run
produces nothing. Preserve them until the new run's own receipts verify.

## Keep the refusal reason and a synthetic failure

A platform rejection that exposes only an exit code cannot be diagnosed.
Controls passed on three local configurations — two native architectures and
one emulated baseline — while the CI runner rejected the same work. The
refusal reason was not retained, so the cause is unknown. Unknown is the
correct record. Do not promote a hypothesis about the platform into the
reader to make CI pass.

**Rule.** Retain a bounded refusal reason from CI: the failing step, the
signal or exit code, and the last lines of output. Keep a synthetic failure
artifact beside it — a canned failing report that proves the reader surfaces
failure end to end. A reader never seen to report failure is a reader never
tested.

Diagnose platform differences with the binding above: compare runtime
versions and architectures across the passing and rejecting runs. Never weaken
the reader — never drop an input from the report binding — to quiet a
platform mismatch.

## Workers are isolation claims, not speed claims

This corrects the blanket rule in
[e2e-ci-economics](../e2e-ci-economics/SKILL.md#shard-the-suite-do-not-raise-workers-on-shared-state):
isolated workers are acceptable with proved independent mutable resources.
Workers that share only stateless resources stay acceptable; workers that
share a mutable resource are not.

Two workers on one dev server and one database contaminate each other. That
is still the common case, and the common answer is still to shard into
separate jobs. A worker count above one is a claim about each mutable
resource the run owns: separate databases, separate sessions, separate
ports, separate homes, separate resource ownership, where each applies.
Name each mutable resource and show its separation. Prove the claim or keep
the count at one.

Qualify isolated workers or shards with all four:

1. **Exact test identities.** The same test names run before and after. A
   split that silently drops tests reports faster and proves less.
2. **Separate mutable state.** Name each mutable resource and show its
   separation. 'Separate jobs' is one way. Proved separate ownership of each
   shared mutable resource is the other way.
3. **Repeated runs.** One fast run proves nothing. Repeat until the spread is
   smaller than the claimed win.
4. **Full cost accounting.** Measure setup, build, execution, queue, and total
   runner time — not execution alone. Report latency and machine seconds
   separately, per [ci-speed-diagnosis](../ci-speed-diagnosis/SKILL.md).

**Measured.** A real browser parallel pilot showed no gain because setup
dominated execution. Parallelism cannot beat a fixed cost it also multiplies.
Measure the setup share before choosing a worker or shard count, and record
the floor next to the count.

## Qualify a relocated build before sharing it

A build reused across jobs — relocated, then consumed with the producer
absent — must prove it still runs where it landed. Matching the build inputs
is necessary and not sufficient: match inputs first, then boot the relocated
output with the producer paths removed.

**Measured.** A portable build needed a literal relocation fix before two
consumer boots passed with the producer directory absent. Input matching
alone would have shared a build that could not start.

**Rule.** Share a build across jobs only after a real runtime check of the
relocated output, run with the producer paths removed. Keep the check with
the sharing step, so a later move re-runs the proof.

## Observations are not hypotheses

Write what the run showed separately from what it might mean. 'The refusal
reason was not retained, so the cause is unknown' is a complete finding. Do
not publish private source, paths, credentials, or payloads as evidence. Do
not publish savings you did not measure on a quiet machine and in CI — see
the measurement discipline in
[ci-speed-diagnosis](../ci-speed-diagnosis/SKILL.md#measurement-discipline).

## Safety gate

**Stop.** Never enable selection on missing evidence, an unbound report, or a
failing control. Never publish private material to justify a selection rule.
An affected-test executor gates the pull-request path only under the existing
authorization for that path, with the repository review, CI, preview, and
release gates in force. Never cut over with failing proof.

## The order

1. **Separate the seven results** in the current report. Anything that is not
   a bound test outcome falls back to full coverage.
2. **Bind the report** to source inputs, runtime versions, selected
   identities, and artifact hashes.
3. **Run all four controls.** Keep selection disabled until each passes, and
   keep scheduled full comparisons after cutover.
4. **Guard the proof paths** through the nearest existing ancestor, into fresh
   directories, keeping earlier receipts.
5. **Retain refusal reasons and a synthetic failure** from CI before diagnosing
   any platform difference.
6. **Qualify workers or shards** with exact identities, separate state,
   repeated runs, and full cost accounting.
7. **Qualify a relocated build** with a runtime check run with the producer
   absent, after matching inputs.
8. **Record observations apart from hypotheses.** Leave unknowns unknown.
