---
name: livestream-workshop
description: Plan and run a live virtual workshop or stream. Pick one point, build a timed run of show with spare time, write clip-sized blocks that each open with a 10-second hook, place Q&A and the demo, choose what to share on screen, keep the screen share clean, and prepare backups. Includes a method to gather the last 1 to 4 weeks of news with verified sources and verbatim quotes only. Use when asked to plan, script, rehearse or run a workshop, webinar, live demo or livestream.
user-invocable: true
argument-hint: "[topic, length in minutes, or audience] (optional)"
---

# Livestream workshop

Run a live session that works twice: once for the room, and again as short clips.
Plan the point, the clock, the screen and the backup before you go live.

Use it for a workshop, webinar, live demo or stream of 30 to 120 minutes. To build
the deck, hand off to [slides](../slides/SKILL.md). For a pre-recorded launch
video, use `ship-demo-video`.

## Rules

1. **One point.** Write the point as one sentence. If a block does not support it, cut the block.
2. **Time with spare.** Keep 5 spare minutes per 90 minutes of run time. Never fill the whole slot.
3. **Clip-sized blocks.** Each block works alone as a 60-second to 3-minute clip.
4. **Hook first.** Open every block with a hook of 10 seconds or less. Say it before any context.
5. **Proof on screen.** Show the real tool for every claim that the tool can prove.
6. **No invented facts.** Every number, name and quote comes from a source you opened. Mark unknowns as unknown.

## Workflow

### 1. Pick one point

Write down three items before you build anything:

- The audience, in one phrase.
- The point, in one sentence of 15 words or fewer.
- The action the audience takes in the next hour.

Test the point. Say it aloud to someone who did not read your notes. If they cannot repeat it, narrow it.

### 2. Build the run of show

Make a table. Give each block a start and end minute, a title, a screen and a hook.

| Min | Block | Screen | Hook (say first) |
|---|---|---|---|
| 0-5 | Recent news | Deck | One sentence with one verified fact. |
| 5-20 | Core idea | Deck, then sketch | A claim that contradicts a common belief. |
| 20-30 | Second idea | Sketch | A rule the audience can apply today. |
| 30-55 | Live demo | The tool only | What you will not do on screen. |
| 55-65 | Tour or examples | Browser | A count or a contrast you verified. |
| 65-80 | Q&A | Camera and last slide | One question that starts the room. |
| 80-90 | Call to action | Last slide | One small action to take now. |

This table shows a 90-minute shape. Scale the minutes to your slot. Keep the order: news, ideas, demo, tour, Q&A, action.

Apply these placement rules:

- **Demo.** Place it in the middle, after the ideas that explain it. Give it the longest block.
- **Q&A.** Place it after the demo and before the call to action. Seed one question yourself, in case the room is silent.
- **Close.** End on the action, not on Q&A. Q&A can run long and cut the close.
- **Spare time.** Name the first block you cut if you run late. Write it in the table notes.

### 3. Write each hook

A hook is one spoken sentence that makes the clip worth watching. Use one of these forms:

- A fact that surprises: a verified number tied to one event.
- A contradiction: "One agent is a tool. Five are a team."
- A refusal: say what you will not do, then do the opposite on screen.
- A question the viewer answers in their head.

Check each hook against the source list. A hook with an unverified fact fails. Cut the fact or find the source.

Write a short script for each block: the hook, three beats, and one closing line. Read it aloud, then ad lib. Do not read it on stream.

### 4. Choose what to share

Match the screen to the job of the block.

| Job | Share | Why |
|---|---|---|
| Explain an idea | The deck | Big type holds focus. Build it with [slides](../slides/SKILL.md). |
| Prove a claim | The real tool | The audience sees the result, not a mock-up. |
| Think in public | A sketch tool such as tldraw or Excalidraw | Drawing live shows how the idea forms. |

Limit a sketch to 4 boxes. Prepare each sketch as a blank canvas with a title. Draw it live.

### 5. Keep the screen share clean

Do these steps before you go live:

1. Share one window, not the desktop.
2. Use a fresh browser profile with no saved logins or extensions.
3. Turn on Do Not Disturb. Quit chat, mail and messaging apps.
4. Hide the bookmarks bar, tabs, API keys, tokens and email addresses.
5. Set the font size so the back row can read it. Zoom the terminal and browser.
6. Run a private test call. Check what a viewer sees when you switch windows.

Stop and cut the share if a secret appears. Rotate the secret after the session.

### 6. Prepare backups

- Export the deck as a PDF. Keep it open in a second window.
- Clone the demo repository before the session. Keep a known-good state on a branch.
- Record a short clip of each live demo step. Play it if the live step fails.
- Save a copy of each sketch as an image.
- Keep a second network path ready, such as a phone hotspot.
- Write down the rule for failure: retry once, then switch to the clip.

### 7. Gather the news

Build the news block from the last 1 to 4 weeks. Use only sources you opened.
Follow [the news method](references/news-roundup.md). The short version:

1. Set the window. Write the start and end date in your notes.
2. Search primary sources first: vendor posts, changelogs, filings and papers.
3. Record the URL, the publish date and the access date for each item.
4. Copy quotes verbatim, with the speaker and the URL. Never paraphrase inside quote marks.
5. Drop any item you cannot verify.

### 8. Rehearse and run

1. Time a full run with a clock. Cut until the run ends with the spare time intact.
2. Rehearse each hook until you can say it without notes.
3. Do a tech check 30 minutes before. Test audio, camera, screen share and the backup.
4. Go live. Watch the clock at every block boundary. Cut the named block if you run late.
5. After the session, mark clip start and end times from the run of show.

## Failure notes

| Symptom | Likely cause | Fix |
|---|---|---|
| The run is over time at the demo. | Too much news or theory. | Cut news first. Move ideas to a follow-up. |
| Clips need heavy editing. | Blocks have no hook or run long. | Rewrite the block to 3 minutes or less with a hook. |
| The room is silent in Q&A. | No seed question. | Ask your seeded question. |
| A live step fails. | No backup. | Play the recorded clip. Say what failed. |
| A claim cannot be traced. | No source kept. | Cut the claim. |

## Verify

- The point fits in one sentence of 15 words or fewer.
- The run of show ends with at least the spare time you set.
- Every block has a hook of 10 seconds or less.
- Every fact and quote has a URL you opened.
- You ran the tech check with the real share setup.

## Related skills

- [slides](../slides/SKILL.md) builds the deck and exports it as PDF, PPTX or Google Slides.
