---
name: oscilloscope
description: "Use when one metric is the whole story: a growth chart, a benchmark, a live counter, a post that exists to make a single number legible. Applies the oscilloscope direction to every surface, not only the website. Triggers: 'oscilloscope direction', 'amber trace', 'graticule', 'one big number', 'growth chart post', 'instrument readout look', 'CRT amber'."
---

# oscilloscope

> amber trace on a graticule. one signal, measured, held.

**Signature.** Amber and only amber. The direction commits to one trace colour the way an instrument does, and **nothing on the page is allowed a second hue**. Content sits inside a 10×8 division graticule with centre crosshairs, and every panel carries a corner readout in the instrument's own units — `2.4s/div`, `n=1,284`.

**Mono earns its place on the readouts, and nowhere else.** Share Tech Mono sets values, units, per-division scales and sample counts. They are measurements, and **a measurement that shifts width as it updates is a broken instrument**. Headings are Saira Condensed; body is Saira. That split is what separates oscilloscope from [terminal](../terminal/SKILL.md), where monospace is everything, and from [spec](../spec/SKILL.md), where monospace marks a value inside a document rather than a reading on a device. Contract: [`../_lib/surfaces.md`](../_lib/surfaces.md). Floor: [`../_lib/craft-floor.md`](../_lib/craft-floor.md). Chooser: [`../brand-router/SKILL.md`](../brand-router/SKILL.md).

**Use when** one metric is the story — a growth chart, a benchmark, a live counter, a post that exists to make a single number legible.

**Avoid when** the page has several equal subjects. **An instrument with two traces is a different instrument, and this one has one channel.** A three-point post in oscilloscope is a lie about the hardware.

---

## Tokens

**Native mode: dark** — the CRT, lit. The light mode is not an inversion. It is **the paper that came out of the chart recorder attached to the same instrument**: warm stock, a printed graticule, and the trace laid down in burnt amber ink (`#8a4b00`), because a `#ffb000` line on paper disappears. Same instrument, different output device.

| Role | Dark | on bg | Light | on bg |
| --- | --- | --- | --- | --- |
| bg | `#0a0903` | — | `#f4f1e4` | — |
| surface | `#141006` | accent 10.36:1 | `#e9e4d0` | — |
| fg | `#f2e2b4` | 15.49:1 | `#191405` | 16.22:1 |
| muted | `#b09659` | 6.98:1 | `#6b5a2a` | 5.94:1 |
| border | `#2a2210` | hairline | `#d0c8a8` | hairline |
| accent (trace) | `#ffb000` | 10.88:1 | `#8a4b00` | 6.01:1 |
| accentFg | `#150e00` | 10.47:1 on accent | `#fdfaf0` | 6.51:1 on accent |
| alt — out of range | `#ff6a3d` | 7.01:1 | `#9c2b06` | 6.72:1 |

`alt` is **the single permitted exception to amber-only**, and it means one thing: a reading outside the expected range. It appears at most once per asset and at most once per deck. Using it for emphasis destroys the direction.

**Type.** Display `"Saira Condensed", "Arial Narrow", sans-serif` 600 / +0.04em / **uppercase** / 1.08. Body `"Saira", system-ui, sans-serif` 400 / 0em / none / 1.62. Mono `"Share Tech Mono", ui-monospace, monospace` 400 / +0.02em / 1.35 — **readouts only**. Load `Saira Condensed:wght@500;600;700`, `Saira:wght@400;500`, `Share Tech Mono`. Scale ratio **1.33** — the largest in the technical family, because one number has to dominate. Share Tech Mono's advance is **0.5em**, so at 200px one character is 100px.

**Surface.** Radius **3px**. Shadow `0 4px 26px -12px rgba(255,176,0,0.55), 0 1px 0 0 #2a2210` — the bloom carries a real 4px offset, so it is a shadow and not a halo. Hairline `1px solid #2a2210`.

