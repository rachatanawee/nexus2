export type Supplier = {
  id: string
  name: string
  code: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  payment_terms: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
export type SupplierUpdate = Partial<SupplierInsert>
