// Gmail side of the warm-up: where did the message actually land?
//
// Everything here shells out to the `gog` CLI rather than talking to the Gmail
// API directly, so the operator's existing OAuth login is the only credential
// the tool needs.

import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFileDefault = promisify(execFileCb);

/** Injected in tests so no test ever spawns a process. */
export function makeGmail(execFile = execFileDefault) {
  async function gog(args) {
    try {
      const { stdout } = await execFile("gog", args, {
        timeout: 60_000,
        maxBuffer: 8 * 1024 * 1024,
      });
      return { ok: true, stdout };
    } catch (err) {
      // A non-zero exit still carries stdout worth parsing on some commands.
      return { ok: false, stdout: err.stdout ?? "", error: err.stderr?.trim() || err.message };
    }
  }

  /**
   * gog prints human preamble ("Using keyring backend: ...") before the JSON on
   * some machines, so locate the payload instead of trusting the first byte.
   */
  function parseJson(stdout) {
    if (!stdout) return null;
    const start = stdout.search(/[[{]/);
    if (start === -1) return null;
    try {
      return JSON.parse(stdout.slice(start));
    } catch {
      return null;
    }
  }

  function firstMessage(parsed) {
    if (!parsed) return null;
    const list = Array.isArray(parsed) ? parsed : parsed.messages;
    return Array.isArray(list) && list.length ? list[0] : null;
  }

  /**
   * Returns { ok, error, message }. `ok:false` means the lookup itself failed
   * (auth, binary missing, gog error) - NOT that the message is absent. The
   * distinction is load-bearing: an unreadable mailbox must never be recorded
   * as "the mail did not arrive", or a dead credential silently rewrites the
   * placement report as not_found.
   */
  async function search(account, query) {
    // Flags before `--`, query last: a query starting with `-` (the filter
    // query starts with `-to:`) would otherwise parse as a gog flag.
    const res = await gog(["-a", account, "gmail", "messages", "search", "--max", "1", "-j", "--", query]);
    const parsed = parseJson(res.stdout);
    // A parsed payload is the truth even when the exit code disagrees - gog
    // can exit non-zero while still printing results on stdout.
    if (parsed) return { ok: true, error: null, message: firstMessage(parsed) };
    if (!res.ok) return { ok: false, error: res.error ?? "gog failed", message: null };
    return { ok: false, error: "unparseable gog output", message: null };
  }

  /**
   * List form of search: up to `max` {id, labels} hits. Same contract as
   * search — ok:false means the lookup failed, never "no mail matched".
   */
  async function list(account, query, max = 100) {
    const res = await gog(["-a", account, "gmail", "messages", "search", "--max", String(max), "-j", "--", query]);
    const parsed = parseJson(res.stdout);
    if (parsed) {
      const list = Array.isArray(parsed) ? parsed : parsed.messages ?? [];
      return { ok: true, error: null, messages: list.map((m) => ({ id: m.id, labels: m.labels ?? [] })) };
    }
    if (!res.ok) return { ok: false, error: res.error ?? "gog failed", messages: [] };
    return { ok: false, error: "unparseable gog output", messages: [] };
  }

  /**
   * Positive-case instrument check: can this account be read at all? An empty
   * result still passes - the point is proving auth and connectivity before a
   * run of "not found" answers is trusted. Under cron a dead OAuth token fails
   * here instead of being stamped onto every pending message as not_found.
   */
  async function probe(account) {
    const r = await search(account, "in:anywhere");
    return r.ok ? { ok: true } : { ok: false, error: r.error };
  }

  /**
   * A message sitting in spam that we report as not_found would invert the
   * meaning of the whole report, so a miss is retried against spam and trash
   * before we accept it.
   */
  async function findByMessageId(account, messageId) {
    const bare = String(messageId).replace(/^<|>$/g, "");
    // A real RFC5322 id has no whitespace or search-operator syntax. Refusing
    // anything else keeps a stray ID from being read as a Gmail search query
    // (e.g. "x@d.com OR from:attacker") instead of an exact message lookup.
    if (!/^[^\s"()<>]+@[^\s"()<>]+$/.test(bare)) {
      return { found: false, error: "invalid message id", id: null, threadId: null, labels: [] };
    }
    let lastError = null;
    for (const query of [`rfc822msgid:${bare}`, `rfc822msgid:${bare} in:anywhere`]) {
      const r = await search(account, query);
      if (!r.ok) {
        lastError = r.error;
        continue;
      }
      if (r.message) {
        return { found: true, error: null, id: r.message.id, threadId: r.message.threadId, labels: r.message.labels ?? [] };
      }
    }
    // A miss beside a failed query is ambiguous, so the error wins: the caller
    // must not record not_found for a lookup that never really ran.
    return { found: false, error: lastError, id: null, threadId: null, labels: [] };
  }

  async function rescueFromSpam(account, id) {
    return gog(["-a", account, "gmail", "messages", "modify", id, "--remove", "SPAM", "--add", "INBOX", "-y"]);
  }

  async function markRead(account, id) {
    return gog(["-a", account, "gmail", "messages", "modify", id, "--remove", "UNREAD", "-y"]);
  }

  async function star(account, id) {
    return gog(["-a", account, "gmail", "messages", "modify", id, "--add", "STARRED", "-y"]);
  }

  async function setLabels(account, id, { add = [], remove = [] } = {}) {
    // General label change. Names or IDs both work; INBOX/SPAM/TRASH are
    // labels like any other, so rescue-then-archive composes from this.
    const args = ["-a", account, "gmail", "messages", "modify", id];
    if (add.length) args.push("--add", add.join(","));
    if (remove.length) args.push("--remove", remove.join(","));
    args.push("-y");
    return gog(args);
  }

  async function reply(account, { replyToMessageId, to, subject, body }) {
    const res = await gog([
      "-a", account, "gmail", "send",
      "--reply-to-message-id", replyToMessageId,
      "--to", to,
      "--subject", /^re:/i.test(subject) ? subject : `Re: ${subject}`,
      "--body", body,
      "-y",
    ]);
    if (!res.ok) throw new Error(`reply failed: ${res.error}`);
    return res;
  }

  return { probe, findByMessageId, list, rescueFromSpam, markRead, star, reply, setLabels };
}

/**
 * Pure, so the report can be recomputed from stored labels without Gmail.
 *
 * SPAM outranks everything: a message can carry INBOX and SPAM at once, and the
 * spam verdict is the one that matters. The Gmail tabs are kept apart from each
 * other because "delivered" is not the goal — Promotions and Updates are
 * technically the inbox, but outreach that lands there is rarely read, so
 * collapsing them into "inbox" would flatter the report.
 */
export function classify(labels) {
  const set = new Set(labels ?? []);
  if (set.has("SPAM")) return "spam";
  if (!set.has("INBOX")) return "unknown";
  if (set.has("CATEGORY_PROMOTIONS")) return "promotions";
  if (set.has("CATEGORY_UPDATES")) return "updates";
  if (set.has("CATEGORY_SOCIAL") || set.has("CATEGORY_FORUMS")) return "other_tab";
  return "primary";
}

/** Placements we are content with. Anything else needs the operator's attention. */
export const GOOD_PLACEMENTS = new Set(["primary"]);

const shared = makeGmail();
export const probe = shared.probe;
export const findByMessageId = shared.findByMessageId;
export const listMessages = shared.list;
export const rescueFromSpam = shared.rescueFromSpam;
export const markRead = shared.markRead;
export const star = shared.star;
export const reply = shared.reply;
export const setLabels = shared.setLabels;
