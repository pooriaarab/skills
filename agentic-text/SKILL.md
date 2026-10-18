---
name: agentic-text
description: "Let an AI agent send SMS safely — express opt-in, honor STOP/HELP, quiet hours, per-recipient rate limits, and truthful sender identity. Use when an agent texts a real person on any SMS provider."
---

# Agentic Text (SMS)

**Use when:** an autonomous agent sends text messages to a real person. This skill is a **design pattern**, not an implementation. Numbers come from `agentic-number`; voice calls live in `agentic-phone`.

## The one rule

> Every message goes to someone who asked for texts, identifies its sender honestly, and can stop them with one word.

## Six invariants (do not ship without all six)

1. **Express opt-in, stored.** The first message to a recipient needs a recorded opt-in (keyword, form, verbal-with-note) with timestamp and source. Informational vs promotional consent is tracked separately where the rules require it.
2. **STOP and HELP are sacred.** `STOP` (and its variants) opts out immediately with confirmation and no further messages, ever, on that number. `HELP` returns sender identity and contact info. Both are handled by the platform layer, never by the model.
3. **Identify every send.** Each message names the sender or program. No spoofed caller id, no lookalike sender names, no "loved one in trouble" framing.
4. **Quiet hours in code.** Sends outside the recipient's local daytime window are queued, not sent — enforced by the scheduler, not requested in the prompt. Urgent transactional traffic uses a separate, narrower path.
5. **Rate limits per recipient.** Cap messages per conversation per day in code. A stuck agent retrying reads as harassment after the third message; the cap makes the fourth impossible.
6. **Send ledger.** Every send appends recipient, opt-in ref, template, outcome (delivered/failed/opt-out), and cost. Opt-outs and failures are first-class entries.

## Minimal shape

```ts
interface TextSend { to: string; optInRef: string; body: string; program: string }
type TextOutcome = 'queued' | 'sent' | 'held-for-quiet-hours' | 'blocked-no-consent' | 'opted-out'
```

Opt-in check → rate-limit check → quiet-hours check → send → ledger append. Any check fails ⇒ named outcome, never a silent drop.

## Anti-patterns

- ❌ Treating "they gave us their number" as consent to market by text.
- ❌ Letting the model interpret STOP ("they said stop calling, but texts are fine").
- ❌ Sending at 2am because the agent works nights.
- ❌ Link-shortened domains that hide the destination.
