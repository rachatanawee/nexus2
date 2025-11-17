"use client"

import { Product } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ProductFormDialog } from "./product-form-dialog"

interface ProductTableProps {
  data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Product</Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search products..."
        enableExport={true}
        exportFilename="products"
      />
      <ProductFormDialog open={createOpen} onOpenChange={setCreateOpen} product={null} />
    </div>
  )
}
