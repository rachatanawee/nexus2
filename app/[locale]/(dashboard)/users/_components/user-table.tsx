'use client'

import { User } from '../_lib/types'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateUserDialog } from './create-user-dialog'

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
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="email"
        searchPlaceholder="Search users..."
        enableExport={true}
        exportFilename="users"
      />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
