import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { main, runFlow, findRef, flatten, hashPick, PUBLICATIONS } from "../scripts/digest-sweep.mjs";

function fakeExec(respond) {
  const calls = [];
  const exec = async (bin, args) => {
    calls.push({ bin, args });
    return { stdout: await respond(bin, args, calls.length) };
  };
  exec.calls = calls;
  return exec;
}

const snap = (nodes) => JSON.stringify({ nodes });

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "digest-test-"));
}

function configDirWith(mailbox) {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, "t.warmup.json"), JSON.stringify({
    identities: [{ address: mailbox }],
  }));
  return dir;
}

describe("hashPick", () => {
  it("is stable per mailbox and spreads across publications", () => {
    const pubs = [{ key: "a" }, { key: "b" }, { key: "c" }];
    assert.equal(hashPick("m@x.io", pubs), hashPick("m@x.io", pubs));
    const keys = new Set(["a@x.io", "b@x.io", "c@x.io", "d@x.io", "e@x.io"].map((m) => hashPick(m, pubs).key));
    assert.ok(keys.size > 1, "expected spread");
  });
});

describe("findRef", () => {
  it("matches case-insensitively over name/value/placeholder", () => {
    const nodes = flatten({ nodes: [
      { ref: "@e1", role: "textbox", name: "Email" },
      { ref: "@e2", role: "button", name: "Subscribe" },
    ] });
    assert.equal(findRef(nodes, "email"), "@e1");
    assert.equal(findRef(nodes, "SUBSCRIBE"), "@e2");
    assert.equal(findRef(nodes, "absent"), null);
  });
});

describe("runFlow", () => {
  it("fills, clicks and unchecks through a small funnel", async () => {
    const exec = fakeExec(async (bin, args) => {
      if (args[0] === "snapshot") {
        return snap([
          { ref: "@e1", role: "textbox", name: "Email" },
          { ref: "@e2", role: "button", name: "Subscribe" },
          { ref: "@e3", role: "checkbox", name: "upsell", checked: true },
        ]);
      }
      return "✓ Done";
    });
    const pub = { subscribeUrl: "https://example.com/sub", flow: [
      { op: "fill", match: "email", value: "{mailbox}" },
      { op: "click", match: "subscribe" },
      { op: "uncheck-all" },
      { op: "expect", match: "subscribe" },
    ] };
    const lines = [];
    await runFlow(exec, pub, "m@x.io", (m) => lines.push(m));
    const verbs = exec.calls.map((c) => c.args[0]).join(",");
    assert.match(verbs, /open/);
    assert.ok(exec.calls.some((c) => c.args[0] === "fill" && c.args[2] === "m@x.io"), "fills the mailbox");
    assert.ok(exec.calls.some((c) => c.args[0] === "click" && c.args[1] === "@e2"), "clicks by ref");
    assert.ok(exec.calls.some((c) => c.args[0] === "uncheck" && c.args[1] === "@e3"), "unchecks upsells");
  });

  it("fails loudly when a target is missing", async () => {
    const exec = fakeExec(async (bin, args) => (args[0] === "snapshot" ? snap([]) : "ok"));
    await assert.rejects(
      runFlow(exec, { subscribeUrl: "https://example.com/", flow: [{ op: "click", match: "nope" }] }, "m@x.io", () => {}),
      /click target not found/,
    );
  });
});

describe("main", () => {
  it("does nothing while every publication is unpiloted", async () => {
    const dir = configDirWith("m@x.io");
    const code = await main(["--config-dir", dir, "--account", "seed@example.com", "--state", path.join(dir, "s.json")],
      { exec: fakeExec(async () => { throw new Error("must not call out"); }) });
    assert.equal(code, 0);
  });

  it("pilot flips the flag and dry-run then picks the mailbox up", async () => {
    PUBLICATIONS.push({ key: "tp", label: "test pub", subscribeUrl: "https://example.com/", sender: "example.com", pilot: false, flow: [
      { op: "expect", match: "anything" },
    ] });
    const dir = configDirWith("m@x.io");
    const state = path.join(dir, "s.json");
    const snapExec = fakeExec(async (bin, args) => (args[0] === "snapshot" ? snap([{ ref: "@e1", name: "anything" }]) : "ok"));
    const pilotCode = await main(["--config-dir", dir, "--pilot", "tp", "--mailbox", "m@x.io", "--state", state], { exec: snapExec });
    assert.equal(pilotCode, 0);
    assert.equal(JSON.parse(fs.readFileSync(state, "utf8")).pilots.tp, true);

    let out = "";
    const origLog = console.log;
    console.log = (m) => { out += m + "\n"; };
    try {
      await main(["--config-dir", dir, "--account", "seed@example.com", "--state", state, "--max", "3"], { exec: snapExec });
    } finally {
      console.log = origLog;
    }
    assert.match(out, /would subscribe: m@x\.io\|tp/);
    PUBLICATIONS.pop();
  });
});
