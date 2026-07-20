---
name: regional-pricing-stripe
description: "Set up regional / PPP-adjusted pricing for a SaaS product on Stripe — pick currency_options over coupons for a pre-checkout localized-price display, build discount tiers per currency (not per country), source the discount percentages from real PPP data instead of guessing, and roll the change out sandbox-first with explicit human sign-off before touching production. Use when the user asks for 'PPP pricing', 'regional pricing', 'localized prices', 'purchasing-power pricing', 'country-based discounts', or wants cheaper prices shown to lower-income markets on a Stripe-billed product."
---

# Regional Pricing on Stripe

The headline decision: **`currency_options` on the Price object, not coupons.** Coupons
are a checkout-time discount mechanism — there's no API to preview a coupon-plus-FX-converted
price *before* checkout, so they can't back a pricing-page display. `currency_options` stores
a fixed amount per currency directly on the Price and is readable with a plain GET, which is
exactly what a pre-checkout display needs.

The second decision, easy to get backwards: **tiers are per currency, not per country.**

## When to use this

**Trigger if:** the ask is to show lower prices to lower-income markets, "PPP pricing",
"regional discounts", localized pricing pages, or anything that discounts by country/region
on a Stripe-billed product.

**Skip if:** the discount only needs to exist at checkout (promo codes, time-limited sales,
partner discounts) with no pre-checkout price *display* requirement — plain Stripe coupons
are simpler and correct for that case. Regional PPP pricing is specifically a display problem
first, a checkout problem second.

## 1. Mechanism: `currency_options`, not coupons

Stripe Prices support a `currency_options` map: one fixed `unit_amount` (or amount set) per
ISO currency code, set on the Price object.

- **Write:** update the Price with a `currency_options` map (one call, all currencies for
  that price).
- **Read:** retrieve the Price with `expand: ['currency_options']` to see what's currently set,
  before and after any write.

Why not coupons: a coupon only resolves at checkout-session-creation time. To show "$8/mo" on
a pricing page for a visitor in a lower-PPP country *before* they start checkout, you need a
number you can read back right now — `currency_options` gives you that directly; a coupon
gives you nothing to display.

**Adjacent gotcha, note it and move on:** if the account has Stripe Adaptive Pricing enabled
(automatic neutral-FX conversion per currency), setting `currency_options` for a given currency
**disables** Adaptive Pricing for that currency specifically. The two are mutually exclusive
per currency by design — you're replacing Stripe's neutral FX conversion with your own
PPP-adjusted number for every currency you touch. That's usually the point, but say it out loud
before the rollout so nobody's surprised the "automatic" conversion silently stopped applying
to just the currencies you customized.

## 2. Granularity: tiers by currency, not by country

The natural first instinct — build a country → discount-tier table, "Germany: tier 2, Latvia:
tier 4" — breaks the moment you try to apply it, because `currency_options` only lets you set
**one amount per currency**, and a single currency can span countries at meaningfully different
purchasing-power levels. Eurozone is the clean example: Germany is near income-parity with the
reference market, the Baltic states are meaningfully cheaper — but they share EUR, so one Price
literally cannot hold two different EUR amounts for the two of them.

**Fix: build the tier table at the currency level from the start.** Every discount decision is
"what does this currency get," never "what does this country get." The tradeoff is explicit and
worth stating to whoever signs off: countries sharing a currency get identical pricing regardless
of their individual PPP, because the mechanism has no country-level dial. If country-level
granularity is a hard requirement, `currency_options` is the wrong mechanism entirely (you'd need
IP/billing-country gating in front of checkout instead) — flag that up front rather than
discovering it mid-build.

For a currency zone spanning several countries, pick one **representative country** for that
zone's tier (population-weighted, or the most economically dominant member) and write down which
country and why — that choice is a real editorial call, not a rounding detail, and someone will
ask about it later.

## 3. Source the tier percentages — don't invent them

