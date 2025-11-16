'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Product } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'
import { ProductFormDialog } from './product-form-dialog'
import { deleteProduct } from '../_lib/actions'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'

interface ProductTableProps {
  data: Product[]
  totalItems: number
}

export function ProductTable({ data, totalItems }: ProductTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [tableData, setTableData] = useState(data)
  const formatSettings = useFormatSettings()

  const handleDeleteSuccess = useCallback((deletedId: string) => {
    setTableData(prev => prev.filter(product => product.id !== deletedId))
  }, [])

  const refreshTableData = useCallback(async () => {
    console.log('Refreshing table data smoothly')
    try {
      // Make API call to refetch fresh data
      const response = await fetch('/api/inventory/products', {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setTableData(result.data)
          console.log('Table data refreshed successfully')
        }
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('Failed to refresh table data:', error)
      // Fallback to page reload
      window.location.reload()
    }
  }, [])

  const handleCreateSuccess = useCallback(() => {
    console.log('Create success - refreshing table data')
    refreshTableData()
  }, [refreshTableData])

  const handleEditSuccess = useCallback(() => {
    console.log('Edit success - refreshing table data')
    refreshTableData()
  }, [refreshTableData])

  const getColumns = useCallback((): ColumnDef<Product, unknown>[] => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'sku', header: 'SKU', enableSorting: true },
    {
      accessorKey: 'price',
      header: 'Price',
      enableSorting: true,
      cell: ({ row }) => `$${formatNumber(row.original.price || 0, formatSettings)}`
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      enableSorting: true,
      cell: ({ row }) => `$${formatNumber(row.original.cost || 0, formatSettings)}`
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      enableSorting: true,
      cell: ({ row }) => formatNumber(row.original.stock_quantity || 0, formatSettings)
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }) => formatDate(new Date(row.original.created_at), formatSettings)
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProduct(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (!confirm(`Delete ${row.original.name}?`)) return

              const formData = new FormData()
              formData.append('id', row.original.id)
              const result = await deleteProduct({ success: false, message: '' }, formData)

              if (result.success) {
                toast.success(result.message)
                handleDeleteSuccess(row.original.id)
              } else {
                toast.error(result.message)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [formatSettings, handleDeleteSuccess])

  const fetchData = useCallback(async (params: any) => {
    let filtered = [...tableData]

    if (params.search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(params.search.toLowerCase()) ||
        item.sku.toLowerCase().includes(params.search.toLowerCase())
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
  }, [tableData])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Product</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: 'products',
          columnMapping: {
            name: 'Name',
            sku: 'SKU',
            price: 'Price',
            cost: 'Cost',
            stock_quantity: 'Stock Quantity',
            created_at: 'Created'
          },
          columnWidths: [
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 }
          ],
          headers: ['Name', 'SKU', 'Price', 'Cost', 'Stock Quantity', 'Created']
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
      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        product={null}
        onSuccess={handleCreateSuccess}
      />
      <ProductFormDialog
        open={!!editProduct}
        onOpenChange={(open) => {
          if (!open) setEditProduct(null)
        }}
        product={editProduct}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
