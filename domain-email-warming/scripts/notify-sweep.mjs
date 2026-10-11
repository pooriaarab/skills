#!/usr/bin/env node
// notify-sweep.mjs — trigger on-demand notification mail to warmed mailboxes.
//
// True reply-notifications (GitHub/Reddit/Stack Overflow watches) need one
// provisioned account per mailbox, so they stay an operator decision, not a
// sweep. High-volume discussion lists are deliberately out too: python-list
// join works by email (piloted 2026-10-10, confirm arrived) but mails dozens
// a day, which floods a mailbox instead of warming it; subscribe-sweep stays
// announce-only for the same reason. What this sweep does instead is proven:
// re-submit each mailbox's
// already-activated FormSubmit endpoint, which makes a real third party mail
// the mailbox on demand (piloted live 2026-10-10: activation, link click,
// delivered forward). Requests stay rare (default: a mailbox at most every
// 21 days, --max caps the run) because this spends a small free service's
// goodwill; dry-run is the default.
//
// Credentials come from signup-sweep state: state/creds/formsubmit/<safe>
// holds the mailbox's ajax endpoint URL. Only mailboxes with a stored
// endpoint are eligible — the sweep never activates new forms.
//
//   notify-sweep.mjs [--state-dir <dir>] [--apply] [--max N] [--min-days N]

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);
const STATE_DEFAULT = path.join(os.homedir(), ".local/state/domain-email-warming");

function parseArgs(argv) {
  const o = { apply: false, stateDir: STATE_DEFAULT, max: 25, minDays: 21 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--state-dir") o.stateDir = argv[++i];
    else if (a === "--max") o.max = Number(argv[++i]);
    else if (a === "--min-days") o.minDays = Number(argv[++i]);
  }
  return o;
}

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}
function saveJson(p, v) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2));
}

function endpoints(stateDir) {
  // state/creds/formsubmit/<safe> holds "https://formsubmit.co/ajax/<mailbox>".
  const dir = path.join(stateDir, "creds", "formsubmit");
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir)) {
    const url = fs.readFileSync(path.join(dir, f), "utf8").trim();
    const m = url.match(/^https:\/\/formsubmit\.co\/ajax\/([^/\s@]+@[^/\s]+)$/);
    if (m) out.push({ mailbox: m[1], url });
  }
  return out.sort((a, b) => (a.mailbox < b.mailbox ? -1 : 1));
}

async function curlJson(exec, url, payload, headers) {
  const args = ["-sS", "--max-time", "25", "-X", "POST", url,
    "-H", "Content-Type: application/json", "-H", "Accept: application/json",
    ...headers.flatMap((h) => ["-H", h]), "-d", JSON.stringify(payload)];
  const r = await exec("curl", args);
  return JSON.parse((r.stdout ?? "").toString());
}

async function drip(exec, mailbox, url) {
  // Origin/Referer must be web URLs on the mailbox's own domain or the
  // endpoint refuses ("open this page through a web server").
  const dom = mailbox.split("@")[1];
  const b = await curlJson(exec, url,
    { name: "Warmup", message: "Warm-up program check-in.", _subject: "warmup check-in" },
    [`Origin: https://${dom}`, `Referer: https://${dom}/contact`]);
  if (String(b.success).toLowerCase() === "true") return { ok: true, detail: "forwarded" };
  return { ok: false, detail: String(b.message ?? b.error ?? "unknown").slice(0, 160) };
}

async function main(argv, deps = {}) {
  const o = parseArgs(argv);
  const exec = deps.exec ?? ((bin, args) => execFile(bin, args, { timeout: 60_000, maxBuffer: 4 * 1024 * 1024 }));
  const ownState = loadJson(path.join(o.stateDir, "notify.json"), { lastDrip: {} });
  const cutoff = Date.now() - o.minDays * 86400_000;
  const due = endpoints(o.stateDir).filter((e) => (ownState.lastDrip[e.mailbox] ?? 0) < cutoff).slice(0, o.max);
  if (!o.apply) {
    for (const e of due) console.log(`would drip: ${e.mailbox}`);
    console.log(`dry-run, ${due.length} due`);
    return 0;
  }
  let ok = 0;
  for (const e of due) {
    try {
      const r = await drip(exec, e.mailbox, e.url);
      console.log(`${r.ok ? "dripped" : "failed"}: ${e.mailbox} (${r.detail})`);
      if (r.ok) { ok++; ownState.lastDrip[e.mailbox] = Date.now(); }
    } catch (err) {
      console.log(`failed: ${e.mailbox} (${String(err.message ?? err).slice(0, 120)})`);
    }
  }
  saveJson(path.join(o.stateDir, "notify.json"), ownState);
  console.log(`dripped=${ok}/${due.length}`);
  return 0;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (invoked) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message ?? e); process.exit(1); });
export { main, drip, endpoints };
