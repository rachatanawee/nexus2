#!/usr/bin/env node

const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

const [,, featurePath, tableName] = process.argv

if (!featurePath || !tableName) {
  console.log('Usage: bun scripts/generate-crud-v2.js <feature-path> <table-name>')
  console.log('Example: bun scripts/generate-crud-v2.js orders orders')
  console.log('Example: bun scripts/generate-crud-v2.js inventory/suppliers suppliers')
  process.exit(1)
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const parts = featurePath.split('/')
const featureName = parts[parts.length - 1]
const singular = featureName.replace(/s$/, '')
const Feature = capitalize(singular)
const basePath = `app/[locale]/(dashboard)/${featurePath}`

// Fetch table schema from Supabase
async function getTableSchema(tableName) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    })

    const openapi = await response.json()
    const tableDef = openapi.definitions?.[tableName]

    if (!tableDef || !tableDef.properties) {
      throw new Error(`Table ${tableName} not found`)
    }

    const excludeFields = ['id', 'created_at', 'updated_at']
    const fields = []

    for (const [fieldName, fieldDef] of Object.entries(tableDef.properties)) {
      if (excludeFields.includes(fieldName)) continue

      const type = fieldDef.type || 'string'
      const format = fieldDef.format || ''
      const required = tableDef.required?.includes(fieldName) || false

      fields.push({
        name: fieldName,
        type: format || type,
        required,
        tsType: (format || type).includes('int') || (format || type).includes('numeric') ? 'number' : 
                (format || type).includes('bool') ? 'boolean' : 'string'
      })
    }

    return fields
  } catch (error) {
    console.error('❌ Error fetching schema:', error.message)
    throw error
  }
}

