---
name: founder-led-sales
description: "Plan or run the first founder-led sales motion for a new SaaS or software product: build a named prospect list, write cold outbound, prepare discovery calls and demos, handle objections, track a manual pipeline, or move qualified buyers to self-serve. Use when the user asks for 'founder-led sales', 'cold outreach', 'cold email', 'book demos', 'sales calls', 'talk to prospects', 'find design partners', 'build a prospect list', or 'set up a sales pipeline' for an early product. Skip paid-ad setup, lifecycle email infrastructure, and CRM implementation unless the request includes the founder sales motion."
---

# Founder-led sales
The first sales motion is a learning system. It finds a painful problem, a reachable buyer,
and the words that explain the value. It is not a smaller advertising campaign.

## 1. Choose sales or ads
Founder-led sales beats ads when the market is narrow, the problem is urgent, and each customer
can repay the time needed to learn and sell. It fits products that need trust, workflow change,
or a short proof before purchase.
Use deal size and margin, not a slogan. A $39 monthly plan at 80% gross margin produces $374.40
in first-year gross margin before churn. A $1,000 monthly contract produces $9,600 before churn.
The second can support several hours of founder work. The first usually needs self-serve unless
calls reveal a larger paid package.
Sales is often wrong when the product is low-price, self-serve, easy to understand, and broad.
Use ads after the message, audience, landing page, and activation path show repeatable evidence.
Use sales first when each conversation can change the product or pricing decision.
Do not call free interviews a pipeline. Record whether each conversation seeks learning, a paid
pilot, a design partnership, or a purchase.

## 2. Build a list of real names
A bought list gives names without context. It weakens relevance and increases compliance risk.
Start with people who already show the problem:
- Public issue trackers, feature requests, support threads, Reddit, Hacker News, and forums.
- Job posts that reveal a manual process or a new owner for the problem.
- Communities, events, newsletters, referrals, waitlists, and failed trials.
Use GitHub issue search when the problem appears in software workflows. See [searching issues and pull requests](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests).
Use a public post as context, not as consent or proof of buying intent.

Record the name, role, company, permitted contact path, evidence URL and date, likely consequence,
current workaround, trigger, message, response, next step, and opt-out state. Write the evidence
before the message. If you cannot state the problem in one sentence, wait. Do not scrape private
data, infer sensitive traits, or treat a public complaint as an invitation to pitch.

## 3. Write outbound that gets replies

Relevance beats personalization tokens. A copied first name proves little. A specific problem,
role, and trigger give the recipient a reason to answer.
Keep the first message near 60 to 120 words. Use one problem, one reason for relevance, and one
ask. Ask for a reply or a short call, not both. Make the call length and purpose clear.

Use this structure: name the problem; say who you are; state the narrow outcome; ask one question;
give an easy decline.
Good:

```text
Subject: Weekly CSV reconciliation

Hi Maya, I saw your post about reconciling partner CSVs before the Monday report.
I am building a tool that checks those files and flags changes for review.
Is that process still taking time each week at Acme? If yes, would you be open
to a 15-minute call next Tuesday or Wednesday? If not, I will close the loop.
Thanks, Priya
```

Bad:

```text
Subject: Quick question

Hi Maya, I loved your post. We help innovative companies unlock next-generation
data synergy with our award-winning platform. Do you have 30 minutes to learn more?
Best, Priya
```

The bad message uses praise, vague claims, a generic ask, and no demonstrated problem.
Send one useful follow-up with new context. Stop after a clear no, opt-out, or planned silence.

## 4. Protect deliverability and follow the law

Cold outbound is commercial communication when it promotes a product. The FTC says CAN-SPAM
has no business-to-business exception. See the [FTC compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).

