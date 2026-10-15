# Authentication preflight

Run `warmctl preflight` before any warm-up mail goes out, and again after any DNS
change. Every check below is one the tool performs.

## Why this runs against authoritative nameservers

A record published seconds ago is still `NXDOMAIN` in a local resolver cache for the
length of the negative TTL. A preflight that reports FAIL on a record that plainly
exists trains the operator to ignore it, so the tool resolves the zone's own
nameservers first and asks them directly.

This is not theoretical. During the IMECore build, two sending subdomains were created
at the same moment. One propagated first. A probe sent from the slower one vanished
with no bounce and no trace — the parent DMARC policy was `p=reject`, the subdomain's
DKIM record was not yet visible, so receivers rejected it at SMTP time. The identical
message sent twenty minutes later reached the Primary tab. **Wait for propagation and
re-run preflight before you send from a new subdomain.**

## SPF

One record, and only one. Two `v=spf1` records is a hard failure: receivers treat it as
a permanent error and the domain fails SPF outright. Merge them.

The record must not end in `+all`, which authorizes the entire internet to send as you.
Use `~all` or `-all`.

For a **send-only subdomain** the name that matters is the return path host (the
envelope sender), not the subdomain itself. With Cloudflare that is
`cf-bounce.<subdomain>`. Checking the subdomain apex there produces a false failure.

## DKIM

Each selector must resolve at `<selector>._domainkey.<domain>`. Without it nothing the
domain sends can be signed, so DMARC cannot pass on DKIM — and for a sending subdomain,
DKIM is usually the only alignment you have.

## DMARC, and the inheritance trap

A subdomain with no `_dmarc` record of its own inherits the parent's policy. If the
parent publishes `p=reject` with no `sp=` tag, every subdomain inherits `reject`
immediately — including a brand-new sending subdomain whose DKIM is not yet aligned.
Its mail is not filtered, it is refused, and you get no bounce to tell you.

Two ways out, and the tool warns about both:

- Publish a `_dmarc.<subdomain>` record for the subdomain explicitly. Cloudflare's
  sending-subdomain setup does this for you.
- Or set `sp=` on the parent so subdomain policy is a decision rather than a default.

Do not solve it by weakening the parent policy. `p=reject` on the organizational domain
is the correct end state and the thing that stops others spoofing you.

## MX

Required for any domain that must receive mail or a reply. **Not** required for a
send-only sending subdomain — demanding it there is a false alarm. That finding is
only about the sending host. It is not a check that a reply can land.

## Reply path

Preflight walks every identity and looks up MX on the address a reply actually
goes to: `replyTo` when set, otherwise the identity's own address.

- A send-only identity with no `replyTo` is a FAIL. A reply to it bounces.
- A `replyTo` whose domain has no MX is a FAIL. The identity and the replyTo
  are both named — the config looks correct, and that is the quieter miss.
- Role comes from the config. A missing MX does not make a domain send-only; it
  makes a reply undeliverable.

## What preflight cannot tell you

That the records are correct is not that mail is landing. Authentication is necessary
and nowhere near sufficient. A perfectly authenticated domain sending unwanted mail
goes to spam with full marks on SPF, DKIM and DMARC. Placement is measured in
`engage`, not here.
