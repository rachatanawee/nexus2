'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function createCategorie(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string

    const { error } = await supabase.from('categories').insert({
    name: name,
    description: description || null,
    icon: icon || null
    })
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Categorie created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function updateCategorie(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }

  const name = formData.get('name') as string
  if (!name) return { success: false, message: 'Name is required' }
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string

    const { error } = await supabase.from('categories').update({
    name: name,
    description: description || null,
    icon: icon || null
    }).eq('id', id)
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Categorie updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function deleteCategorie(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  return { success: true, message: 'Categorie deleted successfully' }
}
