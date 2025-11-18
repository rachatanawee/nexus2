'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type FormState = {
  success: boolean
  message: string
}

// Zod schemas for validation
const productSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  sku: z.preprocess((val) => val || '', z.string().min(1, 'SKU is required')),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().positive('Price must be positive')),
  cost: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().positive('Cost must be positive')),
  stock_quantity: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().min(0, 'Stock quantity must be non-negative')),
  min_stock_level: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().min(0, 'Min stock level must be non-negative').optional()),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
})

const createProductSchema = productSchema

const updateProductSchema = productSchema.extend({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

const deleteProductSchema = z.object({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

export async function createProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      name: formData.get('name') || undefined,
      sku: formData.get('sku') || undefined,
      description: formData.get('description') || undefined,
      category_id: formData.get('category_id') || undefined,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : undefined,
      stock_quantity: formData.get('stock_quantity') ? parseFloat(formData.get('stock_quantity') as string) : undefined,
      min_stock_level: formData.get('min_stock_level') ? parseFloat(formData.get('min_stock_level') as string) : undefined,
      image_url: formData.get('image_url') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data
    const validationResult = createProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('products').insert({
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      category_id: data.category_id || null,
      price: data.price,
      cost: data.cost,
      stock_quantity: data.stock_quantity,
      min_stock_level: data.min_stock_level || null,
      image_url: data.image_url || null,
      is_active: data.is_active || null
    })

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Product created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
      name: formData.get('name') || undefined,
      sku: formData.get('sku') || undefined,
      description: formData.get('description') || undefined,
      category_id: formData.get('category_id') || undefined,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : undefined,
      stock_quantity: formData.get('stock_quantity') ? parseFloat(formData.get('stock_quantity') as string) : undefined,
      min_stock_level: formData.get('min_stock_level') ? parseFloat(formData.get('min_stock_level') as string) : undefined,
      image_url: formData.get('image_url') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data
    const validationResult = updateProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('products').update({
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      category_id: data.category_id || null,
      price: data.price,
      cost: data.cost,
      stock_quantity: data.stock_quantity,
      min_stock_level: data.min_stock_level || null,
      image_url: data.image_url || null,
      is_active: data.is_active || null
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Product updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
    }

    // Validate data
    const validationResult = deleteProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('products').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Product deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
