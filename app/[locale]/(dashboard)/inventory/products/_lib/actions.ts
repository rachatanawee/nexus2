'use server'

import { createClient } from '@/lib/supabase/server'
import { createProductSchema, updateProductSchema, deleteProductSchema } from './validation'
import type { ZodIssue } from 'zod'

type FormState = {
  success: boolean
  message: string
}

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

    // Validate data using shared Zod schema
    const validationResult = createProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
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

    // Validate data using shared Zod schema
    const validationResult = updateProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
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

    // Validate data using shared Zod schema
    const validationResult = deleteProductSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data

    const { error } = await supabase.from('products').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Product deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
