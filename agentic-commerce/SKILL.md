---
name: agentic-commerce
description: "Design pattern for letting an AI agent acquire paid services/goods safely — a human approves every spend, hard caps live outside the prompt, payment rails are capability-routed and inert-by-default, and credentials come from a selected integration (never env, never leaked). Covers the 2026 rails: x402, MPP, Stripe SPT/Link, Stripe Issuing, Stripe Projects, browser-checkout fallback."
---

# Agentic Commerce

**Use when:** building a feature where an autonomous agent needs to *buy* something — subscribe to a SaaS tool, pay a per-call API, purchase goods — and you must keep a human in control of the money.

This skill is a **design pattern**, not an implementation. It encodes the invariants that make agent purchasing safe to ship.

## The one rule

> The LLM proposes a purchase. **Hardware/code/humans dispose.** Nothing spends without a human approving *that specific spend*, and nothing exceeds a limit enforced *outside the prompt*.

## Six invariants (don't ship without all six)

1. **Gate every spend.** The agent gets exactly one spend tool (e.g. `request_purchase`). It does not call a provider SDK directly. The tool creates a *pending intent* and **pauses the run for human approval** (Slack card, web thread, whatever your surface is). Execution only happens on the approved re-invocation. An agent must **not be able to approve its own purchase** — a direct call always routes to the real approval gate; only a genuine human approval flips it to an auto-approve context.

2. **Hard backstops live in code, not the prompt.** A misbehaving or jailbroken model must still be unable to overspend:
   - a per-agent + global **budget cap** checked in code before execution (and **re-checked at execution time** — the kill-switch could flip or budget exhaust between approval and execution: guard the TOCTOU window);
   - the provider's own **spend controls** (e.g. per-authorization + monthly caps, merchant lock on an issued card);
   - a **kill-switch** that freezes all spend.

3. **Capability-routed rails.** Don't make the agent pick a payment method. A router tries rails in priority order and uses the first that *supports* the purchase. Typical 2026 ladder:
   `x402 / MPP (pay-per-call 402)` → `Stripe Projects (provision SaaS + sync creds)` → `Stripe SPT/Link or Issuing (card)` → `browser-checkout (fallback for the long tail)`.

4. **Inert by default / fail-closed.** Every rail is dormant until real funding is wired. No credentials configured ⇒ `supports()` is false and `execute()` throws — never a silent no-op, never a default that spends. The whole system should refuse and fail closed in production until explicitly funded.

5. **Credentials come from a selected integration — never env, never hardcoded.** Users often have *multiple* connections of the same provider (two Stripe accounts, several wallets). Resolve the funding credential from the **specific integration the operator selected** (by id), so you never accidentally charge the wrong account. Never read a global env key for spend.

6. **Never leak secrets; keep an append-only ledger.** Card PANs/CVCs and payment tokens stay inside the gateway/vault — never returned, persisted, or logged (store only id/last4/refs). Every intent (including **denied** and **failed**) appends to an un-purgeable ledger with vendor, amount, rail, approver, and receipt — your audit trail.

## Minimal shape

```ts
type PurchaseStatus = 'pending' | 'approved' | 'executing' | 'executed' | 'denied' | 'failed'

interface PurchaseIntent {
  id: string; agentId: string; vendor: string
  amountCents: number; currency: 'usd'; recurring: boolean; reason: string
  status: PurchaseStatus; rail?: RailId; approverId?: string; receiptUrl?: string
}

interface Rail {
  id: RailId
  supports(intent): Promise<boolean>          // cheap, no side effects
  quote(intent): Promise<Quote>               // price/terms for the approval card; no spend
  execute(intent, ctx): Promise<Result>       // spend exactly once; returns refs, never secrets
}
```

Router = first rail whose `supports()` is true. Status machine guards idempotency: `pending→approved→executing→executed|failed`, or `pending→denied`. A terminal status can never re-execute (no double-charge on duplicate approval clicks).

## The 2026 rails (what each is for)

| Rail | Mechanism | Notes |
|---|---|---|
| **x402** (Coinbase) | Pay an HTTP-402 challenge inline from a stablecoin/USDC wallet | No card/checkout/API key. Self-serve on testnet. |
| **MPP** (Machine Payments Protocol, Stripe+Tempo) | HTTP-402 auth scheme (IETF draft); payment-method-agnostic | Official TS SDKs; sibling to x402. |
| **Stripe SPT / Link** | Shared Payment Token or one-time card, scoped by amount/merchant/time, revocable | The agent-card path; tends to be self-serve. |
| **Stripe Issuing** | Mint a capped, merchant-locked virtual card | Hard spend controls; often requires sales enablement (not in sandboxes). |
| **Stripe Projects** | Provision a SaaS/cloud service + auto-sync credentials | Best for "agent signs up for a tool." CLI/beta — check for a callable API before assuming. |
| **browser-checkout** | Drive a browser to a normal web checkout using an issued card | Last-resort fallback for the long tail. |

## Before you wire a "live" rail

- **Verify the provider has a callable API** for your use case before building a full rail. Some agentic-commerce products ship as a CLI or closed beta with no server-side API yet — build the rail *inert* and mark the live seam rather than inventing an SDK method.
- **Confirm enablement is self-serve.** Some rails (e.g. card issuing) require provider approval / aren't available in sandboxes. Know this before promising a live demo.
- **Test mode / testnet first.** Build against test keys / testnet funding with a pluggable funding source; flip to real money only after the approval + cap + ledger loop is proven end-to-end.

## Anti-patterns

- ❌ Giving the agent raw provider SDK access (it can spend without a gate).
- ❌ Budget checks that live only in the system prompt ("don't spend over $X") — a jailbreak erases them.
- ❌ A global env key for funding (charges the wrong account; can't support multiple connections).
- ❌ Returning/logging the PAN or payment token.
- ❌ A rail that silently no-ops when unfunded instead of failing closed.
- ❌ Re-executing on a duplicate approval click (no idempotent status guard).
