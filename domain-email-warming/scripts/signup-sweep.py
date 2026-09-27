#!/usr/bin/env python3
# Sign every warm-up mailbox up for third-party CLI/API services so its inbox
# receives real external mail: verification codes, welcome notes, and the
# ongoing notifications those services send after signup.
#
# WHY THIS EXISTS
# Warm-up mail sent only to our own seed mailboxes produces a closed loop —
# every sender and receiver is us. Filters notice. Third-party signups make
# strangers send mail to the domain, which is the strongest legitimate inbound
# a fresh domain can get. The catch: signup needs an OTP read from the inbox
# inside a ~15 minute window, and doing that by hand loses codes to expiry and
# leaves no audit trail. This sweep runs the loop unattended.
#
#   signup-sweep --once      one pass: request codes, verify what arrived
#   signup-sweep --daemon    loop passes until every mailbox is terminal
#
# Mailboxes come from the warm-up configs (identities[].address). Each mailbox
# signs up for every service, so inbound senders vary per mailbox.
# State keys are "<email>|<service>" and live in SWEEP_STATE as JSON, surviving
# restarts; credentials land in SWEEP_CRED_DIR (0700/0600), never in a repo.
# Verification codes are never written to state or logs.
#
# Services throttle. Each adapter declares the seconds between code requests
# and a cap on codes in flight; a 429 or equivalent answer backs that
# service's next attempt off by the server's own hint when one is given.
#
# Env (injectable so tests never touch the network):
#   SWEEP_CONFIG_DIR  warmup domain configs  (~/.local/share/domain-email-warming/config/domains)
#   SWEEP_STATE       state JSON             (~/.local/state/domain-email-warming/signups.json)
#   SWEEP_LOG         audit JSONL            (~/.local/state/domain-email-warming/signups.jsonl)
#   SWEEP_CRED_DIR    credential store       (~/.local/state/domain-email-warming/credentials)
#   SWEEP_ACCOUNT     gog gmail account      (pooria.arab@gmail.com)
#   SWEEP_CURL        curl binary            (curl)
#   SWEEP_GOG         gog binary             (gog)
#   SWEEP_COSMIC      cosmic CLI binary      (cosmic)
#   SWEEP_TICK        daemon seconds/pass    (60)
#
# Exit 0  pass completed (daemon: all mailboxes terminal)
# Exit 1  config dir missing or unreadable
# Exit 2  usage error
import hashlib, json, os, random, re, subprocess, sys, time
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
CONFIG_DIR = Path(os.environ.get("SWEEP_CONFIG_DIR", HOME / ".local/share/domain-email-warming/config/domains"))
STATE_PATH = Path(os.environ.get("SWEEP_STATE", HOME / ".local/state/domain-email-warming/signups.json"))
LOG_PATH = Path(os.environ.get("SWEEP_LOG", HOME / ".local/state/domain-email-warming/signups.jsonl"))
CRED_DIR = Path(os.environ.get("SWEEP_CRED_DIR", HOME / ".local/state/domain-email-warming/credentials"))
ACCOUNT = os.environ.get("SWEEP_ACCOUNT", "pooria.arab@gmail.com")
CURL = os.environ.get("SWEEP_CURL", "curl")
GOG = os.environ.get("SWEEP_GOG", "gog")
COSMIC = os.environ.get("SWEEP_COSMIC", "cosmic")
TICK = int(os.environ.get("SWEEP_TICK", "45"))

OTP_TTL = 14 * 60        # codes older than this are retried, not verified
MAX_ATTEMPTS = 5

def now():
    return time.time()

def ts():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def run(argv, stdin=None):
    try:
        p = subprocess.run(argv, input=stdin, capture_output=True, text=True, timeout=60)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except (FileNotFoundError, subprocess.TimeoutExpired) as e:
        return 127, str(e)

def log(service, mailbox, ok, detail):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_PATH, "a") as f:
        f.write(json.dumps({"t": ts(), "service": service, "mailbox": mailbox,
                            "ok": ok, "detail": detail[:200]}) + "\n")

