---
name: agentic-cli-npm-package
description: "Scaffold and ship a companion tool for agentic coding CLIs (Claude Code, Codex, Gemini, and others) as one package with three faces — a CLI, an npm library, and an MCP server — sharing a model-preference cascade core, and auto-publishing to npm on a release branch. Use when building a Claude-Code/Codex companion, a `vibe*`-style tool, or any CLI+npm+MCP package that should work with the user's own keys and fall back to on-device. Fills the gap between build-from-template (generic scaffold) and ship-a-product (launch orchestration) for the specific CLI+npm+MCP+cascade shape. Empirical, from shipping 7 packages in one run."
---

# agentic-cli-npm-package

Three faces, one engine. A companion for agentic coding CLIs ships as a **CLI** (`npx tool`), an **npm library** (programmatic API), and an **MCP server** (so the agent itself can drive it). All three are thin wrappers over one product engine, which sits on a shared **cascade core**. Chains after `build-from-template`, before `ship-a-product`.

## 1. The shape

```
package/
  src/index.ts   library API (pure where possible — the testable core)
  src/cli.ts      #!/usr/bin/env node — arg parse → calls index
  src/mcp.ts      @modelcontextprotocol/sdk stdio server → calls index
  src/*.test.ts   vitest; the pure logic is where the real tests live
  .github/workflows/publish.yml
```

`package.json` essentials:
- `"bin": { "tool": "./dist/cli.js" }` — the installed command stays bare (`tool`) even when the package is scoped (`@scope/tool`). Scope the package, not the command.
- `"build": "tsup src/index.ts src/cli.ts src/mcp.ts --format esm --dts --clean"` — three entry points, one build.
- `"files": ["dist"]`, `"publishConfig": { "access": "public" }`, `"type": "module"`, `engines.node >=18`.
- Deps: the cascade core + `@modelcontextprotocol/sdk`. Add `@types/node` to devDeps **from the start** — a CLI touches `process`/`setInterval`/`node:*` and typecheck fails without it. Set `"types": ["node"]` in tsconfig.

## 2. The model-preference cascade (why these tools feel good)

Don't hardcode a provider. A product declares a *capability* (`audio`, `video`, `usage-read`, …); the core resolves it in a fixed order:

1. **reuse the agent's existing provider** if it already has one for that capability,
2. **a key the user brings** for that capability,
3. **on-device / local** — works offline, no key, the guaranteed floor.

Ship v0 on **tier 3** (local): it works for everyone with zero setup, and you add the paid tiers behind the same call later. Gate tiers 1–2 behind a consent record so "no data out" is enforceable, not a slogan.

## 3. Scaffold first, then delegate the src

The scaffold (package.json, tsconfig, workflow, LICENSE, .gitignore) is judgment work — do it yourself once, then reuse it verbatim across sibling packages. Only `src/` + README is worth delegating to a worker. Give the worker: the capability to build on, the exact `src/index.ts`/`cli.ts`/`mcp.ts` responsibilities, a "definition of done" (`npm run build && typecheck && test` all green), and "touch only src/ + README". Verify every worker diff yourself: build, typecheck, test, **and run the real CLI** (tests passing ≠ the binary works).

## 4. Publish pipeline: main = staging, release = production

`publish.yml` triggers on push to `release`, guards on version, publishes:

```yaml
name: publish
on: { push: { branches: [release] }, workflow_dispatch: {} }
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test --if-present
      - name: Publish if version is new
        run: |
          NAME=$(node -p "require('./package.json').name")
          VER=$(node -p "require('./package.json').version")
          npm view "$NAME@$VER" version >/dev/null 2>&1 \
            && echo "already published — skipping" \
            || npm publish --access public
        env: { NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN }}" }
```

Set the `NPM_TOKEN` secret once per repo (`gh secret set NPM_TOKEN --repo owner/name`). The version guard makes re-runs idempotent (no "cannot publish over existing version" failures).

## 5. Naming: check npm before you commit to a name

Bare names are usually taken. Check `npm view <name>` and `npm view @scope/<name>` up front. If taken by someone else, publish under **your own user scope** (`@you/name`) — always available, collision-free, and the `bin` keeps the command bare. Check package-name availability the same session you check the domain.

## 6. Gotchas (each cost a cycle)

- **Registry read-side lags the publish** by minutes on a brand-new scope. The Actions log showing `+ @scope/name@x.y.z` means it published; a 404 right after is propagation, not failure. Poll the registry, don't re-publish.
- **A pre-push guard that blocks pushing to `main`** evaluates the *current* branch before your command runs — `git checkout -b feat` and `git push` in one shell line still trips it. Branch in one step, push in the next. Create the long-lived `release` branch via the host API (`gh api .../git/refs`), not a local push.
- **Scoped packages need `--access public`** or they publish private and fail on a free account.
- **A worker that writes the files but never commits** (some headless CLIs don't exit cleanly): if the output builds + tests green, take over — commit it yourself; don't wait on a hung process.

## 7. Then

`open-source-repo-prep` → `launch-video-generation` (the HyperFrames $0 path renders a distinct native-UI-style video per tool) → `social-launch-post`. See `ship-a-product` for the full chain.
