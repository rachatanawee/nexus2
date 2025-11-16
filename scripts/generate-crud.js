#!/usr/bin/env node

const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const [,, featurePath, tableName] = process.argv

if (!featurePath || !tableName) {
  console.log('Usage: bun scripts/generate-crud.js <feature-path> <table-name>')
  console.log('Example: bun scripts/generate-crud.js products products')
  console.log('Example: bun scripts/generate-crud.js inventory/categories categories')
  process.exit(1)
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const parts = featurePath.split('/')
const featureName = parts[parts.length - 1]
const singular = featureName.replace(/s$/, '')
const Feature = capitalize(singular)

const basePath = `app/[locale]/(dashboard)/${featurePath}`
const routePath = featurePath

// ดึง schema จาก Supabase OpenAPI
async function getTableSchema(tableName) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  try {
    // ใช้ REST API introspection endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    })

    const openapi = await response.json()
    let tableDef = openapi.definitions?.[tableName]

    // ถ้าไม่มีตาราง ลองใช้ user_preferences แทน
    if (!tableDef || !tableDef.properties) {
      console.log('⚠️  Table not found, checking for user_preferences...')
      const userPrefDef = openapi.definitions?.['user_preferences']
      
      if (userPrefDef && userPrefDef.properties) {
        console.log('✅ Using user_preferences schema')
        return getUserPreferencesFields()
      }
      
      console.log('⚠️  Using general settings schema')
      return getGeneralSettingsFields()
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
        required
      })
    }

    return fields
  } catch (error) {
    console.error('❌ Error fetching schema:', error.message)
    return getGeneralSettingsFields()
  }
}

function getUserPreferencesFields() {
  return [
    { name: 'user_id', type: 'uuid', required: true },
    { name: 'key', type: 'text', required: true },
    { name: 'value', type: 'text', required: false },
    { name: 'category', type: 'text', required: true },
    { name: 'type', type: 'text', required: true },
    { name: 'description', type: 'text', required: false }
  ]
}

function getGeneralSettingsFields() {
  return [
    { name: 'key', type: 'text', required: true },
    { name: 'value', type: 'text', required: false },
    { name: 'category', type: 'text', required: true },
    { name: 'type', type: 'text', required: true },
    { name: 'description', type: 'text', required: false }
  ]
}

async function generate() {
  console.log('🔍 Fetching schema from Supabase...')
  let fields = await getTableSchema(tableName)
  
  if (fields.length === 0) {
    console.log('⚠️  No fields found, using default: name')
    fields = [{ name: 'name', type: 'text', required: true }]
  }

  console.log('📋 Fields:', fields.map(f => f.name).join(', '))

// สร้างโฟลเดอร์
const dirs = [basePath, `${basePath}/_components`, `${basePath}/_lib`]
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

// types.ts
const typeFields = fields.map(f => {
  const tsType = f.type.includes('int') || f.type.includes('numeric') ? 'number' : 
                 f.type.includes('bool') ? 'boolean' : 'string'
  return `  ${f.name}: ${tsType}${f.required ? '' : ' | null'}`
}).join('\n')

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

// queries.ts
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

export async function get${Feature}ById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('${tableName}')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return { data: null, error }
  return { data: data as ${Feature}, error: null }
}
`)

// actions.ts
fs.writeFileSync(`${basePath}/_lib/actions.ts`, `'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/permissions'

type FormState = {
  success: boolean
  message: string
}

export async function create${Feature}(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    return { success: false, message: 'Access Denied' }
  }

${fields.map(f => `  const ${f.name} = formData.get('${f.name}') as string
  if (${f.required ? `!${f.name}` : 'false'}) return { success: false, message: '${capitalize(f.name)} is required' }`).join('\n')}

  const { error } = await supabase.from('${tableName}').insert({
${fields.map(f => `    ${f.name}`).join(',\n')}
  })
  if (error) return { success: false, message: error.message }

  revalidatePath('/${routePath}')
  return { success: true, message: '${Feature} created successfully' }
}

