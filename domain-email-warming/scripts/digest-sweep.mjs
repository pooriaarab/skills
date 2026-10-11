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

const execFile = promisify(execFileCb);
const STATE_DEFAULT = path.join(os.homedir(), ".local/state/domain-email-warming/digests.json");

// Flow ops: fill {match, value} | click {match} | uncheck-all | expect {match}.
// {match} is a case-insensitive substring over the snapshot's text/label.
// {mailbox} in a value is replaced with the target address.
const PUBLICATIONS = [
  {
    key: "lenny",
    label: "Lenny's Newsletter (Substack)",
    subscribeUrl: "https://www.lennysnewsletter.com/subscribe",
    sender: "lennysnewsletter.com",
    pilot: false,
    evidence: null,
    flow: [
      { op: "fill", match: "email", value: "{mailbox}" },
      { op: "click", match: "subscribe" },
      // Plan picker: the free tier's Select sits beside paid Selects; the
      // free radio's accessible name contains "NoneFree".
      { op: "click-near", match: "NoneFree", click: "Select" },
      { op: "uncheck-all" },
      { op: "click", match: "Continue" },
      { op: "click", match: "Skip" },
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
  const out = [];
  for (const f of fs.readdirSync(configDir)) {
    if (!f.endsWith(".warmup.json")) continue;
    const cfg = JSON.parse(fs.readFileSync(path.join(configDir, f), "utf8"));
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
  const raw = await sh(exec, BROWSER, ["snapshot", "-i", "-c", "--json"]);
  const i = raw.indexOf("{");
  if (i < 0) throw new Error(`unparseable snapshot: ${raw.slice(0, 120)}`);
  return JSON.parse(raw.slice(i));
}

function flatten(tree, out = []) {
  // agent-browser --json nests node lists under nodes/elements/children.
  const nodes = Array.isArray(tree) ? tree : [tree];
  for (const n of nodes) {
    if (!n || typeof n !== "object") continue;
    out.push(n);
    for (const k of ["children", "nodes", "elements"]) {
      if (Array.isArray(n[k])) flatten(n[k], out);
    }
  }
  return out;
}

function nodeText(n) {
  return [n.name, n.value, n.placeholder, n.title].filter(Boolean).join(" ").toLowerCase();
}

function findRef(nodes, match) {
  const m = match.toLowerCase();
  return nodes.find((n) => n.ref && nodeText(n).includes(m))?.ref ?? null;
}

async function runFlow(exec, pub, mailbox, log) {
  await sh(exec, BROWSER, ["open", pub.subscribeUrl]);
  await sh(exec, BROWSER, ["wait", "3000"]);
  for (const step of pub.flow) {
    const tree = await snapshot(exec);
    const flat = flatten(tree.nodes ?? tree.elements ?? tree);
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
        const ai = flat.findIndex((n) => nodeText(n).includes(step.match.toLowerCase()));
        const after = flat.slice(Math.max(0, ai)).find((n) => n.ref && nodeText(n).includes(step.click.toLowerCase()));
        if (after) ref = after.ref;
      }
      if (!ref) throw new Error(`click target not found: ${step.match}`);
      await sh(exec, BROWSER, ["click", ref]);
      await sh(exec, BROWSER, ["wait", "2500"]);
      log(`clicked ${step.match}`);
    } else if (step.op === "uncheck-all") {
      for (const n of flat.filter((x) => x.ref && /checkbox/i.test(x.role ?? "") && x.checked !== false)) {
        await sh(exec, BROWSER, ["uncheck", n.ref]);
      }
      log("unchecked upsells");
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
export { main, runFlow, findRef, flatten, hashPick, PUBLICATIONS };
