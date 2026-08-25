---
name: deploy-app-cloudflare
description: "Deploy a containerized web app to Cloudflare Workers (plus the container/Cloudchamber wrapper) with D1, R2, KV, Queues, and Durable Objects, then smoke-test the live URL. Use when shipping a full app bundle that exceeds the Worker 10MB limit, wiring Cloudflare storage/queue/DO adapters, or running a wrangler container deploy. Triggers: 'deploy to cloudflare', 'wrangler deploy', 'cloudflare workers container', 'Cloudchamber', 'D1/R2/Queues', 'wrangler.containers.jsonc'."
---

# Deploy a containerized web app to Cloudflare

Generic runbook for putting a containerized web app on **Cloudflare Workers + the container ("Cloudchamber") wrapper**, with **D1, R2, KV, Queues, and Durable Objects**, then proving it is live. Not tied to any one repo.

Cloudflare is typically a **live home**, not a throwaway sandbox. Prefer separate **staging vs production** configs (or `env.staging` / `env.production`) and treat a successful deploy as something that stays up.

## 1. Prerequisites

- `wrangler` CLI (`npm i -g wrangler` or a project-local `npx wrangler`)
- Docker (needed to build the container image)
- A Cloudflare account
- Auth: `wrangler login` (or a scoped API token in CI)

Confirm you are in the right account before creating anything:

```bash
wrangler whoami
```

Use placeholders only in configs and docs: `YOUR_ACCOUNT_ID`, `<worker-name>`, `<image>`, `your-app.workers.dev`. Never commit account IDs, API tokens, or real resource UUIDs.

## 2. Adapter flags and bindings

The app selects Cloudflare adapters with env flags (names vary; these are the usual pattern):

| Flag | Meaning |
|------|---------|
| `CF_STORAGE_BACKEND=d1` | Relational / SQL store → D1 |
| `CF_BLOB_BACKEND=r2` | Object / blob store → R2 |
| `CF_QUEUES=1` | Background jobs → Queues |
| `CF_*_DO` | Coordination / long-lived state → Durable Objects |

`wrangler.jsonc` (and/or `wrangler.containers.jsonc`) **declares the bindings** the Worker and container see at runtime:

- D1 database
- R2 buckets
- KV namespace
- Queues (+ DLQs)
- Durable Object classes + migrations
- Cron triggers

Bindings are how the process reaches those resources. Creating a D1/R2/KV/Queue in the dashboard is not enough — the IDs must land in the wrangler config the deploy uses.

## 3. Provision resources (once)

**List first.** Resources may already exist; creating a second copy and pointing config at the empty one is a common outage.

```bash
wrangler d1 list
wrangler r2 bucket list
wrangler kv namespace list
wrangler queues list
```

Create only what is missing:

```bash
wrangler d1 create <name>
wrangler r2 bucket create <name>
wrangler kv namespace create <name>
wrangler queues create <name>
wrangler queues create <name>-dlq   # if the app uses a DLQ
```

Put the returned IDs into `wrangler.jsonc` / `wrangler.containers.jsonc` (and the matching staging/prod env blocks). Do not invent IDs.

Typical binding shape (placeholders only):

```jsonc
{
  "name": "<worker-name>",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<d1-name>",
      "database_id": "<d1-id>"
    }
  ],
  "r2_buckets": [
    { "binding": "BLOBS", "bucket_name": "<r2-bucket>" }
  ],
  "kv_namespaces": [
    { "binding": "KV", "id": "<kv-id>" }
  ],
  "queues": {
    "producers": [{ "binding": "QUEUE", "queue": "<queue-name>" }],
    "consumers": [
      {
        "queue": "<queue-name>",
        "max_retries": 3,
        "dead_letter_queue": "<queue-name>-dlq"
      }
    ]
  },
  "durable_objects": {
    "bindings": [{ "name": "APP_CONTAINER", "class_name": "AppContainer" }]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["AppContainer"] }
  ],
  "triggers": { "crons": ["0 * * * *"] }
}
```

Keep staging and production as **separate resource sets** (or at least separate Worker names + D1/R2/KV/Queues). Do not point staging at prod D1.

