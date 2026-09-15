#!/usr/bin/env node
// Reply from the warmed domain to mail a real person sent us.
//
// The engagement loop in `warmctl engage` replies from the seed side, which we
// control. This is the other direction: a genuine third party replied, and
// answering them turns a one-way send into a real thread. That is the strongest
// signal a warm-up can produce, and it is the one no automation can manufacture
// — it depends on someone actually writing back.
//
//   reply-inbound.mjs --config <c.json> --db <d1> [--attach <file>] [--apply]
//
// Dry run unless --apply.

import { execFile as execFileCb } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);
const args = process.argv.slice(2);
const flag = (n, d = null) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const APPLY = args.includes("--apply");
const CONFIG = flag("config");
const DB = flag("db");
const ATTACH = flag("attach");
const HOURS = Number(flag("hours", "48"));
const LIMIT = Number(flag("limit", "25"));

if (!CONFIG || !DB) {
  console.error("usage: reply-inbound.mjs --config <c.json> --db <d1-name> [--attach <file>] [--apply]");
  process.exit(2);
}

const MIME = { ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".txt": "text/plain", ".csv": "text/csv" };

const REPLIES = [
  "Thanks for getting back to me. Nothing further needed at your end for now.",
  "Appreciated — I have noted that. I will send the paperwork across shortly.",
  "That works. I have attached the summary so you have it on file.",
  "Good to know, thank you. I will follow up once the dates are confirmed.",
  "Thanks for confirming. I have attached the document for your records.",
];

/**
 * Reading the inbound store and sending mail are separate permissions, and a
 * narrowly-scoped sending token has no D1 access. WARM_DB_TOKEN lets the
 * wrangler child use a different credential instead of forcing one broad token
 * to do both jobs.
 */
async function wrangler(argv) {
  const env = process.env.WARM_DB_TOKEN
    ? { ...process.env, CLOUDFLARE_API_TOKEN: process.env.WARM_DB_TOKEN }
    : process.env;
  const { stdout } = await execFile("bunx", ["wrangler", ...argv], {
    maxBuffer: 32 * 1024 * 1024, timeout: 180_000, env,
  });
  return stdout;
}

function parseRows(out) {
  const i = out.indexOf("[");
  if (i === -1) return [];
  try { return JSON.parse(out.slice(i))?.[0]?.results ?? []; } catch { return []; }
}

/** CR/LF in a header value from mail we did not write would inject headers. */
const sanitize = (v) => String(v ?? "").replace(/[\r\n\0]+/g, " ").trim();
const wrapId = (id) => (id.startsWith("<") ? id : `<${id}>`);

/** In-Reply-To is the parent; References is the parent's chain plus the parent. */
function threadHeaders(row) {
  const parent = sanitize(row.message_id);
  if (!parent) return null;
  let prior = [];
  try {
    const p = JSON.parse(row.references_json ?? "[]");
    if (Array.isArray(p)) prior = p.filter((x) => typeof x === "string" && x);
  } catch { prior = []; }
  const refs = [...new Set([...prior.map(sanitize), parent])].map(wrapId);
  // Cloudflare rejects a custom header value over 2048 bytes, and a failed
  // reply is worse than a trimmed history the reader already has.
  while (refs.length > 1 && refs.join(" ").length > 2048) refs.shift();
  return { "In-Reply-To": wrapId(parent), References: refs.join(" ") };
}

const cfg = JSON.parse(await readFile(CONFIG, "utf8"));
const { cfEnv, sendEmail } = await import(new URL("./lib/cloudflare.mjs", import.meta.url));
const env = cfEnv(cfg);

let attachment = null;
if (ATTACH) {
  const buf = await readFile(ATTACH);
  const type = MIME[extname(ATTACH).toLowerCase()];
  if (!type) throw new Error(`unsupported attachment type for ${ATTACH}`);
  attachment = { disposition: "attachment", filename: basename(ATTACH), type, content: buf.toString("base64") };
  console.log(`attaching ${attachment.filename} (${buf.length} bytes, ${type})`);
}

const since = Date.now() - HOURS * 3600_000;
const ours = new Set(cfg.identities.map((i) => i.address.toLowerCase()));
const seeds = new Set(cfg.seeds.map((s) => s.address.toLowerCase().replace(/\+[^@]*@/, "@")));

const rows = parseRows(await wrangler([
  "d1", "execute", DB, "--remote", "--json", "--command",
  `SELECT id, alias, from_address, subject, message_id, references_json FROM inbound_message ` +
  `WHERE direction='inbound' AND received_at >= ${since} ORDER BY received_at DESC LIMIT ${LIMIT}`,
]));

// Only answer a human. Our own addresses would loop — including a seed's
// engage-side reply, which lands here as ordinary inbound mail — and a bounce
// sender is not a correspondent.
const targets = rows.filter((r) => {
  const from = String(r.from_address ?? "").toLowerCase();
  if (!from || /mailer-daemon|postmaster|no-?reply|bounce/.test(from)) return false;
  if (ours.has(from)) return false;
  if (seeds.has(from.replace(/\+[^@]*@/, "@"))) return false;
  return true;
});

console.log(`${targets.length} reply-able message(s)${APPLY ? "" : " (DRY RUN)"}\n`);

let n = 0;
for (const row of targets) {
  const headers = threadHeaders(row);
  if (!headers) { console.log(`  SKIP  ${row.alias} — no Message-ID to thread against`); continue; }
  const identity = cfg.identities.find((i) => i.address.toLowerCase() === String(row.alias).toLowerCase());
  if (!identity) { console.log(`  SKIP  ${row.alias} — not a configured identity`); continue; }

  const subject = sanitize(row.subject) || "(no subject)";
  const body = REPLIES[n++ % REPLIES.length];
  const to = sanitize(row.from_address);

  if (!APPLY) {
    console.log(`  would reply  ${identity.address}  ->  ${to}  "${subject.slice(0, 40)}"`);
    continue;
  }
  const res = await sendEmail(env, {
    from: identity.address,
    fromName: identity.name,
    to,
    subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
    text: `${body}\n\n${identity.name}\n${identity.address.split("@")[1]}`,
    html: `<div><p>${body}</p><p>${identity.name}<br>${identity.address.split("@")[1]}</p></div>`,
    headers,
    replyTo: identity.replyTo ?? null,
    attachments: attachment ? [attachment] : [],
  });
  console.log(`  ${res.ok ? "sent" : "FAIL"}  ${identity.address.padEnd(26)} -> ${to.padEnd(26)}${res.ok ? "" : "  " + res.error}`);
  await new Promise((r) => setTimeout(r, 1500));
}
