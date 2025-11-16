'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Warehouse } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { CreateWarehouseDialog } from './create-warehouse-dialog'
import { deleteWarehouse } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'

interface WarehouseTableProps {
  data: Warehouse[]
  totalItems: number
}

export function WarehouseTable({ data, totalItems }: WarehouseTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const formatSettings = useFormatSettings()

  const getColumns = () => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'code', header: 'Code', enableSorting: true },
    { accessorKey: 'address', header: 'Address', enableSorting: true },
    { accessorKey: 'city', header: 'City', enableSorting: true },
    { accessorKey: 'country', header: 'Country', enableSorting: true },
    { accessorKey: 'manager_name', header: 'Manager_name', enableSorting: true },
    { accessorKey: 'phone', header: 'Phone', enableSorting: true },
    { accessorKey: 'is_active', header: 'Is_active', enableSorting: true },
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
          if (!confirm(`Delete ${row.original.name}?`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('id', row.original.id)
          const result = await deleteWarehouse({ success: false, message: '' }, formData)
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
        <Button onClick={() => setCreateOpen(true)}>Create Warehouse</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: 'warehouses',
          columnMapping: {
            name: 'Name',
            code: 'Code',
            address: 'Address',
            city: 'City',
            country: 'Country',
            manager_name: 'Manager_name',
            phone: 'Phone',
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
            { wch: 20 }
          ],
          headers: ['Name', 'Code', 'Address', 'City', 'Country', 'Manager_name', 'Phone', 'Is_active']
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
      <CreateWarehouseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
