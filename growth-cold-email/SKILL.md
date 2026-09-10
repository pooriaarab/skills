---
name: growth-cold-email
description: "Stand up cold email for a product without burning the domain that carries your transactional mail or breaking anti-spam law — the CASL implied-consent basis a conspicuously published business address gives you and the three things that expire it, the identification/mailing-address/unsubscribe trio every commercial message must carry, why transactional-versus-bulk is a provider TERMS question rather than a technical one (and why the asymmetric downside is losing appointment reminders, not marketing), separate sending domain versus subdomain, verifying a list before the first send with real hit rates and per-address cost, why named addresses beat role addresses and how that ratio moves with market size, suppression that survives a contact merge, and three-touch sequences. Use when setting up cold outreach, choosing a sending domain or ESP, writing a first campaign, deciding whether a send is transactional or bulk, or debugging a list that bounces. Pairs with growth-prospect-list (building the list) and growth-cold-calling (the phone channel, whose consent rule is the inverse)."
---

# growth-cold-email

Cold email fails in two ways that look nothing alike. Either you break a law and find out from a regulator, or you burn a sending reputation and find out from silence. Both are cheap to avoid at setup and expensive afterwards.

This skill is the setup. `growth-prospect-list` builds the list; `growth-cold-calling` covers the phone, whose consent rule runs the opposite direction.

## Get the legal floor right first, because it shapes the list

**Canada (CASL) is consent-first.** You may not email a business address merely because you found it. You need a basis, and the usual one is **implied consent from a conspicuously published address**, which requires all three:

1. the address is published somewhere public,
2. the message is **relevant to that person's role**, and
3. the page carries **no statement refusing unsolicited messages**.

That third condition is absolute. A "no unsolicited email" line on a contact page removes implied consent no matter how well the other two fit.

Implied consent **expires**: six months from an enquiry, two years from an existing business relationship. Express consent does not expire. Record which one you hold per contact, with the URL you saw it on and the date you saw it, or you cannot answer the question months later when it matters.

**Every commercial message must carry three things**, and this is where hand-written drafts usually fail:

- who is sending it, identified,
- a **physical mailing address**,
- an **unsubscribe mechanism** that is clearly set out and readily performed.

A friendly "reply if you'd rather I didn't" is defensible at 20 recipients and is not an unsubscribe mechanism at 500. Penalties reach $1M for an individual and $10M for an organisation, so treat the trio as non-negotiable rather than as footer decoration.

**The United States (CAN-SPAM) is opt-out.** You may send without prior consent, but you still need a valid physical postal address, a working opt-out honoured within 10 business days, and a non-deceptive subject line. If your list crosses the border, build to CASL — it is strictly stricter, so one build covers both.

Neither regime cares that a human typed the message. Substance decides.

## Transactional versus bulk is a terms question, not a technical one

Most sending platforms split their terms:

> Email Service is for transactional email, triggered by user actions: signups, password resets, order confirmations. Marketing and bulk campaigns are not permitted.

Whether your outreach is technically *possible* on that platform is irrelevant. It usually is. The question is whether it is *permitted*, and the answer is normally no.

**The downside is asymmetric, and this is the part teams miss.** The transactional stream is not a marketing channel you can afford to lose. It carries password resets, appointment reminders, receipts, delivery of the thing the customer paid for. If a provider judges your outreach to be a campaign and suspends the service, you lose *that*, not the campaign.

So the rule is not "will they notice". It is: **never put the transactional stream at risk for an outreach channel.**

Three honest positions on a borderline send:

| Shape | Verdict |
|---|---|
| A human replies to someone who wrote in | Transactional in character. Fine on a transactional provider. |
| A human researches one company and writes it a genuinely different message, a few a day | Defensible. Not a campaign. |
| One template, a recipient list, sent by a script | A campaign, at any volume. 19 identical sends is a campaign of 19. |

Volume is not the test. **One message to many** is the test.

## Separate the sending identity

For anything in the third row, send from an identity that is not your transactional one.

- **A separate registrable domain** is the safe default. Own SPF, DKIM and DMARC, no shared reputation.
- **A subdomain** insulates less than people assume. Mailbox providers do evaluate subdomain reputation separately to a degree, but the organizational domain shares signal, and your DMARC policy usually lives at the apex.
- A subdomain **on the same provider** insulates nothing at all against the terms problem. The terms attach to the account, not the hostname. This is the most common wrong turn: teams reach for a subdomain thinking it solves a rules question when it only ever addressed a reputation question.

Warm a new sending domain before volume: a few messages a day, climbing over two to three weeks. A new domain sending 500 on day one looks exactly like a spammer, because that is what spammers do.

