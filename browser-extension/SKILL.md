---
name: browser-extension
description: "Use when building a cross-browser (Firefox + Chrome) Manifest V3 web extension from scratch and/or submitting it to the stores. Covers the one-manifest-two-browsers layout, the CSP rules that break WebAssembly and web workers (and the same-origin-worker fix), on-device AI via Firefox `browser.trial.ml` and Chrome's built-in Prompt API, `web-ext` build/lint, and the full store-submission flow per browser — AMO (addons.mozilla.org) including the mandatory 2FA/AAL2 gate, and the Chrome Web Store. Triggers: 'build a browser/Firefox/Chrome extension', 'MV3 extension', 'submit to AMO', 'publish to Chrome Web Store', 'web-ext', 'sign my add-on', 'extension CSP blocks my worker/wasm', 'local AI in an extension'."
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
- **agent-browser can't do the screenshot upload.** It drives a bundled *Chrome for Testing over a unix socket* (not `--remote-debugging-port`), so `chromium.connectOverCDP('http://localhost:9222')` fails ("not a DevTools server"), and it exposes no file-chooser or JS-eval command. Either launch your own Chrome with a real TCP debug port + a Playwright filechooser script, or hand the drag to the user and just click Submit afterward.
- **Wrong-Google-account trap.** The listing is owned by one Google account. In a multi-account/SSO Chrome (e.g. a work + personal setup) the console silently resolves to the wrong account and **redirects to `/devconsole/register`** — that redirect means "not the owner account," not "not registered." `?authuser=` switching is unreliable; the fix is selecting the right account/profile in the browser. Managed (work) accounts can't own a personal listing.
- Uploading the package trips "publish to a public registry" guards in agentic setups even though it only creates a private draft — get explicit user go-ahead; let the user do the Google login and $5 payment.

---

## Checklist

- [ ] `src/manifest.json` MV3; dual `background` (service_worker + scripts); `gecko.id` + `strict_min_version` + `data_collection_permissions`.
- [ ] Code uses `globalThis.browser ?? globalThis.chrome`, promise-style, optional perms behind a user gesture.
- [ ] CSP declares `'wasm-unsafe-eval'` if wasm; workers same-origin (`worker-src 'self'`, no `blob:`); remote origins in `connect-src`/`img-src` + `host_permissions`; libs vendored, no CDN.
- [ ] Local-AI path (if any) probes capability and degrades to a working floor; model output validated, never `eval`'d.
- [ ] `web-ext lint` clean (dual-background warning expected); built package verified as loaded add-on, not just `web-ext run`.
- [ ] AMO: 2FA set up (human), agreement accepted, listed/unlisted confirmed, reviewer notes cover network + licenses.
- [ ] Chrome: $5 registration done, same zip uploaded as a draft, screenshots added, single-purpose + per-permission justifications + data-use disclosure filled, then Submit for review.
