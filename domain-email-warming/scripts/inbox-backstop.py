#!/usr/bin/env python3
"""Re-apply the warmup filter rule to mail that slipped through to the inbox.

Gmail sometimes skips filter application on a delivery (observed 2026-10-10:
one of five identical Agentboxd mails kept its INBOX label while its siblings
filtered fine). This job searches the exact filter query scoped to the inbox
and archives matches with the warmup label. Small and quiet: a couple of
searches plus one modify per match, no deletes, fully reversible (re-add
INBOX, remove the label).

The query comes from build-filter-query.py's output file so the rule text
has exactly one source of truth.

Usage:
  inbox-backstop.py --account <seed gmail> [--query-file <path>]
      [--label <name>] [--max N] [--rounds N] [--dry-run]
"""
import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

DEFAULT_QUERY_FILE = os.path.expanduser(
    "~/.local/share/domain-email-warming/config/warmup-filter-query.txt"
)


def gog(account, *args):
    p = subprocess.run(
        ["gog", "-a", account, "gmail", *args],
        capture_output=True, text=True, timeout=120,
    )
    return p.returncode, ((p.stdout or "") + (p.stderr or ""))


def search_ids(account, query, limit):
    rc, out = gog(account, "messages", "search", "--max", str(limit),
                  "-j", "--", query)
    if "rateLimitExceeded" in out or "Quota exceeded" in out:
        return None
    i = out.find("{")
    try:
        d = json.loads(out[i:])
        return [m["id"] for m in d.get("messages", []) if m.get("id")]
    except (json.JSONDecodeError, TypeError, AttributeError):
        print(f"unparseable search output: {out[:150]}", flush=True)
        return []


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--account", required=True)
    ap.add_argument("--query-file", default=DEFAULT_QUERY_FILE)
    ap.add_argument("--label", default="warmup")
    ap.add_argument("--max", type=int, default=100)
    ap.add_argument("--rounds", type=int, default=2)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    try:
        with open(args.query_file) as f:
            query = f.read().strip() + " in:inbox"
    except OSError as e:
        print(f"cannot read query file: {e}", file=sys.stderr)
        return 1
    total = 0
    for _ in range(args.rounds):
        ids = search_ids(args.account, query, args.max)
        if ids is None:
            print("quota hot, try next hour", flush=True)
            return 0
        if not ids:
            break
        if args.dry_run:
            print(f"dry-run, {len(ids)} would archive", flush=True)
            return 0
        rc, out = gog(args.account, "batch", "modify", *ids,
                      "--add", args.label, "--remove", "INBOX", "-y")
        if "rateLimitExceeded" in out or "Quota exceeded" in out:
            print("quota hot on modify, try next hour", flush=True)
            return 0
        if rc != 0:
            print(f"modify failed: {out[:200]}", flush=True)
            return 1
        total += len(ids)
        time.sleep(30)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"{ts} backstop archived={total}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
