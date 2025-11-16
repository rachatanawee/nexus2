'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function createProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

    const name = formData.get('name') as string
    if (!name) return { success: false, message: 'Name is required' }
    
    const sku = formData.get('sku') as string
    if (!sku) return { success: false, message: 'Sku is required' }
    
    const description = formData.get('description') as string
    const category_id = formData.get('category_id') as string
    
    const priceStr = formData.get('price') as string
    const price = parseFloat(priceStr)
    if (!priceStr || isNaN(price)) return { success: false, message: 'Valid price is required' }
    
    const costStr = formData.get('cost') as string
    const cost = parseFloat(costStr)
    if (!costStr || isNaN(cost)) return { success: false, message: 'Valid cost is required' }
    
    const stockStr = formData.get('stock_quantity') as string
    const stock_quantity = parseInt(stockStr)
    if (!stockStr || isNaN(stock_quantity)) return { success: false, message: 'Valid stock quantity is required' }
    
    const min_stock_level = formData.get('min_stock_level') as string
    const image_url = formData.get('image_url') as string
    const is_active = formData.get('is_active') as string

    const insertData = {
      name,
      sku,
      description: description || null,
      category_id: category_id || null,
      price,
      cost,
      stock_quantity,
      min_stock_level: min_stock_level ? parseInt(min_stock_level) : null,
      image_url: image_url || null,
      is_active: Boolean(is_active && is_active !== 'false')
    }

    const { error } = await supabase.from('products').insert(insertData)
    
    if (error) {
      console.error('Insert error:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Product created successfully' }

  } catch (err) {
    console.error('Action error:', err)
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }

    const name = formData.get('name') as string
    if (!name) return { success: false, message: 'Name is required' }
    
    const sku = formData.get('sku') as string
    if (!sku) return { success: false, message: 'Sku is required' }
    
    const description = formData.get('description') as string
    const category_id = formData.get('category_id') as string
    
    const priceStr = formData.get('price') as string
    const price = parseFloat(priceStr)
    if (!priceStr || isNaN(price)) return { success: false, message: 'Valid price is required' }
    
    const costStr = formData.get('cost') as string
    const cost = parseFloat(costStr)
    if (!costStr || isNaN(cost)) return { success: false, message: 'Valid cost is required' }
    
    const stockStr = formData.get('stock_quantity') as string
    const stock_quantity = parseInt(stockStr)
    if (!stockStr || isNaN(stock_quantity)) return { success: false, message: 'Valid stock quantity is required' }
    
    const min_stock_level = formData.get('min_stock_level') as string
    const image_url = formData.get('image_url') as string
    const is_active = formData.get('is_active') as string

    const updateData = {
      name,
      sku,
      description: description || null,
      category_id: category_id || null,
      price,
      cost,
      stock_quantity,
      min_stock_level: min_stock_level ? parseInt(min_stock_level) : null,
      image_url: image_url || null,
      is_active: Boolean(is_active && is_active !== 'false')
    }

    const { error } = await supabase.from('products').update(updateData).eq('id', id)
    
    if (error) {
      console.error('Update error:', error)
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Product updated successfully' }

  } catch (err) {
    console.error('Action error:', err)
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  return { success: true, message: 'Product deleted successfully' }
}