---
name: dependency-hygiene
description: "Keep a Cloudflare Workers product rebuildable across long gaps by pinning Bun and Wrangler, committing and validating lockfiles, grouping automated dependency updates, triaging production-relevant CVEs, rotating leaked secrets, and retiring abandoned deployments. Use when the user asks for 'dependency hygiene', 'dependency maintenance', 'update dependencies across repos', 'audit old repos', 'fix a stale lockfile', 'pin Bun', 'set up Dependabot', 'set up Renovate', 'triage dependency alerts', 'scan for leaked secrets', 'rotate repository secrets', or 'archive an abandoned product'. Skip an active outage or customer-facing failure and use incidents for that."
---

# Dependency Hygiene

The main risk at factory scale is not a novel attack. It is losing the ability to ship.

A product that cannot be rebuilt is already broken. The owner just has not seen the failure.

## When to use this

**Trigger if:** a product has stale dependencies, an old build, unresolved lockfile changes,
unmanaged secrets, update noise, or no retirement plan.

**Skip if:** users currently see errors or the product is down. Use `incidents` for detection and
triage, then return here for prevention work.

## 1. Rebuildability is the first control

The first question is simple: **can this repository build and deploy from a clean checkout today?**

Three conditions make a repository un-rebuildable:

- An unpinned runtime, package manager, or CLI changes behavior after the last release.
- A lockfile no longer agrees with its manifest, or the registry cannot resolve a dependency.
- A dead transitive dependency no longer works with Bun, Wrangler, the Workers runtime, or D1.

Do not call a product healthy because its deployed Worker still answers requests. A successful
old deployment can keep serving traffic while the next build fails before it reaches Cloudflare.

