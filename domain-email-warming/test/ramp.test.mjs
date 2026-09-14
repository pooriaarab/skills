import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { perIdentityQuota, planForDay } from "../scripts/lib/ramp.mjs";

const RAMP = { startPerIdentity: 2, growth: 1.25, maxPerIdentity: 12, days: 28 };

const cfg = (over = {}) => ({
  startDate: "2026-09-14",
  ramp: RAMP,
  identities: [{ address: "a@d.com", name: "A" }, { address: "b@d.com", name: "B" }],
  seeds: [
    { address: "m1@g.com", engage: true },
    { address: "m2@g.com", engage: true },
    { address: "u1@g.com", engage: false },
  ],
  ...over,
});

const fixedRng = () => 0.5;

describe("perIdentityQuota", () => {
  it("starts at the configured volume on day 1", () => {
    assert.equal(perIdentityQuota(RAMP, 1), 2);
  });

  it("grows and then holds at the cap", () => {
    assert.ok(perIdentityQuota(RAMP, 5) > perIdentityQuota(RAMP, 1));
    assert.equal(perIdentityQuota(RAMP, 60), RAMP.maxPerIdentity);
  });

  it("never drops below one message", () => {
    assert.equal(perIdentityQuota({ ...RAMP, startPerIdentity: 0 }, 1), 1);
  });

  it("never exceeds the cap on any day", () => {
    for (let d = 1; d <= 90; d++) assert.ok(perIdentityQuota(RAMP, d) <= RAMP.maxPerIdentity);
  });
});

describe("planForDay", () => {
  it("emits one message per identity per unit of quota", () => {
    const c = cfg();
    const plan = planForDay(c, 1, fixedRng);
    assert.equal(plan.length, c.identities.length * perIdentityQuota(RAMP, 1));
  });

  it("keeps at least 70% of a day on seeds we can actually measure", () => {
    // A send to a mailbox we cannot read teaches us nothing about placement.
    const c = cfg();
    for (const day of [1, 5, 10, 20, 30]) {
      const plan = planForDay(c, day, fixedRng);
      const measurable = plan.filter((p) => ["m1@g.com", "m2@g.com"].includes(p.to)).length;
      assert.ok(measurable / plan.length >= 0.7, `day ${day}: only ${measurable}/${plan.length} measurable`);
    }
  });

  it("spreads every send inside the sending window", () => {
    for (const p of planForDay(cfg(), 12, fixedRng)) {
      const h = new Date(p.sendAt).getUTCHours();
      assert.ok(h >= 13 || h <= 1, `sendAt ${p.sendAt} falls outside 13:00-01:00 UTC`);
    }
  });

  it("is deterministic for a fixed rng", () => {
    assert.deepEqual(planForDay(cfg(), 3, fixedRng), planForDay(cfg(), 3, fixedRng));
  });

  it("spreads one identity's volume over more than one seed", () => {
    const plan = planForDay(cfg(), 20, fixedRng).filter((p) => p.from === "a@d.com");
    assert.ok(new Set(plan.map((p) => p.to)).size > 1);
  });

  it("uses only measurable seeds when no unmeasurable one is configured", () => {
    const c = cfg({ seeds: [{ address: "m1@g.com", engage: true }] });
    assert.ok(planForDay(c, 15, fixedRng).every((p) => p.to === "m1@g.com"));
  });

  it("refuses a config with nothing measurable rather than sending blind", () => {
    const c = cfg({ seeds: [{ address: "u1@g.com", engage: false }] });
    assert.throws(() => planForDay(c, 1, fixedRng), /engage:true/);
  });
});
