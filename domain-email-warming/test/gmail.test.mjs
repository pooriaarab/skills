import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classify, makeGmail } from "../scripts/lib/gmail.mjs";

/** Records the argv of every call so we can assert no shell string is built. */
function fakeExec(responses) {
  const calls = [];
  const exec = async (bin, args) => {
    calls.push({ bin, args });
    const r = responses.shift();
    if (r === undefined) return { stdout: "" };
    if (r instanceof Error) throw r;
    return { stdout: r };
  };
  exec.calls = calls;
  return exec;
}

const msg = (labels, id = "m1") => JSON.stringify({ messages: [{ id, threadId: "t1", labels }] });
const none = JSON.stringify({ messages: [] });

describe("classify", () => {
  it("treats spam as spam even when INBOX is also present", () => {
    assert.equal(classify(["INBOX", "SPAM"]), "spam");
  });

  it("separates the Gmail tabs, because Promotions is not the inbox that matters", () => {
    assert.equal(classify(["INBOX", "CATEGORY_PROMOTIONS"]), "promotions");
    assert.equal(classify(["INBOX", "CATEGORY_UPDATES"]), "updates");
    assert.equal(classify(["INBOX", "CATEGORY_SOCIAL"]), "other_tab");
  });

  it("reports a plain or personal inbox message as primary", () => {
    assert.equal(classify(["INBOX", "UNREAD"]), "primary");
    assert.equal(classify(["INBOX", "CATEGORY_PERSONAL"]), "primary");
  });

  it("is unknown when the message is in no inbox at all", () => {
    assert.equal(classify(["UNREAD"]), "unknown");
    assert.equal(classify([]), "unknown");
    assert.equal(classify(undefined), "unknown");
  });
});

describe("findByMessageId", () => {
  it("strips angle brackets before searching", async () => {
    const exec = fakeExec([msg(["INBOX"])]);
    await makeGmail(exec).findByMessageId("acct", "<abc@d.com>");
    assert.ok(exec.calls[0].args.includes("rfc822msgid:abc@d.com"));
  });

  it("passes arguments as an array so a quoted subject cannot break out", async () => {
    const exec = fakeExec([msg(["INBOX"])]);
    await makeGmail(exec).findByMessageId("acct", "abc@d.com");
    assert.equal(exec.calls[0].bin, "gog");
    assert.ok(Array.isArray(exec.calls[0].args));
  });

  it("retries against spam and trash before giving up", async () => {
    // Reporting a message that is sitting in spam as not_found would invert
    // the meaning of the whole placement report.
    const exec = fakeExec([none, msg(["SPAM"])]);
    const r = await makeGmail(exec).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, true);
    assert.equal(classify(r.labels), "spam");
    assert.equal(exec.calls.length, 2);
    assert.ok(exec.calls[1].args.some((a) => a.includes("in:anywhere")));
  });

  it("reports not found only when both queries miss", async () => {
    const r = await makeGmail(fakeExec([none, none])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, false);
    assert.deepEqual(r.labels, []);
  });

  it("tolerates a non-JSON preamble line before the payload", async () => {
    const exec = fakeExec([`Using keyring backend: keychain\n${msg(["INBOX"])}`]);
    const r = await makeGmail(exec).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, true);
  });

  it("does not throw on malformed JSON", async () => {
    const r = await makeGmail(fakeExec(["{broken", "{broken"])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, false);
  });

  it("does not throw when gog exits non-zero", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "auth failed" });
    const r = await makeGmail(fakeExec([err, err])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, false);
  });
});

describe("mutations", () => {
  it("rescueFromSpam removes SPAM and restores INBOX", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).rescueFromSpam("acct", "m1");
    const a = exec.calls[0].args;
    assert.ok(a.includes("--remove") && a.includes("SPAM"));
    assert.ok(a.includes("--add") && a.includes("INBOX"));
  });

  it("markRead clears UNREAD", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).markRead("acct", "m1");
    assert.ok(exec.calls[0].args.includes("UNREAD"));
  });

  it("reply threads onto the original and prefixes the subject once", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).reply("acct", { replyToMessageId: "m1", to: "x@y.z", subject: "Re: Hi", body: "ok" });
    const a = exec.calls[0].args;
    assert.ok(a.includes("--reply-to-message-id") && a.includes("m1"));
    assert.equal(a[a.indexOf("--subject") + 1], "Re: Hi");
  });

  it("reply surfaces a failure instead of silently doing nothing", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "send blocked" });
    await assert.rejects(
      () => makeGmail(fakeExec([err])).reply("acct", { replyToMessageId: "m1", to: "x@y.z", subject: "s", body: "b" }),
      /reply failed/,
    );
  });
});
