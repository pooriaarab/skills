#!/usr/bin/env node
// Read DMARC aggregate reports that landed in the seed Gmail and summarize
// them per domain: who sent as us, how much passed, what failed and where.
//
// Reports arrive at dmarc@<domain> (every warmed zone publishes rua=) and
// forward to the seed inbox. Each report is a gzipped XML attachment; this
// pulls them through gog, parses without dependencies, and prints one honest
// table. Read-only: it changes nothing.
//
//   dmarc-report.mjs --account <gmail> [--days N] [--json] [--gog <bin>]
//
// Needs: gog with Gmail access. Quota-friendly: one search, then one raw
// fetch plus one attachment download per report.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { gunzipSync, inflateRawSync } from "node:zlib";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFile = promisify(execFileCb);
const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const ACCOUNT = flag("account");
const DAYS = Number(flag("days", "7"));
const GOG = flag("gog", "gog");
const JSON_OUT = args.includes("--json");
if (!ACCOUNT) {
  console.error("usage: dmarc-report.mjs --account <gmail> [--days N] [--json]");
  process.exit(2);
}

function looseJson(out) {
  const i = out.search(/[[{]/);
  if (i === -1) return null;
  try {
    return JSON.parse(out.slice(i));
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gog(argv, retries = 4) {
  for (let i = 0; ; i++) {
    try {
      const { stdout } = await execFile(GOG, argv, { maxBuffer: 64 * 1024 * 1024, timeout: 120_000 });
      return stdout;
    } catch (err) {
      // The signup daemon shares this Gmail quota; a rate limit means wait,
      // not fail. Anything else throws immediately.
      if (i >= retries || !/rateLimitExceeded|userRateLimitExceeded|Quota exceeded/i.test(String(err.message))) {
        throw err;
      }
      await sleep(30000 * (i + 1));
    }
  }
}

function walkParts(part, out = [], isRoot = true) {
  if (!part) return out;
  const body = part.body ?? {};
  // Report mail is often a bare attachment: the ROOT payload carries the
  // filename and attachment id with no sub-parts. A normal multipart root
  // has an empty filename, so accepting the root is safe.
  if (part.filename && body.attachmentId) {
    out.push({ filename: part.filename, id: body.attachmentId, mime: part.mimeType });
  }
  for (const p of part.parts ?? []) walkParts(p, out, false);
  return out;
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? m[1].trim() : null;
}

// Reporters zip (.zip, Google/Microsoft), gzip (.gz) or send raw .xml.
// Single-file zips only: read the first local header and inflate it.
function decodeReport(filename, buf) {
  if (/\.gz$/i.test(filename)) return gunzipSync(buf).toString("utf8");
  if (/\.zip$/i.test(filename)) {
    if (buf.readUInt32LE(0) !== 0x04034b50) throw new Error("not a zip");
    const method = buf.readUInt16LE(8);
    const size = buf.readUInt32LE(18);
    const nameLen = buf.readUInt16LE(26);
    const extraLen = buf.readUInt16LE(28);
    const start = 30 + nameLen + extraLen;
    const data = buf.subarray(start, start + size);
    return (method === 8 ? inflateRawSync(data) : data).toString("utf8");
  }
  return buf.toString("utf8");
}

// Aggregate schema: feedback/report_metadata + policy_published + records.
// Parsed with regexes on purpose: the schema is flat and stable, and a DOM
// dependency is heavier than the whole script.
function parseAggregate(xml) {
  const domain = tag(xml, "domain");
  const org = tag(xml, "org_name");
  const rows = [];
  for (const m of xml.matchAll(/<record>([\s\S]*?)<\/record>/g)) {
    const r = m[1];
    // The verdict lives in policy_evaluated (alignment-aware); auth_results
    // lists every signature found, aligned or not. A forwarded mail shows
    // several dkim passes for other domains and one aligned pass for ours.
    const pe = r.match(/<policy_evaluated>([\s\S]*?)<\/policy_evaluated>/)?.[1] ?? "";
    const auth = r.match(/<auth_results>([\s\S]*?)<\/auth_results>/)?.[1] ?? "";
    rows.push({
      ip: tag(r, "source_ip"),
      count: Number(tag(r, "count")) || 0,
      disposition: tag(pe, "disposition"),
      dkim: tag(pe, "dkim"),
      spf: tag(pe, "spf"),
      dkimDomains: [...auth.matchAll(/<dkim>[\s\S]*?<domain>([^<]*)<\/domain>[\s\S]*?<result>([^<]*)<\/result>/g)]
        .map((x) => `${x[1]}=${x[2]}`),
      headerFrom: tag(r, "header_from"),
    });
  }
  return { domain, org, rows };
}

async function main() {
  // No quoted phrases: they break gog's query parsing. subject:report
  // matches "Report domain:" and "[Preview] Report Domain:" alike.
  const query = `in:anywhere newer_than:${DAYS}d (subject:report-domain OR subject:report OR subject:dmarc)`;
  const found = looseJson(await gog(["-a", ACCOUNT, "gmail", "messages", "search", "--max", "100", "-j", "--", query]));
  const msgs = found?.messages ?? [];
  if (!msgs.length) {
    console.log(`no DMARC reports in the last ${DAYS}d`);
    return;
  }
  const tmp = mkdtempSync(join(tmpdir(), "dmarc-"));
  const agg = new Map(); // domain -> { reporters:Set, pass, fail, failIps:Map }
  let parsed = 0;
  try {
    for (const m of msgs) {
      const id = m.id ?? m.messageId;
      if (!id) continue;
      let raw;
      try {
        raw = looseJson(await gog(["-a", ACCOUNT, "gmail", "raw", id, "-j"]));
      } catch {
        continue;
      }
      for (const a of walkParts(raw?.payload)) {
        if (!/\.(xml|gz|zip)$/i.test(a.filename)) continue;
        const dest = join(tmp, `${id}-${a.filename}`);
        try {
          await gog(["-a", ACCOUNT, "gmail", "attachment", id, a.id, "--out", dest]);
        } catch {
          continue;
        }
        let xml;
        try {
          const buf = readFileSync(dest);
          xml = decodeReport(a.filename, buf);
        } catch {
          continue;
        }
        if (!xml.includes("<feedback>")) continue;
        const rep = parseAggregate(xml);
        if (!rep.domain) continue;
        parsed++;
        const d = agg.get(rep.domain) ?? { reporters: new Set(), pass: 0, fail: 0, failIps: new Map(), samples: [] };
        if (rep.org) d.reporters.add(rep.org);
        for (const r of rep.rows) {
          const ok = (r.dkim === "pass" || r.spf === "pass") && r.disposition !== "reject";
          if (ok) d.pass += r.count;
          else {
            d.fail += r.count;
            d.failIps.set(r.ip, (d.failIps.get(r.ip) ?? 0) + r.count);
            if (d.samples.length < 3) d.samples.push(r);
          }
        }
        agg.set(rep.domain, d);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (JSON_OUT) {
    const o = {};
    for (const [dom, d] of [...agg.entries()].sort()) {
      o[dom] = { reporters: [...d.reporters].sort(), pass: d.pass, fail: d.fail,
                 failIps: Object.fromEntries([...d.failIps.entries()].sort((a, b) => b[1] - a[1])) };
    }
    console.log(JSON.stringify({ reports: parsed, domains: o }, null, 1));
    return;
  }
  console.log(`${parsed} report(s) across ${agg.size} domain(s), last ${DAYS}d\n`);
  console.log(`${"domain".padEnd(28)} ${"pass".padStart(7)} ${"fail".padStart(6)}  reporters`);
  for (const [dom, d] of [...agg.entries()].sort()) {
    console.log(`${dom.padEnd(28)} ${String(d.pass).padStart(7)} ${String(d.fail).padStart(6)}  ${[...d.reporters].sort().join(",")}`);
    for (const [ip, n] of [...d.failIps.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)) {
      console.log(`${"".padEnd(28)} ${"".padStart(7)} ${String(n).padStart(6)}  FAIL from ${ip}`);
    }
    for (const s of d.samples) {
      console.log(`  sample: ip=${s.ip} n=${s.count} disp=${s.disposition} dkim=${s.dkim} spf=${s.spf} from=${s.headerFrom} sigs=[${s.dkimDomains.join(",")}]`);
    }
  }
}

main().catch((err) => {
  console.error(`dmarc-report: ${err.message}`);
  process.exit(1);
});
