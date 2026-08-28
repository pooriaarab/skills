---
name: cloudflare-agent-credentials
description: "Get and manage Cloudflare API credentials for an agent fleet without asking a human each time. Covers why wrangler and OAuth and the Cloudflare MCP can never mint an API token, the one permission that can (User > API Tokens > Edit), minting narrow per-purpose tokens whose permissions exceed the minter's own, the API names that end in Write not Edit, driving the dashboard token form through a browser agent, and the wrangler refresh-token rotation that bricks a login. Triggers: 'cloudflare api token', 'CLOUDFLARE_API_TOKEN', 'wrangler login', 'mint a token', 'Invalid API Token', 'unauthorized to access requested resource', 'cloudflare credentials for CI'."
---

# Cloudflare credentials for an agent fleet

## The rule

**Mint a narrow token per purpose. Never share one broad token, never ask a human
twice.** One master "minter" credential lives in exactly one file; everything else
is minted from it and scoped to a single job.

## What cannot mint a token — check this before you waste an hour

| | Can mint? | |
|---|---|---|
| `wrangler` | **No** | `wrangler auth create` makes a local auth *profile*, not an API token. There is no mint command. |
| A wrangler OAuth session | **No** | `POST /user/tokens` → `Unauthorized to access requested resource` |
| The Cloudflare MCP server | **No** | Authenticates with the same OAuth scopes, so it hits the same wall |
| An **account-owned** token (`cfat_`) | **No** | There is no API-Tokens permission in the account scope at all |
| A **user** token with `User → API Tokens → Edit` | **Yes** | The only thing that works |

Minting is user-scope only. That is a deliberate gate: it means an agent cannot mint
credentials for itself out of nothing, and a human has to create the first one.

## Creating the first (minter) token

Dashboard only — **https://dash.cloudflare.com/profile/api-tokens** (My Profile, *not*
Manage Account) → Create Token → Create Custom Token. One permission:

```
User → API Tokens → Edit
```

**Add nothing else.** A minted token may hold permissions the minter does not —
delegation is bounded by the *account owner's* permissions, not the minting token's.
Verified: a minter holding only API-Tokens-Edit successfully minted a Pages-Write
token. So a minimal minter is fully capable, and adding account permissions to it only
widens the blast radius.

Be honest about what this credential is: **API Tokens Edit is a master key.** Anything
that can create tokens can create one with every permission you hold. Store it in one
0600 file, never in a repo, an `.env.local`, or a CI secret.

### Driving the dashboard form with a browser agent

Doable, but the form fights back. Three gotchas, in order:

1. The permission row's group selector **defaults to Account**. Switch it to **User**
   first, or the permission search returns account permissions and the wrong match.
2. The levels dropdown is `react-select`. It will **not** open from an accessibility-tree
   `@ref` click, a coordinate click, or a synthetic `MouseEvent` — React ignores all
   three. What works:
   ```
   eval  document.querySelector('#react-select-N-input').focus()
   press ArrowDown        # opens, highlights "Read"
   press ArrowDown        # "Edit"
   press Enter
   ```
3. **The secret is shown once.** Capture it to a 0600 file in the same step that reveals
   it. Do not navigate, do not print it into a transcript.

Verify the session identity before creating anything — a real-profile browser clone
carries whatever account that profile was signed into, which may not be the one you want.

## Minting from then on

```bash
POST /user/tokens
{"name":"<repo>-<purpose>",
 "policies":[{"effect":"allow",
   "resources":{"com.cloudflare.api.account.<ACCOUNT_ID>":"*"},
   "permission_groups":[{"id":"..."},{"id":"..."}]}]}
```

Permission group ids come from `GET /user/tokens/permission_groups?per_page=400` —
about 395 of them.

**The names end in `Write`, not `Edit`.** The dashboard UI says Edit; the API says
`Pages Write`, `D1 Write`, `Workers Scripts Write`, `Workers KV Storage Write`,
`Workers R2 Storage Write`, `Queues Write`. Resolve names against that endpoint rather
than typing them from memory, and fail loudly on an unknown name **before** minting —
otherwise you create a token missing a permission and find out at deploy time.

Derive each token's permissions from what the repo's deploy workflow and wrangler
config actually contain — a `d1_databases` binding means `D1 Write`, a `queues` block
means `Queues Write`, `wrangler pages deploy` means `Pages Write`. Include
`Account Settings Read` everywhere. Do not add a permission "just in case"; that is how
you end up back at one broad token wearing thirteen names.

## Verify before you install, always

A minted token that does not verify, installed into CI, converts a credential problem
into a red deploy you will debug as if it were a code problem.

```bash
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

Then prove it is actually scoped: confirm it *can* do the one thing it is for, and
*cannot* do something adjacent. A token that lists D1 databases when it was minted for
Pages is not scoped — you have shipped the broad token again under a new name.

Note `/user/tokens/verify` only works for API tokens. For an OAuth session it returns
`Invalid API Token` even when the session is live; check `GET /accounts` instead. That
false negative is easy to misread as "this credential is dead".

## Finding an existing token on a machine

Search `.env*` and `.dev.vars*` with **no depth limit** — a real token can sit five
directories deep (`repo/code/sub-app/apps/website/.env.local`), and a `-maxdepth 3`
sweep will confidently report there is none.

Then **verify every candidate**. Revoked 40-character tokens look identical to live
ones, and finding a dead token first is worse than finding nothing, because you conclude
the machine has no credential and go ask a human.

## Do not hand-refresh a wrangler OAuth session

You *can* POST the stored `refresh_token` to `https://dash.cloudflare.com/oauth2/token`
and get a working one-hour full-scope access token. It is also a trap: **the refresh
token rotates, and the old one dies immediately.** Discard the response and you have
bricked `wrangler` until someone runs `wrangler login` interactively.

Use **`wrangler auth token`** instead — it retrieves the current credential and handles
rotation and persistence for you.

## Fleet setup

Cloudflare publishes agent setup instructions at
`https://developers.cloudflare.com/agent-setup/prompt.md`.

- Claude Code: `claude plugin marketplace add cloudflare/skills` then
  `claude plugin install cloudflare@cloudflare`. The plugin carries all five MCP servers.
- Others: `npx -y skills add cloudflare/skills --skill '*' --yes --global`, plus the
  MCP config for that agent.

Two things that guide will not tell you:

- **The skills installer detects it is running inside Claude Code and overrides your
  `--agent` flag, then silently installs nothing.** It prints "Installing all 13 skills"
  and exits 0. Run it from a home directory rather than a scratch dir, one agent at a
  time, and check where the files landed.
- **Check which config paths are shared before installing.** In a multi-profile setup,
  `plugins/` and `skills/` are often symlinked between work and personal while
  `settings.json` is a real file per profile. That means shared *files* but per-profile
  *activation* — installing is safe, but snapshot the shared directories before and after
  and diff, rather than assuming. Judge contamination by mtime; a directory that already
  existed is not something you created.

## Related

- `deploy-app-cloudflare` — deploying to Workers/D1/R2/KV once you have credentials.
- `branch-deploy-convention` — the branch and deploy conventions these tokens serve.
