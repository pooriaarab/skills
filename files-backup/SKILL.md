---
name: files-backup
description: "Use when the user wants to back up text-based files from local, iCloud, or Google Drive to a private GitHub repo. Triggers: 'back up my files', 'sync files to GitHub', 'private file backup', 'document backup'."
---

# Files Backup

Sets up `~/Documents/pooriaarab/files/` as a git repo tracking text-based documents (no binaries), backed up nightly to `pooriaarab/files` (private GitHub).

## What Gets Backed Up

- `.md`, `.txt`, `.csv`, `.json` files only — no binaries
- iCloud PARA folders → `files/_exports/` (via rsync)
- Personal documents organized by category

## Structure

```
~/Documents/pooriaarab/files/
├── finance/        ← bank statements, taxes, invoices
├── legal/          ← contracts, permits, visas
├── health/         ← medical docs
├── work/
│   ├── mozilla/    ← Mozilla work docs
│   └── solo/       ← solo product docs
├── education/      ← university, courses
└── _exports/       ← auto-synced from iCloud (cron, text files only)
```

## Rule

**files/ = received/stored from external sources.**
Content created/curated by Pooria lives in `pooriaarab/brain`, not here.

## Setup

Run `docs/plans/2026-05-07-personal-os.md` Tasks 3 + 6 in the personal-os plan.

## Manual Sync

```bash
~/Documents/pooriaarab/code/personal-os/scripts/icloud-sync.sh
~/Documents/pooriaarab/code/personal-os/scripts/brain-backup.sh
```

## Automated (via cron)

Daily at 11pm — runs automatically after Task 8 setup.
