'use client'

import { DataTable } from '@/components/data-table/data-table'
import { Supplier } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { SupplierFormDialog } from './supplier-form-dialog'
import { deleteSupplier } from '../_lib/actions'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'
import { useRouter } from 'next/navigation'

interface SupplierTableProps {
  data: Supplier[]
  totalItems: number
}

export function SupplierTable({ data, totalItems }: SupplierTableProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const formatSettings = useFormatSettings()

  const getColumns = () => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'code', header: 'Code', enableSorting: true },
    { accessorKey: 'contact_person', header: 'Contact_person', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'phone', header: 'Phone', enableSorting: true },
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
          <Button variant="outline" size="sm" onClick={() => setEditSupplier(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            if (!confirm(`Delete ${row.original.name}?`)) return

            const formData = new FormData()
            formData.append('id', row.original.id)
            const result = await deleteSupplier({ success: false, message: '' }, formData)

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
        item.name.toString().toLowerCase().includes(params.search.toLowerCase())
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
        <Button onClick={() => setCreateOpen(true)}>Create Supplier</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: 'suppliers',
          columnMapping: {
            name: 'Name',
            code: 'Code',
            contact_person: 'Contact_person',
            email: 'Email',
            phone: 'Phone'
          },
          columnWidths: [
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
          ],
          headers: ['Name', 'Code', 'Contact_person', 'Email', 'Phone']
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
      <SupplierFormDialog open={createOpen} onOpenChange={setCreateOpen} supplier={null} />
      <SupplierFormDialog open={!!editSupplier} onOpenChange={(open) => !open && setEditSupplier(null)} supplier={editSupplier} />
    </div>
  )
}
