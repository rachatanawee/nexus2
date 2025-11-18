import { z } from 'zod'

// Shared Zod schemas for suppliers
export const supplierBaseSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  code: z.preprocess((val) => val || '', z.string().min(1, 'Code is required')),
  contact_person: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  is_active: z.boolean().optional(),
})

export const createSupplierSchema = supplierBaseSchema

export const updateSupplierSchema = supplierBaseSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const deleteSupplierSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>
export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>
