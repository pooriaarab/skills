---
name: validate-an-idea
description: "Use when a product idea has no code and someone asks to 'validate an idea', 'talk to customers before building', 'run customer discovery', 'do problem interviews', 'test demand', 'run a fake-door test', 'build a waitlist', or asks 'should we build this?'. Use before `name-a-product` or `build-from-template` when the idea still needs evidence that a specific customer has a painful, current problem."
---

# Validate an Idea

The first build decision is a filter decision. Test the idea before you name it, scaffold it, or write production code. Do not collect compliments. Collect evidence of recent pain, current workarounds, and a costly action now.

## When to use this

Use this skill when the idea has no code and the team can still change the customer, problem, offer, or decision. Skip it when a real customer already pays for the defined offer. Use `name-a-product` after a yes.
Use `build-from-template` only after a yes and only when the idea fits the template.

## 1. Write the riskiest assumption first

Write one sentence before research:

> [Specific customer] has [urgent problem] during [specific situation], uses [current workaround],
> and will take [observable action] for [price or effort].

The riskiest assumption is the belief that can kill the idea if false. It is not usually “will people like it?”
Choose the belief with the largest combination of uncertainty and damage:

- **Desirability:** this customer has the problem now.
- **Reach:** you can identify and contact this customer repeatedly.
- **Willingness to act:** the customer will switch, meet, sign up, or pay.
- **Economics:** the value supports the price and delivery cost.
- **Feasibility:** the offer works within its required constraints.

Pick one assumption. Do not test five weak assumptions at once.
Write the failure result before the test. Do not change it after seeing the result.
Example: “If fewer than three qualified buyers accept a paid pilot, we stop this idea.”

## 2. Define an ICP you can find by name

An ICP is a narrow group with a shared situation, not a broad market label.
Write the role or company, trigger, current workflow, cost, buyer, and reach channel.

Weak: “Small businesses that need better marketing.”
Strong: “Canadian dental clinics with two to five dentists that lose new-patient calls after hours,
use voicemail, and have an office manager who can buy software.”

List ten real people or companies by name before the first test. Add each source and qualification reason. If you cannot list ten, narrow the segment. Do not replace names with job titles, market size, subreddit members, or a purchased audience estimate.
Keep the first segment small enough to contact by hand. Similar situations produce cleaner evidence.

## 3. Run problem interviews that do not lie

