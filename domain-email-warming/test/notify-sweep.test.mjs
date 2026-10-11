import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { main, drip, endpoints } from "../scripts/notify-sweep.mjs";

function stateDirWith(endpointFiles, notifyState = null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notify-test-"));
  fs.mkdirSync(path.join(dir, "creds", "formsubmit"), { recursive: true });
  for (const [name, body] of Object.entries(endpointFiles)) {
    fs.writeFileSync(path.join(dir, "creds", "formsubmit", name), body);
  }
  if (notifyState) fs.writeFileSync(path.join(dir, "notify.json"), JSON.stringify(notifyState));
  return dir;
}

describe("endpoints", () => {
  it("reads mailbox endpoints and skips malformed files", () => {
    const dir = stateDirWith({
      a_x_io: "https://formsubmit.co/ajax/a@x.io\n",
      junk: "not a url",
      evil: "https://evil.example/ajax/a@x.io",
    });
    assert.deepEqual(endpoints(dir), [{ mailbox: "a@x.io", url: "https://formsubmit.co/ajax/a@x.io" }]);
  });

  it("returns empty when no signup-sweep creds exist yet", () => {
    assert.deepEqual(endpoints(fs.mkdtempSync(path.join(os.tmpdir(), "notify-empty-"))), []);
  });
});

describe("drip", () => {
  it("posts with the mailbox domain as origin and accepts success", async () => {
    const calls = [];
    const exec = async (bin, args) => {
      calls.push({ bin, args });
      return { stdout: JSON.stringify({ success: "true", message: "submitted" }) };
    };
    const r = await drip(exec, "a@x.io", "https://formsubmit.co/ajax/a@x.io");
    assert.equal(r.ok, true);
    assert.equal(calls[0].bin, "curl");
    assert.ok(calls[0].args.includes("Origin: https://x.io"), "origin header present");
  });

  it("reports the service message on failure", async () => {
    const exec = async () => ({ stdout: JSON.stringify({ success: "false", message: "blocked" }) });
    const r = await drip(exec, "a@x.io", "https://formsubmit.co/ajax/a@x.io");
    assert.equal(r.ok, false);
    assert.match(r.detail, /blocked/);
  });
});

describe("main", () => {
  it("dry-runs without calling out and skips recently dripped mailboxes", async () => {
    const dir = stateDirWith(
      { a_x_io: "https://formsubmit.co/ajax/a@x.io", b_x_io: "https://formsubmit.co/ajax/b@x.io" },
      { lastDrip: { "a@x.io": Date.now() } },
    );
    let out = "";
    const origLog = console.log;
    console.log = (m) => { out += m + "\n"; };
    try {
      const code = await main(["--state-dir", dir, "--max", "10"], {
        exec: async () => { throw new Error("dry-run must not call out"); },
      });
      assert.equal(code, 0);
    } finally {
      console.log = origLog;
    }
    assert.match(out, /would drip: b@x\.io/);
    assert.doesNotMatch(out, /would drip: a@x\.io/);
  });

  it("apply drips due mailboxes and records the run", async () => {
    const dir = stateDirWith({ a_x_io: "https://formsubmit.co/ajax/a@x.io" });
    const exec = async () => ({ stdout: JSON.stringify({ success: "true" }) });
    const code = await main(["--state-dir", dir, "--apply", "--max", "10"], { exec });
    assert.equal(code, 0);
    const st = JSON.parse(fs.readFileSync(path.join(dir, "notify.json"), "utf8"));
    assert.ok(st.lastDrip["a@x.io"] > 0);
  });
});
