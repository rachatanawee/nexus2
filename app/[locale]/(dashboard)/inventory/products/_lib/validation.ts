import { z } from 'zod'

// Shared Zod schemas for products
export const productBaseSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  sku: z.preprocess((val) => val || '', z.string().min(1, 'Sku is required')),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().positive()),
  cost: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().positive()),
  stock_quantity: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().min(0)),
  min_stock_level: z.number().min(0).optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const createProductSchema = productBaseSchema

export const updateProductSchema = productBaseSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const deleteProductSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
