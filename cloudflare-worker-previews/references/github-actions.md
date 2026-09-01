# GitHub Actions workflow

Use this baseline for private repositories. Adapt the build and verification
commands to the project. An authenticated app is incomplete until its real login
flow runs against `steps.preview.outputs.preview_url`.

Set `CLOUDFLARE_API_TOKEN` as a repository secret. Set `CLOUDFLARE_ACCOUNT_ID`
and `CLOUDFLARE_PREVIEW_HOST_SUFFIX` as repository variables.
For example, use `preview.example.com`.

Do not rename the head branch while the PR is open. If a rename is unavoidable,
delete the Preview under the old name first. The close event carries only the new
name and cannot clean up the old Preview.

```yaml
name: Worker Preview

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

permissions:
  contents: read
  pull-requests: write

concurrency:
  group: worker-preview-${{ github.event.pull_request.number }}
  # Serialize deployment, deletion, and reopening for this PR.
  cancel-in-progress: false

env:
  WRANGLER_VERSION: 4.127.1

jobs:
  preview:
    if: >-
      github.event.action != 'closed' &&
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubicloud-standard-2
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      # Add the repository's normal install and build steps here.

      - id: preview
        name: Create or update Preview
        shell: bash
        env:
          BRANCH_NAME: ${{ github.event.pull_request.head.ref }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          PREVIEW_HOST_SUFFIX: ${{ vars.CLOUDFLARE_PREVIEW_HOST_SUFFIX }}
        run: |
          set -euo pipefail
          if [[ ! "$BRANCH_NAME" =~ ^[a-z]{2,4}-[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
            echo "Branch does not meet the PR standard: $BRANCH_NAME" >&2
            exit 1
          fi
          if (( ${#BRANCH_NAME} > 63 )); then
            echo "Branch exceeds Cloudflare's 63-character Preview name limit" >&2
            exit 1
          fi

          output="$(npx --yes "wrangler@$WRANGLER_VERSION" preview \
            --name "$BRANCH_NAME" --json)"
          printf '%s\n' "$output"
          json="$(printf '%s\n' "$output" | sed -n '/^{/,$p')"

          if [[ -n "$PREVIEW_HOST_SUFFIX" ]]; then
            preview_url="$(jq -er \
              --arg name "$BRANCH_NAME" \
              --arg suffix "$PREVIEW_HOST_SUFFIX" '
                [(.preview_urls // .preview.urls // [])[] as $url
                  | ($url | capture("^https://(?<host>[^/]+)").host) as $host
                  | select($host == ($name + "." + $suffix))
                  | $url][0]
              ' <<<"$json")"
          else
            preview_url="$(jq -er \
              '.preview_urls[0] // .preview.urls[0]' <<<"$json")"
          fi

          echo "preview_url=$preview_url" >> "$GITHUB_OUTPUT"

      - id: verify
        name: Verify live Preview
        env:
          PREVIEW_URL: ${{ steps.preview.outputs.preview_url }}
        run: |
          set +e
          health_headers="$(mktemp)"
          headers="$(mktemp)"
          page="$(mktemp)"
          robots="$(mktemp)"
          curl_status=1
          http_status=000
          for attempt in 1 2 3 4 5 6; do
            : > "$health_headers"
            http_status="$(curl --show-error --silent \
              --connect-timeout 10 --max-time 30 \
              --dump-header "$health_headers" --output /dev/null \
              --write-out '%{http_code}' "$PREVIEW_URL/api/health")"
            curl_status=$?
            [[ "$curl_status" == 0 && "$http_status" == 200 ]] && break
            (( attempt < 6 )) && sleep 3
          done
          page_status="$(curl --show-error --silent --connect-timeout 10 --max-time 30 \
            --dump-header "$headers" --output "$page" --write-out '%{http_code}' \
            "$PREVIEW_URL/")"
          page_curl_status=$?
          robots_headers="$(mktemp)"
          robots_status="$(curl --show-error --silent --connect-timeout 10 \
            --max-time 30 --dump-header "$robots_headers" --output "$robots" \
            --write-out '%{http_code}' \
            "$PREVIEW_URL/robots.txt")"
          set -e
          echo "http_status=$http_status" >> "$GITHUB_OUTPUT"
          test "$curl_status" = 0
          test "$page_curl_status" = 0
          test "$http_status" = 200
          test "$page_status" = 200
          test "$robots_status" = 200
          for directive in noindex nofollow noarchive nosnippet noimageindex; do
            pattern="^x-robots-tag:([[:space:]]*[^,]+,)*[[:space:]]*${directive}([[:space:]]*,|[[:space:]]*$)"
            grep -Eiq "$pattern" "$health_headers"
            grep -Eiq "$pattern" "$headers"
            grep -Eiq "$pattern" "$robots_headers"
          done
          robots_content="$(node -e '
            const fs = require("node:fs");
            const html = fs.readFileSync(process.argv[1], "utf8")
              .replace(/<!--[\s\S]*?-->/g, "")
              .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
            for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
              if (!/(?:^|\s)name\s*=\s*(["\x27])robots\1/i.test(tag)) continue;
              const content = tag.match(/(?:^|\s)content\s*=\s*(["\x27])(.*?)\1/i);
              if (content) process.stdout.write(content[2]);
              process.exit(content ? 0 : 1);
            }
            process.exit(1);
          ' "$page")"
          for directive in noindex nofollow noarchive nosnippet noimageindex; do
            grep -Eiq "(^|,[[:space:]]*)${directive}([[:space:]]*,|$)" <<<"$robots_content"
          done
          robots_body="$(grep -v '^[[:space:]]*$' "$robots" | tr -d '\r')"
          if [[ "$robots_body" != $'User-agent: *\nDisallow: /' ]]; then
            echo "robots.txt must contain exactly: User-agent: *, Disallow: /" >&2
            exit 1
          fi

          preview_host="$(printf '%s\n' "$PREVIEW_URL" | sed -E 's#^https?://([^/]+).*#\1#')"
          resolve_host() {
            case "$1" in
              http://*|https://*)
                printf '%s\n' "$1" | sed -E 's#^https?://([^/]+).*#\1#'
                ;;
              //*)
                printf '%s\n' "$1" | sed -E 's#^//([^/]+).*#\1#'
                ;;
              *)
                # A path-relative URL resolves against the current
                # (Preview) origin.
                printf '%s\n' "$preview_host"
                ;;
            esac
          }
          canonical_href="$(node -e '
            const fs = require("node:fs");
            const html = fs.readFileSync(process.argv[1], "utf8")
              .replace(/<!--[\s\S]*?-->/g, "")
              .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
            const canonicalTag = (html.match(/<link\b[^>]*>/gi) || []).find((tag) => {
              const rel = tag.match(/\brel\s*=\s*(?:(["\x27])(.*?)\1|([^\s>]+))/i);
              const relVal = rel ? (rel[2] ?? rel[3] ?? "") : "";
              return /(?:^|\s)canonical(?:\s|$)/i.test(relVal);
            });
            if (canonicalTag) {
              const href = canonicalTag.match(/\bhref\s*=\s*(?:(["\x27])(.*?)\1|([^\s>]+))/i);
              const hrefVal = href ? (href[2] ?? href[3] ?? "") : "";
              if (hrefVal) { process.stdout.write(hrefVal); process.exit(0); }
            }
            process.exit(1);
          ' "$page" || true)"
          if [[ -n "$canonical_href" ]]; then
            canonical_host="$(resolve_host "$canonical_href")"
            if [[ "${canonical_host,,}" == "${preview_host,,}" ]]; then
              echo "The root page exposes the Preview host as canonical" >&2
              exit 1
            fi
          fi
          link_canonical_href="$(node -e '
            const fs = require("node:fs");
            const linkLine = fs.readFileSync(process.argv[1], "utf8")
              .split(/\r?\n/)
              .find((line) => /^link:/i.test(line));
            if (!linkLine) process.exit(1);
            const value = linkLine.slice(linkLine.indexOf(":") + 1);
            for (const part of value.split(",")) {
              const uri = part.match(/<([^>]*)>/);
              if (!uri) continue;
              const rel = part.match(/\brel\s*=\s*(?:(["\x27])(.*?)\1|([^\s,;]+))/i);
              const relVal = rel ? (rel[2] ?? rel[3] ?? "") : "";
              if (/(?:^|\s)canonical(?:\s|$)/i.test(relVal)) {
                process.stdout.write(uri[1]);
                process.exit(0);
              }
            }
            process.exit(1);
          ' "$headers" || true)"
          if [[ -n "$link_canonical_href" ]]; then
            link_canonical_host="$(resolve_host "$link_canonical_href")"
            if [[ "${link_canonical_host,,}" == "${preview_host,,}" ]]; then
              echo "The root page exposes the Preview host as an HTTP Link canonical" >&2
              exit 1
            fi
          fi
          for path in sitemap.xml llms.txt llms-full.txt feed.xml rss.xml atom.xml indexnow; do
            body="$(mktemp)"
            path_headers="$(mktemp)"
            status="$(curl --show-error --silent --connect-timeout 10 \
              --max-time 30 --dump-header "$path_headers" --output "$body" \
              --write-out '%{http_code}' \
              "$PREVIEW_URL/$path")"
            for directive in noindex nofollow noarchive nosnippet noimageindex; do
              pattern="^x-robots-tag:([[:space:]]*[^,]+,)*[[:space:]]*${directive}([[:space:]]*,|[[:space:]]*$)"
              grep -Eiq "$pattern" "$path_headers"
            done
            if [[ "$status" == 404 || "$status" == 410 ]]; then
              continue
            fi
            if [[ "$status" != 200 ]] || grep -Fqi "$preview_host" "$body"; then
              echo "$path must be absent (404/410) or omit the Preview host ($preview_host)" >&2
              exit 1
            fi
          done

      # Add the repository's authenticated browser or API verification here.
      # Pass steps.preview.outputs.preview_url as its base URL.
      # Use only dedicated Preview test-user secrets.

      - name: Update Preview comment
        if: always() && steps.preview.outcome == 'success'
        shell: bash
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          PREVIEW_URL: ${{ steps.preview.outputs.preview_url }}
          VERIFY_OUTCOME: ${{ steps.verify.outcome }}
          HTTP_STATUS: ${{ steps.verify.outputs.http_status }}
        run: |
          set -euo pipefail
          marker='<!-- cloudflare-worker-preview -->'
          if [[ "$VERIFY_OUTCOME" == success ]]; then
            verification="passed (HTTP $HTTP_STATUS)"
          else
            verification="failed (HTTP ${HTTP_STATUS:-unavailable})"
          fi
          body="$(printf '%s\nPreview: %s\nLive verification: %s' \
            "$marker" "$PREVIEW_URL" "$verification")"
          comment_id="$(gh api \
            "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments?per_page=100" \
            --paginate | jq -sr --arg marker "$marker" \
            '[.[][] | select(.user.login == "github-actions[bot]") | select(.body // "" | contains($marker))][0].id // empty')"

          if [[ -n "$comment_id" ]]; then
            gh api --method PATCH \
              "repos/$GITHUB_REPOSITORY/issues/comments/$comment_id" \
              -f body="$body" >/dev/null
          else
            gh api --method POST \
              "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" \
              -f body="$body" >/dev/null
          fi

  cleanup:
    if: >-
      github.event.action == 'closed' &&
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubicloud-standard-2
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}

      - name: Delete Preview
        shell: bash
        env:
          BRANCH_NAME: ${{ github.event.pull_request.head.ref }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          set -euo pipefail
          if [[ ! "$BRANCH_NAME" =~ ^[a-z]{2,4}-[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
            echo "Refusing to delete an unexpected Preview name" >&2
            exit 1
          fi
          if (( ${#BRANCH_NAME} > 63 )); then
            echo "Refusing to delete an overlong Preview name" >&2
            exit 1
          fi
          npx --yes "wrangler@$WRANGLER_VERSION" preview delete \
            --name "$BRANCH_NAME" --skip-confirmation
          marker='<!-- cloudflare-worker-preview -->'
          comment_id="$(gh api "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments?per_page=100" \
            --paginate | jq -sr --arg marker "$marker" \
            '[.[][] | select(.user.login == "github-actions[bot]") | select(.body // "" | contains($marker))][0].id // empty')"
          body="$(printf '%s\nPreview: expired\nCleanup: passed' "$marker")"
          if [[ -n "$comment_id" ]]; then
            gh api --method PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$comment_id" \
              -f body="$body" >/dev/null
          else
            gh api --method POST "repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments" \
              -f body="$body" >/dev/null
          fi
```

Change `/api/health` to a route that proves the deployed Worker is ready.
Keep the authenticated verification in this job, after deployment and before
the sticky comment.

If the Worker uses Containers, list applications after cleanup. Delete only
applications whose names start with `<worker>_<branch>_`.
