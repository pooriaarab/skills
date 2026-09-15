// Authentication checks that run before any warm-up mail goes out.
//
// Warming a domain that fails authentication is worse than not warming it: you
// are paying to teach every receiver that your domain sends unverifiable mail.

import { Resolver } from "node:dns/promises";

/**
 * True for a routable public IPv4. A zone's NS delegation is data the zone
 * owner controls, and a nameserver hostname that resolves to loopback,
 * link-local (which includes the 169.254.169.254 cloud metadata address) or
 * an RFC1918 range would point our queries at the local network instead of
 * the real nameserver.
 */
export function isPublicIPv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a >= 224) return false;
  return true;
}

/**
 * Query the zone's own nameservers rather than the system resolver.
 *
 * A record published seconds ago is still NXDOMAIN in a local cache for the
 * length of the negative TTL, and a preflight that reports FAIL on a record
 * that plainly exists trains the operator to ignore it.
 */
async function authoritativeResolver(domain) {
  const system = new Resolver();
  const labels = domain.split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    const zone = labels.slice(i).join(".");
    try {
      const ns = await system.resolveNs(zone);
      const ips = (await Promise.all(ns.map((h) => system.resolve4(h).catch(() => [])))).flat().filter(isPublicIPv4);
      if (ips.length) {
        const r = new Resolver();
        r.setServers(ips);
        return r;
      }
    } catch {
      // Walk up: a subdomain rarely has its own NS records.
    }
  }
  return system;
}

const txt = async (r, name) => {
  try {
    return (await r.resolveTxt(name)).map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
};

const mx = async (r, name) => {
  try {
    return await r.resolveMx(name);
  } catch {
    return [];
  }
};

/**
 * Second-level public suffixes in common use, so a domain under one of these
 * (e.g. `mail.example.co.uk`) resolves its organizational domain to
 * `example.co.uk` rather than `co.uk`. Not a full public suffix list — an
 * unlisted multi-part suffix still falls back to the last two labels.
 */
const MULTI_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "gov.uk", "ac.uk", "me.uk", "net.uk", "sch.uk",
  "co.jp", "or.jp", "ne.jp", "ac.jp", "go.jp",
  "co.nz", "org.nz", "govt.nz", "ac.nz",
  "co.za", "org.za", "gov.za",
  "com.au", "net.au", "org.au", "gov.au", "edu.au",
  "com.br", "net.br", "org.br", "gov.br",
  "co.in", "org.in", "gov.in", "net.in",
  "com.cn", "org.cn", "net.cn", "gov.cn",
  "co.kr", "or.kr", "go.kr",
]);

/** The registrable domain, used to find the DMARC record a subdomain inherits. */
export function organizationalDomain(domain) {
  const parts = domain.split(".");
  if (parts.length <= 2) return domain;
  const lastTwo = parts.slice(-2).join(".");
  if (parts.length > 2 && MULTI_PART_SUFFIXES.has(lastTwo)) return parts.slice(-3).join(".");
  return lastTwo;
}

function parseTags(record) {
  const tags = {};
  for (const part of record.split(";")) {
    const [k, v] = part.split("=").map((s) => s?.trim());
    if (k) tags[k.toLowerCase()] = v;
  }
  return tags;
}

const VALID_DMARC_POLICIES = new Set(["none", "quarantine", "reject"]);

/**
 * `role` decides what "correct" means. A send-only sending subdomain needs no
 * MX and no SPF of its own: its envelope sender is the return-path host, and
 * DMARC rides on DKIM alignment. Demanding MX there would be a false alarm.
 */
