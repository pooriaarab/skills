---
name: live-site-security-sweep
description: "Run a security sweep across every repository that serves a live public domain, then fix, review, merge, and release each finding. Covers the claude-security plugin method (inventory, threat model, per-lens research, a three-lens panel that defaults to false positive), how to run the plugin headless, a cheaper copy of the method on remote Boxes with non-Claude agents, a pump that moves each fix unit from scan to merged PR, Cloudflare zone hardening (minimum TLS, HTTPS redirect, and the SaaS custom-hostname exception), a live header baseline, and the traps from the first fleet run: expired Box logins, Cursor attribution trailers, failure counts that trip the PR checker, and zsh word splitting in merge loops. Use when asked to harden live sites, run security checks across a fleet of repos, or set up a periodic security re-scan."
---

# Live-site security sweep

Scan every repository that serves a public domain. Verify each finding. Fix
each one in its own PR. Review each PR with a second agent. Merge, then
promote main to release. Run it again every week.

## 1. Build the target list

List the repositories and the hosts they serve. Put one row per repo in a TSV:
`owner/repo  visibility  host1,host2`. Get the hosts from the Cloudflare API
(zones and Worker custom domains), not from memory:

```sh
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?per_page=50" | jq -r '.result[].name'
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/domains" \
  | jq -r '.result[] | "\(.service) \(.hostname)"'
```

Order the list by attack surface: apps with logins, payments, uploads and LLM
calls first; static directory sites last.

## 2. Harden the edge first

Edge settings are fast, safe and cover every site at once. Back up each zone's
settings before you change them.

| Setting | Value | Note |
|---|---|---|
| `min_tls_version` | `1.2` | Safe on every zone. |
| `always_use_https` | `on` | Skip zones that serve SaaS custom hostnames. Customer HTTP domain validation can break. |

```sh
curl -s -X PATCH -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" --data '{"value":"1.2"}' \
  "https://api.cloudflare.com/client/v4/zones/$ZONE/settings/min_tls_version"
```

Verify the effect, not the API response:

```sh
curl -sI https://example.com/ | head -1            # 200
curl -sI http://example.com/ | grep -i location    # 301 to https
curl -s --tlsv1.1 --tls-max 1.1 https://example.com/ # handshake refused
```

## 3. Take a live baseline

For each host, record the security headers and probe for exposed files:

```sh
curl -sSI "https://$H/" | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy'
for p in .env .git/config .dev.vars wrangler.toml package.json; do
  printf '%s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://$H/$p")"
done
```

A missing header is a finding only when you can name the code that should set
it (`_headers`, middleware, `next.config` headers). Keep the baseline TSV; the
weekly re-run diffs against it.

## 4. The scan method

The claude-security plugin (`anthropics/claude-plugins-official`,
`plugins/claude-security`) defines the method. Copy it even when another agent
runs the scan.

1. **Inventory.** Each top-level directory is a component or is skipped with a
   reason (vendored, generated, fixtures, docs).
2. **Threat model** per component: entry points, sinks, trust assumptions.
3. **Research** each component through five lenses: injection, access control,
   crypto and secrets, business logic and abuse, configuration.
4. **Follow the data.** A finding is a full path from an attacker-controlled
   source to a dangerous sink with no effective check.
5. **Verify** with a three-lens panel: REACHABILITY, IMPACT, DEFENSES. Each
   vote defaults to FALSE_POSITIVE. A finding survives on two of three votes.
   Refute only with a mitigation you located and read.
6. **Group** surviving findings into fix units. Each unit fits one PR under 500
   changed lines.

Use a separate agent, with a fresh context, for step 5. A scanner that verifies
its own work keeps too much.

### Run the plugin headless

The plugin works in `claude -p` with an isolated config directory and an OAuth
token:

```sh
export CLAUDE_CONFIG_DIR=$HOME/.sec-fleet/cc      # isolated, plugin installed here
export CLAUDE_CODE_OAUTH_TOKEN=...                # from your secrets store
claude plugin marketplace add anthropics/claude-plugins-official
claude plugin install claude-security@claude-plugins-official
cd <repo worktree>
CLAUDE_SECURITY_SCAN_TIP=off nohup claude -p --model opus \
  --dangerously-skip-permissions --output-format stream-json --verbose \
  "/claude-security scan the whole codebase at medium effort. I accept the time
and token cost; do not ask any questions, the session is unattended. Proceed
with best-guess defaults." > scan.jsonl 2> scan.err &
```

Without the cost and no-questions sentences, the plugin stops to ask about
effort and cost, and a headless run ends there. Run it in a dedicated worktree:
the plugin writes its output directory into the repo root.

A full scan of a large monorepo runs for hours and can hit the session limit
before verification starts. Results land in `CLAUDE-SECURITY-<date>/` only at
the end. When Claude quota is short, run the method on other agents instead.

## 5. Run it as a fleet

One driver script on the laptop. Remote Boxes do the work. The driver never
waits on a Box; it polls every three minutes.

```
repo phases:  new -> scanning -> scanned -> verifying -> fixing -> done
unit status:  pending -> fixing -> pr -> reviewing -> ready | changes -> refixing
```

| Job | Agent | Mode | Output |
|---|---|---|---|
| scan | strongest available (Codex worked) | read-only | `findings.json` |
| verify | a different session | read-only | `verified.json` |
| fix | Cursor or Grok | read-write | issue, branch, PR, `result.json` |
| review | Codex at the exact head SHA | read-only | PR comment `LLM-REVIEW: APPROVED <sha>` |
| refix | the fixer | read-write | new head |

Rules that kept the run clean:

- Each job writes `result.json`. Judge the job on that file and the diff, never
  on the exit code.
