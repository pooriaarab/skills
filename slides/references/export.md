# Export: PPTX and Google Slides

The HTML deck is the source. Text stays native and editable; figures go in as
images cropped from the PNGs.

**Units.** The stage is 1920×1080 px; a 16:9 slide is 13.333×7.5 in. So 1 px
is 6350 EMU or 1/144 in, and a font in pt is half its px (96 px is 48 pt).

## 1. Extract the text boxes from the live DOM

Run this per theme with Playwright after the pre-flight passes. Elements
marked `data-export="image"` come out as image boxes, not text.

```js
// slides.json: one entry per slide: { bg, images: [box], texts: [{ text, x, y, w, h, px, color, bold }] }
const out = [];
for (let n = 1; n <= count; n++) {
  await page.evaluate(k => { location.hash = '#' + k; }, n);
  await page.waitForTimeout(150);
  out.push(await page.evaluate(() => {
    const s = document.querySelector('.slide.on');
    const box = e => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const leaf = [...s.querySelectorAll('h1,h2,p,li,blockquote,figcaption,.num')]
      .filter(e => !e.closest('[data-export="image"]'));
    return {
      bg: getComputedStyle(s).backgroundColor,
      images: [...s.querySelectorAll('[data-export="image"]')].map(box),
      texts: leaf.map(e => { const c = getComputedStyle(e);
        return { text: e.innerText, ...box(e), px: parseFloat(c.fontSize), color: c.color, bold: +c.fontWeight >= 600 }; }),
    };
  }));
}
```

Crop each image box out of `shots/<theme>/sN.png` with Pillow. Inline colour
spans flatten to the block colour, and card fills are not extracted: add a run
or a native shape for each by hand.

## 2a. Build with python-pptx

```python
import json, re
from pptx import Presentation, dml, util

px = lambda v: util.Emu(round(v * 6350))
rgb = lambda c: dml.color.RGBColor(*[int(v) for v in re.findall(r"[\d.]+", c)[:3]])
prs = Presentation()
prs.slide_width, prs.slide_height = px(1920), px(1080)
for spec in json.load(open("slides.json")):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank: no title placeholder
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb(spec["bg"])
    for t in spec["texts"]:
        tf = slide.shapes.add_textbox(px(t["x"]), px(t["y"]), px(t["w"]), px(t["h"])).text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        run = tf.paragraphs[0].add_run()
        run.text, run.font.size, run.font.bold = t["text"], util.Pt(t["px"] / 2), t["bold"]
        run.font.color.rgb = rgb(t["color"])
prs.save("deck-dark.pptx")
```

Add figures with `slide.shapes.add_picture(path, px(x), px(y), px(w), px(h))`.

## 2b. Build with PptxGenJS

```js
import pptxgen from 'pptxgenjs';
const pptx = new pptxgen();
pptx.defineLayout({ name: 'STAGE', width: 13.333, height: 7.5 }); pptx.layout = 'STAGE';
const inch = v => v / 144, hex = c => c.match(/[\d.]+/g).slice(0, 3).map(v => (+v).toString(16).padStart(2, '0')).join('');
for (const spec of slides) {
  const s = pptx.addSlide();
  s.background = { color: hex(spec.bg) };
  for (const t of spec.texts) s.addText(t.text, { x: inch(t.x), y: inch(t.y), w: inch(t.w), h: inch(t.h),
    fontSize: t.px / 2, bold: t.bold, color: hex(t.color), margin: 0, valign: 'top' });
}
await pptx.writeFile({ fileName: 'deck-dark.pptx' });
```

Add figures with `s.addImage({ path, x, y, w, h })`. Skip PptxGenJS `fit` and
`autoFit`; the openai/skills slides skill rules them out.

## 3. Check the PPTX

Run `soffice --headless --convert-to pdf deck-dark.pptx`, then `pdftoppm -png -r 60`
on the PDF. Compare each page with the HTML shot. Wrap changes mean a missing font.

## 4. Google Slides

Upload the PPTX to Drive with conversion, using the `gog` CLI:

```bash
for t in dark light; do gog drive upload deck-$t.pptx --convert-to slides --name "Deck ($t)" --json; done
```

- `--convert` also works: it infers Slides from `.pptx`. `--parent <folderId>`
  files it, `-a <account>` picks the account, `--dry-run` previews.
- The `gws` CLI can call the Slides API, but its token may lack the
  `presentations` scope. Upload with conversion needs only Drive.
- Open the result. Converted decks can swap fonts.