def store_cred(service, mailbox, secret):
    if not secret:
        return
    d = CRED_DIR / service
    d.mkdir(parents=True, exist_ok=True)
    os.chmod(CRED_DIR, 0o700)
    os.chmod(d, 0o700)
    p = d / mailbox.replace("@", "_")
    p.write_text(secret)
    os.chmod(p, 0o600)

def load_state():
    state = {"pairs": {}, "services": {}}
    if STATE_PATH.exists():
        state = json.loads(STATE_PATH.read_text())
    # Migrate pre-multi-service keys ("email") to "<email>|<service>".
    pairs = {}
    for k, v in state.get("pairs", {}).items():
        key = k if "|" in k else f"{k}|{v.get('service', '?')}"
        pairs[key] = v
    state["pairs"] = pairs
    return state

def save_state(state):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = STATE_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=1))
    # Pending API keys ride inside pairs until verification completes.
    os.chmod(tmp, 0o600)
    os.replace(tmp, STATE_PATH)

def mailboxes():
    out = []
    for f in sorted(CONFIG_DIR.glob("*.warmup.json")):
        cfg = json.loads(f.read_text())
        for i in cfg.get("identities", []):
            if i.get("address"):
                out.append(i["address"])
    return out

def strip_preamble(out):
    # gog prints "Using keyring backend: ..." before the JSON payload.
    i = out.find("{")
    return out[i:] if i >= 0 else out

def gmail_search(query):
    rc, out = run([GOG, "-a", ACCOUNT, "gmail", "messages", "search", query, "--max", "50", "-j"])
    try:
        return json.loads(strip_preamble(out)).get("messages", [])
    except (json.JSONDecodeError, AttributeError):
        return []

def gmail_body(mid):
    rc, out = run([GOG, "-a", ACCOUNT, "gmail", "get", mid, "--format", "full"])
    return out

def curl_json(method, url, payload, headers=()):
    # Auth headers go through --config stdin so bearer keys never appear in
    # argv (and therefore never in `ps`).
    stdin = None
    argv = [CURL, "-sS", "-X", method, url]
    if headers:
        stdin = "".join(f'header = "{h}"\n' for h in headers)
        stdin += 'header = "content-type: application/json"\n'
        argv += ["--config", "-"]
    else:
        argv += ["-H", "content-type: application/json"]
    if payload is not None:
        argv += ["-d", json.dumps(payload)]
    rc, out = run(argv, stdin=stdin)
    try:
        return rc, json.loads(out)
    except json.JSONDecodeError:
        return rc, {"raw": out[:300]}

def retry_after_seconds(body):
    n = body.get("retry_after") or body.get("retryAfter")
    try:
        return int(n)
    except (TypeError, ValueError):
        return None

def permanent_refusal(detail):
    d = detail.lower()
    return any(w in d for w in ("disposable", "not allowed", "blocked", "blocklist",
                                "already been taken"))

def to_addr(body):
    # gog get dumps headers as "to<TAB>addr"; raw mail uses "To: <addr>";
    # a JSON payload uses "to": "addr". Accept all three.
    for pat in (r"^to\t<?([^\s>]+@[^\s>]+)>?", r"^To:\s*<?([^\s>]+@[^\s>]+)>?",
                r'"to":\s*"([^"]+)"'):
        m = re.search(pat, body, re.M | re.I)
        if m:
            return m.group(1)
    return None

def six_digit(body):
    m = (re.search(r"(?:code|verification|otp|claim)[^0-9]{0,30}(\d{6})", body, re.I)
         or re.search(r"\b(\d{6})\b", body))
    t = to_addr(body)
    return (t, m.group(1)) if m and t else None

# --- adapters ---------------------------------------------------------------
# An adapter needs:
#   request(email, pair)       -> (ok, detail, backoff_or_None, permanent)
#                               may stash pair["cred"] / pair["meta"] for later
#   query()                    -> gmail search that finds this service's mail
#   extract(body)              -> (to_address, code) or None
#   verify(email, code, pair)  -> (ok, detail, credential_or_None)
# `request_only` adapters complete on request success (account made, mail sent).
# Sender cadence comes from `interval`; at most `in_flight` unverified codes.

