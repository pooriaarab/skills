---
name: accept-x402-payments
description: "Operator runbook for the RECEIVE side of agent payments — stand up an x402 receiver so AI agents pay your API in USDC, the money lands in a wallet you control, and you cash out to USD. Covers creating a Base wallet, wiring the Coinbase CDP facilitator, the exact secrets to set, a go-live safety checklist, the USDC→USD off-ramp, and when Stripe's x402 layer is worth it. Complements agentic-commerce (the buy side). Use when turning on x402/agent payments, choosing a wallet or facilitator, or deciding Coinbase vs Stripe for accepting stablecoin agent payments."
---

# Accept x402 Payments

The other half of `agentic-commerce`. That skill is the **buy** side — an agent spending money safely. This is the **receive** side — your API being paid by an agent, in stablecoin, with no human and no card.

**Use when:** you built an x402 endpoint (the code returns `402 Payment Required`) and now need to make real money flow into an account you own, or you're choosing between Coinbase and Stripe for the rail.

Facts below verified 2026-08-19 against primary docs; links inline.

## The rail in one picture

```
agent's wallet ──USDC on Base──▶ your payTo wallet
      ▲                               │
      │ 402 challenge                 │ facilitator verifies + settles on-chain
      │                               ▼
   your API ◀──grant credits──── settlement confirmed
                                       │
                        (later) you sweep USDC ▶ Coinbase ▶ convert 1:1 ▶ ACH to bank
```

x402 is an open, permissionless protocol (Coinbase authored it; you need no Coinbase product to speak it). The receiver only: returns the 402 with terms, verifies the signed payment, settles, releases the resource. It never manages accounts. Two things make it real: a **payTo wallet** (where USDC lands) and a **facilitator** (does verify + on-chain settle so you never touch a chain). — https://github.com/coinbase/x402 · https://x402.org

**The reference values you'll plug in everywhere:**

| Thing | Base mainnet | Base testnet |
|---|---|---|
| Network id (CAIP-2) | `eip155:8453` | `eip155:84532` |
| USDC contract | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | (testnet USDC) |
| Facilitator | CDP (authed) | `https://x402.org/facilitator` (no auth) |

A price written as `"$5"` auto-resolves to the network's default USDC — you price in dollars, the rail moves USDC. — https://docs.cdp.coinbase.com/x402/core-concepts/facilitator · https://docs.stripe.com/payments/machine/x402

## Step 1 — Create the wallet that receives the money

An address on Base (EVM): `0x` + 40 hex chars. Three real options:

- **CDP Server Wallet v2 (recommended for a programmatic receiver).** Coinbase Developer Platform provisions the account; keys live in a TEE; you control the funds, CDP runs the key infra. Its Base address is your `payTo`. Sign up at https://portal.cdp.coinbase.com/ → create an API key (id + secret) → set a wallet secret → the SDK exposes the address. — https://docs.cdp.coinbase.com/server-wallets/v2/introduction/welcome
- **Coinbase exchange deposit address.** In Coinbase: Receive → USDC → **select Base** → it gives a `0x` address. Use it as `payTo` if you want funds to land straight where you cash out. Simplest, no code.
- **Self-custody (Coinbase Wallet / MetaMask on Base).** You hold the keys. Add Base (chain id 8453), copy the address.

**Pick:** CDP Server Wallet for the clean programmatic path; a Coinbase exchange deposit address if you want zero code and easy off-ramp. Either works as `payTo`.

## Step 2 — Wire the facilitator

The **CDP Facilitator** is the first production one: hosted verify + settle, automatic sanctions/KYT screening, gas sponsored. **Free for the first 1,000 on-chain settlements/month, then $0.001 each; verification is always free.** It needs `CDP_API_KEY_ID` + `CDP_API_KEY_SECRET`. — https://docs.cdp.coinbase.com/x402/core-concepts/facilitator

For testnet, point at `https://x402.org/facilitator` (no signup) and skip the keys.

## Step 3 — Set the secrets (Content Rabbit)

Our code reads these (final shape after the hardening PR). Set them as Cloudflare Worker secrets, never in `.env` committed:

| Secret | Value | Notes |
|---|---|---|
| `AGENT_PAYMENTS_PAY_TO` | your Base `0x…` address | from Step 1. Non-zero + real is required for mainnet. |
| `AGENT_PAYMENTS_NETWORK` | `eip155:8453` | mainnet. Omit → testnet default. |
| `AGENT_PAYMENTS_FACILITATOR` | the CDP facilitator selector | **not** `mock`. `mock` is barred on prod/non-testnet. |
| `AGENT_PAYMENTS_FACILITATOR_URL` | CDP facilitator endpoint | testnet: `https://x402.org/facilitator`. |
| `AGENT_PAYMENTS_ALLOW_MAINNET` | `true` | mainnet refuses without this **and** a non-zero payTo. |
| `CDP_API_KEY_ID` / `CDP_API_KEY_SECRET` | from CDP | the facilitator's auth. |

