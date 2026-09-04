---
name: google-drive-organizer
description: "Use when the user wants to organize, restructure, or clean up their Google Drive — including creating folder hierarchies, moving misplaced files, renaming files descriptively, classifying untitled documents with AI, and deleting empty files. Triggers: 'organize my Drive', 'clean up Google Drive', 'restructure Drive folders', 'my Drive is a mess'."
---

# Google Drive Organizer

Reorganize a chaotic Google Drive into a clean, kebab-case folder hierarchy using the `gws` CLI and a Python automation script. Two-phase approach: broad structure first, deep sub-folders and renames second. AI classifies untitled/ambiguous documents by reading their content.

## Requirements

- [`gws` CLI](https://github.com/nicholasgasior/gws) — Google Workspace CLI: `brew install gws`
- `gcloud` CLI — GCP project setup: `brew install --cask google-cloud-sdk`
- Python 3.9+ with `pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2`
- `client_secret.json` from GCP (OAuth Desktop app); run `drive-auth.py` once for `~/.config/drive-personal/token.json`
- OpenAI or Anthropic API key (optional — only needed for untitled doc classification)
- Google account authenticated: `gws auth login`

**Estimated time:** 15–45 min depending on file count  
**Estimated cost:** ~$0.01–0.10 in AI API calls (gpt-4o-mini) for untitled doc analysis. gws/gcloud are free.

| Drive Size | Runtime | AI Cost |
|------------|---------|---------|
| ~100 files | ~8 min | <$0.01 |
| ~400 files | ~20 min | ~$0.02 |
| ~1000 files | ~45 min | ~$0.05 |

---

## Step 1 — Ask the User These Questions First

Do not skip this. Wrong assumptions = wrong structure.

```
1. What is this Drive for? (one product/company, personal life, mixed?)
   → Knowing the primary context sets the top-level folder names.

2. Which organization style do you prefer?
   a) PARA (Projects / Areas / Resources / Archive — Tiago Forte system)
   b) Flat project folders (one folder per project, kebab-case names)
   c) Mix: flat top-level + PARA-style sub-folders within each

3. Do you have any existing folders worth keeping as-is?
   → List them — don't auto-move things the user intentionally organized.

4. How should untitled/unnamed documents be handled?
   a) AI reads content and classifies + renames them
   b) Dump in _inbox for manual review
   c) Delete if empty

5. Are there sensitive or personal files mixed in?
   → Plan a personal/ or private/ folder.

6. Are there files for multiple contexts (e.g., work + personal, or multiple clients)?
   → Plan top-level folders per context (e.g., work/, clients/, personal/)
```

---

## Step 2 — Map the Drive Before Touching Anything

```python
import json, subprocess, time

def gws_list(parent_id, page_token=None):
    params = {
        "q": f"trashed = false and '{parent_id}' in parents",
        "pageSize": 200,
        "fields": "nextPageToken,files(id,name,mimeType,parents)"
    }
    if page_token:
        params["pageToken"] = page_token
    cmd = ["gws", "drive", "files", "list", "--params", json.dumps(params), "--format", "json"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    raw = "\n".join(l for l in r.stdout.splitlines() if not l.startswith("Using keyring")).strip()
    return json.loads(raw) if raw else {}

def get_all(parent_id):
    files, token = [], None
    while True:
        d = gws_list(parent_id, token)
        files.extend(d.get("files", []))
        token = d.get("nextPageToken")
        if not token:
            break
        time.sleep(0.1)
    return files

# Get everything at root
root_files = get_all("root")
print(f"Total root items: {len(root_files)}")
for f in root_files:
    print(f['mimeType'].replace('application/vnd.google-apps.',''), '|', f['name'])
```

**Find the root folder ID** (you'll need this for moves):
```python
# Root ID is in the 'parents' field of any root-level file
root_id = root_files[0]['parents'][0]  # e.g. "0APk6NGvIy9nGUk9PVA"
```

---

## Step 3 — Design Folder Structure (with User)

Based on the answers from Step 1, propose a structure before running anything. Example for a SaaS product Drive:

```
analytics/
  bigquery-exports/    raw results-YYYYMMDD CSVs
  user-metrics/        user counts, feature adoption
  website-metrics/     domains, custom domains, sections
  seo/                 backlinks, search performance
  spam-analysis/       spam check sheets

decks/
  product-reviews/     quarterly reviews, ET reviews
  growth-strategy/     growth plans, strategy decks
  demos/               demo day, pitch materials
  events-talks/        conference/event presentations
  competitive/         competitor analysis

engineering/
  specs/               feature specs, PRDs
  stripe/              payment integration docs

marketing/
  email-campaigns/     email templates, sequences
  content/             blog posts, case studies
  tiktok/              short video planning
  affiliates/          affiliate program docs
  growth-experiments/  experiment briefs

support/
  help-articles/       FAQ-style "How do I..." docs
  reports/             audits, diff reports

testing/               test plans, e2e screenshots/videos
users-data/
  grandfathered/       limit-exception user lists
  testimonials/        testimonial submissions

media/
  screenshots/         UI screenshots, playground captures
  recordings/          screen recordings, demo videos
  brand-assets/        logos, icons, SVGs

finance/               invoices, revenue forecasts, time sheets
strategy/              memos, roadmaps, competitive memos
events/                event runbooks, attendee guides, notes
personal/              personal docs (immigration, letters, goals)
_inbox/                unclassified, needs review
_archive/              old exports, notion dumps, duplicates
```

---

## Step 4 — Phase 1 Script (Top-Level Structure)

Key functions:

```python
def create_folder(name, parent_id):
    r = gws("files", "create",
            body={"name": name, "mimeType": "application/vnd.google-apps.folder", "parents": [parent_id]})
    return r.get("id", "")

def move_file(file_id, dest_id, src_id):
    gws("files", "update",
        params={"fileId": file_id, "addParents": dest_id, "removeParents": src_id, "fields": "id"})
    time.sleep(0.12)  # avoid rate limits

def gws(*args, body=None, params=None):
    cmd = ["gws", "drive"] + list(args) + ["--format", "json"]
    if params: cmd += ["--params", json.dumps(params)]
    if body: cmd += ["--json", json.dumps(body)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    raw = "\n".join(l for l in r.stdout.splitlines() if not l.startswith("Using keyring")).strip()
    return json.loads(raw) if raw else {}
```

**Name-based routing** — classify files by keyword matching on filename:

```python
RULES = [
    ("testing",        ["e2e", "test plan", "benchmark"]),
    ("support",        ["how can i", "how do i", "my payment", "what features"]),
    ("analytics",      ["analytics", "bigquery", "ga4", "results-", "user explorer"]),
    ("engineering",    ["firebase", "stripe", "spec", "prd", "robots.txt"]),
    ("marketing",      ["tiktok", "email", "newsletter", "appsumo", "affiliate"]),
    ("finance",        ["invoice", "revenue forecast", "time sheet", "pricing"]),
    ("media",          [".gif", ".png", ".svg", ".mov", ".mp4", "recording"]),
    ("_archive",       ["notion export", "copy of ", ".zip", "untitled"]),
]

def classify_by_name(name):
    lower = name.lower()
    for folder, keywords in RULES:
        if any(kw in lower for kw in keywords):
            return folder
    return None
```

---

## Step 5 — Classify Untitled Docs with AI

Use the Google API Python client to read file content — works reliably, auto-refreshes tokens, no `gcloud` dependency.

**One-time auth setup (`drive-auth.py`) — run once, opens browser:**
```python
import json
from google_auth_oauthlib.flow import InstalledAppFlow
flow = InstalledAppFlow.from_client_secrets_file("client_secret.json",
    scopes=["https://www.googleapis.com/auth/drive"])
creds = flow.run_local_server(port=0)
import os; os.makedirs(os.path.expanduser("~/.config/drive-personal"), exist_ok=True)
token_file = os.path.expanduser("~/.config/drive-personal/token.json")
tmp_file = token_file + ".tmp"
with open(tmp_file, "w") as f:
    f.write(creds.to_json())
os.replace(tmp_file, token_file)  # atomic — avoids torn reads from concurrent subagents
print("Saved token.json")
```

**Every subsequent use — auto-refreshes, no browser needed:**
```python
import json, io, os
import httplib2
import google_auth_httplib2
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

TOKEN_FILE = os.path.expanduser("~/.config/drive-personal/token.json")

def get_service(token_file=TOKEN_FILE):
    with open(token_file) as f: td = json.load(f)
    creds = Credentials.from_authorized_user_info(td, td["scopes"])
    if not creds.valid:
        creds.refresh(Request())
        tmp_file = token_file + ".tmp"
        with open(tmp_file, "w") as f: f.write(creds.to_json())
        os.replace(tmp_file, token_file)  # atomic — avoids torn reads from concurrent subagents
    authed_http = google_auth_httplib2.AuthorizedHttp(creds, http=httplib2.Http(timeout=30))
    return build("drive", "v3", http=authed_http, cache_discovery=False)

EXPORT_MIME = {"application/vnd.google-apps.document": "text/plain",
               "application/vnd.google-apps.spreadsheet": "text/csv",
               "application/vnd.google-apps.presentation": "text/plain"}

def read_file_content(svc, file_id, mime, max_chars=2000):
    """Read Google Doc/Sheet/Slide content as plain text. Returns None on read failure (distinct from a genuinely empty file)."""
    export_mime = EXPORT_MIME.get(mime)
    if not export_mime: return ""
    try:
        buf = io.BytesIO()
        dl = MediaIoBaseDownload(buf, svc.files().export_media(fileId=file_id, mimeType=export_mime))
        done = False
        while not done: _, done = dl.next_chunk()
        return buf.getvalue().decode("utf-8", errors="ignore").strip()[:max_chars]
    except Exception:
        return None
```

**token.json lives at:** `~/.config/drive-personal/token.json` — safe for subagents to reuse, auto-refreshes without browser.

**Classify with AI:**
```python
def classify_with_openai(svc, file_id, name, mime, valid_folders, api_key):
    import urllib.request
    content = read_file_content(svc, file_id, mime)
    if not content:
        return "_inbox", name  # empty doc → inbox

    prompt = f"""Classify this Google Drive document and suggest a short descriptive name.
Current name: "{name}"
Content: {content[:2000]}
Valid folders: {', '.join(valid_folders)}
Reply JSON: {{"folder": "<folder>", "name": "<descriptive name max 60 chars>"}}"""

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 80, "temperature": 0,
        "response_format": {"type": "json_object"},
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions", data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(json.loads(resp.read())["choices"][0]["message"]["content"])
    folder = result.get("folder", "_inbox")
    return (folder if folder in valid_folders else "_inbox"), result.get("name", name)
```

---

## Step 6 — Verify Empty Files Before Deleting

Never delete without checking content first. Use `read_file_content` from Step 5:

```python
def is_empty(svc, file_id, mime):
    exportable = {"application/vnd.google-apps.document",
                  "application/vnd.google-apps.spreadsheet",
                  "application/vnd.google-apps.presentation"}
    if mime not in exportable:
        return False  # can't verify — skip
    content = read_file_content(svc, file_id, mime)
    if content is None:
        return False  # read failed — unverifiable, don't trash
    return content == ""

def trash_file(file_id):
    gws("files", "update",
        params={"fileId": file_id, "fields": "id"},
        body={"trashed": True})
```

---

## Phase 2 — Deep Sub-Folders and Renames

After Phase 1 settles, go deeper:

1. **analytics/** → `bigquery-exports/`, `user-metrics/`, `website-metrics/`, `seo/`, `spam-analysis/`
2. **decks/** → pull presentations out of `product/` and `strategy/`, sort into sub-folders
3. **engineering/** → `specs/` and `stripe/`
4. **marketing/** → `email-campaigns/`, `content/`, `tiktok/`, `affiliates/`, `growth-experiments/`
5. **support/** → `help-articles/` ("How do I…" FAQ docs), `reports/`
6. **users-data/** → `grandfathered/`, `testimonials/`
7. **media/** → `screenshots/`, `recordings/`, `brand-assets/`

**Rename patterns to fix:**
- Typos: `Grandfatehred` → `Grandfathered`, `Testimoniasl` → `Testimonials`
- URLs as filenames: `https://...` → descriptive title
- Timestamps only: `results-20241123-220704` → leave as-is inside `bigquery-exports/`
- `# Markdown headings as filenames` → strip the `#`
- `(1) (1)` duplicate suffixes → remove

```python
def rename(file_id, new_name):
    gws("files", "update",
        params={"fileId": file_id, "fields": "id"},
        body={"name": new_name})
    time.sleep(0.12)

def move_rename(file_id, dest_id, src_id, new_name):
    gws("files", "update",
        params={"fileId": file_id, "addParents": dest_id,
                "removeParents": src_id, "fields": "id"},
        body={"name": new_name})
    time.sleep(0.12)
```

---

## Mirror the User's Local Folder Structure

**Ask the user:** "What does your local Documents folder look like?" Then mirror it.

Example: if local is `~/Documents/<your-name>/` with `legal/`, `finances/`, `photos/`, `notes/`, `health/` — use the same names in Drive. If local has flat project folders (`~/Documents/<project-a>/`, `~/Documents/<project-b>/`), create a `projects/` hub in Drive.

**Work/product Drive (e.g. SaaS company):**
`analytics/`, `decks/`, `engineering/`, `events/`, `finance/`, `marketing/`, `media/`, `outreach-leads/`, `product/`, `strategy/`, `support/`, `testing/`, `users-data/`, `personal/`, `_inbox/`, `_archive/`

**Personal Drive (matching local `<your-name>/` structure):**
```
projects/        <project-a>/, startups/, ai-projects/, creative/
career/          resume/, reference-letters/, job-descriptions/, cover-letters/, certificates/
legal/           canada-pr/, family-docs/, work-permit/   ← not "immigration/"
education/       university/, languages/                  ← merge these
finances/        budgets/, bank-statements/               ← not "finance/"
media/           photos/, videos/, streaming/, screenshots/
personal/        notes/, family/, health/, hobbies/, driving/
fitness/         <workout-logs>/, martial-arts/
_archive/        laptop-backups/, misc-archive/, old-projects/
_inbox/
```

Key naming conventions that match local:
- `legal/` not `immigration/`
- `finances/` not `finance/`
- `resume/` not `resumes/` (singular like local)
- `videos/` not `recordings/`
- `education/` merges university + languages

---

## Content-Aware Verification (Critical)

**Never trust filenames alone.** Always read file content to verify placement. Use `read_file_content` from Step 5 — it uses the Python client directly, no token expiry issues:

```python
svc = get_service()  # auto-refreshes token.json as needed

def verify_placement(svc, file_id, name, mime, expected_folder):
    content = read_file_content(svc, file_id, mime, max_chars=1500)
    return content  # pass to AI or manual review

# Example usage
for f in files_in_folder:
    content = read_file_content(svc, f["id"], f["mimeType"])
    # inspect content before moving or deleting
```

**Common content-vs-filename mismatches found in the wild:**
- Files named "Resume" that are actually cover letters → move to `cover-letters/`
- Files named "Marketing" in grants/ that are sponsorship proposals → keep in partnerships/
- Cold email SMTP config lists (`Instantly Bulk 1/2`) in community/ → belong in partnerships/
- Files named "Financials" in startups/ that belong to one project → move under that project's `financials/`
- A "Copy of ..." template in a project folder, not specific to it → trash

**gws token expiry:** The file-based keyring token expires during long sessions. When agents hit `403 insufficientPermissions`, have the user re-run:
```bash
export GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file
gws auth logout && gws auth login
```
Save fresh credentials immediately after: `cp ~/.config/gws/credentials.enc ~/.config/gws/credentials_personal.enc`

---

## Multi-Account gws Setup (Work + Personal)

gws does NOT share gcloud's account config — it has its own isolated credentials. Use separate config directories:

```bash
~/.config/gws-work/      # <work-account>      — client_secret.json + credentials.enc + .encryption_key
~/.config/gws-personal/  # <personal-account>  — same files, different content
```

Switch with symlink:
```bash
function work()     { rm -f ~/.config/gws && ln -s ~/.config/gws-work ~/.config/gws; ... }
function personal() { rm -f ~/.config/gws && ln -s ~/.config/gws-personal ~/.config/gws; ... }
```

Always set: `export GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file` (uses `.encryption_key` file, not OS keyring, so credentials are portable across shell sessions).

Personal GCP project requirements: billing enabled, OAuth consent screen with your email as test user.

---

## Parallel Subagent Organization (for large Drives)

For 1,000+ file Drives, dispatch parallel agents per folder domain:

```
Agent 1 → career/, legal/, education/     (independent domains)
Agent 2 → projects/<project-a>/, projects/startups/
Agent 3 → personal/, media/, finances/, fitness/
Agent 4 → _archive/, _inbox/
```

Each agent: lists folder, exports file content, verifies placement, fixes naming, reports changes. Run all in parallel — they work on different folders and don't interfere.

**Loop pattern:** After each parallel pass, spawn a fresh audit agent to list the root and all sub-folders one level deep. Flag any remaining issues. Loop until the audit agent finds 0 flags.

---

## Personal vs Work Drive Structure

---

## Trash Safely — Check File Size First

Before trashing any "empty" file, verify with size check:

```python
# 0 bytes = definitely empty; 1024 bytes = minimal wrapper (also empty for Docs/Sheets)
# -1 = non-exportable type (maps, shortcuts, forms) — don't trash blindly
# >2000 bytes = has real content — classify with OpenAI before deciding

size = int(f.get("size", -1))
if size in (0, 1024) and "untitled" in name.lower() and mime != "map":
    trash(file_id)  # safe to delete
elif size > 2000 and "untitled" in name.lower():
    classify_with_openai(svc, file_id, name, mime, valid_folders, api_key)  # analyze first
```

Include `size` in your `fields` param: `"fields": "nextPageToken,files(id,name,mimeType,size)"`

---

## Rename Patterns

| Pattern | Action |
|---------|--------|
| `Feb 2025 <Program> 5x5 Advanced \| <Site>.com` | → `Feb 2025 Workout Log` |
| `results-20241123-220704` | Leave as-is inside `bigquery-exports/` sub-folder |
| `https://blog.example.com/slug-2026-05-05` | → `Blog Performance May 2026` |
| `Copy of Resume - <Name> (Nov 2025).docx` | → `Resume - <Name> Nov 2025 v2.docx` |
| `# Firebase environment configuration` | → `Firebase Environment Configuration` (strip `#`) |
| `Grandfatehred over invite edits limit` | → `Grandfathered over Invite Edits Limit` (fix typos) |
| `ecommerce-itinerary (1) (1).pdf` | → `E-Commerce Event Itinerary.pdf` (strip duplicates) |
| `WM0h3519 - <tracker-name> (2).json` | → `<tracker-name>.json` |

---

## Gotchas and Learnings

| Problem | Fix |
|---------|-----|
| `gws files list` fails | Prefix with `gws drive files list` (service must be specified) |
| gws output has `Using keyring` prefix | Strip it: `"\n".join(l for l in stdout.splitlines() if not l.startswith("Using keyring"))` |
| File move fails silently | Check both `addParents` AND `removeParents` — both required |
| Root folder ID needed for moves | Read it from `parents[0]` of any root-level file |
| Pagination | Always handle `nextPageToken` — root can have 400+ items |
| Rate limits | Sleep 0.12s between API calls; 0.5s after OpenAI calls |
| Untitled docs with content | Check size first — 1024 bytes = empty; >2000 bytes = classify |
| Presentations scattered across folders | Collect all `application/vnd.google-apps.presentation` into `decks/` |
| Duplicate filenames | Drive allows them — handle with "v2" suffix on rename |
| `gws drive files update` params | `fileId` goes in `--params`, metadata changes go in `--json` body |
| Google Maps/shortcuts/forms | Not exportable via Drive API — route by name or move to `personal/` |
| Duplicate folders (e.g. 3x "Notability") | Query all items, not just `folders` dict — check for dupes by name |
| Personal Drive has 400+ items at root | Pre-map everything; personal Drives accumulate more junk than work ones |

---

## Cost and Time Summary

**One-time setup:** ~10 min (install gws, gcloud, authenticate)  
**Phase 1 script:** ~5–20 min runtime depending on Drive size  
**Phase 2 script:** ~5–15 min runtime  
**Manual review of `_inbox`:** 5–15 min (you decide, not automated)

**API costs (OpenAI gpt-4o-mini):**  
~$0.0004 per untitled doc classified. A Drive with 50 untitled docs costs ~$0.02.

**No cost for:** gws, gcloud, Drive API (within free quotas).  
Drive API free quota: 1 billion requests/day — this will never be hit.
