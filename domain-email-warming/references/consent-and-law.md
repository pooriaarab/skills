# Consent and law

Warming is self-mail between mailboxes you control and raises no consent question. The
outreach it prepares for does. Do not let a warmed domain become the reason someone
skips this gate — landing in the inbox and being allowed to send are different things.

## Canada: CASL

CASL governs commercial electronic messages sent to or from Canada. It is consent-first,
which is stricter than the US position. Three requirements travel together:

**A consent basis.** Either express consent, or implied consent. The route that matters
for business outreach is the conspicuously published business address: if a person has
published their address without a statement refusing unsolicited mail, and your message
is relevant to their role or business, implied consent may apply. Two traps follow from
that. A published address paired with "no unsolicited email" is not consent — it is a
refusal, and it binds. And implied consent expires; express consent generally does not.
Record which basis applies to each contact and when it lapses.

**Identification.** The sender must be identified, with a mailing address and a working
contact method.

**Unsubscribe.** A working opt-out in every commercial message, honoured promptly.

Penalties are assessed per violation and are large enough that this is not a paperwork
concern. Build the gate into the sending path rather than the campaign checklist: a
refusal at send time is the only control that cannot be forgotten.

A reference implementation of that gate: IMECore's outreach path refuses to send unless
the recipient is a known contact with a live consent basis, is absent from an address
and domain suppression list, has no no-solicitation flag, and is under a hard daily cap.
Every check fails closed, and a missing gate is itself a refusal rather than a bypass.

## Other jurisdictions, briefly

- **United States (CAN-SPAM).** Opt-out rather than opt-in. Requires honest headers and
  subject lines, a physical postal address, and opt-out honoured within ten business days.
- **EU and UK (GDPR, PECR).** Consent-first for most marketing to individuals, with a
  narrow legitimate-interest route for some B2B. Treat an EU recipient as consent-first
  unless someone competent has said otherwise.

Recipient location decides which regime applies, not yours.

## Two things that look like tactics and carry obligations

**Contests and giveaways.** A promotional contest is regulated separately from email
law, with its own rules about disclosure and, in Quebec, additional requirements. A
contest email is also unambiguously a commercial electronic message, so it needs full
CASL treatment. Fine as a warm-up format test to your own mailboxes; not something to
improvise at a real list.

**Newsletter signups as warm-up.** Subscribing a warm-up mailbox to legitimate industry
newsletters, and confirming the double opt-in, does generate genuine inbound mail and
makes a mailbox look used. It is legitimate — you are subscribing yourself. Two cautions:
it puts the address on third-party lists you will have to unsubscribe from later, and
the inbound mail is bulk, which shapes the mailbox's profile. Subscribe deliberately to a
handful of relevant publications; do not bulk-subscribe to inflate a number.

## The line this skill will not cross

Warm-up establishes a truthful sending history for a domain that intends to send real
mail. It is not a way to make an unwanted campaign deliverable, and it will not survive
being used that way: complaint rates move faster than reputation recovers. If the plan is
to warm a domain and then mail a purchased list, the warm-up is wasted effort and the
domain is burnt within days. Say so plainly rather than building it.
