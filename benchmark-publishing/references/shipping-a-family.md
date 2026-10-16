# Shipping a family of benchmarks

Lessons from shipping 22 `benchmark-*` npm packages, their data sets, their
directory pages and their citation files in one week (2026-10). Each item cost
a real round trip.

## Review before you publish

An independent reviewer found real defects in almost every package at 0.1.0.
Run the loop, not one pass:

1. Builder writes the package. Reviewer who did not write it tries to break it.
2. Reviewer reports `MERGE` or `FIX` with measured numbers and `file:line`.
3. Builder fixes. A new reviewer checks again against the old list.
4. Stop at `MERGE`, or when only nits remain. Never publish on `FIX`.

Defect classes that recur (check each one on every package):

- A policy that sees only the prompt cannot reach full score (an answer lived
  only in a hidden fixture).
- A constant, blind or always-refuse strategy scores too high.
- An honest answer scores 0 (code fences, wrappers, case, units, formats).
- The hidden split equals the public one, or ships inside the npm tarball.
- No way to run a split (`--tasks`), or the SDK serves a cached task list.
- Report breakdowns lost on the CLI, SDK, API or MCP path.
- A report endpoint accepts a forged score instead of re-grading the rows.
- A grader that runs model-written code in-process (interpret a closed
  grammar; never `eval`).
- Docs that claim a check that does not exist, or numbers typed by hand.
- Prompt numbers looser than the grader's real threshold.

Do not accept numbers measured with the builder's own tuned policy. Ask for a
range from a policy the reviewer wrote.

## Say what you did not run

If no real model ran, say so in the abstract, the README and the limits.
Validation with scripted good and bad policies proves the grader separates
them. It proves nothing about any model.

## Release mechanics

- Pushes to `main` and `release` are blocked. Create the `release` branch and
  advance it through the git refs API, or ship `main` with a PR whose tree is
  `main` (`ship-sync`). Never force-push.
- `publish.yml` runs `ci:local`, then publishes only if the version is new.
  After `+ pkg@version`, `npm view` can return 404 for up to about 45
  minutes. Wait. Do not read an early 404 as a failed publish.
- Merge a reviewed stack by its tip. A `-s ours` merge deletes parallel work
  when the tip tree lacks files that `main` has. Refuse the merge in that case.
- Two PRs that edit one CSV conflict. Merge one, rebase the other.
  Check the file's line endings (CRLF) before and after a scripted edit.
- A first publish needs the registry token as a repo secret.
- Deprecate an unsafe old version: `npm deprecate pkg@x.y.z "<reason>"`. A
  plain local `npm` has no login. Use a temporary user config with the token.

## Site and data

- A static directory takes its rows from a CSV. Import to staging first, walk
  staging, then import to production. Quote the URLs and the status codes.
- A cached page can lag an import by about ten minutes. Poll the page.
- Screenshots for a PR go to GitHub user-attachments. Never commit them.

## Citation

1. Add `CITATION.cff` to every repo (one small PR each). Validate with
   `cffconvert --validate`. Name the check `python3 -m cffconvert ...` in the
   PR body: the PR checker only recognizes a fixed list of command names.
2. Enable each repo in Zenodo, then publish a GitHub release per package. Zenodo
   mints a version DOI and a concept DOI. Read both through the Zenodo API.
3. Add the concept DOI to `CITATION.cff` and a BibTeX "Cite" block to the
   README (one PR per repo).
4. After the arXiv id exists, add it as `preferred-citation`, and link the
   paper from the dataset cards.

## Running many workers

- Workers on remote Boxes reboot every 30 minutes or so. Files on disk survive.
  Use a runner that relaunches a fresh session until a `DONE` line appears.
- Judge a worker by its diff, not its exit code.
- Read CI with one poll every few minutes. A flood of `gh` calls drains the
  shared API budget.
