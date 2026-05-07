---
name: apple-notes
description: "Use when the user wants to organize, restructure, or clean up Apple Notes (iCloud Notes) — including moving notes into topical folders, renaming notes for accuracy by reading bodies, splitting mixed-topic notes, deleting empty/junk notes, and applying a consistent lowercase folder taxonomy. Works via AppleScript on macOS. Triggers: 'organize my Notes', 'clean up Apple Notes', 'organize iCloud Notes', 'my Notes app is a mess'."
---

# Apple Notes Organizer

Reorganize a chaotic Apple Notes (iCloud) library via AppleScript on macOS. Two-phase: **plan** (read-only inventory + classification) and **apply** (folder moves, renames, splits, deletions) with batch approval.

## Requirements

- macOS with Notes.app and iCloud Notes enabled.
- Terminal / Claude Code with **Automation access to Notes** (system prompt appears on first AppleScript call).
- Optional: a model client for ambiguous-note classification (titles like `New Note`, `L`, `J`). Heuristics handle most cases without a model.

**SQLite path is sandboxed.** `~/Library/Group Containers/group.com.apple.notes/NoteStore.sqlite` is blocked under macOS TCC unless Terminal/Claude Code has Full Disk Access. AppleScript is the practical path for everything.

**Estimated time:** 10–60 min depending on note count.

| Library size | Runtime |
|---|---|
| ~50 notes | ~10 min |
| ~300 notes | ~30 min |
| ~1000 notes | ~60 min |

## Limits

- **Locked notes** are inaccessible — skip them.
- **Body is HTML internally.** Rewriting it converts to plain text with `<div>` line wrappers; rich formatting (links, checklists, attachments) survives if preserved as-is, but the rename pattern below loses some formatting.
- **Notes UI title = first line of body.** Setting `name of note` via AppleScript updates an AS-side property only — the displayed title comes from the body. Real renames require body edits.
- **iCloud sync race:** rapid body rewrites occasionally drop a note into Recently Deleted. Always check there if a note seems missing.

---

## Step 1 — Ask the User These Questions First

Do not skip this. Wrong assumptions = wrong structure.

```
1. Scope — which accounts? (iCloud / Mozilla / Personal Gmail / On My Mac)
   → Default: iCloud only. Other accounts often have 0 notes anyway.

2. Organization style?
   a) Lowercase topical folders (Recommended) — personal, ideas, finances, health, legal, drafts, reference, archive
   b) PARA — Projects / Areas / Resources / Archives
   c) GTD — Inbox / Next / Waiting / Someday / Reference / Archive
   d) Custom — user provides folder names

3. Aggressiveness?
   a) Dry-run only — propose every move, approve before writes
   b) Move-only auto — auto-move into folders, no deletes
   c) Move + flag deletions — auto-move, present delete list for manual review
   d) Move + auto-delete obvious junk (empty / 1–2 char titles)

4. Anything off-limits?
   - Locked notes (always skipped)
   - Shared notes / collaborators (skip moves to avoid confusing collaborators)
   - On My Mac (local-only)
   - No exclusions

5. Person-tracking style?
   a) Add a `people/` folder seeded from existing single-person notes (Recommended)
   b) Keep person notes inside `personal/`
   c) Use Notion for CRM, keep Notes for snippets only
```

---

## Step 2 — Inventory (read-only)

Pull the full inventory via AppleScript:

```applescript
tell application "Notes"
  set output to ""
  repeat with f in folders
    set fname to name of f
    set acctName to ""
    try
      set acctName to name of (container of f)
    end try
    repeat with n in (notes of f)
      set nname to ""
      try
        set nname to name of n
      end try
      set mdate to ""
      try
        set mdate to (modification date of n) as string
      end try
      -- (clean tabs/newlines from title; output as TSV)
      set output to output & acctName & tab & fname & tab & mdate & tab & nname & linefeed
    end repeat
  end repeat
  return output
end tell
```

Then a second pass for body snippets (truncated to first ~600 chars per note):

```applescript
set nbody to plaintext of n
if (length of nbody) > 600 then set nbody to (text 1 thru 600 of nbody)
```

Use the body snippets to classify ambiguous titles (`New Note`, `L`, `(However`).

---

## Step 3 — Classify into the chosen taxonomy

For each note, decide a destination folder by reading the body. Common buckets (lowercase default):

| Bucket | What goes here |
|---|---|
| `personal` | Inner-life prose, life-decision moments, friend-group lists, memoir |
| `people` | Single-named-individual notes (Martin, Paul) |
| `ideas` | Startup ideas, project plans, content brainstorms |
| `finances` | Bank docs, expense lists, account info |
| `health` | Symptoms, exercise routines, medical notes |
| `legal` | Lawyer questions, immigration, contracts |
| `drafts` | Half-written messages |
| `reference` | URLs, credentials, watchlists, training links |
| `archive` | Stale / done / sentimentally frozen |

Boundary rules:
- `personal` is *about your life*; `people` is *about specific humans*.
- `ideas` is *things you'd act on*; `reference` is *things you'd consult*.
- `archive` keeps the note searchable; only delete pure junk (empty, gibberish).

