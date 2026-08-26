---
name: highlevel-app
description: "Build and list a GoHighLevel marketplace app — an OAuth 2.0 app whose UI is a Custom Page (Menu Link iframe) inside a sub-account, source under integrations/highlevel-app/ — on the GoHighLevel Marketplace. Use when embedding a page in a HighLevel sub-account, wiring HighLevel OAuth, handling HighLevel webhooks, or working out why an install or the iframe fails. Covers the whole path plus the traps that each cost a round-trip: the install flow picks a location so tokens are per sub-account and not per company, the token endpoint host differs between accounts and answers invalid_client when you guess wrong, the platform appends locationId to the iframe src and every bit of stored state must be scoped to it, and the iframe dies silently unless frame-ancestors names the HighLevel domains. Sibling of the other integration skills (hubspot-app, monday-app, whop-app, connector-directory-submission). Triggers: 'build a GoHighLevel app', 'GHL marketplace app', 'HighLevel OAuth', 'chooselocation', 'HighLevel custom menu link', 'my GHL iframe is blank', 'submit to the GoHighLevel marketplace'."
---

# Building a GoHighLevel marketplace app

A HighLevel app is an **OAuth 2.0 app** installed into a **location (sub-account)**, whose UI is a **Custom Menu Link → Custom Page**: an iframe pointing at your hosted SPA. Source lives in `integrations/highlevel-app/`. The SPA is a thin frontend over your API; the small server exists only for the OAuth exchange and webhooks.

## The trap that wastes a day: the tenant is the location, not the account

Install does not go through a plain `/authorize`. It goes through **`/oauth/chooselocation`**, where the installer picks a sub-account, and the token you get back belongs to **that location**. An agency installs once per location, so:

- store `{ access_token, refresh_token, expires_in, locationId, companyId }` **keyed by `locationId`**,
- key every piece of app state by `locationId` too — the platform appends `?locationId=…&companyId=…` to the iframe `src`, and that is your tenant id,
- one token per app, or per company, looks fine with a single test install and breaks the first real multi-location agency.

**Rule:** decide the per-location storage shape before writing the callback. Retrofitting it means re-keying every stored record.

## The other five that each cost a round-trip

1. **The token endpoint host is not stable across accounts.** Newer docs and older accounts disagree on which host serves `/oauth/token`. The symptom is `invalid_client` on an otherwise correct exchange — try the other host before you go auditing your client secret.
2. **The redirect URL must match byte for byte, scheme included**, and be registered in the portal. Add the local tunnel URL alongside production; a trailing slash mismatch is a failed install.
3. **The portal's scope picker must be a superset of what your server requests.** Ask for a scope the listing does not declare and the install fails at consent, not at first API call.
4. **The iframe needs explicit framing permission.** Serve the page with `Content-Security-Policy: frame-ancestors` naming the HighLevel domains, and never `X-Frame-Options: DENY`/`SAMEORIGIN`. HTTPS is mandatory except on localhost. A blank custom page is nearly always this.
5. **Reviewers install into a fresh location with no credentials of yours.** Every page must render a connect banner and a self-service way to authenticate. Keep a demo key ready for the reviewer notes.

Set distribution **Private** while testing, then flip to **Public** for review; existing private installs keep working after approval.

## Build path

- Create the app in the Marketplace developer portal → note client id + secret → put the redirect URI in both the portal and your env.
- Server handles `GET /oauth/callback`: exchange the code, store per `locationId`, redirect back into the app with the location in the query. Implement refresh (`grant_type: refresh_token`) at the same endpoint.
- SPA reads `locationId` from its own URL and scopes storage per location; it falls back to a standalone mode so the app is developable outside HighLevel.
- Portal → **Custom Menu Links** → add a **Custom Page** at your hosted URL, location-level placement, with a 512×512 icon.
- Webhooks are optional: portal → **Webhooks** → point at your handler and subscribe to the events you need. Return 200 fast; do the work async.

## Submission — GoHighLevel Marketplace

**Submittable: portal review, free.** No CLI — everything happens in the developer portal.

1. App created, OAuth working, redirect URLs and scopes registered.
2. Custom Page (Menu Link) configured and loading in a real sub-account over HTTPS.
3. Fill the listing: description, icon (512×512 PNG), screenshots of the app inside a location, privacy-policy + terms URLs (both required), support URL.
4. **Submit for review** from the portal. Reviewers install into a test location, so the Install button and the custom page must both work with nothing pre-configured.
5. After approval, flip distribution to Public.

## Parity checklist (prove in a real sub-account before submitting)

install completes and lands back in the app · a second location gets its own isolated state · token refresh works after expiry · the custom page loads inside the iframe over HTTPS · the app authenticates from a clean state · webhook handler returns 200.

## Related skills

- `hubspot-app` — the other CRM surface; per-portal OAuth and a card instead of a full-page iframe.
- `whop-app`, `monday-app` — same hosted-iframe shape, different host handshake.
- `marketplace-app-hosting` — serving an iframe app with the right per-host framing headers.
- `connector-directory-submission` — the cross-marketplace submission router.
