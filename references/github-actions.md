# GitHub Actions patterns

## Skip-when-secrets-not-configured gate

When a workflow depends on secrets that may not be set (new repo, fork, personal project), use a gate step that checks the secrets and emits `configured=true` or `configured=false`. Every downstream step is guarded by `if`:

```yaml
- id: gate
  name: Skip when secrets are not configured
  env:
    TOKEN_A: ${{ secrets.TOKEN_A }}
    TOKEN_B: ${{ secrets.TOKEN_B }}
    VAR_C: ${{ vars.VAR_C }}
  run: |
    if [[ -n "$TOKEN_A" && -n "$TOKEN_B" && -n "$VAR_C" ]]; then
      echo "configured=true" >> "$GITHUB_OUTPUT"
    else
      echo "configured=false" >> "$GITHUB_OUTPUT"
      echo "::notice title=Skipped::Step requires TOKEN_A, TOKEN_B, and VAR_C. Set them and re-run."
    fi

- name: Expensive step
  if: steps.gate.outputs.configured == 'true'
  run: ...
```

### Rules

1. **One gate at the top.** Check all required values in one step, not one `if` per variable.
2. **Guard every downstream step** with the same `if:` condition.
3. **Use `::notice`** rather than `::warning` or `::error` so the job is green, not yellow — the user sees a notice in the log, not a big orange banner.
4. **Check at least the union of all values** the job needs. A missing host suffix is just as broken as a missing token.

### Example in the wild

The [`replytosocial/worker-preview.yml`](https://github.com/pooriaarab/replytosocial/tree/main/.github/workflows/worker-preview.yml) workflow checks `CLOUDFLARE_PREVIEW_API_TOKEN`, `CF_PREVIEW_HOST_SUFFIX`, and `PREVIEW_BYOK_ENCRYPTION_KEY` before provisioning per-PR Cloudflare Worker previews. All provision, deploy, and verify steps are guarded by `steps.preview_gate.outputs.configured == 'true'`.

---

## Other patterns

### Repository ownership guard

Block a workflow from running on forks (where secrets are unavailable):

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository && github.repository_owner == 'pooriaarab'
```

### Concurrency per-PR

Prevent the same PR's workflow from stacking while allowing different PRs to run in parallel:

```yaml
concurrency:
  group: worker-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: false
```

Use `cancel-in-progress: true` only when the latest push should preempt the current run (fast CI feedback). Use `false` when the workflow does irreversible state changes (deploy, publish).