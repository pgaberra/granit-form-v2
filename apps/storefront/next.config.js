const path = require("path")
const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME

const isDev = process.env.NODE_ENV !== "production"

// The browser calls the backend directly (search, filters), so it belongs in connect-src.
// Headers are computed at build time, so this must be set when building. An invalid URL
// throws here rather than leaving the backend out of the policy.
const backendOrigin = new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL).origin

const csp = (directives) =>
  Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(" "))
    .join("; ")

// Enforced now: these break nothing the storefront does.
const enforcedCsp = csp({
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
})

// Report-only until real checkout traffic shows it clean; enforcing it unverified can
// silently stop the Adyen or Stripe checkout from loading. Next.js hydration needs
// inline scripts ('unsafe-inline') until nonces are introduced.
const reportOnlyCsp = csp({
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://*.adyen.com",
    "https://js.stripe.com",
    "https://*.js.stripe.com",
    "https://pay.google.com",
    "https://applepay.cdn-apple.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'", "https://*.adyen.com"],
  // Product images come from the backend (plain http in local dev) or an S3 bucket.
  "img-src": ["'self'", backendOrigin, "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    backendOrigin,
    ...(isDev ? ["ws:"] : []),
    "https://*.adyen.com",
    "https://api.stripe.com",
    "https://pay.google.com",
  ],
  // 3-D Secure challenges load the card issuer's page, which can be any https origin.
  "frame-src": ["'self'", "https:"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  // No form-action on purpose: Adyen's 3-D Secure and redirect actions post a form from
  // this page to the issuer or Adyen, and form-action does not fall back to default-src.
})

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // payment is left alone: Apple Pay and Google Pay use the Payment Request API.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Sent unconditionally: behind a TLS-terminating proxy the app sees plain http.
  // Browsers ignore it on http://localhost. No includeSubDomains until the domain layout
  // is settled; see DECISIONS.md.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy", value: enforcedCsp },
  { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Self-contained server for the Docker image; tracing starts at the monorepo root so
  // hoisted workspace dependencies are included.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Link", value: '</.well-known/ucp>; rel="ucp"' },
          ...securityHeaders,
        ],
      },
      {
        source: "/:countryCode/products/:handle",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:countryCode/products/:handle([^/.]+).md",
          destination: "/:countryCode/products/:handle/markdown",
        },
        {
          source: "/:countryCode/products/:handle([^/.]+)",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/:countryCode/products/:handle/markdown",
        },
      ],
    }
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
