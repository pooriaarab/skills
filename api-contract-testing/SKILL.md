---
name: api-contract-testing
description: "Gate an HTTP API against its OpenAPI spec on every pull request, with probes that check authorization and not just the happy path — using scout, an MIT CLI that needs no account and phones nobody home. Covers the config, the four probe kinds, why missing-auth is the one that earns its keep, safe defaults that make it usable against a live preview deployment, credential handling that keeps secrets out of logs, the two upstream traps that silently produce a wrong result, and where the gate belongs in CI. Use when adding API tests to a repo, wiring a contract gate into CI, testing a preview deployment, or deciding whether an OpenAPI spec is worth authoring first."
---

# api-contract-testing

An OpenAPI spec is a claim. This skill checks the claim against the running
service on every pull request, and it costs nothing to run.

## When to use this

**Trigger if:**

- The repo serves an HTTP API, and something can call it over the network.
- You want CI to catch an endpoint that forgot its authorization check.
- You are adding a QA gate and want the free tier of it first.

**Don't bother if:** the repo is a library or a CLI with no HTTP surface. Gating
it adds CI time and tests nothing.

## Check the licence before you adopt the tool

Do this once, for any QA tool. A `license` field costs nothing to write.

Open the repository the package's own `package.json` names. Confirm a real
`src/` exists there. Then grep it for phone-home: the vendor's domain, `api key`,
`telemetry`, `analytics`. Read the build script — an obfuscation step means the
published artifact is not the source.

`scout` passes. It is MIT, the full `src/` is public, it needs no account, and
it has exactly two `fetch()` call sites: loading the spec, and calling the API
under test. The same vendor's browser-QA CLI fails: the source repo it names
does not exist publicly, its npm build ends in obfuscation, and it needs an API
key for a paid service.

The licence check is a point-in-time check, but `npx @testerarmy/scout@latest`
re-resolves on every run, and this tool sees your credentials via `--header`.
Once your setup is stable, pin an exact version instead of `@latest`, and
redo the check when you bump it.

## Set it up

Scout needs Node 22.12 or newer.

```sh
npx @testerarmy/scout@latest init openapi.yaml --base-url http://localhost:3000/api
```

That parses the spec, caches it to `.scout/`, writes `scout.json`, and appends
`.scout/` to `.gitignore` on its own.

Commit `scout.json`. Keep it narrow:

```json
{
  "$schema": "https://tester.army/scout.schema.json",
  "spec": "public/openapi.yaml",
  "baseUrl": "http://localhost:3000/api",
  "policy": {
    "allowMutations": false,
    "allowedMethods": ["GET"]
  }
}
```

`allowedMethods` makes read-only a structural property, not a flag someone can
forget on the command line.

Scout reads `scout.json` from the working directory. It does not search parent
directories, so run every command from the repo root.

## What it actually checks

A sweep runs up to four probe kinds per operation, drawn from the four below —
not every operation gets all four, only the ones the spec gives it grounds for.
That is why a sweep's total probe count is not simply four times its operation
count; see the worked result below, where 149 probes covered 71 operations.

| Probe | What it asserts |
| --- | --- |
| `happy-path` | The documented success response, validated against its schema |
| `missing-auth` | The operation rejects a caller with no credentials |
| `invalid-auth` | The operation rejects a well-formed but wrong credential |
| `not-found-shape` | A 404 body matches the documented error envelope |

`missing-auth` is the one that earns its keep. It finds an operation that forgot
its authorization check. No amount of happy-path testing finds that, because a
happy-path test always sends a valid credential.

```sh
npx @testerarmy/scout@<pinned-version> sweep
npx @testerarmy/scout@<pinned-version> report --ci --min-coverage 90 --severity-threshold high
```

Pin the version here too, even without `--header`: in CI this runs in the same
job as steps that export credentials, and `@latest` resolving to a malicious
publish would still see that job's environment.

## It is safe against a live deployment

Mutations are refused unless you pass `--allow-mutations`. Requests are pinned
to the base-URL host. There are no cross-host redirects, and remote `$ref`
resolution is off. The rate limit defaults to 5 per second and the budget to 300
requests per run. Responses are capped at 1 MiB and returned as a bounded
preview. Spec downloads cap at 25 MiB, with a hard ceiling of 100 MiB.

That is why you can point it at a preview deployment rather than only at
localhost.

## Credentials

