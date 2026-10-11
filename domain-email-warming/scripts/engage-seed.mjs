#!/usr/bin/env node
// engage-seed.mjs — hygiene plus engagement signals on warmup mail in the seed inbox.
//
// WHAT IT DOES (and does not): it rescues warmup mail from spam, stars a
// small rotating sample, and marks stale warmup mail read. It never replies:
// a reply from the seed account would impersonate the operator, and
// reply-inbound.mjs already answers humans from the warmed mailboxes. It also
// never touches mail outside the warmup filter query, and recent unread mail
// stays unread (the operator reads that as "new arrivals").
//
// Honest scope note: the sweeps read in:anywhere, so rescue changes no sweep
// outcome. The value is a truthful archive (spam holds mail the program
// counts on), steady read/star engagement signals, and a label that does not
// rot under twenty thousand unread.
//
//   engage-seed.mjs --account <seed gmail> --config-dir <dir> [--apply]
//     [--max N] [--star N] [--read-older-than-days N] [--label name] [--query ...]
//
// --config-dir points at the directory holding warmup-filter-query.txt (the
// same query string the Gmail filter and inbox-backstop use). --query
// overrides it literally for one-off runs.

import fs from "node:fs";
import path from "node:path";
import { makeGmail } from "./lib/gmail.mjs";

function parseArgs(argv) {
  const o = { apply: false, account: null, configDir: null, query: null, max: 100, star: 5, readOlderThanDays: 14, label: "warmup" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--account") o.account = argv[++i];
    else if (a === "--config-dir") o.configDir = argv[++i];
    else if (a === "--query") o.query = argv[++i];
    else if (a === "--max") o.max = Number(argv[++i]);
    else if (a === "--star") o.star = Number(argv[++i]);
    else if (a === "--read-older-than-days") o.readOlderThanDays = Number(argv[++i]);
    else if (a === "--label") o.label = argv[++i];
  }
  return o;
}

function hash32(s) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function queryFor(o) {
  if (o.query) return o.query;
  if (!o.configDir) return null;
  return fs.readFileSync(path.join(o.configDir, "warmup-filter-query.txt"), "utf8").trim();
}

async function main(argv, deps = {}) {
  const o = parseArgs(argv);
  if (!o.account) {
    console.error("usage: engage-seed.mjs --account <seed gmail> (--config-dir <dir> | --query ...) [--apply]");
    return 1;
  }
  let q;
  try {
    q = queryFor(o);
  } catch (e) {
    console.error(`cannot read filter query: ${e.message}`);
    return 1;
  }
  if (!q) {
    console.error("need --config-dir <dir> (with warmup-filter-query.txt) or --query ...");
    return 1;
  }
  const gmail = deps.gmail ?? makeGmail();
  const probe = await gmail.probe(o.account);
  if (!probe.ok) {
    console.error(`seed mailbox unreadable, refusing to report zeros: ${probe.error}`);
    return 1;
  }
  const counts = { rescued: 0, starred: 0, read: 0 };

  // 1. Rescue warmup mail from spam, then re-apply the label and archive it:
  // the spam->inbox move is the correction signal; the inbox is not where
  // the mail should live afterwards.
  const spam = await gmail.list(o.account, `${q} in:spam`, o.max);
  if (!spam.ok) { console.error(`spam listing failed: ${spam.error}`); return 1; }
  for (const m of spam.messages) {
    if (!o.apply) { counts.rescued++; continue; }
    await gmail.rescueFromSpam(o.account, m.id);
    await gmail.setLabels(o.account, m.id, { add: [o.label], remove: ["INBOX"] });
    counts.rescued++;
  }

  // 2. Star a deterministic rotating sample of recent warmup mail. Hash order
  // keeps reruns from re-starring the same set while new mail arrives.
  const recent = await gmail.list(o.account, `${q} -in:spam newer_than:7d`, 50);
  if (!recent.ok) { console.error(`recent listing failed: ${recent.error}`); return 1; }
  const unstarred = recent.messages
    .filter((m) => !(m.labels ?? []).includes("STARRED"))
    .sort((a, b) => hash32(a.id) - hash32(b.id))
    .slice(0, o.star);
  for (const m of unstarred) {
    if (!o.apply) { counts.starred++; continue; }
    await gmail.star(o.account, m.id);
    counts.starred++;
  }

  // 3. Mark stale warmup mail read. Only the old tail: fresh unread is the
  // operator's "new arrivals" signal and stays untouched.
  const stale = await gmail.list(o.account, `${q} is:unread older_than:${o.readOlderThanDays}d`, 200);
  if (!stale.ok) { console.error(`stale listing failed: ${stale.error}`); return 1; }
  for (const m of stale.messages) {
    if (!o.apply) { counts.read++; continue; }
    await gmail.markRead(o.account, m.id);
    counts.read++;
  }

  console.log(`${o.apply ? "applied" : "dry-run"}: rescued=${counts.rescued} starred=${counts.starred} read=${counts.read}`);
  return 0;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (invoked) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message ?? e); process.exit(1); });
export { main };
