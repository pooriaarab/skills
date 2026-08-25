---
name: deploy-app-aws
description: "Deploy a containerized web app to AWS (ECS Fargate + RDS PostgreSQL + ElastiCache Redis + S3 + ALB, provisioned by Terraform), smoke-test it, then tear it down. Use when the operator wants a full AWS stack for a container app with private data stores and public HTTP(S) ingress only through a load balancer. Triggers: 'deploy to aws', 'ecs fargate', 'rds postgres', 'terraform aws', 'elasticache'."
---

# Deploy a containerized web app to AWS

Generic pattern: build an **amd64** image, push it to **ECR**, then apply a Terraform module that provisions a VPC, **RDS PostgreSQL**, **S3**, **ElastiCache Redis**, **ECS Fargate**, and an **ALB**. The app selects AWS adapters via `DEPLOY_PROFILE=aws`. Secrets come from **Secrets Manager**, never plaintext env. After smoke tests, destroy the stack.

Placeholders only: `YOUR_ACCOUNT_ID`, `<region>`, `<image>`, `<repo>`, `<profile>`, `<bucket-prefix>`.

## 1. Prerequisites

- `aws` CLI
- `terraform` (or the `hashicorp/terraform` Docker image)
- Docker

Confirm versions, then stop if any tool is missing.

```bash
aws --version
terraform version
docker version
```

## 2. Auth

AWS has **no browser login for plain IAM**. Use one of:

**Access keys** (paste an IAM access key id + secret + region into `~/.aws/credentials`):

```bash
aws configure
```

**IAM Identity Center** (if the account uses SSO):

```bash
aws sso login --profile <profile>
export AWS_PROFILE=<profile>
```

Verify the caller before anything else:

```bash
aws sts get-caller-identity
```

Expect `Account` = `YOUR_ACCOUNT_ID` and an ARN you recognize. Do not proceed on a surprise account.

## 3. Build and push the image to ECR (amd64)

Fargate runs **linux/amd64**. On an arm64 laptop, still build `--platform linux/amd64`.

```bash
aws ecr create-repository --repository-name <repo> --region <region>

aws ecr get-login-password --region <region> \
  | docker login --username AWS --password-stdin \
    YOUR_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com

docker build --platform linux/amd64 -t <image>:v1 <container-context>
docker tag <image>:v1 YOUR_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<repo>:v1
docker push YOUR_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<repo>:v1
```

Use an immutable tag (`:v1`), not `:latest`.

## 4. Terraform

A module that provisions:

| Resource | Shape |
|---|---|
| VPC | Public + private subnets, **one NAT** |
| RDS PostgreSQL | Cheapest `db.t4g.micro` / `db.t3.micro`, **private** |
| S3 | Block public access + versioning + scoped IAM |
| ElastiCache Redis | Single node, **private** |
| ECS Fargate | Task definition with `<image>` + env, plus a service |
| ALB | HTTP → HTTPS; **only public ingress** |
| Secrets Manager | DB password, session secret, encryption KEK — injected into the task |

`tfvars`: `region`, `container_image`, cheapest instance classes.

```hcl
region          = "<region>"
container_image = "YOUR_ACCOUNT_ID.dkr.ecr.<region>.amazonaws.com/<repo>:v1"
db_instance     = "db.t4g.micro"
```

Set the app profile and fail-loud secrets **explicitly**. Some IaC manifests forget session/encryption secrets:

```hcl
app_env = {
  DEPLOY_PROFILE = "aws"
}
# generate, then store in Secrets Manager — do not commit
# session_secret     = "$(openssl rand -hex 32)"
# encryption_kek     = "$(openssl rand -base64 32)"
```

Apply (RDS takes ~10 min):

```bash
terraform init
terraform apply
```

## 5. Smoke test

```bash
terraform output alb_url
# or the ALB DNS name
```

```bash
curl -sf "<alb-url>/<health-endpoint>"
curl -o /dev/null -w '%{http_code}\n' "<alb-url>/"
curl -o /dev/null -w '%{http_code}\n' "<alb-url>/login"
```

Expect **200** on health, `/`, and `/login`.

Confirm the profile selected AWS adapters:

- `DEPLOY_PROFILE=aws` → **Postgres (RDS)** via the Postgres adapter
- Object storage → **S3** via the app's S3 adapter
- Sessions / cache / queue → **Redis (ElastiCache)**

A health payload or env check that reports datastore / blob / cache backends is enough. Do not accept "the ALB is up" as proof the private services work.

## 6. Teardown

```bash
terraform destroy
```

Confirm the apply-created resources are gone (`aws ecs list-services`, `aws rds describe-db-instances`, `aws s3 ls`) so the account does not keep billing a forgotten NAT, RDS, or ALB.

## 7. Gotchas

- **amd64 image for Fargate.** An arm64-only local build will fail to start on Fargate.
- **RDS and Redis stay in private subnets.** The ALB is the only public ingress. Do not attach a public IP to the DB or cache.
- **Secrets via Secrets Manager, not plaintext env** on the task definition.
- **S3 bucket names are globally unique.** Use `<bucket-prefix>-<random>` (or account+region) and keep block-public-access on.
- **Session / encryption secrets.** Some IaC forgets them. Set them explicitly or the app will refuse to boot (or worse, boot with a published default).
- **NAT + RDS cost.** Destroy when done. A leftover NAT gateway and `db.t4g.micro` keep charging.

## Related

Catalog row (for the skills index, do not invent extra docs):

`| [deploy-app-aws](deploy-app-aws/SKILL.md) | AWS |`
