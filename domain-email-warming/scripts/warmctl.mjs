#!/usr/bin/env node
// warmctl - run a measured domain email warm-up program.
//
// The tool exists to answer one question with evidence: did the message land
// in the inbox or in spam? A provider's send receipt cannot answer it, so
// every send is followed up on the receiving side and the verdict is recorded.

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { argv, exit } from "node:process";

import { cfEnv, getLimits, sendEmail } from "./lib/cloudflare.mjs";
import { compose, composeReply, loadLogo, VARIANTS, variantFor } from "./lib/content.mjs";
import { classify, findByMessageId, markRead, reply, rescueFromSpam } from "./lib/gmail.mjs";
import { checkDomain } from "./lib/preflight.mjs";
import { planForDay } from "./lib/ramp.mjs";
import { dayIndex, loadState, recordSend, saveState, sendsOnDay } from "./lib/state.mjs";

const USAGE = `warmctl - measured domain email warm-up

  warmctl <command> --config <path> [--apply] [--json] [--day N]

Commands
  preflight   Check SPF, DKIM, DMARC and MX for every sending domain.
  plan        Print the schedule for a day. Never sends.
  send        Send whatever is due now. Dry run unless --apply.
              Run hourly: the ramp spreads the day, so each pass sends a few.
              --all ignores the schedule and sends the whole day at once.
  engage      On the seed side: classify placement, rescue spam, reply.
  report      Placement and volume so far, plus provider quota.

Anything that sends, replies or mutates is a dry run unless you pass --apply.`;

function parseArgs(args) {
  const out = { _: [], apply: false, json: false, day: null, config: null, all: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--apply") out.apply = true;
    else if (a === "--all") out.all = true;
    else if (a === "--json") out.json = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--config") out.config = args[++i];
    else if (a === "--day") out.day = Number(args[++i]);
    else if (a.startsWith("--")) throw new Error(`unknown flag ${a}`);
    else out._.push(a);
  }
  return out;
}

async function loadConfig(path) {
  if (!path) throw new Error("--config <path> is required");
  const cfg = JSON.parse(await readFile(path, "utf8"));
  for (const key of ["program", "identities", "seeds", "ramp", "startDate"]) {
    if (!cfg[key]) throw new Error(`config is missing "${key}"`);
  }
  if (!cfg.identities.length) throw new Error("config has no identities");
  if (!cfg.seeds.some((s) => s.engage)) {
    throw new Error("config has no seed with engage:true — placement could never be measured");
  }
  return cfg;
}

/**
 * Sending domains are derived from the identities, so adding a mailbox needs no
 * config edit. A subdomain is treated as send-only: Cloudflare gives it a
 * return path but no inbound route, which is why its identities carry replyTo.
 */
function sendingDomains(cfg) {
  const apex = cfg.sendingDomain ?? null;
  return [...new Set(cfg.identities.map((i) => i.address.split("@")[1]))].map((domain) => {
    const isSub = apex ? domain !== apex : domain.split(".").length > 2;
    return {
      domain,
      role: isSub ? "send-only" : "send+receive",
      returnPath: isSub ? `cf-bounce.${domain}` : null,
    };
  });
}

async function cmdPreflight(cfg, opts) {
  const results = [];
  for (const { domain, role, returnPath } of sendingDomains(cfg)) {
    results.push(await checkDomain(domain, {
      dkimSelectors: cfg.dkimSelectors ?? ["cf-bounce"],
      role,
      returnPath,
    }));
  }
  if (opts.json) return console.log(JSON.stringify(results, null, 2));
  let failed = false;
  for (const r of results) {
    console.log(`\n${r.domain}  (${r.role})`);
    for (const f of r.findings) {
      if (f.level === "fail") failed = true;
      console.log(`  ${f.level === "ok" ? "ok  " : f.level === "warn" ? "warn" : "FAIL"}  ${f.message}`);
    }
  }
  if (failed) {
    console.log("\nFix every FAIL before sending. Warming a domain that fails authentication teaches the receivers exactly the wrong thing.");
    exit(1);
  }
}

async function cmdPlan(cfg, opts, state) {
  const day = opts.day ?? dayIndex(state);
  const plan = planForDay(cfg, day, Math.random);
  if (opts.json) return console.log(JSON.stringify({ day, plan }, null, 2));
  console.log(`\nday ${day} - ${plan.length} messages`);
  for (const p of plan) console.log(`  ${new Date(p.sendAt).toISOString().slice(11, 16)}  ${p.from}  ->  ${p.to}`);
}

