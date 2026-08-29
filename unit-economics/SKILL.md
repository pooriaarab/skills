---
name: unit-economics
description: "Use when a founder or growth team asks 'can we afford paid acquisition?', 'what is our CAC payback?', 'calculate LTV:CAC', 'what is our SaaS unit economics?', 'is this channel profitable?', or 'how much can we spend to acquire a customer?'. Use it to connect Stripe revenue, PostHog retention, and channel attribution before scaling acquisition. Do not use for Stripe billing implementation, product retention instrumentation, or ad platform setup alone."
---

# Unit economics

Acquire customers only when expected contribution can repay CAC within the business's cash limit.
A good-looking LTV:CAC ratio does not prove this. Use Stripe for paid revenue, refunds, and payment fees.
Use PostHog for product retention cohorts. Use the finance ledger for other costs.

## When to use this

**Trigger if:** the ask mentions unit economics, LTV, CAC, CAC payback, contribution margin, channel
profitability, paid acquisition limits, or whether a growth channel is affordable.

**Skip if:** the ask only adds Stripe subscriptions, measures product retention, or configures an ad
platform. Point those tasks to `saas-billing-stripe`, `product-analytics`, or the relevant skill.

## 1. The four numbers that matter

Keep each number's source, customer unit, revenue basis, and time window visible.

| Number | Definition | Main source |
| --- | --- | --- |
| Gross margin | `(revenue - COGS) / revenue` | Stripe plus the cost ledger |
| CAC | Fully loaded acquisition cost / new paying customers | Finance, channel data, time records |
| LTV | Expected gross profit per customer over a stated horizon | Stripe, PostHog, cost data |
| Payback | CAC / monthly contribution margin per customer | The four numbers plus a cash policy |

