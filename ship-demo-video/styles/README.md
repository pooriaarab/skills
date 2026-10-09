# Style library

Each file here is one proven look for a 20 to 30 second demo video. A style fixes the ground, type,
motion, seams, pacing, music and sound, so two videos made in the same style feel like one series,
and videos in different styles never look alike.

| Style | Feels like | Best for | Tempo | Length |
| --- | --- | --- | --- | --- |
| [Keynote whip](keynote-whip.md) | An Apple keynote: calm, confident, fast | A capability that "just works" (an agent, an automation) | about 120 BPM | 26 s |
| [Dossier](dossier.md) | A case file: tension, then relief | Safety, privacy, "caught in time" stories | about 119 BPM, with a drop | 22.5 s |
| [Pop flats](pop-flats.md) | A satisfying clean-up: loud, playful, quick | Annoyance killers, "never again" products | 120 BPM | 23 s |

[Presenter](presenter.md) is a module, not a style: a talking-head avatar card that any style can carry.

## Choose a style

1. Name the story's emotion: confidence, relief or satisfaction. Pick the style that carries it.
2. In a set of videos, use each style once, and add new styles for the rest. A set that repeats one look reads as generic.
3. Give the presenter to the video where a person adds the most: usually the flagship or the most abstract product.

## Shared rules (every style)

- **Arc:** hook in outcome language (0 to 2 s) → the stakes or a second hook beat → product name and promise by beat
  two → the demo, landing on the musical drop or build → one measured proof → end card. Each claim traces to a
  measured run.
- **Pace:** shots of 1 to 1.5 s, about 6 to 9 cuts per 10 s. Hold longer only on the scene that carries the message.
- **Grid:** every scene starts on a detected beat. Write scene lengths in beats, not seconds.
- **Footage:** the real product in a styled card. Push in on the subject; full browser frames are unreadable on a phone.
- **Sound:** an instrumental bed chosen by its energy curve, and SFX on every cut, tap and slam.
- **Gates:** stills for every scene before the render; a frame audit of the final file before anyone sees it.

## Add a new style

Copy this outline into `styles/<name>.md`, fill every section from a real render, and add a row to the table above.
Do not add a style that has not shipped at least one video.

1. **Use it for** — the story emotion and product type.
2. **Look** — ground, palette with hex values and roles, type pair (bundled fonts or embedded woff2), layout grid.
3. **Copy pattern** — hook formula, scene lines, end card, with the real lines from the first video.
4. **Storyboard template** — a table: scene, length in beats, on screen, purpose.
5. **Text entrances** — each technique with its ease, duration and stagger.
6. **Seams** — how scenes hand over (whip, mask, color cut, zoom-through), with values.
7. **Footage treatment** — card, frame, tilt, zoom values.
8. **Music** — the generation prompt, the model, the tempo and how the variant was chosen.
9. **SFX cue map** — which sound lands on which event.
10. **Reference build** — the example spec and builder in `pooriaarab/scripts` `demo-video/`.
