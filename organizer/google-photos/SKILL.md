---
name: google-photos
description: "Use when the user wants to organize Google Photos — albums, dedupe, tagging, deleting blurry/duplicate shots, building a clean library structure that mirrors their Drive / iCloud taxonomy. The Library API was locked down in March 2025 (third-party apps can only access content they uploaded), so this skill primarily uses Google Takeout exports plus filesystem organization, with optional Apple Photos / browser-automation fallbacks. Triggers: 'organize google photos', 'dedupe my photos', 'clean up photo library', 'sort my photos by year/event'."
---

# Google Photos Organizer

Organize a Google Photos library into a clean, dedupe'd, hierarchically-structured archive. **Three access paths**, picked based on what the user actually wants to do:

| Path | When to use | Coverage | Effort |
|---|---|---|---|
| **A — Google Takeout** (recommended) | Full library reorganization, archival, dedupe across years | Everything in the library | High one-time, then easy |
| **B — Apple Photos local DB** (if iCloud Photos is on) | Real-time access without an export, ongoing maintenance | Whatever's synced to the Mac | Low |
| **C — Browser automation** (Playwright) | Bulk operations the API can't do (album rename, sharing) | Limited; fragile | Medium |
| **D — Photos Library API** | Apps that re-upload their own content only | App-created content only | N/A for personal organization |

> ⚠️ **Library API limitation.** As of **March 31, 2025**, the Google Photos Library API restricts third-party apps to only the photos and videos *they uploaded*. The pre-2025 `photoslibrary.readonly` scope is deprecated. The current scopes (`photoslibrary.readonly.appcreateddata`, `photoslibrary.appendonly`) cannot read a user's existing library. Don't reach for the API expecting to organize an existing photo library — it's not a permission problem, it's a policy change.

This skill defaults to **Path A (Takeout)** because it's the only path that gives complete, owner-approved access to the full library.

## Requirements

- Python 3.9+, with `pillow` (`pip install pillow`) for EXIF/duplicate analysis
- For Path A: `~/Downloads` with at least 1.5× the library size free (Takeout zips are big)
- For Path B: macOS with iCloud Photos enabled and synced; Photos.app at least opened once
- For Path C: `playwright` + a logged-in Chrome/Edge with Google Photos web (`agent-browser` skill is the canonical wrapper here)

---

## Step 1 — Ask the User

```
1. What's the goal?
   a) one-time deep clean (full library reorganized into folders/albums)
   b) ongoing maintenance (dedupe new uploads, tag recent photos)
   c) just dedupe (find and remove duplicates without restructuring)
   d) just back up to disk (export everything, no reorganization)

2. Where's the source of truth?
   a) Google Photos cloud (use Takeout)
   b) Apple Photos local library (work against the SQLite db)
   c) both — reconcile and pick one going forward

3. Taxonomy:
   a) by year/month (chronological — Photos' default)
   b) by event/place (semantic — needs LLM or geo-clustering)
   c) by person (face-cluster-based, requires Google's face groups via Takeout)
   d) hybrid (year/event/person nested)
   e) match the unified taxonomy from the knowledge-graph skill

4. Dedupe aggressiveness:
   a) exact-byte duplicates only (safe, ~5-15% reduction typical)
   b) perceptual duplicates (similar but not identical — same scene, slightly different exposure)
   c) burst-shot collapse (keep the sharpest of a 3-10 frame burst)
```

---

## Step 2 — Path A: Google Takeout

This is the path that actually works for organizing existing libraries.

### Step 2a — Trigger an export

The user must do this themselves at https://takeout.google.com — there's no API for it. Recommend:
- **Service**: Google Photos only (deselect everything else)
- **Format**: ZIP, 50GB chunks (or 10GB for slower internet)
- **Frequency**: Export once
- **Delivery**: Email link (lets the user pick "Add to Drive" / "Download")

Wait time: hours to days depending on library size. Google emails when ready.

### Step 2b — Organize the unzipped export

