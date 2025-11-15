'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { User } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { RoleDialog } from './role-dialog'
import { CreateUserDialog } from './create-user-dialog'
import { deleteUser } from '../_lib/actions'
import { Trash2 } from 'lucide-react'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.roles
      return roles.length > 0 ? roles.join(', ') : 'No roles'
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const [open, setOpen] = useState(false)
      const [deleting, setDeleting] = useState(false)

      const handleDelete = async () => {
        if (!confirm(`Delete user ${row.original.email}?`)) return
        setDeleting(true)
        const formData = new FormData()
        formData.append('userId', row.original.id)
        await deleteUser({ success: false, message: '' }, formData)
        window.location.reload()
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
          <RoleDialog
            open={open}
            onOpenChange={setOpen}
            user={row.original}
          />
        </div>
      )
    }
  }
]

interface UserTableProps {
  data: User[]
}

export function UserTable({ data }: UserTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>
      <DataTable columns={columns} data={data} />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
