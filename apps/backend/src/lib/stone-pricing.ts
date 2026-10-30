import { MedusaError } from "@medusajs/framework/utils"

/**
 * Made-to-measure stone products are priced per square metre. The variant's
 * regular price is the price per m², and the product's metadata opts it in and
 * sets the dimension limits the workshop can cut.
 */
export const STONE_PRICING_MODE = "per_m2"

export type StoneDimensionLimits = {
  min_length_mm: number
  max_length_mm: number
  min_depth_mm: number
  max_depth_mm: number
}

export type StoneDimensions = {
  length_mm: number
  depth_mm: number
}

/** Pieces smaller than this are still billed as this area (cutting and handling cost). */
export const MIN_BILLABLE_AREA_M2 = 0.25

export function isStoneProduct(metadata: Record<string, unknown> | null | undefined) {
  return metadata?.pricing_mode === STONE_PRICING_MODE
}

export function readStoneLimits(
  metadata: Record<string, unknown> | null | undefined
): StoneDimensionLimits {
  const read = (key: keyof StoneDimensionLimits) => {
    const value = Number(metadata?.[key])
    if (!Number.isFinite(value) || value <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Stone product is missing a valid "${key}" in its metadata`
      )
    }
    return value
  }

  return {
    min_length_mm: read("min_length_mm"),
    max_length_mm: read("max_length_mm"),
    min_depth_mm: read("min_depth_mm"),
    max_depth_mm: read("max_depth_mm"),
  }
}

export function validateStoneDimensions(
  dimensions: StoneDimensions,
  limits: StoneDimensionLimits
) {
  const { length_mm, depth_mm } = dimensions
  if (!Number.isInteger(length_mm) || !Number.isInteger(depth_mm)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Dimensions must be whole millimetres"
    )
  }
  if (length_mm < limits.min_length_mm || length_mm > limits.max_length_mm) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Length must be between ${limits.min_length_mm} and ${limits.max_length_mm} mm`
    )
  }
  if (depth_mm < limits.min_depth_mm || depth_mm > limits.max_depth_mm) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Depth must be between ${limits.min_depth_mm} and ${limits.max_depth_mm} mm`
    )
  }
}

export function billableAreaM2({ length_mm, depth_mm }: StoneDimensions) {
  return Math.max((length_mm * depth_mm) / 1_000_000, MIN_BILLABLE_AREA_M2)
}

/** Unit price for one piece, rounded to whole currency units (öre are not used for SEK prices). */
export function stoneUnitPrice(pricePerM2: number, dimensions: StoneDimensions) {
  return Math.round(pricePerM2 * billableAreaM2(dimensions))
}
