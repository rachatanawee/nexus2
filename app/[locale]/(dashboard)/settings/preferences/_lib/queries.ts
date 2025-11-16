import { createClient } from '@/lib/supabase/server'
import type { UserPreference } from './types'

export async function getUserPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('_user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
  
  if (error) return { data: null, error }
  return { data: data as UserPreference[], error: null }
}