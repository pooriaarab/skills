---
name: design-context
description: "Create, audit, or migrate repository design context. Use when a repo needs canonical .agents/brand.md and .agents/design.md files, a live /design.md document, a /brand page, or a fleet-wide design-context review. Ground every rule in the product and code. Never invent tokens for surfaces that do not exist."
---

# Design context

Give humans and agents one verified source for brand identity and interface design.

Read [references/contract.md](references/contract.md) before changing files or routes.

## Workflow

### 1. Read repository context

Read `AGENTS.md` and `.agents/context.yaml` first when they exist.

Inspect the repository before drafting either document.

Use these sources, in order:

1. Existing brand or design documents.
2. Shared tokens, themes, and component code.
3. Product copy, screenshots, and public assets.
4. The built application and production site.
5. Commit history for decisions that the current code does not explain.

Record conflicts. Prefer the shipped product over stale prose.

Do not infer a visual system from a logo alone.

### 2. Classify the repository

Choose one surface type:

- `product-ui`: a website or application with a visual interface.
- `developer-ui`: a CLI, API, SDK, or generated output with user-facing conventions.
- `content-ui`: documentation, prose, media, or publishing workflows.
- `no-surface`: infrastructure or internal data without a designed user surface.

Use honest language for the selected type.

Do not add colors, fonts, components, or motion to a `no-surface` repository.

### 3. Establish canonical files

Use exactly these paths:

- `.agents/brand.md`
- `.agents/design.md`

Move useful content from old locations. Delete the obsolete files in the same change.

Do not keep aliases, generated copies, redirects, or fallback paths.

Update `AGENTS.md` so agents read both files before public copy or interface work.

### 4. Write brand context

Keep `.agents/brand.md` durable and surface-independent.

Define the product identity, audience, promise, voice, claims, and naming rules.

Use evidence for every factual claim. Mark unresolved decisions instead of guessing.

Do not place component specifications or route behavior in this file.

### 5. Write design context

Keep `.agents/design.md` specific to the repository's actual surface.

Use these level-two headings in this order:

1. `Overview`
2. `Colors`
3. `Typography`
4. `Layout`
5. `Elevation & Depth`
6. `Shapes`
7. `Components`
8. `Do's and Don'ts`

Map every token to its source file when code defines it.

Describe interaction states, responsive behavior, accessibility, and motion where they exist.

For non-visual projects, translate headings to honest output rules. Explain any non-applicable section.

### 6. Publish eligible repositories

Read `product.url` from `.agents/context.yaml` when present.

Treat a non-empty value as the canonical production home.

Such repositories must expose:

- `<product.url>/design.md` as `text/markdown; charset=utf-8`.
- `<product.url>/brand` as a human-readable brand page.

Append both paths to the full production home, including any base path.

Remove a trailing slash from `product.url` first. Do not produce a double slash.

For example, `https://example.com/tool` owns `/tool/design.md` and `/tool/brand`.

Serve the tracked `.agents/design.md` content byte-for-byte at build time or request time.

Keep one tracked source. Fail the build or request when that source is missing.

Do not add a live route when the repository has no production URL.

### 7. Verify the result

Run the repository's format, test, type-check, and build commands.

For a production URL, also prove its appended routes:

- `<product.url>/design.md` returns HTTP 200.
- Its content type is Markdown with UTF-8.
- Its response body matches `.agents/design.md` byte-for-byte.
- `<product.url>/brand` returns HTTP 200.
- The brand page works at mobile and desktop widths.

Use the deployment tied to the proposed commit. Do not test an older production release as proof.

### 8. Review the change

Reject the change when it:

- invents visual rules that the repository does not use;
- preserves a second source of truth;
- publishes a stale generated copy;
- treats brand and design as synonyms;
- adds a redirect or fallback for an obsolete path;
- claims live verification without a deployed commit;
- adds `/brand` without clear, accessible content.

In a fleet rollout, complete one representative repository first.

Apply its verified contract to later repositories, but write each document from local evidence.
