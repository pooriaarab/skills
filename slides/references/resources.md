# Resources

Each link was opened on 2026-10-15. Each line says what to take from it.

## Skills, tools and frameworks

| Resource | What to take |
|---|---|
| [openai/skills slides](https://github.com/openai/skills/tree/e6afb0d74cc75d220df2faf3dd6c635c2dc6a108/skills/.curated/slides) | PptxGenJS with overlap and out-of-bounds warnings, and render-then-look. Removed from main in [fdf90d6](https://github.com/openai/skills/commit/fdf90d652aea00d3fa57803a348744b1d7670fcb); this link is the last tree. |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | Its [slides entry](https://github.com/nexu-io/open-design/blob/main/skills/slides/SKILL.md) only points at openai/skills. Take the idea of a deck mode beside frontend-slides and pptx skills, not the code. |
| [open-slide](https://github.com/open-slide/open-slide) ([site](https://open-slide.dev)) | A fixed 1920×1080 canvas with React pages, and in-browser comments the agent applies. Check whether its PPTX export is editable before you rely on it. |
| [frontend-slides](https://github.com/zarazhangrui/frontend-slides) | Show three style previews and let the owner pick, instead of asking for adjectives. |
| [anatomy](https://skills.wheresryan.sh/anatomy) ([repo](https://github.com/wheresryan22/anatomy)) | Isometric figures of real objects. Install with `npx skills add wheresryan22/anatomy`. Start from the closest example and build `--light` too. |
| [impeccable](https://impeccable.style) ([repo](https://github.com/pbakaus/impeccable)) | The craft floor and the refuse list, plus `npx impeccable detect <path>` on the HTML. |
| [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) | Native text, shapes and charts from JavaScript. Set the layout first. |
| [python-pptx](https://python-pptx.readthedocs.io/en/latest/) | Native text boxes from Python. Use the blank layout so no title placeholder appears. |
| [gog CLI](https://github.com/openclaw/gogcli) ([upload flags](https://github.com/openclaw/gogcli/blob/main/docs/commands/gog-drive-upload.md)) | `gog drive upload --convert-to slides` turns a PPTX into Google Slides. |
| [gws CLI](https://github.com/googleworkspace/cli) | Direct Slides API calls. Check its token has the `presentations` scope first. |
| [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) | A manual second opinion on a colour pair the pre-flight flags. |
| [Slidev](https://sli.dev) | Markdown slides with Vue. Good for code-heavy talks and presenter mode. |
| [Marp](https://marp.app) | Markdown to HTML, PDF and PPTX in one CLI. Fast for a text-first draft. |
| [reveal.js](https://revealjs.com) | The mature HTML deck: fragments, speaker notes, PDF print. Borrow its keyboard model. |

## Methods, books and recent guides

| Resource | What to take |
|---|---|
| [Takahashi method](https://en.wikipedia.org/wiki/Takahashi_method) | A few huge words per slide. Proof that big type alone can carry a talk. |
| [Lessig method](https://sixminutes.dlugan.com/tag/lessig-method/) | Many fast slides, each one word, phrase, picture or quote, cut to the speech. |
| [Guy Kawasaki, 10/20/30](https://guykawasaki.com/the_102030_rule/) | 10 slides, 20 minutes, no font under 30 pt. A ceiling, not a target. |
| [Nancy Duarte, Resonate](https://www.duarte.com/resources/books/resonate/) | Move between "what is" and "what could be", and end on the new bliss. |
| [Nancy Duarte, slide:ology](https://www.duarte.com/resources/books/slideology/) | The glance test: the point of a slide reads in about three seconds. |
| [Garr Reynolds, Presentation Zen](https://presentationzen.com/) ([tips](https://www.garrreynolds.com/tips)) | Restraint, empty space, and planning away from the computer. |
| [Edward Tufte, The Cognitive Style of PowerPoint](https://www.edwardtufte.com/book/the-cognitive-style-of-powerpoint-pitching-out-corrupts-within-ebook/) | Bullets and templates break reasoning. Put dense evidence in a handout, not on a slide. |
| [Ines Montani, beautiful slides part 3](https://ines.io/blog/beautiful-slides-talks-part-3-technical-content) (Feb 2025) | Redraw tables and figures for the screen. If an idea is too complex for a flowchart, simplify it. |
| [Marcus Noble, tips on technical talks](https://marcusnoble.co.uk/2025-04-30-my-tips-on-giving-technical-talks/) (Apr 2025) | Projectors wash out colour, so push contrast. Step through code over several slides. Skip his handle-on-every-slide tip: it breaks the no-footer rule. |
