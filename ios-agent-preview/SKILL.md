---
name: ios-agent-preview
description: "Use when you need to see an iOS app running without driving Xcode by hand — streaming a simulator to a phone or browser, installing on a real device, or wiring macOS CI. Starts from the question that decides everything: whether the Apple Developer account is free or paid, because most sideloading tools silently require the paid program and fail late. Covers simmer, the free-account ceiling, Namespace macOS runners, xcodegen, and the traps that each cost a real cycle. Triggers: 'see the app on my phone', 'preview iOS without a cable', 'stream the simulator', 'iOS CI', 'sideload', 'TestFlight alternative', 'ad-hoc install'."
---

# Seeing an iOS app without driving Xcode by hand

## Answer this first, or you will waste an evening

**Is the Apple Developer account free or paid ($99/yr)?** Nearly every tool that
promises "install on your phone with no cable" assumes paid, and says so
nowhere obvious. Check before you install anything:

```bash
security find-identity -v -p codesigning | grep -ci distribution   # 0 means free
ls ~/Library/Developer/Xcode/UserData/Provisioning\ Profiles/ | wc -l
```

Zero distribution certificates and zero profiles means a **free** account, which
rules out most of the category:

| Route | Needs | Free account |
|---|---|---|
| Sign-and-serve install page (Sqim and similar) | ad-hoc provisioning | **No** |
| TestFlight, App Store Connect automation | paid program | **No** |
| Any ad-hoc or UDID-registered install | paid program | **No** |
| Streaming a simulator | nothing | **Yes** |
| Xcode, cable, Run | free identity, 7-day profile | **Yes** |

A free account still reaches a real device: connect once, press Run, and Xcode
does wireless debugging on the same network afterwards. The profile expires
after seven days.

## Streaming a simulator, which needs no signing at all

[`simmer`](https://github.com/joshdholtz/simmer) streams a booted simulator to a
browser and relays touch back.

```bash
brew install joshdholtz/tap/simmer
simmer --port 8901 --mode fast --quality 95 --fps 30
```

Four traps, in the order they bite:

1. **`--mode auto` hangs on "starting simmer…" forever**, because the `compat`
   path wants `idb-companion` and it is usually not installed. Use `--mode fast`,
   which captures through Quartz.
2. **`xcrun simctl boot` boots headlessly.** Quartz needs a real window, so the
   streamable list comes back empty and the picker looks broken. Run
   `open -a Simulator`.
3. **The picker lists devices it can boot, not devices that are booted.** A
   device you booted yourself vanishes from it. These are two different sets:
   check the streamable endpoint against the bootable one before concluding
   anything is wrong.
4. **Accessibility cannot attach to a launchd-parented CLI binary.** Screen
   recording grants fine, so video works, but touch relay may never work. Adding
   the binary by hand under Privacy & Security is the only lever and it can still
   report false.

For access from outside the network, tunnel it. The stream relays touch as well
as video, so an unauthenticated tunnel lets anyone with the URL control the app
under test, not just watch it — add an auth guard:

```bash
ngrok http 8901 --basic-auth "user:pass"
```

On ngrok's free tier the first request past the auth prompt shows an
interstitial the user must tap through — that blank page is not a broken link.

**Know what a stream cannot tell you.** It is video plus a touch relay. Good for
art, layout and flow. Useless for judging input latency, because the stream adds
its own. If latency is what you are evaluating, use a real device.

## Generate the Xcode project, do not commit it

Use [xcodegen](https://github.com/yonaskolb/XcodeGen) with a `project.yml` and
**gitignore the `.xcodeproj`**. Committing both leaves two sources of truth for
one target, and they drift silently.

```bash
xcodegen generate --spec app/project.yml
xcodebuild -project app/MyApp.xcodeproj -scheme MyApp \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```

## macOS CI

Cheap runner fleets are Linux, so an iOS build needs a macOS runner.
[Namespace](https://namespace.so) has them on Apple Silicon:

```yaml
runs-on: nscloud-macos-tahoe-arm64-6x14   # shapes: 6x14, 12x28, 12x56
```

Two findings worth keeping:

- **Namespace runner profiles cannot be macOS.** `nsc github profile create --os`
  accepts only `ubuntu-*`. Put the standard label in `runs-on` directly.
- **`nsc create --selectors macos.version=26.x` returns a Linux k3s cluster.** It
  reports success. A selector naming something that does not apply never errors,
  so verify what you got rather than trusting the exit code.

Do not let CI stop at a successful compile. Boot, launch, and confirm the process
is still alive seconds later, because a crash on launch still returns success
from `simctl launch`:

```bash
xcrun simctl bootstatus 'iPhone 17' -b
xcrun simctl install booted path/to/App.app
xcrun simctl launch --terminate-running-process booted com.example.app
xcrun simctl io booted screenshot proof.png
```

Upload that screenshot as a CI artifact so a reviewer sees the app ran, rather
than only that it built.

## Other tools, and what each is actually for

- [App-Store-Connect-CLI](https://github.com/rorkai/App-Store-Connect-CLI) —
  scriptable TestFlight, builds, submissions, screenshots. Paid program only. Its
  API key can submit apps in your name, so keep it out of the repository.
- [vphone-cli](https://github.com/Lakr233/vphone-cli) — scripted iOS VMs on the
  Mac. Never reaches a phone.
- [agent-simulator](https://github.com/jasonkneen/agent-simulator) — a simulator
  in a browser an agent can **inspect**. Inspection is the point: an agent that
  reads the view tree asserts on state rather than on pixels.
- `npx serve-sim` — accessibility-tree inspector for a running app.
- <https://reactnativefeel.com/sim> — simulator tooling reference.
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines) —
  read Games and Accessibility before designing any on-screen control.
