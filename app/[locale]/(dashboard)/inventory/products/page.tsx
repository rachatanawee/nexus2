import { ProductTable } from './_components/product-table'
import { getProducts } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/permissions'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/dashboard')
  }

  const { data: items } = await getProducts()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
