'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const formSchemaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  schema: z.string().min(1, 'Schema is required'),
  table_name: z.string().min(1, 'Table name is required'),
})

type FormState = {
  success: boolean
  message: string
}

export async function createFormSchema(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    
    const rawData = {
      name: formData.get('name') || '',
      description: formData.get('description') || '',
      schema: formData.get('schema') || '',
      table_name: formData.get('table_name') || '',
    }

    const validationResult = formSchemaSchema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data
    let parsedSchema
    
    try {
      parsedSchema = JSON.parse(data.schema)
    } catch {
      return { success: false, message: 'Invalid JSON schema' }
    }

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { success: false, message: 'Not authenticated' }
    }

    const { error } = await supabase.from('_form_schemas').insert({
      name: data.name,
      description: data.description || null,
      schema: parsedSchema,
      table_name: data.table_name,
      created_by: user.user.id,
    })

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Form schema created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateFormSchema(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    
    const rawData = {
      id: formData.get('id') || '',
      name: formData.get('name') || '',
      description: formData.get('description') || '',
      schema: formData.get('schema') || '',
      table_name: formData.get('table_name') || '',
    }

    const validationResult = formSchemaSchema.extend({
      id: z.string().min(1, 'ID is required')
    }).safeParse(rawData)
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join(', ')
      return { success: false, message: errorMessages }
    }

    const data = validationResult.data
    let parsedSchema
    
    try {
      parsedSchema = JSON.parse(data.schema)
    } catch {
      return { success: false, message: 'Invalid JSON schema' }
    }

    const { error } = await supabase.from('_form_schemas').update({
      name: data.name,
      description: data.description || null,
      schema: parsedSchema,
      table_name: data.table_name,
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Form schema updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteFormSchema(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string

    if (!id) {
      return { success: false, message: 'ID is required' }
    }

    const { error } = await supabase.from('_form_schemas').delete().eq('id', id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Form schema deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateFormData(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const dataJson = formData.get('data') as string

    if (!id || !dataJson) {
      return { success: false, message: 'ID and data are required' }
    }

    let parsedData
    try {
      parsedData = JSON.parse(dataJson)
    } catch {
      return { success: false, message: 'Invalid JSON data' }
    }

    const { error } = await supabase.from('_form_data').update({
      data: parsedData
    }).eq('id', id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Form data updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteFormData(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()
    const id = formData.get('id') as string

    if (!id) {
      return { success: false, message: 'ID is required' }
    }

    const { error } = await supabase.from('_form_data').delete().eq('id', id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Form data deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}