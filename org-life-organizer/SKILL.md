---
name: org-life-organizer
description: "Use when the user wants to organize their entire digital life across multiple surfaces at once, or asks where to start. Surveys preferences and recommends which sub-skill to run in what order. Triggers: 'organize my life', 'where do I start', 'clean up everything', 'organize across all my apps', 'set up a personal knowledge graph'."
---

# Life Organizer

Master skill for organizing across surfaces. **Survey + dispatch model:** asks scoping questions, recommends a sequence based on dependencies, and tells you which sub-skill to run for each step. Does not invoke sub-skills directly — that keeps each one independently maintainable.

For the catalog of available sub-skills, see [`../README.md`](../organizer/README.md). For the shared taxonomy, see [`../_lib/taxonomy.md`](_lib/taxonomy.md).

---

## Step 1 — Survey the user

Ask these questions, **one at a time**, before recommending anything:

### Q1. Which surfaces are in scope?

Multi-select. Common options (default = all of "Personal essentials"):

**Personal essentials**
- [ ] Local Mac (Downloads / Desktop / Documents / caches) → `mac-organizer`
- [ ] Apple Notes (iCloud) → `org-apple-notes`
- [ ] Notion → `notion-organizer`
- [ ] Google Drive → `google-drive-organizer`
- [ ] Gmail → `org-gmail`
- [ ] Contacts.app → `org-contacts`
- [ ] Google Contacts → `org-google-contacts`
- [ ] Calendars (Google + iCloud) → `org-gcal`, `org-icloud-calendar`
- [ ] Reminders.app → `org-apple-reminders`
- [ ] Google Tasks → `org-gtasks`

**Communication**
- [ ] iMessage → `org-imessage`
- [ ] Slack DMs → `org-slack-dm`
- [ ] Slack Later / saved messages → `org-slack-later`
- [ ] Email subscriptions / unsubscribe pass → `org-email-subscriptions`

**Media**
- [ ] iCloud Photos → `org-icloud-photos`
- [ ] Google Photos → `org-google-photos`
- [ ] Spotify playlists → `org-spotify-playlist`

**Social bookmarks**
- [ ] X / Twitter → `org-x-bookmarks`
- [ ] LinkedIn → `org-linkedin-bookmarks`
- [ ] Instagram → `org-instagram-saved`
- [ ] Threads → `org-threads-bookmarks`

**Code**
- [ ] GitHub repos / stars / orgs → `org-github`
- [ ] Browser bookmarks (Chrome / Arc / Safari) → `org-browser-bookmarks`

### Q2. Work / personal split?

- **All personal** — single taxonomy across everything.
- **Work + personal split** — separate accounts/folders per surface (e.g. work Gmail vs personal Gmail). Each runs the surface skill twice with different scopes.
- **Personal-only** (skip work surfaces this pass).

### Q3. Taxonomy preference?

Pick one — see [`../_lib/taxonomy.md`](_lib/taxonomy.md) for definitions:

- **Default lowercase** — `personal`, `people`, `ideas`, `finances`, `health`, `legal`, `drafts`, `reference`, `archive` (Recommended for first-time users).
- **PARA** — Projects / Areas / Resources / Archive (Tiago Forte).
- **Karpathy-flat** — minimal hierarchy, tag-heavy, single bucket per surface.
- **GTD** — Inbox / Next / Waiting / Someday / Reference / Archive.
- **Custom** — user provides their own list.

### Q4. Aggressiveness?

- **Dry-run only** — every move is proposed, user approves before write.
- **Move-only auto** — auto-move into folders, never delete.
- **Move + flag deletes** — auto-move, present a delete-candidate list for manual review.
- **Move + auto-delete obvious junk** — empty / 1-char-title items get deleted automatically.

### Q5. First-time setup or maintenance pass?

- **First-time** — full deep-clean. Plan for hours total across surfaces, but each surface is an hour or less.
- **Maintenance** — quick pass, only act on items added since last run. Sub-skills should support a `since:<date>` flag.

---

## Step 2 — Recommend a sequence

Based on the answers, output a checklist with cross-surface dependencies honored:

