'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { useTranslations } from 'next-intl'

type User = {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]

const data: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]

export default function UsersPage() {
  const t = useTranslations('dashboard')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('users')}</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
