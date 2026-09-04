# Phase plan and proof list

Model the migration as GitHub issues: one parent per phase, one child per route family. The
completion contract below is the spine.

## Phase 0 — Inventory (the regression net)

Build committed, generated inventories with a `--check` drift mode:

- **Route manifest** — every route source, its routable path, and its HTTP method exports; counts
  frozen in a test so an added route that isn't regenerated fails CI.
- **HTTP-caller inventory** — every server capability surface.
- **Dependency/feature inventory** — MDX plugin set, fonts, WASM/URL assets, image loader, static
  params — grouped by migration phase and owner.
- **Composed-routing partition** — which app (Next vs TanStack) owns each public path.
- **Perf baseline** — freeze the Next production numbers you must not regress; record packaged bytes.
- **Critical journeys + SLOs** — the corpus you verify in phase 9.

Wire `next-surface:check` (all the above) into a real CI job **before** the gate. A drift-check that
lives only in a local `ci` npm script guards nothing.

## Phase 1 — Proofs (build the smallest route that proves each)

Put proofs in a dir the router auto-globs for tests but that isn't wired into the app's public
routeTree unless the proof needs typed routing. Run under `@cloudflare/vitest-pool-workers`.

Required proofs (adapt to your platform):

1. Packaged-Worker parity harness (response-comparison engine).
2. Frozen performance baseline.
3. Auth/session continuity across the adapter swap.
4. All four composed-Worker states (Next-only, TanStack-only, both, neither) — no owned URL changes.
5. Security request contracts (CSP not weakened; headers preserved).
6. Native platform bindings (D1/KV/R2/queues) resolve in the shell.
7. Cache behavior + private/tenant isolation.
8. Compiler & asset parity — React Compiler output, MDX plugins, fonts + `font-display`, WASM `?url`
   / module imports, image allowlist on the SSR response, OG image, code-splitting, bundle bytes.
9. tRPC / server-function transport round-trips.
10. Request cancellation reaches the handler. (Careful: aborting the client fetch discards the
    response — assert the in-flight request *rejects*, don't try to read a body from an aborted one.)
11. Signed-webhook byte contracts (e.g. Ed25519 over the exact original bytes).

**Verify a proof by its exit code, not the absence of log noise.** Some platform warnings (e.g.
runtime-WASM rejections) print as unhandled errors while the test still exits 0.

## GO/STOP gate

One decision doc. First non-heading line is exactly `GO` or `STOP`. Table of: proof id, attempts
(0–2), result (pass/fail), residual risk, owner. Stop conditions (any one true after two focused
remediations → STOP, not a waiver): sessions can't survive the swap; CSP must weaken; signed
webhooks can't verify original bytes; a composed state changes an owned URL; cache isolation can't
be proved; a required binding can't run; a proof shell exceeds a platform limit.

## Phases 2–11

- 2: marketing/support/legal (static, lowest risk — start here to build the conversion muscle).
- 3: auth, tenancy, application shell.
- 4: posts / scheduling / content.
- 5: media / generation / knowledge.
- 6: integrations / publishing.
- 7: engagement / analytics / automations.
- 8: teams / accounts / billing / admin.
- 9: full-system verification against the journey+SLO corpus.
- 10: cut the apex over to TanStack (gradual, watch each family).
- 11: purge Next + OpenNext source and infra. Only now delete the old page sources.
