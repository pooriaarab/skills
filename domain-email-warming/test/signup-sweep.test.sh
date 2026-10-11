#!/usr/bin/env bash
# Offline tests for signup-sweep. Stubs curl, gog and cosmic; never sends.
set -uo pipefail

fail=0
pass=0
ok() { echo "ok - $1"; pass=$((pass+1)); }
bad() { echo "FAIL - $1"; fail=$((fail+1)); }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$SCRIPT_DIR/../scripts/signup-sweep.py"

ROOT=$(mktemp -d)
trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/bin" "$ROOT/cfg" "$ROOT/state"

# curl answers known service endpoints from SWEEP_FAKE_CURL_MODE and refuses
# anything that looks like a real network call it was not told to fake.
cat > "$ROOT/bin/curl" <<'STUB'
#!/usr/bin/env bash
set -uo pipefail
url=""
for a in "$@"; do case "$a" in http://*|https://*) url="$a" ;; esac; done
case "$url" in
  *request-code*)
    case "${SWEEP_FAKE_CURL_MODE:-ok}" in
      ok)    echo '{"success":true,"requiresCodeEntry":true}' ;;
      limit) echo '{"error":"Too many sign-in code requests.","retry_after":900}' ;;
    esac
    ;;
  *verify-code*)
    case "${SWEEP_FAKE_VERIFY:-ok}" in
      ok)  echo '{"success":true,"apiKey":"test-key-123","isNewUser":true}' ;;
      bad) echo '{"success":false,"message":"invalid code"}' ;;
    esac
    ;;
  *agent/sign-up*)
    echo '{"api_key":"am-test-key","inbox_id":"x@agentmail.to","organization_id":"o1"}'
    ;;
  *agent/verify*)
    echo '{"verified":true}'
    ;;
  *provisioning/agents/accounts*)
    echo '{"external_id":"e1","product_environments":[{"api_environment_variable":"CLOUDINARY_URL=cloudinary://k:s@c"}]}'
    ;;
  *programmatic/register*)
    echo '{"message":"Registration successful. Check your email for the verification code."}'
    ;;
  *programmatic/verify-email*)
    echo '[{"api_key":"didit-key-123"}]'
    ;;
  *api/signup*)
    echo '{"signup_id":"w1"}'
    ;;
  *api/signup/verify*)
    echo '{"api_key":"whisper-key"}'
    ;;
  *formsubmit.co/ajax*)
    case "${SWEEP_FAKE_FORMSUBMIT:-new}" in
      new)    echo '{"success":"false","message":"This form needs Activation. We sent an Activate Form link."}' ;;
      active) echo '{"success":"true","message":"The form was submitted successfully."}' ;;
    esac
    ;;
  *formsubmit.co/confirm*)
    echo '<html>Form Activated! This form is now active.</html>'
    ;;
  *) echo "stub curl: refused url: $url" >&2; exit 9 ;;
esac
STUB

# gog serves a search result list, then a body per SWEEP_FAKE_TO /
# SWEEP_FAKE_BODY. Empty SWEEP_FAKE_BODY means no mail yet.
cat > "$ROOT/bin/gog" <<'STUB'
#!/usr/bin/env bash
set -uo pipefail
args="$*"
case "$args" in
  *"messages search"*)
    if [ -n "${SWEEP_FAKE_BODY:-}" ]; then
      echo '{"messages":[{"id":"m1"}]}'
    else
      echo '{"messages":[]}'
    fi
    ;;
  *"get "*)
    printf 'from\tnoreply@example.com\nto\t%s\n\n%s\n' \
      "${SWEEP_FAKE_TO:-nobody@example.com}" "${SWEEP_FAKE_BODY:-none}"
    ;;
esac
STUB

cat > "$ROOT/bin/cosmic" <<'STUB'
#!/usr/bin/env bash
case "$1" in
  agent-signup) echo "project created" ;;
  agent-verify) echo "Verified" ;;
esac
STUB
chmod +x "$ROOT/bin/"*

cat > "$ROOT/cfg/t.warmup.json" <<'CFG'
{"identities":[{"address":"d@t.example"}]}
CFG

