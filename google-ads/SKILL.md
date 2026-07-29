---
name: google-ads
description: "Wire up Google Ads + GA4 conversion tracking for a web app — the three layers (GA4 client gtag, GA4 server-side Measurement Protocol, Google Ads conversion import from GA4), the Measurement Protocol api_secret that silently no-ops a server purchase when unset, importing/enabling/marking-Primary a GA4 conversion action in Google Ads, Google Ads API launch nuances (containsEuPoliticalAdvertising, text-only search ads, OAuth-project enablement), and server-side verification via the GA4 Data API and GAQL. Also covers audience expansion via Customer Match (crm_based_user_list + OfflineUserDataJob, since classic similar-audiences was deprecated, ~1,000-member serve floor), a gtag page_view ordering bug that silently zeroes GA4 pageviews, and small-budget Search campaign setup — the defaults that burn budget (Display Network/Search partners on by default, All-languages targeting, missing negative keywords), bid-strategy choice when you have no conversion history (Manual CPC / Maximize Clicks vs a Smart Bidding learning phase), long-tail vs unaffordable head terms, and a pre-spend search-volume check. Use when setting up a Google Ads search campaign, launching a small paid test, setting up Google Ads purchase tracking, debugging 0 conversions, or validating an MP secret without waiting."
---

# google-ads

Google Ads conversion tracking for a web app has **three layers**, and they stack — get the lower ones right or the top one has nothing to count:

1. **GA4 client tag (`gtag.js`)** — fires `purchase` in the browser. Easy to see in a real browser, easy to miss server-side.
2. **GA4 server-side Measurement Protocol** — your backend posts the same `purchase` to GA4 after the charge actually succeeds (e.g. a payment webhook), so you don't lose conversions to ad-blockers, closed tabs, or client failures.
3. **Google Ads conversion import from GA4** — Google Ads doesn't track the purchase itself; it *imports* the GA4 `purchase` event as a conversion action. If GA4 never recorded the event, there is nothing to import.

You configure these in order. Skipping layer 2 is the usual reason "it worked in testing but production shows nothing."

## GA4 client tag (gtag)

Standard GA4 `purchase` on the confirmation/thank-you page:

```js
gtag('event', 'purchase', {
  transaction_id: '<order-or-session-id>',
  value: 25,
  currency: 'USD',
  items: [{ item_id: 'plan_pro', item_name: 'Pro plan', price: 25, quantity: 1 }]
});
```

- `transaction_id` is your dedup key — GA4 de-duplicates a `purchase` by `transaction_id`, so send the *same* value from client and server (below).
- `value` + `currency` are what Smart Bidding optimizes toward; always send both.
- **Sequence `gtag('js')` → `gtag('config')` → any manual `page_view` in one effect.** If a `page_view` is queued from a *different* effect/hook than the `js`/`config` init, it can execute before `config` lands and gtag **silently drops it** — GA4 then shows sessions but **0 pageviews**. Same-effect ordering fixes it.

## GA4 server-side Measurement Protocol

Post the same event from your backend after the charge is confirmed:

```
POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXXXXX&api_secret=<API_SECRET>
Content-Type: application/json
```

```json
{
  "client_id": "<GA4 client_id from the browser _ga cookie>",
  "events": [{
    "name": "purchase",
    "params": {
      "transaction_id": "<same id as the client event>",
      "value": 25,
      "currency": "USD",
      "items": [{ "item_id": "plan_pro", "price": 25, "quantity": 1 }]
    }
  }]
}
```

