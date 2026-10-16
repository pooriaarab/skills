# Research tools for cheap, reproducible benchmark and eval papers

Date of research: 2026-10-16. All dates below are from that day.

## How to read this file

- Stars, licence and "last push" come from the GitHub API for the original repo (`gh api repos/OWNER/REPO`). "Last push" is the date of the newest push to any branch. It is close to, but not always, the newest commit on the default branch.
- Licence "NOASSERTION" means GitHub could not match a standard licence. I read the LICENSE header for each one and quote what it says.
- I read the original README or docs page for the items marked "README read". For the others I read GitHub metadata and the directory listing only. They say "metadata only".
- Nothing was cloned, installed or run. Nothing was submitted or posted.
- Star counts are not a quality signal. Some counts in this snapshot are very high for the repo age (for example Imbad0202/academic-research-skills has 52.4k stars after 7 months). I report them as found.
- Commands in "Reuse" come from a page I opened unless the cell says "not checked".

## Items I could not open (UNVERIFIED)

| Item | What happened |
|---|---|
| osf.io/registries | HTTP 503. I used the Center for Open Science page https://www.cos.io/initiatives/prereg instead. |
| codeocean.com/pricing | HTTP 403. Price and free tier are UNVERIFIED. Code Ocean is not open source as far as I know (not checked). |
| AsPredicted price | The home page does not state a price. UNVERIFIED. |
| HF `demo-leaderboard-backend/leaderboard` template | The Space page showed a runtime error. README and licence not read. |
| Open LLM Leaderboard status | The Space page shows "Running on CPU Upgrade" and no retirement banner. The old GitHub repo `huggingface/open_llm_leaderboard` returns 404. I could not confirm whether it is still updated. |
| W&B academic eligibility rules | The FAQ answers on the pricing page were blank. |
| LiteLLM supply chain incident | I read only secondary sources (search results). I did not open an official advisory. |
| AI Scientist licence terms | I read only the header lines of the licence. Full restrictions not read. |

---

## A. Evaluation harnesses and eval infrastructure

