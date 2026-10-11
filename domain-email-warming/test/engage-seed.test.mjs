import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { main } from "../scripts/engage-seed.mjs";

// Fake gmail client shaped like makeGmail(): scripted listings plus a call log.
function fakeGmail({ spam = [], recent = [], stale = [], probeOk = true } = {}) {
  const calls = [];
  const byQuery = (q) => {
    if (q.includes("newer_than")) return recent; // before in:spam: recent query carries -in:spam
    if (q.includes("in:spam")) return spam;
    return stale;
  };
  const gmail = {
    calls,
    probe: async () => (probeOk ? { ok: true } : { ok: false, error: "auth dead" }),
    list: async (account, query) => {
      calls.push({ op: "list", query });
      return { ok: true, error: null, messages: byQuery(query) };
    },
    rescueFromSpam: async (a, id) => { calls.push({ op: "rescue", id }); return {}; },
    setLabels: async (a, id, change) => { calls.push({ op: "labels", id, change }); return {}; },
    star: async (a, id) => { calls.push({ op: "star", id }); return {}; },
    markRead: async (a, id) => { calls.push({ op: "read", id }); return {}; },
  };
  return gmail;
}

const Q = ["--account", "seed@example.com", "--query", "warmup-rule"];

describe("engage-seed", () => {
  it("dry-run counts without mutating", async () => {
    const gmail = fakeGmail({ spam: [{ id: "s1", labels: ["SPAM"] }], recent: [{ id: "r1", labels: [] }], stale: [{ id: "t1", labels: [] }] });
    let out = "";
    const origLog = console.log;
    console.log = (m) => { out += m + "\n"; };
    try {
      assert.equal(await main([...Q], { gmail }), 0);
    } finally {
      console.log = origLog;
    }
    assert.match(out, /dry-run: rescued=1 starred=1 read=1/);
    assert.ok(gmail.calls.every((c) => c.op === "list"), "only listings run");
  });

  it("apply rescues, labels, stars and reads", async () => {
    const gmail = fakeGmail({ spam: [{ id: "s1", labels: ["SPAM"] }], recent: [{ id: "r1", labels: [] }], stale: [{ id: "t1", labels: [] }] });
    assert.equal(await main([...Q, "--apply", "--star", "1"], { gmail }), 0);
    const ops = gmail.calls.map((c) => c.op);
    assert.ok(ops.includes("rescue") && ops.includes("labels"), "rescue then label");
    const labelCall = gmail.calls.find((c) => c.op === "labels");
    assert.deepEqual(labelCall.change, { add: ["warmup"], remove: ["INBOX"] });
    assert.ok(ops.includes("star") && ops.includes("read"));
  });

  it("skips already-starred mail when sampling", async () => {
    const gmail = fakeGmail({ recent: [{ id: "r1", labels: ["STARRED"] }, { id: "r2", labels: [] }] });
    assert.equal(await main([...Q, "--apply", "--star", "5"], { gmail }), 0);
    assert.deepEqual(gmail.calls.filter((c) => c.op === "star").map((c) => c.id), ["r2"]);
  });

  it("refuses to report zeros when the mailbox is unreadable", async () => {
    const gmail = fakeGmail({ probeOk: false });
    let err = "";
    const origErr = console.error;
    console.error = (m) => { err += m; };
    try {
      assert.equal(await main([...Q], { gmail }), 1);
    } finally {
      console.error = origErr;
    }
    assert.match(err, /refusing to report zeros/);
  });
});
