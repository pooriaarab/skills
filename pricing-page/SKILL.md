---
name: pricing-page
description: "Design or revise a SaaS pricing page when the user asks 'how much should we charge', 'choose pricing tiers', 'package our plans', 'build a pricing page', 'free trial or free plan', 'add annual billing', 'price an enterprise plan', or 'raise prices for existing customers'. Use this skill for value metrics, packaging, pricing-page structure, pricing communication, and price-change policy. Point to `saas-billing-stripe` for Stripe billing mechanics, `regional-pricing-stripe` for PPP, and `product-analytics` for product measurement."
---

# Pricing Page

The headline decision: choose the value metric before tiers or prices.
Make the right buyer say, “This fits my use,” before showing every feature.
Use `saas-billing-stripe` for Checkout, subscriptions, trials, portals, taxes, and webhooks.
Use `regional-pricing-stripe` for PPP, currency tiers, and localized Stripe prices.
Use `product-analytics` for activation, retention, cohorts, and product event design.

## 1. Pick the value metric before the tiers

Charge against the unit that rises with customer value. The metric must stay understandable
before purchase and predictable enough for a customer to budget.

Good metrics include:

- Documents processed, when each document creates clear customer value.
- Storage used or workspaces, when each unit creates value or cost.
- Seats, when collaboration grows with each active person.
- Usage, when more usage reliably means more value and the customer can forecast it.