Pass a literal `$VAR` string in single quotes. Scout expands it at request time
and redacts it from output, so the secret stays out of the process table and out
of logs. Single quotes stop the shell expanding it first.

These commands carry live credentials, so use the pinned version from the
licence check above, not `@latest` — don't let a secret flow through a tag that
re-resolves on every run.

```sh
npx @testerarmy/scout@<pinned-version> sweep --header 'Authorization: Bearer $API_TOKEN'
```

Behind Cloudflare Access, use a service token as two headers:

```sh
npx @testerarmy/scout@<pinned-version> sweep \
  --header 'CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID' \
  --header 'CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET'
```

The Access policy needs a Service Auth rule that allows that token.

## Two traps

Both are upstream behaviour. Both produce a wrong result silently rather than an
error, which is why they are worth knowing before you hit them.

### `--ci` defaults the coverage floor to 100

`scout report --ci` sets `--min-coverage` to 100 when you do not pass it.
Reaching 100 needs every probeable operation exercised, including authenticated
ones an unauthenticated sweep skips (see "Read the coverage number honestly"
below) — so a gate without an explicit floor almost always fails, and it fails
as `coverage-below-minimum`, which reads like a coverage problem rather than a
defaulting problem.

Always pass `--min-coverage`.

### `scout init` drops the rate limit and the budget

`scout init` rewrites `scout.json` from its command-line flags. It preserves
`allowedMethods`, `allowedPaths`, `authProfiles` and `headers`. It drops
`policy.rateLimit` and `policy.budget`, because `buildConfig` has no spread for
them.

So a low rate limit set deliberately for a fragile API is reset to 5 on the next
`init`, and nothing tells you. It also overwrites `baseUrl`, which leaves a
localhost URL staged after a local run.

Two ways to live with it. Leave those keys out of the file and rely on the
defaults, so nothing looks effective that is not. Or snapshot and restore the
file around the run.

## Where the gate belongs

| Gate | Trigger | Target |
| --- | --- | --- |
| Pre-PR | before you open the pull request | local dev server |
| PR CI | after the preview deploys | the preview URL |
| Release | tag or production deploy | production, read-only |

**Put the CI gate in its own job.** If it shares a job with the deployment
lifecycle, a failed probe can trip the teardown step and delete the deployment
you need in order to debug the failure. A preview workflow that cleans up on
failure will eat its own evidence.

Size the runner small. The job waits on HTTP, so it needs no cores.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Pass |
| 1 | A finding at or above the severity threshold |
| 2 | Usage error |
| 3 | Incomplete run |

Incomplete reasons are `no-sweep-run`, `coverage-below-minimum` and
`no-probes-recorded`.

Fuzz findings arrive as candidates. They do not gate until you confirm them with
`scout finding confirm`. So a noisy fuzz run cannot break CI on its own.

One more `set -e` hazard when you script this: the JSON report exits nonzero on
a gate failure, so a human-readable report step written after it never runs —
the script dies first. Don't guard the gate command itself with `|| true`;
that discards the failure and the job reports success regardless of what the
sweep found. Instead capture the exit code, run the report step that follows,
then exit with the code you captured:

```sh
rc=0
npx @testerarmy/scout@<pinned-version> report --ci --min-coverage 90 --severity-threshold high || rc=$?
# human-readable report step goes here
exit "$rc"
```

## Read the coverage number honestly

An unauthenticated sweep proves that operations reject anonymous callers. It
does not exercise a successful authenticated response. `happy-path` only means
something once an auth profile exists. Adding one is the next increment.

The denominator also moves with the policy. Restricting to `GET` makes coverage
a percentage of GET operations, not of the whole spec. Say which you mean.

Worked result from the first repo to adopt this: a 134-path, 183-operation
OpenAPI 3.1 spec, policy restricted to `GET`. A full sweep ran 149 probes with 0
errors and reached 97 percent of the 71 GET operations. The floor was then set
at 90.

## No spec yet

Scout has a spec-less `--base-url` mode, but it gives much weaker probes and no
schema validation. Authoring the spec is the prerequisite, not an afterthought.

For a Next.js App Router project, `app/api/**/route.ts` gives you the path and
the method mechanically. Request and response schemas do not come for free
unless the handlers already validate with a schema library you can introspect.
Be honest about that split. A spec whose response bodies were invented makes the
gate report success against fiction.
