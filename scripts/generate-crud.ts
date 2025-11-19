#!/usr/bin/env node

import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

interface Field {
  name: string
  type: string
  required: boolean
  tsType: 'string' | 'number' | 'boolean'
}

const [,, featurePath, tableName] = process.argv

if (!featurePath || !tableName) {
  console.log('Usage: bun scripts/generate-crud.ts <feature-path> <table-name>')
  console.log('Example: bun scripts/generate-crud.ts orders orders')
  process.exit(1)
}

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)
const parts: string[] = featurePath.split('/')
const featureName: string = parts[parts.length - 1]
const singular: string = featureName.replace(/s$/, '')
const Feature: string = capitalize(singular)
const basePath: string = `app/[locale]/(dashboard)/${featurePath}`

async function getTableSchema(tableName: string): Promise<Field[]> {
  const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${serviceKey}`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
    })

    const openapi = await response.json()
    const tableDef = openapi.definitions?.[tableName]

    if (!tableDef || !tableDef.properties) {
      throw new Error(`Table ${tableName} not found`)
    }

    const excludeFields: string[] = ['id', 'created_at', 'updated_at']
    const fields: Field[] = []

    for (const [fieldName, fieldDef] of Object.entries(tableDef.properties)) {
      if (excludeFields.includes(fieldName)) continue

      const fieldDefTyped = fieldDef as { type?: string; format?: string }
      const type: string = fieldDefTyped.type || 'string'
      const format: string = fieldDefTyped.format || ''
      const required: boolean = tableDef.required?.includes(fieldName) || false

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
    const errorTyped = error as Error
    console.error('❌ Error fetching schema:', errorTyped.message)
    throw error
  }
}

async function generate(): Promise<void> {
  console.log('🔍 Fetching schema from Supabase...')
  const fields: Field[] = await getTableSchema(tableName)

  console.log('📋 Fields:', fields.map(f => f.name).join(', '))

  const dirs: string[] = [basePath, `${basePath}/_components`, `${basePath}/_lib`]
  dirs.forEach((dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })

  // types.ts
  const typeFields: string = fields.map(f => `  ${f.name}: ${f.tsType}${f.required ? '' : ' | null'}`).join('\n')
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

  // validation.ts - Shared Zod schemas
  const zodFields: string = fields.map(f => {
    let zodType: string = 'z.string()'
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
      const preprocess: string = f.tsType === 'number'
        ? `z.preprocess((val) => val ? parseFloat(val as string) : undefined, ${zodType})`
        : `z.preprocess((val) => val || '', ${zodType}.min(1, '${capitalize(f.name)} is required'))`
      return `  ${f.name}: ${preprocess},`
    } else {
      return `  ${f.name}: ${zodType}.optional(),`
    }
  }).join('\n')

  fs.writeFileSync(`${basePath}/_lib/validation.ts`, `import { z } from 'zod'

// Shared Zod schemas for ${featureName}
export const ${singular}BaseSchema = z.object({
${zodFields}
})

export const create${Feature}Schema = ${singular}BaseSchema

export const update${Feature}Schema = ${singular}BaseSchema.extend({
  id: z.string().min(1, 'ID is required'),
})

export const delete${Feature}Schema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export type Create${Feature}FormData = z.infer<typeof create${Feature}Schema>
export type Update${Feature}FormData = z.infer<typeof update${Feature}Schema>
`)

  // actions.ts - Use shared validation schemas
  const rawDataFields: string = fields.map(f => {
    if (f.tsType === 'number') {
      return `      ${f.name}: formData.get('${f.name}') ? parseFloat(formData.get('${f.name}') as string) : undefined,`
    } else if (f.tsType === 'boolean') {
      return `      ${f.name}: formData.get('${f.name}') ? formData.get('${f.name}') === 'true' : undefined,`
    } else {
      return `      ${f.name}: formData.get('${f.name}') || undefined,`
    }
  }).join('\n')

  const insertData: string = fields.map(f => `      ${f.name}: data.${f.name}${!f.required ? ' || null' : ''}`).join(',\n')

  fs.writeFileSync(`${basePath}/_lib/actions.ts`, `'use server'

import { createClient } from '@/lib/supabase/server'
import { create${Feature}Schema, update${Feature}Schema, delete${Feature}Schema } from './validation'
import type { ZodIssue } from 'zod'

type FormState = {
  success: boolean
  message: string
}

export async function create${Feature}(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const supabase = await createClient()

    // Convert FormData to object for validation
    const rawData = {
${rawDataFields}
    }

    // Validate data using shared Zod schema
    const validationResult = create${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
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

    // Validate data using shared Zod schema
    const validationResult = update${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
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

    // Validate data using shared Zod schema
    const validationResult = delete${Feature}Schema.safeParse(rawData)
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
      return { success: false, message: errorMessages }
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
  const columnDefs: string = fields.slice(0, 3).map(f => {
    const isFirst = f.name === fields[0].name
    const header = isFirst ? `({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
        ${capitalize(f.name)}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )` : `() => <div className="font-bold">${capitalize(f.name)}</div>`

    const meta = isFirst ? `,
    meta: {
      label: "${capitalize(f.name)}",
      variant: "text",
      placeholder: "Search ${featureName}...",
    }` : ''

    return `  {
    accessorKey: "${f.name}",
    header: ${header}${meta},
  }`
  }).join(',\n')

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
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
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
    header: () => <div className="font-bold">Actions</div>,
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

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

import { DataTable } from "@/components/tablecn/data-table/data-table"
import { DataTableToolbar } from "@/components/tablecn/data-table/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { ${Feature} } from "../_lib/types"
import { ${Feature}FormDialog } from "./${singular}-form-dialog"
import { columns } from "./columns"

interface ${Feature}TableProps {
  data: ${Feature}[]
}

export function ${Feature}Table({ data }: ${Feature}TableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [createOpen, setCreateOpen] = useState(false)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button onClick={() => setCreateOpen(true)}>Create ${Feature}</Button>
        </DataTableToolbar>
      </DataTable>
      <${Feature}FormDialog open={createOpen} onOpenChange={setCreateOpen} ${singular}={null} />
    </div>
  )
}
`)

  // form-dialog.tsx - Use react-hook-form with shared Zod validation
  const formFields: string = fields.map(f => {
    const inputType: string = f.tsType === 'number' ? 'number' : 'text'
    const step: string = f.type.includes('numeric') && !f.type.includes('int') ? ' step="0.01"' : ''
    return `            <div>
              <Label htmlFor="${f.name}">${capitalize(f.name)}${f.required ? ' *' : ''}</Label>
              <Input
                id="${f.name}"
                type="${inputType}"${step}
                {...register('${f.name}')}
                className={errors.${f.name} ? 'border-red-500' : ''}
              />
              {errors.${f.name} && (
                <p className="text-sm text-red-600 mt-1">{errors.${f.name}.message}</p>
              )}
            </div>`
  }).join('\n')

  fs.writeFileSync(`${basePath}/_components/${singular}-form-dialog.tsx`, `'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { create${Feature}, update${Feature} } from '../_lib/actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ${Feature} } from '../_lib/types'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { create${Feature}Schema, update${Feature}Schema, type Create${Feature}FormData, type Update${Feature}FormData } from '../_lib/validation'

interface ${Feature}FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ${singular}?: ${Feature} | null
}

export function ${Feature}FormDialog({ open, onOpenChange, ${singular} }: ${Feature}FormDialogProps) {
  const router = useRouter()
  const isEdit = !!${singular}
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isEdit ? update${Feature}Schema : create${Feature}Schema),
    defaultValues: {
${fields.map(f => {
      if (f.tsType === 'boolean') {
        return `      ${f.name}: ${singular}?.${f.name}${!f.required ? " || undefined" : ''},`
      } else if (f.tsType === 'number') {
        return `      ${f.name}: ${singular}?.${f.name}${!f.required ? " || undefined" : ''},`
      } else {
        return `      ${f.name}: ${singular}?.${f.name}${!f.required ? " || ''" : ''},`
      }
    }).join('\n')}
      ...(isEdit && { id: ${singular}.id })
    }
  })

  const onSubmit = async (data: Record<string, any>) => {
    setLoading(true)
    const formData = new FormData()
${fields.map(f => `    if (data.${f.name} !== undefined) formData.append('${f.name}', data.${f.name}.toString())`).join('\n')}
    if (isEdit && 'id' in data) formData.append('id', data.id)

    const result = await (isEdit ? update${Feature} : create${Feature})({ success: false, message: '' }, formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onOpenChange(false)
      reset()
      router.refresh()
    } else {
      toast.error(result.message)
      setMessage(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit ${Feature}' : 'Create ${Feature}'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
${formFields}
          </div>
          {message && (
            <p className={\`text-sm \${message.includes('success') ? 'text-green-600' : 'text-red-600'}\`}>
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
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
