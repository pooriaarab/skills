---
name: deploy-app-self-host
description: "Self-host a containerized web app on any Docker host with Docker Compose, then smoke-test the deployment. Covers a Next.js-style app whose ports/adapters layer selects its backends (Postgres datastore, S3-compatible object store, Redis sessions/queue) from environment variables such as DEPLOY_PROFILE=self-host. Use when the user wants to run an app on their own server or VM instead of a managed platform, asks for a self-hosted or on-prem install, or says 'self-host', 'docker compose deploy', 'run my app on my own server', or 'deploy to my VPS'."
---

# Deploy App Self-Host

Run a containerized web app on one Docker host with Docker Compose. The stack has four parts: the app container, Postgres 16, an S3-compatible object store (MinIO), and Redis 7.

The app uses a ports/adapters design. Environment variables select the backend behind each port, so the same image can run on managed services elsewhere. This skill covers the self-host profile only.

## 1. Prerequisites

- Docker with the Compose plugin. Check with `docker compose version`.
- The app source, including its container Dockerfile.

## 2. docker-compose.yml

Place this file at the app root. Replace every `<placeholder>` value in `.env` (section 4).

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 12

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - miniodata:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 3s
      retries: 12

  # One-shot job: creates the buckets, then exits.
  minio-init:
    image: minio/mc
    depends_on:
      minio:
        condition: service_healthy
    environment:
      S3_ACCESS_KEY: ${S3_ACCESS_KEY}
      S3_SECRET_KEY: ${S3_SECRET_KEY}
      S3_BUCKET: ${S3_BUCKET}
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 $${S3_ACCESS_KEY} $${S3_SECRET_KEY} &&
      mc mb --ignore-existing local/$${S3_BUCKET}
      "

  redis:
    image: redis:7
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 12

  app:
    build: .
    # Or use a prebuilt image instead of build: image: <app-image>
    environment:
      DEPLOY_PROFILE: self-host
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${S3_ACCESS_KEY}
      S3_SECRET_KEY: ${S3_SECRET_KEY}
      S3_BUCKET: ${S3_BUCKET}
      REDIS_URL: ${REDIS_URL}
      SESSION_SECRET: ${SESSION_SECRET}
      ENCRYPTION_KEK: ${ENCRYPTION_KEK}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio-init:
        condition: service_completed_successfully

volumes:
  pgdata:
  miniodata:
```

Only the app port is published. Postgres, MinIO, and Redis stay on the internal Compose network.

## 3. Build the app image

Many apps stage a standalone build before Compose. Run the app's build step first (for example `./build-container.sh`), then let Compose build the image.

Common failure on a fresh clone: the build aborts with `module not found`. The cause is a missing dependency install. Run the install first (`npm ci`, or the app's package manager), then build again.

## 4. The .env file

Create `.env` next to the compose file. The operator fills every value.

```dotenv
# Postgres
POSTGRES_USER=app
POSTGRES_PASSWORD=<db-password>
POSTGRES_DB=YOUR_APP

# S3-compatible object store
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
S3_BUCKET=<bucket-name>

# Redis
REDIS_URL=redis://redis:6379

# App secrets: generate per environment, never commit real values
SESSION_SECRET=<32-byte-hex>
ENCRYPTION_KEK=<base64-32-bytes>
```

Generate the two app secrets:

```bash
openssl rand -hex 32     # SESSION_SECRET
openssl rand -base64 32  # ENCRYPTION_KEK
```

These secrets have no default, on purpose. A published default session secret lets anyone sign session cookies and impersonate users. A default encryption key lets anyone decrypt stored data. A correct app refuses to boot when they are missing. Treat that failure as a feature, not a bug.

## 5. Start the stack

```bash
docker compose up -d --build
```

Wait for every service to report healthy before you test:

```bash
docker compose ps
until curl -sf http://localhost:3000/<health-endpoint> > /dev/null; do sleep 2; done
```

Do not race the healthchecks. A successful `up` means the containers started. It does not mean they are ready.

## 6. How the env selects the backends

`DEPLOY_PROFILE=self-host` selects the portable adapters:

- Datastore port → Postgres, through `DATABASE_URL`.
- Blob port → S3-compatible store, through `S3_ENDPOINT` and the bucket credentials.
- Session and queue port → Redis, through `REDIS_URL`.

No code changes are needed between profiles. Only the environment changes.

## 7. Smoke test

This is the important part. Each check proves one piece of the stack works.

### 7.1 Health endpoint

```bash
curl -sf http://localhost:3000/<health-endpoint>
```

Expect HTTP 200. The `-f` flag makes curl exit non-zero on any other status.

### 7.2 Pages render

```bash
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -o /dev/null -w '%{http_code}\n' http://localhost:3000/login
```

Expect `200` from both.

### 7.3 Datastore round-trip

The schema auto-creates on first write. Write a record in the app first (sign up, or call an app endpoint that writes and reads). Then list the tables:

```bash
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
```

Expect the app's tables in the output. Empty output means no write reached Postgres.

### 7.4 Object store

List the buckets, then upload and download a test object:

```bash
docker compose run --rm --entrypoint sh minio-init -c '
  mc alias set local http://minio:9000 "$S3_ACCESS_KEY" "$S3_SECRET_KEY" &&
  mc ls local &&
  echo smoke > /tmp/smoke.txt &&
  mc cp /tmp/smoke.txt "local/$S3_BUCKET/smoke.txt" &&
  mc cat "local/$S3_BUCKET/smoke.txt"
'
```

Expect the bucket in the list, and `smoke` as the download output.

### 7.5 Redis sessions

```bash
curl -s http://localhost:3000/<health-endpoint>
```

Check the JSON payload for the session-backend field. It must report `redis`, not memory. A memory backend loses all sessions on every restart.

## 8. Teardown

```bash
docker compose down -v
```

The `-v` flag also deletes the Postgres and MinIO volumes. Omit it to keep the data.

## 9. Common gotchas

- **Stale dependencies.** The build fails, or the app crashes, after a dependency change. Re-run the dependency install, then rebuild. An old host `node_modules` is the usual cause.
- **Fresh clone fails with `module not found`.** The build did not run a dependency install. See section 3.
- **App refuses to boot on missing secrets.** By design. Set `SESSION_SECRET` and `ENCRYPTION_KEK` in `.env`. Never commit real values.
- **Testing too early.** `docker compose up` returns when containers start, not when they are ready. Wait for healthy, then test.
- **Changed `.env` has no effect.** Compose substitutes variables at `up` time. Re-run `docker compose up -d` after edits.
