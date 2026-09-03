---
name: org-contacts
description: "Use when the user wants to organize, dedupe, or clean up Contacts.app on macOS/iOS — merging duplicate entries (especially phone-format dupes), filling missing fields, grouping into Lists, mirroring Google contact groups, reconciling cross-store identity with Google Contacts. Triggers: 'dedupe my contacts', 'fix my address book', 'mirror my Google groups to iCloud'."
---

# Contacts Organizer

Clean up Contacts.app via AppleScript. Pairs with `organizer/google-contacts/`. Run them as **one coordinated pass** — running them independently is risky because iCloud↔Google sync (Apple "Internet Accounts" → Google) propagates deletions across stores.

## Requirements

- macOS Contacts.app with iCloud Contacts enabled. Contacts.app must be **running** before any AppleScript invocation, or you get error `-600 Application isn't running`. Always `open -a Contacts && sleep 1` first.
- Automation access to Contacts (system prompt on first call).
- For cross-store coordination: the `gog` CLI authenticated against the user's Google account — see `organizer/google-contacts/SKILL.md`.

## Step 1 — Ask the User First

```
1. Scope — iCloud only, or include Google personal + work?
2. Cross-store coordination — pick ONE store as authoritative. Bidirectional
   sync will fight you otherwise. Concrete cost: deleting on Google
   propagates ~5 minutes later to iCloud, throwing off mid-run plans.
3. Dedupe strategy:
   a) auto-merge clusters that share an exact phone (last 10 digits) or email
      AND have compatible names
   b) per-cluster manual approval for medium-confidence matches
   c) dry-run only
4. Notes — append-only or allow overwrite? Default: append-only. Never lose
   existing iCloud notes (most users have decades of them).
5. Categorization — propose new Lists, mirror Google groups, or neither?
```

## Step 2 — Inventory (read-only)

Dump every contact via AppleScript to a TSV. The dump is the slowest step (~1s per 20 contacts on a populated store; budget 60s for ~1k contacts). For each person, capture:

- `id` (`<UUID>:ABPerson` form)
- `name`, `first name`, `last name`
- `organization`, `job title`
- All `emails`, all `phones` (pipe-joined)
- `birth date` (as string)
- `note` — **encode tabs/newlines as `\t`/`\n` literals** so each row stays single-line. Decode in the parser.

Naive flatten with ` / ` for newlines causes a downstream bug: cross-store note comparison treats the flattened iCloud note as different from the original Google note (same content, different formatting), triggering phantom enrichments. The escape-encoded form round-trips cleanly.

Wrap every property fetch in `try/on error` — Contacts.app raises if a property is `missing value` and stops the whole loop otherwise.

Compute completeness score per record (1pt each for name/email/phone/org/birthday/note). Useful for picking the "winner" in dedupe clusters.

## Step 3 — Cluster (within-store dedupe)

Build clusters using **email-OR-phone** identity, then enforce a **name-match guard**: every member of a cluster must share the same normalized name (or have empty name).

Without the name guard, transitive unionfind contaminates. Concrete failure mode: a user's stale card lists a relative's phone as an emergency contact, and the relative's own card has only that phone (no email). Both have different names. Without the guard, unionfind merges them via the shared phone. The name-match guard rejects the merge and the two stay separate.

Phone normalization: strip all non-digits, take last 10. Catches the dominant duplicate pattern: same number stored in international (`+CC NNN NNNN NNNN`) vs domestic (`00CCNNNNNNNNNNN`) vs local (`(NNN) NNN-NNNN`) formats. Particularly common when contacts span home country + diaspora.

## Step 4 — Build Merge Plan

For each cluster:
- **Winner** = highest completeness; tie-break by longest existing note, then lowest id.
- **Merged emails / phones** = union of unique values across all members.
- **Merged note** = unique notes concatenated with `\n\n---\n\n` separator. Compare with whitespace-and-separator-insensitive normalization to avoid double-adding already-synced content (replace ` / ` with `\n`, collapse whitespace).
- **Merged org / title / birthday** = first non-empty value.

Output as JSON; never apply without a plan file on disk.

## Step 5 — Apply Merges

For each merged cluster:
1. Journal the full pre-state of every member to disk **before** any AppleScript call.
2. Run AppleScript: find winner by id, `make new email`/`make new phone` for any added values, `set note` only if merged content differs, then `delete` each loser inside `try/on error`. End with `save`.
3. After all clusters in a batch, sleep ~50ms between scripts so iCloud sync doesn't hit a write storm.

Expect ~10-15% of merge attempts to fail with "Can't get person whose id is X" on a long run — these are contacts that already vanished due to iCloud sync from your parallel Google deletes. Recovery: re-dump iCloud, re-build the plan against fresh state, re-apply for whatever clusters still exist.

