---
name: lifecycle-email
description: "Design and ship product email sequences for a SaaS product, including welcome email, activation emails, trial-ending emails, abandoned checkout emails, dunning emails, win-back sequences, newsletters, and product-event email triggers. Use when the user asks to set up lifecycle email, an email sequence, drip emails, onboarding emails, retention emails, or email automation. Skip password resets, receipts, and other single transactional messages unless the request also includes a lifecycle sequence."
---

# Lifecycle Email

The first decision is classification. Transactional, lifecycle, and marketing email
have different consent, unsubscribe, and reputation rules. Do not send them as one stream.
## 1. Classify the message before building it

**Transactional email** completes or protects a user action. Examples include password
resets, receipts, security alerts, and account notices. Send only the information needed
for that action. Do not add promotional content and call the message transactional.
**Lifecycle email** responds to a product state or user behavior. Examples include
activation help, trial reminders, payment recovery, and win-back messages. Lifecycle is
an operational label, not a legal exemption. A promotional lifecycle message needs the
same consent and unsubscribe treatment as marketing email.
**Marketing email** promotes a product, feature, offer, or editorial content. Newsletters,
product announcements, and promotional campaigns belong here. Use a recorded opt-in or
another lawful basis that applies to the recipient and jurisdiction.

This classification controls sender addresses, consent, content, suppression, and measurement.
Keep streams and sender identities separate. Mixing marketing traffic with account mail can
damage the reputation needed for password resets and receipts.
Yahoo explicitly recommends separating mail by function. See [Yahoo sender best practices](https://senders.yahooinc.com/best-practices/).

## 2. Deliverability comes before copy

The common failure is a well-written welcome email that lands in spam. Every activation
rate and downstream conversion number then measures inbox placement, not product value.
Use a sending subdomain such as `updates.example.com` or `notify.example.com`. Keep
transactional and marketing traffic on separate subdomains when volume or risk justifies it.
Resend recommends subdomains to isolate sending reputation and state intent. See [Resend domain management](https://resend.com/docs/dashboard/domains/introduction).

Configure all three controls before sending real users:

- **SPF:** authorize the email provider in DNS.
- **DKIM:** publish the provider's public key so recipients can verify the signature.
- **DMARC:** publish a policy and align the visible `From` domain with SPF or DKIM.

For Gmail bulk sending, Google requires SPF, DKIM, DMARC, TLS, valid DNS, and low spam
rates. The `From` domain must align with SPF or DKIM. See [Gmail sender guidelines](https://support.google.com/mail/answer/81126).
Yahoo requires SPF or DKIM for all senders. Bulk senders need both, a valid DMARC policy,
and aligned authentication. See [Yahoo sender requirements](https://senders.yahooinc.com/best-practices/).

Warm the subdomain with small sends to engaged recipients. Increase volume gradually.
Do not copy a fixed calendar without current provider guidance. Google uses sending patterns,
engagement, and spam reports when it decides whether to limit delivery.
Verify DNS, DKIM signatures, DMARC alignment, bounce handling, and spam placement before copy.
Test Gmail, Yahoo, Outlook, and Apple Mail. Inspect raw headers. “Sent” does not prove inbox delivery.

## 3. Build these sequences in this order

Use the smallest useful sequence. Each sequence needs a trigger, delay, exit condition, and suppression rule.

### 1. Welcome and activation

**Trigger:** `user_signed_up` or the equivalent account-created event.

**Exit:** an activation event such as `project_created` or `first_value_reached`, unsubscribe,
hard bounce, account deletion, or abuse flag. Explain the first useful action. Check the exit
condition immediately before every send, not only when the sequence starts.

### 2. Trial ending

**Trigger:** `trial_started` with a trusted `trial_ends_at` value.

**Exit:** upgrade, cancellation, a new trial, or final trial state. Show remaining value and
prevent a surprise charge. Route payment failure into dunning. Use the event timestamp or
billing state, not a daily cron job. Point to `saas-billing-stripe/SKILL.md` for Stripe state.

### 3. Abandoned checkout

**Trigger:** `checkout_started` or an equivalent checkout event with a session or cart ID.

**Exit:** `checkout_completed`, successful payment, cart expiry, unsubscribe, or hard bounce.
Restore the exact checkout context. Set a short event-based delay. Require clear checkout
intent and a known recipient. Cancel the send when completion arrives.
### 4. Dunning

**Trigger:** a payment failure or invoice failure event from the billing system.

**Exit:** payment recovered, subscription canceled, account closed, or unrecoverable state.
Help recover payment and explain account impact. Keep notices separate from promotion. Point
to `saas-billing-stripe/SKILL.md` for Stripe webhooks, retries, and idempotency.
### 5. Win-back

**Trigger:** a cancellation event or a product-defined inactivity event.

**Exit:** reactivation, a new paid subscription, a qualifying product event, unsubscribe, or
hard bounce. Offer a useful return path based on the last successful outcome. Define inactivity
in the product event taxonomy. Do not use an arbitrary inactivity query as the only trigger.
### 6. Newsletter

**Trigger:** a published issue for recipients with an active newsletter opt-in.

**Exit:** unsubscribe, consent withdrawal, hard bounce, complaint, or list removal. Deliver the
promised content at the stated frequency. Keep newsletter consent separate from account consent.
Never include a suppressed address.
## 4. Trigger from product events, not from a schedule

Schedules are delays after a fact. They are not the fact. A daily “new users” job can resend,
miss late events, and email users who already completed the goal.

Use the event taxonomy and naming rules in `product-analytics/SKILL.md`. Do not create a
second set of email-only event names. Point to that skill instead of duplicating its taxonomy.
Store the event ID, user ID, sequence ID, message ID, consent state, and event timestamp.
Make handling idempotent. Deduplicate retries. Use event timestamps for waits. Recheck exits
immediately before delivery.

Treat provider callbacks as delivery facts, not product facts. A delivered email does not
mean a user read it. A click or product event is stronger evidence of intent.

## 5. Choose the sending tool

For a Cloudflare-owned stack, use Resend with React Email as the default starting point.
React Email renders React components to HTML and plain text. Resend accepts a React node in
the Node.js SDK and supports custom headers. See [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email)
and [React Email](https://react.email/).

Keep the sender API behind one application service. Add an idempotency key when retries could
duplicate sends. Verify webhook signatures. Persist delivery, bounce, complaint, and click
events. See Resend [email events](https://resend.com/docs/webhooks/event-types) and [webhook storage](https://resend.com/docs/dashboard/webhooks/how-to-store-webhooks-data).
Cloudflare Email Service also exists. It supports Workers, REST, and SMTP sending, and can
configure SPF, DKIM, and DMARC during domain onboarding. Use it when native Cloudflare
integration and simple application sends matter more than lifecycle tooling. See [Cloudflare Email Service](https://developers.cloudflare.com/email-service/get-started/send-emails/).

Choose Loops or Customer.io when non-engineers need branching journeys, segments, frequency
limits, experiments, preferences, event replay, or campaign reporting. A raw API lacks these
controls. Loops supports event-triggered workflows. See [Loops email types](https://loops.so/docs/types-of-emails)
and [Loops events](https://loops.so/docs/events). Customer.io supports event-triggered
campaigns with event properties. See [Customer.io campaign types](https://docs.customer.io/journeys/types-of-campaigns-and-broadcasts/).

## 6. Compliance and unsubscribe handling

Treat compliance as a routing rule, not footer copy.

- **CAN-SPAM:** identify the sender, use an accurate subject, include a physical postal address,
  provide opt-out, and honor it within 10 business days. See the [FTC guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).
- **GDPR:** record the purpose and basis for consent. Make withdrawal as easy as consent.
  Stop direct marketing when a person objects. See [GDPR Articles 7 and 21](https://eur-lex.europa.eu/legal-content/EN-DE/TXT/?from=EN&uri=CELEX%3A32016R0679).
- **Gmail and Yahoo:** bulk promotional or subscription mail needs RFC 8058 one-click
  unsubscribe, a visible body link, and a working suppression path. Gmail defines bulk as
  about 5,000 messages to personal Gmail accounts in 24 hours. Yahoo does not publish a
  volume threshold. Gmail and Yahoo require prompt processing. Use 48 hours as the internal
  maximum because Yahoo states two days and Google states 48 hours. See [Gmail subscription
  guidelines](https://support.google.com/mail/answer/15263077?hl=en) and [Yahoo FAQs](https://senders.yahooinc.com/faqs/).

Implement the RFC 8058 headers on promotional and subscription mail:

```text
List-Unsubscribe: <https://example.com/unsubscribe/opaque-token>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

The HTTPS endpoint must suppress the correct list without cookies, login, or a second form.
The URL must identify the recipient and list with an opaque, hard-to-forge token. DKIM must
cover both unsubscribe headers. See [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058.html).

Do not add an unsubscribe header to a password reset as a substitute for correct message
classification. Do provide a preference or account path when useful. If a message mixes
account information with promotion, treat it as promotional until a compliance review says
otherwise.

## 7. Measure outcomes, not opens

Open rate is not a reliable primary metric. Apple Mail Privacy Protection hides opens and can
fetch pixels before reading. See [Apple Mail Privacy Protection](https://support.apple.com/guide/iphone/use-mail-privacy-protection-iphf084865c/26/ios/26).

Track these numbers by sequence, message, cohort, sender stream, and consent source:
- delivered rate, hard bounce rate, soft bounce rate, and complaint rate;
- click rate and landing-page completion rate;
- activation rate after welcome mail;
- trial-to-paid conversion after trial mail;
- recovered checkout value after abandoned-checkout mail;
- recovered revenue after dunning mail;
- reactivation rate after win-back mail;
- unsubscribe rate, suppression latency, and consent withdrawal rate.

Use delivered recipients for delivery metrics and eligible recipients for conversions.
Attribute outcomes with a defined window and holdout group. Compare clicks and product events.
## Checklist

- [ ] Classify every message as transactional, lifecycle, or marketing.
- [ ] Keep account mail, lifecycle mail, and marketing mail in separate streams.
- [ ] Send from a verified subdomain with SPF, DKIM, and DMARC alignment.
- [ ] Warm the subdomain slowly with engaged recipients.
- [ ] Define a product-event trigger and an exit condition for every sequence.
- [ ] Recheck the exit condition immediately before every send.
- [ ] Use `product-analytics/SKILL.md` for the shared event taxonomy.
- [ ] Use `saas-billing-stripe/SKILL.md` for Stripe billing state and webhook handling.
- [ ] Start with welcome, trial-ending, abandoned checkout, dunning, win-back, then newsletter.
- [ ] Use Resend plus React Email unless lifecycle tooling needs justify Loops or Customer.io.
- [ ] Add idempotency, webhook verification, bounce suppression, and event persistence.
- [ ] Add RFC 8058 headers and a visible unsubscribe link to bulk promotional mail.
- [ ] Include a physical postal address in commercial mail.
- [ ] Process opt-outs within 48 hours and meet the applicable legal deadline.
- [ ] Measure delivery, complaints, clicks, product outcomes, revenue, and suppression latency.
- [ ] Treat open rate as a diagnostic signal, not the success metric.
