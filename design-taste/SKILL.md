---
name: design-taste
description: "Anti-slop UI: deliberate typography, color, layout; ban LLM-default heroes and purple gradients. For directory fleet sites use with directory-fleet-ui and genre pack corporate-trust (civic preset). Install full pack: git clone https://github.com/madebymustafa/design-taste && ./scripts/install.sh"
---

# design-taste (fleet overlay)

Upstream: [madebymustafa/design-taste](https://github.com/madebymustafa/design-taste) — 24 skills. Install once:

```bash
git clone https://github.com/madebymustafa/design-taste.git /tmp/design-taste
/tmp/design-taste/scripts/install.sh   # copies into ~/.cursor/skills, ~/.claude/skills, etc.
```

## Directory fleet (multi-site directory monorepo)

1. Start with [directory-fleet-ui](../directory-fleet-ui/SKILL.md) — `/design`, presets, `brand/`.
2. **Genre for reference directories (MRI, permits, gov data):** upstream skill `corporate-trust` — maps to **`civic`** preset + steel blue seed. Not indigo gradients, not three feature cards.
3. **Craft skills to load for every directory UI pass:**
   - `taste-design-system` — spacing/type tokens (use `brand/theme.ts` + `THEME_VARIANTS`, no hardcoded px in pages)
   - `taste-typography` — Public Sans / Atkinson on civic; respect fluid steps in `globals.css`
   - `taste-accessibility` — 44px targets (buttons in `@directory/ui/directory/button.tsx`)
   - `taste-ux-copy` — factual hero intros; no "seamless", "revolutionary"
4. **Never list** on directory home pages: centered purple hero, emoji icons, glass everywhere, Inter+slate default.

## One-line design read (required)

Before changing `brand/` or kit components, declare:

*"Reading private-repo-38ca as: trust-first reference desk, civic band hero, ledger rows, one steel-blue accent, evidence next to every price."*

## Pre-flight (directory)

- [ ] Preview `http://localhost:3000/design?preset=<id>&matrix=1`
- [ ] `bun run brand:check`
- [ ] Buttons/search use shared `buttonClass`; no one-off padding in `apps/web` pages
- [ ] OG/logo/favicon share seed color ([verify-branding](../verify-branding/SKILL.md))

Core anti-slop rules: https://github.com/madebymustafa/design-taste/blob/main/skills/design-taste/SKILL.md