- Cap fix tries (4) and review rounds (3). After that the unit is `needs-human`.
- When every unit of a repo is terminal, rescan with a different agent and pass
  in the known unit titles. A second agent finds what the first one missed.
- Only the human-facing loop merges. A fixer or reviewer never merges.

### The fix brief

- Open the issue first. On a PUBLIC repo the issue and PR name the area to
  harden and the expected behavior only. No exploit steps, no payloads.
- Post one sticky claim comment.
- Write the regression test first. Watch it go red, then fix.
- Smallest root-cause fix. No fallback, no second code path.
- Run the repo's local gate before the push.
- In `## How I verified`, write "went red before the fix". A quoted failure
  count (`10 failed`) fails the PR checker.

## 6. Merge and release

For each `ready` unit:

1. Run the merge gate on the approved SHA: checks at that SHA, newest review at
   that SHA, no open Critical or Major, no unanswered inline comment.
2. Merge with `gh pr merge <n> --squash --admin --match-head-commit <sha>`.
3. When a check fails, send the unit back as `changes` with the check name and
   the log line. Do not merge over a red check you have not read.
4. When the repo's queue drains, promote main to release with a PR whose head is
   `main`. Diff release-only commits first; never reset release blind.

## 7. Schedule the re-run

Run the whole sweep weekly. The re-run diffs the live baseline, rescans each
repo from its current main, and skips units whose titles it already merged.

Reset the fleet for a re-run in this order:

1. Refresh the targets from Worker custom domains and from each zone's DNS
   records (`zones/$ZONE/dns_records`), so a host served without a Worker still
   joins. Most new rows are `www` aliases. Resolve each new host and request
   its home page before you add it. A DNS error is not proof of absence: retry
   it. A `www` host that resolves counts even when its apex does not.
2. Copy the state file to `state-<date>.json`.
3. Raise each repo's round number. New unit IDs carry the round prefix, so the
   same round would overwrite last week's open units.
4. Let open units advance in every phase. If units move only while the repo is
   in the fixing phase, a rescan stalls every open PR until the scan ends.
5. Expire jobs whose Box no longer exists, and return each unit to its queue:
   `fixing` to `pending`, `refixing` to `changes`, `reviewing` to `pr`. A lost
   scan job returns its repo to `new`, and a lost verify job to `scanned`.
6. Run `box extend <id> --hours 48` on each Box you keep. A Box from last week
   can expire mid-job.

## Traps

- **Box agent logins expire.** A Box environment can ship an agent login with an
  empty refresh token. It works for hours, then every job fails with
  `Invalid 'refresh_token': empty string`. Copy a full login file to a separate
  home on each Box (`~/.codex-sec/auth.json`) and point the job at it with
  `CODEX_HOME`. Probe each agent with a one-word prompt before a wave, and again
  when a run of jobs ends with no result.
- **Probe with real work.** An agent can pass a one-word probe and still fail
  every real job (a model name the account cannot reach). Drop it from the
  rotation; do not retry it forever.
- **Cursor adds attribution.** `cursor-agent` appends
  `Co-authored-by: Cursor <cursoragent@cursor.com>` to commits and
  `Made with [Cursor](https://cursor.com)` to PR bodies. Both fail a
  no-agent-trailer PR standard. Tell the fixer to strip them before it pushes.
- **`box new --json` prints several JSON lines.** Parse each line and take one
  id, or the id variable holds five copies.
- **zsh does not split words.** `for x in "a 1" "b 2"; do set -- $x` leaves `$2`
  empty in zsh. Use a function with explicit arguments, or an array.
- **A failed review must not stall a unit.** Route a review with no verdict back
  to `pr` so the next pass reviews it again.
- **Never print a Box environment.** An env dump through `box exec` leaks every
  injected token into the transcript.
- **Do not stop CI Boxes.** Stop only the Boxes the sweep created. A busy runner
  Box can report `idle`.
- **A fixer can revert an unrelated file.** A fixer on a stale base set a
  package version back to match its branch. After the merge, `npm ci` failed
  on main for the whole repo. The reviewer must flag any file the finding does not explain.
  Read `git diff --stat` against the unit's files before you approve.
- **Retire old IDs when you harden an ID.** A fix that switches session IDs
  to random server-issued values can still honor old guessable IDs in existing
  cookies. Accept only IDs the server issued under the new scheme. Give any
  other cookie a fresh ID that has no access to data under the old ID. A format
  check is the minimum, not the whole fix.
- **gitleaks on a self-hosted runner can fail after a clean scan.** The log
  says `no leaks found`, then the SARIF upload fails with `rootDirectory ... is
  not a parent directory`, because the runner works under a moved home. Do not
  read it as a leak. A re-run passes only on a runner with the normal home.
  Keep `gitleaks-action` jobs on GitHub-hosted runners, as
  `self-hosted-runner-fleet` says.
- **One `Assisted-by` line per contributor.** The checker rejects a comma
  list. A second agent that pushes to the PR adds its own line.
- **Cloudflare allows 50 API tokens per user.** Token creation fails at the
  cap. First check whether a fleet token already holds `Zone Read` and
  `Zone Settings Write` on every target zone.
- **Keep advisory checks per repo.** When one repo's Worker Preview fails on
  main for an infrastructure reason, such as missing Access apps, mark that job
  advisory for that repo only, and open an issue to repair it. This applies only
  to PRs with no user-visible surface. A PR a user can see still needs a working
  Preview and the operator walk. A global list hides real failures elsewhere.
- **Escalate a stalled unit once.** When a unit reaches the review-round cap
  and goes to `needs-human`, give it once to the strongest fixer with a fresh
  cap. Call a human only when that round also ends at the cap.
