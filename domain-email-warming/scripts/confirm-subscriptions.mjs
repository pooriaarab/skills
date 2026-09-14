#!/usr/bin/env node
// Find double opt-in confirmation links in mail that arrived at the warmed
// mailboxes, and visit them.
//
// Subscribing a warmed mailbox to real industry newsletters gives it genuine
// inbound mail, which is part of looking like a mailbox someone uses. Most
// reputable publishers use double opt-in, so the subscription does nothing
// until the link is clicked. That is the step this automates.
//
//   confirm-subscriptions.mjs --source gmail --account <addr> [--apply]
//   confirm-subscriptions.mjs --source d1 --db <name> --bucket <r2> [--apply]
//
// Dry run unless --apply.
//
// Two sources, because where the warmed mailbox delivers differs by setup.
// `gmail` reads a seed mailbox through the `gog` CLI and needs nothing else.
// `d1` reads an application's own inbound store through wrangler, and needs a
// Cloudflare token with D1 and R2 read access in the environment.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const APPLY = args.includes("--apply");
const DB = flag("db");
const BUCKET = flag("bucket");
const HOURS = Number(flag("hours", "48"));

const SOURCE = flag("source", "gmail");
const ACCOUNT = flag("account");

if (SOURCE === "d1" && (!DB || !BUCKET)) {
  console.error("usage: confirm-subscriptions.mjs --source d1 --db <name> --bucket <r2> [--hours N] [--apply]");
  process.exit(2);
}
if (SOURCE === "gmail" && !ACCOUNT) {
  console.error("usage: confirm-subscriptions.mjs --source gmail --account <addr> [--hours N] [--apply]");
  process.exit(2);
}
if (!["gmail", "d1"].includes(SOURCE)) {
  console.error(`unknown --source "${SOURCE}"; expected gmail or d1`);
  process.exit(2);
}

/** A confirmation mail announces itself; anything else is left alone. */
const CONFIRM_SUBJECT = /(confirm|verify|activate|opt[\s-]?in|subscription|subscribe)/i;

// Only links that say what they do. An unsubscribe or a preferences link in the
// same message would undo the subscription we are trying to complete, so the
// deny list is checked first and wins.
const DENY = /(unsubscribe|opt[\s-]?out|remove|preferences|manage|profile|forward|report)/i;
const ALLOW = /(confirm|verify|activate|subscribe|optin|opt-in|double)/i;

async function gog(argv) {
  const { stdout } = await execFile("gog", argv, { maxBuffer: 32 * 1024 * 1024, timeout: 120_000 });
  return stdout;
}

async function wrangler(argv) {
  const { stdout } = await execFile("bunx", ["wrangler", ...argv], {
    maxBuffer: 64 * 1024 * 1024,
    timeout: 180_000,
  });
  return stdout;
}

function parseJsonLoose(s) {
  const i = s.indexOf("[");
  if (i === -1) return null;
  try {
    return JSON.parse(s.slice(i));
  } catch {
    return null;
  }
}

/**
 * Gmail search cannot express "newer than N hours", only whole days, so the
 * window is rounded up and the caller-side subject filter does the rest.
 */
async function recentInboundGmail() {
  const days = Math.max(1, Math.ceil(HOURS / 24));
  const out = await gog([
    "-a", ACCOUNT, "gmail", "messages", "search",
    `newer_than:${days}d in:anywhere (confirm OR verify OR subscribe OR "opt in")`,
    "--max", "50", "-j",
  ]);
  const i = out.search(/[[{]/);
  if (i === -1) return [];
  let parsed;
  try {
    parsed = JSON.parse(out.slice(i));
  } catch {
    return [];
  }
  const list = Array.isArray(parsed) ? parsed : (parsed.messages ?? []);
  return list.map((m) => ({
    id: m.id,
    alias: ACCOUNT,
    from_address: m.from ?? "",
    subject: m.subject ?? "",
    raw_key: null,
  }));
}

async function recentInboundD1() {
  const since = Date.now() - HOURS * 3600_000;
  const sql =
    `SELECT id, alias, from_address, subject, raw_key FROM inbound_message ` +
    `WHERE direction='inbound' AND received_at >= ${since} ORDER BY received_at DESC LIMIT 200`;
  const out = await wrangler(["d1", "execute", DB, "--remote", "--json", "--command", sql]);
  const parsed = parseJsonLoose(out);
  return parsed?.[0]?.results ?? [];
}

/**
 * Undo quoted-printable before scanning. A confirmation URL is routinely split
 * across lines with a trailing `=`, and a naive scan then extracts half a link
 * that 404s — which looks like the publisher's fault rather than ours.
 */
function decodeQuotedPrintable(body) {
  return body
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function extractLinks(raw) {
  const text = decodeQuotedPrintable(raw);
  const urls = new Set();
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
    urls.add(m[0].replace(/[.,;:]+$/, ""));
  }
  return [...urls].filter((u) => !DENY.test(u) && ALLOW.test(u));
}

/** gog exposes no raw-message command, so the body comes from the preview. */
async function bodyForGmail(row) {
  const out = await gog(["-a", ACCOUNT, "gmail", "messages", "search", `rfc822msgid:${row.id}`, "--max", "1", "-j"]).catch(() => "");
  return `${row.subject}\n${out}`;
}

async function bodyForD1(row) {
  return wrangler(["r2", "object", "get", `${BUCKET}/${row.raw_key}`, "--remote", "--pipe"]);
}

async function main() {
  const fetchRows = SOURCE === "gmail" ? recentInboundGmail : recentInboundD1;
  const fetchBody = SOURCE === "gmail" ? bodyForGmail : bodyForD1;
  const rows = (await fetchRows()).filter((r) => CONFIRM_SUBJECT.test(r.subject ?? ""));
  if (!rows.length) {
    console.log(`no confirmation-shaped mail in the last ${HOURS}h`);
    return;
  }
  console.log(`${rows.length} candidate message(s)${APPLY ? "" : " (DRY RUN)"}\n`);

  for (const r of rows) {
    let raw = "";
    try {
      raw = await fetchBody(r);
    } catch (err) {
      console.log(`  SKIP  ${r.alias}  ${String(r.subject).slice(0, 44)}  (raw unreadable: ${err.message.split("\n")[0]})`);
      continue;
    }
    const links = extractLinks(raw);
    console.log(`  ${r.alias}  <- ${r.from_address}`);
    console.log(`    ${String(r.subject).slice(0, 70)}`);
    if (!links.length) {
      console.log("    no confirmation link found");
      continue;
    }
    for (const url of links.slice(0, 3)) {
      if (!APPLY) {
        console.log(`    would visit  ${url.slice(0, 100)}`);
        continue;
      }
      try {
        const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000) });
        console.log(`    ${res.status}  ${url.slice(0, 90)}`);
      } catch (err) {
        console.log(`    ERR  ${err.message}  ${url.slice(0, 70)}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(`confirm-subscriptions: ${err.message}`);
  process.exit(1);
});
