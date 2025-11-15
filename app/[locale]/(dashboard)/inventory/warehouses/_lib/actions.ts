'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWarehouse(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('warehouses').insert({
    name: formData.get('name'),
    location: formData.get('location'),
    capacity: Number(formData.get('capacity'))
  })

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/warehouses')
  return { success: true }
}

export async function updateWarehouse(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('warehouses').update({
    name: formData.get('name'),
    location: formData.get('location'),
    capacity: Number(formData.get('capacity'))
  }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/warehouses')
  return { success: true }
}

export async function deleteWarehouse(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('warehouses').delete().eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/inventory/warehouses')
  return { success: true }
}