**Texture** — the graticule. Not decoration: centre crosshairs at 0.30 alpha, 10 major divisions across and 8 down at 0.14, and 2% minor ticks at 0.07.
`background-image: linear-gradient(to right, transparent calc(50% - 1px), rgba(255,176,0,0.30) calc(50% - 1px), rgba(255,176,0,0.30) calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom, transparent calc(50% - 1px), rgba(255,176,0,0.30) calc(50% - 1px), rgba(255,176,0,0.30) calc(50% + 1px), transparent calc(50% + 1px)), repeating-linear-gradient(90deg, rgba(255,176,0,0.14) 0px, rgba(255,176,0,0.14) 1px, transparent 1px, transparent 10%), repeating-linear-gradient(0deg, rgba(255,176,0,0.14) 0px, rgba(255,176,0,0.14) 1px, transparent 1px, transparent 12.5%), repeating-linear-gradient(90deg, rgba(255,176,0,0.07) 0px, rgba(255,176,0,0.07) 1px, transparent 1px, transparent 2%); pointer-events: none;`

**Motion — the one authored moment.** Ease `linear`, duration **1200ms**. One trace sweeps. A 2px `#ffb000` line enters at the left edge of the graticule and travels to the right edge at strictly constant speed — **linear, because a sweep that eases is a sweep that lies about time**. Behind the head, the trace decays from full to zero over roughly 600ms, so the tail is still fading out of the left divisions while the head arrives at the right. It sweeps once on load, then the whole trace holds, lit, permanently. Nothing on the page moves again. Under `prefers-reduced-motion: reduce`, render the held trace at full and skip the sweep.

---

## 1. Voice and writing

**Tone.** States the reading and its units, then says what changed since the last reading, and stops.

**Casing.** UPPERCASE for labels and headings. Sentence case for body. **Units are always lowercase** — `1,284 ms`, never `1,284 MS`.

**Sentence rhythm.** Very short, 5 to 12 words. Fragments are the norm, because a readout is a fragment. Two sentences per paragraph is the ceiling. A third sentence means you have started a second channel.

**Do say:** `1,284 samples over 30 days` · `peak at day 11, then flat` · `the axis starts at zero` · `out of range — here is why`

**Don't say:** `huge` · `tons of` · `buttery smooth` · `insane growth` · `off the charts` · `10x`

**The tell.** Every claim names its sample size and its window. "1,284 samples over 30 days" is the habit. A number with no n and no window is not this direction — and neither is a comparison, because an instrument reports a reading, it does not rank things.

## 2. Landing page

`#0a0903` with the full graticule at 10×8 and centre crosshairs, edge to edge. The graticule is the layout, not a background: **every block starts and ends on a division line.**

- **Measure: 66 characters** — 620px at 17px Saira body, which is four divisions wide at a 1550px content width. Body never spans more than 5 divisions.
- **Hero.** One number in Share Tech Mono at **clamp(96px, 12vw, 200px)**, `#ffb000`, sitting **on the horizontal centre line**, horizontally centred in divisions 2 through 7. Its unit sits directly right of it at 28% of its size, in `#b09659`. The label goes above in Saira Condensed 600 uppercase at 48px, **max 4 words**.
- **Sections divide by a corner readout**, not a rule. Each panel carries its own readout in its top-right corner: Share Tech Mono 18px `#b09659`, in the instrument's units — `2.4s/div`, `n=1,284`, `30d window`.
- **Whitespace is divisions.** Vertical gaps are one division (12.5% of the graticule height) or two. Nothing between.
- **The carrying element is the trace.** One trace, edge to edge, and it carries the **actual shape of the metric**. A decorative sine wave is the fastest way to fail this direction.

`#ff6a3d` appears only if a value is genuinely out of range, and then exactly once.

## 3. X / Twitter avatar

Renders at **48px**. Oscilloscope survives it, but only in the reduced form, and the reduction is mandatory.

`#0a0903` square with the graticule at **4 divisions across, not 10** — a 10-division graticule at 48px is 4.8px per division and collapses into a grey wash. A single `#ffb000` trace crosses it: flat along the vertical centre for the left half, then one clean rise to 75% height in the right half. **2px stroke on a 400px export scales to 0.24px at 48px**, so express it as a ratio: the stroke is **1.6% of the square's width, minimum 2px at any export size**.

**Below 200px, drop the phosphor bloom.** The 6px blur at 40% opacity is a smudge at 48px and it costs the trace its edge. Above 200px, keep it.

No crosshairs at 48px. No readout, no text of any kind.

## 4. X header and YouTube banner

YouTube is 2560×1440. Only the centred **1546×423 safe area** shows on a phone.

