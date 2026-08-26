---
name: powerplatform-connector
description: "Ship a Microsoft Power Platform custom connector — four declarative files under integrations/powerplatform-connector/ that expose your REST API to Power Automate, Power Apps, and Logic Apps — and list it publicly by opening a pull request against Microsoft's connectors repository. Use when wrapping an API for Power Automate, writing or fixing apiDefinition/apiProperties, validating with paconn, or preparing the independent-publisher submission. Covers the whole path plus the traps that each cost a round-trip: the definition must be Swagger 2.0 and an OpenAPI 3 document is rejected outright, the validator is a Python tool rather than an npm one, the API-key connection parameter makes users type the entire header value unless you template it, and the whole submission is a PR whose template checkboxes a human enforces. Sibling of the other integration skills (connector-directory-submission, zapier-integration, make-integration, mcp-directory-submission). Triggers: 'Power Platform connector', 'Power Automate custom connector', 'paconn validate', 'apiDefinition.swagger.json', 'independent publisher connector', 'submit a connector to Microsoft'."
---

# Shipping a Power Platform connector

This is not an app. A connector is **four declarative files** — an API definition, a properties file, a README, and an icon — and publishing it means **opening a pull request against Microsoft's public connectors repository**. There is no bundle, no hosting, and no runtime of yours involved. Source lives in `integrations/powerplatform-connector/`.

## The trap that wastes a day: it is Swagger 2.0, not OpenAPI 3

The API definition file must be **Swagger 2.0**. Hand it a modern OpenAPI 3 document — the thing most API tooling emits today — and the validator rejects it and the PR's checks fail. The two formats differ where it hurts: `definitions` versus `components/schemas`, `basePath` + `host` versus `servers`, body parameters versus `requestBody`, `produces`/`consumes` versus per-response content maps.

**Rule:** convert down to Swagger 2.0 as a deliberate build step, and keep the converted file as the source of truth for the connector. Give every operation an `operationId`, a `summary`, and a `description` — the portal renders all three as the action's UI, and a missing summary reads as a broken action.

## The other five that each cost a round-trip

1. **The validator is Python.** Install it with `pip`, not npm, and run it against the definition **before** opening the PR. It catches most of what the repository's CI would bounce, and locally it takes seconds.
2. **API-key auth makes the user type the whole header value.** A connection parameter declared as an API key is passed through verbatim, so unless you template the prefix the user must literally enter `Bearer <key>` — and every connection where they typed just the key returns 401. Either template it in the definition or say so in the first line of the connection instructions.
3. **The icon has hard limits**: a PNG at roughly 230×230, under a megabyte, plus a brand colour set in the properties file. Both the file and the colour are checked.
4. **Independent publisher is the free lane.** It needs no partner agreement and lives in its own directory in the repository. The certified/verified lane requires a Microsoft partnership and a different, slower process — do not start there by accident.
5. **The PR template's checkboxes are enforced by a human reviewer.** An unchecked box bounces the PR regardless of how good the connector is.

## Build path

- `apiDefinition.swagger.json` — Swagger 2.0. One operation per action you want to appear in the designer. Use `x-ms-visibility` to hide advanced parameters, and `x-ms-summary` on parameters so the designer shows readable labels instead of raw field names.
- `apiProperties.json` — connection parameters (the auth shape), publisher, brand colour, and capability metadata.
- `README.md` — what the connector does, the exact steps to obtain a credential, and the connection instructions. Reviewers read this; so do users.
- `icon.png` — the PNG within the size limits above.
- Validate locally, then exercise the connector as a **custom connector** in a real Power Automate environment before submitting. The designer surfaces missing summaries and awkward parameter shapes immediately.

## Submission — Microsoft's connectors repository

**Submittable: public pull request, free, fully automatable.** No login of anyone else's is needed, which makes this one of the few marketplace submissions an agent can complete end to end.

1. Fork the connectors repository and branch.
2. Copy the four files into the independent-publisher directory under a folder named for the connector.
3. Validate the definition; fix everything it reports.
4. Commit, push to the fork, and open the PR against the upstream default branch.
5. Complete every checkbox in the PR template.
6. Respond to reviewer comments in the same PR. Merge means listed.

## Parity checklist (prove in a real Power Automate flow before submitting)

connection created with the documented credential format · each declared action appears in the designer with a readable label · a create action round-trips and returns the created record · a list action paginates · an error response surfaces a useful message rather than a raw 500.

## Related skills

- `connector-directory-submission` — the router across automation directories; read it first when submitting several.
- `zapier-integration`, `make-integration` — the same "wrap your REST API for a no-code host" job on portals that need a login.
- `mcp-directory-submission` — the agent-facing equivalent of this listing work.