| # | Name and URL | Stars | Last push | Licence | What it does | Reuse (specific) | Cost | Risk or limit | Verified |
|---|---|---|---|---|---|---|---|---|---|
| A1 | Inspect AI https://github.com/UKGovernmentBEIS/inspect_ai | 3,020 | 2026-10-16 | MIT | Eval framework from the UK AI Security Institute. A Task is a dataset, a solver and a scorer. Docs read. | `inspect eval <file.py> --model <provider/model>` and `inspect view` (both seen on the docs page). Sandboxes (Docker, Kubernetes, Modal and more), MCP tools, built-in agents, support for external agents such as Claude Code. Wrap our 22 deterministic graders as Inspect scorers so logs share one format. Release 0.3.281 (2026-10-15). | Free. You pay for model calls. | Fast release pace, so pin the version. Docs list "Eval Sets" and "Checkpointing" but my fetch did not describe them. | 2026-10-16 |
| A2 | inspect_evals https://github.com/UKGovernmentBEIS/inspect_evals | 705 | 2026-10-16 | MIT | Community collection of evals for Inspect. 137 entries under `src/inspect_evals` (directory count). | Read two or three task files as templates for our own packages. Reuse published tasks as baselines. | Free | Each task has its own data licence. Check it. | 2026-10-16 |
| A3 | inspect_scout https://github.com/meridianlabs-ai/inspect_scout | 83 | 2026-10-16 | MIT | Analysis of agent transcripts. Metadata only. | Scan transcripts for grader failures and refusals after a run. Not tried. | Free | Small and young. Metadata only. | 2026-10-16 |
| A4 | lm-evaluation-harness https://github.com/EleutherAI/lm-evaluation-harness | 14,242 | 2026-09-14 | MIT | Few-shot eval framework for language models, many built-in tasks. Metadata only. Latest release v0.4.13. | Standard baseline harness. Use it when a reviewer asks for numbers that match published ones. Command not checked. | Free | Built for loglikelihood and generation tasks, not for multi-turn agents. | 2026-10-16 |
| A5 | HELM https://github.com/stanford-crfm/helm | 2,947 | 2026-09-01 | Apache-2.0 | Stanford CRFM holistic eval framework with a results web UI. Metadata only. | Copy the scenario, metric and "run spec" idea for reporting many metrics per task. | Free | Heavy to set up. Metadata only. | 2026-10-16 |
| A6 | OpenCompass https://github.com/open-compass/opencompass | 7,521 | 2026-10-16 | Apache-2.0 | Large LLM eval platform. Also VLMEvalKit (4,443 stars, Apache-2.0). Metadata only. | Use as a cross-check when a benchmark has an OpenCompass config. | Free | Config style is heavy. | 2026-10-16 |
| A7 | lighteval https://github.com/huggingface/lighteval | 2,563 | 2026-10-06 | MIT | Hugging Face eval toolkit with several backends. Metadata only. | Good for local model runs with Hugging Face datasets. | Free | Metadata only. | 2026-10-16 |
| A8 | promptfoo https://github.com/promptfoo/promptfoo | 26,063 | 2026-10-16 | MIT | Test prompts, agents and RAG. Also red teaming. Metadata only. | YAML-defined test matrices and `--no-cache` style regression runs. Command not checked. Good for CI gates on a small prompt set. | Free | Product focus is app testing and red teaming, not paper-grade stats. | 2026-10-16 |
| A9 | DeepEval https://github.com/confident-ai/deepeval | 18,906 | 2026-10-16 | Apache-2.0 | LLM eval framework with LLM-judge metrics. Metadata only. | Skip. Our graders are deterministic. | Free, with a paid cloud upsell | LLM-judge metrics are noisy and cost tokens. | 2026-10-16 |
| A10 | Ragas https://github.com/vibrantlabsai/ragas (was explodinggradients/ragas) | 16,041 | 2026-02-24 | Apache-2.0 | RAG eval metrics. The repo moved owner. Metadata only. | Only if a paper needs RAG metrics. | Free | No push for 8 months. Org rename. | 2026-10-16 |
| A11 | OpenAI evals https://github.com/openai/evals | 19,613 | 2026-04-14 | MIT (file header says "MIT License", GitHub shows NOASSERTION because the file is LICENSE.md) | Older eval framework and registry. | Skip for new work. Read the registry format for ideas. | Free | Aging. Last push 6 months ago. | 2026-10-16 |
| A12 | openai/simple-evals https://github.com/openai/simple-evals | 4,665 | 2026-04-22 | MIT | Small reference implementations of common evals. Metadata only. | Read for how headline numbers are computed. | Free | Not maintained as a product. | 2026-10-16 |
| A13 | autoevals https://github.com/braintrustdata/autoevals | 1,058 | 2026-10-08 | MIT | Braintrust scorers, mostly LLM-judge. Metadata only. | Skip unless we add an LLM-judge step. | Free library | Judge scores need human calibration. | 2026-10-16 |
| A14 | LangSmith SDK https://github.com/langchain-ai/langsmith-sdk | 1,082 | 2026-10-16 | MIT | Tracing SDK. The repo was archived on 2026-10-16. Python SDK moved to langchain-ai/langsmith-python (10 stars). | Avoid. See the avoid list. | Hosted service has limits | Archived today. The server side is closed source (not checked in detail). | 2026-10-16 |
| A15 | Phoenix https://github.com/Arize-ai/phoenix | 11,875 | 2026-10-16 | Elastic License 2.0 (LICENSE header read). Not OSI open source. | Tracing and eval UI. | Local trace viewer if we need one. ELv2 forbids offering it as a hosted service. | Free to self-host | Licence is source-available, not open source. | 2026-10-16 |
| A16 | OpenInference https://github.com/Arize-ai/openinference | 1,266 | 2026-10-16 | Apache-2.0 | OpenTelemetry instrumentation for LLM calls. Metadata only. | Use as a neutral trace format. | Free | Only useful if we want traces. | 2026-10-16 |
| A17 | Langfuse https://github.com/langfuse/langfuse | 35,928 | 2026-10-16 | MIT outside `ee/` dirs (LICENSE header read). GitHub shows NOASSERTION. | Open source agent observability and evals, now part of ClickHouse. | Optional trace store. | Free to self-host | Needs a database stack. Overkill for one author. | 2026-10-16 |
| A18 | SWE-bench https://github.com/SWE-bench/SWE-bench | 6,037 | 2026-09-18 | MIT | Docker harness for repo-level bug fixing. README read. | Study how it builds one container per task and grades with the repo's own tests. Same pattern as our deterministic graders. Cloud runs via Modal and `sb-cli` are listed. | Free code. Docker disk and CPU are large (README mentions Docker use; exact disk size not checked). | Heavy to run. Do not run it for a small paper. | 2026-10-16 |
| A19 | tau2-bench (tau3) https://github.com/sierra-research/tau2-bench | 2,245 | 2026-10-16 | MIT | Tool-agent-user benchmark. README read. | Use this one, not the old repo. The README notes a July 2026 grading fix: results from versions below 1.0.1 are not comparable on one domain. Install uses `uv`, Python 3.12 or 3.13. | Free code. Simulated users cost tokens. | The old repo `sierra-research/tau-bench` (1,465 stars, MIT) warns that its tasks are not updated. | 2026-10-16 |
| A20 | BFCL in Gorilla https://github.com/ShishirPatil/gorilla | 13,054 | 2026-04-13 | Apache-2.0 | Function-calling leaderboard under `berkeley-function-call-leaderboard/`. Directory listing only. | Copy how it scores tool calls by AST match. Matches our deterministic style. | Free | Last push 6 months ago. | 2026-10-16 |
| A21 | AgentBench https://github.com/THUDM/AgentBench | 3,775 | 2026-02-08 | Apache-2.0 | Multi-environment agent benchmark (ICLR 2024). Metadata only. | Reference only. | Free | Heavy Docker setup. Quiet since February. | 2026-10-16 |
| A22 | terminal-bench (now under harbor-framework) https://github.com/harbor-framework/terminal-bench-1 | 2,600 | 2026-07-11 | Apache-2.0 | Terminal task benchmark. Newer runner: Harbor https://github.com/harbor-framework/harbor (6,180 stars, Apache-2.0, pushed 2026-10-16). Metadata only. | Harbor is a candidate runner for agent tasks in containers. Not tried. | Free | Young project. | 2026-10-16 |
| A23 | openai/frontier-evals https://github.com/openai/frontier-evals | 1,317 | 2026-10-12 | MIT | Holds PaperBench (replicating AI papers), SWE-Lancer and EVMbench. README read. | Read PaperBench rubric design for grading research replication. | Free code, expensive runs | Costs are not stated on the page. | 2026-10-16 |
| A24 | vLLM https://github.com/vllm-project/vllm | 93,941 | 2026-10-16 | Apache-2.0 | GPU inference server. Metadata only. | Use only if we rent a GPU for open-weight models. | Free code. GPU rent is the cost. | Needs a GPU. | 2026-10-16 |
| A25 | llama.cpp https://github.com/ggml-org/llama.cpp | 131,402 | 2026-10-16 | MIT | CPU and Apple Silicon inference. Metadata only. | Run small open models on the Mac for free baselines and pilot runs. | Free | Slow for big models. Quantisation changes scores, so log the quant. | 2026-10-16 |
| A26 | Ollama https://github.com/ollama/ollama | 183,472 | 2026-10-16 | MIT | Local model runner with an HTTP API. Metadata only. | Easiest local baseline with an OpenAI-style endpoint. | Free | Default quantisation and context length can differ from the paper setup. Log them. | 2026-10-16 |
| A27 | LiteLLM https://github.com/BerriAI/litellm | 61,393 | 2026-10-16 | MIT except `enterprise/` (LICENSE header read) | One API over 100+ providers, plus a proxy gateway. README read. | Only if we need one client for many providers. Prefer a pinned Inspect model provider. | Free | Supply chain: secondary sources report that PyPI versions 1.82.7 and 1.82.8 were malicious in March 2026 (UNVERIFIED at the primary source). Pin versions and hashes. | 2026-10-16 |
| A28 | OpenRouter https://openrouter.ai/docs/faq | n/a | n/a | Closed service (I found no source repo claim on the page) | Paid API router. Docs FAQ read. | One key for many models. No markup on inference. Free models: 50 requests per day without 10 credits, 1,000 per day with 10 credits. Credit purchase fee 5.5% (minimum $0.80). BYOK adds 5% above a free allowance. | Pay as you go | Third party sees all prompts. Do not send private test items you plan to keep secret. | 2026-10-16 |

