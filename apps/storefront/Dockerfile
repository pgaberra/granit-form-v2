# Next.js storefront. Build context: the repository root.
#   docker build -f apps/storefront/Dockerfile \
#     --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=... \
#     --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=... .
# NEXT_PUBLIC_* values are inlined at build time, so each environment needs its own image.
# Same Node major and npm as CI (pr-checks.yml); the digest pins the base image.
FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da AS build
RUN npm install -g npm@11.4.1
WORKDIR /repo

COPY package.json package-lock.json .npmrc turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN npm ci --no-audit --no-fund

COPY apps/storefront apps/storefront

ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_DEFAULT_REGION=se
ARG NEXT_PUBLIC_STRIPE_KEY=
# Anything but "production" sends X-Robots-Tag: noindex (next.config.js).
ARG APP_ENV=
ENV APP_ENV=$APP_ENV \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /repo/apps/storefront
RUN npx next build

FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8000 \
    HOSTNAME=0.0.0.0
# curl for Coolify's in-container health check (GET /api/health).
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Standalone output mirrors the monorepo layout (outputFileTracingRoot is the repo root).
COPY --from=build --chown=node:node /repo/apps/storefront/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=build --chown=node:node /repo/apps/storefront/public ./apps/storefront/public
USER node
EXPOSE 8000
CMD ["node", "apps/storefront/server.js"]
