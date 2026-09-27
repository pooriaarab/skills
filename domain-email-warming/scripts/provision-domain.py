#!/usr/bin/env python3
"""Provision inbound mail for a warm-up domain on Cloudflare.

Sending registration and receiving are separate halves: registering a domain
for Email Sending writes cf-bounce.* return-path records but creates NO apex
MX and NO routing rule, so the domain can send but cannot receive a reply.
This script adds the second half.

Per domain it ensures, idempotently:
  1. Email Sending registration for the apex and mail./news./go. subdomains
  2. The DNS records Cloudflare asks for per sending name (MX, SPF, DKIM, DMARC)
  3. Apex MX -> route{1,2,3}.mx.cloudflare.net and apex SPF (Email Routing)
  4. Literal routing rules for every warm-up mailbox -> the inbound Worker,
     plus a catch-all so role addresses and bounce traffic land too

Requires CLOUDFLARE_API_TOKEN. Zone IDs are resolved, never hardcoded.

Usage:
    python3 provision-domain.py discence.com crediteris.com [more...]
    python3 provision-domain.py --worker my-inbound-worker example.com
"""
import json, os, sys, time, urllib.request

TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")
if not TOKEN:
    sys.exit("CLOUDFLARE_API_TOKEN is required")

API = "https://api.cloudflare.com/client/v4"
WORKER = "pooriaarab-email-production"

SUBDOMAIN_PREFIXES = ["mail", "news", "go"]

# Localparts that get a literal routing rule: the warm-up identity set plus
# the role addresses receivers and verifiers probe for.
LOCALPARTS = [
    "pooria", "bahar", "hello", "team", "desk", "info", "contact", "support",
    "notes", "hi", "legal", "privacy", "billing", "accounts", "sales",
    "careers", "press", "partners", "help", "admin",
    "postmaster", "abuse", "security", "hostmaster", "webmaster",
    "no-reply", "noreply", "dmarc", "bounces",
]

