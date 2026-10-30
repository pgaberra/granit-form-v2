# Decisions

One line per decision: `[date] area: chose X over Y — why`. Read before re-opening a settled
question; append when you pick A over B, decline a dependency, or stop because a rule forbade
something. Append-only (`merge=union` in `.gitattributes`).

- [2026-10-30] ci: Dependabot weekly (Sun 22:00 Europe/Stockholm) with a 7-day cooldown and grouped minor/patch PRs over one PR per package — fewer PRs, and a release has aged before it is proposed.
- [2026-10-30] ci: one Dependabot group for all `@medusajs/*` over per-package PRs — Medusa releases its packages together and they must move in lockstep.
- [2026-10-30] ci: payment SDKs (`@adyen/*`, `@stripe/*`) left out of every Dependabot group — each bump touches checkout and gets its own PR and review.
- [2026-10-30] ci: hold back majors of next, react, typescript, tailwindcss, @types/node and their companions (react-dom, eslint-config-next, @types/react*) over letting Dependabot propose them — the Medusa starter pins them and a major is a hand-done migration.
- [2026-10-30] ci: checks run on push to main as well as on PRs, over PR-only — the repo is private on a free plan, so no ruleset can require branches to be up to date, and PRs green one by one can break main together. Revisit (drop the push trigger) once a ruleset with strict status checks exists.
- [2026-10-30] ci: a separate `tsc --noEmit` step over relying on `next build` — `next.config.js` sets `typescript.ignoreBuildErrors`, so the build never type-checks.
- [2026-10-30] ci: actions pinned to commit SHAs over tags, kept current by Dependabot — a moved tag cannot change what runs.
- [2026-10-31] storefront: security headers set in `next.config.js` over a reverse proxy — no hosting is chosen yet, and the app then carries them wherever it runs.
- [2026-10-31] storefront: CSP staged — `frame-ancestors`, `base-uri` and `object-src` enforced now, the full policy report-only — enforcing an unverified allowlist can silently stop the Adyen or Stripe checkout from loading. Enforce only after Adyen card + 3-D Secure, Click to Pay, Apple Pay, Google Pay and Stripe have each been exercised in a live-like environment with clean reports; narrow `*.adyen.com` to the documented hosts then.
- [2026-10-31] storefront: `script-src 'unsafe-inline'` over nonces for now — Next.js hydration needs inline scripts, and nonces force every page to render dynamically. Before enforcing, add nonces with `strict-dynamic` on `/checkout` at least (it renders dynamically anyway): with `unsafe-inline` the policy gives no XSS protection.
- [2026-10-31] storefront: `frame-src https:` over an exact list — 3-D Secure challenges load the card issuer's page, which can be any origin.
- [2026-10-31] storefront: CSP has no `report-uri` yet — the natural sink is Sentry's CSP endpoint, added with Sentry; until then violations show only in the browser console.
- [2026-10-31] storefront: HSTS without `includeSubDomains` over the full form — no domain is chosen; on an apex domain it would force every subdomain (backend, admin, staging) to HTTPS for a year. Add it, then `preload`, once every subdomain serves HTTPS.
- [2026-10-31] storefront: `NEXT_PUBLIC_MEDUSA_BACKEND_URL` required at build over an empty CSP fallback — once enforced, a missing backend origin would silently block every browser call to the backend.
- [2026-10-31] ci: Dependabot ignores react-i18next, react-router-dom and @tanstack/react-query entirely — the backend pins them to @medusajs/dashboard's exact versions so admin extensions share its instance; they move by hand with a Medusa bump. This also suppresses security-update PRs for them, so a vulnerable pin is flagged only by Dependabot alerts (which must be on); the fix is a Medusa bump or a re-sync to the dashboard's versions.
- [2026-10-31] ci: Dependabot holds back vite majors (`@medusajs/admin-bundler` requires ^7) and tailwindcss-radix majors (v4's `group-radix-*` variants need Tailwind 4; under Tailwind 3 the product-tab accordion silently loses them) — CI is green on both, the breakage is only at runtime.
