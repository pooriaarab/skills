# arXiv for an independent author, and the order of operations

Checked 2026-10-16 against the official pages named in each row. `UNVERIFIED` means
the page did not load (403, bot wall, or empty). Do not act on an `UNVERIFIED` cell until a person
opens the page. Re-open the source URL before you act: pages change.

## F. arXiv specifics for this paper

### F1. Account and endorsement

| Topic | Fact | Source | Verified |
|---|---|---|---|
| Register | Name, organization, email, unique username. "If you are unaffiliated you may enter 'Independent' as your organization." The email is verified. | https://info.arxiv.org/help/registerhelp.html | 2026-10-16 |
| ORCID | Optional. You can create one during registration or submission. A linked iD shows on your user page. | https://blog.arxiv.org/2019/05/16/orcid-doi/ | 2026-10-16 |
| Who needs endorsement | "before submitting their first paper to arXiv or a new category". | https://info.arxiv.org/help/endorsement.html | 2026-10-16 |
| Policy since 2026-01-21 | Institutional email alone no longer endorses. Automatic path needs BOTH an academic or research email AND an accepted paper in the target endorsement domain. Everyone else needs personal endorsement. Staff "are not able to personally endorse". | https://blog.arxiv.org/2026/01/21/attention-authors-updated-endorsement-policy/ | 2026-10-16 |
| Who can endorse | An author with papers in the endorsement domain submitted "between three months and five years ago". | https://info.arxiv.org/help/endorsement.html | 2026-10-16 |
| What endorsement is | At least one positive endorsement per category. "It is not peer review." It can be revoked. | same | 2026-10-16 |
| CS endorsement domain | Whether `cs` is one domain or several is UNVERIFIED. The request email shows the domain. | n/a | UNVERIFIED |

How to find an endorser (all from the endorsement page):

1. Start a new submission and select cs.AI. arXiv shows an endorsement request link and text.
2. Open recent arXiv abstracts close to your topic. Use "Which authors of this paper are endorsers?" at the bottom.
3. Find a person you know and who knows the field. Read the "Submission history" heading for a contact email.
4. Send ONE request to ONE person. You may add your ORCID or a copy of the paper.
5. Wait. Do not email many people at once. Do not email the same person again and again.

Allowed and not allowed:

- Allowed: ask a person who knows your work and field. Give them the paper to read.
- Not allowed: pay for endorsement. Mass-email. Post a public call for endorsers. Ask someone to endorse a paper they have not seen. The page bans endorsing "third parties or proxies" and bans endorsing "someone you don't know without having seen their paper". The page has no text about payment or social media. I mark that as my reading.
- Staff cannot waive endorsement. Use the arXiv support form only for account problems.

### F2. Submission steps

Source: https://info.arxiv.org/help/submit/index.html . Verified 2026-10-16. A person does these steps.

1. Log in. Click "START NEW SUBMISSION".
2. Upload one `.tar.gz` or `.zip` of the TeX source. Do not upload a PDF made from TeX. arXiv does not accept PDF generated from TeX source.
3. Check the detected compiler and the top-level `.tex` file.
4. Read the compile log. Preview the PDF.
5. Enter metadata. Pick a licence. Pick categories.
6. Click "Submit Article". The date stamp is set at this step.
7. Wait for "on hold" or announcement emails.

Files and TeX rules:

