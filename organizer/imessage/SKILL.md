---
name: imessage
description: "Use when the user wants to clean up iMessage / Messages.app on macOS — archiving stale conversations, identifying unread-but-irrelevant threads, exporting important conversations, and reducing clutter. Triggers: 'clean up iMessage', 'organize Messages', 'my Messages is overwhelming'."
---

# iMessage Organizer

Clean up Messages.app on macOS.

## Status

🟡 **Stub** — scaffold only.

## Requirements

- macOS Messages.app with iCloud Messages enabled.
- **`imsg` CLI** — `brew install steipete/tap/imsg` ([repo](https://github.com/steipete/imsg)). Read iMessage history via SQLite, send messages, manage conversations.
- Full Disk Access for the terminal so `imsg` can read `~/Library/Messages/chat.db`.
- AppleScript automation for some actions where `imsg` doesn't cover the action.

## Step 1 — Ask the User First

```
1. Scope — all conversations, or filter by date (e.g. "last 6 months only")?
2. Conversation classification — keep / archive / mute / delete?
3. Group chats — same treatment, or separate rules?
4. Attachment cleanup — purge old large attachments to free disk?
5. Aggressiveness — dry-run / archive-only / archive + delete-old-spam (verification codes, OTPs).
```

## Steps (TBD)

1. **Inventory** — read `chat.db` (read-only) for conversation list, last-message-date, message counts.
2. **Classify** — active (msg in last 30 days) / dormant / spam (one-shot OTP senders).
3. **Plan** — proposed archive/mute/delete list.
4. **Approve** — batch by category.
5. **Apply** — Messages.app supports limited bulk operations via AppleScript; some actions (delete conversation) are manual.
6. **Verify** — final state check.

## Surface-specific notes

- **`chat.db` is sandboxed.** Needs Full Disk Access for the terminal to read.
- Bulk delete of conversations isn't well-supported via AppleScript — many actions require manual UI driving (or `cliclick`).
- iMessage attachments live in `~/Library/Messages/Attachments/` and can hog disk — separate cleanup target.
- iCloud Messages: actions sync to all devices.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../mac/SKILL.md`](../mac/SKILL.md) — for attachment disk cleanup