Discount percentages are a factual claim about relative purchasing power, not a design choice.
Blend three sources rather than picking one:

1. **Primary, raw data:** World Bank PPP conversion factors (or IMF World Economic Outlook data
   as a substitute where World Bank coverage is thin). This is the actual purchasing-power ratio
   between the reference market and the target market/currency zone.
2. **Lightweight sanity check:** the Big Mac Index, for major markets only — it's a rough,
   widely-cited cross-check, not a primary source, but a discount that contradicts it by a wide
   margin for a big market is worth a second look.
3. **Reasonableness cross-check against practice:** published SaaS PPP tier guides (e.g. Paddle's
   PPP pricing guide, ParityDeals' public tables, Gumroad-style public discount tables). These
   tell you what discount level the market has already normalized around for digital products —
   useful for catching a raw-PPP number that's technically correct but so aggressive it reads as
   a pricing bug.

**When raw PPP and a published guide diverge significantly for the same market, flag the
divergence explicitly and ask which to weight — don't quietly average them.** Averaging hides a
real disagreement between "what the data says" and "what the market has already accepted"; a
human should see both numbers and choose, or choose a middle ground on purpose.

## 4. Safety workflow — sandbox first, sign-off twice

This is a money-facing, irreversible-in-effect change (customers see and buy at these prices),
so the write sequence matters more than the pricing math.

1. **Verify the sandbox/test account is actually separate from production before any write —
   don't assume it from the account name or an info endpoint.** Some read-only "account info"
   calls don't surface a `livemode` field at all. Use a call that returns it explicitly (a
   balance read is a reliable one) and confirm `livemode: false` before touching anything. This
   is a one-line check; skipping it is how a "test" write lands in production.
2. **Compute the full proposed price table and present it for explicit sign-off before any
   write.** Per currency: the tier/discount percentage, the resulting amount in that currency's
   smallest unit (cents, not dollars — Stripe amounts are always in the minor unit), and the FX
   source and date used to derive it. Sign-off happens on this table, not on a description of the
   plan.
3. **Execute against the test/sandbox account first.** Write, then **read back** via
   `expand: ['currency_options']` to confirm what's actually stored matches the approved table —
   don't trust the write response alone.
4. **Treat "approved for staging" and "approved for production" as two separate approvals.**
   Getting sign-off on the sandbox table does not imply sign-off to repeat it in production — ask
   again, explicitly, before the production write, even if nothing in the table changed between
   the two runs. The two environments have different blast radii; the approval should reflect that.

## Related but separate gotcha: `tax_behavior` is one-way

While in the Price object, note `tax_behavior` (`inclusive` / `exclusive` / `unspecified`):
once it's set away from `unspecified`, **it cannot be reverted or flipped later.** It's a
permanent decision on that Price. Because a `currency_options` rollout often touches the same
Price objects, there's a temptation to "fix tax_behavior while we're in there" — don't bundle it.
Track and approve any `tax_behavior` change as its own separate decision, on its own timeline,
never folded into a currency-pricing change where it could get nodded through as a side effect.

## Checklist (the playbook)

1. Confirm the ask is a pre-checkout **display** problem → `currency_options`, not coupons.
2. Build the tier table **per currency**; pick and document a representative country for any
   multi-country currency zone.
3. Derive percentages from World Bank/IMF PPP data, sanity-checked against the Big Mac Index and
   published SaaS PPP guides; surface divergences instead of averaging them away.
4. Verify the test account's `livemode` explicitly via a call that actually returns the field.
5. Present the full per-currency price table (tier %, minor-unit amount, FX source + date) for
   sign-off before any write.
6. Write to test/sandbox, read back with `expand: ['currency_options']` to confirm.
7. Get a **separate** explicit go-ahead, then repeat against production; read back again.
8. Leave `tax_behavior` alone unless it was asked for and approved as its own, separate change.
