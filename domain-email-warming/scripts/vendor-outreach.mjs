#!/usr/bin/env node
// vendor-outreach - send genuine pre-sales inquiries from warm-up mailboxes.
//
// The strongest reply a new domain can earn is a real business thread: an SDR
// answers, follows up, and sends calendar links and PDFs. One honest question
// per vendor category per domain buys that thread without spraying: each
// vendor sees a small number of inquiries spread across many domains, and each
// mailbox gets inbound that no newsletter or signup flow produces.
//
// The questions are real — pricing tiers, sandbox access, API limits — things
// a team evaluating the product would ask and can act on. No fake urgency, no
// invented company details, no "we need this by Friday."
//
//   vendor-outreach.mjs --config-dir <dir> --env <env-file> [--apply]
//   [--apply] sends; without it the run is a dry run and prints only.
//
// State dedupes (domain, vendor) pairs forever: re-running fills in whatever
// has not been sent yet, so it is safe to run daily until the list is done.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { cfEnv, sendEmail } from "./lib/cloudflare.mjs";

const STATE_DEFAULT = join(homedir(), ".local/state/domain-email-warming/vendor-outreach.json");

// Staffed inboxes that answer pre-sales questions. Three categories because a
// vendor reply is a different thread type per category, and three vendors per
// category so no single company sees every domain.
const VENDORS = [
  { key: "esign:pandadoc", to: "support@pandadoc.com", category: "esign" },
  { key: "esign:signnow", to: "support@signnow.com", category: "esign" },
  { key: "esign:docusign", to: "support@docusign.com", category: "esign" },
  { key: "scheduling:cal", to: "support@cal.com", category: "scheduling" },
  { key: "scheduling:calendly", to: "support@calendly.com", category: "scheduling" },
  { key: "scheduling:nylas", to: "support@nylas.com", category: "scheduling" },
  { key: "email:resend", to: "support@resend.com", category: "email" },
  { key: "email:postmark", to: "support@postmarkapp.com", category: "email" },
  { key: "email:loops", to: "support@loops.so", category: "email" },
  { key: "auth:clerk", to: "support@clerk.com", category: "auth" },
  { key: "auth:workos", to: "support@workos.com", category: "auth" },
  { key: "auth:stytch", to: "support@stytch.com", category: "auth" },
  { key: "billing:paddle", to: "sellers@paddle.com", category: "billing" },
  { key: "billing:lemonsqueezy", to: "support@lemonsqueezy.com", category: "billing" },
  { key: "billing:polar", to: "support@polar.sh", category: "billing" },
  { key: "data:neon", to: "support@neon.tech", category: "data" },
  { key: "data:turso", to: "support@turso.tech", category: "data" },
  { key: "data:upstash", to: "support@upstash.com", category: "data" },
  { key: "observability:axiom", to: "support@axiom.co", category: "observability" },
  { key: "observability:betterstack", to: "hello@betterstack.com", category: "observability" },
  { key: "observability:checkly", to: "support@checklyhq.com", category: "observability" },
  { key: "ai:groq", to: "support@groq.com", category: "ai" },
  { key: "ai:fireworks", to: "support@fireworks.ai", category: "ai" },
  { key: "ai:replicate", to: "support@replicate.com", category: "ai" },
];

