#!/usr/bin/env node
// contact-sweep - submit vendor contact/sales forms from warmup mailboxes.
//
// Vendor email outreach (vendor-outreach.mjs) covers support@/sales@ inboxes;
// some vendors only take questions through web forms, and a form submission
// earns a different thread shape (auto-reply plus SDR follow-up). One target
// at a time, one submission per (domain, target) ever, six domains per target
// at most: the same anti-pattern caps as email outreach.
//
// Each target carries its own field map because every form differs. A target
// ships UNPILOTED: --apply refuses it until --pilot <key> completes one
// attended submit and flips pilot:true in state. Probe before you scale.
//
//   contact-sweep.mjs --config-dir <dir> [--apply] [--pilot <key>] [--max N]
//                     [--state <path>] [--browser <bin>]
//
// Dry run unless --apply. Needs agent-browser. Brand-new mailboxes only make
// sense on piloted targets; see TARGETS below for evidence notes.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const execFile = promisify(execFileCb);
const STATE_DEFAULT = join(homedir(), ".local/state/domain-email-warming/contact-sweep.json");
const TARGET_DOMAIN_CAP = 6;
const SESSION = "warmup-contact-sweep";

// Field steps resolve by semantic locator, fresh per step: refs die on every
// DOM change, so no step may reuse another step's ref.
const TARGETS = [
  {
    key: "calendly-contact",
    url: "https://calendly.com/contact",
    pilot: true, // 2026-10-09: submitted hello@dishdirectory.com, landed on /contact/thanks
    fields: [
      { find: "label", text: "First Name", do: "fill", value: "{first}" },
      { find: "label", text: "Last Name", do: "fill", value: "{last}" },
      { find: "label", text: "Work Email", do: "fill", value: "{email}" },
      { find: "label", text: "How do you plan on using Calendly?", do: "option", value: "{teamsize}" },
      { find: "label", text: "How can we help?", do: "fill", value: "{message}" },
    ],
    submit: { find: "text", text: "Submit", do: "click" },
    success: { url: "thanks" },
    message: "Hi. I run an appointment product and I am comparing scheduling tools. What does API access cost? Is there a free tier I can prototype with?",
    teamsize: ["With a small team (2-10 users)", "Not sure yet", "Hosting meetings myself"],
  },
  {
    key: "bugsnag-contact",
    url: "https://www.bugsnag.com/contact-us",
    pilot: false,
    fields: [
      { find: "label", text: "Email", do: "fill", value: "{email}" },
      { find: "label", text: "First Name", do: "fill", value: "{first}" },
      { find: "label", text: "Last Name", do: "fill", value: "{last}" },
      { find: "label", text: "Company", do: "fill", value: "{company}" },
      { find: "label", text: "Comments", do: "fill", value: "{message}" },
    ],
    submit: { find: "text", text: "Submit", do: "click" },
    success: { url: "thank" },
    message: "Hi. I add error tracking to services at our company. How do you meter events on entry plans? When we spike, do you throttle or bill?",
  },
  {
    key: "mixpanel-sales",
    url: "https://mixpanel.com/contact-us/sales/",
    pilot: false,
    fields: [
      { find: "label", text: "First Name", do: "fill", value: "{first}" },
      { find: "label", text: "Last Name", do: "fill", value: "{last}" },
      { find: "label", text: "Work Email", do: "fill", value: "{email}" },
      { find: "label", text: "Company Size", do: "option", value: "{teamsize}" },
      { find: "label", text: "Notes", do: "fill", value: "{message}" },
    ],
    submit: { find: "text", text: "Submit", do: "click" },
    success: { url: "thank" },
    message: "Hi. I add analytics to an early app. What do you cover free in events and seats? How does pricing step after that?",
    teamsize: ["1-10", "11-50"],
  },
  {
    key: "crowdin-contacts",
    url: "https://crowdin.com/contacts",
    pilot: false,
    fields: [
      { find: "label", text: "Name", do: "fill", value: "{first} {last}" },
      { find: "label", text: "Email", do: "fill", value: "{email}" },
      { find: "label", text: "Message", do: "fill", value: "{message}" },
    ],
    submit: { find: "text", text: "Send", do: "click" },
    success: { url: "thank" },
    message: "Hi. We ship in several languages and I am comparing localization tools. How do you price seats and words? Is there a trial with our own files?",
  },
  {
    key: "linear-sales",
    url: "https://linear.app/contact/sales",
    pilot: false,
    fields: [
      { find: "label", text: "Full name", do: "fill", value: "{first} {last}" },
      { find: "label", text: "Work email", do: "fill", value: "{email}" },
      { find: "label", text: "Company size", do: "option", value: "{teamsize}" },
      { find: "label", text: "requirements", do: "fill", value: "{message}" },
    ],
    submit: { find: "text", text: "Submit", do: "click" },
    success: { url: "thank" },
    message: "Hi. Our team plans work across time zones. Which plans include SSO and guest seats? Do you price per seat or per workspace?",
    teamsize: ["1-10", "11-50"],
  },
];

