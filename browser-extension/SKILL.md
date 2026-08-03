---
name: browser-extension
description: "Use when building a cross-browser (Firefox + Chrome) Manifest V3 web extension from scratch and/or submitting it to the stores. Covers the one-manifest-two-browsers layout, the CSP rules that break WebAssembly and web workers (and the same-origin-worker fix), on-device AI via Firefox `browser.trial.ml` and Chrome's built-in Prompt API, `web-ext` build/lint, and the full store-submission flow per browser — AMO (addons.mozilla.org) including the mandatory 2FA/AAL2 gate, and the Chrome Web Store. Triggers: 'build a browser/Firefox/Chrome extension', 'MV3 extension', 'submit to AMO', 'publish to Chrome Web Store', 'web-ext', 'sign my add-on', 'extension CSP blocks my worker/wasm', 'local AI in an extension'. Also covers, once built: inserting text into a rich-text composer from a content script (Draft.js/Quill/Lexical) when the post/send button stays disabled, storing per-device auth/session state (storage.local vs sync, self-heal, sign-up races), and QA'ing a loaded unpacked extension via browser automation. Triggers: 'reply/post button disabled after inserting text', 'execCommand insertText', 'content script into X/LinkedIn composer', 'chrome.storage.sync keeps restoring old token', 'test/QA a loaded extension', 'drive extension with browser automation', 'chrome ignores --load-extension'."
---

# Cross-Browser Web Extension: Build & Ship

**One codebase, two stores.** A Manifest V3 extension runs on both Firefox and Chrome if you keep the browser differences in the manifest, not the code. This skill is the build layout, the CSP traps that cost the most time, and the exact submission flow per browser.

Describe-only: this documents the approach and the gotchas. Write the actual extension code in the target repo.

---

## 1. Project layout

Keep source in one folder (e.g. `src/`) so the package root is unambiguous:

```
src/
  manifest.json         # the only file with browser-specific keys
  background.js         # shared logic — loaded by BOTH browsers (see §3)
  <ui>.html / <ui>.js   # popup / options / full pages
  assets/               # icons (16/32/48/96/128 png), images
  vendor/               # third-party libs, vendored (no CDN — CSP blocks it)
package.json            # scripts: build, lint, start, test
```

Icons: ship `16, 32, 48, 96, 128` px PNGs. If you author a logo as SVG, rasterize to those sizes as a build step (a headless browser rendering the SVG at each size works and needs no image toolchain).

---

## 2. The manifest is where browsers differ

Both stores read `manifest_version: 3`, but each ignores keys it doesn't understand — exploit that to ship one manifest:

