---
name: support-inbox
description: "Use when one person needs to handle customer support for a small SaaS or web product and the ask mentions 'support inbox', 'support@', 'customer says it is broken', 'refund request', 'cancellation email', 'churn reply', 'support tickets', or 'help docs'. Do not use for production-wide outages or Stripe implementation mechanics; use incidents or saas-billing-stripe."
---

# Support Inbox

The goal is simple: every customer gets a human reply, every problem becomes searchable data, and
the owner spends little time on support administration.

Support is different from an incident. One customer reporting a failure needs a support reply.
Many customers failing on the same path may need [incidents](../incidents/SKILL.md).
Use [lifecycle-email](../lifecycle-email/SKILL.md) for event-triggered product email, not personal support replies.

## 1. Use one inbox for one person

A helpdesk suite is usually wrong for one person. It adds routing, seats, reports, and setup
before the product has enough support volume to use them.

Start with one address such as `support@example.com`, one mailbox, one owner, and one recovery
address. Keep the mailbox as the message record. Do not make chat, a task board, or a spreadsheet the
only place where a customer message exists.

Gmail is a reasonable low-cost example. Google says a Google Account includes up to 15 GB across
Gmail, Drive, and Photos. That is enough for low-volume support, but it is not a support SLA. See
[Google One storage plans](https://one.google.com/about/plans).

Use a dedicated mailbox, not the owner's personal inbox. Add two-factor authentication and a
recovery address. Test inbound mail, replies, attachments, and recovery before launch.

Use a small label set:

- `new`: needs a first reply. `waiting-customer`: needs customer input.
- `waiting-fix`: needs a product change. `done`: needs no further action.
- `billing`: route to the billing policy and billing record.
- `bug`, `confusing`, or `missing-feature`: record product evidence.

Do not create a label for every product screen. Too many labels hide the work.

Gmail supports labels, filters, stars, snooze, and archive. See [Gmail labels](https://support.google.com/mail/answer/118708?hl=en)
and [Gmail filters](https://support.google.com/mail/answer/6579?hl=en). Test filters before they archive or forward anything.

Move beyond one mailbox when a second person needs to work the same messages, or when you need
assignment, collision detection, audit history, role limits, or response reports. An unassigned queue does not scale.

Gmail delegation gives a personal Gmail account up to 10 delegates. Delegates can read, send, and
delete mail, but delegation does not provide per-ticket ownership. Gmail documents Google Groups as
a collaborative inbox for teams. See [Gmail collaboration options](https://support.google.com/mail/answer/9259857?hl=en)
and [Gmail delegation limits](https://support.google.com/mail/answer/138350?hl=en).

Do not delegate an alias and expect it to work. Gmail says aliases cannot receive delegated access.
Create the mailbox first, then add delegates. Remove access when a person leaves.

## 2. Reply fast before you reply perfectly

The first reply reduces uncertainty. A detailed answer can wait while you verify the cause. Silence
makes the customer guess whether the message arrived, whether the product is broken, and whether anyone owns it.

Set a first-reply target that one person can keep. Same working day is a useful default. Do not
promise twenty-four-hour coverage when nobody watches the inbox at night.

An honest holding reply contains acknowledgement, a symptom summary, the next update time, and one useful question or workaround.

Use these words:

> Thanks for reporting this. I see that [action] fails at [step]. I am checking it now. I will update you by [time and timezone], even if I do not have the fix. If you can, reply with [one detail].

Do not say “we are looking into it” without an update time. Do not claim a fix before testing the
same customer path. Never ask for passwords, full payment details, or secret keys.

## 3. Decide refunds and cancellations before anger arrives

Write the policy before the first difficult email. A policy created during an argument becomes inconsistent, slow, and hard to explain.

Record these decisions in one short page:

- Duplicate charge or confirmed billing error: refund the affected charge.
- Verified product failure: refund or credit according to the documented impact.
- Prompt accidental renewal with no meaningful use: allow the defined goodwill refund.
- Normal use followed by dissatisfaction: apply the policy, then offer goodwill within the approval limit.
- Fraud, abuse, or repeated requests: pause the decision and review the account.

Set a low-value goodwill limit. Below it, the refund can cost less than an argument, chargeback,
or lost trust. A goodwill refund does not prove the customer was right. Record the reason and amount.

Never make the customer prove a product defect when your own logs already show it. Never use a
refund to conceal a known outage. Link the customer impact to the bug or incident record.

Use the same rule for cancellation. Cancel the service when asked. Do not hold the account hostage
for a survey or retention call. Explain the effective date and remaining access in plain language.

Use [saas-billing-stripe](../saas-billing-stripe/SKILL.md) for Stripe status, portal actions,
refunds, cancellation, webhooks, and access changes. See Stripe's [Create a refund](https://docs.stripe.com/api/refunds/create)
and [Cancel subscriptions](https://docs.stripe.com/billing/subscriptions/cancel) references. This skill sets policy.

For a completed goodwill refund, use this reply:

> Thanks for explaining the problem. I approved a one-time refund of [amount] for [reason]. It will return through the original payment method. I recorded [short reason] to prevent a repeat. You do not need to do anything else.

Send that message only after the refund exists. Use the actual provider status. Do not promise an unverified card arrival date.

## 4. Ask one useful churn question

Ask one question after you confirm the cancellation. Do not make cancellation depend on an answer.

Use this question:

> I have cancelled the subscription. What is the main reason you are leaving today: price, missing feature, confusing workflow, reliability, or something else?

One question gets a lower-friction answer inside the real conversation. An exit survey usually
fails because it arrives after departure, asks too many fields, and lacks the customer's story.

Do not send a retention pitch before the customer answers. Tag the answer. Reply when a specific fix exists. Do not promise a roadmap date to recover one account.

## 5. Turn tickets into product data

Treat support as a product sensor. A ticket shows where the product failed to explain, work, or set the right expectation.

Count conversations, not replies. For each ticket, record only what helps a decision:

- received date and product area;
- one reason tag, account or plan when relevant;
- customer impact and resolution;
- refund, cancellation, or churn signal.

Use one primary reason tag: `bug`, `confusing`, `missing-feature`, `billing`, `account`, `abuse`, or `other`. Add a product area separately. Do not mark every request as a bug.

Review counts weekly. Rank issues by frequency, affected accounts, churn or refund impact, and
confidence. Put the top three into the roadmap with a count, three examples, impact, and one change.

Do not let one loud request become a roadmap item without checking other evidence. Do not discard a low-volume payment or security problem because its count is small.

The loop is: customer report, tag, weekly count, product change, fewer repeated reports. If it stops at a private inbox, support becomes a cost instead of product truth.

## 6. Use canned replies and short docs

Use a canned reply when the words are stable and the next action is clear. Personalize the first sentence, account details, and product state every time.

Answer once and link forever for stable how-to questions. Keep the answer in the email too. A link alone feels like deflection and fails when the page moves.

Use a document when the same task needs several steps. Put the answer, expected result, and next step near the top. Remove old screenshots and links during product changes.

If customers repeatedly ask the same question, inspect the product first. The label, error message,
default, or button may be confusing. A document can hide that defect while adding maintenance work.

Gmail templates work on the web, not in Gmail mobile apps. Keep mobile replies possible without the
template. See [Gmail templates](https://support.google.com/mail/answer/14864208?hl=en).

Keep three templates first:

- first acknowledgement;
- known answer with one help link;
- cancellation confirmation with one churn question.

Review templates monthly. Delete any template that needs more exceptions than direct writing.

## 7. Automate routing, not judgement

Automate low-risk administration. Keep customer decisions human.

Safe first automations include:

- label mail sent to `support@`;
- mark known receipt messages as low priority;
- create an honest acknowledgement with a stated response time;
- remind the owner about `waiting-customer` messages and copy approved fields into a data table.

Do not auto-resolve tickets. Do not auto-refund, cancel, promise a fix, or classify an angry
message as harmless. Do not send an AI-written reply without human review. Never ask for a password,
secret, or full card number.

An honest automatic acknowledgement says:

> Thanks. This inbox received your message. A person reads it by [time and timezone]. We will reply by [target]. This is an automatic acknowledgement, not a resolution.

Do not write “I am looking into this” when no person has started work. Do not make the bot sound human. Trust is easier to keep when the boundary is explicit.

## Checklist

- [ ] One dedicated support address exists.
- [ ] One person owns the inbox and checks it on a defined schedule.
- [ ] A recovery address and two-factor authentication protect the mailbox.
- [ ] Inbound mail, replies, attachments, and recovery all work in a live test.
- [ ] The mailbox remains the message record.
- [ ] Labels show new, waiting, done, billing, and product reasons.
- [ ] Filters are tested before they archive or forward messages.
- [ ] The owner has a first-reply target that they can keep.
- [ ] Holding replies state the symptom and next update time.
- [ ] The reply never requests passwords, secrets, or full payment details.
- [ ] Refund and cancellation rules exist before the first dispute.
- [ ] A low-value goodwill limit and approval rule exist.
- [ ] Stripe actions use `saas-billing-stripe`.
- [ ] Cancellation never depends on completing a survey.
- [ ] Every ticket has one primary reason and one product area.
- [ ] Weekly review ranks the top three support problems.
- [ ] Roadmap entries include counts, examples, and customer impact.
- [ ] Stable answers use short templates and tested help links.
- [ ] Repeated questions trigger a product-clarity review before a new document.
- [ ] Automation handles routing and reminders, not refunds or judgement.
- [ ] Automatic replies clearly identify themselves as automatic.

## Related

- `incidents` — when the report is an outage rather than a question.
- `product-analytics` — turning a recurring ticket into a measured funnel step.
- `user-onboarding` — a support queue full of "how do I start" is an
  onboarding defect, not a support one.
- `grow-a-product` — where this sits in the loop.
