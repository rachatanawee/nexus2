"use client"

import { FormSubmission } from "../../_lib/types"
import { DataTable } from "@/components/tablecn/data-table/data-table"
import { DataTableToolbar } from "@/components/tablecn/data-table/data-table-toolbar"
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
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Trash2, Pencil, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"
import { deleteFormData, updateFormData } from "../../_lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FormDataDialog } from "./form-data-dialog"
import { FormSchema } from "../../_lib/types"

interface FormDataTableProps {
  data: FormSubmission[]
  schema: FormSchema
}

export function FormDataTable({ data, schema }: FormDataTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [viewData, setViewData] = useState<FormSubmission | null>(null)
  const [editData, setEditData] = useState<FormSubmission | null>(null)
  const [duplicateData, setDuplicateData] = useState<FormSubmission | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { settings } = usePreferences()
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  // Get first 3 fields for columns
  const displayFields = schema.schema.fields.slice(0, 3)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    setDeletingId(id)
    const formData = new FormData()
    formData.append('id', id)
    const result = await deleteFormData({ success: false, message: '' }, formData)
    setDeletingId(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const columns: ColumnDef<FormSubmission>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.id.slice(0, 8),
      meta: {
        variant: "text",
        label: "ID",
        placeholder: "Filter by ID...",
      },
    },
    ...displayFields.map(field => ({
      accessorKey: `data.${field.name}`,
      header: () => <div className="font-bold">{field.label}</div>,
      cell: ({ row }: { row: { original: FormSubmission } }) => {
        const value = row.original.data[field.name]
        if (value === null || value === undefined) return '-'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      },
      filterFn: (row, id, value) => {
        const fieldValue = row.original.data[field.name]
        if (!fieldValue) return false
        return String(fieldValue).toLowerCase().includes(value.toLowerCase())
      },
      meta: {
        variant: "text",
        label: field.label,
        placeholder: `Filter ${field.label.toLowerCase()}...`,
      },
    })),
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
          Submitted
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
        const duplicate = {
          ...row.original,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }

        return (
          <div className="flex gap-0.5 justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-purple-50" 
              onClick={() => setViewData(row.original)}
              title="View Data"
            >
              <Eye className="h-3 w-3 text-purple-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-blue-50" 
              onClick={() => setEditData(row.original)}
              title="Edit Data"
            >
              <Pencil className="h-3 w-3 text-blue-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-green-50" 
              onClick={() => setDuplicateData(duplicate as FormSubmission)}
              title="Duplicate Data"
            >
              <Copy className="h-3 w-3 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-red-50" 
              onClick={() => handleDelete(row.original.id)}
              disabled={deletingId === row.original.id}
              title="Delete Data"
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
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button onClick={() => setCreateOpen(true)}>Add Data</Button>
        </DataTableToolbar>
      </DataTable>
      
      {viewData && (
        <Dialog open={!!viewData} onOpenChange={() => setViewData(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Form Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {viewData.id}
                </div>
                <div>
                  <strong>Submitted:</strong> {formatSystemDate(new Date(viewData.created_at), settings?.date_format || 'dd-MM-yyyy')}
                </div>
              </div>
              <div>
                <strong>Data:</strong>
                <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto">
                  {JSON.stringify(viewData.data, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <FormDataDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        schema={schema} 
      />
      
      <FormDataDialog 
        open={!!editData} 
        onOpenChange={(open) => !open && setEditData(null)} 
        schema={schema}
        submission={editData}
      />
      
      <FormDataDialog 
        open={!!duplicateData} 
        onOpenChange={(open) => !open && setDuplicateData(null)} 
        schema={schema}
        submission={duplicateData}
      />
    </>
  )
}