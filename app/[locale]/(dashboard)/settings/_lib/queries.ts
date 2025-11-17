import { createClient } from '@/lib/supabase/server'
import type { AppSetting } from './types'

export async function getAppSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('_app_settings')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) return { data: null, error }
  return { data: data as AppSetting[], error: null }
}
