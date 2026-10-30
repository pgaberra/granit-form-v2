import { Metadata } from "next"

import { getStorePolicies } from "@lib/data/store-policies"
import {
  PlaceholderNotice,
  PoliciesUnavailable,
  PolicyPage,
} from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "Returpolicy",
  description: "Så här returnerar du varor och får pengarna tillbaka.",
}

export default async function ReturnsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { current } = await getStorePolicies(countryCode)

  return (
    <PolicyPage title="Returpolicy">
      <PlaceholderNotice />
      {current ? (
        <>
          <p>
            Lagervaror kan du returnera inom {current.returnWindowDays} dagar efter leverans. Varor som tillverkas efter dina mått omfattas inte av ångerrätten.
          </p>
          <p>
            {current.freeReturns
              ? "Returfrakten är gratis."
              : "Du betalar returfrakten."}
          </p>
        </>
      ) : (
        <PoliciesUnavailable />
      )}
    </PolicyPage>
  )
}
