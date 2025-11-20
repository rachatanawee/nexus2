"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Categorie } from "../_lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2, Pencil, Copy } from "lucide-react"
import { deleteCategorie } from "../_lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CategorieFormDialog } from "./categorie-form-dialog"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"

export const columns: ColumnDef<Categorie>[] = [
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
      placeholder: "Search categories...",
    },
  },
  {
    accessorKey: "description",
    header: () => <div className="font-bold">Description</div>,
  },
  {
    accessorKey: "icon",
    header: () => <div className="font-bold">Icon</div>,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="font-bold">
        Created
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: function DateCell({ row }) {
      const { settings } = usePreferences()
      const dateFormat = settings?.date_format || 'dd-MM-yyyy'
      return formatSystemDate(new Date(row.original.created_at), dateFormat)
    },
  },
  {
    id: "actions",
    header: () => <div className="font-bold text-center">Actions</div>,
    size: 100,
    enableResizing: false,
    cell: function ActionsCell({ row }) {
      const router = useRouter()
      const [editOpen, setEditOpen] = useState(false)
      const [duplicateOpen, setDuplicateOpen] = useState(false)
      const [deleting, setDeleting] = useState(false)

      const handleDelete = async () => {
        if (!confirm(`Delete ${row.original.name}?`)) return
        setDeleting(true)
        const formData = new FormData()
        formData.append("id", row.original.id)
        const result = await deleteCategorie({ success: false, message: "" }, formData)
        setDeleting(false)

        if (result.success) {
          toast.success(result.message)
          router.refresh()
        } else {
          toast.error(result.message)
        }
      }

      const duplicateData = {
        ...row.original,
        name: `${row.original.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      }

      return (
        <div className="flex gap-0.5 justify-center">
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-blue-50" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3 w-3 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-50" onClick={() => setDuplicateOpen(true)}>
            <Copy className="h-3 w-3 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
          <CategorieFormDialog open={editOpen} onOpenChange={setEditOpen} categorie={row.original} />
          <CategorieFormDialog open={duplicateOpen} onOpenChange={setDuplicateOpen} categorie={duplicateData as Categorie} />
        </div>
      )
    },
  },
]
