import { ProductTable } from './_components/product-table'
import { getProducts } from './_lib/queries'

export default async function ProductsPage() {
  const { data: items } = await getProducts()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Products</h1>
      <ProductTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
