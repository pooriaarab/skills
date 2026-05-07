---
name: google-photos
description: "Use when the user wants to organize Google Photos — albums, dedupe, tagging, deleting blurry/duplicate shots, building a clean library structure that mirrors their Drive / iCloud taxonomy. Toggles between Google Takeout (full-library export to filesystem) and the Apple Photos local SQLite library (when iCloud Photos is on). Triggers: 'organize google photos', 'dedupe my photos', 'clean up photo library', 'sort my photos by year/event'."
---

# Google Photos Organizer

Organize a Google Photos library into a clean, dedupe'd, hierarchically-structured archive. The skill toggles between two paths — pick the one that matches the user's setup:

| Path | When to use | Coverage |
|---|---|---|
| **A — Google Takeout** | Cloud-only library, or user wants a one-time deep clean and a clean filesystem archive | Everything in the cloud library |
| **B — Apple Photos local DB** | iCloud Photos is on and synced to a Mac | Whatever's synced locally |

Yes, there is an API. **It is not useful for organizing an existing library.**

> ⚠️ **Why the Photos Library API isn't an option here.** The API exists (`photoslibrary.googleapis.com`) and works fine for *uploading*. But on **March 31, 2025** Google restricted read access to third-party apps so they can **only see photos and videos they themselves uploaded**. The pre-2025 broad scopes (`photoslibrary.readonly`, `photoslibrary`) are dead. The current scopes (`photoslibrary.readonly.appcreateddata`, `photoslibrary.appendonly`) cannot list a user's existing library. This is a policy change, not a bug or a missing scope — there is no flag to flip. For organizing an existing library, the API path returns nothing useful, so this skill skips it entirely.

The two real-world paths use the user's *own* data, not API-mediated access:
- **Takeout** is the user exporting their library via google.com/takeout — Google's own escape hatch.
- **Apple Photos** is the locally-synced copy on the user's Mac, accessible via SQLite + osxphotos.

## Requirements

- Python 3.9+, with `pillow` (`pip install pillow`) for EXIF/duplicate analysis
- For Path A: `~/Downloads` with at least 1.5× the library size free (Takeout zips are big)
- For Path B: macOS with iCloud Photos enabled and synced; Photos.app at least opened once. Optional: `osxphotos` (`pip install osxphotos`) for mutations

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
| `database is locked` on Photos.sqlite | B | Photos.app is running | Close Photos.app and retry |
| Takeout export taking >24h | A | Library is huge (>500GB), or Google is slow | Wait; check email periodically |
| Takeout zip missing recent photos | A | Photos uploaded after the export was triggered | Re-trigger Takeout when ready for a final pass |
| Re-uploaded photos missing geo | A | Takeout strips embedded GPS in some formats; sidecar JSON has it though | Re-attach geo from the sidecar before re-upload |
| Tempted to call `mediaItems().list()` | — | The API can only see content this OAuth client uploaded (March 2025 policy) | Skip the API entirely; use Takeout |

---

## Future: a `gop` CLI?

There's room for a lightweight `gop` CLI (the photos-equivalent of `gog`) that wraps:
- Takeout-export-aware parsing (sidecar JSON, album folders)
- osxphotos for the Apple Photos path
- The post-2025 Photos Library API

If the user wants that as a separate public package on GitHub (like [openclaw/gogcli](https://github.com/openclaw/gogcli)), it's a worthwhile project — but the embedded scripts in this SKILL.md cover the common cases without that overhead. Defer the standalone CLI until repeated usage justifies it.
