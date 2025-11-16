'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { User } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { RoleDialog } from './role-dialog'
import { CreateUserDialog } from './create-user-dialog'
import { deleteUser } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, useFormatSettings } from '../_lib/format'

interface UserTableProps {
  data: User[]
  totalItems: number
}

export function UserTable({ data, totalItems }: UserTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const formatSettings = useFormatSettings()

  const getColumns = () => [
    { 
      accessorKey: 'email', 
      header: 'Email',
      enableSorting: true
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      enableSorting: false,
      cell: ({ row }: any) => {
        const roles = row.original.roles
        return roles.length > 0 ? roles.join(', ') : 'No roles'
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }: any) => formatDate(new Date(row.original.created_at), formatSettings)
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: any) => {
        const [open, setOpen] = useState(false)
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm(`Delete user ${row.original.email}?`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('userId', row.original.id)
          const result = await deleteUser({ success: false, message: '' }, formData)
          setDeleting(false)
          
          if (result.success) {
            toast.success(result.message)
            window.location.reload()
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

  const fetchData = async (params: {
    page: number
    limit: number
    search: string
    from_date: string
    to_date: string
    sort_by: string
    sort_order: string
  }) => {
    // Client-side filtering and sorting
    let filtered = [...data]

    // Search
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.roles.some(role => role.toLowerCase().includes(searchLower))
      )
    }

    // Sort
    if (params.sort_by === 'email') {
      filtered.sort((a, b) => {
        const compare = a.email.localeCompare(b.email)
        return params.sort_order === 'asc' ? compare : -compare
      })
    }

    // Pagination
    const start = (params.page - 1) * params.limit
    const end = start + params.limit
    const paginated = filtered.slice(start, end)

    return {
      success: true,
      data: paginated,
      pagination: {
        page: params.page,
        limit: params.limit,
        total_pages: Math.ceil(filtered.length / params.limit),
        total_items: filtered.length
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData as any}
        exportConfig={{
          entityName: 'users',
          columnMapping: {
            email: 'Email',
            roles: 'Roles',
            created_at: 'Created'
          },
          columnWidths: [
            { wch: 30 },
            { wch: 20 },
            { wch: 15 }
          ],
          headers: ['Email', 'Roles', 'Created']
        }}
        idField="id"
        config={{
          enableRowSelection: false,
          enableToolbar: true,
          enablePagination: true,
          enableSearch: true,
          enableDateFilter: false,
          enableExport: true,
          enableColumnVisibility: true
        }}
      />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
