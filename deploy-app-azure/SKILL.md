---
name: deploy-app-azure
description: "Deploy a containerized web app to Azure (Container Apps + Azure Database for PostgreSQL + Azure Cache for Redis + Blob Storage + Key Vault, provisioned by Bicep), smoke-test it, then tear it down. Use when the operator wants a full Azure stack for a container app with private data stores, HTTPS ingress on Container Apps, and secrets in Key Vault. Triggers: 'deploy to azure', 'container apps', 'azure postgres', 'bicep', 'azure cache for redis'."
---

# Deploy a containerized web app to Azure

Generic pattern: build an **amd64** image in **Azure Container Registry (ACR)**, then deploy a Bicep template that provisions a VNet, **Azure Database for PostgreSQL Flexible Server**, **Storage Account** + blob containers, **Azure Cache for Redis**, **Key Vault**, and **Container Apps** (env + app). The app selects Azure adapters via `DEPLOY_PROFILE=azure`. Secrets come from **Key Vault** via a user-assigned managed identity, never plaintext env. After smoke tests, delete the resource group.

Placeholders only: `YOUR_SUBSCRIPTION_ID`, `<resource-group>`, `<region>`, `<image>`, `<acr>`, `<context>`.

## 1. Prerequisites

- `az` CLI
- Docker

Confirm versions, then stop if any tool is missing.

```bash
az version
docker version
```

## 2. Auth

Use a browser login on a local machine, or a device-code login on a headless / remote host.

**Browser:**

```bash
az login
```

**Device code** (prints a code you enter at `https://microsoft.com/devicelogin`):

```bash
az login --use-device-code
```

Pin the subscription before anything else:

```bash
az account set --subscription YOUR_SUBSCRIPTION_ID
az account show --query '{name:name, id:id}' -o table
```

Expect `id` = `YOUR_SUBSCRIPTION_ID`. Do not proceed on a surprise subscription.

## 3. Build and push the image to ACR (amd64)

Container Apps run **linux/amd64**. Prefer `az acr build` so the image is built server-side (no local QEMU, no laptop architecture mismatch).

```bash
az acr create \
  --name <acr> \
  --resource-group <resource-group> \
  --sku Basic \
  --location <region>

az acr build \
  --registry <acr> \
  --image <image>:v1 \
  <context>
```

`az acr build` uploads the context, builds **amd64** in ACR, and tags `<acr>.azurecr.io/<image>:v1`. Use an immutable tag (`:v1`), not `:latest`.

If the resource group does not exist yet, create it first (same group the Bicep deploy will use):

```bash
az group create --name <resource-group> --location <region>
```

## 4. Bicep

A template (`main.bicep`) that provisions:

| Resource | Shape |
|---|---|
| VNet | Subnets for the data plane + Container Apps environment (serverless / VNet-integrated access) |
| Azure Database for PostgreSQL Flexible Server | Cheapest **burstable** tier, **private**, password stored in **Key Vault** |
| Storage Account | + **3 blob containers**; no public blob access |
| Azure Cache for Redis | **Basic C0**, private |
| Key Vault | DB password, session secret, encryption KEK |
| User-assigned managed identity | Granted Key Vault secrets-user (and storage data as needed) |
| Container Apps environment + app | Image from ACR, HTTPS ingress, min/max replicas, secrets from Key Vault via the identity |

Validate before deploy:

```bash
az bicep build --file main.bicep
```

Deploy:

```bash
az group create --name <resource-group> --location <region>

az deployment group create \
  --resource-group <resource-group> \
  --template-file main.bicep \
  --parameters \
    location=<region> \
    containerImage=<acr>.azurecr.io/<image>:v1 \
    acrName=<acr>
```

Set the app profile and fail-loud secrets **explicitly**. Some IaC manifests forget session/encryption secrets:

```bicep
appEnv: [
  { name: 'DEPLOY_PROFILE', value: 'azure' }
]
// generate, then store in Key Vault — do not commit
// sessionSecret   = '$(openssl rand -hex 32)'
// encryptionKek   = '$(openssl rand -base64 32)'
```

Wire those Key Vault secrets into the Container App as secret refs (identity-based), not as plaintext `env` values.

PostgreSQL Flexible Server can take ~10 minutes. Wait for the deployment to finish before testing.

## 5. Smoke test

Resolve the Container App FQDN — do not guess the hostname:

```bash
FQDN="$(az containerapp show \
  --name <app> \
  --resource-group <resource-group> \
  --query properties.configuration.ingress.fqdn \
  -o tsv)"

BASE="https://${FQDN}"

curl -sf "${BASE}/<health-endpoint>"
curl -o /dev/null -w '%{http_code}\n' "${BASE}/"
curl -o /dev/null -w '%{http_code}\n' "${BASE}/login"
```

Expect **200** on health, `/`, and `/login`.

Confirm the profile selected Azure adapters:

- `DEPLOY_PROFILE=azure` → **Postgres** (Flexible Server) via the Postgres adapter
- Object storage → **Azure Blob** via the **native Azure Blob adapter** (Azure Blob is **not** S3-compatible — do not point an S3 client at it)
- Sessions / cache / queue → **Redis** (Azure Cache for Redis)

A health payload or env check that reports datastore / blob / cache backends is enough. Do not accept "the FQDN is up" as proof the private services work.

## 6. Teardown

```bash
az group delete --name <resource-group> --yes
```

This removes everything in the resource group (ACR, Postgres, Redis, Storage, Key Vault, Container Apps). Confirm the group is gone so the subscription does not keep billing a forgotten Flexible Server or Redis instance:

```bash
az group exists --name <resource-group>
```

Expect `false`.

## 7. Gotchas

- **Validate Bicep first.** `az bicep build --file main.bicep` catches template errors before a long failed deploy.
- **Managed identity vs connection keys.** Prefer the user-assigned identity for Key Vault secret refs and Blob data-plane access. Connection strings / account keys are a fallback, not the default.
- **Azure Blob is not S3.** Use the native Azure Blob adapter. An S3 client against a Blob endpoint will fail in confusing ways.
- **Basic Redis has no failover.** Fine for verification. Do not treat C0 as production HA.
- **Session / encryption secrets.** Some IaC forgets them. Set them explicitly in Key Vault and reference them from the Container App, or the app will refuse to boot (or worse, boot with a published default).
- **amd64 image.** `az acr build` produces amd64. A local arm64-only `docker build` + push will fail to start on Container Apps.
- **Private data plane.** Postgres and Redis stay on the VNet. Container Apps ingress is the only public HTTPS entry. Do not attach a public IP to the database or cache.
- **Cost.** Flexible Server + Redis + Container Apps keep charging until the resource group is deleted. Tear down when done.

## Related

Catalog row (for the skills index, do not invent extra docs):

`| [deploy-app-azure](deploy-app-azure/SKILL.md) | Azure |`
