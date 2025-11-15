import { ProductTable } from './_components/product-table'
import { Product } from './_lib/types'

// Mock data - replace with getProducts() from queries
const data: Product[] = [
  { id: '1', name: 'Laptop', sku: 'LAP-001', quantity: 50, price: 999.99, warehouse_id: 'w1' },
  { id: '2', name: 'Mouse', sku: 'MOU-001', quantity: 200, price: 29.99, warehouse_id: 'w1' },
  { id: '3', name: 'Keyboard', sku: 'KEY-001', quantity: 150, price: 79.99, warehouse_id: 'w2' },
]

export default async function ProductsPage() {
  // const { data } = await getProducts()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductTable data={data} />
    </div>
  )
}
