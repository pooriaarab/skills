# Free venues and journals

Extends [`venues.md`](venues.md). It adds free preprint servers, archives and journals, and says which are usable for an independent author.

Checked 2026-10-16 against the official pages named in each row. `UNVERIFIED` means
the page did not load (403, bot wall, or empty). Do not act on an `UNVERIFIED` cell until a person
opens the page. Re-open the source URL before you act: pages change.

## 0. Five facts that change the plan

1. arXiv no longer endorses by institutional email alone (since 2026-01-21). An independent author needs a personal endorser. arXiv staff cannot endorse.
2. arXiv limits each submitter to 2 submissions per calendar month and 3 active submissions (since 2026-10-01). Put the whole family in ONE paper.
3. Zenodo states that Google Scholar does not index Zenodo (FAQ published 2026-01-30). A Zenodo DOI will not put the repos in Scholar. arXiv and a Scholar profile do that.
4. Papers with Code is gone. `paperswithcode.com` returns a 302 redirect to Hugging Face Trending Papers. The arXiv abstract page has no Papers with Code tab. Use Hugging Face paper pages instead.
5. Most extra "free" servers fail on eligibility for this author. See section A. SciELO bars a second preprint server. engrXiv rejects CS. Open Research Europe needs EU funding or a listed country. HAL needs an academic institution.

Also note: on 2026-10-16 none of the 24 public repos had a `CITATION.cff` or `.zenodo.json` (GitHub contents API). An agent can add them: one small PR per repo.

---

## A. Additional FREE preprint servers, archives and repositories

### A1. Usable or possibly usable

| Venue | State | Cost | Fit for this paper | Source | Verified |
|---|---|---|---|---|---|
| Research Square | Open | Free to submit. "Submitting your manuscript to Research Square is free." | Multidisciplinary. A CS subject list is UNVERIFIED. Posting is public and permanent. Staff screen first. Posting takes 24 to 48 hours. A DOI is issued. | https://support.researchsquare.com/support/solutions/articles/6000271843-how-do-i-submit-a-preprint- and https://support.researchsquare.com/support/solutions/articles/6000271832-what-does-it-cost-to-submit-my-manuscript-to-research-square- | 2026-10-16 |
| SSRN (Computer Science Research Network) | Open | Free to upload. Papers by individual authors download free. | Already in `venues.md`. New facts: the CompSciRN page returned 403, so the CS network is UNVERIFIED. Scholar indexing of SSRN can take 6 to 9 months. | https://www.elsevier.support/ssrn/answer/are-all-papers-on-ssrn-free and https://www.elsevier.support/ssrn/answer/google-scholar | 2026-10-16 |
| Cambridge Open Engage | Open (the archive shows posts dated October 2026) | UNVERIFIED | The submission guide did not load. A CS subject and the cost are UNVERIFIED. | https://www.cambridge.org/engage/coe/archive-dashboard | 2026-10-16 |
| Preprints.org (MDPI) | UNVERIFIED (HTTP 403 on every page) | UNVERIFIED | Search snippets say "free" and "multidisciplinary". Not opened. | https://www.preprints.org/ | UNVERIFIED |
| Wiley Research Exchange Preprints (hosts the former Authorea) | UNVERIFIED | UNVERIFIED | The generic docs page loads. It has no cost, scope or Authorea text. Authorea and ScienceOpen returned 403. | https://rex-docs.atypon.com/preprints/index.html | 2026-10-16 (docs page only) |
| Zenodo (paper copy) | Open | Free | Already in `venues.md`. Limit: 50 GB per record. Any status is accepted. A licence is required per public file. | https://about.zenodo.org/policies/ | 2026-10-16 |
| Figshare (data only) | Open | Free account: 20 GB, 500 items | The free platform takes "Research Data" only. It refuses papers you do not own and content that already has a DOI. Use it for dataset files, not for the paper. | https://info.figshare.com/user-guide/figshare-policies/ and https://info.figshare.com/user-guide/account-limits/ | 2026-10-16 |
| Hugging Face dataset repos | Open | Free | Hosts the dataset files and cards. Section D covers the paper page link. | https://huggingface.co/docs/hub/en/datasets-cards | 2026-10-16 |
| Software Heritage "Save Code Now" | Page loads. The WebFetch tool failed on a certificate, `curl` worked. | Free | Archives source code and gives each artifact a SWHID. The exact "Save Code Now" steps are UNVERIFIED. | https://www.softwareheritage.org/save-and-reference-research-software/ | 2026-10-16 |

