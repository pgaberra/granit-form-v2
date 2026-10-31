import { MedusaError, QueryContext } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  addToCartWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import {
  isStoneProduct,
  readStoneLimits,
  stoneUnitPrice,
  validateStoneDimensions,
} from "../lib/stone-pricing"

export type AddStoneItemToCartInput = {
  cart_id: string
  variant_id: string
  quantity: number
  length_mm: number
  depth_mm: number
}

type PrepareStoneLineItemInput = AddStoneItemToCartInput & {
  sales_channel_id?: string | null
  variant: {
    id: string
    product?: {
      status?: string
      metadata?: Record<string, unknown> | null
      sales_channels?: ({ id: string } | null)[] | null
    } | null
    calculated_price?: {
      calculated_amount?: number | null
      is_calculated_price_tax_inclusive?: boolean
    } | null
  }
}

const prepareStoneLineItemStep = createStep(
  "prepare-stone-line-item",
  async (input: PrepareStoneLineItemInput) => {
    const { variant, length_mm, depth_mm } = input
    const metadata = variant.product?.metadata

    // The variant is looked up by id alone, so check what the store API would
    // otherwise enforce: a published product in the cart's sales channel.
    const inCartChannel = variant.product?.sales_channels?.some(
      (channel) => channel?.id === input.sales_channel_id
    )
    if (variant.product?.status !== "published" || !inCartChannel) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Variant ${variant.id} is not available in this store`
      )
    }

    if (!isStoneProduct(metadata)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Variant ${variant.id} is not sold per square metre`
      )
    }
    validateStoneDimensions({ length_mm, depth_mm }, readStoneLimits(metadata))

    const pricePerM2 = variant.calculated_price?.calculated_amount
    if (pricePerM2 === null || pricePerM2 === undefined) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Variant ${variant.id} has no price in the cart's currency`
      )
    }

    return new StepResponse({
      variant_id: variant.id,
      quantity: input.quantity,
      unit_price: stoneUnitPrice(pricePerM2, { length_mm, depth_mm }),
      is_tax_inclusive:
        variant.calculated_price?.is_calculated_price_tax_inclusive ?? false,
      // Same dimensions merge into one line; different dimensions stay separate.
      metadata: {
        length_mm,
        depth_mm,
        price_per_m2: pricePerM2,
      },
    })
  }
)

/**
 * Adds a made-to-measure stone piece to the cart. The price is computed on the
 * server from the variant's price per m² and the requested dimensions, so the
 * storefront can't set its own price.
 */
export const addStoneItemToCartWorkflow = createWorkflow(
  "add-stone-item-to-cart",
  (input: AddStoneItemToCartInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "region_id", "currency_code", "sales_channel_id"],
      filters: { id: input.cart_id },
      options: { throwIfKeyNotFound: true },
    }).config({ name: "retrieve-cart" })

    const { data: variants } = useQueryGraphStep({
      entity: "variant",
      fields: [
        "id",
        "product.status",
        "product.metadata",
        "product.sales_channels.id",
        "calculated_price.*",
      ],
      filters: { id: input.variant_id },
      options: { throwIfKeyNotFound: true },
      context: {
        calculated_price: QueryContext({
          region_id: carts[0].region_id,
          currency_code: carts[0].currency_code,
        }),
      },
    }).config({ name: "retrieve-variant" })

    const prepareInput = transform(
      { input, variants, carts },
      ({ input, variants, carts }) => ({
        ...input,
        sales_channel_id: carts[0].sales_channel_id,
        variant: variants[0],
      })
    )
    const item = prepareStoneLineItemStep(prepareInput)

    const addInput = transform({ input, item }, ({ input, item }) => ({
      cart_id: input.cart_id,
      items: [item],
    }))
    addToCartWorkflow.runAsStep({ input: addInput })

    const { data: updatedCarts } = useQueryGraphStep({
      entity: "cart",
      fields: ["id", "items.*", "total", "subtotal", "tax_total"],
      filters: { id: input.cart_id },
    }).config({ name: "refetch-cart" })

    const cart = transform({ updatedCarts }, ({ updatedCarts }) => updatedCarts[0])

    return new WorkflowResponse(cart)
  }
)
