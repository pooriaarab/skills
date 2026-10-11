#!/usr/bin/env node
// digest-sweep.mjs — subscribe warmed mailboxes to external newsletters via a
// real browser, one publication per mailbox per run.
//
// WHY BROWSER: every curl-able digest path is gated. Blogtrottr demands a
// Turnstile challenge, the Substack direct API answers 200 and never mails,
// Talkwalker and beehiiv are JS apps / 403 to curl (all probed 2026-10-10).
// A real Chromium fills the same forms a human would. Submits stay rare
// (one per mailbox per run, --max caps the run) and every publication below
// ships UNPILOTED: --apply refuses it until --pilot <key> completes one
// attended subscribe and flips pilot:true in state. Probe before you scale.
//
// Double opt-in belongs to confirm-subscriptions.mjs (already scheduled): it
// visits confirmation links in seed mail. This sweep only submits the form,
// then marks confirmed when the publication's own mail arrives.
//
//   digest-sweep.mjs --config-dir <dir> [--apply] [--pilot <key> --mailbox <addr>] [--max N]
//
// agent-browser needs a connected browser: with managed auto-launch broken,
// launch Chrome with --remote-debugging-port on a FRESH profile and
// `agent-browser connect` it first. Never drive the operator's daily Chrome:
// a logged-in session would subscribe the wrong identity.

import { execFile as execFileCb } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { warmupFiles } from "./lib/configs.mjs";

const execFile = promisify(execFileCb);
const STATE_DEFAULT = path.join(os.homedir(), ".local/state/domain-email-warming/digests.json");

// Flow ops: fill {match, value} | click {match} | click-near {match, click} |
// expect {match}. {match} is a case-insensitive substring over the
// snapshot's text/label. {mailbox} in a value is replaced with the target.
const PUBLICATIONS = [
  {
    key: "lenny",
    label: "Lenny's Newsletter (Substack)",
    subscribeUrl: "https://www.lennysnewsletter.com/subscribe",
    sender: "lennysnewsletter.com",
    pilot: false,
    evidence: "2026-10-11: attended funnel passed (fill, subscribe, free Select, Skip, Skip, Maybe later, landing shows title; no captcha). Scripted --pilot re-proves after the snapshot fix.",
    flow: [
      { op: "fill", match: "email", value: "{mailbox}" },
      { op: "click", match: "subscribe" },
      // Plan picker: the free tier's Select sits beside paid Selects.
      // Anchor on "Free" (the "None" prefix seen once is a plan-code leak
      // that may vanish; nothing else on the page says free).
      { op: "click-near", match: "Free", click: "Select" },
      { op: "click", match: "Skip" }, // recommendations: skip beats unchecking
      { op: "click", match: "Skip" }, // app interstitial
      { op: "click", match: "Maybe later" },
      { op: "expect", match: "Lenny's Newsletter" },
    ],
  },
];

const BROWSER = process.env.DIGEST_SWEEP_BROWSER || "agent-browser";
const SESSION = "warmup-digest-sweep";

function parseArgs(argv) {
  const o = { apply: false, pilot: null, mailbox: null, state: STATE_DEFAULT, max: 5, configDir: null, account: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--pilot") o.pilot = argv[++i];
    else if (a === "--mailbox") o.mailbox = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--max") o.max = Number(argv[++i]);
    else if (a === "--config-dir") o.configDir = argv[++i];
    else if (a === "--account") o.account = argv[++i];
  }
  return o;
}

function loadState(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { subs: {}, pilots: {} };
  }
}
function saveState(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(s, null, 2));
}

function mailboxes(configDir) {
  // Recursive via warmupFiles: apex configs beside domains/ count too.
  const out = [];
  for (const fp of warmupFiles(configDir)) {
    const cfg = JSON.parse(fs.readFileSync(fp, "utf8"));
    for (const i of cfg.identities ?? []) if (i.address) out.push(i.address);
  }
  return [...new Set(out)].sort();
}

function hashPick(mailbox, pubs) {
  // Stable rotation: each mailbox always draws the same publication first,
  // so reruns converge instead of spraying new subscriptions everywhere.
  let h = 0;
  for (const c of mailbox) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return pubs[h % pubs.length];
}

