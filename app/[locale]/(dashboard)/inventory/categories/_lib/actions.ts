'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/permissions'

type FormState = {
  success: boolean
  message: string
}

export async function createCategorie(
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
  const description = formData.get('description') as string
  if (false) return { success: false, message: 'Description is required' }
  const icon = formData.get('icon') as string
  if (false) return { success: false, message: 'Icon is required' }

  const { error } = await supabase.from('categories').insert({
    name,
    description,
    icon
  })
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/categories')
  return { success: true, message: 'Categorie created successfully' }
}

export async function deleteCategorie(
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

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  revalidatePath('/inventory/categories')
  return { success: true, message: 'Categorie deleted successfully' }
}
