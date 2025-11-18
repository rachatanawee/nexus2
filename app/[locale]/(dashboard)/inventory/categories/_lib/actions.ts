'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type FormState = {
  success: boolean
  message: string
}

// Zod schemas for validation
const categorieSchema = z.object({
  name: z.preprocess((val) => val || '', z.string().min(1, 'Name is required')),
  description: z.string().optional(),
  icon: z.string().optional(),
})

const createCategorieSchema = categorieSchema

const updateCategorieSchema = categorieSchema.extend({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

const deleteCategorieSchema = z.object({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

export async function createCategorie(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      name: formData.get('name') || undefined,
      description: formData.get('description') || undefined,
      icon: formData.get('icon') || undefined,
    }

    // Validate data
    const validationResult = createCategorieSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('categories').insert({
      name: data.name,
      description: data.description || null,
      icon: data.icon || null
    })

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Categorie created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateCategorie(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
      name: formData.get('name') || undefined,
      description: formData.get('description') || undefined,
      icon: formData.get('icon') || undefined,
    }

    // Validate data
    const validationResult = updateCategorieSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('categories').update({
      name: data.name,
      description: data.description || null,
      icon: data.icon || null
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Categorie updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteCategorie(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
    }

    // Validate data
    const validationResult = deleteCategorieSchema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('categories').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Categorie deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
