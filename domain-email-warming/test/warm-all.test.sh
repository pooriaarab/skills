#!/usr/bin/env bash
# Offline tests for warm-all.sh. Stubs node; never sends.
set -uo pipefail
pass=0; fail=0
ok(){ echo "ok - $1"; pass=$((pass+1)); }
bad(){ echo "FAIL - $1"; fail=$((fail+1)); }

HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../scripts/warm-all.sh"
ROOT=$(mktemp -d); trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/bin" "$ROOT/cfg"
echo 'X=1' > "$ROOT/env"

# A stub node that records its arguments and fails preflight for one named
# config, so we can assert the loop continues past a failing domain rather
# than aborting the whole fleet, and that a failed preflight skips send.
cat > "$ROOT/bin/node" <<'STUB'
#!/usr/bin/env bash
echo "NODE:$*"
case "$*" in *preflight*broken-com*) exit 1 ;; esac
STUB
chmod +x "$ROOT/bin/node"
for d in alpha-com broken-com gamma-com; do echo '{}' > "$ROOT/cfg/$d.warmup.json"; done
cp "$SCRIPT" "$ROOT/bin/warm-all.sh" 2>/dev/null
mkdir -p "$ROOT/bin"; cp "$HERE/../scripts/warmctl.mjs" "$ROOT/bin/warmctl.mjs" 2>/dev/null || true

out=$(PATH="$ROOT/bin:$PATH" bash "$SCRIPT" "$ROOT/cfg" "$ROOT/env" 2>&1)

grep -q "alpha-com" <<<"$out" && ok "runs the first domain" || bad "first domain missing"
grep -q "gamma-com" <<<"$out" && ok "continues past a failing domain" || bad "loop aborted on failure: $out"
[ "$(grep -c 'NODE:' <<<"$out")" -ge 8 ] && ok "runs preflight, send and engage for each healthy config" || bad "expected node calls for preflight/send/engage: $out"
grep -q "NODE:.*preflight.*broken-com" <<<"$out" && ok "still runs preflight for the failing domain" || bad "preflight not attempted for broken-com"
grep -q "NODE:.*send.*broken-com" <<<"$out" && bad "sent for a domain that failed preflight" || ok "skips send when preflight fails"
grep -q "NODE:.*engage.*broken-com" <<<"$out" && ok "still runs engage for the failing domain" || bad "engage not attempted for broken-com"

out=$(PATH="$ROOT/bin:$PATH" bash "$SCRIPT" "$ROOT/nope" "$ROOT/env" 2>&1); st=$?
[ $st -ne 0 ] && ok "missing config dir exits non-zero" || bad "missing dir exited 0"
out=$(PATH="$ROOT/bin:$PATH" bash "$SCRIPT" "$ROOT/cfg" "$ROOT/nope" 2>&1); st=$?
[ $st -ne 0 ] && ok "missing env file exits non-zero" || bad "missing env exited 0"

echo; echo "passed $pass, failed $fail"; [ $fail -eq 0 ]