const LASTS = ["Team", "Admin", "Ops"];

function parseArgs(argv) {
  const o = { apply: false, pilot: null, state: STATE_DEFAULT, max: 1, browser: "agent-browser" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--config-dir") o.dir = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--max") o.max = parseInt(argv[++i], 10);
    else if (a === "--pilot") o.pilot = argv[++i];
    else if (a === "--browser") o.browser = argv[++i];
  }
  return o;
}

function hashStr(s) {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

async function br(browser, args) {
  const { stdout } = await execFile(browser, ["--session", SESSION, ...args],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
  return stdout;
}

// One find+act step. agent-browser `find` resolves the locator itself, so no
// stored ref crosses a DOM change.
async function step(browser, s, vars) {
  const val = (s.value ?? "").replaceAll("{first}", vars.first).replaceAll("{last}", vars.last)
    .replaceAll("{email}", vars.email).replaceAll("{company}", vars.company).replaceAll("{message}", vars.message);
  if (s.do === "fill") {
    return br(browser, ["find", s.find, s.text, "fill", val]);
  }
  if (s.do === "click") {
    return br(browser, ["find", s.find, s.text, "click"]);
  }
  if (s.do === "option") {
    // Custom dropdowns have no <select>: open it, then click the option text.
    await br(browser, ["find", s.find, s.text, "click"]);
    await new Promise((r) => setTimeout(r, 1500));
    return br(browser, ["find", "text", val, "click"]);
  }
  throw new Error(`unknown step ${s.do}`);
}

async function targetEligible(state, t, domain, allDomains) {
  const used = Object.keys(state.sent).filter((k) => k.split("|")[1] === t.key).map((k) => k.split("|")[0]);
  if (used.length >= TARGET_DOMAIN_CAP && !used.includes(domain)) return false;
  const ranks = allDomains.map((d) => [hashStr(`${t.key}|${d}`), d]).sort((a, b) => a[0] - b[0]);
  return ranks.slice(0, TARGET_DOMAIN_CAP).some(([, d]) => d === domain);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir) {
    console.error("usage: contact-sweep.mjs --config-dir <dir> [--apply] [--pilot <key>]");
    return 2;
  }
  const state = existsSync(opts.state) ? JSON.parse(await readFile(opts.state, "utf8")) : { sent: {}, pilots: {} };
  state.pilots ??= {};
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(opts.dir)).filter((f) => f.endsWith(".warmup.json")).sort();
  const cfgs = [];
  for (const f of files) {
    const c = JSON.parse(await readFile(join(opts.dir, f), "utf8"));
    if (c.identities?.[0]?.address) cfgs.push(c);
  }
  const allDomains = cfgs.map((c) => c.identities[0].address.split("@")[1]).sort();

  if (opts.pilot) {
    const t = TARGETS.find((x) => x.key === opts.pilot);
    if (!t) {
      console.error(`unknown target ${opts.pilot}`);
      return 2;
    }
    // Pilot always fires from the first eligible domain's first box; it is
    // attended by definition and exists to prove the field map, not for volume.
    const cfg = cfgs.find((c) => c.identities[0].address.split("@")[1] &&
      !Object.keys(state.sent).some((k) => k.endsWith(`|${t.key}`) && k.startsWith(c.identities[0].address.split("@")[1])));
    if (!cfg) {
      console.error("no domain left for this target");
      return 1;
    }
    console.log(`pilot ${t.key} from ${cfg.identities[0].address} (live submit)`);
    const ok = await submitOne(opts, state, t, cfg);
    if (ok) {
      state.pilots[t.key] = { at: new Date().toISOString(), evidence: ok };
      await mkdir(dirname(opts.state), { recursive: true });
      await writeFile(opts.state, JSON.stringify(state, null, 1));
      console.log(`pilot ${t.key}: PASS`);
    } else {
      console.log(`pilot ${t.key}: FAIL (no state written)`);
      return 1;
    }
    return 0;
  }

  let done = 0;
  for (const cfg of cfgs) {
    if (done >= opts.max) break;
    const domain = cfg.identities[0].address.split("@")[1];
    for (const t of TARGETS) {
      if (done >= opts.max) break;
      if (!t.pilot && !state.pilots[t.key]) continue;
      if (state.sent[`${domain}|${t.key}`]) continue;
      if (!await targetEligible(state, t, domain, allDomains)) continue;
      if (!opts.apply) {
        console.log(`would submit ${domain} -> ${t.key} (${t.url})`);
        done++;
        continue;
      }
      const ok = await submitOne(opts, state, t, cfg);
      if (ok) done++;
    }
  }
  console.log(`${done} ${opts.apply ? "submitted" : "planned"} this run`);
  return 0;
}