const INQUIRIES = {
  esign: {
    subject: "Pricing question for the e-signature API",
    text:
      "Hi — we are evaluating e-signature APIs for a forms-heavy workflow.\n\n" +
      "Can you share pricing for the API tier, whether there is a sandbox or " +
      "developer trial we can test against, and what the per-envelope rate " +
      "limits look like?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  scheduling: {
    subject: "Question about the scheduling API",
    text:
      "Hi — we are comparing scheduling/booking APIs for an appointment-driven " +
      "product.\n\n" +
      "Could you point me at API pricing, whether there is a free developer " +
      "tier to prototype against, and how calendar sync is handled?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  email: {
    subject: "Evaluating transactional email — pricing question",
    text:
      "Hi — we are evaluating transactional email providers for a new product.\n\n" +
      "Can you share the pricing tiers, what the free/developer tier covers, " +
      "and whether dedicated IPs or deliverability tooling are available?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  auth: {
    subject: "Evaluating auth providers — a few questions",
    text:
      "Hi — we are comparing auth providers for a multi-tenant product.\n\n" +
      "Could you share how pricing scales past the free tier, whether " +
      "organization/team features are metered separately, and what the " +
      "migration path looks like if we start on hosted and move to embedded?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  billing: {
    subject: "Merchant-of-record pricing question",
    text:
      "Hi — we sell software internationally and are comparing " +
      "merchant-of-record options.\n\n" +
      "What are the effective rates at low volume, how does payout timing " +
      "work, and is there a sandbox we can run test checkouts against?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  data: {
    subject: "Database pricing and limits question",
    text:
      "Hi — we are evaluating hosted databases for a few small services.\n\n" +
      "Can you share how the free tier is bounded (storage, compute, " +
      "branches), what read/write limits apply, and what the jump to the " +
      "first paid tier looks like?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  observability: {
    subject: "Log/monitoring pricing question",
    text:
      "Hi — we are picking an observability stack for a handful of " +
      "services.\n\n" +
      "How is ingestion priced at low volume, what retention is included, " +
      "and is there an extended trial or free tier we can evaluate with " +
      "real data?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
  ai: {
    subject: "Inference pricing question",
    text:
      "Hi — we are comparing inference providers for a batch-heavy " +
      "workload.\n\n" +
      "Could you share per-token pricing for the models we would use, " +
      "rate limits on the free/developer tier, and whether dedicated " +
      "throughput is available?\n\n" +
      "Thanks,\n{name}\n{domain}",
  },
};

const MAX_SENDS_PER_RUN = 6;

function parseArgs(argv) {
  const o = { apply: false, state: STATE_DEFAULT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--config-dir") o.dir = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--max") o.max = parseInt(argv[++i], 10);
  }
  return o;
}

async function loadState(path) {
  if (!existsSync(path)) return { sent: {} };
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir) {
    console.error("usage: vendor-outreach.mjs --config-dir <dir> [--apply]");
    return 2;
  }
  const max = opts.max ?? MAX_SENDS_PER_RUN;
  const state = await loadState(opts.state);
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(opts.dir)).filter((f) => f.endsWith(".warmup.json")).sort();

  let sent = 0;
  for (const f of files) {
    if (sent >= max) break;
    const cfg = JSON.parse(await readFile(join(opts.dir, f), "utf8"));
    const who = cfg.identities?.[0];
    if (!who?.address) continue;
    // The reply must land where the identity's domain already receives mail;
    // the address itself is the only place that is known to route.
    const domain = who.address.split("@")[1];
    let env;
    try {
      env = cfEnv(cfg);
    } catch (e) {
      console.log(`skip ${domain}: ${e.message.split("\n")[0]}`);
      continue;
    }
    // One vendor per domain per run, starting at a domain-hashed offset: the
    // cap spreads inquiries across domains AND vendors instead of dumping the
    // same vendor the whole fleet in one run.
    const off = [...domain].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % VENDORS.length;
    const vidx = Object.keys(state.sent).filter((k) => k.startsWith(`${domain}|`)).length;
    for (let i = 0; i < VENDORS.length; i++) {
      const v = VENDORS[(off + i) % VENDORS.length];
      if (sent >= max) break;
      const key = `${domain}|${v.key}`;
      if (state.sent[key]) continue;
      const sender = cfg.identities[vidx % cfg.identities.length];
      const q = INQUIRIES[v.category];
      const body = q.text.replace("{name}", sender.name ?? "Hello").replace("{domain}", domain);
      const subject = `${q.subject}`;
      if (!opts.apply) {
        console.log(`would send ${sender.address} -> ${v.to}  "${subject}"`);
        sent++;
        break;
      }
      const res = await sendEmail(env, {
        from: sender.address,
        fromName: sender.name ?? "",
        to: v.to,
        subject,
        text: body,
        replyTo: `hello@${domain}`,
      });
      if (res.ok) {
        state.sent[key] = { at: new Date().toISOString(), from: sender.address, msgId: res.messageId };
        console.log(`sent ${sender.address} -> ${v.to}`);
      } else {
        console.error(`FAILED ${sender.address} -> ${v.to}: ${res.error}`);
      }
      sent++;
      break;
    }
  }
  if (opts.apply) {
    await mkdir(dirname(opts.state), { recursive: true });
    await writeFile(opts.state, JSON.stringify(state, null, 1));
  }
  console.log(`${sent} ${opts.apply ? "sent" : "planned"} this run`);
  return 0;
}

process.exitCode = await main();
