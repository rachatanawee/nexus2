'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function createProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const sku = formData.get('sku') as string
  if (!sku) return { success: false, message: 'Sku is required' }
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  if (!price || isNaN(price)) return { success: false, message: 'Price is required' }
  const cost = parseFloat(formData.get('cost') as string)
  if (!cost || isNaN(cost)) return { success: false, message: 'Cost is required' }
  const stock_quantity = parseFloat(formData.get('stock_quantity') as string)
  if (!stock_quantity || isNaN(stock_quantity)) return { success: false, message: 'Stock_quantity is required' }
  const min_stock_level = parseFloat(formData.get('min_stock_level') as string)
  const image_url = formData.get('image_url') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('products').insert({
    name: name,
    sku: sku,
    description: description || null,
    category_id: category_id || null,
    price: price,
    cost: cost,
    stock_quantity: stock_quantity,
    min_stock_level: min_stock_level || null,
    image_url: image_url || null,
    is_active: is_active || null
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
    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }
  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const sku = formData.get('sku') as string
  if (!sku) return { success: false, message: 'Sku is required' }
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  if (!price || isNaN(price)) return { success: false, message: 'Price is required' }
  const cost = parseFloat(formData.get('cost') as string)
  if (!cost || isNaN(cost)) return { success: false, message: 'Cost is required' }
  const stock_quantity = parseFloat(formData.get('stock_quantity') as string)
  if (!stock_quantity || isNaN(stock_quantity)) return { success: false, message: 'Stock_quantity is required' }
  const min_stock_level = parseFloat(formData.get('min_stock_level') as string)
  const image_url = formData.get('image_url') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('products').update({
    name: name,
    sku: sku,
    description: description || null,
    category_id: category_id || null,
    price: price,
    cost: cost,
    stock_quantity: stock_quantity,
    min_stock_level: min_stock_level || null,
    image_url: image_url || null,
    is_active: is_active || null
    }).eq('id', id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Product updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteProduct(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Product deleted successfully' }
}