For ambiguous notes, **read the body before classifying**. Titles lie ("New Recording" turned out to be a substantive business strategy in the reference Notes pass).

---

## Step 4 — Present the dry-run plan

Output a TSV per destination folder so the user can approve in batches:

```
Folder: personal/
─────────────────────────────────────────────────
Note title                              | Reason
Sechelt move decision checklist         | Life-decision checklist
Memories                                | Personal memory list
...
```

For ambiguous edge cases, include a body snippet:

```
"L" — body: "L"           → archive (single-char gibberish)
"New Recording" — body starts: "Today, we're all about making it..."  → ideas (real business content)
```

Wait for approval. Approve in batches (one folder at a time is most common).

---

## Step 5 — Apply moves

Create missing folders, then move notes. AppleScript's `whose name contains` is case-insensitive and ignores diacritics — pick uniqueish fragments:

```applescript
tell account "iCloud"
  if not (exists folder "personal") then
    make new folder with properties {name:"personal"}
  end if
end tell

set tgt to folder "personal" of account "iCloud"
set src to folder "Notes" of account "iCloud"
set hits to (every note of src whose name contains "Sechelt")
repeat with h in hits
  move h to tgt
end repeat
```

For names that match multiple notes (e.g. `New Note` × 6), use `name is` (exact) to batch-move:

```applescript
set hits to (every note of src whose name is "New Note")
```

For very short titles (`L`, `J`), exact match is mandatory — substring match would hit many notes.

---

## Step 6 — Rename notes for accuracy (the dig-deeper pass)

The displayed title comes from the first line of the body. To rename, rewrite the body's first line as HTML:

```applescript
on renameNote(srcFolder, fragment, newTitle)
  tell application "Notes"
    set hits to (every note of srcFolder whose name contains fragment)
    if (count of hits) is not 1 then return "MISS or AMBIG"
    set n to item 1 of hits
    set pt to plaintext of n
    set AppleScript's text item delimiters to linefeed
    set ls to text items of pt
    if (count of ls) > 1 then
      set restLines to items 2 thru -1 of ls
    else
      set restLines to {}
    end if
    set newBody to "<div><h1>" & newTitle & "</h1></div>"
    repeat with rl in restLines
      set rlStr to rl as string
      if rlStr is "" then
        set newBody to newBody & "<div><br></div>"
      else
        -- HTML-escape: & → &amp;, < → &lt;, > → &gt;
        set newBody to newBody & "<div>" & rlStr & "</div>"
      end if
    end repeat
    set body of n to newBody
    return "OK"
  end tell
end renameNote
```

Pitfalls:

- **Lossy formatting.** Bullet lists, checklists, and links revert to plain `<div>` text. Acceptable for personal libraries; flag for the user if their notes are formatting-heavy.
- **Sync race.** A rapid sequence of body rewrites can occasionally land a note in Recently Deleted. Always verify each batch by querying back.
- **Special characters in titles.** Em-dash, ellipsis, smart quotes work in titles; they also appear in fragments. Use uniqueish substrings.

### Splitting mixed-topic notes

When one note has 2+ unrelated topics:

1. Read the full body.
2. Identify the boundary (often a blank line or topic shift).
3. Create a new note in the appropriate folder with the second topic.
4. Rewrite the original to keep only the first topic + new title.

```applescript
make new note at someFolder with properties {body:"<div><h1>New Title</h1></div><div>extracted content</div>"}
```

### Auto-deleting obvious junk

After moving everything to `archive`, present the user with delete candidates grouped by confidence:

- 🟢 **Strict** — empty body, 1-char titles. Auto-delete.
- 🟡 **Borderline** — gibberish fragments (`(However`, `Ggg`, `66,006...`). User decides.
- 🟠 **Named-but-empty** — title implies content but body is just the title repeated. User decides.

Use exact `whose name is "..."` for short titles; substring would over-match.

---

## Step 7 — Final verification

List every folder + count:

```applescript
tell application "Notes"
  set ac to account "iCloud"
  repeat with f in folders of ac
    log (name of f) & " (" & (count of notes of f) & ")"
  end repeat
end tell
```

Account for any notes that landed in **Recently Deleted** unexpectedly. Restore via:

```applescript
set deletedFolder to folder "Recently Deleted" of ac
set hits to (every note of deletedFolder whose name contains "Tangerine")
move (item 1 of hits) to (folder "finances" of ac)
```

Recently Deleted self-purges after 30 days.

---

## Folder hierarchy / nesting

Notes supports nested folders. To move a folder under another (e.g. `Ex/` → `archive/Ex/`):

```applescript
move (folder "Ex" of ac) to (folder "archive" of ac)
```

The 3 sub-folders + parent appear together in iOS/macOS Notes UI. Useful for keeping a sentimental sub-category (`Ex/`) without it polluting the top-level list.

---

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md) — shared default taxonomy
- [`../_lib/patterns.md`](../_lib/patterns.md) — patterns reused across sub-skills (especially "AppleScript Helpers")
- [`../notion/SKILL.md`](../notion/SKILL.md) — for CRM-style structured data, prefer Notion over Notes