async function sh(exec, bin, args) {
  const r = await exec(bin, args);
  return (r.stdout ?? "").toString();
}

async function snapshot(exec) {
  // Real CLI shape: {data:{snapshot:text, refs:{e7:{name,role}}}}.
  // Order follows the text (tree order) so click-near anchors correctly;
  // refs missing from the text sort after, numerically.
  const raw = await sh(exec, BROWSER, ["snapshot", "-i", "-c", "--json"]);
  const i = raw.indexOf("{");
  if (i < 0) throw new Error(`unparseable snapshot: ${raw.slice(0, 120)}`);
  const d = JSON.parse(raw.slice(i));
  const refs = d?.data?.refs ?? null;
  if (!refs || typeof refs !== "object") throw new Error(`snapshot has no refs map: ${raw.slice(0, 120)}`);
  // Markers carry attributes ([checked=false, ref=e7]); match any of them.
  const order = [...String(d?.data?.snapshot ?? "").matchAll(/\[([^\]]*?)ref=(e\d+)\]/g)].map((m) => m[2]);
  const rank = new Map(order.map((k, n) => [k, n]));
  const num = (k) => Number(k.slice(1));
  return Object.entries(refs)
    .sort(([a], [b]) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9) || num(a) - num(b))
    .map(([k, v]) => ({ ref: `@${k}`, name: v?.name ?? "", role: v?.role ?? "" }));
}

function nodeText(n) {
  return [n.name, n.value, n.placeholder, n.title].filter(Boolean).join(" ").toLowerCase();
}

function findRef(nodes, match) {
  const m = match.toLowerCase();
  return nodes.find((n) => n.ref && nodeText(n).includes(m))?.ref ?? null;
}

function satisfied(flat, step) {
  // Pre-check for the retry loop: is this step's target on the page yet?
  if (step.op === "click-near") {
    const ai = flat.findIndex((n) => nodeText(n).includes(step.match.toLowerCase()));
    return ai >= 0 && flat.slice(ai).some((n) => n.ref && nodeText(n).includes(step.click.toLowerCase()));
  }
  if (step.op === "fill" || step.op === "click" || step.op === "expect") {
    return findRef(flat, step.match) !== null;
  }
  return true;
}

async function runFlow(exec, pub, mailbox, log) {
  await sh(exec, BROWSER, ["open", pub.subscribeUrl]);
  await sh(exec, BROWSER, ["wait", "3000"]);
  for (const step of pub.flow) {
    // Slow pages render targets after the click wait; re-snapshot a few
    // times before calling a target missing (the picker once needed two).
    let flat = await snapshot(exec);
    for (let t = 0; t < 4 && !satisfied(flat, step); t++) {
      await sh(exec, BROWSER, ["wait", "3000"]);
      flat = await snapshot(exec);
    }
    if (step.op === "fill") {
      const ref = findRef(flat, step.match);
      if (!ref) throw new Error(`fill target not found: ${step.match}`);
      await sh(exec, BROWSER, ["fill", ref, step.value.replace("{mailbox}", mailbox)]);
      log(`filled ${step.match}`);
    } else if (step.op === "click" || step.op === "click-near") {
      // click-near anchors on nearby text when several buttons share a label
      // (the free-tier Select among paid Selects): prefer a ref whose own
      // text matches, else the first match after the anchor in tree order.
      let ref = findRef(flat, step.op === "click-near" ? step.click : step.match);
      if (step.op === "click-near") {
        // Never degrade to a plain first-match click: on the plan picker
        // that silently buys the paid tier (observed live 2026-10-11).
        const ai = flat.findIndex((n) => nodeText(n).includes(step.match.toLowerCase()));
        if (ai < 0) throw new Error(`click-near anchor not found: ${step.match}`);
        const after = flat.slice(ai).find((n) => n.ref && nodeText(n).includes(step.click.toLowerCase()));
        if (!after) throw new Error(`click-near button not found after anchor: ${step.click}`);
        ref = after.ref;
      }
      if (!ref) throw new Error(`click target not found: ${step.match}`);
      await sh(exec, BROWSER, ["click", ref]);
      await sh(exec, BROWSER, ["wait", "2500"]);
      log(`clicked ${step.match}`);
    } else if (step.op === "expect") {
      if (!findRef(flat, step.match)) throw new Error(`expected text missing: ${step.match}`);
      log(`saw ${step.match}`);
    } else {
      throw new Error(`unknown flow op: ${step.op}`);
    }
  }
}

