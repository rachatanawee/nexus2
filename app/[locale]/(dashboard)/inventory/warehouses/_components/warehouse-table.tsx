"use client"

import { Warehouse } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { WarehouseFormDialog } from "./warehouse-form-dialog"

interface WarehouseTableProps {
  data: Warehouse[]
}

export function WarehouseTable({ data }: WarehouseTableProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Warehouse</Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search warehouses..."
        enableExport={true}
        exportFilename="warehouses"
      />
      <WarehouseFormDialog open={createOpen} onOpenChange={setCreateOpen} warehouse={null} />
    </div>
  )
}
