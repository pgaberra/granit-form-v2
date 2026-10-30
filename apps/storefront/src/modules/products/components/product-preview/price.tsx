import { Text, clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({
  price,
  perM2,
}: {
  price: VariantPrice
  /** Made-to-measure products: the variant price is per m², not per piece. */
  perM2?: boolean
}) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {perM2 ? `${price.original_price}/m²` : price.original_price}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted whitespace-nowrap", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {perM2
          ? `från ${price.calculated_price}/m²`
          : price.calculated_price}
      </Text>
    </>
  )
}