Stripe provides payment amounts, refunds, and fees. Its [balance reports](https://docs.stripe.com/reports/balance) show gross, fee, and net activity. Its [balance transactions](https://docs.stripe.com/api/balance_transactions) expose `amount`, `fee`, and `net` for individual balance movements.

Stripe does not provide CAC or product churn. PostHog provides retention cohorts from a defined start event and return event. Read its [retention documentation](https://posthog.com/docs/product-analytics/retention) before choosing them. PostHog does not provide cash revenue. Mixing definitions causes different people to quote different numbers.

Write these choices beside every report: customer unit, collected or recognized revenue, cohort window, acquisition date, logo or revenue churn, and included costs. Exclude sales tax collected for a government. Include refunds, credits, and discounts according to the chosen revenue basis. Keep cash and recognized revenue in separate columns when they differ.

## 2. Compute LTV honestly

The textbook formula is:

```text
LTV = monthly ARPA * gross margin / monthly logo churn
```

It assumes constant churn forever. It overstates a young product because its churn window is short, its denominator is unstable, and early customers may not represent the target market. It also hides expansion, contraction, refunds, discounts, annual plans, and different segments.

Use expected gross profit over a bounded horizon instead. Twelve or twenty-four months is useful when the
product has limited history.

```text
bounded gross profit per customer
  = sum(monthly gross profit * probability customer remains active in month t)
    for t = 1 through the chosen horizon
```

For a cohort, replace probability with observed retention for each month. Use PostHog's activation event as the cohort start and a meaningful product action as the return event. Do not use logins when value comes from a completed job or report. See `product-analytics` for event identity.

Use Stripe billing state to confirm paying-customer churn. Use PostHog retention to explain product value.
Do not call a user retained because an invoice exists, or churned because one event was missed. Report
conservative, base, and optimistic cases. Change churn, ARPA, margin, and expansion separately.

## 3. CAC must be fully loaded

Use this formula for each channel and cohort:

```text
CAC = (ad spend + channel tools + agency or creative cost + human time cost)
      / new paying customers
```

Count people who pay, not impressions, leads, signups, or free accounts. Include founder time at a stated replacement cost for sales, content, support, or campaign work. Include commission, landing pages, lead tools, and experiment cost when they support acquisition.

Media-only CAC flatters every channel. Organic CAC is not zero when content, partnerships, or sales time creates it. Align spend with the cohort it acquires. State attribution and conversion windows.

## 4. Payback constrains a bootstrapped factory

Payback measures how long the business funds a customer before recovering CAC from contribution.

```text
payback months = fully loaded CAC / monthly contribution margin per customer
```

Use cash contribution when deciding whether the business can fund the next customer. A customer can be profitable over five years and still consume cash for eighteen months first. Growth increases that funding gap. An 18-month payback can bankrupt a company with a 5:1 LTV:CAC ratio.

At this size, payback usually matters more than the ratio. Set a maximum before a test starts. Stop or reduce a channel when conservative payback exceeds it. Annual prepayment can improve cash recovery. Report cash collection and revenue recognition separately. Do not treat an annual invoice as twelve months of earned profit.

## 5. Use LTV:CAC as a rule of thumb

```text
LTV:CAC = expected gross profit per customer / fully loaded CAC
```

The familiar 3:1 rule came from David Skok's observations of SaaS companies. His [SaaS Metrics 2.0 definitions](https://www.forentrepreneurs.com/saas-metrics-2-definitions/) explain that the original twelve-month payback guidance fit an older capital environment. He notes that healthy SaaS businesses can take about twenty months, while more than twenty-four months needs improvement.

Treat 3:1 as a conversation starter, not a law or industry average. A young product can show 3:1 only
because its LTV assumes churn will stay low forever. Check bounded LTV, conservative payback, cash
available, gross margin, and customer concentration. A high ratio with weak evidence is a forecast.

## 6. Calculate each channel, not only the blend

Blended CAC hides one channel subsidising another. Report CAC, activation, retention, payback, and bounded gross profit by channel. Point conversion work at `ad-conversion-hub`. Use its canonical conversion event and attribution fields. Keep the model, lookback window, and cost period beside each result.

Attribution is imperfect. Last-click credit does not prove a channel caused the purchase. Treat channel economics as directional until volume supports a holdout, geo test, or other incrementality test. Do not compare paid CAC with blended LTV. Paid cohorts may have different plans, retention, discounts, support load, and AI usage.

## 7. Calculate contribution margin per customer

Contribution margin is the money left after costs that increase when the customer uses or buys the product. Use it for payback and channel decisions.

```text
monthly contribution margin
  = customer revenue - payment fees - refunds and usage credits
  - infrastructure cost - support cost - AI inference cost
```

Payment fees vary by method, market, and currency. Stripe's [current pricing](https://stripe.com/pricing) lists examples and says the fee depends on the payment method. Do not hardcode one rate. Reconcile actual fees from balance transactions or reports.

Map infrastructure to usage. Include requests, storage, database operations, queues, and data transfer when they rise with customer activity. Current [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) shows why request and CPU usage need separate measurements.

Measure support time per customer with a loaded staff cost. If the product calls a model, record model, input size, output size, calls, retries, and cost per customer. Use the chosen provider's current price table. For Workers AI, check [current inference pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

Keep product development and general overhead outside contribution margin unless they vary with each customer. Keep them in the cash plan. Positive contribution margin does not prove company profit.

## 8. Know when the numbers are too noisy

With very few customers, the confidence interval is wider than the decision. One cancellation can move churn, LTV, and payback by more than the proposed campaign budget.

Do not tune bids or declare a channel good from a tiny sample. Use a decision interval:

- conservative case: worst credible retention and highest credible variable cost;
- base case: current cohort estimate;
- optimistic case: improvement that has evidence, not hope.

If the interval crosses the spending rule, the result is not ready for scaling. Cap the test budget.
Define the next evidence needed. Use interviews, founder-led sales, pricing tests, and activation
work before buying more traffic. Label each input observed, estimated, or assumed. Recompute the same
definitions each month.

## 9. Worked example

Assume a paid channel spends $7,000 and produces five new paying customers.

```text
CAC = $7,000 / 5 = $1,400
```

The $7,000 includes $5,000 media, $300 tools, $700 founder sales time, and $1,000 creative. The
subscription price is $100 per month.

```text
payment fee                 = $100 * 2.9% + $0.30 = $3.20
infrastructure              = $5.00
support                     = $7.00
AI inference                = $8.00
monthly contribution        = $100 - $3.20 - $5 - $7 - $8 = $76.80
gross margin                = $76.80 / $100 = 76.8%
payback                     = $1,400 / $76.80 = 18.23 months
```

The card rate is illustrative. Confirm the account's actual Stripe rate before using the result. For this example, all listed delivery costs are COGS, so gross and contribution margins match.
Assume PostHog shows 1% monthly logo churn. The textbook result looks strong:

```text
textbook LTV       = $100 * 76.8% / 1% = $7,680
textbook LTV:CAC   = $7,680 / $1,400 = 5.49:1
```

Use a bounded horizon. Expected retention in month `t` is `0.99^(t-1)`.

```text
12-month gross profit = $76.80 * (1 - 0.99^12) / (1 - 0.99)
                      = $76.80 * 11.36
                      = $872.45
12-month LTV:CAC      = $872.45 / $1,400 = 0.62:1
```

The ratio looks excellent only under an infinite-horizon assumption. The 18-month payback and
bounded result say this channel is not yet affordable for a cash-constrained business.

## Checklist

- [ ] Define the customer unit, revenue basis, cohort window, and churn definition.
- [ ] Pull payment, refund, and fee data from Stripe.
- [ ] Pull activation and retention cohorts from PostHog.
- [ ] Record infrastructure, support, AI inference, tools, and human time costs.
- [ ] Calculate gross margin and contribution margin separately.
- [ ] Calculate fully loaded CAC from acquisition cost and new paying customers.
- [ ] Use bounded expected gross profit for a young product.
- [ ] Set a maximum conservative payback before funding a channel.
- [ ] Report LTV:CAC beside payback and cash needs.
- [ ] Break out every channel and document attribution limits.
- [ ] Label each input as observed, estimated, or assumed.
- [ ] Stop scaling when the confidence interval crosses the decision rule.
- [ ] Recompute the same definitions each month.
- [ ] Point billing implementation to `saas-billing-stripe`.
- [ ] Point event and cohort implementation to `product-analytics`.
