---
name: agent-browser-consoles
description: "Drive real ad and cloud consoles with agent-browser. Use when browser-attach returns about:blank instead of attaching, synthetic clicks do nothing on React/Angular consoles, Google Ads controls hide in shadow DOM, two buttons share one label, innerText disagrees with the screen, or a setup gates on a legal attestation."
---

# agent-browser-consoles

Drive real advertising and cloud consoles with `agent-browser`.
These traps are not obvious from the CLI help.
Each one cost several wasted turns to rediscover.

Applies to Google Ads, Meta Events Manager, Reddit Ads, LinkedIn, and GA4.

## 1. Confirm which browser you drive

`browser-attach` fails silently.
The daily Chrome runs without `--remote-debugging-port`.
Chrome accepts that flag at launch only.
`browser-attach` does not error.
It launches its own browser and returns a plausible `about:blank`.

Always confirm the process before you drive it:

```sh
lsof -nP -iTCP -sTCP:LISTEN | grep -i google   # pid + port
curl -s http://localhost:9334/json/list        # should show YOUR page
```

A listener on 9222 is not proof of a DevTools endpoint.
One such listener answered `404` for `/json`.

## 2. Use the clone as the working route

Run `~/.agent-browser/bin/browser-clone-setup.sh personal`.
Then launch real Chrome on `~/.agent-browser/real-profiles/personal` with `--remote-debugging-port=9334`.
The clone is read-only on the source profile.
It is idempotent.
It carries live Google, Meta Business, LinkedIn, and Reddit sessions.
It needs no browser restart.

## 3. Prefer snapshot refs over synthetic DOM events

Synthetic DOM events do nothing on React/Angular consoles.
On Reddit Ads signup dropdowns, `element.click()`, the native value setter plus `input`/`change` events, and a full dispatched `pointerdown/mousedown/mouseup/click` sequence all failed silently.
The value never changed.
No error was raised.
Only `agent-browser click "@ref"` against a ref from `agent-browser snapshot` worked.
Use refs for anything that must actually commit.

## 4. Pierce shadow DOM in Google Ads

Google Ads renders inside shadow DOM.
`document.querySelectorAll` cannot see its controls.
`agent-browser click "text=View token"` reports the element does not exist, even when the text appears in `document.body.innerText`.
Walk through shadow roots:

```js
function walk(root, out){
  var els = root.querySelectorAll('*');
  for (var i=0;i<els.length;i++){
    var e = els[i];
    if (e.shadowRoot) walk(e.shadowRoot, out);
    if (e.children.length===0 && /view token/i.test(e.textContent||'')) out.push(e);
  }
  return out;
}
```

## 5. Read the page before clicking a button by its label

Meta's Conversions API setup has two buttons both labelled "Generate access token".
One sits inside a Dataset Quality API modal.
One sits below the "without Dataset Quality API" radio.
The modal path is irreversible.
It states that once a dataset is configured for Quality API, opting out is not available.
It preselected a different dataset than the one open in the list.
Anchor on the surrounding control.
Assert the target id before any click that commits.

## 6. Screenshot when text parsing disagrees with reality

Several times `innerText` said one thing and the rendered page said another.
A stale currency value.
A dialog that looked closed.
Take one screenshot.
It resolves each case faster than more `eval` calls.

## 7. Stop at attestations

Never make a legal statement on the operator's behalf.
GA4's Measurement Protocol panel gates on "I have the necessary privacy disclosures and rights from my end users".
Reddit's signup gates on a similar statement.
An agent cannot truthfully assert that.
Detect the attestation.
Stop.
Name the exact click the owner must make.
Reddit's currency choice is similar: it "cannot be changed after sign up", so ask rather than default.

## 8. There is no `mouse click`; compose it

When refs and shadow-piercing both fail, fall back to a real pointer.
`agent-browser mouse click` does not exist — the subcommands are `move`, `down`, `up`, `wheel`.
Compose the click, using coordinates read from the element itself:

```sh
agent-browser eval "(function(){var e=/* find it */; var r=e.getBoundingClientRect();
  return Math.round(r.x+r.width/2)+' '+Math.round(r.y+r.height/2);})()"
agent-browser mouse move <x> <y>
agent-browser mouse down
agent-browser mouse up
```

This opened a Meta collapsible that ignored `element.click()` and had no snapshot ref.

## 9. Curly apostrophes break text selectors

`agent-browser click "text=Confirm your server's events..."` fails when the page uses `’` (U+2019)
rather than `'`. The failure reads as a missing element, not an encoding problem.
Match on a substring that stops before the apostrophe, or find the node by regex in `eval`
and click it by coordinates.
