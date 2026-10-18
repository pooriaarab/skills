---
name: agentic-number
description: "Manage the phone-number inventory behind agentic-phone and agentic-text — acquire, configure, and release numbers from code with capability checks and an ownership ledger. Use when an agent needs a real calling or texting number (the numbers.ts module inside a phone suite)."
---

# Agentic Number

**Use when:** an agent needs a real phone number to call or text from. This is the inventory module inside a phone suite: `agentic-phone` covers voice behavior, `agentic-text` covers SMS behavior. This skill covers the numbers themselves. A **design pattern**, not an implementation.

## The one rule

> Every number in service is acquired deliberately, configured for exactly the capabilities it uses, and releasable without stranding conversations.

## Five invariants (do not ship without all five)

1. **Inventory in code.** Numbers live in a queryable store (number, capabilities, owner, campaign, status), not in one engineer's head or a provider dashboard nobody audits. Acquire and release go through code.
2. **Capability check before use.** Voice needs a voice-enabled number, SMS needs an SMS-enabled one, in the right region. The send/dial path verifies capability at runtime and fails closed on mismatch.
3. **Warm up before volume.** A fresh number starts with low, human-like volume on its intended channel and ramps on a schedule. A new number blasting day one gets flagged by carriers.
4. **Release cleanly.** Releasing a number first drains it: stop new outbound, finish in-flight conversations, keep inbound routed for a grace window, then release. Never release mid-conversation.
5. **Ownership ledger.** Every number maps to one owner and one purpose at a time. Reassignment is explicit, logged, and clears the previous purpose so replies never leak across campaigns.

## Minimal shape

```ts
type NumberStatus = 'provisioning' | 'warming' | 'active' | 'draining' | 'released'
interface ManagedNumber { e164: string; capabilities: ('voice'|'sms')[]; owner: string; purpose: string; status: NumberStatus }
```

Acquire → configure capabilities → warm → active. Release = active → draining → released, never directly.

## Anti-patterns

- ❌ Sharing one number across campaigns (replies cross-contaminate).
- ❌ Texting from a voice-only number and debugging the silent failure for a day.
- ❌ Releasing a number the hour a campaign ends while replies are still arriving.
- ❌ Buying numbers by hand in a dashboard with no record of why.
