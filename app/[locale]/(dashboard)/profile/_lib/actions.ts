'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type FormState = {
  success: boolean
  message: string
}

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const bio = formData.get('bio') as string

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: full_name || null,
        phone: phone || null,
        bio: bio || null
      }
    })

    if (error) throw error

    revalidatePath('/profile')
    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function updatePreferences(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  const updates = JSON.parse(formData.get('updates') as string)

  try {
    for (const [key, value] of Object.entries(updates)) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          key,
          value: value as string,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key'
        })

      if (error) throw error
    }

    revalidatePath('/profile')
    return { success: true, message: 'Preferences updated successfully' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}