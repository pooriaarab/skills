---
name: ai-game-assets
description: "Use when producing sprite or prop art from an image model — characters, items, tiles, UI pieces — and you need real transparency at usable resolution without overspending. Covers the counter-intuitive cost result (generate cheap then upscale beats generating expensive), the three silent failures that ruin sprites (models ignore transparent-background prompts, upscalers strip the alpha channel, models drift between generations), cutting a contact sheet into individual sprites, and cost controls for a job that spends real money per image. Triggers: 'generate sprites', 'game art from AI', 'asset pipeline', 'transparent background', 'upscale sprites', 'sprite sheet', 'character art', 'prop pack'."
---

# Generating usable sprite art from an image model

## The cost result that decides the pipeline

Generating with an expensive model is **worse value** than generating with a
cheap one and upscaling. This is not a small edge:

| Route | Cost per asset | Final resolution | Transparent |
|---|---|---|---|
| cheap model + background cut + 4x upscale | **~$0.0064** | 4096px | yes |
| premium model alone | ~$0.024 | 1024px | no |

Roughly four times the price for a quarter of the pixels and an opaque
background. Prefer: **generate cheap, cut the background, upscale.**

## Three silent failures, each of which ruins every sprite

None of these error. You only find them by opening an output file.

### 1. The model ignores "transparent background"

Put it in the prompt as often as you like. Text-to-image models return **opaque
RGB**. The sprite ships with its backdrop baked in, and a batch of 200 looks
fine in a file listing.

Run a background-removal model as its own step. It is the cheapest step in the
pipeline. Verify by reading the alpha channel, not by eye:

```python
from PIL import Image
a = Image.open(p).convert("RGBA").split()[-1]
print(a.getextrema())     # (255, 255) means OPAQUE. anything else is real alpha
```

### 2. The upscaler destroys the alpha channel you just paid for

Most upscale endpoints return **RGB JPEG**. Transparency you had is gone, and
the output still looks correct as a thumbnail.

Fix it by re-applying the source alpha, resized to match:

```python
src = Image.open(source).convert("RGBA")
w, h = src.width * scale, src.height * scale
big = Image.open(upscaled).convert("RGB").resize((w, h), Image.LANCZOS)
big.putalpha(src.split()[-1].resize((w, h), Image.LANCZOS))
```

Assert the result: mode `RGBA`, dimensions exactly `scale` times the source, and
an alpha range that is not `(255, 255)`.

### 3. Models drift between generations

The same character prompt twice gives two different characters — different hat,
different proportions. Three ways out, in increasing order of reliability:

- **Generate one sheet, not twelve images.** Every pose in a single generation
  shares one identity. The cost is resolution: a fixed canvas divided many ways
  gives small cells.
- **Pass a reference image** to anchor the style on every call.
- **Generate the parts, animate in code.** Produce a character once as separate
  pieces (head, torso, upper arm, forearm, thigh, shin) and animate by rotating
  joints in a node tree. Unlimited perfectly consistent frames from one
  generation. This is how skeletal 2D animation tools work, and it is the right
  answer when you need real animation rather than one pose per direction.

Keep style strings in a **config file, not in prompts**, so a project reuses one
string instead of improvising a new one each call. A workable 2.5D preset:

> 2.5D cartoon game asset, cute chibi proportions with a large head, soft
> rounded forms, glossy round highlights, warm saturated colours, clean thick
> outlines, soft drop shadow, three-quarter angled top-down view, transparent
> background

## Cutting a contact sheet into sprites

A generated "sprite sheet" is usually a **contact sheet**: non-uniform cells,
often with coloured group boxes and text labels drawn over them. Nothing loads
it directly.

Find sprites by alpha with an **iterative** flood fill — recursion overflows the
stack on a sheet of any size. Then reject the furniture, which is the hard half:
a coloured group box passes every naive test, since it has alpha, is connected,
and has a bounding box. Reject on fill ratio, on proximity to the box outline,
and on whether a component's box contains other components.

**Test the cut with an equality, not a count.** If two sheets share a layout and
differ only in colour, they must yield identical counts. That comparison fails
loudly when the rejection rules are wrong, in a way a single-sheet count never
does.

**Clear the output directory before writing.** Sprite files are named by index,
so a run that finds fewer sprites than the last leaves the surplus behind. Those
orphans are absent from the manifest, so anything globbing the directory instead
of reading the manifest picks up sprites that no longer exist.

Write a manifest recording source sheet, index, bounding box and group. Consumers
should read the manifest, never glob.

## Resolution: do the arithmetic before generating

A phone renders at 3x. A character drawn 70 to 100 points tall needs 210 to 300
pixels. Source art at 88x167 is upscaled by the renderer and looks soft, and
nobody notices until it is on a device.

Decide the on-screen size first, multiply by the device scale, and generate or
upscale to that. Upscaling existing art is usually far cheaper than regenerating
it, and preserves a style that already works.

## Cost controls, because this spends real money per image

A few hundred assets is real money and a runaway loop is worse.

- Always print an estimate, and require explicit confirmation above a threshold.
- Offer a dry run on every subcommand that makes no API calls at all.
- **Skip an output that already exists**, so a re-run resumes instead of paying
  twice.
- Stop after N consecutive failures. If ten in a row fail, something is wrong and
  continuing only spends money.
- Do one asset end to end and inspect it before launching the batch.

## Verify by looking, not by exit code

A generation job reports success while producing unusable output. A build that
compiles and a screenshot that exists prove neither the art loaded nor that it
is right — a missing texture renders as a placeholder marker and still captures
happily.

Open a file. Read the alpha range. Compare counts across sheets that should
match. Those are instruments; an exit code is not.
