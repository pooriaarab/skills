---
name: changelog
description: Auto-generate a changelog from git commits since the last tag or specified ref
user-invocable: true
argument-hint: "[since-ref] (defaults to last tag)"
---

# Changelog Generator

Generate a grouped changelog from git history.

## Arguments

- `$ARGUMENTS` - Optional: git ref to start from (tag, commit, branch). Defaults to the most recent tag.

## Steps

### 1. Determine the starting point

```bash
# Use argument or find last tag
SINCE="${ARGUMENTS:-$(git describe --tags --abbrev=0 2>/dev/null || echo 'HEAD~50')}"
echo "Generating changelog since: $SINCE"
```

### 2. Gather commits

```bash
git log "$SINCE"..HEAD --oneline --no-merges
```

### 3. Classify commits

Read each commit message and classify into categories:

- **Features**: New functionality (keywords: add, implement, create, introduce, support)
- **Fixes**: Bug fixes (keywords: fix, resolve, correct, patch, repair)
- **Improvements**: Enhancements (keywords: improve, update, enhance, optimize, refactor)
- **Docs**: Documentation (keywords: doc, readme, comment)
- **Chores**: Maintenance (keywords: chore, ci, build, deps, config, cleanup)
- **Breaking**: Breaking changes (keywords: breaking, remove, deprecate, drop)

### 4. Generate changelog

Format as markdown:

```markdown
# Changelog

## [Unreleased] — YYYY-MM-DD

### Breaking Changes

- Description of breaking change (commit-hash)

### Features

- Description of new feature (commit-hash)

### Fixes

- Description of bug fix (commit-hash)

### Improvements

- Description of improvement (commit-hash)

### Documentation

- Description of doc change (commit-hash)

### Chores

- Description of maintenance task (commit-hash)

---

Generated from N commits since TAG
```

### 5. Output

- Print the changelog to the conversation
- Optionally write to `CHANGELOG.md` if user requests
- Can also be used as input for `gh release create`

## Notes

- Commit messages should be descriptive for best results
- If commits follow conventional format (feat:, fix:, etc.), classification is more accurate
- For releases: pipe output to `gh release create vX.Y.Z --notes-file -`
