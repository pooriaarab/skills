---
name: ad-experiments
description: "Run paid-ad experiments on a small budget so you learn WHICH variable drives signups and WHY — hyper-specific one-audience×one-geo×one-creative experiments driven by a written hypothesis, proving the cheapest measurable conversion (free signup) before the expensive one (paid), and judging results on server-side truth reconciled against payment-provider ground truth rather than dashboard vanity metrics. Platform-agnostic methodology that pairs with the google-ads, meta-ads, and reddit-ads tracking/setup skills. Use when planning a paid-ad test, structuring ad experiments, or deciding what to measure and how to read the result."
---

# ad-experiments

How to run paid-ad experiments on a small budget so you learn *which* variable drives signups and *why*, instead of dumping the budget into one broad campaign and reading a dashboard. Platform-agnostic — pairs with the `google-ads`, `meta-ads`, and `reddit-ads` skills, which cover the tracking and campaign setup for each channel.

## Run hyper-specific experiments

- Test **one narrow audience × one geo × one creative per experiment** (e.g. "photographers in `<city>`", "restaurants in `<city>`") — not a broad "everyone, everywhere" campaign. A broad campaign averages every variable together, so a win or loss tells you nothing about *why*; a narrow experiment isolates the one thing that moved.
- Each experiment starts from a **written hypothesis** ("`<this audience>` in `<this geo>` will sign up from `<this angle>`"), tunes its settings deliberately to test that hypothesis, and measures against a **denominator** — clicks → signups, not raw impressions or spend.
- **Keep the winners, kill the losers, iterate.** The point of narrowness is a clean attribution of cause: feed what won into the next round and vary one more thing.

## Prove the cheapest conversion first

- Optimize toward the **cheapest measurable conversion** (a free signup) before you optimize toward the expensive one (a paid subscription). A small budget can produce enough free signups to read a funnel; it usually can't produce enough paid conversions to learn anything from.
- This also matches the bidding reality: conversion-optimized delivery needs conversion *volume* to work (Google Smart Bidding, Meta's learning phase, Reddit's conversion optimization all need conversions to learn — see the per-platform skills), and the cheap conversion is the one you can actually generate enough of.

## Verify against server-side truth

- Judge an experiment on **server-side conversions** (GA4 / the platform's own server-side event counts) reconciled against **payment-provider ground truth** — actual succeeded charges or created accounts — never dashboard vanity metrics alone. Ad dashboards over-report; your payment provider and your own database don't.
- A conversion count of **0 over a window that predates your tracking deploy** is expected, not a result. Check the deploy date before drawing any conclusion.

## The learning arc — where the lever actually is

Run experiments in this order; each stage tells you where the *next* bottleneck lives:

1. **Cold targeting rarely reads.** Cold interest/keyword targeting on a small budget gives thin CTR and usually 0 measurable signups — not enough signal to conclude anything. Don't keep feeding a cold campaign hoping it warms up; it won't at this budget.
2. **Warm lookalike fixes engagement.** Build a lookalike seeded off your *highest-value existing users* and it typically delivers **4–5× the CTR at a lower CPC** than cold. If your problem was clicks, this solves it.
3. **Then the bottleneck moves downstream.** Warm, engaged traffic can still convert to **0 signups** — which means the problem was never the audience, it's the **message and the landing page**. Say it plainly: once warm CTR is healthy, *targeting is solved; conversion is the lever.* Stop tuning audiences and start testing messages/LPs.

Most wasted ad spend comes from tuning the stage you already solved. Diagnose which stage you're in before spending.

## Isolate one variable — the message test

- To test **message/angle**, hold the audience **constant** (same lookalike) and vary **only** the creative angle, each pointing at its **own dedicated landing page** built for that angle. Tag every angle with distinct UTMs and read per-ad breakdown so attribution is clean. Changing audience *and* message at once tells you nothing about which moved the result.
- Swapping a creative to iterate: do it while spend is still ~0 so you don't discard a learning read.

## Truthfulness gate (do this BEFORE writing any angle)

- **Audit what the product actually does before you write copy.** Never advertise a capability the product lacks — it's false advertising even when it's beautiful market whitespace, and it tanks conversion when the click meets a page that can't deliver.
- The winning angle is the intersection: **(competitor-message whitespace) ∩ (what you can truthfully deliver).** A market-gap tool may surface "analytics dashboard" or "online store" as gaps, but if the product only *connects a third-party analytics tag* or only *embeds a third-party store*, those angles are OUT — pick something real.

## Competitor-intel loop (finds the angle)

- Scrape competitors' live ads from the platform's public ad library, and extract each ad's **angle / promise / outcome**. Where **everyone says the same thing** (e.g. "AI builds your site, fast, cheap") you've found message saturation — sameness is why nobody's click is *yours*.
- Your opening is a **differentiated, truthful** angle no one else runs. A **brand/trust differentiator a competitor structurally cannot copy** (who you're made by, a privacy stance) is the strongest kind, because it's not a feature they can ship next sprint.

## Spend discipline

- **Feasibility-test an unproven platform cheap first** (a ~$50 "does it even serve and get clicks" run) before committing real budget — especially one with a fragile audience-upload path.
- **Set hard per-platform caps.** Where a platform's *campaign* budget floor is high, cap at the *ad-group* level instead (see `reddit-ads`).
- **Scale the winner, not the average.** Once one angle/arm wins, put budget there — don't keep spending equally across the losers to "be fair" to them.
- **Kill-gate:** pause an ad/arm when **(spend ≥ threshold) AND (CTR < floor)** (e.g. spent ≥ $30 and CTR < 0.5%). Wire it into a monitor, don't eyeball it.

See the per-platform skills for wiring up that server-side tracking and campaign setup: `google-ads`, `meta-ads`, `reddit-ads`.
