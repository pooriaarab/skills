#!/usr/bin/env python3
"""Build the warmup auto-archive Gmail filter query from live warmup configs.

Rule: mail the warm-up program caused -> Skip Inbox + label `warmup`.
Human mail (anything addressed to the Gmail account itself, or from any
other sender) never matches.

The Gmail filter itself is created separately (one-time, via gog or the
Gmail UI) with removeLabelIds=[INBOX] and addLabelIds=[warmup label]; the
query string that file holds is the single source of truth shared by the
filter and inbox-backstop.py. Regenerate after adding warmed domains or
warmup senders, then update the filter to match.

Usage:
  build-filter-query.py --config-dir <config root> --account <seed gmail>
      --out <query file>
"""
import argparse
import glob
import json
import os

# Signup-service keywords mirror the signup-sweep janitor (same match set the
# sweeps already trash after an hour) plus observed non-adapter senders.
SERVICE_WORDS = (
    "here.now cosmicjs.com agentmail inkbox recoupable cloudinary tinysend "
    "clawdmail chronary agentboxd mailboxkit agentpub generalcompute didit "
    "whisper npmjs allmcps glama formsubmit substack blogtrottr "
    "alerts-noreply"
).split()

# Announce-list sender domains, from subscribe-sweep.mjs LISTS (minus
# googlegroups, which is scoped by group name below instead).
LIST_DOMAINS = (
    "lists.sr.ht gnu.org lists.debian.org apache.org python.org gcc.gnu.org "
    "lists.postgresql.org freebsd.org lists.fedoraproject.org lists.ubuntu.com "
    "lists.gentoo.org lists.samba.org nginx.org lists.php.net perl.org "
    "httpd.apache.org lists.mariadb.org haskell.org kde.org lists.x.org "
    "lists.freedesktop.org openstreetmap.org lists.osgeo.org postfix.org "
    "documentfoundation.org lists.openstack.org openldap.org ceph.io dovecot.org "
    "lists.riscv.org lists.spdx.org lists.openchainproject.org sourceware.org "
    "cygwin.com"
).split()

GROUPS = (
    "golang-announce kubernetes-announce django-announce ansible-announce "
    "prometheus-announce flutter-announce jenkinsci-advisories nodejs-sec"
).split()


def build(config_dir, account):
    doms = set()
    # Recursive: fleet layouts keep per-domain files in domains/ plus apex
    # configs (e.g. imecore.warmup.json) beside it. All identities count.
    files = glob.glob(os.path.join(config_dir, "**", "*.warmup.json"), recursive=True)
    for f in files:
        cfg = json.load(open(f))
        for i in cfg.get("identities", []):
            a = i.get("address", "")
            if "@" in a:
                doms.add(a.split("@")[1].lower())
    if not doms:
        raise SystemExit(f"no warmed identities found under {config_dir}")
    # Gmail ignores dots in the local part: both spellings name the same box.
    # Strip dots from the local part only — the domain's dots must survive.
    local, _, domain = account.partition("@")
    bare = local.replace(".", "") + ("@" + domain if domain else "")
    guard = account if bare == account else f"{account} {bare}"
    return (
        f"-to:{{{guard}}} ("
        f"to:{{{ ' '.join(sorted(doms)) }}} {{{ ' '.join(SERVICE_WORDS) }}}"
        f" OR from:{{{ ' '.join(LIST_DOMAINS) }}}"
        f" OR from:{{{ ' '.join(GROUPS) }}}"
        f")"
    )


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--config-dir", required=True)
    ap.add_argument("--account", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    q = build(args.config_dir, args.account)
    with open(args.out, "w") as f:
        f.write(q)
    print(f"query chars: {len(q)}")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