def herenow_request(email, pair):
    rc, b = curl_json("POST", "https://here.now/api/auth/agent/request-code", {"email": email})
    if b.get("success"):
        return True, "code sent", None, False
    d = b.get("message", b.get("error", f"http {rc}"))
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def herenow_extract(body):
    m = re.search(r"here\.now code:\s*([A-Z0-9]{4}-[A-Z0-9]{4})", body)
    t = to_addr(body)
    return (t, m.group(1)) if m and t else None

def herenow_verify(email, code, pair):
    rc, b = curl_json("POST", "https://here.now/api/auth/agent/verify-code",
                      {"email": email, "code": code})
    if b.get("success") and b.get("apiKey"):
        return True, "verified", b["apiKey"]
    return False, b.get("message", b.get("error", "verify failed")), None

def cosmic_request(email, pair):
    proj = re.sub(r"[^a-z0-9]+", "-", email.split("@")[0])[:24]
    rc, out = run([COSMIC, "agent-signup", "-e", email, "-p", proj,
                   "--prompt-hint", "project inbox"])
    detail = "created" if rc == 0 else out.strip()[:120]
    # A domain-policy refusal will not clear on retry — fail it terminal.
    return rc == 0, detail, None, permanent_refusal(out)

def cosmic_extract(body):
    m = re.search(r"claim code is\s*([0-9]{6})", body)
    t = to_addr(body)
    return (t, m.group(1)) if m and t else None

def cosmic_verify(email, code, pair):
    rc, out = run([COSMIC, "agent-verify", code])
    return rc == 0, out.strip()[:120], None

def agentmail_request(email, pair):
    # Username = sanitized mailbox so the issued inbox reads predictably.
    user = re.sub(r"[^a-z0-9-]", "-", email.replace("@", "-").lower())[:40]
    rc, b = curl_json("POST", "https://api.agentmail.to/v0/agent/sign-up",
                      {"human_email": email, "username": user, "source": "signup-sweep"})
    if b.get("api_key"):
        pair["cred"] = b["api_key"]
        pair["meta"] = {"inbox": b.get("inbox_id") or b.get("email"),
                        "organization_id": b.get("organization_id")}
        return True, "otp sent", None, False
    d = b.get("message", b.get("error", f"http {rc}"))
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def agentmail_verify(email, code, pair):
    rc, b = curl_json("POST", "https://api.agentmail.to/v0/agent/verify",
                      {"otp_code": code},
                      headers=[f"Authorization: Bearer {pair.get('cred', '')}"])
    if b.get("verified"):
        meta = pair.get("meta") or {}
        cred = pair.get("cred", "") + "\n" + json.dumps(meta)
        return True, "verified", cred
    return False, b.get("message", b.get("error", "verify failed")), None

def inkbox_request(email, pair):
    rc, b = curl_json("POST", "https://inkbox.ai/api/v1/agent-signup/",
                      {"human_email": email, "display_name": "Warmup Agent",
                       "note_to_human": "Please verify this agent inbox.",
                       "harness": "devin"})
    if b.get("api_key"):
        pair["cred"] = b["api_key"]
        pair["meta"] = {"inbox": b.get("email_address"),
                        "agent_handle": b.get("agent_handle"),
                        "organization_id": b.get("organization_id")}
        return True, "otp sent", None, False
    d = b.get("message", b.get("error", json.dumps(b.get("detail", f"http {rc}"))))
    return False, str(d), retry_after_seconds(b), permanent_refusal(str(d))

