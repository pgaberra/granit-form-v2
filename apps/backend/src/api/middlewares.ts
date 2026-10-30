import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostStoneItemSchema } from "./store/carts/[id]/stone-items/validators"

export default defineMiddlewares({
  routes: [
    // The product index declares filterable `status` and `sales_channel_ids`, so
    // the route narrows it to published products in the key's sales channels.
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ["POST"],
      matcher: "/store/carts/:id/stone-items",
      middlewares: [validateAndTransformBody(PostStoneItemSchema)],
    },
  ],
})
