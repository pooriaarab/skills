---
name: notion-integration
description: "Build, run, and submit a native Notion integration (a service under integrations/notion-integration/ built on the Notion API via @notionhq/client, distributed as a public OAuth integration) and get it listed in the Notion integration gallery. Use when creating a new Notion integration, wiring a 'Notion database → your product' sync, exchanging an OAuth code for a workspace token, debugging a database query that returns nothing or a write that fails validation, or figuring out why gallery submission bounces. Covers the whole path plus the traps that each cost a round-trip: internal vs public integrations (internal tokens are one-workspace, can never be listed, and can't be converted), the API only sees pages explicitly granted to the integration, status-vs-select filters and writes differ by property type, Notion does not auto-create status options via the API, and every property value is a typed envelope you must unwrap. Sibling of the other integration skills (canva-app, zapier-integration, figma-plugin, browser-extension, connector-directory-submission). Distinct from note-organizing skills — this is the Notion platform API + marketplace path. Triggers: 'build a Notion integration', 'Notion OAuth', 'public Notion integration', 'notion.so/integrations', 'query a Notion database', 'Notion API object_not_found', 'submit to the Notion integration gallery'."
---

# Building a Notion integration

A Notion integration is a **service that talks to the Notion API** (`https://api.notion.com/v1`), almost always via the official SDK **`@notionhq/client`**. Source lives in `integrations/notion-integration/`. It is a thin layer between Notion and your product's SDK / public REST API — Notion supplies content and database structure; your API supplies the business logic. Read this before the first file; the command-level playbook is `pooriaarab/scripts` `scripts/notion-integration/README.md`.

## The trap that wastes a day: internal vs public integration

Notion has two integration kinds and they are **not interchangeable**:

- **Internal** — a secret token created at `https://www.notion.so/my-integrations`, good for ONE workspace (yours). No OAuth, no distribution, and it **can never be listed in the gallery**. There is no internal→public conversion.
- **Public** — OAuth 2.0 with a client id + secret and registered redirect URIs. Any workspace can install it; this is the only kind the gallery accepts.

**Rule:** if there is any chance the integration ships to users or the gallery, start **public** from the first file. Each user authorizes via OAuth (`GET https://api.notion.com/v1/oauth/authorize` with `response_type=code` and `owner=user`); you exchange the code once (`client.oauth.token`) and store the returned access token per workspace. Building the v1 on an internal token "because it's simpler" means rebuilding auth the day you decide to distribute.

Each install is one exchange:

```ts
// Start: https://api.notion.com/v1/oauth/authorize?client_id=…&response_type=code&owner=user&redirect_uri=…
const token = await new Client().oauth.token({
  client_id: clientId,
  client_secret: clientSecret,
  grant_type: "authorization_code",
  code,
  redirect_uri: redirectUri, // must byte-match a registered URI
});
// Store token.access_token + token.workspace_id — there is no refresh token.
```

## The other traps (each costs a round-trip)

1. **"Connected" ≠ "can see it."** The API only returns content explicitly granted to the integration. Internal: share the page/database via its `…` menu → Connections. Public OAuth: the user picks pages on the consent screen. Querying an un-granted database fails with `object_not_found` or returns empty — it looks like a bad id; it is a permissions gap.
2. **status vs select differ everywhere.** A status-ish column may be property type `status` or `select`; the query filter (`{ status: { equals: … } }` vs `{ select: { equals: … } }`) and the write-back payload differ. Detect the type first via `databases.retrieve` → `properties[name].type`, then branch.
3. **Status options are NOT auto-created.** Writing `{ status: { name: "Ready" } }` to a status property that lacks a "Ready" option fails validation. Create the options in Notion first. (Select options ARE auto-created on write — one reason templates use select.)
4. **Every property value is a typed envelope.** No flat strings: title → `title[]`, text → `rich_text[]` (join the parts' `plain_text`), multi_select → `[{ name }]`, date → `{ start }`. Unwrap per type. A single rich-text part caps at 2000 chars — truncate before writing. Query results paginate at 100 — loop with `has_more` / `start_cursor`.
5. **The redirect URI must match byte-for-byte.** The URI sent at authorize time and at token exchange must be one registered on the integration (scheme, host, path). `localhost` works for dev; production needs public HTTPS.
6. **No refresh token; ~3 req/s rate limit.** Access tokens don't expire — store them; a 401 means the workspace uninstalled, so re-auth. Back off on 429 using `Retry-After`. The SDK pins the `Notion-Version` header for you; raw REST callers must send it themselves.

## Build path

```bash
cd integrations/notion-integration
cp .env.example .env   # NOTION_CLIENT_ID / NOTION_CLIENT_SECRET / NOTION_REDIRECT_URI
npm install
npm run dev            # serves the OAuth routes + sync loop on localhost
```

- SDK: `@notionhq/client`. `new Client({ auth: token })` per stored workspace token; `new Client()` (no auth) for the OAuth exchange.
- HTTP routes you almost always need: `GET /oauth/install` (redirect to the authorize URL), `GET /oauth/callback` (exchange code, store token + workspace name), a manual "run sync now" route, `GET /health`.
- Database sync pattern: `databases.query` with a status/select filter → unwrap properties into a flat row → hand the row to your API → `pages.update` to write the result (status, id, URL, error) back onto the row. Skip rows whose result-id property is already set, so re-runs are safe.
- Sync is poll-based: a loop on an interval, or a cron-fired single pass. Don't design around event delivery — TBD: confirm current webhook support before relying on it.
- Make property names and status values env-configurable (`PROP_*`, `STATUS_*`) — every workspace's database template differs.
- Keep all business logic server-side on your API; the integration is a thin client holding tokens. Gitignore the token/state store.

## Submission — Notion integration gallery

**Bucket: public-integration review, free.** Steps:

1. Create a **public** integration at `https://www.notion.so/my-integrations`; set the name, description, and a square icon (PNG, ≥250×250 — TBD: confirm exact spec at first submission).
2. Request only the capabilities the code actually calls (read/update/insert content, optional user info) — reviewers check scope usage against real calls.
3. Host the service at a public HTTPS URL and register `https://<your-domain>/oauth/callback` as a redirect URI.
4. Prepare review materials: a test workspace, a demo video or screenshots of the OAuth flow plus one real end-to-end sync, and a support contact email.
5. Submit from the integration's settings page (**Distribution → Submit for review**).
6. After approval, list it in the gallery at `https://www.notion.so/integrations`, linking the public integration (TBD — confirm the current listing form at first submission).

**Silent-rejection gotchas:** trying to distribute an internal integration (impossible — must be public); capabilities requested but never exercised; a redirect URI that doesn't match what the hosted OAuth flow actually sends; setup instructions that don't tell the installing user WHICH databases to pick on the consent screen (that picker IS the access grant — skip it and the sync silently sees nothing); no way for a reviewer to watch a real sync succeed from a clean workspace.

## Parity checklist (prove against a real workspace before submitting)

OAuth install from a clean browser · query returns only granted rows · a row round-trips to your API · the result is written back onto the row (status + id + URL + error) · a re-run skips already-synced rows · an un-shared database produces a clear error, not a hang.

## Related skills

- `canva-app` / `figma-plugin` — the same "platform content → your API" shape on design tools; different sandbox rules.
- `zapier-integration` — the no-OAuth-server alternative when a connector alone suffices.
- `connector-directory-submission` — the cross-marketplace submission router.
