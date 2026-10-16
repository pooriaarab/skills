# Google Scholar

Checked 2026-10-16 against the official pages named in each row. `UNVERIFIED` means
the page did not load (403, bot wall, or empty). Do not act on an `UNVERIFIED` cell until a person
opens the page. Re-open the source URL before you act: pages change.

### C1. Plain statement

There is NO submit form for a paper. Google Scholar crawls the web. You can only (a) make the paper easy to index and (b) claim the paper in a profile.
Source: https://scholar.google.com/intl/en/scholar/help.html ("The page describes no direct submission form" is my reading. The page says to refer a publisher to the technical guidelines and to post the PDF on a personal site or repository.) Verified 2026-10-16.

### C2. What Scholar says about inclusion

| Topic | Rule | Source | Verified |
|---|---|---|---|
| Content types | Journal and conference papers, theses, books, preprints, abstracts, technical reports. Documents without titles or authors are usually excluded. | https://scholar.google.com/intl/en/scholar/help.html | 2026-10-16 |
| Visibility | Full text or a full abstract must show without login, install, or scrolling. | https://scholar.google.com/intl/en/scholar/inclusion.html | 2026-10-16 |
| Format | HTML or PDF. "PDF files must have searchable text." | same | 2026-10-16 |
| One paper per URL | "Each paper must have its own unique URL." One abstract per page. One paper per PDF. | same | 2026-10-16 |
| robots.txt | Must not block Google's robots from article or browse URLs. | same | 2026-10-16 |
| Large files | Files over 5 MB go to Google Book Search. Keep the paper PDF under 5 MB. | same | 2026-10-16 |
| Coverage guarantee | None. "It isn't possible to guarantee uninterrupted coverage of any particular source." | https://scholar.google.com/intl/en/scholar/help.html | 2026-10-16 |
| Check coverage | Search in quotes for sample article titles. The `site:` count is not reliable. | both pages | 2026-10-16 |
| Support | Scholar does not waive the guidelines or test sites. | inclusion page | 2026-10-16 |

### C3. Meta tags (when you host the paper yourself)

Use these on the HTML abstract page, for example `https://private-repo-337e.com/paper`.

| Tag | Status | Rule | Source | Verified |
|---|---|---|---|---|
| `citation_title` (or `DC.title`) | Required | The paper title. Not the site name. | https://scholar.google.com/intl/en/scholar/inclusion.html | 2026-10-16 |
| `citation_author` | Required, at least one | One author per tag. No affiliations or degrees. Use the full name. | same | 2026-10-16 |
| `citation_publication_date` (or `DC.issued`) | Required | The date people cite. Format `2026/10/16` or a year. | same | 2026-10-16 |
| `citation_online_date` | Optional | The repository entry date. | same | 2026-10-16 |
| `citation_pdf_url` (or `DC.identifier`) | Needed to link the PDF | Absolute URL. The PDF must sit in the same subdirectory as the HTML abstract. An unlinked PDF is processed as a separate document without metadata. | same | 2026-10-16 |
| Journal tags | For journal and conference papers only | `citation_journal_title`, `citation_issn`, `citation_volume`, `citation_issue`, `citation_firstpage`, `citation_lastpage`. | same | 2026-10-16 |
| Report tags | For technical reports | `citation_technical_report_institution`, `citation_technical_report_number`. | same | 2026-10-16 |

More rules from the same page:

- Minimum fields: title, the first author's full name, and a year. A page that lacks one is processed as if it had no tags.
- Highwire (`citation_`), BE Press and PRISM tags work. Dublin Core is a "last resort".
- Escape quotes and angle brackets in the tag values.
- Show the abstract on the page. The tags are invisible.
- Give tags for every version of a paper.

Measured today (my own check with `curl`, 2026-10-16): an arXiv abstract page carries `citation_title`, `citation_author`, `citation_date`, `citation_online_date`, `citation_pdf_url`, `citation_arxiv_id` and `citation_abstract`. It uses `citation_date`, not `citation_publication_date`. A Zenodo record page carries `citation_title`, `citation_author`, `citation_doi` and `citation_keywords`.

### C4. PDF layout rules (for a self-hosted PDF without tags)

| Item | Rule | Verified |
|---|---|---|
| Title | Largest text at the top of page one. The page says at least 24 pt. | 2026-10-16 |
| Authors | Next to the title, 16 to 23 pt. Names only. | 2026-10-16 |
| Citation line | A bibliographic line in the header or footer of page one. For unpublished work, use the full date of the current version. | 2026-10-16 |
| Fonts | Avoid Type 3 fonts. Check with `pdffonts paper.pdf` and look for "Type 3". | 2026-10-16 |
| Headings | Sentence case, so they do not look like author names. | 2026-10-16 |
| References | A "References" heading on its own line. Numbered entries. No free-form commentary. | 2026-10-16 |