Each photo arrives with a sidecar `.json` containing the original metadata (capture time, geo, description, album memberships, face tags, edits applied). The skill works against these JSON sidecars — it does not re-derive metadata from EXIF, which is often stripped or rewritten by Google's pipeline.

```python
import json, os, hashlib, datetime
from pathlib import Path
from collections import defaultdict

EXPORT_ROOT = Path("/path/to/Takeout/Google Photos")  # user provides

def metadata_for(image_path: Path) -> dict | None:
    """Each photo X.jpg has a sibling X.jpg.json (or X.jpg.suppl.json on newer exports)."""
    for suffix in (".json", ".suppl.json", ".supplemental-metadata.json"):
        sidecar = image_path.with_suffix(image_path.suffix + suffix)
        if sidecar.exists():
            try:
                return json.loads(sidecar.read_text())
            except Exception:
                pass
    return None

def capture_time(meta: dict) -> datetime.datetime:
    ts = meta.get("photoTakenTime", {}).get("timestamp")
    if ts:
        return datetime.datetime.fromtimestamp(int(ts))
    ts = meta.get("creationTime", {}).get("timestamp")
    return datetime.datetime.fromtimestamp(int(ts)) if ts else None
```

### Step 2c — Dedupe pass

Three layers, applied in order:

1. **Exact-byte duplicates**: SHA-256 the file contents. Trivial, fast, totally safe to auto-collapse.
2. **Perceptual duplicates**: dHash / pHash via `imagehash` library — catches images that are visually identical but differ in encoding (re-saves, format conversions).
3. **Burst-shot collapse**: same `photoTakenTime` ± 2 seconds → group, pick sharpest via Laplacian variance (`cv2.Laplacian(img, cv2.CV_64F).var()`).

```python
import hashlib
def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        while chunk := f.read(1 << 20):
            h.update(chunk)
    return h.hexdigest()

# Cluster by sha256 first
by_hash = defaultdict(list)
for img in EXPORT_ROOT.rglob("*.jpg"):
    by_hash[sha256(img)].append(img)

duplicates = {h: paths for h, paths in by_hash.items() if len(paths) > 1}
```

### Step 2d — Reorganize into target hierarchy

Default chronological scheme (if no other answer from Step 1):

```
~/Pictures/photos-clean/
├── 2024/
│   ├── 2024-01-january/
│   ├── 2024-02-february/
│   └── ...
├── 2023/
└── albums/                  # Google Photos album memberships preserved as folders
    ├── trip-tokyo-2024-spring/
    └── family-reunion-2023/
```

Album memberships are read from the export's `albums/` subdirectory — each album has its own folder of (probably duplicated) image files. The skill should symlink (not copy) album memberships into `albums/<name>/` to avoid doubling disk usage.

### Step 2e — Optional re-upload

If the user wants the cleaned library back in Google Photos, the upload uses the `photoslibrary.appendonly` scope (which is still allowed post-March 2025). Note that re-uploaded photos will be considered "uploaded by this app" — meaning future API access via this OAuth client *can* read them, but only them. This is a one-way door: the user's pre-existing photos remain inaccessible to the API even after the cleanup.

---

## Step 3 — Path B: Apple Photos Local Library

If the user has iCloud Photos turned on and a Mac, the local Photos.app library is a much faster path for ongoing organization. It's a `.photoslibrary` package containing a SQLite database (`database/Photos.sqlite`) with the full schema — capture time, geo, faces, albums, edits, everything.

### Read-only inventory

```python
import sqlite3
from pathlib import Path

LIB = Path("~/Pictures/Photos Library.photoslibrary").expanduser()
DB  = LIB / "database/Photos.sqlite"

# Quit Photos.app first — SQLite locks held while the app is running.
con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
cur = con.cursor()
cur.execute("""
    SELECT ZUUID, ZFILENAME, ZDATECREATED, ZWIDTH, ZHEIGHT
    FROM ZASSET
    WHERE ZTRASHEDSTATE = 0
    ORDER BY ZDATECREATED DESC
    LIMIT 10
""")
for row in cur.fetchall():
    print(row)
```

