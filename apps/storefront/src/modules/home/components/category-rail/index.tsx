import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

/** Home page rail of one product category (the store has no collections). */
export default async function CategoryRail({
  category,
  region,
}: {
  category: HttpTypes.StoreProductCategory
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      category_id: [category.id],
      limit: 3,
    },
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <div className="flex justify-between items-baseline mb-8">
        <h2 className="font-display text-2xl small:text-3xl">{category.name}</h2>
        <InteractiveLink href={`/categories/${category.handle}`}>
          Visa alla
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
