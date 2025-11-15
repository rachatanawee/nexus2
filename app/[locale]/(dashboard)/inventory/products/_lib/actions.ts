'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('products').insert({
    name: formData.get('name'),
    sku: formData.get('sku'),
    quantity: Number(formData.get('quantity')),
    price: Number(formData.get('price')),
    warehouse_id: formData.get('warehouse_id')
  })

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('products').update({
    name: formData.get('name'),
    sku: formData.get('sku'),
    quantity: Number(formData.get('quantity')),
    price: Number(formData.get('price')),
    warehouse_id: formData.get('warehouse_id')
  }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/products')
  return { success: true }
}
