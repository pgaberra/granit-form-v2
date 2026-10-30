import {
  billableAreaM2,
  isStoneProduct,
  readStoneLimits,
  stoneUnitPrice,
  validateStoneDimensions,
} from "../stone-pricing"

const limits = {
  min_length_mm: 300,
  max_length_mm: 3200,
  min_depth_mm: 200,
  max_depth_mm: 1300,
}

describe("stone pricing", () => {
  it("prices a piece by its area", () => {
    // 2400 x 620 mm = 1.488 m2
    expect(billableAreaM2({ length_mm: 2400, depth_mm: 620 })).toBeCloseTo(1.488)
    expect(stoneUnitPrice(3995, { length_mm: 2400, depth_mm: 620 })).toBe(5945)
  })

  it("bills small pieces as the minimum area", () => {
    expect(billableAreaM2({ length_mm: 300, depth_mm: 200 })).toBe(0.25)
    expect(stoneUnitPrice(4000, { length_mm: 300, depth_mm: 200 })).toBe(1000)
  })

  it("rejects dimensions outside the product's limits", () => {
    expect(() =>
      validateStoneDimensions({ length_mm: 3300, depth_mm: 600 }, limits)
    ).toThrow("Length must be between 300 and 3200 mm")
    expect(() =>
      validateStoneDimensions({ length_mm: 1000, depth_mm: 100 }, limits)
    ).toThrow("Depth must be between 200 and 1300 mm")
    expect(() =>
      validateStoneDimensions({ length_mm: 1000.5, depth_mm: 600 }, limits)
    ).toThrow("whole millimetres")
    expect(() =>
      validateStoneDimensions({ length_mm: 2400, depth_mm: 620 }, limits)
    ).not.toThrow()
  })

  it("reads limits from product metadata", () => {
    expect(readStoneLimits({ ...limits, pricing_mode: "per_m2" })).toEqual(limits)
    expect(() => readStoneLimits({ min_length_mm: 300 })).toThrow("max_length_mm")
  })

  it("detects stone products", () => {
    expect(isStoneProduct({ pricing_mode: "per_m2" })).toBe(true)
    expect(isStoneProduct({})).toBe(false)
    expect(isStoneProduct(null)).toBe(false)
  })
})
