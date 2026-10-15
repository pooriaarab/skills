#!/usr/bin/env bash
# Repeatable check for the sample mod: static analysis, unit tests, then a
# headless session that runs /tally with no model turn.
set -euo pipefail
cd "$(dirname "$0")"
CLAUDE="${CLAUDE_BIN:-claude}"

"$CLAUDE" --version
"$CLAUDE" plugin validate --strict ./tool-tally
(cd tool-tally && "$CLAUDE" plugin test)

out="$("$CLAUDE" -p "/tally" --plugin-dir ./tool-tally < /dev/null)"
echo "$out"
[[ "$out" == "tool-tally: Claude has made 0 tool calls since this mod loaded" ]]
echo "verify: ok"
