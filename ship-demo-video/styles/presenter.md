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

  > Hi, I'm <name>. I built foxpilot because I wanted an agent that lives in my browser, not in someone else's
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
  and a soft shadow. A mono name tag sits under it: "<Name> · made <product>".
- Enter 1 s in: `scale 0.6 → 1` from the bottom-right corner, `expo.out`, 0.6 s. Leave as the voice ends:
  `scale 0.85`, fade, `expo.in`, 0.35 s, before the finale, so the wordmark owns the frame.
- Keep the side-column copy and the footage card clear of the card's area.

## Mix it

- The voice stays on the avatar's `<video>` (`data-has-audio="true"`, volume 1).
- Duck the music with its automation lane: 1.0 for the hook, down to 0.26 over 0.4 s as the voice starts, back to
  1.0 over 0.6 s as it ends. The voice renders at about −23 dB, so do not push the bed higher.

## Selfie presenter (handheld, outdoors)

A studio look reads as staged. A handheld selfie in a real place reads as the maker talking to you, and it
needs no HeyGen photo look. First shipped: foxspace (Gothic Quarter) and foxprefs (Bunkers del Carmel), Barcelona.

1. **Still.** Edit real photos, not text-to-image: WaveSpeed `google/nano-banana-2/edit` with four originals
   from the `pooria-photo` skill's set, `aspect_ratio: "16:9"`, `resolution: "2k"`. Ask for one arm at
   arm's length leaving the frame, framed from the hair to the waist, a slight horizon tilt, mouth closed,
   and casual clothes. Reject any frame that shows the phone itself: the phone is the camera. A crop past the
   phone fixed one, because the arm then leaves the frame edge like a real selfie arm.
2. **Voice.** Reuse the cloned-voice audio from the HeyGen render, or make it with `POST /v3/voices/speech`.
3. **Talk.** `wavespeed-ai/infinitetalk` at 720p with the still and the audio. The output keeps the audio
   length exactly, adds handheld sway and moves people in the background. Prompt: "records a casual handheld
   selfie video ... slight handheld camera sway, glasses stay fixed on his face, background stays still".
4. **Cutout.** `scripts/personmask.swift` for the text-behind shots.

Cost per 24 s video: about $0.09 per still and about $0.06 per second for the talk (list prices). The HeyGen
Avatar V photo-look render it replaced cost about $0.12 per second (2026-10-23: $5.77 for 49 s).
Upscaled 720p reads as phone footage, which suits the look. In edit, the full-frame selfie becomes the blurred
background during each screen push; see `references/edit-effects.md`.
