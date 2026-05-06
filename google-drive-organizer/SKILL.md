---
name: google-drive-organizer
description: "Use when the user wants to organize, restructure, or clean up their Google Drive — including creating folder hierarchies, moving misplaced files, renaming files descriptively, classifying untitled documents with AI, and deleting empty files. Triggers: 'organize my Drive', 'clean up Google Drive', 'restructure Drive folders', 'my Drive is a mess'."
---

# Google Drive Organizer

Reorganize a chaotic Google Drive into a clean, kebab-case folder hierarchy using the `gws` CLI and a Python automation script. Two-phase approach: broad structure first, deep sub-folders and renames second. AI classifies untitled/ambiguous documents by reading their content.

## Requirements

- [`gws` CLI](https://github.com/nicholasgasior/gws) — Google Workspace CLI: `brew install gws`
- `gcloud` CLI — for Drive export access tokens: `brew install --cask google-cloud-sdk`
- Python 3.9+
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
   → Plan top-level folders per context (e.g., <work-project>/, <employer>/, personal/)
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

Export Google Doc content as plain text, then classify:

```python
import urllib.request

def get_access_token():
    return subprocess.run(["gcloud", "auth", "print-access-token"],
                          capture_output=True, text=True).stdout.strip()

def export_text(file_id, token):
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export?mimeType=text/plain"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.read().decode("utf-8", errors="ignore").strip()[:3000]
    except Exception:
        return ""

def classify_with_openai(file_id, name, valid_folders, token, api_key):
    content = export_text(file_id, token)
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

Never delete without checking content first:

```python
def is_empty(file_id, token, mime):
    exportable = {"application/vnd.google-apps.document",
                  "application/vnd.google-apps.spreadsheet",
                  "application/vnd.google-apps.presentation"}
    if mime not in exportable:
        return False  # can't verify — skip
    return export_text(file_id, token) == ""

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

## Personal vs Work Drive Structure

Work/product Drives and personal Drives need completely different folder schemes.

**Work/product Drive (e.g. SaaS company):**
`analytics/`, `decks/`, `engineering/`, `events/`, `finance/`, `marketing/`, `media/`, `outreach-leads/`, `product/`, `strategy/`, `support/`, `testing/`, `users-data/`, `personal/`, `<employer>/` (org-specific), `_inbox/`, `_archive/`

**Personal Drive:**
`career/` (resumes/, reference-letters/, job-descriptions/, <employer>/), `immigration/` (canada-pr/, work-permit/, family/, dubai/, us-visa/), `university/` (courses/, textbooks/), `<project-a>/` or other-startup/ (events/, grants/, partnerships/, community/), `fitness/` (workout-logs/), `finance/`, `media/` (recordings/, photos/, brand-assets/), `languages/`, `ai-projects/` (notebooks/, image-gen/), `creative/` (content-planning/, brand-assets/, project-name/), `personal/`, `_archive/`, `_inbox/`

Ask the user which type of Drive it is before proposing structure.

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
    classify_with_openai(file_id, name, mime)  # analyze first
```

Include `size` in your `fields` param: `"fields": "nextPageToken,files(id,name,mimeType,size)"`

---

## Rename Patterns

| Pattern | Action |
|---------|--------|
| `Feb 2025 Pooria 5x5 Advanced (aka <workout-template>) \| <source>.com` | → `Feb 2025 Workout Log` |
| `results-20241123-220704` | Leave as-is inside `bigquery-exports/` sub-folder |
| `https://blog.example.com/slug-2026-05-05` | → `Blog Performance May 2026` |
| `Copy of Resume - Jane Doe (Nov 2025).docx` | → `Resume - Jane Doe Nov 2025 v2.docx` |
| `# Firebase environment configuration` | → `Firebase Environment Configuration` (strip `#`) |
| `Grandfatehred over invite edits limit` | → `Grandfathered over Invite Edits Limit` (fix typos) |
| `ecommerce-itinerary (1) (1).pdf` | → `E-Commerce Event Itinerary.pdf` (strip duplicates) |
| `WM0h3519 - <project>-tracker (2).json` | → `<project>-tracker.json` |

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