Source for the table: https://scholar.google.com/intl/en/scholar/inclusion.html
The paper source uses `lmodern` with `T1`. That gives Type 1 fonts. I did not run `pdffonts` on the PDF.

### C5. Timing

| Event | Time | Source | Verified |
|---|---|---|---|
| New paper added | "several times a week" for new papers on a crawled site | https://scholar.google.com/intl/en/scholar/help.html | 2026-10-16 |
| Individual author upload | "within several weeks" | https://scholar.google.com/intl/en/scholar/inclusion.html | 2026-10-16 |
| Update to an indexed paper | 6 to 9 months | same | 2026-10-16 |
| Site change | A few days to 6 to 9 months | same | 2026-10-16 |
| Manually added article, new citations | "a few days" | https://scholar.google.com/intl/en/scholar/citations.html | 2026-10-16 |

### C6. How each host is treated

| Host | What the official source says | Source | Verified |
|---|---|---|---|
| arXiv | No official Scholar page I opened names arXiv. arXiv abstract pages carry `citation_*` tags (measured above). After announcement, search the exact title in Scholar. Result for this paper: UNVERIFIED. | https://scholar.google.com/intl/en/scholar/inclusion.html | 2026-10-16 |
| Zenodo | Zenodo says Google Scholar does not index Zenodo. Reason: Scholar infers resource type from URL patterns, and Zenodo lets users change the type. Dataset Search and Google Search do index Zenodo. | https://support.zenodo.org/help/en-gb/18-general/61-is-zenodo-indexed-by-google-scholar (published 30/01/2026) | 2026-10-16 |
| HAL | CCSD calls Scholar "a Google service indexing only scholarly literature". It gives no HAL-specific rule. | https://www.ccsd.cnrs.fr/en/2018/03/harvesting-seo-visibility-of-your-deposits/ | 2026-10-16 |
| SSRN | Google and Scholar crawl SSRN. SSRN cannot control the time. Updates can take "6 to 9 months or longer". | https://www.elsevier.support/ssrn/answer/google-scholar | 2026-10-16 |
| OSF Preprints | The first 100,000 characters of the OSF FAQ do not mention Scholar. Search snippets say it is indexed. UNVERIFIED. OSF is suspended anyway. | https://help.osf.io/article/230-preprint-faqs | UNVERIFIED |
| ResearchGate | No official statement found. Forum posts only. UNVERIFIED. | none | UNVERIFIED |

### C7. Create and verify a Scholar profile

Source for all steps: https://scholar.google.com/intl/en/scholar/citations.html . Verified 2026-10-16. A person does this.

1. Sign in to a personal Google account. Scholar advises "a personal account, not an account at your institution".
2. Open the profile sign-up form. Confirm your name. Enter an affiliation and interests.
3. Pick your articles from the groups of similar names.
4. Choose whether article updates apply automatically or come to you for review. Choose review.
5. Verify your email and check the articles.
6. Click "Edit", tick "Make my profile public", and click "Save".

Limit for this owner: the page says a profile needs "a verified email address at your university" to be eligible for Scholar search results. This author has no university address. The profile still lists articles and counts citations. It may not appear in author search. This is UNVERIFIED in practice.

### C8. Add an article, merge versions, set alerts

| Task | Steps | Source | Verified |
|---|---|---|---|
| Add an article manually | If search does not find it, click "Add article manually". Enter title, authors and other details. Save. | https://scholar.google.com/intl/en/scholar/citations.html | 2026-10-16 |
| Merge versions | Select both versions. Click "Merge". Choose the best citation. Click "Merge" again. | same | 2026-10-16 |
| Alert for all new citations | On your profile, click "Follow". Tick "New citations to my articles". Click "Done". | same | 2026-10-16 |
| Alert for one paper | Click its "Cited by" number. Click the envelope icon in the left bar. | same | 2026-10-16 |
| Alert for a topic | Search the topic. Click the envelope icon. Enter an email. Click "Create alert". A Google account is not required. | https://scholar.google.com/intl/en/scholar/help.html | 2026-10-16 |

### C9. What NOT to do

The Scholar pages I opened do not state a manipulation policy. The rules below are my own advice. They are not Scholar rules.

- Do not create fake papers, fake authors or fake citations.
- Do not cite your own packages in unrelated papers to raise counts.
- Do not ask friends or agents to cite the work in bulk.
- Do not host a second copy of the paper under a different title on your own site. Scholar groups versions by title. Use the same title everywhere.
- Do not block Googlebot in `robots.txt` on the paper pages. The site `robots.txt` already allows all search crawlers (checked 2026-10-16).
- Do not use a profile field to claim a university you do not have.
- Do not expect speed. Updates take months.

---