async function cmdSend(cfg, opts, state) {
  const day = opts.day ?? dayIndex(state);
  const plan = planForDay(cfg, day, Math.random);

  // Re-running `send` on the same day must top up, never duplicate. The state
  // file is the record of what already went out.
  const already = sendsOnDay(state, day).length;

  // Only what is actually due. The ramp spreads the day across a working window
  // precisely so the mail does not leave in one burst, and sending the whole
  // day's plan the moment the command runs would throw that away — sixteen
  // messages in one second is a machine signature whatever they say. Run this
  // hourly and each pass sends the few that have come due.
  const due = opts.all ? plan.length : plan.filter((p) => Date.parse(p.sendAt) <= Date.now()).length;
  const todo = plan.slice(already, Math.max(already, due));
  if (!todo.length) {
    const next = plan[already]?.sendAt;
    console.log(
      `day ${day}: ${already}/${plan.length} sent` +
        (next ? `, next due ${new Date(next).toISOString().slice(11, 16)}Z` : ", day complete"),
    );
    return;
  }
  console.log(`day ${day}: ${already}/${plan.length} sent, sending ${todo.length} now${opts.apply ? "" : " (DRY RUN)"}`);

  if (!opts.apply) {
    const variants = cfg.variants ?? VARIANTS;
    for (const [i, p] of todo.entries()) {
      console.log(`  would send ${variantFor(already + i, variants).padEnd(11)} ${p.from} -> ${p.to}`);
    }
    return;
  }

  const env = cfEnv(cfg);
  const variants = cfg.variants ?? VARIANTS;
  // Resolved against the config file's own directory, not the process cwd:
  // warm-tick.sh is meant to run hourly from cron, which does not promise any
  // particular working directory.
  const logoPath = cfg.logoPath ? resolve(dirname(opts.config), cfg.logoPath) : null;
  const logo = await loadLogo(logoPath).catch((err) => {
    throw new Error(`could not read logoPath: ${err.message}`);
  });
  for (const [i, p] of todo.entries()) {
    const identity = cfg.identities.find((i) => i.address === p.from);
    // Rotate by absolute position in the day so a resumed run keeps cycling
    // shapes instead of restarting at "plain" every time.
    const variant = variantFor(already + i, variants);
    // Replies must reach a mailbox that exists; sending subdomains are
    // send-only, so their identities carry an apex replyTo.
    const replyTo = identity.replyTo ?? null;
    const { subject, text, html, attachments, headers } = compose(Math.random, {
      fromName: identity.name,
      fromAddress: p.from,
      toAddress: p.to,
      day,
      variant,
      logo,
      replyTo,
      orgName: cfg.orgName ?? null,
    });
    const res = await sendEmail(env, {
      from: p.from,
      fromName: identity.name,
      to: p.to,
      subject,
      text,
      html,
      attachments,
      headers,
      replyTo,
    });
    recordSend(state, {
      id: crypto.randomUUID(),
      day,
      at: new Date().toISOString(),
      from: p.from,
      to: p.to,
      subject,
      variant,
      // Where a reply must go. For a send-only subdomain this is the apex
      // address; replying to `from` there bounces, because the subdomain has
      // no MX and no A record.
      replyTo,
      messageId: res.messageId ?? null,
      accepted: res.ok,
      error: res.error ?? null,
      placement: null,
      placementCheckedAt: null,
      rescued: false,
      replied: false,
    });
    await saveState(state);
    console.log(`  ${res.ok ? "sent" : "FAIL"}  ${variant.padEnd(11)} ${p.from} -> ${p.to}${res.ok ? "" : `  (${res.error})`}`);
  }
}

async function cmdEngage(cfg, opts, state) {
  const seeds = new Map(cfg.seeds.map((s) => [s.address, s]));
  const cutoff = Date.now() - 3 * 86400000;

  // Only mail we can actually read and recent enough to still be findable.
  // A send is pending while EITHER its placement is unresolved or it has not
  // been replied to yet: a message that was classified but whose reply failed
  // still has work outstanding, and keying only on placement would strand it.
  const unresolved = (s) => s.placement === null || s.placement === "not_found" || s.placement === "unknown";
  const pending = state.sends.filter((s) => {
    const seed = seeds.get(s.to);
    return s.accepted && s.messageId && seed?.engage && Date.parse(s.at) > cutoff &&
      (unresolved(s) || !s.replied);
  });

  console.log(`${pending.length} message(s) to check${opts.apply ? "" : " (DRY RUN)"}`);
  if (!opts.apply) {
    for (const s of pending) console.log(`  would check ${s.messageId} at ${s.to}`);
    return;
  }

  for (const s of pending) {
    const seed = seeds.get(s.to);
    const found = await findByMessageId(seed.gogAccount, s.messageId);
    s.placementCheckedAt = new Date().toISOString();
    const reclassify = unresolved(s);
    if (!found.found) {
      s.placement = "not_found";
      console.log(`  not_found  ${s.from} -> ${s.to}`);
      await saveState(state);
      continue;
    }
    if (reclassify) s.placement = classify(found.labels);
    console.log(`  ${String(s.placement).padEnd(10)} ${s.from} -> ${s.to}`);

    // Rescuing from spam is the corrective half of the loop: it tells the
    // provider its classification was wrong, which is the signal we want.
    if (reclassify && s.placement === "spam") {
      await rescueFromSpam(seed.gogAccount, found.id);
      s.rescued = true;
    }
    await markRead(seed.gogAccount, found.id);
    if (!s.replied && Math.random() < (cfg.replyRate ?? 0.5)) {
      await reply(seed.gogAccount, {
        replyToMessageId: found.id,
        to: s.replyTo ?? s.from,
        subject: s.subject,
        body: composeReply(Math.random, s),
      });
      s.replied = true;
    }
    await saveState(state);
  }
}

