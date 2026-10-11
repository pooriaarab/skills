#!/usr/bin/env node
// subscribe-sweep - subscribe warm-up mailboxes to real announce lists.
//
// Announce-list mail is the stickiest inbound a new domain can earn: the
// confirmation exchange is a genuine two-way thread and list traffic keeps
// arriving for as long as the list lives. Web signup forms are mostly
// bot-gated, but every serious list system still accepts a subscribe email,
// which a warm-up mailbox can send itself.
//
// Each mailbox joins a hash-picked subset of lists so no single list sees the
// whole fleet. Confirmations are completed in-band: "reply" lists get a reply
// that keeps the Subject line (sourcehut, mailman, ezmlm, smartlist), "click"
// lists get their confirm link visited (pgLister-style).
//
//   subscribe-sweep.mjs --config-dir <dir> --account <gmail> [--apply]
//     [--max N] [--state <path>] [--gog <bin>]
//
// Without --apply the run is a dry run: it prints planned subscribes and
// completes no confirmations. Cloudflare send env comes from process env the
// same way vendor-outreach takes it.
//
// State dedupes (mailbox, list) pairs forever; re-running fills in what has
// not finished, so it is safe to run daily until every mailbox is confirmed.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { cfEnv, sendEmail } from "./lib/cloudflare.mjs";

const execFile = promisify(execFileCb);
const STATE_DEFAULT = join(homedir(), ".local/state/domain-email-warming/subscribe-sweep.json");
const PICKS_PER_MAILBOX = 2;
const MAX_PER_RUN = 24;
const CONFIRM_WINDOW_MS = 24 * 3600 * 1000;
const MAX_ATTEMPTS = 3;

