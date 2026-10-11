---
name: launch-video-screenwriting
description: "Write the script for a 20 to 30 second product launch or demo video: a beat sheet scaled to seconds, hook patterns, one value turn per shot, on-screen copy rules, and a call to action that reads as an afterthought. Use at ship-demo-video stage 3 before the storyboard, or when a draft script reads flat."
---

# Launch video screenwriting

A launch video is a short script, not a short ad. Write it with story
beats and it holds attention. List features and it plays like a slide deck.

**Start at `ship-demo-video`.** That skill owns the pipeline: capture,
plain cut, music, build, render. This skill owns only the words and the
beats that carry them. Use it at stage 3, before the storyboard. For
generated imagery technique, use `launch-video-generation`.

The craft here is ported from
[jtydhr88/screenwriting-skills](https://github.com/jtydhr88/screenwriting-skills)
(MIT). Beat sheets and cold opens come from `sw-story-structure`.
Value turns and late-in-early-out cutting come from `sw-scene-craft`.
Subtext and on-the-nose bans come from `sw-dialogue`. Setup and punch
mechanics come from `sw-sitcom-comedy`. Each section below names the
rule it borrows.

## The beat sheet, scaled to seconds

A beat is one change in the story: a goal shifts or the tension rises.
A 24 second spot holds five beats. Give each beat one job and a time box.

| Beat | Seconds | Job | The viewer thinks |
| --- | --- | --- | --- |
| 1. Hook | 0 to 3 | State the pain in plain words | "That is my problem" |
| 2. Cost | 3 to 7 | Show what the pain costs | "It is worse than I thought" |
| 3. Turn | 7 to 12 | The product enters and flips the scene | "Oh, that fixes it" |
| 4. Proof | 12 to 19 | Real footage of it working, with one number | "It actually works" |
| 5. Afterthought | 19 to 24 | End card with the install line, no plea | "I will try that" |

This maps to the classic shape: hook as cold open, turn as midpoint
reversal, proof as the payoff the premise promised. Beat 2 must stay
short. A cost section that runs past 7 seconds reads as complaining.

Frame 0 and the end card mirror each other. The opening image shows the
pain. The closing image shows the same screen fixed. Snyder's rule for
features holds at this size: if the two frames look the same, the middle
beats changed nothing.

## Hooks that earn the next second

The first three seconds decide everything. Pick one pattern and commit.

- Name the pain flatly. "Your README has no cover image." No setup, no
  greeting, no logo. The viewer either nods or leaves, and both are fast.
- Open inside the demo. Show the command running before any words
  explain it. Curiosity carries the viewer to beat 3, where words catch up.
- Count something. "Three files. One command. Six seconds." Counts
  promise a short video, and a short video gets watched.
- Ask the question the viewer already asks. "Why does this take all
  afternoon?" Then answer it with the product, not with adjectives.

Hook rules, borrowed from joke setup craft:

- Keep the setup plain and credible. A strange opening warns the viewer
  that a trick is coming, and the trick then lands soft.
- Do not hint at the punch. Never write "Watch what happens next" or
  "You will not believe". Show the next thing instead.
- Put the punch word last. "It renders while you type" beats "While you
  type, it renders." The cut lands on the last word.

## One value turn per shot

Every shot must change something the viewer can feel. Mark the value at
the shot's start and at its end: slow to fast, broken to fixed, vague
to exact. If the two marks match, cut the shot. A shot that changes
nothing is exposition wearing a costume.

Write the breakdown second by second, with a "why" per row:

| Time | Visual | Sound | On-screen text | Why |
| --- | --- | --- | --- | --- |
| 0 to 2 | ... | ... | ... | ... |

Keep each row to one screen and one action. `ship-demo-video` already
requires one idea per screen; the "why" column is how you prove it.

Cut late in and early out. Enter each shot at the last moment the
viewer needs, and leave before the action fully resolves. A shot that
lingers after its point reads slow at any length. When shots run toward
the proof beat, make them shorter, not longer. Speed earns the pause on
the end card.

## Say it without saying it

On-the-nose copy states the feeling instead of causing it. "Our fast,
reliable tool saves you time" tells the viewer what to feel and gives
no reason to feel it. Show the slow thing, then show the fast thing.
Let the cut make the claim.

- Give every line a job: move the story or reveal the product. A line
  that does neither is dead weight. Cut it.
- Use concrete nouns. Not "a config file", but "`og.config.js`". Not
  "in seconds", but "in 4 seconds". The specific detail is the proof.
- Use short words when the pace runs fast. Excitement shortens
  sentences. Long words at the climax read as calm.
- Read each line aloud. If you would never say it to a friend, rewrite
  it until you would.
- Keep subtext in the voiceover. The voice says what happens. The
  footage says why it matters. Never let both say the same thing.

## The call to action as afterthought

The ask works when the demo already made it. By beat 5 the viewer has
decided. The end card only removes friction: the exact install command
and the repository URL, held long enough to read and type.

- Never plead. No "Try it now", "Get started today", "Do not miss out".
  The product earned the try. The card states the fact.
- Never explain the command. `npx ogshot` needs no gloss. An arrow, a
  cursor, and the line itself are enough.
- Stop after the ask. Do not add a tagline, a logo sting, or a "thanks
  for watching". Saying more after the punch steps on it. End the video.
- Hold the card for a full read. Two lines of text need at least 3
  seconds. A card that flashes past is a card that never existed.

## The recurring prop

Pick one visual element and bring it back changed. The terminal cursor
that blinked on an empty line in beat 1 blinks on a finished render in
beat 5. The red error badge from beat 2 returns green in beat 4.

One rule governs the return: each appearance must change the meaning.
A prop that returns unchanged is decoration. A prop that returns
transformed is the story told without words.

## Diagnosis checklist

Run this on the script before the storyboard leaves your desk.

1. Does the hook land inside 3 seconds with no logo or greeting first?
2. Does each beat change the viewer's mind, in the order the table gives?
3. Does every shot turn one value? Mark start and end. Cut the still ones.
4. Does the breakdown give each second a "why" tied to footage or a run?
5. Does frame 0 show the pain and the end card show it fixed?
6. Does any line state a feeling the footage should cause? Rewrite it.
7. Is every noun concrete and every number measured? No invented counts.
8. Does the voice ever repeat what the footage already shows? Cut one.
9. Does the end card plead, explain, or trail a tagline? Strip it back.
10. Read the whole script aloud. Does each line sound like a person?

## Worked demo

Read [the 24 second npm-package screenplay](demo-24s-npm-launch.md)
before writing. It applies every rule above to one fictional package.
It shows beats with time boxes and a second-by-second table. Each row
carries a "why", and the end card carries no plea.
