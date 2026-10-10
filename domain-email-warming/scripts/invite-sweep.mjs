#!/usr/bin/env node
// invite-sweep - trade calendar invites between mailboxes on the same domain.
//
// An .ics invite is a message shape the program otherwise never sends: a
// multipart mail with a text/calendar part that renders accept buttons in the
// client. Same-domain only: with cross-domain peer mail retired, invites stay
// inside one domain (organizer and attendee share it), two per domain per
// week at most. Each send is unique — topic, slot and pair rotate by hash —
// and state dedupes (domain, week, organizer, attendee) forever.
//
//   invite-sweep.mjs --config-dir <dir> [--apply] [--max N] [--state <path>]
//
// Dry run unless --apply. Cloudflare send env comes from process env.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { cfEnv, sendEmail } from "./lib/cloudflare.mjs";

const STATE_DEFAULT = join(homedir(), ".local/state/domain-email-warming/invite-sweep.json");
const MAX_PER_RUN = 4;
const PER_DOMAIN_WEEK = 2;

const TOPICS = [
  { topic: "Quick intro call", blurb: "A short call to put names to faces." },
  { topic: "15-min sync", blurb: "A short sync on open items." },
  { topic: "Pricing review", blurb: "A look at the plan tiers before we decide." },
  { topic: "Demo walkthrough", blurb: "A walk through the product, questions welcome." },
  { topic: "Kickoff chat", blurb: "A first chat to agree next steps." },
  { topic: "Follow-up", blurb: "A follow-up on last week's thread." },
  { topic: "Planning call", blurb: "A call to plan the next two weeks." },
  { topic: "Check-in", blurb: "A brief check-in, nothing formal." },
];

function parseArgs(argv) {
  const o = { apply: false, state: STATE_DEFAULT, max: MAX_PER_RUN };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--config-dir") o.dir = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--max") o.max = parseInt(argv[++i], 10);
  }
  return o;
}

function hashStr(s) {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  return `${t.getUTCFullYear()}-W${String(1 + Math.round((t - first) / 6048e5)).padStart(2, "0")}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function icsDate(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildIcs({ from, fromName, to, topic, blurb, start }) {
  const uid = `${hashStr(`${from}|${to}|${start.toISOString()}`).toString(36)}@${from.split("@")[1]}`;
  const end = new Date(start.getTime() + 30 * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//warmup//invite//EN",
    "VERSION:2.0",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(topic)}`,
    `DESCRIPTION:${esc(blurb)}`,
    `ORGANIZER;CN=${esc(fromName)}:mailto:${from}`,
    `ATTENDEE;CN=${esc(to.split("@")[0])};RSVP=TRUE:mailto:${to}`,
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

// Next Tuesday or Wednesday at 17:00 UTC (mid-morning Pacific), jittered by
// pair so a domain's invites do not stack on one slot.
function slotFor(from, to, week) {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 7, 17, 0, 0));
  const dow = base.getUTCDay();
  const shift = dow <= 2 ? 2 - dow : 9 - dow;
  base.setUTCDate(base.getUTCDate() + shift);
  base.setUTCMinutes(hashStr(`${from}|${to}|${week}`) % 120);
  return base;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir) {
    console.error("usage: invite-sweep.mjs --config-dir <dir> [--apply]");
    return 2;
  }
  const state = existsSync(opts.state) ? JSON.parse(await readFile(opts.state, "utf8")) : { sent: {} };
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(opts.dir)).filter((f) => f.endsWith(".warmup.json")).sort();
  const week = isoWeek();
  const weekCount = {};
  for (const k of Object.keys(state.sent)) {
    const [dom, w] = k.split("|");
    if (w === week) weekCount[dom] = (weekCount[dom] ?? 0) + 1;
  }

  let sent = 0;
  for (const f of files) {
    if (sent >= opts.max) break;
    const cfg = JSON.parse(await readFile(join(opts.dir, f), "utf8"));
    const ids = (cfg.identities ?? []).filter((i) => i?.address);
    if (ids.length < 2) continue;
    const domain = cfg.sendingDomain ?? ids[0].address.split("@")[1];
    if ((weekCount[domain] ?? 0) >= PER_DOMAIN_WEEK) continue;
    let env;
    try {
      env = cfEnv(cfg);
    } catch (e) {
      console.log(`skip ${domain}: ${e.message.split("\n")[0]}`);
      continue;
    }
    // Rotate pairs by week so the same two boxes do not invite each other
    // every week; offset by sent-count so a second weekly invite differs.
    const n = ids.length;
    const round = weekCount[domain] ?? 0;
    const h = hashStr(`${domain}|${week}|${round}`);
    const a = ids[h % n];
    let b = ids[((h >>> 3) % n)];
    if (b.address === a.address) b = ids[(((h >>> 3) + 1) % n)];
    const key = `${domain}|${week}|${a.address}|${b.address}`;
    if (state.sent[key]) continue;
    const t = TOPICS[h % TOPICS.length];
    const start = slotFor(a.address, b.address, week);
    const ics = buildIcs({ from: a.address, fromName: a.name ?? "Hello", to: b.address, topic: t.topic, blurb: t.blurb, start });
    const when = start.toISOString().slice(0, 16).replace("T", " ") + " UTC";
    const text = `Hi ${b.name ?? "there"}. ${t.blurb} I booked ${when} for 30 minutes. The invite is attached. Let me know if another time suits better.\n\n${a.name ?? "Hello"}\n${domain}`;
    if (!opts.apply) {
      console.log(`would invite ${a.address} -> ${b.address}  "${t.topic}" ${when}`);
      sent++;
      continue;
    }
    const res = await sendEmail(env, {
      from: a.address,
      fromName: a.name ?? "",
      to: b.address,
      subject: `Invite: ${t.topic}`,
      text,
      replyTo: a.address,
      attachments: [{ disposition: "attachment", filename: "invite.ics", type: "text/calendar; method=REQUEST", content: Buffer.from(ics).toString("base64") }],
    });
    if (res.ok) {
      state.sent[key] = { at: new Date().toISOString(), from: a.address, to: b.address, topic: t.topic, msgId: res.messageId };
      weekCount[domain] = (weekCount[domain] ?? 0) + 1;
      console.log(`invited ${a.address} -> ${b.address}  "${t.topic}"`);
    } else {
      console.error(`FAILED ${a.address} -> ${b.address}: ${res.error}`);
    }
    sent++;
  }
  if (opts.apply) {
    await mkdir(dirname(opts.state), { recursive: true });
    await writeFile(opts.state, JSON.stringify(state, null, 1));
  }
  console.log(`${sent} ${opts.apply ? "sent" : "planned"} this run (week ${week})`);
  return 0;
}

process.exitCode = await main();
