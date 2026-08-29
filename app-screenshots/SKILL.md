---
name: app-screenshots
description: "Use when you need store-ready or marketing screenshots of a web app or browser extension — capturing real UI/gameplay headlessly and compositing it into polished framed images and promo tiles. Covers the headless-capture recipe (mock the host APIs, drive the real pages, screenshot the live surface), the beautify pass (frame real pixels on a branded gradient with a caption — never fake the UI with AI), exact Chrome Web Store / App Store / Play sizes, and optional AI hero art for promo tiles only. Triggers: 'screenshots for the store listing', 'App Store / Chrome Web Store / Play screenshots', 'promo tile', 'marquee image', 'capture my extension/app UI', 'beautify these screenshots', 'marketing images for my app'."
---

# App & Extension Screenshots (capture + beautify)

Two jobs, kept separate:
1. **Capture real pixels** — screenshot the actual running UI/gameplay headlessly.
2. **Beautify** — composite those real pixels into a framed, branded image at the store's exact dimensions.

**Hard rule: the product screenshots must show the real product.** Stores (Apple, Google, Chrome Web Store, AMO) reject listings whose screenshots are AI-generated mockups or don't match the shipped UI. AI image generation is fine for *promo/marketing tiles* (hero art, feature banners) — never for the screenshots that claim to show the app.

Describe-only: this is the approach. Write the capture/compose scripts in the target repo (a ~150-line headless-browser script covers it).

---

## 1. Capture the real UI

Drive the actual app pages with a headless browser (Playwright/Puppeteer). You don't need the full runtime — you need the pixels.

- **Serve the app** the same way its tests do (static server, dev server, or the built bundle). Reuse the existing e2e harness if there is one — it already knows how to boot the UI.
- **Mock only the host APIs that gate rendering**, not the UI itself. For a browser extension served as plain pages, inject a stub for `browser`/`chrome` (`permissions`, `tabs`, `runtime.getURL`, `storage`, …) and any model/network client, so pages render without the extension host. Keep the mock minimal — the goal is real UI, only faked plumbing.
- **Reach the interesting state.** Navigate, fill inputs, click through to the screen worth showing. For anything animated (games, canvases, charts), send a short input burst and wait a beat so the frame shows *activity*, not an empty title screen.
- **Screenshot the live surface.** Full-page for a whole-UI shot; element-scoped (`locator.screenshot()`) for one canvas/panel. Element shots also work for WebGL/canvas — the compositor captures them.
- **Determinism:** seed any RNG/clock so captures are repeatable (and so a game shows a sensible, not degenerate, board).

---

## 2. Beautify (frame the real pixels)

Raw UI is often the wrong aspect ratio (e.g. a tall 400×600 game canvas vs a 1280×800 landscape slot). Don't stretch it — **frame it**.

The reliable technique: build a small HTML/CSS template at the exact target size, drop the captured image in, and screenshot *that* in the same headless browser.

- **Embed the captured image as a `data:` URL**, not `file://`. A page created with `setContent` / `about:blank` has an opaque origin, and Chromium **blocks `file://` images and CSS backgrounds** from it — they render as broken-image boxes. Base64-inline the PNG; inline SVG logos as markup.
- **Frame recipe that reads as premium:** the real screenshot in a rounded card with a soft drop-shadow, on a branded gradient, with a headline + one-line caption beside it, and the wordmark/logo. Real pixels inside an honest frame — allowed everywhere.
- **Set the viewport to the exact output size and `deviceScaleFactor: 1`** so the screenshot is precisely W×H (stores validate dimensions). Need @2x/retina assets? Render at the target logical size with `deviceScaleFactor: 2` **only** where the store wants 2×.

---

## 3. Store dimensions (check current docs; these are the common ones)

| Surface | Screenshot | Icon | Promo / feature |
|---|---|---|---|
| **Chrome Web Store** | 1280×800 or 640×400 (≥1 required) | 128×128 store icon | small promo tile 440×280, marquee 1400×560 (optional) |
| **Firefox AMO** | any reasonable size (optional — but add them) | derived from manifest | — |
| **Apple App Store** | per-device sets (e.g. 6.7" 1290×2796) | 1024×1024 | — |
| **Google Play** | 16:9 or 9:16, ≥320px, ≤3840px (2–8) | 512×512 | feature graphic 1024×500 |

Chrome is the strictest on exact pixel size — match it exactly or upload fails.

---

## 4. Optional: AI hero art for promo tiles

For the *marketing* tiles only (feature graphic, marquee, promo banner), an image model (gpt-image, etc.) can generate a hero background. Then overlay the real wordmark/logo + tagline with the same HTML/CSS compositor.

- Prompt for **text-free** art (`no text, no words, no letters`) and leave negative space where the wordmark goes — models render garbled type, and you want the real logo anyway.
- Image models emit fixed sizes (1024², 1536×1024, …). Generate the nearest, then let the compositor crop/cover to the tile's exact dimensions.
- **Always have a no-AI fallback:** a designed brand gradient + logo makes a clean tile with zero external dependency. If the key/model is unavailable, fall back to it rather than shipping nothing. (Credentials for a hosted model may be absent, placeholder-only in `.env*.example`, or scoped to a different project — degrade gracefully.)

---

## Checklist

- [ ] Product screenshots are the **real UI** (framed, not AI-faked).
- [ ] Captured headlessly against the served app; host APIs mocked minimally; animated surfaces show activity.
- [ ] Beautified via an exact-size HTML template; images embedded as `data:` URLs (no `file://`); logos inlined.
- [ ] Output matches the store's exact dimensions (`deviceScaleFactor` set intentionally).
- [ ] AI used (if at all) only for promo/marketing tiles, text-free, with a no-AI brand-gradient fallback.
- [ ] Capture script is repeatable (seeded, committed) so re-shooting after UI changes is one command.

## Related

- [pr-standards](../pr-standards/SKILL.md) — where a captured screenshot goes: GitHub user-attachments in the PR body, never a commit.
