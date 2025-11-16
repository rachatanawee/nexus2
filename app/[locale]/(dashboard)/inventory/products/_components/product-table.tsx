'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Product } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { CreateProductDialog } from './create-product-dialog'
import { deleteProduct } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatNumber, formatDate, useFormatSettings } from '../_lib/format'

interface ProductTableProps {
  data: Product[]
  totalItems: number
}

export function ProductTable({ data, totalItems }: ProductTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const formatSettings = useFormatSettings()

  console.log('Format Settings:', formatSettings) // Debug

  const getColumns = () => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'sku', header: 'Sku', enableSorting: true },
    { accessorKey: 'description', header: 'Description', enableSorting: true },
    { accessorKey: 'category_id', header: 'Category_id', enableSorting: true },
    { 
      accessorKey: 'price', 
      header: 'Price', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.price, formatSettings)
    },
    { 
      accessorKey: 'cost', 
      header: 'Cost', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.cost, formatSettings)
    },
    { 
      accessorKey: 'stock_quantity', 
      header: 'Stock_quantity', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.stock_quantity, formatSettings)
    },
    { 
      accessorKey: 'min_stock_level', 
      header: 'Min_stock_level', 
      enableSorting: true,
      cell: ({ row }: any) => formatNumber(row.original.min_stock_level, formatSettings)
    },
    { accessorKey: 'image_url', header: 'Image_url', enableSorting: true },
    { accessorKey: 'is_active', header: 'Is_active', enableSorting: true },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }: any) => {
        console.log('Date format:', formatSettings?.date_format) // Debug
        return formatDate(new Date(row.original.created_at), formatSettings)
      }
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
          const result = await deleteProduct({ success: false, message: '' }, formData)
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
        <Button onClick={() => setCreateOpen(true)}>Create Product</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: 'products',
          columnMapping: {
            name: 'Name',
            sku: 'Sku',
            description: 'Description',
            category_id: 'Category_id',
            price: 'Price',
            cost: 'Cost',
            stock_quantity: 'Stock_quantity',
            min_stock_level: 'Min_stock_level',
            image_url: 'Image_url',
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
          headers: ['Name', 'Sku', 'Description', 'Category_id', 'Price', 'Cost', 'Stock_quantity', 'Min_stock_level', 'Image_url', 'Is_active']
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
      <CreateProductDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}