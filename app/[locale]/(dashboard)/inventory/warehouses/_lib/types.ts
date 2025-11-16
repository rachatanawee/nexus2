export type Warehouse = {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  country: string | null
  manager_name: string | null
  phone: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export type WarehouseInsert = Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>
export type WarehouseUpdate = Partial<WarehouseInsert>
