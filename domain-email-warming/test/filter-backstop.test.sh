#!/usr/bin/env bash
# filter-backstop.test.sh — offline tests for build-filter-query.py and
# inbox-backstop.py. gog is stubbed; nothing touches Gmail.
set -u
cd "$(dirname "$0")/.." || exit 1

pass=0; fail=0
ok()  { pass=$((pass+1)); echo "ok - $1"; }
bad() { fail=$((fail+1)); echo "NOT OK - $1"; }

ROOT=$(mktemp -d)
trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/bin" "$ROOT/config/domains" "$ROOT/state"

cat > "$ROOT/config/domains/a.warmup.json" <<'EOF'
{"sendingDomain": "a.example", "identities": [{"address": "x@a.example"}, {"address": "y@mail.a.example"}]}
EOF
cat > "$ROOT/config/apex.warmup.json" <<'EOF'
{"sendingDomain": "b.example", "identities": [{"address": "z@b.example"}]}
EOF

cat > "$ROOT/bin/gog" <<'EOF'
#!/usr/bin/env bash
# Stub: searches return canned hits, modify records its argv.
echo "$*" >> "${SWEEP_FAKE_GOG_LOG:?}"
case "$*" in
  *"messages search"*)
    if [ -n "${SWEEP_FAKE_HITS:-}" ]; then
      python3 -c "import json,os; print(json.dumps({'messages':[{'id':i,'labels':['INBOX']} for i in os.environ['SWEEP_FAKE_HITS'].split(',')]}))"
    else
      echo '{"messages":[]}'
    fi
    ;;
  *)
    echo '{}'
    ;;
esac
EOF
chmod +x "$ROOT/bin/gog"
export PATH="$ROOT/bin:$PATH" SWEEP_FAKE_GOG_LOG="$ROOT/gog.log"

# 1. Builder covers domains/ plus apex configs, guards the seed account.
python3 scripts/build-filter-query.py --config-dir "$ROOT/config" --account see.d@example.com --out "$ROOT/q.txt" >/dev/null
Q=$(cat "$ROOT/q.txt")
case "$Q" in
  *"-to:{see.d@example.com seed@example.com}"*) ok "guard covers dotted and bare account" ;;
  *) bad "guard wrong: ${Q:0:60}" ;;
esac
python3 scripts/build-filter-query.py --config-dir "$ROOT/config" --account seed@example.com --out "$ROOT/q2.txt" >/dev/null
case "$(cat "$ROOT/q2.txt")" in
  *"-to:{seed@example.com} ("*) ok "dotless account not mangled" ;;
  *) bad "dotless guard wrong" ;;
esac
for d in a.example mail.a.example b.example; do
  case "$Q" in *"$d"*) ok "domain present: $d" ;; *) bad "domain missing: $d" ;; esac
done
case "$Q" in *"formsubmit"*substack*blogtrottr*alerts-noreply*) ok "new sender words present" ;; *) bad "sender words missing" ;; esac

# 2. Backstop dry-run lists matches without modifying.
export SWEEP_FAKE_HITS="m1,m2"
: > "$ROOT/gog.log"
OUT=$(python3 scripts/inbox-backstop.py --account seed@example.com --query-file "$ROOT/q.txt" --dry-run --max 10)
case "$OUT" in *"would archive"*) ok "dry-run reports count" ;; *) bad "dry-run output: $OUT" ;; esac
grep -q "batch modify" "$ROOT/gog.log" && bad "dry-run modified" || ok "dry-run modifies nothing"

# 3. Backstop archives matches with the label in live mode.
: > "$ROOT/gog.log"
OUT=$(python3 scripts/inbox-backstop.py --account seed@example.com --query-file "$ROOT/q.txt" --max 10 --rounds 1)
case "$OUT" in *"archived=2"*) ok "archives all matches" ;; *) bad "archive output: $OUT" ;; esac
grep -q -- "--add warmup --remove INBOX" "$ROOT/gog.log" && ok "label applied, inbox removed" || bad "modify argv wrong"

# 4. Backstop exits 0 with nothing to do.
export SWEEP_FAKE_HITS=""
OUT=$(python3 scripts/inbox-backstop.py --account seed@example.com --query-file "$ROOT/q.txt" --rounds 1)
case "$OUT" in *"archived=0"*) ok "empty run clean" ;; *) bad "empty output: $OUT" ;; esac

# 5. Backstop refuses a missing query file.
python3 scripts/inbox-backstop.py --account seed@example.com --query-file "$ROOT/nope.txt" >/dev/null 2>&1
[ $? -eq 1 ] && ok "missing query file exits 1" || bad "missing query exit code"

echo "---"
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
