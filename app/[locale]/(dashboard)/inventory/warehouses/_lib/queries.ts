import { createClient } from '@/lib/supabase/server'

export async function getWarehouses() {
  const supabase = await createClient()
  return supabase.from('warehouses').select('*')
}

export async function getWarehouseById(id: string) {
  const supabase = await createClient()
  return supabase.from('warehouses').select('*').eq('id', id).single()
}
