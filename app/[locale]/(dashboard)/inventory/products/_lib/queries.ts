import { createClient } from '@/lib/supabase/server'

export async function getProducts() {
  const supabase = await createClient()
  return supabase.from('products').select('*')
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  return supabase.from('products').select('*').eq('id', id).single()
}