### Paired statistics and bootstrap intervals

| # | Name and URL | Stars | Last push | Licence | What it does | Reuse (specific) | Cost | Risk or limit | Verified |
|---|---|---|---|---|---|---|---|---|---|
| S1 | scipy.stats.bootstrap https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html (repo scipy/scipy, 15,121 stars, BSD-3-Clause, pushed 2026-10-16) | 15,121 | 2026-10-16 | BSD-3-Clause | Bootstrap CI. Docs read (SciPy 1.18.0). | `bootstrap((a, b), stat, paired=True, method='BCa', n_resamples=9999, confidence_level=0.95, rng=...)`. With `paired=True` it resamples the same indices for every array. Default method is BCa. Pass `rng` for reproducibility. | Free | BCa can return NaN when all values are equal. Not a clustered bootstrap by itself. | 2026-10-16 |
| S2 | statsmodels https://github.com/statsmodels/statsmodels | 11,688 | 2026-10-15 | BSD-3-Clause | Regression, tests, power. Metadata only. | Mixed models and power analysis when items cluster by task. Not checked in detail. | Free | Learning curve. | 2026-10-16 |
| S3 | arch https://github.com/bashtage/arch | 1,598 | 2026-10-16 | NCSA-style licence (LICENSE.md header read, "Developed by: Kevin Sheppard"); GitHub shows NOASSERTION | Has block and stationary bootstrap tools (from memory, not checked on the page). | Only if runs are time-correlated. | Free | Check the licence terms before use. | 2026-10-16 |
| S4 | Paper: "Adding Error Bars to Evals" https://arxiv.org/abs/2411.00640 | n/a | n/a | n/a | Evan Miller, Anthropic, 2024-11-01. Treats questions as draws from a super-population. Gives formulas for CIs, paired comparison, clustered SEs and power. Abstract and summaries read. | Copy the formulas: SE of a mean, paired difference SE, cluster-robust SE for questions that share a source. Cite it in our methods section. | Free | Binary-grader formulas assume large samples. Use Wilson or exact intervals for small n. | 2026-10-16 |
| S5 | evalstats https://github.com/ianarawjo/evalstats | 131 | 2026-09-30 | MIT for the package. `website/` is CC BY-NC-ND 4.0. | Python package and CLI for comparing prompts or models. README read. | `evalstats analyze results.csv` on long-format data (`item`, `score`, `model`). Auto CI method including BCa, Holm correction, Wilcoxon, Friedman, PPI correction for LLM judges. | Free | Built for under 100 items. LMM backend needs R and is marked experimental. Validation is self-reported by the author. | 2026-10-16 |
| S6 | errorbars https://github.com/antonsoo/errorbars | 0 | 2026-10-16 | MIT | PyPI 0.2.4. Standard errors, clustering, paired comparisons, power. PyPI metadata only. | Compare its output with our own scipy numbers as a cross-check. | Free | 0 stars. Created 2026-09-24. Single author. | 2026-10-16 |
| S7 | abeval https://github.com/mohammadi-hadi/abeval | 1 | 2026-10-15 | MIT | Standard-library-only paired tests on JSONL, sign-flip permutation. PyPI metadata only. | Cross-check only. | Free | 1 star. Created 2026-08-05. | 2026-10-16 |
| S8 | evalci https://github.com/Shreyaskc/evalci | 3 | 2026-10-01 | MIT | Paired bootstrap with BCa via scipy. Metadata only. Its paper is arXiv 2607.04429 (not opened). | Cross-check only. | Free | 3 stars. | 2026-10-16 |
| S9 | evalsig https://github.com/vtensor/evalsig | 2 | 2026-05-17 | Apache-2.0 | Paired tests, clustered SEs, release gating. Metadata only. | Cross-check only. | Free | 2 stars. | 2026-10-16 |
| S10 | paired-eval https://github.com/alloevil/paired-eval | 0 | 2026-10-01 | MIT | McNemar, permutation, Holm, bootstrap CI. Metadata only. | Cross-check only. | Free | 0 stars. | 2026-10-16 |

