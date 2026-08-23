---
name: pipedream-integration
description: "Build and submit Pipedream components (the code under integrations/pipedream/components/) via a PR into the PipedreamHQ/pipedream monorepo. Use when creating Pipedream actions/sources for a service, structuring the component directory, getting the app file's shared auth right, or fixing a PR that fails CI/lint or bounces on a mis-shaped component key. Covers the exact directory layout, ES-module-only rule, the globally-unique namespaced key convention, required per-component metadata + annotations, the app-file _makeRequest/_headers auth pattern, and the fork-branch-PR-to-master submission flow. Sibling of connector-directory-submission (the cross-platform router) and zapier-integration. Verified 2026-08."
---

# Building Pipedream components

The registry IS the monorepo — publishing = a merged PR to `PipedreamHQ/pipedream` under
`components/`. Full rules: `pipedream.com/docs/components/guidelines` + the monorepo
`CONTRIBUTING.md`.

## Auth is centralized in the app file

Pipedream attaches auth declaratively via the app object's request helper — define it once,
and every action/source routes through it (no per-request 401 trap like Zapier):

```js
// components/contentrabbit/contentrabbit.app.mjs
_headers() {
  return { Authorization: `Bearer ${this.$auth.api_key}`, "content-type": "application/json" };
},
async _makeRequest({ $ = this, path, ...opts }) {
  return axios($, { url: `${this._baseUrl()}${path}`, headers: this._headers(), ...opts });
},
```

Every action/source imports the app and calls `this.app._makeRequest(...)` — never a raw
`fetch`/`axios` that bypasses `_headers()`. (Auditing a connector? Grep the actions for raw
http calls; any that skip the app helper are the auth gap.)

## Layout (exact, or the PR bounces)

```
components/contentrabbit/
  contentrabbit.app.mjs                       # the app file (shared auth + prop defs)
  sources/<event>-instant/<event>-instant.mjs # sources = triggers, past-tense key
  actions/<verb>-<thing>/<verb>-<thing>.mjs   # actions, active-verb key
  package.json
```

- **ES modules only** — `.mjs`, `export default`. Not `.js`.
- Each component's **`key`** is globally unique and namespaced: `contentrabbit-create-post`
  (action, active verb) / `contentrabbit-post-published` (source, past tense). A dup or
  mis-shaped key fails review — this key gates registry identity.
- Required metadata per component: `key`, `name` (friendly, singular, title-case, **no app
  name in it**), `version` (start `0.0.1`, semver), `description`, `type` (`"action"` or a
  source type). Actions add `annotations` (`readOnlyHint`, `destructiveHint`,
  `openWorldHint`).
- Props: mirror the app's UI labels, describe with markdown, use async options for ID
  pickers, minimize required fields.

## Submit

Fork → branch → PR to `master`. A Pipedream team member is auto-notified. CI runs lint
(`npx eslint components/contentrabbit`; `--fix` to autofix) + other checks — a red PR won't
be looked at. Once merged, components appear in the app registry for anyone to run. Free,
but review is real and can ask for changes.
