# TikTok

Open the app. Read the chrome. Do not scroll. Do not tap create, like, comment, or share
— unless running the warmup scripts (see [Warmup](warmup.md)).

This page records one phone on 2026-10-15. The frame was 500 by 1080.

## Open

1. Open the Social folder. See [Recipes](recipes.md).
2. TikTok is the dark icon in the center of page 1.
3. Click only when the grey circle sits on that icon.
4. The first frame was black. The next frame showed the app.
5. The top bar showed For You. Nearby, Following, and search were also in that bar.
6. The bottom bar showed home, friends, create, inbox, and profile.
7. Stop there. Do not tap create.

## Warmup script

```bash
warmup-tiktok [--rounds N] [--auto]
```

Does: FYP scroll, like, comment, inbox, follow. Randomized patterns.

## Leave

This leave is from 2026-10-16.

1. A drag that starts on the video scrolls the feed. Do not repeat that drag.
2. Do not tap the AirPlay banner.
3. Move the grey circle below the tab bar, onto the home indicator. Keep it off the tab icons.
4. Send raw `press`, then `move 0 -900`, then `release`.
5. The frame showed the app switcher. The cards were labeled LinkedIn and TikTok.
6. Do not drag a card up. Do not click a card title.
7. A click in the dark area above the cards returned to the Social folder. The folder was still open. That is a leave.

A Low Battery alert appeared over the app on an earlier pass. Low Power Mode was not tapped.