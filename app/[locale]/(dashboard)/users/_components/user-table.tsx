'use client'

import { User } from '../_lib/types'
import { DataTable } from '@/components/tablecn/data-table/data-table'
import { DataTableToolbar } from '@/components/tablecn/data-table/data-table-toolbar'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateUserDialog } from './create-user-dialog'
import { pdf } from '@react-pdf/renderer'
import { UserListPDF } from '../../reports/user-list-pdf'
import { FileDown } from 'lucide-react'
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
} from '@tanstack/react-table'

interface UserTableProps {
  data: User[]
}

export function UserTable({ data }: UserTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const blob = await pdf(
        <UserListPDF 
          users={data} 
          generatedBy="Admin User"
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users-${new Date().toISOString().split('T')[0]}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
    }
    setExporting(false)
  }
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [rowSelection, setRowSelection] = useState({})

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
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>Create User</Button>
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={exporting}
            >
              <FileDown className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </DataTableToolbar>
      </DataTable>
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
