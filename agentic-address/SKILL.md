---
name: agentic-address
description: "Keep physical addresses trustworthy for agents — parse, verify, standardize, and mark honest undisclosed states instead of inventing contact facts. Use when any agent stores or mails to a real-world address."
---

# Agentic Address

**Use when:** an agent stores, displays, or mails to a physical address. This skill is a **design pattern**, not an implementation. It feeds `agentic-postcard`, `agentic-crm`, and `agentic-leads`.

## The one rule

> An address is either verified or explicitly marked unverified. There is no third state, and nothing mails to the second one without review.

## Five invariants (do not ship without all five)

1. **Parse then verify.** Split free text into structured fields (street, unit, city, region, postal, country) first, then verify against a postal reference. Verification confirms deliverability, not just formatting.
2. **Standardize on write.** Store the verified canonical form, keep the raw input alongside it. Display and mail use the canonical form; debugging uses the raw.
3. **Honest undisclosed states.** Missing unit numbers, PO-box-only towns, and "address on file" placeholders render as what they are ("suite unknown"), never as a plausible-looking invention.
4. **Verify once, reuse everywhere.** One verification service behind one cache with TTL. Every feature reads the cached verdict instead of re-verifying (and re-paying) per send.
5. **Returns close the loop.** Undeliverable mail flips the address back to unverified and suppresses it until re-verified. A second return from the same address needs human eyes.

## Minimal shape

```ts
type AddressState = 'verified' | 'unverified' | 'suppressed'
interface StoredAddress { raw: string; canonical?: string; state: AddressState; verifiedAt?: string }
```

Parse → verify → store canonical + raw → mail only `verified` → returns demote to `unverified`/`suppressed`.

## Anti-patterns

- ❌ Regex-validating a postal code and calling the address verified.
- ❌ Filling a missing suite number with a guess so the form "completes."
- ❌ Verifying per feature so five teams pay for the same lookup.
- ❌ Re-mailing a returned address because "the resident probably moved back."
