---
name: multi-account-cli
description: "Use when the user needs to manage multiple accounts (work + personal) across CLI tools — cloud tools (gcloud, gws, Firebase, Netlify) AND AI coding CLIs (Claude Code, Codex, Gemini) — including setting up named profiles or per-tool config-dir isolation, switching accounts with one command, keeping skills/instructions shared while accounts/billing/MCP stay separate, and testing the switch. Triggers: 'switch accounts', 'multiple gcloud profiles', 'work vs personal CLI', 'separate work and personal Claude/Codex/Gemini', 'two ChatGPT/Claude subscriptions in terminal', 'how do I use two Google accounts in terminal'."
---

# Multi-Account CLI Profiles

**Pattern:** shell functions (`work` / `personal`) activate all tools at once. Store projects per-repo, not in profiles.

Two tool classes, two mechanisms:
- **Cloud CLIs** (gcloud, gws, Firebase, Netlify) — one `work`/`personal` switcher flips them all. Steps 1–6 below.
- **AI coding CLIs** (Claude Code, Codex, Gemini) — each keeps its own config dir; isolate per account with a config-dir env var. Section right below.

---

## AI Coding CLIs (Claude Code, Codex, Gemini)

Each CLI stores login + config + MCP servers in a home dir and exposes an env var to relocate it. Give each account its **own dir** → separate login, keys, and MCP; symlink the parts you want shared (skills, instructions). Bare command stays = primary (work); add explicit `-work` / `-personal`.

| CLI | Config-dir env var | Default dir | Notes |
|-----|--------------------|-------------|-------|
| Claude Code | `CLAUDE_CONFIG_DIR` | `~/.claude` | Relocates `.claude.json` (MCP) too. Credentials are OS-keychain entries namespaced per config dir, so two logins coexist — no eviction. |
| Codex | `CODEX_HOME` | `~/.codex` | Relocates `auth.json` + `config.toml` + MCP. **Dir must exist first** (`mkdir -p`). |
| Gemini | `GEMINI_CLI_HOME` | `~/.gemini` (config lands in `$DIR/.gemini`) | Auth is driven by `settings.json` (`security.auth.selectedType`), **not** by env — setting an API-key env alone does NOT override a cached login. Isolate the whole dir. |

```bash
# Claude Code
claude-work()     { CLAUDE_CONFIG_DIR="$HOME/.claude"          claude "$@"; }
claude-personal() { CLAUDE_CONFIG_DIR="$HOME/.claude-personal" claude "$@"; }

# Codex   (run once: mkdir -p ~/.codex-personal)
codex-work()     { CODEX_HOME="$HOME/.codex"          command codex "$@"; }
codex-personal() { CODEX_HOME="$HOME/.codex-personal" command codex "$@"; }

# Gemini
gemini-personal() { GEMINI_CLI_HOME="$HOME/.gemini-personal" command gemini "$@"; }
```

First run of any `-personal` command triggers that CLI's own login flow — sign in with the personal account (subscription login, or API key). The work dir is never touched.

**Share skills + instructions, keep accounts/MCP separate.** Symlink from personal → primary so learnings and skills live in one place:
```bash
ln -s ~/.claude/skills   ~/.claude-personal/skills
ln -s ~/.codex/AGENTS.md ~/.codex-personal/AGENTS.md
mkdir -p ~/.gemini-personal/.gemini
ln -s ~/.gemini/GEMINI.md ~/.gemini-personal/.gemini/GEMINI.md
```
Stay separate: credentials, MCP servers, session history. Some CLIs read agent skills from a shared global dir (e.g. `~/.agents/skills`) — check before symlinking; those are already shared.

**Billing-only variant** (keep ONE config dir, switch only billing subscription→API): don't relocate the dir — inject an API key per command, from the OS keychain, never plaintext:
```bash
work-ai() { ANTHROPIC_API_KEY="$(security find-generic-password -s my-work-key -w)" claude "$@"; }
```
Never `export` the key globally, or **every** session bills to the API.

**Gotchas (AI CLIs):**

