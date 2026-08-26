---
name: trello-powerup
description: "Build and list a Trello Power-Up — a fully static multi-page iframe app under integrations/trello-powerup/ that declares its capabilities at runtime — in the Trello Power-Ups directory. Use when adding a card button, card badge, board button, or settings popup to Trello, storing per-card or per-board state, or working out why a declared capability never appears. Covers the whole path plus the traps that each cost a round-trip: there is no manifest file at all — Trello loads one connector URL and everything is declared in the initialize() call, the client library has no npm package and must come from Trello's CDN, storage scope choice is a correctness decision rather than a style one, and every popup is its own HTML entry point so a single-page router cannot work. Sibling of the other integration skills (miro-app, monday-app, browser-extension, connector-directory-submission). Triggers: 'build a Trello Power-Up', 'TrelloPowerUp.initialize', 'Trello card button', 'card badges', 'trello t.get t.set', 'my Power-Up capability is missing', 'submit a Power-Up to Trello'."
---

# Building a Trello Power-Up

A Power-Up is a **fully static site of small HTML pages** loaded in sandboxed iframes inside Trello. There is no server requirement and no build-time manifest: Trello loads a single **iframe connector URL**, and that page tells Trello what the Power-Up can do. Source lives in `integrations/trello-powerup/`.

## The trap that wastes a day: capabilities are declared at runtime, in one file

There is no `manifest.json` to inspect. Trello fetches your **connector page**, which loads the client library and calls:

```js
TrelloPowerUp.initialize({ "card-buttons": …, "board-buttons": …, "show-settings": … }, { appName: "…" })
```

A capability that is not a key in that object **does not exist**, no matter what you enabled in the admin UI. The admin's capability checkboxes and the `initialize` keys have to agree, and the failure mode is silence — the button simply never renders.

**Rule:** when a capability is missing, read the connector page first, then the admin checkboxes. Never start by debugging the popup.

## The other five that each cost a round-trip

1. **The client library is CDN-only.** There is no npm package for it — load Trello's `power-up.min.js` with a script tag and use `window.TrelloPowerUp`. Don't waste time hunting for a package; do keep bundles small and avoid `eval`, since the popups run in a sandboxed iframe.
2. **Storage scope is a correctness decision.** `t.set(scope, visibility, key, value)` takes a scope of `card`/`board`/`member`/`organization` and a visibility of `shared`/`private`. Per-card state belongs in `card`+`shared` — parking it in a board-level map hits the per-key size limit as the board grows *and* races between concurrent edits on different cards. Credentials go in `private`, never `shared`.
3. **Every popup is its own HTML entry point.** The connector, card popup, board popup, settings, and authorize screens are separate documents; Trello navigates to them directly. A client-side router never runs. Configure a multi-page build and check each file lands in the output.
4. **The authorization capabilities are what gate the UI.** Without `authorization-status` and `show-authorization`, buttons appear before credentials exist and fail on click. With them, Trello shows the authorize popup first.
5. **Hosting must allow framing by Trello.** All HTTPS, no mixed content, and no `X-Frame-Options: DENY`/`SAMEORIGIN`. During development expose the dev server through an HTTPS tunnel — Trello will not load an HTTP origin.

## Build path

- Pages: a connector page (capability registration only), plus one page per popup. Any static host works.
- Inside a popup, `TrelloPowerUp.iframe()` gives you `t` — use `t.card(…)` to read the current card, `t.get`/`t.set`/`t.remove` for storage, `t.popup`/`t.closePopup` for navigation, and `t.sizeTo` so the iframe fits its content.
- Badges are cheap synchronous reads of stored state; keep them free of network calls or the board feels slow.
- Talk to your own API directly from the popup with the user's credentials. The Trello REST API is a separate thing and most Power-Ups never need it — the admin hands you a Trello API key you can leave unused.
- Prefill from what the card already has (name, description, labels, due date) and only send it on an explicit user action.

## Submission — Trello Power-Ups directory

**Submittable: portal review, free.** Everything runs through the Power-Ups admin.

1. Admin → **Create new Power-Up**, choosing the workspace that will own it. **That workspace becomes the publisher** — pick deliberately.
2. **Basic Information**: name, overview, support contact, categories, tagline, listing icon (512×512 PNG or larger), promo image.
3. Set the **Iframe connector URL** to your hosted connector page over HTTPS. This is the only URL Trello loads to discover capabilities.
4. **Capabilities**: enable each one and map it to its page. Keep this list identical to the `initialize` keys.
5. **Privacy & compliance**: privacy policy, terms, support URL, and an honest description of what you store and where (which scope, which visibility) and what leaves Trello.
6. Enable it on a test board as a **Custom** Power-Up and exercise every capability, on two boards, to prove per-board isolation.
7. **Submit for review.** Review checks that the connector loads, every declared capability works, icons render, there is no mixed content, the privacy policy is accurate, and no undocumented endpoints are used. Expect weeks, not days. Updates go through the same admin: bump the version and resubmit.

## Parity checklist (prove on a real board before submitting)

card button creates the downstream record · badge reflects stored state · board popup lists and refreshes · settings saves and invalidates credentials · authorize flow appears when no credentials exist · a second board sees none of the first board's state.

## Related skills

- `miro-app` — the other canvas surface; an injected SDK and OAuth instead of a CDN library and client storage.
- `browser-extension` — another sandboxed-iframe/CSP surface; the framing lesson rhymes.
- `marketplace-app-hosting` — serving a static iframe app with the right per-host framing headers.
- `connector-directory-submission` — the cross-marketplace submission router.
