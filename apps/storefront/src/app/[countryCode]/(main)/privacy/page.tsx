import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { PlaceholderNotice, PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: `Så samlar ${STORE_NAME} in och använder personuppgifter.`,
}

export default function PrivacyPage() {
  return (
    <PolicyPage title="Integritetspolicy">
      <PlaceholderNotice />
      <p>
        {STORE_NAME} samlar in de uppgifter du lämnar i kassan, till exempel namn, e-postadress och leveransadress, för att kunna hantera och leverera din beställning.
      </p>
      <p>
        Betaluppgifter hanteras av vår betalleverantör och sparas inte av butiken. Cookies används för att spara din varukorg och din inloggning.
      </p>
    </PolicyPage>
  )
}
