"use client"

import { Product } from "../_lib/types"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ProductFormDialog } from "./product-form-dialog"
import { FileText } from "lucide-react"
import { generatePDF } from "@/lib/pdf"
import { ProductListPDF } from "../../reports/product-list-pdf"
import { useSettings } from "@/lib/settings-context"

interface ProductTableProps {
  data: Product[]
}

export function ProductTable({ data }: ProductTableProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const settings = useSettings()

  const handlePrintPDF = async () => {
    await generatePDF(
      <ProductListPDF products={data} generatedBy={settings.user_email} />,
      `products-${new Date().toISOString().split('T')[0]}.pdf`
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handlePrintPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Print PDF
        </Button>
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
