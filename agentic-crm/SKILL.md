---
name: agentic-crm
description: "Let an AI agent read and write CRM records safely — identity resolution before every write, no invented contact facts, consent-gated outreach fields, and an append-only audit trail. Use when an agent touches contacts, deals, or activities in any CRM."
---

# Agentic CRM

**Use when:** an autonomous agent reads or writes contacts, companies, deals, or activities in a CRM. This skill is a **design pattern**, not an implementation.

## The one rule

> The agent never invents a contact fact. Every write resolves to a real record first, and every resolved write stays traceable to its source.

## Six invariants (do not ship without all six)

1. **Resolve before write.** Match to an existing record by a stable key (record id, verified email, or exact phone) before updating. No match ⇒ create through one explicit create path, never by silent upsert.
2. **Provenance on every field.** Each written value carries where it came from (user-stated, provider-verified, imported, inferred). Inferred values are marked as such and never sync outward.
3. **Consent gates outreach.** Email/phone/mail fields are writable any time but *usable* for outreach only with a recorded opt-in, its timestamp, and its source. No opt-in ⇒ the channel stays closed.
4. **Dedup is a merge, not a delete.** A suspected duplicate opens a merge review (surviving id, field-level winners, loser tombstoned). Merges are reversible for a fixed window.
5. **Least-privilege sync.** The agent sees and writes only the objects its task needs. Credentials come from the operator-selected connection, never a shared key. Bulk export needs a separate approval.
6. **Append-only activity ledger.** Every agent read of sensitive fields and every write appends who/what/when/source. The ledger is un-purgeable and queryable per record.

## Minimal shape

```ts
interface CrmWrite { recordId?: string; fields: Record<string, unknown>; source: Source; actor: AgentId }
type Resolution = { kind: 'matched', id: string } | { kind: 'create' } | { kind: 'ambiguous', candidates: string[] }
```

Resolve → check consent (for outreach fields) → write with provenance → ledger append. `ambiguous` never auto-merges; it asks.

## Anti-patterns

- ❌ Fuzzy auto-merge on name alone (two same-name contacts become one).
- ❌ Backfilling empty fields with model guesses that later sync as facts.
- ❌ One global API key for every agent and every task.
- ❌ Deleting duplicates instead of tombstoning them.
