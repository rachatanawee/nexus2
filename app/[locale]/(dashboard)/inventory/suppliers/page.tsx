import { SupplierTable } from './_components/supplier-table'
import { getSuppliers } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/permissions'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/dashboard')
  }

  const { data: items } = await getSuppliers()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Suppliers</h1>
      <SupplierTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
