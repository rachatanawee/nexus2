'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { Warehouse } from '../_lib/types'

const columns: ColumnDef<Warehouse>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'capacity', header: 'Capacity' },
]

interface WarehouseTableProps {
  data: Warehouse[]
}

export function WarehouseTable({ data }: WarehouseTableProps) {
  return <DataTable columns={columns} data={data} />
}
