---
name: consistent-character-images
description: Use when generating AI images of a real person who must stay recognisable across every render - headshots, avatars, portraits, hero images, a photo gallery, a character sheet or a reference sheet. Fixes likeness drift, where the image model pulls the face towards its own average and returns an attractive stranger. Covers the prior-art search before you write anything, the character pack and identity lock (weighted anchors with MUST and NEVER lines, plus a drift-direction list), the generate-verify-retry loop with one correction per round, reference-image casting sheets, and LLM verification of image output, where a vision model scores each anchor against the real photographs. Triggers - 'make images of me', 'generate a headshot', 'it does not look like him', 'the face keeps changing', 'character sheet', 'reference sheet', 'identity lock', 'consistent character', 'verify the generated image'.
---

# Consistent character images

## When to use this skill

Load this skill when a user wants generated images of a **real, specific person**
and the likeness matters. Typical requests are a website headshot, an avatar, a
set of portraits, a photo gallery, or a character reference sheet.

The problem it solves is likeness drift. Every image model pulls a face towards
its own average. The hairline drops, the beard fills in, the jaw widens, the
shoulders broaden. Each render is plausible alone. Next to the real photographs
it is a different person, and the user sees that at once.

Do not use this skill for a fictional character, for stock imagery, or for a
person the user has no photographs of.

Before profiling any photographs, confirm the subject is the user themself or
that the user holds documented consent to generate and publish that person's
likeness. Refuse a third party's likeness — a public figure, a coworker, anyone
else's photographs — absent that consent; a convincing identity lock makes this
skill as good at impersonation as it is at a faithful headshot.

The reference implementation is `tools/character-studio` in the `pooriaarab`
repository. Read its README before you run it.

## The workflow

Follow this order. Step 5 is the one agents skip, and skipping it wastes the
whole run.

1. **Search for prior art first.** Grep the available skills for the person's
   name, and for the words identity, likeness, character and portrait. A skill
   named `pooria-photo` already held an identity reference for this exact
   person. It carried the line "Avoid a narrow V-shaped chin" and a failure list
   entry, "The jaw becomes too narrow or too square". A fresh identity lock was
   built from scratch without that check. The subject then reported that exact
   fault, which cost several render cycles.

2. **Collect many references, not six.** Ask for fifty or more, across angles,
   lighting and grooming states. Six is enough to build a caricature and not
   enough to build a likeness. Collect that many to profile and to choose from.
   Pass only three to five of them to any single render. See the calibration
   section below.

3. **Profile the photographs before you write anything.** Ask a vision model for
   a structured profile of every photograph: beard state and cheek coverage,
   hair style and volume, hairline visibility, glasses, framing, angle, and the
   measurements below. Then take the **median of each measurement** across the
   whole set. Those medians are the identity lock. Do not write it from a handful
   of pictures and do not write it from a description the user gave you.

4. **Write the anchors.** Eight to twelve, ordered by how fast a wrong value
   reads as "not them". Each carries the measured median and its sample size.
   See the anchor rules below.

5. **Generate one throwaway render.** Expect it to be wrong. You now have a
   known-bad image, which is the test fixture for the next step.

6. **Validate the verifier.** Score that known-bad image with at least two vision
   models. Keep a model only when it fails the image and names the faults you can
   see yourself. Record the model, the score and the date.

7. **Generate, verify, retry.** Put the identity lock in the prompt before the
   scene. Score the render against the real photographs. Feed back one
   correction per round. Stop on a pass or after three attempts. Keep the best
   attempt either way.

8. **Show the evidence.** Put the renders, the anchor scores and the real
   photographs on one page. The user must be able to disagree with the verifier.

9. **Fix anchors, not shots.** A fault that appears across several shots is an
   anchor problem. Add the exact failure to that anchor's NEVER line.

## How to write an anchor

An anchor holds one trait, a weight, a MUST line, a NEVER line and a reason.

