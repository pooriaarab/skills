import { afterEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import {
  cfEnv,
  createSubdomain,
  getLimits,
  listSubdomains,
  sendEmail,
  subdomainDns,
} from "../scripts/lib/cloudflare.mjs";

const ENV = { accountId: "acct-1", zoneId: "zone-1", token: "test-token" };
const SEND_ARGS = {
  from: "hello@imecore.com",
  fromName: "IMECore",
  to: "seed@example.com",
  subject: "Tuesday sync",
  text: "Are we still on for Tuesday?",
  html: "<p>Are we still on for Tuesday?</p>",
  headers: { "Message-ID": "<m1@imecore.com>" },
};
const BASE = "https://api.cloudflare.com/client/v4";

function stubFetch(impl) {
  const calls = [];
  mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url: String(url), init });
    return impl(url, init);
  });
  return calls;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => mock.restoreAll());

test("cfEnv reads the three configured env vars", () => {
  const cfg = {
    cloudflare: {
      accountIdEnv: "WARM_T_ACCT",
      zoneIdEnv: "WARM_T_ZONE",
      tokenEnv: "WARM_T_TOKEN",
    },
  };
  process.env.WARM_T_ACCT = "a";
  process.env.WARM_T_ZONE = "z";
  process.env.WARM_T_TOKEN = "s3cr3t";
  try {
    assert.deepEqual(cfEnv(cfg), {
      accountId: "a",
      zoneId: "z",
      token: "s3cr3t",
    });
  } finally {
    delete process.env.WARM_T_ACCT;
    delete process.env.WARM_T_ZONE;
    delete process.env.WARM_T_TOKEN;
  }
});

test("cfEnv throws naming the missing vars, never the token value", () => {
  const cfg = {
    cloudflare: {
      accountIdEnv: "WARM_T_ACCT",
      zoneIdEnv: "WARM_T_ZONE",
      tokenEnv: "WARM_T_TOKEN",
    },
  };
  process.env.WARM_T_TOKEN = "s3cr3t";
  try {
    assert.throws(
      () => cfEnv(cfg),
      (err) => {
        assert.match(err.message, /WARM_T_ACCT/);
        assert.match(err.message, /WARM_T_ZONE/);
        assert.doesNotMatch(err.message, /s3cr3t/);
        return true;
      },
    );
  } finally {
    delete process.env.WARM_T_TOKEN;
  }
});

test("sendEmail posts to the send endpoint and reports ok", async () => {
  const calls = stubFetch(() =>
    jsonResponse(200, {
      success: true,
      errors: [],
      messages: [],
      result: {
        delivered: ["seed@example.com"],
        permanent_bounces: [],
        queued: [],
      },
    }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.deepEqual(res, { ok: true, messageId: null, error: null });
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(
    url,
    `${BASE}/accounts/acct-1/email/sending/send`,
  );
  assert.equal(init.method, "POST");
  assert.equal(init.headers.authorization, "Bearer test-token");
  assert.ok(init.signal instanceof AbortSignal);
  const body = JSON.parse(init.body);
  assert.deepEqual(body.from, { address: "hello@imecore.com", name: "IMECore" });
  assert.equal(body.to, "seed@example.com");
  assert.equal(body.subject, "Tuesday sync");
  assert.equal(body.headers["Message-ID"], "<m1@imecore.com>");
});

test("sendEmail treats a 200 carrying errors[] as not ok", async () => {
  stubFetch(() =>
    jsonResponse(200, {
      success: false,
      errors: [{ code: 1000, message: "Sender domain not verified" }],
      result: null,
    }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.equal(res.messageId, null);
  assert.match(res.error, /Sender domain not verified/);
});

test("sendEmail surfaces API error messages on a non-200 JSON body", async () => {
  stubFetch(() =>
    jsonResponse(400, {
      success: false,
      errors: [{ code: 1001, message: "Invalid recipient address" }],
      result: null,
    }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.match(res.error, /Invalid recipient address/);
});

test("sendEmail does not crash on a non-JSON proxy error page", async () => {
  stubFetch(
    () =>
      new Response("<html><body><h1>502 Bad Gateway</h1></body></html>", {
        status: 502,
        headers: { "content-type": "text/html" },
      }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.equal(res.messageId, null);
  assert.match(res.error, /502/);
});

test("sendEmail does not report success on a non-JSON 200 body", async () => {
  stubFetch(
    () =>
      new Response("<html><body>ok</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.equal(res.messageId, null);
  assert.match(res.error, /malformed response/);
});

test("sendEmail reports both bounced and suppressed recipients", async () => {
  stubFetch(() =>
    jsonResponse(200, {
      success: true,
      errors: [],
      result: {
        permanent_bounces: ["bounced@example.com"],
        suppressed_recipients: ["suppressed@example.com"],
      },
    }),
  );
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.match(res.error, /permanently bounced: bounced@example\.com/);
  assert.match(res.error, /suppressed: suppressed@example\.com/);
});

test("sendEmail converts a request timeout into ok:false", async () => {
  stubFetch(() => {
    throw new DOMException("The operation timed out.", "TimeoutError");
  });
  const res = await sendEmail(ENV, SEND_ARGS);
  assert.equal(res.ok, false);
  assert.match(res.error, /timed out/i);
});

test("sendEmail throws only when the environment is unconfigured", async () => {
  await assert.rejects(
    sendEmail({ accountId: "", zoneId: "", token: "" }, SEND_ARGS),
    /env incomplete/,
  );
});

test("getLimits returns the quota/usage result", async () => {
  const result = {
    quota: { value: 200, unit: "messages" },
    usage: { sent: 12, over_quota: false, resets_at: "2026-09-15T00:00:00Z" },
  };
  const calls = stubFetch(() =>
    jsonResponse(200, { success: true, errors: [], result }),
  );
  assert.deepEqual(await getLimits(ENV), result);
  assert.equal(calls[0].init.method, "GET");
  assert.equal(
    calls[0].url,
    `${BASE}/accounts/acct-1/email/sending/limits`,
  );
});

test("getLimits throws a readable error on API failure", async () => {
  stubFetch(() =>
    jsonResponse(401, {
      success: false,
      errors: [{ code: 9109, message: "Invalid API Token" }],
    }),
  );
  await assert.rejects(getLimits(ENV), /Invalid API Token/);
});

test("listSubdomains returns the result list", async () => {
  const result = [{ tag: "t1", name: "mail.imecore.com", enabled: true }];
  const calls = stubFetch(() =>
    jsonResponse(200, { success: true, errors: [], result }),
  );
  assert.deepEqual(await listSubdomains(ENV), result);
  assert.equal(
    calls[0].url,
    `${BASE}/zones/zone-1/email/sending/subdomains`,
  );
});

test("createSubdomain posts the subdomain name", async () => {
  const result = { tag: "t9", name: "mail.imecore.com", enabled: true };
  const calls = stubFetch(() =>
    jsonResponse(200, { success: true, errors: [], result }),
  );
  assert.deepEqual(await createSubdomain(ENV, "mail.imecore.com"), result);
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    name: "mail.imecore.com",
  });
});

test("subdomainDns fetches dns for the subdomain id", async () => {
  const result = { records: [{ type: "TXT", name: "mail.imecore.com" }] };
  const calls = stubFetch(() =>
    jsonResponse(200, { success: true, errors: [], result }),
  );
  assert.deepEqual(await subdomainDns(ENV, "t9"), result);
  assert.equal(
    calls[0].url,
    `${BASE}/zones/zone-1/email/sending/subdomains/t9/dns`,
  );
});
