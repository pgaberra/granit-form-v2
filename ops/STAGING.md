# Staging

The storefront and the backend (with the admin at `/app`) run on the project's shared,
access-restricted staging server under Coolify (project `granit-form`, environment `staging`).
Their addresses are the repository secret `STAGING_BACKEND_URL` and the storefront host next
to it; the server itself, its access setup and its file layout are documented privately, not
in this public repository. Staging is not meant to be public or indexed.

## How a deploy works

1. When the PR checks pass on `main` (or on a manual run against `main`),
   `.github/workflows/deploy-staging.yml` starts.
2. It builds `apps/backend/Dockerfile` and `apps/storefront/Dockerfile` on GitHub's runners
   (the staging server is too small to build them) and pushes
   `ghcr.io/pgaberra/granit-form-{backend,storefront}` tagged with the commit sha.
3. It connects to the Coolify host with a restricted SSH key whose forced command accepts only
   a commit sha. That command points both Coolify apps at the sha's image tag and deploys the
   backend, then the storefront. It prints only fixed status lines, since this repository's
   Actions logs are public.
4. The backend container runs `medusa db:migrate` before it starts; on an empty database that
   also runs the one-off seed (`initial-data-seed.ts`).

## Configuration

Repository secrets (Settings → Secrets and variables → Actions → Secrets). The host values are
not sensitive on their own, but as secrets the public Actions logs mask them, so the staging
server cannot be found from this repository:

| Secret | Value |
|---|---|
| `STAGING_BACKEND_URL` | the staging backend's public URL |
| `STAGING_DEPLOY_HOST` | the Coolify host's address |
| `STAGING_DEPLOY_KNOWN_HOSTS` | that host's `known_hosts` line, so the runner pins its key |
| `STAGING_DEPLOY_SSH_KEY` | the private half of the restricted deploy key |

Repository variable: `STAGING_PUBLISHABLE_KEY`, the staging backend's publishable key (public
by design).

The deploy key's public half is installed on the Coolify host with `restrict,command="..."`, so it cannot
open a shell or forward ports.

Both NEXT_PUBLIC values are inlined into the storefront bundle and stay in the image history;
never put a real secret in a build argument. The image attestation uses `provenance: mode=min`,
which leaves the build arguments out. Runtime secrets (database URL, JWT and cookie
secrets) are set only in Coolify.

The GHCR packages are public so Coolify can pull them without registry credentials; nothing
secret is baked into either image.

Coolify runs the apps from these images (no builds on the server) with memory limits: backend
768 MB, storefront 384 MB, Postgres 256 MB. Coolify's HTTP health check is off: the slim Node
image has no curl, so Coolify relies on the container state. Redis is not used on staging:
Medusa falls back to its in-memory event bus, cache and workflow engine.

## First deploy

The storefront inlines the publishable key at build time, but the key only exists once the
backend has seeded its database. So:

1. Run the workflow; the backend comes up and seeds, the storefront is built with a
   placeholder key and cannot load data yet.
2. Read the key from the staging database (`select token from api_key where type='publishable'`)
   and set `STAGING_PUBLISHABLE_KEY`.
3. Run the workflow again.

The staging admin user is created once with `medusa user` inside the backend container.

## Data

Staging has its own seed data and, once payments exist, Stripe test mode only. Uploaded files
(product images) live in the backend container's `static/` directory and are lost on redeploy;
move them to S3-compatible storage before production.