**Weight by speed of failure.** Weight 3 means a wrong value instantly reads as a
different person. Weight 2 weakens the likeness. Weight 1 is supporting detail.
Weight 3 also arms the hard floor in the pass gate, so do not spend it on a trait
you would forgive.

**MUST describes the trait as a measurement.** "Striking angular features" is
praise and tells a model nothing. "Longer than it is wide, with a narrow jaw that
tapers to a softly rounded chin" tells it where to put the lines. Put a number in
wherever a number exists. A percentage of face height, a beard length in
millimetres, a height in head units, a shoulder width in head-widths. A verifier
can check a number. It cannot check an adjective.

**NEVER names the specific failure the model keeps producing.** A general NEVER
line is wasted text. Look at the failed renders first, then write down what you
actually saw. Write "a dense uniform full beard" because that is what the model
produced, not "an unsuitable beard".

**`why` records the render that failed.** A later reader who does not know the
history will read a strict MUST line as fussy and soften it. The reason is what
stops that. Write one sentence naming the failure the anchor exists to prevent.

## Keep a drift-direction list, not only a NEVER list

A NEVER line states what is wrong. A drift direction states what the model turns
the trait **into**. A verifier can look for a named result. It cannot look for an
absence. Keep the list beside the anchors and extend it from real renders.

The directions observed here:

- Round wire frames become rectangular.
- The chin becomes a pointed V.
- The beard fills in across the cheeks.
- Hair becomes a sculpted pompadour.
- Skin becomes retouched and poreless.
- The torso becomes broad.
- Every pose defaults to a notebook, a laptop, or a direct gaze into the lens.

## The enumeration density ceiling

An enumerated grid of about 16 items drifts reliably. Roughly one item comes back
duplicated or garbled. The more discrete things a prompt enumerates, the more
likely one of them breaks.

An identity lock is an enumeration. Many anchors, plus a check line for each one,
cross that ceiling quickly. Past the ceiling, expect about one anchor to break
per render.

Prefer fewer correct elements over a busy approximation. Cut a check line before
you add one.

## Validate the verifier before you trust it

The verifier model is load-bearing. A weak verifier passes a wrong face, and the
retry loop then has nothing to correct. You get a clean PASS on a stranger.

On 2026-09-12, `google/gemini-3.8-flash` scored a known-wrong render **97.6%
PASS**. The render had a covered forehead, a dense black beard and a broad build.
The model invented measurements that agreed with the MUST text instead of
measuring the picture. `gemini-3.1-pro-preview` scored the same image 59% and
`claude-opus-5` scored it 66%. Both set `same_person` to false. Both named the
three real faults.

**Rule: never trust a verifier you have not failed a known-bad image with.** Run
it against that image first. A verifier passes the test when it fails the image,
sets `same_person` to false, and names faults you can see yourself. Write the
result and the date next to the model name in the pack.

Three things in the verifier prompt make the difference. Keep all three.

- **Two separate observation fields.** The verifier writes what it sees in the
  REFERENCE and what it sees in the CANDIDATE, before it scores. Tell it that a
  candidate note which paraphrases the MUST line proves it did not look.
- **Forced numeric estimates on both images.** Forehead height as a percentage of
  face height. Face width divided by face height. Shoulder width in head-widths.
  Beard coverage on the flat of the cheek as a percentage. A gap above about 15
  percent is a real difference.
- **A calibration line.** Tell the model that straight 5s almost always mean it
  did not examine the image. Most candidates score 2 or 3 on at least one
  critical anchor.

**Verify at full resolution.** Thumbnails hide garbled type. Full resolution
shows it. A downscaled candidate here hid a hard-edged composite beard that was
obvious at full size. Send the candidate to the verifier larger than the
references.

Also keep the verifier blind. It sees the reference photographs, the candidate
and the anchor definitions. It must never see the prompt that made the image,
or it grades the intent instead of the result.

## The pass gate

Score each anchor from 0 to 5. A 0 means the trait is not visible, so drop that
anchor from the arithmetic. Take a weighted mean over the rest.

A render passes only when all three of these hold.

