export type Categorie = {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type CategorieInsert = Omit<Categorie, 'id' | 'created_at' | 'updated_at'>
export type CategorieUpdate = Partial<CategorieInsert>
