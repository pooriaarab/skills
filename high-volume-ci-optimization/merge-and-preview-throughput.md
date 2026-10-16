# Improve merge and Preview throughput

Use this procedure when builds, Preview publication, or integration waits limit delivery.
Measure each interval before changing the gate that appears slow.
Use [CI diagnosis](../ci-speed-diagnosis/SKILL.md) for the initial timing audit.

## Measure the actual delay

Record workflow creation, job creation, job start, and job completion separately.
Workflow-to-start includes scheduling and prerequisite waits. It is not pure runner queue time.
Record build, cache restore/save, migration, upload, activation, and verification phases.
A step named deploy can include several uploads, secret updates, and readiness polls.
Add phase timing before calling its whole duration network transfer.

Keep raw run links, source commits, workflow revisions, event types, and conclusions.
Compare recent samples from the same workflow and machine class.
Report failed and cancelled work separately from successful job medians.
Do not add separate step medians and call the result a typical complete run.

List every serialization mechanism and its protected resource:

| Mechanism | Question to answer |
| --- | --- |
| Merge queue or repository lock | Which conflicting integrations does it prevent? |
| Workflow concurrency group | Does it suppress stale work or serialize unrelated work? |
| Per-PR publication group | Can two heads overwrite the same Preview or ownership record? |
| Environment activation lock | Which migrations, bindings, or shared routes can race? |
| Reviewer or local premerge gate | Does it wait, or only validate the current head? |

An unavailable protection API does not prove that a queue exists or is absent.
Inspect workflows, enabled platform rules, and the actual landing tool.
A deployment lock is not a repository merge lock.

## Separate preparation from publication

Run immutable checkout, compilation, and artifact checks outside the mutable commit section
when their complete inputs can be fixed independently.
Keep migrations and environment activation ordered where they share mutable state.
Remove a nested lock only after proving that another mechanism protects every writer.

Bind artifacts to source, dependencies, configuration, toolchain, and compile environment.
Verify hashes when installing an artifact into a clean consumer.
A PR build and a release build can have different compiled URLs or feature flags.
Matching Git commits alone do not authorize artifact reuse.
Measure transfer and verification costs before adding a shared artifact service.

Recheck the intended source before each publication boundary.
Keep an active migration atomic. Discard obsolete preparation before it mutates remote state.
Prevent stale jobs from updating current Preview comments or passing release checks.
Use explicit cancellation or refusal outcomes; obsolete work must not impersonate a current pass.

## Reduce Preview work by affected inputs

Map a Preview's complete application and infrastructure inputs before adding filters.
Include dependencies, build configuration, migrations, bindings, test helpers, and generated files.
Unknown inputs select the full path. A Markdown file can be an application input.
A test-only change can require a fresh relevant walk without recompiling unchanged output.

Reuse a deployed Preview only with verified source and runtime equivalence.
Check ownership, immutable deployment identity, configuration, and expiry.
Execute current tests again. Reuse no passing test result.
Keep the required relevant walk for changes to visible behavior or external integrations.
Use [Worker Preview guidance](../cloudflare-worker-previews/SKILL.md) for deployment boundaries.

## Choose the integration model

Use a merge queue when testing the proposed combination prevents expensive integration failures
and the measured queue cost remains acceptable.
Measure rebase work, invalidated approvals, queue delay, and actual concurrent merge rate.
A large PR count alone does not justify a queue or its removal.

Pilot greater merge concurrency only after proving a replacement feedback path:

- Post-merge tests identify the exact integrated source and detect injected regressions.
- Pre-deploy checks block an unsafe artifact before environment activation.
- A named process owns rollback, bisect, repair, and escalation.
- Recovery works during API outages, concurrent failures, and broken automation.
- Release checks cannot confuse an older passing source with the artifact being shipped.

Start with a bounded change class. Keep existing gates during the comparison.
Publish detection delay, recovery time, escaped failures, throughput, and total compute cost.
Change a merge rule only when this evidence supports the new model.
Agent-written checks and repairs supplement the proved path; they do not establish it.

## Apply the source-control lessons selectively

Anthropic reports replacing global merge serialization with post-merge and pre-deploy testing.
It also describes sparse access and immutable content identity at a much larger scale.
Read [Redesigning source control at Anthropic](https://www.anthropic.com/engineering/redesigning-source-control),
published 2026-10-13 and updated 2026-10-15.

The procedure above is our adaptation, not a claim that their system fits every repository.
Keep Git while checkout and metadata costs remain small.
Use metadata APIs without a checkout for jobs that need no source files.
Use sparse checkouts only after declaring every required file and history input.
Test reused workspaces for stale sparse configuration.
Adopt a different source-control engine only when measured source access remains the bottleneck.

Finish with before/after measurements and a list of changed invariants.
Separate measured results from targets, estimates, and unqualified designs.
