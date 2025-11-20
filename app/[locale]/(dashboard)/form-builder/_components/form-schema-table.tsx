"use client"

import { FormSchema } from "../_lib/types"
import { DataTable } from "@/components/tablecn/data-table/data-table"
import { DataTableToolbar } from "@/components/tablecn/data-table/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FormSchemaDialog } from "./form-schema-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, Eye, Pencil } from "lucide-react"
import { deleteFormSchema } from "../_lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

interface FormSchemaTableProps {
  data: FormSchema[]
}

export function FormSchemaTable({ data }: FormSchemaTableProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSchema, setEditSchema] = useState<FormSchema | null>(null)
  const { settings } = usePreferences()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<FormSchema>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "table_name",
      header: "Table",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateFormat = settings?.date_format || 'dd-MM-yyyy'
        return formatSystemDate(new Date(row.original.created_at), dateFormat)
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm(`Delete ${row.original.name}?`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append("id", row.original.id)
          const result = await deleteFormSchema({ success: false, message: "" }, formData)
          setDeleting(false)

          if (result.success) {
            toast.success(result.message)
            router.refresh()
          } else {
            toast.error(result.message)
          }
        }

        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/form-builder/${row.original.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditSchema(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button onClick={() => setCreateOpen(true)}>Create Form Schema</Button>
        </DataTableToolbar>
      </DataTable>
      <FormSchemaDialog open={createOpen} onOpenChange={setCreateOpen} />
      <FormSchemaDialog 
        open={!!editSchema} 
        onOpenChange={(open) => !open && setEditSchema(null)} 
        schema={editSchema} 
      />
    </div>
  )
}