import { stoneLineItemDimensions } from "@lib/util/stone-pricing"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  /** Line item metadata; made-to-measure items carry their dimensions here. */
  metadata?: Record<string, unknown> | null
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  metadata,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const dimensions = stoneLineItemDimensions(metadata)

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      Variant: {variant?.title}
      {dimensions &&
        `, ${dimensions.length_mm} × ${dimensions.depth_mm} mm`}
    </Text>
  )
}

export default LineItemOptions
