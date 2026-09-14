#!/usr/bin/env bash
# One pass of warm-up: send whatever is due, then measure where it landed.
#
# Run this HOURLY, not daily. The ramp spreads each day across a working window
# so the mail does not leave in one burst, and `send` only releases the messages
# that have come due. A daily run would send the whole day at once and undo that.
#
# Every step is idempotent, so a retry after a failure, or a missed hour, tops up
# rather than duplicating.
#
#   warm-tick.sh <config.json> <env-file>
#
# The env file supplies the provider credentials and is sourced, never logged.
set -euo pipefail

CONFIG="${1:?usage: warm-tick.sh <config.json> <env-file>}"
ENV_FILE="${2:?usage: warm-tick.sh <config.json> <env-file>}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$CONFIG" ] || { echo "no config at $CONFIG" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "no env file at $ENV_FILE" >&2; exit 1; }

set -a; . "$ENV_FILE"; set +a

echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) warm-up: $CONFIG"

# Authentication is re-checked every day: a DNS change, an expired record or a
# registrar edit between runs would otherwise be discovered by the receivers
# rather than by us.
node "$HERE/warmctl.mjs" preflight --config "$CONFIG"

node "$HERE/warmctl.mjs" send --config "$CONFIG" --apply

# Placement is checked on a later run as well as this one: a message sent
# minutes ago may not be classified yet, and `engage` re-checks anything still
# unresolved from the last three days.
node "$HERE/warmctl.mjs" engage --config "$CONFIG" --apply

node "$HERE/warmctl.mjs" report --config "$CONFIG"
