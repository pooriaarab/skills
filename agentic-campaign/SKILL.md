---
name: agentic-campaign
description: "Orchestrate multi-channel agent outreach safely — one sequence per recipient, global caps, a kill-switch, and measurement on verified outcomes. Use when an agent coordinates email, text, voice, and mail toward one goal."
---

# Agentic Campaign

**Use when:** an agent coordinates outreach across channels (email, text, voice, mail) toward one goal. This skill is a **design pattern**, not an implementation. Channel rules live in `agentic-email`, `agentic-text`, `agentic-phone`, and `agentic-postcard`; leads live in `agentic-leads`.

## The one rule

> One recipient, one active sequence, one goal. Any reply, meeting, or opt-out stops everything immediately.

## Six invariants (do not ship without all six)

1. **Single active sequence.** A recipient belongs to at most one sequence at a time, enforced by a shared membership check across channels. Entering a new sequence exits the old one.
2. **Global stop signals.** Reply, meeting booked, opt-out on any channel, or complaint exits all sequences within minutes. The check runs before every send, not once a night.
3. **Kill-switch per campaign.** One control pauses every pending send in a campaign instantly. Pausing is a normal operation (used for copy fixes and incident response), not an emergency-only ritual.
4. **Caps compose.** Per-channel caps still apply inside a campaign, plus a per-recipient cross-channel touch cap. A campaign cannot spend what its channels would refuse.
5. **Measure verified outcomes.** Report on replies, meetings, and deliveries reconciled against provider truth — not on sends, opens, or dashboard vanity. Every claim links to its ledger entries.
6. **Campaign ledger.** Sequence entries and exits, per-touch outcomes, cap blocks, and kill-switch uses append per campaign. A post-mortem reads the ledger, not someone's memory.

## Minimal shape

```ts
interface SequenceStep { channel: 'email' | 'text' | 'voice' | 'mail'; waitAfter: string; templateVersion: string }
interface Campaign { goal: string; steps: SequenceStep[]; touchCap: number; state: 'active' | 'paused' | 'ended' }
```

Check membership → check stop signals → check caps → execute step → wait → next step. Any stop signal ⇒ exit all, ledger append.

## Anti-patterns

- ❌ Each channel running its own sequence against the same list.
- ❌ Overnight-batch opt-out processing while morning sends go out.
- ❌ A kill-switch that needs a deploy to take effect.
- ❌ Judging the campaign on send volume instead of verified replies.
