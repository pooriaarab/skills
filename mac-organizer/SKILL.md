---
name: mac-organizer
description: "Free disk space and organize files on macOS. Finds and removes dev caches (node_modules, .turbo, .next, Yarn, npm, bun), cleans git worktrees, reorganizes Desktop/Downloads/Documents into a clean project structure, and renames files descriptively using Apple Intelligence (100% local, no cloud)."
---

# Mac Organizer

Use when the user wants to free up disk space, clean up their Mac, reorganize files, or rename files semantically.

## Triggers

- "free up space", "my disk is full", "clean up my Mac"
- "organize my files / Desktop / Downloads / Documents"
- "rename my screenshots / invoices / photos"
- "remove node_modules / caches / git worktrees"

---

## Phase 1 — Disk Space Audit

Start by checking what's eating space:

```bash
df -h / | tail -1
du -sh ~/Library ~/Documents ~/Desktop ~/Downloads ~/.npm ~/.bun ~/.nvm 2>/dev/null | sort -rh
```

Then dig into the biggest buckets:

```bash
du -sh ~/Library/Caches/* 2>/dev/null | sort -rh | head -10
du -sh ~/Library/Application\ Support/Google ~/Library/Application\ Support/Claude 2>/dev/null
find ~/Documents -maxdepth 4 -name ".turbo" -type d | xargs du -sh 2>/dev/null | sort -rh | head -10
find ~/Documents -maxdepth 4 -name "node_modules" -type d | xargs du -sh 2>/dev/null | sort -rh | head -10
```

---

## Phase 2 — Safe Cache Deletions (always safe, fully regenerable)

```bash
# npm / yarn / bun / pnpm caches
rm -rf ~/.npm/_cacache ~/.npm/_npx
rm -rf ~/.bun/install/cache
rm -rf ~/Library/Caches/Yarn ~/Library/Caches/bun ~/Library/Caches/pnpm

# Browser/tool caches
rm -rf ~/.cache/puppeteer
rm -rf ~/Library/Caches/ms-playwright
rm -rf ~/Library/Caches/Google  # Google Maps, Chrome caches

# Build caches in repos (find all .turbo and .next dirs)
find ~/Documents -maxdepth 6 -name ".turbo" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null
find ~/Documents -maxdepth 6 -name ".next" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null

# Python venvs (reinstallable)
find ~/Documents -maxdepth 5 -name "venv" -o -name ".venv" -type d | xargs rm -rf 2>/dev/null

# Updater caches
rm -rf ~/Library/Caches/com.superset.desktop.ShipIt
rm -rf ~/Library/Caches/@supersetdesktop-updater

# Old NVM versions (keep latest of each major)
# ls ~/.nvm/versions/node  → rm -rf old ones like v18.19.0, v20.2.0
```

---

## Phase 3 — Git Worktree Cleanup

Worktrees accumulate from Claude Code and Superset — each contains a full checkout with node_modules.

**First strip caches from all worktrees** (fast, safe):
```bash
find ~/.superset/worktrees -maxdepth 5 -type d \( -name "node_modules" -o -name ".next" -o -name ".turbo" \) -exec rm -rf {} + 2>/dev/null
find ~/Documents -path "*/.claude/worktrees" -prune -o -maxdepth 6 -type d \( -name "node_modules" -o -name ".next" \) -print | xargs rm -rf 2>/dev/null
```

**Then remove merged worktrees** (check first):
```bash
# For each repo, check which worktrees are merged into origin/main
cd ~/Documents/your-repo
for wt in .claude/worktrees/*/; do
  tip=$(git -C "$wt" rev-parse HEAD 2>/dev/null)
  merged=$(git merge-base --is-ancestor "$tip" origin/main 2>/dev/null && echo MERGED || echo UNMERGED)
  size=$(du -sh "$wt" 2>/dev/null | cut -f1)
  echo "$merged $size $(basename $wt)"
done

# Remove merged ones
git worktree remove --force .claude/worktrees/branch-name
```

**Remove ALL worktrees from a repo** (user confirmed):
```bash
for wt in ~/Documents/repo/.claude/worktrees/*/; do
  git -C ~/Documents/repo worktree remove --force ".claude/worktrees/$(basename $wt)" 2>/dev/null \
    || rm -rf "$wt"
done
```

---

## Phase 4 — File Organization

### Recommended Documents structure