export SWEEP_CONFIG_DIR="$ROOT/cfg" SWEEP_STATE="$ROOT/state/signups.json" \
       SWEEP_LOG="$ROOT/state/signups.jsonl" SWEEP_CRED_DIR="$ROOT/state/creds" \
       SWEEP_ACCOUNT="test@example.com" SWEEP_CURL="$ROOT/bin/curl" \
       SWEEP_GOG="$ROOT/bin/gog" SWEEP_COSMIC="$ROOT/bin/cosmic" SWEEP_TICK=1
export PATH="$ROOT/bin:$PATH"

pair() { python3 -c "import json;print(json.load(open('$SWEEP_STATE'))['pairs']['$1']['$2'])"; }
seed() { python3 -c "import json,os,time;p='$SWEEP_STATE';s=json.load(open(p)) if os.path.exists(p) else {'pairs':{},'services':{}};s['pairs']['$1']=$2;json.dump(s,open(p,'w'))"; }
pace() { python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['services']={};json.dump(s,open('$SWEEP_STATE','w'))"; }

# 1. First pass: a seeded herenow pair gets a code requested.
seed 'd@t.example|herenow' '{"service":"herenow","status":"new","attempts":0,"sent_at":0,"next_at":0}'
SWEEP_FAKE_CURL_MODE=ok python3 "$SCRIPT" --once >/dev/null
st=$(pair 'd@t.example|herenow' status)
[ "$st" = "requested" ] && ok "code requested for d@t.example (herenow)" || bad "first pass status=$st"

# 2. Every mailbox gets a pair for every adapter.
n=$(python3 -c "import json;print(sum(1 for k in json.load(open('$SWEEP_STATE'))['pairs'] if k.startswith('d@t.example|')))")
[ "$n" -ge 10 ] && ok "all services assigned per mailbox ($n)" || bad "assigned $n services"

# 3. Second pass with the OTP in the mailbox: verified, credential stored.
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['d@t.example|herenow']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="d@t.example" SWEEP_FAKE_BODY="Your here.now code: B8XG-EBXF" python3 "$SCRIPT" --once >/dev/null
st=$(pair 'd@t.example|herenow' status)
[ "$st" = "verified" ] && ok "otp verified" || bad "verify status=$st"
[ -f "$ROOT/state/creds/herenow/d_t.example" ] && ok "credential stored" || bad "no credential file"

# 4. Rate-limit response pushes next_at out instead of burning attempts.
seed 'b@t.example|herenow' '{"service":"herenow","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
SWEEP_FAKE_BODY="" SWEEP_FAKE_CURL_MODE=limit python3 "$SCRIPT" --once >/dev/null
nxt=$(python3 -c "import json,time;s=json.load(open('$SWEEP_STATE'));print(int(s['pairs']['b@t.example|herenow']['next_at']-time.time()))")
[ "$nxt" -gt 600 ] && ok "rate-limit backoff honored (${nxt}s)" || bad "next_at only +${nxt}s"

# 5. A code older than the OTP window goes back to retry, not verified.
seed 'c@t.example|herenow' '{"service":"herenow","status":"requested","attempts":1,"sent_at":'$(( $(date +%s) - 900 ))',"next_at":0}'
SWEEP_FAKE_CURL_MODE=ok python3 "$SCRIPT" --once >/dev/null
st=$(pair 'c@t.example|herenow' status)
[ "$st" = "retry" ] && ok "expired code retried" || bad "expiry status=$st"

# 6. agentmail: signup returns a key, OTP verify marks verified.
seed 'a@t.example|agentmail' '{"service":"agentmail","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
python3 "$SCRIPT" --once >/dev/null
st=$(pair 'a@t.example|agentmail' status)
cr=$(python3 -c "import json;print(json.load(open('$SWEEP_STATE'))['pairs']['a@t.example|agentmail'].get('cred',''))")
{ [ "$st" = "requested" ] && [ "$cr" = "am-test-key" ]; } && ok "agentmail signup stores pending key" || bad "agentmail status=$st cred=$cr"
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['a@t.example|agentmail']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="a@t.example" SWEEP_FAKE_BODY="Your AgentMail verification code is 483920." python3 "$SCRIPT" --once >/dev/null
st=$(pair 'a@t.example|agentmail' status)
[ "$st" = "verified" ] && ok "agentmail otp verified" || bad "agentmail verify status=$st"
[ -f "$ROOT/state/creds/agentmail/a_t.example" ] && ok "agentmail credential stored" || bad "no agentmail credential"

# 7. agentpub: LLLL-DDDD code shape extracts and verifies.
seed 'p@t.example|agentpub' '{"service":"agentpub","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
SWEEP_FAKE_CURL_MODE=ok python3 "$SCRIPT" --once >/dev/null
st=$(pair 'p@t.example|agentpub' status)
[ "$st" = "requested" ] && ok "agentpub code requested" || bad "agentpub status=$st"
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['p@t.example|agentpub']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="p@t.example" SWEEP_FAKE_BODY="Your sign-in code is WXYZ-1234." python3 "$SCRIPT" --once >/dev/null
st=$(pair 'p@t.example|agentpub' status)
[ "$st" = "verified" ] && ok "agentpub code verified" || bad "agentpub verify status=$st"

# 8. didit: 6-char alphanumeric code, key returned at verify.
seed 'w@t.example|didit' '{"service":"didit","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
python3 "$SCRIPT" --once >/dev/null
st=$(pair 'w@t.example|didit' status)
[ "$st" = "requested" ] && ok "didit code requested" || bad "didit status=$st"
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['w@t.example|didit']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="w@t.example" SWEEP_FAKE_BODY="Your verification code is A3K9F2." python3 "$SCRIPT" --once >/dev/null
st=$(pair 'w@t.example|didit' status)
[ "$st" = "verified" ] && ok "didit code verified" || bad "didit verify status=$st"
[ -f "$ROOT/state/creds/didit/w_t.example" ] && ok "didit credential stored" || bad "no didit credential"

# 9. cloudinary is request-only: account + creds on first pass, no OTP wait.
seed 'z@t.example|cloudinary' '{"service":"cloudinary","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
SWEEP_FAKE_BODY="" python3 "$SCRIPT" --once >/dev/null
st=$(pair 'z@t.example|cloudinary' status)
[ "$st" = "verified" ] && ok "cloudinary request-only verified" || bad "cloudinary status=$st"
[ -f "$ROOT/state/creds/cloudinary/z_t.example" ] && ok "cloudinary credential stored" || bad "no cloudinary credential"

# 10. formsubmit: activation link extracts and verifies by visit.
seed 'f@t.example|formsubmit' '{"service":"formsubmit","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
SWEEP_FAKE_BODY="" SWEEP_FAKE_FORMSUBMIT=new python3 "$SCRIPT" --once >/dev/null
st=$(pair 'f@t.example|formsubmit' status)
[ "$st" = "requested" ] && ok "formsubmit activation requested" || bad "formsubmit status=$st"
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['f@t.example|formsubmit']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="f@t.example" SWEEP_FAKE_BODY="Click https://formsubmit.co/confirm/abc123def456 to activate." python3 "$SCRIPT" --once >/dev/null
st=$(pair 'f@t.example|formsubmit' status)
[ "$st" = "verified" ] && ok "formsubmit link verified" || bad "formsubmit verify status=$st"
grep -q 'formsubmit.co/ajax/f@t.example' "$ROOT/state/creds/formsubmit/f_t.example" && ok "formsubmit endpoint stored" || bad "no formsubmit credential"

# 11. formsubmit: already-active form verifies on the forward alone.
seed 'g@t.example|formsubmit' '{"service":"formsubmit","status":"new","attempts":0,"sent_at":0,"next_at":0}'
pace
SWEEP_FAKE_BODY="" SWEEP_FAKE_FORMSUBMIT=active python3 "$SCRIPT" --once >/dev/null
st=$(pair 'g@t.example|formsubmit' status)
[ "$st" = "requested" ] && ok "formsubmit active submit requested" || bad "formsubmit active status=$st"
python3 -c "import json;s=json.load(open('$SWEEP_STATE'));s['pairs']['g@t.example|formsubmit']['sent_at']-=60;json.dump(s,open('$SWEEP_STATE','w'))"
SWEEP_FAKE_TO="g@t.example" SWEEP_FAKE_BODY="FormSubmit forward: warmup check-in" python3 "$SCRIPT" --once >/dev/null
st=$(pair 'g@t.example|formsubmit' status)
[ "$st" = "verified" ] && ok "formsubmit forward verified" || bad "formsubmit forward status=$st"

# 12. Missing config dir exits 1.
SWEEP_CONFIG_DIR="$ROOT/nope" python3 "$SCRIPT" --once >/dev/null 2>&1
[ $? -eq 1 ] && ok "missing config dir exits 1" || bad "missing config dir exit=$?"

echo "---"
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
