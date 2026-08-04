---
name: landing-page
description: Generate high-impact landing pages in multiple styles — hero-led, value-stack, social-proof, or minimalist. Includes responsive design, accessibility, and motion.
---

# Landing Page Skill

## Overview

A versatile landing page generator that produces **complete, production-ready** pages in different visual styles and structures, all adhering to accessibility standards and modern UX patterns.

## Styles Available

Each style solves a different narrative:

### 1. Hero-Led (Default)
**When to use:** Bold brand story, product launch, marquee feature.
- Full-bleed hero with tilt parallax or video background
- Headline + subheading + primary CTA above the fold
- Staggered content sections below (features, social proof, FAQ, pricing)
- Floating tokens or accent elements for visual pop
- Motion: entrance animations on scroll, pointer parallax on hero

### 2. Value Stack
**When to use:** Complex feature set, SaaS onboarding, education/certification.
- Stack-based vertical layout: problem → solution → proof → action
- Each section builds visual weight (cards → grids → testimonials)
- Icons + inline graphics at each level
- Motion: progressive reveal as user scrolls
- Accent color used strategically to guide eye through stack

### 3. Social Proof First
**When to use:** Marketplace, community, user-generated content.
- Hero is compact + focused on social stats (users, testimonials, trust badges)
- Center-stage carousel or grid of real user reviews or screenshots
- Mirrored two-column layout below (use-case / testimonial pairs)
- Motion: auto-rotating carousel, staggered card entrance
- Tone: credible, human, community-driven

### 4. Minimalist
**When to use:** High-touch product, luxury, technical/API-first.
- Whitespace-heavy layout, max 3 sections on fold
- Breathing room around every element
- Typography carries the weight (no decoration)
- Motion: subtle fades + slides only, no parallax
- Accent color minimal, applied only as a fine line or small accent

## Input Requirements

Tell the skill which style + these details:

| Field | Required | Example |
|-------|----------|---------|
| **Headline** | Yes | "Ace your TEF/TCF" |
| **Subheading** | Yes | "Real exams, real training" |
| **Primary CTA text** | Yes | "Start free" |
| **Primary CTA link** | Yes | `/start` |
| **Features (3–5)** | Yes | Reading, Listening, Speaking, Writing, Live feedback |
| **Accent color** (hex) | No | `#8B5CF6` (violet) |
| **Tone** | No | Arcade/gaming, Professional, Friendly, Bold |
| **Motion intensity** | No | Subtle, Moderate, High (default: Moderate) |
| **Section content** | Optional | Specific proof, testimonials, FAQ, pricing tiers |

## Output Scope

For each request, you deliver:

- **Single Next.js server component** (or multiple if the style warrants it) that renders the complete page
- **Responsive grid** (mobile-first, breakpoints at sm/md/lg)
- **Inline CSS** via Tailwind + CSS variables for theming + motion/react for animation
- **No third-party libraries** except framer-motion (already in use)
- **Accessibility** — semantic HTML, ARIA labels, color contrast ratio ≥ 4.5:1, skip links, focus states
- **Motion respects** `prefers-reduced-motion`
- **Ready to ship** — lint clean, typecheck clean, no console errors

## Example Usage

```
Use the landing-page skill to generate a hero-led page for a SaaS product.

Headline: "Manage your team's calendar in one place"
Subheading: "No more back-and-forth. Real-time sync across all devices."
CTA: "Schedule a demo"
Features: Calendar sync, Team availability, Conflict detection, Mobile apps, Integrations
Tone: Professional
Motion: High (parallax + floating badges)
Accent color: #4F46E5
```

→ Skill delivers a complete `LandingHeroLed.tsx` component ready to drop into `apps/website/src/components/marketing/`.

## Design System Integration

All pages hook into the Exam Room Arcade design tokens:

- **Colors:** `--accent`, `--accent-hover`, `--accent-soft`, `--accent-shadow`, `--bg-surface`, `--bg-raised`, `--bg-deeper-card`, `--border-default`
- **Typography:** Poppins font, maintained via global styles
- **Spacing:** 4px base unit, Tailwind scale for consistency
- **Shadows:** `depth-button` signature for elevation, `arcade-glow` for accents

No hardcoded colors in the component — all inherit from tokens so the page adapts to light/dark themes automatically.

## No AI-Generated Claims

Every section must be true or user-supplied:

- ❌ Don't invent social proof ("1M+ users" if not verified)
- ❌ Don't fabricate testimonials
- ✅ Do render user-supplied features, quotes, and stats exactly as provided
- ✅ Do use placeholder text in brackets `[Your stat here]` if a field is missing

## Related Skills

- `humanizer` — polish outward-facing copy before shipping
- `typography` — refine heading/body scales and line heights
- `layout` — adjust spacing and visual hierarchy
