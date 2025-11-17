import { CategorieTable } from './_components/categorie-table'
import { getCategories } from './_lib/queries'

export default async function CategoriesPage() {
  const { data: items } = await getCategories()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Categories</h1>
      <CategorieTable data={items || []} />
    </div>
  )
}
