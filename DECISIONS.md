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
