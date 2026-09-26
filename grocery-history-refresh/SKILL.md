---
name: grocery-history-refresh
description: Refresh the HBI grocery order history dataset from Walmart Canada and Costco accounts — new orders, recurring staples, watch list — and push the update to pooriaarab/brain via PR. Trigger on "refresh grocery history", "update order history", or the weekly grocery cron.
---

# Grocery History Refresh

## Purpose
Keep `groceries/order-history.md` in `pooriaarab/brain` current: pull new Walmart
Canada and Costco orders, normalize items, refresh the recurring staples table,
and push via PR. Feeds the household inventory loop (fridge photos) and recall
awareness.

## Workflow
1. **Walmart** — signed-in session at `walmart.ca/en/orders`. Page through every
   order newer than the last recorded date (keep going while order dates are
   >= the coverage start). Open each order, expand the item list, capture: order
   date, order number, total (CAD), status, fulfillment type, and per item —
   name, quantity, price — flagging substitutions and unavailable items.
   Read-only: never add to cart, never change account settings.
2. **Costco** — if the signed-in session is alive, check warehouse and online
   purchase history for new orders. Otherwise fall back to Costco email receipts
   (Same-Day/Instacart). Costco.ca online orders go in the non-grocery section
   unless they are food.
3. **Costco** — if the signed-in session is alive, check warehouse and online
   purchase history for new orders. Otherwise fall back to Costco email receipts
   (Same-Day/Instacart). Costco.ca online orders go in the non-grocery section
   unless they are food.
4. **Fridge inventory** — if the user sent a fridge/freezer photo since the last
   refresh, reconcile staples against it and note what is running low.
5. **Publish** — edit `groceries/order-history.md` on a branch
   (e.g. `hbi/grocery-history`), commit with a clear message, open or update the
   PR in `pooriaarab/brain`. Never merge without explicit approval.

## Output Contract
- Dataset file updated, new orders appended in the existing per-order format.
- PR opened/updated on `pooriaarab/brain`; report the PR URL and a summary of
  what changed (orders added, staples changed, flags).
- Short chat summary: new orders, staples drift, anything to flag (recalls,
  frequent substitutions, price jumps).

## Operating Rules
- Retailer accounts are read-only: no cart changes, no purchases, no settings
  changes, no address/tip/payment edits.
- Bot challenges (press-and-hold, CAPTCHA): only clear with explicit per-task
  authorization from the user; otherwise ask the user to take over the browser.
- Never merge a PR without the user's explicit approval for that merge.
- Never invent order data — record only what the account pages or receipts show.
- Totals in CAD; keep the existing file structure and tone.
