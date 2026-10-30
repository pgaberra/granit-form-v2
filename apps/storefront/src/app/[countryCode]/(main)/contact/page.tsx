import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { PlaceholderNotice, PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Så kontaktar du ${STORE_NAME}.`,
}

export default function ContactPage() {
  return (
    <PolicyPage title="Kontakt">
      <PlaceholderNotice />
      <p>
        Frågor om en beställning, frakt eller retur? Kontakta kundtjänst och ange ditt ordernummer.
      </p>
    </PolicyPage>
  )
}
