import { Metadata } from "next"

import { STORE_NAME } from "@lib/util/site"
import { PlaceholderNotice, PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Villkor",
  description: `Villkor som gäller för köp från ${STORE_NAME}.`,
}

export default function TermsPage() {
  return (
    <PolicyPage title="Villkor">
      <PlaceholderNotice />
      <p>
        När du lägger en beställning hos {STORE_NAME} godkänner du dessa villkor. Priser, tillgänglighet och fraktalternativ visas på produktsidorna och i kassan och kan ändras utan förvarning.
      </p>
      <p>
        Beställningar bekräftas via e-post när betalningen har tagits emot. Returer och återbetalningar hanteras enligt vår returpolicy.
      </p>
    </PolicyPage>
  )
}
