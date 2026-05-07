---
name: contacts
description: "Use when the user wants to organize, dedupe, or clean up Contacts.app on macOS/iOS — including merging duplicate entries, filling missing fields, grouping into smart lists (active / professional / family), and aligning person-tracking with the people/ folder used by other organizer skills. Triggers: 'dedupe my contacts', 'fix my address book', 'organize Contacts'."
---

# Contacts Organizer

Clean up Contacts.app via AppleScript. Foundational skill — run before `gmail` (label-by-person works better) and before `apple-notes` person-tracking pass.

## Status

🟡 **Stub** — scaffold only. Needs completion.

## Requirements

- macOS Contacts.app with iCloud Contacts enabled.
- Automation access to Contacts (AppleScript prompt on first call).

## Step 1 — Ask the User First

```
1. Scope — iCloud only, or include other accounts (Gmail, Exchange)?
2. Dedupe strategy — merge automatically, or present each duplicate cluster for manual decision?
3. Grouping — flat list, or smart lists (active / professional / family / acquaintances)?
4. Fields to enrich — fill missing names from email addresses? Pull birthdays from email signatures? Skip enrichment?
5. Aggressiveness — dry-run only / merge-only / merge + fill / merge + fill + delete-empty
```

## Steps (TBD)

1. **Inventory** — count contacts, identify duplicates by name + email + phone fuzzy-match.
2. **Classify** — bucket into smart lists (active = messaged in last 90 days, professional = LinkedIn-discoverable, family = explicit, etc.).
3. **Plan** — produce TSV of proposed merges + group assignments.
4. **Approve** — batch by smart list.
5. **Apply** — `merge` via AppleScript or via `Cards` API.
6. **Verify** — final count + group membership.

## Surface-specific notes

- Contacts.app is a "card store" — each entry is a `vCard` with N emails / phones / addresses.
- Duplicates often have one email each — merge consolidates them.
- Cards from external accounts (Exchange, Google Contacts) sync separately; merging may not stick if the source doesn't allow it.
- Smart lists are local-only on macOS; iOS shows them under "Lists".

## Cross-surface

Run **before** `gmail` and `apple-notes/people/`. Clean contacts → cleaner Gmail labels → tighter Notes person-tracking.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../gmail/SKILL.md`](../gmail/SKILL.md) — runs after this
