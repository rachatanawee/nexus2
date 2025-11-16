import type { ExportableData } from '@/components/data-table/utils/export-utils'

export type Product = ExportableData & {
  id: string
  name: string
  sku: string
  description: string | null
  category_id: string | null
  price: number
  cost: number
  stock_quantity: number
  min_stock_level: number | null
  image_url: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>