export async function delete${Feature}(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    return { success: false, message: 'Access Denied' }
  }

  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'ID is required' }

  const { error } = await supabase.from('${tableName}').delete().eq('id', id)
  if (error) return { success: false, message: error.message }

  revalidatePath('/${routePath}')
  return { success: true, message: '${Feature} deleted successfully' }
}
`)

// format utilities
fs.writeFileSync(`${basePath}/_lib/format.ts`, `'use client'

import { getSystemFormatSettings, formatSystemDate, formatSystemNumber } from '@/lib/format-utils'
import { useEffect, useState } from 'react'

export function useFormatSettings() {
  const [settings, setSettings] = useState<any>({})
  
  useEffect(() => {
    getSystemFormatSettings().then(setSettings)
  }, [])
  
  return settings
}

export function formatNumber(value: number, settings?: any) {
  return formatSystemNumber(value, settings)
}

export function formatDate(date: Date, settings?: any) {
  return formatSystemDate(date, settings?.date_format)
}
`)

// table component
fs.writeFileSync(`${basePath}/_components/${singular}-table.tsx`, `'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { ${Feature} } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Create${Feature}Dialog } from './create-${singular}-dialog'
import { delete${Feature} } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'

interface ${Feature}TableProps {
  data: ${Feature}[]
  totalItems: number
}

export function ${Feature}Table({ data, totalItems }: ${Feature}TableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const formatSettings = useFormatSettings()

  const getColumns = () => [
${fields.map(f => {
  if (f.type.includes('int') || f.type.includes('numeric')) {
    return `    { 
      accessorKey: '${f.name}', 
      header: '${capitalize(f.name)}', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.${f.name}, formatSettings)
    }`
  } else {
    return `    { accessorKey: '${f.name}', header: '${capitalize(f.name)}', enableSorting: true }`
  }
}).join(',\n')},
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
      cell: ({ row }: any) => {
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm(\`Delete \${row.original.name}?\`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('id', row.original.id)
          const result = await delete${Feature}({ success: false, message: '' }, formData)
          setDeleting(false)
          
          if (result.success) {
            toast.success(result.message)
            window.location.reload()
          } else {
            toast.error(result.message)
          }
        }

        return (
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      }
    }
  ]

  const fetchData = async (params: any) => {
    let filtered = [...data]

    if (params.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(params.search.toLowerCase())
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
${fields.map(f => `            ${f.name}: '${capitalize(f.name)}'`).join(',\n')}
          },
          columnWidths: [
${fields.map(() => `            { wch: 20 }`).join(',\n')}
          ],
          headers: [${fields.map(f => `'${capitalize(f.name)}'`).join(', ')}]
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
      <Create${Feature}Dialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
`)

// create dialog
fs.writeFileSync(`${basePath}/_components/create-${singular}-dialog.tsx`, `'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { create${Feature} } from '../_lib/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface Create${Feature}DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Create${Feature}Dialog({ open, onOpenChange }: Create${Feature}DialogProps) {
  const [state, formAction, isPending] = useActionState(create${Feature}, {
    success: false,
    message: ''
  })

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      window.location.reload()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create ${Feature}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
${fields.map(f => `          <div>
            <Label htmlFor="${f.name}">${capitalize(f.name)}</Label>
            <Input id="${f.name}" name="${f.name}" ${f.required ? 'required' : ''} />
          </div>`).join('\n')}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
`)

// page.tsx
fs.writeFileSync(`${basePath}/page.tsx`, `import { ${Feature}Table } from './_components/${singular}-table'
import { get${Feature}s } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/permissions'

export default async function ${Feature}sPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/dashboard')
  }

  const { data: items } = await get${Feature}s()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">${Feature}s</h1>
      <${Feature}Table data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
`)

console.log(`\n✅ Generated CRUD for ${featurePath}`)
console.log(`📁 Path: ${basePath}`)
console.log(`📋 Fields: ${fields.map(f => f.name).join(', ')}`)
console.log(`\n📝 Next steps:`)
console.log(`1. Add route to sidebar (components/sidebar.tsx)`)
console.log(`2. Add translations (messages/en.json, messages/th.json)`)
}

generate().catch(console.error)
