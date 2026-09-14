---
name: pre-public-repo-audit
description: "Audit a repo before you flip it public, and know why a clean secret-scanner run is not the answer. Covers the five sweeps that catch what gitleaks structurally cannot (bare high-entropy keys with no vendor rule, absolute laptop paths, private-repo names, PII, build artifacts), the order of operations (scan, fix, rotate, then flip), and why making a repo private again rotates nothing. Use when taking a repo public, auditing an org's existing public repos, or reviewing a PR that changes repo visibility."
---

# pre-public-repo-audit

Going public is the one repo operation with no undo. A push can be reverted and a
branch can be deleted; a repo that was public for an hour has been cloned, indexed,
and scraped, and you will never know by whom.

This skill is the scan set you run first. For the paperwork side of going public —
LICENSE, CONTRIBUTING, CODEOWNERS, CI, branch protection — use
[`open-source-repo-prep`](../open-source-repo-prep/SKILL.md). The two do not overlap.

## Read this first: a clean secret scanner means less than it looks

`gitleaks detect` returning `no leaks found` is a floor, not a verdict. Scanners match
**known vendor patterns** and **generic high-entropy shapes**. A secret that fits neither
walks straight past.

Worked example, 2026-09-14. A public repo carried this in a documentation comment:

```
# Also available via: cat ~/.secrets/civitai.env  # CIVITAI_API_KEY=fe825695fc3ac7f292aa50f57c95c139
```

A live key, verified still authenticating. `gitleaks` passed the repo clean, twice:

- it ships no Civitai rule, and
- a bare 32-character lowercase hex string is the shape of a git SHA, an MD5 sum, a
  lockfile hash and a test fixture, so no generic rule can flag it without drowning
  you in noise.

`grep -E '\b[0-9a-f]{32}\b'` found it in under a second.

The detail that matters most: the same file redacted the same key correctly in five
other places as `fe8256…`. The author had the right convention and broke it once. **Assume
the leak is the line that broke a convention, not the repo that never had one.** Grep
beats judgement here, because a human reviewer reads the five correct lines and stops.

### The same scanner is also noisy, and that is why §2 gets skipped

Run `gitleaks` over this very repo and it reports six findings, all from its
`curl-auth-user` rule, all on lines that look like this:

```bash
curl https://api.stripe.com/v1/crypto/deposit_addresses \
  -u "$STRIPE_SECRET_KEY:" -H "Stripe-Version: 2026-05-27.preview" -d network=base
```

That is an environment-variable reference. It is the *correct* way to write the line, and
there is no secret in it. The rule flags any `-u` argument it cannot prove is safe.

So the scanner fails in both directions at once: silent on a real key it has no rule for,
loud on six lines that are fine. The second failure is what causes the first. An operator
who has dismissed six false positives has learned that the scan is noise, and stops reading
it — which is exactly the state of mind in which a real finding gets waved through.

**Triage every hit, and record why each one is safe.** A finding you dismissed without
writing down the reason will be dismissed again next quarter, faster, by someone with less
context.

## The five sweeps

Run all five. Each one catches a class the others cannot.

### 1. Secret scanner over full history, not the working tree

```sh
gitleaks detect --source . --redact --no-banner
```

History, not `HEAD`. A key deleted in a later commit is still in the pack file and still
served by `git clone`. Note the commit count in the output — if it says `1 commits
scanned`, you are on a shallow clone and have scanned nothing.

### 2. Key-shaped strings the scanner has no rule for

This is the sweep that catches what §1 misses.

```sh
git grep -nIE '\b[0-9a-f]{32}\b|\b[0-9a-f]{40}\b|sk-[A-Za-z0-9]{20,}|hf_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}' -- . \
  | grep -vE 'lock|integrity|sha512|sha256|\.tsbuildinfo|node_modules'
```

Expect false positives and read every one. That is the job. Add the vendor prefixes your
stack actually uses — the point of this sweep is the vendors your scanner does not know.