Honest note: S6 to S10 are new, tiny and single-author. Use scipy and statsmodels as the source of truth. Use these only to confirm a number.

---

## B. Research-agent and paper-writing systems

| # | Name and URL | Stars | Last push | Licence | What it does | Failure modes (honest) | Safe as a helper? | Verified |
|---|---|---|---|---|---|---|---|---|
| B1 | AI Scientist v1 https://github.com/SakanaAI/AI-Scientist | 14,743 | 2025-12-19 | "The AI Scientist Source Code License v1.0, December 2025", based on the Responsible AI Source Code License. Not OSI open source. | Generates ideas, edits code, runs experiments from templates, writes a LaTeX paper. README read. README says under $15 per paper with Claude 3.5 Sonnet. | README warns: it executes LLM-written code (dangerous packages, web access, spawned processes). Independent study (Beel et al., arXiv 2502.14297, not peer reviewed, 12 experiments): 5 of 12 failed from coding errors, weak keyword literature search, bad novelty calls, some hallucinated numbers, median 5 citations. | No for results. Only inside a sandbox, and only to study its output. | 2026-10-16 |
| B2 | AI Scientist v2 https://github.com/SakanaAI/AI-Scientist-v2 | 7,355 | 2025-12-19 | Same Sakana licence as above | Agentic tree search, no human templates. README says about $15 to $20 per run with Claude 3.5 Sonnet. | Same code-execution warning. Same class of failures. No fresh independent audit found. | No for results. Sandbox only. | 2026-10-16 |
| B3 | AI-Researcher https://github.com/HKUDS/AI-Researcher | 5,816 | 2025-10-16 | No LICENSE file found in the repo root and no licence statement in the README. Treat as all rights reserved. | End-to-end research agent, Docker based, with a benchmark. README read. | No licence means we cannot reuse code. Unknown reliability. | No. | 2026-10-16 |
| B4 | Agent Laboratory https://github.com/SamuelSchmidgall/AgentLaboratory | 5,904 | 2025-08-20 | MIT | Three phases: literature review, experiments, report. Human in the loop. Supports AgentRxiv. README read. | README lists OpenAI o1, gpt-4o, o3-mini and DeepSeek as supported models. Stale (last push 2025-08). | Only as a reading source for the workflow. | 2026-10-16 |
| B5 | PaperQA2 https://github.com/Future-House/paper-qa | 9,392 | 2026-10-13 | Apache-2.0 | RAG over scientific PDFs with citations. README read. Claims superhuman synthesis (their paper). | Answers are only as good as the PDF set. The README claims come from the authors' own evaluation. | Yes, for reading a set of PDFs we chose. Check each cited passage. | 2026-10-16 |
| B6 | GPT-Researcher https://github.com/assafelovic/gpt-researcher | 30,131 | 2026-10-10 | Apache-2.0 | Web research agent that writes a report. README says about $0.40 per report with o3-mini high. Also offered as a Claude skill (`npx skills add assafelovic/gpt-researcher`). | Web sources, not peer reviewed sources. Hallucination risk is stated in the README's motivation. | Yes for background reading. Never cite its output directly. | 2026-10-16 |
| B7 | STORM https://github.com/stanford-oval/storm | 31,650 | 2025-09-30 | MIT | Writes Wikipedia-style articles from web search. Co-STORM adds a human. README read. | Web based. Wikipedia-style output is not a literature review. Quiet for a year. | Low value for us. | 2026-10-16 |
| B8 | OpenScholar https://github.com/AkariAsai/OpenScholar | 1,667 | 2025-08-13 | Apache-2.0 | Retrieval-augmented scientific answers. README read in part. | Needs its own retrieval index. Quiet for 14 months. | Low value for us. | 2026-10-16 |
| B9 | karpathy/autoresearch https://github.com/karpathy/autoresearch | 98,023 | 2026-03-26 | README says MIT. GitHub found no LICENSE file in the root, so the licence file is missing. | Agent edits `train.py`, trains for a fixed 5 minutes, keeps or discards on `val_bpb`. Human edits `program.md`. README read. | One NVIDIA GPU only. Results are not comparable across hardware (README). Pattern needs a cheap mechanical metric. | Yes as a pattern. The loop fits our graders. | 2026-10-16 |
| B10 | uditgoenka/autoresearch https://github.com/uditgoenka/autoresearch | 6,575 | 2026-08-12 | MIT | Claude Code skill that loops on a goal and a mechanical metric. README header read. | Loops can overfit the metric. Hooks work in Claude Code only. | Yes with a hard budget cap and a held-out check. | 2026-10-16 |
| B11 | AIDE https://github.com/WecoAI/aideml | 1,581 | 2026-10-16 | MIT | LLM agent for ML engineering with tree search. Metadata only. | Not checked. | Maybe. Not tried. | 2026-10-16 |
| B12 | RefChecker https://github.com/markrussinovich/refchecker | 545 | 2026-10-12 | MIT | Checks bibliography entries against databases. Found by search. Repo metadata only. | Independent accuracy numbers not found. | Yes, as a first pass before submission. | 2026-10-16 |
| B13 | CheckIfExist (References-Validation) https://github.com/zabbonat/References-Validation | 36 | 2026-09-29 | MIT | Validates references against Crossref, Semantic Scholar and OpenAlex (from search summary, project page not opened). Paper arXiv 2602.15871 (not opened). | Same: no independent accuracy numbers found. | Yes, second opinion. | 2026-10-16 |

