'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Warehouse } from '../_lib/types'

interface WarehouseTableProps {
  data: Warehouse[]
}

export function WarehouseTable({ data }: WarehouseTableProps) {
  const getColumns = (): ColumnDef<Warehouse>[] => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'location', header: 'Location', enableSorting: true },
    { accessorKey: 'capacity', header: 'Capacity', enableSorting: true },
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
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchLower) ||
        w.location.toLowerCase().includes(searchLower)
      )
    }

    if (params.sort_by) {
      filtered.sort((a, b) => {
        const aVal = a[params.sort_by as keyof Warehouse]
        const bVal = b[params.sort_by as keyof Warehouse]
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
        entityName: 'warehouses',
        columnMapping: { name: 'Name', location: 'Location', capacity: 'Capacity' },
        columnWidths: [{ wch: 25 }, { wch: 30 }, { wch: 15 }],
        headers: ['Name', 'Location', 'Capacity']
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