Pricing is **not** configured here — x402 sells the existing `CREDIT_PACKAGES` (`$5→500`, `$10→1200`, `$20→3000` credits). An agent paying $5 in USDC gets the same 500 credits a Stripe pack buyer gets. One credit system, two doors. There is no separate x402 price to maintain.

There is **no on/off flag** — the endpoint is always live and **fails closed**: with no facilitator configured it returns a 402 challenge and credits nothing. It only moves money once a real facilitator + payTo are set.

## Step 4 — Go-live checklist (before flipping to mainnet)

Do not point at a mainnet facilitator until all of these are true:

- [ ] `payTo` is a real Base address you control (not the zero address).
- [ ] Facilitator is the authed CDP one (not `mock`); `AGENT_PAYMENTS_ALLOW_MOCK` is unset/false in prod.
- [ ] The facilitator client actually authenticates to the CDP facilitator (sends `CDP_API_KEY_ID`/`SECRET`). The public `x402.org` facilitator is **testnet-only + unauthenticated** — confirm the mainnet client carries CDP auth before trusting it.
- [ ] Settlement refuses when the facilitator omits the paid `amount` (no "assume required amount was paid" fallback) — else a lax facilitator lets pay-$5-claim-$20.
- [ ] The ledger↔balance **reconciliation sweep** is running (heals the rare crash-between-claim-and-credit window; fails closed, never over-credits).
- [ ] You've done one **real testnet settlement** end to end first — CI only exercises the mock.
- [ ] KYC done on the account you'll cash out from (Step 5 needs it).

## Step 5 — Cash out: USDC(Base) → USD → bank

1. Coinbase → Receive → USDC → **select Base** → send your USDC there (free, ~1–2 min).
2. **Convert** USDC → USD (use Convert, not the order book) — Coinbase treats USDC↔USD as **1:1, no spread**.
3. **Withdraw** USD → bank: **ACH is free** (1–3 days); wire is $25.

At solo-founder volume the whole path is effectively **$0 in fees** (a 0.10% conversion fee only kicks in above several $M/month). **Always select Base on both ends** — wrong network can lose funds. — https://eco.com/support/en/articles/15039728-convert-usdc-to-bank-account-fastest-routes-in-2026

## Coinbase vs Stripe for the rail

Both settle the **same USDC-on-Base payment through the same CDP facilitator**. Stripe is not its own facilitator — its x402 receiver rides on CDP and adds Stripe-side accounting (records each payment as a PaymentIntent) + payouts via its Bridge rails. — https://docs.stripe.com/payments/machine/x402

| | Coinbase CDP direct | Stripe x402 receiver |
|---|---|---|
| Facilitator | CDP | also CDP (Stripe on top) |
| Accounting | you build it | native PaymentIntents |
| Off-ramp | sweep → Coinbase → ACH | Stripe payouts |
| Maturity | **GA**, free ≤1k tx/mo | **preview**, access-gated, US-first |
| Extra creds | CDP key id+secret | Stripe key **+** CDP key id+secret |

**Choose CDP direct** for the simplest GA path — and you can still get unified Stripe reporting on it via the GA **Payment Records** API (see the section below), no preview gate. **Choose the full Stripe rail** only if you want Stripe to hold the funds (deposit address as `payTo`) and handle Bridge payouts — that part is preview/allow-listed. Either way the money is USDC on Base via the same CDP facilitator.

Adjacent Stripe pieces, for context: **ACP** (the OpenAI Instant-Checkout standard) is **card/Link**, not stablecoin; **MPP** is agent-to-agent; Stripe's **Agent Toolkit** ships build-time skills. None replace the x402 receive path above. — https://stripe.com/newsroom/news/stripe-openai-instant-checkout

## Stripe path — full walkthrough (unified reporting)

Use this instead of Step 1's wallet + Step 5's Coinbase off-ramp when you want payments to appear as PaymentIntents and pay out through Stripe. It still settles USDC-on-Base through the CDP facilitator. — https://docs.stripe.com/payments/machine/x402

1. **Request access.** Dashboard → **Payment methods** → request **"Stablecoins and Crypto"**; make a *separate payment-method configuration* for machine payments. Shows **Pending** → **active** after review. US except NY + 30 countries; outside US email `machine-payments@stripe.com` with your account id.
2. **Coinbase Developer account.** portal.cdp.coinbase.com → API keys `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET` (mainnet settles through the CDP facilitator; Stripe rides on it).
3. **Create a Stripe crypto deposit address** — this is your `payTo`:
   ```bash
   curl https://api.stripe.com/v1/crypto/deposit_addresses \
     -u "$STRIPE_SECRET_KEY:" -H "Stripe-Version: 2026-05-27.preview" -d network=base
   ```
   Keep this call off the request path; store the `0x…` as `DEPOSIT_ADDRESS`.