async function cmdReport(cfg, opts, state) {
  const counts = {};
  const byDay = {};
  for (const s of state.sends) {
    const p = s.accepted ? (s.placement ?? "unchecked") : "send_failed";
    counts[p] = (counts[p] ?? 0) + 1;
    byDay[s.day] ??= {};
    byDay[s.day][p] = (byDay[s.day][p] ?? 0) + 1;
  }
  // Per-variant placement is the answer to "does mail with a logo get filtered?"
  const byVariant = {};
  for (const s2 of state.sends) {
    const v = s2.variant ?? "unknown";
    const p = s2.accepted ? (s2.placement ?? "unchecked") : "send_failed";
    byVariant[v] ??= {};
    byVariant[v][p] = (byVariant[v][p] ?? 0) + 1;
  }
  let quota = null;
  try {
    quota = await getLimits(cfEnv(cfg));
  } catch {
    // A report is still worth printing without the provider's quota.
  }
  if (opts.json) return console.log(JSON.stringify({ counts, byDay, byVariant, quota }, null, 2));

  console.log(`\nprogram: ${cfg.program}   day ${dayIndex(state)}   sends: ${state.sends.length}`);
  console.log("\noverall placement");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(12)} ${v}`);
  }
  const checked = ["primary", "spam", "promotions", "updates", "other_tab"].reduce((n, k) => n + (counts[k] ?? 0), 0);
  if (checked) {
    const rate = (((counts.primary ?? 0) / checked) * 100).toFixed(0);
    console.log(`\n  ${rate}% reached the Primary tab, of ${checked} measured`);
  } else {
    console.log("\n  nothing measured yet - run `warmctl engage --apply`");
  }
  console.log("\nby format variant");
  for (const [v, c] of Object.entries(byVariant)) {
    const measured = (c.primary ?? 0) + (c.spam ?? 0) + (c.promotions ?? 0) + (c.updates ?? 0) + (c.other_tab ?? 0);
    const rate = measured ? `${(((c.primary ?? 0) / measured) * 100).toFixed(0)}% primary` : "not measured yet";
    console.log(`  ${v.padEnd(12)} ${String(rate).padEnd(18)} ${Object.entries(c).map(([k, n]) => `${k}:${n}`).join("  ")}`);
  }

  console.log("\nby day");
  for (const [d, c] of Object.entries(byDay).sort((a, b) => a[0] - b[0])) {
    console.log(`  day ${String(d).padEnd(3)} ${Object.entries(c).map(([k, v]) => `${k}:${v}`).join("  ")}`);
  }
  if (quota) console.log(`\nprovider quota: ${quota.usage?.sent ?? "?"} / ${quota.quota?.value ?? "?"} per ${quota.quota?.unit ?? "day"}`);
}

const COMMANDS = { preflight: cmdPreflight, plan: cmdPlan, send: cmdSend, engage: cmdEngage, report: cmdReport };

async function main() {
  let opts;
  try {
    opts = parseArgs(argv.slice(2));
  } catch (err) {
    console.error(err.message);
    exit(2);
  }
  const name = opts._[0];
  if (opts.help || !name) {
    console.log(USAGE);
    exit(name ? 0 : 2);
  }
  const fn = COMMANDS[name];
  if (!fn) {
    console.error(`unknown command "${name}"\n\n${USAGE}`);
    exit(2);
  }
  const cfg = await loadConfig(opts.config);
  const state = await loadState(cfg.program, cfg.startDate);
  await fn(cfg, opts, state);
}

main().catch((err) => {
  console.error(`warmctl: ${err.message}`);
  exit(1);
});
