import { createClient } from '@/lib/supabase/server'
import type { FormSchema, FormSubmission } from './types'

export async function getFormSchemas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('_form_schemas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }
  return { data: data as FormSchema[], error: null }
}

export async function getFormSchema(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('_form_schemas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { data: null, error }
  return { data: data as FormSchema, error: null }
}

export async function getFormData(schemaId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('_form_data')
    .select('*')
    .eq('form_schema_id', schemaId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }
  return { data: data as FormSubmission[], error: null }
}