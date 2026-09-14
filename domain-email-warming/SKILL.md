---
name: domain-email-warming
description: "Warm up a domain and its mailboxes so cold outreach reaches the inbox instead of spam, and prove it with measured placement rather than send receipts. Covers authentication preflight (SPF, DKIM, DMARC, return path, subdomain alignment), a volume ramp across several mailboxes and sending subdomains, a two-way engagement loop that reads, rescues and replies on the receiving side, and per-format testing so you know whether plain, HTML, logo and newsletter shapes all land. Use when preparing a new or quiet domain for outreach, standing up a sending subdomain, diagnosing mail that lands in spam or Promotions, or before a first cold-email campaign. Includes warmctl, a Node CLI. Skip for one-off transactional sends on an established domain."
---

# Domain Email Warming

A domain that has never sent mail has no reputation. The first hundred cold messages
from it are judged on nothing, and receivers resolve nothing to spam. Warming builds
that record deliberately: a small, growing volume of real correspondence that gets
opened and replied to, from mailboxes you control, measured at the destination.

**The rule that governs this skill: a send receipt is not a result.** Every provider
will tell you a message was accepted. None of them will tell you it reached the inbox.
If you are not reading the delivered message on the receiving side, you are not warming
a domain, you are generating traffic and hoping.

## Be honest about what warm-up does and does not buy

State this to the user before they spend weeks on it.

**It helps with:** establishing a sending history so volume is not itself suspicious;
proving your authentication works before real prospects see it; finding out which
message formats get filtered; building engagement signals (opens, replies) that
receivers weigh heavily.

**It does not fix:** bad list quality, irrelevant messages, or a domain with an
existing bad reputation. Warm-up is not a laundering step. A domain warmed for a month
and then used to blast a purchased list is back in the spam folder within days.

**Its main limit:** warming to mailboxes you own at one provider measures one
provider. Gmail's verdict tells you little about Outlook or a corporate filter. Plus
addresses (`you+tag@gmail.com`) all land in one mailbox, so they give you parallel
sends, not recipient diversity. Say so rather than implying broader coverage.

## The procedure

### 1. Preflight before a single message goes out

Warming a domain that fails authentication is worse than not warming it: you pay to
teach every receiver that your domain sends unverifiable mail.

```bash
node scripts/warmctl.mjs preflight --config <config>.json
```

Fix every FAIL first. See [references/authentication.md](references/authentication.md)
for what each check means, and for the DMARC inheritance trap that silently kills a new
sending subdomain.

### 2. Decide the sending identities

Warm the mailboxes you will actually send from — `hello@`, a founder address, the
address outreach replies to. Spreading volume across several mailboxes is closer to how
a real company sends than funnelling everything through one.

**On sending subdomains:** a separate subdomain (`mail.example.com`) isolates outreach
reputation from transactional mail, so a spam complaint on outreach does not put
password resets at risk. The cost is that it starts from zero reputation and must be
warmed separately. A subdomain is usually send-only — it has no inbound route — so give
every subdomain identity a `replyTo` on the apex domain, or replies bounce.

### 3. Ramp the volume

```bash
node scripts/warmctl.mjs plan --config <config>.json          # inspect
node scripts/warmctl.mjs send --config <config>.json --apply  # send
```

Start small, grow gradually, never step. The shape of the curve matters less than the
absence of jumps. [references/ramp-and-volume.md](references/ramp-and-volume.md) covers
sizing and why most of each day must go to a mailbox you can read.

### 4. Close the loop on the receiving side

This is the step people skip, and it is the one that does the work.

```bash
node scripts/warmctl.mjs engage --config <config>.json --apply
```

For each delivered message it records where the message landed, pulls it out of spam if
it is there, marks it read, and replies to a share of them. Rescuing from spam tells the
provider its classification was wrong. A reply is the strongest positive signal a
mailbox can produce. See
[references/placement-measurement.md](references/placement-measurement.md).

### 5. Read the result, per format

```bash
node scripts/warmctl.mjs report --config <config>.json
```

Formats are filtered differently, so the tool sends several shapes and reports each
separately. From a real day-one run on a freshly warmed domain:

```
by format variant
  plain        100% primary       primary:4
  html_simple  100% primary       primary:3
  html_logo    67% primary        updates:1  primary:2
  html_rich    67% primary        primary:2  updates:1
  newsletter   0% primary         updates:3
```

The gradient is the point. Nothing was marked spam, so a naive "delivered" check would
have called this a total success — while the broadcast-shaped message, the one that most
resembles real outreach, never reached the Primary tab once. Test the shape you intend
to send, not a plain-text stand-in for it.

## Consent is a separate gate, and it is not optional

Warming is self-mail and raises no consent question. The outreach it leads to does.
In Canada, CASL governs commercial electronic messages and requires a consent basis,
sender identification and a working unsubscribe — with penalties that apply per
message. Do not let a warmed domain become the reason someone skips that gate.
[references/consent-and-law.md](references/consent-and-law.md) has the specifics.

## Provider terms

Check the sending provider's terms before running warm-up through it. Cloudflare Email
Service, for instance, is documented as transactional-only, and the same account often
carries real transactional mail. If the provider suspends sending, the penalty lands on
that stream, not on the warm-up. Keep warm-up volumes modest and the content genuinely
1:1, or use a provider intended for bulk.

## The toolkit

`scripts/warmctl.mjs` — Node 22, no dependencies, one JSON config, one JSON state file.
Everything that sends, replies or changes DNS is a dry run unless you pass `--apply`.

| Command | Does |
|---|---|
| `preflight` | SPF, DKIM, DMARC, MX per sending domain, against authoritative nameservers |
| `plan` | The day's schedule, without sending |
| `send` | The day's messages, idempotent within a day |
| `engage` | Classify placement, rescue from spam, mark read, reply |
| `report` | Placement overall, by day, and by format variant, plus provider quota |

Configure with `examples/imecore.warmup.json` as the template. The Cloudflare adapter is
one file (`scripts/lib/cloudflare.mjs`); another provider means replacing that file, not
the tool.

## Related

- `cloudflare-email-service` — provider setup, routing, and the sending REST API.
- `growth-cold-email` — the campaign this warm-up is preparing for.
- `lifecycle-email` — classifying transactional against marketing mail.
