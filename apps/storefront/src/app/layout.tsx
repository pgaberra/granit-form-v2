import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter, Jost } from "next/font/google"
import "styles/globals.css"

// Self-hosted by next/font, so visitors' browsers never contact Google.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
// Geometric sans close to the granit&form wordmark, for headings.
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" })

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="sv"
      data-mode="light"
      className={`${inter.variable} ${jost.variable}`}
    >
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      <body className="bg-stone-50 text-granite-900">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
