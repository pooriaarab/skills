# Hosting

Three places hold the artifact. Listing sites that only point at it are in
`listings.md`.

## Hugging Face dataset repo

Docs: <https://huggingface.co/docs/hub/datasets-cards>. Checked 2026-10-16.

The dataset card is `README.md`. A YAML block at the top controls the Hub
display. The docs name these fields: `language`, `pretty_name`, `tags`,
`license`, `task_categories`. Use a real SPDX licence id. Do not leave
`license` as a sentence.

Steps:

1. Create the dataset repo under the owner's account. Stop if that login is
   not already available.
2. Write the README YAML from the packet. Keep the body short: what it
   measures, how to load it, the licence, and the paper URL once it exists.
3. Push data files that you have the right to redistribute. A gated dataset
   needs the host's gate, not a scraped copy.
4. Croissant: NeurIPS says Hugging Face can emit the core Croissant file for
   a dataset hosted there, and that you still add Responsible AI fields
   (<https://neurips.cc/Conferences/2026/CallForEvaluationsDatasets>). Field
   names are on <https://docs.mlcommons.org/croissant/docs/croissant-rai-spec.html>.
   Do not invent field names in the card.

Collections and a leaderboard Space were not re-read on 2026-10-16.
UNVERIFIED as click-paths. Open
<https://huggingface.co/docs/hub/collections> and the Spaces docs before
creating either. A leaderboard is a separate Space, not a section of the
dataset card.

Gotcha: linking an arXiv URL from a model, dataset, or Space README makes
the Hub tag that repo with the paper
(<https://huggingface.co/docs/hub/paper-pages>). Claim authorship on the
paper page by clicking the author name. An admin checks it.

## Official MCP registry

Docs: <https://modelcontextprotocol.io/registry/about>. Checked 2026-10-16.

The registry stores metadata, not your code. `server.json` holds the server
name, where to get it (package or remote URL), how to run it, and discovery
text. Names are reverse DNS: `io.github.username/server` or
`com.example/server`. GitHub and DNS or HTTP checks prove you own the
namespace. Private servers are out of scope. The registry is in preview.

Steps:

1. Put `server.json` in the repo. Name matches a namespace you can prove.
2. Authenticate before publish. The authentication guide is
   <https://modelcontextprotocol.io/registry/authentication>.
3. Publish with the official publisher tool. The long click-path, the
   description length, and the short-lived login token are maintained in
   [`mcp-directory-submission`](../../mcp-directory-submission/SKILL.md).
   Re-read that skill and the registry docs. Do not trust a copied command
   from an old note.
4. Stop for the owner's GitHub login.

Gotcha: downstream directories may ingest the registry later. Publish here
first. A 403 or a paused directory is not a reason to skip the registry.

## Zenodo

Docs: <https://help.zenodo.org/docs/github/describe-software/zenodo-json/>.
Checked 2026-10-16.

`CITATION.cff` is what GitHub shows under "Cite this repository".
`.zenodo.json` is what Zenodo reads when it archives a GitHub release. If
both files are present, Zenodo uses only `.zenodo.json` for that release
record and ignores `CITATION.cff`.

Use `.zenodo.json` when you need a grant, a Zenodo community, access rights,
related identifiers, or contributor roles. Otherwise `CITATION.cff` is
enough for the release archive.

Steps:

1. Add `CITATION.cff` from the packet (title, authors, licence, repo URL,
   version).
2. Add `.zenodo.json` only for the extra Zenodo fields. SPDX licence id.
   Do not paste the long example from the help page into the repo unchanged.
3. Enable the Zenodo-GitHub integration on the owner's account. Stop for
   that login.
4. Publish a GitHub release. Zenodo archives that release.

The direct-upload form (no GitHub) was not opened. UNVERIFIED as a click
path. Use the GitHub path above unless the owner asks for a manual deposit.

Gotcha: a release archive is a snapshot. Moving the README later does not
change the archived zip. Cut a new release for a new version.
