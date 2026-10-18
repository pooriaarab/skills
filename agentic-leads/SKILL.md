---
name: agentic-leads
description: "Run an agent-driven lead pipeline safely — capture with provenance, validate before outreach, score transparently, and route to the right channel. Use when agents turn strangers into contacts across any source."
---

# Agentic Leads

**Use when:** autonomous agents find, validate, and route prospective contacts. This skill is a **design pattern**, not an implementation. Storage and consent live in `agentic-crm`; channel sends live in `agentic-email`, `agentic-text`, `agentic-phone`, and `agentic-postcard`.

## The one rule

> A lead is a sourced hypothesis, not a fact. Provenance travels with it until a human or a verified event promotes it.

## Six invariants (do not ship without all six)

1. **Provenance at capture.** Every lead records source, capture time, and exactly what was observed vs inferred. Inferred job titles and guessed emails are marked inferred and never presented as verified.
2. **Validate before outreach.** Work email verified, phone line-type checked, address verified (see `agentic-address`) — each only where its channel will be used. Unvalidatable ⇒ the channel stays closed, the lead stays parked.
3. **Transparent scoring.** Score from named, inspectable signals with weights a human can read. No black-box "hot lead" flag deciding who gets called at dinner time.
4. **Route, do not spam.** Each lead enters at most one active sequence at a time (see `agentic-campaign`). A reply, a meeting, or an opt-out exits all sequences immediately.
5. **Source hygiene.** Track yield and complaint rate per source. A source whose leads bounce or complain above threshold is paused automatically pending review.
6. **Lead ledger.** Capture, validation results, score changes, routing decisions, and exits append per lead. A dropped lead keeps its history so a later agent does not repeat the same dead end.

## Minimal shape

```ts
interface Lead { id: string; provenance: Source; observed: Record<string, unknown>; inferred: Record<string, unknown>; score: number; state: LeadState }
type LeadState = 'captured' | 'validated' | 'sequenced' | 'converted' | 'parked' | 'suppressed'
```

Capture with provenance → validate per channel → score transparently → route to one sequence → exit on reply/meeting/opt-out.

## Anti-patterns

- ❌ Presenting inferred emails as verified contacts.
- ❌ Running email + SMS + calls at the same lead simultaneously.
- ❌ Buying lists with no source tracking and wondering why delivery tanks.
- ❌ Deleting dead leads instead of parking them with history.
