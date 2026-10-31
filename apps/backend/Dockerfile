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
WORKDIR /repo/apps/backend/.medusa/server
# No lockfile here (Medusa copies one only from apps/backend; ours is at the repo root), so
# transitive versions resolve at build time. See DECISIONS.md.
# Drop devDependencies first: --omit=dev still resolves them, and without a lockfile their
# peer ranges can conflict (vite wants a newer @types/node) and fail the install.
RUN npm pkg delete devDependencies && npm install --omit=dev --no-audit --no-fund

FROM node:22-bookworm-slim@sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /repo/apps/backend/.medusa/server ./
# The app runs as node and may write only its uploads (the local file provider's /app/static),
# not its own code.
RUN mkdir -p /app/static && chown node:node /app/static
USER node
EXPOSE 9000
# Migrations (and the one-off seed migration script) run on every start; they are idempotent.
CMD ["sh", "-c", "./node_modules/.bin/medusa db:migrate && exec ./node_modules/.bin/medusa start"]
