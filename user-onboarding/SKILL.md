---
name: user-onboarding
description: "Design or improve the first-session experience in a web product so new users reach a defined value event faster. Use when the user asks to 'fix activation', 'improve onboarding', 'shorten time to value', 'design the first-run experience', 'reduce signup friction', 'improve new-user activation', or asks 'what should happen after signup'. Do not use for cold-DM bot setup, product event taxonomy, or lifecycle email sequences; point to `messaging-bot-onboarding-setup`, `product-analytics`, and `lifecycle-email`."
---

# User Onboarding

The headline decision: define the activation event before designing the onboarding flow.
Every screen, field, and message must shorten the path to that event.

## 1. Define the activation moment first

Activation is the first observable action that proves the user received the value they came for.
Write it as one event, with a clear success condition and a time window.

Good examples:

- A writing app: `first_document_exported` after the user creates and exports useful content.
- An analytics app: `first_report_generated` after the user sees a report from real data.
- A team app: `first_teammate_invited` only if collaboration is the promised value.

Bad examples:

- `profile_completed`: users rarely join to complete a profile.
- `user_logged_in`: access proves nothing about value.
- `onboarding_finished`: the product defines the event instead of the user outcome.

Use one event for the primary activation moment. Do not make a checklist of unrelated successes.
Give the event a window, such as `first_report_generated` within seven days of signup.
`product-analytics/SKILL.md` owns event names, properties, identity, funnels, and activation reporting.
Ask that skill to instrument the event after this skill defines what it means.

## 2. Time to value is the metric

Measure elapsed time from `user_signed_up` to the activation event.
Report the median, the activation rate within the chosen window, and the largest drop-off step.
Judge each design decision by one question: does it shorten this path for the right user?
Remove a step when it does not help the user reach value or protect the product.
Do not celebrate a faster flow if it produces empty projects or low-quality activation.

Use a simple journey map:

`signup` → `first meaningful input` → `processing` → `useful result` → `activation`

Name the wait, input, and result for the actual product. Do not use generic steps such as “engage”.
Keep setup work after activation when the user can learn it from the first result.

## 3. Delete steps before improving them

The most reliable onboarding improvement is removing a field, screen, choice, or required decision.
Do not polish a step that should not exist.
Before each required step, ask whether the product needs the data, can use a safe default, collect it
later, or infer it from the user's meaningful action.

Require only what blocks the next useful action. A source connection, file upload, or workspace
name may be necessary. A biography, avatar, team size, notification preference, or billing detail
usually can wait.
Email verification rarely creates product value. Defer it when the product can safely let the user
reach value first. Require it before risky actions, recovery, invitations, or other trust boundaries.
Follow the product's security and abuse rules when the action cannot safely wait.

Do not create an onboarding step only because a database column exists. Store optional data later.

## 4. Treat the empty state as the new user's product

A blank screen makes the product look broken. A decorative illustration does not explain the next action.
The empty state must show status, explain the value, and provide one direct path forward.

Use one of these patterns:

- **Seeded demo:** show realistic data and label it clearly as sample data.
- **Template:** start a real project from a useful template the user can edit.
- **Guided input:** show the exact input needed to produce the first result.
- **Import path:** let the user bring existing work when that is faster than starting empty.

