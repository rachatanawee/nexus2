'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function createWarehouse(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const code = formData.get('code') as string
  if (!code) return { success: false, message: 'Code is required' }
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const manager_name = formData.get('manager_name') as string
  const phone = formData.get('phone') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('warehouses').insert({
    name: name,
    code: code,
    address: address || null,
    city: city || null,
    country: country || null,
    manager_name: manager_name || null,
    phone: phone || null,
    is_active: is_active || null
    })
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Warehouse created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateWarehouse(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }
  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const code = formData.get('code') as string
  if (!code) return { success: false, message: 'Code is required' }
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const manager_name = formData.get('manager_name') as string
  const phone = formData.get('phone') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('warehouses').update({
    name: name,
    code: code,
    address: address || null,
    city: city || null,
    country: country || null,
    manager_name: manager_name || null,
    phone: phone || null,
    is_active: is_active || null
    }).eq('id', id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Warehouse updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteWarehouse(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient()
  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }
  const { error } = await supabase.from('warehouses').delete().eq('id', id)
  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Warehouse deleted successfully' }
}
