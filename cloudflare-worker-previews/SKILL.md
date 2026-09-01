---
name: cloudflare-worker-previews
description: Configure Cloudflare Worker pull-request Previews with safe bindings, predictable URLs, live verification, cleanup, and authenticated test-user access.
---

# Cloudflare Worker Previews

Create one stable Preview per pull request. Name it from the PR-standard branch.
Verify the deployed URL before merge, then delete it when the PR closes.

Worker Previews are a private beta in Wrangler 4.127.1. Pin that exact version
in CI. Recheck the commands and beta limitations before changing the pin.

## Establish the contract

Inspect every Wrangler file and deployment workflow first. Record all variables,
secrets, bindings, Durable Objects, Containers, Workflows, services, queues,
routes, Cron Triggers, runtime settings, and Wrangler environments.

Use this Preview contract:

- Use the complete PR branch name as `--name`.
- Require the repository's PR-standard pattern before deployment.
- Keep the URL stable across commits to the same branch.
- Do not rename a branch while its Preview exists.
- Use `<branch>.preview.example.com` when the Worker has a custom domain.
- Use `<branch>.preview.staging.example.com` only when that hierarchy is intentional.
- Verify the live URL, including authentication, before merge.
- Upsert one marked PR comment with the URL and verification result.
- Delete the Preview when the PR closes.

For example, branch `or-111-fix-login` becomes
`or-111-fix-login.preview.example.com`.

If a branch must be renamed, delete the old Preview by its old branch name first.
Later pull-request events expose only the new name and cannot infer the orphan.

## Configure Preview settings

Production variables, secrets, bindings, and runtime settings do not enter a
Preview automatically. Add required non-secret settings under `previews`.
Provision Preview secrets separately.

Keep `assets`, `compatibility_date`, `compatibility_flags`, and `placement` at
the top level. Put Preview-specific observability, limits, logpush, definitions,
and tail consumers under `previews` when they differ.

Never bind a Preview to production data or credentials without explicit approval.
Use staging resources containing disposable or synthetic data.

```jsonc
{
  "vars": { "APP_ENV": "production" },
  "r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "uploads-production" }],
  "previews": {
    "vars": { "APP_ENV": "preview" },
    "r2_buckets": [{ "binding": "UPLOADS", "bucket_name": "uploads-staging" }]
  }
}
```

Resource IDs and names still select real account resources. Two Previews using
one staging ID share its data. Create per-PR resources when destructive tests,
migrations, or parallel test isolation require them.

| Resource | Preview behavior |
|---|---|
| KV, D1, R2, Vectorize, Hyperdrive | Shared when IDs or names match |
| Analytics Engine, Pipelines, Secrets Store | Shared when targets match |
| Queue producers | Send to the named queue |
| Workflows | Share instances when the Workflow name matches |
| Static assets | Uploaded from the branch for each Preview |
| Same-Worker Durable Objects | Isolated namespace and storage per Preview |
| Same-Worker Containers | Isolated namespace and instances per Preview |

For a Workflow, use a distinct staging Workflow name when instance isolation
matters. Cloudflare does not create separate account resources for each Preview.

## Handle Durable Objects and Containers

Same-Worker Durable Objects isolate automatically when the binding omits
`script_name`. State persists across updates to one Preview. Preview deletion
deletes its Durable Object namespace.

Prefer `ctx.exports` for same-Worker calls. If code reads `env.COUNTER`, repeat
that binding under `previews.durable_objects.bindings`. Missing it can cause 1101.

A binding with `script_name` reaches that Worker's production Durable Object.
It never selects a matching Preview.

Declare container configuration under `previews.containers`. Also repeat its
Durable Object binding when code reads the container from `env`.

Container cleanup is incomplete. After deleting a Preview, list container apps.
Delete only apps matching `<worker>_<preview>_`; never match the Worker alone.

## Handle current gaps

- Service bindings reach the bound Worker's production deployment.
- Same-Worker calls should use `ctx.exports` where possible.
- Queue producers work, but Preview queue consumers do not.
- Cron Triggers invoke production, not Preview `scheduled()` handlers.
- Production routes and custom domains do not redirect traffic to a Preview.
- Use a test-only HTTP route for scheduled logic when appropriate.
- Use staging Workers for multi-Worker end-to-end tests.