Bad metrics create a permanent pricing argument. Seats fail for a product used by one person.
API calls and feature counts fail when customers value the result, not the count.
Stripe supports flat-rate, per-seat, tiered, and usage-based models. See [Stripe pricing models](https://docs.stripe.com/products-prices/pricing-models).
The trap is charging for what the system can count instead of what the customer values.
This creates bill shock, workarounds, and growth penalties. Change the metric before tuning the amount.
Test the metric with four questions:

1. Does a larger value reliably mean a better customer outcome?
2. Can a buyer estimate the next bill before signing up?
3. Can the product show value, allowance, and the first useful action clearly?

If two answers are no, use a different metric or add a clear base allowance.
Do not create tiers until the metric passes this test.

## 2. Package the offer

Start with two or three paid tiers. Add enterprise only when its buying process differs.
Avoid five tiers that differ only by small limits or minor feature flags.
Separate tiers by outcomes, capacity, control, or service. Give each tier one primary reason to exist.
A buyer should know who each tier serves without reading a feature matrix.
The good, better, best pattern persists because it gives buyers a small comparison set. See the [choice-overload meta-analysis](https://doi.org/10.1016/j.jcps.2014.08.002).
Stripe describes flat-rate tiers as Basic, Starter, and Enterprise service levels.
Choice overload depends on task difficulty, option complexity, and uncertainty, not option count alone.
Use the pattern as a decision aid, not as a reason to manufacture a weak plan.

Use this package shape as a starting point:

- Entry: proves the core outcome with a strict, useful limit.
- Core: serves the main customer and carries the clearest value story.
- Expansion: adds scale, controls, service, procurement, or custom scope.

### Free plan or free trial

Use a free plan when marginal cost is low, the free use case lasts, and the upgrade boundary is clear.
Limit scale, collaboration, automation, or support, but keep the free plan useful.
Use a free trial when the product demonstrates value quickly and needs to limit ongoing free usage.
Define the activation event before setting the trial length.
A free plan supports a product-led loop. A trial supports a time-boxed evaluation.
These are operating choices, not interchangeable labels.
Collect a payment method only when the audience accepts the step and the first charge is clear.
A no-card trial reduces entry friction, but it increases fake signups and needs an end policy.
Stripe can cancel, pause, or invoice a trial without a payment method. Read [Stripe trial behavior](https://docs.stripe.com/billing/subscriptions/trials) before wiring it.

## 3. Build the page around the buying decision

Lead with the customer, outcome, and starting price. Put the plan choice near the first proof.
Make the next step obvious for every plan.

Use this page order:

1. State the outcome and the customer who needs it.
2. Show monthly and annual terms with one clear billing toggle.
3. Show plan cards with price, audience, outcome, limits, and one CTA each.
4. Explain the value metric and add proof that matches the buyer.
5. Add a comparison table and an enterprise path when needed.
6. Answer purchase objections in the FAQ.

Put the entry plan first, the core plan in the visual center, and the expansion plan last.
Make the core plan the anchor for most self-serve buyers only when data supports that role.
An anchor is a credible reference that helps a buyer judge another price.
The highest plan can anchor the core plan, but it must solve a real larger problem.
Do not add a fake decoy. See [Huber, Payne, and Puto](https://doi.org/10.1086/208899).

### Monthly and annual prices

Show the monthly equivalent, the annual total, the amount charged today, and exact savings.

Use this calculation:

```text
annual saving = (12 × monthly price) - annual price
discount = annual saving / (12 × monthly price)
```

Write “$X per month, billed $Y annually” when the annual amount is due upfront.
Write “Save $Z per year, 16.7%” when the discount is not exactly two free months.
Do not use “two months free” unless the annual total equals ten monthly payments.
Stripe can display eligible annual prices as monthly equivalents in Checkout and pricing tables.
See [Stripe yearly price display](https://docs.stripe.com/payments/checkout/yearly-price-display).
Keep the full annual charge visible on your own page.

### Feature table and FAQ

Use the feature table for comparison, not persuasion. Put metric limits and meaningful controls in rows.
Use plain values such as “10 projects” or “email support,” not unexplained checkmarks.
Use the FAQ to remove objections that stop a card. Answer who pays, when billing starts, what happens
at a limit, whether cancellation is immediate, and what the annual charge means.
Do not hide material fees or restrictions in the FAQ. Put them beside the relevant price.

## 4. Enterprise and “contact us”

Use a hidden price when the scope cannot be priced from the page. Valid reasons include custom volume,
security review, procurement, service levels, onboarding, or negotiated terms.
Show a starting price when the enterprise package is repeatable. State scope, buyer, and next step.
“Contact us” alone does not explain the buying process.

Hidden pricing loses self-serve buyers when plans are standard and usage is clear.
It blocks comparison before a buyer knows whether the product fits. See research on [price intransparency](https://link.springer.com/article/10.1007/s10603-011-9163-8).
Offer two paths when both motions exist: “Start self-serve” and “Talk to sales.” Keep the standard price visible.
Route only the custom part to sales.

## 5. Change prices for existing customers

Choose the customer policy before publishing the new page:

- Grandfather the old price until cancellation. This protects trust but keeps old catalog states.
- Grandfather for a fixed period. This gives notice and a clean migration date.
- Move every customer on a stated date. This simplifies the catalog but raises churn risk.

Use the signed contract and local law to set notice periods. Do not invent one universal period.
Tell customers the old price, new price, effective date, reason, and available choices.
Give notice before the first renewal at the new price.
Stripe keeps a record of prices. You cannot change a Price amount after creation.
Create a new Price, switch new purchases, and archive the old Price when appropriate.
See [Stripe price management](https://docs.stripe.com/products-prices/manage-prices).

An existing subscription does not move because the page changed. Updates can prorate or invoice.
If you omit the subscription item ID, Stripe can leave the old price active too.
Read [Stripe subscription price changes](https://docs.stripe.com/billing/subscriptions/change-price).
Point to `saas-billing-stripe` for webhook, portal, access, and environment handling.
Do not repeat its Stripe integration mechanics here.

## 6. Measure whether pricing is wrong

Use a funnel that separates page clarity from payment friction:

```text
pricing_viewed → plan_selected → checkout_started → subscription_started
```

Track plan, billing period, value metric, acquisition source, and experiment version.
Keep price and plan changes identifiable in the event data.

Read the numbers as failure locations:

- Low plan selection suggests unclear value, weak packaging, or price shock.
- Strong plan selection but weak checkout starts suggests CTA, trust, or eligibility friction.
- Strong checkout starts but weak subscriptions suggests payment, tax, total-price, or form friction.
- Good conversion but weak upgrades, activation, or retention suggests a weak offer boundary.

Use interviews and support objections to explain the drop. Do not infer the cause from one metric.
Point to `product-analytics` for event naming, activation, funnels, retention, and cohorts.

## 7. What not to do

- Do not use fake scarcity, reset countdowns, or false “ending soon” claims.
- Do not hide mandatory fees, tax treatment, limits, or annual totals until checkout.
- Do not call a tier “Most popular” without observed purchase evidence.
- Do not add a “Best value” badge only because you want to sell that tier.
- Do not make the cheapest plan useless or the highest plan fictional.
- Do not let a feature table replace outcome-led plan descriptions.

The FTC identifies fake countdown timers and buried fees as dark patterns.
See [Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light).

## Checklist

1. Name the customer outcome and value metric.
2. Reject metrics that are hard to forecast or punish success.
3. Choose two or three tiers with distinct customer jobs.
4. Decide between a free plan and a time-boxed trial.
5. Define activation before setting a trial length.
6. Show monthly terms, annual total, exact saving, and billing timing.
7. Explain metric limits with concrete examples.
8. Use the table for comparison and the FAQ for objections.
9. Show enterprise starting prices when the package is repeatable.
10. Set the existing-customer policy and notice date.
11. Create new Stripe Prices; read `saas-billing-stripe` for mechanics.
12. Track pricing events, then compare activation and retention by plan.
13. Remove fake scarcity, hidden fees, unsupported badges, and fictional tiers.

## Related

- `unit-economics` — whether the price you picked actually pays for acquisition.
- `founder-led-sales` — sales calls are where pricing objections surface first.
