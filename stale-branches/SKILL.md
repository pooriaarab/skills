---
name: stale-branches
description: List and clean up stale git branches (merged or inactive 30+ days)
user-invocable: true
---

# Stale Branch Cleanup

Find and clean up branches that are merged or haven't been touched in 30+ days.

## Steps

### 1. Fetch latest from remote

```bash
git fetch --prune origin
```

### 2. Find merged branches

```bash
# Branches already merged into main (safe to delete)
git branch --merged main | grep -v "main\|master\|\*"
```

### 3. Find stale branches (no commits in 30+ days)

```bash
# Show branches with their last commit date
git for-each-ref --sort=committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)' | while read date branch; do
    days_ago=$(( ($(date +%s) - $(date -d "$date" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$date" +%s 2>/dev/null)) / 86400 ))
    if [ "$days_ago" -gt 30 ] && [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
        echo "  $branch ($date, ${days_ago} days ago)"
    fi
done
```

### 4. Report

Present the findings:

```
## Branch Cleanup Report

### Merged branches (safe to delete):
- branch-name-1
- branch-name-2

### Stale branches (30+ days inactive):
- branch-name-3 (last commit: 2025-12-01, 73 days ago)
- branch-name-4 (last commit: 2025-11-15, 89 days ago)

### Protected (never delete):
- main
- master
- production
```

### 5. Cleanup (with user confirmation)

Ask the user which branches to delete before proceeding:

```bash
# Delete local merged branches
git branch -d <branch-name>

# Delete remote branches (only after user confirms)
git push origin --delete <branch-name>
```

## Safety Rules

- NEVER delete `main`, `master`, or `production` branches
- ALWAYS ask before deleting remote branches
- Use `-d` (not `-D`) for local deletion — it refuses if not fully merged
- Show the branch's last commit message before deleting
