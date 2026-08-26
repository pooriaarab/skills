---
name: miro-app
description: "Build and list a Miro app — a React panel that runs in an iframe on a Miro board, source under integrations/miro-app/, reading board items through the injected Web SDK — on the Miro Marketplace. Use when reading or creating board items (sticky notes, shapes, frames), reacting to board selection, wiring Miro OAuth, or working out why the panel is blank outside a board. Covers the whole path plus the traps that each cost a round-trip: the Web SDK has no runtime npm package — Miro injects window.miro into the panel, so the app must degrade when it is absent, the panel URL must be an HTTPS tunnel because localhost never loads in the iframe, the OAuth token exchange sits on a v1 path under an otherwise v2 API, and board reads are typed async queries while selection is an event rather than a poll. Sibling of the other integration skills (trello-powerup, figma-plugin, canva-app, connector-directory-submission). Triggers: 'build a Miro app', 'Miro Web SDK', 'miro.board.get', 'selection:update', 'Miro OAuth', 'my Miro panel is blank', 'submit to the Miro marketplace'."
---

# Building a Miro app

A Miro app is a **React panel in an iframe** on a board, driven by the **Web SDK** that Miro injects into that iframe. Source lives in `integrations/miro-app/`. Optional server-side code exists only for the OAuth exchange and, when the panel's origin cannot reach your API directly, a thin proxy.

## The trap that wastes a day: there is no runtime SDK package

The types package is types only. The **runtime is `window.miro`, injected by Miro into the panel iframe** from a script the host page loads. Consequences, all at once:

- `import`ing the SDK gives you nothing at runtime,
- outside a board `window.miro` is simply undefined,
- so a panel written as if the SDK is always there is undevelopable and undemoable outside Miro.

**Rule:** treat the SDK as an optional capability. Feature-detect `window.miro`, and back the panel with mock board items when it is missing. That single decision is what lets you build the UI locally and lets a reviewer see something before they install.

## The other five that each cost a round-trip

1. **The panel URL must be HTTPS and publicly reachable.** `localhost` will not load in the iframe, so development means an HTTPS tunnel pointed at the dev server, with the tunnel URL set as the app's panel URL in the portal.
2. **The OAuth token exchange is on a `v1` path** even though the rest of the REST API is v2. Authorize on the web host, exchange on the API host's v1 token endpoint. Copying the v2 base into the exchange is a confusing 404.
3. **Scopes are declared in the portal and the install link is per team.** Ask for the narrowest set — read access for items you only read, write access only if you create items back. A scope your code uses but the portal does not declare fails at install.
4. **Board reads are typed async queries; selection is an event.** Query items by type (`miro.board.get({ type: … })`) and subscribe to `selection:update` through the board UI event API. Polling for selection burns the main thread and still misses changes.
5. **Cross-origin bites at the last moment.** The panel is a browser context on your origin calling your API; if the API does not allow that origin, everything works in preview and fails once installed. Either allow the panel origin or route through a small server proxy.

## Build path

- Create the app in the developer portal under the team that will own it; the portal generates the install link.
- Set the **panel/app URL** to the tunnel during development and to the hosted build afterwards.
- Panel: React in the iframe, SDK types as a dev dependency, runtime access through the injected global behind a feature check.
- Read board items by type, prefill your composer from the item's text, and only write on explicit user action.
- Server (optional): the OAuth install and callback routes, plus a proxy route for anything the panel origin cannot call directly. Store tokens per team/installation, never in the client.

## Submission — Miro Marketplace

**Submittable: portal review, free.** No publish CLI; scaffolders come and go, so the portal flow is the stable path.

1. App passes the portal's automated checks — app config, icons, scopes, OAuth all valid.
2. Fill the listing: description, screenshots of the panel on a real board and of the composer, privacy-policy + terms URLs, support URL, and at least one installable scope.
3. **Submit for review** in the portal. Review covers security, the OAuth flow, feature correctness, and listing completeness. Budget one to two working weeks.
4. After approval the app is installable by any team from the marketplace.

Because portal paths and SDK method names are versioned and move, verify each against the live reference before submitting rather than trusting a copy in a README.

## Parity checklist (prove on a real board before submitting)

panel loads inside a board · items of the expected type are listed · selection changes update the panel · the downstream record is created from an item's content · media upload round-trips · the panel authenticates from a clean state · the preview still works with the SDK absent.

## Related skills

- `trello-powerup` — the other canvas surface; a CDN library and client storage instead of an injected SDK and OAuth.
- `figma-plugin`, `canva-app` — the same "design surface → export → do something" shape with different iframe rules.
- `connector-directory-submission` — the cross-marketplace submission router.
