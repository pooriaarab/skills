# What else actually moves deliverability

The warm-up program in this skill is one input among several. This is a survey
of the rest, with an honest strength-of-evidence rating for each, because most
published warm-up advice is folklore repeated between vendors who sell warm-up
services.

Ratings used below:

- **documented** — a mailbox provider or standards body states it
- **industry** — widely practised, plausible mechanism, no provider confirmation
- **folklore** — repeated often, mechanism weak or unproven

## Meet the bulk sender requirements before you need to

**documented.** Google's sender requirements are the clearest published bar, and
they are not negotiable once you cross the threshold.

Every sender, at any volume, must have SPF or DKIM, valid forward and reverse
DNS, TLS, RFC 5322-conformant messages, and a spam rate under 0.30%.

Bulk senders — 5,000+ messages a day to Gmail — must additionally have SPF, DKIM
**and** DMARC, with the From: domain aligned to the SPF or DKIM domain. DMARC may
sit at `p=none` to satisfy the rule. Marketing and subscribed mail must support
one-click unsubscribe: both `List-Unsubscribe: <URL>` and
`List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058, RFC 2369).

The spam-rate figure is the one to internalise: **0.30% is the ceiling and 0.10%
is the recommendation**, measured in Postmaster Tools. That is roughly three
complaints per thousand. A warm-up cannot buy headroom against it — the only
thing that keeps you under it is mailing people who want the mail.

Yahoo published a parallel set of requirements on the same timeline. Build to
Google's and you generally satisfy both.

## Google Postmaster Tools

**documented, and the single highest-value item here.** It is the only place you
see Gmail's own verdict: spam rate, domain and IP reputation, authentication
pass rates, encryption, and delivery errors.

Two caveats that catch people out. It reports on a **DKIM-authenticated domain**,
so authentication has to work before you see anything. And it needs volume —
several hundred messages a day to Gmail before most charts populate. A warm-up
at 100/day will show little, which is itself worth knowing before you conclude
the dashboard is broken.

Set it up at the start, not when something goes wrong. The data is not
backfilled.

## Microsoft SNDS and JMRP

**documented, conditional.** Smart Network Data Services reports what Outlook and
Hotmail see from your sending IPs, and the Junk Mail Reporting Program is
Microsoft's complaint feedback loop.

Both are **IP-based**. On a shared provider IP you do not control the IP, cannot
register it, and the data is not yours — so for most people on a managed sending
service these are not available. They matter when you run a dedicated IP.

## Feedback loops generally

**documented.** A feedback loop tells you which recipients marked your mail as
spam so you can suppress them immediately. Yahoo, Microsoft and several others
run them; Google does not offer a per-message FBL, only aggregate rates in
Postmaster Tools.

Acting on an FBL is not optional politeness. A complainer you keep mailing
complains again, and complaint rate is the metric with the hardest threshold
attached to it.

## Authentication beyond the basics

**MTA-STS and TLS-RPT — industry, low effort, do it.** MTA-STS tells sending
servers to require TLS to your domain; TLS-RPT gets you reports when that fails.
The deliverability effect is small. The security effect is real, and both are
static DNS plus a hosted policy file.

**ARC — documented, but not something you deploy.** Authenticated Received Chain
preserves authentication results across forwarding. It matters to the
intermediaries that forward your mail, not to you as the originator.

**DANE — industry, niche.** Requires DNSSEC. Relevant for some European and
government receivers. Not a general deliverability lever.

**BIMI — documented, with a real price.** Your logo beside the message in
supporting clients. It requires DMARC at enforcement (`p=quarantine` or
`p=reject`), and for Gmail a Verified Mark Certificate, which costs real money
annually and needs a registered trademark. Treat it as brand work with a
deliverability side effect, not as a deliverability tactic. It does not rescue a
domain with a bad reputation.

**Read your DMARC aggregate reports.** `rua=` gives you XML from receivers
showing who is sending as your domain and whether it authenticates. This is how
you discover a forgotten system mailing as you, or a subdomain failing
alignment, before a receiver draws its own conclusion.

## Recipient diversity, and why one provider is not enough

**industry, and the most commonly ignored limit.** Every mailbox provider filters
differently. A warm-up measured entirely at Gmail tells you about Gmail.

Plus addressing makes this worse in a way that is easy to miss: `you+a@gmail.com`
and `you+b@gmail.com` are one mailbox at one provider. You get parallel sends and
no diversity at all.

A realistic seed set spans Gmail, Outlook and Hotmail, Yahoo, at least one
corporate Microsoft 365 or Google Workspace tenant — which is what your actual
B2B recipients use — and a regional provider if you sell into one. The corporate
tenant matters most for B2B and is the hardest to arrange, because corporate
filters are stricter and entirely invisible from a consumer seed.

## Engagement, and which signals are worthless

**industry, with a large folklore fringe.**

Receivers weigh things that are hard to fake: replies, a message moved out of
spam, a sender added to contacts, a thread with genuine back-and-forth, and mail
that is opened and not deleted quickly. Conversely, a message deleted unread,
left unopened for a long time, or marked spam counts against you.

What does not help: open-pixel tracking as a reputation signal — it is your
metric, not the receiver's, and image proxying makes it unreliable anyway.
Neither does clicking your own links.

**Reciprocal warm-up networks and mailbox pods are the tactic to refuse.** These
are services where many accounts mail each other, mark everything important, and
drag it out of spam. The mechanism is real, which is exactly the problem: it is
manufactured engagement between accounts with no genuine relationship, it is
detectable as a pattern, and it breaches the acceptable use terms of the mailbox
providers involved. The downside is not a warning — it is the reputation of the
domain you are trying to build. Do not use one, and if a vendor's warm-up product
works this way, that is what you are buying.

The engagement loop in this skill is deliberately narrower: mailboxes the
operator owns, real replies, modest volume, and honest accounting of what that
does and does not prove.

## Domain and IP history

**industry, and cheap to check before you commit.**

Before you build on a domain, check it: how long it has been registered, whether
it was previously used for spam, and whether it appears on the major blocklists
(Spamhaus, SURBL, URIBL among others). A domain bought cheaply on the aftermarket
can arrive with a reputation you did not earn.

Give a domain a little age before its first campaign. A domain registered days
ago is itself a weak negative signal, since throwaway domains are registered and
burnt constantly.

On shared versus dedicated IPs: shared is right for low volume, because a
dedicated IP with too little traffic never establishes a reputation at all.
Dedicated becomes worth it at sustained volume, and then SNDS and IP warming
enter the picture.

## Content and infrastructure hygiene

**industry, mostly obvious once stated.**

Link domains are reputation-bearing. Do not use public URL shorteners — they are
heavily abused and you inherit that. Prefer links on your own domain.

If you use a tracking domain, use a custom one that is yours, not a shared ESP
tracking domain, and ensure it resolves and serves over HTTPS.

Host images somewhere stable and on a domain that is not itself blocklisted.
Keep a real text/plain part alongside the HTML.

Make unsubscribe work and make it obvious. A person who cannot find the
unsubscribe marks you as spam instead, which is the outcome with the hard
threshold attached.

## List hygiene before the first campaign

**industry, high value, do it once properly.**

Verify addresses before the first send — a hard bounce rate that spikes on
campaign one is the fastest way to undo a warm-up. Validation services catch
syntax errors, dead domains and known traps.

Send to your most engaged recipients first, then widen. Suppress non-responders
after a few attempts.

Never buy or scrape a list. Beyond the legal position — and in Canada, CASL makes
this a consent problem before it is a deliverability problem — bought lists carry
spam traps, and a spam trap hit does immediate blocklist damage that no warm-up
undoes.

## Seed-list and inbox-placement services

**industry, useful, not a substitute.** Services like these maintain seed
mailboxes across many providers and report where your mail lands. They give you
the recipient diversity that is otherwise hard to assemble.

Two honest limits. Seed mailboxes have no engagement history, so they do not
predict placement for a real recipient who opens and replies to you. And they
cost money for something you partly get free by seeding your own accounts. Worth
it when you are about to spend real money on a campaign; not worth it to watch a
warm-up tick over.

## What to do first

If you do four things, do these:

1. Meet the bulk sender requirements now, at whatever volume you are at.
2. Turn on Postmaster Tools and read the spam rate against the 0.10% target.
3. Get seed mailboxes at more than one provider, including one corporate tenant.
4. Verify the list before the first real campaign.

Everything else on this page is smaller than any of those.
