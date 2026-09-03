---
name: org-github
description: "Use when the user wants to organize GitHub — auditing personal repos (active/stale/archive), pruning excessive stars, leaving inactive organizations, fixing repo descriptions/READMEs, applying consistent topics. Triggers: 'organize my GitHub', 'archive old repos', 'prune GitHub stars'."
---

# GitHub Organizer

Organize personal GitHub presence via `gh` CLI.

## Requirements

- `gh` CLI installed and authenticated (`gh auth login`).
- Account-level scope; for organizations, requires org membership.

## Step 1 — Ask the User First

```
1. Scope — your personal repos only, or include orgs you belong to?
2. Repo classification — active (commit in last 90 days) / dormant (90d–1y) / stale (>1y) — what to do with each?
3. Stars cleanup — prune stars older than N months? Group remaining stars into lists?
4. Org membership — leave inactive orgs?
5. Repo metadata — fix missing descriptions, add topics, update READMEs?
6. Visibility audit — flag accidentally-public private-intent repos, or vice versa?
```

## Steps (TBD)

1. **Inventory** — `gh repo list` (your repos), `gh api user/starred`, `gh api user/orgs`.
2. **Classify** — repos by activity, stars by age, orgs by your last contribution.
3. **Plan** — proposed archives, unstars, org-leaves, description fills, topic additions.
4. **Approve** — batch by category.
5. **Apply** — `gh repo archive`, `gh api -X DELETE user/starred/<repo>`, `gh api -X DELETE user/memberships/orgs/<org>`, etc.
6. **Verify** — final repo count, star count, org list.

## Surface-specific notes

- **Archiving a repo is reversible** but it stops accepting issues/PRs. Safer than deleting.
- **Deleting requires `delete_repo` scope** — not in default `gh auth login` scopes; user must re-auth with `gh auth refresh -s delete_repo`.
- Stars are public unless you've toggled them private — pruning is visible to followers.
- Topics are limited to 20 per repo.
- For private repos: respect any forks-of-private constraint (you can't archive a fork's parent).

## See also

- [`../_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../_lib/patterns.md`](../org-life-organizer/_lib/patterns.md)
- [`../mac/SKILL.md`](../organizer/mac/SKILL.md) — local repo cleanup (worktrees, node_modules) lives there
