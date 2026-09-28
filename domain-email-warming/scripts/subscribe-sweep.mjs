#!/usr/bin/env node
// subscribe-sweep - subscribe warm-up mailboxes to real announce lists.
//
// Announce-list mail is the stickiest inbound a new domain can earn: the
// confirmation exchange is a genuine two-way thread and list traffic keeps
// arriving for as long as the list lives. Web signup forms are mostly
// bot-gated, but every serious list system still accepts a subscribe email,
// which a warm-up mailbox can send itself.
//
// Each mailbox joins a hash-picked subset of lists so no single list sees the
// whole fleet. Confirmations are completed in-band: "reply" lists get a reply
// that keeps the Subject line (sourcehut, mailman, ezmlm, smartlist), "click"
// lists get their confirm link visited (pgLister-style).
//
//   subscribe-sweep.mjs --config-dir <dir> --account <gmail> [--apply]
//     [--max N] [--state <path>] [--gog <bin>]
//
// Without --apply the run is a dry run: it prints planned subscribes and
// completes no confirmations. Cloudflare send env comes from process env the
// same way vendor-outreach takes it.
//
// State dedupes (mailbox, list) pairs forever; re-running fills in what has
// not finished, so it is safe to run daily until every mailbox is confirmed.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { cfEnv, sendEmail } from "./lib/cloudflare.mjs";

const execFile = promisify(execFileCb);
const STATE_DEFAULT = join(homedir(), ".local/state/domain-email-warming/subscribe-sweep.json");
const PICKS_PER_MAILBOX = 2;
const MAX_PER_RUN = 8;
const CONFIRM_WINDOW_MS = 24 * 3600 * 1000;
const MAX_ATTEMPTS = 3;

// Low-volume announce lists that accept subscribe-by-email and confirm by a
// reply or a link. Chosen for trickle traffic - an announce list mails a few
// times a month, which is exactly the cadence a warming domain wants.
const LISTS = [
  { key: "srht-announce", to: "~sircmpwn/sr.ht-announce+subscribe@lists.sr.ht",
    domain: "lists.sr.ht", confirm: "reply" },
  { key: "info-gnu", to: "info-gnu-join@gnu.org",
    domain: "gnu.org", confirm: "reply" },
  { key: "debian-announce", to: "debian-announce-subscribe@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "apache-announce", to: "announce-subscribe@apache.org",
    domain: "apache.org", confirm: "reply" },
  { key: "python-announce", to: "python-announce-list+join@python.org",
    domain: "python.org", confirm: "reply" },
  { key: "gcc-announce", to: "gcc-announce-subscribe@gcc.gnu.org",
    domain: "gcc.gnu.org", confirm: "reply" },
  { key: "golang-announce", to: "golang-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "pgsql-announce", to: "pgsql-announce+subscribe@lists.postgresql.org",
    domain: "postgresql.org", confirm: "click" },
];

// Confirmation links only: the deny list wins over the allow list because an
// unsubscribe link in the same message would undo the subscription.
const LINK_DENY = /(unsubscribe|opt[\s-]?out|remove|preferences|manage|report)/i;
const LINK_ALLOW = /(confirm|verify|activate|subscribe|optin|opt-in|double)/i;
const CONFIRM_SUBJECT = /(confirm|verify|subscribe|subscription|welcome|join)/i;

function parseArgs(argv) {
  const o = { apply: false, state: STATE_DEFAULT, gog: "gog", max: MAX_PER_RUN };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--config-dir") o.dir = argv[++i];
    else if (a === "--account") o.account = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--gog") o.gog = argv[++i];
    else if (a === "--max") o.max = parseInt(argv[i + 1], 10);
  }
  return o;
}

function hash(s) {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function listsFor(email) {
  const start = hash(email) % LISTS.length;
  return Array.from({ length: PICKS_PER_MAILBOX }, (_, i) => LISTS[(start + i) % LISTS.length]);
}

function decodeQP(body) {
  return body.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)));
}

function extractConfirmLink(raw) {
  const urls = new Set();
  for (const m of decodeQP(raw).matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
    urls.add(m[0].replace(/[.,;:]+$/, ""));
  }
  return [...urls].find((u) => {
    try {
      const intent = new URL(u).pathname + new URL(u).search;
      return !LINK_DENY.test(intent) && LINK_ALLOW.test(intent);
    } catch {
      return false;
    }
  });
}

function toAddr(raw) {
  const m = raw.match(/^to\t+(.+)$/m) || raw.match(/^to:\s*(.+)$/mi);
  if (!m) return null;
  const addr = m[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/);
  return addr ? addr[0].toLowerCase() : null;
}