| Rule | Detail | Source | Verified |
|---|---|---|---|
| Source form | TeX/LaTeX source is the preferred format. Not accepted: DVI, PS, PDF made from TeX, scans. | https://info.arxiv.org/help/submit/index.html | 2026-10-16 |
| File names | Letters, digits, `_ + - . , =` only. Names are case sensitive. | same | 2026-10-16 |
| Figures | PDF, PNG, JPG for PDFLaTeX. No omitted figures. | same | 2026-10-16 |
| Bibliography | Upload a `.bbl` named like the main `.tex`, or upload the `.bib`. With no `.bbl`, arXiv detects the tool. The paper and `.bbl` must come from the same program. Default is TeX Live 2025 (bbl format 3.3). The paper source has `refs.bib`: build the `.bbl` locally and include it. | https://info.arxiv.org/help/submit_tex.html | 2026-10-16 |
| Metadata text | ASCII only. Abstract limit: 1920 characters. No TeX in the abstract. | https://info.arxiv.org/help/prep.html | 2026-10-16 |
| Comments field | Optional. Use it for page and figure counts and related URLs. No copyright statements. | same | 2026-10-16 |
| Ancillary files | Allowed in an `anc` directory for TeX submissions. They are not indexed as text. Not a place for a dataset. | https://info.arxiv.org/help/ancillary_files.html | 2026-10-16 |
| English | Since 2026-02-11 every submission needs a full English version. | https://blog.arxiv.org/2026/01/13/non-english-paper-submission-guidelines/ | 2026-10-16 |
| DOI | arXiv assigns `10.48550/arXiv.<id>` at no cost. It points to the latest version. Do not enter it in the DOI field. | https://info.arxiv.org/help/doi.html | 2026-10-16 |

### F3. Licence choices

Source: https://info.arxiv.org/help/license/index.html . Verified 2026-10-16. The choice is irrevocable.

| Licence | Effect |
|---|---|
| CC BY 4.0 | Reuse with credit, including commercial use. |
| CC BY-SA 4.0 | Same, with ShareAlike. |
| CC BY-NC-SA 4.0 | Non-commercial, ShareAlike. |
| CC BY-NC-ND 4.0 | Non-commercial, no changes. |
| arXiv perpetual, non-exclusive license 1.0 | arXiv may distribute. Reuse by others is restricted. |
| CC Zero | Public domain dedication. |

Advice (mine): CC BY 4.0 matches the MIT code and Hugging Face open data. Check each journal's licence terms before you pick a restrictive licence.

### F4. AI-assistance policy as of 2026

| Fact | Source | Verified |
|---|---|---|
| Authors must report significant tool use. Text-to-text generative AI is on that list. | https://info.arxiv.org/help/moderation/index.html | 2026-10-16 |
| "generative AI language tools should not be listed as an author." Each author is responsible for the content. | same | 2026-10-16 |
| arXiv "permits authors to employ AI as a tool in support of their research" if it is disclosed and the work meets arXiv standards. The rate limit is called "a stopgap" while arXiv defines best practice for AI-assisted authors. | https://blog.arxiv.org/2026/10/01/updated-rate-limit-policy/ | 2026-10-16 |
| Where to put the disclosure is not stated. Advice (mine): add a short AI-use sentence in the acknowledgments and in the Comments field. | n/a | n/a |

### F5. Policy on benchmark and dataset papers

| Fact | Source | Verified |
|---|---|---|
| Since 2025-10-31, CS review articles and position papers must already be accepted at a journal or conference with peer review. Workshop review "generally does not meet the same standard". | https://blog.arxiv.org/?p=1740 | 2026-10-16 |
| The post does not mention dataset or benchmark papers. They are research articles, not reviews. This is my reading. | same | 2026-10-16 |
| Primary content: "Research articles are the primary content-type submitted to arXiv". | https://info.arxiv.org/help/moderation/index.html | 2026-10-16 |
| Moderation is not peer review. | same | 2026-10-16 |
| Rate limit since 2026-10-01: two submissions per calendar month. Three active submissions at a time. Rejected papers count. Co-authors are not limited. | https://blog.arxiv.org/2026/10/01/updated-rate-limit-policy/ | 2026-10-16 |

Advice (mine): the abstract already says "This release has no public model leaderboard. Results on real models are future work." Keep that honest line. A reader must see a research contribution: the engine, the suite, the grader design and the mock-provider validation. Do not word the paper as a survey or a position piece.

### F6. Common rejections and holds

