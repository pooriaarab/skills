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
- `work` / `personal` shell functions configured (see [`multi-account-cli`](../../multi-account-cli/SKILL.md))
- Active gws account authenticated **with mutating Gmail scopes** (see Step 2)

**Path B — Gmail API directly (use when the user already has OAuth creds wired up from another project)**
- Python `google-api-python-client` + `google-auth-oauthlib` (`pip install google-api-python-client google-auth-oauthlib`)
- An existing OAuth client + token with scopes `gmail.modify` and `gmail.labels`
- All `gws gmail ...` calls below have a 1:1 Gmail API equivalent (`service.users().messages().list(...)`, `.batchModify(...)`, `.trash(...)`, `.labels().create(...)`). Replace the `gws()` helper in Step 2 with a thin wrapper around `googleapiclient.discovery.build("gmail", "v1", credentials=creds)` and the rest of the script is unchanged.

**Path C — `gog` CLI (covers entire Google Workspace in one tool)**
- `brew install steipete/tap/gogcli` (binary is `gog` — [openclaw/gogcli](https://github.com/openclaw/gogcli))
- Auth: `gog auth` (OAuth flow per Google account); supports `--account=<email>` for multi-account
- Gmail ops: `gog gmail list/labels/move/trash/delete/search`. Same coverage as `gws gmail` with broader Workspace integration (Calendar, Drive, Contacts, Tasks all in one CLI).
- Use this if you also organize Calendar/Contacts/Drive in the same session — single auth, single tool.

All three paths share the same plan/journal artifacts and the same approval flow — only the API client differs.

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

**Workspace OAuth caveat:** if the active account is on a managed Workspace tenant (any `@<your-employer>` domain), the Workspace admin may block third-party apps from acquiring `gmail.modify`. If `gws auth login` fails at the consent screen with a "blocked by your administrator" message, switch to your personal account and run there first. Do not file an IT ticket without checking this skill ran cleanly on the personal account first — the skill itself is what they'll want to vet.

If the active account is correct and scopes are sufficient, proceed.

---

## Performance & Resilience (read this before Step 3)

Inboxes are routinely much larger than they look. Several real-world findings from running this skill on a 90k-message personal inbox:

- **Don't trust `resultSizeEstimate` from `messages.list`** when called with `maxResults=1` — it is wildly inaccurate (we saw `201` reported for an inbox that actually contained 90,539 messages with the `INBOX` label). Always paginate to get a true count.
- **Per-user Gmail quota is ~250 quota units/sec.** `messages.get` costs 5 units, so a naive sequential fetch caps near 50/sec, and a too-tight batch loop hits `403 rateLimitExceeded` (note: `403`, not `429`).
- **Use batch HTTP requests** (`svc.new_batch_http_request(...)`), but **expect individual sub-requests inside a batch to fail with rate-limit errors** even when the outer `batch.execute()` succeeds. The fix is **not** to retry per-ID — that's slow and amplifies the problem. Instead, collect the rate-limited sub-request IDs and re-execute them as a new batch (up to ~2 in-place retries with short backoff), then skip what's left rather than looping forever.
- **Throttle**: batch size 40, 1.5s sleep between batches has cleared 90k metadata fetches without retries on the personal-account quota tier. Tune up if you have a higher-tier project.
- **Persist successful fetches to disk as you go.** Write each completed message's metadata as a line of JSONL to `~/.config/gmail-organizer/cache/metadata-<email>-<query-slug>.jsonl`, and check it on startup so a kill/crash/quota-exhaustion never wastes the work already done. Real runs at this scale take 20–45 min; resume support is not optional.
- **Run unbuffered when backgrounded.** `python3 -u` (or `PYTHONUNBUFFERED=1`) — otherwise stdout is line-buffered when stdout isn't a tty and you'll see no progress until the process exits. This bites particularly hard when piped through `tail`, `grep`, or shell-monitor commands.
- **`getProfile.messagesTotal` counts every message ever**, including Spam and Trash. `q="in:inbox"` is the right scope for inbox-zero work; full-history sweeps are a follow-up if you need richer cross-sender stats.
- **Backoff predicate**: treat `429`, `500`, `503`, *and* `403` with body containing `rateLimitExceeded` / `userRateLimitExceeded` as transient. A bare `403` is a scope problem (Step 2), not a quota problem.

The `_execute_batch` / `fetch_metadata` helpers below implement all of this. Don't replace them with a one-shot loop — at this scale you will lose hours.

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
# NOTE: ignore Gmail's `resultSizeEstimate` — paginate for the true count.
print("Listing messages...")
ids = []
for m in gws_page("gmail users messages list",
                  {"userId": "me", "q": query, "maxResults": 500}):
    ids.append(m["id"])
print(f"  {len(ids)} message IDs")

# Step 3b — fetch metadata in batches (headers only — fast).
#
# Path B (direct Gmail API) implements resilient batch fetch with persistence.
# Path A (gws CLI, sequential) is simpler but ~20x slower at scale; prefer Path B
# when the inbox exceeds ~5k messages.
#
# Resilience requirements (see "Performance & Resilience" above):
#   1. Persist each successful fetch to a JSONL cache so a crash doesn't waste
#      work — and skip cached IDs on resume.
#   2. When sub-requests inside a batch hit a rate-limit error, re-execute just
#      those IDs as another batch (≤2 retries, short backoff). Do NOT fall back
#      to per-ID calls — that's slow and amplifies the rate problem.
#   3. Treat 429/500/503 *and* 403 with body matching `(user)?rateLimitExceeded`
#      as transient. Bare 403 is a scope problem (Step 2).
#
# Default throttle on a personal-tier project: batch_size=40, sleep_between=1.5s.

CACHE_DIR = os.path.expanduser("~/.config/gmail-organizer/cache")
os.makedirs(CACHE_DIR, exist_ok=True)
slug = re.sub(r"[^a-z0-9]+", "_", (query or "all").lower()).strip("_") or "all"
CACHE_PATH = f"{CACHE_DIR}/metadata-{EMAIL}-{slug}.jsonl"

# Path B (direct Gmail API) — resilient batch fetch with persistence.
# from googleapiclient.errors import HttpError
#
# def is_rate_limited(exc):
#     if not isinstance(exc, HttpError):
#         return False
#     status = getattr(exc.resp, "status", None)
#     body = (exc.content or b"").decode("utf-8", errors="ignore").lower()
#     return status in (429, 500, 503) or (
#         status == 403 and ("ratelimitexceeded" in body or "userratelimitexceeded" in body)
#     )
#
# def execute_batch(svc, batch_ids, headers_wanted, out):
#     transient = []
#     def cb(rid, resp, exc):
#         if exc is None and resp is not None:
#             out[rid] = resp
#         elif exc is not None and is_rate_limited(exc):
#             transient.append(rid)
#     batch = svc.new_batch_http_request(callback=cb)
#     for mid in batch_ids:
#         batch.add(svc.users().messages().get(
#             userId="me", id=mid, format="metadata", metadataHeaders=headers_wanted),
#             request_id=mid)
#     batch.execute()  # wrap in your own backoff for outer-batch transient errors
#     return transient
#
# def fetch_metadata(svc, ids, *, batch_size=40, sleep_between=1.5):
#     headers_wanted = ["From", "Subject", "Date", "List-Unsubscribe", "List-Unsubscribe-Post"]
#     out = {}
#     # Resume from cache
#     if os.path.exists(CACHE_PATH):
#         for line in open(CACHE_PATH):
#             try: rec = json.loads(line); out[rec["id"]] = rec
#             except: pass
#     pending = [mid for mid in ids if mid not in out]
#     with open(CACHE_PATH, "a") as fp:
#         for i in range(0, len(pending), batch_size):
#             chunk = pending[i:i+batch_size]
#             transient = execute_batch(svc, chunk, headers_wanted, out)
#             for retry in range(2):
#                 if not transient: break
#                 time.sleep(2 ** retry)
#                 transient = execute_batch(svc, transient, headers_wanted, out)
#             for rid in chunk:
#                 if rid in out: fp.write(json.dumps(out[rid]) + "\n")
#             fp.flush()
#             if i + batch_size < len(pending): time.sleep(sleep_between)
#     return out
#
# msgs = fetch_metadata(svc, ids)

# Path A (gws CLI) — fine for small inboxes (<5k msgs); too slow for deep-clean
# at 90k+. The same persistence + retry-as-batch logic applies in principle, but
# gws does not expose a batch endpoint, so each fetch is its own HTTP call.
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
        print(f"  fetched {i}/{len(ids)}", flush=True)  # flush=True matters when stdout isn't a tty
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
    if domain.endswith("yourcompany.com"):  # replace with the user's work domain(s)
        return "work/internal"
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
    "work/internal":  "work/internal",
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

### Realistic unsubscribe success rates (from a 90k-msg run)

On a real personal-account run, only **~52%** of newsletter senders had a one-click `List-Unsubscribe-Post` header. Of those, **~74%** of POSTs succeeded; the rest broke down roughly as:

| Outcome | Share | Notes |
|---|---:|---|
| 200–399 success | 74% | Worked as advertised |
| 404 / 410 | 11% | Sender's unsubscribe endpoint is gone (company shut down) |
| Network errors (DNS, refused, SSL) | 8% | Sender's domain is gone or unreachable |
| 403 | 4% | Sender refuses programmatic one-click despite advertising it (LinkedIn, Medium, sometimes Beehiiv) |
| 400 / 405 / 5xx | 3% | Server-side bugs |

Plan around this: bulk one-click cleans up most newsletters, but expect to surface a CSV/TODO list of:
- The ~48% of senders without one-click — they need manual `mailto:` or HTML-link unsubscribe
- The ~26% of one-click failures — many are dead, some need manual visits

Sort the TODO by message volume so the user spends their attention where it matters.

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
work     && python -m gmail_organizer maintain   # work account
personal && python -m gmail_organizer maintain   # personal account
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
- **Heuristics first, LLM second.** The LLM classifier (if enabled) runs at most one call per sender domain, never per message. Cap the budget at 200 ambiguous domains per run, or use a cheap model (e.g. `claude-haiku-4-5` with prompt caching) for larger sweeps — sender-classification is a perfect fit for that tier.

---

## Label hygiene (kebab-case + preserve list)

Apply both rules together as a single audit pass after the apply phase:

1. **Kebab-case all user-visible labels.** Lowercase, words joined with `-`, slashes preserved for nesting. `Bee House/Sponsors` → `bee-house/sponsors`. Use `users.labels.update` (the label *ID* stays the same; only the display name changes, so existing message labels stay applied).
2. **Preserve labels that other tools depend on.** Renaming a label that an external tool (Gmail plugin, filter, integration) reads by name will silently break it. Always preserve:
   - Anything matching the `GMass*` family (`GMass Reports`, `GMass Reports/Opens`, `GMass Auto Followup`, etc.) — created and read by the GMass plugin.
   - User-flagged labels referenced in other systems. Ask the user up-front: *"Any labels other tools read by name?"* and add them to the preserve list. Common candidates: `Notes`, `Personal`, anything matching `*Calendar*`, plugin-specific labels.
3. **Delete redundant empty labels.** If you've created a hierarchical replacement (e.g. `finance/receipts`), the legacy flat label (`Receipts`, 0 msgs) can be deleted. Only delete labels with `messagesTotal == 0`.

System labels (`INBOX`, `SPAM`, `TRASH`, `CATEGORY_*`, etc.) and any label with `type: "system"` must never be renamed or deleted.

---

## Common Failures

| Symptom | Cause | Fix |
|---|---|---|
| `403 insufficientPermissions` on `messages.list` | Token has only `gmail.readonly` | `gws auth logout && gws auth login -s gmail` and grant Modify |
| `401 invalid_rapt` | Stale reauth challenge | Same as above |
| `consent screen blocked by administrator` | Workspace OAuth restriction (e.g. <employer>) | Start with `personal` first; raise IT ticket only after personal-account run is clean |
| Active account ≠ plan email | `work`/`personal` was switched between plan and apply | Re-run plan, or switch back |
| Plan shows `(unknown)` domain with high count | Malformed `From` headers (rare) | Surface in the `review` category for manual handling |
| `403 rateLimitExceeded` mid-fetch | Per-user QPM exceeded (note: 403 not 429) | Retry rate-limited IDs as a new batch (≤2x), then skip; tune `batch_size` / `sleep_between` down |
| `Quota exceeded ... Queries per minute per user` | Same as above, after a burst | Wait ~60s; the JSONL cache means resumed runs skip what's already done |
| `resultSizeEstimate` says ~200 but inbox is huge | Estimate is unreliable when called with `maxResults=1` | Always paginate `messages.list` for the true count |
| No progress lines visible while running in background | Python stdout buffered when not a tty | Run with `python3 -u` (or `PYTHONUNBUFFERED=1`); use `flush=True` on `print()` |
| Batch sub-requests succeed in some calls, fail in others | Gmail rate-limits *individual* sub-requests inside a batch | Collect failed IDs from the per-request callback and re-`batch.execute()` them — don't fall back to per-ID sequential retry |
