---
name: deskflow-gesture-relay
description: "Relay Mac trackpad gestures (3/4-finger swipes, pinches) to a Windows client across a Synergy-style KVM such as Deskflow, which forwards keys and mouse but not multi-touch. Covers the two findings that decide the design: synthetic keystrokes only forward when posted at the HID event-tap location, and 3/4-finger frames are invisible to a CGEventTap while the cursor is on the client, so detection must read the trackpad via MultitouchSupport. Use when gestures work on the Mac but do nothing on the remote machine, or when a scripted keystroke lands on the wrong machine."
---

# Deskflow gesture relay — trackpad gestures across a KVM

## Purpose
Relay Mac trackpad gestures to a Windows client while the Mac is the KVM server. Native macOS gesture behaviour must not change.

## Architecture
- Mac = KVM server (Deskflow). Windows 11 PC = client.
- Mac detects a gesture, posts a keyboard chord `ctrl+option+shift+1..6`.
- AutoHotkey v2 on Windows converts each chord to a Windows action.

Digits and function keys are layout-stable. Letters are not.

---

## Decision Tree

### 1. How to post the chord so Deskflow forwards it

Deskflow captures at the HID event-tap location.

- `CGEventPost(kCGHIDEventTap)` — **forwarded** to the client.
- `CGEventPost(kCGSessionEventTap)` — injected downstream, **invisible** to Deskflow. Lands on the Mac.

`hs.eventtap.event:post()` (Hammerspoon) and `System Events keystroke` (AppleScript) both use the session tap. They silently fail to forward.

```swift
// Correct: HID tap so Deskflow sees it
CGEvent(keyboardEventSource: src, virtualKey: 0x12, keyDown: true)?
    .post(tap: .cghidEventTap)
```

Test with the HID tap. A session-tap test gives a false negative and will wrongly kill the design.

### 2. How to encode modifiers

Setting `CGEventFlags` (`.maskControl`, `.maskAlternate`, `.maskShift`) on the key event does **not** forward. Verified: `ctrl+alt+shift+F1` arrived as plain `F1`.

Post real key events for each modifier:

```
keyDown ctrl  (59) → keyDown option (58) → keyDown shift (56)
→ keyDown/keyUp main key (e.g. 0x12 for "1")
→ keyUp shift → keyUp option → keyUp ctrl
```

Insert a short delay (~5-10 ms) between events.

### 3. How to read gestures while the cursor is on the client

A `CGEventTap` on gesture events works only when the cursor is on the server screen. When the cursor is on the client, Deskflow swallows the stream: the tap tops out at 2 touches. 3- and 4-finger frames never arrive.

Use the private `MultitouchSupport.framework` — it reads the device below the interception point:

```swift
import Foundation
let handle = dlopen(
  "/System/Library/PrivateFrameworks/MultitouchSupport.framework/MultitouchSupport",
  RTLD_NOW)
```

```swift
let list = MTDeviceCreateList(0, 0, 0) // CFArray of raw device pointers
for i in 0..<CFArrayGetCount(list) {
  let dev = CFArrayGetValueAtIndex(list, i)
  MTRegisterContactFrameCallback(dev, myCallback)
  MTDeviceStart(dev, 0)
}
```

This works regardless of cursor location.

---

## MultitouchSupport Gotchas (Swift)

- Callback signature: use `UnsafeMutableRawPointer` for the struct pointer under `@convention(c)`. Cast inside with `assumingMemoryBound(to:)`.
- `MTDeviceCreateList` returns a `CFArray` that does **not** bridge to a Swift `Array` via `as?`. Walk it with `CFArrayGetCount` / `CFArrayGetValueAtIndex`.

## Gesture Frames

Gesture events interleave empty frames (zero-touch array). Do **not** treat an empty frame as "fingers lifted" — it resets accumulated swipe distance every other frame and the swipe never reaches threshold. Ignore zero-touch frames.

## Is the Cursor on the Remote Screen?

`CGCursorIsVisible()` is removed in macOS 26. Working substitute: while the cursor is on the client, Deskflow parks the local cursor at the exact centre of the primary display.

```swift
let center = CGPoint(
  x: NSScreen.main!.frame.midX,
  y: NSScreen.main!.frame.midY)
let remote = hypot(cursor.x - center.x, cursor.y - center.y) < 4
```

## Verification Steps

1. Post a chord at `kCGHIDEventTap` with real modifier key events. Confirm it arrives on the client (check AHK hotkey fires). A session-tap post that stays on the Mac is expected — it is not a failure of the chord.
2. With the cursor on the client, perform a 3-finger swipe. Confirm the MultitouchSupport callback still reports 3+ contacts. An event-tap that reports max 2 is expected while remote.
3. Hold a swipe and confirm accumulated distance is not reset on alternate frames (empty-frame handling).
4. Check `cursor-near-centre` correctly reflects remote vs local before you gate chord emission.

## Constraints

- Do not swallow or reinterpret gestures on the Mac. Emit chords only.
- Use digits / F-keys for chords. Letters are layout-dependent (see script notes).

## Related trap: modifier-plus-click across the KVM

The same "one key-down, never repeated" behaviour breaks modifier+click. A
Windows-side script that releases the forwarded Win key in order to substitute
Ctrl leaves Win logically up for the rest of the physical hold, so every later
click in that hold arrives bare and clears the selection instead of extending
it. Add the modifier you need on top and leave the forwarded one held.

Verify by effect, not by log: a script's synthetic clicks are invisible to
another script's hotkeys, so the absence of a logged click proves nothing. Query
the application state instead (for Explorer, `Shell.Application` →
`Document.SelectedItems().Count`).
