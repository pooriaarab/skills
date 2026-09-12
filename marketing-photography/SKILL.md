---
name: marketing-photography
description: "Plan and prompt MARKETING SITE and LANDING PAGE photography with an AI image model where the SAME PEOPLE must recur across many pages and sections and each image must earn its place next to specific copy — building a written CAST with one 4-frame casting reference sheet per character and generating every scene as an edit against those sheets, why a full animation-style model sheet degrades photoreal identity transfer, matching each shot to the claim its section makes, realism levers that stop renders reading as AI (real camera and lens, motivated mixed light, unretouched skin, mundane objects, nobody looking at the camera), designing garbled text out of every frame, sector-cliche negative lists, honesty rules for generated people (no names, no testimonials, no badges), and a QA loop with pre-sized AVIF and WebP output. Fully generic with fill-in-the-blank CHARACTER and SCENE templates. Use when a site or landing page needs consistent, believable photographic imagery across sections; pair with ad-creative-generation for disposable single ad images and ad-image-prompt-library for starting prompt recipes."
---

# marketing-photography

Photography for a marketing site or landing page, generated with an AI image
model. Two constraints make this a different job from ad creative: the same
people must recur across many pages and sections, and each image must earn its
place next to specific copy.

`ad-creative-generation` covers ad creatives: single images, style references,
disposable. Each render stands alone, so a new face every time costs nothing.
On a marketing site it costs everything. A firm whose people change on every
page reads as stock photography, and visitors stop trusting the page. This
skill fixes identity first, then matches every shot to the section it sits in.
For starting prompt recipes see `ad-image-prompt-library`. For text-heavy or
UI-heavy creatives rendered as HTML see `ad-creative-templates`.

## 1. Use this skill when it owns the job

| You need | Reach for |
|---|---|
| Consistent people across site pages and sections | This skill |
| One disposable image for an ad | `ad-creative-generation` |
| A starting prompt or format recipe | `ad-image-prompt-library` |
| Pixel-exact text, UI, or logo inside the image | `ad-creative-templates` (an HTML render, not a model) |
| Photos of real staff or customers | A camera. Never generate stand-ins for real people (see §8) |

## 2. Build a cast before you generate any scene

The failure mode: generating each scene from scratch yields a different face
every time. A site where nobody recurs reads as stock. Fix identity before you
shoot anything.

Define each character as a written description first. Specific and unglamorous
beats beautiful: small flaws lock identity better than polished features. Each
description covers:

- Age and build, stated plainly.
- Hair, including how it is untidy: a cowlick, grown-out roots, a frayed cut.
- Skin, including asymmetries and blemishes: uneven tone, a mole, lines, shine.
- Wardrobe, including wear and creases: a faded cuff, a stretched collar,
  scuffed shoes.
- One or two identity anchors: a scar, a pair of glasses, a lanyard, a watch.
  Anchors are what the model holds onto across scenes.

Then generate one casting reference sheet per character: four frames in a 2x2
grid on a seamless mid-grey background. Front head-and-shoulders,
three-quarter view, strict profile, full body. Identical wardrobe, hair, and
light in all four frames. Neutral expression throughout.

Then generate every scene as an edit call that passes the relevant sheet or
sheets as reference images, with an identity-lock line: keep the exact same
face, features, and proportions as the reference, and do not restyle, age,
slim, or beautify. Identity carries through the reference, not through
re-describing the person each time.

Store the sheets at durable URLs and commit the cast definitions to the repo.
A cast that lives only in a prompt thread is lost, and page two gets different
faces.

## 3. Why not a full animation-style model sheet

The trap: the popular character design reference sheet prompt (turnarounds
plus an expression grid plus material studies plus a colour palette plus
callouts) is built for animation production, where a team of artists reads the
board. Fed back into a photoreal edit model as a reference image, a busy
9-panel board degrades identity transfer. The model tries to reproduce the
board layout instead of the person. Expressions leak into scenes, palette
strips show up as props, callout lines sharpen into artifacts.

For photoreal work, strip the board to the clean 4-frame casting card. Keep
the identity-lock discipline, drop the production-board furniture.

