const API_BASE = "https://api.cloudflare.com/client/v4";
const REQUEST_TIMEOUT_MS = 20_000;

export function cfEnv(config) {
  const cf = config?.cloudflare ?? {};
  const missing = [];
  const env = {};
  for (const [key, envName] of [
    ["accountId", cf.accountIdEnv],
    ["zoneId", cf.zoneIdEnv],
    ["token", cf.tokenEnv],
  ]) {
    const value = envName ? process.env[envName] : undefined;
    if (value) env[key] = value;
    else missing.push(envName ?? `config.cloudflare.${key}Env`);
  }
  if (missing.length) {
    throw new Error(`cloudflare not configured; set: ${missing.join(", ")}`);
  }
  return env;
}

export async function sendEmail(
  env,
  { from, fromName, to, subject, text, html, headers, replyTo, attachments } = {},
) {
  requireEnv(env, ["accountId", "token"]);

  const res = await cfFetch(
    env,
    `/accounts/${env.accountId}/email/sending/send`,
    {
      method: "POST",
      body: {
        from: fromName ? { address: from, name: fromName } : from,
        to,
        subject,
        text,
        // Omitted rather than sent as null: the API answers
        // invalid_request_schema for a null html, which reads like a bad
        // address rather than a missing field.
        ...(html ? { html } : {}),
        ...(headers && Object.keys(headers).length ? { headers } : {}),
        // Sending subdomains are send-only, so replies need steering back to
        // an apex mailbox that actually receives.
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(attachments?.length ? { attachments } : {}),
      },
    },
  );

  if (!res.ok) return { ok: false, messageId: null, error: res.error };

  const errors = res.body?.errors ?? [];
  if (res.body?.success === false || errors.length) {
    const detail = errors.map((e) => e?.message).filter(Boolean).join("; ");
    return { ok: false, messageId: null, error: detail || `send rejected (HTTP ${res.status})` };
  }

  const result = res.body?.result ?? {};
  const list = (k) => (Array.isArray(result[k]) ? result[k] : []);
  const bounced = list("permanent_bounces");
  const suppressed = list("suppressed_recipients");

  // success:true is returned even when every recipient was refused, so a
  // bounce or suppression has to be read out of the result. Counting those as
  // sent would fill the placement report with mail nobody ever received.
  if (bounced.length || suppressed.length) {
    return {
      ok: false,
      messageId: result.message_id ?? null,
      error: bounced.length ? `permanently bounced: ${bounced.join(", ")}` : `suppressed: ${suppressed.join(", ")}`,
    };
  }

  // Cloudflare queues rather than delivering inline, so an empty delivered[]
  // is normal. The returned message_id is a real RFC822 Message-ID and is what
  // the seed side searches on, so a send without one cannot be measured.
  if (!list("delivered").length && !list("queued").length) {
    return { ok: false, messageId: null, error: "no recipient was accepted" };
  }
  return { ok: true, messageId: result.message_id ?? null, error: null };
}

export async function getLimits(env) {
  requireEnv(env, ["accountId", "token"]);
  const res = await cfFetch(
    env,
    `/accounts/${env.accountId}/email/sending/limits`,
  );
  return unwrap(res, "get send limits");
}

export async function listSubdomains(env) {
  requireEnv(env, ["zoneId", "token"]);
  const res = await cfFetch(
    env,
    `/zones/${env.zoneId}/email/sending/subdomains`,
  );
  return unwrap(res, "list sending subdomains");
}

export async function createSubdomain(env, name) {
  requireEnv(env, ["zoneId", "token"]);
  const res = await cfFetch(
    env,
    `/zones/${env.zoneId}/email/sending/subdomains`,
    { method: "POST", body: { name } },
  );
  return unwrap(res, "create sending subdomain");
}

export async function subdomainDns(env, id) {
  requireEnv(env, ["zoneId", "token"]);
  const res = await cfFetch(
    env,
    `/zones/${env.zoneId}/email/sending/subdomains/${encodeURIComponent(id)}/dns`,
  );
  return unwrap(res, "get subdomain DNS records");
}

// Read endpoints return `result` and throw on failure: the CLI turns thrown
// errors into one-line diagnoses. sendEmail is the exception because a failed
// send is data to record, not a fatal error.
function unwrap(res, action) {
  const errors = res.body?.errors ?? [];
  if (!res.ok || res.body?.success === false || errors.length) {
    const detail = errors
      .map((e) => e?.message)
      .filter(Boolean)
      .join("; ");
    throw new Error(
      `cloudflare ${action} failed: ${detail || res.error || `HTTP ${res.status}`}`,
    );
  }
  if (!res.body || typeof res.body !== "object") {
    throw new Error(
      `cloudflare ${action} failed: malformed response (HTTP ${res.status})`,
    );
  }
  return res.body.result;
}

// Never throws on request-level failure; callers decide what a failure means.
async function cfFetch(env, path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${env.token}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    return { ok: false, status: 0, body: null, error: describeRequestError(err) };
  }

  const raw = await res.text().catch(() => "");
  let json = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // Non-JSON bodies happen: proxies and edge nodes answer with HTML.
  }

  if (res.ok) return { ok: true, status: res.status, body: json, error: null };
  return {
    ok: false,
    status: res.status,
    body: json,
    error: describeHttpError(res.status, json, raw),
  };
}

function requireEnv(env, keys) {
  const missing = keys.filter((k) => !env?.[k]);
  if (missing.length) {
    throw new Error(
      `cloudflare env incomplete: missing ${missing.join(", ")} — build it with cfEnv(config)`,
    );
  }
}

function describeRequestError(err) {
  if (err?.name === "TimeoutError" || err?.name === "AbortError") {
    return `request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`;
  }
  const cause = err?.cause?.code ?? err?.cause?.message;
  return `request failed: ${err?.message ?? String(err)}${cause ? ` (${cause})` : ""}`;
}

function describeHttpError(status, json, raw) {
  const messages = (json?.errors ?? [])
    .map((e) => e?.message)
    .filter(Boolean);
  if (messages.length) return messages.join("; ");
  // Strip tags so an HTML error page reads as one line, not markup.
  const snippet = (raw.trim().startsWith("<")
    ? raw.replace(/<[^>]*>/g, " ")
    : raw
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return `HTTP ${status}${snippet ? ` — ${snippet}` : ""}`;
}


