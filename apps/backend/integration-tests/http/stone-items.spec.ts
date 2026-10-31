import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

jest.setTimeout(120 * 1000)

const PRICE_PER_M2 = 3995

const STONE_METADATA = {
  pricing_mode: "per_m2",
  min_length_mm: 300,
  max_length_mm: 3200,
  min_depth_mm: 200,
  max_depth_mm: 1300,
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("POST /store/carts/:id/stone-items", () => {
      let headers: Record<string, string>
      let cartId: string
      let variantId: string
      let otherChannelId: string
      let createVariant: (product: Record<string, unknown>) => Promise<string>

      const addStone = (body: Record<string, unknown>, id = cartId) =>
        api
          .post(`/store/carts/${id}/stone-items`, body, { headers })
          .catch((e) => e.response)

      beforeEach(async () => {
        const container = getContainer()

        const {
          result: [salesChannel, otherChannel],
        } = await createSalesChannelsWorkflow(container).run({
          input: { salesChannelsData: [{ name: "Webshop" }, { name: "Annan kanal" }] },
        })

        const {
          result: [apiKey],
        } = await createApiKeysWorkflow(container).run({
          input: {
            api_keys: [{ title: "Test", type: "publishable", created_by: "test" }],
          },
        })
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: { id: apiKey.id, add: [salesChannel.id] },
        })
        headers = { "x-publishable-api-key": apiKey.token }

        // As in the seed: Swedish prices are entered including moms, and the
        // preference has to be on the currency as well as the region.
        await container
          .resolve(Modules.PRICING)
          .createPricePreferences({
            attribute: "currency_code",
            value: "sek",
            is_tax_inclusive: true,
          })
        const {
          result: [region],
        } = await createRegionsWorkflow(container).run({
          input: {
            regions: [
              {
                name: "Sverige",
                currency_code: "sek",
                countries: ["se"],
                is_tax_inclusive: true,
              },
            ],
          },
        })

        otherChannelId = otherChannel.id
        let productCount = 0
        createVariant = async (product) => {
          productCount += 1
          const {
            result: [created],
          } = await createProductsWorkflow(container).run({
            input: {
              products: [
                {
                  title: "Bänkskiva i granit",
                  handle: `bankskiva-${productCount}`,
                  status: "published",
                  metadata: STONE_METADATA,
                  options: [{ title: "Tjocklek", values: ["20 mm"] }],
                  variants: [
                    {
                      title: "20 mm",
                      options: { Tjocklek: "20 mm" },
                      manage_inventory: false,
                      prices: [{ amount: PRICE_PER_M2, currency_code: "sek" }],
                    },
                  ],
                  sales_channels: [{ id: salesChannel.id }],
                  ...product,
                } as any,
              ],
            },
          })
          return created.variants[0].id
        }

        variantId = await createVariant({})

        const { data } = await api.post(
          "/store/carts",
          { region_id: region.id },
          { headers }
        )
        cartId = data.cart.id
      })

      it("prices the piece on the server from its area, including moms", async () => {
        const { status, data } = await addStone({
          variant_id: variantId,
          length_mm: 2400,
          depth_mm: 620,
        })

        expect(status).toEqual(200)
        expect(data.cart.items).toHaveLength(1)
        // 2400 x 620 mm = 1.488 m2 at 3 995 kr/m2
        expect(data.cart.items[0].unit_price).toEqual(5945)
        expect(data.cart.items[0].is_tax_inclusive).toBe(true)
        expect(data.cart.items[0].metadata).toMatchObject({
          length_mm: 2400,
          depth_mm: 620,
          price_per_m2: PRICE_PER_M2,
        })
      })

      it("bills a small piece as the minimum area", async () => {
        const { data } = await addStone({
          variant_id: variantId,
          length_mm: 300,
          depth_mm: 200,
        })

        // 0.06 m2 is billed as 0.25 m2
        expect(data.cart.items[0].unit_price).toEqual(999)
      })

      it("rejects a price sent by the client", async () => {
        const res = await addStone({
          variant_id: variantId,
          length_mm: 2400,
          depth_mm: 620,
          unit_price: 1,
        })

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("unit_price")
      })

      it.each([
        [{ length_mm: 3300, depth_mm: 620 }, "Length must be between"],
        [{ length_mm: 299, depth_mm: 620 }, "Length must be between"],
        [{ length_mm: 2400, depth_mm: 1301 }, "Depth must be between"],
        [{ length_mm: 2400, depth_mm: 199 }, "Depth must be between"],
      ])("rejects dimensions outside the limits: %o", async (dimensions, message) => {
        const res = await addStone({ variant_id: variantId, ...dimensions })

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain(message)
      })

      it.each([
        { quantity: 0 },
        { quantity: 21 },
        { length_mm: 2400.5 },
        { length_mm: -2400 },
      ])("rejects an invalid body: %o", async (override) => {
        const res = await addStone({
          variant_id: variantId,
          length_mm: 2400,
          depth_mm: 620,
          ...override,
        })

        expect(res.status).toEqual(400)
      })

      it("rejects a variant that is not sold per square metre", async () => {
        const plainVariantId = await createVariant({ metadata: {} })

        const res = await addStone({
          variant_id: plainVariantId,
          length_mm: 2400,
          depth_mm: 620,
        })

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("is not sold per square metre")
      })

      it("rejects an unpublished product", async () => {
        const draftVariantId = await createVariant({ status: "draft" })

        const res = await addStone({
          variant_id: draftVariantId,
          length_mm: 2400,
          depth_mm: 620,
        })

        expect(res.status).toEqual(404)
        expect(res.data.message).toContain("is not available in this store")
      })

      it("rejects a product from another sales channel", async () => {
        const otherVariantId = await createVariant({
          sales_channels: [{ id: otherChannelId }],
        })

        const res = await addStone({
          variant_id: otherVariantId,
          length_mm: 2400,
          depth_mm: 620,
        })

        expect(res.status).toEqual(404)
        expect(res.data.message).toContain("is not available in this store")
      })

      it("rejects an unknown cart", async () => {
        const res = await addStone(
          { variant_id: variantId, length_mm: 2400, depth_mm: 620 },
          "cart_does_not_exist"
        )

        expect(res.status).toEqual(404)
      })

      it("keeps the built-in add-to-cart route from adding it unpriced", async () => {
        const res = await api
          .post(
            `/store/carts/${cartId}/line-items`,
            { variant_id: variantId, quantity: 1 },
            { headers }
          )
          .catch((e) => e.response)

        expect(res.status).toEqual(400)
        expect(res.data.message).toContain("is made to measure")
      })
    })
  },
})
