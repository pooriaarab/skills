# Shared Patterns

## 1. Plan → Approve → Apply

Every destructive operation follows this contract:

1. **Plan (read-only)** — scan the surface, classify items, produce a proposed change set (move/rename/split/delete).
2. **Approve** — show the plan to the user. For large change sets, batch by category or folder so the user can approve incrementally.
3. **Apply** — execute the approved subset. Log every action with timestamps.

Never combine plan + apply into a single silent step.

## 2. Batch Approval

When the change set is large (>20 items), present in batches:

- Group by destination category, folder, or operation type.
- Cap each batch at ~25 items so the user can scan it in one screen.
- Provide a single "approve all" option per batch, with the ability to pull individual items out.

## 3. Dry-Run TSVs

For move/rename plans, output a tab-separated table:

```
current_location  →  proposed_location  |  current_name  →  proposed_name  |  reason
```

Easy to scan, easy to diff against execution log.

## 4. Journal for Undo

Where the surface supports it, write a journal of every action so the user can roll back:

```jsonl
{"ts": "...", "op": "move", "src": "Notes/Tangerine", "dst": "finances/Tangerine"}
{"ts": "...", "op": "rename", "id": "...", "old": "New Recording", "new": "Email-list strategy"}
{"ts": "...", "op": "delete", "id": "...", "name": "New Note", "body_snippet": ""}
```

Surfaces with built-in undo (Recently Deleted, Trash) get a softer journal — just enough to point the user at the right recovery folder.

## 5. Read Body Before Archiving

Never archive an item based on title alone. Read the first ~500 chars of the body to confirm. Titles lie ("New Recording" turned out to be a substantive business strategy in the Notes pass).

## 6. Don't Auto-Generate Placeholders

Resist the urge to pre-create one entry per contact, one folder per project, etc. Empty placeholders sync to every device and create cognitive clutter. Add entries lazily — first time the user has something to write.

## 7. AppleScript Helpers (for Apple-native surfaces)

For Notes, Reminders, Contacts, Calendar, iMessage. Common pitfalls:

- **Substring matches are case-insensitive and ignore diacritics.** Pick fragments that are guaranteed unique.
- **`set name of n to ...` may update an AS-side property without changing the displayed title.** For Notes, the displayed title is derived from the first line of the body — to truly rename, edit the body's first line.
- **Body-edit pattern for Notes:**
  ```applescript
  set newBody to "<div><h1>" & newTitle & "</h1></div>"
  -- append remaining lines as <div>...</div>
  set body of n to newBody
  ```
- **iCloud sync race:** rapid AS body-rewrites can occasionally cause Notes to land in Recently Deleted. Restore via `move n to targetFolder` from `folder "Recently Deleted" of account "iCloud"`.
- **Permission prompt:** the first AppleScript call on a sandboxed app triggers a system dialog; the user must grant Automation access.

## 8. OAuth / API surfaces (Gmail, Drive, GitHub, Spotify)

- Use existing CLI wrappers where available (`gws` for Google, `gh` for GitHub) before reaching for raw API calls.
- Cache tokens locally; never hard-code.
- Document rate limits in the sub-skill (e.g. Notion is 3 req/sec — sleep ~150ms between writes).

## 9. Step 1 — Always Ask First

Before any sub-skill touches anything, ask the user:

1. **Scope** — which accounts/folders/labels are in play?
2. **Taxonomy** — accept the shared default, or override?
3. **Aggressiveness** — dry-run only / move-only / move + flag deletes / move + auto-delete obvious junk?
4. **Exclusions** — any folders, labels, or types that are off-limits?

Wrong assumptions = wrong structure.

## 10. Stop on Ambiguity

If a fragment matches multiple items unexpectedly (`AMBIG: Memories (3 hits)`), stop and report. Don't guess. Re-prompt the user for a more specific identifier.

## 11. Cross-Surface Coordination

When two sub-skills can act on overlapping content (e.g. `org-gmail` labels by sender and `org-contacts` deduplicates the senders), prefer to run the foundational skill first:

1. `org-contacts` before `org-gmail` (clean people first, then label by person).
2. `mac` before `google-drive` (local cleanup before pushing changes upstream).
3. `org-apple-notes` and `notion` are independent; can run in either order.

The `org-life-organizer` skill encodes these dependencies in its recommended sequence.
