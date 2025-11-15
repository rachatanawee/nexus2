'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { Product } from '../_lib/types'

const columns: ColumnDef<Product>[] = [
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'quantity', header: 'Quantity' },
  { accessorKey: 'price', header: 'Price' },
]

interface ProductTableProps {
  data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
  return <DataTable columns={columns} data={data} />
}