def inkbox_verify(email, code, pair):
    rc, b = curl_json("POST", "https://inkbox.ai/api/v1/agent-signup/verify",
                      {"verification_code": code},
                      headers=[f"X-API-Key: {pair.get('cred', '')}"])
    ok = bool(b.get("verified") or b.get("claim_status") == "claimed" or b.get("success")
              or "verified successfully" in str(b.get("message", "")).lower())
    if ok:
        meta = pair.get("meta") or {}
        cred = pair.get("cred", "") + "\n" + json.dumps(meta)
        return True, "verified", cred
    return False, str(b.get("message", b.get("error", b.get("detail", "verify failed"))))[:200], None

def recoupable_request(email, pair):
    rc, b = curl_json("POST", "https://api.recoupable.dev/api/agents/signup",
                      {"email": email})
    if b.get("api_key"):
        pair["cred"] = b["api_key"]
        pair["meta"] = {"account_id": b.get("account_id")}
        return True, "key issued", None, False
    if b.get("account_id"):
        pair["meta"] = {"account_id": b.get("account_id")}
        return True, "otp sent", None, False
    d = b.get("message", b.get("error", f"http {rc}"))
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def recoupable_verify(email, code, pair):
    rc, b = curl_json("POST", "https://api.recoupable.dev/api/agents/verify",
                      {"email": email, "code": code})
    if b.get("api_key") or b.get("verified") or b.get("success"):
        cred = b.get("api_key") or pair.get("cred", "")
        meta = pair.get("meta") or {}
        return True, "verified", cred + "\n" + json.dumps(meta)
    return False, str(b.get("message", b.get("error", "verify failed")))[:200], None

def cloudinary_request(email, pair):
    # Returns account creds immediately and mails a verification link; the
    # inbound email is the goal, so request success completes this pair.
    rc, b = curl_json("POST", "https://api.cloudinary.com/v1_1/provisioning/agents/accounts",
                      {"email": email, "agent_framework": "python",
                       "agent_llm_model": "swe-2-max", "agent_goal": "domain-warmup"})
    envs = b.get("product_environments") or []
    if envs and envs[0].get("api_environment_variable"):
        pair["cred"] = envs[0]["api_environment_variable"]
        pair["meta"] = {"external_id": b.get("external_id"), "plan": b.get("plan_name")}
        return True, "account provisioned", None, False
    d = b.get("error", {}).get("message", f"http {rc}") if isinstance(b.get("error"), dict) else b.get("error", f"http {rc}")
    return False, d, retry_after_seconds(b), permanent_refusal(str(d))

def tinysend_request(email, pair):
    rc, b = curl_json("POST", "https://id.tinysend.com/agent/auth", {"type": "anonymous"})
    tok = (b.get("data") or {}).get("claim_token")
    if not tok:
        return False, str(b.get("error", b))[:200], None, False
    pair["cred"] = (b["data"].get("credential") or "")
    pair["meta"] = {"claim_token": tok, "user_id": b["data"].get("user_id")}
    rc, b = curl_json("POST", "https://id.tinysend.com/agent/auth/claim",
                      {"claim_token": tok, "email": email, "link": False})
    if (b.get("data") or {}).get("verification_required"):
        return True, "otp sent", None, False
    d = str(b.get("error", b))[:200]
    return False, d, None, permanent_refusal(d)

def tinysend_verify(email, code, pair):
    rc, b = curl_json("POST", "https://id.tinysend.com/agent/auth/claim/complete",
                      {"claim_token": (pair.get("meta") or {}).get("claim_token", ""),
                       "otp": code})
    cred = (b.get("data") or {}).get("credential") or pair.get("cred", "")
    if b.get("ok") and cred:
        return True, "verified", cred + "\n" + json.dumps(pair.get("meta") or {})
    return False, str(b.get("error", b))[:200], None

