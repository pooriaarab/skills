---
name: ci-browser-on-ichabod
description: "Use when a GitHub Actions E2E job should drive a cloud browser (Ichabod: remote Firefox over WebDriver BiDi, or Chromium over CDP) instead of installing Firefox or Chrome on the runner, or when one run should cover several Gecko versions plus Chromium in parallel. Covers the workflow YAML, secrets, the quick-tunnel pattern for local test pages, installing a WebExtension from base64, the moz-extension: page limit and its workaround, the session cap and retry rules, measured timings, and the failure modes."
---

# CI browser on Ichabod

The runner still runs the job. It builds, serves the test pages and runs the test script. Only the
browser moves: the script connects to a Firefox or Chromium on Ichabod, Mozilla's cloud browser
service. Nothing installs a browser on the runner.

**Use it when:**

- An E2E job spends its time installing or caching a browser.
- One run should cover Gecko 155, 156 and 157, and Chromium, without a browser per runner image.
- You want a session recording of the run as proof.

**Do not use it when:**

- The test needs Firefox preferences, a custom Firefox binary, a headed window, or system access.
  The cloud browser is pre-started and refuses all four (see Limits).
- The suite needs more parallel browsers than the session cap allows (about 5 at once).

## Setup

Two secrets per repository. Pipe the values from a secrets file; never echo them.

| Secret | What it is |
|---|---|
| `ICHABOD_API_KEY` | The project API key. It goes in a Basic `Authorization` header with user `api`. |
| `ICHABOD_WS_URL` | The API host as `wss://<host>`, with no path. |

```bash
set -a; . <secrets file>; set +a
printf %s "$ICHABOD_API_KEY" | gh secret set ICHABOD_API_KEY -R <owner>/<repo>
printf %s "$ICHABOD_WS_URL"  | gh secret set ICHABOD_WS_URL  -R <owner>/<repo>
```

Endpoints under `ICHABOD_WS_URL`:

| Path | Browser | Protocol |
|---|---|---|
| `/gecko/latest`, `/gecko/157`, `/gecko/156`, `/gecko/155`, `/gecko/latest-N` | Firefox | WebDriver BiDi |
| `/cdp/chromium/latest` | Chromium 154 | CDP |

An unsupported version answers HTTP 400. Add `?record_session=false` to skip the recording.

## The workflow job

One matrix leg per Gecko version. Start it with `continue-on-error: true` and remove that once the
job has been green for a while.

```yaml
  e2e-ichabod:
    runs-on: ubicloud-standard-2   # the job waits on a remote browser; a small runner is enough
    timeout-minutes: 15
    continue-on-error: true
    strategy:
      fail-fast: false
      matrix:
        gecko: ["155", "156", "157"]
    steps:
      - uses: actions/checkout@<sha>
      - uses: pnpm/action-setup@<sha>
      - uses: actions/setup-node@<sha>
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Install cloudflared
        run: |
          sudo curl -fsSL -o /usr/local/bin/cloudflared \
            https://github.com/cloudflare/cloudflared/releases/download/2026.10.0/cloudflared-linux-amd64
          sudo chmod +x /usr/local/bin/cloudflared
      - run: pnpm e2e:ichabod
        env:
          ICHABOD_API_KEY: ${{ secrets.ICHABOD_API_KEY }}
          ICHABOD_WS_URL: ${{ secrets.ICHABOD_WS_URL }}
          ICHABOD_GECKO: ${{ matrix.gecko }}
```

Secrets do not reach pull requests from forks, so this job only runs on branches of the repository.

## The test script

The parts every script needs, in order:

1. **Serve the test pages** on `127.0.0.1:<port>`.
2. **Open a quick tunnel and the session at the same time.** Both take seconds, so run them with
   `Promise.allSettled` and close whichever opened if the other fails.
3. **Install the extension** with BiDi `webExtension.install` and a base64 zip.
4. **Load the first page in a retry loop.** A new quick tunnel answers 530 or 502 for a few seconds.
5. **Run the checks, then tear down with a time limit**, and call `process.exit()`. An open
   WebSocket or a `cloudflared` child otherwise holds the step: one run spent 29 s of 46 s there.

Connect over BiDi with your own WebSocket, so the key stays in a header and the session ID is
visible:

