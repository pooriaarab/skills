---
name: pipedream-integration
description: "Build and submit Pipedream components (actions and sources under components/<app>/) via a pull request into the PipedreamHQ/pipedream monorepo. Use when creating Pipedream actions/sources for a service, structuring the component directory, getting the app file's shared auth right, or fixing a PR that fails their eslint or bounces in review. Covers the two-artifact submission (an [APP] issue first, then the components PR), the exact directory layout, the ES-module-only rule, the globally-unique namespaced key convention, the annotations block their linter requires and the destructiveHint semantics people get wrong, the agent-readable description bar their reviewers hold you to, the 64-character dedupe-id cap, the polling-source checkpoint bug that silently drops events, and the app-file _makeRequest/_headers auth pattern. Sibling of connector-directory-submission, powerplatform-connector and zapier-integration. Verified against a live submission 2026-08."
---

# Building Pipedream components

The registry IS the monorepo — publishing means a merged PR to `PipedreamHQ/pipedream` under
`components/`. Full rules: `pipedream.com/docs/components/guidelines` plus the monorepo
`CONTRIBUTING.md`.

## Submission is two artifacts, in order

1. **An `[APP] <Name>` issue.** Pipedream scaffolds the app entry from it. Open this first.
2. **The components PR.** A bot labels it `User submitted`, thanks you, posts the guidelines
   checklist, and says the team has been notified.

Reviewers work a backlog, so a PR with unanswered review findings sits. Clearing the findings is
what moves it, not pinging.

## Run their eslint before you open the PR

Not after. A first submission of 21 components hit **66 errors** on Pipedream's own config,
which would have bounced on sight:

```bash
npx eslint components/<app>
npx eslint components/<app> --fix   # most of it is formatting
```

Most were formatting the registry enforces — `object-curly-newline`, `object-property-newline`,
`eol-last`, `multiline-ternary`. The one that mattered was **`pipedream/action-annotations`:
every action must declare an `annotations` object**, and all 17 were missing it.

Also add the `package.json` the registry expects in an app directory, and **check every
documentation link resolves**. Twenty links pointed at a docs path that 404s.

## annotations: destructiveHint is about permanence, not mutation

Set them from real behaviour. This is the one reviewers correct most:

- `readOnlyHint: true` — list, get, analytics. Anything that only reads.
- `destructiveHint: true` — **only permanently destructive**. Delete. Publishing to a social
  network, because you cannot unpublish.
- `destructiveHint: false` — anything a later call reverses. Update and patch. Schedule.
  Unschedule. Content Rabbit marked all three `true` and was corrected on all three.
- `openWorldHint: true` — the action reaches an external service.

## Descriptions are read by agents, and reviewed as such

An AI agent picks an action from its description alone, so "state the operation" is not enough.
Each description needs purpose, when to use it, input formats, and the gotcha. Concretely:

- Say what is irreversible, and name the action to use instead when there is a gentler one.
- Say what a field defaults to when omitted.
- Say whether a write **replaces or appends**. Content Rabbit's attach-media overwrote a
  platform's media list while its description implied it added to it.
- **Non-obvious IDs need an inline example and where to get it** — name the action that returns
  it, and show the shape (`550e8400-e29b-41d4-a716-446655440000`).
- **Date and timestamp props need a concrete ISO 8601 example** (`2026-08-28T14:30:00Z`), and a
  word on whether a UTC offset is accepted. Check the server's schema before you claim either.

Where a prop is a closed set, do not document the values — point the prop at a `propDefinition`
with async `options()` so the user picks from what their account actually has. That cannot drift.

## Two correctness rules that are easy to miss

**Constructed dedupe ids must not exceed 64 characters.** `${id}-${timestamp}` looks short until
an id grows. An id that gets truncated stops deduplicating, so hash the parts to a fixed length:

```js
id: createHash("sha1").update(`${post.id}-${revision}`).digest("hex"),  // 40 chars, deterministic
```

**A polling source must drain its window before advancing the checkpoint.** The failure is
quiet and total. If your API returns newest-first, caps at `limit`, and offers no cursor, then a
single request per poll means: the page stays full, the checkpoint never advances, and every
delivery older than one page falls outside the window forever. Simulated against a 30-event
window with `limit=5`, the source emitted **5 of 30** and its checkpoint never moved.

Walk the window backwards instead — each pass pulls `end` back to the oldest record already
seen, until a pass returns a short page. Bank the checkpoint only once the window is drained:

```js
if (items.length < limit) return { deliveries: collected, drained: true };
const nextEnd = new Date(oldestTs).toISOString();
if (nextEnd === end) break;   // a whole page shares one timestamp; stop rather than spin
end = nextEnd;
```

Cap the passes, and guard the equal-timestamp case, or a busy window becomes an infinite loop.

## Throw ConfigurationError for pre-call validation

Anything you reject **before** the API request is a user-configuration problem:

```js
import { ConfigurationError } from "@pipedream/platform";
if (!this.mediaIds?.length) throw new ConfigurationError("mediaIds must contain at least one media ID.");
```

A plain `Error` there reads to Pipedream as a runtime failure. Errors after a request stay as they are.

## Auth is centralized in the app file

Define it once; every action and source routes through it:

```js
// components/contentrabbit/contentrabbit.app.mjs
_headers() {
  return { Authorization: `Bearer ${this.$auth.api_key}`, "content-type": "application/json" };
},
async _makeRequest({ $ = this, path, ...opts }) {
  return axios($, { url: `${this._baseUrl()}${path}`, headers: this._headers(), ...opts });
},
```

Never a raw `fetch`/`axios` that bypasses `_headers()`. Auditing a connector? Grep the actions
for raw HTTP calls; any that skip the app helper are the auth gap.

## Layout (exact, or the PR bounces)

```
components/<app>/
  <app>.app.mjs                               # shared auth + prop definitions
  sources/<event>-instant/<event>-instant.mjs # sources = triggers, past-tense key
  actions/<verb>-<thing>/<verb>-<thing>.mjs   # actions, active-verb key
  package.json
```

- **ES modules only** — `.mjs`, `export default`. Not `.js`.
- Each **`key`** is globally unique and namespaced: `contentrabbit-create-post` (action, active
  verb) / `contentrabbit-post-published` (source, past tense). This key gates registry identity;
  a duplicate or mis-shaped one fails review.
- Required per component: `key`, `name` (friendly, singular, title-case, **no app name in it**),
  `version` (start `0.0.1`), `description`, `type`. Actions add `annotations`.
- Bump `version` when you change a component's behaviour, not for a description edit.

## Expect a CodeRabbit review, and answer it

`coderabbitai` reviews these PRs and human reviewers read its findings. It checks the
repository's own path instructions, so it catches the annotation semantics, the 64-character
cap, and the description bar described above. Treat every finding as either fixed or explicitly
skipped with a reason — an unanswered Major is why a PR stalls.

## Related skills

- `powerplatform-connector` — the same "PR into someone's monorepo" shape, slower, and gated on
  a CLA signature.
- `connector-directory-submission` — the router across automation directories.
- `zapier-integration`, `make-integration` — the same job on portals that need a login.
