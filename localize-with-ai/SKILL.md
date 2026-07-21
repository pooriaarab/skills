---
name: localize-with-ai
description: "Fully localize a codebase's UI strings into multiple languages using next-intl (or an equivalent i18n library) plus an LLM translation pipeline — locale-prefixed routing, per-namespace message catalogs, a two-pass machine-translation script (cheap draft model, then a stronger model that flags issues instead of silently rewriting), a real ICU MessageFormat parser for structural validation, and staged RTL/CJK/text-expansion layout work. Use when the user asks to 'localize the app', 'add i18n', 'translate the UI', 'support multiple languages', or wants a CI gate that catches missing/mismatched translation keys."
---

# Localize a codebase with AI

Full-app localization decomposes cleanly into four independent pieces that can ship as
separate PRs, in this dependency order: **routing skeleton → string extraction →
RTL/CJK layout → translation pipeline.** Only the first is a hard prerequisite for the
rest; the other three can run in parallel once it lands.

## When to use this

**Trigger if:** the app needs real multi-language support — a language switcher, a
`preferredLanguage`-style user setting, or "translate this for our EU/global users".

**Skip if:** the ask is a single one-off translated page, or the app is small enough
that a single flat message file (no namespaces, no pipeline) is genuinely simpler —
this skill's machinery earns its keep once you're maintaining more than a couple
hundred strings across more than a couple of languages.

## 1. Routing: prefix, not suffix, and it's not optional

`/fr/dashboard`, not `/dashboard/fr`. This isn't a style preference — no App Router
i18n library (next-intl, similar) supports locale-as-a-suffix, because the locale has
to be the outermost URL segment to select the correct layout tree (message catalog,
`<html lang>`, RTL direction) before anything nested renders. Suffix placement also
collides with dynamic route segments (`/item/[id]/fr` is ambiguous the moment `id`
could legitimately be `"fr"`). Prefix is also what every hreflang/sitemap tool expects,
and it's the SEO-standard pattern (`example.com/fr/...`) if any of the target languages
have real organic-search value.

## 2. One field drives both UI locale and AI-content language — don't split it

If the app already has a "preferred language" setting (used for anything — email
language, AI-response language, content translation target), reuse that same field to
drive the UI locale too, rather than adding a second field. Two fields for the same
underlying concept will drift. If the stored value is inconsistent (e.g. one save path
writes ISO codes, another writes English display names like `"French"`), consolidate
to ISO 639-1 codes as the single source of truth, and write a normalization function
for legacy values on read — don't require a data migration. The UI dropdown can still
*display* a human-readable name; only the *stored value* needs to be the code.

## 3. Message catalogs: one file per namespace, explicit static imports

`src/messages/<locale>/<namespace>.json` — one JSON file per feature area per locale,
not one giant file per locale. This keeps review diffs small and lets a translation
pipeline track freshness per file instead of per locale (see §5).

Next.js's bundler (webpack/turbopack) can't do a runtime directory glob, so the
request-time loader has to **explicitly enumerate every namespace file** and merge
them into one messages object:

```ts
const [common, marketing, /* ...every namespace... */] = await Promise.all([
  loadNs(() => import(`../messages/${locale}/common.json`)),
  loadNs(() => import(`../messages/${locale}/marketing.json`)),
  // ...
]);
```

Wrap each import so a missing namespace file degrades to `{}` instead of throwing —
that lets a partially-translated locale still boot, falling back to the default
locale's catalog only when *every* namespace comes back empty. **Every worker or PR
that adds a new namespace needs to add one import line here** — this is a predictable
merge-conflict point when multiple string-extraction passes land close together
(resolve by merging both namespace lists, not picking one side).

## 4. String extraction: never touch domain content, only chrome

Before extracting anything, draw the line between **UI chrome** (buttons, labels,
errors, instructions — always in scope) and **domain content** (product data,
user-generated content, anything that is the actual subject matter of the app, not
its interface — never in scope for the generic extraction pass). Getting this wrong
in either direction is a real failure mode:

- Extracting domain content into the pipeline and translating it is usually just
  wrong (e.g. an assessment whose whole point is testing a specific language — the
  test material itself must stay in that language, only the UI around it localizes).
- Leaving legal content (terms, privacy policy) in the generic MT pipeline is a real
  liability risk — some jurisdictions legally require certified human translation for
  consumer-facing legal text, and machine-translated legal language is exactly the
  kind of subtly-wrong output that creates liability. Exclude `(legal)/`-equivalent
  routes entirely; treat them as a separate, human-reviewed track.

**Watch for content that's already in the "wrong" language before extraction even
starts.** A surface can be hardcoded in a non-English language from a previous
iteration of the product (an old market-specific launch, a leftover from before an
English-first rebrand, etc.) — an extraction pass will faithfully copy that non-English
text verbatim into the "English" source catalog, because inventing translated
marketing copy on the model's own initiative would be worse. This produces a subtle,
easy-to-miss bug: the catalog *looks* done (keys match, build is green) but the
"English" source is actually still the original other-language text, so downstream MT
generates garbage for every other target locale. Grep the extracted `en/` catalogs for
non-ASCII/non-English content as a cheap sanity check, and treat any hit as a real bug
to fix (translate it to real English) — not an edge case to shrug off.

