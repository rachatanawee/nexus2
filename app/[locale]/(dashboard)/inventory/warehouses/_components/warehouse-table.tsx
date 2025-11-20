"use client"

import {
  ColumnFiltersState,
  ColumnSizingState,
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
import { Warehouse } from "../_lib/types"
import { WarehouseFormDialog } from "./warehouse-form-dialog"
import { columns } from "./columns"

interface WarehouseTableProps {
  data: Warehouse[]
}

export function WarehouseTable({ data }: WarehouseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
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
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button onClick={() => setCreateOpen(true)}>Create Warehouse</Button>
        </DataTableToolbar>
      </DataTable>
      <WarehouseFormDialog open={createOpen} onOpenChange={setCreateOpen} warehouse={null} />
    </div>
  )
}
