"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "../_lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"
import { RoleDialog } from "./role-dialog"
import { deleteUser } from "../_lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles
      return roles.length > 0 ? roles.join(", ") : "No roles"
    },
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
      const [open, setOpen] = useState(false)
      const [deleting, setDeleting] = useState(false)

      const handleDelete = async () => {
        if (!confirm(`Delete user ${row.original.email}?`)) return
        setDeleting(true)
        const formData = new FormData()
        formData.append("userId", row.original.id)
        const result = await deleteUser({ success: false, message: "" }, formData)
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
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Manage Roles
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <RoleDialog open={open} onOpenChange={setOpen} user={row.original} />
        </div>
      )
    },
  },
]
