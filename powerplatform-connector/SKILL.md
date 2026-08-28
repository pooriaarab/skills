---
name: powerplatform-connector
description: "Ship a Microsoft Power Platform custom connector — three declarative files under integrations/powerplatform-connector/ that expose your REST API to Power Automate, Power Apps, and Logic Apps — and list it publicly by opening a pull request against Microsoft's connectors repository. Use when wrapping an API for Power Automate, writing or fixing apiDefinition/apiProperties, validating with paconn, or preparing the independent-publisher submission. Covers the whole path plus the traps that each cost a round-trip: the submission stalls on an unsigned CLA that only a human can sign, the definition must be Swagger 2.0 and an OpenAPI 3 document is rejected outright, an icon.png does not belong in the submission at all, the API-key connection parameter makes users type the entire header value unless you template it, and the validator is a Python tool rather than an npm one. Sibling of the other integration skills (connector-directory-submission, zapier-integration, make-integration, mcp-directory-submission, pipedream-integration). Triggers: 'Power Platform connector', 'Power Automate custom connector', 'paconn validate', 'apiDefinition.swagger.json', 'independent publisher connector', 'submit a connector to Microsoft'."
---

# Shipping a Power Platform connector

A connector is not an app. It is **three declarative files** plus a pull request against
Microsoft's public connectors repository. There is no bundle, no hosting, and no runtime of
yours involved. Source lives in `integrations/powerplatform-connector/`.

## Read this first: the CLA is what actually blocks you

The moment you open the PR, `microsoft-github-policy-service` posts a Contributor License
Agreement and waits for you to reply in a comment:

```
@microsoft-github-policy-service agree
```

Until a human posts that, **nothing happens** — no review, no pipeline, no triage. It is a
legal agreement, so an agent must not post it on someone's behalf. Content Rabbit's PR #4282
sat untouched for four days for exactly this reason while we assumed the file contents were
the holdup. Check for the CLA comment before you debug anything else.

`azure-pipelines` also posts that a maintainer may need to comment `/azp run`. That one is
theirs to do, not yours.

## Exactly three files. Verified, not assumed.

```
apiDefinition.swagger.json
apiProperties.json
readme.md
```

We checked 25 merged connectors in `independent-publisher-connectors`. **Every one has these
three. Not one ships an `icon.png`**, a `package.json`, or a `settings.json`. An earlier
version of this skill claimed four files including an icon; that was wrong.

Keep your local tooling — the paconn `settings.json`, brand artwork, the icon the *certified*
lane wants — in a `local/` subdirectory, so the connector root is exactly what you submit.
Copying the directory wholesale is the mistake this layout prevents.

Two naming details, both measured against the live repository:

- `readme.md` lowercase in 10 of 12 sampled connectors. `README.md` appears but is the minority.
- Directory names may contain spaces — 215 of 465 do. `Content Rabbit` is fine.

**macOS trap when you rename `README.md` to `readme.md`:** the filesystem is case-insensitive,
so writing `readme.md` overwrites `README.md`, and a follow-up `rm README.md` deletes the file
you just wrote. Set `git config core.ignorecase false` in the fork and stage the rename through
the index.

## It is Swagger 2.0, not OpenAPI 3

The definition must be **Swagger 2.0**. Hand it the OpenAPI 3 document most API tooling emits
today and the validator rejects it. The two differ where it hurts: `definitions` versus
`components/schemas`, `basePath` + `host` versus `servers`, body parameters versus
`requestBody`, `produces`/`consumes` versus per-response content maps.

Convert down as a deliberate build step and keep the converted file as the connector's source
of truth. Give every operation an `operationId`, a `summary`, and a `description` — the
designer renders all three, and a missing summary reads as a broken action.

## The metadata reviewers check for

`apiDefinition.swagger.json` needs, beyond the paths:

```jsonc
"info": { "contact": { "name": "...", "url": "...", "email": "..." } },
"x-ms-connector-metadata": [
  { "propertyName": "Website",        "propertyValue": "https://..." },
  { "propertyName": "Privacy policy", "propertyValue": "https://..." },
  { "propertyName": "Categories",     "propertyValue": "Social Media;Marketing" }
]
```

