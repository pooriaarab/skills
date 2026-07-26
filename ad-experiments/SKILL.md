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

See the per-platform skills for wiring up that server-side tracking and campaign setup: `google-ads`, `meta-ads`, `reddit-ads`.
