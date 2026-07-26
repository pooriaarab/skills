---
name: cloudflare-domain-launch
description: "Buy a domain and host a static site on it entirely from the CLI/API: Cloudflare Registrar domain-check + registration, wrangler pages project/deploy, custom-domain attachment, and the DNS/cert gotchas (Pages not auto-creating records, .dev HSTS preload, stale local negative-DNS caches) that make a working site look broken for its first hour. Use when launching a product site end-to-end with at most one dashboard visit. Empirical, from the same session that shipped 7 npm packages."
---

# cloudflare-domain-launch

Everything below is CLI/API; the dashboard is touched exactly once (the registrant contact, §1). Auth for all API calls: `Authorization: Bearer $CLOUDFLARE_API_TOKEN`, base URL `https://api.cloudflare.com/client/v4`, account id from the dashboard URL or `GET /accounts`.

## 1. Buy the domain (Registrar API)

- **Check availability + price**: `POST /accounts/{account_id}/registrar/domain-check` with `{"domains": ["example.dev", ...]}` — returns per-domain availability and price.
- **Register**: `POST /accounts/{account_id}/registrar/registrations` with a minimal body: `{"domain_name": "example.dev", "years": 1, "auto_renew": true}`. The minimal body relies on the account's **default address-book contact** for the registrant — and there is **no API to set that contact**; it must be configured once in the dashboard before you script registrations. This is the one mandatory non-CLI step.
- **Registration is async.** A 200 from the POST means accepted, not owned. Poll the registration status until `state` is `succeeded` before wiring anything against the domain.

## 2. Deploy the static site (Pages via wrangler)

```
wrangler pages project create <name> --production-branch=release
wrangler pages deploy . --project-name=<name> --branch=release
```

Live immediately at `<name>.pages.dev`. Then attach the custom domain:

`POST /accounts/{account_id}/pages/projects/<name>/domains` with `{"name": "example.dev"}` (repeat for `www.example.dev`).

## 3. Gotchas (each makes a working site look broken)

- **Pages does NOT always auto-create the DNS records for a custom domain.** If the apex/www attachments stay `pending`, create the records yourself in the zone: `CNAME` for both the apex (`@`) and `www`, target `<name>.pages.dev`, **proxied** (orange cloud). The attachment activates once the records exist.
- **`.dev` is HSTS-preloaded (HTTPS-only, baked into every browser)** — the site is dark (`curl` reports `000`) until the edge cert for the hostname issues. That window is normal, not a failure; wait for the cert before tearing anything down.
- **A local `curl 000` can also be your own machine's stale NEGATIVE DNS cache** — if you (or anything on the machine) queried the name before the record existed, the NXDOMAIN got cached locally. Before assuming it's broken, verify from a resolver that never saw the negative answer: `dig @1.1.1.1 example.dev`, or bypass local DNS entirely with `curl --resolve example.dev:443:<cf-ip>`. If either works, the site is fine and the bug is your cache.