| Problem | Fix |
|---------|-----|
| Personal login evicts work login | One OAuth slot per config dir — give each account its own dir |
| `CODEX_HOME points to ... does not exist` | `mkdir -p` the dir before first use |
| Gemini ignores API-key env, reuses old login | Auth is settings-driven; isolate with `GEMINI_CLI_HOME` and log in fresh there |
| API key leaks into personal/other sessions | Don't `export` it; inject per command only |
| A launcher/wrapper shadows the real CLI on PATH | Env vars pass through `exec` — set them before the command; the shim inherits them |

---

## Step 1 — Ask the User

```
1. Which tools do you use? (gcloud/gws, Firebase, Netlify, others?)
2. What are your account emails? (e.g. name@company.com, name@gmail.com)
3. Do you want project defaults per profile, or set project per-repo?
   → Recommend: per-repo. Projects change too often to bake into a profile.
4. Which account is already authenticated?
```

Check current state before doing anything:
```bash
gcloud config configurations list
firebase login:list
netlify status
```

---

## Critical: gws Needs Isolated Config Directories

`gws` stores OAuth credentials in a single encrypted file (`~/.config/gws/credentials.enc`) with a single encryption key. Switching accounts by copying files causes key/credential mismatches. **The only reliable approach is isolated config directories + symlink switching:**

```bash
mkdir -p ~/.config/gws-work ~/.config/gws-personal
# Each dir gets its own: client_secret.json, credentials.enc, .encryption_key

# In work()/personal() functions — swap the symlink, not individual files:
rm -f ~/.config/gws && ln -s ~/.config/gws-work ~/.config/gws    # work
rm -f ~/.config/gws && ln -s ~/.config/gws-personal ~/.config/gws # personal
```

**Always use file-based keyring** (not OS keyring) so each dir's encryption key is portable:
```bash
export GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file
gws auth login   # creates .encryption_key inside the active config dir
```

**Personal GCP project requirements** for gws personal config:
1. Create GCP project on personal account: `gcloud projects create my-personal`
2. Enable APIs: `gcloud services enable drive.googleapis.com sheets.googleapis.com gmail.googleapis.com docs.googleapis.com`
3. Enable billing (required for quota project): `gcloud billing projects link my-personal --billing-account=<id>`
4. Create OAuth Desktop client via console (no CLI API for this): **console.cloud.google.com/apis/credentials**
5. Add your email as OAuth test user: **console.cloud.google.com/apis/credentials/consent**
6. Download `client_secret.json` → `~/.config/gws-personal/client_secret.json`

---

## Step 2 — gcloud Configurations

```bash
# Create named configs (one per account)
gcloud config configurations create work
gcloud config configurations activate work
gcloud config set account you@company.com

gcloud config configurations create personal
gcloud config configurations activate personal
# (leave account empty — set after login)
```

**Authenticate each** (requires browser — tell user to run with `! <cmd>`):
```bash
# Work account
gcloud config configurations activate work
gcloud auth login --account=you@company.com
gcloud auth application-default login   # needed for SDK/API calls

# Personal account
gcloud config configurations activate personal
gcloud auth login   # sign in as personal email in browser
gcloud auth application-default login
```

`gws` inherits whichever `gcloud` config is active — no extra setup.

---

## Step 3 — Firebase Multi-Account

Firebase CLI supports multiple accounts natively:

```bash
firebase login:add          # add second account (browser opens)
firebase login:list         # verify both accounts present
firebase login:use you@company.com   # switch active account
```

---

## Step 4 — Netlify (env var approach)

Netlify CLI has no native profile support. Use personal access tokens + env var:

1. Go to **app.netlify.com → User Settings → Personal access tokens**
2. Create a token for each account
3. Store in `~/.zshrc`:

```bash
NETLIFY_TOKEN_WORK="nfp_xxxx"
NETLIFY_TOKEN_PERSONAL="nfp_yyyy"
```

Switch by setting `NETLIFY_AUTH_TOKEN`:
```bash
export NETLIFY_AUTH_TOKEN="$NETLIFY_TOKEN_WORK"
netlify status   # confirms which account is active
```

---

