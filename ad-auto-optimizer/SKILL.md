---
name: ad-auto-optimizer
description: "Operate live paid-ad experiments on a fixed schedule (e.g. every 6h) as an autonomous optimizer that reads every platform, then adjusts within hard guardrails — auto-applying only the safe/reversible levers and recommending (never silently making) the learning-resetting ones. Covers the lever tree (creative kill-gate, audience widen, landing-page test, budget/bid tilt, feature-utilization audit), the auto-apply-vs-recommend split, anti-thrash rules, spend-cap guardrails, and loud escalation on the events that actually matter (first signup, a channel finally serving, a kill, tracking shipping). Also encodes the operating truths that only surface after many cycles: ad-platform reporting is unreliable (verify with authoritative queries before acting), delivery-solved is not conversion-solved (stop tuning a stage you already fixed), you cannot optimize what you cannot measure, and budget optimizers concentrate spend (so fund few powered cells, not many starved ones). Pairs with ad-experiments (which designs the experiment) and the ads-google/ads-meta/ads-reddit setup skills. Use when running/monitoring live ad experiments, building a recurring optimizer loop, or deciding which lever to pull vs escalate."
---

# ad-auto-optimizer

How to *operate* live paid-ad experiments as a scheduled autonomous loop — the companion to `ad-experiments` (which *designs* the test). `ad-experiments` picks the hypothesis; this skill runs the every-N-hours loop that keeps the winners fed, kills the losers, and — critically — knows which levers it may pull on its own and which it must hand back to a human. Pairs with the `ads-google`, `ads-meta`, and `ads-reddit` skills for the per-platform reads/writes.

## The loop each cycle

1. **Read every channel** (spend, impressions, clicks, CTR, landing-page-views) + the **conversion source of truth** (your own leads/signups store, not the ad dashboards) + the status of any **tracking work** the optimization depends on.
2. **Walk the lever tree** (below). For each lever decide: is it *safe + reversible* (auto-apply) or *learning-resetting* (recommend, don't touch)?
3. **Log every change and why.** Note anti-thrash state ("already adjusted X h ago").
4. **Escalate loudly** on the handful of events that matter; stay quiet on no-change cycles.

## Guardrails (never cross without a human)

- **Stay within the spend caps** you were given. **No net-new campaigns, no raising caps, no net-new spend** — those are human decisions.
- **Anti-thrash:** don't re-edit the same lever two cycles in a row; a change needs time to read. Note when you last touched it.
- Some platforms **auto-pause an entity when you edit its budget/targeting** — always re-activate after the edit, and verify the status took.
- **Program-level moves are human calls, not auto-actions:** pausing a whole channel/experiment, starting a new one, or reallocating budget across experiments — recommend, don't execute, even when the data is one-sided. (An auto-loop that isn't hitting its *own* thresholds has no mandate to make a strategy decision.)
- **Don't scale budget while blind or while LP conversion is unoptimized.** Sequence it: make conversions measurable → optimize LP conversion rate (social proof, an output/preview visual, one clear CTA) → *then* scale spend against a real cost-per-conversion target. Scaling an unmeasured or unoptimized funnel just buys more expensive clicks.

## The lever tree

1. **Creative (auto).** Kill an ad on a hard gate: spend ≥ threshold **and** CTR below floor. Write the kill gate down *before* you spend (e.g. "CTR < X% and 0 conversions after $N → stop") and honor it — don't keep funding a sub-threshold ad on hope. Concentrate — pause a 0–1-conversion laggard once it has spent enough to judge while siblings pull ahead. If the *winner's* CTR decays across cycles, that's fatigue → **recommend** a fresh variation (don't generate spend/creative without a human).
2. **Audience (recommend; one reversible auto-widen allowed).** If delivery goes flat for 2+ cycles, the seed/lookalike is saturating → recommend widening (e.g. 1% → 2–3% lookalike) or an age/geo shift. Only auto-apply a *reversible* widen once, and only on a clear no-conversion signal in the current segment; otherwise recommend (it resets learning).
3. **Landing page (recommend).** Healthy CTR but conversions stuck at zero at real volume ⇒ the LP/offer is the suspect, not the ads. Recommend an LP/CTA variant test. The LP choice carries a measurability trade-off — see "lower-friction landing vs measurable landing" below.
4. **Budget/bid (auto within cap).** Tilt toward the best arm *only when it's actually cap-bound* — tilting caps that aren't the binding constraint does nothing. Campaign-budget-optimization (CBO/auto-allocation) self-allocates; leave it. A stalled search campaign usually needs a bid-strategy or keyword fix, not a budget change.
5. **Feature-utilization audit (recommend, one line/cycle).** Name the single highest-value platform feature you're leaving unused — most often **conversion-optimized bidding**, which is the biggest lever but is *gated on real conversion tracking* being live. Surface it; don't switch to it until the tracking feeds it. It is **also gated on volume** — don't switch a campaign from click/traffic bidding to conversion bidding until it clears the platform's learning-phase threshold (order of magnitude: dozens of conversions per week; varies by platform). Track a weekly conversion counter per campaign so you know when each channel crosses the line; below it, conversion bidding starves.