function headerField(raw, name) {
  const m = raw.match(new RegExp(`^${name}\\t+(.+)$`, "m")) ||
            raw.match(new RegExp(`^${name}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : null;
}

async function gogSearch(bin, account, query) {
  try {
    const { stdout } = await execFile(bin, ["-a", account, "gmail", "messages", "search",
                                          query, "--max", "50", "-j"], { timeout: 60_000 });
    const i = stdout.indexOf("{");
    return JSON.parse(stdout.slice(i)).messages ?? [];
  } catch {
    return [];
  }
}

async function gogBody(bin, account, id) {
  try {
    const { stdout } = await execFile(bin, ["-a", account, "gmail", "get", id,
                                          "--format", "full"], { timeout: 60_000 });
    return stdout;
  } catch {
    return "";
  }
}

async function loadState(path) {
  if (!existsSync(path)) return { pairs: {} };
  return JSON.parse(await readFile(path, "utf8"));
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 1));
}

async function mailboxes(dir) {
  const { readdir } = await import("node:fs/promises");
  const out = [];
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".warmup.json")).sort()) {
    const cfg = JSON.parse(await readFile(join(dir, f), "utf8"));
    for (const id of cfg.identities ?? []) {
      if (id?.address) out.push({ address: id.address, name: id.name ?? "", cfg });
    }
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir || !opts.account) {
    console.error("usage: subscribe-sweep.mjs --config-dir <dir> --account <gmail> [--apply]");
    return 2;
  }
  const state = await loadState(opts.state);
  const boxes = await mailboxes(opts.dir);
  const now = Date.now();
  const pairs = state.pairs;

  // Register missing pairs; pairs for finished work survive across runs.
  for (const b of boxes) {
    for (const l of listsFor(b.address)) {
      const k = `${b.address}|${l.key}`;
      if (!pairs[k]) pairs[k] = { list: l.key, status: "new", attempts: 0, sentAt: 0 };
    }
  }

  const envByDomain = new Map();
  const envFor = (b) => {
    const d = b.address.split("@")[1];
    if (!envByDomain.has(d)) envByDomain.set(d, cfEnv(b.cfg));
    return envByDomain.get(d);
  };

  // 1. Complete pending confirmations: one gog search per list domain, then
  //    match confirmation mail to the mailbox it reached.
  for (const l of LISTS) {
    const pend = Object.entries(pairs).filter(
      ([, p]) => p.list === l.key && p.status === "requested" &&
                 now - p.sentAt < CONFIRM_WINDOW_MS);
    if (!pend.length) continue;
    const query = `in:anywhere ${l.domain} newer_than:2d`;
    for (const msg of await gogSearch(opts.gog, opts.account, query)) {
      const mid = msg.id ?? msg.messageId;
      if (!mid) continue;
      const body = await gogBody(opts.gog, opts.account, mid);
      const to = toAddr(body);
      if (!to || !CONFIRM_SUBJECT.test(msg.subject ?? "")) continue;
      const k = `${to}|${l.key}`;
      if (!pairs[k] || pairs[k].status !== "requested") continue;
      if (!opts.apply) {
        console.log(`would confirm ${to} on ${l.key}`);
        continue;
      }
      let ok = false, detail = "";
      if (l.confirm === "click") {
        const link = extractConfirmLink(body);
        if (!link) { detail = "no confirm link"; }
        else {
          try {
            const r = await fetch(link, { redirect: "follow",
                                          signal: AbortSignal.timeout(20_000) });
            ok = r.ok;
            detail = `clicked -> ${r.status}`;
          } catch (e) {
            detail = `click failed: ${e.message}`;
          }
        }
      } else {
        // Reply keeps the Subject (with the token) and goes back to the
        // confirm address the list sent from.
        const from = headerField(body, "from");
        const subject = msg.subject ?? "";
        const confTo = from?.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/)?.[0];
        const box = boxes.find((b) => b.address.toLowerCase() === to);
        if (!confTo || !box) { detail = "no confirm address"; }
        else {
          const res = await sendEmail(envFor(box), {
            from: box.address, fromName: box.name,
            to: confTo,
            subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
            text: "confirm",
            replyTo: box.address,
          });
          ok = res.ok;
          detail = res.ok ? "confirm reply sent" : `reply failed: ${res.error}`;
        }
      }
      if (ok) {
        pairs[k].status = "confirmed";
        pairs[k].confirmedAt = now;
      }
      console.log(`${ok ? "confirmed" : "confirm-pending"} ${to} on ${l.key} (${detail})`);
    }
  }

  // 2. Send fresh subscribes, capped per run so the list operators see a
  //    trickle rather than a flood.
  let sent = 0;
  for (const [k, p] of Object.entries(pairs)) {
    if (sent >= opts.max) break;
    if (p.status === "requested" && now - p.sentAt >= CONFIRM_WINDOW_MS) {
      p.status = p.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "retry";
    }
    if (p.status === "requested" || p.status === "confirmed" || p.status === "failed") continue;
    if (p.attempts >= MAX_ATTEMPTS) { p.status = "failed"; continue; }
    const [addr, lkey] = k.split("|");
    const l = LISTS.find((x) => x.key === lkey);
    const box = boxes.find((b) => b.address === addr);
    if (!l || !box) continue;
    if (!opts.apply) {
      console.log(`would subscribe ${addr} -> ${l.key}`);
      sent++;
      continue;
    }
    const res = await sendEmail(envFor(box), {
      from: box.address, fromName: box.name,
      to: l.to,
      subject: "subscribe",
      text: "subscribe",
      replyTo: box.address,
    });
    if (res.ok) {
      p.status = "requested";
      p.sentAt = now;
      p.attempts++;
      console.log(`subscribe ${addr} -> ${l.key}`);
    } else {
      console.error(`FAILED ${addr} -> ${l.key}: ${res.error}`);
    }
    sent++;
  }

  if (opts.apply) await saveState(opts.state, state);
  const done = Object.values(pairs).filter((p) => p.status === "confirmed").length;
  console.log(`${Object.keys(pairs).length} pairs, ${done} confirmed, ${sent} sent this run`);
  return 0;
}

process.exitCode = await main();
