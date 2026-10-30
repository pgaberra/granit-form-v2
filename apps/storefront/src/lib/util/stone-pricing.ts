// Client-side mirror of apps/backend/src/lib/stone-pricing.ts, used only to
// preview the price. The backend computes the price that ends up in the cart.

export type StoneLimits = {
  min_length_mm: number
  max_length_mm: number
  min_depth_mm: number
  max_depth_mm: number
}

const MIN_BILLABLE_AREA_M2 = 0.25

export function getStoneLimits(
  metadata: Record<string, unknown> | null | undefined
): StoneLimits | null {
  if (metadata?.pricing_mode !== "per_m2") {
    return null
  }
  return {
    min_length_mm: Number(metadata.min_length_mm),
    max_length_mm: Number(metadata.max_length_mm),
    min_depth_mm: Number(metadata.min_depth_mm),
    max_depth_mm: Number(metadata.max_depth_mm),
  }
}

export function stoneDimensionError(
  length_mm: number,
  depth_mm: number,
  limits: StoneLimits
): string | null {
  if (!Number.isInteger(length_mm) || !Number.isInteger(depth_mm)) {
    return "Ange mått i hela millimeter"
  }
  if (length_mm < limits.min_length_mm || length_mm > limits.max_length_mm) {
    return `Längden ska vara ${limits.min_length_mm}–${limits.max_length_mm} mm`
  }
  if (depth_mm < limits.min_depth_mm || depth_mm > limits.max_depth_mm) {
    return `Djupet ska vara ${limits.min_depth_mm}–${limits.max_depth_mm} mm`
  }
  return null
}

export function stoneAreaM2(length_mm: number, depth_mm: number) {
  return Math.max((length_mm * depth_mm) / 1_000_000, MIN_BILLABLE_AREA_M2)
}

export function stonePrice(pricePerM2: number, length_mm: number, depth_mm: number) {
  return Math.round(pricePerM2 * stoneAreaM2(length_mm, depth_mm))
}

/** Dimensions stored on a line item by the backend's add-stone-item-to-cart workflow. */
export function stoneLineItemDimensions(
  metadata: Record<string, unknown> | null | undefined
) {
  const length = Number(metadata?.length_mm)
  const depth = Number(metadata?.depth_mm)
  return length > 0 && depth > 0 ? { length_mm: length, depth_mm: depth } : null
}