```js
import puppeteer from "puppeteer-core";

const endpoint = `${process.env.ICHABOD_WS_URL}/gecko/${process.env.ICHABOD_GECKO ?? "latest"}`;
const authorization = `Basic ${Buffer.from(`api:${process.env.ICHABOD_API_KEY}`).toString("base64")}`;

async function connectOnce(timeoutMs = 45_000) {
  const ws = new WebSocket(endpoint, { headers: { authorization } }); // Node 22+ global WebSocket
  const attempt = (async () => {
    await new Promise((ok, fail) => { ws.addEventListener("open", ok); ws.addEventListener("error", fail); });
    const transport = { send: (m) => ws.send(m), close: () => ws.close() };
    ws.addEventListener("message", (e) => transport.onmessage?.(String(e.data)));
    ws.addEventListener("close", () => transport.onclose?.());
    return puppeteer.connect({ transport, protocol: "webDriverBiDi", defaultViewport: null });
  })();
  const limit = new Promise((_, fail) => setTimeout(() => fail(new Error("no session (all in use?)")), timeoutMs));
  try { return await Promise.race([attempt, limit]); } catch (error) { ws.close(); throw error; }
}

// Retry: 4 tries, 15 s x try number between them.
// Install the extension:
await browser.connection.send("webExtension.install", {
  extensionData: { type: "base64", value: zipBuffer.toString("base64") },
});
```

`webExtension.install` with `type: "path"` fails: the path is on the remote machine.

## Extension pages: the limit and the workaround

Ichabod's Firefox runs without `-remote-allow-system-access`. With that flag missing:

| Action on a `moz-extension:` page | Result |
|---|---|
| Navigate a tab to it | `Navigation to "moz-extension://…" is not allowed in this context` |
| `script.evaluate` in a tab the extension opened | `System access is required` |
| `captureScreenshot` of that tab | `System access is required` |

Content scripts on ordinary pages work, and so does anything an ordinary page can reach.

What works today, with no extra code:

- Test content scripts on real or tunnelled pages.
- Serve the popup or options HTML as a plain page with a stub `browser` object, and load the
  background script into the same page. That checks the UI and the logic, not the real
  extension APIs.
- Keep the checks that need the real popup (real storage, real `publicSuffix`, and so on) in a
  runner-Firefox job until the workaround below is in your test harness.

The workaround: list the extension pages as `web_accessible_resources` for one https origin only,
the tunnelled test page, and open each page in an iframe on that page. BiDi can script an
extension page in a frame. A framed page gets only part of the WebExtension API (runtime, storage,
i18n), so a test-only background script relays the other namespaces over a port. The
`create-foxkit/e2e` harness builds this into its remote mode (`FOXKIT_BROWSER=ichabod`) in the
release after 0.1.1. Add the extra manifest entries only to the test zip, never to the build you
ship.

## Limits and failure modes

| Symptom | Cause | What to do |
|---|---|---|
| WebSocket opens, `session.new` never answers, or the socket closes with 1006 after ~10 s | All sessions are in use | Time-limit each try (45 s), back off, retry |
| A run right after another fails to connect | A closed session frees its slot 30 to 90 s later, not at once | Space bursts out; do not size retries to zero |
| CDP connect fails fast with `Target closed` | The cap, on the Chromium path | Same retry |
| `quick tunnel provisioning failed with status 429` | Too many quick tunnels from one IP | Reuse one tunnel per process; runners rarely hit this, a busy laptop does |
| First page load takes 30 s or more | The new tunnel hostname is not live yet | Retry the first `goto` for up to a minute |
| `prefs`, `args`, a Firefox binary or a headed window have no effect | The browser is pre-started (`session.new` answers in ~0.2 s) | Run that test on the runner, or change the test |
| `about:config` and `moz-extension:` navigation refused | No system access | See the workaround above |
| `emulateMediaFeatures` (dark mode) throws | Puppeteer needs CDP for it | Rewrite the media query for the test |
| Chromium user agent says `HeadlessChrome` | Headless build | Expect bot walls on some sites |
| `http://127.0.0.1` refused | Localhost is the cloud machine, not the runner | Tunnel the runner's server |

The cap is shared by every session on the key, across Firefox and Chromium. In one sequential test
5 Firefox sessions held at once and the 6th timed out; with 1 Firefox session open, 3 Chromium
sessions held. A 3-leg matrix fits; a 10-leg matrix does not.

## Measured numbers

From a real Actions run (3 Gecko legs on `ubicloud-standard-2`, an 8-check popup flow through a
quick tunnel), against the same repository's runner-Firefox job on `ubuntu-latest`:

| Job | Wall time | Browser part |
|---|---|---|
| Runner Firefox (`setup-firefox` + test) | 40 s | install Firefox 10 s, test 6 s |
| Ichabod, per Gecko leg | 36 to 40 s | test step 18 to 19 s |

Inside the Ichabod test step (ms): connect 1250 to 2170, tunnel 5100 to 6000 (parallel with
connect), extension install 260 to 330, first page 1600 to 2200, an 8-check flow 9300 to 9400,
teardown about 210.

From a laptop, outside CI: warm `session.new` 0.2 to 0.7 s, a cold start 9 to 11 s, a page load on
a held session 110 to 650 ms. Each `page.evaluate` is a round trip to the cloud browser, so a
polling-heavy test runs slower than on a local Firefox. Batch reads into one `evaluate`.

## Related

- `claude-in-cloud-browser`: Claude drives the same cloud browser for QA and research jobs.
- `e2e-ci-economics`: decide whether a browser leg should be on the pull-request path at all.
