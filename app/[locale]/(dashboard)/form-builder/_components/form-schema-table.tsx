"use client"

import { FormSchema } from "../_lib/types"
import { DataTable } from "@/components/tablecn/data-table/data-table"
import { DataTableToolbar } from "@/components/tablecn/data-table/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FormSchemaDialog } from "./form-schema-dialog"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, Eye, Pencil, Copy } from "lucide-react"
import { deleteFormSchema } from "../_lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"
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

interface FormSchemaTableProps {
  data: FormSchema[]
}

export function FormSchemaTable({ data }: FormSchemaTableProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editSchema, setEditSchema] = useState<FormSchema | null>(null)
  const [duplicateSchema, setDuplicateSchema] = useState<FormSchema | null>(null)
  const { settings } = usePreferences()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<FormSchema>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      meta: {
        label: "Name",
        variant: "text",
        placeholder: "Search form schemas...",
      },
    },
    {
      accessorKey: "table_name",
      header: () => <div className="font-bold">Table</div>,
    },
    {
      accessorKey: "description",
      header: () => <div className="font-bold">Description</div>,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
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
      header: () => <div className="font-bold text-center">Actions</div>,
      size: 130,
      enableResizing: false,
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

        const duplicateData: Partial<FormSchema> = {
          ...row.original,
          name: `${row.original.name} (Copy)`,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
          created_by: undefined,
        }

        return (
          <div className="flex gap-0.5 justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-purple-50" 
              onClick={() => router.push(`/form-builder/${row.original.id}`)}
              title="View Data"
            >
              <Eye className="h-3 w-3 text-purple-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-blue-50" 
              onClick={() => setEditSchema(row.original)}
              title="Edit Schema"
            >
              <Pencil className="h-3 w-3 text-blue-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-green-50" 
              onClick={() => setDuplicateSchema(duplicateData as FormSchema)}
              title="Duplicate Schema"
            >
              <Copy className="h-3 w-3 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-red-50" 
              onClick={handleDelete} 
              disabled={deleting}
              title="Delete Schema"
            >
              <Trash2 className="h-3 w-3 text-red-600" />
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
          <Button onClick={() => setCreateOpen(true)}>Create Form Schema</Button>
        </DataTableToolbar>
      </DataTable>
      <FormSchemaDialog open={createOpen} onOpenChange={setCreateOpen} />
      <FormSchemaDialog 
        open={!!editSchema} 
        onOpenChange={(open) => !open && setEditSchema(null)} 
        schema={editSchema} 
      />
      <FormSchemaDialog 
        open={!!duplicateSchema} 
        onOpenChange={(open) => !open && setDuplicateSchema(null)} 
        schema={duplicateSchema} 
      />
    </div>
  )
}