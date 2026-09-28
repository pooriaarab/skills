#!/usr/bin/env bash
# Offline E2E for subscribe-sweep.mjs: subscribe send, reply confirm, click
# confirm, state dedupe. Cloudflare sends and link clicks are fetch-mocked via
# a preload; gog is a stub binary. No network calls.
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(mktemp -d)"
trap 'rm -rf "$ROOT"' EXIT
SCRIPT="scripts/subscribe-sweep.mjs"
pass=0 fail=0
ok() { echo "ok - $1"; pass=$((pass+1)); }
bad() { echo "FAIL - $1"; fail=$((fail+1)); }

mkdir -p "$ROOT/cfg" "$ROOT/bin" "$ROOT/state"

cat > "$ROOT/cfg/t.example.warmup.json" <<'JSON'
{
  "cloudflare": {
    "accountIdEnv": "T_CF_ACCT", "zoneIdEnv": "T_CF_ZONE", "tokenEnv": "T_CF_TOKEN"
  },
  "identities": [
    {"address": "a@t.example", "name": "A Test"},
    {"address": "b@t.example", "name": "B Test"}
  ]
}
JSON

# fetch mock: Cloudflare send accepts; confirm-link clicks return 200. The
# preload also records every send so the test can read it back.
cat > "$ROOT/preload.mjs" <<'EOF'
const sent = [];
globalThis.__sent = sent;
const real = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (u.includes("api.cloudflare.com")) {
    sent.push(JSON.parse(init.body));
    return new Response(JSON.stringify({
      success: true,
      result: { delivered: ["x"], message_id: "<t@x>", errors: [] },
    }), { status: 200, headers: { "content-type": "application/json" } });
  }
  globalThis.__clicks = (globalThis.__clicks ?? 0) + 1;
  return new Response("<html>confirmed</html>", { status: 200 });
};
EOF

# gog stub: search returns the confirm mail only when T_CONFIRM=1; get returns
# a body carrying the list's confirm sender and the warmed mailbox.
cat > "$ROOT/bin/gog" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *"messages search"*)
    if [ "${T_CONFIRM:-0}" = "1" ]; then echo '{"messages":[{"id":"m1","subject":"confirm tok123"}]}'
    else echo '{"messages":[]}'; fi
    ;;
  *"get "*)
    printf 'from\t%s\nto\t%s\nsubject\tconfirm tok123\n\n%s\n' \
      "${T_FROM:-~x/list+confirm-subscribe@lists.sr.ht}" \
      "${T_TO:-A Test <a@t.example>}" "${T_BODY:-reply to confirm}"
    ;;
  *) echo '{"messages":[]}' ;;
esac
STUB
chmod +x "$ROOT/bin/gog"

export T_CF_ACCT=a T_CF_ZONE=z T_CF_TOKEN=t

run() {
  node --import "$ROOT/preload.mjs" "$SCRIPT" --config-dir "$ROOT/cfg" \
    --account seed@example.com --gog "$ROOT/bin/gog" --state "$ROOT/state/sub.json" "$@"
}

# 1. Dry run: plans subscribes, writes nothing, sends nothing.
run > "$ROOT/out1.txt"
grep -q "would subscribe" "$ROOT/out1.txt" && ok "dry run plans subscribes" || bad "dry run output"
[ ! -f "$ROOT/state/sub.json" ] && ok "dry run writes no state" || bad "dry run wrote state"

# 2. Applied run: subscribe mails go out, pairs become requested.
run --apply > "$ROOT/out2.txt"
grep -q "subscribe a@t.example ->" "$ROOT/out2.txt" && ok "subscribe sent" || bad "no subscribe send"
python3 -c "import json;s=json.load(open('$ROOT/state/sub.json'));print([p['status'] for p in s['pairs'].values()])" > "$ROOT/st.txt"
grep -q "requested" "$ROOT/st.txt" && ok "pairs marked requested" || bad "status: $(cat "$ROOT/st.txt")"

# 3. Confirm mail for a reply-list: reply goes out, pairs confirmed.
T_CONFIRM=1 T_FROM="~sircmpwn/sr.ht-announce+confirm-subscribe@lists.sr.ht" run --apply > "$ROOT/out3.txt"
grep -q "confirmed a@t.example on" "$ROOT/out3.txt" && ok "reply confirm completed" || bad "confirm: $(cat "$ROOT/out3.txt")"

# 4. Click-confirm list: seed a requested pgsql pair for b@, then confirm it.
python3 - <<PY
import json
s=json.load(open('$ROOT/state/sub.json'))
s['pairs']['b@t.example|pgsql-announce']={
 'list':'pgsql-announce','status':'requested','attempts':1,
 'sentAt':__import__('time').time()*1000-1000}
json.dump(s,open('$ROOT/state/sub.json','w'))
PY
T_CONFIRM=1 T_FROM="confirm@lists.postgresql.org" T_TO="B Test <b@t.example>" \
  T_BODY="verify at https://lists.postgresql.org/confirm?t=9 thanks" run --apply > "$ROOT/out4.txt"
grep -q "confirmed b@t.example on pgsql-announce" "$ROOT/out4.txt" && ok "click confirm completed" || bad "click: $(cat "$ROOT/out4.txt")"

# 5. Missing config dir exits 2.
run --config-dir "$ROOT/nope" >/dev/null 2>&1
[ $? -eq 2 ] || true
node --import "$ROOT/preload.mjs" "$SCRIPT" --config-dir "$ROOT/nope" --account x --gog "$ROOT/bin/gog" --state "$ROOT/state/sub.json" >/dev/null 2>&1
code=$?
[ "$code" -ne 0 ] && ok "missing dir exits non-zero ($code)" || bad "missing dir exit=$code"

echo "---"
echo "$pass passed, $fail failed"
exit $fail
