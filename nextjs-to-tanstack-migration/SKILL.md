---
name: nextjs-to-tanstack-migration
description: "Use when migrating a Next.js App Router app (especially on Cloudflare Workers/OpenNext) to TanStack Start + Vite, or planning such a migration. Covers the proof-first phase plan that de-risks a big-bang rewrite (inventory the surface, prove every build-sensitive capability, then a GO/STOP gate before bulk conversion), the gradual composed-apex cutover (run both apps behind one Worker, delete Next source last), and the concrete route-conversion patterns that make each page-family a small PR — import the Next page component/MDX in place (no fork), import.meta.glob registries for large families, splat routes for MDX trees, and reading metadata vs frontmatter for the document head. Also the traps that each cost a real CI round-trip: routeTree.gen.ts counts toward a per-PR size cap (batch individual routes), 'use client' + useSearchParams / *.client islands can't be imported in place, runtime WebAssembly.instantiate is banned on Workers, and the @/ path alias must be wired into the Vite/tsconfig of every app that imports shared components. Triggers: 'migrate Next.js to TanStack', 'Next App Router to TanStack Start', 'TanStack Start on Cloudflare', 'createFileRoute', 'import.meta.glob routes', 'OpenNext to Vite', 'port marketing site to TanStack', 'routeTree too big', 'MDX in TanStack'."
---

# nextjs-to-tanstack-migration

Migrating a real Next.js App Router app to TanStack Start + Vite is not a rewrite you do in one
branch. Done well it is a long sequence of small, independently-shippable PRs behind a feature of
the platform — a composed Worker — that lets the old and new app serve traffic side by side while
you cut over route family by route family. This skill is the playbook, distilled from converting a
~270-page production marketing app on Cloudflare Workers.

Two ideas carry the whole thing:

1. **Prove before you convert.** The expensive failures are not "this page didn't port" — they are
   "the framework can't do X on this platform at all" (SSR streaming, a required binding, a WASM
   asset, a signed-webhook byte contract, cache isolation). Find those in week one with tiny proof
   routes, not in month three with half the app converted.
2. **One apex, two apps.** Put a thin composed Worker at the domain that routes each path to either
   the Next app or the TanStack app by an ownership table. Convert a family, flip its paths, watch
   it, move on. The Next source stays until its paths have been the apex long enough to trust.

## The phase plan

Run these as GitHub issues, each phase a parent with per-family children. Do not start bulk
conversion (phase 2+) until the gate passes.

- **Phase 0 — Inventory.** Generate a frozen, committed inventory of the surface you must preserve:
  every route and its HTTP methods, every server capability (bindings, caches, webhooks, cron), the
  compiler/asset features in use (MDX plugin set, fonts, WASM, image loader), and a route→SLO
  corpus. Make a `--check` mode that fails CI when the real tree drifts from the committed
  inventory. This is your regression net for the whole migration.
- **Phase 1 — Proofs.** For each risky capability, build the smallest possible TanStack route that
  proves it works on the target platform (a `probe-*` route). Session continuity, four composed
  Worker states, security request contracts, native bindings, cache/tenant isolation, compiler &
  asset parity, tRPC/server-function transport, cancellation, packaged Worker size. Run them in a
  Workerd test pool (`@cloudflare/vitest-pool-workers`).
- **GO/STOP gate.** One decision doc that lists each proof, its result, residual risk, and a
  first-line `GO` or `STOP`. Do not waive a failed foundational proof. See `reference/phase-plan.md`.
- **Phases 2–8 — Convert by domain.** Marketing/support/legal first (mostly static, lowest risk),
  then auth/shell, posts, media, integrations, engagement, billing. One route family per PR.
- **Phases 9–11 — Verify, cut over, purge.** Full-system verification, flip the apex to TanStack,
  then delete the Next/OpenNext source and infra.

**Enforce the proofs in CI before the gate, or the gate is hollow.** A drift-check that only runs in
a local `ci` script catches nothing — the fleet will merge new routes straight past it. Wiring the
proof suite into an actual required-ish CI job is what surfaces the proofs that rotted since they
were written (it caught two dead proofs the day it went live for us).

