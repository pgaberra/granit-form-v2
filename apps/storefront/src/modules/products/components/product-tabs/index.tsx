"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const tabs = [
    {
      label: "Produktinformation",
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Leverans och retur",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Ursprungsland</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Typ</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Vikt</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Mått</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length} x ${product.width} x ${product.height}`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Frakt eller hämtning</span>
            <p className="max-w-sm">
              Levereras med fraktbolag, eller hämtas i vår verkstad i Jämtland.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Tillverkas efter dina mått</span>
            <p className="max-w-sm">
              Måttbeställda skivor omfattas inte av ångerrätten, så dubbelkolla dina mått.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Ångerrätt på lagervaror</span>
            <p className="max-w-sm">
              Lagervaror har minst 14 dagars ångerrätt. Läs mer i vår{" "}
              <LocalizedClientLink href="/returns" className="underline">
                returpolicy
              </LocalizedClientLink>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
