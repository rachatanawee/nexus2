import { SupplierTable } from './_components/supplier-table'
import { getSuppliers } from './_lib/queries'

export default async function SuppliersPage() {
  const { data: items } = await getSuppliers()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <SupplierTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}