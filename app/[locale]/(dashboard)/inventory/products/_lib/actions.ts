'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/permissions'

type FormState = {
  success: boolean
  message: string
}

export async function createProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    return { success: false, message: 'Access Denied' }
  }

  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const sku = formData.get('sku') as string
  if (!sku) return { success: false, message: 'Sku is required' }
  const description = formData.get('description') as string
  if (false) return { success: false, message: 'Description is required' }
  const category_id = formData.get('category_id') as string
  if (false) return { success: false, message: 'Category_id is required' }
  const price = formData.get('price') as string
  if (!price) return { success: false, message: 'Price is required' }
  const cost = formData.get('cost') as string
  if (!cost) return { success: false, message: 'Cost is required' }
  const stock_quantity = formData.get('stock_quantity') as string
  if (!stock_quantity) return { success: false, message: 'Stock_quantity is required' }
  const min_stock_level = formData.get('min_stock_level') as string
  if (false) return { success: false, message: 'Min_stock_level is required' }
  const image_url = formData.get('image_url') as string
  if (false) return { success: false, message: 'Image_url is required' }
  const is_active = formData.get('is_active') as string
  if (false) return { success: false, message: 'Is_active is required' }

  const { error } = await supabase.from('products').insert({
    name,
    sku,
    description,
    category_id,
    price,
    cost,
    stock_quantity,
    min_stock_level,
    image_url,
    is_active
  })
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/products')
  return { success: true, message: 'Product created successfully' }
}

export async function deleteProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    return { success: false, message: 'Access Denied' }
  }

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/products')
  return { success: true, message: 'Product deleted successfully' }
}
