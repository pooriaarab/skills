import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planForDay } from "../scripts/lib/ramp.mjs";

/**
 * Reproduces the slot-accounting rule cmdSend relies on, without the provider
 * or the filesystem. The bug this guards against is subtle and silent: with a
 * count-based scheme, one failed send in the middle of a batch shifts every
 * later index by one, so the next run re-sends a message that already went out
 * and never retries the one that failed.
 */
function selectTodo(plan, sends, day, now) {
  const claimed = new Set(sends.filter((s) => s.day === day && s.accepted).map((s) => s.slot));
  return plan
    .map((p, slot) => ({ ...p, slot }))
    .filter((p) => !claimed.has(p.slot) && Date.parse(p.sendAt) <= now);
}

const cfg = {
  startDate: "2026-09-14",
  ramp: { startPerIdentity: 2, growth: 1.25, maxPerIdentity: 12, days: 28 },
  identities: [{ address: "a@d.com", name: "A" }, { address: "b@d.com", name: "B" }],
  seeds: [{ address: "m1@g.com", engage: true }, { address: "m2@g.com", engage: true }],
};
const rng = () => 0.5;
const LATER = Date.parse("2026-09-15T12:00:00Z"); // after the whole day's window

describe("send slot accounting", () => {
  const plan = planForDay(cfg, 1, rng);

  it("sends the whole day when nothing has gone out", () => {
    assert.equal(selectTodo(plan, [], 1, LATER).length, plan.length);
  });

  it("retries only the failed slot, and does not re-send the successful ones", () => {
    const sends = plan.map((p, slot) => ({ day: 1, slot, accepted: slot !== 2 }));
    const todo = selectTodo(plan, sends, 1, LATER);
    assert.deepEqual(todo.map((t) => t.slot), [2]);
  });

  it("does not re-send the last slot when an earlier one failed", () => {
    // The count-based bug: 1 failure among N leaves N-1 accepted, so a
    // slice(N-1) would hand back the final slot, which already went out.
    const sends = plan.map((p, slot) => ({ day: 1, slot, accepted: slot !== 2 }));
    const todo = selectTodo(plan, sends, 1, LATER);
    assert.ok(!todo.some((t) => t.slot === plan.length - 1), "last slot was queued again");
  });

  it("retries every failed slot when several fail", () => {
    const bad = new Set([0, 3, plan.length - 1]);
    const sends = plan.map((p, slot) => ({ day: 1, slot, accepted: !bad.has(slot) }));
    assert.deepEqual(new Set(selectTodo(plan, sends, 1, LATER).map((t) => t.slot)), bad);
  });

  it("is empty once every slot is accepted", () => {
    const sends = plan.map((p, slot) => ({ day: 1, slot, accepted: true }));
    assert.equal(selectTodo(plan, sends, 1, LATER).length, 0);
  });

  it("ignores accepted sends recorded against a different day", () => {
    const sends = plan.map((p, slot) => ({ day: 2, slot, accepted: true }));
    assert.equal(selectTodo(plan, sends, 1, LATER).length, plan.length);
  });

  it("releases nothing before the first scheduled time", () => {
    assert.equal(selectTodo(plan, [], 1, Date.parse("2026-09-14T00:00:00Z")).length, 0);
  });
});