**Inside the safe area:** the graticule runs the full width. **No text in the left third** (x=587 to x=1102) — that space belongs to the trace. One `#ffb000` trace runs edge to edge and carries the actual shape of the metric being tracked this quarter, drawn at 3px. The **right third** holds two stacked Share Tech Mono readouts, left-aligned at x=1620: the metric name in `#b09659` at **26px** (baseline y=690), the current value in `#ffb000` at **44px** (baseline y=760).

**No face, no logo, no second colour.** Outside the safe area, the graticule continues to 2560×1440 and the trace runs on to both edges — which is what a real sweep does.

For the 1500×500 X header, the readouts sit at x=1020, y=230 and y=290.

## 5. Open Graph card

1200×630 on `#0a0903`, with the **full 10×8 graticule and centre crosshairs**. Divisions are 120px across, 78.75px down. It renders in feed at roughly 400×210.

- Headline in Saira Condensed 600 uppercase, **66px**, `#f2e2b4`, left at x=72, sitting **one division above centre**, two lines max.
- The trace runs under it, edge to edge, 3px.
- Bottom-left corner readout, Share Tech Mono **24px** `#b09659`: `POORIAARAB.COM`.
- Bottom-right, same size: the post's one number and its unit, in `#ffb000`.

**Drop at feed size:** the 2% minor ticks. At 400px wide they are 8px apart and turn the card into texture. Keep the 10×8 majors, the crosshairs, the trace and the two readouts. 66px lands at ~22px in feed; 24px lands at ~8px and reads as an amber mark, which is enough for a signature.

## 6. LinkedIn banner

1584×396. Treat a **400px wide by 140px tall** block at the bottom left as covered by the profile photo.

The graticule runs the full 1584px, but **draw it at 8 divisions across, not 10** — 396px of height only supports 4 divisions down, and 10×4 reads as stripes rather than as a graticule. Use **8×4**, 198px per division.

The trace runs edge to edge at y=170, above the photo hole. The two readouts stack at **x=1180**: metric name `#b09659` Share Tech Mono 22px at y=120, value `#ffb000` at 38px at y=180. The bottom-left region carries nothing but graticule.

## 7. LinkedIn post image

1200×627. **Oscilloscope behaves better in that room than it looks like it will**, because a chart with a stated sample size is the language of the room. But amber on near-black still reads as a gaming graphic in a feed of white cards. **Dial it down in three ways.**

1. **Use the light port** — `#f4f1e4` stock, `#8a4b00` trace, printed graticule. This is the chart recorder output, and it reads as a research figure rather than as an instrument panel.
2. **Minor ticks off, graticule to 8×5.** LinkedIn's JPEG pass turns 1px lines at 2% pitch into moiré across the whole image.
3. **One readout, not four.** Bottom-left, `POORIAARAB.COM`. Move the number into the headline instead.

Headline uppercase Saira Condensed 600 at 56px, max 8 words. The number in Share Tech Mono at 120px on the centre line. Read width in feed is 552px, so 120px lands at ~55px and dominates correctly.

## 8. Instagram carousel

1080×1350 throughout, with the graticule at **10 across by 12 down** — the frame is taller than 4:3, so add divisions rather than stretching them. Divisions are 108px square. **The carousel is one instrument taking readings, one per slide.** That is what separates it from a [terminal](../terminal/SKILL.md) session or a [spec](../spec/SKILL.md) table: there is no prose column and no table, only a lit graticule and a number on the centre line.

**Cover slide.** `#0a0903`, full graticule, crosshairs on. The label in Saira Condensed 600 uppercase at **56px**, `#f2e2b4`, centred in divisions 2–8, sitting two divisions above centre, **max 4 words**. The number in Share Tech Mono at **220px** `#ffb000`, **sitting exactly on the horizontal centre line** — its unit directly right at 62px in `#b09659`. **Max 6 characters including separators**, because at 220px one character is 110px and divisions 2 through 8 give you 648px. The trace runs edge to edge behind it.

**Interior slide.** Identical graticule, identical crosshairs, identical trace geometry — that pixel-identical frame is the whole reason the slides look related. One reading per slide: label above, number on the centre line at **160px**, unit right. Below the centre line, at most **two lines of Saira 34px, 46 characters each**, `#f2e2b4`. Corner readout top-right in Share Tech Mono 22px giving the window: `30d`, `n=1,284`.

**End card.** The final reading is the ask, expressed as one: label `SUBSCRIBERS`, the number, then a single Share Tech Mono line at 40px in `#ffb000` — `POORIAARAB.COM/NEWSLETTER`. The trace holds. Nothing blinks, nothing points.

