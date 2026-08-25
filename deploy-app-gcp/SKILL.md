---
name: deploy-app-gcp
description: Use when you need to deploy a containerized web app to GCP with Cloud Run, Cloud SQL, Memorystore, GCS, Artifact Registry, and Terraform; triggers include deploy to gcp, cloud run, cloud sql, terraform gcp, and memorystore.
---

# Deploy an app to GCP

Use this runbook to provision a containerized web app with Terraform, verify it, and remove the provisioned resources. Use placeholders only. Never add project IDs, account IDs, emails, bucket names, IP addresses, company names, product names, secrets, or other private values.

## 1. Check prerequisites

Install and verify:

~~~bash
gcloud version
terraform version
docker version
~~~

Use the Terraform Docker image if Terraform is not installed locally.

## 2. Authenticate

Log in to the Google Cloud CLI and to Application Default Credentials (ADC). These are separate credentials. The Terraform Google provider uses ADC.

~~~bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
~~~

Do not paste credential output into files, logs, or issue comments.

## 3. Enable billing first

Link billing before enabling APIs or provisioning resources. Otherwise API enablement or provisioning can fail with `UREQ_PROJECT_BILLING_NOT_FOUND`.

~~~bash
gcloud billing projects link YOUR_PROJECT_ID \
  --billing-account=YOUR_BILLING_ACCOUNT
~~~

## 4. Enable required APIs

~~~bash
gcloud services enable \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com \
  vpcaccess.googleapis.com \
  servicenetworking.googleapis.com \
  cloudbuild.googleapis.com
~~~

## 5. Build and push an amd64 image

Create an Artifact Registry Docker repository, then build and push the image from the container context. Use Cloud Build on an arm64 Mac to avoid slow local emulation. Cloud Run runs amd64 images.

~~~bash
gcloud artifacts repositories create app \
  --repository-format=docker \
  --location=<region>

gcloud builds submit . \
  --tag <region>-docker.pkg.dev/YOUR_PROJECT_ID/app/app:v1
~~~

After enabling Cloud Build, its service agent can need about one minute. If the first build fails with `PERMISSION_DENIED` for the staging bucket, retry it.

## 6. Provision the infrastructure with Terraform

Use a Terraform module that provisions:

- A VPC and a Serverless VPC Access connector.
- Cloud SQL for PostgreSQL with the cheapest `db-f1-micro` tier and private IP.
- The database password in Secret Manager.
- GCS buckets with generated names.
- Memorystore Redis with the `BASIC` 1 GB tier.
- Cloud Run v2 with the image, `min_instances = 0`, the VPC connector, and Secret Manager references.
- IAM needed by Cloud Run and the provisioned services.

Create a tfvars file with `project_id`, `region`, `container_image`, and the cheapest suitable tiers. Use this image value:

~~~hcl
project_id      = "YOUR_PROJECT_ID"
region          = "<region>"
container_image = "<region>-docker.pkg.dev/YOUR_PROJECT_ID/app/app:v1"
~~~

Set application session and encryption secrets explicitly. Wire those secrets into Cloud Run. Do not place secret values in tfvars, source files, commands, or logs.

Apply the module:

~~~bash
terraform init
terraform apply
~~~

Cloud SQL can take about 10–15 minutes to provision. Wait for Terraform to finish before testing the app.

## 7. Smoke-test the deployment

Read the Cloud Run URL and test the health endpoint, root route, and login route. A cold start can take longer, so retry failed requests.

~~~bash
APP_URL="$(terraform output -raw cloud_run_url)"

curl --fail --retry 5 --retry-delay 5 "$APP_URL/health"
curl --fail --retry 5 --retry-delay 5 "$APP_URL/"
curl --fail --retry 5 --retry-delay 5 "$APP_URL/login"
~~~

Confirm that each route returns HTTP 200. Confirm that the app selected the GCP profile by checking a non-secret health field or environment check for `DEPLOY_PROFILE=gcp`. Confirm that this profile uses Cloud SQL, GCS, and Redis. GCP object storage uses the native GCS adapter, not an S3 adapter.

## 8. Tear down the deployment

Destroy all resources managed by the Terraform module when the test is complete:

~~~bash
terraform destroy
~~~

Confirm that the destroy operation completes successfully. Check for resources created outside Terraform before considering the project clean.

## 9. Troubleshoot common failures

+ `UREQ_PROJECT_BILLING_NOT_FOUND`: enable billing before API enablement and Terraform.
+ Terraform authentication errors: log in with ADC, not only with `gcloud auth login`.
- Image architecture errors: build a Linux amd64 image with Cloud Build.
+ First Cloud Build staging-bucket `PERMISSION_DENIED`: wait about one minute and retry.
- Missing sessions or encryption: set the application secrets explicitly and wire them into Cloud Run through Secret Manager.