def clawdmail_request(email, pair):
    # Anonymous register issues an inbox + key; the agent then sends one mail
    # to its own human — the inbound copy is the whole point here.
    handle = re.sub(r"[^a-z0-9-]", "-", email.split("@")[0].lower())[:30] + "-" + f"{abs(hash(email)) % 9999:04d}"
    rc, b = curl_json("POST", "https://app.clawdmail.ai/api/v1/agents/register",
                      {"handle": handle, "displayName": "Warmup Agent"})
    if not b.get("apiKey") or not b.get("agentId"):
        d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
        return False, d, None, permanent_refusal(d)
    pair["cred"] = b["apiKey"]
    pair["meta"] = {"agentId": b["agentId"], "inbox": b.get("email")}
    rc, b = curl_json("POST", f"https://app.clawdmail.ai/api/v1/agents/{b['agentId']}/send",
                      {"to": email, "subject": "Warmup check-in",
                       "text": "Confirming this inbox is live for the warm-up program."},
                      headers=[f"Authorization: Bearer {b['apiKey']}"])
    if rc == 0:
        return True, "inbox live, mail sent", None, False
    # Registration still produced the account; count it even if the send failed.
    return True, "registered", None, False

def chronary_tos():
    rc, b = curl_json("GET", "https://api.chronary.ai/v1/auth/terms/current", None)
    return b.get("version") or b.get("tos_version") or "2026-05-11"

def chronary_request(email, pair):
    name = re.sub(r"[^a-z0-9 -]", "-", email.split("@")[0].lower())[:40] or "agent"
    rc, b = curl_json("POST", "https://api.chronary.ai/v1/agent/sign-up",
                      {"email": email, "agent_name": name.strip(),
                       "tos_version": chronary_tos()})
    if b.get("api_key"):
        pair["cred"] = b["api_key"]
        pair["meta"] = {"org_id": b.get("org_id"), "agent_id": b.get("agent_id")}
        return True, "otp sent", None, False
    d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
    if isinstance(b.get("error"), dict):
        d = str(b["error"].get("message", b["error"]))[:200]
    # A resend withholds the key; without it verify is impossible — terminal.
    permanent = permanent_refusal(d) or "verification code sent" in d.lower()
    return False, d, retry_after_seconds(b), permanent

def chronary_verify(email, code, pair):
    rc, b = curl_json("POST", "https://api.chronary.ai/v1/agent/verify",
                      {"otp": code},
                      headers=[f"Authorization: Bearer {pair.get('cred', '')}"])
    if b.get("verified") or b.get("ok") or "verif" in str(b.get("message", "")).lower():
        return True, "verified", pair.get("cred", "") + "\n" + json.dumps(pair.get("meta") or {})
    return False, str(b.get("error", b.get("message", "verify failed")))[:200], None

def agentboxd_request(email, pair):
    # Proof-of-work signup, then the claim endpoint emails the human.
    rc, c = curl_json("GET", "https://api.agentboxd.com/v1/signup/challenge", None)
    chal, diff = c.get("challenge"), int(c.get("difficulty") or 0)
    if not chal or not diff:
        return False, str(c)[:200], None, False
    sol = 0
    while True:
        h = hashlib.sha256(f"{chal}:{sol}".encode()).digest()
        if int.from_bytes(h, "big") >> (256 - diff) == 0:
            break
        sol += 1
    name = re.sub(r"[^a-z0-9-]", "-", email.split("@")[0].lower())[:40]
    rc, b = curl_json("POST", "https://api.agentboxd.com/v1/signup",
                      {"challenge": chal, "solution": str(sol), "agent_name": name,
                       "owner_email": email, "kind": "mailbox"})
    if not b.get("api_key"):
        d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
        return False, d, None, permanent_refusal(d)
    pair["cred"] = b["api_key"]
    pair["meta"] = {"workspace": (b.get("workspace") or {}).get("id"),
                    "inbox": (b.get("inbox") or {}).get("address")}
    rc, c = curl_json("POST", "https://api.agentboxd.com/v1/signup/claim",
                      {"email": email},
                      headers=[f"Authorization: Bearer {b['api_key']}"])
    return True, "claim email sent", None, False

