---
name: agentic-email
description: "Let an AI agent send email safely — authenticated sending, consent-gated outreach, one-click unsubscribe, bounce handling, and per-domain volume caps. Use when an agent emails a real person from any mailbox provider."
---

# Agentic Email

**Use when:** an autonomous agent sends email to a real person. This skill is a **design pattern**, not an implementation.

## The one rule

> Every message is authenticated, consented, unsubscribable with one click, and traceable to the decision that sent it.

## Six invariants (do not ship without all six)

1. **Authenticate the domain.** SPF, DKIM, and DMARC aligned before the first send, on a sending subdomain separate from corporate mail. Unauthenticated ⇒ no send, so one compromised flow cannot burn the whole domain.
2. **Consent per purpose.** Transactional receipts and marketing outreach are separate consents. The send path checks the right one; marketing without marketing consent is blocked in code.
3. **One-click unsubscribe.** Every marketing message carries a working one-click unsubscribe plus a preferences link. Unsubscribes apply within the send layer immediately, not "within 10 business days."
4. **Bounces retire addresses.** Hard bounces suppress the address after one strike; repeated soft bounces suppress after a threshold. Suppression is permanent until a human re-verifies.
5. **Volume caps per domain.** Per-domain daily caps and ramp schedules for new senders live in code. A new domain at full volume lands in spam and stays there.
6. **Send ledger.** Every send appends recipient, consent ref, template version, and outcome (sent/bounced/unsubscribed/complained). Complaints trigger an immediate per-recipient and per-template review.

## Minimal shape

```ts
interface EmailSend { to: string; consentRef: string; purpose: 'transactional' | 'marketing'; templateVersion: string }
type EmailOutcome = 'sent' | 'blocked-no-consent' | 'suppressed' | 'held-over-cap' | 'bounced'
```

Consent check → suppression check → cap check → send authenticated → ledger append. Complaints and hard bounces update suppression first, ledger second.

## Anti-patterns

- ❌ Warming a domain with the real launch list.
- ❌ "Unsubscribe" that files a ticket for someone to process later.
- ❌ Re-mailing hard bounces because the template changed.
- ❌ Sharing one domain for product mail and cold outreach.