No tool above is safe to write our results. Only a human reading our own logs should produce numbers in the paper.

---

## C. Claude Code and agent skills for science

| # | Name and URL | Stars | Last push | Licence | Size and skill names that matter | How it helps us | Risk or limit | Verified |
|---|---|---|---|---|---|---|---|---|
| C1 | K-Dense scientific-agent-skills https://github.com/K-Dense-AI/scientific-agent-skills (formerly claude-scientific-skills; the old name redirects here) | 51,306 | 2026-10-15 | MIT for the repo. Each skill has its own licence in its `SKILL.md` `license` field. | 177 skills. Relevant: `statistical-analysis`, `statistical-power`, `statsmodels`, `experimental-design`, `exploratory-data-analysis`, `peer-review`, `scientific-writing`, `scientific-critical-thinking`, `hypothesis-generation`, `literature-review`, `citation-management`, `paper-lookup`, `scientific-visualization`, `matplotlib`, `seaborn`, `uncertainty-and-units`, `datalad`. README read. | Install only the 5 to 8 stats and writing skills. `statistical-power` and `experimental-design` help plan sample sizes. | README says skills can run code and that not every skill is fully reviewed. Install only what you read. Some need API keys. Most skills are life-science tools we do not need. | 2026-10-16 |
| C2 | Orchestra AI-Research-SKILLs https://github.com/Orchestra-Research/AI-Research-SKILLs | 13,612 | 2026-10-11 | MIT | 98 skills in 23 categories. Relevant: `0-autoresearch-skill`, `11-evaluation` (lm-evaluation-harness, bigcode-evaluation-harness, nemo-evaluator), `13-mlops` (mlflow, weights-and-biases, tensorboard, swanlab), `17-observability` (langsmith, phoenix), `20-ml-paper-writing` (ml-paper-writing, academic-plotting, presenting-conference-talks, systems-paper-writing), `21-research-ideation`, `22-agent-native-research-artifact` (compiler, research-manager, rigor-reviewer). README read. | Install: `/plugin marketplace add orchestra-research/AI-research-SKILLs` or `npx @orchestra-research/ai-research-skills` (both from the README). `ml-paper-writing` has venue LaTeX templates. | README says skills are guidance, not verified tools. Academic Plotting sends content to Gemini. Autoresearch runs without a stop unless you cap it. The README metrics table is stale (87 vs 98). | 2026-10-16 |
| C3 | anthropics/skills https://github.com/anthropics/skills | 181,564 | 2026-10-09 | Mixed. README: "many" skills are Apache 2.0. `docx`, `pdf`, `pptx`, `xlsx` are source-available, not open source. GitHub shows no repo-level licence. | 18 skill folders: academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx. No science or statistics skill. | `skill-creator` to author our own eval-writing skills. `xlsx` and `pdf` for data handling. Install: `/plugin marketplace add anthropics/skills`. | No stats or research skills here. Check the folder licence before copying. | 2026-10-16 |
| C4 | anthropics/life-sciences https://github.com/anthropics/life-sciences | 621 | 2026-08-14 | None found | 25 entries: biorxiv, pubmed, clinical-trials, scientific-problem-selection, nextflow-development, tooluniverse and others. | `scientific-problem-selection` may help choosing questions. Not read. | Biomedical focus. No licence file found. | 2026-10-16 |
| C5 | anthropics/knowledge-work-plugins https://github.com/anthropics/knowledge-work-plugins | 29,866 | 2026-10-16 | Apache-2.0 | Plugins for `data`, `bio-research`, `legal`, `finance` and others (directory listing only). | `data` plugin may help with analysis. Not read. | Knowledge worker focus. Metadata only. | 2026-10-16 |
| C6 | AI-research-feedback (Claes Backman) https://github.com/claesbackman/AI-research-feedback | 502 | 2026-10-15 | MIT | 12 skills: `review-paper` (8 agents, referee style), `review-paper-light`, `review-paper-checks`, `review-pap` (pre-analysis plan review, 6 agents), `review-grant`, `review-paper-code` (does the paper match the code, reproducibility), `audit-analysis` (isolated subagent tries to break analysis code, findings marked CONFIRMED or SUSPECTED), `explain-diff`, `paper-version`, `explorable-deck`, `explorable-beamer`, `pdf-to-markdown`. README read. | Best fit for peer review simulation and for checking paper claims against code. Install by copying folders from `Skills/` into `~/.claude/skills/`. Run `review-paper-code` and `audit-analysis` before submission. | Expects a LaTeX paper. Code review expects Stata, R or Python. Multi-agent runs cost tokens. Written for economics. | 2026-10-16 |
| C7 | science-superpowers (K-Dense) https://github.com/K-Dense-AI/science-superpowers | 358 | 2026-09-13 | MIT (LICENSE header read, GitHub shows NOASSERTION) | 16 skills: framing-research-questions, surveying-prior-work, establishing-feasibility-first, designing-the-analysis, `preregistering-analysis` (with a `prereg.sh` freeze and audit script), subagent-driven-analysis, executing-analysis, dispatching-parallel-investigations, investigating-anomalous-results, `verifying-results-before-claiming`, `requesting-red-team-review`, receiving-critical-review, `setting-up-reproducible-analysis`, reporting-and-archiving-findings, writing-science-skills, using-science-superpowers. README read. | Closest match to "preregister then run then red-team". Reuse the `prereg.sh` freeze idea in our own repo with a git tag and hash. | Method has no independent test of effectiveness. Skills are written as mandatory, so they can slow small jobs. | 2026-10-16 |
| C8 | open-science-skills (Steven Denney) https://github.com/scdenney/open-science-skills | 67 | 2026-10-08 | CC BY-NC 4.0 (LICENSE read) | Skills include `pre-registration-writing`, `methods-reporting`, `replication-package`, `figure-table-audit`, `citation-check`, `fact-check`, `paper-review-lite`, `journal-review`, `referee-response`, `presubmit`, `survey-design`, `research-repo`, `model-committee`. Directory listing only. | Read for prompts on preregistration and replication packages. | Non-commercial licence. Social science focus. Do not copy into products. | 2026-10-16 |
| C9 | claude-code-my-workflow https://github.com/pedrohcgs/claude-code-my-workflow | 1,662 | 2026-09-27 | MIT | Template for academics (LaTeX, Beamer, R). Skills include `preregister`, `power-analysis`, `audit-reproducibility`, `replication-package`, `capture-environment`, `verify-claims`, `credible-claims`, `devils-advocate`, `validate-bib`, `compile-latex`, `respond-to-referees`, `seven-pass-review`, `simulation-study`, `lit-review`. Directory listing only. | Take `preregister`, `power-analysis`, `capture-environment` and `verify-claims` as references. | R and Stata focus. Heavy template with a quality gate on every commit. | 2026-10-16 |
| C10 | Academic Research Skills (ARS) https://github.com/Imbad0202/academic-research-skills | 52,392 | 2026-10-16 | CC BY-NC 4.0 (LICENSE and README read). Commercial use is not allowed. Attribution required. | Skills: `deep-research`, `academic-paper`, `academic-paper-reviewer`, `academic-pipeline` (10 stages), `sr-screener`. README read. | Read its integrity checks and citation gate design. README says the full pipeline costs about $3 to $7 for a 15k-word paper. | README admits: it does not prove procedures were performed or data is real, "a consistently reported fabrication can pass these checks", live claim audit is "NOT_CALIBRATED", and an audit found 21 of 68 references still had problems after three integrity rounds. NC licence. Age 7 months. | 2026-10-16 |
| C11 | huggingface/skills https://github.com/huggingface/skills | 11,174 | 2026-10-08 | Apache-2.0 | Skills for the Hugging Face ecosystem (datasets, Hub, Spaces). Directory listing only. Skill names not read. | Likely useful for publishing datasets and leaderboards. Check names first. | Not read. | 2026-10-16 |
| C12 | agent-research-skills (lingzhi227) https://github.com/lingzhi227/agent-research-skills | 411 | 2026-02-27 | None found | 30+ skills: experiment-design, research-planning, novelty-assessment, related-work-writing, paper-writing-section, self-review, rebuttal-writing, table-generation, figure-generation, latex-formatting. Directory listing only. | Prompts to borrow only. | No licence, so cannot copy. | 2026-10-16 |
| C13 | academic-writing-skills (bahayonghang) https://github.com/bahayonghang/academic-writing-skills | 508 | 2026-10-15 | None found | Skills: latex-paper-en, paper-audit, bib-search-citation, paper-writing-studio, typst-paper. Directory listing only. | Prompts to borrow only. | No licence file found. | 2026-10-16 |
| C14 | davila7/claude-code-templates https://github.com/davila7/claude-code-templates | 32,681 | 2026-10-16 | MIT | Catalogue of agents and skills, including a `peer-review` skill seen on a marketplace listing. Metadata only. | Browse. Do not bulk install. | Catalogue quality varies. | 2026-10-16 |
| C15 | awesome-claude-skills (ComposioHQ) https://github.com/ComposioHQ/awesome-claude-skills | 77,243 | 2026-09-18 | None found | Curated list. Metadata only. Also travisvn/awesome-claude-skills (15,436 stars, no licence found). | Browse only. | Lists, not vetted code. | 2026-10-16 |

