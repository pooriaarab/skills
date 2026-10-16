# Templates

Download the style file from the venue. Do not commit it here, and do not
use a copy hosted by a course or a third-party repo. The page-limit check is
the same everywhere: build a PDF with that class, then count only the pages
the venue counts. If the PDF looks tighter than the sample, you changed the
geometry. Revert it.

| Venue | Official template | What counts | How to check |
|---|---|---|---|
| arXiv | For an ML paper, the official NeurIPS style with its `preprint` option: `\usepackage[preprint]{neurips_2026}`. Zip: <https://media.neurips.cc/Conferences/NeurIPS2026/Formatting_Instructions_For_NeurIPS_2026.zip>. Plain `article` is also accepted. Skeleton: `../assets/arxiv-skeleton/`. | No venue page limit. Do not shrink margins or fonts to save pages: arXiv has no budget to meet. arXiv still rejects a PDF made from TeX. | `tectonic main.tex` (0.15.0 works). Open the PDF: the footer reads "Preprint.". Put the `.sty` in the arXiv tarball and not in the repo. Then follow `checklists.md`. |
| NeurIPS 2026 E&D | The main-track style linked from the handbook. Default option `\usepackage[eandd]{neurips_2026}`. A direct zip URL was not in the handbook text. <https://neurips.cc/Conferences/2026/MainTrackHandbook> | 9 content pages, figures and tables included. References, appendices, and the checklist do not count. Camera-ready: 10 content pages. | Build with the style file. Count pages before the references. |
| ICLR 2027 | <https://media.iclr.cc/Conferences/ICLR2027/iclr-2027-style-files.zip> | 9 pages at submission, 10 after. References and appendices do not count. The AI-use statement does not count. | Build. Count main-text pages. Over the limit is a desk reject. |
| ICML 2026 | <https://media.icml.cc/Conferences/ICML2026/Styles/icml2026.zip> | 8 main pages. References, impact statement, and appendices do not count. Camera-ready main text is 9. | Build. The impact statement sits with acknowledgements, before references. |
| ARR, ACL, EMNLP, NAACL, EACL, COLING | ACL style from the ARR author instructions. Direct zip: UNVERIFIED on 2026-10-16. <https://aclrollingreview.org/cfp> | ARR: 8 (long) or 4 (short) content pages. The Limitations section is required and free. ACL 2027's CFP also allows unlimited appendices and adds one content page at camera-ready. | Build with the ACL class. Confirm which sentence applies to this submission. |
| COLM 2026 | <https://github.com/COLM-org/Template/releases/tag/2026> | 9 pages main text. Citations unlimited. Do not alter margins or fonts. | Build with the 2026 release, not an older COLM tag. |
| AAAI-27 | <https://aaai.org/authorkit27/> | 7 content pages. Only references may use pages 8 and 9. | Build with the 2027 kit. Count to the end of the content, not the PDF. |
| IJCAI-27 | UNVERIFIED. No paper CFP on <https://www.ijcai.org/future_conferences>. | UNVERIFIED | Do not reuse an older IJCAI kit and call it 2027. |
| KDD 2027 D&B | ACM `acmart`, `\documentclass[sigconf,review]{acmart}`. <https://www.acm.org/publications/proceedings-template> | 8 content pages at submission. Camera-ready: 9 content, and at most 3 pages of references plus appendix. | Build `sigconf`. The appendix is unlimited only before acceptance. |
| TMLR | <https://github.com/JmlrOrg/tmlr-style-file/archive/refs/heads/main.zip> | No fixed limit. | Build with the TMLR class. Keep the PDF anonymous. |
| DMLR | <https://github.com/JmlrOrg/dmlr-style-file> | No fixed limit. | Build with the DMLR class. The dataset PDF is a separate file. |
| JMLR MLOSS | JMLR format linked from <https://jmlr.org/mloss/mloss-info.html> | 4 pages plus references. | Count the description, not the reference pages. |
| JOSS | Markdown `paper.md`, not LaTeX. <https://joss.readthedocs.io/en/latest/paper.html> | 750-1750 words. | Count words in the paper, not the README. |
| FAccT 2027 | ACM `acmart`: `\documentclass[manuscript,screen,review,anonymous]{acmart}`. <https://facctconference.org/2027/authorguide.html> | 14 pages excluding references. One extra page for endmatter. | Build the `manuscript` option, not `sigconf`. |
| FORGE 2027 Data and Benchmarking | IEEE conference template. `\documentclass[10pt,conference]{IEEEtran}` without `compsoc`. <https://www.ieee.org/conferences/publishing/templates.html> | 4 pages plus 1 reference page. Appendices in the PDF count. | Build `IEEEtran`. Last year this track used ACM. Do not reuse that kit. |
| TAE, NeurIPS 2026 workshop | <https://media.neurips.cc/Conferences/NeurIPS2026/Formatting_Instructions_For_NeurIPS_2026.zip>. `\usepackage[dblblindworkshop]{neurips_2026}`. Camera-ready adds `final`. | 8 pages excluding refs and appendices. Camera-ready: 10 content pages. | Build the workshop option. The main-track option is a different paper. |

## Page-limit check

1. Clean the tree and build with the official class.
2. Open the PDF. Find the first line of the references, the checklist, and
   any section the row says is free (limitations, impact, AI-use statement).
3. Count the content pages above that line, including every figure and table
   the row includes.
4. If you are over, cut text. Do not change margins, font size, or line
   spacing.
5. After acceptance, repeat the count. The limit is often one page higher,
   and acknowledgements come back.
