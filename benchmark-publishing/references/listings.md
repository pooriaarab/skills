# Listings

Each route was checked on 2026-10-16 unless the row says UNVERIFIED. "No
public submission route" means we did not find a form for adding an outside
benchmark to their public table. A contact address is not a form.

## Inspect Evals

New evals do not land as code PRs. Implementations stay in the author's
repo. The register points at a pinned commit.

Sources:
<https://github.com/UKGovernmentBEIS/inspect_evals/blob/main/register/README.md>
and
<https://github.com/UKGovernmentBEIS/inspect_evals/blob/main/CONTRIBUTING.md>.

Requirements: a `pyproject.toml` with a `[project]` table, a dependency on
`inspect_ai`, each task decorated with `@task`, and external assets pinned
(a Hugging Face `revision`, or a commit SHA in a raw URL).

Steps:

1. Read the contributor guide. It is guidance, not a merge gate.
2. Open a Register Eval Submission issue. One task per issue. The form wants
   a versioned arXiv URL, a GitHub blob URL of the task file at a 40-character
   commit SHA (add a `#L` line anchor if the file has more than one task),
   and optional extra maintainers.
3. A bot validates the issue and opens a PR. Do not open that PR by hand.
4. Upload logs of two models running all samples, and comment on the PR.
   A small model is enough. Logs may be published, so strip usernames and
   other personal data first.

Gotcha: updates from people who are not pre-approved are an issue, not a
direct edit of `eval.yaml`.

## EleutherAI lm-evaluation-harness

Guide:
<https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/new_task_guide.md>.
Checked 2026-10-16.

A new standard task is YAML under `lm_eval/tasks/<name>/`. Copy
`templates/new_yaml_task`, point the dataset at the Hugging Face `datasets`
hub, and open a PR to `main`. The guide's setup is: fork, branch named for
the task, `pip install -e ".[dev]"`.

Gotcha: the guide is for v0.4.0 and later. Data has to exist as a Hugging
Face dataset, or you have not followed this path.

## HELM

HELM entered maintenance mode on 2026-06-01. No new features will be added,
and no new evaluations will be added to the HELM leaderboards
(<https://crfm-helm.readthedocs.io/en/latest/maintenance_mode/>).

A notable scenario can still be proposed. Open an issue, wait for a
maintainer to triage it, then open a PR that names the issue. Notable means
widely adopted, published in a peer-reviewed venue, or of real interest to
a community. A homebrew scenario is not welcome. A PR with no issue is
closed. This does not put the scenario on the public leaderboard. The
framework can still run locally.

The same page names Evalchemy, Lighteval, and Unitxt as other frameworks.
Their contribution rules were not opened on 2026-10-16. UNVERIFIED. Do not
invent a PR path for them. Inspect and lm-evaluation-harness are above.

## Papers

Hugging Face paper pages:
<https://huggingface.co/docs/hub/paper-pages>. A README link to an arXiv
abstract or PDF tags the repo. Claiming authorship is a click on your name
on the paper page, then an admin check.

The submit form <https://huggingface.co/papers/submit> redirected to login
on 2026-10-16, so the fields behind the login are UNVERIFIED. Do not guess
a day-count window. Re-read the form once the owner is signed in.

`https://paperswithcode.com/` redirected to
<https://huggingface.co/papers/trending> on this check. Treat the old host
as gone.

`https://paperswithcode.co/` loaded a "Papers with Code" page of trending
papers. The fetched homepage had no submit link. Public submission route:
not found on that homepage.

## Aggregators

| Site | What we found | Route |
|---|---|---|
| benchlm.ai | Contact page, last updated 2026-09-21. Benchmark and data-source inquiries go to `hello@benchlm.ai`. Sponsorship goes to `advertise@benchlm.ai`. | No self-serve listing form. Mail is an inquiry, not a listing. <https://benchlm.ai/contact> |
| llm-stats.com | The homepage is a leaderboard. The fetch hit a human-check wall and showed no add-my-benchmark form. | No public submission route found on the fetched page. <https://llm-stats.com/> |
| Epoch AI | Team page: general questions go to `info@epoch.ai`. No listing form on that page. | No public submission route found. <https://epoch.ai/about/team> |
| Artificial Analysis | Contact form. Media is `media@artificialanalysis.ai`. The contact page also offers custom benchmarking as a service they run. | No public submission route found for an outside benchmark on the public leaderboard. <https://artificialanalysis.ai/contact> |

The benchlm, llm-stats, Epoch, and Artificial Analysis rows were read on
2026-10-16. If a page has changed, re-open it before sending mail.

## MCP directories

Glama, mcp.so, Smithery, awesome-mcp lists, and the rest of the click-path
belong to
[`mcp-directory-submission`](../../mcp-directory-submission/SKILL.md).
Re-check the live form. Do not copy an old step into a new PR.

PulseMCP: <https://www.pulsemcp.com/servers> returned HTTP 403 on
2026-10-16, so the current submit state is UNVERIFIED. Do not use an email
address from an old blog post. Publish to the official registry and look
again when the page loads.

## GitHub topics and npm keywords

Topics: GitHub's doc is "Classifying your repository with topics"
(<https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics>).
Add a few real words (`benchmark`, the task, `mcp` only if the server
exists). Topic click-path details beyond that title: UNVERIFIED in the
rendered nav.

npm: `package.json` `"keywords"` is an array of strings. npm uses it for
`npm search`
(<https://docs.npmjs.com/cli/v11/configuring-npm/package-json#keywords>).
Use the same words as the GitHub topics when they are true.

## llms.txt and schema.org

`/llms.txt` is a proposal for a short index of a site
(<https://llmstxt.org/>). If the benchmark has a website, follow
[`geo-aeo`](../../geo-aeo/SKILL.md). Do not invent a second llms.txt
procedure here.

schema.org `Dataset` is the type for a benchmark page
(<https://schema.org/Dataset>). Properties present on that page include
`name`, `description`, `url`, `license`, `creator`, `distribution`, and
`measurementTechnique`. Emit JSON-LD on the page. Do not paste a long
example into the repo.

## AI-tool directories

A benchmark with a public site uses
[`website-directory-submission`](../../website-directory-submission/SKILL.md)
for Product Hunt, AI directories, and the rest. Prepare that skill's packet
from this skill's packet. Do not submit a staging URL.
