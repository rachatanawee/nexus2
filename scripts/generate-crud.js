#!/usr/bin/env node

import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const [,, featurePath, tableName] = process.argv

if (!featurePath || !tableName) {
  console.log('Usage: bun scripts/generate-crud-v3.js <feature-path> <table-name>')
  console.log('Example: bun scripts/generate-crud-v3.js orders orders')
  process.exit(1)
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
const parts = featurePath.split('/')
const featureName = parts[parts.length - 1]
const singular = featureName.replace(/s$/, '')
const Feature = capitalize(singular)
const basePath = `app/[locale]/(dashboard)/${featurePath}`

async function getTableSchema(tableName) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
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

  const dirs = [basePath, `${basePath}/_components`, `${basePath}/_lib`]
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })

  // types.ts
  const typeFields = fields.map(f => `  ${f.name}: ${f.tsType}${f.required ? '' : ' | null'}`).join('\n')
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
`)

  // actions.ts - Generate Zod schemas
  const zodFields = fields.map(f => {
    let zodType = 'z.string()'
    if (f.tsType === 'number') {
      zodType = 'z.number()'
      if (f.name.toLowerCase().includes('price') || f.name.toLowerCase().includes('cost')) {
        zodType += '.positive()'
      } else if (f.name.toLowerCase().includes('quantity') || f.name.toLowerCase().includes('stock')) {
        zodType += '.min(0)'
      }
    } else if (f.tsType === 'boolean') {
      zodType = 'z.boolean()'
    }

    if (f.required) {
      const preprocess = f.tsType === 'number'
        ? `z.preprocess((val) => val ? parseFloat(val as string) : undefined, ${zodType})`
        : `z.preprocess((val) => val || '', ${zodType}.min(1, '${capitalize(f.name)} is required'))`
      return `  ${f.name}: ${preprocess},`
    } else {
      return `  ${f.name}: ${zodType}.optional(),`
    }
  }).join('\n')

  const rawDataFields = fields.map(f => {
    if (f.tsType === 'number') {
      return `      ${f.name}: formData.get('${f.name}') ? parseFloat(formData.get('${f.name}') as string) : undefined,`
    } else if (f.tsType === 'boolean') {
      return `      ${f.name}: formData.get('${f.name}') ? formData.get('${f.name}') === 'true' : undefined,`
    } else {
      return `      ${f.name}: formData.get('${f.name}') || undefined,`
    }
  }).join('\n')

  const insertData = fields.map(f => `      ${f.name}: data.${f.name}${!f.required ? ' || null' : ''}`).join(',\n')

  fs.writeFileSync(`${basePath}/_lib/actions.ts`, `'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type FormState = {
  success: boolean
  message: string
}

// Zod schemas for validation
const ${singular}Schema = z.object({
${zodFields}
})

const create${Feature}Schema = ${singular}Schema

