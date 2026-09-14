import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * validate-newsletters.mjs runs as a script, so the classification rules are
 * re-stated here against the same inputs. These are the decisions that matter:
 * everything else in the file is I/O.
 */
const EMAIL_INPUT =
  /<input[^>]*(type=["']?email|name=["']?[^"'>]*(email|EMAIL)[^"'>]*["']?|id=["']?[^"'>]*email)/i;

function classify({ status, html = "", url = "" }) {
  if (!/^https?:\/\//i.test(url)) return { valid: false, reason: "not-http" };
  // A bot-block is not a dead page: the publisher is real and subscribable in a
  // browser, so rejecting it would throw away a good publisher.
  if (status === 403 || status === 429) return { valid: false, blocked: true, reason: "blocked" };
  if (status !== 200) return { valid: false, reason: "not-found" };
  if (/substack\.com/i.test(url)) return { valid: true, reason: "substack" };
  if (EMAIL_INPUT.test(html)) return { valid: true, reason: "form" };
  return { valid: false, reason: "no-form" };
}

describe("newsletter validation", () => {
  it("accepts a page with a type=email input", () => {
    assert.equal(classify({ status: 200, url: "https://a.com", html: '<input type="email" name="EMAIL">' }).valid, true);
  });

  it("accepts an input named email even without type=email", () => {
    assert.equal(classify({ status: 200, url: "https://a.com", html: '<input name="subscriber_email">' }).valid, true);
  });

  it("accepts a substack publication without needing a form", () => {
    assert.equal(classify({ status: 200, url: "https://x.substack.com/", html: "" }).valid, true);
  });

  it("separates a bot-block from a dead page", () => {
    // Conflating these was the original bug: four real publishers were about to
    // be discarded because a plain fetch got a 403 from their WAF.
    const blocked = classify({ status: 403, url: "https://a.com" });
    assert.equal(blocked.valid, false);
    assert.equal(blocked.blocked, true);
    assert.equal(classify({ status: 404, url: "https://a.com" }).blocked, undefined);
  });

  it("treats 429 as blocked too", () => {
    assert.equal(classify({ status: 429, url: "https://a.com" }).blocked, true);
  });

  it("rejects a page with no email input rather than guessing an endpoint", () => {
    assert.equal(classify({ status: 200, url: "https://a.com", html: "<p>hello</p>" }).reason, "no-form");
  });

  it("rejects a non-http url before fetching it", () => {
    assert.equal(classify({ status: 200, url: "file:///etc/passwd" }).reason, "not-http");
  });
});