## Verify the list before the first send, not after

Scraped addresses rot. A hard bounce rate above roughly 3% on a new sending domain starts costing you reputation, and a new domain has none to spare.

Verification costs about **$0.0015 to $0.002 per address** through the cheap providers, so a 60-address list costs about a dime. There is no economic argument for skipping it.

A real result from a 60-address hand-built B2B list:

| Verdict | Count | What to do |
|---|---|---|
| `ok` | 48 | Send. |
| `catch_all` | 6 | Domain accepts everything; deliverability unknowable. Send only if the contact is valuable, and never in the first warming batch. |
| `unknown` | 4 | Treat as catch-all. |
| `invalid` | 2 | Drop. These would have hard-bounced. |

Two dead addresses in 60 is a 3.3% bounce rate — right at the threshold, from a list that looked fine. That is the entire argument for verifying.

Also read the **role flag**. Of the 48 deliverable addresses above, 24 were `info@` or `reception@`. They deliver and they do not convert, because nobody owns them. Count your list in named contacts, not rows.

## Named addresses, and where they live

A named person's published address is worth roughly ten role addresses, because nobody owns a role address. So count a list in named contacts, not rows.

Where those named addresses live is worth measuring per market rather than assuming. Three samples from one profession, one research method, three regions:

| Sample | Rows | Named address |
|---|---|---|
| Large metro | 68 | 38% |
| Regional, same province | 40 | **55%** |
| Regional, other provinces | 51 | 35% |

The obvious story — smaller markets publish more — fits the first two and **fails on the third**. Treat "where do named addresses live" as a hypothesis you test with a cheap sample per market, not a rule you plan around. Two confounds to rule out before believing any such pattern: different researchers produce different hit rates on the same brief, and professional norms vary by province or state more than by city size.

What survives all three samples is the actionable part: **a segment that comes back mostly role addresses is a phone segment.** Do not read it as failed research, and do not send to `info@` in volume hoping it works. Go find that buyer on the channel where they are reachable, which `growth-cold-calling` covers.

## Suppression must outlive the contact record

Someone asks you to stop. That fact has to survive everything that happens to your CRM afterwards.

**Do not store it as a flag on the contact row.** Contacts get merged and deleted. A flag carried on the losing row of a merge disappears, and then ordinary housekeeping — deduplicating two records of the same person — silently re-enables mail to someone who opted out. That is a breach produced by tidying up.

Store suppression in its own table, keyed on the normalised address, **with no foreign key to the contact**:

- scope `address` or `domain` — an office manager can say "nobody at this firm", and you need somewhere to put that,
- source: reply, click, phone call, complaint,
- the verbatim evidence, not a paraphrase,
- insert-only. Suppression never expires and is never edited.

**Enforce it in the query, never in a template.** One exported helper that returns only contactable people, filtering suppression and consent together. A condition inside an email template is not a control, because the next template will not have it. Test it as an anti-join: suppress a domain, then assert a contact added to that domain *afterwards* is still excluded.

Normalise addresses through **one** function shared with your identity layer. Two normalisers that disagree is precisely how a suppressed address receives mail.

## Three touches, then stop

A seven-step sequence to a professional is how you get reported.

1. **Day 0** — a question, not a pitch. Ask about the problem you solve and shut up. The best cold email is short enough that the reply is shorter.
2. **Day 5** — send something with standalone value. A free tool, a benchmark, a number they can use whether or not they reply. Do not "bump" the thread.
3. **Day 12** — one line closing the loop, with an explicit out.

Then stop, permanently, and record that you did.

Keep the message under about 75 words. Give exactly one call to action. Ask a question they can answer in a sentence from their phone.

**Do not invent credibility.** A new company has no customers, no case studies and no numbers. Every metric you could add is either the market's pain (not your proof) or fabricated. Fabricating one to a professional buyer — a lawyer, an accountant, a doctor — ends the relationship, because checking things is their job. Specificity substitutes for proof: a real street address, a real named person, a real thing you can do this week.

## Measure four things

- **Reply rate**, not open rate. Open tracking is a pixel that increasingly does not fire and correlates with nothing you can act on.
- **Bounce rate**, per send, as a reputation alarm rather than a report.
- **Positive-reply rate** separately from total replies. "No thanks" is a reply.
- **Suppression requests.** A rising rate means the targeting is wrong, and it is the only metric that gets you shut down.

Log the send against the contact record so the second touch knows the first one happened. If the log lives in a spreadsheet and the contacts live in a CRM, the two will disagree within a week — and the disagreement always surfaces as a duplicate message to someone who already said no.
