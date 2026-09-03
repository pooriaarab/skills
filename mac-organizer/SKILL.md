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

# Reject Apple refusals, prompt echoes, and UNFILLED placeholders (yyyy-mm etc.)
REJECT = re.compile(r"i'?m\s|sorry|apolog|cannot|unable|as\s+an|error|context|"
                    r"please|i\s+must|here'?s|reply|filename", re.I)
BANNED = {'text','what','invoice','receipt','document','filename','slug','vendor',
          'merchant','company','date','unknown','none','yyyy','mm','dd'}

def slugify(raw):
    raw = raw.strip().strip('.:"\' ')
    if not raw or REJECT.search(raw): return None
    s = re.sub(r'-+', '-', re.sub(r'[^a-z0-9-]', '-', raw.lower())).strip('-')
    parts = s.split('-')
    if not s or len(parts) > 6: return None
    if any(p in BANNED for p in parts): return None            # kills 'yyyy-mm', echoes
    if not [p for p in parts if p not in BANNED and not p.isdigit()]: return None
    return s[:70]

def name_file(text, context):
    # CRITICAL: a FRESH Session() per file. Reusing one session bleeds context —
    # every file drifts toward the previous answer (all become the same vendor/date).
    for n in (1600, 600, 250):                                 # retry shorter on ctx-window
        try:
            s = fm.Session()
            r = s.generate(f"Context: {context}\nContent: {text[:n]}\n"
                           "3-5 word filename slug, hyphens only. Reply ONLY the slug.")
            sl = slugify(r.content)
            if sl: return sl
        except Exception:
            continue
    return None

def img_text(fp):
    return ' '.join(x['text'] for x in image_to_text(fp) if x.get('confidence', 0) > 0.5)
```

### Structured docs (invoices/receipts): regex BEFORE the LLM

Stripe-style invoices carry the answer in plain text (`Date of issue April 10, 2025`,
`Invoice <Vendor> Invoice number …`). The LLM reads these **unreliably** — it hallucinates
dates and repeats the last vendor. For structured docs, extract deterministically and skip
the model entirely (100% accurate dates):

```python
MON = {m: f"{i:02d}" for i, m in enumerate(
    "january february march april may june july august september october november december".split(), 1)}

def ym(t):  # -> 'YYYY-MM'
    m = (re.search(r'Date of issue\s+([A-Za-z]+)\s+\d{1,2},?\s+(\d{4})', t)
         or re.search(r'\b([A-Za-z]+)\s+\d{1,2},\s+(\d{4})', t))
    return f"{m.group(2)}-{MON[m.group(1).lower()]}" if m and m.group(1).lower() in MON else None

def vendor(t):
    m = (re.search(r'^Invoice\s+(.+?)\s+Invoice number', t)
         or re.search(r'\b([A-Z][A-Za-z0-9&.\- ]{2,40}?(?:GmbH|Inc|LLC|Ltd|Corp))\b', t))
    return re.sub(r'[^a-z0-9]+', '-', m.group(1).lower()).strip('-')[:30] if m else None

# name = f"{vendor}-{ym}"  else  f"invoice-{ym}-{stripe_id}"  else keep original
```

Always **DRY-run first** (print `old -> new`), then rename. Never delete originals; on
collision append `-1`, `-2`.

### Apple Intelligence quirks

- **Context bleed (the big one)**: a single reused `fm.Session()` makes every file drift to the *previous* file's answer — a folder of distinct invoices all collapse to one vendor+date. Use a **fresh `Session()` per file** (see `name_file` above). For structured docs, prefer regex and skip the model.
- **Unfilled placeholders**: the model sometimes returns the literal template (`companyname-yyyy-mm`) — reject slugs containing `yyyy`/`mm` or the generic tokens in `BANNED`.
- **Context window exceeded** (error code 14): retry with shorter text (1600 → 600 → 250 chars)
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
