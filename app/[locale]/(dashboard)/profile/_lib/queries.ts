import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from './types'

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: 'Not authenticated' }

  return { 
    data: {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      phone: user.user_metadata?.phone || null,
      bio: user.user_metadata?.bio || null,
      updated_at: user.updated_at
    } as UserProfile, 
    error: null 
  }
}

export async function getUserPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })
  
  if (error) return { data: null, error }
  return { data, error: null }
}