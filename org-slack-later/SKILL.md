---
name: org-slack-later
description: "Use when the user wants to organize their Slack 'Later' / saved-for-later queue (the bookmark/reminder list, In progress / Archived / Completed tabs) — capturing every saved message in full, categorizing it (action items, references, links, reading), mirroring the keepers into a knowledge base (e.g. Notion), and marking saved items complete so the queue clears down. Triggers: 'organize my Slack Later', 'process my Slack saved messages', 'clean up my Slack bookmarks', 'sort my saved-for-later queue'."
---

# Slack Later / Saved-Items Organizer

Turn the Slack **Later** queue (saved messages / bookmarks) into a categorized, mirrored, cleared-down list: read every saved item in full, sort into action items vs references vs links vs drop, copy the keepers into a durable knowledge base, then mark the saved items complete.

Related but distinct from [`org-slack-dm`](../org-slack-dm/SKILL.md) (DM threads + notification tuning). This skill is specifically the **Later / saved queue**.

## Requirements

- A **logged-in Slack session in an automatable browser** (e.g. an `agent-browser` / Playwright session where the user has completed SSO). This is the reliable path.
- **Enterprise Grid caveat:** user/bot tokens (`xoxc`/`xoxd`, or a `bookmarks:read` app token) frequently return `invalid_auth` on Grid workspaces, and there is **no public API for the personal "Later" queue** — so browser automation is the practical path. Don't burn time on tokens first; confirm whether the workspace is Grid.
- A **destination knowledge base** for keepers — e.g. Notion via MCP (see [`../organizer/notion/SKILL.md`](../organizer/notion/SKILL.md)), Apple Notes, or a markdown vault.
- The user completes any **SSO / MFA** login themselves; the agent cannot.

## Step 1 — Ask the User First

```
1. Scope — the "In progress" tab only, or also Archived / Completed?
2. Destination — where do keepers go? (Notion page/DB, Notes, markdown vault) and which sections/taxonomy?
3. Categories — default is: action-items / personal-todos, references & learnings, links (tools · posts · docs · videos), drop (ephemeral work chatter). Adjust?
4. Long-form docs — when a saved item links to a doc (Google Doc, internal wiki, ticket-tracker doc), mirror its CONTENT into its own destination sub-page, or just keep the link?
5. Clear-down — after an item is saved, mark it complete in Later (removes it from the queue; recoverable in the Completed tab)? Or leave everything in place?
6. Date range — everything, or only items newer than a cutoff?
```

## Phase 1 — Capture (read-only)

### Don't trust the count badge
The number next to the tab (e.g. "In progress 99") is often **stale or a max/placeholder** and does not equal the real number of saved items. Derive the true count from the list itself.

### The virtualized-list trap (the core gotcha)
The Later list is a **virtualized/windowed list**: only ~10–20 items are in the DOM at once, and nodes are recycled as you scroll. Two failure modes to avoid:

- **Synthetic events are ignored.** Setting `scrollTop` or dispatching untrusted `wheel`/`scroll` events does not trigger Slack's lazy-load — the list stalls at the first window. Use **trusted input**: real CDP mouse-wheel, or focus the list and **arrow-key through it** (`ArrowDown`). Keyboard traversal reliably advances selection and forces the next page to load.
- **Windowing recycles nodes.** Because items unmount as you scroll, you must **accumulate + de-duplicate across the whole scroll**, not read one snapshot. De-dupe on a **content signature** (channel + author + first N chars), not the DOM node id (ids differ between captures).

Loop: capture rendered items → advance (trusted scroll/arrow) → capture again → merge unique → stop when the set stops growing AND you've reached the true bottom (the last item stays stable across several advances).

### Per-item fields
For each saved item capture: **channel/DM name, author, full message text, and every link** (resolve link-only messages to their URL). Strip user-mention/profile links; keep real content links.

### Tombstones
Expect **"A message you saved was deleted"** placeholders — count them separately and skip; they inflate the badge but carry no content.

## Phase 2 — Classify → Mirror → Clear (with approval)

1. **Classify** every captured item into the agreed categories. Flag **personal to-dos** (items the user must act on) distinctly from **reference/links** (things to save) and **drop** (ephemeral chatter not worth keeping).
2. **Present the plan** — a table of item → category → destination. Get batch approval before any write. This is a dry-run gate.
3. **Mirror keepers** to the destination:
   - **Short items / links** → bullets under the right topical section (tools, reading, docs…), each annotated with source (channel/author) and the link.
   - **Long-form docs** linked from a saved item → create **one destination sub-page per doc with the content mirrored in**, grouped under a container page/toggle. Do **not** just paste the raw source URL if the goal is a durable copy — the source may be access-gated later.
   - **Auth-gated content you can't fetch** (e.g. a doc behind a scope you lack) → fall back to saving the **link** and note that content wasn't mirrored. Don't block the whole run on one item.
4. **Mark complete** — for **each item actually saved**, mark it complete in Later (this clears it from the queue; it's recoverable in the Completed tab). **Never mark an item complete before its save is confirmed** — order matters, or you lose it from the queue with nothing saved.
5. **Verify** — destination has the expected new entries; Later count dropped by the number completed; anything left in the queue is intentional (personal to-dos + drop items you chose to keep).

## Expected blockers (surface them, don't force)

- **SSO / MFA login** — hand back to the user to complete in the browser.
- **Access-gated linked content** (403 / missing scope on a linked doc) — mirror as a link, not content.
- **Moving org-private content to a personal destination** (e.g. cloning a company-private repo into a personal one) — this can trip data-exfiltration / trust-boundary guards. Surface it and let the user run that step themselves rather than working around the guard.
- **Enterprise Grid token auth** failing — expected; use the browser session.

## Reference implementation

This skill describes the contract; keep any executable helper (e.g. a capture-and-mirror script) in your own personal repo — `~/Documents/<your-handle>/code/personal-os/scripts/slack-later-to-<destination>.py` or similar. Skills describe, they don't ship code. Design the helper to be **idempotent on a content signature** and **one-way** (marking complete is the only Slack-side mutation, and only after a confirmed save).

## Surface-specific notes

- "Later" has three tabs: **In progress**, **Archived**, **Completed**. "Mark complete" moves an item to Completed (reversible) — it does not delete the underlying message.
- There is no folder/label structure inside Later — organization happens off-platform, at the destination.
- Saved items span channels and DMs; a bookmarked link-only message is common and its value is the URL.
- Bot / integration messages (deploy links, ticket-tracker notifications) are often saved — treat their linked docs like any other long-form doc.

## See also

- [`../org-life-organizer/_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md) — shared category vocabulary
- [`../org-life-organizer/_lib/patterns.md`](../org-life-organizer/_lib/patterns.md) — dry-run → batch-approve → apply, journaling
- [`../organizer/notion/SKILL.md`](../organizer/notion/SKILL.md) — preferred destination for a structured saved-items library
- [`../org-slack-dm/SKILL.md`](../org-slack-dm/SKILL.md) — sibling skill for DM threads + notification tuning
- [`../slack-mcp-browser-auth/SKILL.md`](../slack-mcp-browser-auth/SKILL.md) — browser-session auth for Slack when API tokens fail (Enterprise Grid)
