import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { main, blocklistStatus, sendingDomains } from "../scripts/reputation-monitor.mjs";

function nxdomain() {
  return Object.assign(new Error("getaddrinfo ENOTFOUND x"), { code: "ENOTFOUND" });
}

describe("blocklistStatus", () => {
  it("reports listed only on an actual answer", async () => {
    const r = { resolve4: async () => ["127.0.1.2"] };
    assert.deepEqual(await blocklistStatus(r, "evil.example", "dbl.spamhaus.org"),
      { status: "listed", detail: "127.0.1.2" });
  });

  it("reports clean on NXDOMAIN", async () => {
    const r = { resolve4: async () => { throw nxdomain(); } };
    assert.deepEqual(await blocklistStatus(r, "ok.example", "multi.surbl.org"),
      { status: "clean", detail: null });
  });

  it("reports unverifiable on refusal, never listed", async () => {
    const r = { resolve4: async () => { throw Object.assign(new Error("query refused"), { code: "EREFUSED" }); } };
    const s = await blocklistStatus(r, "ok.example", "dbl.spamhaus.org");
    assert.equal(s.status, "unverifiable");
  });
});

describe("sendingDomains", () => {
  it("derives send-only from the apex, not from DNS", () => {
    const ds = sendingDomains({
      sendingDomain: "example.com",
      identities: [{ address: "a@example.com" }, { address: "b@mail.example.com" }],
    });
    assert.deepEqual(ds, [
      { domain: "example.com", role: "send+receive", returnPath: null },
      { domain: "mail.example.com", role: "send-only", returnPath: "cf-bounce.mail.example.com" },
    ]);
  });
});

describe("main", () => {
  function configDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "repmon-test-"));
    fs.writeFileSync(path.join(dir, "t.warmup.json"), JSON.stringify({
      sendingDomain: "example.com",
      dkimSelectors: ["s1"],
      identities: [{ address: "a@example.com" }],
    }));
    return dir;
  }

  it("exits 2 with the listing in the report when a domain is listed", async () => {
    const dir = configDir();
    const out = path.join(dir, "report.json");
    const resolver = { resolve4: async () => ["127.0.1.2"] };
    const checkDomain = async () => ({ findings: [{ level: "ok", message: "fine" }] });
    const code = await main(["--config-dir", dir, "--out", out], { resolver, checkDomain });
    assert.equal(code, 2);
    const rep = JSON.parse(fs.readFileSync(out, "utf8"));
    assert.equal(rep.summary.fail, 2); // one per blocklist
    assert.match(JSON.stringify(rep.domains["example.com"].auth), /Listed on dbl\.spamhaus\.org/);
  });

  it("exits 0 on clean and passes selectors plus resolver through", async () => {
    const dir = configDir();
    const seen = [];
    const resolver = { resolve4: async () => { throw nxdomain(); } };
    const checkDomain = async (domain, opts) => { seen.push([domain, opts]); return { findings: [] }; };
    const code = await main(["--config-dir", dir, "--json", "--no-blacklist"], { resolver, checkDomain });
    assert.equal(code, 0);
    assert.equal(seen[0][0], "example.com");
    assert.deepEqual(seen[0][1].dkimSelectors, ["s1"]);
    assert.equal(seen[0][1].resolver, resolver);
  });

  it("warn level gates exit 2 only under --fail-on warn", async () => {
    const dir = configDir();
    const resolver = { resolve4: async () => { throw nxdomain(); } };
    const checkDomain = async () => ({ findings: [{ level: "warn", message: "inherits policy" }] });
    const args = ["--config-dir", dir, "--no-blacklist"];
    assert.equal(await main([...args], { resolver, checkDomain }), 0);
    assert.equal(await main([...args, "--fail-on", "warn"], { resolver, checkDomain }), 2);
  });
});