Make demo data disposable. Let the user replace it without learning cleanup operations.
Label sample data clearly, provide a reset action, and prefer one strong default over a template gallery.
NN/g recommends empty states that communicate status, teach the system, and provide direct paths
to key tasks. See [Designing Empty States](https://www.nngroup.com/articles/empty-state-interface-design/).

## 5. Use checklists, tours, and tooltips only when they earn their cost

Onboarding UI adds work. It can hide confusing navigation and teach features before users need them.
Use a **checklist** when several independent actions lead to durable value and users need visible
progress. Mark an item complete from the real product event, not from a button click.

Use a **tour** only when users must understand a spatial relationship that the interface cannot
make clear during the task. Let users skip it, replay it, and continue without memorizing it.

Use a **tooltip** at the point of confusion for a non-obvious control. Keep it next to the control.
Do not use a tooltip to explain a label that the interface should simply improve.

Prefer contextual help over a forced tour. NN/g advises using onboarding tutorials for complex
workflows and contextual help for details at the moment of need. See [Onboarding Tutorials vs.
Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/).

## 6. Apply progressive disclosure

Show the few choices needed for the current task. Hide advanced options until users ask for them.
Ask one question at the moment it changes the next screen or result. Explain why the answer matters.
Do not ask for information only because it might be useful someday.

Use a safe default when the cost of a wrong choice is low. Let users revise it after activation.
Use staged flow only when steps depend on previous results. Keep a visible back path and preserve data.

Progressive disclosure fails when the hidden option is needed often or the reveal control is vague.
Label it with the outcome, such as “Set report filters”, not “Advanced”.
See [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) for the usability tradeoff.

## 7. Reduce sign-up friction without hiding trust boundaries

Make the first useful action possible before account creation when it is safe.
Let an unauthenticated user try a template, draft a local example, or preview a result.
Ask for an account when saving, syncing, sharing, exporting, or using a paid resource requires it.

Offer email and a small number of relevant social providers. Social sign-in removes typing, but not
account linking, recovery, provider outages, or email trust decisions. Keep email visible and usable.

For Better Auth, configure supported providers, then call `signIn.social`.
Test new, returning, and matching-email accounts. Review linking before enabling automatic linking.
See [Better Auth OAuth](https://better-auth.com/docs/concepts/oauth) and [Better Auth user accounts](https://better-auth.com/docs/concepts/users-accounts).

Do not ask for a credit card before value unless the product must charge first.
This changes who activates and adds payment and trust concerns to the first product task.

Do not collect a full profile during signup. Ask for details only when they change the first result.
Store each answer with a version so later flows remain comparable.

## 8. Instrument every step

Fire one event when each required step starts and one when it succeeds.
Use product events to expose the exact drop-off, not a single `onboarding_completed` event.

An example flow is:

`user_signed_up` → `template_selected` → `first_input_submitted` → `result_viewed` → `first_value_reached`

Use the same identity across the browser and Worker. Record `onboarding_version` on every step.
Keep private user content out of event properties.

Derive completion from the real state change. A “finish” click is not activation.
Capture server-side when a D1 write, generated result, or entitlement proves the action happened.
Use D1 prepared statements with `prepare`, `bind`, and `run` for durable step state. See [D1 Worker API](https://developers.cloudflare.com/d1/worker-api/).

In Next.js, treat Server Functions as public POST entry points. Check the Better Auth session and
authorization inside every mutation. Do not trust browser claims. See [Next.js mutating data](https://nextjs.org/docs/app/getting-started/mutating-data).

## 9. Keep product nudges and email in their proper places

Use in-product guidance when the user is active and the next action is visible.
Use email when the user has left and a useful return path exists.

In-product nudges show missing input, restore drafts, or explain the next result.
Lifecycle email can remind the user about that path after a meaningful delay.

`lifecycle-email/SKILL.md` owns welcome and activation sequences, consent, suppression, exit conditions,
and email measurement. Do not build a second email taxonomy here.

Stop an activation email immediately after the activation event. Recheck the exit condition before
every send. An activated user must never receive an activation reminder.

## 10. Test changes honestly with small numbers

Start with five to eight new users in moderated sessions. Watch the real first task without coaching.
Record where they stop, what they expect, and whether the result meets their stated goal.

Use a before-and-after cohort comparison when random traffic is too low.
Keep the event, window, audience, source, and number of complete days stable.

Record activation rate, median time to value, completion quality, and support questions.
Mark small-cohort comparisons as directional. Do not call a noisy lift a proven effect.

Use a randomized A/B test only when enough users reach activation in both variants.
Choose one primary metric, keep assignment stable per user, and avoid tiny segments.
Amplitude explains that sample size depends on the effect you need to detect. See [Experiment key terms](https://amplitude.com/docs/feature-experiment/key-terms).

If numbers are too small, prefer user sessions, interviews, or a staged rollout.
Ship the clearest improvement, then watch the next cohort for harm to activation quality and retention.

## Checklist

- [ ] Define one activation event that represents the user's promised value.
- [ ] Add a time window from `user_signed_up` to activation.
- [ ] Map every required step between signup and the activation event.
- [ ] Delete fields, screens, and choices that do not block the next useful action.
- [ ] Defer email verification when security and abuse controls allow it.
- [ ] Replace blank screens with seeded data, templates, or a direct input path.
- [ ] Make sample data clear, editable, and easy to remove.
- [ ] Use checklists, tours, and tooltips only for a proven information gap.
- [ ] Reveal advanced choices only when the current task needs them.
- [ ] Let users reach safe value before account creation when possible.
- [ ] Offer a usable email path beside relevant Better Auth social providers.
- [ ] Defer profile fields, payment details, and preferences until they change the next action.
- [ ] Instrument each required step with the shared taxonomy from `product-analytics`.
- [ ] Verify completion from server state, not a client button click.
- [ ] Check the Better Auth session inside every Next.js mutation.
- [ ] Keep activation email triggers and exit conditions in `lifecycle-email`.
- [ ] Run moderated sessions before relying on a small cohort comparison.
- [ ] Use one primary metric and stable cohorts for any A/B test.
- [ ] Mark small-sample results as directional and monitor the next cohort.