---

## D. Experiment management and reproducibility

| # | Name and URL | Stars | Last push | Licence | What it does | Reuse (specific) | Cost | Risk or limit | Verified |
|---|---|---|---|---|---|---|---|---|---|
| D1 | DVC https://github.com/treeverse/dvc | 15,926 | 2026-10-12 | Apache-2.0 | Data and pipeline versioning on top of git. Metadata only. | Track result files and prompts by hash. Commands not checked. | Free. Remote storage cost is yours. | Adds a second tool to learn. Git plus a results manifest may be enough. | 2026-10-16 |
| D2 | MLflow https://github.com/mlflow/mlflow | 28,416 | 2026-10-16 | Apache-2.0 | Experiment tracking, now framed as an AI engineering platform. Metadata only. | Local file store gives a run table with no server. | Free | Large. Overkill for one author. | 2026-10-16 |
| D3 | Weights and Biases https://github.com/wandb/wandb | 11,300 | 2026-10-16 | MIT (client) | Tracking SaaS. Pricing page now under CoreWeave Forge (read). Free plan: personal use, 5 seats, 5 GB per month storage, 1 GB per month Weave ingestion. Academic plan listed as free: 200 GB, unlimited tracked hours (eligibility UNVERIFIED). | Optional. | Free tier above | Hosted data. Client MIT, server is a service. | 2026-10-16 |
| D4 | Aim https://github.com/aimhubio/aim | 6,286 | 2026-10-15 | Apache-2.0 | Local tracker with a UI. Metadata only. | Light local alternative. | Free | Small community. | 2026-10-16 |
| D5 | Sacred https://github.com/IDSIA/sacred | 4,381 | 2025-10-22 | MIT | Config and run logging. Metadata only. | Skip. | Free | Older design. | 2026-10-16 |
| D6 | Hydra https://github.com/hydra-ecosystem/hydra (was facebookresearch/hydra) | 10,704 | 2026-10-16 | MIT | Config composition and sweeps. Metadata only. Repo owner changed. | Use only if configs multiply. | Free | Org move. | 2026-10-16 |
| D7 | Snakemake https://github.com/snakemake/snakemake | 2,889 | 2026-10-16 | MIT | Workflow manager. Metadata only. | Optional DAG for multi-step analysis. A Makefile is enough for most of our runs. | Free | Learning curve. | 2026-10-16 |
| D8 | Nextflow https://github.com/nextflow-io/nextflow | 3,510 | 2026-10-16 | Apache-2.0 | Workflow language. Metadata only. | Skip. Bio focus. | Free | Not our domain. | 2026-10-16 |
| D9 | uv https://github.com/astral-sh/uv | 90,818 | 2026-10-16 | Apache-2.0 | Python package manager with lockfiles. Metadata only. | `uv.lock` pins every dependency for each paper. tau2-bench and autoresearch already use it. | Free | None found. | 2026-10-16 |
| D10 | Docker (Moby) https://github.com/moby/moby | 72,190 | 2026-10-16 | Apache-2.0 | Containers. Metadata only. | Pin image digests for graders that run code. | Free | Docker Desktop licence terms differ for large firms (not checked). | 2026-10-16 |
| D11 | Nix https://github.com/NixOS/nix | 17,874 | 2026-10-16 | LGPL-2.1 | Reproducible builds. Metadata only. | Strongest reproducibility. | Free | Steep learning curve. Skip unless needed. | 2026-10-16 |
| D12 | ReproZip https://github.com/VIDA-NYU/reprozip | 363 | 2026-02-04 | BSD-3-Clause | Packs an experiment and its dependencies into a bundle. reprozip.org read. | Trace a one-off analysis script and ship the bundle with the paper. | Free | Linux focus. Slow pace. | 2026-10-16 |
| D13 | Code Ocean https://codeocean.com | n/a | n/a | UNVERIFIED | Hosted reproducible capsules. | UNVERIFIED. Page returned 403. | UNVERIFIED | UNVERIFIED | not opened |
| D14 | OSF preregistration https://www.cos.io/initiatives/prereg | n/a | n/a | n/a | Center for Open Science page read. Embargo for up to 4 years. Withdrawal is public. Templates exist. Registered Reports are a journal format with in-principle acceptance before results. | Register the analysis plan before the main run. Link the registration in the paper. | Price not stated on the page I read. The OSF registries page itself returned 503. | Registrations cannot be edited, per one university guide in search results. | 2026-10-16 |
| D15 | AsPredicted https://aspredicted.org | n/a | n/a | n/a | One author creates, coauthors approve. Private until an author makes it public. Public ones cannot be modified and are backed up to the Web Archive. Timestamped PDF with a verification URL. Home page read. | Short 9-question plan. Faster than OSF for a quick plan. | UNVERIFIED (not stated) | Run by Wharton Credibility Lab (inference from page links). | 2026-10-16 |
| D16 | Zenodo https://about.zenodo.org | 1,048 stars on zenodo/zenodo | 2026-03-13 | GPL-2.0 | CERN and OpenAIRE repository. Page says no format, size or licence requirements. Passes citation data to DataCite. | Archive each benchmark release and the raw results. Gets a DOI. | Price not stated on the page. | GitHub integration not described on the page I read. | 2026-10-16 |

