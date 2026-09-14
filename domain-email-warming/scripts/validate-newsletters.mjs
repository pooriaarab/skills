#!/usr/bin/env node
// Check that every publication in a newsletter list is real and actually
// subscribable, before any of it reaches a mailbox we care about.
//
// This exists because a list is usually assembled by a model, and a model will
// produce a plausible signup URL for a publication that has no newsletter, or a
// dead path on a real publisher. Both look identical to a correct entry until
// you fetch them. Subscribing a real company mailbox against a guessed URL
// wastes the address and teaches you nothing.
//
//   validate-newsletters.mjs --list <list.json> [--write]
//
// --write updates the list in place, annotating each entry with what was found.

import { readFile, writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const LIST = flag("list");
const WRITE = args.includes("--write");
if (!LIST) {
  console.error("usage: validate-newsletters.mjs --list <list.json> [--write]");
  process.exit(2);
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** An email input is the cheapest honest proof that a page can be subscribed to. */
const EMAIL_INPUT =
  /<input[^>]*(type=["']?email|name=["']?[^"'>]*(email|EMAIL)[^"'>]*["']?|id=["']?[^"'>]*email)/i;

function detectPlatform(html, url) {
  if (/substack\.com/i.test(url) || /substack/i.test(html)) return "substack";
  if (/beehiiv/i.test(html)) return "beehiiv";
  if (/list-manage\.com|mailchimp/i.test(html)) return "mailchimp";
  if (/hs-form|hubspot/i.test(html)) return "hubspot";
  if (EMAIL_INPUT.test(html)) return "form";
  return "unknown";
}

async function check(entry) {
  const url = String(entry.url ?? "");
  if (!/^https?:\/\//i.test(url)) {
    return { ...entry, valid: false, status: null, finding: "url is not http(s)" };
  }
  let res;
  try {
    res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    return { ...entry, valid: false, status: null, finding: `unreachable: ${err.message}` };
  }
  // A bot-block is not a dead page. Publishers behind a WAF answer 403 or 429
  // to a plain fetch while the site is perfectly real and subscribable in a
  // browser. Calling that "invalid" would throw away good publishers, so it is
  // reported as needing a browser instead.
  if (res.status === 403 || res.status === 429) {
    return { ...entry, valid: false, blocked: true, status: res.status,
      finding: `HTTP ${res.status} - blocks automated fetch, needs a browser to verify` };
  }
  if (!res.ok) {
    return { ...entry, valid: false, status: res.status, finding: `HTTP ${res.status} - page not found` };
  }
  const html = await res.text().catch(() => "");
  const hasForm = EMAIL_INPUT.test(html);
  const platform = detectPlatform(html, res.url);
  return {
    ...entry,
    valid: hasForm || platform === "substack",
    status: res.status,
    resolved_url: res.url !== url ? res.url : undefined,
    detected_method: platform,
    finding: hasForm
      ? `email input found (${platform})`
      : platform === "substack"
        ? "substack publication"
        : "no email input on the page - signup may be elsewhere",
  };
}

const list = JSON.parse(await readFile(LIST, "utf8"));
if (!Array.isArray(list)) {
  console.error("list must be a JSON array");
  process.exit(2);
}

const out = [];
for (const entry of list) {
  const r = await check(entry);
  out.push(r);
  const mark = r.valid ? "ok   " : r.blocked ? "BLOCK" : "BAD  ";
  console.log(`${mark} ${String(r.name ?? "?").slice(0, 34).padEnd(34)} ${r.finding}`);
  // One at a time, with a pause: a burst of requests from one IP across a list
  // of publishers is the behaviour that gets an address blocked.
  await new Promise((r2) => setTimeout(r2, 1200));
}

const good = out.filter((r) => r.valid).length;
const blocked = out.filter((r) => r.blocked).length;
console.log(`\n${good}/${out.length} verified subscribable, ${blocked} blocked a plain fetch, ${out.length - good - blocked} not usable`);
if (blocked) console.log("Blocked entries are not rejected - check them with a browser.");
if (WRITE) {
  await writeFile(LIST, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`annotated ${LIST}`);
}