CASL requires consent, sender identification, and an unsubscribe mechanism for commercial
electronic messages. A public address is not blanket permission. See [CRTC CASL guidance](https://crtc.gc.ca/eng/com500/guide.htm).

UK PECR treats corporate subscribers differently from sole traders and some partnerships.
UK data protection duties can still apply. See the [ICO business-to-business guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/).

Identify the sender. Use an honest subject. Include a working opt-out. Record the source and
jurisdiction. Suppress an opt-out across every list. Ask counsel to review countries and channels
before sending at scale.

Cold outbound must not go out on the domain that sends product email. Use a separate outbound
domain or sending subdomain. Follow `lifecycle-email` for SPF, DKIM, DMARC, suppression, and
provider handling. See [Google sender guidelines](https://support.google.com/mail/answer/81126)
and [Yahoo sender best practices](https://senders.yahooinc.com/best-practices/).

Do not hide sales mail inside a fake personal note. Do not claim a referral that did not happen.
Do not use fake urgency, false customer names, or invented results.

## 5. Run a discovery call

The call should explain the buyer's current process before it explains the product. Pitching
before understanding creates polite interest and weak evidence.

Set a short agenda: understand the workflow, test the problem, then decide on a next step.
Ask what happens today, where work slows or fails, how often it happens, who does it, and what
it costs. Ask what they tried, why it stopped, why the problem matters now, who approves it, and
what evidence would make a small trial credible. Ask for a recent example.

Separate a painful problem from a general wish. Do not lead the buyer toward your answer.
Do not turn the call into a questionnaire.

End with an action, owner, success condition, and date. Use a paid pilot, workflow review,
security review, or self-serve trial with one activation goal. If there is no next step, record
“not now” or “no fit.” “I will send some information” is not a next step.

## 6. Give a problem-led demo

Demo the customer's problem being solved. Do not tour the feature list.

1. Restate the current workflow and confirm it.
2. Start with the input or failure that creates the pain.
3. Show the smallest workflow that changes the outcome.
4. Show the result, review point, and known limits.
5. Ask what would block adoption or a trial.

Use the customer's terms and sample data only with permission. Show one complete path before
optional features. Stop when proof is sufficient. Do not build a free custom prototype before
you know the problem, owner, success condition, and buying path.

## 7. Handle objections and close without pressure

Treat an objection as missing information. Ask one question before answering it.

**Price:** Ask, “Compared with what cost or budget?” Separate inability to pay from unclear
value. Tie price to the measured problem. Reduce scope when honest. Do not discount to hide weak
positioning.

**Timing:** Ask, “What must happen before this can move?” Identify the event, owner, and date.
Schedule a check only when that event is real. Accept “not now.”

**Authority:** Ask, “Who owns the outcome, and who approves the purchase?” Invite those people.
Do not bypass or pressure someone who has not agreed to the conversation.

**Status quo:** Ask, “What happens if the current process stays the same for six months?” Compare
the cost of change with the cost of waiting. If the current process is good enough, say so.

Close for a testable commitment. Confirm the problem, scope, success measure, owner, date, and
exit condition. A clean no is better evidence than a pressured maybe.

## 8. Track sales without a CRM at first

A spreadsheet is enough while one founder owns a small number of active conversations. Keep one
row per account or buying group. Use fixed stages:

```text
identified → contacted → replied → discovery → demo or trial → decision → won / lost / not now
```

Track source, problem evidence, contact date, next action, next-action date, stage, owner,
decision reason, expected value, and opt-out state. Do not call an unresponsive contact an
opportunity.

A CRM earns its keep when several people need the same history, follow-ups are missed, handoffs
are common, consent records need control, or pipeline reporting changes decisions. Choose it for
those failures. Do not install one to avoid direct customer work.

Review weekly. Count conversations, qualified problems, completed next steps, wins, losses, and
reasons. Do not invent reply-rate or close-rate benchmarks. Compare your own cohorts after the
message, segment, and qualification rules stay stable.

## 9. Hand the learning to self-serve

Sales calls should reduce the need for future calls. Copy buyer language into the pricing page,
proof, FAQ, and onboarding. Point to `pricing-page` for value metrics, packaging, and pricing.

Make self-serve answer who the product serves, the first useful action, plan limits, billing,
cancellation, proof, security, and required integrations. Point to `product-analytics` for the
shared event taxonomy. Use `sales_qualified`, `demo_completed`, `trial_started`,
`activation_reached`, and `subscription_started` only when each event has one clear meaning.

Compare activation and retention by sales source, problem segment, plan, and onboarding version.
Do not turn private notes into public claims. Remove personal details. Promote a pattern only
after repeated conversations support it.

## Checklist

- [ ] Compare expected gross margin with founder time before choosing sales.
- [ ] Confirm the target market, painful problem, buyer, and trigger.
- [ ] Build a named list from problem evidence, referrals, and first-party signals.
- [ ] Record evidence URL, date, contact path, and opt-out state.
- [ ] Write one relevant message with one ask, near 60 to 120 words.
- [ ] Send one useful follow-up, then stop at silence or opt-out.
- [ ] Review FTC, CASL, PECR, and local rules before sending.
- [ ] Keep cold outbound off the product-email domain.
- [ ] Use `lifecycle-email` for sending identity and deliverability controls.
- [ ] Run discovery before pitching and record the current workflow.
- [ ] End qualified calls with an owner, action, success condition, and date.
- [ ] Demo the problem path, result, review point, and limits.
- [ ] Handle price, timing, authority, and status quo with questions.
- [ ] Track a manual pipeline until handoffs or follow-ups require a CRM.
- [ ] Do not use reply-rate or close-rate benchmarks without reliable context.
- [ ] Move repeated objections into `pricing-page` and onboarding.
- [ ] Use `product-analytics` for shared events and post-signup outcomes.
- [ ] Never use fake urgency, fake referrals, fake customers, or misleading claims.
