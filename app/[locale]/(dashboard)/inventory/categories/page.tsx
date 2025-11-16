import { CategorieTable } from './_components/categorie-table'
import { getCategories } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/permissions'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user)) {
    redirect('/dashboard')
  }

  const { data: items } = await getCategories()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <CategorieTable data={items || []} totalItems={items?.length || 0} />
    </div>
  )
}