const update${Feature}Schema = ${singular}Schema.extend({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

const delete${Feature}Schema = z.object({
  id: z.preprocess((val) => val || '', z.string().min(1, 'ID is required')),
})

export async function create${Feature}(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
${rawDataFields}
    }

    // Validate data
    const validationResult = create${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('${tableName}').insert({
${insertData}
    })

    if (error) return { success: false, message: error.message }
    return { success: true, message: '${Feature} created successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function update${Feature}(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
${rawDataFields}
    }

    // Validate data
    const validationResult = update${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('${tableName}').update({
${insertData}
    }).eq('id', data.id)

    if (error) return { success: false, message: error.message }
    return { success: true, message: '${Feature} updated successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}

export async function delete${Feature}(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
      id: formData.get('id') || undefined,
    }

    // Validate data
    const validationResult = delete${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      return { success: false, message: validationResult.error.issues[0].message }
    }

    const data = validationResult.data

    const { error } = await supabase.from('${tableName}').delete().eq('id', data.id)
    if (error) return { success: false, message: error.message }
    return { success: true, message: '${Feature} deleted successfully' }
  } catch (err) {
    return { success: false, message: 'Unexpected error occurred' }
  }
}
`)

  // columns.tsx
  const columnDefs = fields.slice(0, 3).map(f => `  {
    accessorKey: "${f.name}",
    header: ${f.name === fields[0].name ? `({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        ${capitalize(f.name)}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )` : `"${capitalize(f.name)}"`},
  }`).join(',\n')

  fs.writeFileSync(`${basePath}/_components/columns.tsx`, `"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ${Feature} } from "../_lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2, Pencil } from "lucide-react"
import { delete${Feature} } from "../_lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ${Feature}FormDialog } from "./${singular}-form-dialog"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"

export const columns: ColumnDef<${Feature}>[] = [
${columnDefs},
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: function DateCell({ row }) {
      const { settings } = usePreferences()
      const dateFormat = settings?.date_format || 'MM/dd/yyyy'
      return formatSystemDate(new Date(row.original.created_at), dateFormat)
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function ActionsCell({ row }) {
      const router = useRouter()
      const [editOpen, setEditOpen] = useState(false)
      const [deleting, setDeleting] = useState(false)

      const handleDelete = async () => {
        if (!confirm(\`Delete \${row.original.${fields[0]?.name || 'name'}}?\`)) return
        setDeleting(true)
        const formData = new FormData()
        formData.append("id", row.original.id)
        const result = await delete${Feature}({ success: false, message: "" }, formData)
        setDeleting(false)

        if (result.success) {
          toast.success(result.message)
          router.refresh()
        } else {
          toast.error(result.message)
        }
      }

      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <${Feature}FormDialog open={editOpen} onOpenChange={setEditOpen} ${singular}={row.original} />
        </div>
      )
    },
  },
]
`)

  // table.tsx
  fs.writeFileSync(`${basePath}/_components/${singular}-table.tsx`, `"use client"

import { ${Feature} } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ${Feature}FormDialog } from "./${singular}-form-dialog"

interface ${Feature}TableProps {
  data: ${Feature}[]
}

export function ${Feature}Table({ data }: ${Feature}TableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create ${Feature}</Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="${fields[0]?.name || 'name'}"
        searchPlaceholder="Search ${featureName}..."
        enableExport={true}
        exportFilename="${featureName}"
      />
      <${Feature}FormDialog open={createOpen} onOpenChange={setCreateOpen} ${singular}={null} />
    </div>
  )
}
`)

  // form-dialog.tsx
  const formFields = fields.map(f => {
    const inputType = f.tsType === 'number' ? 'number' : 'text'
    const step = f.type.includes('numeric') && !f.type.includes('int') ? ' step="0.01"' : ''
    const defaultValue = f.tsType === 'boolean' ? `{${singular}?.${f.name} ? 'true' : 'false'}` : `{${singular}?.${f.name}${!f.required ? " || ''" : ''}}`
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
import { useActionState, useEffect, useRef } from 'react'
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
  const isEdit = !!${singular}
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? update${Feature} : create${Feature},
    { success: false, message: '' }
  )

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
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
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={${singular}.id} />}
          <div className="grid grid-cols-2 gap-4">
${formFields}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
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

  // page.tsx
  fs.writeFileSync(`${basePath}/page.tsx`, `import { ${Feature}Table } from './_components/${singular}-table'
import { get${Feature}s } from './_lib/queries'

export default async function ${Feature}sPage() {
  const { data: items } = await get${Feature}s()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">${Feature}s</h1>
      <${Feature}Table data={items || []} />
    </div>
  )
}
`)

  console.log(`✅ Generated CRUD for ${Feature}`)
  console.log(`📁 Files: ${basePath}`)
  console.log(`🔗 Route: /${featurePath}`)
  console.log(`\n📝 Next: Add to sidebar, translations, RLS policies`)
}

generate().catch(console.error)