**Swipe cue.** The trace does not stop at the frame. It **exits the right edge mid-rise, clipped by the frame with no terminating point**, and the last two vertical divisions on the right carry no content at all. An unterminated sweep means the sweep is still running.

**On faces: amber-only means you cannot put a photograph on these slides.** A face graded to a single hue is a silhouette, and a silhouette is not a portrait. If a slide needs your face, the direction is wrong for that carousel. Of the five technical directions this is the most hostile to a person appearing — more so than [terminal](../terminal/SKILL.md), which at least permits a green-mapped cutout.

## 9. YouTube thumbnail

1280×720, designed for the **~210px** version. Divisions are 128px across, 90px down.

Full graticule on `#0a0903`. **The number is the subject.** One figure in Share Tech Mono at **200px**, `#ffb000`, sitting on the horizontal centre line, horizontally centred in divisions 2 through 7. **Maximum 6 characters** — at 200px one character is 100px, and divisions 2–7 give 640px. Its unit sits directly right at **56px** in `#b09659`. Above it, at **48px**, the label in Saira Condensed 600 uppercase, **max 4 words**.

The face appears bottom-left as a cutout, **single-colour amber silhouette, no more than 22% of the frame height**. Be honest about what that is: a shape, not a portrait. It gives the thumbnail a human outline at 210px and nothing more.

Recognisably his without being identical: graticule, centre-line number, amber silhouette. The figure changes every time and is the entire pitch.

## 10. YouTube edit style

**Oscilloscope is the strongest of the five technical directions for video, and it is still narrow.** Its motion is a linear sweep, which is a real temporal primitive, so unlike [spec](../spec/SKILL.md) it has something to do while time passes. But **it has one channel**, which means the video must be about one metric. A three-topic video breaks the direction in the first minute.

**Cut rhythm.** Metronomic. Set a division as a unit of time — **1 division = 2 seconds** — and land every cut on a whole number of divisions. That produces a 2/4/6/8-second grid the audience feels without noticing. Never cut during a sweep.

**Titles and lower thirds.** The lower third is a corner readout, and it sits in the **top-right**, not the bottom — an instrument puts its scale where the trace is not. Share Tech Mono 30px `#b09659` for the label, 44px `#ffb000` for the value, on `#141006` with a 1px `#2a2210` border, at x=1560 / y=90 on a 1920×1080 frame. **In: it appears in a single frame, no animation.** Out: single frame. A readout does not slide.

**B-roll.** Charts, counters, dashboards, instruments. Grade hard to the single hue: desaturate fully, then map to amber — blacks at `#0a0903`, whites at `#f2e2b4`, midtones pushed to `#ffb000` at 20%. **This grade destroys skin tone, which is correct and is also the constraint**: shoot the talking head in another direction's grade and cut to oscilloscope for the data segments, or accept a silhouette. 100% speed. **One speed exception:** a long time series may run at 400%, because that is a faster sweep, and a faster sweep is still an honest sweep.

**Transitions.** One only: a **sweep wipe** — the amber trace crosses the frame left to right at strictly constant speed over 30 frames, and the shot behind it has changed. Linear, never eased. Every other transition is banned.

**Cold open (first 3 seconds).** Frames 1–29: empty graticule, no sound but room tone. Frames 30–58: the trace sweeps once, left to right, 1200ms, linear. Frame 59: the number lands on the centre line at full size and holds. You have shown the shape of the story before the first word.

**What this edit cannot do:** more than one subject, a face in colour, or any change of pace. Its virtue is that it is metronomic, and metronomic is also its ceiling.

## 11. Podcast cover

3000×3000, shown at **150px**. Simplify to a 4-division graticule and one trace.

- **Graticule drops from 10×8 to 4×4.** At 150px, ten divisions is 15px each and reads as a grey haze. Four divisions is 37px each and reads as a grid. Draw the majors at 8px stroke, 0.20 alpha. **Minor ticks off. Crosshairs stay** — they are the direction's most recognisable mark at any size.
- One `#ffb000` trace, **24px stroke**, flat along the centre for the left half and rising to 75% height in the right half. Same gesture as the avatar, deliberately.
- Show title in Saira Condensed 600 uppercase at **300px**, `#f2e2b4`, **two lines max, three words per line**, sitting in the bottom two divisions, left at 240px.
- **No readouts, no unit, no number.** Share Tech Mono at any size that fits here renders under 10px at 150px.