1. The weighted mean reaches the pass score, typically 0.85.
2. Every critical anchor scores at least 4 on its own.
3. The verifier did not set `same_person` to false.

The mean catches a render that is wrong in many small ways. The floor catches a
render that is right everywhere except the one trait that carries the likeness.
You need both.

## The retry loop

**Feed back one correction per round.** Every fault at once makes the model trade
one fault for another. The scores here bounced instead of climbing: 78%, then
80%, then 73%.

Rank the faults by weight times the points missing. Send back the single biggest
win. Revise only the weakest dimension before the next generation. Change one
variable per round when you debug.

**Cap retries at about three.** A prompt that cannot pass in three attempts
usually has a tool problem or a framing problem, not a wording problem.

**Reframe past a fault the model will not drop.** Crop the offending region out
of shot. Framing beats prompting for anything the model keeps producing.

## Never describe the face in the image prompt

A long prose description of a face makes the model generate a face from the
words and ignore the reference photographs. Four photographs of a Persian man
once produced a Northern European stranger because the prompt carried the full
identity text.

Split the fields by job. The image prompt gets one short `check` line per anchor,
framed as a list to compare the output against. The verifier gets the full `must`
and `never` text. Open the image prompt by naming the photographs as the source
of the likeness, then describe only the scene.

## Never write polish words

Do not write "8k", "hyperrealistic", "masterpiece", "stunning", "flawless" or
"luxury". Do not write "cinematic" either when the target is a real person.
"Cinematic 35mm" reads as an advert. A phone-photo prompt reads as real.

Name a real camera body, a real lens and a working aperture instead. Ask for
unretouched skin, with pores, lines, uneven tone and a little shine. Unflattering
light reads as real.

## Pass three to five references, not dozens

Profile a large library to **choose** well. Pass only a handful to any single
render. Use three to five originals from different angles: one close face, one
three-quarter, one body.

Never use a generated image to establish identity. Only an original photograph
can do that.

## Let identity travel through a picture

Identity does not have to travel as text. Build a four-frame casting sheet:
front head-and-shoulders, three-quarter, strict profile, full body. Use one
plain mid-grey background. Keep wardrobe, hair and light identical across the
four frames. Keep the expression neutral throughout.

Pass that sheet as a reference. Later renders then inherit the identity from the
picture instead of from a fresh description.

Counter-rule: never feed a busy decorated model sheet back as a reference. Nine
or more panels, with labels, palette strips and callout lines, make the model
reproduce the board layout instead of the person.

## Measure the person, do not describe them

This is the lesson that cost the most and returned the most.

A first identity lock was written from five photographs. It looked careful.
Every number in it was wrong, and two of its NEVER lines forbade things the
person actually does.

| trait                | written from 5 photos | measured over 90  |
| -------------------- | --------------------- | ----------------- |
| forehead height      | 39% of face height    | **35%**           |
| face width           | 62%, "narrow"         | **72%**, ordinary |
| beard cheek coverage | 25%                   | **20%**           |
| shoulder width       | 2.0 head-widths       | **2.2**           |

The two false rules mattered more than the numbers. "Never hair falling forward
onto the forehead" was contradicted by 25 of 90 photographs. "Never thick acetate
frames" forbade a pair of glasses he owns and wears in 18 of them.

The failure mode is specific and easy to repeat. A small sample shows you what is
**distinctive** about a face, so you write down an exaggerated version of it. The
verifier then holds every render to that exaggeration, and correct renders fail.
Scores sat between 50% and 69% for a whole afternoon against an identity lock that
described a person who does not exist.

So:

- Profile fifty or more photographs and take medians. Record the sample size next
  to every number, so a later reader can see how much evidence is behind it.
- Write a NEVER line only for a fault a model actually produced. Never write one
  from intuition about what would look wrong.
- When a trait genuinely varies, do not average it into a compromise. Make it a
  **variant**. Beard shape varied across three states here, while sparse cheeks
  held across all of them. The stable part became the anchor; the varying part
  became `short-beard`, `goatee` and `clean` variants that override it.