async function generate() {
  console.log('🔍 Fetching schema from Supabase...')
  const fields = await getTableSchema(tableName)
  
  console.log('📋 Fields:', fields.map(f => f.name).join(', '))

  // Create directories
  const dirs = [basePath, `${basePath}/_components`, `${basePath}/_lib`]
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })

  // Generate types.ts
  const typeFields = fields.map(f => 
    `  ${f.name}: ${f.tsType}${f.required ? '' : ' | null'}`
  ).join('\n')

  fs.writeFileSync(`${basePath}/_lib/types.ts`, `export type ${Feature} = {
  id: string
${typeFields}
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type ${Feature}Insert = Omit<${Feature}, 'id' | 'created_at' | 'updated_at'>
export type ${Feature}Update = Partial<${Feature}Insert>
`)

  // Generate queries.ts
  fs.writeFileSync(`${basePath}/_lib/queries.ts`, `import { createClient } from '@/lib/supabase/server'
import type { ${Feature} } from './types'

export async function get${Feature}s() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('${tableName}')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) return { data: null, error }
  return { data: data as ${Feature}[], error: null }
}
`)

  // Generate actions.ts
  const createFields = fields.map(f => {
    const getter = f.tsType === 'number' 
      ? `parseFloat(formData.get('${f.name}') as string)` 
      : `formData.get('${f.name}') as string`
    const validation = f.required 
      ? `  if (!${f.name}${f.tsType === 'number' ? ' || isNaN(' + f.name + ')' : ''}) return { success: false, message: '${capitalize(f.name)} is required' }\n` 
      : ''
    return `  const ${f.name} = ${getter}\n${validation}`
  }).join('')

  const insertData = fields.map(f => 
    `    ${f.name}: ${f.name}${!f.required ? ' || null' : ''}`
  ).join(',\n')

  fs.writeFileSync(`${basePath}/_lib/actions.ts`, `'use server'

import { createClient } from '@/lib/supabase/server'

type FormState = {
  success: boolean
  message: string
}

export async function create${Feature}(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

${createFields}
    const { error } = await supabase.from('${tableName}').insert({
${insertData}
    })
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: '${Feature} created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function update${Feature}(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return { success: false, message: 'ID is required' }

${createFields}
    const { error } = await supabase.from('${tableName}').update({
${insertData}
    }).eq('id', id)
    
    if (error) return { success: false, message: error.message }
    return { success: true, message: '${Feature} updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function delete${Feature}(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('${tableName}').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  return { success: true, message: '${Feature} deleted successfully' }
}
`)

  // Generate format.ts
  fs.writeFileSync(`${basePath}/_lib/format.ts`, `'use client'

import { formatSystemDate, formatSystemNumber } from '@/lib/format-utils'
import { usePreferences } from '@/lib/preferences-context'

export function useFormatSettings() {
  const { settings } = usePreferences()
  return settings
}

export function formatNumber(value: number, settings?: any) {
  return formatSystemNumber(value, settings)
}

export function formatDate(date: Date, settings?: any) {
  const dateFormat = settings?.date_format || 'MM/dd/yyyy'
  return formatSystemDate(date, dateFormat)
}
`)

  // Generate form dialog
  const formFields = fields.map(f => {
    const inputType = f.tsType === 'number' ? 'number' : 'text'
    const step = f.type.includes('numeric') && !f.type.includes('int') ? ' step="0.01"' : ''
    const defaultValue = f.tsType === 'boolean' 
      ? `{${singular}?.${f.name} ? 'true' : 'false'}`
      : `{${singular}?.${f.name}${!f.required ? " || ''" : ''}}`
    return `            <div>
              <Label htmlFor="${f.name}">${capitalize(f.name)}${f.required ? ' *' : ''}</Label>
              <Input id="${f.name}" name="${f.name}" type="${inputType}"${step} defaultValue=${defaultValue} ${f.required ? 'required' : ''} />
            </div>`
  }).join('\n')

  fs.writeFileSync(`${basePath}/_components/${singular}-form-dialog.tsx`, `'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { create${Feature}, update${Feature} } from '../_lib/actions'
import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ${Feature} } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface ${Feature}FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ${singular}?: ${Feature} | null
}

export function ${Feature}FormDialog({ open, onOpenChange, ${singular} }: ${Feature}FormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const isEdit = !!${singular}
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? update${Feature} : create${Feature},
    { success: false, message: '' }
  )

  const handleSubmit = (formData: FormData) => {
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }
    setFormData(data)
    formAction(formData)
  }

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      setFormData({})
      formRef.current?.reset()
      router.refresh()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state.success, state.message])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit ${Feature}' : 'Create ${Feature}'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={${singular}.id} />}
          <div className="grid grid-cols-2 gap-4">
${formFields}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
`)

  // Generate table component with exportConfig
  const tableColumns = fields.slice(0, 5).map(f => {
    if (f.tsType === 'number') {
      return `    { 
      accessorKey: '${f.name}', 
      header: '${capitalize(f.name)}', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.${f.name} || 0, formatSettings)
    }`
    }
    return `    { accessorKey: '${f.name}', header: '${capitalize(f.name)}', enableSorting: true }`
  }).join(',\n')

  const exportFields = fields.slice(0, 5)
  const columnMapping = exportFields.map(f => `            ${f.name}: '${capitalize(f.name)}'`).join(',\n')
  const columnWidths = exportFields.map(() => '            { wch: 20 }').join(',\n')
  const headers = exportFields.map(f => `'${capitalize(f.name)}'`).join(', ')

  fs.writeFileSync(`${basePath}/_components/${singular}-table.tsx`, `'use client'

import { DataTable } from '@/components/data-table/data-table'
import { ${Feature} } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ${Feature}FormDialog } from './${singular}-form-dialog'
import { delete${Feature} } from '../_lib/actions'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'
import { useRouter } from 'next/navigation'

interface ${Feature}TableProps {
  data: ${Feature}[]
  totalItems: number
}

export function ${Feature}Table({ data, totalItems }: ${Feature}TableProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [edit${Feature}, setEdit${Feature}] = useState<${Feature} | null>(null)
  const formatSettings = useFormatSettings()

  const getColumns = () => [
${tableColumns},
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }: any) => formatDate(new Date(row.original.created_at), formatSettings)
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEdit${Feature}(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            if (!confirm(\`Delete \${row.original.${fields[0]?.name || 'name'}}?\`)) return

            const formData = new FormData()
            formData.append('id', row.original.id)
            const result = await delete${Feature}({ success: false, message: '' }, formData)

            if (result.success) {
              toast.success(result.message)
              router.refresh()
            } else {
              toast.error(result.message)
            }
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const fetchData = async (params: any) => {
    let filtered = [...data]

    if (params.search) {
      filtered = filtered.filter(item =>
        item.${fields[0]?.name || 'name'}.toString().toLowerCase().includes(params.search.toLowerCase())
      )
    }

    const start = (params.page - 1) * params.limit
    const paginated = filtered.slice(start, start + params.limit)

    return {
      success: true,
      data: paginated,
      pagination: {
        page: params.page,
        limit: params.limit,
        total_pages: Math.ceil(filtered.length / params.limit),
        total_items: filtered.length
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create ${Feature}</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: '${featureName}',
          columnMapping: {
${columnMapping}
          },
          columnWidths: [
${columnWidths}
          ],
          headers: [${headers}]
        }}
        idField="id"
        config={{
          enableRowSelection: false,
          enableToolbar: true,
          enablePagination: true,
          enableSearch: true,
          enableDateFilter: false,
          enableExport: true,
          enableColumnVisibility: true
        }}
      />
      <${Feature}FormDialog open={createOpen} onOpenChange={setCreateOpen} ${singular}={null} />
      <${Feature}FormDialog open={!!edit${Feature}} onOpenChange={(open) => !open && setEdit${Feature}(null)} ${singular}={edit${Feature}} />
    </div>
  )
}
`)

  // Generate page.tsx
  fs.writeFileSync(`${basePath}/page.tsx`, `import { ${Feature}Table } from './_components/${singular}-table'
import { get${Feature}s } from './_lib/queries'

export default async function ${Feature}sPage() {
  const { data: items } = await get${Feature}s()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">${Feature}s</h1>
      <${Feature}Table data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
`)

  console.log(`✅ Generated CRUD for ${Feature}`)
  console.log(`📁 Files created in: ${basePath}`)
  console.log(`🔗 Route: /${featurePath}`)
  console.log(`\n📝 Next steps:`)
  console.log(`1. Add to sidebar: components/sidebar.tsx`)
  console.log(`2. Add translations: messages/en.json, messages/th.json`)
  console.log(`3. Create RLS policies for ${tableName} table`)
}

generate().catch(console.error)