### Default sequence (first-time, all surfaces selected)

```
1. mac-organizer           ← clean local first; everything else syncs from here
2. org-contacts            ← clean people foundation; gmail/messages depend on this
3. org-google-contacts     ← Google-side counterpart to org-contacts, run either order
4. org-apple-notes         ← topical organization, no dependencies
5. notion-organizer        ← independent of Notes
6. google-drive-organizer  ← after local Documents is clean
7. org-gmail               ← after contacts is clean (label-by-person works better)
8. org-email-subscriptions ← right after gmail; same surface
9. org-icloud-calendar + org-gcal  ← independent of others
10. org-apple-reminders    ← independent
11. org-github             ← code surfaces last (lower urgency for daily flow)
12. org-browser-bookmarks  ← after notion (move research-link bookmarks → notion or reference)
13. org-icloud-photos      ← independent, time-consuming
14. org-google-photos      ← independent, time-consuming
15. org-spotify-playlist   ← low priority
16. org-x-bookmarks / org-linkedin-bookmarks / org-instagram-saved / org-threads-bookmarks  ← review and prune; keep what's actionable, archive the rest
17. org-imessage / org-slack-dm / org-slack-later  ← cleanup last; slack-later mirrors keepers to notion, then clears the queue
```

### Maintenance sequence

```
1. mac-organizer (downloads + desktop only)
2. org-gmail (last 7 days)
3. org-apple-notes (notes added since last run)
4. notion-organizer (untitled pages)
5. org-browser-bookmarks (last 30 days)
```

### Dependencies to honor

| If you run... | Run this first | Why |
|---|---|---|
| `org-gmail` | `org-contacts` | Better person-based labeling |
| `google-drive-organizer` | `mac-organizer` | Local cleanup before sync upstream |
| `org-email-subscriptions` | `org-gmail` | Same surface, do label cleanup first |
| `org-browser-bookmarks` | `notion-organizer` | Bookmarks often belong in Notion as reference |
| `org-apple-notes` | (none) | Independent |
| `notion-organizer` | (none) | Independent |
| `org-google-contacts` | `org-contacts` | Pick one store as authoritative if synced |
| `org-github` | (none) | Independent |

---

## Step 3 — Dispatch

Output to the user:

```
Recommended sequence:

1. Run mac-organizer:       /run mac-organizer
2. Run org-contacts:        /run org-contacts
3. Run org-apple-notes:     /run org-apple-notes
   ...
```

Each step is a separate session — sub-skills are not invoked from here. The user runs them one at a time, reports back, and you check off the list.

For each sub-skill, pass these as inputs:

- **Taxonomy** (chosen in Q3)
- **Scope** (work / personal — defined in Q2)
- **Aggressiveness** (Q4)
- **Mode** (first-time vs maintenance — Q5)

The sub-skill's Step 1 will re-confirm with the user; that's fine — overlap is intentional safety.

---

## What this skill does NOT do

- Does not maintain global state across sub-skill runs. Each run is self-contained.
- Does not enforce a specific taxonomy. The user's choice in Q3 propagates as a recommendation; sub-skills may diverge if the surface demands it (e.g. Gmail labels can be more granular than Notes folders).

## Edge cases

- **User picks "all surfaces" but most aren't ready:** scan each surface for connectivity (does the MCP / CLI / OAuth work?) before recommending. Mark unavailable surfaces "blocked — needs setup" with the specific fix.
- **User has both personal and work accounts:** sub-skills generally support an account selector. Recommend running the surface twice — once per account — for those that span (Gmail, Drive, Calendar, GitHub).
- **User wants a custom taxonomy not on the menu:** accept any flat lowercase list. Pass it through to sub-skills as-is.

---

## See also

- [`../README.md`](../organizer/README.md) — full catalog of sub-skills
- [`../DESIGN.md`](../organizer/DESIGN.md) — architecture decisions
- [`../_lib/taxonomy.md`](_lib/taxonomy.md) — shared default taxonomy
- [`../_lib/patterns.md`](_lib/patterns.md) — implementation patterns reused across sub-skills
