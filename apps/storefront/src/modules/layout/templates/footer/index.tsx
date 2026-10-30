import { listCategories } from "@lib/data/categories"
import { Text } from "@modules/common/components/ui"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const customerServiceLinks = [
  { href: "/shipping", label: "Leverans" },
  { href: "/returns", label: "Retur och ångerrätt" },
  { href: "/terms", label: "Köpvillkor" },
  { href: "/privacy", label: "Integritetspolicy" },
  { href: "/contact", label: "Kontakt" },
]

export default async function Footer() {
  const productCategories = await listCategories({
    fields: "id,name,handle,parent_category_id",
  })
  const topLevelCategories = (productCategories ?? []).filter(
    (c) => !c.parent_category_id
  )

  return (
    <footer className="border-t border-stone-200 bg-stone-100 w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 small:flex-row items-start justify-between py-16 small:py-24">
          <div className="flex flex-col gap-y-4 max-w-xs">
            <LocalizedClientLink href="/" aria-label="granit&form, till startsidan">
              <Image
                src="/brand/logo-tagline.png"
                alt="granit&form, vi skräddarsyr i sten"
                width={152}
                height={95}
                className="h-20 w-auto"
              />
            </LocalizedClientLink>
            <Text className="txt-small text-granite-700">
              Bänkskivor, fönsterbänkar och detaljer i natursten, tillverkade
              efter dina mått i vår verkstad i Jämtland.
            </Text>
          </div>
          <div className="text-small-regular gap-10 small:gap-x-16 grid grid-cols-2">
            {topLevelCategories.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <span className="txt-small-plus text-granite-900">
                  Sortiment
                </span>
                <ul
                  className="grid grid-cols-1 gap-2 text-granite-700 txt-small"
                  data-testid="footer-categories"
                >
                  {topLevelCategories.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-granite-900"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-3">
              <span className="txt-small-plus text-granite-900">
                Kundservice
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-granite-700 txt-small">
                {customerServiceLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink
                      className="hover:text-granite-900"
                      href={link.href}
                    >
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full py-8 border-t border-stone-200 text-granite-500">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} granit&form. Alla priser inkl. moms.
          </Text>
        </div>
      </div>
    </footer>
  )
}