**Auth/server-action error handling:** when localizing error messages thrown from
server actions or API routes, only touch the human-readable message — never the error
*code* (`"NOT_AUTHORIZED"`, `"FORBIDDEN"`, etc.). Client code often branches on the
code, not the message; swapping the code for translated text silently breaks that
logic. Read the actual error-throwing code before touching it, don't just template-
match "any user-facing string."

## 5. Translation pipeline: two-pass, real ICU parser, per-file freshness

**Pass 1 — bulk draft.** A cheap/fast model translates every string in a namespace
file. **Pass 2 — QA review.** A stronger model compares source and draft, and *flags*
issues (register, tone, dropped clauses, grammar) into a report file — it never
silently rewrites. A flagged issue is a decision for a human to apply, not an
auto-fix. This two-pass shape is the whole point: a single-pass "translate and ship"
pipeline will quietly ship register/grammar errors with no way to catch them.

**Validate ICU structure with a real parser, not string heuristics.** Brace-counting
or regex-based placeholder extraction misses nested placeholders inside
`plural`/`select`/`selectordinal` branches, doesn't catch malformed trailing syntax,
and counts pound-tokens (`#` inside a `plural` branch) globally instead of per-branch —
meaning a translation can move `#` from one branch to another with the same total
count and pass a heuristic check while being structurally broken. Use an actual ICU
MessageFormat parser library for this validation; it's a small dependency and it
closes an entire bypass class at once instead of patching individual encodings.

**Freshness/idempotency must be evaluated per output file, not per locale.** If
freshness is checked at the locale level ("has anything in this locale's directory
changed"), a stale namespace triggers regenerating the *entire* locale — silently
overwriting a sibling namespace file a human already hand-reviewed. Track and act on
freshness per namespace file. Also: a fresh git checkout gives every file
approximately the same mtime, so mtime-based freshness is meaningless immediately
after cloning a worktree — use an explicit `--only=<namespace>` + `--force` override
rather than trusting freshness detection right after a checkout.

**Never let a missing/malformed model response silently become the source-language
text.** If a translation call fails or returns something unusable, write an explicit
sentinel and flag it as an error in the QA report — never fall back to writing the
source-language string into the target-locale file. A silently-untranslated key is
structurally indistinguishable from a real translation and nothing downstream catches
it.

**Cost is a non-issue at UI-string scale.** A full two-pass run (draft + QA) across a
few hundred UI strings costs single-digit cents per locale with a cheap draft model
plus a mid-tier QA model; running the same two-pass pipeline across a few dozen target
locales for a typical app's UI catalog is realistically a few dollars, one-time, not a
budget line worth agonizing over. This means locale coverage should be limited by
*maintenance/QA bandwidth* (who reviews a new locale before it goes live, RTL/CJK
layout audit completeness) — not by translation cost.

## 6. RTL and CJK: staged, and don't flip the global switch early

Add a `dir="rtl"` attribute to the root layout, driven by a single `RTL_LOCALES`
constant — but **do not turn it on globally until every surface has been audited for
logical CSS properties.** Native `dir="rtl"` flips flexbox/grid main-axis direction and
default text-alignment *even on components with zero RTL-specific classes* — so
enabling it before a full audit will visibly break any not-yet-converted page for
users who already have an RTL language selected (this is not a hypothetical: those
users often already exist if the language was already selectable before the i18n work
began). Convert to logical CSS properties (`margin-inline-start/end`,
`inset-inline-start/end`, `text-align: start/end`) wave-by-wave alongside string
extraction, and only flip the global RTL switch on once the *last* wave lands — track
what's still unconverted explicitly rather than assuming coverage.

**Exception: transactional email templates must keep physical CSS properties**
(`margin-left`, not `margin-inline-start`). Email clients — Outlook in particular —
have poor-to-no support for CSS logical properties; an automated review pass will
likely flag this if it's missed.

**CJK** needs a font-stack fallback (system CJK fonts, scoped by `html[lang="..."]`)
and a taller line-height — CJK glyphs are visually denser per line than Latin text at
the same font-size. A CSS-only fallback stack is enough; don't add a new web-font
asset-loading cost for locales most users won't hit unless there's a specific reason
to.

**Text-expansion**: German and Russian commonly run ~30% longer than English at the
same meaning; some languages compress. Audit `whitespace-nowrap` on fixed-width
elements (nav labels, buttons, card headers) and let them wrap instead of clip.

## Delegating this work

This decomposes well across parallel workers/agents — routing skeleton first
(structural, do solo, everything else depends on it), then string-extraction and
RTL-layout waves can run concurrently once it lands, split by feature area (one
worker per route-area cluster, not one worker for the whole app — keeps diffs
reviewable). Independently commission a security-focused review pass on anything that
touches middleware, auth flows, or request-header handling — locale detection often
gets bolted onto existing middleware, and an *unrelated* pre-existing bug in that same
file is a realistic thing to stumble into and worth fixing separately, not silently
folded into the localization diff.

If using an LLM-driven coding agent as a worker: verify its own "I committed this
locally" claim with `git log`/`git status` before trusting it — some agents report
success without actually having run `git commit`, and the actual file edits (visible
via `git status`) are the only reliable signal, not the agent's closing summary.
