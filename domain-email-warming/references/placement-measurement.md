# Measuring placement

The whole tool exists for this. Everything else is setup.

## Why a send receipt proves nothing

Providers report acceptance for delivery. Acceptance happens at the edge, before any
filtering decision. A message can be accepted, delivered, and filed in spam, and every
API response involved will look like success. The only way to know where a message
landed is to look at it in the destination mailbox.

Cloudflare's send response makes this concrete: it returns `queued` rather than
`delivered` for normal sends, and it returns `success: true` even when every recipient
was refused. The refusals are in `permanent_bounces` and `suppressed_recipients`, which
you have to read out of the result. Counting those as sent fills the report with mail
nobody received.

## How the tool does it

1. The send returns a real RFC822 Message-ID (`result.message_id`). Store it.
2. On the receiving side, search for `rfc822msgid:<id>`. This is exact — no subject
   matching, no heuristics, no false pairing between two similar messages.
3. Read the labels on the message that comes back.

**Search spam explicitly.** A message sitting in spam that gets reported as `not_found`
inverts the meaning of the whole report. The tool retries every miss with an
`in:anywhere` query before it accepts that a message is absent.

Do not invent your own Message-ID and pass it as a header. Cloudflare rejects a
caller-supplied `Message-ID` with `email.sending.error.email.invalid`, which reads like
a bad address and sends you hunting in the wrong place.

## Read the tabs separately

Gmail labels carry more than inbox-or-spam:

| Labels | Verdict | Meaning |
|---|---|---|
| `SPAM` | `spam` | Filtered. Outranks everything, including a simultaneous `INBOX`. |
| `INBOX` + `CATEGORY_PROMOTIONS` | `promotions` | Technically delivered, rarely read. |
| `INBOX` + `CATEGORY_UPDATES` | `updates` | Same. Where bulk-shaped mail tends to go. |
| `INBOX` + `CATEGORY_PERSONAL`, or `INBOX` alone | `primary` | What you actually want. |
| no `INBOX` | `unknown` | Archived, moved, or not yet arrived. |

Collapsing Promotions and Updates into "inbox" flatters the report and hides the single
most common outreach failure: mail that is delivered and never seen. A day-one IMECore
run scored zero spam and would have read as a clean sweep — while the broadcast-shaped
messages went to Updates every time.

## The corrective half

Measuring is half of it. On each checked message the tool also:

- **Rescues from spam** — removes `SPAM`, restores `INBOX`. This tells the provider its
  classification was wrong, which is the signal you want recorded.
- **Marks read** — an opened message is a weak positive signal.
- **Replies to a share of them** — the strongest signal a mailbox can produce. Real
  correspondence is two-way, and a thread with replies is what an established sender
  looks like.

Set `replyRate` to roughly half. Replying to everything is as unnatural as replying to
nothing.

## Diversity is the honest limit

Measuring at one provider tells you about one provider. Plus addresses at one Gmail
account give parallel sends into a single mailbox, not recipient diversity — the
provider still sees one recipient. To learn about Outlook or corporate filters you need
seed mailboxes there, and the tool will only measure the ones it has API access to.
That is why the ramp keeps most of each day on mailboxes it can read: a send to a
mailbox you cannot inspect teaches you nothing about placement.
