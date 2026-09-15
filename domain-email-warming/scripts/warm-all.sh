#!/usr/bin/env bash
# Run one warm-up pass for every domain config in a directory.
#
# Each domain keeps its own config and its own state file, so a failure on one
# never stops the rest — the loop deliberately does not use `set -e`.
#
#   warm-all.sh <config-dir> <env-file>
set -uo pipefail

DIR="${1:?usage: warm-all.sh <config-dir> <env-file>}"
ENV_FILE="${2:?usage: warm-all.sh <config-dir> <env-file>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -d "$DIR" ] || { echo "no config dir at $DIR" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "no env file at $ENV_FILE" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a

echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) warm-all over $DIR"
for cfg in "$DIR"/*.warmup.json; do
  [ -e "$cfg" ] || continue
  name=$(basename "$cfg" .warmup.json)
  echo "--- $name"
  node "$HERE/warmctl.mjs" send   --config "$cfg" --apply 2>&1 | sed 's/^/    /'
  node "$HERE/warmctl.mjs" engage --config "$cfg" --apply 2>&1 | sed 's/^/    /'
done
