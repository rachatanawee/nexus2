import { createClient } from '@/lib/supabase/server'
import type { Warehouse } from './types'

export async function getWarehouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }
  return { data: data as Warehouse[], error: null }
}
