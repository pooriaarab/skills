---
name: org-spotify-playlist
description: "Use when the user wants to organize Spotify playlists — consolidating duplicates, sorting tracks within playlists, identifying playlists with no plays in N months, deleting empty/redundant playlists, and aligning naming conventions. Triggers: 'clean up Spotify', 'too many playlists'."
---

# Spotify Playlist Organizer

Clean up the user's Spotify playlist library via the Spotify Web API.

## Requirements

- Spotify account (Free or Premium).
- **`spogo` CLI** — `brew install steipete/tap/spogo` ([repo](https://github.com/openclaw/spogo)). Uses browser cookies (via `sweetcookie`) instead of OAuth Developer credentials, bypassing Spotify API rate limits.
- A logged-in Spotify session in Chrome / Safari / Firefox (one-time login at open.spotify.com).
- Optional alternative: Spotify Web API directly with OAuth client + scopes `playlist-read-private`, `playlist-read-collaborative`, `playlist-modify-private`, `playlist-modify-public`.

## Step 1 — Ask the User First

```
1. Scope — all playlists, or filter by created-by-me only?
2. Naming convention — capitalize / lowercase / freeform?
3. Duplicate detection — same name, near-duplicate track lists, or both?
4. Empty playlist policy — delete, archive (rename with prefix), or leave?
5. Track-level cleanup — remove duplicate tracks within a playlist? Sort by date added / by artist / leave?
6. "Liked Songs" — leave alone, or curate into themed playlists?
```

## Steps (TBD)

1. **Inventory** — list all playlists with counts, last-modified, last-played-track.
2. **Classify** — active / dormant / empty / duplicate-of-X.
3. **Plan** — proposed renames, deletes, consolidations.
4. **Approve** — batch.
5. **Apply** — `DELETE /playlists/{id}/followers` (unfollows = removes), rename, reorder tracks.
6. **Verify** — final playlist count.

## Surface-specific notes

- "Deleting" a playlist actually unfollows it — it remains on Spotify's servers. Cosmetic only.
- Collaborative playlists owned by others can only be unfollowed, not modified.
- Track ordering within a playlist: API requires `playlist_reorder_items` calls in sequence.
- Spotify rate limits: ~180 requests/minute. Sleep between batches.

## See also

- [`../_lib/taxonomy.md`](../org-life-organizer/_lib/taxonomy.md)
- [`../_lib/patterns.md`](../org-life-organizer/_lib/patterns.md)
