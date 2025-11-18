'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type FormState = {
  success: boolean
  message: string
}

// Zod schemas for validation
const supplierSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  code: z.preprocess((val) => val || '', z.string().min(1, 'Code is required')),
  contact_person: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  payment_terms: z.string().optional(),
  is_active: z.boolean().optional(),
})

const createSupplierSchema = supplierSchema

const updateSupplierSchema = supplierSchema.extend({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

const deleteSupplierSchema = z.object({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

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

    // Validate data
    const validationResult = createSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
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

    // Validate data
    const validationResult = updateSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
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

    // Validate data
    const validationResult = deleteSupplierSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('suppliers').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Supplier deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
