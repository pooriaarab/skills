# Ramp and volume

## The shape matters less than the absence of steps

Receivers react to change, not to volume. A domain that sends 20 messages a day for a
month and then 2,000 in an afternoon looks compromised. A domain that grows from 10 to
2,000 over six weeks looks like a company that is growing. Pick any reasonable curve and
do not jump.

Defaults in the tool, per identity per day:

```json
"ramp": { "startPerIdentity": 2, "growth": 1.25, "maxPerIdentity": 12, "days": 28 }
```

Two messages per mailbox on day one, 25% growth, capped at twelve. With eight identities
that is 16 messages on day one and roughly 96 a day at the cap. Multiply by the number
of identities before you decide the numbers look small.

## Warm each sending identity, not just the domain

Reputation attaches to the domain, but mailbox-level behaviour matters too. Warm the
addresses you will really send from. Spreading volume across several mailboxes is closer
to how a real company sends than funnelling everything through one.

A sending subdomain is a separate reputation and must be warmed separately. It starts at
zero even when the parent domain is well established.

## Most of each day must go somewhere you can read

The tool holds at least 70% of every day's volume on seeds marked `engage: true`.

A send to a mailbox you cannot inspect produces no placement verdict, no spam rescue and
no reply. It is volume without information. Unmeasurable seeds are still worth having —
they add genuine recipient variety, and a third-party mailbox that never engages is a
more realistic mix than one that always does — but they should never be the majority.

Note the asymmetry: an unmeasurable seed that never opens or replies is a mildly
negative engagement signal at scale. Keep those recipients few, and prefer people who
will actually read the mail.

## Timing

Messages are spread across a working window (13:00–01:00 UTC by default, roughly a
Pacific working day) with jitter, never sent as a burst. Sixteen messages leaving in the
same second is a machine signature regardless of content.

## Vary the format, not just the wording

Identical bodies at volume are themselves a bulk signal, so wording is drawn from pools.
More importantly, formats are filtered differently, and the tool rotates through five
shapes so each is measured separately:

| Variant | Shape |
|---|---|
| `plain` | Text only. |
| `html_simple` | Minimal HTML, no images. |
| `html_logo` | HTML with one inline CID logo. |
| `html_rich` | Styled signature block plus logo. |
| `newsletter` | A broadcast: promotional block, availability list, numbered form, `List-Unsubscribe`. |

`newsletter` is deliberately the shape real cold outreach takes, and it is the hardest
to land. It is also the only variant here that is a commercial electronic message, so it
carries a `List-Unsubscribe` header and a way to opt out — both because bulk mail without
them is filtered harder, and because once it is aimed at real recipients it is a CASL
obligation.

Test the shape you intend to send. A warm-up that only proves plain text lands tells you
nothing about the HTML template your campaign will actually use.

## When to stop

Warm-up is finished when the format you intend to send reaches the Primary tab
consistently, at the volume you intend to send. That is a placement result, not a
calendar date. Four weeks is a common answer; it is not the criterion.

Keep a baseline trickle running after the campaign starts. A domain that goes quiet for
months is close to cold again.
