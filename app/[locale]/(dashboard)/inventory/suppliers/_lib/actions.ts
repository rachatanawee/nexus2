'use server'

import { createClient } from '@/lib/supabase/server'
import { createSupplierSchema, updateSupplierSchema, deleteSupplierSchema } from './validation'
import type { ZodIssue } from 'zod'

type FormState = {
  success: boolean
  message: string
}

export async function createSupplier(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      name: formData.get('name') || undefined,
      code: formData.get('code') || undefined,
      contact_person: formData.get('contact_person') || undefined,
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      address: formData.get('address') || undefined,
      city: formData.get('city') || undefined,
      country: formData.get('country') || undefined,
      payment_terms: formData.get('payment_terms') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data using shared Zod schema
    const validationResult = createSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data

    const { error } = await supabase.from('suppliers').insert({
      name: data.name,
      code: data.code,
      contact_person: data.contact_person || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      payment_terms: data.payment_terms || null,
      is_active: data.is_active || null
    })

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateSupplier(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
      name: formData.get('name') || undefined,
      code: formData.get('code') || undefined,
      contact_person: formData.get('contact_person') || undefined,
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
      address: formData.get('address') || undefined,
      city: formData.get('city') || undefined,
      country: formData.get('country') || undefined,
      payment_terms: formData.get('payment_terms') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data using shared Zod schema
    const validationResult = updateSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data

    const { error } = await supabase.from('suppliers').update({
      name: data.name,
      code: data.code,
      contact_person: data.contact_person || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      payment_terms: data.payment_terms || null,
      is_active: data.is_active || null
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteSupplier(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
    }

    // Validate data using shared Zod schema
    const validationResult = deleteSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data

    const { error } = await supabase.from('suppliers').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
