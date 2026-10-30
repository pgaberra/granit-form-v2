/**
 * Whether a value is a bare ISO 3166-1 alpha-2 code as Medusa stores them
 * (lowercase). Redirect paths are built from country codes the client sends,
 * so anything else (e.g. "/evil.example") could turn a path into an off-site
 * redirect.
 */
export const isCountryCode = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z]{2}$/.test(value)
