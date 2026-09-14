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

  async function search(account, query) {
    const res = await gog(["-a", account, "gmail", "messages", "search", query, "--max", "1", "-j"]);
    return firstMessage(parseJson(res.stdout));
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
      return { found: false, id: null, threadId: null, labels: [] };
    }
    for (const query of [`rfc822msgid:${bare}`, `rfc822msgid:${bare} in:anywhere`]) {
      const m = await search(account, query);
      if (m) {
        return { found: true, id: m.id, threadId: m.threadId, labels: m.labels ?? [] };
      }
    }
    return { found: false, id: null, threadId: null, labels: [] };
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

  async function reply(account, { replyToMessageId, to, subject, body }) {
    const res = await gog([
      "-a", account, "gmail", "send",
      "--reply-to-message-id", replyToMessageId,
      "--to", to,
      "--subject", subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      "--body", body,
      "-y",
    ]);
    if (!res.ok) throw new Error(`reply failed: ${res.error}`);
    return res;
  }

  return { findByMessageId, rescueFromSpam, markRead, star, reply };
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
export const findByMessageId = shared.findByMessageId;
export const rescueFromSpam = shared.rescueFromSpam;
export const markRead = shared.markRead;
export const star = shared.star;
export const reply = shared.reply;
