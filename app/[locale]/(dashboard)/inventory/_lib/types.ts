export type Product = {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  warehouse_id: string
}

export type Warehouse = {
  id: string
  name: string
  location: string
  capacity: number
}