| Cause | Fact | Source | Verified |
|---|---|---|---|
| Lack of "originality, novelty, significance", or non-research material | Listed reasons for rejection. | https://info.arxiv.org/help/moderation/index.html | 2026-10-16 |
| Duplicate or near-duplicate submissions | May be told to consolidate or version. | same | 2026-10-16 |
| Hold | A hold is a technical problem or "moderators needed additional time". Most clear in 48 hours. After 48 hours, write to support with the submission number. | https://arxiv-org.atlassian.net/wiki/spaces/AUS/pages/360456/Why+is+my+submission+on+Hold | 2026-10-16 |
| What to check on a hold | References display. PDF text copies. No line numbers. | same | 2026-10-16 |
| TeX failures | Mixed figure formats. Missing style files. Case errors in file names. | https://info.arxiv.org/help/submit/index.html | 2026-10-16 |
| Bad characters | Curly quotes or ligatures pasted into metadata. | https://info.arxiv.org/help/prep.html | 2026-10-16 |
| Appeal | Use the user support portal. Include identifiers, a rationale and a PDF. A decision takes about two weeks. After a denial, no second appeal. | https://info.arxiv.org/help/moderation/appeals.html | 2026-10-16 |

### F7. Timing

Source: https://info.arxiv.org/help/availability.html . Verified 2026-10-16. All times US Eastern.

| Submitted | Announced |
|---|---|
| Mon 14:00 to Tue 14:00 | Tue 20:00 |
| Tue 14:00 to Wed 14:00 | Wed 20:00 |
| Wed 14:00 to Thu 14:00 | Thu 20:00 |
| Thu 14:00 to Fri 14:00 | Sun 20:00 |
| Fri 14:00 to Mon 14:00 | Mon 20:00 |