## Escalate loudly on (and mostly only on)

First real lead / first signup · a channel that was dead **finally serving** · an **auto-kill** you performed · the **conversion-tracking dependency shipping** (it changes what you can optimize). Everything else on a no-change cycle is a one-liner.

## Operating truths (these only surface after many cycles)

- **Ad-platform reporting is unreliable — verify before you act or alarm.** The same metric can read `0` on one query shape and full-spend on another within the same hour. Trust **authoritative/explicit reads** (a fixed date-range query, the platform UI, your own conversion store) over convenience aggregates. Most "it's not running!" panics are a reporting artifact, not a delivery problem — confirm delivery a second way before you rebuild anything.
- **Delivery-solved ≠ conversion-solved.** Getting cheap, high-CTR traffic on every channel is the *easy* half. Most wasted spend goes into re-tuning the stage you already fixed. Once CTR/LPV are healthy and conversions are still zero, **stop optimizing ads** — the bottleneck moved downstream (LP → app → signup → paid), which is a product/onboarding fix, not an ad lever.
- **You cannot optimize what you cannot measure.** If signups aren't attributable per click, you're flying blind and every "optimization" is a guess. Getting conversion tracking shipped is a higher-value move than any ad tweak — treat it as the top recommendation until it lands. Until then, the readable proxy (landing-page-view, form lead) is a stand-in, not the goal.
- **"Zero conversions" is usually "zero *measured* conversions."** Before you call a channel dead — or scale it — wire click-id → server-side attribution: capture the click id on the landing page, consume it at the conversion event, fire it back to each ad platform and your analytics. Until that join is live, interest-channel results are invisible, not proven-zero. Measurement blindness is the costliest mistake here: it reads as "the channel doesn't qualify" when it means "we didn't measure."
- **Attribution you can do *today* vs later.** A lead that captured an email is verifiable now — match the email against your product's user/billing records to see free-vs-paid. A lead with only a click id (no email) is unverifiable until the click-id→conversion join ships. Report the measurable half; don't imply zero when it's just unfed.
- **Budget optimizers concentrate — fund few powered cells, not many starved ones.** Split a small budget across many cells and an auto-allocator dumps it all into one and starves the rest, so the "test" never runs. A handful of cells each above the platform's learning threshold beats a dozen below it.
- **Search with no volume looks broken but isn't.** Hyper-niche/long-tail keywords can be fully *eligible* yet get ~0 impressions — there simply aren't enough queries. The fix is broader head terms (with auto-bidding to win them), not recreating the campaign.
- **Lower-friction landing vs measurable landing is a trade-off.** A low-friction LP (paste-a-link / no form, prefilling the product's create flow) converts better but is unmeasurable without server-side attribution. A form/email-capture LP is measurable today but higher friction. Choose on whether attribution is live: no attribution → use the measurable LP; attribution live → use the low-friction one and measure via events.
- **Search intent beats interest/community intent for conversion.** Active search-keyword traffic converts to signups far better than interest- or community-targeting (social feeds, forums), which is top-of-funnel curiosity. Prove the cheapest conversion on high-intent search first; treat interest channels as volume/awareness bets, not signup bets.
- **Free→paid conversion is usually a product-funnel problem, not an ad problem.** Ads deliver signups; the upgrade to paid depends on the product's activation and paywall flow. If paid conversions sit near zero, first grow *measured free-signup* volume, then work the product's free→paid funnel (retarget activated-but-not-upgraded users). Ads alone cannot force the upgrade.
- **Auth tokens and creds expire mid-run.** Cloud ADC, OAuth tokens, and dev-token access tiers lapse on their own schedules; a "read failed" is often just an expired token, not a data problem. If a CLI 401s daily, its token-refresh is broken — fix the refresh, don't re-login forever.
- **APIs get sunset.** A write path that worked last quarter (e.g. a legacy conversion-upload endpoint) may now reject "new integrations" in favor of a newer API. Read the rejection; don't assume your call is wrong.
- **Small paid volume vanishes into organic baseline.** If the product already acquires users organically at scale, a few ad-driven signups are a rounding error in aggregate counts — which is another reason per-click attribution (not total-signup deltas) is the only honest read of ad performance.

## Anti-patterns

- Making a program-level decision (pause a channel, start an experiment) because the data "obviously" says so — that's the human's call; recommend it.
- Rebuilding a campaign off a single flaky "0" read.
- Re-tuning audiences/creatives when CTR is already healthy and the real gap is conversion.
- Reporting a long no-change cycle at full length — go quiet, escalate only on the events that matter.
