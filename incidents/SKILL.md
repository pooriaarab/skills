---
name: incidents
description: "Detect, triage, and communicate a production incident in a small web product. Configure Sentry error tracking, release tags, source maps, event sampling, an external uptime check, symptom-based alerts, a human-readable alert channel, and a short rollback-first incident runbook. Use when the user says 'the site is down', 'customers cannot check out', 'set up error tracking', 'add uptime monitoring', 'configure Sentry alerts', 'what is broken in production', 'set up on-call', 'create a status page', or 'write a postmortem'."
---

# Incidents

The minimum useful incident system has error tracking, an external uptime check, and one alert channel that a human reads.

Full on-call is usually wrong for one small product. Do not build shifts, escalation trees, or a 24-hour response promise.

## When to use this

**Trigger if:** a shipped product may be broken, users report failures, or the owner needs alerts for errors, uptime, checkout, queues, or incidents.

**Skip if:** the work only adds development logging, product analytics, or a planned maintenance notice with no active failure.

## 1. Minimum setup for one small product

Start with one Sentry project for production. Add one external HTTP check for the public page and one critical path. Send both alerts to a channel the owner checks daily.

The external check must run outside the hosting account. A Cloudflare Worker can return a healthy response while checkout or a D1 query fails.

The alert must name the product, environment, symptom, first-seen time, and link. Do not send an alert that only says `500 error`.

Use a separate production project or DSN from staging when practical. Staging traffic can consume the same event quota and hide a production regression.

