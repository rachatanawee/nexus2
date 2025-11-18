import { z } from 'zod'

// Shared Zod schemas for warehouses
export const warehouseBaseSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  code: z.preprocess((val) => val || '', z.string().min(1, 'Code is required')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  manager_name: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const createWarehouseSchema = warehouseBaseSchema

export const updateWarehouseSchema = warehouseBaseSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const deleteWarehouseSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type CreateWarehouseFormData = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseFormData = z.infer<typeof updateWarehouseSchema>
