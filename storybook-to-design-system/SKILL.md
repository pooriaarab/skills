---
name: storybook-to-design-system
description: "Turn co-located Storybook stories into a live in-app design-system gallery page (route name is yours to pick — e.g. /design-system, /components, /styleguide), AND drive the codebase to 100% Storybook coverage with a parallel agent fan-out. Stories stay the single source of truth feeding both Storybook and the in-app page via a generated manifest; each story renders in an isolated iframe so modals, overlays, focus traps, render loops, and console noise can't hijack the gallery. Captures hard-won gotchas (lazy imports to avoid build OOM, path-derived domains so parallel PRs never conflict, never default to an error-state story, secret-scanner-history + mock-data, secondary-tsconfig browser-global breakage, auto-format-bot CI retrigger)."
---

# storybook-to-design-system

Two related capabilities:

1. **Build an in-app "design system" gallery** — a single page in your running app that renders every component story, grouped and browsable, generated from the same `*.stories.tsx` files Storybook uses. One source of truth, two surfaces (real Storybook + an in-app page that needs no separate deploy and lives behind your app's auth).
2. **Reach ~100% Storybook coverage** — a parallel-agent fan-out that authors stories for every component across its states, one autonomous PR per domain.

**Activate:** "turn our Storybook into an in-app design-system page," "make a /components gallery from our stories," "get us to 100% Storybook coverage," or bring it up when a large component library has thin story coverage.

## Step 0 — ask the user first (do not assume)

Before building, ask:

1. **What should the page be called / what route?** (e.g. `/design-system`, `/components`, `/styleguide`, `/ui`.) Use their answer everywhere below in place of `/design-system`.
2. **Coverage scope & target** — every component, or specific domains? A hard 100% or "cover all presentational components, skip data/router-coupled ones with documented reasons"? (The latter is almost always the right answer — see "What to skip".)
3. **Merge autonomy** — should per-domain PRs auto-merge once CI is green + review approves, or stop for a human merge? (On a shared/production repo, default to "open PRs, human merges," unless the user opts into auto-merge.)
4. **Implementer model** — the fan-out is mechanical; run those agents on a cheaper tier to cut cost (see `delegate-implementation`). The orchestrator plans + reviews.

## Part A — the in-app gallery

### Principle: stories are the single source of truth

Author CSF3 stories co-located with components (`Button.stories.tsx` next to `Button.tsx`). Both Storybook and the in-app page consume the *same* files. Never maintain a second hand-written component index — it drifts.

### A generated manifest with LAZY importers

A small codegen script scans `**/*.stories.@(ts|tsx)` and emits a manifest the page imports. Two non-obvious requirements, both learned the hard way:

- **Lazy `() => import(path)` thunks, not eager imports.** If the page statically imports hundreds of story modules, your production build pulls the entire component graph into one route chunk and can OOM the bundler / blow memory budgets. Lazy importers keep the route small and load each module on demand.
- **Emit the importer pointing at the STORY file, not the component.** Strip only the language extension (`.tsx`), keep the `.stories` segment — `import("…/button.stories")`, not `…/button`. Getting this wrong silently imports the component (no stories) or fails the build.
- **Gitignore the generated manifest** and regenerate it in `dev`/`build`/`postinstall` (alongside whatever other codegen your app runs). Because it's generated, parallel PRs that only *add* story files never touch a shared committed file — see the next point.

### Derive the nav grouping from the file PATH, not a registry

Group stories into domains by their directory (`components/flow/** → "Flows"`, `components/ui/** → "UI"`, …) via a committed path→domain map. This means **adding a story requires zero registration** — and, crucially, **a fan-out of parallel PRs never edits a shared index**, so they don't conflict with each other. (If you instead group by a central list, every PR edits it and they collide.)

### Render each story in an ISOLATED IFRAME (the most important lesson)

The in-app page renders arbitrary feature components for preview. Some of them:
- open **modals** (e.g. a confirm/alert dialog rendered `open`) that portal to `document.body`, paint a full-screen overlay, and lock `body { pointer-events: none }` — **hijacking the entire gallery** so you can't click anything else;
- enter **render loops** (a stray effect) that peg the main thread and make every *other* story appear stuck on "Loading…";
- emit **console logs/errors** as a normal side effect (e.g. an error-boundary component logging on mount), spamming the gallery console.

Rendering stories inline in the gallery page exposes you to all three. **Render each selected story inside a same-origin `<iframe>` that loads a bare preview route** — exactly how Storybook isolates its canvas. Overlays, focus traps, loops, and logs are all contained to the iframe document; the gallery chrome stays responsive.

The bare preview route must:
- be **auth-gated** the same way the rest of your app is (the iframe carries the parent's cookies);
- **provide the same React context providers the components need** (query client, theme, any app-wide context like a sidebar/layout context) **but render no visual chrome** — otherwise components that call those hooks throw. This provider-wiring is the fiddly part; enumerate the providers your components actually use.
- key the iframe by `storyId` + theme so switching reloads it.

### Never default to an error-state story

If you sort the manifest and auto-select the first entry, you may land on an error/empty/loading-*state* story and greet users with "Something went wrong." **Default to a welcome/overview panel** (story counts per domain, "pick a component on the left"); only render a story once the user selects one.

### Also give the page your app's chrome treatment

If your app has a "settings"-style full-screen sub-layout (its own sidebar + a back arrow, replacing the main nav), apply the same to the gallery — it's a focused tool, not a dashboard page. Keep it behind the same providers so components render correctly.

## Part B — reach ~100% coverage with a parallel fan-out

### Foundation first, then fan out

1. **Foundation PR** (do this carefully; everything depends on it): Storybook config, the manifest codegen, the path→domain map, a minimal CSF renderer for the in-app page, the iframe preview route, the gallery page, and **one pilot domain** authored end-to-end to prove the recipe. Merge it.
2. **Fan out**: one agent per domain in its own git worktree, each rebased on the merged foundation. It authors `*.stories.tsx` for every component in its domain, verifies, opens a PR, and (if the user opted in) runs the autonomous CI→review→merge loop. Because domains map by path and only add files, the PRs don't conflict — they can run concurrently (throttle to a few at a time; each runs a full build).

### Story conventions (put these in the agent's brief)

- CSF3, co-located, typed from your Storybook `Meta`/`StoryObj`.
- Cover the states that apply: **Default, Empty, Loading, Error, Disabled, Overflow/long-content, and variant/size permutations.** Use realistic mock data.
- **Keep stories pure** — no data fetching, no live router; pass everything via props/args. (If a wrapping provider makes a query-driven component degrade gracefully to empty, that's fine.)
- Render portal components (dialogs/popovers/sheets) **open** so their content is visible — safe *because* the gallery isolates them in an iframe.
- **Never name a story export `Error`** — it shadows the global `Error` and breaks the type-check.
- For `next/dynamic`-style `ssr:false` wrappers with no props, story the underlying implementation component directly.

### What to skip (and say so)

Don't fake coverage. Skip — with a one-line reason in the PR — components that genuinely can't render in isolation: live editor/store-coupled views, things that fetch-on-mount with no prop seam, column-definition factories (not components), instrumentation that renders `null`. Story their presentational children instead. Honest "skipped: needs a live X" beats a blank panel.

### The verification gate (the #1 place fan-out agents fail)

Bake a hard gate into every agent's brief: **"not done until all green."** Run, fix, re-run:
- typecheck — **including any *secondary* tsconfig.** If a separate build (serverless functions, a Node package) also type-checks shared files, it has no DOM lib, so a browser global like `window` throws there even though the app build is fine. Guard browser globals via `globalThis` (`(globalThis as { location?: { pathname?: string } }).location`), not bare `window`.
- lint (respect the repo's own rules — many ban `useEffect`, hardcoded colors, raw `console.*`, etc.; read the repo's agent/contributor guide first);
- the production build (stories are now in the build graph — a broken story breaks the build);
- the Storybook build;
- formatter.

Give the implementer agent the repo's `AGENTS.md`/`CLAUDE.md` so it inherits these rules and the gate — agents under-verify most when the acceptance criteria are vague.

## Gotchas worth their own line

- **Secret scanners scan commit HISTORY, not just the diff.** Mock data with high-entropy secret-like strings (`whsec_…`, `sk_…`) trips them — use obvious LOW-entropy placeholders (`"example_placeholder_secret"`). If one ever landed in a commit, scrub it via `git commit --amend`/squash + `--force-with-lease`; deleting it in a later commit is not enough.
- **A pre-existing unformatted file anywhere the format check covers** (including server/functions trees) fails the format gate on *every* open PR. Run the repo's format check across the whole tree once; fix drift in its own small PR to unblock everyone.
- **Auto-format bots' pushes often don't re-trigger CI** (anti-recursion on bot tokens). If checks go "missing" after the bot pushes a formatting commit, push a trivial/empty commit to re-run.
- **`watch`-style CI tools can exit early** before all checks register. Gate merges on the *explicit* required-check conclusions (each named check == success) + review approved, not just a watch's exit code.
- **Suppress the gallery's own console noise**: components previewed on the gallery route may log as designed. A small guard in your logger ("no-op client logs while the gallery route is open") keeps the console clean without hiding real runtime logs elsewhere.

## Cost

The fan-out is mechanical, high-volume work — run those agents on a cheaper model tier and keep the expensive orchestrator for the foundation + per-PR review. See [`delegate-implementation`](../delegate-implementation/SKILL.md) for the orchestrator-implementer pattern and model pairings.