Run the real clean-checkout build in GitHub Actions. Include the Worker bundle, tests, and D1
migration checks that the deployment needs. Record the exact runtime and CLI versions in the job
output.
Wrangler recommends a local project install because it keeps the project version under control.
If Wrangler is absent, `npx wrangler` uses the latest version. That is a delayed breaking change,
not a harmless convenience. See [Wrangler install and update](https://developers.cloudflare.com/workers/wrangler/install-and-update/).
Cloudflare Workers also use a compatibility date to select runtime behavior. Update it only with
tests, because a newer date can expose changed runtime behavior. See [compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/).

## 2. Automated updates must reduce noise

Use Renovate or Dependabot for every maintained repository. Choose one service for the factory.
Two update bots create duplicate pull requests and hide the real queue.

Dependabot opens one pull request per dependency by default. Group related updates, set a weekly
schedule, and cap open pull requests. Group development tools separately from production runtime
packages. Keep security fixes visible when grouping them. See [Dependabot update configuration](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/optimizing-pr-creation-version-updates)
and [security update groups](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-security-updates).

Renovate uses `packageRules` with `groupName`, `matchUpdateTypes`, and `automerge`. See
[Renovate automerge](https://docs.renovatebot.com/key-concepts/automerge/).

Auto-merge patch updates only when all of these conditions hold:

- CI runs from a clean checkout with the pinned toolchain.
- Tests cover the public routes, important D1 reads and writes, and the build output.
- Required status checks cannot be skipped or pass when the test command did not run.
- The update does not change a deployment setting, migration, secret, or major runtime behavior.

The precondition is honest: auto-merge is safe only when the test suite catches breakage. If it
does not, disable auto-merge. Add the missing test first, then enable it for the narrowest group.
Do not use a green workflow as evidence when the workflow does not test the product path.
GitHub auto-merge waits for required reviews and status checks. Enable it only when branch rules
make those checks meaningful. See [automatic pull request merging](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request).

## 3. Triage CVEs by exposure

Do not treat every dependency alert as an urgent production incident. Treat severity as a prompt
for a reachability question, not as the final decision.

Ask: **can the vulnerable code execute in the deployed Worker, or in a CI job that can reach
deployment secrets or publish artifacts?**

Use this order:

1. Check whether the dependency is in the deployed bundle or only in local development.
2. Check whether the affected function is reachable from an untrusted request or input.
3. Check whether the vulnerable version has a fix, and whether the fix changes the API.
4. Check whether the package runs in GitHub Actions with Cloudflare or release credentials.
5. Choose the smallest safe action: update, remove, isolate, document, or schedule.

A vulnerable test helper usually does not affect a live Worker. A vulnerable build plugin can
still affect CI if an attacker can control its input or its package source. A development-only
classification does not make a credentialed CI job harmless.

Dependency review shows added, removed, and updated packages before they reach production. Use it
for pull requests when the repository plan supports it. See [reviewing dependency changes](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-dependency-changes-in-a-pull-request).

## 4. Lockfiles and toolchain pins

Commit `bun.lock`. Bun documents it as the supported text lockfile and requires it for frozen CI
installs. See [Bun lockfiles](https://bun.sh/docs/pm/lockfile).

Use `bun ci` or `bun install --frozen-lockfile` in GitHub Actions. Bun installs exact lockfile
versions and fails when `package.json` disagrees. See [bun install](https://bun.sh/docs/pm/cli/install).

Pin the Bun release in `package.json` with `packageManager`, or use a committed `.bun-version`.
`oven-sh/setup-bun@v2` reads either supported form. Do not let CI use `latest` by default. See
the [setup-bun action](https://github.com/oven-sh/setup-bun#readme).

Install Wrangler as a project development dependency. Run the local binary from package scripts.
Do not depend on a globally installed Wrangler or an unpinned `npx` fallback.

Pin the GitHub Actions toolchain that installs Bun and runs deployment commands according to the
repository's action policy. Review action changes like package changes. A floating action tag can
change the build without a change to the repository.

Keep D1 migration files in the repository. Check the remote migration list before a release, and
apply migrations by database name when possible. Cloudflare notes that a binding name can change,
but a database name does not. See [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
and [D1 Wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/).

## 5. Secrets across many repositories

Use the correct store for each boundary:

- Store deployed Worker secrets with `wrangler secret put` and read them from `env`.
- Store local values in `.dev.vars` or `.env`, and ignore those files.
- Store GitHub Actions credentials as repository or environment secrets.
- Keep public configuration in Wrangler `vars`, never private keys or tokens.

Cloudflare's `wrangler secret put` creates a new Worker version and deploys immediately. Confirm
the target environment before running it. Declare required secret names in Wrangler so deploys
fail when a required secret is missing. See [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
and [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).

If someone leaves, rotate every credential they could access. If a key reaches a repository, log,
pull request, artifact, or deleted commit, treat it as compromised immediately. Revoke or rotate
it at the provider first. Then remove it from the working tree and clean the history when needed.

Deleting the line does not make the old value safe. GitHub secret scanning examines repository
history. Push protection blocks supported secrets before they enter the repository. Enable both
where the repository plan supports them. See [secret scanning](https://docs.github.com/en/enterprise-cloud@latest/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enable-secret-scanning)
and [push protection](https://docs.github.com/en/enterprise-cloud@latest/code-security/how-tos/secure-your-secrets/work-with-leak-prevention/push-protection-in-the-github-ui).

Use the same human-readable alert channel described in `incidents` §1 for an active leak or failed
rotation. Do not create a second channel that nobody checks.

## 6. A scheduled sweep that fits a solo factory

Run a lightweight automated sweep weekly. Run the owner review monthly, or before a product ships
after a long pause.

For each repository, check:

- A manifest and lockfile exist, and a clean `bun ci` succeeds.
- Bun, Wrangler, the compatibility date, and GitHub Actions versions are recorded.
- The production build and required tests run in GitHub Actions.
- D1 migrations are committed and the remote migration state is known.
- Dependabot or Renovate has no stalled pull requests or ignored critical fixes.
- Secret scanning is enabled, and required secret names match each environment.
- The Worker, custom domain, billing, and last successful deploy still have an owner.

Send only actionable failures to the `incidents` alert channel. Include the repository, product,
failed check, last known good date, and next action. Do not send a daily green report.

Skip SBOM warehouses, a 24-hour on-call rotation, per-repository dashboards, and custom scanners
until the factory has a concrete question those systems answer. GitHub's built-in dependency and
secret features, one CI build, and one scheduled inventory are enough for this scale.

## 7. Archive products deliberately

An abandoned live product is a liability. Archive it when maintenance has stopped and the owner
does not intend to restore it soon.

Proper shutdown has this order:

1. Confirm that no customer, paid plan, legal hold, or data retention need remains.
2. Export the source, required data, configuration notes, and final deploy information.
3. Tell users what changes, when access ends, and where support goes.
4. Stop deploy workflows and revoke GitHub, Cloudflare, registry, analytics, and payment secrets.
5. Remove or protect every public entry point, including custom domains and `workers.dev` access.
6. Cancel paid resources, check domain renewal, and close unused billing commitments.
7. Update the README with the shutdown date, last release, data policy, and successor.
8. Close open issues and pull requests, then archive the GitHub repository.

Archiving GitHub makes the repository read-only. It does not stop a deployed Worker or revoke its
secrets. See [archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories).

When removing a Workers Custom Domain, remove the associated Advanced Certificate separately.
Cloudflare says deleting the Custom Domain does not delete that certificate. See [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Checklist

- [ ] A clean checkout builds and tests in GitHub Actions today.
- [ ] Bun, Wrangler, compatibility behavior, and action versions are pinned or recorded.
- [ ] `bun.lock` is committed, and CI uses `bun ci` or `bun install --frozen-lockfile`.
- [ ] Wrangler is a local project dependency, not a floating global fallback.
- [ ] D1 migrations are committed, tested, and checked against the correct database.
- [ ] Renovate or Dependabot runs on a schedule and groups routine updates.
- [ ] Patch auto-merge is off unless tests catch real product breakage.
- [ ] CVEs are triaged by deployed or credentialed CI exposure.
- [ ] Worker secrets, local values, and GitHub Actions credentials use separate stores.
- [ ] A leaked secret is revoked or rotated before cleanup work starts.
- [ ] Secret scanning and push protection are enabled where available.
- [ ] The sweep runs weekly, and the owner review runs monthly or before a dormant launch.
- [ ] Actionable sweep failures use the alert channel from `incidents` §1.
- [ ] Archived products have revoked secrets, removed entry points, settled billing, and updated docs.

## Related

- `incidents` — the fast failure, and the alert channel this skill's sweep
  should report into rather than inventing a second one.
- `support-inbox` — a rise in "it stopped working" is often a dependency or
  toolchain change, not a bug you wrote.
