"use client"

import { Supplier } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { SupplierFormDialog } from "./supplier-form-dialog"

interface SupplierTableProps {
  data: Supplier[]
}

export function SupplierTable({ data }: SupplierTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Supplier</Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search suppliers..."
        enableExport={true}
        exportFilename="suppliers"
      />
      <SupplierFormDialog open={createOpen} onOpenChange={setCreateOpen} supplier={null} />
    </div>
  )
}
