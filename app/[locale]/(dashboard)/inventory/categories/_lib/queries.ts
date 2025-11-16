import { createClient } from '@/lib/supabase/server'
import type { Categorie } from './types'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return { data: null, error }
  return { data: data as Categorie[], error: null }
}
