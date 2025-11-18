'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type FormState = {
  success: boolean
  message: string
}

// Zod schemas for validation
const warehouseSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  code: z.preprocess((val) => val || '', z.string().min(1, 'Code is required')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  manager_name: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
})

const createWarehouseSchema = warehouseSchema

const updateWarehouseSchema = warehouseSchema.extend({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

const deleteWarehouseSchema = z.object({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

export async function createWarehouse(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      name: formData.get('name') || undefined,
      code: formData.get('code') || undefined,
      address: formData.get('address') || undefined,
      city: formData.get('city') || undefined,
      country: formData.get('country') || undefined,
      manager_name: formData.get('manager_name') || undefined,
      phone: formData.get('phone') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data
    const validationResult = createWarehouseSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('warehouses').insert({
      name: data.name,
      code: data.code,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      manager_name: data.manager_name || null,
      phone: data.phone || null,
      is_active: data.is_active || null
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

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
      name: formData.get('name') || undefined,
      code: formData.get('code') || undefined,
      address: formData.get('address') || undefined,
      city: formData.get('city') || undefined,
      country: formData.get('country') || undefined,
      manager_name: formData.get('manager_name') || undefined,
      phone: formData.get('phone') || undefined,
      is_active: formData.get('is_active') ? formData.get('is_active') === 'true' : undefined,
    }

    // Validate data
    const validationResult = updateWarehouseSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('warehouses').update({
      name: data.name,
      code: data.code,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      manager_name: data.manager_name || null,
      phone: data.phone || null,
      is_active: data.is_active || null
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Warehouse updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteWarehouse(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
    }

    // Validate data
    const validationResult = deleteWarehouseSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('warehouses').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Warehouse deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
