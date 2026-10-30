# Granit Form

E-commerce for a stone-countertop workshop in Jämtland. Built on the
[Medusa](https://docs.medusajs.com) DTC starter: a Turborepo with a Medusa 2
backend (`apps/backend`) and a Next.js storefront (`apps/storefront`).
See [AGENTS.md](AGENTS.md) for layout and conventions, and
[MEDUSA-STARTER-README.md](MEDUSA-STARTER-README.md) for the upstream starter docs.

## What's custom so far

- **Swedish store setup** (`apps/backend/src/migration-scripts/initial-data-seed.ts`):
  region Sverige, SEK, prices incl. 25 % moms, pickup + freight shipping,
  placeholder stone products.
- **Made-to-measure pricing per m²**: products with
  `metadata.pricing_mode = "per_m2"` (plus `min/max_length_mm`, `min/max_depth_mm`)
  are priced from the customer's dimensions. The variant price is the price per m².
  - `apps/backend/src/lib/stone-pricing.ts`: area, limits and price rules
    (min billable area 0.25 m², rounded to whole kronor)
  - `POST /store/carts/:id/stone-items` → `add-stone-item-to-cart` workflow:
    computes the price server-side and stores the dimensions in line item metadata
  - `workflows/hooks/reject-unpriced-stone-items.ts`: blocks adding per-m² variants
    through the standard add-to-cart route (which would charge the 1 m² price)
  - Storefront: dimension inputs with live price preview on the product page,
    dimensions shown on cart/order lines

## Local development

Requires Node 22.23+ (24 works). Docker is optional.

1. **Database**: either `docker compose up -d` (Postgres + Redis), or without Docker:

   ```bash
   cd tools/dev-db && npm install && npm start
   ```

   Both serve Postgres at `postgres://postgres:postgres@localhost:5442/medusa`.

2. **Env files**: copy `apps/backend/.env.template` → `apps/backend/.env` and
   `apps/storefront/.env.template` → `apps/storefront/.env.local`.

3. **Install, migrate, seed** (the seed runs once as a migration script):

   ```bash
   npm install
   cd apps/backend
   npx medusa db:migrate
   npx medusa user -e admin@granitform.test -p granitform-dev
   ```

   Put the publishable key (Admin → Settings → Publishable API Keys, or
   `select token from api_key`) in `apps/storefront/.env.local`.

4. **Run**: `npm run dev` from the root, or `npm run backend:dev` /
   `npm run storefront:dev`.
   - Admin: http://localhost:9000/app (local dev login above)
   - Storefront: http://localhost:8000/se

Backend unit tests (the npm scripts use Unix env syntax; on Windows use Git Bash):

```bash
cd apps/backend
TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules npx jest
```

## License

Source code: MIT (see [LICENSE](LICENSE)), building on Medusa's MIT-licensed starter.
The granit&form name and logos are not covered by the license and may not be reused.