def mailboxkit_request(email, pair):
    name = re.sub(r"[^a-z0-9 -]", "-", email.split("@")[0].lower())[:40] or "agent"
    rc, b = curl_json("POST", "https://mailboxkit.com/api/v1/register",
                      {"name": name.strip(), "owner_email": email})
    if b.get("api_key"):
        pair["cred"] = b["api_key"]
        pair["meta"] = {"inbox": b.get("email"), "inbox_id": b.get("inbox_id")}
        return True, "verification email sent", None, False
    d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def agentpub_request(email, pair):
    rc, b = curl_json("POST", "https://agentpub.io/api/auth/agent/request-code",
                      {"email": email})
    if b.get("ok") or b.get("success"):
        return True, "code sent", None, False
    d = str(b.get("message", b.get("error", f"http {rc}")))[:200]
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def agentpub_extract(body):
    m = re.search(r"\b([A-Z]{4}-[0-9]{4})\b", body)
    t = to_addr(body)
    return (t, m.group(1)) if m and t else None

def agentpub_verify(email, code, pair):
    rc, b = curl_json("POST", "https://agentpub.io/api/auth/agent/verify-code",
                      {"email": email, "code": code})
    if b.get("apiKey"):
        return True, "verified", b["apiKey"]
    return False, str(b.get("message", b.get("error", "verify failed")))[:200], None

def generalcompute_request(email, pair):
    rc, b = curl_json("POST", "https://api.generalcompute.com/v1/public/agent-signups",
                      {"email": email})
    if b.get("signupId"):
        pair["meta"] = {"signupId": b["signupId"]}
        return True, "otp sent", None, False
    d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
    if isinstance(b.get("error"), dict):
        d = str(b["error"].get("message", b["error"]))[:200]
    # A pending signup resends nothing we can verify against (no signupId).
    permanent = permanent_refusal(d) or "already pending" in d.lower()
    return False, d, retry_after_seconds(b), permanent

def generalcompute_verify(email, code, pair):
    sid = (pair.get("meta") or {}).get("signupId", "")
    rc, b = curl_json("POST", f"https://api.generalcompute.com/v1/public/agent-signups/{sid}/verify",
                      {"code": code})
    if b.get("apiKey"):
        return True, "verified", b["apiKey"]
    return False, str(b.get("error", b.get("message", "verify failed")))[:200], None

def didit_request(email, pair):
    pw = hashlib.sha256(f"{email}:{time.time()}".encode()).hexdigest()[:16] + "Aa1!"
    pair["meta"] = {"password": pw}
    rc, b = curl_json("POST", "https://apx.didit.me/auth/v2/programmatic/register/",
                      {"email": email, "password": pw, "name": "Warmup Agent"})
    msg = str(b.get("message", "")).lower()
    if "verification" in msg or "successful" in msg or "code" in msg:
        return True, "code sent", None, False
    d = str(b.get("error", b.get("message", f"http {rc}")))[:200]
    return False, d, retry_after_seconds(b), permanent_refusal(d)

def didit_extract(body):
    m = re.search(r"\b([A-Z0-9]{6})\b", body)
    t = to_addr(body)
    return (t, m.group(1)) if m and t else None

def didit_verify(email, code, pair):
    rc, b = curl_json("POST", "https://apx.didit.me/auth/v2/programmatic/verify-email/",
                      {"email": email, "code": code})
    cred = b.get("api_key") or b.get("apiKey")
    if cred:
        pw = (pair.get("meta") or {}).get("password", "")
        return True, "verified", cred + "\n" + json.dumps({"password": pw})
    return False, str(b.get("error", b.get("message", "verify failed")))[:200], None