// Low-volume announce lists that accept subscribe-by-email and confirm by a
// reply or a link. Chosen for trickle traffic - an announce list mails a few
// times a month, which is exactly the cadence a warming domain wants.
const LISTS = [
  { key: "srht-announce", to: "~sircmpwn/sr.ht-announce+subscribe@lists.sr.ht",
    domain: "lists.sr.ht", confirm: "reply" },
  { key: "info-gnu", to: "info-gnu-join@gnu.org",
    domain: "gnu.org", confirm: "reply" },
  { key: "debian-announce", to: "debian-announce-subscribe@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "apache-announce", to: "announce-subscribe@apache.org",
    domain: "apache.org", confirm: "reply" },
  { key: "python-announce", to: "python-announce-list+join@python.org",
    domain: "python.org", confirm: "reply" },
  { key: "gcc-announce", to: "gcc-announce-subscribe@gcc.gnu.org",
    domain: "gcc.gnu.org", confirm: "reply" },
  { key: "golang-announce", to: "golang-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "pgsql-announce", to: "pgsql-announce+subscribe@lists.postgresql.org",
    domain: "postgresql.org", confirm: "click" },
  // NOTE 2026-10-09: googlegroups confirms arrive SLOW (k8s probe took
  // ~2h). The 24h CONFIRM_WINDOW covers it; do not mistake delay for failure.
  { key: "k8s-announce", to: "kubernetes-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "freebsd-announce", to: "freebsd-announce+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "fedora-announce", to: "announce-join@lists.fedoraproject.org",
    domain: "lists.fedoraproject.org", confirm: "reply" },
  { key: "ubuntu-announce", to: "ubuntu-announce-join@lists.ubuntu.com",
    domain: "lists.ubuntu.com", confirm: "reply" },
  // Piloted 2026-10-10: join accepted, classic mailman reply-confirm arrived.
  { key: "ubuntu-security-announce", to: "ubuntu-security-announce-join@lists.ubuntu.com",
    domain: "lists.ubuntu.com", confirm: "reply" },
  { key: "gentoo-announce", to: "gentoo-announce+subscribe@lists.gentoo.org",
    domain: "lists.gentoo.org", confirm: "reply" },
  { key: "gentoo-dev-announce", to: "gentoo-dev-announce+subscribe@lists.gentoo.org",
    domain: "lists.gentoo.org", confirm: "reply" },
  { key: "freebsd-security-notifications", to: "freebsd-security-notifications+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "freebsd-errata-notifications", to: "freebsd-errata-notifications+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "freebsd-snapshots", to: "freebsd-snapshots+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "freebsd-ports-announce", to: "freebsd-ports-announce+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "freebsd-status-calls", to: "freebsd-status-calls+subscribe@freebsd.org",
    domain: "freebsd.org", confirm: "reply" },
  { key: "debian-security-announce", to: "debian-security-announce-REQUEST@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "debian-stable-announce", to: "debian-stable-announce-REQUEST@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "debian-lts-announce", to: "debian-lts-announce-REQUEST@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "debian-backports-announce", to: "debian-backports-announce-REQUEST@lists.debian.org",
    domain: "lists.debian.org", confirm: "reply" },
  { key: "fedora-devel-announce", to: "devel-announce-join@lists.fedoraproject.org",
    domain: "lists.fedoraproject.org", confirm: "reply" },
  { key: "opensuse-mirror", to: "mirror-subscribe@lists.opensuse.org",
    domain: "lists.opensuse.org", confirm: "reply" },
  { key: "gdb-announce", to: "gdb-announce-join@sourceware.org",
    domain: "sourceware.org", confirm: "reply" },
  { key: "libc-announce", to: "libc-announce-join@sourceware.org",
    domain: "sourceware.org", confirm: "reply" },
  { key: "cygwin-announce", to: "cygwin-announce-join@cygwin.com",
    domain: "cygwin.com", confirm: "reply" },
  { key: "libffi-announce", to: "libffi-announce-join@sourceware.org",
    domain: "sourceware.org", confirm: "reply" },
  { key: "info-guix", to: "info-guix-request@gnu.org",
    domain: "gnu.org", confirm: "reply" },
  { key: "samba-announce", to: "samba-announce-subscribe@lists.samba.org",
    domain: "lists.samba.org", confirm: "reply" },
  { key: "nginx-announce", to: "nginx-announce-join@nginx.org",
    domain: "nginx.org", confirm: "reply" },
  { key: "php-announce", to: "php-announce+subscribe@lists.php.net",
    domain: "lists.php.net", confirm: "reply" },
  { key: "dbi-announce", to: "dbi-announce-subscribe@perl.org",
    domain: "perl.org", confirm: "reply" },
  { key: "httpd-announce", to: "announce-subscribe@httpd.apache.org",
    domain: "httpd.apache.org", confirm: "reply" },
  { key: "mariadb-announce", to: "announce-join@lists.mariadb.org",
    domain: "lists.mariadb.org", confirm: "reply" },
  { key: "ghc-releases", to: "ghc-releases-join@haskell.org",
    domain: "haskell.org", confirm: "reply" },
  { key: "kde-announce", to: "kde-announce-subscribe@kde.org",
    domain: "kde.org", confirm: "reply" },
  { key: "xorg-announce", to: "xorg-announce-request@lists.x.org",
    domain: "lists.x.org", confirm: "reply" },
  { key: "fdo-announce", to: "announce-request@lists.freedesktop.org",
    domain: "lists.freedesktop.org", confirm: "reply" },
  { key: "gstreamer-announce", to: "gstreamer-announce-request@lists.freedesktop.org",
    domain: "lists.freedesktop.org", confirm: "reply" },
  { key: "mesa-announce", to: "mesa-announce-request@lists.freedesktop.org",
    domain: "lists.freedesktop.org", confirm: "reply" },
  { key: "osm-announce", to: "announce-request@openstreetmap.org",
    domain: "openstreetmap.org", confirm: "reply" },
  { key: "osgeo-announce", to: "announce-request@lists.osgeo.org",
    domain: "lists.osgeo.org", confirm: "reply" },
  { key: "postfix-announce", to: "postfix-announce-join@postfix.org",
    domain: "postfix.org", confirm: "click" },
  { key: "tdf-announce", to: "announce+subscribe@documentfoundation.org",
    domain: "documentfoundation.org", confirm: "reply" },
  { key: "openstack-announce", to: "openstack-announce-join@lists.openstack.org",
    domain: "lists.openstack.org", confirm: "click" },
  { key: "openldap-announce", to: "openldap-announce-join@openldap.org",
    domain: "openldap.org", confirm: "click" },
  { key: "ceph-announce", to: "ceph-announce-join@ceph.io",
    domain: "ceph.io", confirm: "click" },
  { key: "dovecot-news", to: "dovecot-news-join@dovecot.org",
    domain: "dovecot.org", confirm: "click" },
  { key: "django-announce", to: "django-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "ansible-announce", to: "ansible-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "prometheus-announce", to: "prometheus-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "flutter-announce", to: "flutter-announce+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "jenkinsci-advisories", to: "jenkinsci-advisories+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "nodejs-sec", to: "nodejs-sec+subscribe@googlegroups.com",
    domain: "googlegroups.com", confirm: "reply" },
  { key: "riscv-tech", to: "tech-announce+subscribe@lists.riscv.org",
    domain: "lists.riscv.org", confirm: "reply" },
  { key: "spdx-announce", to: "spdx-tech-announce+subscribe@lists.spdx.org",
    domain: "lists.spdx.org", confirm: "reply" },
  { key: "openchain-spec", to: "specification+subscribe@lists.openchainproject.org",
    domain: "lists.openchainproject.org", confirm: "reply" },
];