### Mutations via osxphotos

For writes (delete, album-add, keyword-tagging), use the third-party [`osxphotos`](https://rhettbull.github.io/osxphotos/) library (`pip install osxphotos`). Direct SQLite writes break Photos.app's internal indexes. `osxphotos` wraps both the SQLite read path and AppleScript-driven mutations.

### Album sync caveat

Changes made via osxphotos / AppleScript are local-Mac-only at first; iCloud Photos sync propagates them to Google Photos / iOS within minutes. If the user is on a slow connection, give the sync time before declaring the run "done".

---

## Step 4 — Path C: Browser Automation Fallback

For things neither the API nor osxphotos can do — bulk album renames, share-link management, advanced search-and-delete — drive the Google Photos web UI via Playwright. The `agent-browser` skill is the canonical wrapper for this kind of work.

This path is **slow** (5-10 actions/min sustainable rate) and **fragile** (UI breaks any time Google ships a redesign). Use only when the other paths don't reach.

---

## Path D: Photos Library API (limited)

For completeness — the API does still exist, it's just gated to app-created content. Useful only when:
- The user wants to upload from this skill and re-read what the skill uploaded
- A pre-approved [Google Photos partner app](https://developers.google.com/photos/partner-program) is involved

```python
# After enabling Photos Library API + auth with photoslibrary.appendonly
# This works only for content this OAuth client uploaded.
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

creds = Credentials.from_authorized_user_file("~/.config/google-photos/token.json",
    scopes=["https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata",
            "https://www.googleapis.com/auth/photoslibrary.appendonly"])

# discoveryServiceUrl required — the static discovery doc is no longer published
svc = build("photoslibrary", "v1", credentials=creds, static_discovery=False,
    discoveryServiceUrl="https://photoslibrary.googleapis.com/$discovery/rest?version=v1")

# This will return only what THIS app has uploaded — typically empty.
items = svc.mediaItems().list().execute()
```

If `mediaItems().list()` returns empty for an active library, that's the policy at work, not a bug.

---

## Defaults and Guardrails

- **Never delete from the source library on the first pass.** Path A reorganizes a *copy*. Path B uses Trash (30-day Photos.app trash window). Original library stays intact until the user explicitly approves cleanup.
- **Tag every artifact with the email.** Plans, journals, dedupe reports — all per-account.
- **Journal before mutating.** Same pattern as gmail-organizer: append the intent record before each delete/move/album-edit.
- **Disk-space pre-check.** Path A needs ≥1.5× library size free. Refuse to start if not.
- **Don't run while Photos.app is open.** Path B's SQLite reads will hit lock contention; close Photos.app first.

---

## Common Failures

| Symptom | Path | Cause | Fix |
|---|---|---|---|
| `mediaItems().list()` returns empty | D | March 2025 policy — API can only see app-uploaded content | Use Takeout (Path A) instead |
| `database is locked` on Photos.sqlite | B | Photos.app is running | Close Photos.app and retry |
| Takeout export taking >24h | A | Library is huge (>500GB), or Google is slow | Wait; check email periodically |
| Re-uploaded photos missing geo | A | Takeout strips embedded GPS in some formats; sidecar JSON has it though | Re-attach geo from the sidecar before re-upload |
| `photoslibrary.readonly` scope rejected | A/D | Scope was deprecated March 2025 | Use `photoslibrary.readonly.appcreateddata` (limited) or Takeout |

---

## Future: a `gop` CLI?

There's room for a lightweight `gop` CLI (the photos-equivalent of `gog`) that wraps:
- Takeout-export-aware parsing (sidecar JSON, album folders)
- osxphotos for the Apple Photos path
- The post-2025 Photos Library API

If the user wants that as a separate public package on GitHub (like [openclaw/gogcli](https://github.com/openclaw/gogcli)), it's a worthwhile project — but the embedded scripts in this SKILL.md cover the common cases without that overhead. Defer the standalone CLI until repeated usage justifies it.
