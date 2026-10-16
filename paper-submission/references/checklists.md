# Checklists

Answer the checklist that ships in the official template. This page is the
list of topics those checklists cover, in our words, plus the arXiv packet.
Do not paste a venue's questions into a paper from this file.

## Paper checklist

NeurIPS requires the paper checklist from the style file. It does not count
toward the nine content pages. The public guide is
<https://neurips.cc/public/guides/PaperChecklist>. Cover, and point at the
section:

- Claims in the abstract and introduction match the experiments.
- Limitations are stated.
- Theory names its assumptions.
- Experiments name compute, seeds, and hyperparameters, or say why they
  cannot.
- Code and data: where they are, or why they are not released.
- Existing assets and the licences you used.
- New assets documented for a later user.
- Human subjects, consent, and review, or an explicit n/a.
- Ethics and possible harm. A "broader impacts" heading is not required.
  Harm discussion, if you include it, counts toward the page limit
  (<https://neurips.cc/Conferences/2026/MainTrackHandbook>).

Authors own every word and figure. Document LLM or agent use when it is part
of the method. Spell-check and basic code assistance need not be documented.
An LLM is not an author.

### Datasheet and Croissant

For a new dataset, also document, in your own words: why it exists, what is
in it, how it was collected, preprocessing, intended and out-of-scope uses,
distribution and licence, and who maintains it. DMLR requires that
documentation as a separate PDF for new datasets, plus a reviewer URL, an
author statement of responsibility, and a hosting plan
(<https://data.mlr.press/submissions.html>). DMLR does not name Croissant.

NeurIPS Evaluations & Datasets does. A new dataset needs a Croissant file
with core fields and Responsible AI fields, included with the paper. Validate
it. Preferred hosts (Kaggle, OpenML, Hugging Face, Dataverse) can emit the
core file; you still add the RAI fields. Field names live on
<https://docs.mlcommons.org/croissant/docs/croissant-rai-spec.html>, not in
this repo. The rule is
<https://neurips.cc/Conferences/2026/CallForEvaluationsDatasets>.

### Reproducibility

Say how to rerun the eval: command, seed, hardware, split, and where the
scorer lives. ICLR asks for an optional reproducibility statement that does
not count toward the page limit
(<https://iclr.cc/Conferences/2027/AuthorGuidelines>). AAAI requires a
reproducibility checklist on the main track
(<https://aaai.org/conference/aaai/aaai-27/main-technical-track-call/>).

### AI-assistance disclosure

Match the venue. Do not reuse one paragraph everywhere.

- **ICLR 2027.** A required AI-use statement. It does not count toward the
  page limit. Details:
  <https://iclr.cc/Conferences/2027/AuthorGuidelines>.
- **ARR.** Disclose generative writing or coding in the Responsible NLP
  checklist. Put the details in the acknowledgements. Proofreading tools
  need not be disclosed. People and grant acknowledgements on the submission
  break anonymity
  (<https://aclrollingreview.org/cfp>).
- **JOSS.** An "AI usage disclosure" section. If no tool was used, say so.
  Name tools, where they were used, and that a human reviewed the output
  (<https://joss.readthedocs.io/en/latest/paper.html>).
- **KDD Datasets & Benchmarks.** Disclose generative AI in the submission
  form (<https://kdd2027.kdd.org/datasets-and-benchmarks-track-call-for-papers/>).
- **AAAI-27.** Authors may use generative tools and remain responsible for
  plagiarism, fake references, and the code of ethics
  (<https://aaai.org/conference/aaai/aaai-27/main-technical-track-call/>).

## arXiv packet

Sources:
<https://info.arxiv.org/help/submit/index.html>,
<https://info.arxiv.org/help/submit_tex.html>,
<https://info.arxiv.org/help/policies/submission_agreement.html>.

- [ ] TeX or LaTeX source. Not a PDF, PS, or DVI built from that source.
      Not a scan.
- [ ] One top-level main file. No referee-mode double spacing. No journal
      class you do not need.
- [ ] `.bib` or `.bbl` if you use BibTeX or Biber. A biblatex `.bbl` must
      match the biblatex and Biber on arXiv.
- [ ] `.ind` if you used makeindex. Glossary files if you used a glossary.
- [ ] Figures: `.pdf`, `.png`, or `.jpg` for PDF-mode LaTeX. PostScript
      (`.ps`, `.eps`) only for DVI-mode LaTeX. arXiv does not convert EPS
      to PDF during processing.
- [ ] No `\today`.
- [ ] You viewed the PDF arXiv built before finishing. A `00README` can
      steer processing. See the TeX help page.
- [ ] Licence picked at submit: CC BY 4.0, CC BY-SA 4.0, CC BY-NC-SA 4.0,
      CC BY-NC-ND 4.0, the arXiv.org non-exclusive distribution licence, or
      CC0 1.0. For a different CC licence, select the arXiv non-exclusive
      licence and name the CC licence in the article. The grant to arXiv is
      non-exclusive and irrevocable. Metadata is CC0.
- [ ] Categories chosen. On 2026-10-16 the taxonomy still listed `cs.AI`,
      `cs.CL`, and `cs.LG`. Re-check
      <https://arxiv.org/category_taxonomy>.
- [ ] Endorsement requested if arXiv asks. New users and new categories may
      need it (<https://info.arxiv.org/help/endorsement.html>).
- [ ] Extra data or code that is not part of the paper goes in ancillary
      files, not in the TeX tree as a surprise.
- [ ] The skeleton in `../assets/arxiv-skeleton/` compiles with tectonic.
      Replace the placeholder before you upload it.

A minimal tree that compiles is `main.tex`, `refs.bib`, and a `Makefile`
whose `all` target runs `tectonic main.tex`.