---

## E. Leaderboard hosting

| # | Name and URL | Stars | Last push | Licence | What it does | Reuse (specific) | Cost | Risk or limit | Verified |
|---|---|---|---|---|---|---|---|---|---|
| E1 | Hugging Face Spaces https://huggingface.co/docs/hub/spaces-overview | n/a | n/a | n/a | Hosting for demos. Docs read. | Static Spaces are free for everyone. A static page that reads a JSON results file from a dataset repo is a free leaderboard. | Static: free. Gradio and Docker Spaces need a paid plan (PRO for personal accounts). Free personal accounts may host up to 2 Gradio Spaces on ZeroGPU. CPU Basic is 2 vCPU, 16 GB RAM. Free hardware sleeps when idle. | The old "free Gradio Space" assumption is wrong now. | 2026-10-16 |
| E2 | Open LLM Leaderboard Space https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard | n/a | n/a | UNVERIFIED | Large HF leaderboard, 14.1k likes. Page read. | Study its request and results dataset design. | Not applicable | Status UNVERIFIED. It runs on "CPU Upgrade" (paid hardware). | 2026-10-16 |
| E3 | Demo leaderboard template https://huggingface.co/spaces/demo-leaderboard-backend/leaderboard | n/a | n/a | UNVERIFIED | Template Space. Showed a runtime error. | UNVERIFIED. | Gradio, so paid plan applies. | Could not read it. | 2026-10-16 |
| E4 | huggingface/leaderboards https://github.com/huggingface/leaderboards | 24 | 2026-10-14 | none | Org repo. No description. Metadata only. | Not read. | n/a | Metadata only. | 2026-10-16 |
| E5 | Gradio https://github.com/gradio-app/gradio | 43,780 | 2026-10-16 | Apache-2.0 | Python UI library. Metadata only. | Local results browser. | Free library | Hosting on HF needs a paid plan. | 2026-10-16 |
| E6 | Streamlit https://github.com/streamlit/streamlit | 46,011 | 2026-10-16 | Apache-2.0 | Python data apps. Metadata only. | Local dashboards. | Free library | Same hosting caveat. | 2026-10-16 |
| E7 | Quarto https://github.com/quarto-dev/quarto-cli | 6,096 | 2026-10-16 | MIT per my memory; GitHub shows NOASSERTION (LICENSE not read) | Publishing system on Pandoc. Metadata only. | Papers and static leaderboard pages with code embedded. | Free | Licence not read. | 2026-10-16 |