| Animation board | Casting card (this skill) |
|---|---|
| 9 or more panels: turnarounds, expressions, materials, palette, callouts | 4 frames: front, three-quarter, profile, full body |
| Made for artists to read | Made for an edit model to match |
| Expression grid | Neutral expression in every frame |
| Palette strips and labels | No text, no swatches, no graphics |

## 4. Match the image to the section, not to the page

Derive the shot list from copy that already exists. Read the page first. Each
image answers one claim the section makes. If you cannot name the sentence an
image supports, do not generate it.

| Section type | What to shoot |
|---|---|
| How it works | The work being done: hands, tools, and materials mid-task |
| Audience or segment cards | One professional per segment, shot as a consistent series with matched framing and grade |
| Human review or trust | The review happening: a person reading, checking, annotating, discussing |
| Stats or numbers | The thing being counted, in its real setting |

Rhythm matters as much as subject. Do not put a photo in every section.
Alternate image-led sections with dense text sections so each photo keeps its
weight. Respect the tonal bands of the design: when the page alternates light
and dark bands, place and grade images to sit inside that rhythm, not against
it.

## 5. The realism levers

What stops a render reading as AI:

- Name a real camera body, a real lens, and a working aperture: a full-frame
  mirrorless body, a 35mm f/1.8 prime, shot at f/2.8. Never write "8k",
  "hyperrealistic", "stunning", or "masterpiece". Those words push toward the
  glossy AI look.
- Light the scene from named, motivated sources, and let them mix and
  conflict: overcast daylight from a window at left plus warm overhead
  fluorescents, with a green cast where they meet. Unflattering light reads as
  real.
- Nobody looks at the camera. Nobody smiles for the camera. No handshakes, no
  pointing at charts, no arms-crossed power poses. People in real rooms are
  busy with something else.
- Ask for unretouched skin: pores, lines, uneven tone, stray hairs, natural
  asymmetry, a little shine.
- Dress the set with specific mundane objects: a dented travel mug, a ring
  mark on the desk, loose staples, a cardigan over a chair back, a slightly
  crooked wall frame.
