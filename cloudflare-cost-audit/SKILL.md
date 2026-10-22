---
name: cloudflare-cost-audit
description: Audit Cloudflare spending across services and reduce D1 row costs. Use for unexpected bills, costly SQL, preview resource growth, or proposed table consolidation.
---

# Cloudflare cost audit

Attribute the bill before changing the schema. Keep savings targets separate from measured savings.

## Establish the baseline

1. Read the repository rules and Cloudflare binding configuration.
2. Load credentials through the approved credential tool into process environment variables.
3. Save raw responses outside Git in a private directory.
4. Record the account, UTC interval, billing period, currency, and collection time.
5. Collect invoices, subscriptions, and usage for every paid service.
6. Record missing permissions and unavailable metrics as gaps.

Complete this stage when each charge has a service owner or an explicit investigation gap.
Resource counts alone cannot explain a bill.

## Collect complete evidence

Use [cloudflare-cost-audit](https://github.com/pooriaarab/scripts/blob/main/cloudflare-cost-audit)
for D1 inventory, row analytics, and an optional raw current-period billing snapshot.
Read its [command contract](https://github.com/pooriaarab/scripts/blob/main/docs/cloudflare-cost-audit.md) first.
It does not audit all Cloudflare services or calculate invoices.

- Follow actual pagination metadata, including cursors and next-page fields.
- Treat requested page size as a request, not proof of completion.
- Fail when GraphQL results reach the selected limit.
- Include historical database IDs in analytics attribution.
- Treat inventory collection as a nontransactional snapshot.
- Map resources to repository, environment, branch, and last known owner.

Keep billable `rowsRead` and `rowsWritten` separate from SQL query counts.
Match usage to its billing interval before calculating a cost estimate.
The calendar month and subscription period can differ.

For cumulative usage, compare the latest cumulative value within each billing group.
Group by service, subscription, zone, billing period, and currency when those fields exist.
Validate meter semantics before summing daily costs. High-water charges can repeat across days.
Reconcile estimates against the invoice. Label unreconciled amounts as estimates.

Complete this stage when every inventory page and analytics limit has an explicit completion check.

## Measure expensive paths

1. Rank databases by billable rows, then map expensive queries to application callers.
2. Capture the query, parameters, result size, query plan, row counters, and latency.
3. Use representative data and the same workload for each comparison.
4. Inspect repeated aggregate scans, broad updates, polling, imports, and cron jobs.
5. Inspect indexes, triggers, FTS maintenance, and conflict updates for write amplification.
6. Separate request overhead from database execution time before changing batching.

Prefer bounded queries, selective indexes, fewer repeated scans, and writes that skip unchanged rows.
Measure each proposal before broad schema changes.
An index can lower read costs while increasing write costs.

Complete this stage with a reproducible before-and-after artifact for each changed query path.
Record billable rows, latency, workload size, and result equivalence.

## Change structure only with evidence

List every table, reader, writer, foreign key, trigger, index, and retention requirement.
Treat an empty or unfamiliar table as unclassified until its owners are checked.

For JSON or JSONB proposals, probe supported functions on the target D1 engine.
Measure filtering, indexing, updates, row counters, and migration effects with representative records.
Keep independently queried or constrained fields searchable and enforce their invariants.
Choose structure from access patterns and measured costs, not table count.

Before removal, export the affected data and restore it into an isolated database.
Compare row counts and important relationships after restoration.
Prepare rollback steps and identify the deployment that stops old writes.
Do not delete data until restoration succeeds and callers no longer depend on it.

Complete this stage when migration, restoration, and the application flow pass on an isolated copy.

## Control recurring waste

Check preview creation, close-event cleanup, failed-build cleanup, and age-based retention.
Bind cleanup to verified resource ownership. Preserve active environments and shared bindings.
Measure retained resource cost separately from historical usage.
Removing a database does not reverse its earlier charges.

Use the repository's PR review, local CI, preview walk, and release procedure.
Report measured savings after equivalent observation intervals.
Include remaining gaps and costs that the change cannot affect.

Primary references:
[D1 billing](https://developers.cloudflare.com/d1/observability/billing/),
[D1 metrics](https://developers.cloudflare.com/d1/observability/metrics-analytics/),
[billable usage](https://developers.cloudflare.com/api/resources/billing/subresources/usage/methods/paygo/).