Sentry currently lists a free Developer plan with error monitoring and email alerts. Better Stack currently lists a free personal plan with monitors, one status page, and Slack or email alerts. Limits change. Read the [Sentry pricing page](https://sentry.io/pricing/) and [Better Stack pricing](https://betterstack.com/pricing) when you choose.

Skip metrics, tracing, log warehouses, paging rotations, and dashboards until a real incident shows that this setup cannot answer a question.

## 2. Error tracking with Sentry

Sentry is the default because it groups repeated errors, keeps event context, and connects errors to releases. Use the current runtime guide. The [Sentry JavaScript SDK documentation](https://docs.sentry.io/platforms/javascript/) lists supported packages and initialization patterns.

### Source maps are part of error tracking

Minified stack traces turn a quick fix into a search through generated code. Upload source maps during the same build that deploys the bundle.

The release name on the event must match the release name on uploaded artifacts. Upload artifacts before users can generate errors from that release.

Sentry needs both minified files and source maps for de-minification. Use [Sentry's source map troubleshooting guide](https://docs.sentry.io/platforms/javascript/guides/hono/sourcemaps/troubleshooting_js/) when an issue still shows generated file names.

For a Cloudflare Worker, Wrangler can upload source maps with `upload_source_maps = true`. Cloudflare maps uncaught exceptions after invocation. See [Cloudflare source maps and stack traces](https://developers.cloudflare.com/workers/observability/source-maps/).

### Release tags explain which deploy broke it

Set `release` and `environment` during SDK initialization. Use one stable identifier, such as the commit SHA or `app@version`.

Create the Sentry release in the build or deploy step. Associate the project and upload its source maps before deployment.

Sentry's release API uses `POST /api/0/organizations/{organization_id_or_slug}/releases/` with required `version` and `projects` fields. Verify the current API in [Create a new release](https://docs.sentry.io/api/releases/create-a-new-release/).

Do not use `latest` as the release name. It hides which deploy introduced the error.

### Sampling and quota protect the whole product

An exception loop can consume a monthly event budget in one hour. A late quota alert cannot recover lost events.

Set error sampling before launch. In the JavaScript SDK, `sampleRate` controls error events, while `tracesSampleRate` controls tracing volume. Use `beforeSend` to drop known noise only after checking that it is safe. See [Sentry's sampling configuration](https://docs.sentry.io/platforms/javascript/configuration/sampling/).

Keep error events at a rate that preserves rare failures. Sample high-volume traces more aggressively than errors. Keep an unsampled critical path only if the current SDK supports that rule.

Set a server-side project or DSN rate limit when one noisy product can exhaust shared quota. A client-side filter cannot cap all instances.

Review Sentry usage, discarded events, quota, and spike protection after the first deploy. Sentry reports discarded events by quota, DSN limit, and spike protection in its [event statistics documentation](https://docs.sentry.io/product/stats/).

Never send passwords, access tokens, payment details, or full request bodies. Scrub sensitive fields before capture. Treat user identifiers as personal data.

## 3. Alert on symptoms, not causes

Page on a user-visible failure. Log causes for diagnosis.

Good pages include a public page failure from two external locations, a failed checkout test, a stopped queue heartbeat, or a sustained new-release error increase.

CPU, memory, and request counts are usually causes or context. They do not prove a user has a problem. A Worker can use little CPU while every D1 write fails.

Alert on CPU only when it predicts a tested product failure and has a clear action. Otherwise, put it in a digest.

Define each symptom in terms of a user action. Test `POST /checkout` with a safe test account, not only `GET /health`.

Do not make `/health` return success after a dependency failure. A health endpoint that lies delays the first report.

## 4. Alert fatigue is the real failure

An alert that fires often and means nothing trains the owner to ignore every alert. That makes the next real incident less visible.

Page only when a user can see the failure, the owner can act now, and delay can cause lost money, lost data, or customer churn.

Put deploy notices, slow but usable pages, test errors, quota warnings, and low-risk capacity trends in a digest. Group duplicate events and throttle repeated notices.

Every page needs an owner, a response target, and a next action. If nobody responds at night, call it an urgent owner alert, not an on-call page.

Review every page that fires. Lower its priority, change its threshold, or remove it when the owner did not act.

## 5. Uptime and status

Use an external monitor because local logs cannot report a total hosting failure. Check the landing page, login, and one revenue path. Check the response body when `200` can still contain a broken application.

Use a monitor with documented HTTP check, interval, location, timeout, retry, and alert fields. Confirm these fields in the vendor UI or API. Do not copy endpoint names from an old tutorial.

Run a failure test after setup. Point the monitor at a known failing path or use the vendor's test alert. Confirm that the human receives it.

At fifty users, a public status page is optional. It helps when several users need the same update or support questions repeat during an outage.

A public page is theatre when it only shows a green badge, has no incident history, and nobody updates it. Use a direct customer message for one known user.

Keep the status page separate from the product host when the budget allows. A Cloudflare outage must not remove both pages.

## 6. The incident itself

Use this short runbook. Write the incident time and each action in one shared note.

1. **Acknowledge.** Confirm that a real person owns the incident.
2. **Measure.** Check the monitor, Sentry issue, latest release, and scope.
3. **Mitigate.** Roll back the latest release or disable the failing feature.
4. **Communicate.** Tell affected users what fails and when the next update comes.
5. **Verify.** Test the user path from outside the hosting account.
6. **Diagnose.** Find the cause after the product is usable again.
7. **Fix.** Ship a small fix, test it, and keep the incident open until verified.
8. **Close.** Record impact, start time, end time, and follow-up action.

Rollback comes before debugging when the failure started after a deploy and the previous release is available. Debugging live first increases its cost.

Do not delete events, logs, or deploy records during an incident. They show what changed and which users were affected.

If payment or data integrity is uncertain, stop the risky write path. Preserve records and contact the provider or affected users before retrying writes.

## 7. Blameless postmortems at small scale

Write a postmortem when an outage affects customers, loses money, corrupts data, or exposes a repeatable process failure. Do not write one for a harmless local test.

For a one-person factory, use one short note with five answers: what broke, when it started and ended, the real cause, why detection or recovery failed, and what change stops a repeat.

Name the system and decision, not a person. “The deploy lacked a migration check” is useful. “The owner forgot” does not prevent the next failure.

Choose one prevention action with an owner and due date. Link the deploy, Sentry issue, monitor event, and customer note.

## 8. Cloudflare-specific reality

The common stack is Next.js on Cloudflare Workers with D1. Cloudflare observability shows Worker invocations, logs, exceptions, metrics, traces, and binding calls. It does not prove that a successful invocation returned the right business result.

Enable persisted Workers Logs when the Worker does not already have them:

```toml
[observability]
enabled = true
head_sampling_rate = 1
```

`head_sampling_rate` accepts `0` through `1`. Lower it when log volume or cost needs control. Check current retention and plan limits in [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

Use `npx wrangler tail` for immediate debugging after a deploy. It shows live invocation, console, and exception data. It does not store history and can drop messages under high traffic. See [real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/).

Use Workers Logs for history. Filter exceptions by documented error metadata or invocation outcome. Add structured logs for D1 operation, safe identifiers, duration, and failure class. Never log query parameters that contain secrets.

Cloudflare can trace fetch calls, binding calls, and Worker handlers when tracing is enabled. Treat tracing as diagnosis data, not the first alert. Review [current Workers observability limits](https://developers.cloudflare.com/workers/observability/) before enabling high-volume logs or traces.

The Cloudflare status page reports platform incidents. It does not report that this product's D1 query, checkout route, or code is broken. Check both the [Cloudflare status page](https://www.cloudflarestatus.com/) and the product monitor.

## Checklist

- [ ] Sentry captures production errors in a separate production environment.
- [ ] Source maps upload before the matching release serves traffic.
- [ ] Every event has a release identifier and environment.
- [ ] Error sampling, trace sampling, quotas, and spike controls are reviewed.
- [ ] Sensitive request data is scrubbed before capture.
- [ ] An external monitor checks the public page and one critical user path.
- [ ] The monitor sends a test alert to a human-readable channel.
- [ ] Pages describe user symptoms and include an owner and next action.
- [ ] Causes and low-risk trends go to logs or a digest.
- [ ] The rollback-first runbook is linked from the alert.
- [ ] Customers receive a clear update when the incident affects them.
- [ ] A short postmortem records the cause and one prevention action.
- [ ] Workers Logs are enabled, sampled, and retained within the current plan.
- [ ] `npx wrangler tail` is used for live debugging, not incident history.
- [ ] Cloudflare platform status and product health are checked separately.
