import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { UCP_MCP_PATH, UCP_REST_BASE_PATH } from "@lib/ucp/ucp"
import {
  getDefaultCountryCode,
  getRequestOrigin,
  listCountryCodes,
  STORE_NAME,
} from "@lib/util/site"

export async function GET(request: Request) {
  const origin = getRequestOrigin(request)

  const [regions, categories, { collections }] = await Promise.all([
    listRegions(),
    listCategories({ fields: "name,handle,parent_category_id", limit: 50 }),
    listCollections({ fields: "title,handle", limit: "50" }),
  ])

  const countries = listCountryCodes(regions)
  const base = `${origin}/${getDefaultCountryCode(regions)}`
  const currencies = Array.from(
    new Set(regions.map((r) => r.currency_code?.toUpperCase()).filter(Boolean))
  )

  const links = [
    ...categories
      .filter((c) => !c.parent_category_id)
      .map((c) => `- [${c.name}](${base}/categories/${c.handle})`),
    ...collections.map((c) => `- [${c.title}](${base}/collections/${c.handle})`),
  ]

  const body = `# ${STORE_NAME}

> Webbutik för måttanpassade stenskivor. Levererar till ${countries.length} länder. Priser i ${currencies.join(", ")}, inklusive moms.

Webbadresser inleds med en landskod på två bokstäver som styr valuta och priser, till exempel \`${base}\`. Tillgängliga landskoder: ${countries.join(", ")}.

## Butik
- [Alla produkter](${base}/store)
${links.join("\n")}
- Sök: ${base}/search?q={query}

## Köpa
- Produktsidor har ett formulär för att lägga i varukorgen som skickar \`variant_id\` och \`quantity\` till ${base}/cart/add.
- Förvälj en variant med \`?v_id={variant_id}\` på en produktadress.
- Lägg till \`.md\` på en produktadress (eller skicka \`Accept: text/markdown\`) för en Markdown-version med variant-ID, priser och lagersaldo.
- Länk till kassan: ${origin}/buy/{variant_id}:{quantity},{variant_id}:{quantity}
- [Varukorg](${base}/cart)

## Villkor
- [Leveransinformation](${base}/shipping)
- [Returpolicy](${base}/returns)
- [Köpvillkor](${base}/terms)
- [Integritetspolicy](${base}/privacy)
- [Kontakt](${base}/contact)

## För agenter
- [Webbplatskarta](${origin}/sitemap.xml)
- [UCP-profil](${origin}/.well-known/ucp)
- UCP MCP-endpoint: ${origin}${UCP_MCP_PATH}
- UCP REST-endpoint: ${origin}${UCP_REST_BASE_PATH}
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
