import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addStoneItemToCartWorkflow } from "../../../../../workflows/add-stone-item-to-cart"
import { PostStoneItemSchemaType } from "./validators"

export async function POST(
  req: MedusaRequest<PostStoneItemSchemaType>,
  res: MedusaResponse
) {
  const { result: cart } = await addStoneItemToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      ...req.validatedBody,
    },
  })

  res.json({ cart })
}