// Confirmation links only: the deny list wins over the allow list because an
// unsubscribe link in the same message would undo the subscription.
const LINK_DENY = /(unsubscribe|opt[\s-]?out|remove|preferences|manage|report)/i;
const LINK_ALLOW = /(confirm|verify|activate|subscribe|optin|opt-in|double)/i;
const CONFIRM_SUBJECT = /(confirm|verify|subscribe|subscription|welcome|join)/i;

function parseArgs(argv) {
  const o = { apply: false, state: STATE_DEFAULT, gog: "gog", max: MAX_PER_RUN };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--config-dir") o.dir = argv[++i];
    else if (a === "--account") o.account = argv[++i];
    else if (a === "--state") o.state = argv[++i];
    else if (a === "--gog") o.gog = argv[++i];
    else if (a === "--max") o.max = parseInt(argv[i + 1], 10);
  }
  return o;
}

function hash(s) {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
}

function listsFor(email) {
  const start = hash(email) % LISTS.length;
  return Array.from({ length: PICKS_PER_MAILBOX }, (_, i) => LISTS[(start + i) % LISTS.length]);
}

function decodeQP(body) {
  return body.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)));
}

function extractConfirmLink(raw) {
  const urls = new Set();
  for (const m of decodeQP(raw).matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) {
    urls.add(m[0].replace(/[.,;:]+$/, ""));
  }
  return [...urls].find((u) => {
    try {
      const intent = new URL(u).pathname + new URL(u).search;
      return !LINK_DENY.test(intent) && LINK_ALLOW.test(intent);
    } catch {
      return false;
    }
  });
}

function toAddr(raw) {
  const m = raw.match(/^to\t+(.+)$/m) || raw.match(/^to:\s*(.+)$/mi);
  if (!m) return null;
  const addr = m[1].match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/);
  return addr ? addr[0].toLowerCase() : null;
}

function headerField(raw, name) {
  const m = raw.match(new RegExp(`^${name}\\t+(.+)$`, "m")) ||
            raw.match(new RegExp(`^${name}:\\s*(.+)$`, "mi"));
  return m ? m[1].trim() : null;
}

