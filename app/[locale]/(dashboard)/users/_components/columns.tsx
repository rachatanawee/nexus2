"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "../_lib/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Trash2, Users, Copy } from "lucide-react"
import { RoleDialog } from "./role-dialog"
import { CreateUserDialog } from "./create-user-dialog"
import { deleteUser } from "../_lib/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePreferences } from "@/lib/preferences-context"
import { formatSystemDate } from "@/lib/format-utils"

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
    meta: {
      variant: "text",
      label: "Email",
      placeholder: "Filter emails...",
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles
      return roles.length > 0 ? roles.join(", ") : "No roles"
    },
    filterFn: (row, id, value) => {
      return row.original.roles.some(role => role.toLowerCase().includes(value.toLowerCase()))
    },
    meta: {
      variant: "multiSelect",
      label: "Roles",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "User", value: "user" },
      ],
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
    cell: function DateCell({ row }) {
      const { settings } = usePreferences()
      const dateFormat = settings?.date_format || 'dd-MM-yyyy'
      return formatSystemDate(new Date(row.original.created_at), dateFormat)
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    size: 110,
    enableResizing: false,
    cell: function ActionsCell({ row }) {
      const router = useRouter()
      const [open, setOpen] = useState(false)
      const [duplicateOpen, setDuplicateOpen] = useState(false)
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

      const duplicateData: Partial<{ email: string; password: string; roles: ('user' | 'admin' | 'manager')[] }> = {
        email: `${row.original.email.split('@')[0]}_copy@${row.original.email.split('@')[1]}`,
        roles: row.original.roles as ('user' | 'admin' | 'manager')[],
      }

      return (
        <div className="flex gap-0.5 justify-center">
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-blue-50" onClick={() => setOpen(true)} title="Manage Roles">
            <Users className="h-3 w-3 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-50" onClick={() => setDuplicateOpen(true)} title="Duplicate User">
            <Copy className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete User"
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
          <RoleDialog open={open} onOpenChange={setOpen} user={row.original} />
          <CreateUserDialog open={duplicateOpen} onOpenChange={setDuplicateOpen} defaultValues={duplicateData} />
        </div>
      )
    },
  },
]
