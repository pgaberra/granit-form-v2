import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { isStoneProduct } from "../../lib/stone-pricing"

/**
 * Made-to-measure variants are priced per m², so their regular price is not a
 * valid line item price. The built-in add-to-cart route (which can't set
 * unit_price) must not add them; they go through POST /store/carts/:id/stone-items,
 * which sets the computed price.
 */
addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const unpricedVariantIds = (input.items ?? [])
    .filter((item) => item.variant_id && item.unit_price == null)
    .map((item) => item.variant_id!)

  if (!unpricedVariantIds.length) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "product.metadata"],
    filters: { id: unpricedVariantIds },
  })

  const stoneVariant = variants.find((v) => isStoneProduct(v.product?.metadata))
  if (stoneVariant) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Variant ${stoneVariant.id} is made to measure; add it with its dimensions`
    )
  }
})