def cf(path, method="GET", body=None):
    req = urllib.request.Request(
        f"{API}{path}", method=method,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        data=json.dumps(body).encode() if body is not None else None,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        # The real error envelope carries the code we need (e.g. 890190 for
        # "zone managed by Email Routing"); keep it instead of the HTTP status.
        try:
            return json.loads(e.read())
        except Exception:
            return {"success": False, "errors": [{"code": e.code, "message": f"HTTP {e.code}"}]}

def ok(res, what):
    if res.get("success"):
        return True
    # 890190: "zone is managed by Email Routing" - Cloudflare owns the MX
    # records it auto-created, so a refused write is already the desired state.
    if any(e.get("code") == 890190 for e in res.get("errors") or []):
        return True
    print(f"    FAIL {what}: {res.get('errors')}")
    return False

def existing_dns(zid):
    recs, page = [], 1
    while True:
        res = cf(f"/zones/{zid}/dns_records?per_page=100&page={page}")
        recs += res.get("result") or []
        info = res.get("result_info") or {}
        if page >= (info.get("total_pages") or 1):
            return recs
        page += 1

def norm(content):
    # The required-DNS endpoint returns MX targets with a trailing dot and TXT
    # bodies wrapped in quotes; the stored record has neither. Compare the
    # normalized form or every rerun looks missing.
    return content.strip('"').rstrip(".").lower()

def add_dns(zid, recs, rtype, name, content, priority=None):
    if any(r["type"] == rtype and r["name"] == name and norm(r["content"]) == norm(content) for r in recs):
        return
    body = {"type": rtype, "name": name, "content": content, "ttl": 1}
    if priority is not None:
        body["priority"] = priority
    res = cf(f"/zones/{zid}/dns_records", "POST", body)
    if ok(res, f"DNS {rtype} {name}"):
        recs.append({"type": rtype, "name": name, "content": content})
        print(f"    + {rtype} {name} -> {content[:60]}")

def provision(apex, zid, worker):
    print(f"\n===== {apex}")

    recs = existing_dns(zid)

    # A domain whose real mail already lands elsewhere must not be touched:
    # adding Cloudflare MX beside the incumbent set diverts that mail, and
    # sending registration rewrites _dmarc to p=reject, which can start
    # rejecting the incumbent provider's unaligned mail.
    foreign_mx = [r["content"] for r in recs if r["type"] == "MX" and r["name"] == apex
                  and "mx.cloudflare.net" not in r["content"]]
    # Snapshot _dmarc for every name registration will touch, before it does.
    dmarc_before = {r["name"]: r["content"] for r in recs
                    if r["type"] == "TXT" and r["name"].startswith("_dmarc.")}

    # 1. Register sending names (apex + subdomains).
    subs = cf(f"/zones/{zid}/email/sending/subdomains?per_page=100").get("result") or []
    by_name = {s["name"]: s for s in subs}
    send_names = [apex] + [f"{p}.{apex}" for p in SUBDOMAIN_PREFIXES]
    for name in send_names:
        if name not in by_name:
            res = cf(f"/zones/{zid}/email/sending/subdomains", "POST", {"name": name})
            if ok(res, f"register {name}"):
                by_name[name] = res["result"]
                print(f"    + registered sending domain {name}")
                time.sleep(0.5)

    # Restore any _dmarc registration overwrote. Only a name that HAD one gets
    # its record back; a fresh p=reject on a previously unprotected name is the
    # intended end state and stays.
    for name, content in dmarc_before.items():
        cur = cf(f"/zones/{zid}/dns_records?type=TXT&name={name}").get("result") or []
        if not any(r["content"] == content for r in cur):
            for r in cur:
                cf(f"/zones/{zid}/dns_records/{r['id']}", "PUT", {"type": "TXT", "name": name, "content": content, "ttl": 1})
            print(f"    ~ restored {name} (registration had overwritten it)")

    # 2. DNS per sending name. Records are fetched AFTER registration because
    #    Cloudflare writes the cf-bounce MX set itself during step 1; a
    #    snapshot from before registration would not see them and the write
    #    attempt fails with 890190 on Email Routing managed zones.
    recs = existing_dns(zid)
    for name in send_names:
        sub = by_name.get(name)
        if not sub:
            continue
        res = cf(f"/zones/{zid}/email/sending/subdomains/{sub['id']}/dns")
        for r in res.get("result") or []:
            add_dns(zid, recs, r["type"], r["name"], r["content"].strip('"'), r.get("priority"))

    # 3. Inbound: apex MX + SPF. These make Email Routing accept mail for the
    #    whole zone - without them the domain sends but cannot receive.
    if foreign_mx:
        print(f"    SKIP inbound: apex already has non-Cloudflare MX {foreign_mx} - leaving existing mail flow alone")
        return
    for prio, mx in [(6, "route2.mx.cloudflare.net"), (18, "route1.mx.cloudflare.net"), (91, "route3.mx.cloudflare.net")]:
        add_dns(zid, recs, "MX", apex, mx, prio)
    if not any(r["type"] == "TXT" and r["name"] == apex and "v=spf1" in r["content"] for r in recs):
        add_dns(zid, recs, "TXT", apex, "v=spf1 include:_spf.mx.cloudflare.net ~all")

    # 4. Routing rules -> worker. Literals for known mailboxes, catch-all for
    #    everything else (bounce traffic to cf-bounce.*, role addresses).
    rules = cf(f"/zones/{zid}/email/routing/rules?per_page=100").get("result") or []
    have_lit = {m["value"] for r in rules for m in r.get("matchers", []) if m.get("type") == "literal"}
    have_all = any(m.get("type") == "all" for r in rules for m in r.get("matchers", []))
    for lp in LOCALPARTS:
        addr = f"{lp}@{apex}"
        if addr in have_lit:
            continue
        res = cf(f"/zones/{zid}/email/routing/rules", "POST", {
            "name": lp, "enabled": True,
            "matchers": [{"type": "literal", "field": "to", "value": addr}],
            "actions": [{"type": "worker", "value": [worker]}],
        })
        if ok(res, f"rule {addr}"):
            print(f"    + rule {addr} -> {worker}")
    if not have_all:
        res = cf(f"/zones/{zid}/email/routing/rules", "POST", {
            "name": "catch-all to admin inbox", "enabled": True,
            "matchers": [{"type": "all"}],
            "actions": [{"type": "worker", "value": [worker]}],
        })
        if ok(res, "catch-all"):
            print(f"    + catch-all -> {worker}")

def main():
    args = sys.argv[1:]
    worker = WORKER
    if args[:1] == ["--worker"]:
        worker = args[1]
        args = args[2:]
    if not args:
        sys.exit(__doc__)
    for apex in args:
        zones = cf(f"/zones?name={apex}").get("result") or []
        if not zones:
            print(f"\n===== {apex}\n    FAIL no matching zone on this account")
            continue
        provision(apex, zones[0]["id"], worker)

if __name__ == "__main__":
    main()
