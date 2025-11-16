'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Supplier } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateSupplierDialog } from './create-supplier-dialog'
import { deleteSupplier } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SupplierTableProps {
  data: Supplier[]
  totalItems: number
}

export function SupplierTable({ data, totalItems }: SupplierTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const getColumns = () => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'code', header: 'Code', enableSorting: true },
    { accessorKey: 'contact_person', header: 'Contact_person', enableSorting: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    { accessorKey: 'phone', header: 'Phone', enableSorting: true },
    { accessorKey: 'address', header: 'Address', enableSorting: true },
    { accessorKey: 'city', header: 'City', enableSorting: true },
    { accessorKey: 'country', header: 'Country', enableSorting: true },
    { accessorKey: 'payment_terms', header: 'Payment_terms', enableSorting: true },
    { accessorKey: 'is_active', header: 'Is_active', enableSorting: true },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: any) => {
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm(`Delete ${row.original.name}?`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('id', row.original.id)
          const result = await deleteSupplier({ success: false, message: '' }, formData)
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
            phone: 'Phone',
            address: 'Address',
            city: 'City',
            country: 'Country',
            payment_terms: 'Payment_terms',
            is_active: 'Is_active'
          },
          columnWidths: [
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
          ],
          headers: ['Name', 'Code', 'Contact_person', 'Email', 'Phone', 'Address', 'City', 'Country', 'Payment_terms', 'Is_active']
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
      <CreateSupplierDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