**Check whether a hit is live before you assume it is stale.** One `curl` against the
vendor's cheapest authenticated endpoint answers it. A key you assume is dead and is not
is the whole failure.

### 3. Absolute paths from a development machine

```sh
git grep -nIE '/Users/[a-z0-9._-]+|/home/[a-z0-9._-]+|C:\\\\Users\\\\' -- .
git log -p --all | grep -oE '/Users/[a-zA-Z0-9._-]+/[^ ]*' | sort -u
```

Two reasons this matters, and the second is the one people miss:

- it publishes an account name and a directory layout, and
- **it often names a private repo.** `/Users/x/code/internal-thing` tells the reader that
  `internal-thing` exists, who owns it, and where it sits — from a public repo.

`$HOME`-relative paths in scripts (`"$HOME/code/..."`) are functional defaults, not leaks.
Do not "fix" them; you will break the script and gain nothing.

### 4. PII, in files and in commit metadata

```sh
git grep -nIE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' -- . | grep -v <your package scopes>
git log --all --format='%ae%n%ce' | sort -u
```

Commit author emails become public and **cannot be changed without rewriting history**.
Decide before the flip, not after. If the author already publishes under that address on
other public repos, it is not a new exposure — say so and move on rather than rewriting
history for nothing.

### 5. Artifacts and state that should never have been tracked

```sh
git ls-files | grep -E '\.(tsbuildinfo|log)$|^\.wrangler/|^\.env|dist/|coverage/'
```

Build caches embed absolute paths. `.env` files embed everything. Both also make every
future diff noisy, which is how the next leak gets waved through review.

## The order of operations

The sequence is load-bearing. Doing it in the wrong order wastes the work.

1. **Scan** — all five sweeps, on a full clone.
2. **Fix** — remove the content. If a secret is in history and the repo has never been
   public, rewriting history is on the table. Once it has been public, rewriting history
   is theatre: clones and caches already exist.
3. **Rotate** — every credential found, without exception.
4. **Flip** — only now.

### Making it private again does not rotate anything

If you find a leak in an already-public repo, flipping it private is a reasonable first
move: it stops new readers. It is not a fix, and it is not containment. The key is still
live, still valid, and still in whatever cache already took a copy.

Check the blast radius so you can size the response honestly, and check it **before** the
flip, because these counters are harder to read afterwards:

```sh
gh repo view <owner>/<repo> --json forkCount,stargazerCount,visibility
```

Zero forks and zero stars is good news about *likelihood*. It is not evidence that nothing
was taken. Rotate anyway.

## Auditing a whole org

To sweep every public repo rather than one:

```sh
gh repo list <owner> --visibility public --limit 200 \
  --json name,isArchived,isFork \
  --jq '.[] | select(.isArchived==false and .isFork==false) | .name'
```

Then clone each shallowly and run the sweeps locally. **Do not rely on `gh search code`
for this.** It is excellent for locating a known string fast, but its index is partial and
lags, and `--owner` silently spans private repos you can read — so a hit list from it
mixes repos with different exposure and a clean result from it proves nothing. Use it to
find candidates; use a local clone to decide.

## The gate

Do not flip until every line is true:

- [ ] `gitleaks` clean over **full** history, with a plausible commit count.
- [ ] Key-shaped-string sweep run, every hit read, any live key rotated.
- [ ] No absolute machine paths in tracked files or history.
- [ ] Commit-author emails are ones the owner is willing to publish.
- [ ] No tracked build artifacts, `.env` files, or local state directories.
- [ ] A root README and LICENSE exist — the repo is a product page the moment it is public.

## Failure mode

**Confusing "the scanner is quiet" with "there is nothing there."** Absence of a finding
is only evidence if the instrument can see a positive case. Before you trust a clean run,
confirm the scanner would have caught a key of the shape your stack actually issues —
plant one in a scratch commit and check that it fires. If it does not, §2 is the only
thing standing between you and the flip.