- Frame it as a real photographer would. Name the vantage point ("shot from
  the doorway, slightly below eye level") and let the horizon sit slightly off
  level.

## 6. Text is the giveaway: design it out

Image models garble text. On a document-heavy page that produces convincing
nonsense, which is worse than no image at all. A page of blurred fake
paragraphs next to real copy destroys the realism every other lever built. So
prevent text instead of fixing it:

- Angle documents so type reads as grey texture. Turn pages away, shoot papers
  from above at an angle, hold shallow depth of field on the text.
- Angle screens away from the camera and keep them out of focus.
- Specify book spines, whiteboards, and signage with no lettering.
- Put "no text, no lettering, no numbers, no labels, no captions, no
  watermark, no logo" in every negative list.
- Then zoom in at full resolution during QA and check. Thumbnails hide garbled
  type. Full resolution shows it.

## 7. Negative prompts as a cliche list

A cliche is what makes a page look cheap, and every sector has its own
saturated stock imagery. Research yours first, then convert it into a negative
list.

The method: open three to five competitor or peer sites, inspect their actual
`<img>` filenames and alt text, and note the repeats. Filenames and alt text
leak the stock library and the subject ("diverse-team-meeting",
"handshake-office"). Those repeats are the sector cliches. Negate them by
name.

A generic starter list, extended with whatever the research finds:

```text
no handshake, no pointing at a screen, no arms crossed, no headset smile,
no staged high-five, no puzzle pieces, no chess pieces, no rocket launch,
no magnifying glass over a chart, no text, no lettering, no numbers,
no labels, no captions, no watermark, no logo, no plastic skin,
no studio polish, no oversaturation
```

## 8. Honesty rules for generated people

Generated people are not real staff and not real customers. Treat that line as
a hard boundary, not as tone guidance.

- Never attach a name, title, credential, or quotation to a generated face. No
  testimonials with generated portraits. No "meet our team". No staff roster.
- Alt text describes the scene, never the person. Write "A reviewer annotating
  printed pages at a shared table", never a name or a role.
- Never generate an accreditation seal, certification badge, or compliance
  mark into an image. A photographed badge is a fabricated claim.
- Never reuse one placeholder headshot across several differently named
  people. That is a real and common failure, and readers spot it fast. It
  destroys credibility in a way no other defect does.
- This is exactly why the cast stays unnamed. The cast exists so the same
  faces recur honestly as unnamed illustration, never as invented staff.

## 9. QA loop and production notes

- Judge the casting sheet before generating any scene. One bad sheet poisons
  every scene that uses it. When identity drifts, regenerate the character,
  not the scene.
- Review the audience-card series together as a grid. Brightness and grade
  inconsistency only shows side by side. Single-image review passes frames
  that clash on the page.
- Serve pre-sized AVIF plus WebP. Derive the declared width and height from
  the encoded files, not from the arithmetic: a resampler can land a pixel off
  the intended size, and a declared size that misses by one pixel causes layout
  shift.
- Keep costs concrete but model-agnostic: budget roughly $0.05-0.15 per image
  at current reference-model pricing. Price the run before batching: cast
  sheets plus scenes plus retries, times the per-image rate.

## 10. Copy-paste templates

Fill every `[PLACEHOLDER]`. Keep the order throughout: subject, what is
happening, the room, light, camera, NOT WANTED. Readers copy these directly.

CHARACTER template. One per cast member, committed to the repo:

```text
[CAST ID, e.g. CAST-01. Never a personal name.]

Subject: [AGE], [BUILD], [HAIR including how it is untidy],
[SKIN including asymmetries and blemishes], wardrobe:
[GARMENTS including wear and creases].
Identity anchors: [ANCHOR 1], [ANCHOR 2].

Casting sheet: 2x2 grid on a seamless mid-grey background.
Frame 1: front head-and-shoulders, neutral expression.
Frame 2: three-quarter view, neutral expression.
Frame 3: strict profile, neutral expression.
Frame 4: full body, standing, neutral expression.
Identical wardrobe, hair, and light in all four frames.

NOT WANTED: text, labels, graphics, palette strips, expression
grid, extra panels, retouched skin, glamour lighting.
```

SCENE template:

```text
Subject: [CAST ID(s) from the casting sheet(s), passed as
reference images]. Keep the exact same face, features, and
proportions as the reference. Do not restyle, age, slim, or
beautify.

What is happening: [ONE ACTION that answers the section claim.
Nobody looks at the camera. Nobody smiles for the camera.]

The room: [SETTING, e.g. a clinic-style setting]. Dressing:
[MUNDANE OBJECT 1], [MUNDANE OBJECT 2].
Documents and screens: [ANGLED AWAY / OUT OF FOCUS /
NO LETTERING, as applicable].

Light: [SOURCE 1 with direction] plus [SOURCE 2 with
direction]. Let them mix: [WHERE THEY MEET, e.g. the green
cast along one wall].

Camera: [BODY], [LENS] at [APERTURE], [VANTAGE POINT, e.g.
from the doorway, slightly below eye level]. Horizon
slightly off level.

NOT WANTED: no text, no lettering, no numbers, no labels, no
captions, no watermark, no logo, no [SECTOR CLICHES from §7],
no plastic skin, no studio polish, no oversaturation.
```

## 11. Checklist: one photography pass

- [ ] Shot list derived from existing copy; every image names its sentence.
- [ ] Cast defined in writing; sheets generated; sheets judged before any scene.
- [ ] Sheets stored at durable URLs; cast definitions committed.
- [ ] Scenes built as edits against the sheets, with identity-lock lines.
- [ ] Real camera, lens, and aperture named; banned adjectives absent.
- [ ] Text designed out; full-resolution zoom check done.
- [ ] Sector cliches researched; negatives extended.
- [ ] Honesty rules hold: no names, no testimonials, no badges, scene-only alt
  text.
- [ ] Series reviewed as a grid; AVIF plus WebP pre-sized from encoded files.

Pairs with: `ad-creative-generation` (disposable single ad images, style
references, the vision-QA loop), `ad-image-prompt-library` (starting prompt
recipes and realism levers), `ad-creative-templates` (anything with exact text,
UI, or logo).
