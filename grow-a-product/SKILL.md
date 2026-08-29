---
name: grow-a-product
description: "Orchestrator: sequence a launched product's growth loop — instrument, fix activation, hold retention, charge properly, then acquire through organic, human sales and paid, in that order. Points at the stage skills rather than duplicating them. Use after `ship-a-product` has put something live, or when the ask is 'we launched and nothing is happening', 'how do we get users', 'growth plan', 'the launch spike died', or 'we have traffic but no revenue'. Not for building or launching the product — that is `ship-a-product`."
---

# grow-a-product

`ship-a-product` ends at the announcement. That is deliberate: it is a launch
orchestrator. This is what happens next, and it is a loop rather than a
pipeline — you will run it many times on the same product.

```
0. product-analytics       live product -> you can see activation, funnel, retention, cohorts
1. (fix activation)        signup -> the moment the product first delivers its value
2. (hold retention)        the retention curve flattens instead of going to zero
3. saas-billing-stripe     a human can pay, on a plan that makes sense
   + pricing-page          the price and packaging are decided and presented
   + regional-pricing-stripe  only if the market spans wildly different incomes
4. launch-seo, geo-aeo     found by search engines and answer engines
   + content-rabbit        an ongoing publishing cadence, not a one-off launch post
5. founder-led-sales       the first customers, by hand, for anything not cheap self-serve
6. ad-conversion-hub       one canonical conversion event, consented and deduplicated
   + google-ads / meta-ads / the platform adapter you actually buy on
   + ad-experiments        a test with a decision rule written before it runs
   + ad-auto-optimizer     only once there is enough volume to optimise anything
7. lifecycle-email         welcome, activation, trial-ending, abandoned checkout, dunning, win-back
   + release-notes         shipping visibly is retention work, not marketing
8. incidents               you find out it broke before your customers tell you
```

## The order is the whole point

Most growth work fails by starting at stage 6. Paid acquisition into a product
with broken activation is the fastest way to spend money proving you have a
product problem. Each stage below is cheap to skip and expensive to have
skipped.

- **Nothing before stage 0.** You cannot fix a funnel you cannot see, and you
  cannot reconstruct last month's cohort from a tool you installed today.
  `launch-analytics` (stage 6 of `ship-a-product`) measures traffic;
  `product-analytics` measures whether anyone came back. You need the second one
  here.
- **Activation before acquisition.** If people sign up and never reach the
  value, more signups produce more churn and a worse reputation. Find the
  activation moment in `product-analytics`, then move that number.
- **Retention before spend.** A retention curve that goes to zero means paid
  acquisition is renting users, not buying them. Look at whether the curve
  flattens, not at how high it starts.
- **Charging before scaling.** A free product with no billing path has no
  signal about value and no money to fund acquisition.

## Deciding where to enter

- **Just launched, nothing is happening?** Stage 0. Almost always the answer is
  that nobody knows what "happening" would look like, because nothing is
  instrumented past pageviews.
- **Signups but no usage?** Stage 1. This is an activation problem, and buying
  more signups makes it worse.
- **Usage but nobody comes back?** Stage 2. Stop here. Do not spend on
  acquisition until the curve flattens.
- **People stay but nobody pays?** Stage 3. Usually packaging, not price.
- **Product works, nobody knows it exists?** Stages 4 to 6, in that order.
  Organic compounds and costs time; sales teaches you the objections; ads cost
  money and teach you the least.
- **Paid is running and losing money?** Go back to stage 0 and check the
  conversion event is real before touching the campaign. A hub event that never
  fires looks exactly like a bad campaign.

## What this skill does NOT replace

Stage 1 and stage 2 are product work, not marketing work. There is no skill for
"make the product good enough that people come back" because that is the actual
job. This orchestrator makes sure the surrounding stages are not skipped or
reinvented; it cannot substitute for the product being worth returning to.

## The measurement that decides everything

One number ends most arguments: does the retention curve flatten? A curve that
flattens at any height is a business, because the flat part is the population
that keeps the product. A curve that reaches zero is a leaky bucket, and every
stage after 2 pours water into it.

Build that curve in `product-analytics` before agreeing to any spend.

## Cost and delegation shape

Same pattern as `ship-a-product`: judgment stays with the highest-tier model —
what the activation moment is, what to charge, whether a retention curve is
good enough — and mechanical execution goes to a cheaper one. Do not spend on a
later stage until the earlier one is measured, not merely believed. Confirm
activation before funding acquisition; confirm the conversion event fires before
scaling a campaign.

## Related

- `ship-a-product` — everything before this: name, build, repo, SEO, launch.
- `validate-an-idea` — earlier still. If stage 2 keeps failing, the answer may
  be that the idea was never validated.
- `agentification` — a distribution channel this loop does not cover: being
  discoverable and usable by agents rather than people.
