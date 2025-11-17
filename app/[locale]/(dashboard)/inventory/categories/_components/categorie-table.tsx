"use client"

import { Categorie } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { CategorieFormDialog } from "./categorie-form-dialog"

interface CategoryTableProps {
  data: Categorie[]
}

export function CategorieTable({ data }: CategoryTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Category</Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search categories..."
        enableExport={true}
        exportFilename="categories"
      />
      <CategorieFormDialog open={createOpen} onOpenChange={setCreateOpen} categorie={null} />
    </div>
  )
}