## 4. Why a container, and how to deploy it

A full app bundle (framework server + client assets) often **exceeds the Worker 10MB script limit**. The usual pattern is to wrap the app in a Cloudflare **container** — an `AppContainer` Durable Object — and deploy that via a dedicated config:

- Worker script: thin router / binding surface
- Container image: the actual app
- Config: `wrangler.containers.jsonc`

### Build the image

Run the project's standalone container build (`build-container.sh`-style). Set any `NEXT_PUBLIC_*` (or equivalent public) flags **at image-build time** so they inline into the client bundle. Runtime env will not rewrite already-bundled client code.

Tag the image **immutably**. Do not deploy `:latest` — Cloudflare will not roll a new revision if the tag string did not change.

```bash
# example — use the repo's real build script
./build-container.sh
# produces something like: <image>:<git-sha>
```

### Scan configs, then deploy

```bash
# GOTCHA — do this before every deploy (see §6)
grep -nE '^\s*,\s*$' wrangler*.jsonc

wrangler deploy --config wrangler.containers.jsonc --autoconfig=false
```

`--autoconfig=false` avoids interactive prompts (required in CI).

Deploy output prints the live URL, typically:

```
https://<worker-name>.<subdomain>.workers.dev
```

## 5. Smoke test

Use the URL from deploy output. Do not guess the hostname.

```bash
BASE="https://<worker-name>.<subdomain>.workers.dev"

curl -fsS -o /dev/null -w "%{http_code}\n" "$BASE/health"   # or the app's health path
curl -fsS -o /dev/null -w "%{http_code}\n" "$BASE/"
curl -fsS -o /dev/null -w "%{http_code}\n" "$BASE/login"
```

Expect **200** on health, `/`, and `/login` (adjust `/login` if the app has no public login route).

**D1** — tables exist remotely:

```bash
wrangler d1 execute <d1-name> --remote --command \
  "SELECT name FROM sqlite_master WHERE type='table'"
```

The result should list the app's tables, not an empty schema.

**R2 / KV / Queues** — confirm bindings resolve:

- Health payload field listing bound services, **or**
- A single write + read (put an object / KV key, enqueue a no-op and see it land)

If health is 200 but D1 has no tables, the Worker is up and the datastore is the wrong (or never-migrated) database.

## 6. Gotchas (read before you deploy)

### Stray / doubled comma → `ValueExpected` (blocks the whole deploy)

A lone comma in a `wrangler*.jsonc` array (often left after deleting the last item) fails parse with `ValueExpected` and **the deploy never starts**.

```bash
grep -nE '^\s*,\s*$' wrangler*.jsonc
```

Fix every hit. JSONC allows comments; it does **not** allow trailing/doubled commas on their own line. Scan **all** wrangler configs (`wrangler.jsonc`, `wrangler.containers.jsonc`, env overlays), not just the one you edited.

### CI must be non-interactive

Always pass `--autoconfig=false` so wrangler does not wait for a TTY prompt.

### Immutable image tags

Tag and reference `<image>:<git-sha>` (or a build id). `:latest` (or any reused tag) can leave Cloudflare serving the previous container revision.

### Live home, not a lab

Do not tear the Worker / D1 / R2 / KV / Queues down after a green smoke test unless the user explicitly asked to destroy them. Use a **staging** Worker + resources for experiments; keep **production** config pointed at prod resources only.

## Checklist

1. `wrangler whoami` — right account
2. List existing D1 / R2 / KV / Queues; create only missing ones
3. IDs written into the wrangler config the deploy will use
4. Adapter env flags set; `NEXT_PUBLIC_*` baked into the image
5. Image tagged immutably
6. `grep -nE '^\s*,\s*$' wrangler*.jsonc` is empty
7. `wrangler deploy --config wrangler.containers.jsonc --autoconfig=false`
8. curl health + `/` + `/login` → 200
9. Remote D1 `sqlite_master` shows app tables
10. R2 / KV / Queues binding check (health field or a write)

## Related

Catalog row for the skills README (do not invent a second deploy skill name):

`| [deploy-app-cloudflare](deploy-app-cloudflare/SKILL.md) | Cloudflare |`
