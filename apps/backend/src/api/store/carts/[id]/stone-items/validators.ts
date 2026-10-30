import { z } from "@medusajs/framework/zod"

export const PostStoneItemSchema = z.object({
  variant_id: z.string(),
  quantity: z.number().int().min(1).max(20).default(1),
  length_mm: z.number().int().positive(),
  depth_mm: z.number().int().positive(),
})

export type PostStoneItemSchemaType = z.infer<typeof PostStoneItemSchema>
