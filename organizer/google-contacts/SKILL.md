---
name: google-contacts
description: "Use when the user wants to organize Google Contacts (the cloud-side address book that backs Gmail's address autocomplete) — including dedupe, missing-field enrichment, contact group / starred curation, and tagging-by-relationship. Distinct from the iCloud-side `contacts` skill: this one is Google-only via the People API. Triggers: 'organize my google contacts', 'dedupe gmail contacts', 'fix my address book in gmail', 'contact groups in google'."
---

# Google Contacts Organizer

Triage Google Contacts via the **People API** — dedupe near-identical entries, fill missing names/emails/phones, and curate contact groups (the People API equivalent of Gmail labels for people). Two-phase plan → approve → apply, mirroring `gmail-organizer`.

This skill is the **Google-side** counterpart to `organizer/contacts/` (which handles iCloud Contacts.app). Run them in either order. If the user keeps both stores in sync via [Apple's Add Account → Google](https://support.apple.com/guide/contacts/use-icloud-and-other-internet-accounts-cnt5b08a32a/mac), pick one as authoritative and clean it first.

## Requirements

Pick whichever access path is convenient:

**Path A — `gog` CLI** (recommended; works with the `work`/`personal` shell switcher)
- [`gog`](https://github.com/openclaw/gogcli) — `brew install steipete/tap/gogcli`
- Account authenticated with the `contacts` and `people` services:
  - `gog auth add pooria.arab@gmail.com --services contacts,people`
  - `gog auth add parab@mozilla.com --services contacts,people`
- People API enabled on the OAuth project (one-click in [GCP console](https://console.developers.google.com/apis/api/people.googleapis.com/overview))
- After running `personal` / `work` in your shell, `gog` invocations auto-inject `-a $GOG_ACCOUNT_DEFAULT` — see Pre-flight below

**Path B — `gws` CLI** (alternate; same OAuth project as Path A)
- `gws people connections list` for read; `gws people people create / updateContact / deleteContact` for writes
- Requires `https://www.googleapis.com/auth/contacts` scope on the gws token. Re-login if missing: `gws auth login --scopes 'https://www.googleapis.com/auth/contacts'`

**Common:**
- Python 3.9+
- Optional model client for ambiguous-merge classification (heuristics handle most). Local Apple Intelligence / Ollama are fine — sender-clustering is a small workload.

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
   a) auto-derive from email domain + interaction frequency (e.g. `mozilla-coworkers`,
      `family`, `frequent-2024`)
   b) preserve existing groups; only suggest new ones for ungrouped contacts
   c) fixed scheme: family / friends / coworkers / vendors / acquaintances

6. Starred contacts — should the skill curate? (yes/no/preserve-as-is)
```

---

## Step 2 — Plan Phase (read-only)

Pull every connection via `people.connections.list` with a wide `personFields` mask. Cache to `~/.config/google-contacts-organizer/cache/people-<email>.jsonl` for resume across sessions. The same persistence pattern that survives Gmail at 90k scale survives Contacts at 5k scale — the cache cost is trivial and the resume value is high.

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
- **Pooria Arab** → 3 entries with email `pooria.arab@gmail.com`, merging into the most-complete
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

When run alongside `gmail-organizer`:

1. **Contacts before Gmail.** Cleaning people first means Gmail's "label by sender" can use canonical contact identities instead of stray email addresses (`john@x.com` and `john.smith@x.com` get the same label).
2. **Use contact groups as Gmail label hints.** If a contact is in the `family` group, the Gmail apply phase can route their messages to a `personal/family` label without re-classification.

When run alongside `organizer/contacts/` (iCloud):

- Pick one store as authoritative. Don't run both deep-cleans simultaneously — iCloud↔Google sync will fight you.
- A single canonical "Pooria Arab" contact in Google should match the canonical "Pooria Arab" in iCloud. The reconciliation logic lives in the iCloud skill (it has access to both stores via the OS).

---

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `People API is not enabled for this OAuth project` | One-time GCP setup | Enable at console.developers.google.com/apis/api/people.googleapis.com/overview, then `gog auth add <email> --services contacts,people` |
| `EXPIRED_SYNC_TOKEN` | Last sync was >7 days ago | Re-run with no `syncToken` — full sync is automatic |
| `429` on first page of full sync | Per-day full-sync quota | Wait an hour; subsequent full syncs in the same day are throttled |
| Active account ≠ plan account | `work`/`personal` switched mid-run | Re-source shell or re-run plan |
| Duplicate after merge | Sync race with iCloud | If both stores are bidirectionally synced, expect this; pick one as authoritative |

---

## Defaults and Guardrails

- **Default to dry-run on the first run.** Print every API call without executing.
- **Refuse to apply** if the active account doesn't match the plan's `account` field.
- **Never bulk-delete without journal.** Every delete is journaled with the full pre-delete contact, so accidental losses can be recreated within 30 days even after Trash auto-purges.
- **Never auto-merge medium-confidence clusters by default.** Only exact email or exact phone matches are safe to auto-merge.
- **Stub deletes (no name, no phone, only an auto-collected email) are reversible** because they go to Trash, but always show the user the count first.