```
~/Documents/
├── {project}/          # one dir per project/brand (flat, no nesting)
│   ├── code/           # git repos → GitHub
│   ├── assets/         # logos, brand images → Google Drive
│   ├── docs/           # strategy, specs
│   ├── content/        # marketing, social media
│   └── research/       # competitor recordings, analysis
├── pooriaarab/         # personal "project" = you
│   ├── immigration/
│   │   ├── canada/
│   │   │   ├── express-entry/
│   │   │   ├── permanent-residence/
│   │   │   └── work-permit/
│   │   └── us/
│   ├── finances/
│   │   ├── invoices/   # all bills, receipts
│   │   └── receipt-photos/
│   ├── health/
│   ├── legal/
│   ├── photos/
│   ├── notes/          # Obsidian vault
│   └── scripts/        # utility Python/shell scripts
```

### Desktop cleanup pattern

Move files by category:
```bash
D=~/Desktop; DOC=~/Documents
mkdir -p "$D/Screenshots" "$D/Recordings" "$D/Documents/Invoices" "$D/Documents/Personal" "$D/Assets"

# Screenshots
mv "$D"/Screenshot\ 20*.png "$D/Screenshots/"
# Screen recordings  
mv "$D"/Screen\ Recording\ *.mov "$D/Recordings/"
# Invoices
mv "$D"/*Invoice*.pdf "$DOC/pooriaarab/finances/invoices/"
# Immigration docs
mv "$D"/IMM*.pdf "$DOC/pooriaarab/immigration/canada/express-entry/"
```

### Invoice renaming pattern

```bash
# Shaw internet bills
# ShawInvoice_09901794167_09Apr2025.pdf → shaw-internet-2025-04.pdf
for f in *Shaw*.pdf; do
  m=$(echo "$f" | grep -oiE '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)'); y=$(echo "$f" | grep -oE '\d{4}')
  mv "$f" "shaw-internet-${y}-${m}.pdf"
done
```

---

## Phase 5 — AI-Powered File Renaming (100% Local)

Uses **Apple Intelligence + Apple Vision OCR** — no data sent to cloud.

### Install

```bash
pip3 install apple-foundation-models apple-vision-utils pdfplumber --break-system-packages
```

### How it works

1. **Images/receipts**: Apple Vision OCR extracts text → Apple Intelligence generates slug
2. **PDFs**: pdfplumber extracts text → Apple Intelligence generates slug
3. All processing on-device via Neural Engine

### Key snippet

```python
import applefoundationmodels as fm
from apple_vision_utils.utils import image_to_text
import pdfplumber, os, re

session = fm.Session()

def name_image(fp, context):
    items = image_to_text(fp)
    text = ' '.join(x['text'] for x in items if x.get('confidence', 0) > 0.5)
    r = session.generate(
        f"Context: {context}\nContent: {text[:400]}\n"
        "3-5 word filename slug, hyphens only. Reply ONLY the slug."
    )
    raw = r.content.strip()
    # Reject Apple refusals / error messages
    if re.search(r"i'?m\s|sorry|apolog|cannot|as\s+an\s+llm|error.?code|"
                 r"context.?window|please\s+note|i\s+must|provide\s+a", raw, re.I):
        return None
    if len(raw.split()) > 8: return None
    slug = re.sub(r'[^a-z0-9-]', '-', raw.lower())
    return re.sub(r'-+', '-', slug).strip('-')[:70]
```

### Apple Intelligence quirks

- **Context window exceeded** (error code 14): retry with shorter text (400 → 200 → 100 chars)
- **Unsupported language** (error code 20): Persian/Arabic/CJK text not supported
- **Content policy refusal**: personal photos of people, legal docs — Apple refuses silently by responding with "I'm sorry..." — always sanitize with rejection regex
- **Fallback**: if AI can't name a file, use directory context → `beehouse-blog-image-01.jpg`

---

## Phase 6 — Docker Cleanup

```bash
# Check Docker disk usage
docker system df

# Prune unused images/containers/volumes
docker system prune -a --volumes

# Delete Docker VM disk image (macOS — requires sudo)
sudo rm -f ~/Library/Containers/com.docker.docker/Data/vms/0/data/Docker.raw
```

---

## Typical Results

On a 926 GB MacBook with disk full (2.9 GB free):
- npm/yarn/bun caches: **~22 GB**
- .turbo build caches (across monorepos): **~65 GB**
- Git worktree node_modules: **~150 GB**
- Old screen recordings: **~15 GB**
- Notion/Chrome app data: **~20 GB**
- **Total freed: 500–650 GB** in a typical session