## Step 6 — Categorize (Lists / Groups)

iCloud Lists ≈ Google groups. Both surfaces support add-only categorization. Propose a small scheme aligned with the user's knowledge graph (avoid inventing a parallel taxonomy — see `_lib/taxonomy.md`).

Useful auto-rules:
- **Email domain → category** (e.g. `@<work-domain> → Work`, `@<school-domain> → School`). Strongest signal.
- **Heritage/diaspora name pattern + country-code phone → Community group**. Combine a first-name dictionary, last-name suffix list, and explicit surname dictionary specific to the user's community. **Add a business-words exclusion** (`support`, `sales`, `pharmacy`, `cable`, common ISP names, etc.) to catch false positives like a vendor sales rep whose first name happens to match the dictionary.
- **Kinship term in NAME (not note) → Family**. `name.split()[0].lower() in {mom, dad, mama, papa, uncle, aunt, ...}` (extend with the user's preferred kinship terms in their primary language). Notes describe *other people's* families and produce false positives — a contact's note explaining their own parents/siblings should NOT bucket them into your Family list.

Run categorization independently per store using the same heuristics. Don't try to derive iCloud groups from Google memberships via cross-store mapping — duplicating effort is cheaper than maintaining the join.

## Step 7 — Cross-Store Enrichment (with Google)

After dedupe, compute the cross-store cluster set: people present in **both** Google and iCloud. For each such pair:

1. Compute the field union (emails, phones, org, birthday, note).
2. **Add-only**: write to each side **only the fields it lacks**. Never overwrite.
3. Notes: use the same whitespace-normalized substring check as Step 4 to skip phantom appends.

In practice this yields modest deltas (~10-20 contacts gain real data; the rest were already in sync because Google↔iCloud bidirectional sync did the work for you).

## Surface-specific notes

- Contacts.app is a "card store" — each entry is a `vCard` with N emails / phones / addresses.
- Cards from external accounts (Exchange, Google Contacts) sync separately; merging may not stick if the source doesn't allow it.
- iCloud Lists are local-only on macOS; iOS shows them under "Lists".
- AppleScript `delete person` is reversible only via the iOS Recently Deleted folder (30 days). Never depend on it to recover from a bad merge — always journal first.

## Cross-surface

Run alongside `organizer/google-contacts/`. **Pick one as authoritative** — bidirectional sync propagates deletions ~5 minutes after they happen on the other side, which throws off mid-run merge plans. The pragmatic workflow:

1. Dedupe Google (faster, atomic API).
2. Wait ~5 min for sync, OR re-pull iCloud after.
3. Run iCloud-only dedupe on whatever's left.
4. Cross-store enrichment last (after both sides are clean).

Run **before** `organizer/gmail/` and `organizer/apple-notes/people/`. Clean contacts → cleaner Gmail labels → tighter Notes person-tracking.

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| AppleScript: `Application isn't running. (-600)` | Contacts.app closed | `open -a Contacts && sleep 1` before any osascript |
| AppleScript: `Can't get person whose id is X` | Contact deleted by iCloud sync from a parallel Google operation | Re-dump iCloud, re-build plan against fresh state |
| Cross-store cluster contamination | Two different people with one shared identifier (e.g. dad's phone on user's old card) | Add name-match guard to unionfind |
| Phantom note enrichments | Note was flattened on dump (newlines → ` / `) so cross-store comparison treats it as new content | Encode newlines as `\\n` literals in the AppleScript dump; decode on parse |
| More deletes happen than your script accounts for | iCloud↔Google sync also deletes from your parallel Google merges | Expected. Treat counts as approximate during cross-store passes |
| Same dupe pattern repeats across many contacts | International phone numbers stored in both `+CC NNN ...` and `00CCNNN...` formats (or local vs international) | Normalize phones to last-10 digits before clustering |

## Defaults and Guardrails

- **Default to dry-run on the first run.** Print every AppleScript without executing.
- **Journal before write.** Every merge writes pre-state to `~/.config/contacts-organizer/journal/` before the AppleScript runs. The journal is the only undo path.
- **Notes are append-only.** Never overwrite an existing note unless the new content is a superset (case-insensitive, whitespace-normalized).
- **Name-match guard.** Required for within-store dedupe. Without it, expect cross-person contamination on any user with shared family phones.
- **Contacts.app must be foreground or at least running.** AppleScript invocations are unreliable when Contacts is being launched concurrently — sleep 1s after `open -a`.

## See also

- [`../_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../_lib/patterns.md`](../org-life-organizer/_lib/patterns.md) — Plan → Approve → Apply, journaling
- [`../google-contacts/SKILL.md`](../org-google-contacts/SKILL.md) — Google-side counterpart; **coordinate, don't run independently**
- [`../gmail/SKILL.md`](../org-gmail/SKILL.md) — runs after this
