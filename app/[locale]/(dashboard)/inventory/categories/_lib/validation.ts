import { z } from 'zod'

// Shared Zod schemas for categories
export const categorieBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  icon: z.string().max(50, 'Icon must be less than 50 characters').optional().or(z.literal('')),
})

export const createCategorieSchema = categorieBaseSchema

export const updateCategorieSchema = categorieBaseSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const deleteCategorieSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type CreateCategorieFormData = z.infer<typeof createCategorieSchema>
export type UpdateCategorieFormData = z.infer<typeof updateCategorieSchema>
