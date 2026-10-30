import { Metadata } from "next"

import { getStorePolicies } from "@lib/data/store-policies"
import {
  PoliciesUnavailable,
  PolicyPage,
  ShippingSummary,
} from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Fraktinformation",
  description: "Fraktkostnader och leveranstider.",
}

export default async function ShippingPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { current, currencyCode } = await getStorePolicies(countryCode)

  return (
    <PolicyPage title="Fraktinformation">
      {current ? (
        <>
          <p>
            Beställningar till {countryCode.toUpperCase()} skickas med följande kostnader och leveranstider.
          </p>
          <ShippingSummary policies={current} currencyCode={currencyCode} />
          <p className="text-ui-fg-subtle">
            Tillgängliga fraktsätt och slutlig kostnad visas i kassan.
          </p>
        </>
      ) : (
        <PoliciesUnavailable />
      )}
    </PolicyPage>
  )
}
