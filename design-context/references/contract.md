# Design-context contract

Use this contract for repository audits and changes.

## Canonical ownership

| Path | Owns | Must not own |
|---|---|---|
| `.agents/brand.md` | Identity, audience, promise, voice, claims, naming | UI tokens, route code, component details |
| `.agents/design.md` | Visual and interaction rules for one surface | Company strategy, unsupported claims |
| `<product.url>/design.md` | Byte-exact delivery of `.agents/design.md` | A second edited copy |
| `<product.url>/brand` | Human presentation of the same brand and design system | Private strategy or unverified claims |

Lowercase, kebab-case paths are required.

Root `BRAND.md`, root `DESIGN.md`, and uppercase `.agents` variants are obsolete paths.

Move useful content and delete those files during migration.

## Brand document content

Use the smallest set of sections that describes the product truthfully.

Cover these concerns when evidence exists:

- product identity and category;
- primary and secondary audiences;
- user problem and product promise;
- personality and voice;
- message hierarchy;
- approved names, spelling, and capitalization;
- evidence rules for claims;
- logo and asset ownership;
- explicit anti-patterns.

Keep time-sensitive campaigns outside the canonical brand document.

## Design document format

The document may start with YAML frontmatter for machine-readable tokens.

The Markdown body must contain the eight canonical level-two headings.

### Overview

Name the surface, user goal, design principles, and source files.

### Colors

List semantic roles before raw values.

Include light and dark behavior only when both modes exist.

State contrast requirements and forbidden color use.

### Typography

Name shipped families, fallbacks, sizes, weights, and text roles.

For a CLI, cover terminal-safe emphasis and line-length rules instead.

### Layout

Define grids, width limits, spacing, breakpoints, and content density.

For generated output, define ordering, indentation, and wrapping.

### Elevation & Depth

Define borders, shadows, overlays, and stacking.

State `Not applicable` with a reason when the surface has no depth.

### Shapes

Define radii, aspect ratios, icon geometry, and control silhouettes.

For text-only surfaces, define bullets, separators, and prompt markers.

### Components

Describe reusable elements, states, responsive behavior, motion, and accessibility.

Link each rule to source code where practical.

### Do's and Don'ts

Write paired, testable rules. Avoid taste words such as “clean” or “modern.”

## Optional frontmatter

Use YAML only when tooling consumes it.

Prefer semantic names over palette names.

```yaml
---
schema: design-context/v1
surface: product-ui
sources:
  - path/to/tokens.css
tokens:
  color:
    canvas: "#ffffff"
    text: "#111111"
---
```

Do not add empty keys. Do not duplicate every prose rule in YAML.

## Delivery patterns

Use the framework's native route or static asset pipeline.

Append `/design.md` and `/brand` to the full `product.url`. Preserve any base path.

For example, `https://example.com/tool` maps to `/tool/design.md` and `/tool/brand`.

### Server-rendered frameworks

Read `.agents/design.md` from a deterministic repository-root path.

Return the bytes with `text/markdown; charset=utf-8`.

Mark the route static only when the build can access the canonical file.

Add a focused test that compares the response body with the source bytes.

### Static hosts

Copy the canonical file during the build.

Treat a missing source or changed output as a build failure.

Do not commit the generated public copy.

### Workers and API servers

Bundle the canonical content during compilation.

Avoid runtime network fetches and repository API calls.

Test the deployed route because asset binding differs across hosts.

## Brand page minimum

The page must explain the brand to a person without repository access.

Include:

- identity and product promise;
- logo or wordmark treatment;
- core color and type examples when applicable;
- voice examples;
- component or surface examples when applicable;
- accessible text for visual assets.

Do not expose internal positioning, private research, or unsupported metrics.

## Verification commands

Use repository-native commands first.

These checks express the delivery contract:

```sh
product_url=https://example.com/tool
design_status=$(curl --silent --show-error --dump-header headers.txt \
  --output live-design.md --write-out '%{http_code}' "$product_url/design.md")
test "$design_status" = "200"
cmp .agents/design.md live-design.md

brand_status=$(curl --silent --show-error --output /dev/null \
  --write-out '%{http_code}' "$product_url/brand")
test "$brand_status" = "200"
```

`curl --fail` only rejects 4xx/5xx responses — a 3xx redirect still exits `0`, so
check `%{http_code}` explicitly rather than relying on `--fail` alone.

Inspect the `Content-Type` header. Require `text/markdown` and UTF-8.

Delete temporary response and header files after verification.

## Fleet sequence

1. Exclude archived repositories and forks.
2. Pilot one representative deployed application.
3. Land the shared contract and validation checks.
4. Group remaining repositories by surface and deployment framework.
5. Create one issue and one pull request per repository.
6. Keep each change under the repository's review-size limit.
7. Validate every document against local evidence.
8. Verify deployed routes only after the proposed commit is live.

Never bulk-copy product-specific prose between repositories.
