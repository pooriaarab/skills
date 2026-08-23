---
name: n8n-integration
description: "Build, publish, and get the verified badge for an n8n community node (the code under integrations/n8n/ — nodes/ + credentials/). Use when creating an n8n node, publishing it to npm so it's installable, debugging why n8n doesn't recognize the package, or submitting for the verified badge via the Creator Portal. Covers the three package.json fields that gate discovery (n8n-nodes- name, the community-node keyword, the n8n object with compiled dist/ paths), the npm-publish auth gotchas (automation token / 2FA / --ignore-scripts), the declarative credential authenticate block that centralizes auth, and the verified-badge hard cutoffs (npm provenance from 2026-05-01, zero runtime deps, the scanner, English-only). Sibling of connector-directory-submission (the cross-platform router) and zapier-integration. Verified 2026-08."
---

# Building an n8n community node

Two separate things: **(a) installable** the instant it's on npm (no review), and **(b) the
verified badge** — a Creator Portal review with hard requirements. Ship (a) first; the badge
is a slow second lap.

## Auth is declarative — centralize it in the credential

Unlike Zapier (imperative per-request auth), n8n attaches auth **declaratively** via the
credential's `authenticate` block, which n8n applies to every request that uses the
credential:

```ts
// credentials/ContentRabbitApi.credentials.ts
authenticate = {
  type: "generic",
  properties: { headers: { Authorization: "=Bearer {{$credentials.apiKey}}" } },
};
```

So there's no "every call 401s" trap like Zapier's — the credential owns auth. (Nodes may
also set the header explicitly; either works.)

## (a) Installable — npm auto-index, no review

`package.json` needs all three or n8n ignores the package:

```jsonc
{
  "name": "n8n-nodes-contentrabbit",          // MUST start with n8n-nodes- (or @scope/n8n-nodes-)
  "keywords": ["n8n-community-node-package"],  // the discovery keyword — omit it and n8n ignores it
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes":       ["dist/nodes/ContentRabbit/ContentRabbit.node.js"],       // compiled .js in dist/, NOT .ts
    "credentials": ["dist/credentials/ContentRabbitApi.credentials.js"]
  }
}
```

`npm publish` it. Users install by **package name** at Settings → Community Nodes → Install
(self-hosted + n8n Cloud). The Trigger node ships in the same package — one package = one
service, and a trigger node for that same service is allowed alongside the main node.

**npm-publish auth gotchas (these block the publish itself):**
- npm enforces 2FA on publish. Headless/agent → use an **automation token** (npmjs.com →
  Access Tokens → Classic **Automation**, or a Granular token with publish + bypass-2fa) —
  publishes without an interactive OTP. A read/stale token → `401 Unauthorized` (check
  `npm whoami`); a 2FA account without an automation token → `E403 … Two-factor
  authentication … required`.
- Set the token without clobbering `~/.npmrc`: write a temp file, pass `--userconfig <tmp>`.
- If `prepublishOnly` runs a build/lint you don't need (dist already built) and it fails on
  an unrelated rule, publish with **`--ignore-scripts`** (only when `dist/` is built +
  verified). Always `--access public`.
- Verify: `npm view <pkg> version`.

## (b) Verified badge — Creator Portal review (the gated lap)

Sign into the **n8n Creator Portal** and submit the package (the submission entry point —
not an email, not a repo PR). Docs:
`docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes`.

Requirements that cause silent rejection:
- **Provenance (hard cutoff): from 2026-05-01, verified nodes MUST be published via a
  GitHub Actions workflow with an npm provenance statement.** A node published from a local
  machine is rejected outright — the single most likely rejection now.
- **Zero runtime dependencies** — bundle what you need (unverified npm has no such limit;
  this bites only at verification).
- Must pass the scanner: `npx @n8n/scan-community-package n8n-nodes-contentrabbit` — run it
  before submitting.
- English-only for everything user-facing (params, descriptions, help, errors, README).
- Must not duplicate an existing node; must follow n8n UX guidelines; README required.
- n8n suggests scaffolding/maintaining with **`@n8n/node-cli`** so conventions match.

Verified nodes appear under **"More from the community"** in node search (owners can toggle
visibility); unverified nodes never appear in search — install-by-name only.