## Converting a route family — the pattern that makes each one a small PR

The Next `page.tsx`/`page.mdx` files are thin wrappers; the real components usually live elsewhere
(often a shared package reached through a `@/` alias). So **import the Next page in place and render
it — never fork the content.** A TanStack route becomes ~12 lines:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "../app/(marketing)/pricing/page";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [{ title: metadata.title }, { name: "description", content: metadata.description }],
  }),
  component: () => <Page />,
});
```

Scale it by family (`reference/conversion-patterns.md` has all of them):

- **Uniform family (many pages, one template)** → one dynamic `$slug` route + an
  `import.meta.glob` registry. The glob keeps the registry ~40 lines no matter how many pages, and a
  single dynamic route keeps the routeTree delta tiny. This turned a 91-page family from a 700-line
  PR into a 210-line one.
- **MDX tree (docs/support articles at mixed depths)** → a splat route (`$.tsx`) + a glob over
  `**/page.mdx`, keyed by URL path. Read the document head from `frontmatter` (MDX frontmatter) or
  the `metadata` export — check which the pages use; they differ.
- **Bespoke top-level pages (`/`, `/pricing`, `/about`)** → one route file each. There is no shared
  dynamic route for distinct top-level paths.

## The traps (each cost a real round-trip)

- **`routeTree.gen.ts` counts toward a per-PR line cap.** Individual route files each add ~20 lines
  of generated router types. ~10 routes ≈ a 200-line routeTree delta — batch individual-route
  families in groups of ≤10, or the "small" PR blows the cap on generated code you didn't write. A
  single dynamic/glob route sidesteps this entirely (its routeTree delta is ~2 lines).
- **`"use client"` + `useSearchParams()` / imports of a `*.client` island can't be imported in
  place** — outside the App Router there is no navigation context and the shell build rejects client
  islands. These need a TanStack-native rewrite (router search params). Skip them, keep going, file
  a follow-up issue per page; don't fork them into the bulk PR.
- **Runtime `WebAssembly.instantiate(bytes)` is banned on Cloudflare Workers.** Anything doing OG
  image rendering / resvg / satori by fetching a `.wasm` and instantiating it at runtime will fail
  in the Workerd test pool *and* in production. Import the `.wasm` as a module so it's compiled at
  deploy. (Non-fatal as unhandled-rejection noise in some proofs — verify the test's *exit code*,
  not just the absence of errors.)
- **The `@/` path alias must be wired into every app's Vite + tsconfig**, not just Next's. A
  marketing app that imports shared components through `@/` needs `resolve.alias` in `vite.config.ts`
  and `paths` in `tsconfig`, with a regex that doesn't swallow `@scope/pkg` imports.
- **Regenerate the inventories on every rebase.** Main moves under you; each conversion PR needs a
  rebase + full inventory regeneration + routeTree rebuild before it's mergeable. Bake this into the
  merge loop.
- **Don't delete Next sources during conversion.** The composed-apex cutover needs both paths alive.
  Deletion is the final phase, after the Worker has been the apex long enough.

## The delegation loop

This is a fan-out-able campaign: each family is an isolated, well-specified unit of work.

1. Open the issue (the join key), spec the family with the exact pattern to copy and the skip rules.
2. Implement in an isolated git worktree cut from `origin/main` (a junior CLI or subagent; keep the
   reviewer's context lean).
3. Review the diff, then verify with the real commands: `tanstack:typecheck`, `tanstack:package`
   (dry-run wrangler deploy), the family's Vitest, and the inventory drift-check.
4. Rebase on latest main, regenerate all inventories + routeTree, confirm size under the cap, push.
5. If an LLM PR-review bot auto-commits to the branch, let it converge to a clean state rather than
   fighting it commit-by-commit, then merge the moment the gate checks are green.

See `reference/conversion-patterns.md` and `reference/phase-plan.md` for the concrete templates,
the proof list, and the merge-loop checklist.
