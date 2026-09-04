# Conversion patterns and the merge loop

All patterns share one rule: **import the Next page/MDX in place and render it; never fork the
content.** The Next source stays until the final purge phase.

## 1. Single bespoke page (`/`, `/pricing`, `/about`)

One route file per path. The home `/` replaces the shell's placeholder `index.tsx`.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import Page, { metadata } from "../app/(marketing)/about/page";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: metadata.title }, { name: "description", content: metadata.description }] }),
  component: () => <Page />,
});
```

Batch these ≤10 per PR — see the routeTree cap note below.

## 2. Uniform family (many pages, one template) → dynamic route + glob registry

`import.meta.glob` imports every page in the family; a single `$slug` route serves them. Registry
stays ~40 lines regardless of page count, and the routeTree gains ~2 lines (one dynamic route).

```ts
// tools/-registry.ts
const modules = import.meta.glob<ToolModule>("../../app/(marketing)/tools/*/page.tsx");
const loaders = new Map<string, () => Promise<ToolModule>>();
for (const [key, load] of Object.entries(modules)) {
  const slug = key.match(/\/tools\/([^/]+)\/page\.tsx$/)?.[1];
  if (slug !== undefined) loaders.set(slug, load);   // Map, not a plain object → prototype-safe
}
export const getToolLoader = (slug: string) => loaders.get(slug);
```

```tsx
// tools/$slug.tsx
export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ params }) => {
    const load = getToolLoader(params.slug);
    if (!load) throw notFound();
    const mod = await load();
    return { Component: mod.default, metadata: mod.metadata };
  },
  head: ({ loaderData }) => (loaderData ? metadataHead(loaderData.metadata) : {}),
  component: () => { const { Component } = Route.useLoaderData(); return <Component />; },
});
```

The glob pattern `tools/*/page.tsx` matches only single-level pages; nested `tools/x/[platform]/page.tsx`
needs its own route/batch. Use a `Map` for lookups — a plain object exposes `toString`/`constructor`
as fake slugs (prototype pollution).

## 3. MDX tree at mixed depths (docs / support articles) → splat route + glob

```tsx
// support/articles/$.tsx
const modules = import.meta.glob("../../../app/(support)/support/articles/**/page.mdx");
// key each by the URL path after "articles/"; loader resolves params._splat; notFound() if absent.
// MDX head comes from `frontmatter` (--- title/description ---) OR a `metadata` export — check which.
```

## 4. MDX single page

Mirror pattern 1 but import the `.mdx` as the component. Note the head source differs by page:
marketing MDX often uses `export const metadata`; support/docs MDX often uses `--- frontmatter ---`
exposed as a `frontmatter` export (remark-mdx-frontmatter, `name: "frontmatter"`).

## Wiring the `@/` alias (do once, early)

Any app that imports shared components through `@/` needs it in the TanStack build too:

```ts
// vite.config.ts — regex so @scope/pkg imports aren't swallowed
resolve: { alias: [{ find: /^@\/(.*)$/, replacement: resolve(import.meta.dirname, "../website/src/$1") }] }
```

```jsonc
// tsconfig.tanstack.json
"compilerOptions": { "paths": { "@/*": ["../website/src/*"] } },
"include": ["src/routes/**/*.ts", "src/routes/**/*.tsx", "src/routes/**/*.mdx", ...]
```

## Skip rules (file a follow-up issue per page, don't fork into the bulk PR)

- `"use client"` + `useSearchParams()` from `next/navigation` — throws with no App Router context.
- Imports a `*.client` island — the shell build denies it.
- Runtime `WebAssembly.instantiate(bytes)` — banned on Workers; import the `.wasm` as a module.

## The per-family merge loop

1. Worktree from `origin/main`; junior implements; leave uncommitted.
2. `oxlint` the new files (no `x!`, no `await`-in-loop), run the family test, `tanstack:typecheck`,
   `tanstack:package`.
3. `next-surface:check`; if drift, regenerate **all** inventories + `tanstack:build` (routeTree).
4. Check counted size **including `routeTree.gen.ts`** (the checker counts it; generated `.json`/`.md`
   inventories are excluded). Over cap → split the family (≤10 individual routes) or move to a glob.
5. Commit (clean message, no AI-model trailer), open the PR (`Closes #N`, What/Why/How-verified,
   `Assisted-by:`; `Proof: n/a — <reason>` for byte-identical ports with no visual delta).
6. On rebase conflicts in generated files: take main's side, then regenerate.
7. If an LLM review bot rewrites the branch, let it converge clean; merge when the gate checks pass.

## Sizing note — why routeTree matters

Individual route files each add ~20 lines of generated router types to `routeTree.gen.ts`, which the
size checker counts. A glob/dynamic route adds ~2. That is the whole reason large uniform families
must use pattern 2/3 and bespoke families must batch ≤10.