Notes for A1:

- Research Square: the "Submit a Preprint" steps are: click the button, enter a title, accept the terms, log in, upload `.pdf`/`.docx`/`.doc`, fill the metadata, enter your institution, tick the declarations (a conflict-of-interest statement is required), then choose "Proceed with my preprint". The last step is permanent. A person must do it.
- Pick ONE preprint server for the paper text, and that is arXiv. Extra servers add copies, not reach. The `paper-submission` skill already says to keep one archival copy in play. A preprint on a second server is not a second archival venue, but TMLR and some journals ask you to declare it.
- Do not post to a server whose rules ban earlier preprints (see A2, SciELO).

### A2. Rejected or not usable (one line each)

| Venue | Reason | Source | Verified |
|---|---|---|---|
| SciELO Preprints | The checklist says the manuscript was not posted to another preprint server first. Conflicts with arXiv. PDF only. CC BY. | https://preprints.scielo.org/index.php/scielo/about/submissions | 2026-10-16 |
| engrXiv | "We do not accept works in the areas of mathematics, theoretical physics, computer science, information technology, or cybersecurity without a strong engineering connection." AI-focus work gets extra scrutiny. | https://engrxiv.org/about | 2026-10-16 |
| Open Research Europe | Needs an EU grant today. The new phase starts autumn 2026 and widens access to authors in 11 countries (Austria, France, Germany, Italy, Netherlands, Norway, Portugal, Slovenia, Spain, Sweden, Switzerland). The article guidelines page loaded empty. | https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/new-era-open-research-europe-2026-03-26_en | 2026-10-16 |
| HAL | Open to "academic institutions in France and abroad". Independent authors are not mentioned. Manual check takes days. The HAL-to-arXiv shortcut needs a French affiliation. | https://about.hal.science/en/publishing-workflow/ and https://www.ccsd.cnrs.fr/en/2026/03/do-arxiv-s-rule-changes-have-an-impact-on-hal/ | 2026-10-16 |
| Qeios | Free only "if their articles attract spontaneous reviewers". A Pro plan costs $24.99 per month. CS scope is not stated. Cost status is unclear. | https://www.qeios.com/about | 2026-10-16 |
| Figshare for the paper | The free platform does not take papers. | https://info.figshare.com/user-guide/figshare-policies/ | 2026-10-16 |
| Internet Archive Scholar | Not a venue. It harvests the open web. There is an inclusion form. Wait at least three months. No upload. | https://scholar.archive.org/about | 2026-10-16 |
| CORE | Not a venue. It indexes repositories and journals. It does not take author uploads. | https://core.ac.uk/faq | 2026-10-16 |
| Papers with Code | Service ended. The domain redirects. | https://paperswithcode.com/ (302 to https://huggingface.co/papers/trending) | 2026-10-16 |
| OSF Preprints, TechRxiv | Already covered as suspended or closed in `venues.md`. Not re-checked. | `references/venues.md` | not re-checked |

### A3. Zenodo communities

