---
name: agentic-postcard
description: "Let an AI agent send physical postcards safely — verified addresses, human-approved creative, per-batch spend caps, and delivery tracking. Use when an agent mails a real card through any print-and-mail provider."
---

# Agentic Postcard (Direct Mail)

**Use when:** an autonomous agent sends a physical postcard or letter to a real address. This skill is a **design pattern**, not an implementation. Address quality lives in `agentic-address`.

## The one rule

> Ink costs money and cannot be unsent. A human approves what prints, and only verified addresses receive it.

## Six invariants (do not ship without all six)

1. **Verify before print.** Every address passes verification (see `agentic-address`) before entering a batch. Unverifiable ⇒ held for review, never mailed on hope.
2. **Human approves the creative.** Front, back, offer, and fine print get a human sign-off per template version. The agent fills fields; it never redesigns the card or invents the offer.
3. **Spend caps per batch.** Per-piece cost × quantity is computed before ordering, against a per-batch and per-campaign cap enforced in code. Over cap ⇒ the batch waits for a human.
4. **No sensitive content by mail.** Credentials, full account numbers, and health or financial details never go on a postcard. Sensitive mail uses a sealed-letter path or no mail at all.
5. **One send per trigger.** Idempotency keys on recipient + campaign + trigger event. Retries and duplicate events never double-mail; reprints need explicit approval.
6. **Delivery ledger.** Every piece appends recipient ref, template version, approver, cost, mail date, and tracking outcome (including returns). Returns feed back into address quality.

## Minimal shape

```ts
interface MailPiece { to: AddressRef; templateVersion: string; approver: string; idempotencyKey: string }
type MailOutcome = 'queued' | 'held-unverified-address' | 'held-over-cap' | 'mailed' | 'returned'
```

Verify address → check caps → confirm approval → order with idempotency key → ledger append → track returns.

## Anti-patterns

- ❌ Mailing an imported list without verification ("the spreadsheet had zips").
- ❌ Letting the agent write the offer copy unsupervised.
- ❌ No idempotency key, so a retried webhook mails twice.
- ❌ Ignoring returns instead of suppressing bad addresses.
