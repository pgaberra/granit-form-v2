import { convertToLocale } from "@lib/util/money"
import { formatDayRange, StorePolicies } from "@lib/util/store-policies"

export const formatShippingRate = (rate: number, currencyCode: string) =>
  rate === 0 ? "Fri frakt" : convertToLocale({ amount: rate, currency_code: currencyCode })

export const PolicyPage = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="content-container py-12 max-w-3xl" data-testid="policy-page">
    <h1 className="text-2xl-semi mb-8">{title}</h1>
    <div className="flex flex-col gap-6 text-base-regular text-ui-fg-base">
      {children}
    </div>
  </div>
)

export const PoliciesUnavailable = () => (
  <p className="text-ui-fg-subtle">
    Information för den här regionen har inte publicerats ännu.
  </p>
)

export const ShippingSummary = ({
  policies,
  currencyCode,
}: {
  policies: StorePolicies
  currencyCode: string
}) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
    <dt className="text-ui-fg-subtle">Fraktkostnad</dt>
    <dd>{formatShippingRate(policies.shippingRate, currencyCode)}</dd>
    <dt className="text-ui-fg-subtle">Hanteringstid</dt>
    <dd>{formatDayRange(policies.handlingDays)} arbetsdagar</dd>
    <dt className="text-ui-fg-subtle">Leveranstid</dt>
    <dd>{formatDayRange(policies.transitDays)} arbetsdagar efter avsändning</dd>
  </dl>
)

export const PlaceholderNotice = () => (
  <p className="text-ui-fg-subtle" data-testid="policy-placeholder">
    Det här är platshållartext. Ersätt den med butikens egen text innan lansering.
  </p>
)
