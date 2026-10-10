#!/usr/bin/env node
// One-time Google consent for the Postmaster Tools API. Domain verification
// is already done via the Site Verification API; this only adds the
// postmaster.readonly scope, which the stored Search Console token lacks.
//
// Run it, open the printed URL in a browser signed in as the Google account
// that owns the verifications, approve, and the local callback captures the
// code and saves a refresh token. No tokens are printed.
//
//   postmaster-auth.mjs [--google-json <path>] [--out <path>]

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, createHash } from "node:crypto";
import { homedir } from "node:os";

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const GOOGLE_JSON = flag("google-json", `${homedir()}/.config/search-console/google.json`);
const OUT = flag("out", `${homedir()}/.config/search-console/postmaster.json`);
const SCOPES = [
  "https://www.googleapis.com/auth/postmaster.readonly",
  "https://www.googleapis.com/auth/siteverification",
  "https://www.googleapis.com/auth/webmasters",
].join(" ");

const cred = JSON.parse(await readFile(GOOGLE_JSON, "utf8"));
const verifier = randomBytes(32).toString("base64url");
const challenge = createHash("sha256").update(verifier).digest("base64url");
const state = randomBytes(16).toString("hex");

const { code, redirect } = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (u.pathname !== "/callback") {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("Approved. Return to the terminal.");
    const got = { code: u.searchParams.get("code"), ok: u.searchParams.get("state") === state };
    server.close(() => (got.ok && got.code ? resolve({ ...got, redirect }) : reject(new Error("bad callback"))));
  });
  let redirect;
  server.listen(0, "127.0.0.1", () => {
    redirect = `http://127.0.0.1:${server.address().port}/callback`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: cred.client_id, redirect_uri: redirect, response_type: "code",
      scope: SCOPES, state, code_challenge: challenge, code_challenge_method: "S256",
      access_type: "offline", prompt: "consent",
    }).toString();
    console.log("\nOpen this URL in your browser and approve:\n");
    console.log(url.toString());
    console.log("\nWaiting for the callback (5 minutes)...");
  });
  setTimeout(() => reject(new Error("timed out waiting for consent")), 300_000);
});

const params = new URLSearchParams({
  client_id: cred.client_id, client_secret: cred.client_secret, code,
  redirect_uri: redirect, grant_type: "authorization_code", code_verifier: verifier,
});
const tok = await (await fetch("https://oauth2.googleapis.com/token", {
  method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: params,
})).json();
if (!tok.refresh_token) {
  console.error("exchange failed:", JSON.stringify(tok).slice(0, 300));
  process.exit(1);
}
await writeFile(OUT, JSON.stringify({
  client_id: cred.client_id, client_secret: cred.client_secret,
  refresh_token: tok.refresh_token, scopes: SCOPES,
}, null, 1), { mode: 0o600 });
console.log(`saved ${OUT} (mode 0600)`);
