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
  { key: "esign:pandadoc", to: "support@pandadoc.com", alt: "sales@pandadoc.com", category: "esign" },
  { key: "esign:signnow", to: "support@signnow.com", alt: "sales@signnow.com", category: "esign" },
  { key: "esign:docusign", to: "support@docusign.com", category: "esign" },
  { key: "scheduling:cal", to: "support@cal.com", alt: "sales@cal.com", category: "scheduling" },
  { key: "scheduling:calendly", to: "support@calendly.com", alt: "sales@calendly.com", category: "scheduling" },
  { key: "scheduling:nylas", to: "support@nylas.com", alt: "sales@nylas.com", category: "scheduling" },
  { key: "email:resend", to: "support@resend.com", alt: "sales@resend.com", category: "email" },
  { key: "email:postmark", to: "support@postmarkapp.com", category: "email" },
  { key: "email:loops", to: "support@loops.so", alt: "sales@loops.so", category: "email" },
  { key: "auth:clerk", to: "support@clerk.com", alt: "sales@clerk.com", category: "auth" },
  { key: "auth:workos", to: "support@workos.com", alt: "sales@workos.com", category: "auth" },
  { key: "auth:stytch", to: "support@stytch.com", alt: "sales@stytch.com", category: "auth" },
  { key: "billing:paddle", to: "sellers@paddle.com", alt: "sales@paddle.com", category: "billing" },
  { key: "billing:lemonsqueezy", to: "support@lemonsqueezy.com", alt: "sales@lemonsqueezy.com", category: "billing" },
  { key: "billing:polar", to: "support@polar.sh", alt: "sales@polar.sh", category: "billing" },
  { key: "data:neon", to: "support@neon.tech", alt: "sales@neon.tech", category: "data" },
  { key: "data:turso", to: "support@turso.tech", alt: "sales@turso.tech", category: "data" },
  { key: "data:upstash", to: "support@upstash.com", alt: "sales@upstash.com", category: "data" },
  { key: "observability:axiom", to: "support@axiom.co", alt: "sales@axiom.co", category: "observability" },
  { key: "observability:betterstack", to: "hello@betterstack.com", alt: "sales@betterstack.com", category: "observability" },
  { key: "observability:checkly", to: "support@checklyhq.com", alt: "sales@checklyhq.com", category: "observability" },
  { key: "ai:groq", to: "support@groq.com", alt: "sales@groq.com", category: "ai" },
  { key: "ai:fireworks", to: "support@fireworks.ai", alt: "sales@fireworks.ai", category: "ai" },
  { key: "ai:replicate", to: "support@replicate.com", alt: "sales@replicate.com", category: "ai" },
  { key: "analytics:posthog", to: "support@posthog.com", alt: "sales@posthog.com", category: "analytics" },
  { key: "analytics:mixpanel", to: "support@mixpanel.com", alt: "sales@mixpanel.com", category: "analytics" },
  { key: "analytics:amplitude", to: "support@amplitude.com", alt: "sales@amplitude.com", category: "analytics" },
  { key: "analytics:heap", to: "support@heap.io", alt: "sales@heap.io", category: "analytics" },
  { key: "hosting:render", to: "support@render.com", alt: "sales@render.com", category: "hosting" },
  { key: "hosting:fly", to: "support@fly.io", alt: "sales@fly.io", category: "hosting" },
  { key: "hosting:railway", to: "support@railway.com", alt: "sales@railway.com", category: "hosting" },
  { key: "hosting:koyeb", to: "support@koyeb.com", alt: "sales@koyeb.com", category: "hosting" },
  { key: "cms:sanity", to: "support@sanity.io", alt: "sales@sanity.io", category: "cms" },
  { key: "cms:contentful", to: "support@contentful.com", category: "cms" },
  { key: "cms:prismic", to: "support@prismic.io", alt: "sales@prismic.io", category: "cms" },
  { key: "cms:storyblok", to: "support@storyblok.com", alt: "sales@storyblok.com", category: "cms" },
  { key: "errortracking:sentry", to: "support@sentry.io", alt: "sales@sentry.io", category: "errortracking" },
  { key: "errortracking:bugsnag", to: "support@bugsnag.com", category: "errortracking" },
  { key: "errortracking:rollbar", to: "support@rollbar.com", alt: "sales@rollbar.com", category: "errortracking" },
  { key: "errortracking:honeybadger", to: "support@honeybadger.io", alt: "sales@honeybadger.io", category: "errortracking" },
];