async function gogSearch(bin, account, query) {
  try {
    const { stdout } = await execFile(bin, ["-a", account, "gmail", "messages", "search",
                                          "--max", "50", "-j", "--", query], { timeout: 60_000 });
    const i = stdout.indexOf("{");
    return JSON.parse(stdout.slice(i)).messages ?? [];
  } catch {
    return [];
  }
}

async function gogBody(bin, account, id) {
  try {
    const { stdout } = await execFile(bin, ["-a", account, "gmail", "get", id,
                                          "--format", "full"], { timeout: 60_000 });
    return stdout;
  } catch {
    return "";
  }
}

async function loadState(path) {
  if (!existsSync(path)) return { pairs: {} };
  return JSON.parse(await readFile(path, "utf8"));
}

async function saveState(path, state) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(state, null, 1));
}

async function mailboxes(dir) {
  // All identities: sending subdomains (mail./news./go.) carry route MX and
  // deliver through Email Routing like the apex (verified by probe
  // 2026-10-09), so list confirmations reach them.
  const { readdir } = await import("node:fs/promises");
  const out = [];
  for (const f of (await readdir(dir)).filter((f) => f.endsWith(".warmup.json")).sort()) {
    const cfg = JSON.parse(await readFile(join(dir, f), "utf8"));
    for (const id of cfg.identities ?? []) {
      if (id?.address) out.push({ address: id.address, name: id.name ?? "", cfg });
    }
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dir || !opts.account) {
    console.error("usage: subscribe-sweep.mjs --config-dir <dir> --account <gmail> [--apply]");
    return 2;
  }
  const state = await loadState(opts.state);
  const boxes = await mailboxes(opts.dir);
  const now = Date.now();
  const pairs = state.pairs;

  // Register missing pairs; pairs for finished work survive across runs.
  for (const b of boxes) {
    for (const l of listsFor(b.address)) {
      const k = `${b.address}|${l.key}`;
      if (!pairs[k]) pairs[k] = { list: l.key, status: "new", attempts: 0, sentAt: 0 };
    }
  }
  // Retire unfinished pairs for mailboxes that left the configs.
  // Finished pairs stay as history.
  const inboxable = new Set(boxes.map((b) => b.address));
  for (const [k, p] of Object.entries(pairs)) {
    if (!inboxable.has(k.split("|")[0]) && p.status !== "confirmed" && p.status !== "failed") {
      delete pairs[k];
    }
  }

  const envByDomain = new Map();
  const envFor = (b) => {
    const d = b.address.split("@")[1];
    if (!envByDomain.has(d)) envByDomain.set(d, cfEnv(b.cfg));
    return envByDomain.get(d);
  };

  // 1. Complete pending confirmations: ONE gog search across all lists with
  //    pending pairs (50 lists would otherwise mean 50 searches per run),
  //    then match each confirmation mail to the mailbox it reached. Domains
  //    go out in chunks of 15 so the query stays short.
  const pendingLists = LISTS.filter((l) =>
    Object.values(pairs).some((p) => p.list === l.key && p.status === "requested" &&
                                    now - p.sentAt < CONFIRM_WINDOW_MS));
  const seenMsg = new Set();
  for (let c = 0; c < pendingLists.length; c += 15) {
    const chunk = pendingLists.slice(c, c + 15);
    const query = `in:anywhere newer_than:2d (${chunk.map((l) => l.domain).join(" OR ")})`;
    for (const msg of await gogSearch(opts.gog, opts.account, query)) {
      const mid = msg.id ?? msg.messageId;
      if (!mid || seenMsg.has(mid)) continue;
      seenMsg.add(mid);
      const body = await gogBody(opts.gog, opts.account, mid);
      const to = toAddr(body);
      if (!to || !CONFIRM_SUBJECT.test(msg.subject ?? "")) continue;
      // The mail names its list by sender address: match the join localpart
      // root first (several lists share one domain, e.g. googlegroups), then
      // the domain, then the only requested pair for this mailbox. A wrong
      // attribution still sends the reply to the right place (it answers the
      // mail in hand) but marks the wrong pair confirmed, so prefer precision.
      const rootOf = (l) => l.to.split("@")[0].split("+")[0].replace(/-(join|subscribe)$/, "");
      const cands = pendingLists.filter((l) => pairs[`${to}|${l.key}`]?.status === "requested");
      const low = body.toLowerCase();
      const l = cands.find((x) => low.includes(rootOf(x).toLowerCase()) && low.includes(x.domain.toLowerCase()))
        ?? cands.find((x) => low.includes(x.domain.toLowerCase()))
        ?? (cands.length === 1 ? cands[0] : null);
      if (!l) continue;
      const k = `${to}|${l.key}`;
      if (!opts.apply) {
        console.log(`would confirm ${to} on ${l.key}`);
        continue;
      }
      let ok = false, detail = "";
      if (l.confirm === "click") {
        const link = extractConfirmLink(body);
        if (!link) { detail = "no confirm link"; }
        else {
          try {
            const r = await fetch(link, { redirect: "follow",
                                          signal: AbortSignal.timeout(20_000) });
            ok = r.ok;
            detail = `clicked -> ${r.status}`;
          } catch (e) {
            detail = `click failed: ${e.message}`;
          }
        }
      } else {
        // Reply keeps the Subject (with the token) and goes back to the
        // confirm address the list sent from.
        const from = headerField(body, "from");
        const subject = msg.subject ?? "";
        const confTo = from?.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/)?.[0];
        const box = boxes.find((b) => b.address.toLowerCase() === to);
        if (!confTo || !box) { detail = "no confirm address"; }
        else {
          const res = await sendEmail(envFor(box), {
            from: box.address, fromName: box.name,
            to: confTo,
            subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
            text: "confirm",
            replyTo: box.address,
          });
          ok = res.ok;
          detail = res.ok ? "confirm reply sent" : `reply failed: ${res.error}`;
        }
      }
      if (ok) {
        pairs[k].status = "confirmed";
        pairs[k].confirmedAt = now;
      }
      console.log(`${ok ? "confirmed" : "confirm-pending"} ${to} on ${l.key} (${detail})`);
    }
  }

  // 2. Send fresh subscribes, capped per run so the list operators see a
  //    trickle rather than a flood.
  let sent = 0;
  for (const [k, p] of Object.entries(pairs)) {
    if (sent >= opts.max) break;
    if (p.status === "requested" && now - p.sentAt >= CONFIRM_WINDOW_MS) {
      p.status = p.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "retry";
    }
    if (p.status === "requested" || p.status === "confirmed" || p.status === "failed") continue;
    if (p.attempts >= MAX_ATTEMPTS) { p.status = "failed"; continue; }
    const [addr, lkey] = k.split("|");
    const l = LISTS.find((x) => x.key === lkey);
    const box = boxes.find((b) => b.address === addr);
    if (!l || !box) continue;
    if (!opts.apply) {
      console.log(`would subscribe ${addr} -> ${l.key}`);
      sent++;
      continue;
    }
    const res = await sendEmail(envFor(box), {
      from: box.address, fromName: box.name,
      to: l.to,
      subject: "subscribe",
      text: "subscribe",
      replyTo: box.address,
    });
    if (res.ok) {
      p.status = "requested";
      p.sentAt = now;
      p.attempts++;
      console.log(`subscribe ${addr} -> ${l.key}`);
    } else {
      console.error(`FAILED ${addr} -> ${l.key}: ${res.error}`);
    }
    sent++;
  }

  if (opts.apply) await saveState(opts.state, state);
  const done = Object.values(pairs).filter((p) => p.status === "confirmed").length;
  console.log(`${Object.keys(pairs).length} pairs, ${done} confirmed, ${sent} sent this run`);
  return 0;
}

process.exitCode = await main();
