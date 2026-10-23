---
name: better-design
description: "Better Design kits in pooriaarab/directory: defineBetterDesign(), 30 vendored themes, /design?kit=better. Pair with directory-fleet-ui. Upstream MCP: marvkr/better-design."
---

# Better Design (directory template)

Upstream catalog: [marvkr/better-design](https://github.com/marvkr/better-design). The **directory** repo vendors tokens and personalities — you do not `shadcn add` 31 kits into `apps/web`.

## In `pooriaarab/directory`

| Piece | Path |
| --- | --- |
| Vendored oklch tokens | `packages/better-design-themes/src/tokens/*.json` |
| Per-kit fonts, variants, layout | `packages/better-design-themes/src/personalities.ts` |
| Site theme | `brand/theme.ts` → `defineBetterDesign("apple", { seed, variants })` |
| API | `defineBetterDesign` from `@directory/ui/theme` |
| Gallery | `/design?kit=better&theme=<id>` (use `theme=all` only for full matrix) |
| Refresh upstream tokens | `bun run sync:better-design` (clone better-design to `/tmp/better-design`) |

### Pick a kit

1. Open `/design?kit=better` and click themes (apple, linear, stripe, …).
2. Copy the id into `sites/<site>/brand/theme.ts`.
3. Override **variants** for reference desks (MRI, permits): often `hero: "centered"`, `card: "ledger"`, `button: "pill"` on top of apple or corporate-fintech palettes.
4. Run `bun run brand:fonts` and `bun run brand:check`.

### MRI Prices (example)

```ts
import { defineBetterDesign } from "@directory/ui/theme";

export default defineBetterDesign("apple", {
  seed: "#0e5f8e",
  variants: {
    header: "utility",
    hero: "centered",
    card: "ledger",
    footer: "columns",
    button: "pill",
  },
});
```

## MCP (optional)

`npx skills add marvkr/better-design --skill better-design` + `npx better-design` for `get-review-rules` on screenshots of `/design`.

Read [directory-fleet-ui](../directory-fleet-ui/SKILL.md) for preset vs Better Design boundaries.