## Step 5 — Shell Switcher Functions

Add to `~/.zshrc`:

```bash
NETLIFY_TOKEN_WORK=""      # fill in after getting tokens
NETLIFY_TOKEN_PERSONAL=""

function work() {
  gcloud config configurations activate work --quiet
  cp ~/.config/gcloud/adc_work.json ~/.config/gcloud/application_default_credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/adc_work.json
  rm -f ~/.config/gws && ln -s ~/.config/gws-work ~/.config/gws
  export GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file
  export NETLIFY_AUTH_TOKEN="$NETLIFY_TOKEN_WORK"
  firebase login:use you@company.com 2>/dev/null
  echo "✓ Switched to work (you@company.com)"
  echo "  gcloud: $(gcloud config get account 2>/dev/null)"
}

function personal() {
  gcloud config configurations activate personal --quiet
  cp ~/.config/gcloud/adc_personal.json ~/.config/gcloud/application_default_credentials.json
  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/adc_personal.json
  rm -f ~/.config/gws && ln -s ~/.config/gws-personal ~/.config/gws
  export GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file
  export NETLIFY_AUTH_TOKEN="$NETLIFY_TOKEN_PERSONAL"
  firebase login:use you@gmail.com 2>/dev/null
  echo "✓ Switched to personal (you@gmail.com)"
  echo "  gcloud: $(gcloud config get account 2>/dev/null)"
}

function whoami-dev() {
  echo "gcloud:   $(gcloud config get account 2>/dev/null) [$(gcloud config configurations list --filter=IS_ACTIVE=true --format='value(name)' 2>/dev/null)]"
  echo "firebase: $(firebase login:list 2>/dev/null | head -2)"
  echo "netlify:  $(netlify api getCurrentUser 2>/dev/null | python3 -c 'import sys,json; u=json.load(sys.stdin); print(u.get("email","?"))' 2>/dev/null)"
}
```

Then reload: `source ~/.zshrc`

---

## Step 6 — Test Each Profile

```bash
# Test work
work
whoami-dev   # should show work email everywhere
gcloud projects list   # lists work projects
firebase projects:list # lists work Firebase projects

# Test personal
personal
whoami-dev   # should show personal email everywhere
gcloud projects list
firebase projects:list
```

---

## Setting Project Per-Repo

Don't hardcode projects in profiles — they change. Set per-repo instead:

```bash
# In any repo directory:
gcloud config set project my-project-id

# Or use direnv for automatic switching:
echo 'export GCLOUD_PROJECT=my-project-id' > .envrc
direnv allow
```

---

## Gotchas

| Problem | Fix |
|---------|-----|
| `gcloud auth` fails non-interactively | Run `! gcloud auth login` (needs browser) |
| `firebase login:use` fails | Run `firebase login:add` first, then `login:use` |
| `NETLIFY_AUTH_TOKEN` not persisting | Add `export` to the var, or re-run `work`/`personal` after new shell |
| gws still uses wrong account | gws does NOT inherit gcloud — it needs isolated dirs + symlink swap |
| gws "Decryption failed" on switch | Do NOT copy credentials files between accounts — use isolated dirs (`~/.config/gws-work/`, `~/.config/gws-personal/`) and symlink swap |
| gws keyring overwrites on re-login | Use `GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file` — each dir gets its own `.encryption_key` |
| gws personal project 403 forbidden | Enable billing: `gcloud billing projects link <project> --billing-account=<id>` |
| gws OAuth consent blocked (testing mode) | Add your email as test user at console.cloud.google.com/apis/credentials/consent |
| ADC (Application Default Credentials) wrong | Save per-account: `cp ~/.config/gcloud/application_default_credentials.json ~/.config/gcloud/adc_work.json`; swap in switcher function |
| Multiple `default` configs cluttering list | Rename: `gcloud config configurations rename default work` |

## Cost and Time

**Setup time:** ~15 min (mostly waiting for browser auth flows)  
**Cost:** Free — all CLI tools are free for auth/project management  
**Maintenance:** Update `NETLIFY_TOKEN_*` vars when tokens expire (~1 year)
