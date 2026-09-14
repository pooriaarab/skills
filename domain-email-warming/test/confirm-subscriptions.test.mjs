import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Mirrors the link rules in confirm-subscriptions.mjs, which runs as a script. */
const DENY = /(unsubscribe|opt[\s-]?out|remove|preferences|manage|profile|forward|report)/i;
const ALLOW = /(confirm|verify|activate|subscribe|optin|opt-in|double)/i;
const CONFIRM_SUBJECT = /(confirm|verify|activate|opt[\s-]?in|subscription|subscribe)/i;

function decodeQuotedPrintable(body) {
  return body.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function linkIntent(u) {
  try {
    const parsed = new URL(u);
    return parsed.pathname + parsed.search;
  } catch {
    return u;
  }
}

function extractLinks(raw) {
  const text = decodeQuotedPrintable(raw);
  const urls = new Set();
  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]]+/g)) urls.add(m[0].replace(/[.,;:]+$/, ""));
  return [...urls].filter((u) => {
    const intent = linkIntent(u);
    return !DENY.test(intent) && ALLOW.test(intent);
  });
}

describe("confirmation link extraction", () => {
  it("finds a confirmation link", () => {
    assert.deepEqual(extractLinks("click https://a.com/confirm?t=1 now"), ["https://a.com/confirm?t=1"]);
  });

  it("never returns an unsubscribe link", () => {
    // Following one would undo the subscription we are trying to complete.
    assert.deepEqual(extractLinks("https://a.com/unsubscribe?t=1"), []);
  });

  it("prefers the confirm link when both are present", () => {
    const links = extractLinks("yes https://a.com/confirm/9 no https://a.com/unsubscribe/9");
    assert.deepEqual(links, ["https://a.com/confirm/9"]);
  });

  it("rejoins a link split across lines by quoted-printable", () => {
    // A URL broken with a trailing "=" yields half a link that 404s, which
    // reads like the publisher's fault rather than ours.
    assert.deepEqual(extractLinks("https://a.com/con=\r\nfirm?t=3D1"), ["https://a.com/confirm?t=1"]);
  });

  it("ignores a link that says nothing about confirming", () => {
    assert.deepEqual(extractLinks("https://a.com/article/123"), []);
  });

  it("strips trailing punctuation", () => {
    assert.deepEqual(extractLinks("go to https://a.com/verify/1."), ["https://a.com/verify/1"]);
  });

  it("matches confirmation-shaped subjects and not ordinary ones", () => {
    assert.ok(CONFIRM_SUBJECT.test("Please confirm your subscription"));
    assert.ok(CONFIRM_SUBJECT.test("Verify your email"));
    assert.ok(!CONFIRM_SUBJECT.test("Your weekly digest"));
  });

  it("keeps a Mailchimp confirm link even though the ESP host contains \"manage\"", () => {
    // list-manage.com is Mailchimp's own ESP domain. A deny check against the
    // full URL would veto every Mailchimp confirmation link on that account.
    assert.deepEqual(
      extractLinks("https://example.list-manage.com/subscribe/confirm?u=1&id=2"),
      ["https://example.list-manage.com/subscribe/confirm?u=1&id=2"],
    );
  });
});