4. **Config:** `AGENT_PAYMENTS_PAY_TO` = the Stripe deposit address; `AGENT_PAYMENTS_NETWORK` = `eip155:8453`; facilitator = CDP with the CDP keys. (Same secrets table as Step 3 above; only `payTo` changes.)
5. **Record each settlement as a PaymentIntent** (the reporting piece — a code addition to the settle handler). After the facilitator settles, on `onAfterSettle` create a PaymentIntent with `mode: "transaction_verification"`, idempotent on the tx hash:
   ```js
   stripe.paymentIntents.create({
     amount: amountInCents, currency: "usd", confirm: true,
     payment_method_data: { type: "crypto" },
     payment_method_types: ["crypto"],
     payment_method_options: { crypto: {
       mode: "transaction_verification",
       transaction_verification_options: { network: "base", transaction_hash: txHash },
     }},
   }, { idempotencyKey: txHash });
   ```
   Init the Stripe client with `apiVersion: "2026-05-27.preview"`. `requirements.amount` is atomic USDC (6 decimals) → convert to cents (`/10000` for a $0.01 unit basis).
6. **Payout.** Payments appear in Dashboard → **Payments**; pay out to your bank via normal Stripe payouts. No manual USDC→USD convert.

Deps for the reference server: `@x402/core @x402/evm @x402/hono @coinbase/x402 stripe`. Sample: https://github.com/stripe-samples/machine-payments · reference: https://docs.stripe.com/payments/machine/x402

**Code item for Content Rabbit:** the settle handler grants credits today; add the `onAfterSettle → paymentIntents.create` call (config-driven — fires only when the Stripe preview keys + version are set), idempotent on the tx hash, so a settlement both grants credits AND records a PaymentIntent. Keep it additive to the existing grant path.

## Unified reporting WITHOUT preview access — Payment Records (GA)

The preview `transaction_verification` receiver above is **not** the only way to get on-chain payments into Stripe reporting, and unified reporting does **not** require routing `payTo` through Stripe. Keep your own CDP wallet (the GA path) and mirror each settlement into Stripe's **Payment Records** ledger — a GA API that models off-Stripe payments so they show in the same Dashboard/reporting as card charges. No preview gate, normal secret key. — https://docs.stripe.com/payments/payment-records

After a settlement that actually credits, POST the off-Stripe payment (best-effort — the credit is already committed, so a reporting failure must never fail the top-up):

```bash
curl https://api.stripe.com/v1/payment_records/report_payment \
  -u "$STRIPE_SECRET_KEY:" \
  -H "Idempotency-Key: x402:$NETWORK:$TX_HASH" \
  -d "amount_requested[currency]=usd" -d "amount_requested[value]=500" \
  -d initiated_at=$NOW -d outcome=guaranteed -d "guaranteed[guaranteed_at]=$NOW" \
  -d "processor_details[type]=custom" \
  -d "processor_details[custom][payment_reference]=$TX_HASH"
```

`amount_requested[value]` is cents. Key idempotency on the tx hash. Skip testnet settlements so dev traffic never pollutes live Stripe.

**Shipped in Content Rabbit** (PR #613): `server/billing/report-external-payment.ts` posts `report_payment` from the topup settle path — fail-open, testnet-skipped, replay-skipped, idempotent on the tx id, no-op until `STRIPE_SECRET_KEY` is set. This is the path to prefer over the preview receiver unless you specifically want Stripe as the wallet + Bridge payouts.

## Recommended launch path

**Best of both (GA, no gate):** CDP **Server Wallet v2** as `payTo` → CDP facilitator (`eip155:8453`) → **Payment Records** reporting into Stripe (section above) → off-ramp by sweeping USDC → Coinbase → convert 1:1 → ACH. You get unified Stripe reporting AND keep the money in a wallet you control, with zero preview access.

**Full Stripe rail (preview + allow-listed):** the **Stripe path** above — "Stablecoins and Crypto" access, a Stripe deposit address as `payTo`, the `transaction_verification` PaymentIntent recording, Bridge payouts to your bank. Choose this only if you want Stripe to hold the funds and handle payout; it needs the preview gate, so request access early.

Both settle the same USDC-on-Base payment through the CDP facilitator; the difference is only where the money lands and how you report/cash out.

## Sources

- x402 spec + facilitator: https://github.com/coinbase/x402 · https://x402.org · https://docs.cdp.coinbase.com/x402/core-concepts/facilitator
- CDP seller quickstart + Server Wallet: https://docs.cdp.coinbase.com/x402/quickstart-for-sellers · https://docs.cdp.coinbase.com/server-wallets/v2/introduction/welcome
- Stripe x402 + agentic: https://docs.stripe.com/payments/machine/x402 · https://stripe.com/newsroom/news/stripe-openai-instant-checkout
- Off-ramp: https://eco.com/support/en/articles/15039728-convert-usdc-to-bank-account-fastest-routes-in-2026