- **Firefox-only:** `browser_specific_settings.gecko` — set `id` (e.g. `name@author`), `strict_min_version`, and (required by AMO now) `data_collection_permissions.required` (use `["none"]` if you collect nothing).
- **Background script (the #1 cross-browser gotcha):** Chrome MV3 wants `background.service_worker`; Firefox MV3 wants `background.scripts`. Declare **both**, pointing at the same file:
  ```json
  "background": { "service_worker": "background.js", "scripts": ["background.js"] }
  ```
  `web-ext lint` warns `background.service_worker is not supported` — that warning is expected and harmless; each browser reads its own key.
- **API namespace in code:** Firefox exposes `browser.*` (promises); Chrome exposes `chrome.*` (callbacks, plus a partial `browser` in newer versions). Start every file with `const api = globalThis.browser ?? globalThis.chrome;` and use promise-style APIs (Chrome MV3 supports them).
- **Permissions:** put anything not always needed in `optional_permissions` and request it at runtime **from a user gesture** (a click) — some permissions (like Firefox's `trialML`) are only grantable that way.

---

## 3. CSP: the traps that eat a day each

MV3 extension pages run under a strict Content-Security-Policy. Two things break silently:

- **WebAssembly** needs `'wasm-unsafe-eval'` in `script-src`. Without it, any wasm library fails to instantiate.
- **Web workers from `blob:` URLs are blocked.** Many libraries (map renderers, parsers) spawn their worker from a `blob:`. The extension CSP `worker-src` does not allow `blob:` and you generally can't add it. **Fix:** use the library's "CSP build" if it has one — it ships the worker as a *separate file* you load same-origin via `worker-src 'self'` and a `setWorkerUrl(api.runtime.getURL("vendor/thing-worker.js"))`-style call. No CSP build? Vendor the worker file yourself and point the library at it. Never rely on `blob:` workers.
- **Declare CSP explicitly** so dev tooling doesn't fight you:
  ```json
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; object-src 'self'; connect-src 'self' https://api.example.com; img-src 'self' data: blob:"
  }
  ```
  Add each remote origin your extension actually fetches to `connect-src` (and `img-src`), and mirror them in `host_permissions`. Everything else stays `'self'`.
- **No CDN. Vendor everything.** `script-src 'self'` blocks remote scripts — copy libraries into `vendor/`. This also makes review faster and the package self-contained.
- **`web-ext run` (dev) replaces your CSP** with a looser dev one, which can *hide* a blob-worker failure that then reappears in the packaged build. Always verify the real thing by loading the built package (temporary add-on / load-unpacked), not just `web-ext run`.

---

## 4. On-device AI (optional, but the whole pitch for some extensions)

Both browsers now ship local models — zero inference cost, nothing leaves the device.

- **Firefox — `browser.trial.ml`** (FF 142+; text-generation needs Nightly with `browser.ml.enable=true` and `extensions.experiments.enabled=true`). Request the `trialML` optional permission from a user gesture, then `createEngine({ modelHub, taskName, modelId, dtype })` + `runEngine({ args })`. Model must come from a **blessed HF org** (Mozilla / Xenova). A known-working small combo: `Xenova/Qwen1.5-0.5B-Chat` with `dtype: "q4"`. First run downloads the model (slow, shows progress); cache it.
- **Chrome — built-in Prompt API** (`LanguageModel` / `window.ai`). Different API, same idea.
- **Design for absence.** These are gated/experimental. Build a capability probe with a graceful floor: `mock → Firefox trial.ml → Chrome Prompt API → deterministic heuristic`. The extension must stay fully usable when no model is available — never hard-depend on the model.
- **Safety pattern for generated content:** if a model emits config/params, validate against a schema and run through your own interpreter. Never `eval` model output or let it execute as code.

---

## 5. Build, lint, test

Use Mozilla's **`web-ext`** (works for Chrome packaging too):

```
web-ext build   --source-dir src   # → web-ext-artifacts/<name>-<version>.zip  (this is the upload)
web-ext lint    --source-dir src   # 0 errors; the dual-background warning is expected
web-ext run     --source-dir src   # scratch Firefox with the extension loaded (dev CSP — see §3)
```

- **Firefox dev install:** `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → pick `src/manifest.json` (gone on restart).
- **Chrome dev install:** `chrome://extensions` → *Developer mode* → *Load unpacked* → select `src/`.
- **e2e:** drive the built extension with a browser-automation tool; assert no console errors and that dangerous actions (closing tabs, network writes) hold their safety invariants. Keep generators deterministic (seed instead of `Math.random`/`Date`) so tests are stable.

---

## 6. Submit to Firefox (AMO — addons.mozilla.org)

It's a multi-step wizard. In order:

1. **Create a Firefox add-on developer account** at addons.mozilla.org.
2. **2FA is mandatory to submit.** AMO submission requires an `AAL2` (two-factor) session. If the account has no 2FA, Mozilla forces `inline_totp_setup` mid-flow: scan the QR with an authenticator app, enter the 6-digit code, and **save the recovery codes** before continuing. There is no way around this gate — an automation agent cannot complete it for the user; the human must do the TOTP step.
3. **Distribution agreement** — Developer Hub → *Submit a New Add-on* → tick both agreement checkboxes → Accept.
4. **Listed vs unlisted** — a genuine fork in the road, confirm with the user before committing:
   - *Listed* — public on AMO, discoverable, Mozilla reviews it.
   - *Unlisted* — Mozilla only signs it; you self-distribute the signed file (needs `update_url` in the manifest for auto-updates). Still installs cleanly.
5. **Upload** `web-ext-artifacts/<name>-<version>.zip`. AMO auto-runs validation. **"Validated with no errors and N warnings" is fine to proceed** — warnings don't block. The dual-background (`service_worker is not supported`) and "Unsafe assignment to innerHTML" warnings are expected; they're flagged as "issues that can lead to rejections" but the reviewer-notes disclosure (step 8) covers them.
6. **Compatibility** — tick the target apps (Firefox desktop; add *Firefox for Android* only if it actually works there — WebGL/experimental-API extensions usually don't).
7. **"Do you need to submit source code?"** — answer **No** if you use no minifier / bundler (webpack) / template engine / transpiler. Hand-written, as-shipped source = No. (AMO asks this both before *and* after the details form — answer consistently.)
8. **Details form** — name and summary are pre-filled from the manifest `name`/`description`. Add a longer description, pick **category** (e.g. Games & Entertainment), choose a **license** (an OSS license, or *All Rights Reserved* for a closed/private codebase — changeable later), optional privacy policy, and **Notes to Reviewer**. In the notes disclose everything a reviewer would otherwise flag: runtime network access and why (no-key host, no user data), vendored libraries **with licenses** (BSD/MIT), no build step, an explanation for each validation warning, any dangerous-looking permission (e.g. `tabs`) and its safety model, and how to test any gated feature (e.g. on-device AI needs Nightly + a pref; otherwise it falls back). Honesty here is the difference between fast approval and a round-trip.
9. **Submit Version** → the second source-code question → **Finish**. You land on "Version Submitted ✨". Publication takes up to ~24h, longer if selected for manual review; a confirmation email follows. Mozilla **signs** it — signed add-ons install in one click and auto-update.

**Pause before "Submit Version"** if driving via automation — that's the irreversible public step. Let the user do auth/2FA, approve listed-vs-unlisted, and okay the final button.

*Automation note:* AMO's radio inputs (distribution, source-code, license) are custom-styled — a coordinate/ref click often won't register; use a semantic `check`/label action, and click the wizard's `Continue`/`Submit` buttons via a role locator (scroll into view first). Verify each `checked=true` before advancing.

---

## 7. Submit to Chrome (Chrome Web Store)

The **same zip** works — Chrome reads `manifest_version`, `background.service_worker`, `content_security_policy.extension_pages`, `permissions`, `icons`, and **ignores the Firefox-only keys** (`browser_specific_settings`, `background.scripts`). No separate Chrome package needed.

1. One-time developer registration at the Chrome Web Store Developer Dashboard (**US$5**, once, covers all your items). Sign in with the Google account you want to own the listing.
2. Dashboard → **Add a new item** → **Select file** → upload the zip. **This creates a private draft — it does NOT publish.** Publishing is a separate *Submit for review* click after the listing is complete, so uploading is safe.
3. **Store listing tab** — title + summary auto-fill from the manifest. Fill **Description**, **Category**, **Language**, and upload the **Store icon** (128×128) + **Screenshots** (≥1 at exactly **1280×800** or 640×400; AMO lets you skip screenshots, Chrome does not). Promo tiles (small 440×280, marquee 1400×560) are optional.
4. **Privacy tab** (stricter than AMO, and the usual rejection cause). Every field here is required:
   - **Single-purpose description** — one sentence (Chrome enforces the single-purpose policy).
   - **Per-permission justification** — a separate box for *each* permission **and** for host permissions; write one line each. Unjustified/over-broad permissions stall review.
   - **"Are you using remote code?"** — **No** if you vendor everything and run no `eval`/remote `<script>`/external module (wasm bundled in the package is *not* remote code). Answering Yes forces an extra justification.
   - **Data usage** — leave every data-type box unchecked if you collect nothing, but you **must still tick the three certification checkboxes** (no-sell, single-purpose-use, no-creditworthiness).
   - **Privacy policy URL — required even when you collect no data.** Host a short policy (a `PRIVACY.md` in a public repo works — use its github.com blob URL) and paste it.
5. **Submit for review.** Chrome doesn't "sign" like AMO — approved items just go live. Use *"Why can't I submit?"* to list remaining required fields.

### Real-run quirks (cost hours; automate around them)

- **Material dropdowns resist synthetic clicks.** Category/Language are Angular Material selects — clicking the overlay option often doesn't register. **Keyboard typeahead works:** focus the trigger, type the option's first letter(s), `Enter`. For a variant (e.g. "English (United States)") type the letter then `ArrowDown` to the variant before `Enter`. Radios/checkboxes: use a semantic `check` action, not a coordinate click.
- **Icon input is static and targetable; screenshot/promo drop-zones are NOT.** The store-icon `<input type=file>` exists in the DOM (`upload` / `setInputFiles` works). The screenshot & promo zones spawn their file input **only on click, via a native file chooser** — a plain `setInputFiles`-on-a-static-input tool can't reach them. To automate screenshots you need a real **file-chooser handler** (`page.waitForEvent('filechooser')` around the click, then `setFiles`) over a **TCP** CDP connection — or a human drags the files. A multi-file upload aimed at the single-file icon input silently stalls at "0%".
- **Screenshot upload resists CLI automation; the human drag is the practical path.** Clicking the screenshots drop-zone *does* materialize the file inputs (a `get count "input[type=file]"` jumps 0→N), but a one-shot `upload`/`setInputFiles` hits a **detach race** — Angular re-renders the input between resolve and set-files (`Object id doesn't reference a Node`). Only the *static* icon input uploads cleanly this way. A robust Playwright **Locator** `setInputFiles` (auto-waits through the detach) needs a **TCP** CDP endpoint — but **Chrome 136+ ignores `--remote-debugging-port` on the default/logged-in profile** (only a custom `--user-data-dir` gets a port), and agent-browser connects over a pipe with no file-chooser command. Net: have the user drag the screenshots in, then the agent clicks **Submit for review**. (The Submit button un-disables and the "Why can't I submit?" link disappears once all required fields — incl. ≥1 screenshot — are set.)
- **Wrong-Google-account trap.** The listing is owned by one Google account. In a multi-account/SSO Chrome (e.g. a work + personal setup) the console silently resolves to the wrong account and **redirects to `/devconsole/register`** — that redirect means "not the owner account," not "not registered." `?authuser=` switching is unreliable; the fix is selecting the right account/profile in the browser. Managed (work) accounts can't own a personal listing.
- Uploading the package trips "publish to a public registry" guards in agentic setups even though it only creates a private draft — get explicit user go-ahead; let the user do the Google login and $5 payment.

### Resubmission after a permissions rejection

- **Check whether the fix already landed before rebuilding.** A merged-but-unshipped fix branch plus a stale submitted zip is a common state — the rejection may cite permissions already removed in git. Audit before cutting anything: `grep -rn "chrome.<api>" src/` per permission (`chrome.scripting`, `chrome.system`, …), and re-audit every remaining permission as the rectification notice demands.
- **`grep src/` lies when a non-entry file matches — audit the BUILT entry, not all source.** Chrome's static check reads the *packaged* service worker / content scripts, i.e. only what the webpack/vite entry actually pulls in. An **orphaned file** (a stale `background.ts` next to the real `background/index.ts`, a dead util) can reference `chrome.alarms`/`chrome.webNavigation` and satisfy `grep -rn chrome.alarms src/` while the built bundle never touches them → "requesting but not using" rejection despite a source match. So: read the entry map (`config.entry` / vite input), grep only the files it reaches (or grep `build/static/js/*.js` after a build), and delete the orphan so the phantom reference can't mislead the next audit. (Chrome's internal code for this is "Purple Potassium" = excessive/unused permissions.)
- **`clipboardWrite` is usually removable.** `navigator.clipboard.writeText()` behind a user-gesture (a click handler) needs **no** permission in an extension page; the permission is only for writes *outside* a gesture or `execCommand('copy')` in a worker. If your only clipboard use is a "Copy" button → drop the permission. (`chrome.notifications`, by contrast, *does* need `"notifications"` — an undeclared `chrome.notifications.create` silently no-ops, so guard it or declare it; missing-permission is a broken feature, not a rejection.)
- **Static `content_scripts` do NOT need matching `host_permissions`.** Injection is authorized by `content_scripts.matches`. `host_permissions` is only for cross-origin `fetch` from the worker/content script, `chrome.scripting`, cookies, or `tabs.query({url})`. Duplicating every content-script host into `host_permissions` is permission-creep reviewers flag — keep in `host_permissions` only the origins you actually `fetch` (e.g. image CDNs for vision) or query by URL.
- **You get ONE appeal per violation, and resubmit-spam risks the whole Google account.** Repeatedly re-uploading without fixing the root cause can suspend related Google services (the automated system reads it as evasion). So root-cause first, fix once, resubmit once. Only appeal (item detail page → Appeal) if you're certain the rejection is wrong and you can cite the exact code path that uses the permission.
- **Bump the version.** CWS rejects an upload whose version is ≤ any previously uploaded version, *including rejected drafts* (1.0 rejected → upload 1.0.1). Rebuild so the packaged `manifest.json` carries both the new version and the narrowed permissions; verify with `unzip -p pkg.zip manifest.json`.
- **The Privacy tab regenerates from the new manifest.** Per-permission justification boxes for removed permissions vanish on their own — no manual cleanup. But any box left at `0/1,000` keeps **Submit for review** disabled (a previously-empty `sidePanel` box is the usual culprit). Fill the textarea (native value setter + `input`/`change` events), click **Save draft**, and only then does Submit un-disable.
- **Don't re-upload while a draft is pending review** unless you mean to — the new package replaces the version under review and restarts the queue.

### Driving the CWS dashboard without CDP (macOS: AppleScript + in-page JS)

When agent-browser `--auto-connect` reports "No running Chrome instance found" (Chrome wasn't launched with `--remote-debugging-port`, and Chrome 136+ ignores that flag on the default/logged-in profile):

- **Clicking "Allow" on Chrome's "Allow remote debugging?" dialog does NOT fix `--auto-connect`** — it still finds no instance. Dismiss the dialogs (each connection attempt spawns one) and take a different path.
- **AppleScript is the fast path.** GUI-AX automation (click-by-element-id tools) runs ~1 min/action on large Chrome windows; `osascript` is instant: enumerate `windows` and `URL of active tab of window id N`, open pages with `make new tab at end of tabs with properties {URL:"…"}`, and run page JS via `execute active tab of window id N javascript "…"` (requires View → Developer → **Allow JavaScript from Apple Events**). With in-page JS you drive the Angular console directly: click buttons matched by `textContent`, read `btn.disabled`, fill textareas via the native setter + events.
- **Profile selection without guessing:** the devconsole URL opens in the *last-active* profile — often the wrong one (see the account trap above). Instead find the window whose tabs prove the right Google session (e.g. an open Gmail tab for the owner account) and `make new tab` *in that window*; a clean load (no `/register` redirect) confirms the owner account.
- **Zip upload without the native file chooser.** The chooser is painful to automate, and `fetch('http://localhost:…')` from the page trips Chrome's local-network permission prompt ("wants to access other apps and services on this device"). Skip the network entirely: `base64` the zip, inject it into `window.__b64` in ~200 KB chunks via repeated `execute javascript`, then in-page: `atob → Uint8Array → new File([bytes], name, {type:'application/zip'}) → DataTransfer → input.files = dt.files → dispatchEvent(new Event('change',{bubbles:true}))` targeting `input[type=file][accept*=".zip"]`. Angular may **clear `input.files` as it consumes them**, so `files[0]` can be undefined immediately after — that's success, not failure. Verify on the **Package** tab that the draft shows the new version + permissions.
- **Confirm submission on the Status tab** ("This draft is pending review") — the header badge lags behind the actual state.

---

## 8. Pass review the first time (pre-submission audit)

Run this audit **before** uploading. It separates the warnings that are fine from the ones that get you rejected.

### Your own code (grep it — these are the real blockers)

```
git grep -nE "eval\(|new Function|document\.write|innerHTML|<script|importScripts|https?://(?!localhost)" -- src ':(exclude)src/vendor/*'
```
- **No `eval` / `new Function` / `document.write`** — hard rejection on both stores.
- **`innerHTML` only with static or sanitized strings.** Dynamic `innerHTML` is an AMO warning and a Chrome risk. Prefer `textContent` / `createElement` / DOM APIs; for SVG/vector rendering build nodes, don't string-concat user/model data into markup.
- **No remote code.** No CDN `<script>`, no `import` from a URL, no `fetch()`-then-`eval`. Every `fetch` must target an **extension-local** asset or a **declared** `host_permissions` origin. Chrome's "Are you using remote code?" is **No** only if this holds (bundled wasm is *not* remote code).

### Third-party libraries (the usual Chrome snag)

- **Ship readable source, not obfuscated.** Chrome bans obfuscated code and reviewers flag heavily-**minified** vendored files (a 700 KB, 6-line `*.min.js`). Minified *public* libraries are usually accepted, but to be bulletproof **vendor the library's non-minified build** (or a CSP/ESM build that ships readable) and keep its `LICENSE`. A readable `three.module.js` passes without question; a one-line minified blob invites "please provide unminified source."
- List every vendored lib + license in the reviewer notes (AMO) / justifications (Chrome).

### AMO (`web-ext lint`) — which warnings are benign

- `"/background/service_worker" is unsupported and ignored on Firefox` — **expected** (the dual-background cross-browser trick). Ignore.
- `Unsafe assignment to innerHTML` **inside a vendored lib** (e.g. MapLibre) — a warning, not an error; AMO passes with it. The same warning **in your own code** — fix it.
- Target **0 errors**; warnings don't block submission but each one a *human* reviewer sees is a chance to look closer, so minimize them.

### Chrome Web Store policy gates (beyond the linter)

- **Single purpose** — one narrow, honestly-stated purpose. Feature sprawl that needs broad permissions gets rejected.
- **Minimal permissions**, each justified; prefer `activeTab` + `optional_permissions` over broad host access. Unused permission in the manifest = rejection.
- **CSP** — `'wasm-unsafe-eval'` is allowed; `'unsafe-eval'` is not. No remote `script-src`.
- **Data honesty** — the data-use disclosures must match what the code actually does; a privacy-policy URL is required even at zero data.
- **Assets present** — 128×128 icon + ≥1 screenshot at exactly 1280×800.

### Common rejection causes (both stores)

Obfuscated/minified-only code · remote code execution · permissions with no user-visible feature · privacy policy missing/contradicting behavior · single-purpose violation · screenshots that don't show the real product.

---

## 9. Content-script insertion into rich editors (the disabled-button trap)

Social composers are React-controlled contenteditables (X = Draft.js, LinkedIn = Quill, many apps = Lexical). Setting `el.textContent = text` mutates the DOM *behind* the editor's model: the text **shows** but the editor's internal state stays empty, so the Post/Send button stays **disabled** and nothing can be submitted. The insertion looks like it worked and silently isn't postable.

Fix — activate, then insert with a **trusted** edit command:

1. **Click the composer to activate/focus it.** These editors only start tracking input once the field is active.
2. Insert via `document.execCommand('insertText', false, text)`. This fires a *trusted* `beforeinput`/`input` event the editor processes to update its model → the button enables. To clear existing content first, use `execCommand('selectAll')` + `execCommand('delete')` — **never** `textContent = ''`.

A synthetic `el.dispatchEvent(new InputEvent('beforeinput', …))` alone does **not** insert text (untrusted events don't perform the edit). `execCommand` is deprecated but remains the reliable cross-editor path for programmatic insertion into a contenteditable the page controls.

---

## 10. Per-device session state: `storage.local`, not `storage.sync`

Auth tokens and per-device session ids belong in `chrome.storage.local`. `chrome.storage.sync` replicates to the user's account cloud and keeps **restoring** whatever is there — so a corrupted or mismatched value becomes permanently stuck across reloads and reinstalls, and a self-heal can never persist.

- A common corruption source: a **race** where several content-script instances (one per injected post/widget) each auto-sign-up on first page load, and two different sign-ups interleave their writes (token from A, workspace/id from B) → a mismatched pair that 401/403s forever.
- De-dupe concurrent sign-ups with a single shared **in-flight promise**: check-and-set the promise with **no `await` between the check and the assignment** so it's atomic on the single-threaded event loop; all callers await the same request.
- Add a **self-heal**: on a 401/403 from an authed call, clear the cached session and re-auth once. This only sticks if the session lives in `storage.local` (see above).

---

## 11. QA a loaded (unpacked) extension via browser automation

- **Recent Chrome ignores `--load-extension`** on a normal profile (anti-abuse). Load once via `chrome://extensions` → Developer mode → Load unpacked; it persists across restarts. To pick up a rebuild without GUI, **quit + relaunch** the browser — the unpacked registration persists.
- A DOM-automation tool that connects **through an installed helper extension** can drive content injected into normal web pages, but usually **cannot open `chrome://` or `chrome-extension://`** pages (the extension's own popup/side panel). Drive those with screen automation, or design the test to avoid them.
- Screen-automation focus is unreliable when several terminal/agent windows compete for foreground (clicks/keystrokes land in the wrong window). **Activate the target app deterministically via the OS scripting layer first** (macOS: `osascript -e 'tell application "Google Chrome" to activate'`, then open the URL), and confirm the intended window is frontmost before acting.
- **Fastest way to seed a known-good session into a content script for a test:** create a valid session against the API, then set the token/id into the **page origin's `localStorage`** (content scripts read page `localStorage`, and a well-written client uses it as a fallback) — sidesteps the extension's `chrome://`-only storage UI entirely.
- **Coordinate scaling:** a DOM tool's screenshot is often a fixed fraction of CSS-viewport pixels. Measure the ratio once (a known element's `getBoundingClientRect` vs its position in the screenshot) and scale click coordinates by it, or clicks miss.
- **Scripted HTTP clients get bot-blocked** by some CDNs (e.g. a Cloudflare `1010`). Send a real browser `User-Agent` and the site's expected `Origin` header.

---

## Checklist

- [ ] `src/manifest.json` MV3; dual `background` (service_worker + scripts); `gecko.id` + `strict_min_version` + `data_collection_permissions`.
- [ ] Code uses `globalThis.browser ?? globalThis.chrome`, promise-style, optional perms behind a user gesture.
- [ ] CSP declares `'wasm-unsafe-eval'` if wasm; workers same-origin (`worker-src 'self'`, no `blob:`); remote origins in `connect-src`/`img-src` + `host_permissions`; libs vendored, no CDN.
- [ ] Local-AI path (if any) probes capability and degrades to a working floor; model output validated, never `eval`'d.
- [ ] `web-ext lint` clean (dual-background warning expected); built package verified as loaded add-on, not just `web-ext run`.
- [ ] AMO: 2FA set up (human), agreement accepted, listed/unlisted confirmed, reviewer notes cover network + licenses.
- [ ] Chrome: $5 registration done, same zip uploaded as a draft, screenshots added, single-purpose + per-permission justifications + data-use disclosure filled, then Submit for review.
- [ ] Pre-submission audit (§8): own code free of `eval`/dynamic-`innerHTML`/remote code; vendored libs shipped **unminified** + licensed; `web-ext lint` 0 errors; minimal justified permissions; privacy policy URL live.
- [ ] Content-script insertion (§9): activate the field, insert via `execCommand('insertText')` (not `textContent`), and confirm the target's Post/Send button actually **enables**.
- [ ] Session state (§10): tokens in `storage.local` not `sync`; concurrent auto-sign-ups de-duped via one in-flight promise; self-heal (clear + re-auth) on 401/403.
- [ ] QA (§11): loaded via `chrome://extensions` (not `--load-extension`); target app activated deterministically before automation; screenshot→click coordinates scaled; test HTTP calls send a browser UA + `Origin`.
