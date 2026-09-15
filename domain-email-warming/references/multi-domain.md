# Warming many domains at once

This page covers running the warm-up across a fleet of domains on one account,
after the single-domain procedure in the skill is already working. It is for the
operator who sets up and runs the fleet. Every finding below comes from a run
across fifteen domains and 450 mailboxes, and each one cost a failure or a near
miss.

## One config and one state file per domain

A fleet is fifteen independent warm-ups, not one warm-up with fifteen names in
it. Each domain gets its own config file and its own state file, so its day
index, send counts, slots and placement history belong to it alone.

The runner loops over the configs, and a failure in one domain must not stop
the rest. A domain whose DNS is half-propagated, whose credentials lapsed, or
whose send fails for any reason logs its error and the loop moves on. The
alternative is that the least healthy domain sets the pace for all fifteen: one
bad config silences fourteen good domains, and because a stalled warm-up
produces no error anywhere the operator looks, the outage reads as a fleet that
never warmed rather than a single domain that needs attention.

## Program names must be unique per domain, not per label

The state file and the credential copy are named after the program, so two
domains that resolve to the same program name share one state file. Deriving
the name from the second-level label does exactly this: popcornteam.ai,
popcornteam.com and popcornteam.org all collapse to one name.

Three domains would then write their send counts, day indexes, slots and
placement history into the same file, each overwriting the others. Day indexes
drift, idempotency breaks, and the report for any one of them describes none of
them. The symptom is invisible because it looks like files working normally: a
config silently overwrites its neighbour, and nothing errors.

Name the program after the full domain, dots included or converted. Check the
generated filenames for collisions before the first send, especially across
domains that share a second-level label under different suffixes.

## The schedule must cover the whole send window

The ramp spreads each day's messages across a twelve-hour window with jitter,
and each hourly pass sends only the slots that are due. A cron entry that runs
twice a day does not run the same schedule less often; it runs a different,
broken one.

Every slot scheduled after the last run of the day sits unsent when the day
index rolls over, and the next day's plan never retries it. Those sends do not
fail visibly. They are stranded: planned, counted nowhere, and gone. A day that
should have trickled out across the afternoon and evening instead sends its
morning fraction and loses the rest, day after day.

Run the sweep hourly through the window, and make sure there is a pass near the
end of it. The late pass exists to catch the last slots before the day rolls
over. Confirm from the log that the late pass actually fired; a crontab entry
proves a job is scheduled, not that it ran.

## Cloudflare Email Routing cannot be enabled through the API with a scoped token

Enabling Email Routing with `POST /zones/{id}/email/routing/enable` answers
"Authentication error" for a scoped token that holds Email Routing Rules Write,
and there is no permission group that grants it. The endpoint wants an
authority the scoped token cannot carry, so scripting the enable step as
documented fails no matter which plausible permission is added.

The feature itself does not need that endpoint. Email Routing works from three
things a DNS Write token can create: the MX records pointing at Cloudflare, the
SPF record, and the routing rules with their destination addresses. Set those
three through the API and routing functions without ever calling enable.

This was verified, not assumed. A message sent to a domain set up this way,
with the enable call never made, forwarded to its destination in about twenty
seconds. Document a workaround only when a probe like that has confirmed it;
an untested assumption about mail flow is how a fleet of domains silently
receives nothing.

## Registering a sending domain rewrites _dmarc to p=reject — back it up first

Registering a domain as a Cloudflare sending domain publishes a `_dmarc`
record with `p=reject`. On a domain with no mail flow that is the correct end
state. On a domain whose real mail flows through Zoho, Hostinger or Google and
does not align with the new setup, tightening an existing `p=none` to `p=reject`
can start rejecting that domain's legitimate mail the moment the record is
published.

Read and store the existing DMARC record before registering, and restore it
afterwards. The rest of the setup is safe: apex MX and apex SPF records are not
touched by registration, so the domain's existing inbound routing and sender
authorization survive. The DMARC record is the single collision, which is why it
is the one to back up rather than snapshotting the whole zone and hoping.

## Role addresses need routing rules, but must not be senders

RFC 2142 names the addresses a domain is expected to answer at: postmaster,
abuse, security, hostmaster, webmaster, and a commercial set. Receivers and
blocklist operators actually try postmaster@ and abuse@, and a domain that
bounces them looks abandoned — nobody home, no operator, the mark of a
throwaway. Every fleet domain therefore needs routing rules that accept mail to
at least those two and forward it somewhere read.

That is inbound. Outbound is the opposite rule. A company does not send
scheduling correspondence from abuse@, and warm-up mail that does looks
synthetic to every receiver: the address exists to receive complaints, not to
introduce people. Using role addresses as warm-up senders spends the trust the
routing rules just built.

Keep two separate lists and never merge them. One list is the role addresses
with routing rules. The other is the warm-up sending identities, which are the
ordinary mailboxes a real company writes from. Review any new sending identity
against the role list before it sends.

## Volume arithmetic at fleet scale

Fifteen domains times thirty mailboxes is 450 mailboxes. At one message per
mailbox per day that is 450 messages a day arriving in a small number of seed
inboxes — a volume no human inbox absorbs, and a pattern no human produces.

Reputation is built on consistency at the domain level, not on per-mailbox
volume. A domain that sends a little every day for weeks looks established; a
domain that sends a lot for three days looks compromised. So as the mailbox
count grows, the per-mailbox rate stays low. Each domain still shows its steady
daily trickle, but no single seed mailbox drowns.

The seed inboxes need protection regardless. Give them filters that file
warm-up mail into labels or folders and out of the way of real correspondence,
or the operators stop reading them and the engagement half of the loop — the
rescue, the read, the reply — stops happening. An unread seed is volume without
information, at fleet scale.

## Stagger the start dates across domains

Fifteen brand-new domains that all begin mailing the same seed addresses on the
same morning is the pattern of a spam operation, not of several businesses that
share an owner. Real companies start at different times, grow at different
rates, and never coordinate their first day.

Offset the start dates by days, and let the ramps differ per domain so the
curves do not march in step. The cost is a longer calendar. The saving is that
no receiver sees a synchronized fleet where it should see unrelated senders.

## Changing the identity list mid-day reshuffles the slots

A day's plan numbers its messages by position. Positions are derived from the
identity list, so adding or removing a mailbox renumbers every slot after it,
while the state file still holds slots recorded under the old numbering.

The effect is not a crash and not a loss. It is a one-day smear: some
identities send twice that day and others do not send at all, and the next day
plans cleanly against the new list. Observed on a real domain that had already
sent twenty messages when its list grew from twenty mailboxes to thirty — five
identities repeated and five waited until the following day.

That is usually acceptable, and it is better than the alternatives. Clearing the
day's state to force a clean replan re-sends everything already delivered, which
is real duplicate mail to a real mailbox. Blocking config changes until midnight
is worse still.

So: expect the smear, do not try to repair it, and prefer to grow the identity
list before a day's sending starts rather than in the middle of it. If the list
must change mid-day, the thing to check afterwards is that no identity is
missing from the following day's plan, not that today's was perfect.

## Before starting a fleet run

Walk this list once, with the files open, before the first send. Program names
are unique across the full domain including the suffix. Each domain has its own
config and state file, and the loop survives any single domain failing. The
schedule runs hourly through the whole send window with a pass near the end.
The pre-existing DMARC record on every live-mail domain is backed up. Role
addresses have routing rules and appear on no sender list. Seed inboxes have
filters. Start dates are staggered. Only then start the loop.
