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
    runs-on: ubicloud-standard-2   # private pooriaarab/* repos run every job on Ubicloud; this one just waits on the npm API
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

- **CRITICAL — a tsup-built ESM CLI silently no-ops under `npx` / global install.** The standard main-module guard `if (import.meta.url === pathToFileURL(process.argv[1]).href) main()` works via `node dist/cli.js` but exits 0 with zero output when run through the installed bin: npm links the bin as a **symlink**, so `process.argv[1]` is the symlink path while `import.meta.url` resolves to the real path — they never compare equal and `main()` never runs. Fix: resolve the symlink first — `import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href` (`realpathSync` from `node:fs`). Do NOT "fix" it by calling `main()` unconditionally — that runs `main()` when tests import `cli.ts`, and its `process.exit` crashes vitest ("process.exit unexpectedly called"). After the change: run the tests before republishing, and verify the real failure mode by symlinking `dist/cli.js` into `/tmp` and executing the symlink — plain `node dist/cli.js` never reproduces it.
- **Registry read-side lags the publish** by minutes on a brand-new scope. The Actions log showing `+ @scope/name@x.y.z` means it published; a 404 right after is propagation, not failure. Poll the registry, don't re-publish.
- **A pre-push guard that blocks pushing to `main`** evaluates the *current* branch before your command runs — `git checkout -b feat` and `git push` in one shell line still trips it. Branch in one step, push in the next. Create the long-lived `release` branch via the host API (`gh api .../git/refs`), not a local push.
- **Scoped packages need `--access public`** or they publish private and fail on a free account.
- **A worker that writes the files but never commits** (some headless CLIs don't exit cleanly): if the output builds + tests green, take over — commit it yourself; don't wait on a hung process.
- **npm typosquat protection blocks hyphen-only variants** (403 "too similar to existing package"). If the bare name is taken, a mere hyphen variant (`viberadio` → `vibe-radio`) is still refused — the registry normalizes both to the same string. Only a real distinguishing suffix clears it (`viberadio-fm`, `vibeshare-live`); `-cli` works too.
- **`npm unpublish` requires a 2FA OTP even with an automation token** — `npm publish` does not. There is no non-interactive way to delete a published package; `npm deprecate <name>@<version> "<message>"` is the token-only fallback.
- **Reading `package.json` in `tsup.config.ts` via an import assertion breaks across Node versions** — `import pkg from './package.json' assert { type: 'json' }` (and the newer `with { type: 'json' }`) is a moving target; Node 25 rejects the old spelling. Use `JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))` in the config — no syntax churn. (Verified on adscapi, Node 25.)
- **Baking the version via a tsup `define` needs a non-`await` fallback for vitest.** `define: { __X_VERSION__: JSON.stringify(pkg.version) }` replaces the token at build, but under vitest (no build) the token is undefined. Resolve it as `typeof __X_VERSION__ !== 'undefined' ? __X_VERSION__ : createRequire(import.meta.url)('../package.json').version` — `typeof` on an undeclared identifier is safe (no ReferenceError), and staying synchronous avoids a top-level `await` in a library entry (which some downstream bundlers choke on).
- **Give the MCP bin its OWN entry file** (`src/mcp-bin.ts` → `import { startMcp } from './mcp'; startMcp()`), separate from `src/mcp.ts`. tsup code-splitting rewrites module URLs, so the symlink main-guard above is fragile for the MCP bin; a dedicated entry that just calls `startMcp()` sidesteps the guard entirely. Point the `adscapi-mcp` bin at `dist/mcp-bin.js`.
- **For an SDK that fans out to many destinations, adapters must THROW, not swallow.** If you extract adapters from a fire-and-forget backend (which logs + swallows so a failed pixel never breaks the request), flip them: throw on non-2xx so the SDK's client layer can retry + report a per-destination result. A swallowing adapter makes retries and `{ platform, ok, error }[]` results impossible. (adscapi extraction, from replytosocial.)

## 7. Then

`open-source-repo-prep` → `launch-video-generation` (the HyperFrames $0 path renders a distinct native-UI-style video per tool) → `social-launch-post`. See `ship-a-product` for the full chain.
