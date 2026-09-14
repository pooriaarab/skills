import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkDomain, isPublicIPv4 } from "../scripts/lib/preflight.mjs";

/** Minimal stand-in for node:dns Resolver so no test performs real DNS. */
function fakeResolver({ txt = {}, mx = {} } = {}) {
  return {
    async resolveTxt(name) {
      if (!(name in txt)) throw Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" });
      return txt[name].map((s) => [s]);
    },
    async resolveMx(name) {
      if (!(name in mx)) throw Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" });
      return mx[name];
    },
  };
}

const levels = (r, match) => r.findings.filter((f) => f.message.includes(match)).map((f) => f.level);

describe("checkDomain", () => {
  it("fails when two SPF records are published", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({ txt: { "ex.com": ["v=spf1 include:a ~all", "v=spf1 include:b ~all"] } }),
    });
    assert.deepEqual(levels(r, "SPF records"), ["fail"]);
  });

  it("fails when SPF ends in +all", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({ txt: { "ex.com": ["v=spf1 include:a +all"] } }),
    });
    assert.deepEqual(levels(r, "+all"), ["fail"]);
  });

  it("fails when DMARC is missing and there is none to inherit", async () => {
    const r = await checkDomain("ex.com", { resolver: fakeResolver({ txt: { "ex.com": ["v=spf1 ~all"] } }) });
    assert.ok(r.findings.some((f) => f.level === "fail" && f.message.includes("_dmarc.ex.com")));
  });

  it("warns that subdomains inherit when p=reject carries no sp=", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({
        txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=reject;"] },
        mx: { "ex.com": [{ exchange: "mx.ex.com", priority: 10 }] },
      }),
    });
    assert.ok(r.findings.some((f) => f.level === "warn" && f.message.includes("inherits reject")));
  });

  it("does not warn about inheritance when sp= is set", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({
        txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=reject; sp=none;"] },
        mx: { "ex.com": [{ exchange: "mx.ex.com", priority: 10 }] },
      }),
    });
    assert.ok(!r.findings.some((f) => f.message.includes("inherits")));
  });

  it("fails when a named DKIM selector does not resolve", async () => {
    const r = await checkDomain("ex.com", {
      dkimSelectors: ["s1"],
      resolver: fakeResolver({ txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=none;"] } }),
    });
    assert.deepEqual(levels(r, "s1._domainkey.ex.com"), ["fail"]);
    assert.equal(r.dkim.s1, false);
  });

  it("accepts a DKIM record with no v= tag, since it defaults to DKIM1", async () => {
    const r = await checkDomain("ex.com", {
      dkimSelectors: ["s1"],
      resolver: fakeResolver({
        txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=none;"], "s1._domainkey.ex.com": ["k=rsa; p=abc"] },
      }),
    });
    assert.equal(r.dkim.s1, true);
  });

  it("fails a DKIM record whose v= tag names a version other than DKIM1", async () => {
    const r = await checkDomain("ex.com", {
      dkimSelectors: ["s1"],
      resolver: fakeResolver({
        txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=none;"], "s1._domainkey.ex.com": ["v=DKIM2; p=abc"] },
      }),
    });
    assert.equal(r.dkim.s1, false);
  });

  it("fails a DMARC record with no p= tag instead of reporting it ok", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({ txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1;"] } }),
    });
    assert.ok(r.findings.some((f) => f.level === "fail" && f.message.includes("no valid p=")));
    assert.equal(r.dmarc, null);
  });

  it("fails when two DMARC records are published", async () => {
    const r = await checkDomain("ex.com", {
      resolver: fakeResolver({
        txt: { "ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=reject;", "v=DMARC1; p=none;"] },
      }),
    });
    assert.ok(r.findings.some((f) => f.level === "fail" && f.message.includes("2 DMARC records")));
    assert.equal(r.dmarc, null);
  });

  it("a send-only subdomain needs no MX and checks SPF on its return path", async () => {
    const r = await checkDomain("mail.ex.com", {
      role: "send-only",
      returnPath: "cf-bounce.mail.ex.com",
      dkimSelectors: ["cf-bounce"],
      resolver: fakeResolver({
        txt: {
          "cf-bounce.mail.ex.com": ["v=spf1 include:cf ~all"],
          "cf-bounce._domainkey.mail.ex.com": ["v=DKIM1; p=abc"],
          "_dmarc.mail.ex.com": ["v=DMARC1; p=reject;"],
        },
      }),
    });
    assert.equal(r.findings.filter((f) => f.level === "fail").length, 0);
    assert.ok(r.findings.some((f) => f.message.includes("send-only")));
  });

  it("reports an inherited parent policy for a subdomain with no DMARC of its own", async () => {
    const r = await checkDomain("mail.ex.com", {
      role: "send-only",
      returnPath: "cf-bounce.mail.ex.com",
      resolver: fakeResolver({
        txt: { "cf-bounce.mail.ex.com": ["v=spf1 ~all"], "_dmarc.ex.com": ["v=DMARC1; p=reject; sp=quarantine;"] },
      }),
    });
    assert.equal(r.dmarc.inherited, true);
    assert.equal(r.dmarc.p, "quarantine");
  });
});

describe("isPublicIPv4", () => {
  it("rejects loopback, link-local, and RFC1918 ranges", () => {
    for (const ip of ["127.0.0.1", "169.254.169.254", "10.0.0.1", "172.16.0.5", "192.168.1.1", "0.0.0.0"]) {
      assert.equal(isPublicIPv4(ip), false, ip);
    }
  });

  it("accepts a routable public address", () => {
    assert.equal(isPublicIPv4("93.184.216.34"), true);
  });
});
