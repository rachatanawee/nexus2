'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/permissions'

type FormState = {
  success: boolean
  message: string
}

export async function createSupplier(
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
  const code = formData.get('code') as string
  if (!code) return { success: false, message: 'Code is required' }
  const contact_person = formData.get('contact_person') as string
  if (false) return { success: false, message: 'Contact_person is required' }
  const email = formData.get('email') as string
  if (false) return { success: false, message: 'Email is required' }
  const phone = formData.get('phone') as string
  if (false) return { success: false, message: 'Phone is required' }
  const address = formData.get('address') as string
  if (false) return { success: false, message: 'Address is required' }
  const city = formData.get('city') as string
  if (false) return { success: false, message: 'City is required' }
  const country = formData.get('country') as string
  if (false) return { success: false, message: 'Country is required' }
  const payment_terms = formData.get('payment_terms') as string
  if (false) return { success: false, message: 'Payment_terms is required' }
  const is_active = formData.get('is_active') as string
  if (false) return { success: false, message: 'Is_active is required' }

  const { error } = await supabase.from('suppliers').insert({
    name,
    code,
    contact_person,
    email,
    phone,
    address,
    city,
    country,
    payment_terms,
    is_active
  })
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/suppliers')
  return { success: true, message: 'Supplier created successfully' }
}

export async function deleteSupplier(
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

  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/suppliers')
  return { success: true, message: 'Supplier deleted successfully' }
}
