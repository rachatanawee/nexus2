"use client"

import { FormSubmission } from "../../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Trash2, Pencil } from "lucide-react"
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
  const { settings } = usePreferences()
  const router = useRouter()
  
  // Get first 3 fields for columns
  const displayFields = schema.schema.fields.slice(0, 3)

  const columns: ColumnDef<FormSubmission>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id.slice(0, 8),
    },
    ...displayFields.map(field => ({
      accessorKey: `data.${field.name}`,
      header: field.label,
      cell: ({ row }: { row: { original: FormSubmission } }) => {
        const value = row.original.data[field.name]
        if (value === null || value === undefined) return '-'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
      },
    })),
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateFormat = settings?.date_format || 'MM/dd/yyyy'
        return formatSystemDate(new Date(row.original.created_at), dateFormat)
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm('Delete this submission?')) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('id', row.original.id)
          const result = await deleteFormData({ success: false, message: '' }, formData)
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
              onClick={() => setViewData(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditData(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>Add Data</Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="id"
        searchPlaceholder="Search submissions..."
        enableExport={true}
        exportFilename="form-submissions"
      />
      
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
                  <strong>Submitted:</strong> {formatSystemDate(new Date(viewData.created_at), settings?.date_format || 'MM/dd/yyyy')}
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
    </>
  )
}