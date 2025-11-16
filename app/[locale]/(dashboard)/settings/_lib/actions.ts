'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/permissions'

type FormState = {
  success: boolean
  message: string
}

export async function updateSettings(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    return { success: false, message: 'Access Denied' }
  }

  const updates = JSON.parse(formData.get('updates') as string)

  for (const [key, value] of Object.entries(updates)) {
    const { error } = await supabase
      .from('app_settings')
      .update({ value: value as string })
      .eq('key', key)

    if (error) return { success: false, message: error.message }
  }

  revalidatePath('/settings')
  return { success: true, message: 'Settings saved successfully' }
}
