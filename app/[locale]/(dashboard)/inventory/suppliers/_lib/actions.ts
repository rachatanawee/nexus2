'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function createSupplier(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const code = formData.get('code') as string
  if (!code) return { success: false, message: 'Code is required' }
  const contact_person = formData.get('contact_person') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const payment_terms = formData.get('payment_terms') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('suppliers').insert({
    name: name,
    code: code,
    contact_person: contact_person || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    city: city || null,
    country: country || null,
    payment_terms: payment_terms || null,
    is_active: is_active || null
    })
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateSupplier(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }

  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const code = formData.get('code') as string
  if (!code) return { success: false, message: 'Code is required' }
  const contact_person = formData.get('contact_person') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const payment_terms = formData.get('payment_terms') as string
  const is_active = formData.get('is_active') as string

    const { error } = await supabase.from('suppliers').update({
    name: name,
    code: code,
    contact_person: contact_person || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
    city: city || null,
    country: country || null,
    payment_terms: payment_terms || null,
    is_active: is_active || null
    }).eq('id', id)
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteSupplier(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  return { success: true, message: 'Supplier deleted successfully' }
}