export async function checkDomain(domain, options = {}) {
  const {
    dkimSelectors = [],
    role = "send+receive",
    returnPath = null,
    resolver = null,
  } = options;
  const r = resolver ?? (await authoritativeResolver(domain));
  const findings = [];
  const add = (level, message) => findings.push({ level, message });

  // --- SPF -----------------------------------------------------------------
  // For a send-only subdomain the envelope sender is the return-path host, so
  // that is the name whose SPF the receiver actually evaluates.
  const spfHost = role === "send-only" && returnPath ? returnPath : domain;
  const spf = (await txt(r, spfHost)).filter((t) => t.toLowerCase().startsWith("v=spf1"));
  if (spf.length === 0) {
    add(role === "send-only" ? "warn" : "fail", `No SPF record on ${spfHost}. Publish one so receivers can authorize the hosts that send for it.`);
  } else if (spf.length > 1) {
    add("fail", `${spfHost} publishes ${spf.length} SPF records. Receivers treat that as a permanent error and fail SPF outright — merge them into one.`);
  } else if (/[+]all\s*$/.test(spf[0])) {
    add("fail", `The SPF record on ${spfHost} ends in +all, which authorizes the entire internet to send as you. Change it to ~all or -all.`);
  } else {
    add("ok", `${spfHost} has one SPF record and it does not end in +all.`);
  }

  // --- DKIM ----------------------------------------------------------------
  // `v=` is optional per RFC 6376 and defaults to DKIM1 when absent — only an
  // explicit, different version disqualifies a record. The required tag is
  // `p`; an empty `p=` is a deliberately revoked key and must still fail.
  const dkim = {};
  for (const selector of dkimSelectors) {
    const name = `${selector}._domainkey.${domain}`;
    const found = (await txt(r, name)).filter((t) => {
      const tags = parseTags(t);
      if (tags.v && tags.v.toLowerCase() !== "dkim1") return false;
      return Boolean(tags.p);
    });
    dkim[selector] = found.length > 0;
    if (found.length) add("ok", `DKIM selector ${selector} resolves at ${name}.`);
    else add("fail", `No DKIM record at ${name}. Without it nothing this domain sends can be signed, so DMARC cannot pass on DKIM.`);
  }

  // --- DMARC ---------------------------------------------------------------
  // A record missing the required `p` tag, or a name publishing more than
  // one record, is invalid and receivers discard it outright — that must
  // report `fail`, not `ok`/`warn` with `p=unset`.
  const own = (await txt(r, `_dmarc.${domain}`)).filter((t) => t.toLowerCase().startsWith("v=dmarc1"));
  const ownTags = own.length === 1 ? parseTags(own[0]) : null;
  let dmarc = null;
  if (own.length > 1) {
    add("fail", `${domain} publishes ${own.length} DMARC records at _dmarc.${domain}. Receivers treat that as invalid and apply no DMARC policy — merge them into one.`);
  } else if (ownTags && VALID_DMARC_POLICIES.has(ownTags.p)) {
    dmarc = ownTags;
    add("ok", `DMARC is published at _dmarc.${domain} with p=${dmarc.p}.`);
  } else if (ownTags) {
    add("fail", `_dmarc.${domain} has no valid p= tag. Receivers discard a DMARC record without one, so this domain is unauthenticated in practice.`);
  } else {
    const org = organizationalDomain(domain);
    const parent = org === domain ? [] : (await txt(r, `_dmarc.${org}`)).filter((t) => t.toLowerCase().startsWith("v=dmarc1"));
    const parentTags = parent.length === 1 ? parseTags(parent[0]) : null;
    if (parentTags && VALID_DMARC_POLICIES.has(parentTags.p)) {
      const effective = VALID_DMARC_POLICIES.has(parentTags.sp) ? parentTags.sp : parentTags.p;
      dmarc = { ...parentTags, inherited: true, p: effective };
      add("warn", `${domain} has no DMARC record of its own, so it inherits p=${effective} from ${org}. That is workable, but its mail is judged by a policy you did not set for it.`);
    } else {
      add("fail", `No usable DMARC record at _dmarc.${domain} and none to inherit from ${org}. Publish one so receivers know how to treat unauthenticated mail.`);
    }
  }

  // A parent with p=reject and no sp= is the trap that silently kills a new
  // sending subdomain: the subdomain inherits reject before it is aligned.
  if (dmarc && !dmarc.inherited && domain === organizationalDomain(domain) && !dmarc.sp && (dmarc.p === "reject" || dmarc.p === "quarantine")) {
    add("warn", `_dmarc.${domain} sets p=${dmarc.p} with no sp= tag, so every subdomain inherits ${dmarc.p}. A new sending subdomain is rejected until its own DKIM aligns — verify a subdomain before you send from it.`);
  }

  // --- MX ------------------------------------------------------------------
  const mxRecords = await mx(r, domain);
  if (role === "send-only") {
    add("ok", `${domain} is send-only, so it needs no MX record. Set Reply-To to a mailbox that does receive.`);
  } else if (mxRecords.length === 0) {
    add("fail", `No MX record on ${domain}, so it cannot receive mail or any reply.`);
  } else {
    add("ok", `${domain} has ${mxRecords.length} MX record(s) and can receive mail.`);
  }

  return { domain, role, spf: spf[0] ?? null, dkim, dmarc, mx: mxRecords, findings };
}

/**
 * Role is a config fact, not a DNS fact. A subdomain is send-only because the
 * program said so, not because it happens to lack MX. Inferring the role from
 * a missing MX is how the old message became advice dressed as a check.
 */
export function roleForIdentity(identity, sendingDomain = null) {
  if (identity.role === "send-only" || identity.role === "send+receive") return identity.role;
  const domain = String(identity.address ?? "").split("@")[1] ?? "";
  const isSub = sendingDomain ? domain !== sendingDomain : domain !== organizationalDomain(domain);
  return isSub ? "send-only" : "send+receive";
}

/**
 * Second pass: for each identity, the address a reply actually goes to.
 *
 * checkDomain never sees identities. A send-only host can (and should) have
 * no MX; what it cannot do is leave replies aimed at itself. `replyTo` when
 * set, otherwise the identity's own address — and that domain must have MX.
 */
export async function checkReplyPaths(identities, options = {}) {
  const { resolver = null, sendingDomain = null } = options;
  const findings = [];
  const add = (level, message) => findings.push({ level, message });
  const resolvers = new Map();

  for (const identity of identities) {
    const address = identity.address;
    const role = roleForIdentity(identity, sendingDomain);
    const replyTo = identity.replyTo || null;

    // Send-only plus no replyTo is a fail on the config, before any DNS.
    // Giving the sending host MX would not make it receive: the role said
    // it does not, and a reply still goes to an address with no inbound route.
    if (role === "send-only" && !replyTo) {
      add("fail", `${address} is send-only and has no replyTo, so a reply to it bounces.`);
      continue;
    }

    const replyAddress = replyTo || address;
    const replyDomain = String(replyAddress).split("@")[1] ?? "";
    let r = resolver;
    if (!r) {
      if (!resolvers.has(replyDomain)) resolvers.set(replyDomain, await authoritativeResolver(replyDomain));
      r = resolvers.get(replyDomain);
    }
    const mxRecords = await mx(r, replyDomain);
    if (mxRecords.length === 0) {
      if (replyTo) {
        add("fail", `${replyTo} is the replyTo for ${address}, but ${replyDomain} has no MX record, so a reply to it bounces.`);
      } else {
        add("fail", `No MX record on ${replyDomain}, so a reply to ${address} cannot be received.`);
      }
    } else {
      add("ok", `${replyDomain} has ${mxRecords.length} MX record(s) and can receive a reply to ${replyAddress}.`);
    }
  }

  return { findings };
}
