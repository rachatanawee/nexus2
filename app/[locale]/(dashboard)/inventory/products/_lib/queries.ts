import { createClient } from '@/lib/supabase/server'
import type { Product } from './types'

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }
  return { data: data as Product[], error: null }
}
