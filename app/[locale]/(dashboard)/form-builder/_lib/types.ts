export interface FormField {
  name: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'
  label: string
  required: boolean
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    step?: number
    pattern?: string
  }
  options?: Array<{ value: string; label: string }>
}

export interface FormSchema {
  id: string
  name: string
  description?: string
  schema: {
    fields: FormField[]
  }
  table_name: string
  created_by: string
  created_at: string
  updated_at: string
}

export type FormSchemaInsert = Omit<FormSchema, 'id' | 'created_at' | 'updated_at' | 'created_by'>

export interface FormSubmission {
  id: string
  form_schema_id: string
  data: Record<string, any>
  submitted_by: string
  created_at: string
  updated_at: string
}

export type FormSubmissionInsert = Omit<FormSubmission, 'id' | 'created_at' | 'updated_at'>