ADAPTERS = [
    # OTP mail is routine spam-foldered; every query must use in:anywhere.
    {"name": "herenow", "interval": 20, "in_flight": 8,
     "request": herenow_request, "query": lambda: "in:anywhere from:here.now newer_than:20m",
     "extract": herenow_extract, "verify": herenow_verify},
    {"name": "cosmic", "interval": 65, "in_flight": 4,
     "request": cosmic_request, "query": lambda: "in:anywhere from:cosmicjs.com newer_than:20m",
     "extract": cosmic_extract, "verify": cosmic_verify},
    {"name": "agentmail", "interval": 20, "in_flight": 8,
     "request": agentmail_request, "query": lambda: "in:anywhere agentmail newer_than:20m",
     "extract": six_digit, "verify": agentmail_verify},
    {"name": "inkbox", "interval": 20, "in_flight": 8,
     "request": inkbox_request, "query": lambda: "in:anywhere inkbox newer_than:20m",
     "extract": six_digit, "verify": inkbox_verify},
    {"name": "recoupable", "interval": 20, "in_flight": 8,
     "request": recoupable_request, "query": lambda: "in:anywhere recoupable newer_than:20m",
     "extract": six_digit, "verify": recoupable_verify},
    {"name": "cloudinary", "interval": 30, "in_flight": 4, "request_only": True,
     "request": cloudinary_request, "query": lambda: "", "extract": None, "verify": None},
    {"name": "tinysend", "interval": 20, "in_flight": 8,
     "request": tinysend_request, "query": lambda: "in:anywhere tinysend newer_than:20m",
     "extract": six_digit, "verify": tinysend_verify},
    {"name": "clawdmail", "interval": 20, "in_flight": 4, "request_only": True,
     "request": clawdmail_request, "query": lambda: "", "extract": None, "verify": None},
    {"name": "chronary", "interval": 20, "in_flight": 8,
     "request": chronary_request, "query": lambda: "in:anywhere chronary newer_than:20m",
     "extract": six_digit, "verify": chronary_verify},
    {"name": "agentboxd", "interval": 30, "in_flight": 4, "request_only": True,
     "request": agentboxd_request, "query": lambda: "", "extract": None, "verify": None},
    {"name": "mailboxkit", "interval": 20, "in_flight": 4, "request_only": True,
     "request": mailboxkit_request, "query": lambda: "", "extract": None, "verify": None},
    {"name": "agentpub", "interval": 20, "in_flight": 8,
     "request": agentpub_request, "query": lambda: "in:anywhere agentpub newer_than:20m",
     "extract": agentpub_extract, "verify": agentpub_verify},
    {"name": "generalcompute", "interval": 20, "in_flight": 8,
     "request": generalcompute_request, "query": lambda: "in:anywhere generalcompute newer_than:20m",
     "extract": six_digit, "verify": generalcompute_verify},
    {"name": "didit", "interval": 20, "in_flight": 8,
     "request": didit_request, "query": lambda: "in:anywhere didit newer_than:20m",
     "extract": didit_extract, "verify": didit_verify},
]

def service_names(email):
    # Every mailbox signs up for every service: more distinct legitimate
    # senders per mailbox is the point of the sweep.
    return [a["name"] for a in ADAPTERS]

# --- sweep ------------------------------------------------------------------

