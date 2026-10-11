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

  it("refuses to search on an id carrying Gmail operator syntax", async () => {
    const exec = fakeExec([msg(["INBOX"])]);
    const r = await makeGmail(exec).findByMessageId("acct", "x@d.com OR from:attacker.evil");
    assert.equal(r.found, false);
    assert.equal(exec.calls.length, 0);
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

  it("surfaces the lookup error instead of reporting a clean miss", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "No auth for gmail acct" });
    const r = await makeGmail(fakeExec([err, err])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, false);
    assert.match(r.error, /No auth/);
  });

  it("still reports a clean miss only when every query ran", async () => {
    const r = await makeGmail(fakeExec([none, none])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, false);
    assert.equal(r.error, null);
  });

  it("recovers a hit on the spam retry after the first query fails", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "flake" });
    const r = await makeGmail(fakeExec([err, msg(["SPAM"])])).findByMessageId("acct", "abc@d.com");
    assert.equal(r.found, true);
  });
});

describe("probe", () => {
  it("passes on any parseable answer, including an empty mailbox", async () => {
    const r = await makeGmail(fakeExec([none])).probe("acct");
    assert.equal(r.ok, true);
  });

  it("fails when gog cannot reach the account, so absence is never trusted", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "No auth for gmail acct" });
    const r = await makeGmail(fakeExec([err])).probe("acct");
    assert.equal(r.ok, false);
    assert.match(r.error, /No auth/);
  });

  it("asks for one message anywhere, not a query that can miss a live mailbox", async () => {
    const exec = fakeExec([none]);
    await makeGmail(exec).probe("acct");
    assert.ok(exec.calls[0].args.some((a) => a.includes("in:anywhere")));
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

  it("star adds STARRED", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).star("acct", "m1");
    const a = exec.calls[0].args;
    assert.ok(a.includes("--add") && a.includes("STARRED"));
  });

  it("reply threads onto the original and prefixes the subject once", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).reply("acct", { replyToMessageId: "m1", to: "x@y.z", subject: "Re: Hi", body: "ok" });
    const a = exec.calls[0].args;
    assert.ok(a.includes("--reply-to-message-id") && a.includes("m1"));
    assert.equal(a[a.indexOf("--subject") + 1], "Re: Hi");
  });

  it("reply does not double-prefix a lowercase re: subject", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).reply("acct", { replyToMessageId: "m1", to: "x@y.z", subject: "re: Hi", body: "ok" });
    const a = exec.calls[0].args;
    assert.equal(a[a.indexOf("--subject") + 1], "re: Hi");
  });

  it("reply surfaces a failure instead of silently doing nothing", async () => {
    const err = Object.assign(new Error("boom"), { stdout: "", stderr: "send blocked" });
    await assert.rejects(
      () => makeGmail(fakeExec([err])).reply("acct", { replyToMessageId: "m1", to: "x@y.z", subject: "s", body: "b" }),
      /reply failed/,
    );
  });

  it("setLabels adds and removes in one modify call", async () => {
    const exec = fakeExec(["{}"]);
    await makeGmail(exec).setLabels("acct", "m1", { add: ["warmup"], remove: ["INBOX"] });
    const a = exec.calls[0].args;
    assert.equal(a[a.indexOf("--add") + 1], "warmup");
    assert.equal(a[a.indexOf("--remove") + 1], "INBOX");
  });

  it("list returns id+labels hits and reports lookup failure distinctly", async () => {
    const exec = fakeExec([JSON.stringify({ messages: [{ id: "m1", labels: ["SPAM"] }, { id: "m2" }] })]);
    const r = await makeGmail(exec).list("acct", "in:spam", 10);
    assert.equal(r.ok, true);
    assert.deepEqual(r.messages, [{ id: "m1", labels: ["SPAM"] }, { id: "m2", labels: [] }]);
    assert.equal(exec.calls[0].args[exec.calls[0].args.indexOf("--max") + 1], "10");
  });
});

describe("search separator", () => {
  it("puts -- before the query so a leading dash cannot parse as a flag", async () => {
    const exec = fakeExec([none]);
    await makeGmail(exec).list("acct", "-to:x@y.z in:spam", 5);
    const a = exec.calls[0].args;
    assert.equal(a[a.length - 2], "--");
    assert.equal(a[a.length - 1], "-to:x@y.z in:spam");
  });

  it("keeps flags ahead of -- on the findByMessageId path too", async () => {
    const exec = fakeExec([none, none]);
    await makeGmail(exec).findByMessageId("acct", "abc@d.com");
    for (const c of exec.calls) {
      assert.ok(c.args.indexOf("--") > c.args.indexOf("-j"));
    }
  });
});
