"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Categorie } from "../_lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2, Pencil } from "lucide-react"
import { deleteCategorie } from "../_lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CategorieFormDialog } from "./categorie-form-dialog"

export const columns: ColumnDef<Categorie>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "icon",
    header: "Icon",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString()
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: function ActionsCell({ row }) {
      const router = useRouter()
      const [editOpen, setEditOpen] = useState(false)
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

      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
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
          <CategorieFormDialog 
            open={editOpen} 
            onOpenChange={setEditOpen} 
            categorie={row.original} 
          />
        </div>
      )
    },
  },
]
