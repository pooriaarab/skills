---
name: windows-organizer
description: "Free disk space and organize files on Windows, over Tailscale SSH from another machine or run locally. Finds and removes dev caches (node_modules, .next, .turbo, npm/yarn/pnpm/bun, Temp), reorganizes Desktop/Downloads/Documents into a clean project structure, and reconciles duplicates against Google Drive with a report-only diff (hash + mtime) that never deletes."
---

# Windows Organizer

Use when the user wants to clean up a Windows PC, free disk space, reorganize files, or reconcile files that live on both a Windows machine and Google Drive — while converging Windows, macOS, and Drive on one folder layout.

Pairs with `mac-organizer` (same canonical layout) and `google-drive-organizer`. To operate a specific remote Windows box over Tailscale SSH (connection details, WSL, runner), see `dell-windows-host`.

## Triggers

- "clean up my Windows PC", "my C: drive is full", "free up space on Windows"
- "organize my Windows Desktop / Downloads / Documents"
- "the same files are on my Windows PC and Google Drive" / "find duplicates between Windows and Drive"
- "make my Windows folders match my Mac"
- "go over these one by one, don't delete anything, compare versions"

---

## Phase 0 — Connect (or run locally)

Run everything below either directly in PowerShell on the box, or over SSH from another machine. For a specific pre-configured host, `dell-windows-host` has the exact connection recipe — reuse it and skip this phase.

Tailscale gives the network path. It does **not** log you in. The Windows OpenSSH server still authenticates by key or password. Tailscale SSH's keyless server is **Linux-only**, so a Windows node falls back to stock OpenSSH.

```bash
# from the Mac/Linux side — Windows node reachable on the tailnet
tailscale status                 # find the Windows node name + 100.x IP
tailscale ping <windows-node>
nc -z <ip> 22                    # OpenSSH server up?
ssh -i ~/.ssh/<key> <user>@<ip> "hostname; whoami"
```

**Windows OpenSSH auth gotcha (the usual failure):** for a member of the local **Administrators** group, the public key must go in
`C:\ProgramData\ssh\administrators_authorized_keys` — **not** the user's `~/.ssh/authorized_keys` — and that file needs tight ACLs, or `sshd` ignores it silently and you get `Permission denied (publickey,password,...)`.

```powershell
# on the Windows box, once, as admin — authorize a key for an admin user
$k = 'ssh-ed25519 AAAA... comment'
Add-Content C:\ProgramData\ssh\administrators_authorized_keys $k
icacls C:\ProgramData\ssh\administrators_authorized_keys /inheritance:r
icacls C:\ProgramData\ssh\administrators_authorized_keys /grant "Administrators:F" "SYSTEM:F"
Restart-Service sshd
```

Confirm the exact login **username** — `whoami` on the box prints `hostname\username`; the SSH user is the `username` part. Do not assume it matches the Mac user.

Run everything below either in an SSH session or directly in PowerShell on the box. Prefer PowerShell (`pwsh`/`powershell`) over `cmd`.

---

## Phase 1 — Disk Space Audit

```powershell
Get-PSDrive -PSProvider FileSystem | Select Name, @{n='FreeGB';e={[int]($_.Free/1GB)}}, @{n='UsedGB';e={[int](($_.Used)/1GB)}}

# biggest top-level buckets under the profile
$dirs = "$env:USERPROFILE\Desktop","$env:USERPROFILE\Downloads","$env:USERPROFILE\Documents","$env:LOCALAPPDATA","$env:APPDATA"
foreach ($d in $dirs) {
  $gb = [math]::Round((Get-ChildItem $d -Recurse -File -EA SilentlyContinue | Measure-Object Length -Sum).Sum/1GB, 2)
  "{0,8} GB  {1}" -f $gb, $d
}
```

Find the heavy caches:

```powershell
Get-ChildItem "$env:USERPROFILE\Documents" -Recurse -Directory -EA SilentlyContinue |
  Where Name -in 'node_modules','.next','.turbo','dist','build' |
  Select FullName, @{n='GB';e={[math]::Round((Get-ChildItem $_.FullName -Recurse -File -EA SilentlyContinue|Measure Length -Sum).Sum/1GB,2)}} |
  Sort GB -Desc | Select -First 15
```

---

## Phase 2 — Safe Cache Deletions (regenerable, always safe)

These are package-manager and build caches. They rebuild on next install/build.

```powershell
# npm / yarn / pnpm / bun
npm cache clean --force
Remove-Item "$env:LOCALAPPDATA\npm-cache" -Recurse -Force -EA SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\Yarn\Cache" -Recurse -Force -EA SilentlyContinue
Remove-Item "$env:LOCALAPPDATA\pnpm-store","$env:LOCALAPPDATA\pnpm\store" -Recurse -Force -EA SilentlyContinue
Remove-Item "$env:USERPROFILE\.bun\install\cache" -Recurse -Force -EA SilentlyContinue

# Playwright / Puppeteer browser downloads
Remove-Item "$env:USERPROFILE\AppData\Local\ms-playwright" -Recurse -Force -EA SilentlyContinue
Remove-Item "$env:USERPROFILE\.cache\puppeteer" -Recurse -Force -EA SilentlyContinue

# Windows temp
Remove-Item "$env:TEMP\*" -Recurse -Force -EA SilentlyContinue

# build caches inside repos (never inside node_modules)
Get-ChildItem "$env:USERPROFILE\Documents" -Recurse -Directory -EA SilentlyContinue |
  Where { $_.Name -in '.next','.turbo' -and $_.FullName -notmatch 'node_modules' } |
  ForEach-Object { Remove-Item $_.FullName -Recurse -Force -EA SilentlyContinue }
```