Fail the rollout when these gaps would send tests into production.

## Configure names and custom domains

Pass the validated branch name explicitly:

```sh
npx --yes wrangler@4.127.1 preview --name "$BRANCH_NAME" --json
```

Do not replace the branch name with `pr-123`. The PR-standard name carries the
issue number and readable slug.

For a custom zone, reserve `preview.example.com` as the Preview base hostname.
Enable it for Preview traffic in the dashboard. Cloudflare creates wildcard DNS
and TLS for `*.preview.example.com`.

When Wrangler owns the custom-domain route, configure the setting there. A later
Wrangler deploy can overwrite a dashboard-only setting.

```jsonc
{
  "routes": [{
    "pattern": "preview.example.com",
    "custom_domain": true,
    "previews_enabled": true
  }]
}
```

That route also serves production traffic at `preview.example.com`. Preview
traffic uses `<branch>.preview.example.com`.

Issue the wildcard certificate before relying on the first PR. Certificate
issuance can lag behind Preview creation.

`<branch>.preview.staging.example.com` adds another hostname level. Confirm the
certificate covers it. Advanced Certificate Manager with Total TLS may be needed.

Keep `workers.dev` Preview URLs enabled as a diagnostic host when policy allows.
At least one host type must remain enabled.

## Configure credentials and test users

Create a narrow Cloudflare token with Workers Scripts Write and only the resource
permissions required by the Preview bindings. Store the token as a repository
secret. Store the account ID as a repository variable:

```sh
gh secret set CLOUDFLARE_API_TOKEN
gh variable set CLOUDFLARE_ACCOUNT_ID
```

See [cloudflare-agent-credentials](../cloudflare-agent-credentials/SKILL.md) when
the token does not exist. Verify the token before installing it.

Preview application secrets never inherit production values. Set staging values
in Preview Base configuration, or scope them to one Preview:

```sh
npx --yes wrangler@4.127.1 preview base-config secret put SECRET_NAME
npx --yes wrangler@4.127.1 preview secret put SECRET_NAME --name "$BRANCH_NAME"
```

Authenticated apps require a dedicated Preview test user in the staging identity
store. It must be active, least privileged, resettable, and excluded from real
customer data. Store its credentials as Preview verification secrets.

Exercise the complete authenticated flow against the live URL. Include sign-in,
session persistence, and one permission-sensitive action. Test outer Cloudflare
Access separately from application authentication.

Maintain separate smoke users for production checks. Never point a Preview at
production authentication merely because the staging test user is missing.

## Automate and gate

Read [references/github-actions.md](references/github-actions.md) when adding the
GitHub Actions workflow. Adapt its install, build, health, and authenticated checks
to the repository.

The verification job must consume Wrangler's returned URL. It must not reconstruct
the URL and assume deployment succeeded.

Make the live verification job a required check where repository settings allow.
Otherwise, the designated merger must treat a red or missing check as blocking.

Add the live URL and verification result to the PR's `How I verified` section.
The sticky comment does not replace that proof.

Forked pull requests must not receive Cloudflare or test-user secrets. Skip Preview
deployment for forks. Never use `pull_request_target` to run pull-request code.

## Delete the Preview

Delete by the same validated branch name when the PR closes:

```sh
npx --yes wrangler@4.127.1 preview delete \
  --name "$BRANCH_NAME" --skip-confirmation
```

Also delete any per-PR resources created outside the Preview system. Review exact
resource names before deletion.

A deleted custom Preview hostname can fall back to the base Worker and return 200.
Use the successful delete command as proof. Mark the PR comment as expired.

## Source of truth

These beta documents can change:

- [Get started](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/get-started/)
- [Configuration](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/configuration/)
- [Resources and isolation](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/resources/)
- [Custom domains](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/custom-domains/)
- [Limitations](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/limitations/)
- [Automation examples](https://worker-previews-docs-2.preview.developers.cloudflare.com/workers/previews/automation-examples/)

## Related

- [pr-standards](../pr-standards/SKILL.md) defines the branch name and proof contract.
- [branch-deploy-convention](../branch-deploy-convention/SKILL.md) defines staging and production branches.