**Name one canonical photograph per trait.** The medians give you the value. An
authority map gives a disputed value a single arbiter, so you do not re-average
the library every time two readings disagree. Write the map into the pack:

| trait                               | canonical photograph |
| ----------------------------------- | -------------------- |
| glasses, brows, hair, beard density | `portrait-04.jpg`    |
| face width, nose                    | `portrait-11.jpg`    |
| shoulders, torso, build             | `half-body-02.jpg`   |
| full-body proportions               | `full-body-01.jpg`   |

## Choose the image model by measurement

Prompt work has a ceiling. Model choice moved the result more than any rewrite.
Run one shot through several models with the same prompt and the same verifier
before committing a whole gallery.

One such comparison, same shot and prompt throughout:

| model                           | likeness |
| ------------------------------- | -------- |
| openai/gpt-image-2              | 75.2%    |
| bytedance/seedream-v5.0-pro     | 72.8%    |
| wavespeed-ai/qwen-image-2.0-pro | 70.4%    |
| google/nano-banana-pro          | 65.6%    |
| wavespeed-ai/flux-2-max         | 55.2%    |

Then look at the images yourself, because the top scorer lost. GPT-Image-2 drew
the beard as a hard-edged cut-out that looked pasted on. Seedream produced a
convincing photograph. An anchor added to catch that artefact scored the same bad
image 4 out of 5, at two resolutions.

**A vision verifier measures facial geometry well and does not reliably see
composite artefacts.** Keep render quality as a human check on the contact sheet.
Do not claim an automated gate covers it.

**Some models have no seed.** Checked across the WaveSpeed edit models:
`flux-2-pro`, `flux-2-max` and `qwen-image-2.0-pro` accept a seed.
`seedream-v5.0-pro`, `nano-banana-pro` and `gpt-image-2` do not. Those three also
reject a negative prompt and a guidance scale. The models that hold a likeness
best are in that second group, so there is no seed to pin. Treat score variation
between attempts as inherent, not as a bug to fix.

## Failure modes

Each of these happened. None is hypothetical.

- **Writing an identity lock without searching for prior art.** A `pooria-photo`
  skill already warned against a narrow V-shaped chin for this person. A lock
  written from scratch missed it, the subject reported that exact fault, and
  several render cycles paid for it. Grep the skills first.

- **A verifier that agrees with the brief.** Shown the anchor text, a weak model
  restates the MUST line as its own observation and passes a wrong face. One
  scored a known-bad render 97.6%. Make the verifier write what it sees in the
  reference and what it sees in the candidate as two separate fields, force
  numeric estimates, and tell it that straight 5s mean it did not look.

- **Verifying a thumbnail.** A downscaled candidate hid a hard-edged composite
  beard that was plain at full size. Send the verifier the full-resolution file.

- **Feeding every fault back at once.** The model trades one fault for another
  and the score bounces: 78%, 80%, 73%. Send one correction per round.

- **Describing the face in the image prompt.** Long prose about a face makes the
  model generate a face from the words and ignore the photographs. Four
  photographs of a Persian man returned a Northern European stranger. Give the
  image model one short check line per anchor; give the verifier the full text.

- **An identity lock built from too few photographs.** It encodes an exaggeration
  and then fails correct renders. Profile fifty or more and use medians.

- **Running a gallery before validating anything.** Thirteen shots at three
  attempts each is a lot of money spent confirming the prompt was wrong. Prove
  one shot first.

- **Scoring an anchor the shot cannot show.** Height and limb length are not
  judgeable in a waist-up frame, so that anchor fails in a way no prompt can fix.
  Let anchors declare what they need in frame, and let shots declare their scope.

- **Picking the model by score alone.** The top scorer had a visible artefact the
  verifier could not see. Look at the images.

- **Trusting an anchor you have not tested.** An anchor written to catch a known
  artefact scored that exact artefact 4 out of 5. Test a new anchor against the
  image that motivated it, and say so plainly when it does not work.
