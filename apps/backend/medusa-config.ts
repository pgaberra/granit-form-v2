import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Public URL of this backend (e.g. https://api.example.com). Uploaded files are served
// from it, so product image URLs must use it instead of the localhost default.
const backendUrl = process.env.MEDUSA_BACKEND_URL

const MIN_SECRET_LENGTH = 32
const MIN_SECRET_DISTINCT_CHARS = 10

/**
 * Medusa already refuses to start in production without JWT_SECRET or
 * COOKIE_SECRET, but it accepts the publicly known template value, a weak
 * secret, template CORS origins, and falls back silently when DATABASE_URL or
 * a CORS list is unset. Fail closed on all of those in every environment but
 * development and test (so a NODE_ENV=staging deploy is checked too). An
 * unset NODE_ENV counts as local, as loadEnv above treats it; `medusa start`
 * sets it to production before loading this file. `medusa build` is skipped:
 * secrets are runtime-only and never present when the image is built.
 */
function assertDeployedConfig() {
  const isLocal = ['', 'development', 'test'].includes(process.env.NODE_ENV || '')
  const isBuild = process.argv[2] === 'build'
  if (isLocal || isBuild) {
    return
  }

  const problems: string[] = []

  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    problems.push('DATABASE_URL is not set')
  } else if (databaseUrl.includes('postgres:postgres@')) {
    problems.push('DATABASE_URL uses the template credentials')
  }

  for (const name of ['STORE_CORS', 'ADMIN_CORS', 'AUTH_CORS']) {
    const origins = (process.env[name] || '').split(',').map((o) => o.trim()).filter(Boolean)
    if (!origins.length) {
      problems.push(`${name} is not set`)
    }
    for (const origin of origins) {
      if (!origin.startsWith('https://') || /localhost|docs\.medusajs\.com|\*/.test(origin)) {
        problems.push(`${name} has an origin that is not a production https origin: ${origin}`)
      }
    }
  }

  const secrets: Record<string, string> = {}
  for (const name of ['JWT_SECRET', 'COOKIE_SECRET']) {
    const value = (process.env[name] || '').trim()
    secrets[name] = value
    if (!value) {
      problems.push(`${name} is not set`)
    } else if (/supersecret/i.test(value)) {
      problems.push(`${name} is the template value`)
    } else if (value.length < MIN_SECRET_LENGTH) {
      problems.push(`${name} is shorter than ${MIN_SECRET_LENGTH} characters`)
    } else if (new Set(value).size < MIN_SECRET_DISTINCT_CHARS) {
      problems.push(`${name} has too few distinct characters to be random`)
    }
  }
  if (secrets.JWT_SECRET && secrets.JWT_SECRET === secrets.COOKIE_SECRET) {
    problems.push('JWT_SECRET and COOKIE_SECRET are the same value')
  }

  if (problems.length) {
    throw new Error(
      `Refusing to start with NODE_ENV=${process.env.NODE_ENV || '(unset)'}: ${problems.join('; ')}. ` +
        'Set real values, or use NODE_ENV=development locally.'
    )
  }
}

assertDeployedConfig()

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: backendUrl
    ? [
        {
          resolve: "@medusajs/medusa/file",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/file-local",
                id: "local",
                options: {
                  upload_dir: "static",
                  backend_url: `${backendUrl}/static`,
                },
              },
            ],
          },
        },
      ]
    : [],
})
