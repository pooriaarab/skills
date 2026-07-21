---
name: open-source-repo-prep
description: "Prepare a repo for real open-source use: LICENSE, CODE_OF_CONDUCT, CONTRIBUTING, CODEOWNERS, a minimal CI workflow, and GitHub branch protection that actually restricts who can merge -- with the real gotchas (branch-protection JSON schema via gh api, force-push semantics, and the honest limits of what a solo maintainer's setup can enforce)."
---

# open-source-repo-prep

Empirical, from taking a real solo-maintainer repo public end to end.

## 1. The baseline reality check, before adding anything

On a solo repo with no other collaborators, GitHub's default permissions already prevent "random people merging PRs" — write access is required to merge, and only the owner has it. Confirm this first (`gh api repos/<owner>/<repo>/collaborators --jq '.[].login'`) so you know what you're actually adding protection *for*: not preventing unauthorized merges (already true), but making the intent explicit and future-proofing for when a second collaborator is added.

## 2. The files

- **LICENSE** — MIT is the default for a solo dev's public tooling unless there's a reason otherwise. Match the exact text your other public repos already use for consistency.
- **CODE_OF_CONDUCT.md** — Contributor Covenant v1.4 is a standard, freely-reusable template (not another project's IP) — adapt only the contact/enforcement line to point at the actual maintainer.
- **CONTRIBUTING.md** — keep it to what's true for *this* project: local setup commands, PR expectations (one focused change, tests updated, run lint/typecheck locally before opening), and who merges. Don't copy a template project's CI/release/signing details (e.g. a Go project's GoReleaser/keychain signing steps) into a project that doesn't have them.
- **.github/CODEOWNERS** — `* @<owner>` requests review from the owner on every PR. On its own this is a review *request*, not a merge *gate* — see §3.
- **.github/workflows/ci.yml** — the minimum useful CI is install deps, typecheck, test. Don't wire release/deploy automation the project doesn't have yet.

## 2a. README for public consumption

Beyond the standard sections (features, install, quick start, license), for a project explicitly building on / inspired by prior art: credit it plainly, and don't overstate independence. If you found a very similar existing tool mid-build (see `launch-video-generation`'s "prior art" habit), name it and be honest about when you learned of it — readers can tell the difference between genuine credit and a legal-CYA line, and it costs nothing to be direct.

Run the finished README through a humanizer/plain-English pass before publishing — AI-tells (em-dash overuse, inline-header bullet lists, "seamless"/"robust" vocabulary) are exactly the kind of thing a technical audience notices in a project's front door.

## 3. Branch protection — the actual mechanics

**CODEOWNERS alone does not gate merges.** It only becomes load-bearing once a branch protection rule adds "Require review from Code Owners" *and* restricts who can push/merge. Say this explicitly in CONTRIBUTING.md rather than implying CODEOWNERS is sufficient on its own.

**Setting protection via `gh api` needs a JSON payload, not `-f`/`-F` flags** — nested objects and real booleans don't survive the flag-based CLI form (`-f required_status_checks[strict]=true` sends the string `"true"`, which the schema rejects). Write the body to a file and pass `--input`:

```json
{
  "required_status_checks": { "strict": true, "contexts": ["test"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```
```bash
gh api --method PUT repos/<owner>/<repo>/branches/main/protection \
  -H "Accept: application/vnd.github+json" --input protection.json
```

For a true solo maintainer, set `required_approving_review_count: 0` — requiring 1+ approval locks the owner out of ever merging their own PRs without a second account.

**`allow_force_pushes: false` blocks admins too, not just non-admin collaborators** — `enforce_admins: false` (letting admins bypass required reviews/status checks) does NOT mean admins can bypass the separate `allow_force_pushes` restriction. A repo owner attempting `git push --force` against a branch with `allow_force_pushes: false` gets a real `GH006: Cannot force-push to this branch` rejection from GitHub itself, independent of any local safety hooks. If you (the owner) need to force-push once (e.g. after a history rewrite, see §4), temporarily PUT the protection with `allow_force_pushes: true`, push, then PUT it back to `false` — don't leave it permanently open.

## 4. Scrubbing something from already-public history

If a commit message, file, or reference needs to be removed from history that's already been pushed (not just fixed going forward):

1. `git-filter-repo --force --message-callback '<python>' --blob-callback '<python>'` rewrites messages/content across all commits in one pass. It removes the `origin` remote as a safety measure — re-add it after.
2. This changes every downstream commit's SHA, including on branches you haven't touched. Any other branch/PR based on the old history will show as "diverged" afterward — expect to recreate rather than fast-forward them.
3. The actual force-push is where local safety hooks (if any) and GitHub branch protection (§3) both explicitly gate — you'll likely need to temporarily relax branch protection, and a local git-safety hook may require the human to run the push themselves rather than an agent doing it, by design.
4. Verify with a full grep sweep afterward — across working-tree files, `git log --all --grep`, and every open/closed/merged PR's stored description (GitHub keeps a PR's body text separately from git history; rewriting commits doesn't touch it — edit via `gh api --method PATCH repos/.../pulls/<n> -f body="..."` if a PR description also needs scrubbing).