## 12. Deck and talks

16:9, read from the back of a room. **Each slide is one channel.**

- The graticule is **always present at 10×8**, on every slide including the title. Divisions on a 1920×1080 artboard are 192×135px.
- **Title slide.** Label in Saira Condensed 600 uppercase at 96px above the centre line, and the talk's one number in Share Tech Mono at **280px** on it.
- **Section divider.** The section name alone in uppercase Saira Condensed at 140px, on the centre line, with an empty graticule behind it. No trace — a divider measures nothing.
- **Data slide.** **One number per slide, Share Tech Mono, never smaller than 120px, always with its unit, always on the centre line.** The label goes above in uppercase Saira Condensed. Any commentary goes below in **at most two lines of Saira**.
- **Slides with a lot of words:** they do not exist. The hard cap is **25 words**, which is lower than any other direction here, because the number is meant to be the slide. If a point needs a paragraph, put it in the talk track, not on the graticule.

`#ff6a3d` appears **only** when a value is out of the expected range, and **at most once per deck**. Minimum type: 32px on a 1920px artboard.

## Cost to run

**Moderate.** The furniture is free — one graticule template, one trace path, two readouts — and every asset is generated. There is no photography and no illustration, and the amber-only rule removes every colour decision you would otherwise make per asset.

The real cost is **the metric**. This direction cannot run without a number, a sample size and a window, and it fails loudly when the number is invented, because the trace has to carry the metric's actual shape. That means a data pull before every asset: 10–20 minutes if the dashboard exists, and a blocker if it does not. **Oscilloscope cannot sustain a daily cadence** for one person, because you do not generate a new meaningful metric every day. Run it weekly at most, and pair it with a cheaper direction for the days in between.

## Pairs with / clashes with

**Pairs with [swiss](../swiss/SKILL.md).** Swiss is neutral, achromatic and grid-disciplined, so it carries the prose that oscilloscope refuses to carry, and it does not compete for a hue.

**Pairs with [annual](../annual/SKILL.md)** for a year-in-review, where oscilloscope supplies the single headline figure and annual supplies the surrounding report.

**Pairs with [dusk](../dusk/SKILL.md)** as a warm counterweight when a face has to appear somewhere in the same campaign.

**Clashes with [terminal](../terminal/SKILL.md).** Both are native-dark, single-hue instrument worlds with a lattice over near-black. Amber against green is one hue apart, and side by side they read as one direction with a colour bug rather than as two directions. Never in the same kit, deck or feed week.

**Clashes with [blueprint](../blueprint/SKILL.md)** for the same reason: two measurement lattices on a dark ground, cyan against amber.

**Clashes with [risograph](../risograph/SKILL.md) and [arcade](../arcade/SKILL.md)** — both are built on colour count, and this direction is built on colour scarcity.

**Telling the three mono directions apart.** oscilloscope is amber-only, with Saira Condensed labels, Share Tech Mono **readouts**, a real 10×8 graticule, native dark. [terminal](../terminal/SKILL.md) is phosphor green with JetBrains Mono on everything and scanlines. [spec](../spec/SKILL.md) is near-white paper with Inter Tight prose and IBM Plex Mono on values only, native light, indigo. The graticule is the fastest tell: no other direction in this suite has one.

## The failure mode

**The decorative waveform.** Oscilloscope fails when the trace stops being data. A sine wave drawn for balance, a squiggle that rises because rising looks good, a graticule with nothing plotted on it — each of these turns an instrument into a screensaver, and the audience most likely to enjoy this direction is exactly the audience that will check the axis. The direction's entire claim is that the shape on screen is the shape of the thing. Before shipping, point at the trace and say which series it is. If you cannot, delete the trace and leave the graticule empty, which is honest and still looks like the instrument.

The second symptom is **a second hue**. `#ff6a3d` exists for one job, out-of-range, and the moment it marks a highlight the direction has two channels and therefore no channel. Count the non-amber elements on every asset. The answer is zero, or one with a stated reason.

The third is **the multi-subject post**. Three bullet points on a graticule is a lie about the hardware, and it reads as one, because a real scope with one channel cannot show three signals. If the content has three equal subjects, the direction is wrong before the design starts.