---

## What to reuse for our setup (our 22 benchmark packages)

1. Keep our deterministic graders. Wrap them as Inspect scorers.
2. Run paired comparisons per item on the same items, then a paired BCa bootstrap with `scipy.stats.bootstrap(paired=True)`.
3. Use cluster-robust SEs when items share a source (formulas in arXiv 2411.00640).
4. Register the analysis plan with OSF or AsPredicted before the main run. Link it in the paper.
5. Run `review-paper-code` and `audit-analysis` (C6) before we submit.

---

## Top 10 to adopt now (ranked)

| Rank | Item | Why |
|---|---|---|
| 1 | scipy.stats.bootstrap with `paired=True` (S1) | Free, trusted, one function. Gives paired CIs. I read the docs. |
| 2 | Paper arXiv 2411.00640 (S4) | The method to cite for error bars, clustering and power. |
| 3 | Inspect AI (A1) | MIT, active, sandboxes and log viewer. Gives common logs for all 22 packages. |
| 4 | claesbackman/AI-research-feedback (C6) | MIT. Reviews the paper and checks the paper against the code. Fits our "show your work" rule. |
| 5 | OSF or AsPredicted preregistration (D14, D15) | Free (OSF price not stated, check). Fixes the plan before results. |
| 6 | science-superpowers (C7) | MIT. `preregistering-analysis` and `verifying-results-before-claiming` match our need. Copy the freeze script idea. |
| 7 | uv with `uv.lock` plus Docker image digests (D9, D10) | Cheap reproducibility. Same lockfile in every paper repo. |
| 8 | Zenodo archive with DOI (D16) | Permanent copy of each benchmark release and raw results. |
| 9 | RefChecker plus CheckIfExist (B12, B13) | MIT. Catches fabricated references before submission. Run both. |
| 10 | karpathy/autoresearch pattern (B9) and K-Dense stats skills (C1: `statistical-power`, `experimental-design`) | Fixed budget plus a mechanical metric matches our graders. Install only those two stats skills from C1. |

Honorable mention: tau2-bench (A19) for an agent benchmark design reference. HF static Space (E1) for a free leaderboard.

## Top 5 to avoid

| Rank | Item | Reason |
|---|---|---|
| 1 | AI Scientist v1 and v2 (B1, B2) for producing paper content | Custom licence. Executes LLM-written code. Independent study found failed experiments and hallucinated numbers. A reviewer could read fabricated results as ours. |
| 2 | CC BY-NC skill packs for anything commercial (C10 ARS, C8 open-science-skills) | NonCommercial licence. We run commercial sites. Use them only as reading material. |
| 3 | LangSmith SDK repo (A14) and unpinned LiteLLM (A27) | LangSmith repo archived 2026-10-16. LiteLLM had a reported malicious release in March 2026 (secondary sources). Pin versions and hashes, or skip. |
| 4 | Brand-new stats libraries as the source of truth (S6 to S10) | 0 to 3 stars, single author, weeks old. Cross-check against scipy only. |
| 5 | Repos with no licence file (AI-Researcher B3, lingzhi227 C12, bahayonghang C13) | We cannot legally reuse the code. Read for ideas only. |

Also not worth the setup cost for one author: HELM, AgentBench, full SWE-bench runs, Nextflow, Nix, Phoenix and Langfuse servers.

## Not found or not checked

- I did not open the official LiteLLM security advisory.
- I did not verify specific commands for lm-evaluation-harness, DVC, MLflow, promptfoo. Read their docs before use.
- I did not find an independent accuracy test for any citation checker.
- I did not open the docs for `inspect eval-set` or `inspect score`.
