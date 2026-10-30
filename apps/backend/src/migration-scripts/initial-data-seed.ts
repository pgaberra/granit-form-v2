import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { DEFAULT_REGION_STORE_POLICIES } from "../lib/region-store-policies"
import { STONE_PRICING_MODE } from "../lib/stone-pricing"

/**
 * Initial store setup: one Swedish region (SEK, prices incl. 25 % moms), a
 * workshop stock location in Jämtland, pickup + freight delivery, and a few
 * example products. Made-to-measure products are priced per m² (see
 * src/lib/stone-pricing.ts); their variant price is the price per m².
 *
 * Product names, prices and limits are placeholders until the real catalogue is in.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  logger.info("Seeding store data...")
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [{ name: "Webbshop", description: "Webbutiken" }],
    },
  })

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        { title: "Storefront", type: "publishable", created_by: "" },
      ],
    },
  })

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [defaultSalesChannel.id] },
  })

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Granit Form",
          // Product prices are set per currency, so the currency (not just the
          // region) must be marked tax-inclusive for prices to include moms.
          supported_currencies: [
            { currency_code: "sek", is_default: true, is_tax_inclusive: true },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  })

  logger.info("Seeding region data...")
  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Sverige",
          currency_code: "sek",
          countries: ["se"],
          payment_providers: ["pp_system_default"],
          // Swedish consumer prices are shown and entered including VAT.
          is_tax_inclusive: true,
          metadata: {
            ...DEFAULT_REGION_STORE_POLICIES,
            return_window_days: 14,
            shipping_rate: 0,
            handling_days_min: 10,
            handling_days_max: 15,
            transit_days_min: 1,
            transit_days_max: 5,
          },
        },
      ],
    },
  })

  await createTaxRegionsWorkflow(container).run({
    input: [
      {
        country_code: "se",
        provider_id: "tp_system",
        default_tax_rate: { rate: 25, code: "moms", name: "Moms" },
      },
    ],
  })

  logger.info("Seeding stock location data...")
  const {
    result: [stockLocation],
  } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Verkstaden",
          address: {
            city: "Östersund",
            country_code: "SE",
            address_1: "",
          },
        },
      ],
    },
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  logger.info("Seeding fulfillment data...")
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfileResult[0]

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Leverans Sverige",
    type: "shipping",
    service_zones: [
      {
        name: "Sverige",
        geo_zones: [{ country_code: "se", type: "country" }],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  const storeShippingRules = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ]

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Hämtas i verkstaden",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Hämta själv",
          description: "Hämtas i verkstaden i Östersund.",
          code: "pickup",
        },
        prices: [
          { currency_code: "sek", amount: 0 },
          { region_id: region.id, amount: 0 },
        ],
        rules: storeShippingRules,
      },
      {
        name: "Fraktleverans",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Frakt",
          description: "Levereras med fraktbolag till kantsten.",
          code: "freight",
        },
        // Whole kronor incl. moms (the lint rule flags 1495 as a likely öre value).
        prices: [
          { currency_code: "sek", amount: 1495 },
          { region_id: region.id, amount: 1495 },
        ],
        rules: storeShippingRules,
      },
    ],
  })
  logger.info("Finished seeding fulfillment data.")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
  })
  logger.info("Finished seeding stock location data.")

  logger.info("Seeding product data...")
  const { result: categories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Bänkskivor", handle: "bankskivor", is_active: true },
        { name: "Fönsterbänkar", handle: "fonsterbankar", is_active: true },
        { name: "Tillbehör", handle: "tillbehor", is_active: true },
      ],
    },
  })
  const categoryId = (handle: string) =>
    categories.find((c) => c.handle === handle)!.id

  const {
    result: [thicknessOption],
  } = await createProductOptionsWorkflow(container).run({
    input: {
      product_options: [{ title: "Tjocklek", values: ["20 mm", "30 mm"] }],
    },
  })

  const countertopLimits = {
    min_length_mm: 300,
    max_length_mm: 3200,
    min_depth_mm: 200,
    max_depth_mm: 1300,
  }
  const sillLimits = {
    min_length_mm: 300,
    max_length_mm: 2500,
    min_depth_mm: 100,
    max_depth_mm: 400,
  }

  // Made-to-measure: priced per m², cut to order, so no stock tracking.
  const perM2Variants = (sku: string, price20: number, price30: number) => [
    {
      title: "20 mm",
      sku: `${sku}-20`,
      manage_inventory: false,
      options: { Tjocklek: "20 mm" },
      prices: [{ amount: price20, currency_code: "sek" }],
    },
    {
      title: "30 mm",
      sku: `${sku}-30`,
      manage_inventory: false,
      options: { Tjocklek: "30 mm" },
      prices: [{ amount: price30, currency_code: "sek" }],
    },
  ]

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Bänkskiva i granit – Nero Assoluto",
          handle: "bankskiva-nero-assoluto",
          description:
            "Svart granit med jämn, tät struktur. Tillverkas efter dina mått i vår verkstad i Jämtland. Pris per kvadratmeter.",
          category_ids: [categoryId("bankskivor")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: { pricing_mode: STONE_PRICING_MODE, ...countertopLimits },
          options: [{ id: thicknessOption.id }],
          variants: perM2Variants("NERO", 3995, 4995),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Bänkskiva i marmor – Bianco Carrara",
          handle: "bankskiva-bianco-carrara",
          description:
            "Vit marmor med grå ådring. Tillverkas efter dina mått. Pris per kvadratmeter.",
          category_ids: [categoryId("bankskivor")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: { pricing_mode: STONE_PRICING_MODE, ...countertopLimits },
          options: [{ id: thicknessOption.id }],
          variants: perM2Variants("CARRARA", 4595, 5795),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Fönsterbänk i kalksten – Jämtlandskalk",
          handle: "fonsterbank-jamtlandskalk",
          description:
            "Grå kalksten från Jämtland. Tillverkas efter dina mått. Pris per kvadratmeter.",
          category_ids: [categoryId("fonsterbankar")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          metadata: { pricing_mode: STONE_PRICING_MODE, ...sillLimits },
          options: [{ id: thicknessOption.id }],
          variants: perM2Variants("KALK", 2995, 3695),
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "Skärbräda i granit",
          handle: "skarbrada-granit",
          description: "Skärbräda i svart granit, 40 × 30 cm. Lagervara.",
          category_ids: [categoryId("tillbehor")],
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          weight: 5000,
          options: [{ title: "Storlek", values: ["40 × 30 cm"] }],
          variants: [
            {
              title: "40 × 30 cm",
              sku: "SKARBRADA-40",
              options: { Storlek: "40 × 30 cm" },
              prices: [{ amount: 495, currency_code: "sek" }],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  })
  logger.info("Finished seeding product data.")

  logger.info("Seeding inventory levels.")
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 25,
        inventory_item_id: item.id,
      })),
    },
  })
  logger.info("Finished seeding inventory levels data.")
}
