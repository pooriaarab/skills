---
name: macos-input-injection
description: "Post synthetic keyboard and mouse events on macOS reliably from an agent or automation tool. Covers CGEventPost tap locations (HID vs session) and which tools use which, why CGEventFlags modifiers are not always honoured downstream, the TCC permissions each API needs, the hs.task garbage-collection footgun that silently kills a spawned process, and the fact that macOS disables a slow event tap while hs.eventtap:isEnabled() keeps returning true. Use when injected keystrokes vanish, reach the wrong machine or app, or when an event tap mysteriously stops receiving events."
---

# macOS input injection for agents
For an AI agent that posts keystrokes, taps events, or runs child processes on macOS.

## 1. Event-Tap Location Decides Visibility

macOS has two post locations:

- `kCGHIDEventTap` (HID) — at the top of the event stream. KVMs and capture taps that sit at HID see these events.
- `kCGSessionEventTap` (session) — injected downstream. HID taps **do not** see them.

Deskflow captures at HID. Therefore:

- `CGEvent.post(tap: .cghidEventTap)` is forwarded to the KVM client.
- `CGEvent.post(tap: .cgSessionEventTap)` lands on the local Mac only.

Two common tools use the session tap:

```lua
-- Hammerspoon: uses session tap
hs.eventtap.event.newKeyEvent("1", true):post()
```

```applescript
-- AppleScript System Events: uses session tap
tell application "System Events" to keystroke "1"
```

Both silently fail to forward through a HID-capturing KVM. Do not use them to test forwarding — they give a false negative.

```swift
// Test with HID
let ev = CGEvent(keyboardEventSource: src, virtualKey: 0x12, keyDown: true)
ev?.post(tap: .cghidEventTap) // kCGHIDEventTap
```

## 2. Modifiers Must Be Real Key Events

Setting `CGEventFlags` on the main key event does not forward:

```swift
ev.flags = [.maskControl, .maskAlternate, .maskShift] // NOT forwarded
```

Verified: `ctrl+alt+shift+F1` arrived as plain `F1`.

Post separate key-down / key-up events for each modifier keycode:

- `ctrl` = 59, `option` = 58, `shift` = 56

```text
down ctrl → down option → down shift → down/up main key → up shift → up option → up ctrl
```

Add a small delay between events.

## 3. TCC / Permissions

Input injection and event taps require explicit TCC grants:

- Accessibility (for `CGEventPost` and `CGEventTapCreate`)
- Input Monitoring (for event taps on newer macOS)

If a tap creates but receives no events, or a post silently does nothing, check System Settings → Privacy & Security first.

## 4. Hammerspoon `hs.task` Is GC-Killed

```lua
-- BUG: handle is not retained, GC kills the child mid-run
hs.task.new("/usr/bin/python3", nil, {"chord.py"}):start()
```

A ~96 ms child process was killed before it finished posting the chord.

```lua
-- FIX: retain until exit callback fires
local t = hs.task.new("/usr/bin/python3", function() taskRef = nil end, {"chord.py"})
taskRef = t
t:start()
```

Always store the task handle in a reachable variable until its callback runs.

## 5. macOS Silently Disables a Slow Event Tap — and `isEnabled()` Lies

An event tap whose callback does blocking I/O (e.g. file write) at ~120 Hz during a gesture is killed by the OS. The tap stops delivering events.

`hs.eventtap:isEnabled()` keeps returning `true` for a tap that macOS has already disabled. Do not use it as a health check.

Correct pattern:

```lua
-- Buffer in memory, flush on a timer
local buf = {}
tap = hs.eventtap.new({hs.eventtap.event.types.gesture}, function(e)
  buf[#buf+1] = e -- no I/O here
  return false
end):start()

hs.timer.doEvery(1, function()
  if #buf > 0 then flush(buf); buf = {} end
end)

-- Health: judge by whether events are arriving, not by isEnabled()
```

## 6. How to Test Without False Negatives

- Never validate KVM forwarding with AppleScript or `hs.eventtap.event:post()` alone. Both use the session tap.
- Verify each link and the composition:
  1. Post at HID with real modifiers → confirm arrival on the client.
  2. Read gestures via MultitouchSupport (not an event tap) while the cursor is on the client.
  3. End-to-end: gesture → chord → client action, with cursor on the client.
- If `isEnabled()` says enabled but no events arrive, the tap is already dead. Recreate it and remove I/O from the callback.
