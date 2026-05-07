---
name: email-subscriptions
description: "Use when the user wants to do an unsubscribe pass on email — identifying senders the user no longer reads, mass-unsubscribing via List-Unsubscribe headers and one-click endpoints, and archiving historical mail from those senders. Companion to gmail-organizer. Triggers: 'unsubscribe from newsletters', 'stop email spam', 'clean up email subscriptions', 'inbox unsubscribe pass'."
---

# Email Subscriptions Organizer

Mass-unsubscribe pass on Gmail (or any IMAP-accessible mailbox).

## Status

🟡 **Stub** — scaffold only. Another agent is building this.

## Requirements

- Gmail account access (`gws` CLI or Gmail API), or any IMAP mailbox.
- Sender frequency analyzer (read-only).

## Step 1 — Ask the User First

```
1. Account scope — personal / work / both?
2. Threshold — show senders with > N emails in last 12 months who you've opened < M times?
3. Approval style — per-sender (most control), bucket-of-similar (fast), or "unsubscribe everything-shopping/everything-news"?
4. Post-unsubscribe — also archive their historical emails?
5. Whitelist — list senders to never unsubscribe from (banking, family, security alerts)?
```

## Steps (TBD)

1. **Inventory** — count messages per sender domain, last-opened heuristic from Gmail metadata.
2. **Classify** — actionable / newsletter / shopping / notification / other.
3. **Plan** — proposed unsubscribe list.
4. **Approve** — batch by category.
5. **Apply** — fire `List-Unsubscribe` headers, log per-sender result.
6. **Verify** — re-scan inbox after 1 week to confirm sender frequency dropped.

## Surface-specific notes

- **`List-Unsubscribe` is the gold standard** — RFC 8058 one-click unsubscribe. Most modern senders comply.
- Some senders' unsubscribe links require a logged-in browser session (terrible UX) — flag those for manual.
- Don't auto-unsubscribe from any banking, government, or security-alert sender. Default whitelist.
- Unsubscribe = sender stops sending. Already-received mail sticks around — separate archive pass.

## See also

- [`../_lib/taxonomy.md`](../_lib/taxonomy.md)
- [`../_lib/patterns.md`](../_lib/patterns.md)
- [`../gmail/SKILL.md`](../gmail/SKILL.md) — runs the broader Gmail pass; this is the focused unsubscribe slice
