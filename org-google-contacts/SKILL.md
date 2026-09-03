---
name: org-google-contacts
description: "Use when the user wants to organize Google Contacts (the cloud-side address book behind Gmail autocomplete) — dedupe, missing-field enrichment, contact group / starred curation, tagging-by-relationship. Distinct from the iCloud-side `org-contacts` skill: Google-only via the People API. Triggers: 'dedupe gmail contacts', 'contact groups in google'."
---

# Google Contacts Organizer

Triage Google Contacts via the **People API** — dedupe near-identical entries, fill missing names/emails/phones, and curate contact groups (the People API equivalent of Gmail labels for people). Two-phase plan → approve → apply, mirroring `org-gmail`.

This skill is the **Google-side** counterpart to `organizer/contacts/` (which handles iCloud Contacts.app). Run them in either order. If the user keeps both stores in sync via [Apple's Add Account → Google](https://support.apple.com/guide/contacts/use-icloud-and-other-internet-accounts-cnt5b08a32a/mac), pick one as authoritative and clean it first.

## Requirements

Pick whichever access path is convenient:

**Path A — `gog` CLI** (recommended; works with the `work`/`personal` shell switcher)
- [`gog`](https://github.com/openclaw/gogcli) — `brew install steipete/tap/gogcli`
- Account authenticated with the `org-contacts` and `people` services:
  - `gog auth add <your-personal>@gmail.com --services contacts,people`
  - `gog auth add <your-work>@<work-domain> --services contacts,people`
- People API enabled on the OAuth project (one-click in [GCP console](https://console.developers.google.com/apis/api/people.googleapis.com/overview))
- After running `personal` / `work` in your shell, `gog` invocations auto-inject `-a $GOG_ACCOUNT_DEFAULT` — see Pre-flight below

**Path B — `gws` CLI** (alternate; same OAuth project as Path A)
- `gws people connections list` for read; `gws people people create / updateContact / deleteContact` for writes
- Requires `https://www.googleapis.com/auth/contacts` scope on the gws token. Re-login if missing: `gws auth login --scopes 'https://www.googleapis.com/auth/contacts'`

**Common:**
- Python 3.9+
- Optional model client for ambiguous-merge classification (heuristics handle most). Local Apple Intelligence / Ollama are fine — sender-clustering is a small workload.

### Auth gotchas (May 2026 run)

1. **Switch keyring backend to `keychain` first.** Default is `file`, which encrypts the token store with a passphrase. Non-TTY shells (and agents) can't supply the passphrase, so every read fails with `no TTY available for keyring file backend password prompt`. Run `gog auth keyring keychain` once; macOS Keychain handles unlock silently. The encrypted file backend is also brittle — if you mistype the passphrase on a re-auth, the keyring file gets corrupted with `aes.KeyUnwrap(): integrity check failed` and you have to wipe `Library/Application Support/gogcli/keyring/` to recover.
2. **Use a named OAuth client when the default project isn't yours.** `gog auth credentials` defaults to a baked-in client. If the consent screen shows an unfamiliar project name, register your own:
   ```
   gog auth credentials set ~/.config/gws/client_secret.json --client cli-personal
   gog --client cli-personal auth add <your-personal>@gmail.com --services contacts,people
   ```
   Multiple named clients can coexist. The `--client` flag selects which to use per-call.
3. **`gog` requests broad scopes** (gmail, drive, calendar, etc.) even when you ask for `--services contacts,people`. Verify what you actually granted by inspecting `Library/Application Support/gogcli/credentials-<client>.json` and the consent screen URL. The over-grant is convenient (gmail scope ends up available "for free") but worth knowing.

## Pre-flight (always run first)

```bash
# Confirm which account is active in gog
echo "gog default: ${GOG_ACCOUNT_DEFAULT:-(unset)}"
gog auth list   # shows authed accounts + scopes + token expiry
```

If `GOG_ACCOUNT_DEFAULT` is unset, source the shell wrappers (`personal` / `work`) first. Refuse to apply changes if the active account doesn't match the plan's `account` field — same guardrail as the gmail skill.

---

## Step 1 — Ask the User

```
1. Which account this run? (work / personal)

2. Mode: deep-clean or maintain?
   a) deep-clean — full address-book pass: dedupe, enrich, regroup
   b) maintain  — only contacts changed since last_run.json

3. Dedupe strategy:
   a) auto-merge clusters with high confidence (same name + same email or phone)
   b) auto-merge ONLY exact-match (case-insensitive name + identical email)
   c) per-cluster manual approval

4. What's a "complete" contact? (multi-select)
   - given_name + family_name
   - at least one email_address
   - at least one phone_number
   - organization or job_title
   - photo

5. Contact groups (Google's labels for people) — auto-derive or use a fixed scheme?
   a) auto-derive from email domain + interaction frequency (e.g. `work-coworkers`,
      `family`, `frequent-2024`)
   b) preserve existing groups; only suggest new ones for ungrouped contacts
   c) fixed scheme: family / friends / coworkers / vendors / acquaintances

6. Starred contacts — should the skill curate? (yes/no/preserve-as-is)
```

---

## Step 2 — Plan Phase (read-only)

Pull every connection via `people.connections.list` with a wide `personFields` mask. Cache to `~/.config/google-contacts-organizer/cache/people-<email>.jsonl` for resume across sessions.

```python
import json, subprocess, time, os, datetime, re
from pathlib import Path

CACHE = Path.home() / ".config/google-contacts-organizer/cache"
PLANS = Path.home() / ".config/google-contacts-organizer/plans"
CACHE.mkdir(parents=True, exist_ok=True)
PLANS.mkdir(parents=True, exist_ok=True)

PERSON_FIELDS = ",".join([
    "names", "emailAddresses", "phoneNumbers", "addresses", "organizations",
    "memberships", "photos", "metadata", "biographies", "events", "userDefined",
])

def gog(cmd, params=None):
    args = ["gog"] + cmd.split()
    if params:
        args += ["--params", json.dumps(params)]
    args += ["--format", "json"]
    r = subprocess.run(args, capture_output=True, text=True)
    return r.returncode, r.stdout, r.stderr

# List with pagination
def list_contacts(account):
    contacts = []
    page_token = None
    while True:
        params = {"resourceName": "people/me", "personFields": PERSON_FIELDS,
                  "pageSize": 1000}
        if page_token:
            params["pageToken"] = page_token
        code, out, _ = gog(f"people contacts list -a {account}", params)
        if code != 0:
            raise RuntimeError(out)
        data = json.loads(out)
        contacts.extend(data.get("connections", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            return contacts
```

### Heuristic classifier — "complete" vs "incomplete" vs "stub"

For each contact, compute:
- **completeness score**: 1pt each for name, email, phone, org, photo. 0/5 = stub, 5/5 = complete.
- **dedupe key candidates**: normalized name (lowercase, accents stripped), each email domain, each phone (digits only, last 10).

### Dedupe — cluster, then classify clusters

Build clusters by:
1. **Exact email match** — strongest signal, near-zero false positive
2. **Exact phone match** (last 10 digits) — strong signal
3. **Fuzzy name match within 2 edits** + same domain in any email — medium
4. **Fuzzy name match alone** — weakest, surface for manual review

Output: `~/.config/google-contacts-organizer/plans/<email>-<date>.{json,md}`

The `.md` file groups proposed merges by confidence so the user can scan a screen-worth at a time:

```markdown
## High-confidence merges (auto-merge OK)
- **Jane Doe** → 3 entries with email `jane@example.com`, merging into the most-complete
- **Helen W** → 2 entries: `helen.w@x.com` + `helen@x.com` (same domain, same display name)

## Medium-confidence (please confirm)
- **Mehrdad** → 4 entries, names match fuzzy, no shared email; could be different people

## Stub contacts (no name, only email or phone) — 312 entries
- Suggested action: bulk-delete (these are usually Gmail auto-collected addresses), OR move to a `_imported` group for review later
```

---

## Step 3 — Bulk Approval per Cluster Bucket

Same UX as gmail-organizer: present each bucket with one prompt.

```
High-confidence merges: 47 clusters → 47 merges, ~98 contacts collapsing to 47.
  Action: keep the most-complete entry per cluster; merge fields from siblings.
  Reversible? No — Google doesn't expose an "undo" for People API merges, but
  we journal the pre-merge entries to disk so you can recreate them.
  Proceed? [y/N]

Medium-confidence: 12 clusters — surface each as a one-line table for y/n.

Stub bulk-delete: 312 contacts (no name, only an email collected from Gmail).
  Reversible? Yes — Trash holds them for 30 days.
  Proceed? [y/N]
```

---

## Step 4 — Apply Phase

Every mutation written to `~/.config/google-contacts-organizer/journal/<email>-<run-id>.jsonl` **before** the API call. Use the People API atomic operations:

- **Merge** = create a new contact with the merged fieldset, then delete the siblings. The People API has no native "merge" endpoint — composing it from create + delete is the standard approach.
- **Update** = `people.updateContact` with `updatePersonFields` mask.
- **Delete** = `people.deleteContact` (moves to Trash; restorable for 30 days).
- **Group membership** = update the person's `memberships` field; or use `contactGroups.members.modify` for batch ops.

Refuse to apply if the active gog account doesn't match the plan's `account` field.

---

## Step 5 — Maintain Mode

Use the `syncToken` returned by `connections.list` for incremental sync — only contacts that changed since the last full sync come back. Save the `syncToken` to `~/.config/google-contacts-organizer/last_sync-<email>.json` after each successful run.

```python
# First run: full sync, capture sync_token
# Subsequent runs: pass sync_token to get only changed contacts
params = {"resourceName": "people/me", "personFields": PERSON_FIELDS,
          "syncToken": last_sync_token}
```

Gmail's autocomplete continuously adds entries as you correspond with new addresses (the `otherContacts` resource), so a weekly maintenance run is a good cadence. Use `gog otherContacts list` to triage those before they pollute the main contact list.

---

## Cross-surface coordination

When run alongside `org-gmail`:

1. **Contacts before Gmail.** Cleaning people first means Gmail's "label by sender" can use canonical contact identities instead of stray email addresses (`john@x.com` and `john.smith@x.com` get the same label).
2. **Use contact groups as Gmail label hints.** If a contact is in the `family` group, the Gmail apply phase can route their messages to a `personal/family` label without re-classification.

When run alongside `organizer/contacts/` (iCloud):

- Pick one store as authoritative. Don't run both deep-cleans simultaneously — iCloud↔Google sync will fight you.
- A single canonical "Jane Doe" contact in Google should match the canonical "Jane Doe" in iCloud. The reconciliation logic lives in the iCloud skill (it has access to both stores via the OS).

---

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `People API is not enabled for this OAuth project` | One-time GCP setup | Enable at console.developers.google.com/apis/api/people.googleapis.com/overview, then `gog auth add <email> --services contacts,people` |
| `EXPIRED_SYNC_TOKEN` | Last sync was >7 days ago | Re-run with no `syncToken` — full sync is automatic |
| `429` on first page of full sync | Per-day full-sync quota | Wait an hour; subsequent full syncs in the same day are throttled |
| Active account ≠ plan account | `work`/`personal` switched mid-run | Re-source shell or re-run plan |
| Duplicate after merge | Sync race with iCloud | If both stores are bidirectionally synced, expect this; pick one as authoritative |
| HTML 404 on PATCH | Wrong URL pattern | Use the verb-suffix URL: `https://people.googleapis.com/v1/{resourceName}:updateContact?updatePersonFields=...`. Plain `PATCH /v1/{resourceName}?...` returns Google's HTML 404 page even though the docs imply it's the right URL. |
| `400 FAILED_PRECONDITION: etag is different` | Optimistic concurrency: contact was modified between fetch and write | Refetch with `?personFields=metadata`, copy fresh etag into body, retry once. Do NOT clear local cache and re-pull everything. |
| `400 Request field 'birthdays' not allowed for other contacts read requests` | `gog contacts other list` includes `birthdays` in the default mask | Hit the People API directly with a trimmed `readMask` of `names,emailAddresses,phoneNumbers,metadata,photos`. otherContacts is a strict subset — also rejects `biographies`, `organizations`, `addresses`. |
| `400 Cannot add contacts to deprecated system contact group` | Tried to add members to a `SYSTEM_CONTACT_GROUP` (Family/Friends/Coworkers) | Create a user-named group with the same name (e.g. user-group "Family") and add members there. The system groups are read-only via API. |
| `gog auth list` shows `No tokens stored` after a successful auth | Keyring backend is `file` and there's no TTY for the passphrase prompt | `gog auth keyring keychain`, wipe `Library/Application Support/gogcli/keyring/`, re-auth. macOS Keychain handles unlock silently. |
| Gmail's `resultSizeEstimate` for `from:` queries returns either 0 or ~200 | Gmail API estimate is a binary signal beyond the page cap | Frequency ranking via single-query estimates doesn't work. Either paginate and count (expensive for 5k+ addresses) or fall back to local-part heuristics. |
| `gog auth tokens export` saves a refresh token, not an access token | Export is for backup/migration | To make raw People/Gmail API calls, exchange the refresh token at `https://oauth2.googleapis.com/token` (1h access tokens). The bare refresh token alone won't authorize requests. |

---

## Defaults and Guardrails

- **Default to dry-run on the first run.** Print every API call without executing.
- **Refuse to apply** if the active account doesn't match the plan's `account` field.
- **Never bulk-delete without journal.** Every delete is journaled with the full pre-delete contact, so accidental losses can be recreated within 30 days even after Trash auto-purges.
- **Never auto-merge medium-confidence clusters by default.** Only exact email or exact phone matches are safe to auto-merge.
- **Name-match guard on within-store dedupe.** Even with exact phone matches, require all members of a cluster to share the same normalized name (or have empty name). Without this, transitive unionfind contaminates: a stale card with a relative's phone clusters two different people. See `organizer/contacts/SKILL.md` Step 3 for details.
- **Phone normalization to last-10-digits** before clustering. The dominant duplicate pattern is the same number stored in international (`+CC NNN ...`), domestic-prefix (`00CCNNN...`), and local (`(NNN) NNN-NNNN`) formats; normalization collapses them.
- **Add-only enrichment.** Cross-store enrichment (Google ↔ iCloud) only adds missing fields. Notes get appended with a `\n\n---\n\n` separator, after a whitespace-and-separator-insensitive substring check that prevents double-adding already-synced content.
- **Stub deletes (no name, no phone, only an auto-collected email) are reversible** because they go to Trash, but always show the user the count first.

## otherContacts triage (Gmail auto-collected)

After dedupe, you typically have 1k-10k entries in `otherContacts` (Gmail-collected addresses). A representative ratio: ~5k otherContacts for ~500 canonical — i.e. 10× more "addresses Gmail saw" than "people you actually have in your address book".

The useful action is **promotion** — turn high-signal addresses into real contacts. The unhelpful action is bulk-deletion: People API has no public delete for otherContacts (gog uses `gog contacts other delete` via an internal path that works), but Gmail re-creates them on next correspondence anyway, so deleting is mostly cosmetic for autocomplete.

Frequency ranking via Gmail messages is **less useful than expected**:
- `users.messages.list?q=from:<email>&maxResults=1` gives a `resultSizeEstimate`.
- The estimate is binary in practice: returns 0 or capped near 200. No granularity in between.
- So you can't distinguish "your top 50 most-emailed friends" from "this newsletter sent you 200 broadcasts" with a single query each.
- True per-sender counts require pagination — at ~250 quota units/sec and ~5 units per page, counting 5k addresses with avg 100 messages each = ~10⁶ quota = days of work.

What works: **local-part heuristics** to filter out role/transactional addresses (`info`, `support`, `admissions`, `noreply`, `team`, `welcome`, `careers`, etc.) before ranking by zero-or-not. The rough split for a typical inbox:
- ~60% dead (zero `from:` messages — addresses you BCC'd once)
- ~35% hot-but-not-personal (newsletters, gov forms, university admissions)
- ~5% person-looking with a 2+ word name — bulk-promotable, but still mostly one-shot acquaintances

For a personal address book, **don't bulk-promote**. Better: dump the named-person-looking list to markdown and let the user skim and pick.

## Categorization

Both Google groups and iCloud Lists support add-only categorization. Run heuristics independently per store rather than maintaining a cross-store join. Useful auto-rules:
- **Email domain** (`@<work-domain> → Work`, `@<school-domain> → School`) — strongest signal.
- **Heritage/diaspora name pattern + country-code phone → Community group**. Combine a first-name dictionary, last-name suffix list, and explicit surname list specific to the user's community. Add a business-words exclusion to filter false positives where a vendor/sales-rep first-name happens to match the dictionary.
- **Kinship term in NAME → Family**. `name.split()[0].lower() in {mom, dad, mama, papa, uncle, aunt, ...}` (extend with the user's preferred kinship terms in their primary language). Don't read notes — notes describe *other people's* families and produce false positives.

System groups (`contactGroups/family`, `contactGroups/friends`, `contactGroups/coworkers`) are read-only via API. Create user-named groups with the same labels.