def tick(state):
    pairs, svcs = state["pairs"], state["services"]
    t = now()

    # 1. Verify pending codes against fresh OTP mail, one search per service.
    for ad in ADAPTERS:
        if ad.get("request_only"):
            continue
        # Poll almost immediately: inbox scanners click one-time claim links,
        # so a code left sitting loses the race before we ever try it.
        pend = [k for k, s in pairs.items()
                if s["service"] == ad["name"] and s["status"] == "requested"
                and s["sent_at"] + 8 < t]
        if not pend:
            continue
        # Fetching every OTP mail's body is slow (one gog call each), so skip
        # messages whose subject clearly belongs to no pending mailbox: Cosmic
        # subjects embed the project slug (the sanitized localpart).
        locals_ = {re.sub(r"[^a-z0-9]+", "-", k.split("|")[0].split("@")[0].lower())[:24]
                   for k in pend}
        hits = {}
        for msg in gmail_search(ad["query"]()):
            subj = (msg.get("subject") or "").lower()
            if ad["name"] == "cosmic":
                slugs = re.findall(r'"([^"]+)"', subj)
                if slugs and not any(s in locals_ for s in slugs):
                    continue
            mid = msg.get("id") or msg.get("messageId")
            if not mid:
                continue
            got = ad["extract"](gmail_body(mid))
            # Search returns newest first; a mailbox can hold several codes,
            # so keep the first (freshest) hit, never overwrite with older.
            if got and got[0].lower() not in hits:
                hits[got[0].lower()] = got[1]
        for k in pend:
            e = k.split("|")[0]
            code = hits.get(e.lower())
            if not code:
                continue
            ok, detail, cred = ad["verify"](e, code, pairs[k])
            pairs[k]["status"] = "verified" if ok else "retry"
            pairs[k]["next_at"] = 0 if ok else t + 300
            pairs[k]["attempts"] += 1
            if ok:
                store_cred(ad["name"], e, cred or pairs[k].get("cred", ""))
            log(ad["name"], e, ok, detail)

    # 2. Expire stale codes back to retry.
    for k, s in pairs.items():
        if s["status"] == "requested" and s["sent_at"] + OTP_TTL < t:
            s["status"] = "retry" if s["attempts"] < MAX_ATTEMPTS else "failed"
            s["next_at"] = t + 60
            log(s["service"], k.split("|")[0], False, "otp expired")

    # 3. Request fresh codes within each service's pace and in-flight cap.
    for k, s in pairs.items():
        if s["status"] not in ("new", "retry") or s.get("next_at", 0) > t:
            continue
        if s["attempts"] >= MAX_ATTEMPTS:
            s["status"] = "failed"
            continue
        ad = next(a for a in ADAPTERS if a["name"] == s["service"])
        svc = svcs.setdefault(ad["name"], {"last_at": 0})
        if t - svc["last_at"] < ad["interval"]:
            continue
        flying = sum(1 for x in pairs.values()
                     if x["service"] == ad["name"] and x["status"] == "requested")
        if flying >= ad["in_flight"]:
            continue
        e = k.split("|")[0]
        ok, detail, backoff, permanent = ad["request"](e, s)
        svc["last_at"] = t
        if ok and ad.get("request_only"):
            s["status"] = "verified"
            store_cred(ad["name"], e, s.get("cred", ""))
        elif ok:
            s.update(status="requested", sent_at=t, attempts=s["attempts"] + 1)
        elif permanent:
            s["status"] = "failed"
        else:
            s["next_at"] = t + (backoff or ad["interval"] * 3)
        log(ad["name"], e, ok, f"request: {detail}")

def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--once", "--daemon"):
        print(__doc__.splitlines()[14].strip() if __doc__ else "usage: signup-sweep --once|--daemon")
        return 2
    if not CONFIG_DIR.is_dir():
        print(f"config dir missing: {CONFIG_DIR}", file=sys.stderr)
        return 1

    state = load_state()
    boxes = mailboxes()
    want = set(service_names(""))
    for e in boxes:
        # Pairs for removed services get dropped only if they never made a
        # request; in-flight and finished work always survives.
        ks = {k: s for k, s in state["pairs"].items() if k.split("|")[0] == e}
        for k, s in ks.items():
            if s["service"] not in want and s["status"] == "new":
                del state["pairs"][k]
        have = {s["service"] for k, s in ks.items() if k in state["pairs"]}
        for name in service_names(e):
            if name in have:
                continue
            state["pairs"][f"{e}|{name}"] = {"service": name, "status": "new",
                                             "attempts": 0, "sent_at": 0, "next_at": 0}
            have.add(name)
    save_state(state)

    daemon = sys.argv[1] == "--daemon"
    while True:
        state = load_state()
        tick(state)
        save_state(state)
        done = sum(1 for s in state["pairs"].values() if s["status"] == "verified")
        pend = sum(1 for s in state["pairs"].values() if s["status"] in ("new", "requested", "retry"))
        fail = sum(1 for s in state["pairs"].values() if s["status"] == "failed")
        print(f"{ts()} verified={done} pending={pend} failed={fail} of {len(state['pairs'])}", flush=True)
        if not daemon or pend == 0:
            return 0
        time.sleep(TICK + random.uniform(0, 8))

if __name__ == "__main__":
    sys.exit(main())