`node_modules` are regenerable but slow to rebuild — confirm with the user before mass-deleting them, then reinstall per repo with `npm i` / `pnpm i`.

Windows built-in reclaimers (offer, don't auto-run — they need elevation):

```powershell
cleanmgr /sagerun:1          # Disk Cleanup
Dism.exe /Online /Cleanup-Image /StartComponentCleanup   # WinSxS component store
```

---

## Phase 3 — File Organization

### Canonical structure (same as `mac-organizer`)

Converge Windows `%USERPROFILE%\Documents`, macOS `~/Documents`, and the Google Drive root on one layout:

```
Documents/
├── {project}/          # one dir per project/brand (flat, no nesting)
│   ├── code/           # git repos
│   ├── assets/         # logos, brand images
│   ├── docs/           # strategy, specs
│   ├── content/        # marketing, social
│   └── research/
├── {you}/              # your personal "project"
│   ├── immigration/
│   ├── finances/
│   │   ├── invoices/
│   │   └── receipt-photos/
│   ├── health/
│   ├── legal/
│   ├── photos/
│   └── notes/
```

### Desktop / Downloads sort (move, never delete)

```powershell
$D = "$env:USERPROFILE\Desktop"
New-Item -ItemType Directory -Force "$D\Screenshots","$D\Documents","$D\Installers" | Out-Null

Move-Item "$D\Screenshot*.png" "$D\Screenshots\" -EA SilentlyContinue
Move-Item "$D\*.pdf"           "$D\Documents\"   -EA SilentlyContinue
Move-Item "$D\*.exe","$D\*.msi" "$D\Installers\" -EA SilentlyContinue
```

---

## Phase 4 — Reconcile Windows vs Google Drive (report-only, no deletes)

The core job when the same files live on the Windows PC and in Google Drive. **Never delete. Compare, classify, report. The human decides each action.**

Method — hash + modified-time on both sides, match by relative path, classify:

| Class | Meaning | Suggested (human confirms) |
|---|---|---|
| `IDENTICAL` | same relative path, same hash | safe candidate to keep one copy |
| `WINDOWS_NEWER` | same path, different hash, Windows mtime newer | Windows likely the good version |
| `DRIVE_NEWER` | same path, different hash, Drive mtime newer | Drive likely the good version |
| `CONFLICT` | different hash, mtimes within 60s or unclear | needs a human eyeball / manual diff |
| `WINDOWS_ONLY` | path missing on Drive | candidate to copy up to Drive |
| `DRIVE_ONLY` | path missing on Windows | candidate to copy down / ignore |

Build the manifest on each side, then diff. Example (Windows side; produce a matching one for the Drive root, then join on `Rel`):

```powershell
$root = "$env:USERPROFILE\Documents"
Get-ChildItem $root -Recurse -File -EA SilentlyContinue | ForEach-Object {
  [pscustomobject]@{
    Rel   = $_.FullName.Substring($root.Length).TrimStart('\')
    Size  = $_.Length
    MTime = $_.LastWriteTimeUtc.ToString('o')
    Hash  = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
  }
} | Export-Csv "$env:TEMP\windows-manifest.csv" -NoTypeInformation
```

Then join the two manifests on `Rel` (in PowerShell, or pull both CSVs to one machine and diff there) and emit the classification table above. **Output is a report** — a table plus a CSV of every non-identical file. No `Remove-Item`, no `Move-Item` in this phase.

Hashing gotchas:
- **Google Drive for Desktop** streams files. `Get-FileHash` on a Drive-streamed file forces a download; for a big tree, hash by size first and only hash SHA-256 where sizes match.
- Compare by **content hash**, never by name or size alone — same name + same size can still differ.
- Normalize path separators (`\` vs `/`) and case before joining, or matches are missed.

After the user reviews the report, apply only the actions they approve — copy up, copy down, or move into the canonical layout. Deletion, if ever, is a separate explicit step the user asks for by name.

---

## Phase 5 — Descriptive File Renaming

Windows has no on-device Apple Intelligence equivalent that's private-by-default. Options, cheapest first:

1. **Directory-context naming** (no AI, no network): derive a slug from the folder + date + a counter, e.g. `invoices\2025-04\shaw-internet-2025-04.pdf`. Deterministic, offline, good enough for most sorting.
2. **Local OCR** for scanned receipts/images via Tesseract (`winget install UB-Mannheim.TesseractOCR`), then the directory-context slug from the extracted text.
3. **Cloud LLM** only with explicit user opt-in — never send personal documents to a cloud model without asking.

Prefer 1. Reserve 2–3 for files the folder context can't name.

---

## Guardrails

- **Never delete in the reconcile phase.** Phase 4 is report-only by design.
- Confirm the SSH **username** and that you're on the intended host (`hostname`) before any bulk operation.
- `Move-Item` before `Remove-Item`, always — moving into the canonical layout is reversible; deleting is not.
- Dry-run mass moves first: build the list with `Get-ChildItem`, show it, then act.
- Don't touch `C:\Windows`, `Program Files`, or another user's profile.
