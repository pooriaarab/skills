# Preregistration template for a small evaluation study

Basis: the AsPredicted questions (form version 2.00, wording copied from a public registration at https://aspredicted.org/79Q_9WY) and the OSF templates (list at https://help.osf.io/hc/en-us/articles/360019738794-Select-a-Registration-Template ; guide at https://www.cos.io/blog/choosing-preregistration-template-guide-for-researchers).

Facts from those pages:
- AsPredicted v2.00 has 8 questions. Answers are limited to 2,900 characters (https://aspredicted.org/help).
- OSF offers these templates: OSF Preregistration (default, detailed), Open-Ended Registration, an AsPredicted-based 8-question template, Secondary Data Preregistration (for existing datasets), Simulation Studies, Replication Recipe, Registered Report Protocol, and others.
- A registration is a time-stamped read-only version of the plan. Register close to the start of data collection. OSF allows later updates that are versioned and must say what changed and why.
- The OSF Preregistration sections follow study information, design plan, sampling plan, variables and analysis plan (topics per the COS guide). I did NOT open the full question list (the page returned 503), so section wording below is mine.
- For NLP, see van Miltenburg, van der Lee, Krahmer, "Preregistering NLP Research" (NAACL 2021): https://arxiv.org/abs/2103.06944 . It gives sample questions by study type, not a finished form.
- Secondary Data template fits your case if you re-score a public dataset.

### Template (AsPredicted questions verbatim, with my LLM-specific additions marked "ADD")

1. Have any data been collected for this study already?
   - Say yes or no. If you ran a pilot, say how many items and what you changed after it.
2. What's the main question being asked or hypothesis being tested in this study?
   - H1, H2 as one-line directional claims. Example: "Model A scores higher than Model B on task T by at least 3 points."
   - ADD: Primary vs exploratory hypotheses, and the smallest effect you care about.
3. Describe the key dependent variable(s) specifying how they will be measured.
   - Metric name and formula (accuracy, pass^k, win rate). Scorer type (exact match, program check, judge model). For a judge model: name, version, prompt, and the agreement check with humans.
   - ADD: Decoding settings: temperature, top-p, max tokens, number of samples K per item, seeds.
4. How many and which conditions will participants be assigned to?
   - List the models with exact version ids and access dates. List prompt variants. List ablations. State that the prompt is frozen before the main run.
   - ADD: Baselines (random, trivial, human) and who the humans are.
5. Specify exactly which analyses you will conduct to examine the main question/hypothesis.
   - Standard errors by the CLT formula (clustered when items share a source). Paired differences between models. Multiple-comparison rule across hypotheses (for example Holm). Tests: two-proportion z or paired test. Plot list.
   - ADD: Which table or figure answers each hypothesis.
6. Describe exactly how outliers will be defined and handled, and your precise rule(s) for excluding observations.
   - Exclusion rules for: API errors, truncated outputs, refusals, empty outputs, malformed answers (count them as wrong or retry once; pick one). Items dropped after validation (see ADD below). Never drop items based on model score.
   - ADD: Item validation rule: two raters, drop an item if they disagree with the key; report the number dropped.
7. How many observations will be collected or what will determine sample size?
   - "No need to justify decision, but be precise about exactly how the number will be determined." (AsPredicted guidance, same URL.) State n items, K samples, number of models. State the stopping rule: stop when all planned runs finish or when spend reaches the cap (for example USD 300). Do not add items after you see results. Optionally cite a power calculation (Miller: about 969 items for a 3-point gap at alpha 0.05 and power 0.80 in his example).
8. Anything else you would like to pre-register? (e.g., secondary analyses, variables collected for exploratory purposes, unusual analyses planned?)
   - Contamination plan (private held-out items, dates, canary string). Release plan. Cost log. Deviation log: every change after registration is written with date and reason. Statement: "We will report all planned analyses even if the result is null."

Optional rows for an OSF-style document (ADD):
- Study name and authors. Conflicts of interest and who paid for compute.
- Data and code location, license, run command.
- Plan for secondary data if you use a public set (what you already know about it, per the OSF Secondary Data template).