Use the [official Mom Test guide](https://www.momtestbook.com/) for the core rule:
ask about past behaviour, not your idea or a hoped-for future.

Do not pitch during problem discovery. Do not show the solution first. Ask permission to take notes, then let the person talk.
Start with: “Tell me about the last time this problem happened.” Follow the event from trigger to outcome.

| Bad question | Good question | Why it works |
|---|---|---|
| “Would you use an app that fixes this?” | “How did you handle the last case?” | Past action beats intent. |
| “Is this a big problem?” | “What did the last case cost?” | Cost exposes urgency. |
| “Would you pay $50 per month?” | “What do you pay for the workaround?” | Existing spend is stronger. |
| “Which features should we build?” | “What did you try, and why did it fail?” | Failure reveals the wedge. |
| “Would this save time?” | “Show me the steps you take today.” | Workflow exposes hidden work. |

“Would you use this?” produces weak data because it costs nothing to agree.
People protect a friendly founder, imagine a better future, and avoid conflict.
An answer without a recent example is a hypothesis, not evidence.

Ask: “What tool or document did you use?” Ask: “How often did this happen in the last month?”
Ask: “What happens if nobody fixes it?” Ask: “Who else feels the cost?”
End with an introduction, pilot discussion, workflow access, or follow-up after a manual test.

Interview ten qualified people before deciding. Treat five as a first pattern check.
Record exact words, recent example, workaround, cost, authority, and next action.
Do not record “loves it” as a finding. Strong evidence has a recent event, workaround, and cost.
Repeated complaints without action are still weak evidence.

## 4. Tear down competitors with evidence

Competitor research is not a feature grid. A grid shows what exists. It does not show what users hate, what they pay, or where you can enter.

Review five direct competitors, two adjacent substitutes, and the manual workaround. Use public reviews, forums, support threads, issue trackers, and comparison posts.
Link every claim to its original page and record its date.

| Field | Record |
|---|---|
| Customer and job | Who completes which task? |
| Complaint | What failed in the user's own words? |
| Workaround | What do unhappy users do instead? |
| Price | What does the relevant plan cost? |
| Friction | What blocks setup, trust, use, or purchase? |
| Wedge | Which painful job remains underserved? |

Search each product name with “cancelled”, “missing”, “slow”, “manual”, “support”, and “integration”.
Read complaints before feature pages. Record billing period, limits, required plan, and date.
Mark unknown prices as unknown. Do not infer price from logos.

A wedge is a narrow job for a reachable ICP. “More AI” is not a wedge.
“Prepare the weekly claims packet for two-person billing teams” can be a wedge.
Treat one angry post as an interview lead. Treat repeated qualified complaints as stronger evidence.

## 5. Run the cheapest falsifying test

Choose the cheapest test that can disprove the riskiest assumption.

### A. Landing page with a real CTA

Use this for message resonance or initial demand. Send qualified traffic to one page with one CTA,
such as “Request a pilot.” Ask for enough information to qualify the person.
It can show audience understanding and first-step action. It cannot show delivery, retention, repeat use,
or payment by itself. Point to `landing-page` for page structure and `marketing-site` for a larger site.

### B. Fake door or waitlist

Use this when you can show a believable offer before it exists. Measure impression, click, qualified form,
and follow-up response. The [fake-door reference](https://umbrex.com/resources/frameworks/product-management-frameworks/fake-door-test/)
states the limit: a click or waitlist does not prove product-market fit.
Reveal the offer's status after the action and provide a real next step.
It can show message, segment, and channel response. It cannot show sustained value, feasibility,
or payment without a payment step.

### C. Concierge or manual version

Use this when the main risk is delivering the promised outcome.
Perform the work manually for three to five qualified customers.
Track time, inputs, outputs, rework, customer effort, and repeat requests. See the [Concierge MVP reference](https://umbrex.com/resources/frameworks/product-management-frameworks/concierge-mvp/) for its manual-delivery limit.
It can show whether the workflow works and customers value the outcome.
It cannot prove that automation reaches the required margin or volume.

### D. Paid pre-order or paid pilot

Use this when price and commitment are the riskiest assumptions.
State what exists, delivery timing, refund terms, and the exact offer.
Take payment through a legitimate checkout or invoice process.
It can show that a qualified buyer accepts the price and risk today.
It cannot prove repeat purchase, delivery cost, or scalable support.
Refund quickly if the promised delivery cannot happen.

## 6. Set thresholds before traffic or interviews

Write the decision table before the test starts. Include segment, source, sample, primary event,
threshold, date range, and owner.

Use these starting rules. They are operating thresholds, not industry benchmarks:

- Interviews: run ten; stop or narrow if fewer than five show the same recent, costly problem.
- Landing or waitlist: collect 100 qualified visits for a directional read; prefer 200.
- Landing or waitlist: require ten qualified actions; unqualified emails do not pass.
- Concierge: secure three paid or explicitly approved pilots from qualified buyers.
- Pre-order: require three paid orders from buyers with no personal connection to the team.

Unbounce's [2024 benchmark report](https://unbounce.com/conversion-benchmark-report/)
shows large differences by industry and channel. Its SaaS page reports a 3.8% median for its dataset,
not a universal target. Do not compare cold paid social with warm referrals, existing users, or friends.
For small samples, use absolute counts and buyer quality. Do not treat four clicks as precise.
Do not copy a benchmark to rescue a weak test. Set a stop date.

## 7. Kill criteria and permission to kill

A no is a useful factory output. It prevents code, naming, launch, and support work from growing around a weak idea.
Kill or return to discovery when:

- You cannot name ten qualified people or companies.
- Fewer than five of ten interviews show the same recent, costly problem.
- People report pain but show no workaround, cost, or urgency.
- The best segment misses the written landing or waitlist threshold.
- Interest comes from the wrong segment or has no buying path.
- No qualified buyer accepts a manual pilot after the agreed outreach effort.
- No qualified buyer pays the written price after one offer revision.
- Delivery cost or required access makes the outcome uneconomic.
- Positive evidence comes only from friends, employees, or incentive-seeking testers.

Do not rename, polish, or scaffold a killed idea to avoid the decision.
Archive notes, source links, copy, and test data in a dated decision record.
Keep reusable customer learning. Delete throwaway assets that can mislead the next idea.
If the signal is mixed, change one variable only: customer, problem, offer, channel, or price.
Write the new assumption and thresholds before another test.

## What follows a yes

After a yes, use `name-a-product` to clear the product name and domain.
Then use `build-from-template` when the product is web-app-shaped.
Use `landing-page` or `marketing-site` to build the test surface.
Use `launch-analytics` for acquisition measurement.
Use `product-analytics` after code exists and the product has activation events.
Do not re-teach those skills here. This skill decides whether to use them.

## Checklist

- [ ] Write one riskiest assumption with a falsifying result.
- [ ] Define the ICP with trigger, workflow, cost, buyer, and reach channel.
- [ ] List ten real people or companies by name and qualification.
- [ ] Ask about the last real event, not a hypothetical purchase.
- [ ] Record behaviour, workaround, cost, authority, and next action.
- [ ] Review five direct competitors, two substitutes, and the manual workaround.
- [ ] Link complaints and prices to dated public sources.
- [ ] Choose the cheapest test that can falsify the assumption.
- [ ] Disclose a fake door and provide a real next step.
- [ ] Set sample, event, threshold, source, and stop date before testing.
- [ ] Use absolute counts for small samples and keep sources separate.
- [ ] Kill or narrow the idea when the written criteria fail.
- [ ] Archive learning before `name-a-product` or `build-from-template`.
