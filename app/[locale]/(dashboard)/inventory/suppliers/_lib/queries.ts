import { createClient } from '@/lib/supabase/server'
import type { Supplier } from './types'

export async function getSuppliers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return { data: null, error }
  return { data: data as Supplier[], error: null }
}

export async function getSupplierById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return { data: null, error }
  return { data: data as Supplier, error: null }
}
