import { WarehouseTable } from './_components/warehouse-table'
import { Warehouse } from './_lib/types'

// Mock data - replace with getWarehouses() from queries
const data: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', location: 'Bangkok', capacity: 10000 },
  { id: 'w2', name: 'Secondary Warehouse', location: 'Chiang Mai', capacity: 5000 },
]

export default async function WarehousesPage() {
  // const { data } = await getWarehouses()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Warehouses</h1>
      <WarehouseTable data={data} />
    </div>
  )
}