Holidays left in 2026 (same page): Nov 26, Dec 25, Dec 29, Dec 31. Monday Oct 12 had no announcement. The Oct 9 to Oct 13 batch was announced on Oct 13 (https://blog.arxiv.org/2026/10/08/announcement_schedule_holiday_change/).

### F8. Replace and versions

Source: https://info.arxiv.org/help/replace.html . Verified 2026-10-16.

- Use the Replace icon on the user page for an announced paper.
- Replace no more than once per week.
- Every change after announcement makes a new version. Old versions stay public.
- Give a reason in the `Comments:` field. Copy the old comments or they are lost.
- Journal reference, DOI and report number can be added without a new version.
- Version 6 and later do not appear in daily email announcements.
- Before announcement, use "Unsubmit", edit, and resubmit.
- Plan: post v1 with placeholders removed. After real model results exist, post v2.

### F9. Link the Hugging Face dataset

1. On the Hugging Face side: put the arXiv abstract URL in each dataset card. The Hub adds the `arxiv:<id>` tag. Source: https://huggingface.co/docs/hub/en/datasets-cards . Verified 2026-10-16.
2. On the arXiv side: put the site and dataset URLs in the Comments field. The abstract page then shows a "Huggingface" toggle for linked Hugging Face artifacts (seen in the page HTML of https://arxiv.org/abs/2609.32390 on 2026-10-16). How an item reaches that toggle is UNVERIFIED.
3. Do not use arXiv ancillary files for the datasets. They are tied to one version and are not indexed as text.

### F10. Category and cross-lists

Descriptions from https://arxiv.org/category_taxonomy (verified 2026-10-16).

| Category | Official scope | Use |
|---|---|---|
| cs.AI | AI, excluding vision, robotics, machine learning, multiagent systems and NLP. | Primary (advice, mine). The paper is about agent benchmarks. |
| cs.SE | Design tools, metrics, testing and debugging, programming environments. | Cross-list (advice). The paper is a test harness and engine. |
| cs.LG | All aspects of machine learning. | Optional second cross-list. |
| cs.CL | Natural language processing. | Skip unless the suite is mostly language tasks. |
| cs.DL | Digital libraries. | Skip. |
| cs.CY | Computers and society. | Skip. |

Cross-list rule (https://info.arxiv.org/help/cross.html, verified 2026-10-16): "rarely appropriate to add more than one or two cross-lists". "Bad cross-lists will be removed." Moderators can reclassify.

---

## G. Order of operations for this owner

P = a person logs in. A = an agent works from public files or the GitHub API.

1. A: Freeze the paper. Build the `.bbl` locally. Check the abstract has ASCII only and fewer than 1920 characters. Check fonts with `pdffonts`. Check that no Type 3 font is used. Make the arXiv tarball. Do not post.
2. P: Create a free ORCID iD at orcid.org. Keep default privacy. Send the iD to the agent.
3. P: Register an arXiv account with affiliation "Independent". Link the ORCID iD.
4. P: Start a new arXiv submission in cs.AI to get the endorsement link. Send ONE request to ONE endorser who knows the work. Wait.
5. A: While you wait, open one PR per repo that adds `CITATION.cff` without the `preferred-citation` block. Set `funding` only if a real page exists. One concern per PR. Keep each PR under 500 lines.
6. P: Log in to Zenodo with GitHub. Link the account. Enable the repos you want archived. Start with `benchmark-core` and `benchmark-family-paper`.
7. A: Add `ScholarlyArticle` and `Dataset` JSON-LD, plus `citation_*` meta tags on `/paper`, to private-repo-337e.com. Host the PDF in the same path as the abstract page. Check that `robots.txt` stays open.
8. P: After endorsement, submit to arXiv. Choose cs.AI primary, cross-list cs.SE. Choose CC BY 4.0. Put the AI-use note and the site URL in Comments. Do ONE paper only (rate limit).
9. A: After announcement, read the arXiv ID. Open PRs that put the ID and DOI `10.48550/arXiv.<id>` in `CITATION.cff` `preferred-citation`, each README BibTeX block, each Hugging Face dataset card citation section, and the site JSON-LD.
10. P: Tag a new release in each Zenodo-enabled repo (or let the agent tag after you approve). Zenodo makes the version DOI and the concept DOI. Put the concept DOI in the README.
11. P: Hugging Face: open `hf.co/papers/<id>`, index the paper if needed, then click "claim authorship". Wait for the admin check.
12. P: Create the Google Scholar profile with a personal Google account. Add the paper by hand if search does not find it. Click "Follow" and tick "New citations to my articles". Merge duplicate versions.
13. P: Claim the Semantic Scholar author page and the OpenAlex profile (link the ORCID iD). In ORCID, use "+Add works" and import the arXiv entry.
14. A: Run weekly read-only checks for 12 weeks: the arXiv abstract tags with `curl`, the OpenAlex works API by DOI, the Semantic Scholar API by arXiv ID, and the HF paper page. Report any gap. Do not poll faster than once a day.
15. P: When a first real-model run exists, write v2 on arXiv (one replace per week at most). Then pick a journal: DMLR first (best topic fit), TMLR second, JOSS for `benchmark-core` only after its repo is public for more than six months.

---

## H. Open items for a person to check

| Item | Why it is open |
|---|---|
| Preprints.org, Authorea or Research Exchange Preprints, ScienceOpen, Scilit, Cambridge Open Engage submit rules | Pages returned 403, bot walls or empty content. |
| dblp FAQ | Bot wall. |
| Whether Google Scholar lists the arXiv version after announcement | Needs a live Scholar search after the paper is announced. |
| Whether a Scholar profile without a university email appears in author search | Not documented. |
| arXiv `cs` endorsement domain split | The request email shows it. |
| Zenodo `resource_type` value for a preprint link | Not checked against a Zenodo list. |
| HF "Huggingface" toggle on the arXiv page: what feeds it | Not documented on pages I opened. |
| JMLR MLOSS, TACL, ReScience C fees | Pages do not mention fees. |
| First public commit date of `benchmark-core` | Not checked. Needed for JOSS. |