| Item | Fact | Source | Verified |
|---|---|---|---|
| How a community works | Owners and curators accept or decline records. Start the upload from the community page and use "Submit for review". | https://help.zenodo.org/docs/communities/ | 2026-10-16 |
| A community for AI benchmarks | No named community verified. The Zenodo API search returned a non-JSON page. Search the Zenodo communities list by hand. | https://zenodo.org/communities | UNVERIFIED |
| Put a record in a community by file | `.zenodo.json` supports a `communities` field. `CITATION.cff` does not. | https://help.zenodo.org/docs/github/describe-software/zenodo-json/ | 2026-10-16 |

---

## B. Free-to-publish peer-reviewed journals for benchmark, dataset and software papers

For conference tracks (NeurIPS E&D, KDD D&B, ICLR, ACL ARR and others) see `references/venues.md`.

| Venue | APC | Fit | Main rules | Source | Verified |
|---|---|---|---|---|---|
| TMLR | None: "no fees or payments to authors, reviewers, action editors, or editors-in-chief". | Good if the claims match the evidence. | Double blind. OpenReview. TMLR LaTeX style. No overlap with published work, but arXiv preprints are allowed. Do not link a named version in the submission. Criterion 1: "Are the claims ... supported by accurate and convincing evidence?" Novelty is not required. | https://jmlr.org/tmlr/editorial-policies.html , https://jmlr.org/tmlr/author-guide.html , https://jmlr.org/tmlr/acceptance-criteria.html | 2026-10-16 |
| DMLR | None: "does not require any fees or payments from authors". | Best topic fit. Scope lists datasets, benchmarks, benchmarking tools. | Single blind (identities not anonymized). OpenReview. DMLR LaTeX template. No page limit. High bar. Dataset and benchmark papers need documentation, reviewer access, and hosting, licensing and maintenance plans. ISSN is pending. | https://data.mlr.press/submissions.html and https://data.mlr.press/ | 2026-10-16 |
| JMLR MLOSS | Fee not mentioned on the pages I opened. UNVERIFIED. | Fits `benchmark-core` as software. | Recognised open source licence. Public code repository. Up to four pages in JMLR format plus references. Reviewed on description, community impact, documentation, sustainability, development practice. | https://jmlr.org/mloss/mloss-info.html | 2026-10-16 |
| JOSS | None: "no fees for submitting or publishing". Diamond open access. | Possible for `benchmark-core`. Weak for single task sets. | Repo public for more than six months with active development. OSI licence. `paper.md` plus BibTeX in the repo. "Obvious research application". Thin or single-function packages are refused. AI-use disclosure is required. After acceptance, archive on Zenodo or Figshare and post the DOI. | https://joss.readthedocs.io/en/latest/submitting.html and https://joss.theoj.org/about | 2026-10-16 |
| JAIR | None: "we do not charge any publication fees". CC BY. | Possible. No resource or dataset track on the page. | JAIR format only. A reproducibility checklist is required or the paper is desk rejected. Not under review elsewhere. | https://www.jair.org/index.php/jair/about/submissions | 2026-10-16 |
| TACL | Fee not mentioned on the page. UNVERIFIED. | Low. NLP and computational linguistics only. | Double blind. No supplementary material. ACL-family reviewed papers are barred for 9 months. | https://transacl.org/index.php/tacl/about/submissions | 2026-10-16 |
| ReScience C | "Platinum open access". Fee not stated. UNVERIFIED. | Poor. It targets replication of published work. | Not a venue for a new benchmark suite. | https://rescience.github.io/ | 2026-10-16 |
| Journal of Open Research Software | REJECTED. It charges an APC. A waiver is possible on request. | Software metapapers. | Not free by default. | https://openresearchsoftware.metajnl.com/about/ | 2026-10-16 |

Notes for B:

- Risk: "No real model results exist yet." TMLR judges claims against evidence. State only claims the mock-provider validation supports. DMLR sets a "high bar". Plan to submit after a first real-model run.
- Risk: JOSS needs more than six months of public history. Check the first public commit date of `benchmark-core`. I did not check it.
- Keep one archival copy in play, per the existing skill. A journal submission after an arXiv post is normal for TMLR.

---
