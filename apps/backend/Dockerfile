# Medusa backend (API + admin at /app). Build context: the repository root.
#   docker build -f apps/backend/Dockerfile .
# Same Node major and npm as CI (pr-checks.yml); the digest pins the base image.
FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da AS build
RUN npm install -g npm@11.4.1
WORKDIR /repo

COPY package.json package-lock.json .npmrc turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN npm ci --no-audit --no-fund

COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
# Outputs .medusa/server: compiled backend + admin bundle + its own package.json.
RUN npx medusa build

# The backend's production dependencies, installed from the root lockfile: the exact versions
# CI tested. Medusa's build has no lockfile of its own (it copies one only from apps/backend),
# so installing inside .medusa/server would resolve transitive versions afresh on every build.
# npm keeps nothing nested under apps/backend for production, so the hoisted node_modules is
# the whole tree; the workspace symlinks would dangle in the runtime image.
FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da AS deps
RUN npm install -g npm@11.4.1
WORKDIR /repo
COPY package.json package-lock.json .npmrc ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
# The check fails the build if npm ever nests a production package under apps/backend, which
# this copy would miss (today only dev-only @types sit there, as empty directories).
RUN npm ci --omit=dev --workspace @dtc/backend --no-audit --no-fund \
    && rm -rf node_modules/@dtc \
    && if [ -n "$(find apps/backend/node_modules -name package.json 2>/dev/null)" ]; then \
         echo "apps/backend/node_modules has production packages; copy them too" >&2; exit 1; \
       fi

FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da
ENV NODE_ENV=production
# curl for Coolify's in-container health check (GET /health, built into Medusa).
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /repo/apps/backend/.medusa/server ./
COPY --from=deps /repo/node_modules ./node_modules
# The app runs as node and may write only its uploads (the local file provider's /app/static),
# not its own code.
RUN mkdir -p /app/static && chown node:node /app/static
USER node
EXPOSE 9000
# Migrations (and the one-off seed migration script) run on every start; they are idempotent.
CMD ["sh", "-c", "./node_modules/.bin/medusa db:migrate && exec ./node_modules/.bin/medusa start"]
