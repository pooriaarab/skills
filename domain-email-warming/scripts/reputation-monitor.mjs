#!/usr/bin/env node
// reputation-monitor.mjs — daily standing watch over fleet DNS auth and blocklists.
//
// warmctl preflight checks one config on demand; this runs the same checks
// across every fleet config plus domain blocklist lookups, and exits non-zero
// when anything needs the operator. Two halves:
//
//  1. AUTH: checkDomain per sending domain (SPF/DKIM/DMARC/MX, roles from the
//     config exactly like warmctl derives them).
//  2. BLOCKLISTS: each distinct domain against SURBL (multi.surbl.org) and
//     Spamhaus DBL (dbl.spamhaus.org). A resolving A record means listed.
//
// Blocklist queries go through the SYSTEM resolver, never the authoritative
// one: asking a domain's own nameservers whether a blocklist lists it is
// nonsense. Spamhaus refuses queries from public resolvers (8.8.8.8 etc),
// so a refusal reports "unverifiable" (warn), never "listed". Only an
// actual answer is a listing.
//
//   reputation-monitor.mjs --config-dir <dir> [--json] [--out <path>]
//     [--fail-on warn|fail|never] [--no-blacklist]

import fs from "node:fs";
import path from "node:path";
import { Resolver } from "node:dns/promises";
import { checkDomain, organizationalDomain } from "./lib/preflight.mjs";

const BLOCKLISTS = ["multi.surbl.org", "dbl.spamhaus.org"];

function parseArgs(argv) {
  const o = { configDir: null, json: false, out: null, failOn: "fail", blacklist: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--config-dir") o.configDir = argv[++i];
    else if (a === "--json") o.json = true;
    else if (a === "--out") o.out = argv[++i];
    else if (a === "--fail-on") o.failOn = argv[++i];
    else if (a === "--no-blacklist") o.blacklist = false;
  }
  return o;
}

function sendingDomains(cfg) {
  // Same role derivation as warmctl: a host is send-only because the program
  // said so (it differs from the apex), never because of a missing MX.
  const apex = cfg.sendingDomain ?? null;
  return [...new Set((cfg.identities ?? []).map((i) => i.address.split("@")[1]))].map((domain) => {
    const isSub = apex ? domain !== apex : domain !== organizationalDomain(domain);
    return { domain, role: isSub ? "send-only" : "send+receive", returnPath: isSub ? `cf-bounce.${domain}` : null };
  });
}

async function blocklistStatus(resolver, domain, zone) {
  // Listed = an A answer. NXDOMAIN = clean. Anything else (refused, timeout,
  // SERVFAIL) = unverifiable: crying "listed" on a refusal would page the
  // operator over their own resolver choice.
  try {
    const addrs = await resolver.resolve4(`${domain}.${zone}`);
    return addrs.length ? { status: "listed", detail: addrs.join(",") } : { status: "clean", detail: null };
  } catch (e) {
    if (e?.code === "ENOTFOUND") return { status: "clean", detail: null };
    return { status: "unverifiable", detail: String(e?.code ?? e?.message ?? e).slice(0, 80) };
  }
}

async function main(argv, deps = {}) {
  const o = parseArgs(argv);
  if (!o.configDir) {
    console.error("usage: reputation-monitor.mjs --config-dir <dir> [--json] [--out <path>]");
    return 1;
  }
  if (!["warn", "fail", "never"].includes(o.failOn)) {
    console.error("--fail-on must be warn, fail or never");
    return 1;
  }
  const resolver = deps.resolver ?? new Resolver();
  const check = deps.checkDomain ?? checkDomain;
  const report = { at: new Date().toISOString(), domains: {}, summary: { fail: 0, warn: 0, ok: 0 } };
  const files = fs.readdirSync(o.configDir).filter((f) => f.endsWith(".warmup.json")).sort();
  for (const f of files) {
    const cfg = JSON.parse(fs.readFileSync(path.join(o.configDir, f), "utf8"));
    for (const { domain, role, returnPath } of sendingDomains(cfg)) {
      if (report.domains[domain]) continue;
      const auth = await check(domain, {
        dkimSelectors: cfg.dkimSelectors ?? ["cf-bounce"],
        role,
        returnPath,
        resolver,
      });
      const entry = { role, auth: auth.findings, blacklists: {} };
      if (o.blacklist) {
        for (const zone of BLOCKLISTS) {
          entry.blacklists[zone] = await blocklistStatus(resolver, domain, zone);
        }
      }
      report.domains[domain] = entry;
    }
  }
  for (const entry of Object.values(report.domains)) {
    for (const f of entry.auth) report.summary[f.level === "fail" ? "fail" : f.level === "warn" ? "warn" : "ok"]++;
    for (const [zone, b] of Object.entries(entry.blacklists)) {
      if (b.status === "listed") {
        report.summary.fail++;
        entry.auth.push({ level: "fail", message: `Listed on ${zone} (${b.detail}). Delist there before sending volume from this domain.` });
      } else if (b.status === "unverifiable") {
        report.summary.warn++;
      }
    }
  }
  const text = JSON.stringify(report, null, 2);
  if (o.out) {
    fs.mkdirSync(path.dirname(o.out), { recursive: true });
    fs.writeFileSync(o.out, text);
  }
  if (o.json || !o.out) console.log(text);
  else console.log(`domains=${Object.keys(report.domains).length} fail=${report.summary.fail} warn=${report.summary.warn}`);
  if (o.failOn === "never") return 0;
  if (report.summary.fail > 0) return 2;
  if (o.failOn === "warn" && report.summary.warn > 0) return 2;
  return 0;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (invoked) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message ?? e); process.exit(1); });
export { main, blocklistStatus, sendingDomains };
