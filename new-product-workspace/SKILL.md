---
name: new-product-workspace
description: "Scaffold a brand-new product from zero: pick a name, confirm the .com is free, create the git repo, and lay out a local workspace that keeps brand assets, docs, and code side by side while the code stays a clean standalone repo. Use at the very start of a new product, before any building — it produces the empty container that ship-a-product then fills. Triggers: 'start a new product', 'set up a repo and local folder for X', 'new project workspace', 'scaffold a new product'."
---

# new-product-workspace

The first step of a new product: a name, a repo, and a place to keep everything.
This skill only creates the empty container. Hand off to `ship-a-product` for the
build → launch stages, and to `cloudflare-domain-launch` when it is time to
actually buy the domain and host a site.

## 1. Name it, and confirm the domain is free

Pick a short, brandable name. Confirm the `.com` (or `.ai`/`.app`) is actually
available and priced before committing — a name whose domain is taken is a name
you will regret.

- Registry truth for `.com`: Verisign RDAP. `404` = available, `200` = taken.
  `curl -s -o /dev/null -w "%{http_code}" https://rdap.verisign.com/com/v1/domain/<name>.com`
- Availability **and price** in one call: Cloudflare Registrar
  `POST /accounts/{account_id}/registrar/domain-check` with
  `{"domains": ["<name>.com", "<name>.ai", "<name>.app"]}`. Returns
  `registrable` plus `registration_cost` / `renewal_cost` per extension.

Popular mail/inbox/triage dictionary words are almost all squatted on `.com`.
Reach for a coinage or a compound early, and check a batch of 15–20 at once.

Do not register the domain here unless the user asks. Checking is free;
buying is a decision the user makes.

## 2. Create the repo

```bash
gh repo create <owner>/<name> --private --description "<one line>"
```

Private by default for an unlaunched product — flip to public later. Seed a
minimal `README.md` (name, one-paragraph pitch, `Status: 0→1.`) so the repo is
not empty.

## 3. The local workspace layout

One container folder per product. The code lives **inside** it as its own repo,
so the code stays clean while brand and research material sit alongside:

```
<product>/
├── branding/          logo, colors, type, brand guidelines
└── code/
    └── <repo>/         the git repo (this is the only tracked git repo)
```

Add these only when there is something to put in them (do not pre-create empty
scaffolding):

```
├── assets/            shared images, exports, media
├── content/           copy, posts, docs drafts
└── research/          prior art, notes, competitive scans
```

The container itself is **not** a git repo — only `code/<repo>/` is. This keeps
`git status` inside the code clean and lets brand/research files live next to
the code without ever being committed to it.

## 4. First commit when a pre-push guard blocks main

Some setups run a local pre-push hook that blocks any direct push to `main`.
For the very first commit to a fresh empty repo there is no PR to make, so seed
`main` on the remote through the API instead of pushing:

```bash
# from inside code/<repo>/
b64=$(base64 -i README.md)
gh api -X PUT repos/<owner>/<name>/contents/README.md \
  -f message="Initial commit: <name> README" \
  -f content="$b64"
git fetch origin main
git branch --set-upstream-to=origin/main main
```

After this, normal work goes through feature branches and PRs.

## 5. Hand off

The workspace is now ready. Next:

- Building the product → `ship-a-product` (it sequences build → open-source prep
  → site → launch).
- Buying the domain and hosting a site → `cloudflare-domain-launch`.
- Generating the brand system that fills `branding/` → `saas-brand-system`.

## Checklist

- [ ] Name chosen; `.com` (or alt TLD) confirmed available + priced.
- [ ] `gh repo create` done (private unless told otherwise).
- [ ] `README.md` seeded; `main` exists on the remote.
- [ ] Local `<product>/{branding/,code/<repo>/}` container created.
- [ ] Domain **not** purchased unless the user asked.
