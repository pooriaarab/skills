import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * reply-inbound.mjs runs as a script, so its two decisions that carry risk are
 * restated here against the same inputs: who is safe to answer, and how the
 * reply threads.
 */
const sanitize = (v) => String(v ?? "").replace(/[\r\n\0]+/g, " ").trim();
const wrapId = (id) => (id.startsWith("<") ? id : `<${id}>`);

function threadHeaders(row) {
  const parent = sanitize(row.message_id);
  if (!parent) return null;
  let prior = [];
  try {
    const p = JSON.parse(row.references_json ?? "[]");
    if (Array.isArray(p)) prior = p.filter((x) => typeof x === "string" && x);
  } catch { prior = []; }
  const refs = [...new Set([...prior.map(sanitize), parent])].map(wrapId);
  while (refs.length > 1 && refs.join(" ").length > 2048) refs.shift();
  return { "In-Reply-To": wrapId(parent), References: refs.join(" ") };
}

const ours = new Set(["hello@a.com"]);
const answerable = (from) =>
  Boolean(from) && !ours.has(from.toLowerCase()) &&
  !/mailer-daemon|postmaster|no-?reply|bounce/.test(from.toLowerCase());

describe("who gets answered", () => {
  it("answers a real correspondent", () => assert.equal(answerable("someone@gmail.com"), true));

  it("never answers our own address", () => {
    // Replying to ourselves would loop: the reply arrives inbound and qualifies
    // for a reply of its own.
    assert.equal(answerable("hello@a.com"), false);
  });

  it("never answers a bounce or a no-reply", () => {
    for (const f of ["mailer-daemon@x.com", "postmaster@x.com", "no-reply@x.com", "noreply@x.com", "bounces@x.com"]) {
      assert.equal(answerable(f), false, `${f} should not be answered`);
    }
  });

  it("ignores case when matching", () => assert.equal(answerable("MAILER-DAEMON@x.com"), false));
});

describe("threading", () => {
  it("sets In-Reply-To to the parent and puts the parent last in References", () => {
    const h = threadHeaders({ message_id: "b@x", references_json: '["a@x"]' });
    assert.equal(h["In-Reply-To"], "<b@x>");
    assert.equal(h.References, "<a@x> <b@x>");
  });

  it("strips CR and LF from a header taken off inbound mail", () => {
    // A crafted inbound Message-ID would otherwise inject headers into the
    // outbound reply.
    const h = threadHeaders({ message_id: "b@x\r\nBcc: evil@corp", references_json: "[]" });
    assert.ok(!h["In-Reply-To"].includes("\n") && !h["In-Reply-To"].includes("\r"));
    assert.ok(!h.References.includes("Bcc:\n"));
  });

  it("survives malformed references json", () => {
    assert.equal(threadHeaders({ message_id: "b@x", references_json: "{oops" }).References, "<b@x>");
  });

  it("returns null when there is no message id to thread against", () => {
    assert.equal(threadHeaders({ message_id: "", references_json: "[]" }), null);
  });

  it("trims the oldest references to stay under the provider header cap", () => {
    // A rejected send is worse than a trimmed history the reader already has.
    const many = Array.from({ length: 200 }, (_, i) => `id${i}@averylongdomainname.example.com`);
    const h = threadHeaders({ message_id: "last@x", references_json: JSON.stringify(many) });
    assert.ok(h.References.length <= 2048);
    assert.ok(h.References.endsWith("<last@x>"));
  });

  it("does not duplicate the parent when it already appears in references", () => {
    const h = threadHeaders({ message_id: "b@x", references_json: '["a@x","b@x"]' });
    assert.equal(h.References, "<a@x> <b@x>");
  });
});