async function gog(exec, account, args) {
  const out = await sh(exec, "gog", ["-a", account, "gmail", ...args]);
  const i = out.indexOf("{");
  if (i < 0) throw new Error(`gog output not json: ${out.slice(0, 120)}`);
  return JSON.parse(out.slice(i));
}

async function welcomeSeen(exec, account, mailbox, sender) {
  // Postal proof, same idea as subscribe-sweep: the publication's own mail
  // addressed to this mailbox means the subscription is live.
  const d = await gog(exec, account, ["messages", "search", "--max", "3", "-j", "--",
    `in:anywhere to:${mailbox} from:${sender}`]);
  return (d.messages ?? []).length > 0;
}

async function main(argv, deps = {}) {
  const o = parseArgs(argv);
  const exec = deps.exec ?? ((bin, args) => execFile(bin, args, {
    env: { ...process.env, AGENT_BROWSER_SESSION: SESSION, AGENT_BROWSER_AUTO_CONNECT: "0" },
    timeout: 120_000, maxBuffer: 8 * 1024 * 1024,
  }));
  if (!o.configDir) {
    console.error("usage: digest-sweep.mjs --config-dir <dir> [--apply] [--pilot <key> --mailbox <addr>]");
    return 1;
  }
  const state = loadState(o.state);
  for (const [k, v] of Object.entries(state.pilots ?? {})) {
    const p = PUBLICATIONS.find((x) => x.key === k);
    if (p && v === true) { p.pilot = true; p.evidence = p.evidence ?? "pilot passed (see state)"; }
  }

  if (o.pilot) {
    const pub = PUBLICATIONS.find((p) => p.key === o.pilot);
    if (!pub) { console.error(`unknown publication: ${o.pilot}`); return 1; }
    if (!o.mailbox) { console.error("--pilot needs --mailbox <addr>"); return 1; }
    const lines = [];
    await runFlow(exec, pub, o.mailbox, (m) => { lines.push(m); console.log(m); });
    state.pilots = state.pilots ?? {};
    state.pilots[pub.key] = true;
    pub.pilot = true;
    pub.evidence = `${new Date().toISOString().slice(0, 10)}: attended funnel completed for ${o.mailbox}; confirm mail watched separately`;
    saveState(o.state, state);
    console.log(`pilot passed for ${pub.key}; confirm mail still decides (watch seed inbox)`);
    return 0;
  }

  if (!o.account) { console.error("--apply runs need --account <seed gmail>"); return 1; }
  const boxes = mailboxes(o.configDir);
  const live = PUBLICATIONS.filter((p) => p.pilot);
  if (!live.length) {
    console.log("no piloted publications; nothing to do (run --pilot first)");
    return 0;
  }
  let acted = 0;
  for (const mb of boxes) {
    if (acted >= o.max) break;
    const pub = hashPick(mb, live);
    const key = `${mb}|${pub.key}`;
    const sub = state.subs[key] ?? { status: "new" };
    if (sub.status === "confirmed") continue;
    if (sub.status === "requested") {
      if (await welcomeSeen(exec, o.account, mb, pub.sender)) {
        sub.status = "confirmed";
        state.subs[key] = sub;
        console.log(`confirmed: ${key}`);
      }
      continue;
    }
    if (!o.apply) {
      console.log(`would subscribe: ${key}`);
      acted++;
      continue;
    }
    try {
      await runFlow(exec, pub, mb, (m) => console.log(`  ${key}: ${m}`));
      state.subs[key] = { status: "requested", at: Date.now() };
      acted++;
    } catch (e) {
      state.subs[key] = { status: "failed", detail: String(e.message ?? e).slice(0, 200) };
      console.log(`failed: ${key}: ${e.message}`);
    }
  }
  saveState(o.state, state);
  console.log(o.apply ? `requested=${acted}` : `dry-run, ${acted} would subscribe`);
  return 0;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;
if (invoked) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message ?? e); process.exit(1); });
export { main, runFlow, findRef, hashPick, PUBLICATIONS };
