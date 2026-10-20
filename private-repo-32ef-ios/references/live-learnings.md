# Live learnings (iPhone 12 Pro Max, iOS 27 beta)

Each item says how sure we are. "Seen" means it happened on the phone. "Not tested" means it is a guess.

## Screenshots are cut off (seen)

- The phone screen is 428x926 points. WDA says so at `/window/size`.
- The WDA and Appium screenshot is 1124x2436 pixels. That is the top-left 375x812 points at 3x.
- The right side and the bottom 114 points are missing. The like, comment and share icons are in the missing part. The tab bar is missing too.
- The farm checks for a dark tab bar in the bottom 10% of the image. It finds none. It reports "springboard" with 0.90 confidence while TikTok is in front.
- Proof: the Settings icon sits at x=326 points in the WDA element tree. It appears at about 329 points in the screenshot. So the scale is 3x, and the image is a crop.
- A `UILaunchScreen` key in the runner `Info.plist` did **not** fix it. Do not repeat that.
- The repo's `iphoneX` profile is 375x812. A phone in Zoomed mode matches it, and a screenshot is then whole. Not tested: Zoomed mode. On this iOS version the Display & Brightness page had no Display Zoom row.
- Result: with Display Zoom at Default, the farm cannot read the screen. Do not use Default on a phone larger than 375x812 until the capture is fixed.

## Launching TikTok (seen)

- WDA and Appium `activateApp` return "foreground" (state 4) while SpringBoard stays on screen.
- `xcrun devicectl device process launch --device <udid> [--terminate-existing] <bundleId>` opens the app every time.
- The farm now launches with `devicectl` (`src/devices/devicectl.ts`) and sets `appium:autoLaunch: false`.

## Do not poke WDA while a run is active (seen)

- A second WDA session created by hand ends the farm's Appium session. The run then fails with "Session does not exist".
- Use the farm routes instead: `/api/devices/<udid>/remote/screenshot` and `/remote/action`.

## Do not read the page source of TikTok (seen)

- `GET /source` on the TikTok feed hangs, and WDA then stops. The supervisor restarts it in about 30 seconds.
- Read icon positions from screenshots. Read the element tree only in Settings and SpringBoard.

## Other apps on the phone (seen)

- A "back to TikTok" link in the status bar led to another app, and the next back led to a third. Do not tap the back link. Launch the target app with `devicectl`.
- Never send taps while a personal app is in front. One screen had a "Switch recorder off" button.
- An Exchange account alert ("Password Incorrect") can appear over Settings. Tap Cancel. Never type a password.

## Wi-Fi (seen)

- Taps, swipes and screenshots work over Wi-Fi while WDA runs.
- The WDA supervisor starts WDA only for a USB phone. After a crash, plug the cable in once.

## Human-like input (done, not yet shown to help)

- The old swipe was one straight line: same X, same start and end, same time, 40 ms hold.
- `src/tiktok/human-gesture.ts` builds a curved stroke with 9 to 12 points. The speed rises then falls. The start, end, drift and total time vary. The finger rests 30 to 140 ms before it moves. One swipe in eight pauses mid-stroke.
- The wait after a swipe now follows a log-normal curve, not a flat 550 to 800 ms range.
- Touch pressure is not set. XCTest touches carry no force on this phone.
- Not tested: whether TikTok can tell the difference. Treat the change as less obvious, not as safe.
