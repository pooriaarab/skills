---
name: gmail-organizer
description: "Use when the user wants to organize, triage, or clean up Gmail — including auto-labeling messages, archiving newsletters/receipts/notifications, unsubscribing from mailing lists, deleting spam, and reaching inbox zero. Two-phase workflow (plan → approve → apply) with bulk approval per category and a journal-based undo. Triggers: 'organize my gmail', 'inbox zero', 'unsubscribe from newsletters', 'clean up email', 'my inbox is a mess'."
---

# Gmail Organizer

Triage a chaotic Gmail inbox using the `gws` CLI. Two phases: **plan** (read-only scan, classify, propose label taxonomy) and **apply** (bulk-approve and execute label/archive/trash/delete/unsubscribe per category). Supports both deep-clean and ongoing maintenance. Account switching via the `work` / `personal` shell functions — run on one account at a time.

## Requirements

Two supported access paths — pick whichever is easier in the user's environment:

**Path A — `gws` CLI (default in this skill's examples)**
- [`gws` CLI](https://github.com/nicholasgasior/gws) — Google Workspace CLI: `brew install gws`
- `work` / `personal` shell functions configured (see [`multi-account-cli`](../multi-account-cli/SKILL.md))
- Active gws account authenticated **with mutating Gmail scopes** (see Step 2)

**Path B — Gmail API directly (use when the user already has OAuth creds wired up, e.g. from another project like solo-admin)**
- Python `google-api-python-client` + `google-auth-oauthlib` (`pip install google-api-python-client google-auth-oauthlib`)
- An existing OAuth client + token with scopes `gmail.modify` and `gmail.labels`
- All `gws gmail ...` calls below have a 1:1 Gmail API equivalent (`service.users().messages().list(...)`, `.batchModify(...)`, `.trash(...)`, `.labels().create(...)`). Replace the `gws()` helper in Step 2 with a thin wrapper around `googleapiclient.discovery.build("gmail", "v1", credentials=creds)` and the rest of the script is unchanged.

Both paths share the same plan/journal artifacts and the same approval flow — only the API client differs.

**Common requirements (both paths):**
- Python 3.9+
- A model client for ambiguous-sender classification (optional — heuristics handle most cases). Pick whichever is convenient:
  - **Cloud:** OpenAI (`OPENAI_API_KEY`) or Anthropic (`ANTHROPIC_API_KEY`) — gpt-4o-mini / claude-haiku tier is plenty
  - **Local on macOS — Apple Intelligence Foundation Models** (on-device, free, no data leaves the machine). Available on macOS 15+ via Apple's FoundationModels framework. CLI access via Swift (`swift run`) or Python wrappers like [`apple-foundation-models-py`]; or via the system's built-in writing tools when run from a Shortcut. Use when privacy matters more than peak accuracy
  - **Local self-hosted:** Ollama / LM Studio with any local model (`llama3.1:8b` is fine for sender classification) — swap the API call for the local endpoint
  - The classifier's prompt is small (sender domain + 5 sample subjects → category label), so any of these work; pick by your privacy/cost preference

**Estimated time:** 20–60 min for first deep-clean; 2–5 min for `maintain` runs after that.
**Estimated cost:** ~$0.01–0.20 in AI API calls (gpt-4o-mini), one call per sender domain (not per message).

| Inbox Size       | Plan time | Apply time | AI cost |
|------------------|-----------|------------|---------|
| ~5k messages     | ~3 min    | ~5 min     | <$0.02  |
| ~20k messages    | ~8 min    | ~15 min    | ~$0.05  |
| ~100k messages   | ~30 min   | ~45 min    | ~$0.20  |

---

## Step 1 — Ask the User These Questions First

Do not skip this. Wrong assumptions = wrong labels and irreversible deletes.

```
1. Which account this run? (work / personal)
   → They must run `work` or `personal` in their shell BEFORE invoking the skill.
   → Refuse to proceed if the active gws account doesn't match what they said.

2. Mode: deep-clean or maintain?
   a) deep-clean — full history scan, propose taxonomy, big reorganization
   b) maintain  — only mail since last_run.json for this account; small batches

3. What does "inbox zero" mean for THIS account?
   a) Inbox = only items needing action (default; archives newsletters/receipts/notifs with labels)
   b) Inbox literally empty (archive/delete everything currently in:inbox after categorizing)
   c) Inbox = unread + last 7 days (older mail auto-archived with labels)

4. Allowed operations? (multi-select)
   - Apply labels                      [default: yes]
   - Archive (remove from Inbox)       [default: yes]
   - Move to Trash (30-day auto-purge) [default: ask per category]
   - Permanently delete                [default: NO — opt-in only]
   - Unsubscribe (List-Unsubscribe)    [default: ask per category]

5. Privacy boundary for ambiguous senders?
   a) Headers + snippets only (private; less accurate)
   b) Read full body when classifier is unsure (accurate; sees more)

6. Existing labels — preserve or rebuild?
   a) Preserve all existing labels; only add new ones for gaps  [recommended]
   b) Propose a fresh taxonomy that may rename/merge existing labels
```

After answering, run the **scope check** in Step 2 before any other action.

---

## Step 2 — Verify Gmail Scopes for the Active Account

Either client (gws or direct Gmail API) needs `https://www.googleapis.com/auth/gmail.modify` (read + label + archive + trash) and `https://www.googleapis.com/auth/gmail.labels` to do anything useful. With gws, the default `gws auth login` may grant only `gmail.readonly`, which produces the misleading 403 `insufficientPermissions` on `messages.list`. With the direct Gmail API, request these scopes when constructing the `Flow`.

```python
# Path B — direct Gmail API alternative to the gws() helper below.
# Uncomment and replace the gws() function in Step 2 if not using the gws CLI.
#
# from googleapiclient.discovery import build
# from google.oauth2.credentials import Credentials
# creds = Credentials.from_authorized_user_file("~/path/to/token.json",
#     scopes=["https://www.googleapis.com/auth/gmail.modify",
#             "https://www.googleapis.com/auth/gmail.labels"])
# svc = build("gmail", "v1", credentials=creds, cache_discovery=False)
# # Then: svc.users().messages().list(userId="me", q=...).execute()  etc.
```

```python
import json, subprocess, sys

def gws(cmd, params=None, body=None):
    args = ["gws"] + cmd.split()
    if params is not None:
        args += ["--params", json.dumps(params)]
    if body is not None:
        args += ["--json", json.dumps(body)]
    args += ["--format", "json"]
    r = subprocess.run(args, capture_output=True, text=True)
    raw = "\n".join(l for l in r.stdout.splitlines() if not l.startswith("Using keyring")).strip()
    return r.returncode, raw, r.stderr

# 1. Confirm which account is active
code, out, err = gws("gmail users getProfile", {"userId": "me"})
if code != 0:
    print("AUTH BROKEN. Run:")
    print("  gws auth logout")
    print("  gws auth login -s gmail")
    print("When prompted, grant 'Modify' (NOT just Read) — needed for labels/archive/trash.")
    sys.exit(1)
profile = json.loads(out)
print(f"Active account: {profile['emailAddress']}  (messages: {profile['messagesTotal']})")

# 2. Probe modify scope by trying a no-op batchModify on zero IDs
code, out, err = gws("gmail users messages batchModify", {"userId": "me"},
                     {"ids": [], "addLabelIds": [], "removeLabelIds": []})
if "insufficientPermissions" in (out + err) or "insufficient" in (out + err):
    print("SCOPE TOO NARROW — current token is read-only.")
    print("Run:  gws auth logout && gws auth login -s gmail")
    print("Or for explicit scopes:")
    print("  gws auth login --scopes \\")
    print("    'https://www.googleapis.com/auth/gmail.modify,https://www.googleapis.com/auth/gmail.labels'")
    sys.exit(1)
```

**Mozilla / Workspace OAuth caveat:** if the active account is `parab@mozilla.com`, the Workspace admin may block third-party apps from acquiring `gmail.modify`. If `gws auth login` fails at the consent screen with a "blocked by your administrator" message, switch to `personal` and run there first. Do not file an IT ticket without checking this skill ran cleanly on the personal account first — the skill itself is what they'll want to vet.

If the active account is correct and scopes are sufficient, proceed.

---

## Step 3 — Plan Phase (read-only)

The plan phase produces two artifacts under `~/.config/gmail-organizer/plans/`:

- `<email>-<YYYY-MM-DD>.json` — full sender map + per-message classification + proposed actions
- `<email>-<YYYY-MM-DD>.md` — human-readable summary the user reviews in chat

```python
import json, subprocess, time, os, datetime, re
from collections import defaultdict
from email.utils import parseaddr

def gws_page(cmd, params, page_field="messages"):
    """Generator over all pages of a list endpoint."""
    while True:
        code, out, _ = gws(cmd, params)
        if code != 0:
            raise RuntimeError(out)
        data = json.loads(out) if out else {}
        for item in data.get(page_field, []) or []:
            yield item
        token = data.get("nextPageToken")
        if not token:
            return
        params["pageToken"] = token

# Reuse gws() from Step 2.

EMAIL = profile["emailAddress"]
RUN_DATE = datetime.date.today().isoformat()
PLAN_DIR = os.path.expanduser("~/.config/gmail-organizer/plans")
os.makedirs(PLAN_DIR, exist_ok=True)
PLAN_JSON = f"{PLAN_DIR}/{EMAIL}-{RUN_DATE}.json"
PLAN_MD   = f"{PLAN_DIR}/{EMAIL}-{RUN_DATE}.md"

# Query: deep-clean uses no date filter (all mail). Maintain uses since-last-run.
LAST_RUN_FILE = os.path.expanduser(f"~/.config/gmail-organizer/last_run-{EMAIL}.json")
mode = "deep-clean"  # set from Step 1 answer
query = ""
if mode == "maintain" and os.path.exists(LAST_RUN_FILE):
    last_ts = json.load(open(LAST_RUN_FILE))["epoch"]
    query = f"after:{last_ts}"

# Step 3a — list all message IDs (cheap; just IDs)
print("Listing messages...")
ids = []
for m in gws_page("gmail users messages list",
                  {"userId": "me", "q": query, "maxResults": 500}):
    ids.append(m["id"])
print(f"  {len(ids)} message IDs")

# Step 3b — fetch metadata in batches (headers only — fast)
def get_metadata(msg_id):
    code, out, _ = gws("gmail users messages get",
                       {"userId": "me", "id": msg_id, "format": "metadata",
                        "metadataHeaders": ["From", "Subject", "Date", "List-Unsubscribe", "List-Unsubscribe-Post"]})
    return json.loads(out) if code == 0 else None

# Group senders before classifying
senders = defaultdict(lambda: {
    "count": 0, "subjects": [], "labels": set(),
    "has_list_unsub": False, "list_unsub_value": None,
    "has_one_click": False, "first_seen": None, "last_seen": None,
    "msg_ids": [],
})

for i, msg_id in enumerate(ids):
    if i % 500 == 0:
        print(f"  fetched {i}/{len(ids)}")
    m = get_metadata(msg_id)
    if not m:
        continue
    headers = {h["name"].lower(): h["value"] for h in m.get("payload", {}).get("headers", [])}
    _, addr = parseaddr(headers.get("from", ""))
    domain = addr.split("@")[-1].lower() if "@" in addr else "(unknown)"
    s = senders[domain]
    s["count"] += 1
    s["msg_ids"].append(msg_id)
    if len(s["subjects"]) < 5:
        s["subjects"].append(headers.get("subject", "")[:120])
    s["labels"].update(m.get("labelIds", []))
    if "list-unsubscribe" in headers:
        s["has_list_unsub"] = True
        s["list_unsub_value"] = headers["list-unsubscribe"]
    if "list-unsubscribe-post" in headers:
        s["has_one_click"] = True
    ts = int(m.get("internalDate", 0))
    s["first_seen"] = ts if not s["first_seen"] else min(s["first_seen"], ts)
    s["last_seen"]  = ts if not s["last_seen"]  else max(s["last_seen"], ts)

# Step 3c — heuristic classification (per sender domain, not per message)
def classify_heuristic(domain, s):
    if s["has_list_unsub"]:
        return "newsletter"
    if domain in ("stripe.com", "paypal.com", "square.com") or any("receipt" in subj.lower() or "invoice" in subj.lower() for subj in s["subjects"]):
        return "receipt"
    if domain == "github.com" or domain.endswith(".github.com"):
        return "github"
    if "calendar.google.com" in domain or any("invitation" in subj.lower() for subj in s["subjects"]):
        return "calendar"
    if domain.endswith("mozilla.com") or domain.endswith("mozilla.org"):
        return "mozilla/internal"
    if "noreply" in domain or "no-reply" in domain or domain.startswith("notifications@"):
        return "notification"
    if "SPAM" in s["labels"]:
        return "spam"
    return None  # ambiguous → LLM (only if the user opted into it)

classified = {}
ambiguous = []
for domain, s in senders.items():
    label = classify_heuristic(domain, s)
    if label:
        classified[domain] = label
    else:
        ambiguous.append(domain)

# Optional: cluster ambiguous domains and ask LLM (one call per domain).
# Skipped here — keep heuristic-only by default. Add an LLM step if user opted in.

# Step 3d — propose label taxonomy (neutral, hierarchical, human-readable)
TAXONOMY = {
    "newsletter":      "newsletters",
    "receipt":         "finance/receipts",
    "github":          "dev/github",
    "calendar":        "calendar",
    "mozilla/internal":"mozilla/internal",
    "notification":    "notifications",
    "spam":            "(trash)",  # special: route to trash, not labeled
}

# Step 3e — write plan files
plan = {
    "email": EMAIL,
    "run_date": RUN_DATE,
    "mode": mode,
    "total_messages": sum(s["count"] for s in senders.values()),
    "total_senders": len(senders),
    "categories": {},
}
for domain, s in senders.items():
    cat = classified.get(domain, "review")
    plan["categories"].setdefault(cat, []).append({
        "domain": domain,
        "count": s["count"],
        "has_list_unsub": s["has_list_unsub"],
        "has_one_click": s["has_one_click"],
        "list_unsub_value": s["list_unsub_value"],
        "sample_subjects": s["subjects"],
        "msg_ids": s["msg_ids"],
    })

with open(PLAN_JSON, "w") as f:
    json.dump(plan, f, indent=2)

# Markdown summary the user actually reads
lines = [f"# Gmail Plan — {EMAIL} — {RUN_DATE}\n",
         f"- Mode: **{mode}**",
         f"- Total messages: **{plan['total_messages']:,}**",
         f"- Total senders (domains): **{plan['total_senders']:,}**\n",
         "## Proposed actions per category\n"]
for cat, items in sorted(plan["categories"].items(), key=lambda kv: -sum(i["count"] for i in kv[1])):
    msg_total = sum(i["count"] for i in items)
    lines.append(f"### `{cat}` — {len(items)} senders, {msg_total:,} messages")
    for it in sorted(items, key=lambda i: -i["count"])[:10]:
        unsub = " 🔕(1-click unsub)" if it["has_one_click"] else (" 🔕(unsub link)" if it["has_list_unsub"] else "")
        lines.append(f"- **{it['domain']}** — {it['count']:,} msgs{unsub}")
        for subj in it["sample_subjects"][:2]:
            lines.append(f"  - _{subj}_")
    if len(items) > 10:
        lines.append(f"- _+ {len(items)-10} more senders_")
    lines.append("")

open(PLAN_MD, "w").write("\n".join(lines))
print(f"\nPlan written:")
print(f"  {PLAN_MD}")
print(f"  {PLAN_JSON}")
```

After this runs, **show the user the contents of the `.md` file** and ask for taxonomy approval before Step 4.

---

## Step 4 — Bulk Approval per Category

For each category in the plan, present a single approve/skip/edit prompt. Don't ask per-sender unless the user requested it.

```
Category: newsletters — 34 senders, 2,103 messages
  Action: apply label `newsletters`, archive all, attempt 1-click unsubscribe on 28 senders.
  Irreversible? Unsubscribe yes; archive no.
  Proceed? [y/N/edit/skip]

Category: finance/receipts — 8 senders, 412 messages
  Action: apply label `finance/receipts`, archive all. No deletes, no unsubscribes.
  Proceed? [y/N/skip]

Category: review — 91 senders, 380 messages
  Action: NONE — surfaced for your manual review. Plan file lists all 91 senders.
  Acknowledge? [y]
```

Default to **archive + label** for everything except:
- `(trash)` category → ask explicitly: "Move 47 spam messages to Trash? (auto-purges in 30 days) [y/N]"
- Permanent delete → never default, always opt-in per-category and warn `IRREVERSIBLE`
- Unsubscribe → only attempt one-click (`List-Unsubscribe-Post: List-Unsubscribe=One-Click`) automatically. For mailto/HTML-link unsubscribes, surface URLs to the user and let them click.

Refuse to apply if the active gws account doesn't match the plan's `email` field.

---

## Step 5 — Apply Phase

Every mutation is appended to a journal **before** the API call, so a crash mid-run is recoverable and `undo` (Step 7) has a complete record.

```python
import requests
JOURNAL_DIR = os.path.expanduser("~/.config/gmail-organizer/journal")
os.makedirs(JOURNAL_DIR, exist_ok=True)
RUN_ID = datetime.datetime.now().strftime("%Y%m%dT%H%M%S")
JOURNAL = f"{JOURNAL_DIR}/{EMAIL}-{RUN_ID}.jsonl"

def journal(action, payload):
    with open(JOURNAL, "a") as f:
        f.write(json.dumps({"ts": time.time(), "action": action, **payload}) + "\n")

# Helper: ensure label exists, return its ID
def ensure_label(name):
    code, out, _ = gws("gmail users labels list", {"userId": "me"})
    existing = {l["name"]: l["id"] for l in json.loads(out).get("labels", [])}
    if name in existing:
        return existing[name]
    code, out, _ = gws("gmail users labels create", {"userId": "me"},
                       {"name": name, "labelListVisibility": "labelShow",
                        "messageListVisibility": "show"})
    lid = json.loads(out)["id"]
    journal("label_created", {"name": name, "id": lid})
    return lid

# Apply per category. INBOX label removal == archive.
INBOX_ID = "INBOX"

def batch_modify(msg_ids, add=None, remove=None, chunk=1000):
    add = add or []
    remove = remove or []
    for i in range(0, len(msg_ids), chunk):
        batch = msg_ids[i:i+chunk]
        journal("batch_modify", {"ids": batch, "add": add, "remove": remove})
        gws("gmail users messages batchModify", {"userId": "me"},
            {"ids": batch, "addLabelIds": add, "removeLabelIds": remove})

def trash_messages(msg_ids):
    for mid in msg_ids:
        journal("trash", {"id": mid})
        gws("gmail users messages trash", {"userId": "me", "id": mid})

def one_click_unsubscribe(list_unsub_header):
    # RFC 8058: extract URL inside <...>, POST with body "List-Unsubscribe=One-Click"
    m = re.search(r"<(https?://[^>]+)>", list_unsub_header or "")
    if not m:
        return False
    url = m.group(1)
    journal("unsubscribe_one_click", {"url": url})
    try:
        r = requests.post(url, data={"List-Unsubscribe": "One-Click"}, timeout=15)
        return 200 <= r.status_code < 400
    except Exception as e:
        journal("unsubscribe_error", {"url": url, "error": str(e)})
        return False
```

Loop over the approved categories from Step 4. For each: `ensure_label`, then `batch_modify(ids, add=[label_id], remove=[INBOX_ID])`. For the trash category: `trash_messages(ids)`. For unsubscribe-eligible senders in `newsletters`: only call `one_click_unsubscribe` if `has_one_click` is true. **Update `last_run-{EMAIL}.json` at the end** with the current epoch so `maintain` works next time.

---

## Step 6 — Maintain Mode

Re-run Steps 3–5 with `mode="maintain"`. The plan query becomes `after:<last_run_epoch>`, so only new mail since the last run is processed. Same approval flow, smaller batches. Suggest the user run this weekly.

```bash
# convenience: one shell command per account
work     && python -m gmail_organizer maintain   # mozilla
personal && python -m gmail_organizer maintain   # gmail
```

(Naming the script `gmail_organizer` is suggestive — the actual invocation in this skill is "the assistant runs the embedded Python from Steps 3–5 with `mode='maintain'`.")

---

## Step 7 — Undo

`undo` reads the most recent journal for the active account and reverses what it can. Reversible: label additions, archive (re-add INBOX), trash (untrash). Irreversible: permanent deletes, unsubscribe POSTs (those just get printed for the user to manually re-subscribe).

```python
JOURNAL_FILE = max((f for f in os.listdir(JOURNAL_DIR) if f.startswith(EMAIL + "-")),
                   key=lambda f: f, default=None)
if not JOURNAL_FILE:
    print("No journal found for", EMAIL); sys.exit(0)

# Replay in reverse
events = [json.loads(l) for l in open(f"{JOURNAL_DIR}/{JOURNAL_FILE}")]
for ev in reversed(events):
    a = ev["action"]
    if a == "batch_modify":
        # Reverse: swap add/remove
        gws("gmail users messages batchModify", {"userId": "me"},
            {"ids": ev["ids"], "addLabelIds": ev["remove"], "removeLabelIds": ev["add"]})
    elif a == "trash":
        gws("gmail users messages untrash", {"userId": "me", "id": ev["id"]})
    elif a == "label_created":
        # Optional: delete the label we created. Usually you want to keep it.
        pass
    elif a == "unsubscribe_one_click":
        print(f"NOT REVERSIBLE — manually re-subscribe at: {ev['url']}")
```

---

## Defaults and Guardrails

- **Default to `--dry-run` on the first run of any session.** Print every API call without executing. Only switch to live mode after the user explicitly confirms.
- **Refuse to apply** if `profile.emailAddress` ≠ `plan.email`.
- **Never permanent-delete by default.** The trash category uses `messages.trash` (30-day window), not `messages.delete`. Permanent delete is opt-in per-category and the prompt must say "IRREVERSIBLE".
- **Never click HTML unsubscribe links automatically.** Only RFC 8058 one-click POST is automated. mailto: and HTML-link unsubscribes are surfaced to the user.
- **Tag every artifact with the email.** Plan files, journals, and `last_run` are all per-account so cross-account contamination is impossible.
- **Heuristics first, LLM second.** The LLM classifier (if enabled) runs at most one call per sender domain, never per message. Cap the budget at 200 ambiguous domains per run.

---

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `403 insufficientPermissions` on `messages.list` | Token has only `gmail.readonly` | `gws auth logout && gws auth login -s gmail` and grant Modify |
| `401 invalid_rapt` | Stale reauth challenge | Same as above |
| `consent screen blocked by administrator` | Workspace OAuth restriction (e.g. Mozilla) | Start with `personal` first; raise IT ticket only after personal-account run is clean |
| Active account ≠ plan email | `work`/`personal` was switched between plan and apply | Re-run plan, or switch back |
| Plan shows `(unknown)` domain with high count | Malformed `From` headers (rare) | Surface in the `review` category for manual handling |
