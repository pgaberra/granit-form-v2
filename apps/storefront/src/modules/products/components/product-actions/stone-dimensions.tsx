"use client"

import { convertToLocale } from "@lib/util/money"
import {
  StoneLimits,
  stoneAreaM2,
  stoneDimensionError,
  stonePrice,
} from "@lib/util/stone-pricing"
import { HttpTypes } from "@medusajs/types"
import { Label } from "@modules/common/components/ui"

type StoneDimensionsProps = {
  limits: StoneLimits
  variant: HttpTypes.StoreProductVariant | undefined
  lengthMm: string
  depthMm: string
  onLengthChange: (value: string) => void
  onDepthChange: (value: string) => void
  disabled?: boolean
}

const inputClassName =
  "mt-1 h-10 w-full rounded-rounded border border-ui-border-base bg-ui-bg-field px-3 txt-medium focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"

export default function StoneDimensions({
  limits,
  variant,
  lengthMm,
  depthMm,
  onLengthChange,
  onDepthChange,
  disabled,
}: StoneDimensionsProps) {
  const length = Number(lengthMm)
  const depth = Number(depthMm)
  const hasInput = lengthMm !== "" && depthMm !== ""
  const error = hasInput ? stoneDimensionError(length, depth, limits) : null
  const pricePerM2 = variant?.calculated_price?.calculated_amount
  const currency = variant?.calculated_price?.currency_code ?? "sek"
  const format = (amount: number) =>
    convertToLocale({ amount, currency_code: currency, locale: "sv-SE" })

  return (
    <div className="flex flex-col gap-y-3" data-testid="stone-dimensions">
      <div className="grid grid-cols-2 gap-x-3">
        <Label className="txt-compact-small-plus">
          Längd (mm)
          <input
            type="number"
            inputMode="numeric"
            name="length_mm"
            min={limits.min_length_mm}
            max={limits.max_length_mm}
            step={1}
            required
            value={lengthMm}
            onChange={(e) => onLengthChange(e.target.value)}
            disabled={disabled}
            className={inputClassName}
          />
        </Label>
        <Label className="txt-compact-small-plus">
          Djup (mm)
          <input
            type="number"
            inputMode="numeric"
            name="depth_mm"
            min={limits.min_depth_mm}
            max={limits.max_depth_mm}
            step={1}
            required
            value={depthMm}
            onChange={(e) => onDepthChange(e.target.value)}
            disabled={disabled}
            className={inputClassName}
          />
        </Label>
      </div>
      <p className="txt-small text-ui-fg-subtle">
        Längd {limits.min_length_mm}–{limits.max_length_mm} mm, djup{" "}
        {limits.min_depth_mm}–{limits.max_depth_mm} mm.
        {pricePerM2 != null && ` ${format(pricePerM2)} per m² inkl. moms.`}
      </p>
      {error && (
        <p className="txt-small text-ui-fg-error" role="alert">
          {error}
        </p>
      )}
      {hasInput && !error && pricePerM2 != null && (
        <p className="txt-medium-plus" data-testid="stone-price">
          {stoneAreaM2(length, depth).toLocaleString("sv-SE", {
            maximumFractionDigits: 3,
          })}{" "}
          m² = {format(stonePrice(pricePerM2, length, depth))}
        </p>
      )}
    </div>
  )
}
