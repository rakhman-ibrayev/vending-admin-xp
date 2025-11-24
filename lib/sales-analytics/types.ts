export type SaleItem = {
  day: string | null
  amount: number | null
  num_sales: number | null
  products: { category: string | null; name: string | null } | null
  vending_machines: { name: string | null } | null
  machine_id: number | null
  product_id: number | null
}
