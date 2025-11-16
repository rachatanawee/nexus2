import { WarehouseTable } from './_components/warehouse-table'
import { getWarehouses } from './_lib/queries'

export default async function WarehousesPage() {
  const { data: items } = await getWarehouses()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Warehouses</h1>
      <WarehouseTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}