- **`api_secret` is NOT the measurement id.** The measurement id is the public `G-XXXXXXX`. The `api_secret` is a separate server credential created per data stream in **GA4 Admin → Data Streams → (your stream) → Measurement Protocol API secrets → Create**. It is a secret — keep it server-side only.
- **If `api_secret` is unset, the server `purchase` silently no-ops.** The Measurement Protocol accepts the call shape but *sends nothing* to the property without a valid secret — you get 0 server conversions and no error. This is the #1 pitfall here. Any `if (!apiSecret) return` guard in your code makes it worse: the code runs, the guard takes the empty branch, nothing is sent.
- **Use the browser's GA4 `client_id`** so the server event joins the *same user* as the client session. Read it from the first-party `_ga` cookie (value looks like `GA1.1.1234567890.1700000000`; the client_id is the last two dotted segments, `1234567890.1700000000`) and carry it to the backend. A random/new client_id fragments the user and can drop the join.

## Google Ads: import the GA4 purchase as a conversion action

In Google Ads → **Goals → Conversions → New conversion action → Import → Google Analytics 4 → Web**, pick the GA4 `purchase` event.

- A conversion action can be **HIDDEN** — imported but *not counted*. It must be **enabled** and set to **Primary** for Smart Bidding to optimize toward it. A "Secondary" action is observed only, never bid on.
- **Attributed conversions require a real ad click.** With no ads running (or clicks that don't match), the conversion action correctly reports **0** — that's expected, not a broken tag. The tag can be firing perfectly and Ads still shows 0 because nobody clicked an ad.

## Click id

Google's GA4-import path attributes on the **GA4 `client_id` / `gclid`**, so you generally do **not** need to capture `gclid` yourself when using conversion import. Capturing `gclid` (from the landing-page query param, first-touch) is only needed if you later switch to offline/enhanced conversions that key on it. Optional for the import flow.

## Customer Match (audience expansion — there is no lookalike object)

Google's classic **"similar audiences" was deprecated (Aug 2023)** — you can't create a lookalike *object*. To reach people similar to your users:

- Upload a **Customer Match** list: a `crm_based_user_list`, populated via an `OfflineUserDataJob` with `hashedEmail` members (emails normalized trim + lowercase, then SHA-256).
- Let **optimized targeting** and value-based **Smart Bidding** expand from that list — the "lookalike" behavior is a bidding/targeting property, not a separate audience.
- **A Customer Match list needs ~1,000 members to serve.** A tiny seed won't activate — a high-intent signup segment beats a tiny paying-customer-only seed. Seed-sizing and the PII-export authorization boundary are in `ad-experiments`.

## Campaign setup (search): defaults that quietly burn a small budget

Learned launching a live small-budget ($50-scale) search test. A new Search campaign's defaults are tuned for spend, not for a clean signal — fix these *before* you turn it on:

- **Display Network + Search partners default ON.** A new "Search" campaign is created targeting Google Search **plus Search partners plus the Display Network** by default, so a search-intent budget bleeds onto junk Display placements. Set it to **Google Search only** (`targetContentNetwork=false`, `targetSearchNetwork=false` on the campaign's `NetworkSettings`) unless you deliberately want partners/Display.
- **Language defaults to "All languages"** → you serve users who can't read the ad. Restrict targeting to your target market's language.
- **Add negative keywords up front.** PHRASE/BROAD match will match junk ("free …", "jobs", "how to …", "reviews", "hire a …", off-topic and competitor terms) and eat the budget before you can read any signal. Put a campaign negative-keyword list in place *at launch*, not after you've spent.
- **Bid strategy on a tiny budget with no conversion history: Manual CPC** (full control) **or Maximize Clicks** (volume, to fill the top of the funnel so you can read clicks → signups). **Smart Bidding** (Maximize Conversions / tCPA / tROAS) needs a conversion action wired up **and roughly 15-30 conversions to exit the learning phase** — a small test won't produce that, so it can't optimize. Switch to Smart Bidding only once conversions have accumulated.
- **Set the campaign conversion goal explicitly.** Don't leave it on "account default: no goals" — point it at the action you care about (e.g. signup) so bidding optimizes toward it once you do move to Smart Bidding.
- **Value rules** apply only to value-based / tROAS bidding — skip them for a signup- or clicks-based test.
- **Head terms are unaffordable on a small budget** — broad category terms get bid up by large advertisers (think tens of dollars per click). Ride **long-tail, vertical, high-intent** phrases instead.
- **Check search volume before you spend.** Pull exact-match monthly volume (Keyword Planner, or the API's `generateKeywordHistoricalMetrics`) — a hyper-long-tail term in a tiny geo can have too little volume to spend even a small budget in your window, which starves the test of a read. Confirm there's enough volume to actually spend before you launch.

Then run tightly-scoped experiments on top of this setup — see the `ad-experiments` skill for the methodology (hypothesis → narrow audience×geo×creative → cheapest conversion first → server-side verification).

## Google Ads API launch nuances (generic)

If you drive campaign creation through the Google Ads API rather than the UI:

- **`containsEuPoliticalAdvertising` is now REQUIRED on campaign create** — a `CampaignOperation` create mutate returns a 400 without it. Set the declaration field explicitly (typically "does not contain").
- **Search ads are text-only.** A responsive search ad takes headlines + descriptions; there is no image asset on a search ad. Don't try to attach an image to one.
- **The API must be enabled on the OAuth client's GCP project** — the project behind your OAuth credentials needs the Google Ads API enabled *and* a developer token, or calls fail before they reach your account.

## Customer Match audience upload (the trap)

Uploading a first-party customer list for lookalike/retargeting is the single most failure-prone part of Google Ads automation. Expect a multi-step yak-shave:

- **The classic Ads API `OfflineUserDataJob` path may be blocked** — `CUSTOMER_NOT_ALLOWLISTED` if the dev token / account isn't approved for Customer Match. Teams then pivot to the **Data Manager API** (`datamanager.googleapis.com`, `audienceMembers:ingest`) with **SHA-256-hashed `CONTACT_INFO`**.
- **Batch the ingest** — chunk to roughly **≤10k members per request**, sequentially. One oversized POST **silently truncates** (only the first slice lands) with no error surfaced — an undocumented per-request member ceiling.
- **NEVER trust the ingest success response as proof of membership.** A `200` + returned request IDs can still leave the list **effectively empty**. Always follow with a **size-verification query** against the destination `user_list` (`size_for_display`, `size_range_for_display`) before treating the upload as done. Silent partial/zero success is a real, common failure mode here — not hypothetical.
- **The empty-list trap:** a Customer Match list can report a **non-zero `match_rate_percentage`** yet `size_for_display = 0` / `LESS_THAN_FIVE_HUNDRED`, and never serve. `match_rate` alone does **not** prove a servable, populated list. Things to check when a list stays empty:
  - members not landing in the **Ads-queryable `user_list` at all** — the ingest may be populating a Data-Manager audience surface distinct from the targetable Ads `user_list` (verify which resource actually holds membership before assuming success);
  - the account isn't **approved/eligible for Customer Match** (a policy/spend-history gate);
  - missing **consent fields** on ingest (`ad_user_data` / `ad_personalization`) dropping members from the servable pool;
  - size sometimes only **computes once a live campaign targets the list** — the truest verification is to **point a tiny campaign at it and see if it serves**, not to stare at the size field.
- **A "5,000-email list matched at 82%" that shows size 0 is broken, not warming up.** Waiting 24–48h does not fix a structural ingest/eligibility problem — verify size, and if it's still 0 after a full day, it's not timing.
- **Bring-your-own analytics ≠ native dashboard.** Some site builders only offer a *connect-your-own-GA4-tag* setup, not native visitor analytics — a fact worth respecting in ad copy (don't promise a dashboard the product doesn't have; see the `ad-experiments` truthfulness gate).

## Verification (server-side truth, not "the tag is on the page")

- **GA4 Data API `runReport`** — confirm GA4 actually recorded purchases. Requires: (a) a service account added as a **Viewer on the GA4 property**, (b) the **Analytics Data API enabled** on its project, and (c) the **numeric property id** (found in GA4 Admin → Property Settings), *not* the `G-XXXXXXX` measurement id. Query the `conversions` / `eventCount` metrics for `eventName == purchase`.
- **Google Ads GAQL** — list conversion action state and totals:
  ```sql
  SELECT conversion_action.name, conversion_action.status, conversion_action.primary_for_goal,
         metrics.all_conversions
  FROM conversion_action
  ```
  `status` shows ENABLED vs HIDDEN/REMOVED; `all_conversions` counts even without an ad click, so it separates "tag firing" from "no ad clicks yet".
- **Validate the MP secret without waiting** — post to the debug endpoint `https://www.google-analytics.com/debug/mp/collect?measurement_id=...&api_secret=...` with the same body. It returns `validationMessages` synchronously; an empty array means the event (and the secret) are accepted. This is how you prove the secret is live in seconds instead of waiting for reporting to populate.

## Access setup (read + MP secret management)

- Create a **service account**; add it as a **Viewer** on the GA4 property (Admin → Property Access Management).
- Enable the **Analytics Data API** (for `runReport`) and the **Analytics Admin API** (to read/create Measurement Protocol secrets programmatically) on its project.
- JWT scopes: `analytics.readonly` for reporting; add `analytics.edit` if you create/read MP secrets via the Admin API.
- **Never print retrieved secrets.** When reading an MP secret back through the Admin API, use it, don't log it — treat it like any bearer credential.

## Cross-cutting lessons (the ones that actually bite)

- **Timing:** a conversion count of **0 over a window that predates the tracking deploy** is expected, not a bug. Check the deploy date before debugging — you can't count conversions from before the tag existed.
- **Build-scoped env:** if the `api_secret` / measurement id are baked into a generated module at **build time** (common on serverless/edge), setting them in your dashboard does *nothing* until the next deploy. **Redeploy after adding** — match wherever your other working analytics secrets are imported from rather than assuming a runtime `process.env` read works.
- **Ground truth:** cross-check Google Ads / GA4 `purchase` counts against your **payment provider's actual succeeded-charge count**. Real succeeded charges > 0 with GA4 purchases = 0 means tracking is broken, full stop — the payment provider is the source of truth, the analytics layer is the thing under test.
- **Silent failure is the norm:** these integrations fail by **sending nothing** (an early return on a missing `api_secret`, a HIDDEN conversion action), not by throwing. Verify with server-side truth — the Data API, GAQL, the payment provider — never "I saw the pixel load in the browser."

## Common pitfalls

- Confusing `api_secret` with the measurement id — one is a public `G-XXXXXXX`, the other a per-stream server secret. Server `purchase` silently no-ops without the secret.
- Using the numeric property id where the code wants `G-XXXXXXX`, or vice-versa — Data API wants the *numeric* id, `gtag`/MP want `G-XXXXXXX`.
- Leaving the imported conversion action HIDDEN or Secondary, then wondering why Smart Bidding ignores it — enable it and mark it Primary.
- Debugging "0 conversions" that's actually just "no ad clicks yet" — check `all_conversions` and whether any campaign is live before assuming the tag is broken.
- Generating a fresh `client_id` server-side instead of reusing the browser's `_ga` value — fragments the user and can break attribution.
- Campaign-create 400s from the Google Ads API because `containsEuPoliticalAdvertising` wasn't declared, or the API isn't enabled on the OAuth project.

---

## Security — secret handling

The GA4 `api_secret` is a server-side secret. Source it from an environment variable (e.g. `$GA4_API_SECRET`) — never hardcode, commit, or log it, and never echo its value back to the user. It appears in the Measurement Protocol query string because Google's `/mp/collect` and `/debug/mp/collect` endpoints require it there; always send over HTTPS and redact it from any captured request logs. The placeholders in this doc (`<API_SECRET>`, `...`) are not real values.
