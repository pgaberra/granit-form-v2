# CLAUDE.md

Read [AGENTS.md](./AGENTS.md) — it holds this project's directory structure, commands, conventions, and off-limits paths. Follow it for all work in this repository.

## Project rules

- Customer-facing copy is Swedish, addressing the customer as "du", no em dashes. Code, comments,
  commits, PRs and issues are English.
- Prices are SEK incl. moms. Per-m² prices are computed only in
  `apps/backend/src/lib/stone-pricing.ts`; the storefront copy is a preview mirror. See README.
- Brand: `granite` / `stone` Tailwind tokens, `font-display` for headings, logo files in
  `apps/storefront/public/brand/`. No hex values in components.
- The repo is intended to be public: never commit secrets, real customer data or production
  hostnames/credentials.
- Work on a branch and open a PR; don't push to `main`.

## Before opening a PR

Once the branch's checks pass and its commits are in, and before `gh pr create`:

- Run the `code-reviewer` subagent on the branch. Every PR, docs-only ones excepted.
- Also run the `security-reviewer` subagent, in parallel, when the diff touches any of:
  `apps/backend/src/api/` (routes, `middlewares.ts`), `apps/backend/src/workflows/` (incl. hooks),
  `apps/backend/src/lib/stone-pricing.ts`, `medusa-config.ts`, `.env.template` files,
  payment/checkout code (`apps/storefront/src/modules/checkout/`, `src/lib/data/cart.ts`,
  `payment.ts`), customer auth or account code, `apps/storefront/src/middleware.ts`,
  `next.config.js`, `.github/`, `docker-compose.yml`, any Dockerfile, a new dependency, or anything
  that logs, stores or returns personal data, tokens or secrets. When in doubt, run it.
- Fix every BLOCKER, commit, and run the reviewer that raised it again until it says `PASS`. A
  BLOCKER you believe is wrong: say why in the PR body rather than ignoring it. SHOULD and NIT
  are your call; list the ones you skip in the PR body.
- The PR body says which reviewers ran and their final verdict.

The reviewers are read-only and report, never fix. They are a second pair of eyes, not a gate CI
enforces.

## Machine-specific gotchas (Windows dev box)

- Docker is not installed; run Postgres with `tools/dev-db` (`npm start`, port 5442).
- The backend's npm test scripts use Unix env syntax; run jest from Git Bash:
  `TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest`.
- `next dev` rewrites `apps/storefront/AGENTS.md`; commit that change with your work.
