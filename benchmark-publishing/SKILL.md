---
name: benchmark-publishing
description: "List a published or public AI benchmark outside the paper: Hugging Face dataset repo and card, Croissant, the official MCP registry, Zenodo citation files, eval harnesses, paper indexes, and aggregators. Includes the order of operations and a one-page packet filled once. Use when a benchmark needs a dataset card, a DOI, a registry entry, or a leaderboard listing, or when someone asks where to list a benchmark that is not a conference submission."
---

# benchmark-publishing

The paper is one surface. The benchmark also needs a citable dataset, a
package name people can search, and a listing only where the site actually
accepts one. Fill the packet once. Paste it. Do not invent a listing on a
site with no public form.

Paper venues, templates, and camera-ready live in
[`paper-submission`](../paper-submission/SKILL.md). AI-tool directories live
in [`website-directory-submission`](../website-directory-submission/SKILL.md).
`llms.txt` for a site lives in [`geo-aeo`](../geo-aeo/SKILL.md). MCP
click-paths live in
[`mcp-directory-submission`](../mcp-directory-submission/SKILL.md). This
skill is the order and the benchmark-specific rows.

## Packet

Write this once, in the benchmark repo, with no placeholders:

- Name, one-line tagline, and a paragraph on what it measures
- Task count, grader, and licence (SPDX)
- Repo URL, npm name, docs URL
- Dataset URL and where the Croissant file will live
- Contact email that a person reads
- Maintainer GitHub usernames
- Citation text (`CITATION.cff`)
- Paper URL, filled after arXiv exists
- Provenance: source, licence, and the date you retrieved it

## Order

1. **Packet.** Above. Stop if a field is a guess.
2. **Zenodo.** Add `CITATION.cff`. Add `.zenodo.json` only when you need
   grants, communities, or access rights. See
   [`references/hosting.md`](references/hosting.md).
3. **Hugging Face dataset repo.** README card, licence, tags. Croissant if
   a venue or a user will ask for it.
4. **Official MCP registry,** if the package ships an MCP server. Namespace
   and auth first. Directory click-paths stay in the sibling skill.
5. **Harness or register,** if you want the eval runnable inside someone
   else's tool. Inspect Evals, lm-evaluation-harness, and HELM are different
   doors. See [`references/listings.md`](references/listings.md).
6. **Paper index,** after the arXiv id exists. Hugging Face Papers. Do not
   assume Papers with Code still takes submissions.
7. **GitHub topics and npm `keywords`.** Cheap, and they are yours.
8. **On the benchmark's own site:** `llms.txt` via `geo-aeo`, and
   schema.org `Dataset` JSON-LD. Then AI-tool directories via
   `website-directory-submission`.
9. **Aggregators last.** Many of them have no public "add my benchmark"
   form. Record that. Do not email a stale address from a blog.

## Stop

Do not publish to the MCP registry, mint a Zenodo release, or send a
contact form without the owner. Do not print a token. Do not file a harness
PR that claims results you did not run. A paid "we will evaluate your model"
service is not a listing route.

## See also

- [`references/hosting.md`](references/hosting.md)
- [`references/listings.md`](references/listings.md)
- [`../paper-submission/SKILL.md`](../paper-submission/SKILL.md)
- [`../mcp-directory-submission/SKILL.md`](../mcp-directory-submission/SKILL.md)
- [`../website-directory-submission/SKILL.md`](../website-directory-submission/SKILL.md)
- [`../geo-aeo/SKILL.md`](../geo-aeo/SKILL.md)
