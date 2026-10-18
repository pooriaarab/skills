---
name: agentic-phone
description: "Let an AI agent place and receive voice calls safely — disclosed AI identity, recorded consent, per-call caps, human escalation, and a call ledger. Use when an agent talks to a real person on a voice call on any telephony provider."
---

# Agentic Phone (Voice)

**Use when:** an autonomous agent places or receives a voice call with a real person. This skill is a **design pattern**, not an implementation. Number inventory lives in `agentic-number`; texting lives in `agentic-text`.

## The one rule

> The human on the line knows they are talking to an automated agent, consented to the call, and can reach a person at any moment.

## Six invariants (do not ship without all six)

1. **Disclose up front.** Every outbound call opens by stating it is automated and who it represents. In two-party-consent regions, record only with announced recording and a stored consent record.
2. **Consent before dial.** Outbound calls need prior express consent (or an existing-relationship basis your counsel approves), with timestamp and source. No consent ⇒ no dial, no exceptions for "just this once."
3. **Human escape hatch.** The words "person," "human," "agent," or repeated confusion transfer to a person or schedule a callback. The path is tested, not just documented.
4. **Hard caps in code.** Per-day call caps per recipient, per-campaign totals, and quiet hours live outside the prompt. Exceeding any cap blocks the dial, silently for the recipient, loudly for the operator.
5. **Scoped talk track.** The agent may discuss its task topic only. Payment details, credentials, and unrelated personal data are out of scope — deflect and offer the human path instead.
6. **Call ledger.** Every attempt appends recipient, consent ref, outcome, duration, recording ref, and escalation flag. Failed and unanswered dials are logged too.

## Minimal shape

```ts
interface CallAttempt { to: string; consentRef: string; purpose: string; talkTrack: string }
type CallOutcome = 'connected' | 'voicemail' | 'no-answer' | 'escalated' | 'blocked-by-cap'
```

Consent check → cap check → dial with disclosure → outcome + ledger append. Voicemail never contains sensitive data beyond name and callback number.

## Anti-patterns

- ❌ Cold-calling purchased lists because "the agent is polite."
- ❌ Caps written in the system prompt instead of enforced in code.
- ❌ Recording without announcement where the law requires it.
- ❌ An escalation path that rings a queue nobody staffs.
