---
name: agent-guardrail-review
description: "Use when reviewing code that lets an AI agent act for a person: browser automation, approval gates, spend caps, credential lending, connectors, audit logs, or payments. A checklist of the boundary bugs an independent review found in almost every one of 19 agent repos: an approval that does not bind the action that runs, zero-approval data exfiltration after the agent reads private data, a secret header carried across a redirect, a container escape through WebRTC, a guard that fails open, and parsers that disagree. Also covers how to run the review so it finds them. Triggers: 'review my agent', 'security review of the approval gate', 'can the agent leak data', 'prompt injection review', 'review browser automation code', 'human in the loop review'."
---

# agent-guardrail-review

An agent that acts for a person has boundaries: what the person approved, what
data may leave, which host gets a secret, which tab is isolated. Tests written
by the builder check that the boundary works. They rarely check that it holds
when a page, a race, or a crash pushes on it.

An independent review of 19 agent repos found a real Major or Critical bug in
nearly every one. The bugs fell into the groups below.

## Run the review

1. **Use a reviewer that did not write the code.** A different model, or a
   fresh session with no build context. Give it the README, the failure-modes
   list, and this checklist.
2. **Attack each boundary in the real runtime.** A bug like a WebRTC escape
   only shows in a real browser with a probe server that logs every request.
3. **For each finding, write the failure mode and a failing test first.** Then
   fix it. The history then shows the test was red before the fix.
4. **Rate each finding.** Critical: data leaves or money moves with no
   approval. Major: a boundary holds only in the happy path.

## The checklist

### Approvals bind the exact action

- The approved action is the action that runs. Bug found: the person approved
  a click on control `0:12` ("Next"). The page changed while the approval
  waited, `0:12` became "Delete account", and the gate redeemed the same id.
  Fix: capture the target (snapshot id, role, label, URL) before the gate,
  approve that, and refuse `stale` when it no longer matches.
- The approval shows the whole action. Bugs found: long typed values cut
  short; the phone card led with the planner's summary instead of the exact
  tool, host, and arguments.
- One answer decides one request, once. With two channels (sidebar and phone),
  the first answer wins and a later one is late. A replayed answer fails. No
  answer means no at expiry. If the audit write fails, an approve becomes no.

### Private data cannot leave without an approval

- Bug found: a run read the user's mail, then a page told the planner to put
  it in an `open_url` query or a typed field. No step needed an approval.
  Fix: after any tool returns private data, every outbound step (open a URL,
  type, submit) needs an approval for the rest of the run.
- A consent covers the host it was given for, not every host. A lent login
  works only while the loan is active and only on the lent site.
- Page text goes to the planner only inside data delimiters. This includes
  the evidence of a failed check, which is page text too.

### Secrets reach only their host

- Bug found: a custom auth header followed a cross-origin redirect to another
  host. Fix: strip each secret header from any request its rule does not
  allow, also while the vault is locked and nothing is being added.
- Use `redirect: "manual"` for requests that carry a payment or a token.
- No token in errors, logs, stored state, or tool results.

### Isolation has no side door

- Bug found: WebRTC escaped a browser container. UDP to a STUN or TURN server
  passes neither `webRequest` nor `proxy`. Fix: turn off peer connections
  while the isolated task runs.
- Check every channel the filter does not see: preconnect, DNS prefetch,
  service workers, beacons, WebSocket.
- A guard that throws, or loses its permission, lets traffic pass. Make each
  one fail closed, and refuse to start when a setting cannot be applied.

### State survives crashes and races

- Write the intent before the side effect. Bug found: a grant was created,
  then the process stopped before the record held its id, so the grant stayed
  with nothing to revoke it.
- A payment runs once across retries, races, and restarts.
- Undo paths restore every setting they changed, also when no task is left.

### Parsers agree

- Bug found: an audit log line with a repeated JSON key read differently in
  two parsers, so forged data could hide in it. Reject repeated keys at any
  depth, also when spelled with escapes (`"a"` and `"a"`).

## Related

- [browser-extension](../browser-extension/SKILL.md) — Firefox container and
  network facts behind the isolation items.
- [agentic-commerce](../agentic-commerce/SKILL.md) — the buy side behind an
  approval gate.
