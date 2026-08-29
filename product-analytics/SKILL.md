---
name: product-analytics
description: "Use when a SaaS team asks 'did users come back?', 'set up product analytics', 'track activation', 'build a retention cohort', 'find funnel drop-off', 'measure onboarding', or 'add PostHog'. `launch-analytics` covers acquisition and traffic with GA4 and Clarity; this skill covers what happens after signup: activation, funnels, retention, cohorts, and product events."
---

# product-analytics

The headline decision: use PostHog first for a small SaaS. It combines product events, session replay, feature flags, and experiments in one product.

This skill measures what happens after acquisition. `launch-analytics` covers GA4, Clarity, and Search Console for acquisition, traffic, and search.

## 1. Pick the tool

Use PostHog Cloud unless self-hosting is a real requirement. Its current free tier includes 1M analytics events, 5K session recordings, and 1M feature-flag requests each month. Check the [current pricing](https://posthog.com/pricing) before quoting limits.

PostHog fits this stack because it gives one identity across the browser and server. It also keeps replay and flags beside the event data. Its [Next.js guide](https://posthog.com/docs/libraries/next-js) documents `posthog-js`, `posthog-node`, `capture`, `identify`, and server-side flags.

Choose another tool when its advantage is material:

- Choose [Amplitude](https://amplitude.com/docs/analytics/product-analytics) for a larger product organisation that needs mature governance and shared product-analysis views.
- Choose [Mixpanel](https://mixpanel.com/platform/product-analytics/) when the team already works there or wants focused, self-serve funnel and retention reports.
- Choose self-hosted PostHog only for a clear privacy or infrastructure need. You own upgrades, scaling, backups, and incidents. See the [self-hosting guide](https://posthog.com/docs/self-host).

Do not choose GA4 for these questions. Point acquisition questions to `launch-analytics`. Product analytics needs a stable user identity and intentional product events.

## 2. Treat the event taxonomy as the product

A bad taxonomy cannot be repaired with a better dashboard. Renaming events does not rewrite old data. You must re-instrument, backfill carefully, or accept a broken time series.

Use `object_action` names in past tense. Use `workspace_created`, not `create_workspace`. Use `report_generated`, not `report_button_clicked`. PostHog recommends an object plus verb format; this repository uses snake case for stable code names. See [capture events](https://posthog.com/docs/product-analytics/capture-events).

Name the business action. Do not name a page, button, component, or API route. Avoid generic names such as `button_clicked`, `form_submitted`, and `page_viewed`. They force every question to depend on fragile properties.

Start with a small SaaS event set:

- `user_signed_up`: the account exists and signup succeeds.
- `user_logged_in`: an authenticated session starts.
- `workspace_created`: the first workspace becomes usable.
- `data_source_connected`: a source passes its connection check.
- `first_report_generated`: the user sees a useful result.
- `invite_sent`: a user invites a teammate.
- `subscription_started`: billing confirms the subscription.
- `subscription_canceled`: billing confirms the cancellation.

Add properties only when they answer a planned question. Useful examples include `plan`, `role`, `workspace_id`, `source_type`, and `activation_version`. Do not send secrets, payment details, or raw private content.

Instrument the activation moment before every other custom event. Define it as one observable action that shows value within a stated window, such as `first_report_generated` within seven days of signup. Signup is an entry point. Activation is evidence of value.

Write the tracking plan before adding calls. For each event, record its owner, trigger, required properties, source, and allowed frequency. Create a test account and verify the event in PostHog before shipping.

## 3. Preserve identity across signup

The most common failure is identity splitting. An anonymous visitor produces one history. Login produces a second history under another ID. Funnels and retention then silently undercount activated people.

PostHog creates an anonymous browser ID. After Better Auth reports a logged-in user, call `posthog.identify(user.id, properties)` with the stable database ID. Never use `anonymous`, `null`, `user`, or another shared value. Do not use email when a stable Better Auth ID exists.

```ts
posthog.identify(session.user.id, {
  plan: session.user.plan,
  role: session.user.role,
})
```

Call `posthog.reset()` on logout. Otherwise a shared browser can attach the next person's events to the previous person. See [identifying users](https://posthog.com/docs/product-analytics/identify).

Use the same `user.id` as `distinctId` for Worker events. Do not generate a second server ID. If two IDs already exist, use PostHog's `alias` only after checking its constraints. Normal anonymous-to-known signup flows should use `identify`, not a speculative alias call.

Test one browser: capture an anonymous pageview, sign up, capture activation, log out, and sign in as another test user. Confirm the first person has one profile and the second person has no inherited events. The [identity resolution guide](https://posthog.com/docs/product-analytics/identity-resolution) explains why this is an application responsibility.

For a B2B SaaS, decide whether the unit is a user or a workspace. Do not mix user retention with workspace retention in one chart. Use group analytics only when the workspace is the real customer unit.

## 4. Answer the four questions

### Activation rate

Build a cohort of users who triggered `user_signed_up` during a fixed period. Count users who triggered the activation event within the chosen window. Report `activated users / signed-up users`, plus median time to activate. Break it down by signup week, plan, role, and acquisition source.

Do not call every logged-in user activated. That measures access, not value.

### Funnel drop-off

Build a sequential funnel such as `user_signed_up` → `workspace_created` → `data_source_connected` → `first_report_generated`. Set a realistic conversion window. Inspect overall conversion and conversion from the previous step. The largest relative loss is the first place to investigate.

Do not add optional clicks as required steps. A funnel step is an action the user must complete. PostHog describes sequential, strict, and any-order funnels in its [funnel documentation](https://posthog.com/docs/product-analytics/funnels).

### Retention curve

Use the activation event, usually `first_report_generated`, as the start event. Use a meaningful return event, such as `report_generated`, not a pageview or login.

Read weekly or monthly retention by signup or activation cohort. Height matters, but flattening matters more. A curve that keeps falling has no durable use pattern, even when its first-week value looks high. A lower curve that flattens shows a smaller group has found a repeatable reason to return. Compare the plateau and the time needed to reach it.

PostHog retention uses a start event and a return event. See its [retention documentation](https://posthog.com/docs/product-analytics/retention) before choosing first-time, first-ever, or recurring retention.

### Cohort comparison

Compare cohorts with the same event definitions and time windows. Start with signup week, plan, acquisition source, role, workspace size, and whether the user activated in the first session.

Compare activation, time to value, and Week 1, Week 4, and Week 12 retention side by side. Keep the denominator visible. A newer cohort can appear better because later periods are incomplete.

Treat a cohort difference as a lead, not proof of cause. Use replay, interviews, and a controlled experiment to test the explanation.

## 5. Capture on the server when the browser is not the source of truth

Ad blockers remove a real share of client events. Client capture is suitable for page views, UI exploration, and interactions with no durable state.

Capture these events server-side:

- account creation and deletion;
- subscription, payment, refund, and cancellation state;
- entitlements and plan changes;
- completed imports, jobs, or generated results;
- security and permission changes.

For Cloudflare Workers, a standard `fetch` call avoids assuming that `posthog-node` supports the Worker runtime. PostHog documents this HTTP event endpoint as `POST https://us.i.posthog.com/i/v0/e/` with `api_key`, `distinct_id`, `event`, and optional `properties`:

```ts
await fetch(`${env.POSTHOG_HOST}/i/v0/e/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: env.POSTHOG_PROJECT_TOKEN,
    distinct_id: session.user.id,
    event: 'subscription_started',
    properties: { plan: subscription.plan },
  }),
})
```

Use the billing webhook or D1 transaction as the event trigger. Do not trust a client claim that a payment or entitlement exists. Keep billing data in the billing system and use PostHog to analyze behavior around it.

## 6. Use a reverse proxy before production

Tracking blockers target known analytics domains. A reverse proxy sends the client request through a neutral first-party subdomain. PostHog reports a typical 10% to 30% increase in captured events, depending on the user base. See [deploy a reverse proxy](https://posthog.com/docs/advanced/proxy).

PostHog's managed proxy is free for PostHog Cloud. It needs DNS access and routes data through Cloudflare. Use a neutral host such as `e.example.com`. Avoid `analytics`, `tracking`, `posthog`, and `ph` in the host. Set the SDK `api_host` to the proxy and keep `ui_host` on PostHog.

For this Cloudflare stack, a Worker proxy is also possible. It adds Worker requests, an extra hop, logs and privacy decisions to operate, and another failure mode. It does not override consent, opt-out settings, or a blocker that blocks all first-party collection. Measure proxy delivery in browser network tools and in PostHog after deployment.

## 7. Ignore vanity dashboards

Do not use these as product health:

- pageviews and sessions after signup;
- raw signup totals without activation;
- DAU or MAU without a meaningful active event;
- total event volume;
- button clicks and average session duration;
- one blended retention number without cohort size and age;
- funnel conversion without a time window or step definition.

Use activation, time to value, meaningful return events, cohort curves, and confirmed revenue state. Use session replay to explain a drop-off. Do not use replay volume as a success metric.

## Checklist

- [ ] Confirm this is a post-acquisition product question, not a GA4 traffic question.
- [ ] Choose PostHog Cloud, or record the privacy and operations reason for self-hosting.
- [ ] Write the event plan before adding custom capture calls.
- [ ] Instrument and verify the activation event first.
- [ ] Use past-tense `object_action` names and stable event properties.
- [ ] Identify Better Auth users with `session.user.id`.
- [ ] Reset the client identity on logout.
- [ ] Use the same `distinct_id` on client and Worker events.
- [ ] Keep money and account-state events server-side.
- [ ] Build activation, funnel, retention, and cohort insights with fixed windows.
- [ ] Check the retention curve's flattening and cohort age.
- [ ] Set up and test a neutral first-party reverse proxy before production.
- [ ] Remove vanity metrics from the product-health dashboard.

## See also

- `launch-analytics` covers acquisition and traffic with GA4 and Microsoft Clarity.
- `launch-seo` covers Search Console, indexing, sitemap, and robots.txt.