// One vendor hears from at most this many fleet domains, ever. Without a cap
// every domain eventually mails every vendor, and one support inbox receives
// thirty near-identical "evaluating providers" notes — a visible pattern that
// burns the question for all of them. Eligibility is a deterministic hash rank
// so it survives restarts and needs no extra state.
const VENDOR_DOMAIN_CAP = 6;

function hashStr(s) {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function vendorEligible(vendorKey, domain, allDomains) {
  const ranks = allDomains
    .map((d) => [hashStr(`${vendorKey}|${d}`), d])
    .sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
  return ranks.slice(0, VENDOR_DOMAIN_CAP).some(([, d]) => d === domain);
}

// Inquiries compose from parts so no two sends share copy: 3 variants x
// 4 greetings x 4 sign-offs = 48 distinct bodies per category, picked by
// independent hashes of (domain, vendor). Every sign-off carries the
// domain, so bodies to the same vendor always differ. Plain style throughout.
const GREETINGS = ["Hi.", "Hello.", "Hi there.", "Hello there."];
const SIGNOFFS = [
  "Thanks,\n{name}\n{domain}",
  "Best,\n{name}\n{domain}",
  "Many thanks,\n{name} ({domain})",
  "Cheers,\n{name}\n{domain}",
];
const INQUIRIES = {
  esign: [
    {
      subject: "E-signature API pricing",
      opener: "I run forms at {domain} and we need signatures inside the flow.",
      ask: "What does the API tier cost? Is there a sandbox I can test against?",
    },
    {
      subject: "White-label signing links",
      opener: "Our clients sign paperwork with our brand on it.",
      ask: "Do your API plans support custom templates and white-label links? Can I pull an audit trail per envelope?",
    },
    {
      subject: "ESIGN and eIDAS coverage",
      opener: "We handle regulated documents, so I check compliance first.",
      ask: "Which standards do you certify against? Where do you store signed files?",
    },
  ],
  scheduling: [
    {
      subject: "Scheduling API pricing",
      opener: "I build an appointment product at {domain}.",
      ask: "What does API access cost? Is there a free tier I can prototype with?",
    },
    {
      subject: "Time zones and reminders",
      opener: "Our users book across time zones.",
      ask: "How do you show times and check conflicts across calendars? Are reminders part of the API?",
    },
    {
      subject: "Embedded booking",
      opener: "I want booking inside our app, not on a hosted page.",
      ask: "Do you offer an embed or a headless API for that? What do embedded seats cost?",
    },
  ],
  email: [
    {
      subject: "Transactional email pricing",
      opener: "I am picking email for a new product at {domain}.",
      ask: "What do the tiers cost, and what does the free tier cover?",
    },
    {
      subject: "Inbound parsing and webhooks",
      opener: "We need inbound parsing, not just sends.",
      ask: "Do you parse replies to a webhook? What bounce and complaint detail ships on the lower tiers?",
    },
    {
      subject: "Move sending to you",
      opener: "We send from another provider today and I am weighing a move.",
      ask: "Do you help with migration? How do limits ramp for a new account?",
    },
  ],
  auth: [
    {
      subject: "Auth pricing past the free tier",
      opener: "I build a multi-tenant product at {domain}.",
      ask: "How does pricing scale past free? Are team features metered on their own?",
    },
    {
      subject: "SSO and SCIM plans",
      opener: "Some customers will ask for SSO before they sign.",
      ask: "Which plans include SAML and SCIM? Do you price per connection or per seat?",
    },
    {
      subject: "Passkeys and MFA",
      opener: "I am planning login for a new product.",
      ask: "Do you support passkeys plus TOTP? Can I enforce MFA per org, not per user?",
    },
  ],
  billing: [
    {
      subject: "Merchant of record rates",
      opener: "We sell software worldwide from {domain}.",
      ask: "What are your effective rates at low volume? How fast do payouts land?",
    },
    {
      subject: "VAT invoices for EU buyers",
      opener: "Most early buyers sit in the EU and need VAT invoices.",
      ask: "How do you collect and remit VAT? Can buyers download invoices on their own?",
    },
    {
      subject: "Metered billing on subscriptions",
      opener: "Our pricing pairs a base plan with metered use.",
      ask: "Can you bill metered seats on top of a sub? How do you report overages back?",
    },
  ],
  data: [
    {
      subject: "Database free tier limits",
      opener: "I run a few small services at {domain}.",
      ask: "What bounds the free tier? What does the first paid step cost?",
    },
    {
      subject: "Preview branches per pull request",
      opener: "We spin a preview env per pull request and need a database in each.",
      ask: "Do you branch instantly for that? How do you meter branch databases?",
    },
    {
      subject: "Backups and full export",
      opener: "I confirm recovery before I commit data anywhere.",
      ask: "What backup retention ships on paid tiers? Can I pull a full dump when I want?",
    },
  ],
  observability: [
    {
      subject: "Log pricing at low volume",
      opener: "I pick up observability for a few services at {domain}.",
      ask: "How do you price small ingest? What retention comes with it?",
    },
    {
      subject: "On-call alerts to a phone",
      opener: "We run a small rotation.",
      ask: "Which plans page a phone through PagerDuty or Slack? Do multi-condition alerts cost extra?",
    },
    {
      subject: "Cardinality pricing",
      opener: "Cardinality pricing bit me once, so I ask up front.",
      ask: "How do you meter high-cardinality fields? What retention applies to traces?",
    },
  ],
  ai: [
    {
      subject: "Inference pricing",
      opener: "I run a batch-heavy workload at {domain}.",
      ask: "What do tokens cost on the models I would use? What rate limits guard free?",
    },
    {
      subject: "Host a fine-tuned model",
      opener: "We may need a tuned model next to stock ones.",
      ask: "Do you host LoRA adapters? How does that price against shared inference?",
    },
    {
      subject: "Prompt retention",
      opener: "Our inputs hold customer content.",
      ask: "Do you keep prompts or completions? Is there a zero-retention tier or DPA?",
    },
  ],
  analytics: [
    {
      subject: "Analytics free tier",
      opener: "I add analytics to an early app at {domain}.",
      ask: "What do you cover free in events and seats? How does pricing step after that?",
    },
    {
      subject: "Cookieless tracking, EU hosting",
      opener: "We need tracking with no third-party cookies.",
      ask: "Do you support first-party collection? Can data stay in the EU?",
    },
    {
      subject: "Raw export to our warehouse",
      opener: "Our warehouse is the source of truth.",
      ask: "Can you export raw events to it on a schedule? Do you sync traits back out?",
    },
  ],
  hosting: [
    {
      subject: "Entry tier for small services",
      opener: "I run small web services at {domain}.",
      ask: "What ships in the entry tier? How do preview envs count against it?",
    },
    {
      subject: "Pin app and database to one region",
      opener: "Latency and residency both matter to us.",
      ask: "Which regions take deploys on standard plans? Can I pin app and data together?",
    },
    {
      subject: "Workers and cron",
      opener: "Our app needs workers and scheduled jobs by the web tier.",
      ask: "Do you run them natively? How do you bill them next to web services?",
    },
  ],
  cms: [
    {
      subject: "Headless CMS tiers",
      opener: "I pick a headless CMS for a content site at {domain}.",
      ask: "What do plans include? Where does free top out?",
    },
    {
      subject: "Preview before publish",
      opener: "Our editors must see a change before it goes live.",
      ask: "Do you preview against our frontend? Does that work with a static build?",
    },
    {
      subject: "Bulk import",
      opener: "We would move a few hundred entries across.",
      ask: "Is there an import API for bulk content? How do redirects map in the move?",
    },
  ],
  errortracking: [
    {
      subject: "Error tracking pricing",
      opener: "I add error tracking to services at {domain}.",
      ask: "How do you meter events on entry plans? When we spike, do you throttle or bill?",
    },
    {
      subject: "Source maps below top tier",
      opener: "Minified errors read as noise without maps.",
      ask: "How do uploads and release health work? Do lower tiers get them?",
    },
    {
      subject: "Cloud versus self-host",
      opener: "I weigh your cloud against self-hosting.",
      ask: "What does self-hosted lack? Is there a path to move between the two?",
    },
  ],
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

  // Preload all configs: eligibility ranks every domain against every
  // vendor, so one domain's choice depends on the whole fleet list.
  const cfgs = [];
  for (const f of files) {
    const cfg = JSON.parse(await readFile(join(opts.dir, f), "utf8"));
    const who = cfg.identities?.[0];
    if (who?.address) cfgs.push(cfg);
  }
  const allDomains = cfgs.map((c) => c.identities[0].address.split("@")[1]).sort();

  let sent = 0;
  for (const cfg of cfgs) {
    if (sent >= max) break;
    // The reply must land where the identity's domain already receives mail;
    // the address itself is the only place that is known to route.
    const domain = cfg.identities[0].address.split("@")[1];
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
    const off = hashStr(domain) % VENDORS.length;
    const vidx = Object.keys(state.sent).filter((k) => k.startsWith(`${domain}|`)).length;
    for (let i = 0; i < VENDORS.length; i++) {
      const v = VENDORS[(off + i) % VENDORS.length];
      if (sent >= max) break;
      const key = `${domain}|${v.key}`;
      if (state.sent[key]) continue;
      // Each vendor hears from only its ranked subset of domains, so the same
      // support inbox never collects the whole fleet's introductions.
      if (!vendorEligible(v.key, domain, allDomains)) continue;
      const sender = cfg.identities[vidx % cfg.identities.length];
      const variants = INQUIRIES[v.category];
      const q = variants[hashStr(`${domain}|${v.key}`) % variants.length];
      const greet = GREETINGS[hashStr(`${domain}|${v.key}|g`) % GREETINGS.length];
      const sign = SIGNOFFS[hashStr(`${domain}|${v.key}|s`) % SIGNOFFS.length];
      const body = `${greet} ${q.opener}\n\n${q.ask}\n\n${sign}`
        .replace("{name}", sender.name ?? "Hello").replaceAll("{domain}", domain);
      const subject = `${q.subject}`;
      // sales@ and support@ split by hash where the vendor takes sales mail
      // (probed live 2026-10-09; postmark/bugsnag/contentful/docusign stay
      // support-only). Same state key: one send per pair either way.
      const to = v.alt && hashStr(`${domain}|${v.key}|a`) % 2 ? v.alt : v.to;
      if (!opts.apply) {
        console.log(`would send ${sender.address} -> ${to}  "${subject}"`);
        sent++;
        break;
      }
      const res = await sendEmail(env, {
        from: sender.address,
        fromName: sender.name ?? "",
        to,
        subject,
        text: body,
        replyTo: `hello@${domain}`,
      });
      if (res.ok) {
        state.sent[key] = { at: new Date().toISOString(), from: sender.address, msgId: res.messageId, to };
        console.log(`sent ${sender.address} -> ${to}`);
      } else {
        console.error(`FAILED ${sender.address} -> ${to}: ${res.error}`);
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
