# Presenter

A talking-head avatar in a corner card, speaking over the real footage. It makes a demo personal, and it works
in any style. The script does not narrate the screen: a founder speaking to the viewer works better.

First shipped: foxpilot, with the [Keynote whip](keynote-whip.md) style.

## Choose the look

Use HeyGen's current API, `GET /v3/avatars/looks?limit=50` (50 at most), to list the account's looks.

- A **digital twin** (`avatar_type: digital_twin`) is filmed footage of the person. It is the most natural, and it
  keeps the person's real room.
- **Photo-avatar looks** give the same person different clothes and camera angles. In a set of videos, use a
  different look in each video that has a presenter.
- Use the person's own cloned voice (`GET /v3/voices`, or the look's `default_voice_id`).

## Write the script

- About 50 words for about 19 s at speed 1.08.
- Write it as the maker talking: why it exists, what it does for the viewer, an invitation. The first one was:

  > Hi, I'm Pooria. I built foxpilot because I wanted an agent that lives in my browser, not in someone else's
  > cloud. You tell Firefox what you want, and it does the clicking. The model runs right on your laptop, so your
  > goals never go to a cloud model. It's free and open source. Give it a goal, and tell me what it should learn next.

- Check every claim against the product, the same as on-screen copy. Say "your goals never go to a cloud model",
  not "nothing leaves your machine", when the product still loads web pages.

## Render it

`POST /v3/videos` with `type: avatar`, `avatar_id`, `voice_id`, `script`, `aspect_ratio: "1:1"`,
`resolution: "1080p"`, `fit: "cover"` and `voice_settings: {speed: 1.08}`. Poll `GET /v3/videos/{id}` until
`completed`, then download `video_url`. The first one took about 3 minutes for 18.8 s.

Keep the avatar's own background. A transparent background needs `output_format: "webm"` and an avatar trained with
matting, and alpha WebM adds risk in the render.

## Place it

- A 330 × 330 card, bottom-right (70 px from the right, 96 px from the bottom), 30 px radius, a 6 px white border
  and a soft shadow. A mono name tag sits under it: "Pooria · made foxpilot".
- Enter 1 s in: `scale 0.6 → 1` from the bottom-right corner, `expo.out`, 0.6 s. Leave as the voice ends:
  `scale 0.85`, fade, `expo.in`, 0.35 s, before the finale, so the wordmark owns the frame.
- Keep the side-column copy and the footage card clear of the card's area.

## Mix it

- The voice stays on the avatar's `<video>` (`data-has-audio="true"`, volume 1).
- Duck the music with its automation lane: 1.0 for the hook, down to 0.26 over 0.4 s as the voice starts, back to
  1.0 over 0.6 s as it ends. The voice renders at about −23 dB, so do not push the bed higher.
