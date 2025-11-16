'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/data-table'
import { Categorie } from '../_lib/types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateCategorieDialog } from './create-categorie-dialog'
import { deleteCategorie } from '../_lib/actions'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CategorieTableProps {
  data: Categorie[]
  totalItems: number
}

export function CategorieTable({ data, totalItems }: CategorieTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  const getColumns = () => [
    { accessorKey: 'name', header: 'Name', enableSorting: true },
    { accessorKey: 'description', header: 'Description', enableSorting: true },
    { accessorKey: 'icon', header: 'Icon', enableSorting: true },
    {
      accessorKey: 'created_at',
      header: 'Created',
      enableSorting: true,
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString()
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: any) => {
        const [deleting, setDeleting] = useState(false)

        const handleDelete = async () => {
          if (!confirm(`Delete ${row.original.name}?`)) return
          setDeleting(true)
          const formData = new FormData()
          formData.append('id', row.original.id)
          const result = await deleteCategorie({ success: false, message: '' }, formData)
          setDeleting(false)
          
          if (result.success) {
            toast.success(result.message)
            window.location.reload()
          } else {
            toast.error(result.message)
          }
        }

        return (
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      }
    }
  ]

  const fetchData = async (params: any) => {
    let filtered = [...data]

    if (params.search) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(params.search.toLowerCase())
      )
    }

    const start = (params.page - 1) * params.limit
    const paginated = filtered.slice(start, start + params.limit)

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
        <Button onClick={() => setCreateOpen(true)}>Create Categorie</Button>
      </div>
      <DataTable
        getColumns={getColumns}
        fetchDataFn={fetchData}
        exportConfig={{
          entityName: 'categories',
          columnMapping: {
            name: 'Name',
            description: 'Description',
            icon: 'Icon'
          },
          columnWidths: [
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
          ],
          headers: ['Name', 'Description', 'Icon']
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
      <CreateCategorieDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