async function submitOne(opts, state, t, cfg) {
  const domain = cfg.identities[0].address.split("@")[1];
  const box = cfg.identities[hashStr(`${domain}|${t.key}`) % cfg.identities.length];
  const first = box.address.split("@")[0].replace(/[^a-z0-9]+/gi, " ").trim().split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "Hello";
  const vars = {
    first,
    last: LASTS[hashStr(`${domain}|${t.key}|l`) % LASTS.length],
    email: box.address,
    company: cfg.orgName ?? domain,
    message: `${t.message} Thanks, ${first} (${domain})`,
  };
  if (t.teamsize) {
    for (const f of t.fields) {
      if (f.value === "{teamsize}") f.value = t.teamsize[hashStr(`${domain}|${t.key}|z`) % t.teamsize.length];
    }
  }
  console.log(`open ${t.url}`);
  await br(opts.browser, ["open", t.url]);
  await br(opts.browser, ["wait", "--load", "networkidle"]);
  for (const f of t.fields) {
    await step(opts.browser, { ...f, value: f.value }, vars);
  }
  await step(opts.browser, t.submit, vars);
  await br(opts.browser, ["wait", "--load", "networkidle"]);
  await new Promise((r) => setTimeout(r, 3000));
  const url = (await br(opts.browser, ["get", "url"])).trim().split("\n").pop();
  if (t.success.url && url.includes(t.success.url)) {
    const key = `${domain}|${t.key}`;
    state.sent[key] = { at: new Date().toISOString(), from: box.address, landed: url };
    await mkdir(dirname(opts.state), { recursive: true });
    await writeFile(opts.state, JSON.stringify(state, null, 1));
    console.log(`submitted ${box.address} -> ${t.key} (${url})`);
    return url;
  }
  console.log(`submit unverified for ${box.address} -> ${t.key} (landed ${url})`);
  return null;
}

process.exitCode = await main();