`Categories` is a semicolon-joined selection from Microsoft's fixed list. Read a few merged
connectors for real values rather than inventing one — observed examples include
`Content and Files`, `Business Intelligence`, `IT Operations`, `Social Media;Website`.

**Verify the privacy-policy URL resolves before you write it.** A 404 there is a reviewer
round-trip for a one-line fix.

`apiProperties.json` needs `publisher` and `stackOwner`, both required for the independent
publisher lane, plus `capabilities` (usually `[]`) and `iconBrandColor`.

## Do not make users type "Bearer "

An API-key connection parameter is passed through verbatim. Declare it plainly and every user
who pastes just their key gets a 401, because the header ends up without the scheme. Build the
header with a policy template instead, and let the field take the bare key:

```jsonc
"policyTemplateInstances": [{
  "templateId": "setheader",
  "title": "Set Authorization header",
  "parameters": {
    "x-ms-apimTemplateParameter.name": "Authorization",
    "x-ms-apimTemplateParameter.value": "Bearer @connectionParameters('api_key')",
    "x-ms-apimTemplateParameter.existsAction": "override",
    "x-ms-apimTemplate-policySection": "Request"
  }
}]
```

Then say "no `Bearer` prefix" in the `uiDefinition` description, the swagger
`securityDefinitions` description, and the readme. All three are read by different people.

**If you add this policy to a connector that already shipped without it**, every existing
connection storing `Bearer <key>` starts sending `Authorization: Bearer Bearer <key>` and
fails. There is no way to handle both formats at once, so make the change before anyone can
create a connection, or accept that you are breaking existing ones.

## The readme has a fixed shape

Follow the section order the merged connectors use, because reviewers scan for it:

```markdown
# <Connector name>
<one paragraph on what the service does>

## Publisher: <name>

## Prerequisites
## Obtaining Credentials
## Supported Operations
### <operation summary, not the operationId>
## Known Issues and Limitations
```

Write the operation headings from each operation's real `summary`. Do not invent operations,
and do not describe parameters the swagger does not declare — a worker drafting this for
Content Rabbit claimed a free tier that does not exist, which would have shipped a false
pricing claim into a Microsoft repository. Check every factual claim against the code.

## The other traps

1. **The validator is Python.** `pip install paconn`, not npm. Run
   `paconn validate --api-def apiDefinition.swagger.json` before opening the PR; it takes
   seconds and catches most of what CI would bounce.
2. **The icon has hard limits** if you need one for the certified lane: PNG around 230×230,
   under a megabyte, plus a brand colour in the properties file. The independent lane does not
   take one in the repository at all.
3. **Independent publisher is the free lane.** No partner agreement, its own directory. The
   certified lane needs a Microsoft partnership and a slower process — do not start there by accident.
4. **The PR template's checkboxes are enforced by a human.** An unchecked box bounces the PR.

## Submission

1. Fork the connectors repository and branch.
2. Copy the three files into `independent-publisher-connectors/<Connector Name>/`.
3. Validate the definition; fix everything reported.
4. Push and open the PR against `dev`.
5. **Post the CLA agreement comment.** Nothing proceeds until you do.
6. Complete every checkbox in the PR template.
7. Answer reviewer comments in the same PR. Merge means listed.

## Parity checklist (prove in a real Power Automate flow first)

connection created with the documented credential format · each declared action appears in the
designer with a readable label · a create action round-trips and returns the created record ·
a list action paginates · an error response surfaces a useful message rather than a raw 500.

## Related skills

- `pipedream-integration` — the same "PR your connector into someone's monorepo" shape, with a
  much faster review loop.
- `connector-directory-submission` — the router across automation directories; read it first
  when submitting several.
- `zapier-integration`, `make-integration` — the same job on portals that need a login.
- `mcp-directory-submission` — the agent-facing equivalent of this listing work.
