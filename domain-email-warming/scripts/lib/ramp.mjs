// How much mail goes out today, from whom, to whom, and when.
//
// The shape of the curve matters less than never jumping: receivers react to a
// step change in volume, not to volume itself.

/** Rounded geometric growth, capped. Day 1 is the configured starting volume. */
export function perIdentityQuota(ramp, day) {
  const raw = ramp.startPerIdentity * Math.pow(ramp.growth, Math.max(0, day - 1));
  return Math.max(1, Math.min(ramp.maxPerIdentity, Math.round(raw)));
}

/** 13:00-01:00 UTC is roughly a Pacific working day. */
const WINDOW_START_H = 13;
const WINDOW_HOURS = 12;

function spread(rng, count, day, startDate) {
  const base = Date.parse(`${startDate}T00:00:00Z`) + (day - 1) * 86400000;
  const slot = (WINDOW_HOURS * 3600000) / Math.max(1, count);
  return Array.from({ length: count }, (_, i) => {
    const jitter = (rng() - 0.5) * slot;
    return new Date(base + WINDOW_START_H * 3600000 + i * slot + slot / 2 + jitter).toISOString();
  });
}

/**
 * A send to a mailbox we cannot read teaches us nothing, so measurable seeds
 * take the clear majority of every day's volume.
 */
const MEASURABLE_SHARE = 0.7;

export function planForDay(config, day, rng = Math.random) {
  const quota = perIdentityQuota(config.ramp, day);
  const engageable = config.seeds.filter((s) => s.engage);
  const others = config.seeds.filter((s) => !s.engage);
  if (!engageable.length) throw new Error("no seed with engage:true — placement could never be measured");

  const pairs = [];
  config.identities.forEach((identity, idx) => {
    const measurable = others.length ? Math.max(1, Math.ceil(quota * MEASURABLE_SHARE)) : quota;
    for (let n = 0; n < quota; n++) {
      // Offset the round-robin per identity so seed order does not correlate
      // with sender, which would make one seed see only one mailbox.
      const pool = n < measurable ? engageable : others;
      const seed = pool[(n + idx) % pool.length];
      pairs.push({ from: identity.address, to: seed.address });
    }
  });

  // Interleave senders so the day is not "all of hello@, then all of pooria@".
  pairs.sort((a, b) => a.to.localeCompare(b.to));
  const times = spread(rng, pairs.length, day, config.startDate);
  return pairs.map((p, i) => ({ ...p, sendAt: times[i] }));
}

/**
 * Which of the day's planned messages still need sending.
 *
 * Each planned message owns a numbered slot and a send records the slot it
 * filled. Counting recorded rows instead would go wrong the moment one send
 * fails: the count stops lining up with position, so the next run re-sends a
 * message that already went out and silently abandons the one that failed.
 * Only an accepted send retires its slot, so a failure comes back round.
 *
 * Exported and pure so the accounting can be tested against the code that
 * actually runs, rather than against a copy of it.
 */
export function selectDueSlots(plan, sends, day, { now = Date.now(), all = false } = {}) {
  const claimed = new Set(
    sends.filter((s) => s.day === day && s.accepted).map((s) => s.slot),
  );
  const numbered = plan.map((p, slot) => ({ ...p, slot }));
  return {
    numbered,
    done: numbered.filter((p) => claimed.has(p.slot)).length,
    todo: numbered.filter((p) => !claimed.has(p.slot) && (all || Date.parse(p.sendAt) <= now)),
    nextDue: numbered.find((p) => !claimed.has(p.slot))?.sendAt ?? null,
  };
}
