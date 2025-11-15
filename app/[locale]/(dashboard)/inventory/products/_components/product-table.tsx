'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Product } from '../_lib/types'

interface ProductTableProps {
  data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
  const getColumns = (): ColumnDef<Product>[] => [
    { accessorKey: 'sku', header: 'SKU', enableSorting: true },
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'quantity', header: 'Quantity', enableSorting: true },
    { accessorKey: 'price', header: 'Price', enableSorting: true },
  ]

  const fetchData = async (params: {
    page: number
    limit: number
    search: string
    from_date: string
    to_date: string
    sort_by: string
    sort_order: string
  }) => {
    let filtered = [...data]

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.sku.toLowerCase().includes(searchLower) ||
        p.name.toLowerCase().includes(searchLower)
      )
    }

    if (params.sort_by) {
      filtered.sort((a, b) => {
        const aVal = a[params.sort_by as keyof Product]
        const bVal = b[params.sort_by as keyof Product]
        const compare = aVal > bVal ? 1 : -1
        return params.sort_order === 'asc' ? compare : -compare
      })
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
    <DataTable
      getColumns={getColumns}
      fetchDataFn={fetchData}
      exportConfig={{
        entityName: 'products',
        columnMapping: { sku: 'SKU', name: 'Name', quantity: 'Quantity', price: 'Price' },
        columnWidths: [{ wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }],
        headers: ['SKU', 'Name', 'Quantity', 'Price']
      }}
      idField="id"
      config={{
        enableRowSelection: false,
        enableToolbar: true,
        enablePagination: true,
        enableSearch: true,
        enableDateFilter: false,
        enableExport: true
      }}
    />
  )
}
